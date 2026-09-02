<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\AiException;
use App\Http\Controllers\Controller;
use App\Http\Resources\PageResource;
use App\Models\Site;
use App\Services\Ai\AiGenerator;
use App\Services\Ai\AiSettingsService;
use App\Services\AuditService;
use App\Services\PageService;
use App\Services\PlanLimitService;
use App\Services\SiteService;
use App\Support\BlockCatalog;
use App\Support\CurrentWorkspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

/**
 * Tenant-facing AI endpoints.
 *
 * Every write path: authorize the site → check the admin switches → check plan
 * entitlement and monthly quota → generate → repair/validate → audit.
 */
class AiController extends Controller
{
    public function __construct(
        private readonly AiSettingsService $settings,
        private readonly AiGenerator $generator,
        private readonly PlanLimitService $limits,
        private readonly AuditService $audit,
        private readonly CurrentWorkspace $currentWorkspace,
    ) {}

    /**
     * Gives a generation longer than PHP's default 30 seconds.
     *
     * Only for a real request. On the CLI the limit is a timer on the whole
     * process rather than on one request, so setting it here would quietly cap
     * everything that ran afterwards - a queue worker, or a test run - and kill
     * it part-way through unrelated work 240 seconds later.
     */
    private function allowLongRunning(): void
    {
        if (app()->runningInConsole()) {
            return;
        }

        @set_time_limit(max(240, (int) config('ai.timeout', 180) + 60));
    }

    /**
     * Availability for the builder UI: whether AI is on, whether the plan is
     * entitled, and the remaining monthly quota. Never includes the key.
     */
    public function status(): JsonResponse
    {
        $workspace = $this->currentWorkspace->workspace;
        $config = $this->settings->config();
        $limit = $workspace ? $this->limits->limitValue($workspace, 'ai_generations') : null;
        $used = $workspace ? $this->limits->usage($workspace, 'ai_generations') : 0;

        return response()->json(['data' => [
            'enabled' => $config->enabled,
            'configured' => $config->configured(),
            'available' => $config->enabled && $config->configured(),
            'provider' => $config->enabled ? $config->provider : null,
            'model' => $config->enabled ? $config->model : null,
            'entitled' => is_numeric($limit) && ((int) $limit < 0 || (int) $limit > 0),
            'used' => $used,
            'limit' => is_numeric($limit) ? (int) $limit : 0,
            'block_types' => BlockCatalog::types(),
        ]]);
    }

    public function generatePage(Request $request, AiGenerator $generator): JsonResponse
    {
        $data = $request->validate([
            'site_id' => ['required'],
            'prompt' => ['required', 'string', 'min:8', 'max:2000'],
            'page_name' => ['nullable', 'string', 'max:120'],
            'page_type' => ['nullable', 'string', 'max:60'],
            'tone' => ['nullable', 'string', 'max:60'],
            'sections' => ['nullable', 'array', 'max:20'],
            'sections.*' => ['string', 'max:60'],
        ]);

        $site = $this->site($data['site_id']);
        $this->authorize('update', $site);
        $this->assertQuota($site);
        $this->allowLongRunning();

        $result = $generator->generatePage($site, $data);

        $this->audit->log('ai.page_generated', $site, [
            'prompt' => mb_substr($data['prompt'], 0, 240),
            'pages' => count($result['pages'] ?? []),
            'sections' => $result['report']['sections'],
            'dropped_types' => $result['report']['dropped_types'],
            'dropped_props' => count($result['report']['dropped_props']),
            'provider' => $this->settings->config()->provider,
        ], $site->workspace, $request->user());

        return response()->json(['data' => [
            'content' => $result['content'],
            'pages' => $result['pages'],
            'theme' => $result['theme'],
            'report' => $result['report'],
            'usage' => $this->usage($site),
        ]]);
    }

