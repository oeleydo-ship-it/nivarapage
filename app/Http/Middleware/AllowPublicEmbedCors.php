<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * CORS for the endpoints a published site's own JavaScript calls directly:
 * the livechat widget, form submissions, and funnel tracking events.
 *
 * These are embedded on every customer's site - an unbounded, unknowable set
 * of subdomains and custom domains - so the static allow-list in
 * config/cors.php cannot cover them. None of them use cookie-based auth (the
 * widget carries its own token in a header, forms and funnel events carry
 * none), so reflecting whatever Origin sent the request is safe: there is no
 * ambient credential for a third-party page to ride along on.
 *
 * Registered ahead of Laravel's own HandleCors in the middleware stack. For a
 * matching path it answers the request (and, for a preflight, short-circuits
 * before the request ever reaches routing) so HandleCors's own allow-list
 * never gets a chance to reject the origin first.
 */
class AllowPublicEmbedCors
{
    private const PATTERNS = [
        'api/v1/public/livechat/*',
        'api/v1/public/forms/*',
        'api/v1/public/funnels/*',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->is(...self::PATTERNS)) {
            return $next($request);
        }

        if ($request->isMethod('OPTIONS')) {
            return response('', 204)->withHeaders($this->headers($request));
        }

        /** @var Response $response */
        $response = $next($request);
        foreach ($this->headers($request) as $key => $value) {
            $response->headers->set($key, $value);
        }

        return $response;
    }

    /**
     * @return array<string, string>
     */
    private function headers(Request $request): array
    {
        $origin = $request->headers->get('Origin') ?: '*';

        return [
            'Access-Control-Allow-Origin' => $origin,
            'Access-Control-Allow-Methods' => 'GET, POST, PATCH, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Accept, X-Livechat-Token, X-Requested-With',
            'Access-Control-Max-Age' => '86400',
            'Vary' => 'Origin',
        ];
    }
}
