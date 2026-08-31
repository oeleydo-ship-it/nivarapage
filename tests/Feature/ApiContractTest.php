<?php

use App\Models\Domain;
use App\Models\Form;
use App\Models\FormField;
use App\Models\Page;
use App\Models\Site;
use Laravel\Sanctum\Sanctum;

it('registers and logs in a user', function () {
    $register = $this->postJson('/api/v1/auth/register', [
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $register->assertCreated()
        ->assertJsonPath('data.user.email', 'ada@example.com')
        ->assertJsonStructure(['data' => ['token', 'user', 'workspaces']]);

    $login = $this->postJson('/api/v1/auth/login', [
        'email' => 'ada@example.com',
        'password' => 'password123',
    ]);

    $login->assertOk()->assertJsonPath('data.user.email', 'ada@example.com');
});

it('rejects workspace header spoofing', function () {
    ['user' => $userA, 'workspace' => $workspaceA] = tenant();
    ['user' => $userB, 'workspace' => $workspaceB] = tenant();

    Sanctum::actingAs($userA);
    $this->withHeaders(['X-Workspace-Id' => (string) $workspaceB->id])
        ->getJson('/api/v1/sites')
        ->assertForbidden();

    $this->withHeaders(['X-Workspace-Id' => (string) $workspaceA->id])
        ->getJson('/api/v1/sites')
        ->assertOk();
});

it('isolates sites pages and domains between tenants', function () {
    ['user' => $userA, 'workspace' => $workspaceA] = tenant();
    ['user' => $userB, 'workspace' => $workspaceB] = tenant();

    Sanctum::actingAs($userA);
    $siteA = $this->withHeaders(['X-Workspace-Id' => (string) $workspaceA->id])
        ->postJson('/api/v1/sites', ['name' => 'Alpha', 'subdomain' => 'alpha-studio'])
        ->assertCreated()
        ->json('data');

    Sanctum::actingAs($userB);
    $siteB = $this->withHeaders(['X-Workspace-Id' => (string) $workspaceB->id])
        ->postJson('/api/v1/sites', ['name' => 'Beta', 'subdomain' => 'beta-studio'])
        ->assertCreated()
        ->json('data');

    $pageB = Page::query()->where('site_id', $siteB['id'])->first();
    $domainB = Domain::query()->where('site_id', $siteB['id'])->first();

    Sanctum::actingAs($userA);
    $headers = ['X-Workspace-Id' => (string) $workspaceA->id];

    $this->withHeaders($headers)->getJson('/api/v1/sites/'.$siteB['id'])->assertStatus(404);
    $this->withHeaders($headers)->patchJson('/api/v1/sites/'.$siteB['id'], ['name' => 'Hacked'])->assertStatus(404);
    $this->withHeaders($headers)->getJson('/api/v1/pages/'.$pageB->id)->assertStatus(404);
    $this->withHeaders($headers)->patchJson('/api/v1/pages/'.$pageB->id, ['name' => 'Hacked'])->assertStatus(404);
    $this->withHeaders($headers)->deleteJson('/api/v1/domains/'.$domainB->id)->assertStatus(404);
});

it('reserves subdomains and rejects reserved or taken names', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $this->withHeaders($headers)
        ->getJson('/api/v1/subdomains/check?name=www')
        ->assertOk()
        ->assertJsonPath('data.available', false)
        ->assertJsonPath('data.reason', 'reserved');

    $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Studio', 'subdomain' => 'johnstudio'])
        ->assertCreated();

    $this->withHeaders($headers)
        ->getJson('/api/v1/subdomains/check?name=johnstudio')
        ->assertOk()
        ->assertJsonPath('data.available', false)
        ->assertJsonPath('data.reason', 'taken');

    $this->withHeaders($headers)
        ->getJson('/api/v1/subdomains/check?name=newstudio')
        ->assertOk()
        ->assertJsonPath('data.available', true)
        ->assertJsonPath('data.hostname', 'newstudio.sites.example.com');
});

it('does not mutate published content when saving a draft', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Draft Site', 'subdomain' => 'draftsite'])
        ->json('data');

    $page = Page::query()->where('site_id', $site['id'])->where('is_homepage', true)->first();

    $this->withHeaders($headers)
        ->putJson('/api/v1/pages/'.$page->id.'/draft', ['content' => sampleContent('Published copy')])
        ->assertOk();

    $this->withHeaders($headers)->postJson('/api/v1/pages/'.$page->id.'/publish')->assertOk();

    $page->refresh();
    $publishedId = $page->published_revision_id;
    $publishedContent = $page->publishedRevision->content_json;

    $this->withHeaders($headers)
        ->putJson('/api/v1/pages/'.$page->id.'/draft', ['content' => sampleContent('Draft copy')])
        ->assertOk();

    $page->refresh()->load('publishedRevision');
    expect($page->published_revision_id)->toBe($publishedId);
    expect($page->publishedRevision->content_json['sections'][0]['props']['heading'])->toBe('Published copy');
    expect($page->draftRevision->content_json['sections'][0]['props']['heading'])->toBe('Draft copy');
});

