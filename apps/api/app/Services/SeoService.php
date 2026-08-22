<?php

namespace App\Services;

use App\Models\Page;
use App\Models\Site;
use App\Services\BlogService;
use App\Services\FormService;

class SeoService
{
    public const SITE_ROBOTS = ['index', 'noindex', 'none'];

    public function __construct(
        private readonly FormService $forms,
        private readonly BlogService $blog,
    ) {}

    public function origin(Site $site): string
    {
        $site->loadMissing(['domains', 'settings']);
        $primary = $site->domains->firstWhere('is_primary', true) ?? $site->domains->first();
        $host = strtolower((string) ($primary?->hostname ?? ''));
        $local = $host === 'localhost'
            || str_ends_with($host, '.localhost')
            || str_starts_with($host, '127.');

        return ($local ? 'http' : 'https').'://'.$host;
    }

    public function path(Page $page): string
    {
        if ($page->is_homepage || $page->slug === '' || $page->slug === 'home') {
            return '/';
        }

        return '/'.ltrim((string) $page->slug, '/');
    }

    public function canonical(Site $site, Page $page): string
    {
        $explicit = trim((string) $page->canonical_url);
        if ($explicit !== '') {
            if (preg_match('#^https?://#i', $explicit) === 1) {
                return $explicit;
            }

            return rtrim($this->origin($site), '/').'/'.ltrim($explicit, '/');
        }

        $path = $this->path($page);

        return rtrim($this->origin($site), '/').($path === '/' ? '/' : $path);
    }

    public function siteAllowsIndexing(Site $site): bool
    {
        $robots = $site->settings?->robots ?: 'index';

        return ! in_array($robots, ['noindex', 'none'], true);
    }

    public function pageAllowsIndexing(Site $site, Page $page): bool
    {
        return $this->siteAllowsIndexing($site) && $page->robots_index !== false;
    }

    /**
     * @return array{index: bool, follow: bool}
     */
    public function robotsMeta(Site $site, ?Page $page = null): array
    {
        $siteRobots = $site->settings?->robots ?: 'index';
        if ($siteRobots === 'none') {
            return ['index' => false, 'follow' => false];
        }
        if ($siteRobots === 'noindex') {
            return ['index' => false, 'follow' => true];
        }
        if ($page && $page->robots_index === false) {
            return ['index' => false, 'follow' => true];
        }

        return ['index' => true, 'follow' => true];
    }

    /**
     * @return array<string, mixed>
     */
    public function publicPage(Page $page): array
    {
        $page->loadMissing(['site.domains', 'site.settings', 'publishedRevision']);
        $site = $page->site;
        $ogImage = $page->og_image ?: $page->seo_image ?: $site?->settings?->social_image;

        return [
            'id' => $page->id,
            'name' => $page->name,
            'slug' => $page->slug,
            'is_homepage' => $page->is_homepage,
            'seo_title' => $page->seo_title,
            'seo_description' => $page->seo_description,
            'seo_image' => $page->seo_image,
            'canonical_url' => $page->canonical_url,
            'canonical' => $site ? $this->canonical($site, $page) : null,
            'og_title' => $page->og_title ?: $page->seo_title ?: $page->name,
            'og_description' => $page->og_description ?: $page->seo_description ?: $site?->settings?->default_description,
            'og_image' => $ogImage,
            'robots_index' => $site ? $this->pageAllowsIndexing($site, $page) : false,
            'robots' => $site ? $this->robotsMeta($site, $page) : ['index' => false, 'follow' => false],
            'content' => $this->boundPublicContent($page),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function boundPublicContent(Page $page): ?array
    {
        $content = $page->publishedRevision?->content_json;
        if (! is_array($content) || ! $page->site) {
            return is_array($content) ? $content : null;
        }

        $content = $this->forms->bindContent($page->site, $content);

        return $this->blog->hydratePageContent($page->site, $content, $page);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function sitemap(Site $site): array
    {
        $site->loadMissing(['domains', 'settings']);
        if (! $this->siteAllowsIndexing($site)) {
            return [];
        }

        $pages = $site->pages()
            ->whereDoesntHave('funnelSteps')
            ->whereNotNull('published_revision_id')
            ->where('status', 'published')
            ->where('robots_index', true)
            ->orderByDesc('is_homepage')
            ->orderBy('slug')
            ->get()
            ->map(fn (Page $page) => [
                'slug' => $page->slug,
                'is_homepage' => $page->is_homepage,
                'path' => $this->path($page),
                'loc' => $this->canonical($site, $page),
                'lastmod' => $page->updated_at?->toAtomString(),
            ]);

        $prefix = $this->blog->indexPath($site);
        $posts = $site->blogPosts()
            ->live()
            ->get()
            ->map(fn ($post) => [
                'slug' => ltrim($prefix, '/').'/'.$post->slug,
                'is_homepage' => false,
                'path' => $prefix.'/'.$post->slug,
                'loc' => rtrim($this->origin($site), '/').$prefix.'/'.$post->slug,
                'lastmod' => ($post->published_at ?? $post->updated_at)?->toAtomString(),
            ]);

        return $pages->concat($posts)->values()->all();
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function sanitizeSiteSettings(array $data): array
    {
        foreach (['default_description', 'favicon', 'social_image', 'locale', 'timezone'] as $key) {
            if (array_key_exists($key, $data) && is_string($data[$key])) {
                $data[$key] = $this->plain($data[$key], $key === 'default_description' ? 320 : 2048);
            }
        }
        if (isset($data['robots'])) {
            $robots = is_string($data['robots']) ? $data['robots'] : 'index';
            $data['robots'] = in_array($robots, self::SITE_ROBOTS, true) ? $robots : 'index';
        }

        return $data;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function sanitizePageSeo(array $data): array
    {
        foreach (['seo_title', 'og_title'] as $key) {
            if (array_key_exists($key, $data) && is_string($data[$key])) {
                $data[$key] = $this->plain($data[$key], 70) ?: null;
            }
        }
        foreach (['seo_description', 'og_description'] as $key) {
            if (array_key_exists($key, $data) && is_string($data[$key])) {
                $data[$key] = $this->plain($data[$key], 320) ?: null;
            }
        }
        foreach (['seo_image', 'og_image', 'canonical_url'] as $key) {
            if (array_key_exists($key, $data) && is_string($data[$key])) {
                $data[$key] = $this->plain($data[$key], 2048) ?: null;
            }
        }

        return $data;
    }

    private function plain(string $value, int $max): string
    {
        $clean = trim(html_entity_decode(strip_tags($value), ENT_QUOTES | ENT_HTML5, 'UTF-8'));

        return mb_substr($clean, 0, $max);
    }
}
