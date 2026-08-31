<?php

namespace App\Services;

use App\Jobs\NotifyFormSubmission;
use App\Models\Form;
use App\Models\FormField;
use App\Models\FormSubmission;
use App\Models\FunnelLead;
use App\Models\FunnelStep;
use App\Models\Page;
use App\Models\Site;
use App\Models\User;
use App\Support\CurrentWorkspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class FormService
{
    public const TYPES = ['contact', 'lead', 'newsletter', 'quote'];

    public const FIELD_TYPES = ['text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio'];

    public const STATUSES = ['new', 'read', 'spam', 'archived'];

    public function __construct(
        private readonly CurrentWorkspace $currentWorkspace,
        private readonly PlanLimitService $limits,
        private readonly HtmlSanitizer $sanitizer,
        private readonly TurnstileService $turnstile,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(Site $site, array $data): Form
    {
        $type = $this->normalizeType($data['type'] ?? 'contact');
        $form = Form::query()->create([
            'workspace_id' => $site->workspace_id,
            'site_id' => $site->id,
            'name' => $data['name'],
            'slug' => $data['slug'] ?? Str::slug($data['name']),
            'type' => $type,
            'settings' => $this->normalizeSettings($site, $data['settings'] ?? []),
        ]);

        $fields = $data['fields'] ?? [];
        $this->syncFields($form, $fields !== [] ? $fields : $this->defaultFields($type));

        return $form->fresh('fields');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Form $form, array $data): Form
    {
        $payload = collect($data)->only(['name', 'slug', 'type', 'settings'])->all();
        if (isset($payload['type'])) {
            $payload['type'] = $this->normalizeType($payload['type']);
        }
        if (array_key_exists('settings', $payload)) {
            $payload['settings'] = $this->normalizeSettings($form->site, is_array($payload['settings']) ? $payload['settings'] : []);
        }
        if ($payload !== []) {
            $form->update($payload);
        }
        if (isset($data['fields']) && is_array($data['fields'])) {
            $form->fields()->delete();
            $this->syncFields($form, $data['fields']);
        }

        return $form->fresh('fields');
    }

    public function ensureDefaults(Site $site): void
    {
        if ($site->forms()->exists()) {
            return;
        }

        foreach ($this->starterForms() as $starter) {
            $this->create($site, $starter);
        }
    }

    /**
     * Add the service-request fields used by the Cinder & Row contact block.
     * Existing contact-form settings and recipient choices are preserved.
     */
    public function ensureCinderContactFields(Site $site): void
    {
        $this->ensureDefaults($site);
        $form = $site->forms()->where('type', 'contact')->with('fields')->first();
        if (! $form) {
            return;
        }

        $existing = $form->fields->pluck('name')->all();
        $nextOrder = ((int) $form->fields->max('sort_order')) + 1;
        $extra = [
            ['name' => 'postcode', 'label' => 'Postcode', 'type' => 'text', 'required' => false],
            ['name' => 'service', 'label' => 'What do you need?', 'type' => 'radio', 'required' => false, 'options' => ['Boiler repair', 'Annual service', 'Safety check', 'New installation', 'Something else']],
        ];

        foreach ($extra as $field) {
            if (in_array($field['name'], $existing, true)) {
                continue;
            }
            $field['sort_order'] = $nextOrder++;
            $this->syncFields($form, [$field]);
        }
    }

    /** Add the local-service fields used by the Lumen & Lane contact and booking blocks. */
    public function ensureLumenLaneFields(Site $site): void
    {
        $this->ensureDefaults($site);
        $definitions = [
            'contact' => [
                ['name' => 'postcode', 'label' => 'Postcode', 'type' => 'text', 'required' => false],
            ],
            'quote' => [
                ['name' => 'phone', 'label' => 'Phone', 'type' => 'phone', 'required' => false],
                ['name' => 'postcode', 'label' => 'Postcode', 'type' => 'text', 'required' => true],
            ],
        ];

        foreach ($definitions as $type => $extra) {
            $form = $site->forms()->where('type', $type)->with('fields')->first();
            if (! $form) {
                continue;
            }
            $existing = $form->fields->pluck('name')->all();
            $nextOrder = ((int) $form->fields->max('sort_order')) + 1;
            foreach ($extra as $field) {
                if (in_array($field['name'], $existing, true)) {
                    continue;
                }
                $field['sort_order'] = $nextOrder++;
                $this->syncFields($form, [$field]);
            }
        }
    }

    public function copyToSite(Site $source, Site $target): void
    {
        foreach ($source->forms()->with('fields')->get() as $form) {
            $copy = $form->replicate(['slug']);
            $copy->site_id = $target->id;
            $copy->workspace_id = $target->workspace_id;
            $copy->slug = $form->slug;
            $copy->save();
            foreach ($form->fields as $field) {
                $replica = $field->replicate();
                $replica->form_id = $copy->id;
                $replica->save();
            }
        }
    }

    /**
     * Point `form.*` blocks at this site's forms so published pages can submit.
     *
     * Empty IDs and IDs that belong to another site are replaced with the
     * matching type (contact, lead, newsletter, quote).
     *
     * @param  array<string, mixed>  $content
     * @return array<string, mixed>
     */
    public function bindContent(Site $site, array $content): array
    {
        $site->loadMissing('forms');
        if ($site->forms->isEmpty()) {
            return $content;
        }

        $allowed = $site->forms->pluck('id')->map(fn ($id) => (string) $id)->all();
        $byType = $site->forms->keyBy('type');
        $sections = $content['sections'] ?? [];
        if (! is_array($sections)) {
            return $content;
        }

        foreach ($sections as $index => $section) {
            if (! is_array($section) || ! is_string($section['type'] ?? null) || ! str_starts_with($section['type'], 'form.')) {
                continue;
            }
            $kind = substr($section['type'], 5);
            // Editorial template variants still submit to a normal platform form.
            if ($kind === 'cinder' || $kind === 'lumen_contact') {
                $kind = 'contact';
            } elseif ($kind === 'lumen_booking') {
                $kind = 'quote';
            }
            $props = is_array($section['props'] ?? null) ? $section['props'] : [];
            $current = trim((string) ($props['formId'] ?? ''));
            if ($current !== '' && in_array($current, $allowed, true)) {
                continue;
            }
            $match = $byType->get($kind) ?? $site->forms->first();
            if (! $match) {
                continue;
            }
            $props['formId'] = (string) $match->id;
            $sections[$index]['props'] = $props;
        }

        $content['sections'] = $sections;

        return $content;
    }

    public function bindSitePages(Site $site): void
    {
        $site->loadMissing(['forms', 'pages.draftRevision']);
        foreach ($site->pages as $page) {
            $draft = $page->draftRevision;
            if (! $draft || ! is_array($draft->content_json)) {
                continue;
            }
            $bound = $this->bindContent($site, $draft->content_json);
            if ($bound !== $draft->content_json) {
                $draft->update(['content_json' => $bound]);
            }
        }
    }

    public function submit(Form $form, Request $request): FormSubmission
    {
        $form->loadMissing(['fields', 'site', 'workspace']);

        if (($form->site?->status) === 'disabled') {
            throw new HttpException(404, 'Not found.');
        }

        $honeypot = $request->input('website') ?? $request->input('honeypot');
        if (filled($honeypot)) {
            throw new HttpException(422, 'Spam detected.');
        }

        $settings = $form->settings ?? [];
        if (! empty($settings['turnstile_enabled']) && $this->turnstile->configured()) {
            $token = (string) ($request->input('cf-turnstile-response') ?? $request->input('turnstile_token') ?? '');
            if (! $this->turnstile->verify($token, $request->ip())) {
                throw ValidationException::withMessages([
                    'cf-turnstile-response' => ['Turnstile verification failed.'],
                ]);
            }
        }

        $this->limits->assertOrFail($form->workspace, 'form_submissions');

        $payload = [];
        foreach ($form->fields as $field) {
            $value = $this->normalizeSubmittedValue($field, $request->input($field->name));
            if ($field->required && $this->isBlank($value)) {
                throw ValidationException::withMessages([
                    $field->name => ["Field [{$field->name}] is required."],
                ]);
            }
            $payload[$field->name] = is_string($value) ? $this->sanitizer->sanitize($value) : $value;
        }

        $pageId = $request->integer('page_id') ?: null;
        if ($pageId && ! Page::query()->where('site_id', $form->site_id)->where('id', $pageId)->exists()) {
            $pageId = null;
        }

        $name = $this->firstFilled($payload, ['name', 'full_name', 'first_name']);
        $email = $this->firstFilled($payload, ['email', 'work_email']);

        $submission = FormSubmission::query()->create([
            'form_id' => $form->id,
            'workspace_id' => $form->workspace_id,
            'page_id' => $pageId,
            'status' => 'new',
            'name' => is_string($name) ? Str::limit($name, 120, '') : null,
            'email' => is_string($email) ? Str::limit($email, 190, '') : null,
            'payload' => $payload,
            'ip' => $request->ip(),
            'user_agent' => Str::limit((string) $request->userAgent(), 255, ''),
        ]);

        if ($pageId && app(FeatureService::class)->enabled('funnels')) {
            $step = FunnelStep::query()->where('page_id', $pageId)->whereHas('funnel', fn ($q) => $q->where('status', 'published'))->first();
            if ($step) {
                $lead = $email ? FunnelLead::query()->where('workspace_id', $form->workspace_id)->where('funnel_id', $step->funnel_id)->where('email', Str::lower((string) $email))->first() : null;
                $leadData = [
                    'workspace_id' => $form->workspace_id,
                    'funnel_id' => $step->funnel_id,
                    'funnel_step_id' => $step->id,
                    'first_name' => is_string($name) ? Str::limit($name, 120, '') : null,
                    'email' => is_string($email) ? Str::lower(Str::limit($email, 190, '')) : null,
                    'phone' => $this->firstFilled($payload, ['phone', 'mobile']),
                    'company' => $this->firstFilled($payload, ['company', 'business']),
                    'data' => $payload,
                ];
                $lead ? $lead->update($leadData) : FunnelLead::query()->create($leadData);
            }
        }

        NotifyFormSubmission::dispatch($submission->id)->onQueue('notifications');

        return $submission->load(['form.site', 'page']);
    }

    /**
     * @return list<User>
     */
    public function verifiedRecipients(Form $form): array
    {
        $form->loadMissing('workspace.members');
        $requested = collect($form->settings['recipients'] ?? [])
            ->map(fn ($email) => Str::lower(trim((string) $email)))
            ->filter()
            ->unique()
            ->values();

        $members = $form->workspace->members()
            ->whereNotNull('users.email_verified_at')
            ->get();

        if ($requested->isEmpty()) {
            $owner = $form->workspace->owner;
            if ($owner?->email_verified_at) {
                return [$owner];
            }

            return $members->all();
        }

        return $members
            ->filter(fn (User $user) => $requested->contains(Str::lower($user->email)))
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function publicSchema(Form $form): array
    {
        $form->loadMissing('fields');
        $settings = $form->settings ?? [];
        $turnstileEnabled = (bool) ($settings['turnstile_enabled'] ?? false)
            && $this->turnstile->configured();

        return [
            'id' => $form->id,
            'name' => $form->name,
            'type' => $form->type,
            'success_message' => $settings['success_message'] ?? 'Thanks — we received your message.',
            'turnstile_enabled' => $turnstileEnabled,
            'turnstile_site_key' => $turnstileEnabled ? (config('uidesired.turnstile.site_key') ?: null) : null,
            'fields' => $form->fields->map(fn (FormField $field) => [
                'name' => $field->name,
                'label' => $field->label,
                'type' => $field->type,
                'required' => $field->required,
                'options' => $field->options,
            ])->values()->all(),
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $fields
     */
    private function syncFields(Form $form, array $fields): void
    {
        foreach ($fields as $index => $field) {
            $type = $field['type'] ?? 'text';
            if (! in_array($type, self::FIELD_TYPES, true)) {
                throw ValidationException::withMessages([
                    'fields' => ["Unsupported field type [{$type}]."],
                ]);
            }
            $name = Str::slug((string) ($field['name'] ?? $field['label'] ?? 'field'), '_');
            if ($name === '' || in_array($name, ['website', 'honeypot', 'cf-turnstile-response', 'turnstile_token', 'page_id'], true)) {
                throw ValidationException::withMessages([
                    'fields' => ['A form field is using a reserved or empty name.'],
                ]);
            }
            FormField::query()->create([
                'form_id' => $form->id,
                'name' => $name,
                'label' => $field['label'] ?? $name,
                'type' => $type,
                'required' => (bool) ($field['required'] ?? false),
                'options' => $field['options'] ?? null,
                'sort_order' => $field['sort_order'] ?? $index,
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $settings
     * @return array<string, mixed>
     */
    private function normalizeSettings(Site $site, array $settings): array
    {
        $recipients = collect($settings['recipients'] ?? [])
            ->map(fn ($email) => Str::lower(trim((string) $email)))
            ->filter()
            ->unique()
            ->values();

        if ($recipients->isNotEmpty()) {
            $allowed = $site->workspace->members()
                ->whereNotNull('users.email_verified_at')
                ->pluck('email')
                ->map(fn ($email) => Str::lower((string) $email));
            $unknown = $recipients->diff($allowed);
            if ($unknown->isNotEmpty()) {
                throw ValidationException::withMessages([
                    'settings.recipients' => ['Recipients must be verified workspace members. Unrestricted email relay is not allowed.'],
                ]);
            }
        }

        return [
            'recipients' => $recipients->all(),
            'turnstile_enabled' => (bool) ($settings['turnstile_enabled'] ?? false),
            'success_message' => isset($settings['success_message'])
                ? Str::limit(strip_tags((string) $settings['success_message']), 240, '')
                : 'Thanks — we received your message.',
        ];
    }

    private function normalizeType(mixed $type): string
    {
        $value = is_string($type) ? $type : 'contact';
        if (! in_array($value, self::TYPES, true)) {
            throw ValidationException::withMessages(['type' => ['Invalid form type.']]);
        }

        return $value;
    }

    private function normalizeSubmittedValue(FormField $field, mixed $value): mixed
    {
        if ($field->type === 'checkbox') {
            if (is_array($value)) {
                return array_values(array_map(fn ($item) => is_string($item) ? $this->sanitizer->sanitize($item) : $item, $value));
            }

            return filter_var($value, FILTER_VALIDATE_BOOLEAN);
        }

        if (is_array($value)) {
            return null;
        }

        return $value;
    }

    private function isBlank(mixed $value): bool
    {
        if ($value === false) {
            return true;
        }

        return blank($value);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  list<string>  $keys
     */
    private function firstFilled(array $payload, array $keys): mixed
    {
        foreach ($keys as $key) {
            if (isset($payload[$key]) && filled($payload[$key])) {
                return $payload[$key];
            }
        }

        return null;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function starterForms(): array
    {
        return [
            ['name' => 'Contact', 'slug' => 'contact', 'type' => 'contact'],
            ['name' => 'Lead', 'slug' => 'lead', 'type' => 'lead'],
            ['name' => 'Newsletter', 'slug' => 'newsletter', 'type' => 'newsletter'],
            ['name' => 'Request Quote', 'slug' => 'quote', 'type' => 'quote'],
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function defaultFields(string $type): array
    {
        return match ($type) {
            'lead' => [
                ['name' => 'name', 'label' => 'Name', 'type' => 'text', 'required' => true],
                ['name' => 'email', 'label' => 'Work email', 'type' => 'email', 'required' => true],
                ['name' => 'company', 'label' => 'Company', 'type' => 'text', 'required' => false],
                ['name' => 'budget', 'label' => 'Budget', 'type' => 'select', 'required' => false, 'options' => ['Under $5k', '$5k – $15k', '$15k – $40k', '$40k+']],
                ['name' => 'message', 'label' => 'Project summary', 'type' => 'textarea', 'required' => false],
            ],
            'newsletter' => [
                ['name' => 'email', 'label' => 'Email', 'type' => 'email', 'required' => true],
            ],
            'quote' => [
                ['name' => 'name', 'label' => 'Name', 'type' => 'text', 'required' => true],
                ['name' => 'email', 'label' => 'Email', 'type' => 'email', 'required' => true],
                ['name' => 'service', 'label' => 'What do you need?', 'type' => 'select', 'required' => false, 'options' => ['New website', 'Redesign', 'Ongoing support', 'Something else']],
                ['name' => 'timeline', 'label' => 'Ideal timeline', 'type' => 'text', 'required' => false],
                ['name' => 'project', 'label' => 'Project details', 'type' => 'textarea', 'required' => true],
            ],
            default => [
                ['name' => 'name', 'label' => 'Name', 'type' => 'text', 'required' => true],
                ['name' => 'email', 'label' => 'Email', 'type' => 'email', 'required' => true],
                ['name' => 'phone', 'label' => 'Phone', 'type' => 'phone', 'required' => false],
                ['name' => 'message', 'label' => 'Message', 'type' => 'textarea', 'required' => true],
            ],
        };
    }
}
