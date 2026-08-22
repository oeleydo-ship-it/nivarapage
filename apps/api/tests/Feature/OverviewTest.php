<?php

use App\Models\Form;
use App\Models\FormSubmission;

it('returns zeros for an empty workspace', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);

    $this->withHeaders($headers)
        ->getJson('/api/v1/overview')
        ->assertOk()
        ->assertJsonPath('data.total_websites', 0)
        ->assertJsonPath('data.published', 0)
        ->assertJsonPath('data.custom_domains', 0)
        ->assertJsonPath('data.form_submissions', 0)
        ->assertJsonPath('data.clients', 0)
        ->assertJsonPath('data.blog_posts', 0)
        ->assertJsonPath('data.storage_usage.bytes', 0)
        ->assertJsonPath('data.plan.slug', 'free');
});

it('counts sites clients posts and submissions for the current workspace only', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    ['user' => $otherUser, 'workspace' => $otherWorkspace] = tenant();
    $workspace->subscription->plan->update([
        'limits' => array_merge($workspace->subscription->plan->limits ?? [], ['number_of_sites' => 5]),
    ]);

    $headers = authHeaders($user, $workspace);

    $site = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Overview Site', 'subdomain' => 'overviewsite'])
        ->assertCreated()
        ->json('data');

    $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Draft Site', 'subdomain' => 'overviewdraft'])
        ->assertCreated();

    $this->withHeaders($headers)
        ->patchJson('/api/v1/sites/'.$site['id'], ['status' => 'published'])
        ->assertOk();

    $this->withHeaders($headers)
        ->postJson('/api/v1/clients', ['name' => 'Acme Retail', 'status' => 'active'])
        ->assertCreated();

    $this->withHeaders($headers)
        ->postJson('/api/v1/blog-posts', [
            'site_id' => $site['id'],
            'title' => 'Launch notes',
            'status' => 'draft',
        ])
        ->assertCreated();

    $formId = Form::query()->where('site_id', $site['id'])->value('id');
    FormSubmission::query()->create([
        'form_id' => $formId,
        'workspace_id' => $workspace->id,
        'status' => 'new',
        'payload' => ['message' => 'Hello'],
    ]);

    $this->withHeaders(authHeaders($otherUser, $otherWorkspace))
        ->postJson('/api/v1/sites', ['name' => 'Other Site', 'subdomain' => 'othersite'])
        ->assertCreated();

    $this->withHeaders(authHeaders($user, $workspace))
        ->getJson('/api/v1/overview')
        ->assertOk()
        ->assertJsonPath('data.total_websites', 2)
        ->assertJsonPath('data.published', 1)
        ->assertJsonPath('data.form_submissions', 1)
        ->assertJsonPath('data.clients', 1)
        ->assertJsonPath('data.blog_posts', 1)
        ->assertJsonPath('data.usage.number_of_sites.used', 2);

    $this->withHeaders(authHeaders($otherUser, $otherWorkspace))
        ->getJson('/api/v1/overview')
        ->assertOk()
        ->assertJsonPath('data.total_websites', 1)
        ->assertJsonPath('data.published', 0)
        ->assertJsonPath('data.clients', 0)
        ->assertJsonPath('data.blog_posts', 0)
        ->assertJsonPath('data.form_submissions', 0);
});
