<?php

use App\Support\Hostname;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

it('rejects invalid public hosts without leaking site ids', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);
    $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Harbor', 'subdomain' => 'harbor-sec'])
        ->assertCreated();

    $this->getJson('/api/v1/public/resolve?host='.urlencode('not a host'))
        ->assertNotFound()
        ->assertJsonPath('message', 'Not found.')
        ->assertJsonMissing(['site_id']);

    $this->getJson('/api/v1/public/resolve?host='.urlencode('evil.com/steal'))
        ->assertNotFound();

    $this->getJson('/api/v1/public/resolve?host=harbor-sec.'.config('uidesired.platform_domain'))
        ->assertOk();
});

it('requires a signed preview url', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);
    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Preview Lock', 'subdomain' => 'preview-lock'])
        ->assertCreated()
        ->json('data.id');

    $this->postJson('/api/v1/public/preview?site='.$siteId)
        ->assertForbidden();

    $signed = $this->withHeaders($headers)
        ->postJson("/api/v1/sites/{$siteId}/preview-token")
        ->assertOk()
        ->json('data.token_url');

    $path = parse_url($signed, PHP_URL_PATH).'?'.parse_url($signed, PHP_URL_QUERY);
    $this->post($path)->assertOk();

    // Renderer fetches from API_URL, which often differs from APP_URL (localhost vs 127.0.0.1).
    $this->withServerVariables(['HTTP_HOST' => '127.0.0.1:8000'])
        ->post($path.'&path=%2F')
        ->assertOk()
        ->assertJsonPath('data.site.id', $siteId);
});

it('revokes api tokens after a password reset', function () {
    ['user' => $user] = tenant();
    $user->forceFill(['password' => 'password123'])->save();
    $token = $user->createToken('api')->plainTextToken;

    $this->withToken($token)->getJson('/api/v1/auth/user')->assertOk();

    $resetToken = \Illuminate\Support\Facades\Password::broker()->createToken($user);
    $this->postJson('/api/v1/auth/reset-password', [
        'email' => $user->email,
        'token' => $resetToken,
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ])->assertOk();

    expect($user->tokens()->count())->toBe(0);
    $this->app['auth']->forgetGuards();
    $this->withToken($token)->getJson('/api/v1/auth/user')->assertUnauthorized();
    expect(Hash::check('new-password-123', $user->fresh()->password))->toBeTrue();
});

it('adds security headers and a request id', function () {
    $response = $this->getJson('/api/v1/health');

    $response->assertOk()
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('X-Frame-Options', 'DENY')
        ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    expect($response->headers->get('X-Request-Id'))->not->toBeEmpty();
});

it('rejects php disguised as an image and foreign site_id on upload', function () {
    Storage::fake('public');
    ['user' => $user, 'workspace' => $workspace] = tenant();
    ['user' => $other, 'workspace' => $otherWorkspace] = tenant();
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    Sanctum::actingAs($other);
    $foreignId = $this->withHeaders(['X-Workspace-Id' => (string) $otherWorkspace->id])
        ->postJson('/api/v1/sites', ['name' => 'Other', 'subdomain' => 'other-sec'])
        ->json('data.id');

    Sanctum::actingAs($user);
    $this->withHeaders($headers)
        ->post('/api/v1/media', [
            'file' => UploadedFile::fake()->createWithContent('shell.jpg', '<?php echo 1;')->mimeType('image/jpeg'),
        ])
        ->assertStatus(422);

    $this->withHeaders($headers)
        ->post('/api/v1/media', [
            'file' => UploadedFile::fake()->image('ok.jpg', 8, 8),
            'site_id' => $foreignId,
        ])
        ->assertNotFound();
});

it('rejects malformed custom hostnames', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);
    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Domain Lock', 'subdomain' => 'domain-lock'])
        ->json('data.id');

    $this->withHeaders($headers)
        ->postJson("/api/v1/sites/{$siteId}/domains", ['hostname' => 'not a host'])
        ->assertStatus(422);
});

it('normalizes and validates hostnames', function () {
    expect(Hostname::normalize('WWW.Example.COM:443/path'))->toBe('www.example.com')
        ->and(Hostname::isValid('www.example.com'))->toBeTrue()
        ->and(Hostname::isValid('shop.sites.localhost'))->toBeTrue()
        ->and(Hostname::isValid('not a host'))->toBeFalse()
        ->and(Hostname::normalize('evil.com/steal'))->toBe('evil.com');
});
