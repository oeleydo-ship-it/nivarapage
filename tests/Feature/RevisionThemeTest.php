<?php

use App\Models\Page;
use App\Models\PageRevision;
use Laravel\Sanctum\Sanctum;

/**
 * A version is the whole design, not just the layout.
 *
 * The theme lives on the site rather than the page, so restoring a revision
 * used to bring back the old sections wearing today's colours, fonts and text
 * size - a version that had never actually existed. Each revision now carries
 * the tokens it was saved with.
 */

/**
 * @return array{headers: array<string, string>, page: Page, site: array<string, mixed>}
 */
function revisionFixture(): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $site = test()->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Theme Site', 'subdomain' => 'themesite'])
        ->json('data');

    return [
        'headers' => $headers,
        'page' => Page::query()->where('site_id', $site['id'])->first(),
        'site' => $site,
    ];
}

/** @param array<string, mixed> $tokens */
function putTheme(array $headers, int|string $siteId, array $tokens): void
{
    test()->withHeaders($headers)
        ->putJson('/api/v1/sites/'.$siteId.'/theme', ['tokens' => $tokens])
        ->assertOk();
}

it('restores the colours, fonts and text size the version was saved with', function () {
    ['headers' => $headers, 'page' => $page, 'site' => $site] = revisionFixture();

    $old = ['primary' => '#0f766e', 'text' => '#111111', 'headingFont' => 'Newsreader, Georgia, serif', 'textScale' => '110%'];
    putTheme($headers, $site['id'], $old);
    test()->withHeaders($headers)->putJson('/api/v1/pages/'.$page->id.'/draft', ['content' => sampleContent('V1')]);
    test()->withHeaders($headers)->postJson('/api/v1/pages/'.$page->id.'/publish');
    $original = $page->fresh()->publishedRevision;

    // The design moves on: new palette, new type, new size.
    $new = ['primary' => '#c2570f', 'text' => '#141414', 'headingFont' => 'Inter, system-ui, sans-serif', 'textScale' => '90%'];
    putTheme($headers, $site['id'], $new);
    test()->withHeaders($headers)->putJson('/api/v1/pages/'.$page->id.'/draft', ['content' => sampleContent('V2')]);

    test()->withHeaders($headers)
        ->postJson('/api/v1/pages/'.$page->id.'/revisions/'.$original->id.'/restore')
        ->assertOk();

    $page->refresh();
    $tokens = $page->site->fresh('theme')->theme->tokens;

    expect($page->draftRevision->content_json['sections'][0]['props']['heading'])->toBe('V1')
        ->and($tokens['primary'])->toBe('#0f766e')
        ->and($tokens['text'])->toBe('#111111')
        ->and($tokens['headingFont'])->toBe('Newsreader, Georgia, serif')
        ->and($tokens['textScale'])->toBe('110%');
});

it('carries the snapshot forward so restoring twice does not walk the theme backwards', function () {
    ['headers' => $headers, 'page' => $page, 'site' => $site] = revisionFixture();

    putTheme($headers, $site['id'], ['primary' => '#0f766e']);
    test()->withHeaders($headers)->putJson('/api/v1/pages/'.$page->id.'/draft', ['content' => sampleContent('V1')]);
    test()->withHeaders($headers)->postJson('/api/v1/pages/'.$page->id.'/publish');
    $original = $page->fresh()->publishedRevision;

    putTheme($headers, $site['id'], ['primary' => '#c2570f']);

    test()->withHeaders($headers)->postJson('/api/v1/pages/'.$page->id.'/revisions/'.$original->id.'/restore')->assertOk();
    $restored = $page->fresh()->draftRevision;

    // The revision the restore itself wrote must describe the restored theme,
    // not the one it replaced.
    expect($restored->theme_tokens['primary'])->toBe('#0f766e');

    test()->withHeaders($headers)->postJson('/api/v1/pages/'.$page->id.'/revisions/'.$restored->id.'/restore')->assertOk();

    expect($page->site->fresh('theme')->theme->tokens['primary'])->toBe('#0f766e');
});

it('leaves a live theme alone when the version predates theme snapshots', function () {
    ['headers' => $headers, 'page' => $page, 'site' => $site] = revisionFixture();

    test()->withHeaders($headers)->putJson('/api/v1/pages/'.$page->id.'/draft', ['content' => sampleContent('V1')]);
    test()->withHeaders($headers)->postJson('/api/v1/pages/'.$page->id.'/publish');
    $original = $page->fresh()->publishedRevision;

    // Exactly what history written before this feature looks like.
    PageRevision::query()->whereKey($original->id)->update(['theme_tokens' => null]);

    putTheme($headers, $site['id'], ['primary' => '#c2570f']);
    test()->withHeaders($headers)->putJson('/api/v1/pages/'.$page->id.'/draft', ['content' => sampleContent('V2')]);

    test()->withHeaders($headers)
        ->postJson('/api/v1/pages/'.$page->id.'/revisions/'.$original->id.'/restore')
        ->assertOk();

    $page->refresh();

    expect($page->draftRevision->content_json['sections'][0]['props']['heading'])->toBe('V1')
        ->and($page->site->fresh('theme')->theme->tokens['primary'])->toBe('#c2570f');
});

it('tells the history list which versions restore a theme', function () {
    ['headers' => $headers, 'page' => $page, 'site' => $site] = revisionFixture();

    putTheme($headers, $site['id'], ['primary' => '#0f766e']);
    test()->withHeaders($headers)->putJson('/api/v1/pages/'.$page->id.'/draft', ['content' => sampleContent('V1')]);

    $listed = test()->withHeaders($headers)->getJson('/api/v1/pages/'.$page->id.'/revisions')->assertOk()->json('data.0');
    $one = test()->withHeaders($headers)
        ->getJson('/api/v1/pages/'.$page->id.'/revisions/'.$page->fresh()->draft_revision_id)
        ->assertOk()->json('data');

    // The listing stays light; the tokens arrive only when one version is opened.
    expect($listed['has_theme'])->toBeTrue()
        ->and($listed)->not->toHaveKey('theme_tokens')
        ->and($one['theme_tokens']['primary'])->toBe('#0f766e');
});
