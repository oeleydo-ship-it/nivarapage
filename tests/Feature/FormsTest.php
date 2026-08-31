<?php

use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\User;
use App\Notifications\FormSubmissionReceived;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;

it('seeds default forms and accepts a contact submission', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    Notification::fake();

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Form Site', 'subdomain' => 'formsite'])
        ->assertCreated()
        ->json('data');

    $forms = $this->withHeaders($headers)
        ->getJson('/api/v1/sites/'.$site['id'].'/forms')
        ->assertOk()
        ->json('data');

    expect($forms)->toHaveCount(4);
    $contact = collect($forms)->firstWhere('type', 'contact');
    expect($contact['fields'])->not->toBeEmpty();

    $pageId = $this->withHeaders($headers)
        ->getJson('/api/v1/sites/'.$site['id'].'/pages')
        ->json('data.0.id');

    $this->getJson('/api/v1/public/forms/'.$contact['id'])
        ->assertOk()
        ->assertJsonMissing(['recipients'])
        ->assertJsonPath('data.turnstile_enabled', false);

    $this->postJson('/api/v1/public/forms/'.$contact['id'].'/submit', [
        'name' => 'Ada',
        'email' => 'ada@example.com',
        'message' => 'Hello there',
        'website' => '',
        'page_id' => $pageId,
    ])->assertCreated();

    $inbox = $this->withHeaders($headers)
        ->getJson('/api/v1/form-submissions')
        ->assertOk()
        ->json('data');

    expect($inbox[0]['name'])->toBe('Ada');
    expect($inbox[0]['email'])->toBe('ada@example.com');
    expect($inbox[0]['form'])->toBe('Contact');
    expect($inbox[0]['website'])->toBe('Form Site');
    expect($inbox[0]['status'])->toBe('new');

    $this->withHeaders($headers)
        ->patchJson('/api/v1/form-submissions/'.$inbox[0]['id'], ['status' => 'read'])
        ->assertOk()
        ->assertJsonPath('data.status', 'read');

    $csv = $this->withHeaders($headers)
        ->get('/api/v1/form-submissions/export')
        ->assertOk();
    expect($csv->streamedContent())->toContain('Name,Email,Form,Website,Page,Submitted,Status');
    expect($csv->streamedContent())->toContain('Ada');

    Notification::assertSentTo($user, FormSubmissionReceived::class);
});

it('connects template form blocks so submissions land in the inbox', function () {
    $this->seed(TemplateSeeder::class);
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = authHeaders($user, $workspace);

    Notification::fake();

    $template = \App\Models\Template::query()->where('slug', 'restaurant')->firstOrFail();
    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', [
            'name' => 'Bound Forms',
            'subdomain' => 'bound-forms',
            'template_id' => $template->id,
        ])
        ->assertCreated()
        ->json('data.id');

    $contact = Form::query()->where('site_id', $siteId)->where('type', 'contact')->firstOrFail();
    $pages = $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/pages")
        ->assertOk()
        ->json('data');

    $formSection = collect($pages)
        ->flatMap(fn ($page) => $page['draft']['content']['sections'] ?? [])
        ->firstWhere('type', 'form.contact');

    expect($formSection)->not->toBeNull()
        ->and((string) $formSection['props']['formId'])->toBe((string) $contact->id);

    $this->postJson('/api/v1/public/forms/'.$contact->id.'/submit', [
        'name' => 'Sam',
        'email' => 'sam@example.com',
        'message' => 'Need a site',
        'website' => '',
    ])->assertCreated();

    $inbox = $this->withHeaders($headers)
        ->getJson('/api/v1/form-submissions')
        ->assertOk()
        ->json('data');

    expect($inbox[0]['name'])->toBe('Sam')
        ->and($inbox[0]['email'])->toBe('sam@example.com')
        ->and($inbox[0]['form'])->toBe('Contact')
        ->and($inbox[0]['payload']['message'])->toBe('Need a site');

    Notification::assertSentTo($user, FormSubmissionReceived::class);
});

