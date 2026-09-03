<?php

use App\Models\Page;
use Laravel\Sanctum\Sanctum;

/**
 * Making one page's header the whole site's.
 *
 * A template ships a navbar on every page, and the renderer deliberately leaves
 * a page's own navbar alone rather than stacking the shared one above it. Until
 * the per-page copies are gone the pages share nothing, so editing the header on
 * the home page changes the home page and nothing else.
 */

/**
 * @return array{headers: array<string, string>, site: int}
 */
function chromeAdoptFixture(): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $plan = $workspace->load('subscription.plan')->subscription->plan;
    $plan->update(['limits' => array_merge($plan->limits ?? [], ['number_of_sites' => 5, 'pages_per_site' => 20])]);
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $siteId = test()->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Chrome Site', 'subdomain' => 'chromesite'])
        ->assertCreated()
        ->json('data.id');

    return ['headers' => $headers, 'site' => (int) $siteId];
}

/** A page as a template ships it: its own navbar, some content, its own footer. */
function adoptTemplatePage(string $heading): array
{
    return [
        ['id' => 'nav', 'type' => 'navbar.voltera', 'version' => 1, 'hidden' => false, 'props' => ['logo' => 'Northwind']],
        ['id' => 'body', 'type' => 'hero.voltera', 'version' => 1, 'hidden' => false, 'props' => ['heading' => $heading]],
        ['id' => 'foot', 'type' => 'footer.voltera', 'version' => 1, 'hidden' => false, 'props' => ['copyright' => '© Northwind']],
    ];
}

function seedAdoptPages(array $headers, int $siteId): array
{
    $home = Page::query()->where('site_id', $siteId)->firstOrFail();
    test()->withHeaders($headers)
        ->putJson('/api/v1/pages/'.$home->id.'/draft', ['content' => ['schemaVersion' => 1, 'sections' => adoptTemplatePage('Home')]])
        ->assertOk();

    $about = test()->withHeaders($headers)
        ->postJson('/api/v1/sites/'.$siteId.'/pages', ['name' => 'About', 'slug' => 'about'])
        ->assertCreated()
        ->json('data.id');
    test()->withHeaders($headers)
        ->putJson('/api/v1/pages/'.$about.'/draft', ['content' => ['schemaVersion' => 1, 'sections' => adoptTemplatePage('About')]])
        ->assertOk();

    return ['home' => $home->id, 'about' => (int) $about];
}

function adoptDraftTypes(int $pageId): array
{
    $content = Page::query()->findOrFail($pageId)->fresh('draftRevision')->draftRevision->content_json ?? [];

    return array_column($content['sections'] ?? [], 'type');
}

it('lifts the header into the site and takes it off every page', function () {
    $fx = chromeAdoptFixture();
    $ids = seedAdoptPages($fx['headers'], $fx['site']);

    $data = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/chrome/adopt', ['slot' => 'header'])
        ->assertOk()
        ->json('data');

    expect($data['adopted'])->toBe(1);
    expect($data['pages'])->toBe(2);
    expect(array_column($data['chrome']['header']['sections'], 'type'))->toBe(['navbar.voltera']);

    // Every page loses its own copy, which is what turns the shared one on.
    expect(adoptDraftTypes($ids['home']))->toBe(['hero.voltera', 'footer.voltera']);
    expect(adoptDraftTypes($ids['about']))->toBe(['hero.voltera', 'footer.voltera']);
});

it('leaves the footer alone when only the header is shared', function () {
    $fx = chromeAdoptFixture();
    $ids = seedAdoptPages($fx['headers'], $fx['site']);

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/chrome/adopt', ['slot' => 'header'])
        ->assertOk();

    $chrome = test()->withHeaders($fx['headers'])
        ->getJson('/api/v1/sites/'.$fx['site'].'/chrome')
        ->assertOk()
        ->json('data');

    expect($chrome['footer']['sections'])->toBe([]);
    expect(adoptDraftTypes($ids['home']))->toContain('footer.voltera');
});

it('shares the footer too', function () {
    $fx = chromeAdoptFixture();
    $ids = seedAdoptPages($fx['headers'], $fx['site']);

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/chrome/adopt', ['slot' => 'footer'])
        ->assertOk();

    expect(adoptDraftTypes($ids['about']))->toBe(['navbar.voltera', 'hero.voltera']);
});

it('can take the header from a page other than the home page', function () {
    $fx = chromeAdoptFixture();
    $ids = seedAdoptPages($fx['headers'], $fx['site']);

    // Give About a different navbar, then adopt that one.
    test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/pages/'.$ids['about'].'/draft', ['content' => ['schemaVersion' => 1, 'sections' => [
            ['id' => 'nav', 'type' => 'navbar.halcyon', 'version' => 1, 'hidden' => false, 'props' => ['logo' => 'Northwind']],
            ['id' => 'body', 'type' => 'hero.voltera', 'version' => 1, 'hidden' => false, 'props' => ['heading' => 'About']],
        ]]])
        ->assertOk();

    $data = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/chrome/adopt', ['slot' => 'header', 'page_id' => $ids['about']])
        ->assertOk()
        ->json('data');

    expect(array_column($data['chrome']['header']['sections'], 'type'))->toBe(['navbar.halcyon']);
});

it('then reaches every page from one edit', function () {
    $fx = chromeAdoptFixture();
    seedAdoptPages($fx['headers'], $fx['site']);

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/chrome/adopt', ['slot' => 'header'])
        ->assertOk();

    // One write to the shared header...
    test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/sites/'.$fx['site'].'/chrome', ['header' => ['schemaVersion' => 1, 'sections' => [
            ['id' => 'nav', 'type' => 'navbar.voltera', 'version' => 1, 'hidden' => false, 'props' => ['logo' => 'Renamed Co']],
        ]]])
        ->assertOk();

    // ...and it is what every page will render, because none has its own.
    $payload = test()->withHeaders($fx['headers'])
        ->getJson('/api/v1/sites/'.$fx['site'].'/render-payload')
        ->assertOk()
        ->json('data');

    expect($payload['chrome']['header']['sections'][0]['props']['logo'])->toBe('Renamed Co');
    foreach ($payload['pages'] as $page) {
        expect(array_column($page['content']['sections'], 'type'))->not->toContain('navbar.voltera');
    }
});

it('says so rather than clearing the site when the page has no header', function () {
    $fx = chromeAdoptFixture();
    $home = Page::query()->where('site_id', $fx['site'])->firstOrFail();
    test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/pages/'.$home->id.'/draft', ['content' => ['schemaVersion' => 1, 'sections' => [
            ['id' => 'body', 'type' => 'hero.voltera', 'version' => 1, 'hidden' => false, 'props' => ['heading' => 'Home']],
        ]]])
        ->assertOk();

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/chrome/adopt', ['slot' => 'header'])
        ->assertStatus(422);

    expect(adoptDraftTypes($home->id))->toBe(['hero.voltera']);
});

it('refuses a page from another site', function () {
    $fx = chromeAdoptFixture();
    seedAdoptPages($fx['headers'], $fx['site']);

    $other = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites', ['name' => 'Other', 'subdomain' => 'othersite'])
        ->assertCreated()
        ->json('data.id');
    $otherPage = Page::query()->where('site_id', $other)->firstOrFail();

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/chrome/adopt', ['slot' => 'header', 'page_id' => $otherPage->id])
        ->assertStatus(404);
});
