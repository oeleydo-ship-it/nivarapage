<?php

use App\Models\Page;
use Laravel\Sanctum\Sanctum;

it('lets editors save drafts but not publish, and keeps viewers read-only', function () {
    ['user' => $owner, 'workspace' => $workspace] = tenant();
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    Sanctum::actingAs($owner);

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Role Site', 'subdomain' => 'rolesite'])
        ->assertCreated()
        ->json('data');

    $page = Page::query()->where('site_id', $site['id'])->where('is_homepage', true)->firstOrFail();

    $viewer = member($workspace->id, 'viewer');
    Sanctum::actingAs($viewer);
    $this->withHeaders($headers)->getJson('/api/v1/sites/'.$site['id'])->assertOk();
    $this->withHeaders($headers)
        ->patchJson('/api/v1/sites/'.$site['id'], ['name' => 'Hacked'])
        ->assertForbidden();
    $this->withHeaders($headers)
        ->putJson('/api/v1/pages/'.$page->id.'/draft', ['content' => sampleContent('Viewer')])
        ->assertForbidden();
    $this->withHeaders($headers)
        ->postJson('/api/v1/pages/'.$page->id.'/publish')
        ->assertForbidden();

    $editor = member($workspace->id, 'editor');
    Sanctum::actingAs($editor);
    $this->withHeaders($headers)
        ->putJson('/api/v1/pages/'.$page->id.'/draft', ['content' => sampleContent('Editor draft')])
        ->assertOk();
    $this->withHeaders($headers)
        ->postJson('/api/v1/pages/'.$page->id.'/publish')
        ->assertForbidden();
    $this->withHeaders($headers)
        ->postJson('/api/v1/sites/'.$site['id'].'/pages', ['name' => 'About'])
        ->assertForbidden();

    $designer = member($workspace->id, 'designer');
    Sanctum::actingAs($designer);
    $this->withHeaders($headers)
        ->postJson('/api/v1/pages/'.$page->id.'/publish')
        ->assertOk();
    $this->withHeaders($headers)
        ->postJson('/api/v1/sites/'.$site['id'].'/pages', ['name' => 'About', 'slug' => 'about'])
        ->assertCreated();
});
