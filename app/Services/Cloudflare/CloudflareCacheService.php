<?php

namespace App\Services\Cloudflare;

/**
 * Best-effort CDN purge. Publish must not fail if Cloudflare is unreachable.
 */
class CloudflareCacheService
{
    public function __construct(private readonly CloudflareClient $client) {}

    /**
     * @param  list<string>  $hosts
     */
    public function purgeHosts(array $hosts): void
    {
        $hosts = array_values(array_unique(array_filter($hosts)));
        if ($hosts === []) {
            return;
        }

        $token = (string) config('services.cloudflare.api_token');
        $zone = $this->client->zoneId();
        if ($token === '' || $zone === '' || app()->environment('testing')) {
            return;
        }

        try {
            $this->client->purgeHosts($hosts);
        } catch (\Throwable) {
            // CDN invalidation is best-effort.
        }
    }
}
