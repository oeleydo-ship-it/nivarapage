<?php

use App\Models\MailSetting;
use App\Models\PlatformSetting;
use App\Services\Mail\MailSettingsService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

/** @return array<string, string> headers for a super admin */
function adminHeaders(): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $user->forceFill(['is_super_admin' => true])->save();
    Laravel\Sanctum\Sanctum::actingAs($user);

    return ['X-Workspace-Id' => (string) $workspace->id];
}

describe('smtp settings', function () {
    it('starts from the environment and reports nothing stored', function () {
        $headers = adminHeaders();
        // The deployment's own config is snapshotted at boot, so seed the
        // snapshot rather than mail.* which apply() is allowed to overwrite.
        config(['uidesired.mail_env' => ['host' => 'smtp.env.test', 'from_address' => 'env@example.test']]);

        test()->withHeaders($headers)
            ->getJson('/api/v1/admin/mail-settings')
            ->assertOk()
            ->assertJsonPath('data.host', 'smtp.env.test')
            ->assertJsonPath('data.from_address', 'env@example.test');
    });

    it('saves the SMTP server', function () {
        $headers = adminHeaders();

        test()->withHeaders($headers)
            ->putJson('/api/v1/admin/mail-settings', [
                'transport' => 'smtp',
                'host' => 'smtp.mailer.test',
                'port' => 587,
                'encryption' => 'tls',
                'username' => 'postmaster',
                'password' => 'hunter2',
                'from_address' => 'hello@example.test',
                'from_name' => 'Support',
            ])
            ->assertOk()
            ->assertJsonPath('data.host', 'smtp.mailer.test')
            ->assertJsonPath('data.port', 587)
            ->assertJsonPath('data.configured', true)
            ->assertJsonPath('data.password_set', true)
            ->assertJsonPath('data.password_source', 'database');
    });

    it('never returns the password', function () {
        $headers = adminHeaders();
        test()->withHeaders($headers)
            ->putJson('/api/v1/admin/mail-settings', ['host' => 'smtp.mailer.test', 'password' => 'hunter2'])
            ->assertOk();

        $body = test()->withHeaders($headers)->getJson('/api/v1/admin/mail-settings')->assertOk()->getContent();

        expect($body)->not->toContain('hunter2');
        expect(json_decode($body, true)['data'])->not->toHaveKey('password');
    });

    it('encrypts the password at rest', function () {
        $headers = adminHeaders();
        test()->withHeaders($headers)
            ->putJson('/api/v1/admin/mail-settings', ['host' => 'smtp.mailer.test', 'password' => 'hunter2'])
            ->assertOk();

        $raw = (string) DB::table('mail_settings')->orderBy('id')->value('password');
        expect($raw)->not->toBe('hunter2');
        expect($raw)->not->toContain('hunter2');
        expect(MailSetting::current()->password)->toBe('hunter2');
    });

    it('keeps the stored password when the field is omitted', function () {
        $headers = adminHeaders();
        test()->withHeaders($headers)
            ->putJson('/api/v1/admin/mail-settings', ['host' => 'a.test', 'password' => 'hunter2'])
            ->assertOk();

        test()->withHeaders($headers)
            ->putJson('/api/v1/admin/mail-settings', ['host' => 'b.test'])
            ->assertOk()
            ->assertJsonPath('data.password_set', true);

        expect(MailSetting::current()->password)->toBe('hunter2');
    });

    it('clears the password when an empty string is sent', function () {
        $headers = adminHeaders();
        config(['uidesired.mail_env' => ['password' => '']]);
        test()->withHeaders($headers)
            ->putJson('/api/v1/admin/mail-settings', ['host' => 'a.test', 'password' => 'hunter2'])
            ->assertOk();

        test()->withHeaders($headers)
            ->putJson('/api/v1/admin/mail-settings', ['password' => ''])
            ->assertOk()
            ->assertJsonPath('data.password_set', false);
    });

    it('rejects a nonsense port or transport', function () {
        $headers = adminHeaders();

        test()->withHeaders($headers)->putJson('/api/v1/admin/mail-settings', ['port' => 99999])->assertStatus(422);
        test()->withHeaders($headers)->putJson('/api/v1/admin/mail-settings', ['transport' => 'carrier-pigeon'])->assertStatus(422);
        test()->withHeaders($headers)->putJson('/api/v1/admin/mail-settings', ['from_address' => 'not-an-email'])->assertStatus(422);
    });

    it('applies the saved settings to the runtime mail config', function () {
        $headers = adminHeaders();
        test()->withHeaders($headers)
            ->putJson('/api/v1/admin/mail-settings', [
                'transport' => 'smtp',
                'host' => 'smtp.applied.test',
                'port' => 2525,
                'encryption' => 'ssl',
                'from_address' => 'noreply@example.test',
                'from_name' => 'Platform',
            ])
            ->assertOk();

        app(MailSettingsService::class)->apply();

        expect(config('mail.mailers.smtp.host'))->toBe('smtp.applied.test');
        expect(config('mail.mailers.smtp.port'))->toBe(2525);
        // Laravel 11+ reads `scheme`; ssl maps to smtps.
        expect(config('mail.mailers.smtp.scheme'))->toBe('smtps');
        expect(config('mail.from.address'))->toBe('noreply@example.test');
    });

    it('sends a test message and records the result', function () {
        Mail::fake();
        $headers = adminHeaders();
        test()->withHeaders($headers)
            ->putJson('/api/v1/admin/mail-settings', ['transport' => 'array', 'from_address' => 'noreply@example.test'])
            ->assertOk();

        test()->withHeaders($headers)
            ->postJson('/api/v1/admin/mail-settings/test', ['to' => 'operator@example.test'])
            ->assertOk()
            ->assertJsonPath('data.ok', true);

        expect(MailSetting::current()->last_test_status)->toBe('ok');
    });

    it('refuses to send a test without a from address', function () {
        $headers = adminHeaders();
        config(['uidesired.mail_env' => ['from_address' => null]]);
        test()->withHeaders($headers)->putJson('/api/v1/admin/mail-settings', ['transport' => 'array'])->assertOk();

        test()->withHeaders($headers)
            ->postJson('/api/v1/admin/mail-settings/test', ['to' => 'operator@example.test'])
            ->assertStatus(422)
            ->assertJsonPath('data.ok', false);

        expect(MailSetting::current()->last_test_status)->toBe('failed');
    });

    it('requires an address to send the test to', function () {
        $headers = adminHeaders();
        test()->withHeaders($headers)->postJson('/api/v1/admin/mail-settings/test', [])->assertStatus(422);
    });

    it('is closed to non-admins', function () {
        ['user' => $user, 'workspace' => $workspace] = tenant();
        Laravel\Sanctum\Sanctum::actingAs($user);
        $headers = ['X-Workspace-Id' => (string) $workspace->id];

        test()->withHeaders($headers)->getJson('/api/v1/admin/mail-settings')->assertForbidden();
        test()->withHeaders($headers)->putJson('/api/v1/admin/mail-settings', ['host' => 'x.test'])->assertForbidden();
    });
});

