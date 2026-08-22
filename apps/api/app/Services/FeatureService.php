<?php

namespace App\Services;

use App\Models\PlatformSetting;
use Illuminate\Support\Facades\Cache;

class FeatureService
{
    public function enabled(string $key): bool
    {
        return Cache::remember("feature:{$key}", 60, function () use ($key) {
            $value = PlatformSetting::query()->whereKey("features.{$key}")->value('value');

            return $value === null ? $key === 'funnels' : filter_var($value, FILTER_VALIDATE_BOOLEAN);
        });
    }

    /** @return array<string, bool> */
    public function all(): array
    {
        return ['funnels' => $this->enabled('funnels')];
    }

    public function forget(string $key): void
    {
        Cache::forget("feature:{$key}");
    }
}
