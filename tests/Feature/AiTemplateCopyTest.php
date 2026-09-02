<?php

use App\Models\Page;
use App\Services\Ai\FakeAiProvider;
use App\Support\BlockCatalog;
use App\Support\TemplateCopySlots;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    FakeAiProvider::reset();
    BlockCatalog::flush();
    config(['ai.api_key' => null]);
});

/** A page whose sections are the sort a template ships with. */
function templateSections(): array
{
    return [
        [
            'id' => 'nav',
            'type' => 'navbar.simple',
            'version' => 1,
            'hidden' => false,
            'props' => ['logo' => 'Template Brand', 'anchorId' => 'top'],
        ],
        [
            'id' => 'hero',
            'type' => 'hero.centered',
            'version' => 1,
            'hidden' => false,
            'props' => [
                'heading' => 'Template heading',
                'description' => 'Template description.',
                'buttonLabel' => 'Template CTA',
                'buttonUrl' => 'https://example.com/keep-me',
                'backgroundColor' => '#123456',
            ],
        ],
    ];
}

/**
 * @return array{headers: array<string, string>, site: int, page: Page}
 */
function copyFixture(): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    enableAi();
    allowAi($workspace);

    $siteId = test()->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Copy Site', 'subdomain' => 'copysite'])
        ->assertCreated()
        ->json('data.id');

    $page = Page::query()->where('site_id', $siteId)->firstOrFail();
    test()->withHeaders($headers)
        ->putJson('/api/v1/pages/'.$page->id.'/draft', ['content' => ['schemaVersion' => 1, 'sections' => templateSections()]])
        ->assertOk();

    return ['headers' => $headers, 'site' => (int) $siteId, 'page' => $page->fresh()];
}

function draftSections(Page $page): array
{
    return $page->fresh('draftRevision')->draftRevision->content_json['sections'] ?? [];
}

it('rewrites the copy without changing the template', function () {
    $fx = copyFixture();

    // The model answers with replacement strings for the slots it was given.
    FakeAiProvider::push(json_encode(['slots' => [
        ['i' => 0, 'text' => 'Harbour Dental'],
        ['i' => 1, 'text' => 'Gentle dentistry in Cape Town'],
        ['i' => 2, 'text' => 'Same-week appointments, no lectures.'],
        ['i' => 3, 'text' => 'Book a check-up'],
    ]]));

    $response = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/ai/generate-template-copy', ['site_id' => $fx['site']])
        ->assertOk()
        ->json('data');

    expect($response['pages'])->toBe(1)
        ->and($response['rewritten'])->toBeGreaterThan(0);

    $after = draftSections($fx['page']);
    $before = templateSections();

    // The template survives: same blocks, same order.
    expect(array_column($after, 'type'))->toBe(array_column($before, 'type'))
        ->and(array_column($after, 'id'))->toBe(array_column($before, 'id'));

    // The words changed.
    expect($after[0]['props']['logo'])->toBe('Harbour Dental')
        ->and($after[1]['props']['heading'])->toBe('Gentle dentistry in Cape Town')
        ->and($after[1]['props']['buttonLabel'])->toBe('Book a check-up');

    // Design props and addresses did not.
    expect($after[1]['props']['backgroundColor'])->toBe('#123456')
        ->and($after[1]['props']['buttonUrl'])->toBe('https://example.com/keep-me')
        ->and($after[0]['props']['anchorId'])->toBe('top');
});

it('never lets the model introduce or remove a block', function () {
    $fx = copyFixture();

    // Even asked to, the model cannot: it only ever returns strings, and an
    // index outside the list it was given addresses nothing.
    FakeAiProvider::push(json_encode(['slots' => [
        ['i' => 0, 'text' => 'Kept'],
        ['i' => 999, 'text' => 'Nowhere'],
        ['i' => 'hero.centered', 'text' => 'Not an index'],
    ]]));

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/ai/generate-template-copy', ['site_id' => $fx['site']])
        ->assertOk();

    $after = draftSections($fx['page']);

    expect($after)->toHaveCount(2)
        ->and(array_column($after, 'type'))->toBe(['navbar.simple', 'hero.centered'])
        ->and($after[0]['props']['logo'])->toBe('Kept')
        // The slots the model ignored keep the template's own copy.
        ->and($after[1]['props']['heading'])->toBe('Template heading');
});

it('sends the business details and the existing copy to the model', function () {
    $fx = copyFixture();
    FakeAiProvider::push(json_encode(['slots' => [['i' => 0, 'text' => 'Anything']]]));

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/ai/generate-template-copy', [
            'site_id' => $fx['site'],
            'prompt' => 'We are a family dental practice',
            'tone' => 'warm',
        ])->assertOk();

    $prompt = FakeAiProvider::calls()[0]['prompt'];

    expect($prompt)->toContain('Copy Site')
        ->toContain('We are a family dental practice')
        ->toContain('warm')
        // The template's own words are the starting point.
        ->toContain('Template heading')
        // Structure is never in the conversation.
        ->not->toContain('"sections"');
});

it('refuses when the model returns nothing usable', function () {
    $fx = copyFixture();
    FakeAiProvider::push(json_encode(['slots' => []]));

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/ai/generate-template-copy', ['site_id' => $fx['site']])
        ->assertStatus(422);

    // And the template's copy is left exactly as it was.
    expect(draftSections($fx['page'])[1]['props']['heading'])->toBe('Template heading');
});

it('keeps the copy slots away from other workspaces', function () {
    $fx = copyFixture();

    ['user' => $stranger] = tenant();
    Sanctum::actingAs($stranger);

    // Refused by the workspace guard before the site is ever looked up.
    test()->postJson('/api/v1/ai/generate-template-copy', ['site_id' => $fx['site']])
        ->assertForbidden();
});

it('collects only prose, not addresses or identifiers', function () {
    $slots = TemplateCopySlots::collect(templateSections());
    $paths = array_column($slots, 'path');

    expect($paths)->toContain('0.logo')
        ->toContain('1.heading')
        ->toContain('1.buttonLabel')
        // A URL and an anchor are not writing.
        ->not->toContain('1.buttonUrl')
        ->not->toContain('0.anchorId');
});
