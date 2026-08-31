<?php

use App\Models\Domain;
use App\Models\PageRender;
use App\Models\Site;
use App\Support\HostRole;
use Laravel\Sanctum\Sanctum;

/**
 * Creates a published site reachable at $host, with one stored render per path.
 *
 * @param  array<string, string>  $renders  path => html
 */
function publishedSite(string $host, array $renders = ['/' => '<h1>Home</h1>'], string $status = 'published'): Site
{
    ['user' => $user, 'workspace' => $workspace] = tenant();

    $site = Site::query()->create([
        'workspace_id' => $workspace->id,
        'name' => 'Public Site',
        'slug' => 'public-site',
        'status' => $status,
        'created_by' => $user->id,
    ]);

    Domain::query()->create([
        'workspace_id' => $workspace->id,
        'site_id' => $site->id,
        'hostname' => $host,
        'type' => 'subdomain',
        'status' => 'active',
    ]);

    foreach ($renders as $path => $html) {
        PageRender::query()->create([
            'site_id' => $site->id,
            'path' => $path,
            'html' => $html,
            'hash' => hash('sha256', $html),
        ]);
    }

    return $site;
}

it('serves the stored HTML for a published page', function () {
    publishedSite('acme.sites.localhost', ['/' => '<h1>Acme Home</h1>', '/about' => '<h1>About Acme</h1>']);

    $this->get('http://acme.sites.localhost/')
        ->assertOk()
        ->assertHeader('Content-Type', 'text/html; charset=UTF-8')
        ->assertSee('Acme Home', false);

    $this->get('http://acme.sites.localhost/about')
        ->assertOk()
        ->assertSee('About Acme', false);
});

it('treats a trailing slash and a bare path as the same page', function () {
    publishedSite('acme.sites.localhost', ['/about' => '<h1>About Acme</h1>']);

    $this->get('http://acme.sites.localhost/about/')->assertOk()->assertSee('About Acme', false);
});

it('returns 404 for a hostname with no active domain', function () {
    publishedSite('acme.sites.localhost');

    $this->get('http://nobody.sites.localhost/')
        ->assertNotFound()
        ->assertSee('This domain is not connected to an active website.');
});

it('separates a site that was never published from a page that does not exist', function () {
    $site = publishedSite('acme.sites.localhost', ['/' => '<h1>Home</h1>']);

    $this->get('http://acme.sites.localhost/missing')
        ->assertNotFound()
        ->assertSee('This page is unavailable.');

    PageRender::query()->where('site_id', $site->id)->delete();

    $this->get('http://acme.sites.localhost/')
        ->assertNotFound()
        ->assertSee('This website has not been published yet.');
});

it('reports a disabled site as unavailable rather than missing', function () {
    publishedSite('acme.sites.localhost', ['/' => '<h1>Home</h1>'], 'disabled');

    $this->get('http://acme.sites.localhost/')
        ->assertStatus(503)
        ->assertSee('This website is currently unavailable.');
});

it('answers a repeat request with 304 when the render has not changed', function () {
    publishedSite('acme.sites.localhost', ['/' => '<h1>Home</h1>']);

    $etag = $this->get('http://acme.sites.localhost/')->assertOk()->headers->get('ETag');

    expect($etag)->not->toBeNull();

    $this->withHeaders(['If-None-Match' => $etag])
        ->get('http://acme.sites.localhost/')
        ->assertStatus(304);
});

it('never serves published HTML on the dashboard hostname', function () {
    config(['uidesired.dashboard_hosts' => ['app.localhost']]);
    publishedSite('app.localhost', ['/' => '<h1>Should not leak</h1>']);

    // app.localhost is the dashboard, so the site that (wrongly) claims that
    // hostname must not be served through it.
    $this->get('http://app.localhost/')->assertDontSee('Should not leak', false);
});

it('serves a sitemap and robots for a published site', function () {
    publishedSite('acme.sites.localhost');

    $this->get('http://acme.sites.localhost/robots.txt')
        ->assertOk()
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8');

    $this->get('http://acme.sites.localhost/sitemap.xml')
        ->assertOk()
        ->assertSee('<urlset', false);
});

it('tells crawlers to stay out of an unknown hostname', function () {
    $this->get('http://nobody.sites.localhost/robots.txt')
        ->assertOk()
        ->assertSee('Disallow: /');
});

