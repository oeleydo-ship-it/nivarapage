<?php

use App\Contracts\DomainProviderInterface;
use App\Models\Domain;
use App\Services\Cloudflare\CloudflareClient;
use App\Services\Domains\CloudflareDomainProvider;
use App\Services\Domains\DnsProviderProbe;
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

it('falls back to an ALIAS record when a root domain has no addresses to offer', function () {
    $fx = domainFixture();
    $domain = connectDomain($fx, 'example-apex.test');

    $dns = $domain['dns'];
    expect($dns['is_apex'])->toBeTrue();
    $routing = collect($dns['records'])->where('purpose', 'routing')->values();
    expect($routing)->toHaveCount(1);
    expect($routing[0]['type'])->toBe('ALIAS');
    expect($routing[0]['name'])->toBe('@');
    // The only option left, so it is not presented as one of two.
    expect($routing[0]['required'])->toBeTrue();
    expect($routing[0]['option_label'])->toBeNull();
    expect(collect($dns['notes'])->contains(fn ($n) => str_contains($n, 'root domain')))->toBeTrue();
});

it('offers a root domain both an ALIAS and the A records our edge resolves to', function () {
    $fx = domainFixture();
    $resolver = fakeApexAddresses(['198.51.100.10', '198.51.100.11'], ['2606:4700::1111']);

    $domain = connectDomain($fx, 'example-arecords.test');
    $dns = $domain['dns'];

    expect($dns['apex_source'])->toBe('resolved');
    expect($dns['apex_ips'])->toBe(['198.51.100.10', '198.51.100.11']);
    // Addresses are copied from whatever customers are told to CNAME to.
    expect($resolver->lookups)->toBe(['edge.uidesired.test']);

    $routing = collect($dns['records'])->where('purpose', 'routing')->values();
    expect($routing)->toHaveCount(4);

    expect($routing[0]['type'])->toBe('ALIAS');
    expect($routing[0]['value'])->toBe('edge.uidesired.test');
    expect($routing[0]['option'])->toBe('alias');
    expect($routing[0]['option_label'])->toContain('Option A');

    expect($routing[1]['type'])->toBe('A');
    expect($routing[1]['name'])->toBe('@');
    expect($routing[1]['value'])->toBe('198.51.100.10');
    expect($routing[1]['option'])->toBe('address');
    expect($routing[2]['value'])->toBe('198.51.100.11');
    expect($routing[3]['type'])->toBe('AAAA');
    expect($routing[3]['value'])->toBe('2606:4700::1111');

    // One choice or the other - the panel must never read as "create all four".
    expect($routing->every(fn ($record) => $record['required'] === false))->toBeTrue();
    expect(collect($dns['steps'])->contains(fn ($s) => str_contains($s['detail'], 'never both')))->toBeTrue();
});

it('prefers a configured apex address override over what DNS says', function () {
    $fx = domainFixture();
    $resolver = fakeApexAddresses(['198.51.100.10']);
    config(['uidesired.cloudflare.apex_ips' => ['203.0.113.7']]);

    $dns = connectDomain($fx, 'example-override.test')['dns'];

    expect($dns['apex_source'])->toBe('configured');
    expect($dns['apex_ips'])->toBe(['203.0.113.7']);
    expect($resolver->lookups)->toBe([]);
});

it('leaves subdomains on a plain CNAME', function () {
    $fx = domainFixture();
    fakeApexAddresses(['198.51.100.10']);

    $routing = collect(connectDomain($fx, 'www.example-sub.test')['dns']['records'])
        ->where('purpose', 'routing')
        ->values();

    expect($routing)->toHaveCount(1);
    expect($routing[0]['type'])->toBe('CNAME');
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

describe('hostnames inside the platform zone', function () {
    it('routes them directly instead of registering a custom hostname', function () {
        $fx = domainFixture();

        // Our edge lives at edge.uidesired.test, so uidesired.test is our own
        // zone. Cloudflare refuses a custom hostname that matches the zone name.
        app()->instance(DnsProviderProbe::class, new class extends DnsProviderProbe
        {
            public function resolves(string $hostname): bool
            {
                return true;
            }
        });

        test()->withHeaders($fx['headers'])
            ->postJson('/api/v1/sites/'.$fx['site'].'/domains', ['hostname' => 'uidesired.test'])
            ->assertCreated();

        $domain = Domain::query()->where('hostname', 'uidesired.test')->firstOrFail();

        expect($domain->provider)->toBe('platform')
            ->and($domain->status)->toBe('active')
            // Cloudflare was never asked to create anything.
            ->and($fx['cf']->hostnames)->toBe([]);
    });

    it('waits for the record when nothing resolves yet', function () {
        $fx = domainFixture();

        app()->instance(DnsProviderProbe::class, new class extends DnsProviderProbe
        {
            public function resolves(string $hostname): bool
            {
                return false;
            }
        });

        test()->withHeaders($fx['headers'])
            ->postJson('/api/v1/sites/'.$fx['site'].'/domains', ['hostname' => 'www.uidesired.test'])
            ->assertCreated();

        $domain = Domain::query()->where('hostname', 'www.uidesired.test')->firstOrFail();

        expect($domain->provider)->toBe('platform')
            ->and($domain->status)->toBe('verifying')
            ->and($fx['cf']->hostnames)->toBe([]);
    });

    it('still uses Cloudflare for a domain outside the zone', function () {
        $fx = domainFixture();

        test()->withHeaders($fx['headers'])
            ->postJson('/api/v1/sites/'.$fx['site'].'/domains', ['hostname' => 'acme.test'])
            ->assertCreated();

        $domain = Domain::query()->where('hostname', 'acme.test')->firstOrFail();

        expect($domain->provider)->toBe('cloudflare')
            ->and($fx['cf']->hostnames)->not->toBe([]);
    });
});
