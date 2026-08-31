<?php

use App\Models\Activity;
use Laravel\Sanctum\Sanctum;
use Stripe\ApiRequestor;
use Stripe\HttpClient\CurlClient;
use Tests\Support\FakeStripeHttpClient;

afterEach(function () {
    config([
        'services.stripe.secret' => '',
        'services.stripe.key' => '',
        'services.stripe.webhook_secret' => '',
    ]);
    ApiRequestor::setHttpClient(new CurlClient);
});

it('lists active plans with prices and limits', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    $plans = $this->getJson('/api/v1/billing/plans')
        ->assertOk()
        ->assertJsonStructure(['data' => [['id', 'slug', 'name', 'prices', 'limits', 'is_active']]])
        ->json('data');

    expect(collect($plans)->pluck('slug')->all())->toBe(['free', 'starter', 'business', 'agency']);
    expect(collect($plans)->firstWhere('slug', 'starter')['prices']['monthly'])->toBe(1500);
});

it('returns the current subscription with plan and usage', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Usage Site', 'subdomain' => 'usagesite'])
        ->assertCreated();

    $this->withHeaders($headers)
        ->getJson('/api/v1/billing/subscription')
        ->assertOk()
        ->assertJsonPath('data.status', 'active')
        ->assertJsonPath('data.plan.slug', 'free')
        ->assertJsonPath('data.usage.number_of_sites.used', 1)
        ->assertJsonPath('data.usage.number_of_sites.limit', 1)
        ->assertJsonPath('data.usage.team_members.used', 1)
        ->assertJsonPath('data.usage.remove_branding.enabled', false);
});

it('changes plan, lifts limits, and writes an audit entry', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'First', 'subdomain' => 'firstsite'])
        ->assertCreated();
    $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Second', 'subdomain' => 'secondsite'])
        ->assertStatus(402);

    $this->withHeaders($headers)
        ->postJson('/api/v1/billing/change-plan', ['plan' => 'business'])
        ->assertOk()
        ->assertJsonPath('data.plan.slug', 'business')
        ->assertJsonPath('data.usage.number_of_sites.limit', 10)
        ->assertJsonPath('data.usage.remove_branding.enabled', true);

    $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Second', 'subdomain' => 'secondsite'])
        ->assertCreated();

    $activity = Activity::query()
        ->where('workspace_id', $workspace->id)
        ->where('action', 'billing.plan_changed')
        ->first();

    expect($activity)->not->toBeNull();
    expect($activity->metadata['from'])->toBe('free');
    expect($activity->metadata['to'])->toBe('business');
});

it('rejects unknown plan slugs', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    $this->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->postJson('/api/v1/billing/change-plan', ['plan' => 'enterprise-unlimited'])
        ->assertStatus(422);
});

it('returns usage and limit details on quota 402', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Only', 'subdomain' => 'onlysite'])
        ->assertCreated();

    $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Blocked', 'subdomain' => 'blockedsite'])
        ->assertStatus(402)
        ->assertJsonPath('error', 'plan_limit')
        ->assertJsonPath('limit_key', 'number_of_sites')
        ->assertJsonPath('used', 1)
        ->assertJsonPath('limit', 1)
        ->assertJsonPath('usage.number_of_sites.used', 1);
});

it('keeps local paid plan changes when stripe is not configured', function () {
    config(['services.stripe.secret' => '']);
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    $this->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->postJson('/api/v1/billing/change-plan', ['plan' => 'starter'])
        ->assertOk()
        ->assertJsonPath('data.plan.slug', 'starter')
        ->assertJsonPath('data.provider', 'local')
        ->assertJsonPath('data.stripe_enabled', false);
});

