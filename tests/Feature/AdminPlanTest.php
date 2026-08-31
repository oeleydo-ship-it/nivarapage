<?php

use App\Models\Plan;
use App\Models\Subscription;
use App\Services\PlanLimitService;
use App\Support\PlanLimits;
use Laravel\Sanctum\Sanctum;

it('keeps plan management away from regular users', function () {
    ['user' => $user] = tenant();
    Sanctum::actingAs($user);

    $this->postJson('/api/v1/admin/plans', ['slug' => 'nope', 'name' => 'Nope'])->assertForbidden();
    $this->deleteJson('/api/v1/admin/plans/1')->assertForbidden();
});

it('creates a plan with a complete set of limits', function () {
    ['user' => $admin] = adminTenant();
    Sanctum::actingAs($admin);

    $response = $this->postJson('/api/v1/admin/plans', [
        'slug' => 'studio',
        'name' => 'Studio',
        'prices' => ['monthly' => 2500, 'yearly' => 24000],
        'limits' => ['number_of_sites' => 5, 'custom_domains' => 2, 'remove_branding' => true],
    ])->assertCreated();

    $limits = $response->json('data.limits');

    expect($limits['number_of_sites'])->toBe(5)
        ->and($limits['custom_domains'])->toBe(2)
        ->and($limits['remove_branding'])->toBeTrue();

    // Everything the author did not mention is still stored, so a plan can
    // never reach a gate with a key missing.
    foreach (PlanLimits::keys() as $key) {
        expect($limits)->toHaveKey($key);
    }
});

it('rejects a slug that is already taken or malformed', function () {
    ['user' => $admin] = adminTenant();
    Sanctum::actingAs($admin);

    Plan::query()->create(['slug' => 'studio', 'name' => 'Studio', 'limits' => PlanLimits::normalize([])]);

    $this->postJson('/api/v1/admin/plans', ['slug' => 'studio', 'name' => 'Another'])
        ->assertStatus(422)->assertJsonValidationErrors('slug');

    $this->postJson('/api/v1/admin/plans', ['slug' => 'Not Valid!', 'name' => 'Another'])
        ->assertStatus(422)->assertJsonValidationErrors('slug');
});

it('refuses limit values that are not a quota or a flag', function () {
    ['user' => $admin] = adminTenant();
    Sanctum::actingAs($admin);

    $this->postJson('/api/v1/admin/plans', [
        'slug' => 'studio',
        'name' => 'Studio',
        'limits' => ['number_of_sites' => 'lots'],
    ])->assertStatus(422)->assertJsonValidationErrors('limits.number_of_sites');

    // -1 is unlimited and is the floor; anything below it is meaningless.
    $this->postJson('/api/v1/admin/plans', [
        'slug' => 'studio2',
        'name' => 'Studio 2',
        'limits' => ['custom_domains' => -5],
    ])->assertStatus(422)->assertJsonValidationErrors('limits.custom_domains');
});

it('keeps limits the update did not mention', function () {
    ['user' => $admin] = adminTenant();
    Sanctum::actingAs($admin);

    $plan = Plan::query()->create([
        'slug' => 'studio',
        'name' => 'Studio',
        'limits' => PlanLimits::normalize(['number_of_sites' => 7, 'custom_domains' => 4]),
    ]);

    $limits = $this->patchJson("/api/v1/admin/plans/{$plan->id}", [
        'limits' => ['custom_domains' => 9],
    ])->assertOk()->json('data.limits');

    expect($limits['custom_domains'])->toBe(9)
        ->and($limits['number_of_sites'])->toBe(7);
});

it('will not delete the free plan or one that is still subscribed to', function () {
    ['user' => $admin, 'workspace' => $workspace] = adminTenant();
    Sanctum::actingAs($admin);

    // adminTenant() assigns the free plan, so it is in use as well as special.
    $free = Plan::query()->where('slug', 'free')->firstOrFail();
    $this->deleteJson("/api/v1/admin/plans/{$free->id}")->assertStatus(422);
    expect(Plan::query()->whereKey($free->id)->exists())->toBeTrue();

    $paid = Plan::query()->create(['slug' => 'studio', 'name' => 'Studio', 'limits' => PlanLimits::normalize([])]);
    Subscription::query()->create([
        'workspace_id' => $workspace->id,
        'plan_id' => $paid->id,
        'status' => 'active',
        'provider' => 'local',
    ]);

    $this->deleteJson("/api/v1/admin/plans/{$paid->id}")->assertStatus(422);
    expect(Plan::query()->whereKey($paid->id)->exists())->toBeTrue();
});

it('deletes a plan nobody is on', function () {
    ['user' => $admin] = adminTenant();
    Sanctum::actingAs($admin);

    $plan = Plan::query()->create(['slug' => 'studio', 'name' => 'Studio', 'limits' => PlanLimits::normalize([])]);

    $this->deleteJson("/api/v1/admin/plans/{$plan->id}")->assertOk();
    expect(Plan::query()->whereKey($plan->id)->exists())->toBeFalse();
});

it('falls back to the schema default instead of denying an unauthored limit', function () {
    ['user' => $admin, 'workspace' => $workspace] = adminTenant();

    // A plan written before a limit existed: the key is simply absent.
    $plan = Plan::query()->create([
        'slug' => 'legacy',
        'name' => 'Legacy',
        'limits' => ['number_of_sites' => 3],
    ]);
    $workspace->subscription()->update(['plan_id' => $plan->id]);

    $limits = app(PlanLimitService::class);
    $resolved = $limits->limitsFor($workspace->fresh());

    expect($resolved['number_of_sites'])->toBe(3)
        ->and($resolved['storage_mb'])->toBe(PlanLimits::defaults()['storage_mb'])
        // Denying outright is what this used to do, and it locked workspaces
        // out of features their plan never spoke about.
        ->and($limits->allows($workspace->fresh(), 'storage_mb'))->toBeTrue();
});
