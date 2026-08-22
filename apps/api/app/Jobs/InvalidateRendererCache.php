<?php

namespace App\Jobs;

use App\Models\Site;
use App\Services\Cloudflare\CloudflareCacheService;
use App\Services\TenantCacheService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;

class InvalidateRendererCache implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $siteId)
    {
        $this->onQueue('publishing');
    }

    public function handle(TenantCacheService $cache, CloudflareCacheService $cdn): void
    {
        $site = Site::query()->with('domains')->find($this->siteId);
        if (! $site) {
            return;
        }

        $cache->invalidateSite($site);
        $hosts = $site->domains->pluck('hostname')->filter()->values()->all();

        $url = rtrim((string) config('uidesired.renderer_url'), '/');
        if ($url !== '' && ! app()->environment('testing')) {
            try {
                $request = Http::timeout(3)->acceptJson();
                $secret = (string) config('uidesired.internal_renderer_secret');
                if ($secret !== '') {
                    $request = $request->withHeaders(['X-Internal-Secret' => $secret]);
                }
                $request->post($url.'/api/cache/invalidate', [
                    'site_id' => $site->id,
                    'hosts' => $hosts,
                ]);
            } catch (\Throwable) {
                // Renderer cache invalidation is best-effort.
            }
        }

        $cdn->purgeHosts($hosts);
    }
}
