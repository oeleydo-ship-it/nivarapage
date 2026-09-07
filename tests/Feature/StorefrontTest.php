<?php

use App\Models\Order;
use App\Models\Product;
use App\Services\Commerce\WorkspaceStripeService;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\Sanctum;
use Stripe\ApiRequestor;
use Stripe\HttpClient\ClientInterface;
use Stripe\HttpClient\CurlClient;

function storefrontFixture(): array {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    test()->withHeaders($headers)->putJson('/api/v1/payments/stripe', ['secret_key' => 'sk_test_fake', 'webhook_secret' => 'whsec_test', 'enabled' => true])->assertOk();
    $product = Product::query()->create(['workspace_id' => $workspace->id, 'name' => 'Digital kit', 'slug' => 'kit', 'price' => 1200, 'currency' => 'USD', 'type' => 'one_time', 'status' => 'active', 'inventory' => 3, 'metadata' => ['kind' => 'digital', 'delivery_url' => 'https://example.com/private-download', 'sku' => 'KIT-01', 'category' => 'Templates']]);
    return compact('workspace', 'product', 'headers');
}

it('exposes active product details without exposing digital delivery', function () {
    $fx = storefrontFixture();
    test()->getJson('/api/v1/public/products/'.$fx['product']->id)->assertOk()->assertJsonPath('data.sku', 'KIT-01')->assertJsonMissingPath('data.delivery_url')->assertJsonMissingPath('data.metadata');
    $fx['product']->update(['status' => 'draft']);
    test()->getJson('/api/v1/public/products/'.$fx['product']->id)->assertNotFound();
});

it('keeps delivery behind a signed receipt and confirmed payment', function () {
    $fx = storefrontFixture();
    $order = Order::query()->create(['workspace_id' => $fx['workspace']->id, 'product_id' => $fx['product']->id, 'reference' => 'ord_receipt', 'status' => 'pending', 'amount' => 1200, 'currency' => 'USD', 'metadata' => $fx['product']->metadata]);
    test()->get('/store/order/ord_receipt')->assertForbidden();
    $url = URL::temporarySignedRoute('store.receipt', now()->addHour(), ['reference' => $order->reference], absolute: false);
    test()->get($url)->assertOk()->assertDontSee('private-download')->assertSee('Confirming your payment');
    $order->update(['status' => 'paid']);
    test()->get($url)->assertOk()->assertSee('Access your digital product')->assertSee('private-download');
});

it('collects shipping and charges the server price through a mocked Stripe checkout', function () {
    $fx = storefrontFixture();
    $fx['product']->update(['metadata' => ['kind' => 'physical', 'shipping_price' => 500, 'shipping_countries' => ['AE']]]);
    $client = new class implements ClientInterface {
        public array $params = [];
        public function request($method, $absUrl, $headers, $params, $hasFile, $apiMode = 'v1', $maxNetworkRetries = null) {
            $this->params = $params;
            return [json_encode(['id' => 'cs_test_store', 'object' => 'checkout.session', 'url' => 'https://checkout.stripe.com/test']), 200, []];
        }
    };
    ApiRequestor::setHttpClient($client);
    try {
        $result = app(WorkspaceStripeService::class)->checkout($fx['product']);
        expect($result['order']->amount)->toBe(1700)
            ->and($client->params['line_items'][0]['price_data']['unit_amount'])->toBe(1200)
            ->and($client->params['shipping_address_collection']['allowed_countries'])->toBe(['AE'])
            ->and($client->params['shipping_options'][0]['shipping_rate_data']['fixed_amount']['amount'])->toBe(500)
            ->and($client->params['success_url'])->toContain('/store/order/');
    } finally { ApiRequestor::setHttpClient(CurlClient::instance()); }
});

it('does not deliver unpaid sessions and settles paid webhook duplicates only once', function () {
    $fx = storefrontFixture();
    $order = Order::query()->create(['workspace_id' => $fx['workspace']->id, 'product_id' => $fx['product']->id, 'reference' => 'ord_webhook', 'status' => 'pending', 'amount' => 1200, 'currency' => 'USD', 'metadata' => $fx['product']->metadata]);
    $send = function ($status) use ($fx) {
        $payload = json_encode(['id' => 'evt_test', 'object' => 'event', 'type' => 'checkout.session.completed', 'data' => ['object' => ['id' => 'cs_test', 'object' => 'checkout.session', 'client_reference_id' => 'ord_webhook', 'payment_status' => $status]]]);
        $time = time();
        return app(WorkspaceStripeService::class)->handleWebhook($fx['workspace'], $payload, 't='.$time.',v1='.hash_hmac('sha256', $time.'.'.$payload, 'whsec_test'));
    };
    $send('unpaid');
    expect($order->fresh()->status)->toBe('pending')->and($fx['product']->fresh()->inventory)->toBe(3);
    $send('paid'); $send('paid');
    expect($order->fresh()->status)->toBe('paid')->and($order->fresh()->metadata['fulfillment'])->toBe('delivered')->and($fx['product']->fresh()->inventory)->toBe(2);
});

it('allows fulfillment updates only for paid physical orders in the workspace', function () {
    $fx = storefrontFixture();
    $order = Order::query()->create(['workspace_id' => $fx['workspace']->id, 'product_id' => $fx['product']->id, 'reference' => 'ord_shipping', 'status' => 'pending', 'amount' => 1200, 'currency' => 'USD', 'metadata' => ['kind' => 'physical']]);
    test()->withHeaders($fx['headers'])->patchJson('/api/v1/orders/'.$order->id.'/fulfillment', ['fulfillment' => 'shipped'])->assertStatus(422);
    $order->update(['status' => 'paid']);
    test()->withHeaders($fx['headers'])->patchJson('/api/v1/orders/'.$order->id.'/fulfillment', ['fulfillment' => 'shipped', 'tracking_url' => 'https://example.com/track'])->assertOk()->assertJsonPath('data.status', 'paid')->assertJsonPath('data.metadata.fulfillment', 'shipped');
});


it('validates physical shipping and digital delivery configuration', function () {
    $fx = storefrontFixture();
    test()->withHeaders($fx['headers'])->postJson('/api/v1/products', ['name' => 'Shirt', 'price' => 2000, 'metadata' => ['kind' => 'physical']])->assertStatus(422)->assertJsonValidationErrors('metadata.shipping_countries');
    test()->withHeaders($fx['headers'])->postJson('/api/v1/products', ['name' => 'Download', 'price' => 2000, 'status' => 'active', 'metadata' => ['kind' => 'digital']])->assertStatus(422)->assertJsonValidationErrors('metadata.delivery_url');
    $product = test()->withHeaders($fx['headers'])->postJson('/api/v1/products', ['name' => 'Shirt', 'price' => 2000, 'metadata' => ['kind' => 'physical', 'sku' => 'SHIRT-1', 'shipping_countries' => ['AE'], 'shipping_price' => 300]])->assertCreated()->json('data');
    test()->withHeaders($fx['headers'])->patchJson('/api/v1/products/'.$product['id'], ['type' => 'subscription'])->assertStatus(422);
    test()->withHeaders($fx['headers'])->patchJson('/api/v1/products/'.$product['id'], ['metadata' => ['category' => 'Clothing']])->assertOk()->assertJsonPath('data.metadata.sku', 'SHIRT-1')->assertJsonPath('data.metadata.category', 'Clothing');
});
