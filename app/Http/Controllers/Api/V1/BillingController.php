<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PlanResource;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Workspace;
use App\Services\PlanLimitService;
use App\Services\StripeGateway;
use App\Services\SubscriptionService;
use App\Support\CurrentWorkspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    public function plans()
    {
        return PlanResource::collection(Plan::query()->where('is_active', true)->orderBy('id')->get());
    }

    public function subscription(CurrentWorkspace $current, PlanLimitService $limits, StripeGateway $stripe): JsonResponse
    {
        $workspace = $current->workspace;
        $subscription = $workspace?->subscription;
        $subscription?->load('plan');

        return response()->json(['data' => $this->payload($workspace, $subscription, $limits, $stripe)]);
    }

    public function changePlan(
        Request $request,
        CurrentWorkspace $current,
        SubscriptionService $subscriptions,
        PlanLimitService $limits,
        StripeGateway $stripe,
    ): JsonResponse {
        $data = $request->validate([
            'plan' => ['required', 'exists:plans,slug'],
            'interval' => ['nullable', 'in:monthly,yearly'],
        ]);
        $plan = Plan::query()->where('slug', $data['plan'])->firstOrFail();
        $workspace = $current->workspace;
        $subscription = $subscriptions->changePlan($workspace, $plan, $data['interval'] ?? 'monthly');

        return response()->json([
            'data' => $this->payload($workspace->fresh(), $subscription->load('plan'), $limits, $stripe),
        ]);
    }

    public function checkout(
        Request $request,
        CurrentWorkspace $current,
        SubscriptionService $subscriptions,
    ): JsonResponse {
        $data = $request->validate([
            'plan' => ['required', 'exists:plans,slug'],
            'interval' => ['required', 'in:monthly,yearly'],
        ]);
        $plan = Plan::query()->where('slug', $data['plan'])->where('is_active', true)->firstOrFail();
        $session = $subscriptions->createCheckoutSession($current->workspace, $plan, $data['interval']);

        return response()->json(['data' => $session]);
    }

    public function portal(CurrentWorkspace $current, SubscriptionService $subscriptions): JsonResponse
    {
        return response()->json(['data' => $subscriptions->createPortalSession($current->workspace)]);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(?Workspace $workspace, ?Subscription $subscription, PlanLimitService $limits, StripeGateway $stripe): array
    {
        return [
            'id' => $subscription?->id,
            'status' => $subscription?->status,
            'provider' => $subscription?->provider,
            'current_period_end' => $subscription?->current_period_end,
            'cancel_at_period_end' => (bool) ($subscription?->cancel_at_period_end ?? false),
            'interval' => $subscription?->interval,
            'stripe_enabled' => $stripe->enabled(),
            'portal_available' => $stripe->enabled() && filled($workspace?->stripe_customer_id),
            'plan' => $subscription?->plan ? new PlanResource($subscription->plan) : null,
            'usage' => $workspace ? $limits->usageSummary($workspace) : [],
        ];
    }
}
