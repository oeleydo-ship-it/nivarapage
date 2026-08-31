<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Services\PublicSiteResolver;
use App\Services\Rendering\SiteRenderService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Serves published customer websites. The HTML was produced when the site was
 * published, so a visitor costs one indexed lookup - no template rendering and
 * no call out to another service.
 */
class PublishedSiteController extends Controller
{
    public function __construct(
        private readonly PublicSiteResolver $resolver,
        private readonly SiteRenderService $renders,
    ) {}

    public function show(Request $request, ?string $path = null): Response
    {
        $site = $this->resolver->resolve($request->getHost());

        if (! $site) {
            return $this->status(
                'Website Not Found',
                'Website Not Found',
                'This domain is not connected to an active website.',
                null,
                404,
            );
        }

        if ($site->status === 'disabled') {
            return $this->status(
                'Unavailable',
                'Unavailable',
                'This website is currently unavailable.',
                null,
                503,
            );
        }

        $render = $this->renders->find($site, $path ?? '/');

        if (! $render) {
            // A site with no renders at all has not been published yet. Saying
            // "page not found" there sends the owner looking for a broken link
            // when the real answer is that they have not pressed Publish.
            if ($this->renders->isEmpty($site)) {
                return $this->status(
                    'Not published yet',
                    'Not published yet',
                    'This website has not been published yet.',
                    null,
                    404,
                );
            }

            return $this->status('Page not found', 'Page not found', 'This page is unavailable.', null, 404);
        }

        return $this->htmlResponse($request, $site, $render->html, $render->hash, $render->updated_at);
    }

    private function htmlResponse(Request $request, Site $site, string $html, string $hash, $lastModified): Response
    {
        $etag = '"'.substr($hash, 0, 32).'"';

        $response = new Response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'X-Content-Type-Options' => 'nosniff',
            'Referrer-Policy' => 'strict-origin-when-cross-origin',
            'X-DNS-Prefetch-Control' => 'off',
            'Cache-Control' => 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
            'ETag' => $etag,
        ]);

        if ($lastModified) {
            $response->setLastModified($lastModified);
        }

        // Turns a repeat visit into a 304 with no body, which matters most for
        // the CDN in front of custom domains.
        $response->isNotModified($request);

        return $response;
    }

    private function status(string $title, string $eyebrow, string $heading, ?string $detail, int $code): Response
    {
        $html = view('published.status', compact('title', 'eyebrow', 'heading', 'detail'))->render();

        return new Response($html, $code, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Cache-Control' => 'no-store',
            'X-Robots-Tag' => 'noindex, nofollow',
        ]);
    }
}
