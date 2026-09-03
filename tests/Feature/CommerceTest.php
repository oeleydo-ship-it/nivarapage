<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspacePaymentSetting;
use App\Services\Commerce\WorkspaceStripeService;
use Laravel\Sanctum\Sanctum;

/**
 * Selling, through the customer's own Stripe account.
 *
 * The platform's own gateway settings are a single row used to charge
 * workspaces for their plan. These are the customer's credentials: the charge
 * lands in their account and the platform is never in the money path. The two
 * must never be confused, which is most of what these tests are about.
 */

/**
 * @return array{headers: array<string, string>, workspace: Workspace, user: User}
 */
function shopFixture(): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    return ['headers' => ['X-Workspace-Id' => (string) $workspace->id], 'workspace' => $workspace, 'user' => $user];
}

function makeProduct(array $headers, array $overrides = []): array
{
    return test()->withHeaders($headers)
        ->postJson('/api/v1/products', array_merge([
            'name' => 'Starter Kit',
            'price' => 4900,
            'currency' => 'GBP',
            'status' => 'active',
        ], $overrides))
        ->assertCreated()
        ->json('data');
}

it('keeps prices in minor units so nothing rounds on the way through', function () {
    $fx = shopFixture();
    $product = makeProduct($fx['headers'], ['price' => 4999]);

    expect($product['price'])->toBe(4999);
    expect($product['currency'])->toBe('GBP');
    expect(Product::query()->sole()->price)->toBe(4999);
});

it('gives every product a slug of its own within the workspace', function () {
    $fx = shopFixture();
    $first = makeProduct($fx['headers'], ['name' => 'Starter Kit']);
    $second = makeProduct($fx['headers'], ['name' => 'Starter Kit']);

    expect($first['slug'])->toBe('starter-kit');
    expect($second['slug'])->toBe('starter-kit-2');
});

it('drops the billing interval when a product stops being a subscription', function () {
    $fx = shopFixture();
    $product = makeProduct($fx['headers'], ['type' => 'subscription', 'interval' => 'month']);
    expect($product['interval'])->toBe('month');

    $updated = test()->withHeaders($fx['headers'])
        ->patchJson('/api/v1/products/'.$product['id'], ['type' => 'one_time'])
        ->assertOk()
        ->json('data');

    // A one-off price with a recurring interval would be sent to Stripe as a
    // subscription for something bought once.
    expect($updated['interval'])->toBeNull();
});

it('does not show one workspace the products of another', function () {
    $fx = shopFixture();
    $product = makeProduct($fx['headers']);

    ['user' => $otherUser, 'workspace' => $otherWorkspace] = tenant();
    Sanctum::actingAs($otherUser);
    $otherHeaders = ['X-Workspace-Id' => (string) $otherWorkspace->id];

    test()->withHeaders($otherHeaders)->getJson('/api/v1/products')->assertOk()->assertJsonCount(0, 'data');
    // Not found rather than forbidden: the API never confirms it exists.
    test()->withHeaders($otherHeaders)->getJson('/api/v1/products/'.$product['id'])->assertNotFound();
    test()->withHeaders($otherHeaders)->patchJson('/api/v1/products/'.$product['id'], ['name' => 'Stolen'])->assertNotFound();
    test()->withHeaders($otherHeaders)->deleteJson('/api/v1/products/'.$product['id'])->assertNotFound();
});

it('never hands a stripe secret back once it is stored', function () {
    $fx = shopFixture();

    $saved = test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/payments/stripe', [
            'secret_key' => 'sk_test_abcdefghijklmnop1234',
            'webhook_secret' => 'whsec_abcdef',
            'publishable_key' => 'pk_test_visible',
            'enabled' => true,
        ])
        ->assertOk()
        ->json('data');

    expect($saved['connected'])->toBeTrue();
    expect($saved['webhook_set'])->toBeTrue();
    // Only the last four characters, so the right key is recognisable without
    // being readable.
    expect($saved['secret_hint'])->toBe('1234');
    expect($saved['publishable_key'])->toBe('pk_test_visible');

    $body = test()->withHeaders($fx['headers'])->getJson('/api/v1/payments/stripe')->assertOk()->getContent();
    expect($body)->not->toContain('sk_test_abcdefghijklmnop1234');
    expect($body)->not->toContain('whsec_abcdef');

    // Stored encrypted, not in the clear.
    expect(WorkspacePaymentSetting::query()->sole()->getRawOriginal('secret_key'))
        ->not->toContain('sk_test_abcdefghijklmnop1234');
});

