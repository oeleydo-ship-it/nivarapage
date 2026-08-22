<?php

use App\Http\Middleware\EnsureSuperAdmin;
use App\Http\Middleware\EnsureUserNotBlocked;
use App\Http\Middleware\EnsureWorkspace;
use App\Http\Middleware\EnsureFeatureEnabled;
use App\Http\Middleware\NeverCache;
use App\Http\Middleware\RequestId;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

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
            'livechat.cors' => \App\Http\Middleware\AllowPublicLivechatCors::class,
            'feature' => EnsureFeatureEnabled::class,
        ]);

        $middleware->api(prepend: [
            RequestId::class,
            SecurityHeaders::class,
        ]);

        $middleware->trustHosts(at: fn () => config('uidesired.trusted_hosts', ['localhost']));
        $middleware->trustProxies(at: '*');

        $middleware->statefulApi();

        $middleware->validateCsrfTokens(except: [
            'api/v1/billing/webhook',
            'api/v1/public/livechat/*',
            'api/v1/public/funnels/*',
        ]);

        $middleware->throttleApi('api');

        $middleware->prependToPriorityList(
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            EnsureWorkspace::class,
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
        $exceptions->render(function (\Throwable $exception, Request $request) {
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
