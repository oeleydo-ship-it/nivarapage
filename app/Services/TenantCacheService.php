<?php

namespace App\Services;

use App\Models\Domain;
use App\Models\Site;
use DateTimeInterface;
use Illuminate\Support\Facades\Cache;

/**
 * Public-site cache. Production should use CACHE_STORE=redis.
 *
 * Keys:
 *   tenant:domain:{host}                      → site id (0 = unknown host)
 *   published:host:{host}:resolve             → resolve JSON
 *   published:site:{id}:settings|theme|nav|sitemap
 *   published:site:{id}:page:{slug}           → current published page JSON
 *   published:site:{id}:page:{slug}:v{n}      → versioned copy (spec)
 *
 * Never used for dashboard, editor, authenticated API, or preview.
 */
class TenantCacheService
{
    public function ttl(): DateTimeInterface
    {
        return now()->addSeconds((int) config('uidesired.cache.ttl', 86400));
    }

    public function domainKey(string $host): string
    {
        return 'tenant:domain:'.$host;
    }

    public function resolveKey(string $host): string
    {
        return 'published:host:'.$host.':resolve';
    }

    public function currentPageKey(int $siteId, string $slug): string
    {
        return 'published:site:'.$siteId.':page:'.$this->normalizeSlug($slug);
    }

    public function pageKey(int $siteId, string $slug, int $version): string
    {
        return 'published:site:'.$siteId.':page:'.$this->normalizeSlug($slug).':v'.$version;
    }

    public function themeKey(int $siteId): string
    {
        return 'published:site:'.$siteId.':theme';
    }

    public function navKey(int $siteId): string
    {
        return 'published:site:'.$siteId.':nav';
    }

    public function settingsKey(int $siteId): string
    {
        return 'published:site:'.$siteId.':settings';
    }

    public function sitemapKey(int $siteId): string
    {
        return 'published:site:'.$siteId.':sitemap';
    }

    public function blogKey(int $siteId): string
    {
        return 'published:site:'.$siteId.':blog';
    }

    public function blogPostKey(int $siteId, string $slug): string
    {
        return 'published:site:'.$siteId.':blog:'.$this->normalizeSlug($slug);
    }

    public function remember(string $key, callable $callback): mixed
    {
        return Cache::remember($key, $this->ttl(), $callback);
    }

    public function put(string $key, mixed $value): void
    {
        Cache::put($key, $value, $this->ttl());
    }

    public function rememberDomain(string $host, ?int $siteId): void
    {
        $ttl = ($siteId === null || (int) $siteId === 0)
            ? now()->addSeconds(30)
            : $this->ttl();

        Cache::put($this->domainKey($host), $siteId ?? 0, $ttl);
    }

    public function getSiteIdForHost(string $host): mixed
    {
        return Cache::get($this->domainKey($host));
    }

    public function invalidateSite(Site $site): void
    {
        $site->loadMissing(['domains', 'pages.publishedRevision', 'theme', 'settings', 'menus.items', 'blogPosts']);

        foreach ($site->domains as $domain) {
            Cache::forget($this->domainKey($domain->hostname));
            Cache::forget($this->resolveKey($domain->hostname));
        }

        foreach ($site->pages as $page) {
            $slug = $this->normalizeSlug((string) $page->slug);
            Cache::forget($this->currentPageKey($site->id, $slug));
            if ($page->is_homepage) {
                Cache::forget($this->currentPageKey($site->id, 'home'));
            }

            $version = (int) ($page->publishedRevision?->version_number ?? 0);
            for ($offset = 0; $offset <= 3; $offset++) {
                $candidate = $version - $offset;
                if ($candidate < 0) {
                    break;
                }
                Cache::forget($this->pageKey($site->id, $slug, $candidate));
                if ($page->is_homepage) {
                    Cache::forget($this->pageKey($site->id, 'home', $candidate));
                }
            }
        }

        Cache::forget($this->themeKey($site->id));
        Cache::forget($this->navKey($site->id));
        Cache::forget($this->settingsKey($site->id));
        Cache::forget($this->sitemapKey($site->id));
        Cache::forget($this->blogKey($site->id));
        foreach ($site->blogPosts as $post) {
            Cache::forget($this->blogPostKey($site->id, (string) $post->slug));
        }
    }

    public function invalidateDomain(Domain $domain): void
    {
        Cache::forget($this->domainKey($domain->hostname));
        Cache::forget($this->resolveKey($domain->hostname));
        if ($domain->site) {
            $this->invalidateSite($domain->site);
        }
    }

    public function normalizeSlug(string $slug): string
    {
        $slug = trim($slug, '/');

        return $slug === '' ? 'home' : $slug;
    }
}
