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
}
