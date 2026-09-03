<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Funnel;
use App\Models\FunnelStepVariant;
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
            // Which version this HTML is. Absent means the control.
            'renders.*.variant_key' => ['nullable', 'string', 'max:32'],
        ]);

        $stored = 0;

        DB::transaction(function () use ($data, $funnel, $renders, &$stored) {
            foreach ($data['renders'] as $entry) {
                // Only this funnel's own addresses. A path pointing anywhere
                // else would let one funnel publish HTML over another.
                if (! str_starts_with($renders->normalizePath($entry['path']), "/f/{$funnel->public_id}/")) {
                    continue;
                }

                // Resolved against the step the path names, so one funnel
                // cannot store HTML under another's variant.
                $variantId = $this->variantId($funnel, $entry['path'], $entry['variant_key'] ?? null);
                $renders->storeForFunnel($funnel, $entry['path'], $entry['html'], $variantId);
                $stored++;
            }
        });

        return response()->json(['data' => ['stored' => $stored]]);
    }

    /**
     * The variant a key names on the step this path belongs to.
     *
     * Unknown keys store as the control rather than being invented, so a stale
     * publish cannot create a version nobody configured.
     */
    private function variantId(Funnel $funnel, string $path, ?string $key): ?int
    {
        if ($key === null || $key === '' || $key === FunnelStepVariant::CONTROL) {
            return null;
        }

        $slug = basename(parse_url($path, PHP_URL_PATH) ?: '');
        $step = $funnel->steps()->where('slug', $slug)->first();

        return $step?->variants()->where('key', $key)->value('id');
    }
}
