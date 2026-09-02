<?php

use App\Models\Activity;
use App\Models\AiSetting;
use App\Models\Plan;
use App\Services\Ai\AiChatPayload;
use App\Services\Ai\AiConfig;
use App\Services\Ai\FakeAiProvider;
use App\Support\BlockCatalog;
use App\Support\BlockRegistry;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    FakeAiProvider::reset();
    BlockCatalog::flush();
    config(['ai.api_key' => null]);
});

it('generates a page whose sections all exist in the block catalog', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    enableAi();
    allowAi($workspace);
    $siteId = aiSite($headers);

    FakeAiProvider::push(json_encode([
        'sections' => [
            ['type' => 'navbar.simple', 'props' => ['logo' => 'Dubai Build']],
            ['type' => 'hero.centered', 'props' => ['heading' => 'We build Dubai', 'description' => 'Concrete and glass.']],
            ['type' => 'footer.simple', 'props' => ['copyright' => '© Dubai Build']],
        ],
    ]));

    $content = $this->withHeaders($headers)
        ->postJson('/api/v1/ai/generate-page', [
            'site_id' => $siteId,
            'prompt' => 'A modern website for a construction company in Dubai.',
            'page_name' => 'Home',
            'tone' => 'confident',
        ])
        ->assertOk()
        ->assertJsonPath('data.content.schemaVersion', 1)
        ->assertJsonPath('data.usage.used', 1)
        ->assertJsonPath('data.usage.limit', 25)
        ->json('data.content');

    expect($content['sections'])->toHaveCount(3);
    expect(collect($content['sections'])->pluck('type')->all())
        ->toBe(['navbar.simple', 'hero.centered', 'footer.simple']);

    foreach ($content['sections'] as $section) {
        expect(BlockCatalog::resolveType($section['type']))->not->toBeNull();
        expect($section['id'])->toBeString()->not->toBe('');
        expect($section['version'])->toBeGreaterThanOrEqual(1);
    }

    // Props are merged onto defaults, so untouched keys are still present.
    $hero = collect($content['sections'])->firstWhere('type', 'hero.centered');
    expect($hero['props']['heading'])->toBe('We build Dubai');
    expect($hero['props'])->toHaveKey('description');

    // A blank site is art-directed first: the kits are offered, one is chosen,
    // and the page prompt is then built from that kit's real blocks rather than
    // the dozen generic ones every business used to share.
    $calls = FakeAiProvider::calls();
    expect($calls[0]['system'])->toContain('You are the art director');
    expect($calls[0]['prompt'])->toContain('Kits available');

    expect($calls[1]['prompt'])->toContain('hero.voltera');
    expect($calls[1]['prompt'])->toContain('DESIGN SYSTEM');
    // generated.* stays available, but as the fallback rather than the whole menu.
    expect($calls[1]['prompt'])->toContain('only when the kit has nothing suitable');
});

it('never leaks sample defaults or placeholder text into AI-native blocks', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    enableAi();
    allowAi($workspace);
    $siteId = aiSite($headers);

    FakeAiProvider::push(json_encode([
        'sections' => [[
            'type' => 'generated.hero',
            'props' => [
                'heading' => 'Planning that fits the way you operate',
                'description' => 'Your text here',
                'buttonLabel' => 'Start a conversation',
                'image' => 'A consultant reviewing a practical operations plan',
            ],
        ]],
    ]));

    $hero = $this->withHeaders($headers)
        ->postJson('/api/v1/ai/generate-page', [
            'site_id' => $siteId,
            'prompt' => 'A practical operations consultancy for independent restaurants.',
        ])
        ->assertOk()
        ->json('data.content.sections.0.props');

    expect($hero['heading'])->toBe('Planning that fits the way you operate');
    expect($hero['buttonLabel'])->toBe('Start a conversation');
    expect($hero['description'])->toBe('');
    expect($hero['eyebrow'])->toBe('');
    expect($hero['image'])->toBe('');
    expect($hero['layout'])->toBe('mast');
});

