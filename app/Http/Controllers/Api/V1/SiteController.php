<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\SiteResource;
use App\Models\Site;
use App\Services\PublishService;
use App\Services\SeoService;
use App\Services\SiteService;
use App\Services\TenantCacheService;
use App\Support\CurrentWorkspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteController extends Controller
{
    public function index(CurrentWorkspace $current)
    {
        $sites = Site::query()->where('workspace_id', $current->id())->with('domains')->get();

        return SiteResource::collection($sites);
    }

    public function store(Request $request, SiteService $service)
    {
        $this->authorize('create', Site::class);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'business_name' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'subdomain' => ['nullable', 'string', 'max:63'],
            'template_id' => ['nullable', 'exists:templates,id'],
        ]);

        $site = $service->create($request->user(), $data);

        return (new SiteResource($site))->response()->setStatusCode(201);
    }

    public function show(Site $site)
    {
        $this->authorize('view', $site);

        return new SiteResource($site->load('domains'));
    }

    public function update(Request $request, Site $site)
    {
        $this->authorize('update', $site);
        $site->update($request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'business_name' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', 'in:draft,published,disabled'],
        ]));

        return new SiteResource($site->fresh('domains'));
    }

    public function destroy(Site $site, SiteService $service): JsonResponse
    {
        $this->authorize('delete', $site);
        $service->delete($site);

        return response()->json(['data' => ['ok' => true]]);
    }

    public function duplicate(Request $request, Site $site, SiteService $service)
    {
        $this->authorize('duplicate', $site);

        return (new SiteResource($service->duplicate($site, $request->user())))->response()->setStatusCode(201);
    }

    public function restore(Site $site, SiteService $service)
    {
        $this->authorize('restore', $site);

        return new SiteResource($service->restore($site));
    }

    public function publish(Request $request, Site $site, PublishService $publisher)
    {
        $this->authorize('publish', $site);

        return new SiteResource($publisher->publishSite($site, $request->user())->load('domains'));
    }

    public function settings(Site $site)
    {
        $this->authorize('view', $site);

        return response()->json(['data' => $site->settings]);
    }

    public function updateSettings(Request $request, Site $site, SeoService $seo)
    {
        $this->authorize('update', $site);
        $data = $request->validate([
            'default_description' => ['nullable', 'string', 'max:320'],
            'favicon' => ['nullable', 'string', 'max:2048'],
            'social_image' => ['nullable', 'string', 'max:2048'],
            'robots' => ['nullable', 'in:index,noindex,none'],
            'google_analytics_id' => ['nullable', 'string', 'max:32', 'regex:/^(G|UA|GT)-[A-Za-z0-9-]+$/'],
            'google_site_verification' => ['nullable', 'string', 'max:255'],
            'locale' => ['nullable', 'string', 'max:16'],
            'timezone' => ['nullable', 'string', 'max:64'],
            'redirect_secondary_to_primary' => ['boolean'],
            'branding' => ['nullable', 'array'],
            'extras' => ['nullable', 'array'],
        ]);
        $site->settings()->updateOrCreate(['site_id' => $site->id], $seo->sanitizeSiteSettings($data));
        $this->bustPublicCache($site);

        return response()->json(['data' => $site->settings()->first()]);
    }

    public function theme(Site $site)
    {
        $this->authorize('view', $site);

        return response()->json(['data' => $site->theme]);
    }

    public function updateTheme(Request $request, Site $site)
    {
        $this->authorize('update', $site);
        $data = $request->validate(['tokens' => ['required', 'array']]);
        $site->theme()->updateOrCreate(['site_id' => $site->id], $data);
        $this->bustPublicCache($site);

        return response()->json(['data' => $site->theme()->first()]);
    }

    private function bustPublicCache(Site $site): void
    {
        app(TenantCacheService::class)->invalidateSite($site->fresh(['domains', 'pages.publishedRevision']));
    }
}
