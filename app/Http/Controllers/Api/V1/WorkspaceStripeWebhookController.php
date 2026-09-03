<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Commerce\WorkspaceStripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Stripe\Exception\SignatureVerificationException;
use Throwable;

/**
 * Where Stripe tells a workspace one of its checkouts was paid.
 *
 * Not StripeWebhookController, which is the platform's own: that one is told
 * about workspaces paying for their plan, this one about a workspace's
 * customers paying the workspace. Different accounts, different secrets, and
 * they must never be crossed.
 *
 * Public and unauthenticated, because Stripe has no session. The signature is
 * the authentication: the body is checked against the webhook secret of the
 * workspace the token addresses, so nothing forged can mark an order paid.
 *
 * The raw body matters - Stripe signs the exact bytes it sent, so decoding and
 * re-encoding the JSON first would break every signature.
 */
class WorkspaceStripeWebhookController extends Controller
{
    public function __construct(private readonly WorkspaceStripeService $stripe) {}

    public function handle(Request $request, string $token): JsonResponse
    {
        $settings = $this->stripe->settingsForToken($token);
        $workspace = $settings?->workspace;

        if (! $workspace) {
            return response()->json(['error' => 'unknown_endpoint'], 404);
        }

        try {
            $result = $this->stripe->handleWebhook(
                $workspace,
                $request->getContent(),
                $request->header('Stripe-Signature'),
            );
        } catch (SignatureVerificationException) {
            // 400 so Stripe records it as failed and retries, rather than 500,
            // which would read as the application being broken.
            return response()->json(['error' => 'invalid_signature'], 400);
        } catch (RuntimeException $e) {
            // No webhook secret stored yet. Worth saying, not worth retrying:
            // it will keep being true until somebody sets one.
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            Log::error('stripe.workspace_webhook.failed', [
                'workspace_id' => $workspace->id,
                'message' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'unhandled'], 500);
        }

        // An event this does not act on is still a delivery Stripe should stop
        // retrying, so it answers 200 having done nothing.
        return response()->json([
            'handled' => $result['handled'],
            'order' => $result['order']?->reference,
        ]);
    }
}