it('accepts AI-authored compositions as fully editable catalog blocks', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    enableAi();
    allowAi($workspace);
    $siteId = aiSite($headers);

    FakeAiProvider::push(json_encode([
        'sections' => [[
            'type' => 'generated.composition',
            'props' => [
                'blockName' => 'Restaurant launch pathway',
                'eyebrow' => 'From idea to opening night',
                'heading' => 'A launch sequence built around service readiness',
                'description' => 'Each stage connects the dining concept, operating plan, and guest experience before the doors open.',
                'layout' => 'asymmetric',
                'visual' => 'rings',
                'items' => [
                    ['label' => '01', 'title' => 'Shape the concept', 'text' => 'Define the menu direction, audience, and service model together.'],
                    ['label' => '02', 'title' => 'Prepare the operation', 'text' => 'Turn the concept into workflows the opening team can rehearse.'],
                    ['label' => '03', 'title' => 'Open with confidence', 'text' => 'Test the guest journey and resolve friction before launch night.'],
                ],
            ],
        ]],
    ]));

    $section = $this->withHeaders($headers)
        ->postJson('/api/v1/ai/generate-page', [
            'site_id' => $siteId,
            'prompt' => 'A launch advisory website for independent restaurants.',
        ])
        ->assertOk()
        ->json('data.content.sections.0');

    expect($section['type'])->toBe('generated.composition');
    expect($section['props']['blockName'])->toBe('Restaurant launch pathway');
    expect($section['props']['items'])->toHaveCount(3);
    expect($section['props']['items'][1]['title'])->toBe('Prepare the operation');
});

it('strips unknown block types and unknown props from model output', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    enableAi();
    allowAi($workspace);
    $siteId = aiSite($headers);

    FakeAiProvider::push(json_encode([
        'sections' => [
            ['type' => 'hero.quantum_portal', 'props' => ['heading' => 'Nope']],
            ['type' => 'hero.centered', 'props' => [
                'heading' => 'Real heading',
                'evilScript' => '<script>alert(1)</script>',
                'madeUpKey' => 'nonsense',
            ]],
            ['props' => ['heading' => 'No type at all']],
        ],
    ]));

    $body = $this->withHeaders($headers)
        ->postJson('/api/v1/ai/generate-page', [
            'site_id' => $siteId,
            'prompt' => 'A landing page for a bakery in Lisbon.',
        ])
        ->assertOk()
        ->json('data');

    expect($body['content']['sections'])->toHaveCount(1);
    expect($body['content']['sections'][0]['type'])->toBe('hero.centered');
    expect($body['content']['sections'][0]['props'])->not->toHaveKey('evilScript');
    expect($body['content']['sections'][0]['props'])->not->toHaveKey('madeUpKey');
    expect($body['report']['dropped_types'])->toContain('hero.quantum_portal');
    expect($body['report']['dropped_props'])->toContain('hero.centered.evilScript');
});

it('repairs fenced json and alias block types', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    enableAi();
    allowAi($workspace);
    $siteId = aiSite($headers);

    FakeAiProvider::push("Sure! Here you go:\n```json\n".json_encode([
        'sections' => [
            ['type' => 'nav.simple', 'props' => ['logo' => 'Aliased']],
            ['type' => 'HERO.CENTERED', 'props' => ['heading' => 'Case insensitive']],
        ],
    ])."\n```\nHope that helps.");

    $sections = $this->withHeaders($headers)
        ->postJson('/api/v1/ai/generate-page', [
            'site_id' => $siteId,
            'prompt' => 'Alias handling for a dental clinic.',
        ])
        ->assertOk()
        ->json('data.content.sections');

    expect(collect($sections)->pluck('type')->all())->toBe(['navbar.simple', 'hero.centered']);
});