    /**
     * Writes a site's copy for it, keeping the template it was built from.
     *
     * Run straight after a template is applied. Generation here is deliberately
     * narrower than generate-page: the customer chose that design, so only the
     * words change. Every page of the site is rewritten in one pass, because a
     * site whose home page talks about one business and whose about page talks
     * about another is worse than one nobody rewrote.
     */
    public function generateTemplateCopy(Request $request, PageService $pages): JsonResponse
    {
        $data = $request->validate([
            'site_id' => ['required'],
            'prompt' => ['nullable', 'string', 'max:2000'],
            'tone' => ['nullable', 'string', 'max:60'],
        ]);

        $site = $this->site($data['site_id']);
        $this->authorize('update', $site);
        $this->assertQuota($site);
        $this->allowLongRunning();

        $site->loadMissing('pages.draftRevision');
        $rewrittenPages = 0;
        $slots = 0;
        $rewritten = 0;
        $failed = [];

        foreach ($site->pages as $page) {
            $content = $page->draftRevision?->content_json ?? [];
            $sections = is_array($content['sections'] ?? null) ? $content['sections'] : [];
            if ($sections === []) {
                continue;
            }

            try {
                $result = $this->generator->generateTemplateCopy($site, $sections, $data);
            } catch (AiException $exception) {
                // One page failing must not lose the pages already rewritten,
                // and a half-written site is reported rather than hidden.
                $failed[] = $page->slug ?: (string) $page->id;

                continue;
            }

            if ($result['report']['rewritten'] === 0) {
                continue;
            }

            $pages->saveDraft($page, $request->user(), ['schemaVersion' => 1, 'sections' => $result['sections']]);
            $rewrittenPages++;
            $slots += $result['report']['slots'];
            $rewritten += $result['report']['rewritten'];
        }

        if ($rewrittenPages === 0) {
            throw AiException::invalidOutput('The AI could not rewrite this site. Try again, or edit the copy by hand.');
        }

        $this->audit->log('ai.template_copy_generated', $site, [
            'pages' => $rewrittenPages,
            'slots' => $slots,
            'rewritten' => $rewritten,
            'failed_pages' => $failed,
            'provider' => $this->settings->config()->provider,
        ], $site->workspace, $request->user());

        return response()->json(['data' => [
            'pages' => $rewrittenPages,
            'slots' => $slots,
            'rewritten' => $rewritten,
            'failed_pages' => $failed,
            'usage' => $this->usage($site),
        ]]);
    }

    public function chat(Request $request, AiGenerator $generator): JsonResponse
    {
        $data = $request->validate([
            'site_id' => ['required'],
            'page_id' => ['nullable'],
            'page_name' => ['nullable', 'string', 'max:120'],
            'page_slug' => ['nullable', 'string', 'max:120'],
            'is_homepage' => ['sometimes', 'boolean'],
            'messages' => ['required', 'array', 'min:1', 'max:24'],
            'messages.*.role' => ['required', 'in:user,assistant'],
            'messages.*.content' => ['required', 'string', 'max:4000'],
            'existing_pages' => ['nullable', 'array', 'max:20'],
            'existing_pages.*.name' => ['nullable', 'string', 'max:120'],
            'existing_pages.*.slug' => ['nullable', 'string', 'max:120'],
            'theme' => ['nullable', 'array'],
            'current_content' => ['nullable', 'array'],
            'selected_type' => ['nullable', 'string', 'max:80'],
            'selected_heading' => ['nullable', 'string', 'max:160'],
            'generation_mode' => ['nullable', 'in:auto,full_site,current_page,copy,blocks'],
            'requested_pages' => ['nullable', 'integer', 'min:1', 'max:8'],
        ]);

        $site = $this->site($data['site_id']);
        $this->authorize('update', $site);
        $this->assertQuota($site);
        $this->allowLongRunning();

        $result = $generator->chat($site, $data);

        $this->audit->log('ai.chat', $site, [
            'action' => $result['action'],
            'pages' => count($result['pages'] ?? []),
            'sections' => count($result['sections'] ?? []),
            'provider' => $this->settings->config()->provider,
        ], $site->workspace, $request->user());

        return response()->json(['data' => [
            'action' => $result['action'],
            'message' => $result['message'],
            'pages' => $result['pages'],
            'sections' => $result['sections'],
            'theme' => $result['theme'],
            'report' => $result['report'],
            'usage' => $this->usage($site),
        ]]);
    }

