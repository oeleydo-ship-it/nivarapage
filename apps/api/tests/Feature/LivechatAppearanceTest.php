<?php

/**
 * @return array{headers: array<string, string>, site: int}
 */
function appearanceFixture(): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);

    $siteId = test()->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Look', 'subdomain' => 'lookchat'])
        ->assertCreated()
        ->json('data.id');

    test()->withHeaders($headers)
        ->putJson('/api/v1/sites/'.$siteId.'/livechat', ['enabled' => true])
        ->assertOk();

    return ['headers' => $headers, 'site' => (int) $siteId];
}

it('starts on the dark theme with no colour overrides', function () {
    $fx = appearanceFixture();

    test()->withHeaders($fx['headers'])
        ->getJson('/api/v1/sites/'.$fx['site'].'/livechat')
        ->assertOk()
        ->assertJsonPath('data.theme', 'dark')
        ->assertJsonPath('data.surface_color', null)
        ->assertJsonPath('data.launcher_icon', 'chat');
});

it('saves the widget palette', function () {
    $fx = appearanceFixture();

    test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/sites/'.$fx['site'].'/livechat', [
            'primary_color' => '#16a34a',
            'theme' => 'light',
            'surface_color' => '#fffbf5',
            'text_color' => '#431407',
            'bubble_color' => '#f4f4f5',
            'launcher_icon' => 'headset',
        ])
        ->assertOk()
        ->assertJsonPath('data.primary_color', '#16a34a')
        ->assertJsonPath('data.theme', 'light')
        ->assertJsonPath('data.surface_color', '#fffbf5')
        ->assertJsonPath('data.text_color', '#431407')
        ->assertJsonPath('data.bubble_color', '#f4f4f5')
        ->assertJsonPath('data.launcher_icon', 'headset');
});

it('clears a colour back to the theme default', function () {
    $fx = appearanceFixture();

    test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/sites/'.$fx['site'].'/livechat', ['surface_color' => '#0f1c14'])
        ->assertOk()
        ->assertJsonPath('data.surface_color', '#0f1c14');

    test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/sites/'.$fx['site'].'/livechat', ['surface_color' => null])
        ->assertOk()
        ->assertJsonPath('data.surface_color', null);
});

it('rejects anything that is not a hex colour', function () {
    $fx = appearanceFixture();

    foreach (['red', 'rgb(1,2,3)', 'javascript:alert(1)', '#12345', '#ggg'] as $value) {
        test()->withHeaders($fx['headers'])
            ->putJson('/api/v1/sites/'.$fx['site'].'/livechat', ['primary_color' => $value])
            ->assertStatus(422);
    }
});

it('rejects an unknown theme or launcher icon', function () {
    $fx = appearanceFixture();

    test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/sites/'.$fx['site'].'/livechat', ['theme' => 'neon'])
        ->assertStatus(422);

    test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/sites/'.$fx['site'].'/livechat', ['launcher_icon' => 'rocket'])
        ->assertStatus(422);
});

it('publishes the palette to the visitor-facing config', function () {
    $fx = appearanceFixture();

    test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/sites/'.$fx['site'].'/livechat', [
            'primary_color' => '#16a34a',
            'theme' => 'light',
            'surface_color' => '#fffbf5',
            'launcher_icon' => 'sparkle',
        ])
        ->assertOk();

    $key = test()->withHeaders($fx['headers'])
        ->getJson('/api/v1/sites/'.$fx['site'].'/livechat')
        ->assertOk()
        ->json('data.public_key');

    test()->getJson('/api/v1/public/livechat/'.$key)
        ->assertOk()
        ->assertJsonPath('data.primary_color', '#16a34a')
        ->assertJsonPath('data.theme', 'light')
        ->assertJsonPath('data.surface_color', '#fffbf5')
        ->assertJsonPath('data.launcher_icon', 'sparkle');
});

it('serves an embed script that parses as javascript', function () {
    $fx = appearanceFixture();

    $key = test()->withHeaders($fx['headers'])
        ->getJson('/api/v1/sites/'.$fx['site'].'/livechat')
        ->assertOk()
        ->json('data.public_key');

    $js = test()->get('/api/v1/public/livechat/'.$key.'/widget.js')
        ->assertOk()
        ->getContent();

    // The heredoc that builds this script has no backtick escape, so a stray
    // backslash used to make the whole file unparseable in the browser.
    expect($js)->not->toContain('\\`');
    expect($js)->toContain('--ud-lc-accent');
});
