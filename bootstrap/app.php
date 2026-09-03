<?php

use App\Http\Middleware\AllowPublicEmbedCors;
use App\Http\Middleware\EnsureFeatureEnabled;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Http\Middleware\EnsureUserNotBlocked;
use App\Http\Middleware\EnsureWorkspace;
use App\Http\Middleware\NeverCache;
use App\Http\Middleware\RequestId;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\SubstituteBindings;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withBroadcasting(
        __DIR__.'/../routes/channels.php',
        ['prefix' => 'api', 'middleware' => ['api', 'auth:sanctum']],
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'workspace' => EnsureWorkspace::class,
            'admin' => EnsureSuperAdmin::class,
            'not.blocked' => EnsureUserNotBlocked::class,
            'request.id' => RequestId::class,
            'never.cache' => NeverCache::class,
            'security.headers' => SecurityHeaders::class,
            'feature' => EnsureFeatureEnabled::class,
        ]);

        $middleware->api(prepend: [
            RequestId::class,
            SecurityHeaders::class,
        ]);

        // Ahead of Laravel's own HandleCors, which sits in the true global
        // stack (before any route-group middleware even runs): the public
        // embed endpoints (livechat, forms, funnel tracking) are called from
        // customer domains that can never be enumerated in config/cors.php,
        // so this answers their CORS itself before that allow-list gets a
        // chance to reject the origin and swallow the preflight.
        $middleware->prepend(AllowPublicEmbedCors::class);

        // TrustHosts is deliberately not armed. This application answers on
        // every customer's custom domain, so the set of valid Host headers is
        // a database table, not a config list, and an allow-list here would
        // reject every published site. Host validation moved to
        // PublicSiteResolver: a hostname with no active domain row gets a 404.
        // The headers that TrustHosts normally protects are safe regardless -
        // password reset and verification links are built from
        // config('uidesired.frontend_url'), never from the request host, and
        // published HTML is rendered at publish time so it contains no
        // host-derived absolute URLs.
        $middleware->trustProxies(at: '*');

        $middleware->statefulApi();

        // The funnel experiment identity. It is a random opaque id, carries
        // nothing about the person, and has to survive a round trip to keep a
        // visitor in the same bucket - encrypting it adds no secrecy and makes
        // the value the browser holds unusable to anything else.
        $middleware->encryptCookies(except: ['ud_fv']);

        $middleware->validateCsrfTokens(except: [
            'api/v1/billing/webhook',
            'api/v1/public/preview',
            'api/v1/public/livechat/*',
            'api/v1/public/funnels/*',
        ]);

        $middleware->throttleApi('api');

        $middleware->prependToPriorityList(
            SubstituteBindings::class,
            EnsureWorkspace::class,
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
        // A database outage otherwise reaches the browser as a bare "Server
        // Error", which reads like an application bug and sends operators
        // hunting in the wrong place. Name it, and point at the readiness
        // endpoint that says which dependency is down.
        $exceptions->render(function (Throwable $exception, Request $request) {
            if (! $exception instanceof PDOException && ! $exception instanceof QueryException) {
                return null;
            }
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null;
            }

            return response()->json([
                'message' => 'The server cannot reach its database. Check the database service and the DB_* settings, then see /api/v1/health/ready.',
                'error' => 'database_unavailable',
            ], 503);
        });

        $exceptions->render(function (Throwable $exception, Request $request) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null;
            }
            if (! str_contains(strtolower($exception->getMessage()), 'maximum execution time')) {
                return null;
            }

            return response()->json([
                'message' => 'The AI took too long to respond. Try again, or ask for one page instead of a full site.',
                'error' => 'ai_timeout',
            ], 504);
        });
    })
    ->create();
