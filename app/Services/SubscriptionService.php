<?php

namespace App\Services;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Workspace;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use Stripe\Event;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeObject;

class SubscriptionService
{
    public function __construct(
        private readonly AuditService $audit,
        private readonly StripeGateway $stripe,
    ) {}

    public function isStripeEnabled(): bool
    {
        return $this->stripe->enabled();
    }

    public function subscribe(Workspace $workspace, Plan $plan, string $provider = 'local'): Subscription
    {
        $subscription = Subscription::query()->create([
            'workspace_id' => $workspace->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'provider' => $provider,
            'provider_ref' => null,
            'current_period_end' => Carbon::now()->addMonth(),
            'cancel_at_period_end' => false,
            'interval' => $this->defaultInterval($plan),
        ]);

        $this->syncBranding($workspace, $plan);

        return $subscription;
    }

    public function changePlan(Workspace $workspace, Plan $plan, string $interval = 'monthly'): Subscription
    {
        if ($this->stripe->enabled() && ! $this->isFree($plan)) {
            throw ValidationException::withMessages([
                'plan' => ['Paid plan changes must be completed through Stripe Checkout.'],
            ]);
        }

        if ($this->isFree($plan) && $this->stripe->enabled()) {
            return $this->downgradeToFree($workspace, $plan);
        }

        return $this->applyLocalPlan($workspace, $plan, $interval, 'local');
    }

    /**
     * @return array{url: string, id: string}
     */
    public function createCheckoutSession(Workspace $workspace, Plan $plan, string $interval = 'monthly'): array
    {
        if (! $this->stripe->enabled()) {
            throw ValidationException::withMessages([
                'plan' => ['Stripe is not configured. Set STRIPE_SECRET to enable Checkout.'],
            ]);
        }

        if ($this->isFree($plan)) {
            throw ValidationException::withMessages([
                'plan' => ['The Free plan does not require Checkout.'],
            ]);
        }

        $amount = (int) ($plan->prices[$interval] ?? 0);
        if ($amount <= 0 && ! $this->priceId($plan, $interval)) {
            throw ValidationException::withMessages([
                'plan' => ['This plan has no price for the selected interval.'],
            ]);
        }

        $client = $this->stripe->client();
        $customerId = $this->ensureCustomer($workspace);

        $session = $client->checkout->sessions->create([
            'mode' => 'subscription',
            'customer' => $customerId,
            'success_url' => rtrim((string) config('uidesired.frontend_url'), '/').'/billing?success=1',
            'cancel_url' => rtrim((string) config('uidesired.frontend_url'), '/').'/billing?canceled=1',
            'client_reference_id' => (string) $workspace->id,
            'line_items' => [$this->lineItem($plan, $interval, $amount)],
            'metadata' => [
                'workspace_id' => (string) $workspace->id,
                'plan_slug' => $plan->slug,
                'interval' => $interval,
            ],
            'subscription_data' => [
                'metadata' => [
                    'workspace_id' => (string) $workspace->id,
                    'plan_slug' => $plan->slug,
                    'interval' => $interval,
                ],
            ],
            'allow_promotion_codes' => true,
        ]);

        return [
            'url' => (string) $session->url,
            'id' => (string) $session->id,
        ];
    }

    /**
     * @return array{url: string}
     */
    public function createPortalSession(Workspace $workspace): array
    {
        if (! $this->stripe->enabled()) {
            throw ValidationException::withMessages([
                'portal' => ['Stripe is not configured.'],
            ]);
        }

        $customerId = $workspace->stripe_customer_id;
        if (! $customerId) {
            throw ValidationException::withMessages([
                'portal' => ['No Stripe customer is attached to this workspace yet.'],
            ]);
        }

        $session = $this->stripe->client()->billingPortal->sessions->create([
            'customer' => $customerId,
            'return_url' => rtrim((string) config('uidesired.frontend_url'), '/').'/billing',
        ]);

        return ['url' => (string) $session->url];
    }

