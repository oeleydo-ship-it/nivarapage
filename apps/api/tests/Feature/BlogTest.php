<?php

it('publishes a post only on the chosen site', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $workspace->subscription->plan->update([
        'limits' => array_merge($workspace->subscription->plan->limits ?? [], ['number_of_sites' => 3]),
    ]);
    $headers = authHeaders($user, $workspace);

    $alpha = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Alpha Blog', 'subdomain' => 'alphablog'])
        ->assertCreated()
        ->json('data');
    $beta = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Beta Blog', 'subdomain' => 'betablog'])
        ->assertCreated()
        ->json('data');

    $this->withHeaders($headers)
        ->postJson('/api/v1/pages/'.$this->withHeaders($headers)->getJson('/api/v1/sites/'.$alpha['id'].'/pages')->json('data.0.id').'/publish')
        ->assertOk();

    $post = $this->withHeaders($headers)
        ->postJson('/api/v1/blog-posts', [
            'site_id' => $alpha['id'],
            'title' => 'Shipping the first page',
            'excerpt' => 'How Alpha launched.',
            'body' => "We shipped the homepage.\n\nThen we wrote this post.",
            'category' => 'Product',
            'status' => 'published',
        ])
        ->assertCreated()
        ->json('data');

    expect($post['site_id'])->toBe($alpha['id']);
    expect($post['slug'])->toBe('shipping-the-first-page');
    expect($post['path'])->toBe('/blog/shipping-the-first-page');

    $alphaHost = collect($alpha['domains'])->first()['hostname'];
    $betaHost = collect($beta['domains'])->first()['hostname'];

    $this->getJson('/api/v1/public/blog?host='.$alphaHost)
        ->assertOk()
        ->assertJsonPath('data.posts.0.slug', 'shipping-the-first-page');

    $this->getJson('/api/v1/public/blog?host='.$betaHost)
        ->assertOk()
        ->assertJsonPath('data.posts', []);

    $this->getJson('/api/v1/public/blog-post?host='.$alphaHost.'&slug=shipping-the-first-page')
        ->assertOk()
        ->assertJsonPath('data.title', 'Shipping the first page');

    $this->getJson('/api/v1/public/blog-post?host='.$betaHost.'&slug=shipping-the-first-page')
        ->assertNotFound();
});

it('keeps article html in public body_html and strips scripts', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Html Blog', 'subdomain' => 'htmlblog'])
        ->assertCreated()
        ->json('data');

    $this->withHeaders($headers)
        ->postJson('/api/v1/blog-posts', [
            'site_id' => $site['id'],
            'title' => 'Rich article',
            'body' => '<h2>Launch</h2><p>We shipped the <strong>homepage</strong>.</p><script>alert(1)</script><img src="https://cdn.example/cover.jpg" alt="Cover" />',
            'status' => 'published',
        ])
        ->assertCreated();

    $host = collect($site['domains'])->first()['hostname'];
    $payload = $this->getJson('/api/v1/public/blog-post?host='.$host.'&slug=rich-article')
        ->assertOk()
        ->json('data');

    expect($payload['body_html'])->toContain('<h2>Launch</h2>');
    expect($payload['body_html'])->toContain('<strong>homepage</strong>');
    expect($payload['body_html'])->toContain('<img src="https://cdn.example/cover.jpg"');
    expect($payload['body_html'])->not->toContain('<script');
    expect($payload['body_html'])->not->toContain('alert(1)');
});

it('hides drafts from the public site', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Draft Blog', 'subdomain' => 'draftblog'])
        ->assertCreated()
        ->json('data');

    $this->withHeaders($headers)
        ->postJson('/api/v1/blog-posts', [
            'site_id' => $site['id'],
            'title' => 'Still writing',
            'status' => 'draft',
        ])
        ->assertCreated();

    $host = collect($site['domains'])->first()['hostname'];

    $this->getJson('/api/v1/public/blog?host='.$host)
        ->assertOk()
        ->assertJsonPath('data.posts', []);

    $this->getJson('/api/v1/public/blog-post?host='.$host.'&slug=still-writing')
        ->assertNotFound();
});

