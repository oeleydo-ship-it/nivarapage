<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Site;
use App\Services\PreviewTokenService;
use Illuminate\Http\Request;

class PreviewController extends Controller
{
    public function token(Request $request, Site $site, PreviewTokenService $tokens)
    {
        $this->authorize('view', $site);

        return response()->json(['data' => $tokens->payload($site)]);
    }
}
