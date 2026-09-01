<?php

use App\Models\Page;
use App\Models\Site;
use Laravel\Sanctum\Sanctum;

/**
 * @return array{headers: array<string, string>, site: int}
 */
function chromeFixture(): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $siteId = test()->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Chrome Site', 'subdomain' => 'chromesite'])
        ->assertCreated()
        ->json('data.id');

    return ['headers' => $headers, 'site' => (int) $siteId];
}

function navSection(string $id = 'nav-1'): array
{
    return ['id' => $id, 'type' => 'navbar.simple', 'version' => 1, 'hidden' => false, 'props' => ['logo' => 'Acme']];
}

function footerSection(string $id = 'foot-1'): array
{
    return ['id' => $id, 'type' => 'footer.simple', 'version' => 1, 'hidden' => false, 'props' => ['brand' => 'Acme']];
}

it('keeps site chrome away from other workspaces', function () {
    $fx = chromeFixture();

    ['user' => $stranger] = tenant();
    Sanctum::actingAs($stranger);

    test()->getJson('/api/v1/sites/'.$fx['site'].'/chrome')->assertForbidden();
    test()->putJson('/api/v1/sites/'.$fx['site'].'/chrome', ['header' => ['sections' => []]])->assertForbidden();
});

it('starts empty and stores a header and footer', function () {
    $fx = chromeFixture();

    $empty = test()->withHeaders($fx['headers'])
        ->getJson('/api/v1/sites/'.$fx['site'].'/chrome')
        ->assertOk()
        ->json('data');

    expect($empty['header']['sections'])->toBe([])
        ->and($empty['footer']['sections'])->toBe([]);

    $saved = test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/sites/'.$fx['site'].'/chrome', [
            'header' => ['schemaVersion' => 1, 'sections' => [navSection()]],
            'footer' => ['schemaVersion' => 1, 'sections' => [footerSection()]],
        ])
        ->assertOk()
        ->json('data');

    expect($saved['header']['sections'])->toHaveCount(1)
        ->and($saved['header']['sections'][0]['type'])->toBe('navbar.simple')
        ->and($saved['footer']['sections'][0]['type'])->toBe('footer.simple');
});

it('saves one slot without clearing the other', function () {
    $fx = chromeFixture();

    test()->withHeaders($fx['headers'])->putJson('/api/v1/sites/'.$fx['site'].'/chrome', [
        'header' => ['schemaVersion' => 1, 'sections' => [navSection()]],
        'footer' => ['schemaVersion' => 1, 'sections' => [footerSection()]],
    ])->assertOk();

    // A caller editing only the header must not wipe the footer.
    $after = test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/sites/'.$fx['site'].'/chrome', [
            'header' => ['schemaVersion' => 1, 'sections' => [navSection('nav-2')]],
        ])
        ->assertOk()
        ->json('data');

    expect($after['header']['sections'][0]['id'])->toBe('nav-2')
        ->and($after['footer']['sections'])->toHaveCount(1);
});

it('clears a slot when it is sent as null', function () {
    $fx = chromeFixture();

    test()->withHeaders($fx['headers'])->putJson('/api/v1/sites/'.$fx['site'].'/chrome', [
        'header' => ['schemaVersion' => 1, 'sections' => [navSection()]],
    ])->assertOk();

    $after = test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/sites/'.$fx['site'].'/chrome', ['header' => null])
        ->assertOk()
        ->json('data');

    expect($after['header']['sections'])->toBe([]);
});

it('hands the chrome to the renderer with every page', function () {
    $fx = chromeFixture();

    test()->withHeaders($fx['headers'])->putJson('/api/v1/sites/'.$fx['site'].'/chrome', [
        'header' => ['schemaVersion' => 1, 'sections' => [navSection()]],
        'footer' => ['schemaVersion' => 1, 'sections' => [footerSection()]],
    ])->assertOk();

    // A published page is what the render payload lists.
    $site = Site::query()->findOrFail($fx['site']);
    test()->withHeaders($fx['headers'])->postJson('/api/v1/sites/'.$fx['site'].'/publish')->assertOk();

    $payload = test()->withHeaders($fx['headers'])
        ->getJson('/api/v1/sites/'.$fx['site'].'/render-payload')
        ->assertOk()
        ->json('data');

    // Sent once for the whole site rather than copied into each page, so one
    // edit reaches every page and none can hold a stale copy.
    expect($payload['chrome']['header']['sections'][0]['type'])->toBe('navbar.simple')
        ->and($payload['chrome']['footer']['sections'][0]['type'])->toBe('footer.simple')
        ->and($payload['pages'])->not->toBeEmpty();

    expect(Page::query()->where('site_id', $site->id)->count())->toBeGreaterThan(0);
});

it('sends the chrome to preview as well, so it shows what publishing will produce', function () {
    $fx = chromeFixture();

    test()->withHeaders($fx['headers'])->putJson('/api/v1/sites/'.$fx['site'].'/chrome', [
        'header' => ['schemaVersion' => 1, 'sections' => [navSection()]],
    ])->assertOk();

    $token = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/preview-token')
        ->assertOk()
        ->json('data.token_url');

    $preview = test()->postJson($token)->assertOk()->json('data');

    expect($preview['chrome']['header']['sections'][0]['type'])->toBe('navbar.simple');
});

it('rejects a section list that is not valid page content', function () {
    $fx = chromeFixture();

    // The same validator guards page content, so malformed sections are refused
    // outright rather than stored and blowing up at render time.
    test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/sites/'.$fx['site'].'/chrome', [
            'header' => ['schemaVersion' => 1, 'sections' => [['id' => 'x', 'nope' => true]]],
        ])
        ->assertStatus(422);

    // And nothing was written.
    expect(test()->withHeaders($fx['headers'])->getJson('/api/v1/sites/'.$fx['site'].'/chrome')->json('data.header.sections'))->toBe([]);
});
