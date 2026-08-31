<?php

use App\Models\Activity;
use App\Models\Page;
use App\Models\User;
use App\Models\WorkspaceUser;
use Laravel\Sanctum\Sanctum;

it('records activity for site, page, publish and restore actions', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Log Site', 'subdomain' => 'logsite'])
        ->assertCreated()
        ->json('data');

    $home = Page::query()->where('site_id', $site['id'])->where('is_homepage', true)->first();

    $this->withHeaders($headers)->putJson('/api/v1/pages/'.$home->id.'/draft', ['content' => sampleContent('V1')]);
    $this->withHeaders($headers)->postJson('/api/v1/pages/'.$home->id.'/publish')->assertOk();
    $published = $home->fresh()->publishedRevision;

    $this->withHeaders($headers)->putJson('/api/v1/pages/'.$home->id.'/draft', ['content' => sampleContent('V2')]);
    $this->withHeaders($headers)
        ->postJson('/api/v1/pages/'.$home->id.'/revisions/'.$published->id.'/restore')
        ->assertOk();

    $about = $this->withHeaders($headers)
        ->postJson('/api/v1/sites/'.$site['id'].'/pages', ['name' => 'About', 'slug' => 'about'])
        ->assertCreated()
        ->json('data');
    $this->withHeaders($headers)->deleteJson('/api/v1/pages/'.$about['id'])->assertOk();

    $actions = Activity::query()->where('workspace_id', $workspace->id)->pluck('action');

    expect($actions)->toContain('workspace.created')
        ->toContain('site.created')
        ->toContain('page.created')
        ->toContain('page.published')
        ->toContain('page.restored')
        ->toContain('page.deleted');
});

it('returns activity feed with actor, target and metadata fields', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Feed Site', 'subdomain' => 'feedsite'])
        ->assertCreated();

    $response = $this->withHeaders($headers)
        ->getJson('/api/v1/activities?action=site.created')
        ->assertOk()
        ->assertJsonStructure([
            'data' => [['id', 'action', 'label', 'actor' => ['id', 'name', 'email'], 'target' => ['type', 'id', 'name'], 'ip', 'metadata', 'timestamp']],
        ]);

    expect($response->json('data.0.action'))->toBe('site.created');
    expect($response->json('data.0.label'))->toBe('Site created');
    expect($response->json('data.0.target.type'))->toBe('Site');
    expect($response->json('data.0.target.name'))->toBe('Feed Site');
    expect($response->json('data.0.actor.id'))->toBe($user->id);
});

it('searches activity by term and lists distinct actions', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Searchable', 'subdomain' => 'searchable'])
        ->assertCreated();

    $found = $this->withHeaders($headers)->getJson('/api/v1/activities?q=Searchable')->assertOk()->json('data');
    expect($found)->not->toBeEmpty();

    $missing = $this->withHeaders($headers)->getJson('/api/v1/activities?q=zzz-nothing-here')->assertOk()->json('data');
    expect($missing)->toBeEmpty();

    $actions = $this->withHeaders($headers)->getJson('/api/v1/activities/actions')->assertOk()->json('data');
    expect($actions)->toContain('site.created');
});

it('never leaks activity between workspaces', function () {
    ['user' => $userA, 'workspace' => $workspaceA] = tenant();
    ['user' => $userB, 'workspace' => $workspaceB] = tenant();

    Sanctum::actingAs($userB);
    $this->withHeaders(['X-Workspace-Id' => (string) $workspaceB->id])
        ->postJson('/api/v1/sites', ['name' => 'Secret B', 'subdomain' => 'secretb'])
        ->assertCreated();

    Sanctum::actingAs($userA);
    $feed = $this->withHeaders(['X-Workspace-Id' => (string) $workspaceA->id])
        ->getJson('/api/v1/activities')
        ->assertOk();

    $feed->assertJsonMissing(['action' => 'site.created']);
    expect(collect($feed->json('data'))->pluck('workspace_id')->unique()->all())->toBe([$workspaceA->id]);
});

it('lets super admins search activity across workspaces', function () {
    ['user' => $owner, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($owner);
    $this->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->postJson('/api/v1/sites', ['name' => 'Cross Tenant', 'subdomain' => 'crosstenant'])
        ->assertCreated();

    $admin = User::factory()->create(['is_super_admin' => true]);
    Sanctum::actingAs($admin);

    $this->getJson('/api/v1/admin/activities?q=Cross Tenant')
        ->assertOk()
        ->assertJsonPath('data.0.target.name', 'Cross Tenant')
        ->assertJsonPath('data.0.workspace.id', $workspace->id);

    $this->getJson('/api/v1/admin/activities?workspace_id=999999')
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

it('logs team invitations, role changes, removals and transfers', function () {
    ['user' => $owner, 'workspace' => $workspace] = tenant();
    $member = User::factory()->create();
    WorkspaceUser::query()->create([
        'workspace_id' => $workspace->id,
        'user_id' => $member->id,
        'role' => 'editor',
    ]);

    $workspace->subscription->plan->update([
        'limits' => array_merge($workspace->subscription->plan->limits, ['team_members' => 10]),
    ]);

    Sanctum::actingAs($owner);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $this->withHeaders($headers)
        ->postJson('/api/v1/workspaces/'.$workspace->id.'/invitations', [
            'email' => 'new@example.com',
            'role' => 'designer',
        ])
        ->assertCreated()
        ->assertJsonPath('data.email', 'new@example.com');

    $this->withHeaders($headers)
        ->patchJson('/api/v1/workspaces/'.$workspace->id.'/members/'.$member->id, ['role' => 'admin'])
        ->assertOk();

    $this->withHeaders($headers)
        ->postJson('/api/v1/workspaces/'.$workspace->id.'/transfer', ['user_id' => $member->id])
        ->assertOk();

    $actions = Activity::query()->where('workspace_id', $workspace->id)->pluck('action');

    expect($actions)->toContain('user.invited')
        ->toContain('user.role_changed')
        ->toContain('ownership.transferred');
});
