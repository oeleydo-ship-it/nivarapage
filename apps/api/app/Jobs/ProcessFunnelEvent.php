<?php

namespace App\Jobs;

use App\Models\FunnelDailyStat;
use App\Models\FunnelDailyVisitor;
use App\Models\FunnelEvent;
use App\Services\FeatureService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class ProcessFunnelEvent implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    public function __construct(public int $eventId)
    {
        $this->onQueue('analytics');
    }

    public function handle(FeatureService $features): void
    {
        if (! $features->enabled('funnels')) {
            return;
        }

        DB::transaction(function () {
            $event = FunnelEvent::query()->lockForUpdate()->find($this->eventId);
            if (! $event || $event->processed_at) {
                return;
            }
            if ($event->is_bot) {
                $event->update(['processed_at' => now()]);

                return;
            }

            $dimensions = [
                'date' => $event->occurred_at->toDateString(),
                'workspace_id' => $event->workspace_id,
                'funnel_id' => $event->funnel_id,
                'step_id' => $event->step_id ?: 0,
                'source' => $event->source ?: 'direct',
                'campaign' => $event->campaign ?: '(none)',
                'device' => $event->device ?: 'unknown',
                'country' => $event->country ?: 'unknown',
            ];

            $stat = $this->dailyStat($dimensions);
            $view = in_array($event->event_type, ['page_view', 'step_view'], true);
            if ($view) {
                $stat->increment('views');
                if ($event->visitor_id) {
                    $unique = $this->dailyVisitor($dimensions + ['visitor_id' => $event->visitor_id]);
                    if ($unique->wasRecentlyCreated) {
                        $stat->increment('unique_visitors');
                    }
                }
            }

            $firstSessionEvent = $event->session_id && ! FunnelEvent::query()
                ->where('session_id', $event->session_id)
                ->where('id', '<', $event->id)
                ->where('is_bot', false)
                ->exists();
            if ($firstSessionEvent) {
                $stat->increment('sessions');
            }

            $conversion = in_array($event->event_type, ['conversion', 'purchase', 'booking', 'form_submission', 'lead_created'], true);
            if ($conversion) {
                $stat->increment('conversions');
            }
            if (in_array($event->event_type, ['form_submission', 'lead_created'], true)) {
                $firstLeadEvent = ! $event->lead_id || ! FunnelEvent::query()
                    ->where('lead_id', $event->lead_id)
                    ->where('id', '<', $event->id)
                    ->exists();
                if ($firstLeadEvent) {
                    $stat->increment('leads');
                }
            }
            if ($event->event_type === 'purchase') {
                $stat->increment('orders');
                if ((float) $event->revenue !== 0.0) {
                    $stat->increment('revenue', (float) $event->revenue);
                }
            }
            if ($event->event_type === 'booking') {
                $stat->increment('bookings');
            }
            if ($event->event_type === 'checkout_started') {
                $stat->increment('checkout_starts');
            }

            $event->update(['processed_at' => now()]);
        }, 3);
    }

    /**
     * @param  array<string, mixed>  $dimensions
     */
    private function dailyStat(array $dimensions): FunnelDailyStat
    {
        $date = $dimensions['date'];
        $query = FunnelDailyStat::query()
            ->whereDate('date', $date)
            ->where('workspace_id', $dimensions['workspace_id'])
            ->where('funnel_id', $dimensions['funnel_id'])
            ->where('step_id', $dimensions['step_id'])
            ->where('source', $dimensions['source'])
            ->where('campaign', $dimensions['campaign'])
            ->where('device', $dimensions['device'])
            ->where('country', $dimensions['country'])
            ->lockForUpdate();

        $stat = $query->first();
        if ($stat) {
            return $stat;
        }

        try {
            return FunnelDailyStat::query()->create($dimensions);
        } catch (UniqueConstraintViolationException) {
            return FunnelDailyStat::query()
                ->whereDate('date', $date)
                ->where('workspace_id', $dimensions['workspace_id'])
                ->where('funnel_id', $dimensions['funnel_id'])
                ->where('step_id', $dimensions['step_id'])
                ->where('source', $dimensions['source'])
                ->where('campaign', $dimensions['campaign'])
                ->where('device', $dimensions['device'])
                ->where('country', $dimensions['country'])
                ->lockForUpdate()
                ->firstOrFail();
        }
    }

    /**
     * @param  array<string, mixed>  $dimensions
     */
    private function dailyVisitor(array $dimensions): FunnelDailyVisitor
    {
        $date = $dimensions['date'];
        $query = FunnelDailyVisitor::query()
            ->whereDate('date', $date)
            ->where('workspace_id', $dimensions['workspace_id'])
            ->where('funnel_id', $dimensions['funnel_id'])
            ->where('step_id', $dimensions['step_id'])
            ->where('visitor_id', $dimensions['visitor_id'])
            ->where('source', $dimensions['source'])
            ->where('campaign', $dimensions['campaign'])
            ->where('device', $dimensions['device'])
            ->where('country', $dimensions['country'])
            ->lockForUpdate();

        $row = $query->first();
        if ($row) {
            return $row;
        }

        try {
            return FunnelDailyVisitor::query()->create($dimensions);
        } catch (UniqueConstraintViolationException) {
            return FunnelDailyVisitor::query()
                ->whereDate('date', $date)
                ->where('workspace_id', $dimensions['workspace_id'])
                ->where('funnel_id', $dimensions['funnel_id'])
                ->where('step_id', $dimensions['step_id'])
                ->where('visitor_id', $dimensions['visitor_id'])
                ->where('source', $dimensions['source'])
                ->where('campaign', $dimensions['campaign'])
                ->where('device', $dimensions['device'])
                ->where('country', $dimensions['country'])
                ->lockForUpdate()
                ->firstOrFail();
        }
    }
}