    /**
     * Streams newline-delimited generation events so the builder can show the
     * actual page and block structure as it is validated and assembled.
     */
    public function chatStream(Request $request, AiGenerator $generator): StreamedResponse
    {
        $data = $request->validate([
            'site_id' => ['required'],
            'page_id' => ['nullable'],
            'page_name' => ['nullable', 'string', 'max:120'],
            'page_slug' => ['nullable', 'string', 'max:120'],
            'is_homepage' => ['sometimes', 'boolean'],
            'messages' => ['required', 'array', 'min:1', 'max:24'],
            'messages.*.role' => ['required', 'in:user,assistant'],
            'messages.*.content' => ['required', 'string', 'max:4000'],
            'existing_pages' => ['nullable', 'array', 'max:20'],
            'existing_pages.*.name' => ['nullable', 'string', 'max:120'],
            'existing_pages.*.slug' => ['nullable', 'string', 'max:120'],
            'theme' => ['nullable', 'array'],
            'current_content' => ['nullable', 'array'],
            'selected_type' => ['nullable', 'string', 'max:80'],
            'selected_heading' => ['nullable', 'string', 'max:160'],
            'generation_mode' => ['nullable', 'in:auto,full_site,current_page,copy,blocks'],
            'requested_pages' => ['nullable', 'integer', 'min:1', 'max:8'],
        ]);

        $site = $this->site($data['site_id']);
        $this->authorize('update', $site);
        $this->assertQuota($site);
        $this->allowLongRunning();

        return response()->stream(function () use ($data, $generator, $request, $site): void {
            $emit = static function (string $type, array $payload = []): void {
                echo json_encode(['type' => $type] + $payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)."\n";
                if (ob_get_level() > 0) {
                    @ob_flush();
                }
                flush();
            };

            try {
                $emit('start', [
                    'stage' => 'starting',
                    'message' => 'Starting an interactive generation session.',
                    'progress' => 4,
                    'code' => 'createGenerationSession({ live: true });',
                ]);

                $result = $generator->chat(
                    $site,
                    $data,
                    static function (string $stage, string $message, array $meta = []) use ($emit): void {
                        $emit('progress', ['stage' => $stage, 'message' => $message] + $meta);
                    },
                );

                $pages = is_array($result['pages'] ?? null) ? $result['pages'] : [];
                $sections = is_array($result['sections'] ?? null) ? $result['sections'] : [];
                $emit('plan', [
                    'action' => $result['action'],
                    'pages' => count($pages),
                    'sections' => count($sections),
                    'theme' => $result['theme'],
                    'progress' => 90,
                ]);

                foreach ($pages as $pageIndex => $page) {
                    $pageSections = is_array($page['content']['sections'] ?? null) ? $page['content']['sections'] : [];
                    $emit('page', [
                        'index' => $pageIndex,
                        'total' => count($pages),
                        'page' => [
                            'name' => $page['name'] ?? 'Page',
                            'slug' => $page['slug'] ?? 'page',
                            'is_homepage' => (bool) ($page['is_homepage'] ?? false),
                        ],
                        'blocks' => count($pageSections),
                        'code' => 'page("/'.($page['slug'] ?? 'page').'")',
                    ]);
                    foreach ($pageSections as $blockIndex => $section) {
                        $emit('block', [
                            'page_index' => $pageIndex,
                            'page_slug' => $page['slug'] ?? 'page',
                            'page_home' => (bool) ($page['is_homepage'] ?? false),
                            'index' => $blockIndex,
                            'total' => count($pageSections),
                            'section' => $section,
                        ]);
                    }
                }

                // A standalone section is a block being inserted, and the client
                // previews it by splicing it into the page. The sections of a
                // copy rewrite are the page's own blocks coming back with new
                // words, so streaming them here would preview the page twice.
                if ($result['action'] !== 'rewrite_copy') {
                    foreach ($sections as $index => $section) {
                        $emit('block', [
                            'page_index' => null,
                            'page_slug' => $data['page_slug'] ?? 'home',
                            'page_home' => (bool) ($data['is_homepage'] ?? false),
                            'index' => $index,
                            'total' => count($sections),
                            'section' => $section,
                        ]);
                    }
                }

                $this->audit->log('ai.chat', $site, [
                    'action' => $result['action'],
                    'pages' => count($pages),
                    'sections' => count($sections),
                    'streamed' => true,
                    'provider' => $this->settings->config()->provider,
                ], $site->workspace, $request->user());

                $emit('result', ['data' => [
                    'action' => $result['action'],
                    'message' => $result['message'],
                    'pages' => $pages,
                    'sections' => $sections,
                    'theme' => $result['theme'],
                    'report' => $result['report'],
                    'usage' => $this->usage($site),
                ]]);
                $emit('done', ['progress' => 100, 'message' => 'Website generation complete.']);
            } catch (AiException $exception) {
                $emit('error', [
                    'message' => $exception->getMessage(),
                    'error' => $exception->error,
                    'status' => $exception->getStatusCode(),
                ]);
            } catch (Throwable $exception) {
                report($exception);
                $emit('error', [
                    'message' => 'The generation stream stopped unexpectedly. Try again.',
                    'error' => 'ai_stream_error',
                    'status' => 500,
                ]);
            }
        }, 200, [
            'Content-Type' => 'application/x-ndjson; charset=utf-8',
            'Cache-Control' => 'no-cache, no-transform',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
        ]);
    }

