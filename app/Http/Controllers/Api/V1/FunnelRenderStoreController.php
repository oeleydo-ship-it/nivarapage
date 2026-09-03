<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Funnel;
use App\Services\Rendering\SiteRenderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

/**
 * Stores the HTML of a funnel's published steps.
 *
 * Separate from the site endpoint because a funnel need not have a site. Steps
 * used to be uploaded against the funnel's owning site, which a standalone
 * funnel does not have, so there was nowhere for its HTML to go.
 */
class FunnelRenderStoreController extends Controller
{
    public function store(Request $request, Funnel $funnel, SiteRenderService $renders): JsonResponse
    {
        Gate::authorize('update', $funnel);

        $data = $request->validate([
            'renders' => ['required', 'array', 'min:1', 'max:200'],
            'renders.*.path' => ['required', 'string', 'max:512'],
            'renders.*.html' => ['required', 'string', 'max:5242880'],
        ]);

        $stored = 0;

        DB::transaction(function () use ($data, $funnel, $renders, &$stored) {
            foreach ($data['renders'] as $entry) {
                // Only this funnel's own addresses. A path pointing anywhere
                // else would let one funnel publish HTML over another.
                if (! str_starts_with($renders->normalizePath($entry['path']), "/f/{$funnel->public_id}/")) {
                    continue;
                }

                $renders->storeForFunnel($funnel, $entry['path'], $entry['html']);
                $stored++;
            }
        });

        return response()->json(['data' => ['stored' => $stored]]);
    }
}
