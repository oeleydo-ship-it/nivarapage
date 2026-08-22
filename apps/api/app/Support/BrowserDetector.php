<?php

namespace App\Support;

class BrowserDetector
{
    /**
     * @return array{browser:string,os:string,device:string}
     */
    public static function fromUserAgent(?string $ua): array
    {
        $ua = trim((string) $ua);
        if ($ua === '') {
            return ['browser' => 'Unknown', 'os' => 'Unknown', 'device' => 'desktop'];
        }

        $os = 'Unknown';
        if (str_contains($ua, 'Windows')) {
            $os = 'Windows';
        } elseif (str_contains($ua, 'Mac OS X') || str_contains($ua, 'Macintosh')) {
            $os = 'macOS';
        } elseif (str_contains($ua, 'Android')) {
            $os = 'Android';
        } elseif (str_contains($ua, 'iPhone') || str_contains($ua, 'iPad') || str_contains($ua, 'iOS')) {
            $os = 'iOS';
        } elseif (str_contains($ua, 'Linux')) {
            $os = 'Linux';
        } elseif (str_contains($ua, 'CrOS')) {
            $os = 'ChromeOS';
        }

        $browser = 'Unknown';
        if (str_contains($ua, 'Edg/')) {
            $browser = 'Edge';
        } elseif (str_contains($ua, 'OPR/') || str_contains($ua, 'Opera')) {
            $browser = 'Opera';
        } elseif (str_contains($ua, 'Chrome/') && ! str_contains($ua, 'Edg/')) {
            $browser = 'Chrome';
        } elseif (str_contains($ua, 'Safari/') && ! str_contains($ua, 'Chrome/')) {
            $browser = 'Safari';
        } elseif (str_contains($ua, 'Firefox/')) {
            $browser = 'Firefox';
        }

        $device = 'desktop';
        if (preg_match('/Mobile|Android.*Mobile|iPhone|iPod/i', $ua)) {
            $device = 'mobile';
        } elseif (preg_match('/iPad|Tablet|Android(?!.*Mobile)/i', $ua)) {
            $device = 'tablet';
        }

        return compact('browser', 'os', 'device');
    }

    /**
     * @return array{country:?string,region:?string,city:?string}
     */
    public static function locationFromRequest(\Illuminate\Http\Request $request, array $input = []): array
    {
        $country = $request->headers->get('CF-IPCountry')
            ?: $request->headers->get('X-Country-Code')
            ?: ($input['country'] ?? null);
        if (is_string($country) && strtoupper($country) === 'XX') {
            $country = null;
        }

        return [
            'country' => self::clip($country),
            'region' => self::clip($input['region'] ?? $input['state'] ?? null),
            'city' => self::clip($input['city'] ?? null),
        ];
    }

    private static function clip(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }
        $value = trim($value);

        return $value === '' ? null : mb_substr($value, 0, 80);
    }
}