describe('platform branding', function () {
    it('falls back to the app name and default tagline', function () {
        test()->getJson('/api/v1/public/branding')
            ->assertOk()
            ->assertJsonPath('data.platform_tagline', 'Website builder')
            ->assertJsonPath('data.logo_url', null)
            ->assertJsonPath('data.platform_domain', 'sites.example.com');
    });

    it('is readable without signing in', function () {
        PlatformSetting::query()->updateOrCreate(['key' => 'platform_name'], ['value' => 'Acme Builder']);

        test()->getJson('/api/v1/public/branding')
            ->assertOk()
            ->assertJsonPath('data.platform_name', 'Acme Builder');
    });

    it('stores an uploaded logo and returns its URL', function () {
        Storage::fake('public');
        $headers = adminHeaders();

        $response = test()->withHeaders($headers)
            ->post('/api/v1/admin/branding/logo', ['file' => UploadedFile::fake()->image('logo.png', 240, 60)])
            ->assertOk();

        expect($response->json('data.logo_url'))->toContain('platform/');
        expect(test()->getJson('/api/v1/public/branding')->json('data.logo_url'))->not->toBeNull();
    });

    it('replaces the previous logo file rather than piling them up', function () {
        Storage::fake('public');
        $headers = adminHeaders();

        test()->withHeaders($headers)->post('/api/v1/admin/branding/logo', ['file' => UploadedFile::fake()->image('a.png', 200, 50)])->assertOk();
        test()->withHeaders($headers)->post('/api/v1/admin/branding/logo', ['file' => UploadedFile::fake()->image('b.png', 200, 50)])->assertOk();

        expect(Storage::disk('public')->files('platform'))->toHaveCount(1);
    });

    it('clears the logo and falls back to the wordmark', function () {
        Storage::fake('public');
        $headers = adminHeaders();
        test()->withHeaders($headers)->post('/api/v1/admin/branding/logo', ['file' => UploadedFile::fake()->image('a.png', 200, 50)])->assertOk();

        test()->withHeaders($headers)->deleteJson('/api/v1/admin/branding/logo')->assertOk();

        expect(test()->getJson('/api/v1/public/branding')->json('data.logo_url'))->toBeNull();
        expect(Storage::disk('public')->files('platform'))->toBeEmpty();
    });

    it('keeps the light and dark logos apart', function () {
        Storage::fake('public');
        $headers = adminHeaders();

        test()->withHeaders($headers)->post('/api/v1/admin/branding/logo', ['file' => UploadedFile::fake()->image('light.png', 200, 50)])->assertOk();
        test()->withHeaders($headers)->post('/api/v1/admin/branding/logo', ['file' => UploadedFile::fake()->image('dark.png', 200, 50), 'variant' => 'dark'])->assertOk();

        $data = test()->getJson('/api/v1/public/branding')->json('data');
        expect($data['logo_url'])->not->toBeNull();
        expect($data['logo_dark_url'])->not->toBeNull();
        expect($data['logo_url'])->not->toBe($data['logo_dark_url']);
    });

    it('rejects a file that is not an image', function () {
        Storage::fake('public');
        $headers = adminHeaders();

        test()->withHeaders($headers)
            ->post('/api/v1/admin/branding/logo', ['file' => UploadedFile::fake()->create('notes.pdf', 10, 'application/pdf')])
            ->assertStatus(422);
    });

    it('strips script out of an uploaded SVG', function () {
        Storage::fake('public');
        $headers = adminHeaders();

        $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><script>alert(1)</script><rect width="10" height="10"/></svg>';
        $file = UploadedFile::fake()->createWithContent('logo.svg', $svg);

        test()->withHeaders($headers)->post('/api/v1/admin/branding/logo', ['file' => $file])->assertOk();

        $stored = Storage::disk('public')->files('platform');
        expect($stored)->toHaveCount(1);
        expect(Storage::disk('public')->get($stored[0]))->not->toContain('<script');
    });

    it('is closed to non-admins', function () {
        Storage::fake('public');
        ['user' => $user, 'workspace' => $workspace] = tenant();
        Laravel\Sanctum\Sanctum::actingAs($user);

        test()->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
            ->post('/api/v1/admin/branding/logo', ['file' => UploadedFile::fake()->image('a.png', 100, 40)])
            ->assertForbidden();
    });

    it('saves the tagline through platform settings', function () {
        $headers = adminHeaders();

        test()->withHeaders($headers)
            ->putJson('/api/v1/admin/settings', ['platform_name' => 'Acme', 'platform_tagline' => 'Sites, fast'])
            ->assertOk()
            ->assertJsonPath('data.platform_tagline', 'Sites, fast');

        test()->getJson('/api/v1/public/branding')
            ->assertOk()
            ->assertJsonPath('data.platform_tagline', 'Sites, fast');
    });
});
