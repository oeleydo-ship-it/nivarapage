<?php

namespace App\Http\Controllers;

use App\Models\Funnel;
use App\Services\Funnels\FunnelExperimentService;
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
        private readonly FunnelExperimentService $experiments,
    ) {}

    /** Name of the cookie the visitor's experiment identity lives in. */
    private const VISITOR_COOKIE = 'ud_fv';

    /**
     * A stable identifier for this visitor, made once and then remembered.
     *
     * Not personal data and not used for anything but choosing a bucket, so it
     * needs no consent - without it there is no way to show somebody the same
     * version twice.
     */
    private function visitorKey(Request $request): string
    {
        $existing = (string) $request->cookie(self::VISITOR_COOKIE, '');

        return preg_match('/^[a-f0-9]{32}$/', $existing) ? $existing : bin2hex(random_bytes(16));
    }

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

        // Which version of this step this visitor gets. Decided from an id that
        // is kept in a cookie, so the same person sees the same page every time
        // - somebody shown a different version on each visit tells you nothing
        // about either of them.
        $stepModel = $model->steps()->where('slug', $step)->where('status', 'published')->first();
        $visitorKey = $this->visitorKey($request);
        $assigned = null;
        $assignedKey = null;

        if ($stepModel) {
            $pool = $this->experiments->pool($stepModel);
            $chosen = $this->experiments->assign($pool, $visitorKey.'|'.$stepModel->id);
            $assigned = $chosen['id'];
            $assignedKey = $chosen['id'] === null ? null : $chosen['key'];
        }

        // Keyed by the funnel, not its site: a standalone funnel has no site,
        // and asking for one is what made every published funnel answer with a
        // type error instead of a page.
        $render = $this->renders->findForFunnel($model, "/f/{$model->public_id}/{$step}", $assigned);

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

        // Remembered for a year, so the split holds across visits. The value is
        // only an identifier; the bucket is worked out from it each time, so a
        // changed experiment reshuffles nobody who is already in one.
        // Defaults are right here: http-only, so nothing on the page can read
        // or rewrite which bucket somebody is in.
        $response->withCookie(cookie()->forever(self::VISITOR_COOKIE, $visitorKey));

        if ($assignedKey !== null) {
            // The key, because that is what the events API takes. A conversion
            // has to be credited to the version the visitor actually saw.
            $response->headers->set('X-Funnel-Variant', $assignedKey);
        }

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
