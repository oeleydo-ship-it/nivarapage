<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Workspace;
use App\Services\Commerce\WorkspaceStripeService;
use App\Support\CurrentWorkspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The workspace's own Stripe connection.
 *
 * Secrets are write-only: they go in, and only a four-character hint ever comes
 * back out. Nothing here touches the platform's own gateway settings, which are
 * a different row owned by the super admin.
 */
class WorkspacePaymentController extends Controller
{
    public function __construct(
        private readonly WorkspaceStripeService $stripe,
        private readonly CurrentWorkspace $currentWorkspace,
    ) {}

    public function show(): JsonResponse
    {
        return response()->json(['data' => $this->stripe->config($this->workspace())]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'enabled' => ['sometimes', 'boolean'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'publishable_key' => ['nullable', 'string', 'max:255'],
            'account_name' => ['nullable', 'string', 'max:120'],
            // Blank means "keep what is stored"; a write-only field sends that
            // whenever the person did not retype the key.
            'secret_key' => ['nullable', 'string', 'max:255'],
            'webhook_secret' => ['nullable', 'string', 'max:255'],
        ]);

        return response()->json(['data' => $this->stripe->update($this->workspace(), $data)]);
    }

    public function verify(): JsonResponse
    {
        $result = $this->stripe->verify($this->workspace());

        return response()->json([
            'data' => $result + ['settings' => $this->stripe->config($this->workspace())],
        ], $result['ok'] ? 200 : 422);
    }

    public function destroy(): JsonResponse
    {
        return response()->json(['data' => $this->stripe->disconnect($this->workspace())]);
    }

    private function workspace(): Workspace
    {
        $workspace = $this->currentWorkspace->workspace;
        abort_unless($workspace, 422, 'Workspace is required.');

        return $workspace;
    }
}
