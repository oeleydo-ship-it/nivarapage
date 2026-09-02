<?php

use App\Models\Page;
use App\Services\Ai\FakeAiProvider;
use App\Services\Ai\SiteKitProfile;
use App\Support\BlockCatalog;
use Laravel\Sanctum\Sanctum;

/**
 * A blank site gets art-directed before it gets built.
 *
 * Generation used to be held to the twelve generated.* blocks whenever a site
 * had no kit yet - which is every new site - so fifteen designed kits sat
 * unused and every business came out of the same handful of sections. The kit,
 * the palette and the motion are now chosen for the brief first, and the pages
 * are written from that kit's real blocks.
 */
beforeEach(function () {
    FakeAiProvider::reset();
    BlockCatalog::flush();
    config(['ai.api_key' => null]);
});

/**
 * @return array{headers: array<string, string>, site: int}
 */
function artFixture(): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    enableAi();
    allowAi($workspace);

    $siteId = test()->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Blank Site', 'subdomain' => 'blanksite'])
        ->assertCreated()
        ->json('data.id');

    return ['headers' => $headers, 'site' => (int) $siteId];
}

/** A minimal site answer built from one kit's blocks. */
function kitSiteJson(string $kit = 'voltera'): string
{
    return (string) json_encode([
        'pages' => [[
            'name' => 'Home',
            'slug' => 'home',
            'is_homepage' => true,
            'sections' => [
                ['type' => 'navbar.'.$kit, 'props' => ['logo' => 'Northwind']],
                ['type' => 'hero.'.$kit, 'props' => ['heading' => 'Built for winter', 'description' => 'Roofing that lasts.']],
                ['type' => 'footer.'.$kit, 'props' => ['copyright' => '© Northwind']],
            ],
        ]],
    ]);
}

it('offers every kit to the art director, with the sections each can build', function () {
    $fx = artFixture();
    FakeAiProvider::push(kitSiteJson());

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/ai/generate-page', [
            'site_id' => $fx['site'],
            'prompt' => 'A roofing company working across the north of England.',
        ])
        ->assertOk();

    $art = FakeAiProvider::calls()[0];
    expect($art['system'])->toContain('You are the art director');

    // Every real kit is on the menu, described by what it can build.
    foreach (app(SiteKitProfile::class)->catalogue() as $kit) {
        expect($art['prompt'])->toContain($kit['key']);
    }
    expect($art['prompt'])->toContain('A roofing company working across the north of England.');
});

it('builds the pages from the chosen kit rather than the generic blocks', function () {
    $fx = artFixture();
    pushArtDirection('halcyon');
    FakeAiProvider::push(kitSiteJson('halcyon'));

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/ai/generate-page', [
            'site_id' => $fx['site'],
            'prompt' => 'A boutique design studio.',
        ])
        ->assertOk();

    $page = FakeAiProvider::calls()[1]['prompt'];
    expect($page)->toContain('hero.halcyon');
    expect($page)->toContain('DESIGN SYSTEM');
    // The kit's own chrome, not a generic bar bolted onto a designed page.
    expect($page)->toContain("kit's navbar block");
    expect($page)->not->toContain('start with generated.nav');
});

it('lets the AI choose the palette and keeps it on the site', function () {
    $fx = artFixture();
    pushArtDirection('voltera', ['primary' => '#0f766e', 'accent' => '#f59e0b', 'background' => '#fffdf7']);
    FakeAiProvider::push(kitSiteJson());

    $theme = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/ai/generate-page', [
            'site_id' => $fx['site'],
            'prompt' => 'A herbal apothecary.',
        ])
        ->assertOk()
        ->json('data.theme');

    expect($theme['primary'])->toBe('#0f766e');
    expect($theme['accent'])->toBe('#f59e0b');
});

it('stamps the chosen motion onto the sections it generated', function () {
    $fx = artFixture();
    pushArtDirection('voltera', ['primary' => '#1d4ed8'], [
        'animation' => 'zoom-in',
        'animationTrigger' => 'scroll',
        'animationDuration' => 520,
    ]);
    FakeAiProvider::push(kitSiteJson());

    $sections = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/ai/generate-page', [
            'site_id' => $fx['site'],
            'prompt' => 'A climbing gym.',
        ])
        ->assertOk()
        ->json('data.pages.0.content.sections');

    $hero = collect($sections)->firstWhere('type', 'hero.voltera');
    expect($hero['props']['animation'])->toBe('zoom-in');
    expect($hero['props']['animationDuration'])->toBe(520);
});

it('refuses motion values the blocks would not understand', function () {
    $fx = artFixture();
    pushArtDirection('voltera', ['primary' => '#1d4ed8'], [
        'animation' => 'barrel-roll',
        'animationDuration' => 99999,
    ]);
    FakeAiProvider::push(kitSiteJson());

    $sections = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/ai/generate-page', [
            'site_id' => $fx['site'],
            'prompt' => 'A dentist.',
        ])
        ->assertOk()
        ->json('data.pages.0.content.sections');

    $hero = collect($sections)->firstWhere('type', 'hero.voltera');
    // The invented easing is dropped; the out-of-range duration is clamped.
    expect($hero['props']['animation'] ?? null)->not->toBe('barrel-roll');
    expect($hero['props']['animationDuration'])->toBe(900);
});

it('still builds a site when art direction names a kit that does not exist', function () {
    $fx = artFixture();
    pushArtDirection('brandnew-kit-that-is-not-real');
    FakeAiProvider::push((string) json_encode([
        'pages' => [[
            'name' => 'Home',
            'slug' => 'home',
            'is_homepage' => true,
            'sections' => [
                ['type' => 'generated.nav', 'props' => ['logo' => 'Fallback']],
                ['type' => 'generated.hero', 'props' => ['heading' => 'Still built', 'description' => 'A page all the same.']],
            ],
        ]],
    ]));

    $sections = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/ai/generate-page', [
            'site_id' => $fx['site'],
            'prompt' => 'A bakery.',
        ])
        ->assertOk()
        ->json('data.pages.0.content.sections');

    // A bad choice costs the design upgrade, never the site.
    expect($sections)->not->toBeEmpty();
    expect(FakeAiProvider::calls()[1]['prompt'])->toContain('generated.hero');
});

it('does not re-direct a site that already has a design of its own', function () {
    $fx = artFixture();

    // Give the site a Voltera page, so it now has a kit.
    $page = Page::query()->where('site_id', $fx['site'])->firstOrFail();
    test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/pages/'.$page->id.'/draft', ['content' => ['schemaVersion' => 1, 'sections' => [
            ['id' => 'a', 'type' => 'navbar.voltera', 'version' => 1, 'hidden' => false, 'props' => []],
            ['id' => 'b', 'type' => 'hero.voltera', 'version' => 1, 'hidden' => false, 'props' => []],
            ['id' => 'c', 'type' => 'services.voltera', 'version' => 1, 'hidden' => false, 'props' => []],
            ['id' => 'd', 'type' => 'footer.voltera', 'version' => 1, 'hidden' => false, 'props' => []],
        ]]])
        ->assertOk();

    FakeAiProvider::push(kitSiteJson());

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/ai/generate-page', [
            'site_id' => $fx['site'],
            'prompt' => 'Add a services page.',
        ])
        ->assertOk();

    // The site's own design decides; nobody is asked to pick a new one.
    expect(FakeAiProvider::calls()[0]['system'])->not->toContain('You are the art director');
});