it('rejects unusable model output instead of failing with a 500', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    enableAi();
    allowAi($workspace);
    $siteId = aiSite($headers);

    FakeAiProvider::push('I am afraid I cannot do that.');

    $this->withHeaders($headers)
        ->postJson('/api/v1/ai/generate-page', [
            'site_id' => $siteId,
            'prompt' => 'Something the model refuses to answer.',
        ])
        ->assertStatus(422)
        ->assertJsonPath('error', 'ai_invalid_output');

    FakeAiProvider::push(json_encode(['sections' => [['type' => 'not.a.block', 'props' => []]]]));

    $this->withHeaders($headers)
        ->postJson('/api/v1/ai/generate-page', [
            'site_id' => $siteId,
            'prompt' => 'Only invalid block types come back.',
        ])
        ->assertStatus(422)
        ->assertJsonPath('error', 'ai_invalid_output');
});

it('generates a single block forced to the requested type', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    enableAi();
    allowAi($workspace);
    $siteId = aiSite($headers);

    // The model answers with the wrong type; the request pins it to faq.accordion.
    FakeAiProvider::push(json_encode([
        'type' => 'hero.centered',
        'props' => ['heading' => 'Frequently asked questions', 'items' => [
            ['question' => 'Do you deliver?', 'answer' => 'Yes, across the city.'],
        ]],
    ]));

    $section = $this->withHeaders($headers)
        ->postJson('/api/v1/ai/generate-block', [
            'site_id' => $siteId,
            'type' => 'faq.accordion',
            'prompt' => 'Three delivery FAQs for a florist.',
        ])
        ->assertOk()
        ->json('data.section');

    expect($section['type'])->toBe('faq.accordion');
    expect($section['props']['items'][0]['question'])->toBe('Do you deliver?');
});

it('rewrites a single text value and sanitises it', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    enableAi();
    allowAi($workspace);
    $siteId = aiSite($headers);

    FakeAiProvider::push(json_encode(['text' => 'Sharper, clearer copy.']));

    $this->withHeaders($headers)
        ->postJson('/api/v1/ai/rewrite', [
            'site_id' => $siteId,
            'text' => 'some copy that could be better',
            'mode' => 'improve',
        ])
        ->assertOk()
        ->assertJsonPath('data.text', 'Sharper, clearer copy.');
});

it('reports a clear error when the admin has AI disabled', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    enableAi(['enabled' => false]);
    allowAi($workspace);
    $siteId = aiSite($headers);

    $this->withHeaders($headers)
        ->postJson('/api/v1/ai/generate-page', ['site_id' => $siteId, 'prompt' => 'A page for a gym.'])
        ->assertStatus(503)
        ->assertJsonPath('error', 'ai_disabled');

    $this->withHeaders($headers)
        ->getJson('/api/v1/ai/status')
        ->assertOk()
        ->assertJsonPath('data.enabled', false)
        ->assertJsonPath('data.available', false);
});

it('reports a clear error when no provider key is configured', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    enableAi(['api_key' => null]);
    allowAi($workspace);
    $siteId = aiSite($headers);

    $this->withHeaders($headers)
        ->postJson('/api/v1/ai/generate-page', ['site_id' => $siteId, 'prompt' => 'A page for a gym.'])
        ->assertStatus(503)
        ->assertJsonPath('error', 'ai_not_configured');
});

it('surfaces provider failures as a provider error, not a 500', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    enableAi();
    allowAi($workspace);
    $siteId = aiSite($headers);

    FakeAiProvider::pushFailure('Upstream is on fire (key sk-live-shouldnotleak1234567890)');

    $this->withHeaders($headers)
        ->postJson('/api/v1/ai/generate-page', ['site_id' => $siteId, 'prompt' => 'A page for a gym.'])
        ->assertStatus(502)
        ->assertJsonPath('error', 'ai_provider_error')
        ->assertDontSee('sk-live-shouldnotleak');
});

it('returns 402 with used and limit when the AI quota is exhausted', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    enableAi();
    allowAi($workspace, 1);
    $siteId = aiSite($headers);

    FakeAiProvider::push(json_encode(['sections' => [['type' => 'hero.centered', 'props' => ['heading' => 'One']]]]));

    $this->withHeaders($headers)
        ->postJson('/api/v1/ai/generate-page', ['site_id' => $siteId, 'prompt' => 'First generation for a cafe.'])
        ->assertOk();

    $this->withHeaders($headers)
        ->postJson('/api/v1/ai/generate-page', ['site_id' => $siteId, 'prompt' => 'Second generation for a cafe.'])
        ->assertStatus(402)
        ->assertJsonPath('error', 'plan_limit')
        ->assertJsonPath('limit_key', 'ai_generations')
        ->assertJsonPath('used', 1)
        ->assertJsonPath('limit', 1);
});

