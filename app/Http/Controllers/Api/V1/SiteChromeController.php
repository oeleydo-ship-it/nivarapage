<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Site;
use App\Services\SiteChromeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

/**
 * The site-wide header and footer, edited as ordinary section lists.
 *
 * Kept beside the menus and theme endpoints because it is the same kind of
 * thing: one setting that every page inherits.
 */
class SiteChromeController extends Controller
{
    public function __construct(private readonly SiteChromeService $chrome) {}

    public function show(Site $site): JsonResponse
    {
        Gate::authorize('view', $site);

        return response()->json(['data' => $this->chrome->get($site)]);
    }

    public function update(Request $request, Site $site): JsonResponse
    {
        Gate::authorize('update', $site);

        // Nullable so a slot can be cleared; absent so one can be saved without
        // touching the other.
        $data = $request->validate([
            'header' => ['sometimes', 'nullable', 'array'],
            'header.schemaVersion' => ['sometimes', 'integer'],
            'header.sections' => ['sometimes', 'array', 'max:50'],
            'footer' => ['sometimes', 'nullable', 'array'],
            'footer.schemaVersion' => ['sometimes', 'integer'],
            'footer.sections' => ['sometimes', 'array', 'max:50'],
        ]);

        try {
            return response()->json(['data' => $this->chrome->update($site, $data)]);
        } catch (InvalidArgumentException $e) {
            // The shared page validator rejects unknown blocks and malformed
            // sections. That is a bad request, not a server fault.
            throw ValidationException::withMessages(['header' => $e->getMessage()]);
        }
    }

    /**
     * Makes one page's header or footer the whole site's.
     *
     * A template puts a navbar on every page, and the renderer leaves a page's
     * own navbar alone rather than stacking the shared one above it. So until
     * the per-page copies are gone the pages share nothing, and editing the
     * header on one changes only that one. This is the switch.
     */
    public function adopt(Request $request, Site $site): JsonResponse
    {
        Gate::authorize('update', $site);

        $data = $request->validate([
            'slot' => ['required', 'in:header,footer'],
            'page_id' => ['nullable'],
        ]);

        $source = null;
        if (! empty($data['page_id'])) {
            $source = $site->pages()->whereKey($data['page_id'])->first();
            abort_unless($source, 404, 'That page is not part of this site.');
        }

        try {
            $result = $this->chrome->adopt($site, $data['slot'], $request->user(), $source);
        } catch (InvalidArgumentException $e) {
            throw ValidationException::withMessages(['slot' => $e->getMessage()]);
        }

        return response()->json(['data' => $result]);
    }
}
