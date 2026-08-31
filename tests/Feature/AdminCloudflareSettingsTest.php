<?php

use App\Models\CloudflareSetting;
use App\Services\Cloudflare\CloudflareClient;
use App\Services\Cloudflare\CloudflareSettingsService;
use Laravel\Sanctum\Sanctum;
use Tests\Support\FakeCloudflareClient;

function fakeCloudflare(): FakeCloudflareClient
{
    $fake = new FakeCloudflareClient;
    test()->app->instance(CloudflareClient::class, $fake);
    test()->app->forgetInstance(CloudflareSettingsService::class);

    return $fake;
}

it('keeps Cloudflare settings away from regular users', function () {
    ['user' => $user] = tenant();
    Sanctum::actingAs($user);

    $this->getJson('/api/v1/admin/cloudflare')->assertForbidden();
    $this->putJson('/api/v1/admin/cloudflare', ['enabled' => true])->assertForbidden();
    $this->postJson('/api/v1/admin/cloudflare/test')->assertForbidden();
});

it('stores Cloudflare for SaaS settings without ever returning the token', function () {
    ['user' => $admin] = adminTenant();
    Sanctum::actingAs($admin);

    $response = $this->putJson('/api/v1/admin/cloudflare', [
        'enabled' => true,
        'api_token' => 'cf-secret-token-value',
        'zone_id' => 'zone_123',
        'account_id' => 'acct_123',
        'fallback_origin' => 'https://Fallback.Example.com/',
        'cname_target' => 'cname.example.com',
        'apex_ips' => '198.51.100.10, not-an-ip, 198.51.100.11',
        'ssl_validation' => 'txt',
        'min_tls_version' => '1.3',
    ])->assertOk();

    expect($response->json('data.enabled'))->toBeTrue();
    expect($response->json('data.configured'))->toBeTrue();
    expect($response->json('data.api_token_configured'))->toBeTrue();
    expect($response->json('data.api_token_source'))->toBe('settings');
    expect($response->json('data.api_token_hint'))->not->toContain('secret-token');
    expect($response->json('data'))->not->toHaveKey('api_token');
    // Hostnames are normalised so a pasted URL still produces a valid record.
    expect($response->json('data.fallback_origin'))->toBe('fallback.example.com');
    expect($response->json('data.apex_ips'))->toBe('198.51.100.10, 198.51.100.11');
    expect($response->json('data.min_tls_version'))->toBe('1.3');

    // Applied to config, so CloudflareClient and the hostname service see it.
    expect(config('services.cloudflare.zone_id'))->toBe('zone_123');
    expect(config('uidesired.cloudflare.cname_target'))->toBe('cname.example.com');
    expect(config('uidesired.cloudflare.min_tls_version'))->toBe('1.3');

    // Stored encrypted, and readable back through the model cast.
    expect(CloudflareSetting::current()->api_token)->toBe('cf-secret-token-value');
    expect(CloudflareSetting::query()->value('api_token'))->not->toBe('cf-secret-token-value');

    // Omitting the token keeps it; sending "" clears it back to the environment.
    $this->putJson('/api/v1/admin/cloudflare', ['account_id' => 'acct_456'])->assertOk();
    expect(CloudflareSetting::current()->api_token)->toBe('cf-secret-token-value');

    $cleared = $this->putJson('/api/v1/admin/cloudflare', ['api_token' => ''])->assertOk();
    expect($cleared->json('data.api_token_configured'))->toBeFalse();
    expect($cleared->json('data.configured'))->toBeFalse();
});

it('checks the token can read the zone and its custom hostnames', function () {
    $fake = fakeCloudflare();
    ['user' => $admin] = adminTenant();
    Sanctum::actingAs($admin);

    $this->postJson('/api/v1/admin/cloudflare/test')
        ->assertStatus(422)
        ->assertJsonPath('data.ok', false);

    $this->putJson('/api/v1/admin/cloudflare', [
        'enabled' => true,
        'api_token' => 'cf-token',
        'zone_id' => 'zone_123',
    ])->assertOk();

    $ok = $this->postJson('/api/v1/admin/cloudflare/test')->assertOk();
    expect($ok->json('data.ok'))->toBeTrue();
    expect($ok->json('data.message'))->toContain('example.test');
    expect($ok->json('data.status.last_test_status'))->toBe('ok');

    $fake->tokenValid = false;
    $rejected = $this->postJson('/api/v1/admin/cloudflare/test')->assertStatus(422);
    expect($rejected->json('data.ok'))->toBeFalse();
    expect($rejected->json('data.message'))->toContain('Invalid API token');
});

