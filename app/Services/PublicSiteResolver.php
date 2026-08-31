<?php

namespace App\Services;

use App\Models\Domain;
use App\Models\Site;
use App\Support\Hostname;

class PublicSiteResolver
{
    public function __construct(private readonly TenantCacheService $cache) {}

    public function normalizeHost(string $host): string
    {
        return Hostname::normalize($host);
    }

    public function resolve(string $host): ?Site
    {
        $host = $this->normalizeHost($host);
        if ($host === '' || ! Hostname::isValid($host)) {
            return null;
        }

        $cached = $this->cache->getSiteIdForHost($host);
        if ($cached === 0 || $cached === 'miss') {
            return null;
        }

        if (is_numeric($cached) && (int) $cached > 0) {
            $site = Site::query()->find((int) $cached);
            if ($site) {
                return $site;
            }
        }

        $domain = $this->findActiveDomain($host);

        if (! $domain) {
            $this->cache->rememberDomain($host, 0);

            return null;
        }

        $this->cache->rememberDomain($host, $domain->site_id);

        return $domain->site;
    }

    /**
     * Exact hostname first. If the request is {slug}.{current platform domain}
     * and that row is missing (platform domain changed after the site was
     * created), fall back to an active platform subdomain with the same slug.
     */
    private function findActiveDomain(string $host): ?Domain
    {
        $exact = Domain::query()
            ->where('hostname', $host)
            ->where('status', 'active')
            ->first();

        if ($exact) {
            return $exact;
        }

        $platform = app(PlatformSettingsService::class)->platformDomain();
        $suffix = $platform !== '' ? '.'.$platform : '';
        if ($suffix === '' || ! str_ends_with($host, $suffix)) {
            return null;
        }

        $slug = substr($host, 0, -strlen($suffix));
        if ($slug === '' || str_contains($slug, '.')) {
            return null;
        }

        return Domain::query()
            ->where('type', 'subdomain')
            ->where('status', 'active')
            ->where('hostname', 'like', $slug.'.%')
            ->orderBy('id')
            ->first();
    }
}
