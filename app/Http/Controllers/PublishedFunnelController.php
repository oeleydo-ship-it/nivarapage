<?php

namespace App\Http\Controllers;

use App\Models\Funnel;
use App\Services\PublicSiteResolver;
use App\Services\Rendering\SiteRenderService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Serves published funnel steps.
 *
 * Funnels get their own route because they are addressed by public id and are
 * reachable on any hostname, including the platform domain where no customer
 * site is connected. Resolving the funnel first, then its site, means a funnel
 * link works whether it was shared as a standalone URL or under the site's own
 * domain.
 */
class PublishedFunnelController extends Controller
{
    public function __construct(
        private readonly PublicSiteResolver $resolver,
        private readonly SiteRenderService $renders,
    ) {}

    public function show(Request $request, string $funnelKey, ?string $step = null): Response
    {
        $step = $step ?: 'start';

        $model = Funnel::query()
            ->where('public_id', $funnelKey)
            ->where('status', 'published')
            ->first();

        if (! $model) {
            // Fall back to a slug lookup scoped to whichever site owns this
            // hostname, which is how funnels are linked from their own site.
            $site = $this->resolver->resolve($request->getHost());
            $model = $site
                ? Funnel::query()
                    ->where('site_id', $site->id)
                    ->where('slug', $funnelKey)
                    ->where('status', 'published')
                    ->first()
                : null;
        }

        if (! $model) {
            return $this->missing();
        }

        // Keyed by the funnel, not its site: a standalone funnel has no site,
        // and asking for one is what made every published funnel answer with a
        // type error instead of a page.
        $render = $this->renders->findForFunnel($model, "/f/{$model->public_id}/{$step}");

        if (! $render) {
            return $this->missing();
        }

        $response = new Response($render->html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'X-Content-Type-Options' => 'nosniff',
            'Referrer-Policy' => 'strict-origin-when-cross-origin',
            // Funnel steps are tracked per visitor and must not be shared by a
            // CDN the way an ordinary marketing page can be.
            'Cache-Control' => 'private, no-store',
            'X-Robots-Tag' => 'noindex, follow',
        ]);

        return $response;
    }

    private function missing(): Response
    {
        $html = view('published.status', [
            'title' => 'Page not found',
            'eyebrow' => 'Page not found',
            'heading' => 'This page is unavailable.',
            'detail' => null,
        ])->render();

        return new Response($html, 404, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Cache-Control' => 'no-store',
            'X-Robots-Tag' => 'noindex, nofollow',
        ]);
    }
}
