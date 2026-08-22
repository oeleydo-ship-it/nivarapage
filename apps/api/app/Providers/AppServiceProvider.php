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
use App\Services\Domains\CloudflareDomainProvider;
use App\Services\Domains\FakeDomainProvider;
use App\Services\Mail\MailSettingsService;
use App\Services\Storage\StorageSettingsService;
use App\Support\CurrentWorkspace;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
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

        $this->registerMediaDisk();
        $this->applyMailSettings();

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
     * Pushes the admin's saved SMTP settings into the runtime mail config, so
     * web requests and queue workers both send through the same server.
     */
    private function applyMailSettings(): void
    {
        try {
            $this->app->make(MailSettingsService::class)->apply();
        } catch (\Throwable) {
            // Table may not exist yet during migrate / first boot.
        }
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
