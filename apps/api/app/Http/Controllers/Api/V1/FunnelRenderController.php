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
            ->get()
            ->filter(fn ($step) => is_array($step->published_content))
            ->map(function ($step) use ($funnel, $tracking) {
                $next = $tracking->nextStep($funnel, $step);

                return [
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
                        'content' => $step->published_content,
                    ],
                    'context' => [
                        'funnel_id' => $funnel->id,
                        'funnel_slug' => $funnel->public_id,
                        'step_slug' => $step->slug,
                        'step_id' => $step->id,
                        'next_step' => $next?->slug,
                        'tracking_enabled' => true,
                    ],
                ];
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
