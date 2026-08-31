<?php

use App\Models\Domain;
use App\Models\Form;
use App\Models\Media;
use App\Models\Site;
use App\Models\Template;
use App\Models\User;
use Database\Seeders\TemplateSeeder;
use Laravel\Sanctum\Sanctum;

it('forbids admin routes for regular users', function () {
    ['user' => $user] = tenant();
    Sanctum::actingAs($user);

    $this->getJson('/api/v1/admin/dashboard')->assertForbidden();
    $this->getJson('/api/v1/admin/blocks')->assertForbidden();
    $this->getJson('/api/v1/admin/health')->assertForbidden();
    $this->getJson('/api/v1/admin/settings')->assertForbidden();
});

it('lets super admins search users websites and hostnames', function () {
    ['user' => $admin, 'workspace' => $workspace] = adminTenant();
    $other = User::factory()->create(['name' => 'Zelda Searchlight', 'email' => 'zelda.search@example.com']);
    $site = Site::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $admin->id,
        'name' => 'Harbor Table',
        'slug' => 'harbor-table',
    ]);
    Domain::factory()->create([
        'workspace_id' => $workspace->id,
        'site_id' => $site->id,
        'hostname' => 'www.customer-domain.com',
        'type' => 'custom',
    ]);

    Sanctum::actingAs($admin);

    $this->getJson('/api/v1/admin/users?q=Searchlight')
        ->assertOk()
        ->assertJsonPath('data.0.email', 'zelda.search@example.com');

    $this->getJson('/api/v1/admin/users?q=nobody-here')
        ->assertOk()
        ->assertJsonCount(0, 'data');

    $this->getJson('/api/v1/admin/sites?q=Harbor')
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Harbor Table');

    $this->getJson('/api/v1/admin/sites?q=customer-domain.com')
        ->assertOk()
        ->assertJsonPath('data.0.id', $site->id);

    $this->getJson('/api/v1/admin/domains?q=customer-domain')
        ->assertOk()
        ->assertJsonPath('data.0.hostname', 'www.customer-domain.com');

    expect($other->email)->toBe('zelda.search@example.com');
});

it('resolves hostname to site workspace and owner', function () {
    ['user' => $admin, 'workspace' => $workspace] = adminTenant();
    $site = Site::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $admin->id,
        'name' => 'Lookup Site',
    ]);
    Domain::factory()->create([
        'workspace_id' => $workspace->id,
        'site_id' => $site->id,
        'hostname' => 'www.customer-domain.com',
    ]);

    Sanctum::actingAs($admin);

    $this->getJson('/api/v1/admin/domains/lookup?hostname=https://www.customer-domain.com/path')
        ->assertOk()
        ->assertJsonPath('data.hostname', 'www.customer-domain.com')
        ->assertJsonPath('data.site.id', $site->id)
        ->assertJsonPath('data.site.name', 'Lookup Site')
        ->assertJsonPath('data.workspace.id', $workspace->id)
        ->assertJsonPath('data.owner.id', $admin->id)
        ->assertJsonPath('data.owner.email', $admin->email);
});

it('lists subscriptions and storage per workspace', function () {
    ['user' => $admin, 'workspace' => $workspace] = adminTenant();
    Media::factory()->create([
        'workspace_id' => $workspace->id,
        'user_id' => $admin->id,
        'size' => 2 * 1048576,
    ]);

    Sanctum::actingAs($admin);

    $this->getJson('/api/v1/admin/subscriptions')
        ->assertOk()
        ->assertJsonPath('data.0.workspace.id', $workspace->id)
        ->assertJsonPath('data.0.plan.slug', 'free')
        ->assertJsonPath('data.0.status', 'active');

    $this->getJson('/api/v1/admin/storage')
        ->assertOk()
        ->assertJsonPath('data.0.id', $workspace->id)
        ->assertJsonPath('data.0.bytes', 2 * 1048576)
        ->assertJsonPath('data.0.mb', 2);
});

it('lists forms across workspaces', function () {
    ['user' => $admin, 'workspace' => $workspace] = adminTenant();
    $site = Site::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $admin->id,
        'name' => 'Form Site',
    ]);
    Form::factory()->create([
        'workspace_id' => $workspace->id,
        'site_id' => $site->id,
        'name' => 'Contact us',
    ]);

    Sanctum::actingAs($admin);

    $this->getJson('/api/v1/admin/forms?q=Contact')
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Contact us')
        ->assertJsonPath('data.0.site.name', 'Form Site')
        ->assertJsonPath('data.0.workspace.id', $workspace->id)
        ->assertJsonPath('data.0.submissions_count', 0);
});

it('returns the registered block catalog', function () {
    ['user' => $admin] = adminTenant();
    Sanctum::actingAs($admin);

    $response = $this->getJson('/api/v1/admin/blocks')->assertOk();

    expect($response->json('data.loaded'))->toBeTrue();
    expect($response->json('data.blocks'))->toBeArray()->not->toBeEmpty();
    expect(collect($response->json('data.blocks'))->pluck('type'))->toContain('hero.centered');
    expect($response->json('data.blocks.0'))->toHaveKeys(['type', 'label', 'category', 'version']);
});

