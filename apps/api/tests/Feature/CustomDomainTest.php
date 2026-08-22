<?php

use App\Contracts\DomainProviderInterface;
use App\Models\Domain;
use App\Services\Cloudflare\CloudflareClient;
use App\Services\Domains\CloudflareDomainProvider;
use App\Support\DomainName;
use Laravel\Sanctum\Sanctum;
use Tests\Support\FakeCloudflareClient;

/**
 * Boots a workspace with the Cloudflare provider wired to the in-memory API.
 *
 * @return array{headers: array<string, string>, site: int, cf: FakeCloudflareClient}
 */
function domainFixture(): array
{
    $fake = new FakeCloudflareClient;
    app()->instance(CloudflareClient::class, $fake);
    app()->bind(DomainProviderInterface::class, CloudflareDomainProvider::class);
    config([
        'services.cloudflare.api_token' => 'test-token',
        'services.cloudflare.zone_id' => 'zone_fake',
        'uidesired.domain_provider' => 'cloudflare',
        'uidesired.cloudflare.saas_enabled' => true,
        'uidesired.cloudflare.cname_target' => 'edge.uidesired.test',
        'uidesired.cloudflare.apex_ips' => [],
        'uidesired.platform_domain' => 'sites.localhost',
    ]);

    ['user' => $user, 'workspace' => $workspace] = tenant();
    $workspace->subscription->plan->update([
        'limits' => array_merge($workspace->subscription->plan->limits, ['custom_domains' => 5, 'number_of_sites' => 5]),
    ]);
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $siteId = test()->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Domain Site', 'subdomain' => 'domainsite'])
        ->assertCreated()
        ->json('data.id');

    return ['headers' => $headers, 'site' => (int) $siteId, 'cf' => $fake];
}

function connectDomain(array $fx, string $hostname): array
{
    return test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/domains', ['hostname' => $hostname])
        ->assertCreated()
        ->json('data');
}

describe('apex detection', function () {
    it('recognises registrable roots', function () {
        expect(DomainName::isApex('example.com'))->toBeTrue();
        expect(DomainName::isApex('example.co.uk'))->toBeTrue();
        expect(DomainName::isApex('www.example.com'))->toBeFalse();
        expect(DomainName::isApex('www.example.co.uk'))->toBeFalse();
        expect(DomainName::isApex('shop.eu.example.com'))->toBeFalse();
    });

    it('reduces a hostname to the record name a registrar expects', function () {
        expect(DomainName::recordName('example.com'))->toBe('@');
        expect(DomainName::recordName('www.example.com'))->toBe('www');
        expect(DomainName::recordName('shop.eu.example.com'))->toBe('shop.eu');
        expect(DomainName::recordName('www.example.co.uk'))->toBe('www');
    });

    it('finds the registrable root', function () {
        expect(DomainName::registrableRoot('www.example.com'))->toBe('example.com');
        expect(DomainName::registrableRoot('a.b.example.co.uk'))->toBe('example.co.uk');
    });
});

it('returns the DNS records the customer has to create', function () {
    $fx = domainFixture();
    $domain = connectDomain($fx, 'www.example-connect.test');

    $dns = $domain['dns'];
    expect($dns['is_apex'])->toBeFalse();
    expect($dns['cname_target'])->toBe('edge.uidesired.test');

    $byPurpose = collect($dns['records'])->keyBy('purpose');

    expect($byPurpose['routing']['type'])->toBe('CNAME');
    expect($byPurpose['routing']['name'])->toBe('www');
    expect($byPurpose['routing']['value'])->toBe('edge.uidesired.test');

    // Names are relative to the zone, not fully qualified: that is what the
    // registrar's "host" field wants.
    expect($byPurpose['ownership']['type'])->toBe('TXT');
    expect($byPurpose['ownership']['name'])->toBe('_cf-custom-hostname.www');
    expect($byPurpose['certificate']['name'])->toBe('_acme-challenge.www');
    expect($byPurpose['certificate']['value'])->toStartWith('dv-');
});

it('tells an apex domain that a plain CNAME will not work', function () {
    $fx = domainFixture();
    $domain = connectDomain($fx, 'example-apex.test');

    $dns = $domain['dns'];
    expect($dns['is_apex'])->toBeTrue();
    expect(collect($dns['records'])->firstWhere('purpose', 'routing')['type'])->toBe('ALIAS');
    expect(collect($dns['records'])->firstWhere('purpose', 'routing')['name'])->toBe('@');
    expect(collect($dns['notes'])->contains(fn ($n) => str_contains($n, 'root domain')))->toBeTrue();
    expect(collect($dns['steps'])->contains(fn ($s) => str_contains($s['title'], 'apex')))->toBeTrue();
});

