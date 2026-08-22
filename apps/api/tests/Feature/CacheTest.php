<?php

use App\Models\Page;
use App\Services\PreviewTokenService;
use App\Services\TenantCacheService;
use Laravel\Sanctum\Sanctum;

function publishedHost(array $site): string
{
    return $site['domains'][0]['hostname'] ?? throw new RuntimeException('Site has no domain.');
}

it('caches public page JSON and serves the stored payload until invalidate', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Cache Site', 'subdomain' => 'cachesite'])
        ->assertCreated()
        ->json('data');

    $pages = $this->withHeaders($headers)->getJson('/api/v1/sites/'.$site['id'].'/pages')->json('data');
    $home = collect($pages)->firstWhere('is_homepage', true);

    $this->withHeaders($headers)->putJson('/api/v1/pages/'.$home['id'].'/draft', [
        'content' => sampleContent('Cached heading'),
    ])->assertOk();
    $this->withHeaders($headers)->postJson('/api/v1/pages/'.$home['id'].'/publish')->assertOk();

    $host = publishedHost($site);
    $this->getJson('/api/v1/public/page?host='.$host.'&path=/')
        ->assertOk()
        ->assertJsonPath('data.page.content.sections.0.props.heading', 'Cached heading');

    $page = Page::query()->findOrFail($home['id']);
    $revision = $page->publishedRevision;
    $content = $revision->content_json;
    $content['sections'][0]['props']['heading'] = 'Mutated in database';
    $revision->update(['content_json' => $content]);

    $this->getJson('/api/v1/public/page?host='.$host.'&path=/')
        ->assertOk()
        ->assertJsonPath('data.page.content.sections.0.props.heading', 'Cached heading');

    $page->load(['site.domains', 'site.pages.publishedRevision']);
    app(TenantCacheService::class)->invalidateSite($page->site);

    $this->getJson('/api/v1/public/page?host='.$host.'&path=/')
        ->assertOk()
        ->assertJsonPath('data.page.content.sections.0.props.heading', 'Mutated in database');
});

it('forgets published page cache so a second publish is visible immediately', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Publish Cache', 'subdomain' => 'pubcache'])
        ->assertCreated()
        ->json('data');

    $pages = $this->withHeaders($headers)->getJson('/api/v1/sites/'.$site['id'].'/pages')->json('data');
    $home = collect($pages)->firstWhere('is_homepage', true);
    $host = publishedHost($site);

    $this->withHeaders($headers)->putJson('/api/v1/pages/'.$home['id'].'/draft', [
        'content' => sampleContent('Version one'),
    ]);
    $this->withHeaders($headers)->postJson('/api/v1/pages/'.$home['id'].'/publish')->assertOk();

    $this->getJson('/api/v1/public/page?host='.$host.'&path=/')
        ->assertOk()
        ->assertJsonPath('data.page.content.sections.0.props.heading', 'Version one');

    $this->withHeaders($headers)->putJson('/api/v1/pages/'.$home['id'].'/draft', [
        'content' => sampleContent('Version two'),
    ]);
    $this->withHeaders($headers)->postJson('/api/v1/pages/'.$home['id'].'/publish')->assertOk();

    $this->getJson('/api/v1/public/page?host='.$host.'&path=/')
        ->assertOk()
        ->assertJsonPath('data.page.content.sections.0.props.heading', 'Version two');
});

it('does not cache preview or authenticated dashboard responses', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);

    $sites = $this->withHeaders($headers)->getJson('/api/v1/sites')->assertOk();
    expect($sites->headers->get('Cache-Control'))->toContain('no-store');

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Preview Cache', 'subdomain' => 'prevcache'])
        ->assertCreated()
        ->json('data');

    $preview = app(PreviewTokenService::class)->create(\App\Models\Site::query()->findOrFail($site['id']));
    $path = parse_url($preview, PHP_URL_PATH).'?'.parse_url($preview, PHP_URL_QUERY);
    $response = $this->postJson($path)->assertOk();
    expect($response->headers->get('Cache-Control'))->toContain('no-store');

    $pages = $this->withHeaders($headers)->getJson('/api/v1/sites/'.$site['id'].'/pages')->json('data');
    $home = collect($pages)->firstWhere('is_homepage', true);
    $this->withHeaders($headers)->putJson('/api/v1/pages/'.$home['id'].'/draft', [
        'content' => sampleContent('Draft only'),
    ])->assertOk();

    $again = $this->postJson($path)->assertOk();
    $previewPages = collect($again->json('data.pages'));
    $previewHome = $previewPages->firstWhere('is_homepage', true) ?? $previewPages->first();
    expect(data_get($previewHome, 'draft_revision.content_json.sections.0.props.heading'))->toBe('Draft only');
});

it('public GET responses advertise a short shared cache and 404s stay uncached', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Header Cache', 'subdomain' => 'hdrcache'])
        ->assertCreated()
        ->json('data');

    $pages = $this->withHeaders($headers)->getJson('/api/v1/sites/'.$site['id'].'/pages')->json('data');
    $home = collect($pages)->firstWhere('is_homepage', true);
    $this->withHeaders($headers)->putJson('/api/v1/pages/'.$home['id'].'/draft', [
        'content' => sampleContent('Live'),
    ]);
    $this->withHeaders($headers)->postJson('/api/v1/pages/'.$home['id'].'/publish')->assertOk();

    $live = $this->getJson('/api/v1/public/resolve?host='.publishedHost($site))->assertOk();
    expect($live->headers->get('Cache-Control'))->toContain('s-maxage=60');

    $missing = $this->getJson('/api/v1/public/resolve?host=missing-host.sites.example.com')->assertNotFound();
    expect($missing->headers->get('Cache-Control'))->toContain('no-store');
});

it('clears a negative domain cache when that hostname is later reserved', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);

    $this->getJson('/api/v1/public/resolve?host=latebind.sites.example.com')->assertNotFound();

    $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Late Bind', 'subdomain' => 'latebind'])
        ->assertCreated();

    $this->getJson('/api/v1/public/resolve?host=latebind.sites.example.com')
        ->assertOk()
        ->assertJsonPath('data.name', 'Late Bind');
});
