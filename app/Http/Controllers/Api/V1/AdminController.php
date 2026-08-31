<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityResource;
use App\Http\Resources\DomainResource;
use App\Http\Resources\FormResource;
use App\Http\Resources\PlanResource;
use App\Http\Resources\SiteResource;
use App\Http\Resources\SubscriptionResource;
use App\Http\Resources\TemplateResource;
use App\Http\Resources\UserResource;
use App\Http\Resources\WorkspaceResource;
use App\Models\Activity;
use App\Models\Domain;
use App\Models\Form;
use App\Models\Media;
use App\Models\Plan;
use App\Models\Site;
use App\Models\Subscription;
use App\Models\Template;
use App\Models\User;
use App\Models\Workspace;
use App\Services\AuditService;
use App\Services\PlatformSettingsService;
use App\Services\StripeGateway;
use App\Support\AiGeneratedSite;
use App\Support\BlockCatalog;
use App\Support\Hostname;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Throwable;

class AdminController extends Controller
{
    public function dashboard(): JsonResponse
    {
        return response()->json(['data' => [
            'users' => User::query()->count(),
            'workspaces' => Workspace::query()->count(),
            'sites' => Site::query()->count(),
            'domains' => Domain::query()->count(),
            'templates' => Template::query()->count(),
            'forms' => Form::query()->count(),
            'subscriptions' => Subscription::query()->count(),
            'pending_jobs' => DB::table('jobs')->count(),
            'failed_jobs' => DB::table('failed_jobs')->count(),
            'stripe' => app(StripeGateway::class)->status(),
        ]]);
    }

    public function users(Request $request)
    {
        return UserResource::collection(
            User::query()
                ->with([
                    'currentWorkspace.subscription.plan',
                    'ownedWorkspaces.subscription.plan',
                    'workspaces.subscription.plan',
                ])
                ->latest()
                ->when($request->filled('q'), function (Builder $query) use ($request) {
                    $term = $this->like($request);
                    $query->where(function (Builder $inner) use ($term) {
                        $inner->where('name', 'like', $term)
                            ->orWhere('email', 'like', $term);
                    });
                })
                ->paginate($this->perPage($request))
                ->withQueryString()
        );
    }

    public function blockUser(Request $request, User $user, AuditService $audit): UserResource
    {
        $this->guardUserMutation($request, $user);

        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $user->update([
            'blocked_at' => now(),
            'blocked_reason' => $data['reason'] ?? null,
        ]);
        $user->tokens()->delete();

        $audit->log('admin.user_blocked', $user, [
            'reason' => $data['reason'] ?? null,
            'email' => $user->email,
        ], null, $request->user());

        return new UserResource($user->fresh()->load(['currentWorkspace.subscription.plan', 'ownedWorkspaces.subscription.plan', 'workspaces.subscription.plan']));
    }

    public function unblockUser(Request $request, User $user, AuditService $audit): UserResource
    {
        abort_if($request->user()?->id === $user->id, 422, 'You cannot unblock yourself this way.');

        $user->update([
            'blocked_at' => null,
            'blocked_reason' => null,
        ]);

        $audit->log('admin.user_unblocked', $user, ['email' => $user->email], null, $request->user());

        return new UserResource($user->fresh()->load(['currentWorkspace.subscription.plan', 'ownedWorkspaces.subscription.plan', 'workspaces.subscription.plan']));
    }

    public function destroyUser(Request $request, User $user, AuditService $audit): JsonResponse
    {
        $this->guardUserMutation($request, $user);

        $ownedCount = $user->ownedWorkspaces()->count();
        abort_if(
            $ownedCount > 0,
            422,
            "This user owns {$ownedCount} workspace(s). Transfer or delete those workspaces first, or block the account instead."
        );

        $audit->log('admin.user_deleted', $user, [
            'email' => $user->email,
            'name' => $user->name,
        ], null, $request->user());

        $user->tokens()->delete();
        $user->workspaces()->detach();
        $user->delete();

        return response()->json(['data' => ['ok' => true]]);
    }