it('returns 402 when the plan is not entitled to AI at all', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    enableAi();
    $siteId = aiSite($headers);

    // The seeded free plan ships ai_generations = 0.
    $this->withHeaders($headers)
        ->postJson('/api/v1/ai/generate-page', ['site_id' => $siteId, 'prompt' => 'A page for a bookshop.'])
        ->assertStatus(402)
        ->assertJsonPath('limit_key', 'ai_generations');

    $this->withHeaders($headers)
        ->getJson('/api/v1/ai/status')
        ->assertOk()
        ->assertJsonPath('data.entitled', false)
        ->assertJsonPath('data.limit', 0);
});

it('seeds an ai_generations limit on every plan', function () {
    $limits = Plan::query()->pluck('limits', 'slug');

    expect($limits['free']['ai_generations'])->toBe(0);
    expect($limits['starter']['ai_generations'])->toBe(25);
    expect($limits['business']['ai_generations'])->toBe(200);
    expect($limits['agency']['ai_generations'])->toBe(-1);
});

it('audits generations so they appear in the activity screen', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    enableAi();
    allowAi($workspace);
    $siteId = aiSite($headers);

    FakeAiProvider::push(json_encode(['sections' => [['type' => 'hero.centered', 'props' => ['heading' => 'Audited']]]]));
    $this->withHeaders($headers)
        ->postJson('/api/v1/ai/generate-page', ['site_id' => $siteId, 'prompt' => 'Audit trail for a law firm.'])
        ->assertOk();

    FakeAiProvider::push(json_encode(['type' => 'cta.simple', 'props' => ['heading' => 'Call us']]));
    $this->withHeaders($headers)
        ->postJson('/api/v1/ai/generate-block', ['site_id' => $siteId, 'prompt' => 'A call to action.'])
        ->assertOk();

    $actions = Activity::query()->where('workspace_id', $workspace->id)->pluck('action');
    expect($actions)->toContain('ai.page_generated');
    expect($actions)->toContain('ai.block_generated');

    $this->withHeaders($headers)
        ->getJson('/api/v1/activities?action=ai.page_generated')
        ->assertOk()
        ->assertJsonPath('data.0.label', 'AI page generated');
});

it('does not let one tenant generate into another tenant site', function () {
    ['user' => $owner, 'workspace' => $ownerWorkspace] = tenant();
    ['user' => $intruder, 'workspace' => $intruderWorkspace] = tenant();
    enableAi();
    allowAi($ownerWorkspace);
    allowAi($intruderWorkspace);

    Sanctum::actingAs($owner);
    $siteId = test()->withHeaders(['X-Workspace-Id' => (string) $ownerWorkspace->id])
        ->postJson('/api/v1/sites', ['name' => 'Owned', 'subdomain' => 'ownedsite'])
        ->assertCreated()
        ->json('data.id');

    Sanctum::actingAs($intruder);
    FakeAiProvider::push(json_encode(['sections' => [['type' => 'hero.centered', 'props' => ['heading' => 'Stolen']]]]));

    $this->withHeaders(['X-Workspace-Id' => (string) $intruderWorkspace->id])
        ->postJson('/api/v1/ai/generate-page', ['site_id' => $siteId, 'prompt' => 'Try to write into another tenant.'])
        ->assertNotFound();
});

