<?php

use App\Models\Template;
use Database\Seeders\TemplateSeeder;

/**
 * Template demos are the one thing a stranger can read.
 *
 * The marketing site links straight to them, so they must answer without a
 * session — and must stop answering the moment a template is withdrawn, rather
 * than staying reachable to anyone who kept the link.
 */
beforeEach(function () {
    $this->seed(TemplateSeeder::class);
});

it('serves the template list without a session', function () {
    $rows = test()->getJson('/api/v1/public/templates')->assertOk()->json('data');

    expect($rows)->not->toBeEmpty();
    expect(collect($rows)->pluck('slug'))->toContain('anchorline');
});

it('serves a whole template, pages and theme, without a session', function () {
    $data = test()->getJson('/api/v1/public/templates/anchorline')->assertOk()->json('data');

    expect($data['name'])->toBe('Anchorline')
        ->and($data['theme_tokens']['headingFont'])->toContain('Newsreader')
        ->and($data['pages'])->toHaveCount(7);

    $home = collect($data['pages'])->firstWhere('is_homepage', true);
    expect(collect($home['content_json']['sections'])->pluck('type'))->toContain('hero.anchor');
});

it('hands the marketing site the demo link for each template', function () {
    $rows = test()->getJson('/api/v1/public/templates')->assertOk()->json('data');
    $anchorline = collect($rows)->firstWhere('slug', 'anchorline');

    expect($anchorline['demo_path'])->toBe('/demo/anchorline');
});

it('stops serving a template that has been withdrawn', function () {
    Template::query()->where('slug', 'anchorline')->update(['is_active' => false]);

    test()->getJson('/api/v1/public/templates/anchorline')->assertNotFound();

    $rows = test()->getJson('/api/v1/public/templates')->assertOk()->json('data');
    expect(collect($rows)->pluck('slug'))->not->toContain('anchorline');
});

it('keeps the dashboard template routes behind a session', function () {
    // The public endpoints are an addition, not a hole in the existing ones.
    test()->getJson('/api/v1/templates')->assertUnauthorized();
    test()->getJson('/api/v1/templates/anchorline')->assertUnauthorized();
});
