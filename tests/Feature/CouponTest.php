<?php

use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\Workspace;
use App\Services\Commerce\WorkspaceStripeService;
use Laravel\Sanctum\Sanctum;

/**
 * Discount codes.
 *
 * A code travels in the request; what it is worth never does. The discount is
 * worked out on the server from the stored row, so a page - stale, or edited in
 * a browser - cannot decide what something costs.
 */

/**
 * @return array{headers: array<string, string>, workspace: Workspace}
 */
function couponShop(): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    return ['headers' => ['X-Workspace-Id' => (string) $workspace->id], 'workspace' => $workspace];
}

function couponProduct(int $workspaceId, array $overrides = []): Product
{
    return Product::query()->create(array_merge([
        'workspace_id' => $workspaceId,
        'name' => 'Starter Kit',
        'slug' => 'kit-'.uniqid(),
        'price' => 10000,
        'currency' => 'GBP',
        'status' => 'active',
    ], $overrides));
}

function makeCoupon(int $workspaceId, array $overrides = []): Coupon
{
    return Coupon::query()->create(array_merge([
        'workspace_id' => $workspaceId,
        'code' => 'SAVE20',
        'type' => 'percent',
        'value' => 20,
        'status' => 'active',
    ], $overrides));
}

it('takes a percentage off, in whole minor units', function () {
    $fx = couponShop();
    $product = couponProduct($fx['workspace']->id, ['price' => 9999]);
    $coupon = makeCoupon($fx['workspace']->id, ['value' => 20]);

    // 20% of 9999 is 1999.8 - rounded down, so the shop never loses the penny.
    expect($coupon->discountFor($product))->toBe(1999);
});

it('never discounts more than the thing costs', function () {
    $fx = couponShop();
    $product = couponProduct($fx['workspace']->id, ['price' => 500]);

    $fixed = makeCoupon($fx['workspace']->id, ['code' => 'BIG', 'type' => 'fixed', 'value' => 99999]);

    // Stripe will not take a negative amount, and a shop meaning to discount
    // should not end up owing anybody.
    expect($fixed->discountFor($product))->toBe(500);
});

it('refuses a code that is not for this product', function () {
    $fx = couponShop();
    $product = couponProduct($fx['workspace']->id);
    $other = couponProduct($fx['workspace']->id, ['name' => 'Other']);

    $scoped = makeCoupon($fx['workspace']->id, ['code' => 'ONLYTHAT', 'product_id' => $other->id]);

    expect($scoped->usableFor($product))->toBeFalse();
    expect($scoped->usableFor($other))->toBeTrue();
});

it('refuses a code outside its dates, or spent, or switched off', function () {
    $fx = couponShop();
    $product = couponProduct($fx['workspace']->id);

    expect(makeCoupon($fx['workspace']->id, ['code' => 'EARLY', 'starts_at' => now()->addDay()])->usableFor($product))->toBeFalse();
    expect(makeCoupon($fx['workspace']->id, ['code' => 'LATE', 'expires_at' => now()->subDay()])->usableFor($product))->toBeFalse();
    expect(makeCoupon($fx['workspace']->id, ['code' => 'OFF', 'status' => 'disabled'])->usableFor($product))->toBeFalse();

    $spent = makeCoupon($fx['workspace']->id, ['code' => 'SPENT', 'max_redemptions' => 1]);
    // increment(), the way a payment counts one, rather than update(): the
    // column is deliberately not fillable so a shop cannot type it.
    $spent->increment('redeemed_count');
    expect($spent->fresh()->usableFor($product))->toBeFalse();
});

it('refuses a fixed discount written in another currency', function () {
    $fx = couponShop();
    $product = couponProduct($fx['workspace']->id, ['currency' => 'GBP']);

    // Ten dollars off is not ten pounds off.
    $usd = makeCoupon($fx['workspace']->id, ['code' => 'TENOFF', 'type' => 'fixed', 'value' => 1000, 'currency' => 'USD']);

    expect($usd->usableFor($product))->toBeFalse();
});

it('will not let a code from one shop work in another', function () {
    $fx = couponShop();
    $product = couponProduct($fx['workspace']->id);

    ['workspace' => $other] = tenant();
    $theirs = makeCoupon($other->id, ['code' => 'THEIRS']);

    expect($theirs->usableFor($product))->toBeFalse();
});