it('lets super admins deactivate templates', function () {
    $this->seed(TemplateSeeder::class);
    ['user' => $admin, 'workspace' => $workspace] = adminTenant();
    Sanctum::actingAs($admin);

    $template = Template::query()->where('slug', 'restaurant')->firstOrFail();

    $this->getJson('/api/v1/admin/templates')
        ->assertOk()
        ->assertJsonFragment(['slug' => 'restaurant']);

    $this->patchJson('/api/v1/admin/templates/'.$template->id, [
        'is_active' => false,
        'is_featured' => true,
    ])->assertOk()
        ->assertJsonPath('data.is_active', false)
        ->assertJsonPath('data.is_featured', true);

    $this->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->getJson('/api/v1/templates')
        ->assertOk()
        ->assertJsonMissing(['slug' => 'restaurant']);
});

it('reports system health and queue counts for super admins', function () {
    ['user' => $admin] = adminTenant();
    Sanctum::actingAs($admin);

    $this->getJson('/api/v1/health')->assertOk()->assertJsonPath('status', 'ok');
    $this->getJson('/api/v1/health/ready')->assertOk()->assertJsonPath('status', 'ok');

    $this->getJson('/api/v1/admin/health')
        ->assertOk()
        ->assertJsonPath('data.live.status', 'ok')
        ->assertJsonPath('data.ready.status', 'ok')
        ->assertJsonPath('data.ready.checks.database', true)
        ->assertJsonPath('data.queue.pending', 0)
        ->assertJsonPath('data.queue.failed', 0);

    $this->getJson('/api/v1/admin/jobs')
        ->assertOk()
        ->assertJsonStructure(['data' => ['pending', 'failed']]);
});

it('lets super admins update platform settings', function () {
    ['user' => $admin, 'workspace' => $workspace] = adminTenant();
    Sanctum::actingAs($admin);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $this->getJson('/api/v1/admin/settings')
        ->assertOk()
        ->assertJsonStructure(['data' => ['platform_name', 'support_email', 'platform_domain']]);

    $site = Site::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $admin->id,
        'name' => 'Studio',
    ]);
    Domain::factory()->create([
        'workspace_id' => $workspace->id,
        'site_id' => $site->id,
        'type' => 'subdomain',
        'hostname' => 'studio.sites.example.com',
        'status' => 'active',
        'is_primary' => true,
    ]);

    $this->putJson('/api/v1/admin/settings', [
        'platform_name' => 'UiDesired Cloud',
        'support_email' => 'help@uidesired.test',
        'platform_domain' => 'sites.aidirectory.com',
    ])->assertOk()
        ->assertJsonPath('data.platform_name', 'UiDesired Cloud')
        ->assertJsonPath('data.support_email', 'help@uidesired.test')
        ->assertJsonPath('data.platform_domain', 'sites.aidirectory.com');

    expect($site->domains()->value('hostname'))->toBe('studio.sites.aidirectory.com');

    $this->getJson('/api/v1/public/branding')
        ->assertJsonPath('data.platform_domain', 'sites.aidirectory.com');

    $this->withHeaders($headers)
        ->getJson('/api/v1/subdomains/check?name=studio')
        ->assertOk()
        ->assertJsonPath('data.hostname', 'studio.sites.aidirectory.com');

    $this->getJson('/api/v1/admin/settings')
        ->assertJsonPath('data.support_email', 'help@uidesired.test');
});

it('still suspends sites and workspaces', function () {
    ['user' => $admin, 'workspace' => $workspace] = adminTenant();
    $site = Site::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $admin->id,
        'status' => 'published',
    ]);

    Sanctum::actingAs($admin);

    $this->postJson('/api/v1/admin/sites/'.$site->id.'/suspend')
        ->assertOk()
        ->assertJsonPath('data.status', 'disabled');

    $this->postJson('/api/v1/admin/workspaces/'.$workspace->id.'/suspend')
        ->assertOk()
        ->assertJsonPath('data.status', 'suspended');
});

it('lets super admins see subscriptions, block, impersonate and delete users', function () {
    ['user' => $admin, 'workspace' => $workspace] = adminTenant();
    $member = User::factory()->create(['name' => 'Support Target', 'email' => 'support.target@example.com']);
    $workspace->members()->attach($member->id, ['role' => 'editor']);
    $orphan = User::factory()->create(['name' => 'Orphan User', 'email' => 'orphan@example.com']);

    Sanctum::actingAs($admin);

    $this->getJson('/api/v1/admin/users?q=Support+Target')
        ->assertOk()
        ->assertJsonPath('data.0.email', 'support.target@example.com')
        ->assertJsonPath('data.0.subscription.workspace_name', $workspace->name);

    $this->postJson('/api/v1/admin/users/'.$member->id.'/impersonate')
        ->assertOk()
        ->assertJsonPath('data.user.email', 'support.target@example.com')
        ->assertJsonStructure(['data' => ['token', 'impersonation' => ['admin_email', 'target_email']]]);

    $this->postJson('/api/v1/admin/users/'.$member->id.'/block', ['reason' => 'Abuse'])
        ->assertOk()
        ->assertJsonPath('data.is_blocked', true);

    $this->postJson('/api/v1/auth/login', [
        'email' => 'support.target@example.com',
        'password' => 'password',
    ])->assertForbidden()->assertJsonPath('error', 'account_blocked');

    $this->postJson('/api/v1/admin/users/'.$member->id.'/impersonate')
        ->assertStatus(422);

    $this->postJson('/api/v1/admin/users/'.$member->id.'/unblock')
        ->assertOk()
        ->assertJsonPath('data.is_blocked', false);

    $this->deleteJson('/api/v1/admin/users/'.$orphan->id)
        ->assertOk()
        ->assertJsonPath('data.ok', true);

    expect(User::query()->whereKey($orphan->id)->exists())->toBeFalse();
});
