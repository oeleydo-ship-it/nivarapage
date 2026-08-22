<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserNotBlocked
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user && $user->blocked_at) {
            $user->currentAccessToken()?->delete();

            return response()->json([
                'message' => 'This account has been blocked. Contact support if you believe this is a mistake.',
                'error' => 'account_blocked',
            ], 403);
        }

        return $next($request);
    }
}
