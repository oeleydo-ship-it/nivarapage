<?php

namespace App\Services\Funnels;

use App\Models\Funnel;
use App\Models\FunnelDailyStat;
use App\Models\FunnelDailyVisitor;
use App\Models\FunnelEvent;
use App\Models\FunnelLead;
use App\Models\FunnelSession;
use App\Support\CurrentWorkspace;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;

class FunnelAnalyticsService
{
    public function __construct(private readonly CurrentWorkspace $workspace) {}

    /** @param array<string, mixed> $filters @return array<string, mixed> */
    public function overview(?Funnel $funnel = null, int $days = 30, array $filters = []): array
    {
        $workspaceId = (int) $this->workspace->id();
        $days = max(1, min($days, 365));
        $since = CarbonImmutable::now()->subDays($days - 1)->startOfDay();
        $stats = $this->filtered(FunnelDailyStat::query()->where('workspace_id', $workspaceId)->where('date', '>=', $since->toDateString()), $funnel, $filters);
        $dailyVisitors = $this->filtered(FunnelDailyVisitor::query()->where('workspace_id', $workspaceId)->where('date', '>=', $since->toDateString()), $funnel, $filters);
        $totals = (clone $stats)->selectRaw('COALESCE(SUM(views),0) as views, COALESCE(SUM(sessions),0) as sessions, COALESCE(SUM(leads),0) as leads, COALESCE(SUM(conversions),0) as conversions, COALESCE(SUM(orders),0) as orders, COALESCE(SUM(bookings),0) as bookings, COALESCE(SUM(checkout_starts),0) as checkout_starts, COALESCE(SUM(revenue),0) as revenue')->first();
        $unique = (clone $dailyVisitors)->distinct('visitor_id')->count('visitor_id');
        $orders = (int) ($totals->orders ?? 0);
        $revenue = (float) ($totals->revenue ?? 0);
        $conversions = (int) ($totals->conversions ?? 0);

        $daily = (clone $stats)->selectRaw('date, SUM(views) as views, SUM(sessions) as sessions, SUM(leads) as leads, SUM(conversions) as conversions, SUM(revenue) as revenue')->groupBy('date')->orderBy('date')->get();
        $dailyUnique = (clone $dailyVisitors)->selectRaw('date, COUNT(DISTINCT visitor_id) as unique_visitors')->groupBy('date')->pluck('unique_visitors', 'date');
        $daily = $daily->map(fn ($row) => ['date' => (string) $row->date, 'views' => (int) $row->views, 'visitors' => (int) ($dailyUnique[(string) $row->date] ?? 0), 'sessions' => (int) $row->sessions, 'leads' => (int) $row->leads, 'conversions' => (int) $row->conversions, 'revenue' => (float) $row->revenue])->values();
        $steps = $funnel ? $this->steps($funnel, $since, $filters) : [];

        return [
            'range_days' => $days, 'visitors' => (int) ($totals->views ?? 0), 'unique_visitors' => $unique,
            'sessions' => (int) ($totals->sessions ?? 0), 'leads' => (int) ($totals->leads ?? 0), 'conversions' => $conversions,
            'conversion_rate' => $unique ? round($conversions / $unique * 100, 2) : 0,
            'orders' => $orders, 'bookings' => (int) ($totals->bookings ?? 0), 'checkout_starts' => (int) ($totals->checkout_starts ?? 0),
            'abandoned_checkouts' => max(0, (int) ($totals->checkout_starts ?? 0) - $orders), 'revenue' => $revenue,
            'average_order_value' => $orders ? round($revenue / $orders, 2) : 0, 'revenue_per_visitor' => $unique ? round($revenue / $unique, 2) : 0,
            'daily' => $daily, 'steps' => $steps,
            'biggest_drop_off' => collect($steps)->sortByDesc('drop_off_rate')->first(),
            'sources' => $this->dimension($stats, $dailyVisitors, 'source'), 'campaigns' => $this->dimension($stats, $dailyVisitors, 'campaign'),
            'devices' => $this->dimension($stats, $dailyVisitors, 'device'), 'countries' => $this->dimension($stats, $dailyVisitors, 'country'),
            'attribution' => $this->attribution($workspaceId, $funnel, $since), 'realtime' => $this->realtime($workspaceId, $funnel), 'filters' => $filters,
        ];
    }

    /** @param array<string, mixed> $filters */
    private function filtered(Builder $query, ?Funnel $funnel, array $filters): Builder
    {
        if ($funnel) $query->where('funnel_id', $funnel->id);
        if (! $funnel && ! empty($filters['funnel_id'])) $query->where('funnel_id', (int) $filters['funnel_id']);
        if (! empty($filters['domain_id'])) {
            $ids = Funnel::query()->where('workspace_id', $this->workspace->id())->where('domain_id', (int) $filters['domain_id'])->pluck('id');
            $query->whereIn('funnel_id', $ids);
        }
        foreach (['source', 'campaign', 'device', 'country'] as $key) if (filled($filters[$key] ?? null)) $query->where($key, $filters[$key]);
        return $query;
    }