    public function impersonateUser(Request $request, User $user, AuditService $audit): JsonResponse
    {
        abort_if($request->user()?->id === $user->id, 422, 'You are already signed in as this user.');
        abort_if($user->is_super_admin, 422, 'Cannot impersonate another super admin.');
        abort_if($user->isBlocked(), 422, 'Cannot impersonate a blocked user. Unblock them first.');

        $user->load(['workspaces.subscription.plan', 'currentWorkspace']);
        $token = $user->createToken('impersonation:'.$request->user()->id)->plainTextToken;

        $audit->log('admin.user_impersonated', $user, [
            'email' => $user->email,
            'admin_id' => $request->user()->id,
            'admin_email' => $request->user()->email,
        ], $user->currentWorkspace, $request->user());

        return response()->json([
            'data' => [
                'token' => $token,
                'user' => new UserResource($user),
                'workspaces' => WorkspaceResource::collection($user->workspaces),
                'impersonation' => [
                    'admin_id' => $request->user()->id,
                    'admin_name' => $request->user()->name,
                    'admin_email' => $request->user()->email,
                    'target_name' => $user->name,
                    'target_email' => $user->email,
                ],
            ],
        ]);
    }

    private function guardUserMutation(Request $request, User $user): void
    {
        abort_if($request->user()?->id === $user->id, 422, 'You cannot perform this action on your own account.');
        abort_if($user->is_super_admin, 422, 'Super admin accounts cannot be blocked or deleted here.');
    }

    public function workspaces(Request $request)
    {
        return WorkspaceResource::collection(
            Workspace::query()
                ->with('subscription.plan')
                ->latest()
                ->when($request->filled('q'), function (Builder $query) use ($request) {
                    $term = $this->like($request);
                    $query->where(function (Builder $inner) use ($term) {
                        $inner->where('name', 'like', $term)
                            ->orWhere('slug', 'like', $term);
                    });
                })
                ->paginate($this->perPage($request))
                ->withQueryString()
        );
    }

    public function sites(Request $request)
    {
        return SiteResource::collection(
            Site::query()
                ->with('domains')
                ->latest()
                ->when($request->filled('q'), function (Builder $query) use ($request) {
                    $term = $this->like($request);
                    $query->where(function (Builder $inner) use ($term) {
                        $inner->where('name', 'like', $term)
                            ->orWhere('slug', 'like', $term)
                            ->orWhere('business_name', 'like', $term)
                            ->orWhereHas('domains', fn (Builder $domains) => $domains->where('hostname', 'like', $term));
                    });
                })
                ->paginate($this->perPage($request))
                ->withQueryString()
        );
    }

    public function domains(Request $request)
    {
        return DomainResource::collection(
            Domain::query()
                ->latest()
                ->when($request->filled('q'), function (Builder $query) use ($request) {
                    $query->where('hostname', 'like', $this->like($request));
                })
                ->paginate($this->perPage($request))
                ->withQueryString()
        );
    }

    public function templates()
    {
        return TemplateResource::collection(
            Template::query()->with('category')->withCount('pages')->orderByDesc('is_featured')->orderBy('name')->get()
        );
    }

    public function updateTemplate(Request $request, Template $template): TemplateResource
    {
        $data = $request->validate([
            'is_active' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            'name' => ['sometimes', 'string', 'max:120'],
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'theme_tokens' => ['sometimes', 'nullable', 'array'],
        ]);

        if (array_key_exists('theme_tokens', $data)) {
            $data['theme_tokens'] = AiGeneratedSite::sanitizeTheme($data['theme_tokens']);
        }

        $template->update($data);

        return new TemplateResource($template->fresh()->load('category')->loadCount('pages'));
    }

