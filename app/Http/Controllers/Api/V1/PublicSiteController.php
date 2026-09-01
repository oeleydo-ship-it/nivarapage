<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Site;
use App\Services\SiteChromeService;
use App\Services\BlogService;
use App\Services\NavigationService;
use App\Services\PublicSiteResolver;
use App\Services\SeoService;
use App\Services\TenantCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicSiteController extends Controller
{
    public function __construct(private readonly TenantCacheService $cache) {}

    public function resolve(Request $request, PublicSiteResolver $resolver): JsonResponse
    {
        $host = $resolver->normalizeHost((string) $request->query('host', ''));
        $site = $resolver->resolve($host);
        if (! $site) {
            return $this->unknownHost();
        }

        $payload = $this->cache->remember($this->cache->resolveKey($host), function () use ($site, $resolver, $host) {
            $site->load(['settings', 'theme', 'domains', 'workspace', 'livechatWidget']);
            $primary = $site->domains->firstWhere('is_primary', true);
            $redirectSecondary = (bool) ($site->settings?->redirect_secondary_to_primary ?? true);
            $shouldRedirect = $redirectSecondary
                && $primary
                && $primary->hostname !== $host
                && $primary->status === 'active';

            $widget = $site->livechatWidget;

            return [
                'site_id' => $site->id,
                'name' => $site->name,
                'business_name' => $site->business_name,
                'status' => $site->status,
                'host' => $host,
                'primary_hostname' => $primary?->hostname,
                'redirect_to_primary' => $shouldRedirect,
                'branding_removed' => (bool) $site->workspace?->branding_removed,
                'settings' => $site->settings?->toArray(),
                'theme' => $site->theme?->tokens ?? [],
                'livechat' => $widget && $widget->enabled ? [
                    'public_key' => $widget->public_key,
                    'enabled' => true,
                    'position' => $widget->position,
                    'primary_color' => $widget->primary_color,
                ] : null,
            ];
        });

        return $this->publicJson($payload);
    }

    public function page(Request $request, PublicSiteResolver $resolver): JsonResponse
    {
        $site = $resolver->resolve((string) $request->query('host', ''));
        if (! $site) {
            return $this->unknownHost();
        }

        $slug = $this->cache->normalizeSlug((string) $request->query('path', '/'));
        $payload = $this->cache->remember($this->cache->currentPageKey($site->id, $slug), function () use ($site, $slug) {
            $pages = $site->pages()->whereDoesntHave('funnelSteps');
            $page = $slug === 'home'
                ? $pages->where('is_homepage', true)->first()
                : $pages->where('slug', $slug)->first();

            if (! $page || ! $page->published_revision_id) {
                return null;
            }

            $page->load('publishedRevision');
            $data = ['page' => app(SeoService::class)->publicPage($page)];
            $version = (int) ($page->publishedRevision?->version_number ?? 0);
            if ($version > 0) {
                $this->cache->put($this->cache->pageKey($site->id, $slug, $version), $data);
            }

            return $data;
        });

        if (! is_array($payload) || ! isset($payload['page'])) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        return $this->publicJson($payload);
    }

    public function theme(Request $request, PublicSiteResolver $resolver): JsonResponse
    {
        $site = $resolver->resolve((string) $request->query('host', ''));
        if (! $site) {
            return $this->unknownHost();
        }

        $tokens = $this->cache->remember($this->cache->themeKey($site->id), function () use ($site) {
            $site->loadMissing('theme');

            return $site->theme?->tokens ?? [];
        });

        return $this->publicJson($tokens);
    }

    public function navigation(Request $request, PublicSiteResolver $resolver, NavigationService $navigation): JsonResponse
    {
        $site = $resolver->resolve((string) $request->query('host', ''));
        if (! $site) {
            return $this->unknownHost();
        }

        $tree = $this->cache->remember($this->cache->navKey($site->id), fn () => $navigation->tree($site));

        return $this->publicJson($tree);
    }

    public function sitemap(Request $request, PublicSiteResolver $resolver, SeoService $seo): JsonResponse
    {
        $site = $resolver->resolve((string) $request->query('host', ''));
        if (! $site) {
            return $this->unknownHost();
        }

        $entries = $this->cache->remember($this->cache->sitemapKey($site->id), fn () => $seo->sitemap($site));

        return $this->publicJson($entries);
    }

    public function blog(Request $request, PublicSiteResolver $resolver, BlogService $blog): JsonResponse
    {
        $site = $resolver->resolve((string) $request->query('host', ''));
        if (! $site) {
            return $this->unknownHost();
        }

        $payload = $this->cache->remember($this->cache->blogKey($site->id), function () use ($site, $blog) {
            $posts = $site->blogPosts()->live()->latest('published_at')->latest('id')->get();

            return [
                'index_path' => $blog->indexPath($site),
                'posts' => $posts->map(fn ($post) => $blog->publicPost($post))->values()->all(),
            ];
        });

        return $this->publicJson($payload);
    }

    public function blogPost(Request $request, PublicSiteResolver $resolver, BlogService $blog): JsonResponse
    {
        $site = $resolver->resolve((string) $request->query('host', ''));
        if (! $site) {
            return $this->unknownHost();
        }

        $slug = $this->cache->normalizeSlug((string) $request->query('slug', ''));
        $payload = $this->cache->remember($this->cache->blogPostKey($site->id, $slug), function () use ($site, $slug, $blog) {
            $post = $site->blogPosts()->live()->where('slug', $slug)->first();

            return $post ? $blog->publicPost($post) : null;
        });

        if (! is_array($payload)) {
            return response()->json(['message' => 'Not found.'], 404)->withHeaders([
                'Cache-Control' => 'private, no-store',
            ]);
        }

        return $this->publicJson($payload);
    }

    public function preview(Request $request, SiteChromeService $chrome): JsonResponse
    {
        $site = Site::query()->findOrFail($request->query('site'));
        $site->load(['pages.draftRevision', 'theme', 'menus.items', 'settings']);

        return $this->privateJson([
            'site' => $site->only(['id', 'name', 'status']),
            'pages' => $site->pages,
            'theme' => $site->theme?->tokens ?? [],
            'menus' => $site->menus,
            // Preview has to show what publishing will produce, chrome included.
            'chrome' => $chrome->get($site),
        ]);
    }

    private function publicJson(mixed $data): JsonResponse
    {
        return response()->json(['data' => $data])->withHeaders([
            'Cache-Control' => 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
        ]);
    }

    private function privateJson(mixed $data): JsonResponse
    {
        return response()->json(['data' => $data])->withHeaders([
            'Cache-Control' => 'private, no-store, must-revalidate',
            'Pragma' => 'no-cache',
        ]);
    }

    private function unknownHost(): JsonResponse
    {
        return response()->json(['message' => 'Not found.'], 404)->withHeaders([
            'Cache-Control' => 'private, no-store',
        ]);
    }
}
