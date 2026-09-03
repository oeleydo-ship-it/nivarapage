<?php

namespace App\Jobs;

use App\Models\FunnelAutomationRun;
use App\Services\FeatureService;
use App\Services\Funnels\FunnelAutomationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/**
 * Carries out one booked automation.
 *
 * The waiting is the queue's job: a rule that fires an hour later is simply a
 * job released an hour later, so nothing has to poll and nothing is lost if the
 * worker restarts in between.
 */
class RunFunnelAutomation implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 60;

    public function __construct(public int $runId)
    {
        $this->onQueue('automations');
    }

    public function handle(FeatureService $features, FunnelAutomationService $automations): void
    {
        $run = FunnelAutomationRun::query()->with('automation.funnel')->find($this->runId);
        if (! $run || $run->ran_at) {
            return;
        }

        // Switching the module off must stop it doing things, not just hide it.
        if (! $features->enabled('funnels')) {
            $run->update(['status' => 'skipped', 'detail' => 'Funnels are switched off.', 'ran_at' => now()]);

            return;
        }

        $automations->run($run);
    }
}
