<?php

use App\Models\PageRender;
use App\Models\Site;
use Laravel\Sanctum\Sanctum;

/**
 * @return array{headers: array<string, string>, site: int}
 */
function livechatSiteFixture(): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $siteId = (int) test()->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Chat Site', 'subdomain' => 'chatsite'])
        ->assertCreated()
        ->json('data.id');

    test()->withHeaders($headers)->postJson('/api/v1/sites/'.$siteId.'/publish')->assertOk();

    return ['headers' => $headers, 'site' => $siteId];
}

it('reports the widget as off the live pages until they carry it', function () {
    $fx = livechatSiteFixture();

    $widget = test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/sites/'.$fx['site'].'/livechat', ['enabled' => true])
        ->assertOk()
        ->json('data');

    expect($widget['enabled'])->toBeTrue()
        // Switched on, but nothing has been rendered with it yet.
        ->and($widget['live_on_site'])->toBeFalse()
        ->and($widget['site']['status'])->toBe('published');

    // The publish-time render is what actually puts it on the site.
    PageRender::query()->create([
        'site_id' => $fx['site'],
        'path' => '/',
        'html' => '<html><body><script src="https://app.test/api/v1/public/livechat/'.$widget['public_key'].'/widget.js" async></script></body></html>',
        'hash' => hash('sha256', 'x'),
    ]);

    $after = test()->withHeaders($fx['headers'])
        ->getJson('/api/v1/sites/'.$fx['site'].'/livechat')
        ->assertOk()
        ->json('data');

    expect($after['live_on_site'])->toBeTrue();
});

it('never calls a switched-off widget live', function () {
    $fx = livechatSiteFixture();

    $widget = test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/sites/'.$fx['site'].'/livechat', ['enabled' => true])
        ->assertOk()
        ->json('data');

    PageRender::query()->create([
        'site_id' => $fx['site'],
        'path' => '/',
        'html' => '<script src="/api/v1/public/livechat/'.$widget['public_key'].'/widget.js"></script>',
        'hash' => hash('sha256', 'y'),
    ]);

    $off = test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/sites/'.$fx['site'].'/livechat', ['enabled' => false])
        ->assertOk()
        ->json('data');

    // The tag is still in the stale HTML, but the widget is off: reporting it
    // as live would send the owner looking for a bubble that boots and stops.
    expect($off['live_on_site'])->toBeFalse();
});

it('writes the widget into the pages the builder renders', function () {
    $fx = livechatSiteFixture();

    test()->withHeaders($fx['headers'])
        ->putJson('/api/v1/sites/'.$fx['site'].'/livechat', ['enabled' => true])
        ->assertOk();

    $site = test()->withHeaders($fx['headers'])
        ->getJson('/api/v1/sites/'.$fx['site'].'/render-payload')
        ->assertOk()
        ->json('data.site');

    expect($site['livechat'])->not->toBeNull()
        ->and($site['livechat']['enabled'])->toBeTrue()
        ->and($site['livechat']['script_url'])->toContain('/widget.js');
});

it('leaves the payload clean when the widget is off', function () {
    $fx = livechatSiteFixture();

    $site = test()->withHeaders($fx['headers'])
        ->getJson('/api/v1/sites/'.$fx['site'].'/render-payload')
        ->assertOk()
        ->json('data.site');

    expect($site['livechat'])->toBeNull();
});
