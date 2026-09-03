<?php

use App\Models\Order;
use App\Models\Product;
use App\Services\Commerce\WorkspaceStripeService;
use Laravel\Sanctum\Sanctum;

/**
 * Where Stripe says the money actually arrived.
 *
 * Public and unauthenticated, because Stripe has no session, so the signature
 * is the only thing between a stranger and marking somebody's order paid.
 */

/** Signs a body the way Stripe does, so the real verifier can check it. */
function stripeSignature(string $payload, string $secret, ?int $timestamp = null): string
{
    $timestamp ??= time();

    return 't='.$timestamp.',v1='.hash_hmac('sha256', $timestamp.'.'.$payload, $secret);
}

function checkoutPayload(string $reference, string $sessionId = 'cs_test_1'): string
{
    return (string) json_encode([
        'id' => 'evt_1',
        'object' => 'event',
        'type' => 'checkout.session.completed',
        'data' => ['object' => [
            'id' => $sessionId,
            'object' => 'checkout.session',
            'client_reference_id' => $reference,
            'payment_intent' => 'pi_test_1',
            'customer_details' => ['email' => 'buyer@example.com', 'name' => 'Bea Buyer'],
        ]],
    ]);
}

/** Posts a body with its headers, the way Stripe would. */
function postWebhook(string $url, string $payload, string $secret)
{
    return test()->call('POST', $url, [], [], [], [
        'HTTP_STRIPE_SIGNATURE' => stripeSignature($payload, $secret),
        'CONTENT_TYPE' => 'application/json',
    ], $payload);
}

/**
 * A workspace ready to sell, with a pending order waiting to be settled.
 *
 * @return array<string, mixed>
 */
function webhookFixture(): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    test()->withHeaders($headers)->putJson('/api/v1/payments/stripe', [
        'secret_key' => 'sk_test_key0001',
        'webhook_secret' => 'whsec_test_secret',
        'enabled' => true,
    ])->assertOk();

    $product = Product::query()->create([
        'workspace_id' => $workspace->id,
        'name' => 'Starter Kit',
        'slug' => 'starter-kit',
        'price' => 4900,
        'currency' => 'GBP',
        'status' => 'active',
        'inventory' => 3,
    ]);

    $order = Order::query()->create([
        'workspace_id' => $workspace->id,
        'product_id' => $product->id,
        'reference' => 'ord_test_reference',
        'provider_session_id' => 'cs_test_1',
        'status' => 'pending',
        'amount' => $product->price,
        'currency' => $product->currency,
    ]);

    return [
        'headers' => $headers,
        'workspace' => $workspace,
        'product' => $product,
        'order' => $order,
        'url' => app(WorkspaceStripeService::class)->webhookUrl($workspace->fresh()),
    ];
}

it('gives every workspace its own webhook address', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    $config = test()->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->getJson('/api/v1/payments/stripe')
        ->json('data');

    expect($config['webhook_url'])->toContain('/api/v1/public/payments/stripe/');
    // Not the workspace id: the address must not say how many exist, or let
    // somebody walk them one by one.
    expect($config['webhook_url'])->not->toContain('/'.$workspace->id.'/');
});

it('marks the order paid when Stripe says the checkout completed', function () {
    $fx = webhookFixture();

    postWebhook($fx['url'], checkoutPayload('ord_test_reference'), 'whsec_test_secret')
        ->assertOk()
        ->assertJsonPath('handled', true);

    $order = $fx['order']->fresh();
    expect($order->status)->toBe('paid');
    expect($order->paid_at)->not->toBeNull();
    expect($order->customer_email)->toBe('buyer@example.com');
    expect($order->provider_payment_id)->toBe('pi_test_1');

    // Stock only comes down once the money actually arrived.
    expect($fx['product']->fresh()->inventory)->toBe(2);
});

it('refuses a forged call', function () {
    $fx = webhookFixture();

    postWebhook($fx['url'], checkoutPayload('ord_test_reference'), 'whsec_the_wrong_secret')
        ->assertStatus(400);

    // The part that matters: nobody's order got paid for free.
    expect($fx['order']->fresh()->status)->toBe('pending');
    expect($fx['product']->fresh()->inventory)->toBe(3);
});

it('takes the money once when Stripe delivers the same event twice', function () {
    $fx = webhookFixture();
    $payload = checkoutPayload('ord_test_reference');

    postWebhook($fx['url'], $payload, 'whsec_test_secret')->assertOk();
    postWebhook($fx['url'], $payload, 'whsec_test_secret')->assertOk();

    expect(Order::query()->count())->toBe(1);
    // Stock must not fall twice for one purchase.
    expect($fx['product']->fresh()->inventory)->toBe(2);
});

it('answers an unknown endpoint without saying anything about it', function () {
    postWebhook(
        '/api/v1/public/payments/stripe/'.str_repeat('a', 48).'/webhook',
        checkoutPayload('ord_test_reference'),
        'whsec_test_secret',
    )->assertNotFound();
});

it('will not let one shop settle another shop order', function () {
    $fx = webhookFixture();

    // A second shop, with its own key, endpoint and secret.
    ['user' => $otherUser, 'workspace' => $otherWorkspace] = tenant();
    Sanctum::actingAs($otherUser);
    test()->withHeaders(['X-Workspace-Id' => (string) $otherWorkspace->id])
        ->putJson('/api/v1/payments/stripe', [
            'secret_key' => 'sk_test_other0002',
            'webhook_secret' => 'whsec_other_secret',
            'enabled' => true,
        ])->assertOk();
    $otherUrl = app(WorkspaceStripeService::class)->webhookUrl($otherWorkspace->fresh());

    // Correctly signed for the second shop, but naming the first shop's order.
    postWebhook($otherUrl, checkoutPayload('ord_test_reference'), 'whsec_other_secret')
        ->assertOk()
        ->assertJsonPath('handled', false);

    expect($fx['order']->fresh()->status)->toBe('pending');
});

it('ignores an event it has no business acting on', function () {
    $fx = webhookFixture();
    $payload = (string) json_encode([
        'id' => 'evt_2',
        'object' => 'event',
        'type' => 'customer.created',
        'data' => ['object' => ['id' => 'cus_1', 'object' => 'customer']],
    ]);

    // 200, so Stripe stops retrying something that will never be acted on.
    postWebhook($fx['url'], $payload, 'whsec_test_secret')
        ->assertOk()
        ->assertJsonPath('handled', false);

    expect($fx['order']->fresh()->status)->toBe('pending');
});

it('says so plainly when no webhook secret has been set yet', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    test()->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->putJson('/api/v1/payments/stripe', ['secret_key' => 'sk_test_key0001'])
        ->assertOk();

    // 422, not 500: retrying will not make a missing secret appear.
    postWebhook(
        app(WorkspaceStripeService::class)->webhookUrl($workspace->fresh()),
        checkoutPayload('nothing'),
        'whsec_anything',
    )->assertStatus(422);
});

it('settles the order by session id when the reference is missing', function () {
    $fx = webhookFixture();
    $payload = (string) json_encode([
        'id' => 'evt_3',
        'object' => 'event',
        'type' => 'checkout.session.completed',
        'data' => ['object' => [
            'id' => 'cs_test_1',
            'object' => 'checkout.session',
            'client_reference_id' => null,
            'metadata' => [],
        ]],
    ]);

    postWebhook($fx['url'], $payload, 'whsec_test_secret')->assertOk()->assertJsonPath('handled', true);

    expect($fx['order']->fresh()->status)->toBe('paid');
});
