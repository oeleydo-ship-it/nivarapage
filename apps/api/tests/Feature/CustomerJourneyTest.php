<?php

use App\Models\Domain;
use App\Models\User;
use App\Services\Domains\FakeDomainProvider;
use Database\Seeders\TemplateSeeder;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\Sanctum;

it('walks the customer flow from register through a live custom domain', function () {
    $this->seed(TemplateSeeder::class);

    $this->postJson('/api/v1/auth/register', [
        'name' => 'Customer Ada',
        'email' => 'ada-journey@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertCreated();

    $user = User::query()->where('email', 'ada-journey@example.com')->firstOrFail();
    $verifyUrl = URL::temporarySignedRoute('verification.verify', now()->addHour(), [
        'id' => $user->id,
        'hash' => sha1($user->email),
    ]);
    $this->getJson(parse_url($verifyUrl, PHP_URL_PATH).'?'.parse_url($verifyUrl, PHP_URL_QUERY))
        ->assertOk()
        ->assertJsonPath('data.verified', true);

    Sanctum::actingAs($user->fresh());

    $workspaceId = $this->postJson('/api/v1/workspaces', ['name' => 'Ada Studio'])
        ->assertCreated()
        ->json('data.id');

    $headers = ['X-Workspace-Id' => (string) $workspaceId];

    $this->withHeaders($headers)
        ->postJson('/api/v1/billing/change-plan', ['plan' => 'starter'])
        ->assertOk()
        ->assertJsonPath('data.plan.slug', 'starter');

    $templates = $this->withHeaders($headers)
        ->getJson('/api/v1/templates')
        ->assertOk()
        ->json('data');

    $template = collect($templates)->firstWhere('slug', 'avivo') ?? collect($templates)->first();
    expect($template)->not->toBeNull();

    $this->withHeaders($headers)
        ->getJson('/api/v1/subdomains/check?name=adastudio')
        ->assertOk()
        ->assertJsonPath('data.available', true);

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', [
            'name' => 'Ada Studio',
            'subdomain' => 'adastudio',
            'template_id' => $template['id'],
        ])
        ->assertCreated()
        ->json('data');

    $subdomain = collect($site['domains'])->firstWhere('type', 'subdomain')['hostname']
        ?? $site['domains'][0]['hostname'];

    $pages = $this->withHeaders($headers)
        ->getJson('/api/v1/sites/'.$site['id'].'/pages')
        ->assertOk()
        ->json('data');

    $home = collect($pages)->firstWhere('is_homepage', true);
    $detail = $this->withHeaders($headers)
        ->getJson('/api/v1/pages/'.$home['id'])
        ->json('data');

    $content = $detail['draft']['content'];
    $content['sections'][0]['props']['heading'] = 'Ada builds bold brands';
    $content['sections'][] = [
        'id' => 'hero-added',
        'type' => 'hero.centered',
        'version' => 1,
        'hidden' => false,
        'props' => ['heading' => 'New section from the builder'],
    ];

    $this->withHeaders($headers)
        ->putJson('/api/v1/pages/'.$home['id'].'/draft', ['content' => $content])
        ->assertOk();

    $this->withHeaders($headers)
        ->postJson('/api/v1/pages/'.$home['id'].'/publish')
        ->assertOk();

    $published = $this->getJson('/api/v1/public/page?host='.$subdomain.'&path=/')
        ->assertOk()
        ->json('data.page.content');

    expect(collect($published['sections'])->pluck('props.heading')->all())
        ->toContain('Ada builds bold brands')
        ->toContain('New section from the builder');

    $custom = $this->withHeaders($headers)
        ->postJson('/api/v1/sites/'.$site['id'].'/domains', ['hostname' => 'www.ada-studio.test'])
        ->assertCreated()
        ->assertJsonPath('data.provider', 'fake')
        ->json('data');

    FakeDomainProvider::markActive('www.ada-studio.test');

    $this->withHeaders($headers)
        ->postJson('/api/v1/domains/'.$custom['id'].'/verify')
        ->assertOk();

    $domain = Domain::query()->findOrFail($custom['id']);
    expect($domain->ssl_status)->toBe('active');
    expect($domain->status)->toBe('active');

    $this->withHeaders($headers)
        ->postJson('/api/v1/domains/'.$custom['id'].'/primary')
        ->assertOk()
        ->assertJsonPath('data.is_primary', true);

    $this->getJson('/api/v1/public/page?host=www.ada-studio.test&path=/')
        ->assertOk()
        ->assertJsonPath('data.page.content.sections.0.props.heading', 'Ada builds bold brands');
});