    public function handleStripeEvent(Event $event): void
    {
        $object = $event->data->object ?? null;
        if (! $object instanceof StripeObject) {
            return;
        }

        match ($event->type) {
            'checkout.session.completed' => $this->onCheckoutCompleted($object),
            'customer.subscription.updated' => $this->onSubscriptionUpdated($object),
            'customer.subscription.deleted' => $this->onSubscriptionDeleted($object),
            'invoice.paid' => $this->onInvoicePaid($object),
            'invoice.payment_failed' => $this->onInvoicePaymentFailed($object),
            default => null,
        };
    }

    public function assignFreePlan(Workspace $workspace): Subscription
    {
        $plan = Plan::query()->where('slug', 'free')->firstOrFail();

        return $this->subscribe($workspace, $plan);
    }

    private function applyLocalPlan(Workspace $workspace, Plan $plan, string $interval, string $provider, ?string $providerRef = null, ?string $status = 'active', mixed $periodEnd = null): Subscription
    {
        $subscription = $workspace->subscription;
        $previous = $subscription?->plan?->slug;

        $attributes = [
            'plan_id' => $plan->id,
            'status' => $status ?? 'active',
            'provider' => $provider,
            'provider_ref' => $providerRef ?? $subscription?->provider_ref,
            'current_period_end' => $this->normalizePeriodEnd($periodEnd, $interval),
            'cancel_at_period_end' => false,
            'interval' => $interval,
        ];

        if (! $subscription) {
            $subscription = Subscription::query()->create(array_merge($attributes, [
                'workspace_id' => $workspace->id,
            ]));
        } else {
            $subscription->update($attributes);
        }

        $this->syncBranding($workspace, $plan);

        if ($previous !== $plan->slug) {
            $this->audit->log('billing.plan_changed', $plan, [
                'from' => $previous,
                'to' => $plan->slug,
                'provider' => $provider,
                'interval' => $interval,
            ], $workspace);
        }

        return $subscription->fresh(['plan']);
    }

    private function downgradeToFree(Workspace $workspace, Plan $plan): Subscription
    {
        $subscription = $workspace->subscription;

        if ($subscription && $subscription->provider === 'stripe' && filled($subscription->provider_ref)) {
            try {
                $this->stripe->client()->subscriptions->update($subscription->provider_ref, [
                    'cancel_at_period_end' => true,
                ]);
            } catch (ApiErrorException) {
                // Local state still records the scheduled cancel; webhook will reconcile.
            }

            $subscription->update([
                'cancel_at_period_end' => true,
                'status' => $subscription->status === 'canceled' ? 'canceled' : $subscription->status,
            ]);

            $this->audit->log('billing.plan_changed', $plan, [
                'from' => $subscription->plan?->slug,
                'to' => 'free',
                'scheduled' => true,
            ], $workspace);

            return $subscription->fresh(['plan']);
        }

        return $this->applyLocalPlan($workspace, $plan, 'monthly', $subscription?->provider ?? 'local');
    }

    private function onCheckoutCompleted(StripeObject $session): void
    {
        $mode = $session['mode'] ?? 'subscription';
        if ($mode !== 'subscription') {
            return;
        }

        $workspace = $this->workspaceFromStripe($session);
        if (! $workspace) {
            return;
        }

        $plan = $this->planFromStripe($session);
        $interval = (string) ($this->metadata($session)['interval'] ?? 'monthly');
        $customerId = is_string($session['customer'] ?? null) ? $session['customer'] : null;
        $subscriptionId = is_string($session['subscription'] ?? null) ? $session['subscription'] : null;

        if ($customerId) {
            $workspace->update(['stripe_customer_id' => $customerId]);
        }

        $previousRef = $workspace->subscription?->provider === 'stripe'
            ? $workspace->subscription?->provider_ref
            : null;

        if ($plan) {
            $this->applyLocalPlan(
                $workspace->fresh(['subscription.plan']),
                $plan,
                in_array($interval, ['monthly', 'yearly'], true) ? $interval : 'monthly',
                'stripe',
                $subscriptionId,
                'active',
                $this->periodEndFromStripe($session),
            );
        }

        if ($previousRef && $subscriptionId && $previousRef !== $subscriptionId) {
            try {
                $this->stripe->client()->subscriptions->cancel($previousRef);
            } catch (ApiErrorException) {
                // The new subscription is already the source of truth.
            }
        }
    }

