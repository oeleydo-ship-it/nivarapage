<?php

use App\Models\Page;
use Laravel\Sanctum\Sanctum;

it('creates nested menus, reorders, and resolves page hrefs', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Nav Site', 'subdomain' => 'navsite'])
        ->assertCreated()
        ->json('data');

    $home = Page::query()->where('site_id', $site['id'])->where('is_homepage', true)->first();
    $about = $this->withHeaders($headers)
        ->postJson('/api/v1/sites/'.$site['id'].'/pages', ['name' => 'About', 'slug' => 'about'])
        ->json('data');
    $seo = $this->withHeaders($headers)
        ->postJson('/api/v1/sites/'.$site['id'].'/pages', ['name' => 'SEO', 'slug' => 'seo'])
        ->json('data');

    $menus = $this->withHeaders($headers)
        ->getJson('/api/v1/sites/'.$site['id'].'/menus')
        ->assertOk()
        ->json('data');

    expect($menus)->toHaveCount(1);
    $menuId = $menus[0]['id'];

    $this->withHeaders($headers)
        ->putJson('/api/v1/sites/'.$site['id'].'/menus', [
            'menus' => [[
                'id' => $menuId,
                'name' => 'Main',
                'location' => 'header',
                'items' => [
                    ['type' => 'page', 'label' => 'Home', 'page_id' => $home->id],
                    [
                        'type' => 'page',
                        'label' => 'Services',
                        'page_id' => $about['id'],
                        'children' => [
                            ['type' => 'page', 'label' => 'SEO', 'page_id' => $seo['id']],
                            ['type' => 'url', 'label' => 'Docs', 'url' => 'https://example.com/docs', 'target' => '_blank'],
                        ],
                    ],
                    ['type' => 'anchor', 'label' => 'Pricing', 'url' => 'pricing'],
                ],
            ]],
        ])
        ->assertOk()
        ->assertJsonPath('data.0.items.0.href', '/')
        ->assertJsonPath('data.0.items.1.children.0.href', '/seo')
        ->assertJsonPath('data.0.items.1.children.1.href', 'https://example.com/docs')
        ->assertJsonPath('data.0.items.2.href', '#pricing');

    $this->withHeaders($headers)
        ->putJson('/api/v1/sites/'.$site['id'].'/menus', [
            'menus' => [[
                'id' => $menuId,
                'items' => [
                    ['type' => 'page', 'label' => 'About', 'page_id' => $about['id']],
                    ['type' => 'page', 'label' => 'Home', 'page_id' => $home->id],
                ],
            ]],
        ])
        ->assertOk()
        ->assertJsonPath('data.0.items.0.label', 'About')
        ->assertJsonPath('data.0.items.1.label', 'Home');
});

it('rejects menu links to another tenant page', function () {
    ['user' => $userA, 'workspace' => $workspaceA] = tenant();
    ['user' => $userB, 'workspace' => $workspaceB] = tenant();

    Sanctum::actingAs($userB);
    $siteB = $this->withHeaders(['X-Workspace-Id' => (string) $workspaceB->id])
        ->postJson('/api/v1/sites', ['name' => 'B', 'subdomain' => 'nav-b'])
        ->json('data');
    $pageB = Page::query()->where('site_id', $siteB['id'])->first();

    Sanctum::actingAs($userA);
    $headers = ['X-Workspace-Id' => (string) $workspaceA->id];
    $siteA = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'A', 'subdomain' => 'nav-a'])
        ->json('data');
    $menus = $this->withHeaders($headers)->getJson('/api/v1/sites/'.$siteA['id'].'/menus')->json('data');

    $this->withHeaders($headers)
        ->putJson('/api/v1/sites/'.$siteA['id'].'/menus', [
            'menus' => [[
                'id' => $menus[0]['id'],
                'items' => [['type' => 'page', 'label' => 'Hacked', 'page_id' => $pageB->id]],
            ]],
        ])
        ->assertStatus(422);
});
