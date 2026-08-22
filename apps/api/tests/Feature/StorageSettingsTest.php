<?php

use App\Models\StorageSetting;
use App\Services\Storage\StorageSettingsService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

it('keeps storage settings readable and writable only by super admins', function () {
    ['user' => $member] = tenant();
    Sanctum::actingAs($member);

    $this->getJson('/api/v1/admin/storage-settings')->assertForbidden();
    $this->putJson('/api/v1/admin/storage-settings', ['provider' => 'aws_s3'])->assertForbidden();
    $this->postJson('/api/v1/admin/storage-settings/test')->assertForbidden();

    ['user' => $admin] = tenant(['is_super_admin' => true]);
    Sanctum::actingAs($admin);

    $this->getJson('/api/v1/admin/storage-settings')
        ->assertOk()
        ->assertJsonPath('data.provider', 'local')
        ->assertJsonPath('data.configured', true)
        ->assertJsonPath('data.disk', 'public');
});

it('never returns storage secrets to the dashboard', function () {
    ['user' => $admin] = tenant(['is_super_admin' => true]);
    Sanctum::actingAs($admin);

    $response = $this->putJson('/api/v1/admin/storage-settings', [
        'provider' => 'digitalocean',
        'bucket' => 'uidesired-media',
        'region' => 'nyc3',
        'public_url' => 'https://uidesired-media.nyc3.cdn.digitaloceanspaces.com',
        'access_key_id' => 'DOKEY1234ABCD',
        'secret_access_key' => 'super-secret-do-key-value',
    ])->assertOk();

    $response->assertDontSee('super-secret-do-key-value');
    $response->assertDontSee('DOKEY1234ABCD');
    $response->assertJsonPath('data.provider', 'digitalocean');
    $response->assertJsonPath('data.configured', true);
    $response->assertJsonPath('data.key_source', 'settings');
    $response->assertJsonPath('data.key_hint', '••••ABCD');
    $response->assertJsonPath('data.bucket', 'uidesired-media');
    $response->assertJsonPath('data.public_url', 'https://uidesired-media.nyc3.cdn.digitaloceanspaces.com');
    expect($response->json('data'))->not->toHaveKey('access_key_id');
    expect($response->json('data'))->not->toHaveKey('secret_access_key');

    $storedKey = DB::table('storage_settings')->orderBy('id')->value('access_key_id');
    $storedSecret = DB::table('storage_settings')->orderBy('id')->value('secret_access_key');
    expect($storedKey)->not->toContain('DOKEY1234ABCD');
    expect($storedSecret)->not->toContain('super-secret-do-key-value');
    expect(StorageSetting::current()->access_key_id)->toBe('DOKEY1234ABCD');
    expect(StorageSetting::current()->secret_access_key)->toBe('super-secret-do-key-value');

    $this->putJson('/api/v1/admin/storage-settings', ['region' => 'sfo3'])
        ->assertOk()
        ->assertJsonPath('data.configured', true)
        ->assertJsonPath('data.region', 'sfo3');

    $this->putJson('/api/v1/admin/storage-settings', [
        'access_key_id' => '',
        'secret_access_key' => '',
    ])
        ->assertOk()
        ->assertJsonPath('data.key_source', 'none');
});

it('tests the local public disk connection', function () {
    Storage::fake('public');
    ['user' => $admin] = tenant(['is_super_admin' => true]);
    Sanctum::actingAs($admin);

    $this->postJson('/api/v1/admin/storage-settings/test')
        ->assertOk()
        ->assertJsonPath('data.ok', true)
        ->assertJsonPath('data.status.last_test_status', 'ok');
});

it('routes new media uploads through the configured storage disk', function () {
    Storage::fake('public');
    ['user' => $admin, 'workspace' => $workspace] = tenant(['is_super_admin' => true]);
    Sanctum::actingAs($admin);

    $this->putJson('/api/v1/admin/storage-settings', [
        'provider' => 'local',
    ])->assertOk();

    expect(app(StorageSettingsService::class)->activeDisk())->toBe('public');

    $upload = $this->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->post('/api/v1/media', [
            'file' => UploadedFile::fake()->image('hero.jpg', 20, 20),
        ]);

    $upload->assertCreated()
        ->assertJsonPath('data.disk', 'public');
    expect($upload->json('data.url'))->toContain('storage/');
});

it('rejects incomplete external storage configuration on test', function () {
    ['user' => $admin] = tenant(['is_super_admin' => true]);
    Sanctum::actingAs($admin);

    $this->putJson('/api/v1/admin/storage-settings', [
        'provider' => 'aws_s3',
        'bucket' => 'only-bucket',
    ])->assertOk();

    $this->postJson('/api/v1/admin/storage-settings/test')
        ->assertStatus(422)
        ->assertJsonPath('data.ok', false);
});

it('configures wasabi with regional endpoints and public urls', function () {
    ['user' => $admin] = tenant(['is_super_admin' => true]);
    Sanctum::actingAs($admin);

    $response = $this->putJson('/api/v1/admin/storage-settings', [
        'provider' => 'wasabi',
        'bucket' => 'uidesired-media',
        'region' => 'eu-central-1',
        'access_key_id' => 'WASABIKEY99',
        'secret_access_key' => 'wasabi-secret-value',
    ])->assertOk();

    $response
        ->assertJsonPath('data.provider', 'wasabi')
        ->assertJsonPath('data.configured', true)
        ->assertJsonPath('data.endpoint', 'https://s3.eu-central-1.wasabisys.com')
        ->assertJsonPath('data.public_url', 'https://uidesired-media.s3.eu-central-1.wasabisys.com')
        ->assertJsonPath('data.regions.wasabi.0', 'us-east-1');

    expect(StorageSettingsService::wasabiEndpointForRegion('us-east-1'))->toBe('https://s3.wasabisys.com');
    expect(app(StorageSettingsService::class)->activeDisk())->toBe(StorageSettingsService::DISK);
});