it('keeps AI settings readable and writable only by super admins', function () {
    ['user' => $member, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($member);

    $this->getJson('/api/v1/admin/ai-settings')->assertForbidden();
    $this->putJson('/api/v1/admin/ai-settings', ['enabled' => true])->assertForbidden();
    $this->postJson('/api/v1/admin/ai-settings/test')->assertForbidden();

    ['user' => $admin] = tenant(['is_super_admin' => true]);
    Sanctum::actingAs($admin);

    $this->getJson('/api/v1/admin/ai-settings')
        ->assertOk()
        ->assertJsonPath('data.enabled', false)
        ->assertJsonPath('data.configured', false);
});

it('never returns the api key to the dashboard', function () {
    ['user' => $admin] = tenant(['is_super_admin' => true]);
    Sanctum::actingAs($admin);

    $response = $this->putJson('/api/v1/admin/ai-settings', [
        'enabled' => true,
        'provider' => 'openai',
        'model' => 'gpt-4o-mini',
        'max_tokens' => 3000,
        'temperature' => 0.4,
        'api_key' => 'sk-super-secret-key-1234',
    ])->assertOk();

    $response->assertDontSee('sk-super-secret-key-1234');
    $response->assertJsonPath('data.configured', true);
    $response->assertJsonPath('data.key_source', 'settings');
    $response->assertJsonPath('data.key_hint', '••••1234');
    expect($response->json('data'))->not->toHaveKey('api_key');

    // Stored encrypted, not as plaintext.
    $stored = DB::table('ai_settings')->orderBy('id')->value('api_key');
    expect($stored)->not->toContain('sk-super-secret-key-1234');
    expect(AiSetting::current()->api_key)->toBe('sk-super-secret-key-1234');

    // Omitting the key keeps it; sending "" clears it back to the environment.
    $this->putJson('/api/v1/admin/ai-settings', ['temperature' => 0.9])
        ->assertOk()
        ->assertJsonPath('data.configured', true);

    $this->putJson('/api/v1/admin/ai-settings', ['api_key' => ''])
        ->assertOk()
        ->assertJsonPath('data.configured', false)
        ->assertJsonPath('data.key_source', 'none');
});

it('reports a failed connection test without leaking the key', function () {
    ['user' => $admin] = tenant(['is_super_admin' => true]);
    Sanctum::actingAs($admin);
    enableAi();
    FakeAiProvider::pushFailure('Bad key sk-live-verysecretvalue0987654321');

    $this->postJson('/api/v1/admin/ai-settings/test')
        ->assertStatus(422)
        ->assertJsonPath('data.ok', false)
        ->assertDontSee('sk-live-verysecretvalue');

    $this->postJson('/api/v1/admin/ai-settings/test')->assertStatus(422);

    FakeAiProvider::push('ok');
    $this->postJson('/api/v1/admin/ai-settings/test')
        ->assertOk()
        ->assertJsonPath('data.ok', true)
        ->assertJsonPath('data.status.last_test_status', 'ok');
});

it('exposes a block catalog that matches the shipped registry', function () {
    expect(BlockCatalog::loaded())->toBeTrue();
    expect(BlockCatalog::types())->toContain('hero.centered', 'faq.accordion', 'footer.multi_column', 'content.skills', 'form.appointment', 'generated.hero', 'generated.nav');
    expect(BlockCatalog::defaultProps('hero.centered'))->not->toBe([]);
    expect(BlockCatalog::resolveType('nav.simple'))->toBe('navbar.simple');
    expect(BlockCatalog::resolveType('totally.made.up'))->toBeNull();
    expect(BlockCatalog::generatedTypes())->toContain('generated.hero', 'generated.nav', 'generated.form');
    expect(BlockRegistry::types())->toBe(BlockCatalog::types());
});

it('shares generated nav and footer chrome across AI pages', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    enableAi();
    allowAi($workspace);
    $siteId = aiSite($headers);

    FakeAiProvider::push(json_encode([
        'pages' => [
            [
                'name' => 'Home',
                'slug' => 'home',
                'is_homepage' => true,
                'sections' => [
                    ['type' => 'generated.nav', 'props' => ['logo' => 'Atelier']],
                    ['type' => 'generated.hero', 'props' => ['heading' => 'Original work', 'layout' => 'cut', 'surface' => 'ink']],
                    ['type' => 'generated.footer', 'props' => ['copyright' => '© Atelier']],
                ],
            ],
            [
                'name' => 'About',
                'slug' => 'about',
                'is_homepage' => false,
                'sections' => [
                    ['type' => 'generated.story', 'props' => ['heading' => 'The studio']],
                ],
            ],
        ],
    ]));

    $body = $this->withHeaders($headers)
        ->postJson('/api/v1/ai/generate-page', [
            'site_id' => $siteId,
            'prompt' => 'A small design studio website with an about page.',
        ])
        ->assertOk()
        ->json('data');

    $about = collect($body['pages'])->firstWhere('slug', 'about');
    expect(collect($about['content']['sections'])->pluck('type')->all())
        ->toBe(['generated.nav', 'generated.story', 'generated.footer']);
});