    private function onSubscriptionUpdated(StripeObject $subscription): void
    {
        $workspace = $this->workspaceFromStripe($subscription);
        if (! $workspace) {
            return;
        }

        $plan = $this->planFromStripe($subscription) ?? $workspace->subscription?->plan;
        $status = $this->mapStripeStatus((string) ($subscription['status'] ?? 'active'));
        $interval = $this->intervalFromStripeSubscription($subscription);
        $cancelAtPeriodEnd = (bool) ($subscription['cancel_at_period_end'] ?? false);

        if ($plan) {
            $record = $this->applyLocalPlan(
                $workspace->fresh(['subscription.plan']),
                $plan,
                $interval,
                'stripe',
                is_string($subscription['id'] ?? null) ? $subscription['id'] : $workspace->subscription?->provider_ref,
                $status,
                $this->periodEndFromStripe($subscription),
            );
            $record->update(['cancel_at_period_end' => $cancelAtPeriodEnd]);
        }

        $customerId = is_string($subscription['customer'] ?? null) ? $subscription['customer'] : null;
        if ($customerId && $workspace->stripe_customer_id !== $customerId) {
            $workspace->update(['stripe_customer_id' => $customerId]);
        }
    }

    private function onSubscriptionDeleted(StripeObject $subscription): void
    {
        $workspace = $this->workspaceFromStripe($subscription);
        if (! $workspace) {
            return;
        }

        $free = Plan::query()->where('slug', 'free')->firstOrFail();
        $this->applyLocalPlan($workspace->fresh(['subscription.plan']), $free, 'monthly', 'stripe', is_string($subscription['id'] ?? null) ? $subscription['id'] : null, 'canceled');
        $workspace->subscription?->update(['cancel_at_period_end' => false]);
    }

    private function onInvoicePaid(StripeObject $invoice): void
    {
        $workspace = $this->workspaceFromStripe($invoice);
        $subscription = $workspace?->subscription;
        if (! $subscription) {
            return;
        }

        $subscription->update([
            'status' => 'active',
            'current_period_end' => $this->periodEndFromStripe($invoice) ?? $subscription->current_period_end,
        ]);
    }

    private function onInvoicePaymentFailed(StripeObject $invoice): void
    {
        $workspace = $this->workspaceFromStripe($invoice);
        if (! $workspace?->subscription) {
            return;
        }

        $workspace->subscription->update(['status' => 'past_due']);
    }

    private function ensureCustomer(Workspace $workspace): string
    {
        if (filled($workspace->stripe_customer_id)) {
            return (string) $workspace->stripe_customer_id;
        }

        $workspace->loadMissing('owner');
        $customer = $this->stripe->client()->customers->create([
            'email' => $workspace->owner?->email,
            'name' => $workspace->name,
            'metadata' => ['workspace_id' => (string) $workspace->id],
        ]);

        $workspace->update(['stripe_customer_id' => $customer->id]);

        return $customer->id;
    }

    /**
     * @return array<string, mixed>
     */
    private function lineItem(Plan $plan, string $interval, int $amount): array
    {
        $priceId = $this->priceId($plan, $interval);
        if ($priceId) {
            return ['price' => $priceId, 'quantity' => 1];
        }

        return [
            'price_data' => [
                'currency' => 'usd',
                'product_data' => [
                    'name' => $plan->name,
                    'metadata' => ['plan_slug' => $plan->slug],
                ],
                'unit_amount' => $amount,
                'recurring' => [
                    'interval' => $interval === 'yearly' ? 'year' : 'month',
                ],
            ],
            'quantity' => 1,
        ];
    }

    private function priceId(Plan $plan, string $interval): ?string
    {
        $id = $interval === 'yearly' ? $plan->stripe_price_yearly : $plan->stripe_price_monthly;

        return filled($id) ? (string) $id : null;
    }

