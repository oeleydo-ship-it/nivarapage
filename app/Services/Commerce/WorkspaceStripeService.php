<?php

namespace App\Services\Commerce;

use App\Models\Order;
use App\Models\Product;
use App\Models\Workspace;
use App\Models\WorkspacePaymentSetting;
use App\Support\EncryptedSettings;
use Illuminate\Support\Str;
use RuntimeException;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;
use Stripe\Webhook;
use Throwable;

/**
 * A workspace selling through its own Stripe account.
 *
 * The customer pastes their own secret key, so charges land in their account
 * and the platform is never in the money path. That is also why this is not the
 * platform's StripeGateway: that one holds a single set of credentials used to
 * bill workspaces for their plan, and the two must never be confused.
 */
class WorkspaceStripeService
{
    public function settings(Workspace $workspace): WorkspacePaymentSetting
    {
        $row = WorkspacePaymentSetting::query()->firstOrCreate(['workspace_id' => $workspace->id]);

        // Every workspace gets its endpoint the first time its settings are
        // touched, so the address is ready to paste into Stripe before any key
        // has been entered.
        if (blank($row->webhook_token)) {
            $row->forceFill(['webhook_token' => Str::lower(Str::random(48))])->save();
        }

        return $row;
    }

    /** The address Stripe should post this workspace's events to. */
    public function webhookUrl(Workspace $workspace): string
    {
        return url('/api/v1/public/payments/stripe/'.$this->settings($workspace)->webhook_token.'/webhook');
    }

    /** The workspace an incoming webhook belongs to, or null if nothing matches. */
    public function settingsForToken(string $token): ?WorkspacePaymentSetting
    {
        return WorkspacePaymentSetting::query()->with('workspace')->where('webhook_token', $token)->first();
    }

    /**
     * What the dashboard may see: everything except the secrets themselves.
     *
     * @return array<string, mixed>
     */
    public function config(Workspace $workspace): array
    {
        $row = $this->settings($workspace);
        $secret = EncryptedSettings::read($row, 'secret_key');

        return [
            'provider' => $row->provider,
            'enabled' => (bool) $row->enabled,
            'mode' => $row->mode,
            'currency' => $row->currency,
            'publishable_key' => $row->publishable_key,
            'account_name' => $row->account_name,
            'connected' => $secret !== null,
            // The last four characters only, so someone can tell which key is
            // stored without the key ever being readable again.
            'secret_hint' => $secret ? Str::substr($secret, -4) : null,
            'secret_unreadable' => EncryptedSettings::unreadable($row, 'secret_key'),
            'webhook_set' => EncryptedSettings::read($row, 'webhook_secret') !== null,
            'webhook_url' => $this->webhookUrl($workspace),
            'verified_at' => $row->verified_at?->toIso8601String(),
            'last_error' => $row->last_error,
        ];
    }

    /**
     * Only the keys that were sent are written, so saving the currency cannot
     * blank a secret the form never had in the first place.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function update(Workspace $workspace, array $data): array
    {
        $row = $this->settings($workspace);
        // A key from a previous APP_KEY cannot be overwritten through the model
        // at all - saving decrypts to compare and throws first.
        EncryptedSettings::discardUnreadable($row, 'secret_key', 'webhook_secret');

        $attributes = [];
        foreach (['enabled', 'mode', 'currency', 'publishable_key', 'account_name'] as $key) {
            if (array_key_exists($key, $data)) {
                $attributes[$key] = $data[$key];
            }
        }
        // Blank means "leave what is stored", which is what a write-only field
        // sends when the person did not retype it.
        foreach (['secret_key', 'webhook_secret'] as $key) {
            if (filled($data[$key] ?? null)) {
                $attributes[$key] = trim((string) $data[$key]);
                $attributes['verified_at'] = null;
            }
        }

        if (array_key_exists('secret_key', $attributes)) {
            $attributes['mode'] = str_starts_with($attributes['secret_key'], 'sk_live_') ? 'live' : 'test';
        }

        $row->update($attributes);

        return $this->config($workspace);
    }

    public function disconnect(Workspace $workspace): array
    {
        $row = $this->settings($workspace);
        EncryptedSettings::discardUnreadable($row, 'secret_key', 'webhook_secret');
        $row->update([
            'secret_key' => null,
            'webhook_secret' => null,
            'publishable_key' => null,
            'account_name' => null,
            'enabled' => false,
            'verified_at' => null,
            'last_error' => null,
        ]);

        return $this->config($workspace);
    }

    public function connected(Workspace $workspace): bool
    {
        $row = $this->settings($workspace);

        return $row->enabled && EncryptedSettings::read($row, 'secret_key') !== null;
    }

    /**
     * Asks Stripe who the key belongs to, which is the only way to know the
     * customer pasted a working key rather than a typo.
     *
     * @return array{ok: bool, message: string}
     */
    public function verify(Workspace $workspace): array
    {
        $row = $this->settings($workspace);
        $secret = EncryptedSettings::read($row, 'secret_key');

        if ($secret === null) {
            return ['ok' => false, 'message' => 'Add your Stripe secret key first.'];
        }

        try {
            $account = $this->client($workspace)->accounts->retrieve();
            $name = $account->business_profile->name ?? $account->settings->dashboard->display_name ?? $account->id;
            $row->update([
                'account_name' => is_string($name) ? Str::limit($name, 120, '') : null,
                'verified_at' => now(),
                'last_error' => null,
            ]);

            return ['ok' => true, 'message' => 'Connected to '.($row->account_name ?: 'Stripe').'.'];
        } catch (ApiErrorException $e) {
            $message = Str::limit($e->getMessage(), 200, '');
            $row->update(['verified_at' => null, 'last_error' => $message]);

            return ['ok' => false, 'message' => $message];
        } catch (Throwable) {
            $row->update(['verified_at' => null, 'last_error' => 'Could not reach Stripe.']);

            return ['ok' => false, 'message' => 'Could not reach Stripe.'];
        }
    }

