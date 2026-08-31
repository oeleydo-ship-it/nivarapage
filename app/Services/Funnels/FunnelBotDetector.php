<?php

namespace App\Services\Funnels;

class FunnelBotDetector
{
    public function isLikelyBot(?string $userAgent): bool
    {
        $agent = strtolower(trim((string) $userAgent));
        if ($agent === '') return true;

        foreach (['bot', 'crawler', 'spider', 'slurp', 'headlesschrome', 'lighthouse', 'preview', 'facebookexternalhit', 'uptimerobot', 'monitoring'] as $needle) {
            if (str_contains($agent, $needle)) return true;
        }

        return false;
    }
}
