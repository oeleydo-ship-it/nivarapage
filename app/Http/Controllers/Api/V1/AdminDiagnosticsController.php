<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Diagnostics\RendererDiagnostics;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Super-admin view of the renderer <-> API chain.
 *
 * Deployments on managed panels have no shell, so the same checks the artisan
 * doctor runs are exposed here.
 */
class AdminDiagnosticsController extends Controller
{
    public function __construct(private readonly RendererDiagnostics $diagnostics) {}

    public function show(Request $request): JsonResponse
    {
        $data = $request->validate([
            'host' => ['sometimes', 'nullable', 'string', 'max:255'],
            'site_id' => ['sometimes', 'nullable', 'integer'],
        ]);

        return response()->json([
            'data' => $this->diagnostics->run($data['host'] ?? null, $data['site_id'] ?? null),
        ]);
    }

    /** Why one hostname does or does not serve a site. */
    public function host(Request $request): JsonResponse
    {
        $data = $request->validate([
            'host' => ['required', 'string', 'max:255'],
        ]);

        return response()->json(['data' => $this->diagnostics->host($data['host'])]);
    }
}