it('lets the model return a multi-page sitemap with a theme', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    enableAi();
    allowAi($workspace);
    $siteId = aiSite($headers);

    FakeAiProvider::push(json_encode([
        'theme' => ['primary' => '#112233', 'headingFont' => 'Georgia, serif'],
        'pages' => [
            [
                'name' => 'Home',
                'slug' => 'home',
                'is_homepage' => true,
                'sections' => [
                    ['type' => 'navbar.simple', 'props' => ['logo' => 'Harbor Bakery', 'links' => [
                        ['label' => 'Home', 'url' => '/'],
                        ['label' => 'Menu', 'url' => '/menu'],
                    ]]],
                    ['type' => 'hero.centered', 'props' => ['heading' => 'Fresh at dawn']],
                    ['type' => 'footer.simple', 'props' => ['brand' => 'Harbor Bakery']],
                ],
            ],
            [
                'name' => 'Menu',
                'slug' => 'menu',
                'is_homepage' => false,
                'sections' => [
                    ['type' => 'hero.centered', 'props' => ['heading' => 'This week']],
                ],
            ],
        ],
    ]));

    $body = $this->withHeaders($headers)
        ->postJson('/api/v1/ai/generate-page', [
            'site_id' => $siteId,
            'prompt' => 'A neighborhood bakery website with a menu page.',
        ])
        ->assertOk()
        ->json('data');

    expect($body['pages'])->toHaveCount(2);
    expect($body['theme']['primary'])->toBe('#112233');
    expect(collect($body['pages'])->pluck('slug')->all())->toBe(['home', 'menu']);

    $menu = collect($body['pages'])->firstWhere('slug', 'menu');
    expect(collect($menu['content']['sections'])->pluck('type')->all())
        ->toContain('navbar.simple', 'hero.centered', 'footer.simple');

    $this->withHeaders($headers)
        ->postJson('/api/v1/ai/apply-generation', [
            'site_id' => $siteId,
            'pages' => $body['pages'],
            'theme' => $body['theme'],
        ])
        ->assertOk()
        ->assertJsonPath('data.skipped', []);

    $pages = $this->withHeaders($headers)
        ->getJson('/api/v1/sites/'.$siteId.'/pages')
        ->assertOk()
        ->json('data');

    expect(collect($pages)->pluck('slug')->all())->toContain('home', 'menu');

    $theme = $this->withHeaders($headers)
        ->getJson('/api/v1/sites/'.$siteId.'/theme')
        ->assertOk()
        ->json('data');

    expect($theme['tokens']['primary'] ?? $theme['primary'] ?? null)->toBe('#112233');
});

it('inserts multiple catalog blocks when the model returns a section set', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    enableAi();
    allowAi($workspace);
    $siteId = aiSite($headers);

    FakeAiProvider::push(json_encode([
        'sections' => [
            ['type' => 'hero.centered', 'props' => ['heading' => 'Welcome']],
            ['type' => 'cta.simple', 'props' => ['heading' => 'Book a table']],
        ],
    ]));

    $body = $this->withHeaders($headers)
        ->postJson('/api/v1/ai/generate-block', [
            'site_id' => $siteId,
            'prompt' => 'A hero and a booking call to action.',
        ])
        ->assertOk()
        ->json('data');

    expect($body['sections'])->toHaveCount(2);
    expect($body['section']['type'])->toBe('hero.centered');
    expect(collect($body['sections'])->pluck('type')->all())->toBe(['hero.centered', 'cta.simple']);
});

