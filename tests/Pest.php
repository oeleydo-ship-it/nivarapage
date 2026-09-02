<?php

use App\Models\AiSetting;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceUser;
use App\Services\Ai\FakeAiProvider;
use App\Services\Domains\ApexAddressResolver;
use App\Services\Domains\FakeDomainProvider;
use App\Services\WorkspaceService;
use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Support\FakeApexAddressResolver;
use Tests\TestCase;

pest()->extend(TestCase::class)
    ->in('Unit');

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->beforeEach(function () {
        FakeDomainProvider::reset();
        // Root-domain instructions read DNS for the CNAME target. Stub it by
        // default so no test depends on a live resolver.
        fakeApexAddresses();
        $this->seed(PlanSeeder::class);
    })
    ->in('Feature');

/**
 * Binds an apex resolver that answers with fixed addresses instead of DNS.
 *
 * @param  list<string>  $ipv4
 * @param  list<string>  $ipv6
 */
function fakeApexAddresses(array $ipv4 = [], array $ipv6 = []): FakeApexAddressResolver
{
    $resolver = new FakeApexAddressResolver($ipv4, $ipv6);
    app()->instance(ApexAddressResolver::class, $resolver);

    return $resolver;
}

function tenant(array $overrides = []): array
{
    $user = User::factory()->create($overrides);
    $workspace = app(WorkspaceService::class)->createPersonal($user, $user->name.' Workspace');
    $user->refresh();

    return compact('user', 'workspace');
}

function authHeaders(User $user, Workspace $workspace): array
{
    Sanctum::actingAs($user);

    return ['X-Workspace-Id' => (string) $workspace->id];
}

function member(int $workspaceId, string $role = 'editor'): User
{
    $user = User::factory()->create();
    WorkspaceUser::query()->create([
        'workspace_id' => $workspaceId,
        'user_id' => $user->id,
        'role' => $role,
    ]);

    return $user;
}

function sampleContent(string $heading = 'Hello'): array
{
    return [
        'schemaVersion' => 1,
        'sections' => [[
            'id' => 'hero-1',
            'type' => 'hero.centered',
            'version' => 1,
            'hidden' => false,
            'props' => ['heading' => $heading],
        ]],
    ];
}

function adminTenant(): array
{
    return tenant(['is_super_admin' => true]);
}

function enableAi(array $overrides = []): AiSetting
{
    $row = AiSetting::current();
    $row->update(array_merge([
        'enabled' => true,
        'provider' => 'fake',
        'model' => 'fake-model',
        'base_url' => 'https://fake.test',
        'api_key' => 'sk-test-abcd1234',
    ], $overrides));

    return $row->fresh();
}

function allowAi(Workspace $workspace, int $limit = 25): void
{
    $plan = $workspace->load('subscription.plan')->subscription->plan;
    $plan->update(['limits' => array_merge($plan->limits ?? [], ['ai_generations' => $limit])]);
}

/**
 * Queues the art-direction answer that generating a blank site now asks for
 * first. Push it before the site JSON, in the order the generator calls.
 *
 * Passing null queues a reply the generator cannot use, which is how a test
 * exercises the fallback to the old generated.* behaviour.
 */
function pushArtDirection(?string $kit = 'voltera', array $theme = ['primary' => '#1d4ed8'], array $motion = ['animation' => 'fade-up']): void
{
    FakeAiProvider::pushArt((string) json_encode($kit === null
        ? ['reason' => 'no kit chosen']
        : ['kit' => $kit, 'theme' => $theme, 'motion' => $motion, 'reason' => 'Fits the brief.']));
}

function aiSite(array $headers): int
{
    return test()->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'AI Site', 'subdomain' => 'aisite'])
        ->assertCreated()
        ->json('data.id');
}
