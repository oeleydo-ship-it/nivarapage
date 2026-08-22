<?php

use App\Models\Page;
use Laravel\Sanctum\Sanctum;

it('creates, updates, lists, archives, and restores a website', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Studio One', 'subdomain' => 'studioone'])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Studio One')
        ->json('data');

    $this->withHeaders($headers)
        ->getJson('/api/v1/sites')
        ->assertOk()
        ->assertJsonPath('data.0.id', $site['id']);

    $this->withHeaders($headers)
        ->patchJson('/api/v1/sites/'.$site['id'], ['name' => 'Studio One Renamed'])
        ->assertOk()
        ->assertJsonPath('data.name', 'Studio One Renamed');

    $this->withHeaders($headers)
        ->deleteJson('/api/v1/sites/'.$site['id'])
        ->assertOk();

    $this->withHeaders($headers)
        ->getJson('/api/v1/sites')
        ->assertOk()
        ->assertJsonCount(0, 'data');

    $this->withHeaders($headers)
        ->postJson('/api/v1/sites/'.$site['id'].'/restore')
        ->assertOk()
        ->assertJsonPath('data.name', 'Studio One Renamed');
});

it('creates, updates, and deletes extra pages and enforces the free page quota', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Page Site', 'subdomain' => 'pagesite'])
        ->json('data');

    $about = $this->withHeaders($headers)
        ->postJson('/api/v1/sites/'.$site['id'].'/pages', ['name' => 'About', 'slug' => 'about'])
        ->assertCreated()
        ->json('data');

    $this->withHeaders($headers)
        ->patchJson('/api/v1/pages/'.$about['id'], ['name' => 'About us'])
        ->assertOk()
        ->assertJsonPath('data.name', 'About us');

    $this->withHeaders($headers)
        ->getJson('/api/v1/sites/'.$site['id'].'/pages')
        ->assertOk()
        ->assertJsonCount(2, 'data');

    $this->withHeaders($headers)
        ->deleteJson('/api/v1/pages/'.$about['id'])
        ->assertOk();

    expect(Page::query()->find($about['id']))->toBeNull();

    for ($i = 0; $i < 4; $i++) {
        $this->withHeaders($headers)
            ->postJson('/api/v1/sites/'.$site['id'].'/pages', ['name' => 'Page '.$i, 'slug' => 'page-'.$i])
            ->assertCreated();
    }

    $this->withHeaders($headers)
        ->postJson('/api/v1/sites/'.$site['id'].'/pages', ['name' => 'Overflow', 'slug' => 'overflow'])
        ->assertStatus(402);
});
