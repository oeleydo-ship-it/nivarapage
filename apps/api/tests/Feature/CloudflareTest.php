<?php

use App\Contracts\DomainProviderInterface;
use App\Models\Domain;
use App\Services\Cloudflare\CloudflareClient;
use App\Services\Domains\CloudflareDomainProvider;
use Laravel\Sanctum\Sanctum;
use Tests\Support\FakeCloudflareClient;

it('talks to Cloudflare through the fake HTTP client for custom hostnames and purge', function () {
    $fake = new FakeCloudflareClient;
    $this->app->instance(CloudflareClient::class, $fake);
    $this->app->bind(DomainProviderInterface::class, CloudflareDomainProvider::class);
    config([
        'services.cloudflare.api_token' => 'test-token',
        'services.cloudflare.zone_id' => 'zone_fake',
        'uidesired.cloudflare.saas_enabled' => true,
        'uidesired.domain_provider' => 'cloudflare',
    ]);

    ['user' => $user, 'workspace' => $workspace] = tenant();
    $workspace->subscription->plan->update([
        'limits' => array_merge($workspace->subscription->plan->limits, ['custom_domains' => 2, 'number_of_sites' => 3]),
    ]);
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'CF Site', 'subdomain' => 'cfsite'])
        ->assertCreated()
        ->json('data');

    $response = $this->withHeaders($headers)
        ->postJson('/api/v1/sites/'.$site['id'].'/domains', ['hostname' => 'www.cloudflare-client.test'])
        ->assertCreated();

    expect($response->json('data.provider'))->toBe('cloudflare');
    $id = $response->json('data.provider_reference');
    expect($id)->toStartWith('cfh_');
    expect($fake->hostnames[$id]['status'])->toBe('pending');

    $fake->markActive($id);
    $status = app(DomainProviderInterface::class)->getStatus(Domain::query()->find($response->json('data.id')));
    expect($status['result']['status'])->toBe('active');
    expect($status['result']['ssl']['status'])->toBe('active');

    $this->withHeaders($headers)
        ->postJson('/api/v1/domains/'.$response->json('data.id').'/verify')
        ->assertOk();

    $domain = Domain::query()->findOrFail($response->json('data.id'));
    expect($domain->status)->toBe('active');
    expect($domain->ssl_status)->toBe('active');

    expect($fake->purgeHosts(['www.cloudflare-client.test'])['success'])->toBeTrue();
    expect($fake->purgedHosts)->toContain('www.cloudflare-client.test');
});