    private function workspaceFromStripe(StripeObject $object): ?Workspace
    {
        $meta = $this->metadata($object);
        $workspaceId = (int) ($meta['workspace_id'] ?? $object['client_reference_id'] ?? 0);

        if ($workspaceId > 0) {
            return Workspace::query()->with('subscription.plan')->find($workspaceId);
        }

        $customerId = $object['customer'] ?? null;
        if (is_string($customerId) && $customerId !== '') {
            return Workspace::query()->with('subscription.plan')->where('stripe_customer_id', $customerId)->first();
        }

        $subscriptionId = $object['subscription'] ?? $object['id'] ?? null;
        if (is_string($subscriptionId) && str_starts_with($subscriptionId, 'sub_')) {
            return Workspace::query()
                ->with('subscription.plan')
                ->whereHas('subscription', fn ($query) => $query->where('provider_ref', $subscriptionId))
                ->first();
        }

        return null;
    }

    private function planFromStripe(StripeObject $object): ?Plan
    {
        $meta = $this->metadata($object);
        $slug = $meta['plan_slug'] ?? null;
        if (is_string($slug) && $slug !== '') {
            return Plan::query()->where('slug', $slug)->first();
        }

        $priceId = $this->priceIdFromStripeObject($object);
        if ($priceId) {
            return Plan::query()
                ->where('stripe_price_monthly', $priceId)
                ->orWhere('stripe_price_yearly', $priceId)
                ->first();
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function metadata(StripeObject $object): array
    {
        $meta = $object['metadata'] ?? [];
        if ($meta instanceof StripeObject) {
            return $meta->toArray();
        }

        return is_array($meta) ? $meta : [];
    }

    private function priceIdFromStripeObject(StripeObject $object): ?string
    {
        $items = $object['items']['data'][0]['price']['id'] ?? $object['lines']['data'][0]['price']['id'] ?? null;

        return is_string($items) ? $items : null;
    }

    private function intervalFromStripeSubscription(StripeObject $subscription): string
    {
        $metaInterval = $this->metadata($subscription)['interval'] ?? null;
        if (in_array($metaInterval, ['monthly', 'yearly'], true)) {
            return $metaInterval;
        }

        $stripeInterval = $subscription['items']['data'][0]['price']['recurring']['interval'] ?? null;

        return $stripeInterval === 'year' ? 'yearly' : 'monthly';
    }

    private function periodEndFromStripe(StripeObject $object): mixed
    {
        return $object['current_period_end']
            ?? $object['lines']['data'][0]['period']['end']
            ?? null;
    }

    private function normalizePeriodEnd(mixed $periodEnd, string $interval): Carbon
    {
        if ($periodEnd instanceof Carbon) {
            return $periodEnd;
        }

        if (is_numeric($periodEnd)) {
            return Carbon::createFromTimestamp((int) $periodEnd);
        }

        if (is_string($periodEnd) && $periodEnd !== '') {
            return Carbon::parse($periodEnd);
        }

        return $interval === 'yearly' ? Carbon::now()->addYear() : Carbon::now()->addMonth();
    }

    private function mapStripeStatus(string $status): string
    {
        return match ($status) {
            'trialing' => 'trialing',
            'past_due', 'unpaid', 'incomplete', 'incomplete_expired' => 'past_due',
            'canceled' => 'canceled',
            default => 'active',
        };
    }

    private function syncBranding(Workspace $workspace, Plan $plan): void
    {
        $workspace->update([
            'branding_removed' => (bool) ($plan->limits['remove_branding'] ?? false),
        ]);
    }

    private function isFree(Plan $plan): bool
    {
        return $plan->slug === 'free' || ((int) ($plan->prices['monthly'] ?? 0) === 0 && (int) ($plan->prices['yearly'] ?? 0) === 0);
    }

    private function defaultInterval(Plan $plan): string
    {
        return $this->isFree($plan) ? 'monthly' : 'monthly';
    }
}
