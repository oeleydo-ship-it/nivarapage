<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\Commerce\WorkspaceStripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

/**
 * Where a buy button on a published page sends the visitor.
 *
 * Public and unauthenticated: the person clicking is a customer of the
 * workspace, not a user of the platform. Nothing about the price comes from the
 * request - the amount charged is read from the product row, so a page that has
 * gone stale, or been edited in a browser, cannot change what is taken.
 */
class PublicCheckoutController extends Controller
{
    public function __construct(private readonly WorkspaceStripeService $stripe) {}

    public function start(Request $request, string $product): JsonResponse
    {
        $data = $request->validate([
            'email' => ['nullable', 'email', 'max:255'],
            'success_url' => ['nullable', 'url', 'max:2048'],
            'cancel_url' => ['nullable', 'url', 'max:2048'],
            'site_id' => ['nullable', 'integer'],
            'funnel_id' => ['nullable', 'integer'],
        ]);

        // Only what is on sale is addressable. A draft or archived product
        // answers exactly as a made-up id does, so the endpoint never says what
        // a workspace has that it has not published.
        $model = Product::query()
            ->with('workspace')
            ->whereKey($product)
            ->where('status', 'active')
            ->first();

        if (! $model || ! $model->workspace) {
            return response()->json(['error' => 'unavailable', 'message' => 'That product is not available.'], 404);
        }

        try {
            $result = $this->stripe->checkout($model, [
                'email' => $data['email'] ?? null,
                'success_url' => $data['success_url'] ?? null,
                'cancel_url' => $data['cancel_url'] ?? null,
                // Only used to say where the sale came from; the money and the
                // price are the product's either way.
                'site_id' => $data['site_id'] ?? null,
                'funnel_id' => $data['funnel_id'] ?? null,
            ]);
        } catch (RuntimeException $e) {
            // Not connected, not on sale, or Stripe refused. All of these are
            // worth telling the shopper about plainly.
            return response()->json(['error' => 'checkout_failed', 'message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            Log::error('commerce.checkout.failed', ['product_id' => $model->id, 'message' => $e->getMessage()]);

            return response()->json(['error' => 'checkout_failed', 'message' => 'Checkout is unavailable right now.'], 500);
        }

        return response()->json(['data' => [
            'url' => $result['url'],
            'reference' => $result['order']->reference,
        ]]);
    }
}
