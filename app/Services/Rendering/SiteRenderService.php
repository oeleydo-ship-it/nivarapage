<?php

namespace App\Services\Rendering;

use App\Models\Funnel;
use App\Models\Page;
use App\Models\PageRender;
use App\Models\Site;
use Illuminate\Support\Collection;

/**
 * Stores the HTML produced when a site is published, and hands it back on
 * public requests. Published pages are rendered once at publish time rather
 * than on every request, so serving a visitor is a single indexed lookup.
 */
class SiteRenderService
{
    /**
     * Public paths always start with a slash and never end with one, so that
     * "/about", "/about/" and "about" address the same stored render.
     */
    public function normalizePath(?string $path): string
    {
        $path = trim((string) $path);
        $path = strtok($path, '?') ?: '';
        $path = '/'.trim($path, '/');

        return $path === '/' ? '/' : rtrim($path, '/');
    }

    public function find(Site $site, string $path): ?PageRender
    {
        return PageRender::query()
            ->where('site_id', $site->id)
            ->where('path', $this->normalizePath($path))
            ->first();
    }

    /**
     * The stored HTML for one funnel step.
     *
     * A standalone funnel has no site, so its renders are keyed by the funnel
     * itself. A funnel that does belong to a site keeps answering from the
     * site's rows, which is where anything published before this was written.
     */
    public function findForFunnel(Funnel $funnel, string $path): ?PageRender
    {
        $path = $this->normalizePath($path);

        $render = PageRender::query()
            ->where('funnel_id', $funnel->id)
            ->where('path', $path)
            ->first();

        if ($render || ! $funnel->site_id) {
            return $render;
        }

        return PageRender::query()
            ->where('site_id', $funnel->site_id)
            ->where('path', $path)
            ->first();
    }

    public function storeForFunnel(Funnel $funnel, string $path, string $html): PageRender
    {
        $path = $this->normalizePath($path);
        $hash = hash('sha256', $html);

        $existing = PageRender::query()
            ->where('funnel_id', $funnel->id)
            ->where('path', $path)
            ->first();

        // An unchanged republish must not bump updated_at: it becomes the
        // Last-Modified header, and moving it invalidates caches for HTML that
        // did not change.
        if ($existing && $existing->hash === $hash) {
            return $existing;
        }

        return PageRender::updateOrCreate(
            ['funnel_id' => $funnel->id, 'path' => $path],
            ['site_id' => $funnel->site_id, 'html' => $html, 'hash' => $hash],
        );
    }

    public function store(Site $site, string $path, string $html, ?Page $page = null, ?int $revisionId = null): PageRender
    {
        $path = $this->normalizePath($path);
        $hash = hash('sha256', $html);

        $existing = PageRender::query()
            ->where('site_id', $site->id)
            ->where('path', $path)
            ->first();

        // An unchanged republish must not bump updated_at: the value becomes
        // the Last-Modified header, and moving it invalidates caches for HTML
        // that did not change.
        if ($existing && $existing->hash === $hash) {
            return $existing;
        }

        return PageRender::updateOrCreate(
            ['site_id' => $site->id, 'path' => $path],
            [
                'page_id' => $page?->id,
                'revision_id' => $revisionId,
                'html' => $html,
                'hash' => $hash,
            ],
        );
    }

    /**
     * Drops renders for paths that no longer exist, so a page that was deleted
     * or had its slug changed stops answering on its old address.
     *
     * @param  Collection<int, string>|array<int, string>  $keepPaths
     */
    public function pruneExcept(Site $site, Collection|array $keepPaths): int
    {
        $keep = collect($keepPaths)->map(fn ($path) => $this->normalizePath($path))->unique()->all();

        return PageRender::query()
            ->where('site_id', $site->id)
            // Funnel steps live under /f/ and are published on their own
            // schedule. Publishing the site must not retire them just because
            // they were not part of this batch.
            ->where('path', 'not like', '/f/%')
            ->when($keep !== [], fn ($query) => $query->whereNotIn('path', $keep))
            ->delete();
    }

    public function forgetSite(Site $site): int
    {
        return PageRender::query()->where('site_id', $site->id)->delete();
    }

    /**
     * True when a site has never been rendered. The public controller uses this
     * to tell "not published yet" apart from "page does not exist", which are
     * different pages for the visitor.
     */
    public function isEmpty(Site $site): bool
    {
        return ! PageRender::query()->where('site_id', $site->id)->exists();
    }
}
