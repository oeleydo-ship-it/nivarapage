<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\BrandingService;
use Illuminate\Http\JsonResponse;

class PublicBrandingController extends Controller
{
    /** Name, tagline and logo, readable before sign-in. Contains no secrets. */
    public function show(BrandingService $branding): JsonResponse
    {
        return response()->json(['data' => $branding->public()]);
    }
}