it('fills a blog page with posts assigned to that site', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Live Blog', 'subdomain' => 'liveblog'])
        ->assertCreated()
        ->json('data');

    $pages = $this->withHeaders($headers)->getJson('/api/v1/sites/'.$site['id'].'/pages')->json('data');
    $home = collect($pages)->firstWhere('is_homepage', true);
    $blog = $this->withHeaders($headers)
        ->postJson('/api/v1/sites/'.$site['id'].'/pages', ['name' => 'Blog', 'slug' => 'blog'])
        ->assertCreated()
        ->json('data');

    $this->withHeaders($headers)->putJson('/api/v1/pages/'.$home['id'].'/draft', [
        'content' => [
            'schemaVersion' => 1,
            'sections' => [[
                'id' => 'home-posts',
                'type' => 'posts.cards',
                'version' => 1,
                'hidden' => false,
                'props' => [
                    'heading' => 'Latest notes',
                    'useSitePosts' => false,
                    'items' => [
                        ['title' => 'Homepage teaser', 'excerpt' => 'Stay curated', 'tag' => 'Studio'],
                    ],
                ],
            ]],
        ],
    ])->assertOk();
    $this->withHeaders($headers)->postJson('/api/v1/pages/'.$home['id'].'/publish')->assertOk();

    $this->withHeaders($headers)->putJson('/api/v1/pages/'.$blog['id'].'/draft', [
        'content' => [
            'schemaVersion' => 1,
            'sections' => [[
                'id' => 'blog-posts',
                'type' => 'blog.list',
                'version' => 1,
                'hidden' => false,
                'props' => [
                    'heading' => 'Journal',
                    'items' => [
                        ['title' => 'Placeholder', 'excerpt' => 'Demo', 'tag' => 'Notes'],
                    ],
                ],
            ]],
        ],
    ])->assertOk();
    $this->withHeaders($headers)->postJson('/api/v1/pages/'.$blog['id'].'/publish')->assertOk();

    $this->withHeaders($headers)
        ->postJson('/api/v1/blog-posts', [
            'site_id' => $site['id'],
            'title' => 'Assigned to this site',
            'excerpt' => 'A real post.',
            'body' => 'Published on the chosen website.',
            'category' => 'Product',
            'status' => 'published',
        ])
        ->assertCreated();

    $host = collect($site['domains'])->first()['hostname'];

    $blogPage = $this->getJson('/api/v1/public/page?host='.$host.'&path=/blog')
        ->assertOk()
        ->json('data.page.content.sections.0.props.items');
    expect($blogPage[0]['title'])->toBe('Assigned to this site');
    expect($blogPage[0]['url'])->toBe('/blog/assigned-to-this-site');

    $homePage = $this->getJson('/api/v1/public/page?host='.$host.'&path=/')
        ->assertOk()
        ->json('data.page.content.sections.0.props.items');
    expect($homePage[0]['title'])->toBe('Homepage teaser');
});

it('keeps blog posts inside the current workspace', function () {
    ['user' => $owner, 'workspace' => $workspace] = tenant();
    ['user' => $other, 'workspace' => $otherWorkspace] = tenant();
    $headers = authHeaders($owner, $workspace);

    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Secret Blog', 'subdomain' => 'secretblog'])
        ->assertCreated()
        ->json('data.id');

    $postId = $this->withHeaders($headers)
        ->postJson('/api/v1/blog-posts', ['site_id' => $siteId, 'title' => 'Private'])
        ->assertCreated()
        ->json('data.id');

    $this->withHeaders(authHeaders($other, $otherWorkspace))
        ->getJson('/api/v1/blog-posts/'.$postId)
        ->assertNotFound();
});
