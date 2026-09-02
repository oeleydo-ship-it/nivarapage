<?php

namespace App\Services;

use App\Models\Domain;
use App\Models\PlatformSetting;
use App\Support\Hostname;
use Illuminate\Support\Facades\Cache;

class PlatformSettingsService
{
    public const KEYS = ['platform_name', 'platform_tagline', 'support_email', 'platform_domain', 'features.funnels', 'funnels.raw_event_retention_days', 'funnels.session_retention_days'];

    /**
     * Apex used for tenant subdomains: {name}.{platform_domain}.
     */
    public function platformDomain(): string
    {
        $stored = PlatformSetting::query()->where('key', 'platform_domain')->value('value');
        $fallback = (string) config('uidesired.platform_domain', 'sites.localhost');
        $value = Hostname::normalize(trim((string) ($stored ?: $fallback)));

        return $value !== '' ? $value : Hostname::normalize($fallback);
    }

    /**
     * @return array<string, mixed>
     */
    public function all(): array
    {
        $stored = PlatformSetting::query()->pluck('value', 'key');

        return [
            'platform_name' => (string) ($stored->get('platform_name') ?: 'My Website Builder'),
            'platform_tagline' => (string) ($stored['platform_tagline'] ?? 'Website builder'),
            'support_email' => (string) ($stored['support_email'] ?? ''),
            'platform_domain' => $this->platformDomain(),
            'funnels_enabled' => filter_var($stored['features.funnels'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'funnel_events_retention_days' => (int) ($stored['funnels.raw_event_retention_days'] ?? 90),
            'funnel_sessions_retention_days' => (int) ($stored['funnels.session_retention_days'] ?? 180),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function update(array $data): array
    {
        foreach (self::KEYS as $key) {
            if (! array_key_exists($key, $data)) {
                continue;
            }

            if ($key === 'platform_domain') {
                $previous = $this->platformDomain();
                $normalized = Hostname::normalize((string) $data[$key]);
                if ($normalized === '') {
                    PlatformSetting::query()->where('key', $key)->delete();
                    $this->rewriteSubdomainHostnames($previous, $this->platformDomain());
                    continue;
                }
                PlatformSetting::query()->updateOrCreate(['key' => $key], ['value' => $normalized]);
                $this->rewriteSubdomainHostnames($previous, $normalized);
                continue;
            }

            $value = $key === 'features.funnels' ? ($data[$key] ? '1' : '0') : (is_string($data[$key]) ? $data[$key] : (string) $data[$key]);
            PlatformSetting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value],
            );
            if ($key === 'features.funnels') {
                app(FeatureService::class)->forget('funnels');
            }
        }

        return $this->all();
    }

    private function rewriteSubdomainHostnames(string $from, string $to): void
    {
        $from = Hostname::normalize($from);
        $to = Hostname::normalize($to);
        if ($from === '' || $to === '' || $from === $to) {
            return;
        }

        $suffix = '.'.$from;
        $cache = app(TenantCacheService::class);

        Domain::query()
            ->where('type', 'subdomain')
            ->where('hostname', 'like', '%'.$suffix)
            ->get()
            ->each(function (Domain $domain) use ($suffix, $to, $cache): void {
                if (! str_ends_with($domain->hostname, $suffix)) {
                    return;
                }

                $slug = substr($domain->hostname, 0, -strlen($suffix));
                $next = $slug.'.'.$to;
                if (Domain::query()->where('hostname', $next)->whereKeyNot($domain->id)->exists()) {
                    return;
                }

                $previous = $domain->hostname;
                $domain->hostname = $next;
                $domain->save();

                Cache::forget($cache->domainKey($previous));
                Cache::forget($cache->resolveKey($previous));
                $cache->invalidateDomain($domain);
            });
    }
}