it('leaves the stored key alone when the field comes back blank', function () {
    $fx = shopFixture();
    test()->withHeaders($fx['headers'])->putJson('/api/v1/payments/stripe', ['secret_key' => 'sk_test_original0001'])->assertOk();

    // Saving the currency must not wipe a key the form never had.
    $saved = test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/payments/stripe', ['currency' => 'EUR', 'secret_key' => ''])
        ->assertOk()
        ->json('data');

    expect($saved['currency'])->toBe('EUR');
    expect($saved['secret_hint'])->toBe('0001');
});

it('reads the mode off the key rather than trusting what was sent', function () {
    $fx = shopFixture();

    $test = test()->withHeaders($fx['headers'])->putJson('/api/v1/payments/stripe', ['secret_key' => 'sk_test_key0001'])->json('data');
    expect($test['mode'])->toBe('test');

    $live = test()->withHeaders($fx['headers'])->putJson('/api/v1/payments/stripe', ['secret_key' => 'sk_live_key0002'])->json('data');
    expect($live['mode'])->toBe('live');
});

it('forgets everything when the account is disconnected', function () {
    $fx = shopFixture();
    test()->withHeaders($fx['headers'])->putJson('/api/v1/payments/stripe', [
        'secret_key' => 'sk_test_key0001',
        'webhook_secret' => 'whsec_x',
        'enabled' => true,
    ])->assertOk();

    $after = test()->withHeaders($fx['headers'])->deleteJson('/api/v1/payments/stripe')->assertOk()->json('data');

    expect($after['connected'])->toBeFalse();
    expect($after['webhook_set'])->toBeFalse();
    expect($after['enabled'])->toBeFalse();
});

it('refuses to sell when no stripe account is connected', function () {
    $fx = shopFixture();
    $product = Product::query()->findOrFail(makeProduct($fx['headers'])['id']);

    expect(fn () => app(WorkspaceStripeService::class)->checkout($product))
        ->toThrow(RuntimeException::class, 'not accepting payments');

    // Nothing half-opened.
    expect(Order::query()->count())->toBe(0);
});

it('refuses to sell a product that is not on sale', function () {
    $fx = shopFixture();
    test()->withHeaders($fx['headers'])->putJson('/api/v1/payments/stripe', ['secret_key' => 'sk_test_key0001', 'enabled' => true])->assertOk();

    $draft = Product::query()->findOrFail(makeProduct($fx['headers'], ['name' => 'Draft', 'status' => 'draft'])['id']);
    expect(fn () => app(WorkspaceStripeService::class)->checkout($draft))
        ->toThrow(RuntimeException::class, 'not on sale');

    $soldOut = Product::query()->findOrFail(makeProduct($fx['headers'], ['name' => 'Sold out', 'inventory' => 0])['id']);
    expect(fn () => app(WorkspaceStripeService::class)->checkout($soldOut))
        ->toThrow(RuntimeException::class, 'not on sale');
});

it('knows whether a workspace can take money yet', function () {
    $fx = shopFixture();
    $stripe = app(WorkspaceStripeService::class);

    expect($stripe->connected($fx['workspace']))->toBeFalse();

    // A key on its own is not enough; selling has to be switched on.
    test()->withHeaders($fx['headers'])->putJson('/api/v1/payments/stripe', ['secret_key' => 'sk_test_key0001'])->assertOk();
    expect($stripe->connected($fx['workspace']->fresh()))->toBeFalse();

    test()->withHeaders($fx['headers'])->putJson('/api/v1/payments/stripe', ['enabled' => true])->assertOk();
    expect($stripe->connected($fx['workspace']->fresh()))->toBeTrue();
});

it('says what is wrong instead of pretending to verify without a key', function () {
    $fx = shopFixture();

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/payments/stripe/verify')
        ->assertStatus(422)
        ->assertJsonPath('data.ok', false)
        ->assertJsonPath('data.message', 'Add your Stripe secret key first.');
});

it('will not settle an order without a webhook secret to check the signature', function () {
    $fx = shopFixture();
    test()->withHeaders($fx['headers'])->putJson('/api/v1/payments/stripe', ['secret_key' => 'sk_test_key0001'])->assertOk();

    expect(fn () => app(WorkspaceStripeService::class)->handleWebhook($fx['workspace']->fresh(), '{}', 'sig'))
        ->toThrow(RuntimeException::class, 'No webhook secret');
});
