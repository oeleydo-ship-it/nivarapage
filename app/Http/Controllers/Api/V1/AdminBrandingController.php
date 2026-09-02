<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AuditService;
use App\Services\BrandingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

/**
 * Super-admin control of the platform's own logo.
 *
 * The matching read endpoint is public, because the sign-in screen has to
 * render the branding before anyone holds a token.
 */
class AdminBrandingController extends Controller
{
    public function __construct(
        private readonly BrandingService $branding,
        private readonly AuditService $audit,
    ) {}

    public function show(): JsonResponse
    {
        return response()->json(['data' => $this->branding->public()]);
    }

    private function keyForVariant(string $variant): string
    {
        return match ($variant) {
            'dark' => 'platform_logo_dark',
            'favicon' => 'platform_favicon',
            default => 'platform_logo',
        };
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:2048'],
            'variant' => ['sometimes', 'in:light,dark,favicon'],
        ]);

        $key = $this->keyForVariant((string) $request->input('variant'));

        try {
            $this->branding->storeLogo($request->file('file'), $key);
        } catch (InvalidArgumentException $e) {
            abort(422, $e->getMessage());
        }

        $this->audit->log('branding.logo_updated', null, ['variant' => $key], null, $request->user());

        return response()->json(['data' => $this->branding->public()]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $key = $this->keyForVariant((string) $request->input('variant'));
        $this->branding->clearLogo($key);

        $this->audit->log('branding.logo_cleared', null, ['variant' => $key], null, $request->user());

        return response()->json(['data' => $this->branding->public()]);
    }
}
