<?php

namespace App\Providers;

use App\Contracts\DomainProviderInterface;
use App\Models\BlogPost;
use App\Models\Client;
use App\Models\ClientContact;
use App\Models\Domain;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\Funnel;
use App\Models\FunnelConnection;
use App\Models\FunnelStep;
use App\Models\LivechatConversation;
use App\Models\LivechatKnowledge;
use App\Models\LivechatWidget;
use App\Models\Media;
use App\Models\Page;
use App\Models\Site;
use App\Models\Template;
use App\Models\Workspace;
use App\Policies\BlogPostPolicy;
use App\Policies\ClientPolicy;
use App\Policies\DomainPolicy;
use App\Policies\FormPolicy;
use App\Policies\FunnelPolicy;
use App\Policies\LivechatPolicy;
use App\Policies\MediaPolicy;
use App\Policies\PagePolicy;
use App\Policies\SitePolicy;
use App\Policies\TemplatePolicy;
use App\Policies\WorkspacePolicy;
use App\Services\Cloudflare\CloudflareSettingsService;
use App\Services\Domains\CloudflareDomainProvider;
use App\Services\Domains\FakeDomainProvider;
use App\Services\Mail\MailSettingsService;
use App\Services\Storage\StorageSettingsService;
use App\Support\CurrentWorkspace;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(CurrentWorkspace::class);

        $this->app->bind(DomainProviderInterface::class, function () {
            $fake = app()->environment('testing')
                || config('uidesired.domain_provider') === 'fake'
                || ! config('uidesired.cloudflare.saas_enabled');

            return $fake
                ? $this->app->make(FakeDomainProvider::class)
                : $this->app->make(CloudflareDomainProvider::class);
        });
    }

    public function boot(): void
    {
        Gate::policy(Workspace::class, WorkspacePolicy::class);
        Gate::policy(Site::class, SitePolicy::class);
        Gate::policy(Client::class, ClientPolicy::class);
        Gate::policy(BlogPost::class, BlogPostPolicy::class);
        Gate::policy(Page::class, PagePolicy::class);
        Gate::policy(Domain::class, DomainPolicy::class);
        Gate::policy(Media::class, MediaPolicy::class);
        Gate::policy(Form::class, FormPolicy::class);
        Gate::policy(Funnel::class, FunnelPolicy::class);
        Gate::policy(LivechatWidget::class, LivechatPolicy::class);
        Gate::policy(LivechatConversation::class, LivechatPolicy::class);
        Gate::policy(Template::class, TemplatePolicy::class);

        ResetPassword::createUrlUsing(function (object $user, string $token) {
            $email = urlencode((string) ($user->email ?? ''));

            return rtrim((string) config('uidesired.frontend_url'), '/')."/reset-password?token={$token}&email={$email}";
        });

        $this->applyDatabaseSettings();

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('public-forms', function (Request $request) {
            $form = $request->route('publicForm');
            $formId = $form instanceof Form ? $form->id : $request->route('publicForm');

            return Limit::perMinute(8)->by($request->ip().'|'.$formId);
        });

        RateLimiter::for('public-livechat', function (Request $request) {
            return Limit::perMinute(40)->by($request->ip().'|'.$request->route('publicKey'));
        });

        RateLimiter::for('funnel-tracking', function (Request $request) {
            return Limit::perMinute(180)->by($request->ip().'|'.$request->route('publicFunnel'));
        });

        // Generations are slow and cost money upstream, so they get their own
        // tighter bucket on top of the plan quota.
        RateLimiter::for('ai', function (Request $request) {
            return Limit::perMinute(10)->by('ai|'.($request->user()?->id ?: $request->ip()));
        });

        RateLimiter::for('auth', function (Request $request) {
            $email = strtolower((string) $request->input('email', ''));

            return Limit::perMinute(8)->by($request->ip().'|'.$email);
        });

        $this->registerScopedBindings();
    }

    private function registerScopedBindings(): void
    {
        Route::bind('site', function (string $value) {
            $workspace = app(CurrentWorkspace::class)->workspace;
            if (! $workspace) {
                abort(404);
            }

            return Site::withTrashed()
                ->where('workspace_id', $workspace->id)
                ->where('id', $value)
                ->firstOrFail();
        });

        Route::bind('page', function (string $value) {
            $workspace = app(CurrentWorkspace::class)->workspace;
            if (! $workspace) {
                abort(404);
            }

            return Page::query()
                ->where('id', $value)
                ->whereHas('site', fn ($q) => $q->where('workspace_id', $workspace->id))
                ->firstOrFail();
        });

        Route::bind('domain', function (string $value) {
            $workspace = app(CurrentWorkspace::class)->workspace;
            if (! $workspace) {
                abort(404);
            }

            return Domain::query()
                ->where('id', $value)
                ->where('workspace_id', $workspace->id)
                ->firstOrFail();
        });

        Route::bind('media', function (string $value) {
            $workspace = app(CurrentWorkspace::class)->workspace;
            if (! $workspace) {
                abort(404);
            }

            return Media::query()
                ->where('id', $value)
                ->where('workspace_id', $workspace->id)
                ->firstOrFail();
        });

        Route::bind('form', function (string $value) {
            $workspace = app(CurrentWorkspace::class)->workspace;
            if (! $workspace) {
                abort(404);
            }

            return Form::query()
                ->where('id', $value)
                ->where('workspace_id', $workspace->id)
                ->firstOrFail();
        });

        Route::bind('workspace', function (string $value) {
            $user = auth()->user();
            if (! $user) {
                abort(401);
            }

            return $user->workspaces()->where('workspaces.id', $value)->firstOrFail();
        });

        Route::bind('formSubmission', function (string $value) {
            $workspace = app(CurrentWorkspace::class)->workspace;
            if (! $workspace) {
                abort(404);
            }

            return FormSubmission::query()
                ->where('id', $value)
                ->where('workspace_id', $workspace->id)
                ->firstOrFail();
        });

        Route::bind('client', function (string $value) {
            $workspace = app(CurrentWorkspace::class)->workspace;
            if (! $workspace) {
                abort(404);
            }

            return Client::query()
                ->where('id', $value)
                ->where('workspace_id', $workspace->id)
                ->firstOrFail();
        });

        Route::bind('clientContact', function (string $value) {
            $workspace = app(CurrentWorkspace::class)->workspace;
            if (! $workspace) {
                abort(404);
            }

            return ClientContact::query()
                ->where('id', $value)
                ->where('workspace_id', $workspace->id)
                ->firstOrFail();
        });

        Route::bind('blogPost', function (string $value) {
            $workspace = app(CurrentWorkspace::class)->workspace;
            if (! $workspace) {
                abort(404);
            }

            return BlogPost::query()
                ->where('id', $value)
                ->where('workspace_id', $workspace->id)
                ->firstOrFail();
        });

        Route::bind('livechatConversation', function (string $value) {
            $workspace = app(CurrentWorkspace::class)->workspace;
            if (! $workspace) {
                abort(404);
            }

            return LivechatConversation::query()
                ->where('workspace_id', $workspace->id)
                ->where('id', $value)
                ->firstOrFail();
        });

        Route::bind('livechatKnowledge', function (string $value) {
            $workspace = app(CurrentWorkspace::class)->workspace;
            if (! $workspace) {
                abort(404);
            }

            return LivechatKnowledge::query()
                ->where('workspace_id', $workspace->id)
                ->where('id', $value)
                ->firstOrFail();
        });

        Route::bind('funnel', function (string $value) {
            $workspace = app(CurrentWorkspace::class)->workspace;
            if (! $workspace) {
                abort(404);
            }

            return Funnel::query()->where('workspace_id', $workspace->id)->where('id', $value)->firstOrFail();
        });

        Route::bind('funnelStep', function (string $value) {
            $workspace = app(CurrentWorkspace::class)->workspace;
            if (! $workspace) {
                abort(404);
            }

            return FunnelStep::query()->where('workspace_id', $workspace->id)->where('id', $value)->firstOrFail();
        });

        Route::bind('funnelConnection', function (string $value) {
            $workspace = app(CurrentWorkspace::class)->workspace;
            if (! $workspace) {
                abort(404);
            }

            return FunnelConnection::query()->where('workspace_id', $workspace->id)->where('id', $value)->firstOrFail();
        });

        Route::bind('publicForm', function (string $value) {
            return Form::query()->findOrFail($value);
        });
    }

    /**
     * Ensure the dynamic S3/Spaces/R2 disk is available for media URLs and jobs.
     */
    /**
     * Config that lives in the database - mail, media storage, Cloudflare - is
     * read once per boot.
     *
     * When the database is unreachable every one of those reads waits out a
     * connection timeout, which on a dead DNS name is seconds each. That turned
     * a database still starting up into a request that took half a minute, so
     * the container never passed its health check and the platform killed it.
     * The first failure is remembered briefly in the cache (which is a separate
     * service, usually Redis), so later boots skip the attempt entirely and the
     * app keeps serving whatever does not need the database.
     */
    private function applyDatabaseSettings(): void
    {
        if ($this->databaseRecentlyUnavailable()) {
            return;
        }

        try {
            $this->app->make(CloudflareSettingsService::class)->apply();
            $this->registerMediaDisk();
            $this->app->make(MailSettingsService::class)->apply();
        } catch (\Throwable $e) {
            // Only a database that is genuinely unreachable should arm the flag:
            // it suppresses these settings for every request until the TTL
            // expires, so arming it for an unrelated failure blanks the
            // Cloudflare and mail configuration long after the thing that
            // actually broke. Anything else is reported rather than swallowed,
            // so it reaches the log instead of resurfacing as a downstream
            // error that points nowhere near the cause.
            if ($e instanceof QueryException || $e instanceof \PDOException) {
                // Table may not exist yet during migrate, or the database is down.
                $this->rememberDatabaseUnavailable();
            } else {
                report($e);
            }
        }

        $this->refreshCloudflareSettingsPerJob();
    }

    /** Short TTL so recovery is automatic once the database answers again. */
    private function databaseRecentlyUnavailable(): bool
    {
        try {
            return (bool) Cache::get('boot:database-unavailable', false);
        } catch (\Throwable) {
            return false;
        }
    }

    private function rememberDatabaseUnavailable(): void
    {
        try {
            Cache::put('boot:database-unavailable', true, now()->addSeconds(15));
        } catch (\Throwable) {
            // A cache store that is itself unavailable is not worth failing for.
        }
    }

    /**
     * Admin-stored Cloudflare credentials override the CLOUDFLARE_* env vars.
     * Applied here so CloudflareClient, the custom hostname service and the
     * domain provider binding all resolve from the same config.
     */
    private function refreshCloudflareSettingsPerJob(): void
    {
        // A queue worker boots once and then runs for days. Custom hostname
        // jobs would keep using whatever credentials were current at boot, so
        // re-read them before each job instead.
        Queue::before(function () {
            try {
                $this->app->make(CloudflareSettingsService::class)->apply();
            } catch (\Throwable) {
                // Never let a settings read take down the job.
            }
        });
    }

    private function registerMediaDisk(): void
    {
        try {
            $service = $this->app->make(StorageSettingsService::class);
            $config = $service->config();
            if (! $config->isLocal() && $config->configured()) {
                $service->registerExternalDisk($config);
            }
        } catch (\Throwable) {
            // Table may not exist yet during migrate / first boot.
        }
    }
}
