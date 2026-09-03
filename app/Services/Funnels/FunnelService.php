<?php

namespace App\Services\Funnels;

use App\Models\Funnel;
use App\Models\FunnelConnection;
use App\Models\FunnelStep;
use App\Models\User;
use App\Models\Workspace;
use App\Services\AuditService;
use App\Services\PlanLimitService;
use App\Support\PageSchemaValidator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class FunnelService
{
    public function __construct(
        private readonly AuditService $audit,
        private readonly PageSchemaValidator $validator,
        private readonly PlanLimitService $limits,
    ) {}

    /** @param array<string, mixed> $data */
    public function create(Workspace $workspace, User $user, array $data): Funnel
    {
        $this->limits->assertOrFail($workspace, 'funnels');

        return DB::transaction(function () use ($workspace, $user, $data) {
            $slug = $this->uniqueFunnelSlug($workspace->id, $data['slug'] ?? $data['name']);
            $funnel = Funnel::query()->create([
                'workspace_id' => $workspace->id,
                'public_id' => (string) Str::uuid(),
                'site_id' => null,
                'domain_id' => $data['domain_id'] ?? null,
                'created_by' => $user->id,
                'name' => $data['name'],
                'slug' => $slug,
                'description' => $data['description'] ?? null,
                'type' => $data['type'] ?? 'lead_generation',
                'goal' => $data['goal'] ?? 'collect_leads',
                'status' => 'draft',
                'settings' => $data['settings'] ?? ['cookie_consent' => 'essential', 'bot_filtering' => true],
            ]);

            $blueprint = $this->templateSteps($data['template'] ?? null, $funnel->name, $funnel->type, $funnel->goal);
            $createdSteps = [];
            foreach ($blueprint as $index => $step) {
                $createdSteps[] = $this->addStep($funnel, $user, [
                    'name' => $step['name'],
                    'slug' => $step['slug'],
                    'type' => $step['type'],
                    'position' => $index + 1,
                    'canvas_x' => 80 + ($index * 310),
                    'canvas_y' => 100 + (($index % 2) * 40),
                    'content' => $step['content'],
                ]);
            }
            for ($i = 0; $i < count($createdSteps) - 1; $i++) {
                $this->connect($funnel, [
                    'source_step_id' => $createdSteps[$i]->id,
                    'target_step_id' => $createdSteps[$i + 1]->id,
                    'connection_type' => 'default',
                ]);
            }

            $this->audit->log('funnel.created', $funnel, ['standalone' => true, 'template' => $data['template'] ?? null], $workspace, $user);

            return $this->load($funnel);
        });
    }

    /** @param array<string, mixed> $data */
    public function update(Funnel $funnel, array $data): Funnel
    {
        $funnel->fill(collect($data)->only(['name', 'description', 'type', 'goal', 'domain_id', 'settings'])->all())->save();

        return $this->load($funnel);
    }

    /** @param array<string, mixed> $data */
    public function addStep(Funnel $funnel, User $user, array $data): FunnelStep
    {
        $position = isset($data['position']) ? (int) $data['position'] : ((int) $funnel->steps()->max('position') + 1);
        $slug = $this->uniqueStepSlug($funnel, $data['slug'] ?? $data['name']);
        $content = $this->validator->validate($data['content'] ?? $this->stepContent($data['name'], $data['type'] ?? 'custom_page'));

        return FunnelStep::query()->create([
            'workspace_id' => $funnel->workspace_id,
            'funnel_id' => $funnel->id,
            'page_id' => null,
            'draft_content' => $content,
            'name' => $data['name'],
            'slug' => $slug,
            'type' => $data['type'] ?? 'custom_page',
            'status' => 'draft',
            'position' => $position,
            'canvas_x' => (int) ($data['canvas_x'] ?? 80 + ($position * 310)),
            'canvas_y' => (int) ($data['canvas_y'] ?? 100),
            'settings' => $data['settings'] ?? [],
        ]);
    }

    /** @param array<string, mixed> $data */
    public function updateStep(Funnel $funnel, FunnelStep $step, array $data): FunnelStep
    {
        $this->assertStep($funnel, $step);
        $step->fill(collect($data)->only(['name', 'type', 'status', 'position', 'canvas_x', 'canvas_y', 'settings'])->all())->save();

        return $step->fresh('page');
    }

    /** @param array<string, mixed> $content */
    public function saveStepContent(Funnel $funnel, FunnelStep $step, array $content): FunnelStep
    {
        $this->assertStep($funnel, $step);
        $step->update(['draft_content' => $this->validator->validate($content)]);

        return $step->fresh();
    }

    /** @param array<string, mixed> $data */
    public function connect(Funnel $funnel, array $data): FunnelConnection
    {
        $source = $funnel->steps()->findOrFail($data['source_step_id']);
        $target = $funnel->steps()->findOrFail($data['target_step_id']);
        if ($source->is($target)) {
            throw ValidationException::withMessages(['target_step_id' => ['A step cannot connect to itself.']]);
        }

        return FunnelConnection::query()->updateOrCreate([
            'source_step_id' => $source->id,
            'target_step_id' => $target->id,
            'connection_type' => $data['connection_type'] ?? 'default',
        ], [
            'workspace_id' => $funnel->workspace_id,
            'funnel_id' => $funnel->id,
            'conditions' => $data['conditions'] ?? [],
            'priority' => (int) ($data['priority'] ?? 0),
        ]);
    }

    public function publish(Funnel $funnel, User $user): Funnel
    {
        if ($funnel->steps()->count() < 1) {
            throw ValidationException::withMessages(['steps' => ['Add at least one step before publishing.']]);
        }
        DB::transaction(function () use ($funnel, $user) {
            foreach ($funnel->steps()->with('variants')->get() as $step) {
                $step->update(['published_content' => $this->validator->validate($step->draft_content ?? ['schemaVersion' => 1, 'sections' => []]), 'status' => 'published']);

                // A variant that is still a draft would be assigned traffic and
                // then have nothing of its own to serve, so it goes live with
                // the step it belongs to.
                foreach ($step->variants as $variant) {
                    $variant->update([
                        'published_content' => $this->validator->validate(
                            $variant->draft_content ?? $step->draft_content ?? ['schemaVersion' => 1, 'sections' => []],
                        ),
                    ]);
                }
            }
            $funnel->update(['status' => 'published', 'published_at' => now()]);
            $this->audit->log('funnel.published', $funnel, [], $funnel->workspace, $user);
        });

        return $this->load($funnel);
    }

    public function duplicate(Funnel $source, User $user): Funnel
    {
        return DB::transaction(function () use ($source, $user) {
            $copy = Funnel::query()->create([
                'workspace_id' => $source->workspace_id, 'site_id' => $source->site_id,
                'public_id' => (string) Str::uuid(),
                'domain_id' => $source->domain_id, 'created_by' => $user->id,
                'name' => $source->name.' Copy', 'slug' => $this->uniqueFunnelSlug($source->workspace_id, $source->slug.'-copy'),
                'description' => $source->description, 'type' => $source->type, 'goal' => $source->goal,
                'status' => 'draft', 'settings' => $source->settings,
            ]);
            $map = [];
            foreach ($source->steps()->get() as $step) {
                $new = $this->addStep($copy, $user, [
                    'name' => $step->name, 'slug' => $step->slug, 'type' => $step->type,
                    'position' => $step->position, 'canvas_x' => $step->canvas_x, 'canvas_y' => $step->canvas_y,
                    'settings' => $step->settings, 'content' => $step->draft_content ?? ['schemaVersion' => 1, 'sections' => []],
                ]);
                $map[$step->id] = $new->id;
            }
            foreach ($source->connections as $connection) {
                $this->connect($copy, ['source_step_id' => $map[$connection->source_step_id], 'target_step_id' => $map[$connection->target_step_id], 'connection_type' => $connection->connection_type, 'conditions' => $connection->conditions, 'priority' => $connection->priority]);
            }

            return $this->load($copy);
        });
    }

    public function load(Funnel $funnel): Funnel
    {
        return $funnel->fresh(['site', 'steps', 'connections'])->loadCount(['steps', 'leads', 'events']);
    }

    private function assertStep(Funnel $funnel, FunnelStep $step): void
    {
        abort_unless($step->funnel_id === $funnel->id, 404);
    }

    private function uniqueFunnelSlug(int $workspaceId, string $value): string
    {
        return $this->uniqueSlug(Str::slug($value) ?: 'funnel', fn ($slug) => Funnel::withTrashed()->where('workspace_id', $workspaceId)->where('slug', $slug)->exists());
    }

    private function uniqueStepSlug(Funnel $funnel, string $value): string
    {
        return $this->uniqueSlug(Str::slug($value) ?: 'step', fn ($slug) => FunnelStep::withTrashed()->where('funnel_id', $funnel->id)->where('slug', $slug)->exists());
    }

    private function uniqueSlug(string $base, callable $exists): string
    {
        $slug = $base;
        $i = 2;
        while ($exists($slug)) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }

    private function page(array $sections): array
    {
        return ['schemaVersion' => 1, 'sections' => $sections];
    }

    private function section(string $id, string $type, array $props): array
    {
        return ['id' => $id.'-'.Str::lower(Str::random(5)), 'type' => $type, 'version' => 1, 'hidden' => false, 'props' => $props];
    }

    private function landingContent(string $name): array
    {
        return $this->page([$this->section('hero', 'hero.centered', [
            'eyebrow' => 'A better next step',
            'heading' => $name,
            'description' => 'A focused experience designed to help you make a confident decision.',
            'buttonLabel' => 'Get started',
            'buttonUrl' => '#',
            'secondaryLabel' => '',
            'secondaryUrl' => '#',
            'showTrust' => true,
            'trustText' => 'Clear, useful, and built around your needs',
        ])]);
    }

    /**
     * The blocks a new step starts with.
     *
     * A step whose job is to collect details gets a form that actually collects
     * them. Every type used to get the same placeholder hero, so a funnel built
     * to capture leads shipped with nothing on it that could.
     */
    private function stepContent(string $name, string $type): array
    {
        if (in_array($type, ['lead_form', 'survey', 'opt_in'], true)) {
            return $this->page([$this->section('optin', 'funnel.optin', [
                'eyebrow' => Str::headline($type),
                'heading' => $name,
                'description' => 'Leave your details and we will take it from here.',
                'fields' => $type === 'survey' ? ['name', 'email', 'company'] : ['name', 'email'],
                'buttonLabel' => 'Continue',
                'successMessage' => 'Thanks — that is everything we need.',
                'footnote' => 'We will only use these details to get back to you.',
            ])]);
        }

        // A step whose job is to take money starts with something that can.
        // The product is left for the customer to choose - the button says so
        // on the canvas, and refuses to sell until one is picked.
        if (in_array($type, ['checkout', 'upsell', 'order_bump'], true)) {
            return $this->page([$this->section('buy', 'commerce.buy', [
                'productId' => '',
                'heading' => $name,
                'description' => $type === 'upsell'
                    ? 'Add this to your order before you go.'
                    : 'Confirm your order below.',
                'buttonLabel' => $type === 'upsell' ? 'Yes, add it' : 'Pay now',
                'askForEmail' => $type !== 'upsell',
                'footnote' => 'Secure checkout by Stripe.',
            ])]);
        }

        return $this->page([$this->section('step', 'hero.centered', [
            'eyebrow' => Str::headline($type),
            'heading' => $name,
            'description' => 'Customize this funnel step in the visual page editor.',
            'buttonLabel' => 'Continue',
            'buttonUrl' => '#',
            'showTrust' => false,
        ])]);
    }

    /**
     * @return list<array{name: string, slug: string, type: string, content: array<string, mixed>}>
     */
    private function templateSteps(?string $template, string $name, string $type, string $goal): array
    {
        $key = match (true) {
            in_array($template, ['lead_magnet', 'consultation', 'product_launch'], true) => $template,
            $type === 'booking' || $goal === 'book_appointments' => 'consultation',
            $type === 'sales' || $goal === 'sell_product' => 'product_launch',
            default => $template ?: 'lead_magnet',
        };

        return match ($key) {
            'consultation' => [
                ['name' => 'Offer', 'slug' => 'start', 'type' => 'offer_page', 'content' => $this->landingContent($name)],
                ['name' => 'Qualification', 'slug' => 'qualify', 'type' => 'survey', 'content' => $this->stepContent('Tell us about your project', 'survey')],
                ['name' => 'Booking', 'slug' => 'book', 'type' => 'booking', 'content' => $this->stepContent('Pick a time that works', 'booking')],
                ['name' => 'Confirmation', 'slug' => 'thanks', 'type' => 'thank_you', 'content' => $this->stepContent('You are booked', 'thank_you')],
            ],
            'product_launch' => [
                ['name' => 'Landing Page', 'slug' => 'start', 'type' => 'landing_page', 'content' => $this->landingContent($name)],
                ['name' => 'Offer', 'slug' => 'offer', 'type' => 'offer_page', 'content' => $this->stepContent('Your offer', 'offer_page')],
                ['name' => 'Checkout', 'slug' => 'checkout', 'type' => 'checkout', 'content' => $this->stepContent('Checkout', 'checkout')],
                ['name' => 'Upsell', 'slug' => 'upsell', 'type' => 'upsell', 'content' => $this->stepContent('One more upgrade', 'upsell')],
                ['name' => 'Thank You', 'slug' => 'thanks', 'type' => 'thank_you', 'content' => $this->stepContent('You are in', 'thank_you')],
            ],
            default => [
                ['name' => 'Landing Page', 'slug' => 'start', 'type' => 'landing_page', 'content' => $this->landingContent($name)],
                ['name' => 'Lead Form', 'slug' => 'capture', 'type' => 'lead_form', 'content' => $this->stepContent('Leave your details', 'lead_form')],
                ['name' => 'Thank You', 'slug' => 'thanks', 'type' => 'thank_you', 'content' => $this->stepContent('Thanks — we will be in touch', 'thank_you')],
            ],
        };
    }
}
