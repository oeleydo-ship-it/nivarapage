<?php

use App\Models\Activity;
use App\Models\Media;
use App\Models\Page;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

it('uploads images, sanitizes svg, and records usage', function () {
    Storage::fake('public');
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $upload = $this->withHeaders($headers)
        ->post('/api/v1/media', [
            'file' => UploadedFile::fake()->image('hero.jpg', 40, 30),
            'alt_text' => 'Harbor hero',
        ], $headers);

    $upload->assertCreated()
        ->assertJsonPath('data.filename', 'hero.jpg')
        ->assertJsonPath('data.alt_text', 'Harbor hero')
        ->assertJsonPath('data.mime_type', 'image/jpeg');

    expect($upload->json('data.url'))->toContain('storage/');
    expect($upload->json('data.width'))->toBe(40);
    expect($upload->json('data.height'))->toBe(30);

    $mediaId = $upload->json('data.id');
    $url = $upload->json('data.url');

    $this->withHeaders($headers)
        ->getJson('/api/v1/media?q=Harbor')
        ->assertOk()
        ->assertJsonCount(1, 'data');

    $this->withHeaders($headers)
        ->patchJson('/api/v1/media/'.$mediaId, ['filename' => 'renamed.jpg', 'alt_text' => 'Renamed alt'])
        ->assertOk()
        ->assertJsonPath('data.filename', 'renamed.jpg')
        ->assertJsonPath('data.alt_text', 'Renamed alt');

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Media Site', 'subdomain' => 'mediasite'])
        ->json('data');
    $page = Page::query()->where('site_id', $site['id'])->first();

    $this->withHeaders($headers)->putJson('/api/v1/pages/'.$page->id.'/draft', [
        'content' => [
            'schemaVersion' => 1,
            'sections' => [[
                'id' => 'hero-1',
                'type' => 'hero.image',
                'version' => 1,
                'hidden' => false,
                'props' => ['heading' => 'Hi', 'image' => $url],
            ]],
        ],
    ])->assertOk();

    $this->withHeaders($headers)
        ->getJson('/api/v1/media/'.$mediaId)
        ->assertOk()
        ->assertJsonPath('data.usage.count', 1)
        ->assertJsonPath('data.usage.pages.0.id', $page->id);

    $this->withHeaders($headers)->deleteJson('/api/v1/media/'.$mediaId)->assertOk();
    expect(Media::query()->find($mediaId))->toBeNull();
    expect(Activity::query()->where('action', 'media.deleted')->exists())->toBeTrue();
});

it('rejects unsupported files and scripted svg', function () {
    Storage::fake('public');
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $this->withHeaders($headers)
        ->post('/api/v1/media', [
            'file' => UploadedFile::fake()->create('payload.php', 20, 'text/x-php'),
        ])
        ->assertStatus(422);

    $svg = <<<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)">
  <script>alert(1)</script>
  <rect width="10" height="10" fill="red"/>
</svg>
SVG;

    $response = $this->withHeaders($headers)
        ->post('/api/v1/media', [
            'file' => UploadedFile::fake()->createWithContent('logo.svg', $svg)->mimeType('image/svg+xml'),
        ]);

    $response->assertCreated();
    $path = $response->json('data.path');
    $stored = Storage::disk('public')->get($path);
    expect($stored)->not->toContain('<script');
    expect($stored)->not->toContain('onload');
});

it('isolates media between tenants', function () {
    Storage::fake('public');
    ['user' => $userA, 'workspace' => $workspaceA] = tenant();
    ['user' => $userB, 'workspace' => $workspaceB] = tenant();

    Sanctum::actingAs($userA);
    $mediaId = $this->withHeaders(['X-Workspace-Id' => (string) $workspaceA->id])
        ->post('/api/v1/media', ['file' => UploadedFile::fake()->image('a.jpg', 8, 8)])
        ->json('data.id');

    Sanctum::actingAs($userB);
    $this->withHeaders(['X-Workspace-Id' => (string) $workspaceB->id])
        ->getJson('/api/v1/media/'.$mediaId)
        ->assertStatus(404);

    $this->withHeaders(['X-Workspace-Id' => (string) $workspaceB->id])
        ->deleteJson('/api/v1/media/'.$mediaId)
        ->assertStatus(404);
});

it('uploads background video files and rejects invalid payloads', function () {
    Storage::fake('public');
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $mp4 = "\0\0\0\x18ftypmp42".str_repeat("\0", 48);
    $upload = $this->withHeaders($headers)
        ->post('/api/v1/media', [
            'file' => UploadedFile::fake()->createWithContent('loop.mp4', $mp4)->mimeType('video/mp4'),
        ]);

    $upload->assertCreated()
        ->assertJsonPath('data.filename', 'loop.mp4')
        ->assertJsonPath('data.mime_type', 'video/mp4');
    expect($upload->json('data.url'))->toContain('storage/');

    $this->withHeaders($headers)
        ->post('/api/v1/media', [
            'file' => UploadedFile::fake()->createWithContent('fake.mp4', 'not-a-video')->mimeType('video/mp4'),
        ])
        ->assertStatus(422);
});
