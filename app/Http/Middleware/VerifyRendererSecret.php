<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyRendererSecret
{
    public function handle(Request $request, Closure $next): Response
    {
        $secret = (string) config('uidesired.internal_renderer_secret');

        if ($secret === '') {
            return $next($request);
        }

        $provided = $request->header('X-Internal-Secret', $request->header('INTERNAL_RENDERER_SECRET'));

        if (! hash_equals($secret, (string) $provided)) {
            abort(403, 'Invalid renderer secret.');
        }

        return $next($request);
    }
}