    public function client(Workspace $workspace): StripeClient
    {
        $secret = EncryptedSettings::read($this->settings($workspace), 'secret_key');
        if ($secret === null) {
            throw new RuntimeException('This workspace has not connected a Stripe account.');
        }

        return new StripeClient($secret);
    }

    /**
     * Opens an order and asks the customer's Stripe for a page to pay on.
     *
     * The order is written before Stripe is called so a session that succeeds
     * on their side always has a row here to settle; an unpaid row is far less
     * trouble than a payment nobody recorded.
     *
     * @param  array<string, mixed>  $context
     * @return array{order: Order, url: string}
     */
    public function checkout(Product $product, array $context = []): array
    {
        $workspace = $product->workspace;

        if (! $this->connected($workspace)) {
            throw new RuntimeException('This shop is not accepting payments yet.');
        }
        if (! $product->isPurchasable()) {
            throw new RuntimeException('That product is not on sale.');
        }

        $order = Order::query()->create([
            'workspace_id' => $workspace->id,
            'product_id' => $product->id,
            'site_id' => $context['site_id'] ?? null,
            'funnel_id' => $context['funnel_id'] ?? null,
            'reference' => 'ord_'.Str::lower(Str::random(18)),
            'status' => 'pending',
            'amount' => $product->price,
            'currency' => $product->currency,
            'customer_email' => $context['email'] ?? null,
            'metadata' => $context['metadata'] ?? null,
        ]);

        try {
            $session = $this->client($workspace)->checkout->sessions->create([
                'mode' => $product->type === 'subscription' ? 'subscription' : 'payment',
                'success_url' => $this->successUrl($product, $context),
                'cancel_url' => $context['cancel_url'] ?? url('/'),
                'client_reference_id' => $order->reference,
                'customer_email' => $order->customer_email ?: null,
                'line_items' => [[
                    'quantity' => 1,
                    'price_data' => [
                        'currency' => Str::lower($product->currency),
                        'unit_amount' => $product->price,
                        'product_data' => array_filter([
                            'name' => $product->name,
                            'description' => $product->description ? Str::limit($product->description, 500, '') : null,
                        ]),
                        ...($product->type === 'subscription'
                            ? ['recurring' => ['interval' => $product->interval ?: 'month']]
                            : []),
                    ],
                ]],
                // Echoed back on the webhook, so the order can be found even if
                // client_reference_id is ever dropped from the payload.
                'metadata' => ['order_reference' => $order->reference, 'product_id' => (string) $product->id],
            ]);
        } catch (ApiErrorException $e) {
            $order->update(['status' => 'failed', 'metadata' => ['error' => Str::limit($e->getMessage(), 200, '')]]);

            throw new RuntimeException('Stripe refused to open a checkout: '.Str::limit($e->getMessage(), 160, ''));
        }

        $order->update(['provider_session_id' => $session->id]);

        return ['order' => $order->fresh(), 'url' => (string) $session->url];
    }

    /**
     * Settles the order a completed checkout belongs to.
     *
     * Signature is verified against the workspace's own webhook secret, so a
     * forged call cannot mark somebody's order paid. Delivered twice, the
     * second one finds the order already paid and changes nothing.
     *
     * @return array{handled: bool, order: Order|null}
     */
    public function handleWebhook(Workspace $workspace, string $payload, ?string $signature): array
    {
        $row = $this->settings($workspace);
        $secret = EncryptedSettings::read($row, 'webhook_secret');
        if ($secret === null) {
            throw new RuntimeException('No webhook secret is set for this workspace.');
        }

        $event = Webhook::constructEvent($payload, (string) $signature, $secret);
        if (! in_array($event->type, ['checkout.session.completed', 'checkout.session.async_payment_succeeded'], true)) {
            return ['handled' => false, 'order' => null];
        }

        $session = $event->data->object;
        $reference = $session->client_reference_id ?? ($session->metadata->order_reference ?? null);

        $sessionId = $session->id ?? null;

        // Either identifier finds it, but never outside this workspace: the
        // secret that signed the call belongs to one account only.
        $order = Order::query()
            ->where('workspace_id', $workspace->id)
            ->where(function ($query) use ($reference, $sessionId) {
                $query->whereRaw('1 = 0');
                if (filled($reference)) {
                    $query->orWhere('reference', $reference);
                }
                if (filled($sessionId)) {
                    $query->orWhere('provider_session_id', $sessionId);
                }
            })
            ->first();

        if (! $order) {
            return ['handled' => false, 'order' => null];
        }
        if ($order->status === 'paid') {
            return ['handled' => true, 'order' => $order];
        }

        $order->update([
            'status' => 'paid',
            'paid_at' => now(),
            'provider_payment_id' => $session->payment_intent ?? $session->subscription ?? null,
            'customer_email' => $session->customer_details->email ?? $order->customer_email,
            'customer_name' => $session->customer_details->name ?? $order->customer_name,
        ]);

        // Stock is only taken once the money actually arrived.
        $product = $order->product;
        if ($product && $product->inventory !== null) {
            $product->decrement('inventory');
        }

        return ['handled' => true, 'order' => $order->fresh()];
    }

    /**
     * @param  array<string, mixed>  $context
     */
    private function successUrl(Product $product, array $context): string
    {
        $configured = $product->success_url ?: ($context['success_url'] ?? null);

        return is_string($configured) && $configured !== '' ? $configured : url('/');
    }
}