it('lists gpt-5.6, opus 5 and kimi k2.5 as selectable models', function () {
    ['user' => $admin] = tenant(['is_super_admin' => true]);
    Sanctum::actingAs($admin);

    $this->getJson('/api/v1/admin/ai-settings')
        ->assertOk()
        ->assertJsonFragment(['id' => 'gpt-5.6'])
        ->assertJsonFragment(['id' => 'claude-opus-5'])
        ->assertJsonFragment(['id' => 'kimi-k2.5']);

    $this->putJson('/api/v1/admin/ai-settings', [
        'provider' => 'kimi',
        'model' => 'kimi-k2.5',
        'base_url' => 'https://api.moonshot.ai/v1',
    ])
        ->assertOk()
        ->assertJsonPath('data.provider', 'kimi')
        ->assertJsonPath('data.model', 'kimi-k2.5')
        ->assertJsonPath('data.base_url', 'https://api.moonshot.ai/v1');

    $this->putJson('/api/v1/admin/ai-settings', [
        'provider' => 'anthropic',
        'model' => 'claude-opus-5',
    ])
        ->assertOk()
        ->assertJsonPath('data.provider', 'anthropic')
        ->assertJsonPath('data.model', 'claude-opus-5');
});

it('builds chat payloads that newer models will accept', function () {
    $openai = new AiConfig(true, 'openai', 'gpt-5.6', 'https://api.openai.com/v1', 'sk-test', 4000, 0.7, 30);
    $gpt = AiChatPayload::openaiCompatible($openai, 'sys', 'user', ['json' => true, 'max_tokens' => 8000]);
    expect($gpt)->toHaveKey('max_completion_tokens', 8000)
        ->not->toHaveKey('max_tokens')
        ->not->toHaveKey('temperature')
        ->and($gpt['response_format']['type'])->toBe('json_object');

    $kimi = new AiConfig(true, 'kimi', 'kimi-k2.5', 'https://api.moonshot.ai/v1', 'sk-test', 4000, 0.7, 30);
    $k25 = AiChatPayload::openaiCompatible($kimi, 'sys', 'user', ['json' => true]);
    expect($k25['thinking']['type'])->toBe('disabled')
        ->and($k25)->toHaveKey('max_tokens')
        ->and($k25)->toHaveKey('temperature');

    $k3cfg = new AiConfig(true, 'kimi', 'kimi-k3', 'https://api.moonshot.ai/v1', 'sk-test', 4000, 0.7, 30);
    $k3 = AiChatPayload::openaiCompatible($k3cfg, 'sys', 'user', ['max_tokens' => 8000]);
    expect($k3)->toHaveKey('max_completion_tokens', 8000)
        ->not->toHaveKey('temperature')
        // Low: the budget is shared between thinking and writing, and what is
        // wanted here is JSON built from a catalogue already in the prompt.
        ->and($k3['reasoning_effort'])->toBe('low');

    $opus = new AiConfig(true, 'anthropic', 'claude-opus-5', 'https://api.anthropic.com', 'sk-test', 4000, 0.7, 30);
    $body = AiChatPayload::anthropic($opus, 'sys', 'user', ['max_tokens' => 4000]);
    expect($body['max_tokens'])->toBeGreaterThanOrEqual(16000)
        ->and($body)->not->toHaveKey('temperature');
});