    /** @param array<string, mixed> $filters @return list<array<string, mixed>> */
    private function steps(Funnel $funnel, CarbonImmutable $since, array $filters): array
    {
        $rows = $funnel->steps()->get()->map(function ($step) use ($funnel, $since, $filters) {
            $visitors = $this->filtered(FunnelDailyVisitor::query()->where('workspace_id', $funnel->workspace_id)->where('funnel_id', $funnel->id)->where('step_id', $step->id)->where('date', '>=', $since->toDateString()), $funnel, $filters)->distinct('visitor_id')->count('visitor_id');
            $stats = $this->filtered(FunnelDailyStat::query()->where('workspace_id', $funnel->workspace_id)->where('funnel_id', $funnel->id)->where('step_id', $step->id)->where('date', '>=', $since->toDateString()), $funnel, $filters)->selectRaw('COALESCE(SUM(views),0) views, COALESCE(SUM(conversions),0) conversions, COALESCE(SUM(revenue),0) revenue')->first();
            $timings = FunnelEvent::query()->where('funnel_id', $funnel->id)->where('step_id', $step->id)->where('occurred_at', '>=', $since)->where('is_bot', false)->whereNotNull('session_id')->selectRaw('session_id, MIN(occurred_at) first_at, MAX(occurred_at) last_at')->groupBy('session_id')->get();
            $averageSeconds = $timings->isEmpty() ? 0 : (int) round($timings->avg(fn ($row) => CarbonImmutable::parse($row->first_at)->diffInSeconds(CarbonImmutable::parse($row->last_at))));
            return ['step_id' => $step->id, 'name' => $step->name, 'position' => $step->position, 'views' => (int) ($stats->views ?? 0), 'unique_views' => $visitors, 'conversions' => (int) ($stats->conversions ?? 0), 'conversion_rate' => $visitors ? round((int) $stats->conversions / $visitors * 100, 2) : 0, 'drop_off_rate' => 0, 'revenue' => (float) ($stats->revenue ?? 0), 'average_time_seconds' => $averageSeconds];
        })->sortBy('position')->values();
        return $rows->map(function ($row, $index) use ($rows) { $next = $rows->get($index + 1); $row['drop_off_rate'] = $next && $row['unique_views'] > 0 ? round(max(0, 1 - ($next['unique_views'] / $row['unique_views'])) * 100, 2) : 0; return $row; })->all();
    }

    /** @return list<array<string, mixed>> */
    private function dimension(Builder $stats, Builder $visitors, string $column): array
    {
        $rows = (clone $stats)->selectRaw("{$column} as label, SUM(sessions) sessions, SUM(leads) leads, SUM(conversions) conversions, SUM(revenue) revenue")->groupBy($column)->orderByDesc('sessions')->limit(12)->get()->keyBy('label');
        $unique = (clone $visitors)->selectRaw("{$column} as label, COUNT(DISTINCT visitor_id) visitors")->groupBy($column)->pluck('visitors', 'label');
        return $rows->map(fn ($row, $label) => ['label' => (string) $label, 'visitors' => (int) ($unique[$label] ?? 0), 'sessions' => (int) $row->sessions, 'leads' => (int) $row->leads, 'conversions' => (int) $row->conversions, 'revenue' => (float) $row->revenue])->values()->all();
    }

    /** @return array<string, mixed> */
    private function attribution(int $workspaceId, ?Funnel $funnel, CarbonImmutable $since): array
    {
        $purchases = FunnelEvent::query()->where('funnel_events.workspace_id', $workspaceId)->where('event_type', 'purchase')->where('occurred_at', '>=', $since)->where('is_bot', false);
        if ($funnel) $purchases->where('funnel_events.funnel_id', $funnel->id);
        $last = (clone $purchases)->selectRaw("COALESCE(source, 'direct') label, SUM(revenue) revenue")->groupBy('source')->orderByDesc('revenue')->get();
        $first = (clone $purchases)->join('funnel_visitors', 'funnel_visitors.id', '=', 'funnel_events.visitor_id')->selectRaw("COALESCE(funnel_visitors.first_source, 'direct') label, SUM(funnel_events.revenue) revenue")->groupBy('funnel_visitors.first_source')->orderByDesc('revenue')->get();
        return ['first_touch' => $first, 'last_touch' => $last];
    }

    /** @return array<string, mixed> */
    private function realtime(int $workspaceId, ?Funnel $funnel): array
    {
        $sessions = FunnelSession::query()->where('workspace_id', $workspaceId)->where('last_activity_at', '>=', now()->subMinutes(5))->where('is_bot', false);
        $events = FunnelEvent::query()->where('workspace_id', $workspaceId)->where('occurred_at', '>=', today())->where('is_bot', false);
        $leads = FunnelLead::query()->where('workspace_id', $workspaceId)->with(['funnel:id,name', 'step:id,name'])->latest()->limit(5);
        if ($funnel) { $sessions->where('funnel_id', $funnel->id); $events->where('funnel_id', $funnel->id); $leads->where('funnel_id', $funnel->id); }
        return ['visitors_online' => (clone $sessions)->distinct('visitor_id')->count('visitor_id'), 'active_sessions' => $sessions->count(), 'conversions_today' => (clone $events)->whereIn('event_type', ['conversion', 'purchase', 'booking', 'form_submission', 'lead_created'])->count(), 'revenue_today' => (float) (clone $events)->where('event_type', 'purchase')->sum('revenue'), 'recent_leads' => $leads->get(), 'recent_purchases' => (clone $events)->where('event_type', 'purchase')->latest('occurred_at')->limit(5)->get(['id', 'funnel_id', 'step_id', 'revenue', 'currency', 'source', 'occurred_at'])];
    }
}
