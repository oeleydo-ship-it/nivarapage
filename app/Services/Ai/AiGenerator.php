<?php

namespace App\Services\Ai;

use App\Exceptions\AiException;
use App\Models\Site;
use App\Support\AiGeneratedSite;
use App\Support\AiSectionRepair;
use App\Support\PageSchemaValidator;
use App\Support\TemplateCopySlots;
use InvalidArgumentException;

/**
 * Generates page content, single sections and rewritten copy.
 *
 * Nothing here trusts the model: every response is parsed defensively, repaired
 * against the generated block catalog, and finally run through
 * PageSchemaValidator (which also sanitises strings) before it is returned.
 */
class AiGenerator
{
    public function __construct(
        private readonly AiSettingsService $settings,
        private readonly AiProviderFactory $factory,
        private readonly AiPromptBuilder $prompts,
        private readonly AiSectionRepair $repair,
        private readonly PageSchemaValidator $validator,
        private readonly SiteKitProfile $kits,
    ) {}

    /**
     * Called while a provider request is in flight, so a streaming caller can
     * keep the connection warm. Null outside a streamed generation.
     *
     * @var (callable(): void)|null
     */
    private $heartbeat = null;

    /**
     * Stamps the site's own design conventions onto anything the model wrote.
     *
     * The prompt asks for these, but a section that arrives without them would
     * render with block defaults and look foreign next to the rest of the page,
     * so they are applied here rather than left to chance.
     *
     * @param  list<array<string, mixed>>  $pages
     * @param  list<array<string, mixed>>  $sections
     * @return array{pages: list<array<string, mixed>>, sections: list<array<string, mixed>>}
     */
    private function matchSiteDesign(Site $site, array $pages, array $sections, ?array $live = null, ?array $chosenKit = null): array
    {
        // A site with pages of its own sets the convention. A blank one has no
        // convention yet, so the kit art direction chose carries the motion.
        $detected = $this->kits->detect($site, $live);
        $kit = $detected ?? $chosenKit;
        if ($kit === null || $kit['design'] === []) {
            return ['pages' => $pages, 'sections' => $sections];
        }

        // Art direction is a decision made for this site, so it beats the block
        // defaults; a convention read off existing pages only fills gaps.
        $overwrite = $detected === null;

        foreach ($pages as $index => $page) {
            // Assembled pages carry their sections under `content`. Reaching for
            // `$page['sections']` here quietly matched nothing, so generated
            // pages never picked up the design they were supposed to.
            if (is_array($page['content']['sections'] ?? null)) {
                $pages[$index]['content']['sections'] = $this->kits->applyDesign($page['content']['sections'], $kit['design'], $overwrite);
            } elseif (is_array($page['sections'] ?? null)) {
                $pages[$index]['sections'] = $this->kits->applyDesign($page['sections'], $kit['design'], $overwrite);
            }
        }

        return [
            'pages' => $pages,
            'sections' => $this->kits->applyDesign($sections, $kit['design'], $overwrite),
        ];
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array{content: array<string, mixed>, pages: list<array<string, mixed>>, theme: array<string, mixed>, report: array<string, mixed>}
     */
    public function generatePage(Site $site, array $input): array
    {
        // Every new site starts blank, and a blank site used to mean "no kit",
        // which meant generation was held to the dozen generated.* blocks. A
        // law firm and a skate shop came out of the same handful of sections
        // while fifteen designed kits sat unused. Choose one first.
        $direction = $this->kits->detect($site) === null ? $this->directArt($site, $input) : null;
        $chosen = $direction['kit'] ?? null;

        $raw = $this->complete(
            $this->prompts->pageSystemPrompt(),
            $this->prompts->pagePrompt($site, $input, $chosen),
            ['max_tokens' => (int) config('ai.site_max_tokens', 8000)],
        );

        $assembled = $this->assembleSite($raw);
        $matched = $this->matchSiteDesign($site, $assembled['pages'], [], null, $chosen);
        $assembled['pages'] = $matched['pages'];

        // What the model wrote into the site JSON wins; art direction fills the
        // tokens it did not mention.
        if ($direction !== null && $direction['theme'] !== []) {
            $assembled['theme'] = ($assembled['theme'] ?? []) + $direction['theme'];
        }

        return $assembled;
    }

    /**
     * Picks the kit, palette and motion for a site that has none yet.
     *
     * Returns null when art direction cannot be had - the model is unreachable,
     * or answers with a kit that does not exist. Generation then runs exactly as
     * it did before rather than failing, so a site is still produced.
     *
     * @param  array<string, mixed>  $input
     * @return array{kit: array<string, mixed>, theme: array<string, mixed>, reason: string}|null
     */
    private function directArt(Site $site, array $input): ?array
    {
        $catalogue = $this->kits->catalogue();
        if ($catalogue === []) {
            return null;
        }

        try {
            $raw = $this->complete(
                $this->prompts->artDirectionSystemPrompt(),
                $this->prompts->artDirectionPrompt($site, $input, $catalogue),
                ['max_tokens' => 800],
            );
        } catch (AiException) {
            return null;
        }

        $decoded = AiJson::object($raw);
        if ($decoded === null) {
            return null;
        }

        $kit = $this->kits->kit(
            is_string($decoded['kit'] ?? null) ? $decoded['kit'] : '',
            self::sanitizeMotion($decoded['motion'] ?? null),
        );
        if ($kit === null) {
            return null;
        }

        return [
            'kit' => $kit,
            'theme' => AiGeneratedSite::sanitizeTheme($decoded['theme'] ?? null),
            'reason' => mb_substr(trim((string) ($decoded['reason'] ?? '')), 0, 200),
        ];
    }

    /**
     * Keeps motion to values the blocks understand, so an invented easing name
     * cannot reach a section prop and stop it animating at all.
     *
     * @return array<string, mixed>
     */
    private static function sanitizeMotion(mixed $raw): array
    {
        if (! is_array($raw)) {
            return [];
        }

        $allowed = [
            'animation' => ['none', 'fade', 'fade-up', 'fade-down', 'fade-left', 'fade-right', 'zoom-in', 'slide-up'],
            'animationTrigger' => ['scroll', 'load'],
            'contentWidth' => ['narrow', 'default', 'wide', 'full'],
        ];

        $clean = [];
        foreach ($allowed as $key => $options) {
            $value = is_string($raw[$key] ?? null) ? strtolower(trim($raw[$key])) : null;
            if ($value !== null && in_array($value, $options, true)) {
                $clean[$key] = $value;
            }
        }

        if (is_numeric($raw['animationDuration'] ?? null)) {
            $clean['animationDuration'] = max(240, min(900, (int) $raw['animationDuration']));
        }

        return $clean;
    }

    /**
     * Platform-library site JSON. Same pipeline as tenant generate-page, without a site.
     *
     * @param  array<string, mixed>  $input
     * @return array{content: array<string, mixed>, pages: list<array<string, mixed>>, theme: array<string, mixed>, report: array<string, mixed>}
     */
    public function generateLibraryPage(array $input): array
    {
        $raw = $this->complete(
            $this->prompts->pageSystemPrompt(),
            $this->prompts->libraryPagePrompt($input),
            ['max_tokens' => (int) config('ai.site_max_tokens', 8000)],
        );

        return $this->assembleSite($raw);
    }

    /**
     * Rewrites the copy of a site's pages without touching their structure.
     *
     * Used straight after a template is applied: the customer picked that
     * design, so generation must not be free to produce another one. Only the
     * strings the blocks declare as copy are sent and only strings come back -
     * see TemplateCopySlots - so the block types, their order and every design
     * prop survive untouched.
     *
     * @param  list<array<string, mixed>>  $sections
     * @param  array<string, mixed>  $input
     * @return array{sections: list<array<string, mixed>>, report: array{slots: int, rewritten: int}}
     */
    public function generateTemplateCopy(Site $site, array $sections, array $input = []): array
    {
        $slots = TemplateCopySlots::collect($sections);
        if ($slots === []) {
            return ['sections' => $sections, 'report' => ['slots' => 0, 'rewritten' => 0]];
        }

        $raw = $this->complete(
            $this->prompts->templateCopySystemPrompt(),
            $this->prompts->templateCopyPrompt($site, $slots, $input),
            ['max_tokens' => (int) config('ai.site_max_tokens', 8000)],
        );

        $decoded = AiJson::object($raw);
        $rows = is_array($decoded['slots'] ?? null) ? $decoded['slots'] : [];

        $values = [];
        foreach ($rows as $row) {
            if (! is_array($row)) {
                continue;
            }
            $index = $row['i'] ?? null;
            $text = $row['text'] ?? null;
            // Anything outside the list we sent is discarded rather than
            // guessed at: an index we did not issue addresses no known slot.
            if (! is_numeric($index) || ! is_string($text) || ! isset($slots[(int) $index])) {
                continue;
            }
            $text = trim($text);
            if ($text === '') {
                continue;
            }
            $values[$slots[(int) $index]['path']] = $text;
        }

        if ($values === []) {
            throw AiException::invalidOutput('The AI did not return any usable copy. Try again.');
        }

        $rewritten = TemplateCopySlots::apply($sections, $values);

        // The same validator every page save goes through, so generated copy
        // cannot carry markup into a published page.
        $validated = $this->validate(['schemaVersion' => 1, 'sections' => $rewritten]);

        return [
            'sections' => $validated['sections'],
            'report' => ['slots' => count($slots), 'rewritten' => count($values)],
        ];
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array{section: array<string, mixed>, sections: list<array<string, mixed>>, report: array<string, mixed>}
     */
    public function generateBlock(Site $site, array $input): array
    {
        $raw = $this->complete(
            $this->prompts->blockSystemPrompt(),
            $this->prompts->blockPrompt($site, $input),
        );

        return $this->assembleBlock($raw, $input);
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array{section: array<string, mixed>, sections: list<array<string, mixed>>, report: array<string, mixed>}
     */
    public function generateLibraryBlock(array $input): array
    {
        $raw = $this->complete(
            $this->prompts->blockSystemPrompt(),
            $this->prompts->libraryBlockPrompt($input),
        );

        return $this->assembleBlock($raw, $input);
    }

    /**
     * One chat turn: follow-ups may create pages, insert blocks, revise a page, or change theme.
     *
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public function chat(Site $site, array $input, ?callable $progress = null): array
    {
        $emit = static function (string $stage, string $message, array $meta = []) use ($progress): void {
            if ($progress !== null) {
                $progress($stage, $message, $meta);
            }
        };

        // While the model writes, nothing is sent and every proxy between here
        // and the browser treats the connection as idle. This keeps a trickle
        // going for as long as the request takes.
        $this->heartbeat = $progress === null ? null : static function () use ($progress): void {
            $progress('generating', 'Still writing the site.', ['heartbeat' => true]);
        };

        try {
            return $this->chatTurn($site, $input, $emit);
        } finally {
            $this->heartbeat = null;
        }
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    private function chatTurn(Site $site, array $input, callable $emit): array
    {

        $emit('analyzing', 'Reading the brief and current site structure.', [
            'code' => 'const brief = analyze(request, currentSite);',
            'progress' => 12,
        ]);

        $liveSections = is_array($input['current_content']['sections'] ?? null)
            ? $input['current_content']['sections']
            : null;

        // "Copy only" is not a request the model needs to classify: the mode is
        // already the instruction, and a routing round-trip could only disagree
        // with it and rebuild the page. Go straight to the slot rewriter, which
        // cannot change a block type.
        if ((string) ($input['generation_mode'] ?? 'auto') === 'copy') {
            return $this->rewriteCurrentPageCopy($site, $input, $liveSections, $emit);
        }

        // The kit the page is already built from decides whether the model is
        // allowed to answer in kit blocks. Without it every reply came back as
        // generated.* and replaced the chosen template.
        $detected = $this->kits->detect($site, $liveSections);

        // A blank canvas has no kit to detect, which is the whole of a new site.
        // Art-direct it first so "build me a law firm" is built from a designed
        // kit rather than the dozen generic blocks.
        $direction = $detected === null ? $this->directArt($site, $input) : null;
        $kit = $detected ?? ($direction['kit'] ?? null);

        if ($direction !== null) {
            $emit('generating', 'Choosing a design and palette for the brief.', [
                'code' => 'const design = artDirect(brief);',
                'progress' => 22,
            ]);
        }

        $emit('generating', 'Planning pages, navigation, theme, and block composition.', [
            'code' => 'const sitemap = await composePages(brief);',
            'progress' => 28,
        ]);
        $raw = $this->complete(
            $this->prompts->chatSystemPrompt($kit),
            $this->prompts->chatPrompt($site, $input, $kit),
            ['max_tokens' => (int) config('ai.site_max_tokens', 8000)],
        );

        $emit('validating', 'Validating generated content against the live block catalog.', [
            'code' => 'validate(sitemap, blockCatalog);',
            'progress' => 62,
        ]);

        $decoded = AiJson::object($raw);
        if ($decoded === null) {
            throw AiException::invalidOutput();
        }

        $action = $this->normaliseChatAction($decoded);

        // The model asked for a words-only change. Ignore any sections it sent
        // with it and rewrite the live page through the slot path instead, so
        // the answer cannot carry a different layout in on the side.
        if ($action === 'rewrite_copy') {
            return $this->rewriteCurrentPageCopy(
                $site,
                $input,
                $liveSections,
                $emit,
                trim((string) ($decoded['message'] ?? $decoded['reply'] ?? '')),
            );
        }

        $emit('assembling', 'Assembling safe, editable page and block data.', [
            'action' => $action,
            'code' => 'const pages = repairAndAssemble(sitemap);',
            'progress' => 76,
        ]);
        $message = trim((string) ($decoded['message'] ?? $decoded['reply'] ?? ''));
        $theme = AiGeneratedSite::sanitizeTheme($decoded['theme'] ?? $decoded['theme_tokens'] ?? null);
        $pages = [];
        $sections = [];
        $report = ['sections' => 0, 'dropped_types' => [], 'dropped_props' => [], 'pages' => 0];

        $hasPages = is_array($decoded['pages'] ?? null) && $decoded['pages'] !== [];
        $hasSections = is_array($decoded['sections'] ?? null) && $decoded['sections'] !== [];
        $hasType = is_string($decoded['type'] ?? null);

        if (in_array($action, ['apply_site', 'replace_page', 'create_page'], true) || $hasPages) {
            if (! $hasPages && $hasSections) {
                $decoded['pages'] = [[
                    'name' => (string) ($input['page_name'] ?? 'Home'),
                    'slug' => (string) ($input['page_slug'] ?? 'home'),
                    'is_homepage' => (bool) ($input['is_homepage'] ?? true),
                    'sections' => $decoded['sections'],
                ]];
                $hasPages = true;
            }
            if ($hasPages) {
                $assembled = $this->assembleDecodedSite($decoded);
                $pages = $assembled['pages'];
                $report = $assembled['report'];
                if ($assembled['theme'] !== []) {
                    $theme = $assembled['theme'] + $theme;
                }
                if ($action === 'reply') {
                    $action = count($pages) > 1 ? 'apply_site' : 'replace_page';
                }
            }
        }

        if ($pages === [] && ($action === 'insert_blocks' || $hasType || ($hasSections && ! $hasPages))) {
            $block = $this->assembleBlock($raw, [
                'type' => is_string($decoded['type'] ?? null) ? $decoded['type'] : null,
            ]);
            $sections = $block['sections'];
            $report = $block['report'];
            if ($action === 'reply') {
                $action = 'insert_blocks';
            }
        }

        if ($pages === [] && $sections === [] && $theme === [] && $message === '') {
            throw AiException::invalidOutput();
        }

        if ($message === '') {
            $message = match ($action) {
                'apply_site' => 'I generated a multi-page site from your brief.',
                'replace_page' => 'I updated the current page.',
                'create_page' => 'I drafted a new page.',
                'insert_blocks' => 'I drafted block(s) to insert on this page.',
                'update_theme' => 'I updated the theme.',
                default => 'How would you like to change the site?',
            };
        }

        if ($theme !== [] && $pages === [] && $sections === [] && $action === 'reply') {
            $action = 'update_theme';
        }

        $matched = $this->matchSiteDesign($site, $pages, $sections, $liveSections, $direction['kit'] ?? null);
        $pages = $matched['pages'];
        $sections = $matched['sections'];

        // The palette chosen for the brief, where the model did not name one of
        // its own. A blank site has no theme worth keeping, so this is the first
        // thing that gives it a look.
        if ($direction !== null && $direction['theme'] !== []) {
            $theme = $theme + $direction['theme'];
        }

        $result = [
            'action' => $action,
            'message' => mb_substr($message, 0, 600),
            'pages' => $pages,
            'sections' => $sections,
            'theme' => $theme,
            'report' => $report,
        ];

        $emit('ready', 'Generation is ready to render on the canvas.', [
            'action' => $action,
            'pages' => count($pages),
            'sections' => count($sections),
            'code' => 'render(pages, { live: true });',
            'progress' => 88,
        ]);

        return $result;
    }

    /**
     * Rewrites the words on the page the user is looking at, and nothing else.
     *
     * Chat's other answers hand back sections the model composed, which is what
     * lets "rewrite the content" arrive as a differently-built page. This route
     * never asks for sections: it sends the copy the live blocks declare and
     * puts the replies back into those same blocks, so the template the
     * customer chose survives by construction.
     *
     * @param  array<string, mixed>  $input
     * @param  list<array<string, mixed>>|null  $liveSections
     * @return array<string, mixed>
     */
    private function rewriteCurrentPageCopy(
        Site $site,
        array $input,
        ?array $liveSections,
        callable $emit,
        string $message = '',
    ): array {
        $sections = is_array($liveSections) ? array_values($liveSections) : [];
        if ($sections === []) {
            throw AiException::invalidOutput('There is nothing on this page to rewrite yet. Add some blocks first.');
        }

        $emit('generating', 'Rewriting the copy in the blocks already on this page.', [
            'code' => 'const slots = collectCopy(page.sections);',
            'progress' => 34,
        ]);

        // Chat states the request in `messages`; the copy prompt reads `prompt`.
        // Without this the rewrite never sees what was asked for and writes
        // generic copy off the site name alone.
        if (empty($input['prompt'])) {
            $input['prompt'] = $this->lastUserMessage($input);
        }

        $result = $this->generateTemplateCopy($site, $sections, $input);

        $emit('validating', 'Checking the new copy against the live block catalog.', [
            'code' => 'validate(sections, blockCatalog);',
            'progress' => 74,
        ]);

        if ($result['report']['rewritten'] === 0) {
            throw AiException::invalidOutput('The AI did not return any usable copy. Try again.');
        }

        $report = $result['report'];
        if ($message === '') {
            $message = 'I rewrote the copy on this page and left the layout exactly as it was.';
        }

        $emit('ready', 'Generation is ready to render on the canvas.', [
            'action' => 'rewrite_copy',
            'pages' => 0,
            'sections' => count($result['sections']),
            'code' => 'render(sections, { live: true });',
            'progress' => 88,
        ]);

        return [
            'action' => 'rewrite_copy',
            'message' => mb_substr($message, 0, 600),
            'pages' => [],
            'sections' => $result['sections'],
            'theme' => [],
            'report' => [
                'sections' => count($result['sections']),
                'dropped_types' => [],
                'dropped_props' => [],
                'pages' => 0,
                'slots' => $report['slots'],
                'rewritten' => $report['rewritten'],
            ],
        ];
    }

    /**
     * The most recent thing the person actually asked for.
     *
     * @param  array<string, mixed>  $input
     */
    private function lastUserMessage(array $input): string
    {
        $messages = is_array($input['messages'] ?? null) ? $input['messages'] : [];

        foreach (array_reverse($messages) as $message) {
            if (! is_array($message) || ($message['role'] ?? '') !== 'user') {
                continue;
            }
            $text = trim((string) ($message['content'] ?? ''));
            if ($text !== '') {
                return $text;
            }
        }

        return '';
    }

    /**
     * @param  array<string, mixed>  $decoded
     */
    private function normaliseChatAction(array $decoded): string
    {
        $action = strtolower(trim((string) ($decoded['action'] ?? $decoded['intent'] ?? 'reply')));
        $aliases = [
            'site' => 'apply_site',
            'generate_site' => 'apply_site',
            'page' => 'replace_page',
            // "revise" used to mean replace_page, which is why asking to revise
            // the wording rebuilt the page. Revising is a copy edit unless the
            // model explicitly asks to replace the page.
            'revise' => 'rewrite_copy',
            'rewrite' => 'rewrite_copy',
            'copy' => 'rewrite_copy',
            'content' => 'rewrite_copy',
            'rewrite_content' => 'rewrite_copy',
            'new_page' => 'create_page',
            'add_page' => 'create_page',
            'block' => 'insert_blocks',
            'blocks' => 'insert_blocks',
            'theme' => 'update_theme',
            'none' => 'reply',
            'ask' => 'reply',
        ];
        $action = $aliases[$action] ?? $action;
        $allowed = ['apply_site', 'replace_page', 'rewrite_copy', 'create_page', 'insert_blocks', 'update_theme', 'reply'];

        return in_array($action, $allowed, true) ? $action : 'reply';
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array{text: string}
     */
    public function rewrite(array $input): array
    {
        $raw = $this->complete(
            $this->prompts->rewriteSystemPrompt(),
            $this->prompts->rewritePrompt($input),
            ['max_tokens' => 1200],
        );

        $decoded = AiJson::object($raw);
        $text = is_string($decoded['text'] ?? null) ? $decoded['text'] : null;

        // Some models answer with the bare rewritten string.
        if ($text === null && $decoded === null && trim($raw) !== '') {
            $text = trim($raw);
        }

        if ($text === null || trim($text) === '') {
            throw AiException::invalidOutput('The AI did not return any rewritten text. Try again.');
        }

        // Reuse the section sanitiser so rewritten copy can never carry markup.
        $sanitised = $this->validate([
            'schemaVersion' => 1,
            'sections' => [[
                'id' => 'rewrite',
                'type' => 'content.text',
                'version' => 1,
                'hidden' => false,
                'props' => ['heading' => $text],
            ]],
        ]);

        return ['text' => (string) ($sanitised['sections'][0]['props']['heading'] ?? $text)];
    }

    /**
     * @return array{content: array<string, mixed>, pages: list<array<string, mixed>>, theme: array<string, mixed>, report: array<string, mixed>}
     */
    private function assembleSite(string $raw): array
    {
        $decoded = AiJson::object($raw);
        if ($decoded === null) {
            throw AiException::invalidOutput();
        }

        return $this->assembleDecodedSite($decoded);
    }

    /**
     * @param  array<string, mixed>  $decoded
     * @return array{content: array<string, mixed>, pages: list<array<string, mixed>>, theme: array<string, mixed>, report: array<string, mixed>}
     */
    private function assembleDecodedSite(array $decoded): array
    {
        $drafts = AiGeneratedSite::finalizePages(AiGeneratedSite::extractRawPages($decoded));
        ['pages' => $pages, 'report' => $report] = $this->repair->repairPages($drafts);
        $pages = AiGeneratedSite::shareChrome($pages);

        $validated = [];
        foreach ($pages as $page) {
            $content = $this->validate($page['content']);
            if ($content['sections'] === []) {
                continue;
            }
            $validated[] = [
                'name' => $page['name'],
                'slug' => $page['slug'],
                'is_homepage' => (bool) $page['is_homepage'],
                'content' => $content,
            ];
        }

        $validated = AiGeneratedSite::finalizePages($validated);

        if ($validated === []) {
            throw AiException::invalidOutput(
                'The AI response did not contain any usable blocks. Try again with a more specific prompt.'
            );
        }

        $home = $validated[0];
        foreach ($validated as $page) {
            if (! empty($page['is_homepage'])) {
                $home = $page;
                break;
            }
        }

        $report['pages'] = count($validated);

        return [
            'content' => $home['content'],
            'pages' => $validated,
            'theme' => AiGeneratedSite::sanitizeTheme($decoded['theme'] ?? $decoded['theme_tokens'] ?? null),
            'report' => $report,
        ];
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array{section: array<string, mixed>, sections: list<array<string, mixed>>, report: array<string, mixed>}
     */
    private function assembleBlock(string $raw, array $input): array
    {
        $decoded = AiJson::object($raw);
        if ($decoded === null) {
            throw AiException::invalidOutput();
        }

        $requested = is_string($input['type'] ?? null) ? $input['type'] : null;
        $rawSections = is_array($decoded['sections'] ?? null) ? $decoded['sections'] : null;

        if ($requested === null && is_array($rawSections) && count($rawSections) > 1) {
            ['content' => $content, 'report' => $report] = $this->repair->repairContent(['sections' => array_slice($rawSections, 0, 4)]);
            if ($content['sections'] === []) {
                throw AiException::invalidOutput('The AI picked a block type that does not exist. Try again, or choose the block type yourself.');
            }
            $validated = $this->validate($content);

            return [
                'section' => $validated['sections'][0],
                'sections' => $validated['sections'],
                'report' => $report,
            ];
        }

        if (! isset($decoded['type']) && is_array($rawSections)) {
            $first = $rawSections[0] ?? null;
            $decoded = is_array($first) ? $first : $decoded;
        }

        ['section' => $section, 'report' => $report] = $this->repair->repairOne($decoded, $requested);

        if ($section === null) {
            throw AiException::invalidOutput('The AI picked a block type that does not exist. Try again, or choose the block type yourself.');
        }

        $validated = $this->validate(['schemaVersion' => 1, 'sections' => [$section]]);

        return [
            'section' => $validated['sections'][0],
            'sections' => [$validated['sections'][0]],
            'report' => $report,
        ];
    }

    /**
     * @param  array<string, mixed>  $options
     */
    private function complete(string $system, string $prompt, array $options = []): string
    {
        $config = $this->config();
        $this->allowLongRunning($config->timeout);

        if ($this->heartbeat !== null) {
            $options['on_progress'] = $this->heartbeat;
        }

        try {
            return $this->factory->make($config)->complete($system, $prompt, $options + ['json' => true]);
        } catch (AiProviderException $exception) {
            throw AiException::providerError(AiErrorMessage::scrub($exception->getMessage()));
        }
    }

    /**
     * Multi-page generations often exceed PHP's default 30s. Match (and exceed)
     * the HTTP client timeout so the process is not killed while waiting on the model.
     */
    private function allowLongRunning(int $timeoutSeconds): void
    {
        // Under FPM the limit is per request. On the CLI it is a timer on the
        // whole process, so raising it here for one generation would instead cap
        // everything that runs afterwards - a queue worker, or a test suite,
        // dying part-way through some unrelated job 240 seconds later.
        if (app()->runningInConsole()) {
            ignore_user_abort(true);

            return;
        }

        $seconds = max(240, $timeoutSeconds + 60);
        if (function_exists('set_time_limit')) {
            @set_time_limit($seconds);
        }
        @ini_set('max_execution_time', (string) $seconds);
        ignore_user_abort(true);
    }

    /**
     * Enforces the admin switches before any request leaves the server.
     */
    public function config(): AiConfig
    {
        $config = $this->settings->config();

        if (! $config->enabled) {
            throw AiException::disabled();
        }

        if (! $config->configured()) {
            throw AiException::notConfigured();
        }

        return $config;
    }

    /**
     * @param  array<string, mixed>  $content
     * @return array<string, mixed>
     */
    private function validate(array $content): array
    {
        try {
            return $this->validator->validate($content);
        } catch (InvalidArgumentException $exception) {
            // Repair should make this unreachable; never surface a 500 for it.
            throw AiException::invalidOutput('The AI response failed schema validation: '.$exception->getMessage());
        }
    }
}
