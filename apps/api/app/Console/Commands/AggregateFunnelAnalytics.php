<?php

namespace App\Console\Commands;

use App\Jobs\ProcessFunnelEvent;
use App\Models\FunnelEvent;
use App\Services\FeatureService;
use Illuminate\Console\Command;

class AggregateFunnelAnalytics extends Command
{
    protected $signature = 'funnels:aggregate {--limit=1000}';
    protected $description = 'Queue unprocessed funnel events for idempotent analytics aggregation';

    public function handle(FeatureService $features): int
    {
        if (! $features->enabled('funnels')) return self::SUCCESS;
        FunnelEvent::query()->whereNull('processed_at')->orderBy('id')->limit((int) $this->option('limit'))->pluck('id')
            ->each(fn ($id) => ProcessFunnelEvent::dispatch((int) $id));
        return self::SUCCESS;
    }
}
