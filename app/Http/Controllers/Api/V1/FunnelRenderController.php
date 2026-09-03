<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Funnel;
use App\Services\Funnels\FunnelTrackingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

/**
 * The render input for a funnel's published steps.
 *
 * Mirrors SiteRenderController::payload. Funnel steps are drawn with the same
 * block components as ordinary pages, but they carry their own theme and are
 * never indexed, so they are described as a standalone site.
 */
class FunnelRenderController extends Controller
{
    public function payload(Funnel $funnel, FunnelTrackingService $tracking): JsonResponse
    {
        Gate::authorize('view', $funnel);

        $steps = $funnel->steps()
            ->where('status', 'published')
            ->with('variants')
            ->get()
            ->filter(fn ($step) => is_array($step->published_content))
            ->flatMap(function ($step) use ($funnel, $tracking) {
                $next = $tracking->nextStep($funnel, $step);

                // The control, then one entry per variant. Each is rendered and
                // stored separately, because the page a visitor gets has to be
                // the version they were assigned rather than the control with
                // something swapped in afterwards.
                $versions = [[null, null, $step->published_content]];
                foreach ($step->variants->whereIn('status', ['active', 'winner']) as $variant) {
                    if (is_array($variant->published_content)) {
                        $versions[] = [$variant->id, $variant->key, $variant->published_content];
                    }
                }

                return array_map(fn (array $version) => [
                    'path' => "/f/{$funnel->public_id}/{$step->slug}",
                    'page_id' => null,
                    'revision_id' => null,
                    'page' => [
                        'id' => $step->id,
                        'name' => $step->name,
                        'slug' => $step->slug,
                        'seo_title' => $step->seo_title ?: $step->name,
                        'seo_description' => $step->seo_description,
                        'robots_index' => false,
                        'robots' => ['index' => false, 'follow' => true],
                        'content' => $version[2],
                    ],
                    'variant_id' => $version[0],
                    'variant_key' => $version[1],
                    'context' => [
                        'funnel_id' => $funnel->id,
                        'funnel_slug' => $funnel->public_id,
                        'step_slug' => $step->slug,
                        'step_id' => $step->id,
                        'next_step' => $next?->slug,
                        // Written into the page, so an event can say which
                        // version the visitor was looking at.
                        'variant' => $version[1],
                        'tracking_enabled' => true,
                    ],
                ], $versions);
            })
            ->values();

        return response()->json([
            'data' => [
                'site_id' => $funnel->site_id,
                'site' => [
                    // site_id 0 marks a standalone render: the blocks use it to
                    // pick the funnel form endpoints over the site ones.
                    'site_id' => 0,
                    'name' => $funnel->name,
                    'business_name' => $funnel->name,
                    'status' => 'published',
                    'host' => '',
                    'primary_hostname' => null,
                    'redirect_to_primary' => false,
                    'branding_removed' => false,
                    'settings' => ['robots' => 'noindex'],
                    'theme' => data_get($funnel->settings, 'theme', []),
                ],
                'menus' => [],
                'pages' => $steps,
            ],
        ]);
    }
}
