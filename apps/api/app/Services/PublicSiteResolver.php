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

        $domain = Domain::query()
            ->where('hostname', $host)
            ->where('status', 'active')
            ->first();

        if (! $domain) {
            $this->cache->rememberDomain($host, 0);

            return null;
        }

        $this->cache->rememberDomain($host, $domain->site_id);

        return $domain->site;
    }
}