    public function applyGeneration(Request $request, SiteService $sites): JsonResponse
    {
        $data = $request->validate([
            'site_id' => ['required'],
            'page_id' => ['nullable', 'integer'],
            'theme' => ['nullable', 'array'],
            'pages' => ['required', 'array', 'min:1', 'max:8'],
            'pages.*.name' => ['required', 'string', 'max:120'],
            'pages.*.slug' => ['required', 'string', 'max:120'],
            'pages.*.is_homepage' => ['sometimes', 'boolean'],
            'pages.*.content' => ['required', 'array'],
        ]);

        $site = $this->site($data['site_id']);
        $this->authorize('update', $site);

        $applied = $sites->applyAiGeneration(
            $site,
            $request->user(),
            $data['pages'],
            is_array($data['theme'] ?? null) ? $data['theme'] : [],
            isset($data['page_id']) ? (int) $data['page_id'] : null,
        );

        return response()->json(['data' => [
            'pages' => PageResource::collection($applied['pages'])->resolve(),
            'theme' => $applied['theme'],
            'skipped' => $applied['skipped'],
            'current_content' => $applied['current_content'],
        ]]);
    }

    public function generateBlock(Request $request, AiGenerator $generator): JsonResponse
    {
        $data = $request->validate([
            'site_id' => ['required'],
            'prompt' => ['required', 'string', 'min:3', 'max:2000'],
            'type' => ['nullable', 'string', 'max:80'],
            'tone' => ['nullable', 'string', 'max:60'],
            'props' => ['nullable', 'array'],
        ]);

        $site = $this->site($data['site_id']);
        $this->authorize('update', $site);
        $this->assertQuota($site);

        $result = $generator->generateBlock($site, $data);

        $this->audit->log('ai.block_generated', $site, [
            'prompt' => mb_substr($data['prompt'], 0, 240),
            'block_type' => $result['section']['type'],
            'requested_type' => $data['type'] ?? null,
            'dropped_props' => count($result['report']['dropped_props']),
            'provider' => $this->settings->config()->provider,
        ], $site->workspace, $request->user());

        return response()->json(['data' => [
            'section' => $result['section'],
            'sections' => $result['sections'] ?? [$result['section']],
            'report' => $result['report'],
            'usage' => $this->usage($site),
        ]]);
    }

    public function rewrite(Request $request, AiGenerator $generator): JsonResponse
    {
        $data = $request->validate([
            'site_id' => ['required'],
            'text' => ['required', 'string', 'min:1', 'max:8000'],
            'mode' => ['nullable', 'in:improve,expand,shorten,tone,fix'],
            'tone' => ['nullable', 'string', 'max:60'],
            'context' => ['nullable', 'string', 'max:200'],
        ]);

        $site = $this->site($data['site_id']);
        $this->authorize('update', $site);
        $this->assertQuota($site);

        $result = $generator->rewrite($data);

        $this->audit->log('ai.text_rewritten', $site, [
            'mode' => $data['mode'] ?? 'improve',
            'characters' => mb_strlen($data['text']),
            'provider' => $this->settings->config()->provider,
        ], $site->workspace, $request->user());

        return response()->json(['data' => [
            'text' => $result['text'],
            'usage' => $this->usage($site),
        ]]);
    }

    private function site(mixed $id): Site
    {
        $workspace = $this->currentWorkspace->workspace;
        abort_unless($workspace !== null, 404);

        return Site::query()
            ->where('workspace_id', $workspace->id)
            ->where('id', $id)
            ->firstOrFail();
    }

    /**
     * Runs the admin switches first (503) so an unconfigured platform does not
     * look like a billing problem, then the plan quota (402).
     */
    private function assertQuota(Site $site): void
    {
        $this->generator->config();
        $this->limits->assertOrFail($site->workspace, 'ai_generations');
    }

    /**
     * @return array{used: int, limit: int|null}
     */
    private function usage(Site $site): array
    {
        $limit = $this->limits->limitValue($site->workspace, 'ai_generations');

        return [
            'used' => $this->limits->usage($site->workspace, 'ai_generations'),
            'limit' => is_numeric($limit) ? (int) $limit : null,
        ];
    }
}
