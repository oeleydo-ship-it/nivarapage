<?php

use App\Models\GoogleAuthSetting;
use App\Models\User;
use App\Services\GoogleAuthService;
use App\Services\GoogleAuthSettingsService;
use App\Services\WorkspaceService;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;

function googleSettings(array $overrides = []): GoogleAuthSettingsService
{
    $service = app(GoogleAuthSettingsService::class);
    $service->update(array_merge([
        'enabled' => true,
        'client_id' => 'test-client.apps.googleusercontent.com',
        'client_secret' => 'GOCSPX-test-secret-value',
    ], $overrides));

    return $service;
}

it('keeps google settings readable and writable only by super admins', function () {
    ['user' => $member] = tenant();
    Sanctum::actingAs($member);

    $this->getJson('/api/v1/admin/google-auth')->assertForbidden();
    $this->putJson('/api/v1/admin/google-auth', ['enabled' => true])->assertForbidden();
    $this->postJson('/api/v1/admin/google-auth/test')->assertForbidden();

    ['user' => $admin] = tenant(['is_super_admin' => true]);
    Sanctum::actingAs($admin);

    $this->getJson('/api/v1/admin/google-auth')
        ->assertOk()
        ->assertJsonPath('data.configured', false)
        ->assertJsonPath('data.allow_registration', true);
});

it('never returns the client secret to the dashboard', function () {
    ['user' => $admin] = tenant(['is_super_admin' => true]);
    Sanctum::actingAs($admin);

    $response = $this->putJson('/api/v1/admin/google-auth', [
        'enabled' => true,
        'client_id' => 'test-client.apps.googleusercontent.com',
        'client_secret' => 'GOCSPX-super-secret-value',
    ])->assertOk();

    expect($response->getContent())->not->toContain('GOCSPX-super-secret-value');

    $response->assertJsonPath('data.configured', true)
        ->assertJsonPath('data.client_secret_configured', true)
        ->assertJsonPath('data.client_secret_source', 'settings');
});

it('clears a stored secret back to the environment value', function () {
    ['user' => $admin] = tenant(['is_super_admin' => true]);
    Sanctum::actingAs($admin);
    config(['services.google.client_secret' => 'env-secret-value']);

    $this->putJson('/api/v1/admin/google-auth', ['client_secret' => 'GOCSPX-stored'])
        ->assertOk()
        ->assertJsonPath('data.client_secret_source', 'settings');

    $this->putJson('/api/v1/admin/google-auth', ['client_secret' => ''])
        ->assertOk()
        ->assertJsonPath('data.client_secret_source', 'env');
});

it('drives the public google status from the admin toggle', function () {
    config(['services.google.client_id' => null, 'services.google.client_secret' => null]);
    googleSettings();

    $this->getJson('/api/v1/auth/google')
        ->assertOk()
        ->assertJsonPath('data.enabled', true);

    GoogleAuthSetting::current()->update(['enabled' => false]);

    // Credentials are present but the super admin turned the button off.
    $this->getJson('/api/v1/auth/google')
        ->assertOk()
        ->assertJsonPath('data.enabled', false);

    $this->getJson('/api/v1/auth/google/redirect')->assertStatus(422);
});

it('builds the authorization url from the stored credentials', function () {
    googleSettings(['prompt' => 'consent', 'redirect_uri' => 'https://app.test/api/v1/auth/google/callback']);

    $url = $this->getJson('/api/v1/auth/google/redirect')
        ->assertOk()
        ->json('data.url');

    expect($url)->toContain('client_id=test-client.apps.googleusercontent.com')
        ->toContain('prompt=consent')
        ->toContain(urlencode('https://app.test/api/v1/auth/google/callback'));
});

it('refuses google accounts outside the allowed domains', function () {
    googleSettings(['allowed_domains' => 'acme.com']);

    $profile = [
        'id' => 'google-1',
        'email' => 'ada@other.com',
        'name' => 'Ada',
        'avatar' => null,
        'email_verified' => true,
    ];

    expect(fn () => app(GoogleAuthService::class)->loginOrRegister($profile, app(WorkspaceService::class)))
        ->toThrow(RuntimeException::class);

    expect(User::query()->where('email', 'ada@other.com')->exists())->toBeFalse();
});

it('refuses to create an account when google signup is turned off', function () {
    googleSettings(['allow_registration' => false]);

    $profile = [
        'id' => 'google-2',
        'email' => 'newcomer@example.com',
        'name' => 'Newcomer',
        'avatar' => null,
        'email_verified' => true,
    ];

    expect(fn () => app(GoogleAuthService::class)->loginOrRegister($profile, app(WorkspaceService::class)))
        ->toThrow(RuntimeException::class);

    expect(User::query()->where('email', 'newcomer@example.com')->exists())->toBeFalse();
});

it('reads invalid_grant from google as a healthy credential check', function () {
    ['user' => $admin] = tenant(['is_super_admin' => true]);
    Sanctum::actingAs($admin);
    googleSettings();

    Http::fake([
        'oauth2.googleapis.com/token' => Http::response(['error' => 'invalid_grant'], 400),
    ]);

    $this->postJson('/api/v1/admin/google-auth/test')
        ->assertOk()
        ->assertJsonPath('data.ok', true);

    expect(GoogleAuthSetting::current()->last_test_status)->toBe('ok');
});

it('reports invalid_client from google as a failed credential check', function () {
    ['user' => $admin] = tenant(['is_super_admin' => true]);
    Sanctum::actingAs($admin);
    googleSettings();

    Http::fake([
        'oauth2.googleapis.com/token' => Http::response(['error' => 'invalid_client'], 401),
    ]);

    $this->postJson('/api/v1/admin/google-auth/test')
        ->assertStatus(422)
        ->assertJsonPath('data.ok', false);

    expect(GoogleAuthSetting::current()->last_test_status)->toBe('failed');
});