it('matches a code whatever case it was typed in', function () {
    $fx = couponShop();
    makeCoupon($fx['workspace']->id, ['code' => 'SAVE20']);

    expect(Coupon::normalizeCode(' save20 '))->toBe('SAVE20');
    expect(Coupon::query()->where('code', Coupon::normalizeCode('save20'))->exists())->toBeTrue();
});

it('opens the order at the discounted price', function () {
    $fx = couponShop();
    test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/payments/stripe', ['secret_key' => 'sk_test_key0001', 'enabled' => true])
        ->assertOk();
    $product = couponProduct($fx['workspace']->id, ['price' => 10000]);
    $coupon = makeCoupon($fx['workspace']->id);

    // Stripe refuses the fake key, but the order is written before it is called.
    try {
        app(WorkspaceStripeService::class)->checkout($product, ['coupon' => 'save20']);
    } catch (RuntimeException) {
        // Expected: there is no real Stripe here.
    }

    $order = Order::query()->latest('id')->first();
    expect($order->amount)->toBe(8000);
    expect($order->discount)->toBe(2000);
    expect($order->coupon_id)->toBe($coupon->id);

    // Not counted yet: nobody has paid.
    expect($coupon->fresh()->redeemed_count)->toBe(0);
});

it('ignores an unusable code rather than refusing the sale', function () {
    $fx = couponShop();
    test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/payments/stripe', ['secret_key' => 'sk_test_key0001', 'enabled' => true])
        ->assertOk();
    $product = couponProduct($fx['workspace']->id, ['price' => 10000]);

    try {
        app(WorkspaceStripeService::class)->checkout($product, ['coupon' => 'NOSUCHCODE']);
    } catch (RuntimeException) {
        // Expected.
    }

    // The shopper still gets to buy, at the price on the page.
    $order = Order::query()->latest('id')->first();
    expect($order->amount)->toBe(10000);
    expect($order->discount)->toBe(0);
    expect($order->coupon_id)->toBeNull();
});

it('does not let a code be created twice in one shop', function () {
    $fx = couponShop();

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/coupons', ['code' => 'SAVE20', 'value' => 20])
        ->assertCreated();

    // Same code, different case: still the same code.
    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/coupons', ['code' => 'save20', 'value' => 30])
        ->assertStatus(422);
});

it('lets two different shops both run SAVE20', function () {
    $fx = couponShop();
    test()->withHeaders($fx['headers'])->postJson('/api/v1/coupons', ['code' => 'SAVE20', 'value' => 20])->assertCreated();

    ['user' => $otherUser, 'workspace' => $otherWorkspace] = tenant();
    Sanctum::actingAs($otherUser);

    test()->withHeaders(['X-Workspace-Id' => (string) $otherWorkspace->id])
        ->postJson('/api/v1/coupons', ['code' => 'SAVE20', 'value' => 50])
        ->assertCreated();
});

it('caps a percentage at one hundred', function () {
    $fx = couponShop();

    $coupon = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/coupons', ['code' => 'HUGE', 'type' => 'percent', 'value' => 500])
        ->assertCreated()
        ->json('data');

    expect($coupon['value'])->toBe(100);
});

it('will not scope a code to another shop product', function () {
    $fx = couponShop();
    ['workspace' => $other] = tenant();
    $theirs = couponProduct($other->id);

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/coupons', ['code' => 'SNEAKY', 'value' => 10, 'product_id' => $theirs->id])
        ->assertStatus(422);
});

it('does not let a shop type its own redemption count', function () {
    $fx = couponShop();
    $coupon = makeCoupon($fx['workspace']->id, ['max_redemptions' => 1]);
    $coupon->increment('redeemed_count');

    test()->withHeaders($fx['headers'])
        ->patchJson('/api/v1/coupons/'.$coupon->id, ['redeemed_count' => 0])
        ->assertOk();

    // Otherwise a limited code could be handed back out by editing it.
    expect($coupon->fresh()->redeemed_count)->toBe(1);
});

it('does not show one shop the codes of another', function () {
    $fx = couponShop();
    makeCoupon($fx['workspace']->id);

    ['user' => $otherUser, 'workspace' => $otherWorkspace] = tenant();
    Sanctum::actingAs($otherUser);

    test()->withHeaders(['X-Workspace-Id' => (string) $otherWorkspace->id])
        ->getJson('/api/v1/coupons')
        ->assertOk()
        ->assertJsonCount(0, 'data');
});