it('classifies hostnames into dashboard, preview and published roles', function () {
    config([
        'uidesired.dashboard_hosts' => ['app.localhost'],
        'uidesired.preview_domain' => 'preview.localhost',
    ]);

    expect(HostRole::for('app.localhost'))->toBe(HostRole::DASHBOARD)
        ->and(HostRole::for('APP.localhost'))->toBe(HostRole::DASHBOARD)
        ->and(HostRole::for('preview.localhost'))->toBe(HostRole::PREVIEW)
        ->and(HostRole::for('acme.sites.localhost'))->toBe(HostRole::PUBLISHED)
        ->and(HostRole::for('customer-domain.com'))->toBe(HostRole::PUBLISHED);
});

it('stores renders posted by the builder and prunes stale paths', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);

    $siteId = (int) $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Render Site', 'subdomain' => 'rendersite'])
        ->assertCreated()
        ->json('data.id');

    $this->withHeaders($headers)->postJson("/api/v1/sites/{$siteId}/renders", [
        'renders' => [
            ['path' => '/', 'html' => '<h1>Home</h1>'],
            ['path' => '/old', 'html' => '<h1>Old</h1>'],
        ],
    ])->assertCreated()->assertJsonPath('data.stored', 2);

    expect(PageRender::query()->where('site_id', $siteId)->count())->toBe(2);

    // Republishing without /old, asking for a prune, retires that path.
    $this->withHeaders($headers)->postJson("/api/v1/sites/{$siteId}/renders", [
        'renders' => [['path' => '/', 'html' => '<h1>Home v2</h1>']],
        'prune' => true,
    ])->assertCreated();

    expect(PageRender::query()->where('site_id', $siteId)->pluck('path')->all())->toBe(['/']);
});

it('refuses renders for a site in another workspace', function () {
    $victim = publishedSite('acme.sites.localhost');

    // A fully legitimate user of a different workspace: the request carries a
    // valid token and a valid workspace header, and is refused purely because
    // the site belongs to someone else.
    ['user' => $outsider, 'workspace' => $theirs] = tenant();
    $headers = authHeaders($outsider, $theirs);

    $this->withHeaders($headers)->postJson("/api/v1/sites/{$victim->id}/renders", [
        'renders' => [['path' => '/', 'html' => '<h1>hacked</h1>']],
    // 404, not 403: workspace scoping hides the site entirely, so the response
    // does not confirm that this site id exists.
    ])->assertNotFound();

    expect(PageRender::query()->where('site_id', $victim->id)->where('html', '<h1>hacked</h1>')->exists())->toBeFalse();
});

it('serves a published funnel step by public id on any hostname', function () {
    $site = publishedSite('acme.sites.localhost', ['/' => '<h1>Home</h1>']);

    $funnel = App\Models\Funnel::query()->create([
        'workspace_id' => $site->workspace_id,
        'site_id' => $site->id,
        'public_id' => 'fnl_abc123',
        'name' => 'Lead Magnet',
        'slug' => 'lead-magnet',
        'status' => 'published',
    ]);

    App\Models\PageRender::query()->create([
        'site_id' => $site->id,
        'path' => "/f/{$funnel->public_id}/start",
        'html' => '<h1>Funnel Start</h1>',
        'hash' => hash('sha256', 'funnel'),
    ]);

    // Reachable on the site's own hostname...
    $this->get('http://acme.sites.localhost/f/fnl_abc123/start')
        ->assertOk()
        ->assertSee('Funnel Start', false)
        ->assertHeader('X-Robots-Tag', 'noindex, follow');

    // ...and on a hostname with no site connected, because a shared funnel link
    // resolves by public id before any host lookup.
    $this->get('http://nobody.sites.localhost/f/fnl_abc123/start')
        ->assertOk()
        ->assertSee('Funnel Start', false);

    $this->get('http://acme.sites.localhost/f/fnl_abc123/missing')->assertNotFound();
});

it('keeps funnel renders when the site itself is republished', function () {
    $site = publishedSite('acme.sites.localhost', ['/' => '<h1>Home</h1>']);
    App\Models\PageRender::query()->create([
        'site_id' => $site->id,
        'path' => '/f/fnl_x/start',
        'html' => '<h1>Funnel</h1>',
        'hash' => hash('sha256', 'f'),
    ]);

    // Funnels publish on their own schedule, so a site publish that prunes
    // retired pages must leave them alone.
    app(App\Services\Rendering\SiteRenderService::class)->pruneExcept($site, ['/']);

    expect(App\Models\PageRender::query()->where('site_id', $site->id)->pluck('path')->sort()->values()->all())
        ->toBe(['/', '/f/fnl_x/start']);
});