it('requires checkout for paid plans when stripe is configured', function () {
    config(['services.stripe.secret' => 'sk_test_fake']);
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    $this->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->postJson('/api/v1/billing/change-plan', ['plan' => 'starter'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['plan']);
});

it('returns 422 from checkout when stripe keys are missing', function () {
    config(['services.stripe.secret' => '']);
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    $this->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->postJson('/api/v1/billing/checkout', ['plan' => 'starter', 'interval' => 'monthly'])
        ->assertStatus(422);
});

it('returns a checkout session url when stripe http is faked', function () {
    config(['services.stripe.secret' => 'sk_test_fake', 'services.stripe.key' => 'pk_test_fake']);
    \Stripe\ApiRequestor::setHttpClient(new FakeStripeHttpClient);

    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    $this->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->postJson('/api/v1/billing/checkout', ['plan' => 'starter', 'interval' => 'monthly'])
        ->assertOk()
        ->assertJsonPath('data.url', 'https://checkout.stripe.com/c/pay/cs_test_fake')
        ->assertJsonPath('data.id', 'cs_test_fake');
});

it('rejects stripe webhooks with an invalid signature', function () {
    config(['services.stripe.webhook_secret' => 'whsec_test_secret']);

    $this->withHeaders(['Stripe-Signature' => 't=1,v1=deadbeef'])
        ->postJson('/api/v1/billing/webhook', ['type' => 'checkout.session.completed'])
        ->assertStatus(400)
        ->assertJsonPath('message', 'Invalid Stripe signature.');
});

it('applies a paid plan from a signed checkout webhook', function () {
    $secret = 'whsec_test_secret';
    config(['services.stripe.webhook_secret' => $secret]);

    ['user' => $user, 'workspace' => $workspace] = tenant();

    $payload = json_encode([
        'id' => 'evt_test_checkout',
        'object' => 'event',
        'type' => 'checkout.session.completed',
        'data' => [
            'object' => [
                'id' => 'cs_test_completed',
                'object' => 'checkout.session',
                'mode' => 'subscription',
                'customer' => 'cus_test_123',
                'subscription' => 'sub_test_123',
                'client_reference_id' => (string) $workspace->id,
                'metadata' => [
                    'workspace_id' => (string) $workspace->id,
                    'plan_slug' => 'starter',
                    'interval' => 'yearly',
                ],
            ],
        ],
    ], JSON_THROW_ON_ERROR);

    $timestamp = time();
    $signature = hash_hmac('sha256', $timestamp.'.'.$payload, $secret);

    $this->call('POST', '/api/v1/billing/webhook', [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_ACCEPT' => 'application/json',
        'HTTP_STRIPE_SIGNATURE' => 't='.$timestamp.',v1='.$signature,
    ], $payload)->assertOk();

    $workspace->refresh()->load('subscription.plan');
    expect($workspace->subscription?->plan?->slug)->toBe('starter');
    expect($workspace->subscription?->provider)->toBe('stripe');
    expect($workspace->subscription?->provider_ref)->toBe('sub_test_123');
    expect($workspace->stripe_customer_id)->toBe('cus_test_123');
    expect($workspace->branding_removed)->toBeTrue();
});

it('lets super admins update plan prices and limits', function () {
    ['user' => $user] = tenant(['is_super_admin' => true]);
    Sanctum::actingAs($user);

    $plan = App\Models\Plan::query()->where('slug', 'starter')->firstOrFail();

    $this->patchJson('/api/v1/admin/plans/'.$plan->id, [
        'name' => 'Starter Plus',
        'is_active' => true,
        'prices' => ['monthly' => 1900],
        'limits' => ['number_of_sites' => 4],
        'stripe_price_monthly' => 'price_test_monthly',
    ])->assertOk()
        ->assertJsonPath('data.name', 'Starter Plus')
        ->assertJsonPath('data.prices.monthly', 1900)
        ->assertJsonPath('data.limits.number_of_sites', 4)
        ->assertJsonPath('data.stripe_price_monthly', 'price_test_monthly');
});

it('lets super admins configure the stripe payment gateway from admin', function () {
    ['user' => $admin] = adminTenant();
    Sanctum::actingAs($admin);

    $this->getJson('/api/v1/admin/payment-gateway')
        ->assertOk()
        ->assertJsonPath('data.provider', 'stripe')
        ->assertJsonPath('data.enabled', true)
        ->assertJsonStructure(['data' => ['webhook_url', 'secret_source', 'publishable_source']]);

    $this->putJson('/api/v1/admin/payment-gateway', [
        'enabled' => true,
        'mode' => 'test',
        'publishable_key' => 'pk_test_admin_1234567890',
        'secret_key' => 'sk_test_admin_1234567890abcdef',
        'webhook_secret' => 'whsec_admin_test_secret',
    ])->assertOk()
        ->assertJsonPath('data.configured', true)
        ->assertJsonPath('data.publishable_key', 'pk_test_admin_1234567890')
        ->assertJsonPath('data.secret_source', 'settings')
        ->assertJsonPath('data.webhook_configured', true)
        ->assertJsonMissingPath('data.secret_key');

    expect(app(\App\Services\StripeGateway::class)->enabled())->toBeTrue();

    $this->putJson('/api/v1/admin/payment-gateway', [
        'enabled' => false,
    ])->assertOk()->assertJsonPath('data.configured', false);

    expect(app(\App\Services\StripeGateway::class)->enabled())->toBeFalse();
});
