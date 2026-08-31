<?php

namespace App\Http\Controllers;

use App\Support\HostRole;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * The single front door. One deployment serves the builder dashboard and every
 * published customer site, told apart by the request hostname.
 */
class EntryController extends Controller
{
    public function __invoke(Request $request, ?string $path = null): Response
    {
        return match (HostRole::for($request->getHost())) {
            // Preview shows unpublished drafts to a signed-in editor. It has no
            // SEO requirement, so it is a route inside the dashboard bundle
            // that renders the draft with the same block components the editor
            // uses - no second renderer, and no way for the two to disagree.
            HostRole::DASHBOARD, HostRole::PREVIEW => $this->dashboard(),
            default => app(PublishedSiteController::class)->show($request, $path),
        };
    }

    /**
     * Serves the built single-page app. Its assets live under /dashboard/, so
     * the web server answers those directly and only navigation requests reach
     * PHP - which is what lets client-side routing work on a deep link.
     */
    private function dashboard(): Response
    {
        $index = public_path('dashboard/index.html');

        if (! is_file($index)) {
            return new Response(
                view('published.status', [
                    'title' => 'Dashboard not built',
                    'eyebrow' => 'Setup incomplete',
                    'heading' => 'The dashboard has not been built yet.',
                    'detail' => 'Run "pnpm install && pnpm build" from the repository root, then reload.',
                ])->render(),
                503,
                ['Content-Type' => 'text/html; charset=UTF-8', 'Cache-Control' => 'no-store'],
            );
        }

        return new Response(file_get_contents($index), 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            // The SPA shell must never be cached: it names hashed asset files,
            // and a stale copy points the browser at bundles that no longer
            // exist after a deploy.
            'Cache-Control' => 'no-store, must-revalidate',
        ]);
    }
}