    public function blocks(): JsonResponse
    {
        $catalog = BlockCatalog::load();
        $blocks = [];

        foreach ($catalog['blocks'] as $type => $block) {
            if (! is_array($block)) {
                continue;
            }

            $blocks[] = [
                'type' => is_string($block['type'] ?? null) ? $block['type'] : $type,
                'label' => is_string($block['label'] ?? null) ? $block['label'] : $type,
                'category' => is_string($block['category'] ?? null) ? $block['category'] : 'content',
                'version' => (int) ($block['version'] ?? 1),
            ];
        }

        return response()->json(['data' => [
            'loaded' => BlockCatalog::loaded(),
            'categories' => $catalog['categories'],
            'blocks' => $blocks,
        ]]);
    }

    public function plans()
    {
        return PlanResource::collection(Plan::query()->withCount('subscriptions')->orderBy('id')->get());
    }

    public function updatePlan(Request $request, Plan $plan): PlanResource
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
            'prices' => ['sometimes', 'array'],
            'prices.monthly' => ['nullable', 'integer', 'min:0'],
            'prices.yearly' => ['nullable', 'integer', 'min:0'],
            'limits' => ['sometimes', 'array'],
            'stripe_price_monthly' => ['nullable', 'string', 'max:255'],
            'stripe_price_yearly' => ['nullable', 'string', 'max:255'],
        ]);

        if (isset($data['limits'])) {
            $data['limits'] = array_merge($plan->limits ?? [], $data['limits']);
        }
        if (isset($data['prices'])) {
            $data['prices'] = array_merge($plan->prices ?? [], $data['prices']);
        }

        $plan->update($data);

        return new PlanResource($plan->fresh()->loadCount('subscriptions'));
    }

    public function subscriptions(Request $request)
    {
        return SubscriptionResource::collection(
            Subscription::query()
                ->with(['workspace', 'plan'])
                ->latest()
                ->when($request->filled('q'), function (Builder $query) use ($request) {
                    $term = $this->like($request);
                    $query->where(function (Builder $inner) use ($term) {
                        $inner->where('status', 'like', $term)
                            ->orWhere('provider', 'like', $term)
                            ->orWhereHas('workspace', fn (Builder $workspace) => $workspace
                                ->where('name', 'like', $term)
                                ->orWhere('slug', 'like', $term))
                            ->orWhereHas('plan', fn (Builder $plan) => $plan
                                ->where('name', 'like', $term)
                                ->orWhere('slug', 'like', $term));
                    });
                })
                ->paginate($this->perPage($request))
                ->withQueryString()
        );
    }

    public function storage(Request $request): JsonResponse
    {
        $items = Workspace::query()
            ->with('subscription.plan')
            ->select('workspaces.*')
            ->selectSub(
                Media::query()
                    ->selectRaw('coalesce(sum(size), 0)')
                    ->whereColumn('workspace_id', 'workspaces.id'),
                'storage_bytes',
            )
            ->when($request->filled('q'), function (Builder $query) use ($request) {
                $term = $this->like($request);
                $query->where(function (Builder $inner) use ($term) {
                    $inner->where('name', 'like', $term)->orWhere('slug', 'like', $term);
                });
            })
            ->orderByDesc('storage_bytes')
            ->paginate($this->perPage($request))
            ->withQueryString();

        $items->getCollection()->transform(function (Workspace $workspace) {
            $bytes = (int) ($workspace->storage_bytes ?? 0);
            $limit = $workspace->subscription?->plan?->limits['storage_mb'] ?? null;

            return [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'slug' => $workspace->slug,
                'status' => $workspace->status,
                'bytes' => $bytes,
                'mb' => (int) ceil($bytes / 1048576),
                'limit_mb' => is_numeric($limit) ? (int) $limit : null,
                'plan' => $workspace->subscription?->plan?->only(['id', 'slug', 'name']),
            ];
        });

        return response()->json($items);
    }

    public function forms(Request $request)
    {
        return FormResource::collection(
            Form::query()
                ->with(['site:id,name', 'workspace:id,name'])
                ->withCount('submissions')
                ->latest()
                ->when($request->filled('q'), function (Builder $query) use ($request) {
                    $term = $this->like($request);
                    $query->where(function (Builder $inner) use ($term) {
                        $inner->where('name', 'like', $term)
                            ->orWhere('slug', 'like', $term)
                            ->orWhereHas('site', fn (Builder $site) => $site->where('name', 'like', $term))
                            ->orWhereHas('workspace', fn (Builder $workspace) => $workspace->where('name', 'like', $term));
                    });
                })
                ->paginate($this->perPage($request))
                ->withQueryString()
        );
    }

    public function activities(Request $request)
    {
        $items = Activity::query()
            ->with(['actor', 'workspace'])
            ->when($request->filled('action'), fn ($query) => $query->where('action', $request->string('action')))
            ->when($request->filled('workspace_id'), fn ($query) => $query->where('workspace_id', $request->integer('workspace_id')))
            ->when($request->filled('actor_id'), fn ($query) => $query->where('actor_id', $request->integer('actor_id')))
            ->when($request->filled('q'), function ($query) use ($request) {
                $term = '%'.$request->string('q').'%';
                $query->where(function ($inner) use ($term) {
                    $inner->where('action', 'like', $term)
                        ->orWhere('ip', 'like', $term)
                        ->orWhere('metadata', 'like', $term)
                        ->orWhereHas('actor', fn ($actor) => $actor
                            ->where('name', 'like', $term)
                            ->orWhere('email', 'like', $term))
                        ->orWhereHas('workspace', fn ($workspace) => $workspace->where('name', 'like', $term));
                });
            })
            ->latest()
            ->paginate($this->perPage($request))
            ->withQueryString();

        return ActivityResource::collection($items);
    }

    public function jobs(): JsonResponse
    {
        $pending = DB::table('jobs')->orderByDesc('id')->limit(50)->get()->map(function ($job) {
            $row = (array) $job;
            $row['name'] = $this->jobDisplayName($job->payload ?? null);

            return $row;
        });

        $failed = DB::table('failed_jobs')->orderByDesc('id')->limit(50)->get()->map(function ($job) {
            $row = (array) $job;
            $row['name'] = $this->jobDisplayName($job->payload ?? null);

            return $row;
        });

        return response()->json([
            'data' => [
                'pending' => $pending->values(),
                'failed' => $failed->values(),
            ],
        ]);
    }

    public function retryFailedJob(int $id): JsonResponse
    {
        Artisan::call('queue:retry', ['id' => [$id]]);

        return response()->json(['data' => ['ok' => true]]);
    }

    public function suspendSite(Site $site): SiteResource
    {
        $site->update(['status' => 'disabled']);

        return new SiteResource($site);
    }

    public function suspendWorkspace(int $workspace): WorkspaceResource
    {
        $model = Workspace::query()->findOrFail($workspace);
        $model->update(['status' => 'suspended']);

        return new WorkspaceResource($model);
    }

    public function lookupDomain(Request $request): JsonResponse
    {
        $hostname = $this->normalizeHostname((string) $request->query('hostname', ''));

        if ($hostname === '') {
            return response()->json(['message' => 'Hostname is required.'], 422);
        }

        $domain = Domain::query()
            ->with(['site.workspace.owner'])
            ->whereRaw('lower(hostname) = ?', [$hostname])
            ->first();

        if (! $domain) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $site = $domain->site;
        $workspace = $site?->workspace;
        $owner = $workspace?->owner;

        return response()->json(['data' => array_merge(
            (new DomainResource($domain))->resolve($request),
            [
                'site' => $site ? [
                    'id' => $site->id,
                    'name' => $site->name,
                    'status' => $site->status,
                    'workspace_id' => $site->workspace_id,
                ] : null,
                'workspace' => $workspace ? [
                    'id' => $workspace->id,
                    'name' => $workspace->name,
                    'slug' => $workspace->slug,
                    'status' => $workspace->status,
                ] : null,
                'owner' => $owner ? [
                    'id' => $owner->id,
                    'name' => $owner->name,
                    'email' => $owner->email,
                ] : null,
            ],
        )]);
    }

    public function health(): JsonResponse
    {
        $checks = ['database' => false, 'redis' => false];

        try {
            DB::select('select 1');
            $checks['database'] = true;
        } catch (Throwable) {
            $checks['database'] = false;
        }

        try {
            Cache::put('health:ready', true, 5);
            $checks['redis'] = Cache::has('health:ready') || config('cache.default') === 'array';
        } catch (Throwable) {
            $checks['redis'] = app()->environment('testing');
        }

        $ready = $checks['database'] && $checks['redis'];

        return response()->json(['data' => [
            'live' => ['status' => 'ok', 'path' => '/api/v1/health'],
            'ready' => [
                'status' => $ready ? 'ok' : 'degraded',
                'path' => '/api/v1/health/ready',
                'checks' => $checks,
            ],
            'queue' => [
                'pending' => DB::table('jobs')->count(),
                'failed' => DB::table('failed_jobs')->count(),
            ],
        ]]);
    }

    public function settings(PlatformSettingsService $settings): JsonResponse
    {
        return response()->json(['data' => $settings->all()]);
    }

    public function updateSettings(Request $request, PlatformSettingsService $settings): JsonResponse
    {
        $data = $request->validate([
            'platform_name' => ['sometimes', 'string', 'max:120'],
            'platform_tagline' => ['sometimes', 'nullable', 'string', 'max:120'],
            'support_email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'platform_domain' => ['sometimes', 'nullable', 'string', 'max:253', function (string $attribute, mixed $value, \Closure $fail): void {
                if ($value === null || $value === '') {
                    return;
                }
                if (! Hostname::isValid((string) $value) || filter_var(Hostname::normalize((string) $value), FILTER_VALIDATE_IP)) {
                    $fail('Enter a hostname such as sites.example.com (no http://).');
                }
            }],
            'funnels_enabled' => ['sometimes', 'boolean'],
            'funnel_events_retention_days' => ['sometimes', 'integer', 'min:7', 'max:730'],
            'funnel_sessions_retention_days' => ['sometimes', 'integer', 'min:7', 'max:730'],
        ]);

        if (array_key_exists('funnels_enabled', $data)) {
            $data['features.funnels'] = $data['funnels_enabled'];
            unset($data['funnels_enabled']);
        }
        foreach (['funnel_events_retention_days' => 'funnels.raw_event_retention_days', 'funnel_sessions_retention_days' => 'funnels.session_retention_days'] as $public => $stored) {
            if (array_key_exists($public, $data)) {
                $data[$stored] = $data[$public];
                unset($data[$public]);
            }
        }

        return response()->json(['data' => $settings->update($data)]);
    }

    private function like(Request $request): string
    {
        return '%'.$request->string('q').'%';
    }

    private function perPage(Request $request): int
    {
        return (int) min($request->integer('per_page', 50) ?: 50, 100);
    }

    private function normalizeHostname(string $hostname): string
    {
        $value = strtolower(trim($hostname));
        $value = preg_replace('#^https?://#', '', $value) ?? $value;
        $host = explode('/', $value)[0];
        $host = explode(':', $host)[0];

        return $host;
    }

    private function jobDisplayName(mixed $payload): string
    {
        if (! is_string($payload) || $payload === '') {
            return 'job';
        }

        $decoded = json_decode($payload, true);
        if (! is_array($decoded)) {
            return 'job';
        }

        foreach (['displayName', 'job'] as $key) {
            if (is_string($decoded[$key] ?? null) && $decoded[$key] !== '') {
                return $decoded[$key];
            }
        }

        $command = $decoded['data']['commandName'] ?? null;

        return is_string($command) && $command !== '' ? $command : 'job';
    }
}
