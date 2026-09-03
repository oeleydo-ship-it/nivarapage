<?php

namespace App\Services;

use App\Models\Page;
use App\Models\Site;
use App\Models\SiteSetting;
use App\Models\User;
use App\Support\PageSchemaValidator;
use InvalidArgumentException;

/**
 * The header and footer a site shows on every page.
 *
 * Both are section arrays in exactly the shape a page's content takes, so the
 * same validator guards them, the same blocks render them, and the builder can
 * edit them with the canvas it already has. Composition happens at render time
 * rather than by copying the sections into each page, so changing the header
 * changes every page at once and no page can drift out of step.
 */
class SiteChromeService
{
    public function __construct(
        private readonly PageSchemaValidator $validator,
        private readonly TenantCacheService $cache,
        private readonly AuditService $audit,
        private readonly PageService $pages,
    ) {}

    /**
     * @return array{header: array<string, mixed>, footer: array<string, mixed>}
     */
    public function get(Site $site): array
    {
        $settings = $site->settings;

        return [
            'header' => $this->normalize($settings?->header_json),
            'footer' => $this->normalize($settings?->footer_json),
        ];
    }

    /**
     * Only the keys present are written, so saving a header cannot blank a
     * footer the caller never sent.
     *
     * @param  array<string, mixed>  $data
     * @return array{header: array<string, mixed>, footer: array<string, mixed>}
     */
    public function update(Site $site, array $data): array
    {
        $settings = $site->settings ?: SiteSetting::query()->create(['site_id' => $site->id]);
        $attributes = [];

        foreach (['header', 'footer'] as $slot) {
            if (! array_key_exists($slot, $data)) {
                continue;
            }
            if ($data[$slot] === null) {
                $attributes[$slot.'_json'] = null;

                continue;
            }

            $content = is_array($data[$slot]) ? $data[$slot] : [];
            // Request validation only returns the keys it has rules for, and the
            // shared page validator refuses content without a schemaVersion.
            $content['schemaVersion'] ??= 1;
            $content['sections'] ??= [];

            $attributes[$slot.'_json'] = $this->validator->validate($content);
        }

        if ($attributes !== []) {
            $settings->update($attributes);
            $site->setRelation('settings', $settings->fresh());
            // Every page embeds this, so the whole site's cached payloads go.
            $this->cache->invalidateSite($site);
            $this->audit->log('site.chrome_updated', $site, [
                'slots' => array_keys($attributes),
            ], $site->workspace);
        }

        return $this->get($site->fresh('settings'));
    }

    /**
     * The families that count as a header or a footer.
     *
     * Mirrors isNav/isFooter in the renderer. If the two ever disagree, a page
     * would have its navbar taken away here and no shared header put back
     * there, so they are kept deliberately identical.
     */
    private const NAV_FAMILIES = ['navbar', 'nav', 'header'];

    private const FOOTER_FAMILIES = ['footer'];

    /**
     * Takes one page's header (or footer) and makes it the whole site's.
     *
     * A site built from a template carries a navbar on every page, and the
     * renderer leaves those alone: a page with its own navbar keeps it, because
     * putting the shared one above it would render two. So the pages never
     * share anything and editing one changes only that page. This is the step
     * that fixes that - the section is lifted into the site chrome and removed
     * from every page, after which one edit reaches all of them.
     *
     * Pages are written as drafts, so this is undoable from History and shows
     * up on the site only when it is next published.
     *
     * @return array{chrome: array{header: array<string, mixed>, footer: array<string, mixed>}, adopted: int, pages: int}
     */
    public function adopt(Site $site, string $slot, User $user, ?Page $source = null): array
    {
        $families = $slot === 'footer' ? self::FOOTER_FAMILIES : self::NAV_FAMILIES;
        $site->loadMissing('pages.draftRevision');

        $source ??= $site->pages->firstWhere('is_homepage', true) ?? $site->pages->first();
        if (! $source) {
            throw new InvalidArgumentException('This site has no pages to take a '.$slot.' from.');
        }

        $adopted = array_values(array_filter(
            $this->sectionsOf($source),
            fn (array $section) => $this->inFamily($section, $families),
        ));

        if ($adopted === []) {
            throw new InvalidArgumentException('That page has no '.$slot.' block to share.');
        }

        // The shared copy is written first: if stripping the pages failed
        // halfway, every page would be left with no header at all.
        $this->update($site, [$slot => ['schemaVersion' => 1, 'sections' => $adopted]]);

        $changed = 0;
        foreach ($site->pages as $page) {
            $sections = $this->sectionsOf($page);
            $kept = array_values(array_filter(
                $sections,
                fn (array $section) => ! $this->inFamily($section, $families),
            ));

            if (count($kept) === count($sections)) {
                continue;
            }

            $this->pages->saveDraft($page, $user, ['schemaVersion' => 1, 'sections' => $kept]);
            $changed++;
        }

        $this->cache->invalidateSite($site->fresh(['domains', 'pages.publishedRevision']));
        $this->audit->log('site.chrome_adopted', $site, [
            'slot' => $slot,
            'source_page_id' => $source->id,
            'sections' => count($adopted),
            'pages_cleared' => $changed,
        ], $site->workspace, $user);

        return [
            'chrome' => $this->get($site->fresh('settings')),
            'adopted' => count($adopted),
            'pages' => $changed,
        ];
    }

    /**
     * @param  list<string>  $families
     * @param  array<string, mixed>  $section
     */
    private function inFamily(array $section, array $families): bool
    {
        $type = is_string($section['type'] ?? null) ? $section['type'] : '';

        return in_array(explode('.', $type)[0], $families, true);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function sectionsOf(Page $page): array
    {
        $content = $page->draftRevision?->content_json ?? [];
        $sections = is_array($content['sections'] ?? null) ? $content['sections'] : [];

        return array_values(array_filter($sections, 'is_array'));
    }

    /**
     * Content is stored in a page's shape, and an empty slot reads as an empty
     * section list rather than null so callers never have to special-case it.
     *
     * @return array<string, mixed>
     */
    private function normalize(mixed $content): array
    {
        if (! is_array($content) || ! isset($content['sections']) || ! is_array($content['sections'])) {
            return ['schemaVersion' => 1, 'sections' => []];
        }

        return $content;
    }
}
