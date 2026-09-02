<?php

namespace App\Services;

use App\Models\Page;
use App\Models\Site;
use App\Models\User;

/**
 * Creates the page a site's blog posts sit under.
 *
 * Separate from BlogService on purpose: making a page needs PageService, which
 * depends on SeoService, which depends on BlogService. Putting this there would
 * close that loop and the container would never finish resolving it.
 */
class BlogIndexService
{
    public function __construct(
        private readonly BlogService $blog,
        private readonly PageService $pages,
        private readonly PublishService $publish,
        private readonly TenantCacheService $cache,
    ) {}

    /**
     * The site's blog index page, created and published if it has none.
     *
     * Posts link back to an index and the index links out to them, so a site
     * with posts and no index page publishes dead links in both directions.
     * Idempotent, and it returns an existing page rather than replacing it, so
     * it can never overwrite a blog page somebody has already designed.
     */
    public function ensure(Site $site, User $user): Page
    {
        $slug = ltrim($this->blog->indexPath($site), '/');
        $page = $site->pages()->where('slug', $slug)->first();

        if (! $page) {
            $page = $this->pages->create($site, $user, [
                'name' => 'Blog',
                'slug' => $slug,
                'content' => [
                    'schemaVersion' => 1,
                    'sections' => [[
                        'id' => 'blog-index',
                        'type' => 'blog.list',
                        'version' => 1,
                        'hidden' => false,
                        'props' => [
                            'eyebrow' => 'Blog',
                            'heading' => 'Latest posts',
                            'description' => 'Articles published on this website.',
                            // Filled from the site's published posts as the page
                            // is rendered, so it never needs editing again.
                            'useSitePosts' => true,
                            'limit' => 0,
                            'items' => [],
                        ],
                    ]],
                ],
            ]);
        }

        // A page nobody published serves nothing, so creating one and stopping
        // there would leave the same dead link this exists to fix.
        if (! $page->published_revision_id) {
            $page = $this->publish->publishPage($page, $user);
        }

        $this->cache->invalidateSite($site);

        return $page;
    }
}
