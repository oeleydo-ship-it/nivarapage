<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\Page;
use App\Models\Site;
use App\Services\BlogService;
use App\Services\NavigationService;
use App\Services\Rendering\SiteRenderService;
use App\Services\SiteChromeService;
use App\Services\SeoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

/**
 * Receives the HTML the builder produced for a site's published pages.
 *
 * The block components are React and are the same ones the editor draws with,
 * so the builder renders them to HTML at publish time and posts the result.
 * That keeps one implementation of every block, and leaves the server with
 * nothing to do on a visitor request but return a stored string.
 */
class SiteRenderController extends Controller
{
    public function __construct(private readonly SiteRenderService $renders) {}

    public function store(Request $request, Site $site): JsonResponse
    {
        Gate::authorize('update', $site);

        $data = $request->validate([
            'renders' => ['required', 'array', 'min:1', 'max:2000'],
            'renders.*.path' => ['required', 'string', 'max:512'],
            'renders.*.html' => ['required', 'string', 'max:5242880'],
            'renders.*.page_id' => ['nullable', 'integer'],
            'renders.*.revision_id' => ['nullable', 'integer'],
            // Removes stored HTML for paths not in this batch, so a deleted or
            // renamed page stops answering on its old address. Off by default
            // so a partial upload cannot wipe a site.
            'prune' => ['sometimes', 'boolean'],
        ]);

        $pageIds = $site->pages()->pluck('id')->all();
        $paths = [];

        DB::transaction(function () use ($data, $site, $pageIds, &$paths) {
            foreach ($data['renders'] as $entry) {
                $pageId = $entry['page_id'] ?? null;
                // A page id from another site would attach this site's HTML to
                // a stranger's page row, so anything unrecognised is dropped
                // rather than trusted.
                if ($pageId !== null && ! in_array((int) $pageId, $pageIds, true)) {
                    $pageId = null;
                }

                $render = $this->renders->store(
                    $site,
                    $entry['path'],
                    $entry['html'],
                    $pageId ? $site->pages()->find($pageId) : null,
                    isset($entry['revision_id']) ? (int) $entry['revision_id'] : null,
                );

                $paths[] = $render->path;
            }

            if ($data['prune'] ?? false) {
                $this->renders->pruneExcept($site, $paths);
            }
        });

        return response()->json([
            'data' => [
                'site_id' => $site->id,
                'stored' => count($paths),
                'paths' => $paths,
            ],
        ], 201);
    }

    /**
     * The livechat widget a published page should boot, or null.
     *
     * The URL is absolute and points at this application: a published site is
     * served from the customer's own hostname, which knows nothing about the
     * widget endpoints.
     *
     * @return array<string, mixed>|null
     */
    private function livechat(Site $site): ?array
    {
        $widget = $site->livechatWidget;
        if (! $widget || ! $widget->enabled || ! $widget->public_key) {
            return null;
        }

        return [
            'public_key' => $widget->public_key,
            'enabled' => true,
            'script_url' => rtrim((string) config('app.url'), '/').'/api/v1/public/livechat/'.$widget->public_key.'/widget.js',
        ];
    }

    /**
     * Everything the builder needs to render this site's published addresses.
     *
     * Deliberately one request rather than several: the builder renders every
     * page in a single pass at publish time, and assembling this from the
     * separate public endpoints would risk pages being rendered against
     * different versions of the theme or navigation.
     */
    public function payload(Site $site, SeoService $seo, NavigationService $navigation, SiteChromeService $chrome, BlogService $blog): JsonResponse
    {
        Gate::authorize('view', $site);

        $site->load(['settings', 'theme', 'domains', 'workspace', 'livechatWidget']);
        $primary = $site->domains->firstWhere('is_primary', true);
        $host = $primary?->hostname
            ?? $site->domains->firstWhere('status', 'active')?->hostname
            ?? $site->domains->first()?->hostname
            ?? '';

        $pages = $site->pages()
            ->whereDoesntHave('funnelSteps')
            ->whereNotNull('published_revision_id')
            ->with('publishedRevision')
            ->get()
            ->map(fn (Page $page) => [
                'page_id' => $page->id,
                'revision_id' => $page->published_revision_id,
                'path' => $page->is_homepage ? '/' : '/'.ltrim((string) $page->slug, '/'),
                'page' => $seo->publicPage($page),
            ])
            ->values();

        /**
         * Published blog posts are addresses this site answers on, so they are
         * rendered alongside the pages rather than separately. Without this a
         * post is linked from the index and listed in the sitemap while having
         * nothing to serve - a 404 on a link the site itself published.
         */
        $posts = $site->blogPosts()
            ->live()
            ->latest('published_at')
            ->latest('id')
            ->get()
            ->map(fn (BlogPost $post) => [
                'page_id' => null,
                'revision_id' => null,
                'path' => $blog->postPath($site, $post),
                'page' => $seo->publicPostPage($site, $post),
            ]);

        return response()->json([
            'data' => [
                'site' => [
                    'site_id' => $site->id,
                    'name' => $site->name,
                    'business_name' => $site->business_name,
                    'status' => $site->status,
                    'host' => $host,
                    'primary_hostname' => $primary?->hostname,
                    'redirect_to_primary' => false,
                    'branding_removed' => (bool) $site->workspace?->branding_removed,
                    'settings' => $site->settings?->toArray(),
                    'theme' => $site->theme?->tokens ?? [],
                    // Published pages are static, so the widget has to be
                    // written into them here rather than added on a visit.
                    'livechat' => $this->livechat($site),
                ],
                'menus' => $navigation->tree($site),
                // The header and footer every page is wrapped in. Sent once and
                // composed into each page as it renders, so one edit reaches all
                // of them and no page can be left holding an older copy.
                'chrome' => $chrome->get($site),
                'pages' => $pages->concat($posts)->values(),
            ],
        ]);
    }
}