it('syncs and reports the zone fallback origin', function () {
    $fake = fakeCloudflare();
    ['user' => $admin] = adminTenant();
    Sanctum::actingAs($admin);

    $this->putJson('/api/v1/admin/cloudflare', [
        'enabled' => true,
        'api_token' => 'cf-token',
        'zone_id' => 'zone_123',
    ])->assertOk();

    // No fallback origin configured yet: refuse rather than call Cloudflare.
    $this->postJson('/api/v1/admin/cloudflare/fallback-origin')
        ->assertStatus(422)
        ->assertJsonPath('data.ok', false);
    expect($fake->fallbackOrigin)->toBeNull();

    $this->putJson('/api/v1/admin/cloudflare', ['fallback_origin' => 'fallback.example.com'])->assertOk();

    $synced = $this->postJson('/api/v1/admin/cloudflare/fallback-origin')->assertOk();
    expect($synced->json('data.ok'))->toBeTrue();
    expect($fake->fallbackOrigin)->toBe('fallback.example.com');
    expect($synced->json('data.fallback.matches'))->toBeTrue();

    $status = $this->getJson('/api/v1/admin/cloudflare/fallback-origin')->assertOk();
    expect($status->json('data.origin'))->toBe('fallback.example.com');
    expect($status->json('data.status'))->toBe('active');

    // A drifted origin is reported rather than silently accepted.
    $fake->fallbackOrigin = 'stale.example.com';
    $drift = $this->getJson('/api/v1/admin/cloudflare/fallback-origin')->assertOk();
    expect($drift->json('data.matches'))->toBeFalse();
    expect($drift->json('data.expected'))->toBe('fallback.example.com');
});

it('reports the addresses root domains are pointed at', function () {
    fakeCloudflare();
    $resolver = fakeApexAddresses(['198.51.100.10'], ['2606:4700::1111']);
    ['user' => $admin] = adminTenant();
    Sanctum::actingAs($admin);

    $this->putJson('/api/v1/admin/cloudflare', [
        'enabled' => true,
        'api_token' => 'cf-token',
        'zone_id' => 'zone_123',
        'fallback_origin' => 'fallback.example.com',
        'cname_target' => 'cname.example.com',
    ])->assertOk();

    $addresses = $this->getJson('/api/v1/admin/cloudflare/apex-addresses')->assertOk();
    expect($addresses->json('data.ipv4'))->toBe(['198.51.100.10']);
    expect($addresses->json('data.ipv6'))->toBe(['2606:4700::1111']);
    expect($addresses->json('data.source'))->toBe('resolved');
    // Customers CNAME to the vanity target, so root domains copy its addresses.
    expect($addresses->json('data.target'))->toBe('cname.example.com');

    $status = $this->getJson('/api/v1/admin/cloudflare')->assertOk();
    expect($status->json('data.apex_addresses.ipv4'))->toBe(['198.51.100.10']);

    // An explicit override wins and skips the lookup entirely.
    $resolver->lookups = [];
    $this->putJson('/api/v1/admin/cloudflare', ['apex_ips' => '203.0.113.7'])->assertOk();
    $overridden = $this->getJson('/api/v1/admin/cloudflare/apex-addresses')->assertOk();
    expect($overridden->json('data.ipv4'))->toBe(['203.0.113.7']);
    expect($overridden->json('data.source'))->toBe('configured');
    expect($resolver->lookups)->toBe([]);
});

it('falls back to the environment when nothing is stored', function () {
    config([
        'services.cloudflare.api_token' => 'env-token',
        'services.cloudflare.zone_id' => 'env-zone',
        'services.cloudflare.fallback_origin' => 'env-fallback.example.com',
        'uidesired.cloudflare.saas_enabled' => true,
        'uidesired.cloudflare.cname_target' => null,
    ]);
    // Re-read the environment now that the test has set it.
    config(['uidesired.cloudflare_env' => null]);

    $status = app(CloudflareSettingsService::class)->status();

    expect($status['enabled'])->toBeTrue();
    expect($status['enabled_source'])->toBe('env');
    expect($status['api_token_source'])->toBe('env');
    expect($status['zone_id'])->toBe('env-zone');
    // With no vanity target set, customers CNAME straight at the fallback origin.
    expect($status['cname_target'])->toBe('env-fallback.example.com');
    expect($status['cname_target_source'])->toBe('fallback_origin');
    expect($status['configured'])->toBeTrue();
});
