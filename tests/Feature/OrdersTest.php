<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\Workspace;
use Laravel\Sanctum\Sanctum;

/**
 * What a workspace has sold.
 *
 * Read only by design: an order is opened by a checkout and settled by a
 * webhook, so there is nothing here a person should be able to change - least
 * of all whether something was paid for.
 */

/**
 * @return array{headers: array<string, string>, workspace: Workspace}
 */
function ordersFixture(): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    return ['headers' => ['X-Workspace-Id' => (string) $workspace->id], 'workspace' => $workspace];
}

function placeOrder(int $workspaceId, array $overrides = []): Order
{
    $product = Product::query()->firstOrCreate(
        ['workspace_id' => $workspaceId, 'slug' => 'kit'],
        ['name' => 'Starter Kit', 'price' => 4900, 'currency' => 'GBP', 'status' => 'active'],
    );

    return Order::query()->create(array_merge([
        'workspace_id' => $workspaceId,
        'product_id' => $product->id,
        'reference' => 'ord_'.uniqid(),
        'status' => 'paid',
        'amount' => 4900,
        'currency' => 'GBP',
        'customer_email' => 'bea@example.com',
        'paid_at' => now(),
    ], $overrides));
}

it('lists what this workspace sold, and names what was bought', function () {
    $fx = ordersFixture();
    placeOrder($fx['workspace']->id);

    $data = test()->withHeaders($fx['headers'])->getJson('/api/v1/orders')->assertOk()->json();

    expect($data['data'])->toHaveCount(1);
    expect($data['data'][0]['product']['name'])->toBe('Starter Kit');
    expect($data['data'][0]['customer_email'])->toBe('bea@example.com');
});

it('counts only the money that actually arrived', function () {
    $fx = ordersFixture();
    placeOrder($fx['workspace']->id);
    placeOrder($fx['workspace']->id, ['status' => 'pending', 'paid_at' => null]);
    placeOrder($fx['workspace']->id, ['status' => 'failed', 'paid_at' => null]);

    $meta = test()->withHeaders($fx['headers'])->getJson('/api/v1/orders')->assertOk()->json('meta');

    // A pending row is a checkout somebody opened and may never have paid.
    expect($meta['paid_count'])->toBe(1);
    expect($meta['paid_total'])->toBe(4900);
});

it('filters by status and searches by email or reference', function () {
    $fx = ordersFixture();
    placeOrder($fx['workspace']->id, ['customer_email' => 'ada@example.com']);
    placeOrder($fx['workspace']->id, ['status' => 'pending', 'customer_email' => 'bob@example.com', 'paid_at' => null]);

    expect(test()->withHeaders($fx['headers'])->getJson('/api/v1/orders?status=pending')->json('data'))->toHaveCount(1);
    expect(test()->withHeaders($fx['headers'])->getJson('/api/v1/orders?q=ada')->json('data'))->toHaveCount(1);
});

it('does not show one workspace what another one sold', function () {
    $fx = ordersFixture();
    placeOrder($fx['workspace']->id);

    ['user' => $otherUser, 'workspace' => $otherWorkspace] = tenant();
    Sanctum::actingAs($otherUser);

    test()->withHeaders(['X-Workspace-Id' => (string) $otherWorkspace->id])
        ->getJson('/api/v1/orders')
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

it('offers no way to change an order', function () {
    $fx = ordersFixture();
    $order = placeOrder($fx['workspace']->id, ['status' => 'pending', 'paid_at' => null]);

    // Marking something paid is the webhook's job and nobody else's.
    foreach (['patch', 'put', 'delete'] as $method) {
        test()->withHeaders($fx['headers'])
            ->json(strtoupper($method), '/api/v1/orders/'.$order->id, ['status' => 'paid'])
            ->assertStatus(405);
    }

    expect($order->fresh()->status)->toBe('pending');
});
