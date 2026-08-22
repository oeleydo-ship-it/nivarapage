<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\StripeGateway;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\Exception\SignatureVerificationException;
use UnexpectedValueException;

class StripeWebhookController extends Controller
{
    public function handle(Request $request, StripeGateway $stripe, SubscriptionService $subscriptions): JsonResponse
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');

        try {
            $event = $stripe->constructEvent($payload, $signature);
        } catch (SignatureVerificationException $e) {
            return response()->json(['message' => 'Invalid Stripe signature.'], 400);
        } catch (UnexpectedValueException $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }

        $subscriptions->handleStripeEvent($event);

        return response()->json(['data' => ['received' => true]]);
    }
}
