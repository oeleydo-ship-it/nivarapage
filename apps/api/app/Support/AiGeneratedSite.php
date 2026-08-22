<?php

namespace App\Support;

use App\Services\SiteService;
use Illuminate\Support\Str;

/**
 * Normalises multi-page AI output: slugs, a single homepage, shared chrome, and theme tokens.
 */
class AiGeneratedSite
{
    public static function maxPages(): int
    {
        return max(1, (int) config('ai.max_pages', 5));
    }

    /**
     * @param  array<string, mixed>  $decoded
     * @return list<array{name: string, slug: string, is_homepage: bool, sections: mixed}>
     */
    public static function extractRawPages(array $decoded): array
    {
        $pages = $decoded['pages'] ?? null;
        if (! is_array($pages) || $pages === []) {
            $name = is_string($decoded['name'] ?? null) && trim($decoded['name']) !== ''
                ? trim($decoded['name'])
                : 'Home';

            return [[
                'name' => $name,
                'slug' => 'home',
                'is_homepage' => true,
                'sections' => $decoded['sections'] ?? $decoded['blocks'] ?? [],
            ]];
        }

        $out = [];
        foreach (array_slice($pages, 0, self::maxPages()) as $page) {
            if (! is_array($page)) {
                continue;
            }

            $nested = is_array($page['content'] ?? null) ? $page['content'] : [];
            $sections = $page['sections'] ?? $page['blocks'] ?? $nested['sections'] ?? [];
            $name = trim((string) ($page['name'] ?? $page['title'] ?? ''));

            $out[] = [
                'name' => $name,
                'slug' => (string) ($page['slug'] ?? ''),
                'is_homepage' => (bool) ($page['is_homepage'] ?? $page['homepage'] ?? false),
                'sections' => $sections,
            ];
        }

        return $out;
    }

    /**
     * @param  list<array<string, mixed>>  $pages
     * @return list<array<string, mixed>>
     */
    public static function finalizePages(array $pages): array
    {
        if ($pages === []) {
            return [];
        }

        $used = [];
        $hasHome = false;

        foreach ($pages as $i => $page) {
            $name = trim((string) ($page['name'] ?? ''));
            $slug = Str::slug((string) ($page['slug'] ?? '')) ?: Str::slug($name) ?: 'page';
            $slug = self::uniqueSlug($slug, $used);
            $used[] = $slug;

            $isHome = (bool) ($page['is_homepage'] ?? false);
            if ($isHome && $hasHome) {
                $isHome = false;
            }
            if ($isHome) {
                $hasHome = true;
            }

            $pages[$i]['name'] = $name !== '' ? mb_substr($name, 0, 80) : ($isHome ? 'Home' : Str::title(str_replace('-', ' ', $slug)));
            $pages[$i]['slug'] = $slug;
            $pages[$i]['is_homepage'] = $isHome;
        }

        if (! $hasHome) {
            $homeIndex = 0;
            foreach ($pages as $i => $page) {
                if (($page['slug'] ?? '') === 'home') {
                    $homeIndex = $i;
                    break;
                }
            }
            $pages[$homeIndex]['is_homepage'] = true;
            if (trim((string) $pages[$homeIndex]['name']) === '') {
                $pages[$homeIndex]['name'] = 'Home';
            }
        }

        return $pages;
    }

    /**
     * Copy homepage navbar + footer onto inner pages that are missing them.
     *
     * @param  list<array<string, mixed>>  $pages
     * @return list<array<string, mixed>>
     */
    public static function shareChrome(array $pages): array
    {
        $home = null;
        foreach ($pages as $page) {
            if (! empty($page['is_homepage'])) {
                $home = $page;
                break;
            }
        }
        $home ??= $pages[0] ?? null;
        if ($home === null) {
            return $pages;
        }

        $homeSections = is_array($home['content']['sections'] ?? null) ? $home['content']['sections'] : [];
        $nav = self::firstOfCategory($homeSections, 'navbar');
        $footer = self::lastOfCategory($homeSections, 'footer');

        foreach ($pages as $i => $page) {
            $sections = is_array($page['content']['sections'] ?? null) ? $page['content']['sections'] : [];
            if ($nav !== null && self::firstOfCategory($sections, 'navbar') === null) {
                array_unshift($sections, self::cloneSection($nav));
            }
            if ($footer !== null && self::lastOfCategory($sections, 'footer') === null) {
                $sections[] = self::cloneSection($footer);
            }
            $pages[$i]['content']['sections'] = $sections;
            $pages[$i]['content']['schemaVersion'] = 1;
        }

        return $pages;
    }

    /**
     * @param  mixed  $raw
     * @return array<string, mixed>
     */
    public static function sanitizeTheme(mixed $raw): array
    {
        if (! is_array($raw)) {
            return [];
        }

        $defaults = SiteService::defaultThemeTokens();
        $clean = [];

        foreach ($defaults as $key => $fallback) {
            if (! array_key_exists($key, $raw)) {
                continue;
            }
            $value = $raw[$key];
            if (in_array($key, ['headingWeight', 'bodyWeight'], true)) {
                if (is_numeric($value)) {
                    $clean[$key] = max(100, min(900, (int) $value));
                }
                continue;
            }
            if (! is_scalar($value)) {
                continue;
            }
            $text = trim((string) $value);
            if ($text === '') {
                continue;
            }
            if (in_array($key, ['primary', 'secondary', 'accent', 'background', 'surface', 'text', 'muted'], true)) {
                if (preg_match('/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/', $text) !== 1) {
                    continue;
                }
            }
            $clean[$key] = mb_substr($text, 0, 120);
        }

        return $clean;
    }

    /**
     * @param  list<array<string, mixed>>  $sections
     * @return array<string, mixed>|null
     */
    private static function firstOfCategory(array $sections, string $prefix): ?array
    {
        foreach ($sections as $section) {
            if (is_array($section) && self::isCategory($section, $prefix)) {
                return $section;
            }
        }

        return null;
    }

    /**
     * @param  list<array<string, mixed>>  $sections
     * @return array<string, mixed>|null
     */
    private static function lastOfCategory(array $sections, string $prefix): ?array
    {
        $found = null;
        foreach ($sections as $section) {
            if (is_array($section) && self::isCategory($section, $prefix)) {
                $found = $section;
            }
        }

        return $found;
    }

    /**
     * @param  array<string, mixed>  $section
     */
    private static function isCategory(array $section, string $prefix): bool
    {
        $type = (string) ($section['type'] ?? '');

        return $type === $prefix
            || str_starts_with($type, $prefix.'.')
            || ($prefix === 'navbar' && $type === 'generated.nav')
            || ($prefix === 'footer' && $type === 'generated.footer');
    }

    /**
     * @param  array<string, mixed>  $section
     * @return array<string, mixed>
     */
    public static function cloneSection(array $section): array
    {
        $clone = $section;
        $clone['id'] = (string) Str::uuid();

        return $clone;
    }

    /**
     * @param  list<string>  $used
     */
    private static function uniqueSlug(string $slug, array $used): string
    {
        $base = $slug !== '' ? $slug : 'page';
        $candidate = $base;
        $i = 2;
        while (in_array($candidate, $used, true)) {
            $candidate = $base.'-'.$i;
            $i++;
        }

        return $candidate;
    }
}