it('handles a chat turn that inserts a block and another that updates the theme', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    enableAi();
    allowAi($workspace);
    $siteId = aiSite($headers);

    FakeAiProvider::push(json_encode([
        'action' => 'insert_blocks',
        'message' => 'I added a FAQ about hosting.',
        'sections' => [
            ['type' => 'faq.accordion', 'props' => ['heading' => 'Hosting questions', 'items' => [
                ['question' => 'Do you host email?', 'answer' => 'Yes, with the web hosting plan.'],
            ]]],
        ],
    ]));

    $blockTurn = $this->withHeaders($headers)
        ->postJson('/api/v1/ai/chat', [
            'site_id' => $siteId,
            'page_name' => 'Home',
            'page_slug' => 'home',
            'messages' => [['role' => 'user', 'content' => 'Add a FAQ about hosting and email.']],
        ])
        ->assertOk()
        ->json('data');

    expect($blockTurn['action'])->toBe('insert_blocks');
    expect($blockTurn['sections'][0]['type'])->toBe('faq.accordion');
    expect($blockTurn['message'])->toContain('FAQ');

    FakeAiProvider::push(json_encode([
        'action' => 'update_theme',
        'message' => 'I switched the brand to navy and gold.',
        'theme' => ['primary' => '#0f172a', 'accent' => '#d4af37'],
    ]));

    $themeTurn = $this->withHeaders($headers)
        ->postJson('/api/v1/ai/chat', [
            'site_id' => $siteId,
            'messages' => [
                ['role' => 'user', 'content' => 'Add a FAQ about hosting and email.'],
                ['role' => 'assistant', 'content' => 'I added a FAQ about hosting.'],
                ['role' => 'user', 'content' => 'Make the theme navy and gold.'],
            ],
        ])
        ->assertOk()
        ->json('data');

    expect($themeTurn['action'])->toBe('update_theme');
    expect($themeTurn['theme']['primary'])->toBe('#0f172a');
    expect($themeTurn['theme']['accent'])->toBe('#d4af37');
    expect($themeTurn['pages'])->toBe([]);
});

it('streams live planning, page, and block events for a multi-page website', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    enableAi();
    allowAi($workspace);
    $siteId = aiSite($headers);

    FakeAiProvider::push(json_encode([
        'action' => 'apply_site',
        'message' => 'I built a complete two-page website.',
        'theme' => ['primary' => '#4f46e5'],
        'pages' => [
            [
                'name' => 'Home',
                'slug' => 'home',
                'is_homepage' => true,
                'sections' => [
                    ['type' => 'generated.nav', 'props' => ['logo' => 'Atlas']],
                    ['type' => 'generated.hero', 'props' => ['heading' => 'Move work forward']],
                    ['type' => 'generated.footer', 'props' => ['copyright' => '© Atlas']],
                ],
            ],
            [
                'name' => 'About',
                'slug' => 'about',
                'is_homepage' => false,
                'sections' => [
                    ['type' => 'generated.story', 'props' => ['heading' => 'Our story']],
                ],
            ],
        ],
    ]));

    $response = $this->withHeaders($headers)
        ->post('/api/v1/ai/chat-stream', [
            'site_id' => $siteId,
            'page_name' => 'Home',
            'page_slug' => 'home',
            'is_homepage' => true,
            'generation_mode' => 'full_site',
            'requested_pages' => 2,
            'messages' => [[
                'role' => 'user',
                'content' => 'Build a polished website with Home and About pages.',
            ]],
        ]);

    $response->assertOk();

    $events = collect(preg_split('/\r?\n/', trim($response->streamedContent())))
        ->filter()
        ->map(fn (string $line) => json_decode($line, true, flags: JSON_THROW_ON_ERROR));
    $types = $events->pluck('type');

    expect($types->all())
        ->toContain('start', 'progress', 'plan', 'page', 'block', 'result', 'done');
    expect($events->where('type', 'page'))->toHaveCount(2);
    expect($events->where('type', 'block'))->toHaveCount(6);
    expect($events->firstWhere('type', 'plan')['action'])->toBe('apply_site');
    expect($events->firstWhere('type', 'result')['data']['pages'])->toHaveCount(2);
    expect($events->last()['progress'])->toBe(100);

    // [0] is art direction for the blank canvas; [1] is the build itself.
    $prompt = FakeAiProvider::calls()[1]['prompt'];
    expect($prompt)->toContain('Generation mode: Full website.');
    expect($prompt)->toContain('Requested sitemap size: 2 pages');
});
