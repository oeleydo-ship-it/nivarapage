<?php

use App\Models\Domain;
use App\Models\Site;
use App\Models\Workspace;
use App\Services\SubdomainService;
use Laravel\Sanctum\Sanctum;

/**
 * A hostname belongs to a site. When the site goes, the hostname must go with
 * it - otherwise it stays taken by a site nobody can open any more, and the
 * only way to free it is a manual row delete.
 */

/**
 * @return array{headers: array<string, string>, site: int, workspace: Workspace}
 */
function releaseFixture(string $subdomain = 'releasesite'): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $workspace->subscription->plan->update([
        'limits' => array_merge($workspace->subscription->plan->limits, [
            'custom_domains' => 5,
            'number_of_sites' => 5,
        ]),
    ]);
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $siteId = test()->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Release Site', 'subdomain' => $subdomain])
        ->assertCreated()
        ->json('data.id');

    return ['headers' => $headers, 'site' => (int) $siteId, 'workspace' => $workspace];
}

it('frees a custom domain when the site holding it is deleted', function () {
    $fx = releaseFixture();

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/domains', ['hostname' => 'www.release-me.test'])
        ->assertCreated();

    test()->withHeaders($fx['headers'])
        ->deleteJson('/api/v1/sites/'.$fx['site'])
        ->assertOk();

    // A second site must be able to claim the hostname the deleted site held.
    $second = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites', ['name' => 'Second', 'subdomain' => 'secondsite'])
        ->assertCreated()
        ->json('data.id');

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$second.'/domains', ['hostname' => 'www.release-me.test'])
        ->assertCreated();
});

it('frees the platform subdomain when the site is deleted', function () {
    $fx = releaseFixture('reusable');

    test()->withHeaders($fx['headers'])
        ->deleteJson('/api/v1/sites/'.$fx['site'])
        ->assertOk();

    test()->withHeaders($fx['headers'])
        ->getJson('/api/v1/subdomains/check?name=reusable')
        ->assertOk()
        ->assertJsonPath('data.available', true);
});

it('lets a new site take the subdomain a deleted site used', function () {
    $fx = releaseFixture('recycled');

    test()->withHeaders($fx['headers'])
        ->deleteJson('/api/v1/sites/'.$fx['site'])
        ->assertOk();

    // The unique index counts soft-deleted rows, so the tombstone must be
    // cleared or this insert dies on a constraint violation.
    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites', ['name' => 'Recycled', 'subdomain' => 'recycled'])
        ->assertCreated();
});

it('gives the site its hostnames back when it is restored', function () {
    $fx = releaseFixture('restorable');

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/domains', ['hostname' => 'www.restore-me.test'])
        ->assertCreated();

    test()->withHeaders($fx['headers'])
        ->deleteJson('/api/v1/sites/'.$fx['site'])
        ->assertOk();

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/restore')
        ->assertOk();

    $hostnames = Domain::query()->where('site_id', $fx['site'])->pluck('hostname')->all();
    expect($hostnames)->toContain(app(SubdomainService::class)->hostname('restorable'));
    expect($hostnames)->toContain('www.restore-me.test');
});

it('does not resurrect a hostname someone else claimed while the site was deleted', function () {
    $fx = releaseFixture('contested');

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/domains', ['hostname' => 'www.contested.test'])
        ->assertCreated();

    test()->withHeaders($fx['headers'])
        ->deleteJson('/api/v1/sites/'.$fx['site'])
        ->assertOk();

    $second = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites', ['name' => 'Claimer', 'subdomain' => 'claimer'])
        ->assertCreated()
        ->json('data.id');

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$second.'/domains', ['hostname' => 'www.contested.test'])
        ->assertCreated();

    // Restoring must not duplicate a hostname the other site now owns.
    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/restore')
        ->assertOk();

    expect(Domain::query()->where('hostname', 'www.contested.test')->count())->toBe(1);
    expect(Domain::query()->where('hostname', 'www.contested.test')->value('site_id'))->toBe((int) $second);
});

it('keeps a deleted site off the live hostname', function () {
    $fx = releaseFixture('goneaway');

    test()->withHeaders($fx['headers'])
        ->deleteJson('/api/v1/sites/'.$fx['site'])
        ->assertOk();

    expect(Site::withTrashed()->find($fx['site'])->trashed())->toBeTrue();
    expect(Domain::query()->where('site_id', $fx['site'])->count())->toBe(0);
});

it('lists orphaned hostnames without freeing them until forced', function () {
    $fx = releaseFixture('orphaned');

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/domains', ['hostname' => 'www.orphan.test'])
        ->assertCreated();

    // A site deleted the old way: the row is stranded on a site nobody can open.
    Site::query()->whereKey($fx['site'])->delete();
    expect(Domain::query()->where('hostname', 'www.orphan.test')->count())->toBe(1);

    test()->artisan('domains:release-orphaned')->assertExitCode(0);
    expect(Domain::query()->where('hostname', 'www.orphan.test')->count())->toBe(1);

    test()->artisan('domains:release-orphaned', ['--force' => true])->assertExitCode(0);
    expect(Domain::withTrashed()->where('hostname', 'www.orphan.test')->count())->toBe(0);
});

it('leaves hostnames of live sites alone', function () {
    $fx = releaseFixture('keepme');

    test()->artisan('domains:release-orphaned', ['--force' => true])->assertExitCode(0);

    expect(Domain::query()->where('site_id', $fx['site'])->count())->toBeGreaterThan(0);
});
