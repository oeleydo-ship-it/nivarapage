<?php

namespace App\Services;

use App\Models\PlatformSetting;

class PlatformSettingsService
{
    public const KEYS = ['platform_name', 'platform_tagline', 'support_email', 'features.funnels', 'funnels.raw_event_retention_days', 'funnels.session_retention_days'];

    /**
     * @return array{platform_name: string, support_email: string}
     */
    public function all(): array
    {
        $stored = PlatformSetting::query()->pluck('value', 'key');

        return [
            'platform_name' => (string) ($stored['platform_name'] ?? config('app.name', 'UiDesired')),
            'platform_tagline' => (string) ($stored['platform_tagline'] ?? 'Website builder'),
            'support_email' => (string) ($stored['support_email'] ?? ''),
            'funnels_enabled' => filter_var($stored['features.funnels'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'funnel_events_retention_days' => (int) ($stored['funnels.raw_event_retention_days'] ?? 90),
            'funnel_sessions_retention_days' => (int) ($stored['funnels.session_retention_days'] ?? 180),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array{platform_name: string, support_email: string}
     */
    public function update(array $data): array
    {
        foreach (self::KEYS as $key) {
            if (! array_key_exists($key, $data)) {
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
}
