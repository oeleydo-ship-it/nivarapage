<?php

use App\Models\Page;
use App\Models\Site;
use Laravel\Sanctum\Sanctum;

/**
 * A site with one published page, plus the headers to act on it.
 *
 * @return array{headers: array<string, string>, site: int}
 */
function blogRenderFixture(): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $siteId = (int) test()->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Journal Site', 'subdomain' => 'journalsite'])
        ->assertCreated()
        ->json('data.id');

    test()->withHeaders($headers)->postJson('/api/v1/sites/'.$siteId.'/publish')->assertOk();

    return ['headers' => $headers, 'site' => $siteId];
}

/**
 * @param  array<string, mixed>  $extra
 */
function makePost(array $fx, string $title, bool $published = true, array $extra = []): array
{
    $post = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/blog-posts', [
            'site_id' => $fx['site'],
            'title' => $title,
            ...$extra,
        ])
        ->assertCreated()
        ->json('data');

    if ($published) {
        $post = test()->withHeaders($fx['headers'])
            ->postJson('/api/v1/blog-posts/'.$post['id'].'/publish')
            ->assertOk()
            ->json('data');
    }

    return $post;
}

/** @return array<string, array<string, mixed>> path => entry */
function payloadByPath(array $fx): array
{
    $pages = test()->withHeaders($fx['headers'])
        ->getJson('/api/v1/sites/'.$fx['site'].'/render-payload')
        ->assertOk()
        ->json('data.pages');

    return collect($pages)->keyBy('path')->all();
}

it('gives every published post a page to render', function () {
    $fx = blogRenderFixture();
    $post = makePost($fx, 'Shipping the first page', true, [
        'body' => "First paragraph.\n\nSecond paragraph.",
        'excerpt' => 'How the first page went out.',
        'category' => 'Notes',
        'author_name' => 'Sam',
    ]);

    $entries = payloadByPath($fx);
    $path = '/blog/'.$post['slug'];

    // The address the blog index links to is one the renderer is asked to build.
    expect($entries)->toHaveKey($path);

    $page = $entries[$path]['page'];
    $section = $page['content']['sections'][0];

    expect($section['type'])->toBe('blog.post')
        ->and($section['props']['heading'])->toBe('Shipping the first page')
        ->and($section['props']['author'])->toBe('Sam')
        ->and($section['props']['eyebrow'])->toBe('Notes')
        // Plain text becomes paragraphs rather than arriving as one run-on line.
        ->and($section['props']['bodyHtml'])->toContain('<p>First paragraph.</p>')
        ->and($section['props']['bodyHtml'])->toContain('<p>Second paragraph.</p>')
        // It is not attached to a page row, so it cannot be mistaken for one.
        ->and($entries[$path]['page_id'])->toBeNull();

    expect($page['seo_title'])->toBe('Shipping the first page')
        ->and($page['seo_description'])->toBe('How the first page went out.');
});

it('leaves drafts out of the render payload', function () {
    $fx = blogRenderFixture();
    $draft = makePost($fx, 'Not ready yet', false);

    expect(payloadByPath($fx))->not->toHaveKey('/blog/'.$draft['slug']);
});

it('renders posts under the journal path when the site has one', function () {
    $fx = blogRenderFixture();

    // A site whose blog lives at /journal must not publish posts at /blog: the
    // cards, the sitemap and the page all have to agree on one address.
    $site = Site::query()->findOrFail($fx['site']);
    Page::query()->create([
        'site_id' => $site->id,
        'workspace_id' => $site->workspace_id,
        'name' => 'Journal',
        'slug' => 'journal',
    ]);

    $post = makePost($fx, 'A journal entry');

    expect(payloadByPath($fx))->toHaveKey('/journal/'.$post['slug']);
});

it('serves the post once its HTML has been stored', function () {
    $fx = blogRenderFixture();
    $post = makePost($fx, 'Live article');
    $path = '/blog/'.$post['slug'];

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/renders', [
            'renders' => [
                ['path' => '/', 'html' => '<h1>Home</h1>'],
                ['path' => $path, 'html' => '<h1>Live article</h1>'],
            ],
            'prune' => true,
        ])
        ->assertCreated();

    $host = Site::query()->findOrFail($fx['site'])->domains()->firstOrFail()->hostname;

    test()->get('http://'.$host.$path)
        ->assertOk()
        ->assertSee('Live article', false);
});

it('stops serving a post that was deleted', function () {
    $fx = blogRenderFixture();
    $post = makePost($fx, 'Retracted');
    $path = '/blog/'.$post['slug'];

    test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/renders', [
            'renders' => [['path' => '/', 'html' => '<h1>Home</h1>'], ['path' => $path, 'html' => '<h1>Retracted</h1>']],
            'prune' => true,
        ])
        ->assertCreated();

    test()->withHeaders($fx['headers'])->deleteJson('/api/v1/blog-posts/'.$post['id'])->assertOk();

    // The post is gone from the payload, so the next render pass prunes its page.
    expect(payloadByPath($fx))->not->toHaveKey($path);
});

it('links its cards at the same address it renders', function () {
    $fx = blogRenderFixture();
    $post = makePost($fx, 'Consistent link');

    $cards = app(App\Services\BlogService::class)->publishedCards(Site::query()->findOrFail($fx['site']));

    expect($cards[0]['url'])->toBe('/blog/'.$post['slug'])
        ->and(payloadByPath($fx))->toHaveKey($cards[0]['url']);
});

it('leaves the back link off when the site has no blog page', function () {
    $fx = blogRenderFixture();
    $post = makePost($fx, 'Standalone');

    $section = payloadByPath($fx)['/blog/'.$post['slug']]['page']['content']['sections'][0];

    // The link would be a 404 we printed ourselves.
    expect($section['props']['backLabel'])->toBe('');
});

it('creates and publishes a blog index page on request', function () {
    $fx = blogRenderFixture();
    $post = makePost($fx, 'Needs a home');

    $result = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/blog-index')
        ->assertOk()
        ->json('data');

    expect($result['path'])->toBe('/blog');

    $entries = payloadByPath($fx);

    // The index is now a page the renderer builds, and the post links back to it.
    expect($entries)->toHaveKey('/blog')
        ->and($entries['/blog/'.$post['slug']]['page']['content']['sections'][0]['props']['backLabel'])->toBe('All posts');

    // It lists the site's live posts rather than the block's sample articles.
    $index = $entries['/blog']['page']['content']['sections'][0];
    expect($index['props']['useSitePosts'])->toBeTrue()
        ->and(collect($index['props']['items'])->pluck('title')->all())->toContain('Needs a home');
});

it('never replaces a blog page that already exists', function () {
    $fx = blogRenderFixture();

    $existing = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/pages', ['name' => 'Writing', 'slug' => 'blog'])
        ->assertCreated()
        ->json('data');

    $first = test()->withHeaders($fx['headers'])->postJson('/api/v1/sites/'.$fx['site'].'/blog-index')->assertOk()->json('data');
    $second = test()->withHeaders($fx['headers'])->postJson('/api/v1/sites/'.$fx['site'].'/blog-index')->assertOk()->json('data');

    expect($first['page_id'])->toBe($existing['id'])
        ->and($second['page_id'])->toBe($existing['id']);

    expect(Page::query()->where('site_id', $fx['site'])->where('slug', 'blog')->count())->toBe(1);
});

it('keeps the blog index away from other workspaces', function () {
    $fx = blogRenderFixture();

    ['user' => $stranger] = tenant();
    Sanctum::actingAs($stranger);

    test()->postJson('/api/v1/sites/'.$fx['site'].'/blog-index')->assertForbidden();
});
