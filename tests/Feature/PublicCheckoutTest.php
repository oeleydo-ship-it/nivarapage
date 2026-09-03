<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\Workspace;
use Laravel\Sanctum\Sanctum;

/**
 * The endpoint a buy button on a published page calls.
 *
 * Public, because the person clicking is the workspace's customer rather than a
 * user of the platform. Nothing about the price comes from the request.
 */

/**
 * @return array{headers: array<string, string>, workspace: Workspace}
 */
function checkoutShop(bool $connected = true): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    if ($connected) {
        test()->withHeaders($headers)->putJson('/api/v1/payments/stripe', [
            'secret_key' => 'sk_test_key0001',
            'enabled' => true,
        ])->assertOk();
    }

    return ['headers' => $headers, 'workspace' => $workspace];
}

function sellable(int $workspaceId, array $overrides = []): Product
{
    return Product::query()->create(array_merge([
        'workspace_id' => $workspaceId,
        'name' => 'Starter Kit',
        'slug' => 'starter-kit-'.uniqid(),
        'price' => 4900,
        'currency' => 'GBP',
        'status' => 'active',
    ], $overrides));
}

it('will not open a checkout for a product that is not published', function () {
    $fx = checkoutShop();

    foreach (['draft', 'archived'] as $status) {
        $product = sellable($fx['workspace']->id, ['status' => $status]);

        // The same answer a made-up id gets, so the endpoint never says what a
        // workspace has that it has not put on sale.
        test()->postJson('/api/v1/public/products/'.$product->id.'/checkout')
            ->assertNotFound()
            ->assertJsonPath('error', 'unavailable');
    }

    test()->postJson('/api/v1/public/products/999999/checkout')->assertNotFound();
    expect(Order::query()->count())->toBe(0);
});

it('tells the shopper plainly when the shop cannot take money yet', function () {
    $fx = checkoutShop(connected: false);
    $product = sellable($fx['workspace']->id);

    test()->postJson('/api/v1/public/products/'.$product->id.'/checkout')
        ->assertStatus(422)
        ->assertJsonPath('error', 'checkout_failed');

    // Nothing half-opened when the shop was never able to sell.
    expect(Order::query()->count())->toBe(0);
});

it('will not sell something that is out of stock', function () {
    $fx = checkoutShop();
    $product = sellable($fx['workspace']->id, ['inventory' => 0]);

    test()->postJson('/api/v1/public/products/'.$product->id.'/checkout')->assertStatus(422);
    expect(Order::query()->count())->toBe(0);
});

it('checks the email it was given rather than passing anything to Stripe', function () {
    $fx = checkoutShop();
    $product = sellable($fx['workspace']->id);

    test()->postJson('/api/v1/public/products/'.$product->id.'/checkout', ['email' => 'not-an-email'])
        ->assertStatus(422)
        ->assertJsonValidationErrors('email');
});

it('refuses a success url that is not a url', function () {
    $fx = checkoutShop();
    $product = sellable($fx['workspace']->id);

    test()->postJson('/api/v1/public/products/'.$product->id.'/checkout', ['success_url' => 'javascript:alert(1)'])
        ->assertStatus(422)
        ->assertJsonValidationErrors('success_url');
});

it('takes no price from the request', function () {
    $fx = checkoutShop();
    $product = sellable($fx['workspace']->id, ['price' => 4900]);

    // A page that has gone stale, or been edited in a browser, must not be able
    // to change what is charged. The keys are simply not read - validation
    // drops what it has no rule for - so the order is opened at the product's
    // own price and the injected one goes nowhere. Stripe then refuses the test
    // key, which is why this ends as a 422.
    test()->postJson('/api/v1/public/products/'.$product->id.'/checkout', [
        'price' => 1,
        'amount' => 1,
    ])->assertStatus(422);

    expect($product->fresh()->price)->toBe(4900);
    foreach (Order::query()->get() as $order) {
        expect($order->amount)->toBe(4900);
    }
});
