<?php

use App\Models\Domain;
use App\Models\Workspace;
use Laravel\Sanctum\Sanctum;

/**
 * Removing a domain has to actually give the hostname back.
 *
 * A soft-deleted row still occupies the unique index on hostname, so a name
 * that looked gone everywhere in the product could not be connected again -
 * not to the same site, not to any other - with nothing on screen to say why.
 */

/**
 * @return array{headers: array<string, string>, site: int, workspace: Workspace}
 */
function domainDeleteFixture(): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $plan = $workspace->load('subscription.plan')->subscription->plan;
    $plan->update(['limits' => array_merge($plan->limits ?? [], ['number_of_sites' => 5, 'custom_domains' => 5])]);
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $siteId = test()->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Domain Site', 'subdomain' => 'domaindelete'])
        ->assertCreated()
        ->json('data.id');

    return ['headers' => $headers, 'site' => (int) $siteId, 'workspace' => $workspace];
}

it('frees the hostname the moment a domain is deleted', function () {
    $fx = domainDeleteFixture();

    $domain = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/domains', ['hostname' => 'www.freed.test'])
        ->assertCreated()
        ->json('data');

    test()->withHeaders($fx['headers'])->deleteJson('/api/v1/domains/'.$domain['id'])->assertOk();

    // Nothing left behind at all - a tombstone would still hold the index.
    expect(Domain::withTrashed()->where('hostname', 'www.freed.test')->count())->toBe(0);

    // And the name is immediately usable again.
    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/domains', ['hostname' => 'www.freed.test'])
        ->assertCreated();
});

it('lets a deleted hostname move to a different site', function () {
    $fx = domainDeleteFixture();

    $domain = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/domains', ['hostname' => 'www.moved.test'])
        ->assertCreated()
        ->json('data');

    $second = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites', ['name' => 'Second', 'subdomain' => 'seconddelete'])
        ->assertCreated()
        ->json('data.id');

    test()->withHeaders($fx['headers'])->deleteJson('/api/v1/domains/'.$domain['id'])->assertOk();

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$second.'/domains', ['hostname' => 'www.moved.test'])
        ->assertCreated();
});

it('lets a super admin remove a domain that is stuck on a live site', function () {
    $fx = domainDeleteFixture();

    $domain = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/domains', ['hostname' => 'www.stuck.test'])
        ->assertCreated()
        ->json('data');

    // The site is alive and the domain is attached to it, so the orphan
    // cleanup would not touch this one. Somebody has to be able to.
    ['user' => $admin] = adminTenant();
    Sanctum::actingAs($admin);

    test()->deleteJson('/api/v1/admin/domains/'.$domain['id'])
        ->assertOk()
        ->assertJsonPath('data.hostname', 'www.stuck.test');

    expect(Domain::withTrashed()->where('hostname', 'www.stuck.test')->count())->toBe(0);
});

it('does not let an ordinary member delete a domain from the admin route', function () {
    $fx = domainDeleteFixture();

    $domain = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/domains', ['hostname' => 'www.guarded.test'])
        ->assertCreated()
        ->json('data');

    // Still signed in as the ordinary workspace user from the fixture.
    test()->withHeaders($fx['headers'])->deleteJson('/api/v1/admin/domains/'.$domain['id'])->assertForbidden();

    expect(Domain::query()->where('hostname', 'www.guarded.test')->exists())->toBeTrue();
});

it('does not let one workspace delete another workspace domain', function () {
    $fx = domainDeleteFixture();

    $domain = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/domains', ['hostname' => 'www.mine.test'])
        ->assertCreated()
        ->json('data');

    ['user' => $otherUser, 'workspace' => $otherWorkspace] = tenant();
    Sanctum::actingAs($otherUser);

    test()->withHeaders(['X-Workspace-Id' => (string) $otherWorkspace->id])
        ->deleteJson('/api/v1/domains/'.$domain['id'])
        ->assertNotFound();

    expect(Domain::query()->where('hostname', 'www.mine.test')->exists())->toBeTrue();
});
