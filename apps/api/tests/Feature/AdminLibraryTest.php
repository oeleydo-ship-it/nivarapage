<?php

use App\Models\BlockPreset;
use App\Models\Template;
use App\Services\Ai\FakeAiProvider;
use App\Support\BlockCatalog;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    FakeAiProvider::reset();
    BlockCatalog::flush();
});

it('lets super admins generate a public template with AI', function () {
    ['user' => $admin] = adminTenant();
    Sanctum::actingAs($admin);
    enableAi();

    FakeAiProvider::push(json_encode([
        'sections' => [
            ['type' => 'navbar.simple', 'props' => ['logo' => 'North Clinic']],
            ['type' => 'hero.centered', 'props' => ['heading' => 'Care that feels local', 'description' => 'Family medicine in the city.']],
            ['type' => 'footer.simple', 'props' => ['brand' => 'North Clinic', 'copyright' => '© North Clinic']],
        ],
    ]));

    $created = $this->postJson('/api/v1/admin/ai/generate-template', [
        'name' => 'Clinic starter',
        'prompt' => 'A calm medical clinic website for a neighborhood practice.',
        'category' => 'Healthcare',
    ])
        ->assertCreated()
        ->assertJsonPath('data.template.name', 'Clinic starter')
        ->assertJsonPath('data.template.is_active', true)
        ->json('data.template');

    expect($created['pages'][0]['content_json']['sections'])->toHaveCount(3);

    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);
    $this->withHeaders($headers)
        ->getJson('/api/v1/templates')
        ->assertOk()
        ->assertJsonFragment(['name' => 'Clinic starter']);
});

it('lets super admins generate a public block preset that tenants can insert', function () {
    ['user' => $admin] = adminTenant();
    Sanctum::actingAs($admin);
    enableAi();

    FakeAiProvider::push(json_encode([
        'type' => 'hero.centered',
        'props' => ['heading' => 'Ship faster', 'description' => 'A hero for SaaS teams.', 'buttonLabel' => 'Start free'],
    ]));

    $this->postJson('/api/v1/admin/ai/generate-block', [
        'name' => 'SaaS hero',
        'prompt' => 'A confident SaaS product hero with a start-free button.',
        'type' => 'hero.centered',
    ])
        ->assertCreated()
        ->assertJsonPath('data.preset.name', 'SaaS hero')
        ->assertJsonPath('data.preset.block_type', 'hero.centered')
        ->assertJsonPath('data.preset.is_active', true)
        ->assertJsonPath('data.preset.props.heading', 'Ship faster');

    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);
    $this->withHeaders($headers)
        ->getJson('/api/v1/block-presets')
        ->assertOk()
        ->assertJsonPath('data.0.name', 'SaaS hero')
        ->assertJsonPath('data.0.props.heading', 'Ship faster');
});

it('hides inactive presets from the tenant editor library', function () {
    ['user' => $admin] = adminTenant();
    Sanctum::actingAs($admin);
    $preset = BlockPreset::query()->create([
        'name' => 'Hidden hero',
        'slug' => 'hidden-hero',
        'category' => 'hero',
        'block_type' => 'hero.centered',
        'props' => ['heading' => 'Nope'],
        'is_active' => true,
        'source' => 'ai',
        'created_by' => $admin->id,
    ]);

    $this->patchJson('/api/v1/admin/block-presets/'.$preset->id, ['is_active' => false])
        ->assertOk()
        ->assertJsonPath('data.is_active', false);

    ['user' => $user, 'workspace' => $workspace] = tenant();
    $this->withHeaders(authHeaders($user, $workspace))
        ->getJson('/api/v1/block-presets')
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

it('forbids library generation for regular users', function () {
    ['user' => $user] = tenant();
    Sanctum::actingAs($user);
    enableAi();

    $this->postJson('/api/v1/admin/ai/generate-block', [
        'prompt' => 'A hero for a bakery.',
    ])->assertForbidden();
});

it('lets super admins generate a multi-page editable template with a theme', function () {
    ['user' => $admin] = adminTenant();
    Sanctum::actingAs($admin);
    enableAi();

    FakeAiProvider::push(json_encode([
        'theme' => ['primary' => '#334455'],
        'pages' => [
            [
                'name' => 'Home',
                'slug' => 'home',
                'is_homepage' => true,
                'sections' => [
                    ['type' => 'navbar.simple', 'props' => ['logo' => 'North Clinic']],
                    ['type' => 'hero.centered', 'props' => ['heading' => 'Care that feels local']],
                    ['type' => 'footer.simple', 'props' => ['brand' => 'North Clinic']],
                ],
            ],
            [
                'name' => 'Contact',
                'slug' => 'contact',
                'sections' => [
                    ['type' => 'hero.centered', 'props' => ['heading' => 'Visit us']],
                ],
            ],
        ],
    ]));

    $created = $this->postJson('/api/v1/admin/ai/generate-template', [
        'name' => 'Clinic multi',
        'prompt' => 'A calm medical clinic website for a neighborhood practice with a contact page.',
        'category' => 'Healthcare',
    ])
        ->assertCreated()
        ->json('data.template');

    expect($created['pages'])->toHaveCount(2);
    expect($created['theme_tokens']['primary'])->toBe('#334455');

    $this->patchJson('/api/v1/admin/templates/'.$created['id'], [
        'name' => 'Clinic multi edited',
        'description' => 'Editable starter',
    ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Clinic multi edited')
        ->assertJsonPath('data.description', 'Editable starter');
});
