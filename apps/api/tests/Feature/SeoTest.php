<?php

use Laravel\Sanctum\Sanctum;

it('exposes site and page SEO, canonical domain, sitemap, and robots', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Seo Site', 'subdomain' => 'seosite', 'description' => 'Default blurb'])
        ->assertCreated()
        ->json('data');

    $this->withHeaders($headers)
        ->getJson('/api/v1/sites/'.$site['id'].'/settings')
        ->assertOk()
        ->assertJsonPath('data.robots', 'index')
        ->assertJsonPath('data.default_description', 'Default blurb');

    $this->withHeaders($headers)
        ->putJson('/api/v1/sites/'.$site['id'].'/settings', [
            'default_description' => 'Studio for serious brands',
            'favicon' => 'https://cdn.example.com/favicon.png',
            'social_image' => 'https://cdn.example.com/og.jpg',
            'robots' => 'index',
        ])
        ->assertOk()
        ->assertJsonPath('data.social_image', 'https://cdn.example.com/og.jpg');

    $pages = $this->withHeaders($headers)->getJson('/api/v1/sites/'.$site['id'].'/pages')->json('data');
    $home = collect($pages)->firstWhere('is_homepage', true);
    $about = $this->withHeaders($headers)
        ->postJson('/api/v1/sites/'.$site['id'].'/pages', ['name' => 'About', 'slug' => 'about'])
        ->json('data');

    $this->withHeaders($headers)
        ->patchJson('/api/v1/pages/'.$home['id'], [
            'seo_title' => 'Home title',
            'seo_description' => 'Home description',
            'og_title' => 'Home OG',
            'og_image' => 'https://cdn.example.com/home.jpg',
        ])
        ->assertOk()
        ->assertJsonPath('data.seo_title', 'Home title');

    $this->withHeaders($headers)
        ->patchJson('/api/v1/pages/'.$about['id'], [
            'seo_title' => 'About us',
            'canonical_url' => 'https://www.example.com/about-us',
            'robots_index' => false,
        ])
        ->assertOk();

    $this->withHeaders($headers)->putJson('/api/v1/pages/'.$home['id'].'/draft', [
        'content' => sampleContent('Hello SEO'),
    ]);
    $this->withHeaders($headers)->postJson('/api/v1/pages/'.$home['id'].'/publish')->assertOk();
    $this->withHeaders($headers)->putJson('/api/v1/pages/'.$about['id'].'/draft', [
        'content' => sampleContent('About'),
    ]);
    $this->withHeaders($headers)->postJson('/api/v1/pages/'.$about['id'].'/publish')->assertOk();

    $host = 'seosite.sites.example.com';
    $this->getJson('/api/v1/public/page?host='.$host.'&path=/')
        ->assertOk()
        ->assertJsonPath('data.page.seo_title', 'Home title')
        ->assertJsonPath('data.page.canonical', 'https://'.$host.'/')
        ->assertJsonPath('data.page.og_title', 'Home OG')
        ->assertJsonPath('data.page.og_image', 'https://cdn.example.com/home.jpg')
        ->assertJsonPath('data.page.robots.index', true);

    $this->getJson('/api/v1/public/page?host='.$host.'&path=/about')
        ->assertOk()
        ->assertJsonPath('data.page.canonical', 'https://www.example.com/about-us')
        ->assertJsonPath('data.page.robots_index', false);

    $sitemap = $this->getJson('/api/v1/public/sitemap?host='.$host)
        ->assertOk()
        ->json('data');

    expect(collect($sitemap)->pluck('slug')->all())->toContain('home');
    expect(collect($sitemap)->pluck('slug')->all())->not->toContain('about');
    expect(collect($sitemap)->firstWhere('is_homepage', true)['loc'])->toBe('https://'.$host.'/');

    $this->withHeaders($headers)
        ->putJson('/api/v1/sites/'.$site['id'].'/settings', ['robots' => 'noindex'])
        ->assertOk();

    $this->getJson('/api/v1/public/sitemap?host='.$host)
        ->assertOk()
        ->assertJsonPath('data', []);

    $this->getJson('/api/v1/public/page?host='.$host.'&path=/')
        ->assertOk()
        ->assertJsonPath('data.page.robots.index', false);
});

it('rejects invalid site robots values and another tenant settings', function () {
    ['user' => $userA, 'workspace' => $workspaceA] = tenant();
    ['user' => $userB, 'workspace' => $workspaceB] = tenant();
    Sanctum::actingAs($userA);
    $headersA = ['X-Workspace-Id' => (string) $workspaceA->id];
    $siteA = $this->withHeaders($headersA)
        ->postJson('/api/v1/sites', ['name' => 'A', 'subdomain' => 'seo-a'])
        ->json('data');

    $this->withHeaders($headersA)
        ->putJson('/api/v1/sites/'.$siteA['id'].'/settings', ['robots' => 'hack'])
        ->assertStatus(422);

    Sanctum::actingAs($userB);
    $this->withHeaders(['X-Workspace-Id' => (string) $workspaceB->id])
        ->putJson('/api/v1/sites/'.$siteA['id'].'/settings', ['robots' => 'noindex'])
        ->assertNotFound();
});