it('wires Cinder service requests to the inbox and email notification', function () {
    $this->seed(TemplateSeeder::class);
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = authHeaders($user, $workspace);
    Notification::fake();

    $template = \App\Models\Template::query()->where('slug', 'cinder-row')->firstOrFail();
    $siteId = $this->withHeaders($headers)->postJson('/api/v1/sites', [
        'name' => 'Cinder Forms',
        'subdomain' => 'cinder-forms',
        'template_id' => $template->id,
    ])->assertCreated()->json('data.id');

    $contact = Form::query()->where('site_id', $siteId)->where('type', 'contact')->with('fields')->firstOrFail();
    expect($contact->fields->pluck('name')->all())
        ->toContain('name', 'email', 'phone', 'postcode', 'service', 'message');

    $pages = $this->withHeaders($headers)->getJson("/api/v1/sites/{$siteId}/pages")->assertOk()->json('data');
    $section = collect($pages)->flatMap(fn ($page) => $page['draft']['content']['sections'] ?? [])->firstWhere('type', 'form.cinder');
    expect($section)->not->toBeNull()
        ->and((string) $section['props']['formId'])->toBe((string) $contact->id);

    $this->postJson('/api/v1/public/forms/'.$contact->id.'/submit', [
        'name' => 'Robin Smith',
        'phone' => '020 7000 1234',
        'email' => 'robin@example.com',
        'postcode' => 'N1 9AA',
        'service' => 'Boiler repair',
        'message' => 'Pressure drops every morning.',
        'website' => '',
    ])->assertCreated();

    $submission = FormSubmission::query()->where('form_id', $contact->id)->latest('id')->firstOrFail();
    expect($submission->payload['postcode'])->toBe('N1 9AA')
        ->and($submission->payload['service'])->toBe('Boiler repair')
        ->and($submission->payload['message'])->toBe('Pressure drops every morning.');
    Notification::assertSentTo($user, FormSubmissionReceived::class);
});

it('rejects honeypot, missing fields, unverified recipients, and failed turnstile', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Spam Site', 'subdomain' => 'spamsite'])
        ->json('data');
    $formId = Form::query()->where('site_id', $site['id'])->where('type', 'contact')->value('id');

    $this->postJson('/api/v1/public/forms/'.$formId.'/submit', [
        'name' => 'Bot',
        'email' => 'bot@example.com',
        'message' => 'spam',
        'website' => 'http://spam.test',
    ])->assertStatus(422);

    $this->postJson('/api/v1/public/forms/'.$formId.'/submit', [
        'name' => 'Ada',
        'website' => '',
    ])->assertStatus(422);

    $this->withHeaders($headers)
        ->patchJson('/api/v1/forms/'.$formId, [
            'settings' => ['recipients' => ['stranger@example.com']],
        ])
        ->assertStatus(422);

    $unverified = User::factory()->unverified()->create();
    $workspace->members()->attach($unverified->id, ['role' => 'editor']);

    $this->withHeaders($headers)
        ->patchJson('/api/v1/forms/'.$formId, [
            'settings' => ['recipients' => [$unverified->email]],
        ])
        ->assertStatus(422);

    Http::fake([
        'https://challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response(['success' => false], 200),
    ]);
    config([
        'uidesired.turnstile.site_key' => 'test-site-key',
        'uidesired.turnstile.secret' => 'test-secret',
    ]);

    $this->withHeaders($headers)
        ->patchJson('/api/v1/forms/'.$formId, [
            'settings' => ['turnstile_enabled' => true, 'recipients' => [$user->email]],
        ])
        ->assertOk();

    $this->postJson('/api/v1/public/forms/'.$formId.'/submit', [
        'name' => 'Ada',
        'email' => 'ada@example.com',
        'message' => 'Hi',
        'cf-turnstile-response' => 'bad-token',
        'website' => '',
    ])->assertStatus(422);

    expect(FormSubmission::query()->count())->toBe(0);
});

it('does not strand public forms when turnstile keys are not configured', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    config([
        'uidesired.turnstile.site_key' => null,
        'uidesired.turnstile.secret' => null,
    ]);

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Imported Form', 'subdomain' => 'imported-form'])
        ->assertCreated()
        ->json('data');
    $form = Form::query()->where('site_id', $site['id'])->where('type', 'contact')->firstOrFail();
    $form->update(['settings' => array_merge($form->settings ?? [], ['turnstile_enabled' => true])]);

    $this->getJson('/api/v1/public/forms/'.$form->id)
        ->assertOk()
        ->assertJsonPath('data.turnstile_enabled', false)
        ->assertJsonPath('data.turnstile_site_key', null);

    $this->postJson('/api/v1/public/forms/'.$form->id.'/submit', [
        'name' => 'Local Visitor',
        'email' => 'visitor@example.com',
        'message' => 'The imported form works.',
        'website' => '',
    ])->assertCreated();
});

it('hides another tenant form from authenticated routes', function () {
    ['user' => $userA, 'workspace' => $workspaceA] = tenant();
    ['user' => $userB, 'workspace' => $workspaceB] = tenant();

    Sanctum::actingAs($userB);
    $siteB = $this->withHeaders(['X-Workspace-Id' => (string) $workspaceB->id])
        ->postJson('/api/v1/sites', ['name' => 'B', 'subdomain' => 'form-b'])
        ->json('data');
    $formB = Form::query()->where('site_id', $siteB['id'])->first();

    Sanctum::actingAs($userA);
    $this->withHeaders(['X-Workspace-Id' => (string) $workspaceA->id])
        ->getJson('/api/v1/forms/'.$formB->id)
        ->assertNotFound();
});