it('gives apex A records when the deployment configures them', function () {
    $fx = domainFixture();
    config(['uidesired.cloudflare.apex_ips' => ['198.51.100.10', '198.51.100.11']]);

    $domain = connectDomain($fx, 'example-arecords.test');

    $routing = collect($domain['dns']['records'])->where('purpose', 'routing')->values();
    expect($routing)->toHaveCount(2);
    expect($routing[0]['type'])->toBe('A');
    expect($routing[0]['value'])->toBe('198.51.100.10');
});

it('registers the hostname with Cloudflare exactly once', function () {
    $fx = domainFixture();
    connectDomain($fx, 'www.example-once.test');

    $creates = collect($fx['cf']->calls)
        ->filter(fn ($call) => $call[0] === 'POST' && str_ends_with($call[1], 'custom_hostnames'))
        ->count();

    expect($creates)->toBe(1);
});

it('asks Cloudflare for TXT validation so ownership can be proved before DNS moves', function () {
    $fx = domainFixture();
    connectDomain($fx, 'www.example-txt.test');

    $create = collect($fx['cf']->calls)->first(fn ($call) => $call[0] === 'POST' && str_ends_with($call[1], 'custom_hostnames'));
    expect($create[2]['json']['ssl']['method'])->toBe('txt');
    expect($create[2]['json']['ssl']['type'])->toBe('dv');
});

it('refuses a hostname on the platform domain', function () {
    $fx = domainFixture();

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/domains', ['hostname' => 'someone.sites.localhost'])
        ->assertStatus(422);
});

it('refuses an IP address', function () {
    $fx = domainFixture();

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/domains', ['hostname' => '203.0.113.10'])
        ->assertStatus(422);
});

it('lets a removed domain be connected again', function () {
    $fx = domainFixture();
    $domain = connectDomain($fx, 'www.example-readd.test');

    test()->withHeaders($fx['headers'])
        ->deleteJson('/api/v1/domains/'.$domain['id'])
        ->assertOk();

    // The row is only soft deleted; the unique index must not block a re-add.
    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/domains', ['hostname' => 'www.example-readd.test'])
        ->assertCreated();
});

it('does not go live while the certificate is still issuing', function () {
    $fx = domainFixture();
    $domain = connectDomain($fx, 'www.example-ssl.test');

    // Hostname validated, certificate not issued yet.
    $fx['cf']->hostnames[$domain['provider_reference']]['status'] = 'active';

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/domains/'.$domain['id'].'/verify')
        ->assertOk()
        ->assertJsonPath('data.status', 'ssl_pending');

    expect(Domain::query()->find($domain['id'])->status)->not->toBe('active');
});

it('goes live once the hostname and certificate are both active', function () {
    $fx = domainFixture();
    $domain = connectDomain($fx, 'www.example-live.test');
    $fx['cf']->markActive($domain['provider_reference']);

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/domains/'.$domain['id'].'/verify')
        ->assertOk();

    $fresh = Domain::query()->findOrFail($domain['id']);
    expect($fresh->status)->toBe('active');
    expect($fresh->ssl_status)->toBe('active');
});

it('asks Cloudflare to re-check when the customer presses check', function () {
    $fx = domainFixture();
    $domain = connectDomain($fx, 'www.example-recheck.test');

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/domains/'.$domain['id'].'/verify')
        ->assertOk();

    expect($fx['cf']->revalidated)->toContain($domain['provider_reference']);
});

it('surfaces Cloudflare validation errors to the customer', function () {
    $fx = domainFixture();
    $domain = connectDomain($fx, 'www.example-error.test');

    $fx['cf']->hostnames[$domain['provider_reference']]['ssl']['validation_errors'] = [
        ['message' => 'caa_error: CAA record forbids this CA'],
    ];

    $dns = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/domains/'.$domain['id'].'/verify')
        ->assertOk()
        ->json('data.dns');

    expect($dns['errors'])->toContain('caa_error: CAA record forbids this CA');
});

it('does not attach DNS instructions to the platform subdomain', function () {
    $fx = domainFixture();

    $rows = test()->withHeaders($fx['headers'])
        ->getJson('/api/v1/sites/'.$fx['site'].'/domains')
        ->assertOk()
        ->json('data');

    $platform = collect($rows)->firstWhere('type', 'subdomain');
    expect($platform)->not->toBeNull();
    expect($platform)->not->toHaveKey('dns');
});
