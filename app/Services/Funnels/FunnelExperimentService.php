<?php

namespace App\Services\Funnels;

use App\Models\FunnelEvent;
use App\Models\FunnelStep;
use App\Models\FunnelStepVariant;
use Illuminate\Support\Str;

/**
 * Splitting traffic across versions of a funnel step, and reading the result.
 *
 * The step's own content is the control. Variants are alternatives to it, and
 * a visitor is put in one bucket and kept there: somebody who sees a different
 * page on every visit tells you nothing about either version, and their
 * conversion cannot honestly be credited to one of them.
 */
class FunnelExperimentService
{
    /** Events that mean the visitor did the thing the step was for. */
    private const CONVERSIONS = ['conversion', 'purchase', 'booking', 'form_submission', 'lead_created'];

    /**
     * Every version a visitor could be given, control first.
     *
     * A variant that has been paused, or lost to a winner, is not in here - it
     * is kept for its history rather than kept in the running.
     *
     * @return list<array{key: string, id: int|null, weight: int}>
     */
    public function pool(FunnelStep $step): array
    {
        $variants = $step->variants()->where('status', 'active')->orderBy('id')->get();

        // A step with a declared winner is not an experiment any more.
        $winner = $step->variants()->where('status', 'winner')->first();
        if ($winner) {
            return [['key' => $winner->key, 'id' => $winner->id, 'weight' => 1]];
        }
        if ($variants->isEmpty()) {
            return [['key' => FunnelStepVariant::CONTROL, 'id' => null, 'weight' => 1]];
        }

        $pool = [['key' => FunnelStepVariant::CONTROL, 'id' => null, 'weight' => 1]];
        foreach ($variants as $variant) {
            $pool[] = ['key' => $variant->key, 'id' => $variant->id, 'weight' => max(1, $variant->weight)];
        }

        return $pool;
    }

    /**
     * Which version this visitor gets.
     *
     * Derived from the visitor's own id rather than a coin toss, so the same
     * person lands in the same bucket on every request without anything having
     * to be stored, and a lost cookie does not quietly reassign them.
     *
     * @param  list<array{key: string, id: int|null, weight: int}>  $pool
     * @return array{key: string, id: int|null, weight: int}
     */
    public function assign(array $pool, string $visitorKey): array
    {
        if (count($pool) === 1) {
            return $pool[0];
        }

        $total = array_sum(array_column($pool, 'weight'));
        if ($total <= 0) {
            return $pool[0];
        }

        // A hash rather than rand(): stable for a visitor, and evenly spread
        // across them without needing to remember anything.
        $point = hexdec(substr(hash('sha256', $visitorKey), 0, 8)) % $total;

        foreach ($pool as $entry) {
            $point -= $entry['weight'];
            if ($point < 0) {
                return $entry;
            }
        }

        return $pool[array_key_last($pool)];
    }

    /** The variant a key names on this step, or null for the control. */
    public function variantFor(FunnelStep $step, ?string $key): ?FunnelStepVariant
    {
        if ($key === null || $key === '' || $key === FunnelStepVariant::CONTROL) {
            return null;
        }

        return $step->variants()->where('key', $key)->first();
    }

    /**
     * How each version has done.
     *
     * Views and conversions are counted from the events, so a version that was
     * paused half way still shows what it did while it ran. The rate is only
     * meaningful once somebody has actually seen it, so a version with no views
     * reports zero rather than dividing by nothing.
     *
     * @return array{step_id: int, total_views: int, total_conversions: int, variants: list<array<string, mixed>>}
     */
    public function results(FunnelStep $step): array
    {
        $variants = $step->variants()->orderBy('id')->get();

        $rows = [];
        foreach ([null, ...$variants->all()] as $variant) {
            $events = FunnelEvent::query()
                ->where('step_id', $step->id)
                ->when($variant, fn ($query) => $query->where('variant_id', $variant->id))
                ->when(! $variant, fn ($query) => $query->whereNull('variant_id'));

            $views = (clone $events)->whereIn('event_type', ['step_view', 'page_view'])->count();
            $conversions = (clone $events)->whereIn('event_type', self::CONVERSIONS)->count();

            $rows[] = [
                'id' => $variant?->id,
                'key' => $variant?->key ?? FunnelStepVariant::CONTROL,
                'name' => $variant?->name ?? 'Control',
                'status' => $variant?->status ?? 'active',
                'weight' => $variant?->weight ?? 1,
                'views' => $views,
                'conversions' => $conversions,
                // Rounded to a tenth of a point: any more reads as precision
                // this many visitors cannot support.
                'rate' => $views > 0 ? round($conversions / $views * 100, 1) : 0.0,
            ];
        }

        return [
            'step_id' => $step->id,
            'total_views' => array_sum(array_column($rows, 'views')),
            'total_conversions' => array_sum(array_column($rows, 'conversions')),
            'variants' => $rows,
        ];
    }

    /**
     * Ends the experiment by sending everyone to one version.
     *
     * The winner is the only thing served afterwards. Losing variants are kept
     * rather than deleted: the numbers that justified the decision should still
     * be there to look at later.
     */
    public function declareWinner(FunnelStep $step, ?string $key): array
    {
        $step->variants()->update(['status' => 'lost']);

        if ($key !== null && $key !== FunnelStepVariant::CONTROL) {
            $winner = $step->variants()->where('key', $key)->firstOrFail();
            $winner->update(['status' => 'winner']);
        }
        // Control winning means there is nothing left to serve but the step's
        // own content, which is what an empty active pool already does.

        return $this->results($step->fresh('variants'));
    }

    /** A key that is short, stable and safe in a cookie and a URL. */
    public function uniqueKey(FunnelStep $step, string $name): string
    {
        $base = Str::of($name)->slug()->limit(24, '')->toString() ?: 'variant';
        $key = $base;
        $i = 2;

        while ($step->variants()->where('key', $key)->exists()) {
            $key = $base.'-'.$i++;
        }

        return $key;
    }
}
