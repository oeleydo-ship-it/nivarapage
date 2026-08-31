<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Site;
use App\Services\NavigationService;
use Illuminate\Http\Request;
use InvalidArgumentException;

class MenuController extends Controller
{
    public function show(Site $site, NavigationService $navigation)
    {
        $this->authorize('view', $site);

        return response()->json(['data' => $navigation->tree($site)]);
    }

    public function update(Request $request, Site $site, NavigationService $navigation)
    {
        $this->authorize('update', $site);
        $data = $request->validate([
            'menus' => ['required', 'array'],
        ]);

        try {
            return response()->json(['data' => $navigation->sync($site, $data['menus'])]);
        } catch (InvalidArgumentException $e) {
            abort(422, $e->getMessage());
        }
    }
}
