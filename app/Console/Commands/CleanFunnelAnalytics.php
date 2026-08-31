<?php

namespace App\Console\Commands;

use App\Models\FunnelEvent;
use App\Models\FunnelSession;
use App\Services\FeatureService;
use App\Services\PlatformSettingsService;
use Illuminate\Console\Command;

class CleanFunnelAnalytics extends Command
{
    protected $signature = 'funnels:retention {--events=} {--sessions=}';
    protected $description = 'Apply funnel raw-event and anonymous-session retention without deleting aggregates';

    public function handle(FeatureService $features, PlatformSettingsService $settings): int
    {
        if (! $features->enabled('funnels')) return self::SUCCESS;
        $configured = $settings->all();
        $eventDays = (int) ($this->option('events') ?: $configured['funnel_events_retention_days']);
        $sessionDays = (int) ($this->option('sessions') ?: $configured['funnel_sessions_retention_days']);
        FunnelEvent::query()->where('occurred_at', '<', now()->subDays(max(7, $eventDays)))->delete();
        FunnelSession::query()->where('last_activity_at', '<', now()->subDays(max(7, $sessionDays)))->delete();
        return self::SUCCESS;
    }
}
