<?php

use App\Models\Client;
use App\Models\User;
use App\Models\WorkspaceUser;
use Laravel\Sanctum\Sanctum;

it('creates, searches, and updates a workspace client', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);

    $created = $this->withHeaders($headers)
        ->postJson('/api/v1/clients', [
            'name' => 'Northwind Retail',
            'company' => 'Northwind Retail',
            'email' => 'hello@northwind.test',
            'status' => 'lead',
            'industry' => 'Retail',
            'tags' => ['priority'],
        ])
        ->assertCreated()
        ->json('data');

    expect($created['workspace_id'])->toBe($workspace->id);
    expect($created['status'])->toBe('lead');
    expect($created['tags'])->toBe(['priority']);

    $this->withHeaders($headers)
        ->getJson('/api/v1/clients?q=northwind')
        ->assertOk()
        ->assertJsonPath('data.0.id', $created['id']);

    $this->withHeaders($headers)
        ->patchJson('/api/v1/clients/'.$created['id'], ['status' => 'active'])
        ->assertOk()
        ->assertJsonPath('data.status', 'active');
});

it('adds contacts and attaches a site from the same workspace', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);

    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Client Site', 'subdomain' => 'clientsite'])
        ->assertCreated()
        ->json('data.id');

    $clientId = $this->withHeaders($headers)
        ->postJson('/api/v1/clients', ['name' => 'Harbor Clinic', 'status' => 'active'])
        ->assertCreated()
        ->json('data.id');

    $contact = $this->withHeaders($headers)
        ->postJson('/api/v1/clients/'.$clientId.'/contacts', [
            'name' => 'Maya Chen',
            'email' => 'maya@harbor.test',
            'title' => 'Marketing lead',
            'is_primary' => true,
        ])
        ->assertCreated()
        ->json('data');

    expect($contact['is_primary'])->toBeTrue();

    $this->withHeaders($headers)
        ->postJson('/api/v1/clients/'.$clientId.'/sites', ['site_id' => $siteId])
        ->assertOk()
        ->assertJsonPath('data.client_id', $clientId);

    $show = $this->withHeaders($headers)
        ->getJson('/api/v1/clients/'.$clientId)
        ->assertOk()
        ->json('data');

    expect($show['contacts'])->toHaveCount(1);
    expect($show['sites'][0]['id'])->toBe($siteId);

    $this->withHeaders($headers)
        ->deleteJson('/api/v1/clients/'.$clientId.'/sites/'.$siteId)
        ->assertOk();

    $this->withHeaders($headers)
        ->getJson('/api/v1/sites/'.$siteId)
        ->assertJsonPath('data.client_id', null);
});

it('hides clients from another workspace and blocks viewers from writing', function () {
    ['user' => $owner, 'workspace' => $workspace] = tenant();
    ['user' => $other, 'workspace' => $otherWorkspace] = tenant();
    $ownerHeaders = authHeaders($owner, $workspace);

    $clientId = $this->withHeaders($ownerHeaders)
        ->postJson('/api/v1/clients', ['name' => 'Secret Co'])
        ->assertCreated()
        ->json('data.id');

    $this->withHeaders(authHeaders($other, $otherWorkspace))
        ->getJson('/api/v1/clients/'.$clientId)
        ->assertNotFound();

    $viewer = User::factory()->create();
    WorkspaceUser::query()->create([
        'workspace_id' => $workspace->id,
        'user_id' => $viewer->id,
        'role' => 'viewer',
    ]);
    Sanctum::actingAs($viewer);

    $this->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->getJson('/api/v1/clients')
        ->assertOk();

    $this->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->postJson('/api/v1/clients', ['name' => 'Blocked'])
        ->assertForbidden();
});
