<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('lists members with their workspace role', function () {
    ['user' => $owner, 'workspace' => $workspace] = tenant();
    $editor = member($workspace->id);

    Sanctum::actingAs($owner);
    $members = $this->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->getJson('/api/v1/workspaces/'.$workspace->id.'/members')
        ->assertOk()
        ->json('data');

    expect(collect($members)->firstWhere('id', $owner->id)['role'])->toBe('owner');
    expect(collect($members)->firstWhere('id', $editor->id)['role'])->toBe('editor');
});

it('enforces the team member plan limit on invitations', function () {
    ['user' => $owner, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($owner);

    $this->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->postJson('/api/v1/workspaces/'.$workspace->id.'/invitations', [
            'email' => 'blocked@example.com',
            'role' => 'editor',
        ])
        ->assertStatus(402);
});

it('accepts an invitation and joins the workspace', function () {
    ['user' => $owner, 'workspace' => $workspace] = tenant();
    $workspace->subscription->plan->update([
        'limits' => array_merge($workspace->subscription->plan->limits, ['team_members' => 5]),
    ]);

    Sanctum::actingAs($owner);
    $invitation = $this->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->postJson('/api/v1/workspaces/'.$workspace->id.'/invitations', [
            'email' => 'joiner@example.com',
            'role' => 'designer',
        ])
        ->assertCreated()
        ->json('data');

    $this->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->getJson('/api/v1/workspaces/'.$workspace->id.'/invitations')
        ->assertOk()
        ->assertJsonPath('data.0.email', 'joiner@example.com');

    $joiner = User::factory()->create(['email' => 'joiner@example.com']);
    Sanctum::actingAs($joiner);

    $this->postJson('/api/v1/invitations/'.$invitation['token'].'/accept')
        ->assertOk()
        ->assertJsonPath('data.id', $workspace->id);

    expect($joiner->fresh()->roleIn($workspace->id))->toBe('designer');
});

it('blocks editors from managing members and protects the owner row', function () {
    ['user' => $owner, 'workspace' => $workspace] = tenant();
    $editor = member($workspace->id);

    Sanctum::actingAs($editor);
    $this->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->patchJson('/api/v1/workspaces/'.$workspace->id.'/members/'.$owner->id, ['role' => 'viewer'])
        ->assertForbidden();

    Sanctum::actingAs($owner);
    $this->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->patchJson('/api/v1/workspaces/'.$workspace->id.'/members/'.$owner->id, ['role' => 'viewer'])
        ->assertStatus(422);

    $this->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->deleteJson('/api/v1/workspaces/'.$workspace->id.'/members/'.$owner->id)
        ->assertStatus(422);

    $this->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->deleteJson('/api/v1/workspaces/'.$workspace->id.'/members/'.$editor->id)
        ->assertOk();

    expect($editor->fresh()->roleIn($workspace->id))->toBeNull();
});

it('renames a workspace and transfers ownership', function () {
    ['user' => $owner, 'workspace' => $workspace] = tenant();
    $admin = member($workspace->id, 'admin');

    Sanctum::actingAs($owner);
    $this->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->patchJson('/api/v1/workspaces/'.$workspace->id, ['name' => 'Renamed Studio'])
        ->assertOk()
        ->assertJsonPath('data.name', 'Renamed Studio');

    $this->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->postJson('/api/v1/workspaces/'.$workspace->id.'/transfer', ['user_id' => $admin->id])
        ->assertOk();

    expect($workspace->fresh()->owner_id)->toBe($admin->id);
    expect($admin->fresh()->roleIn($workspace->id))->toBe('owner');
    expect($owner->fresh()->roleIn($workspace->id))->toBe('admin');
});