it('creates a new revision on publish', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Pub Site', 'subdomain' => 'pubsite'])
        ->json('data');
    $page = Page::query()->where('site_id', $site['id'])->first();

    $before = $page->revisions()->count();
    $this->withHeaders($headers)->putJson('/api/v1/pages/'.$page->id.'/draft', ['content' => sampleContent()]);
    $this->withHeaders($headers)->postJson('/api/v1/pages/'.$page->id.'/publish')->assertOk();

    $page->refresh();
    expect($page->revisions()->count())->toBeGreaterThan($before);
    expect($page->published_revision_id)->not->toBeNull();
    expect($page->published_revision_id)->not->toBe($page->draft_revision_id);
});

it('publishes every page in a multi-page site in one request', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Multi Page Site', 'subdomain' => 'multipage'])
        ->json('data');

    $about = $this->withHeaders($headers)
        ->postJson('/api/v1/sites/'.$site['id'].'/pages', ['name' => 'About', 'slug' => 'about'])
        ->json('data');

    $this->withHeaders($headers)
        ->putJson('/api/v1/pages/'.$about['id'].'/draft', ['content' => sampleContent('About page')])
        ->assertOk();

    $this->withHeaders($headers)
        ->postJson('/api/v1/sites/'.$site['id'].'/publish')
        ->assertOk();

    $pages = Page::query()->where('site_id', $site['id'])->get();
    expect($pages)->toHaveCount(2);
    foreach ($pages as $page) {
        expect($page->status)->toBe('published');
        expect($page->published_revision_id)->not->toBeNull();
        expect($page->draft_revision_id)->not->toBe($page->published_revision_id);
    }
});

it('creates a new revision when restoring history', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Rev Site', 'subdomain' => 'revsite'])
        ->json('data');
    $page = Page::query()->where('site_id', $site['id'])->first();

    $this->withHeaders($headers)->putJson('/api/v1/pages/'.$page->id.'/draft', ['content' => sampleContent('V1')]);
    $this->withHeaders($headers)->postJson('/api/v1/pages/'.$page->id.'/publish');
    $original = $page->fresh()->publishedRevision;

    $this->withHeaders($headers)->putJson('/api/v1/pages/'.$page->id.'/draft', ['content' => sampleContent('V2')]);
    $count = $page->fresh()->revisions()->count();

    $this->withHeaders($headers)
        ->postJson('/api/v1/pages/'.$page->id.'/revisions/'.$original->id.'/restore')
        ->assertOk();

    $page->refresh();
    expect($page->revisions()->count())->toBe($count + 1);
    expect($page->draft_revision_id)->not->toBe($original->id);
    expect($page->draftRevision->content_json['sections'][0]['props']['heading'])->toBe('V1');
});

it('blocks a second site on the free plan', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'One', 'subdomain' => 'onesite'])
        ->assertCreated();

    $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Two', 'subdomain' => 'twosite'])
        ->assertStatus(402);
});

it('uses the fake domain provider to create and report status', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $workspace->subscription->plan->update([
        'limits' => array_merge($workspace->subscription->plan->limits, ['custom_domains' => 2, 'number_of_sites' => 3]),
    ]);

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Dom Site', 'subdomain' => 'domsite'])
        ->json('data');

    $response = $this->withHeaders($headers)
        ->postJson('/api/v1/sites/'.$site['id'].'/domains', ['hostname' => 'www.example.com']);

    $response->assertCreated()->assertJsonPath('data.provider', 'fake');
    expect($response->json('data.provider_reference'))->toStartWith('fake_');

    $status = app(\App\Contracts\DomainProviderInterface::class)->getStatus(Domain::query()->find($response->json('data.id')));
    expect($status['success'])->toBeTrue();
    expect($status['result']['hostname'])->toBe('www.example.com');
});

it('returns 404 for unknown public hosts without leaking tenants', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $this->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->postJson('/api/v1/sites', ['name' => 'Live', 'subdomain' => 'livesite'])
        ->assertCreated();

    $this->getJson('/api/v1/public/resolve?host=unknown.example.com')
        ->assertNotFound()
        ->assertJsonMissing(['livesite'])
        ->assertJsonPath('message', 'Not found.');
});

it('rejects honeypot form submissions', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $site = Site::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);
    $form = Form::factory()->create([
        'workspace_id' => $workspace->id,
        'site_id' => $site->id,
    ]);
    FormField::query()->create([
        'form_id' => $form->id,
        'name' => 'email',
        'label' => 'Email',
        'type' => 'email',
        'required' => true,
        'sort_order' => 0,
    ]);

    $this->postJson('/api/v1/public/forms/'.$form->id.'/submit', [
        'email' => 'person@example.com',
        'website' => 'http://spam.test',
    ])->assertStatus(422);
});
