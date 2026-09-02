<?php

namespace App\Services\Ai;

use App\Models\Page;
use App\Models\Site;
use App\Support\BlockCatalog;

/**
 * Works out which template kit a site is already built from, so anything the
 * AI adds looks like it belongs.
 *
 * Block types are `purpose.family` (`hero.cinder`, `navbar.voltera`), so the
 * family is the suffix. Generic shapes such as `hero.centered` share that form
 * but are not kits, so only suffixes with enough blocks to dress a whole page
 * count.
 */
class SiteKitProfile
{
    /** A suffix needs at least this many blocks to be a kit rather than a shape. */
    public const MIN_KIT_BLOCKS = 6;

    /**
     * Design props that are page-wide conventions rather than per-section
     * choices. Mirrors the editor's own inheritance list, so a block the AI
     * writes matches one the user drags in.
     *
     * @var list<string>
     */
    public const DESIGN_PROPS = [
        'animation',
        'animationTrigger',
        'animationDuration',
        'contentWidth',
        'headingFont',
        'bodyFont',
        'headingWeight',
        'bodyWeight',
        'eyebrowStyle',
    ];

    /**
     * Every family large enough to count as a kit.
     *
     * @return array<string, list<string>> suffix => block types
     */
    public function kits(): array
    {
        $families = [];
        foreach (BlockCatalog::types() as $type) {
            if (! str_contains($type, '.')) {
                continue;
            }
            [$purpose, $family] = explode('.', $type, 2);
            if ($purpose === 'generated') {
                continue;
            }
            $families[$family][] = $type;
        }

        return array_filter($families, fn (array $types) => count($types) >= self::MIN_KIT_BLOCKS);
    }

    /**
     * Every kit, described well enough for the AI to choose one for a new site.
     *
     * The purposes are the part of a type before the dot, so they say what a kit
     * can actually build - a kit with no pricing block is the wrong home for a
     * pricing page. Sending this instead of the full catalogue keeps the choice
     * small: all 368 blocks with their props run to about 75,000 characters,
     * while one kit's blocks are nearer 5,000.
     *
     * @return list<array{key: string, label: string, blocks: int, purposes: list<string>}>
     */
    public function catalogue(): array
    {
        $out = [];

        foreach ($this->kits() as $key => $types) {
            $purposes = [];
            foreach ($types as $type) {
                $purposes[explode('.', $type, 2)[0]] = true;
            }
            ksort($purposes);

            $out[] = [
                'key' => $key,
                'label' => ucfirst($key),
                'blocks' => count($types),
                'purposes' => array_keys($purposes),
            ];
        }

        usort($out, fn (array $a, array $b) => $b['blocks'] <=> $a['blocks']);

        return $out;
    }

    /**
     * One kit by key, shaped like detect() so callers cannot tell the two apart.
     *
     * @param  array<string, mixed>  $design
     * @return array{key: string, label: string, types: list<string>, design: array<string, mixed>}|null
     */
    public function kit(string $key, array $design = []): ?array
    {
        $kits = $this->kits();
        $key = strtolower(trim($key));

        if (! isset($kits[$key])) {
            return null;
        }

        return [
            'key' => $key,
            'label' => ucfirst($key),
            'types' => $kits[$key],
            'design' => $design,
        ];
    }

    /**
     * The kit this site is built from, or null when it is not using one.
     *
     * @param  list<array<string, mixed>>|null  $sections  live editor content, preferred over the saved pages
     * @return array{key: string, label: string, types: list<string>, design: array<string, mixed>}|null
     */
    public function detect(Site $site, ?array $sections = null): ?array
    {
        $sections = $sections ?? $this->siteSections($site);
        if ($sections === []) {
            return null;
        }

        $kits = $this->kits();
        $counts = [];
        foreach ($sections as $section) {
            $type = is_array($section) ? (string) ($section['type'] ?? '') : '';
            if (! str_contains($type, '.')) {
                continue;
            }
            $family = explode('.', $type, 2)[1];
            if (isset($kits[$family])) {
                $counts[$family] = ($counts[$family] ?? 0) + 1;
            }
        }

        if ($counts === []) {
            return null;
        }

        arsort($counts);
        $key = (string) array_key_first($counts);

        return [
            'key' => $key,
            'label' => ucfirst($key),
            'types' => $kits[$key],
            'design' => $this->designFrom($sections),
        ];
    }

    /**
     * The design props this page uses consistently, so new sections can adopt
     * them. Only values a clear majority agree on are returned, so one oddly
     * styled section never becomes the convention.
     *
     * @param  list<array<string, mixed>>  $sections
     * @return array<string, mixed>
     */
    public function designFrom(array $sections): array
    {
        $body = array_values(array_filter(
            $sections,
            fn ($section) => is_array($section)
                && ! preg_match('/^(navbar|topbar|subnav|footer)\./', (string) ($section['type'] ?? '')),
        ));

        if (count($body) < 2) {
            return [];
        }

        $profile = [];
        foreach (self::DESIGN_PROPS as $prop) {
            $tally = [];
            $defined = 0;
            foreach ($body as $section) {
                $value = $section['props'][$prop] ?? null;
                if ($value === null || $value === '') {
                    continue;
                }
                $defined++;
                $id = json_encode($value);
                $tally[$id] = ['value' => $value, 'count' => ($tally[$id]['count'] ?? 0) + 1];
            }

            if ($defined < 2) {
                continue;
            }

            uasort($tally, fn ($a, $b) => $b['count'] <=> $a['count']);
            $winner = reset($tally);
            if ($winner && $winner['count'] / $defined >= 0.6) {
                $profile[$prop] = $winner['value'];
            }
        }

        return $profile;
    }

    /**
     * Fills in the kit's design conventions on sections that left them out.
     *
     * The prompt asks the model for these, but a model that forgets should not
     * produce a section that looks foreign, so they are enforced here too.
     *
     * @param  list<array<string, mixed>>  $sections
     * @param  array<string, mixed>  $design
     * @return list<array<string, mixed>>
     */
    public function applyDesign(array $sections, array $design, bool $overwrite = false): array
    {
        if ($design === []) {
            return $sections;
        }

        foreach ($sections as $index => $section) {
            if (! is_array($section)) {
                continue;
            }
            $props = is_array($section['props'] ?? null) ? $section['props'] : [];
            foreach ($design as $prop => $value) {
                // Matching an existing page fills gaps only, so a section that
                // was styled deliberately keeps its styling. Art direction for a
                // new site is the deliberate choice, and has to beat the block
                // defaults it is being merged onto.
                $missing = ! array_key_exists($prop, $props) || $props[$prop] === '' || $props[$prop] === null;
                if ($overwrite || $missing) {
                    $props[$prop] = $value;
                }
            }
            $sections[$index]['props'] = $props;
        }

        return $sections;
    }

    /**
     * Every section across the site's pages, newest draft content first.
     *
     * @return list<array<string, mixed>>
     */
    private function siteSections(Site $site): array
    {
        $site->loadMissing('pages.draftRevision');
        $sections = [];

        foreach ($site->pages as $page) {
            foreach ($this->pageSections($page) as $section) {
                $sections[] = $section;
            }
        }

        return $sections;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function pageSections(Page $page): array
    {
        $content = $page->draftRevision?->content_json;
        $sections = is_array($content['sections'] ?? null) ? $content['sections'] : [];

        return array_values(array_filter($sections, 'is_array'));
    }
}
