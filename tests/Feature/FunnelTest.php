<?php

use App\Models\Funnel;
use App\Models\FunnelEvent;
use App\Models\FunnelLead;
use App\Models\PlatformSetting;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

it('creates, edits, connects and publishes a tenant-safe funnel', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $funnel = $this->withHeaders($headers)->postJson('/api/v1/funnels', [
        'name' => 'Consultation Funnel', 'goal' => 'collect_leads',
    ])->assertCreated()->assertJsonPath('data.status', 'draft')->json('data');

    expect($funnel['steps'])->toHaveCount(3)
        ->and($funnel['connections'])->toHaveCount(2)
        ->and($funnel['site_id'])->toBeNull()
        ->and($funnel['public_id'])->toBeString()
        ->and($funnel['steps'][0]['draft_content']['sections'])->not->toBeEmpty();

    $newStep = $this->withHeaders($headers)->postJson("/api/v1/funnels/{$funnel['id']}/steps", [
        'name' => 'Core Offer', 'type' => 'offer_page',
    ])->assertCreated()->json('data');
    $this->withHeaders($headers)->patchJson("/api/v1/funnels/{$funnel['id']}/steps/{$newStep['id']}", [
        'canvas_x' => 920, 'canvas_y' => 260,
    ])->assertOk()->assertJsonPath('data.canvas_x', 920);

    $landing = $funnel['steps'][0];
    $content = $landing['draft_content'];
    $content['sections'][0]['props']['heading'] = 'A standalone funnel landing page';
    $this->withHeaders($headers)->putJson("/api/v1/funnels/{$funnel['id']}/steps/{$landing['id']}/content", $content)
        ->assertOk()->assertJsonPath('data.draft_content.sections.0.props.heading', 'A standalone funnel landing page');

    $this->withHeaders($headers)->postJson("/api/v1/funnels/{$funnel['id']}/publish")
        ->assertOk()->assertJsonPath('data.status', 'published');

    $this->getJson("/api/v1/public/funnels/resolve?funnel={$funnel['public_id']}&step=start")
        ->assertOk()
        ->assertJsonPath('data.page.content.sections.0.props.heading', 'A standalone funnel landing page')
        ->assertJsonPath('data.context.funnel_slug', $funnel['public_id']);

    expect(Funnel::query()->where('workspace_id', $workspace->id)->count())->toBe(1);
});

it('tracks published funnel visitors, sessions and deduplicated leads', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    $funnel = $this->withHeaders($headers)->postJson('/api/v1/funnels', ['name' => 'Tracked Funnel'])->json('data');
    $this->withHeaders($headers)->postJson("/api/v1/funnels/{$funnel['id']}/publish")->assertOk();
    $step = $funnel['steps'][0];
    $visitor = (string) Str::uuid();
    $session = (string) Str::uuid();
    $payload = ['event_type' => 'form_submission', 'idempotency_key' => (string) Str::uuid(), 'visitor_id' => $visitor, 'session_id' => $session, 'consent' => 'analytics', 'utm_source' => 'google', 'utm_campaign' => 'summer-launch', 'metadata' => ['contact' => ['name' => 'Ada', 'email' => 'ada@example.com']]];

    $url = "/api/v1/public/funnels/{$funnel['id']}/steps/{$step['id']}/events";
    $this->postJson($url, $payload)->assertAccepted()->assertJsonPath('data.visitor_id', $visitor);
    $this->postJson($url, array_merge($payload, ['idempotency_key' => (string) Str::uuid()]))->assertAccepted();

    expect(FunnelLead::query()->count())->toBe(1)
        ->and(FunnelEvent::query()->where('event_type', 'form_submission')->count())->toBe(2);
    $this->withHeaders($headers)->getJson("/api/v1/funnels/{$funnel['id']}/analytics")
        ->assertOk()->assertJsonPath('data.leads', 1);
});

it('aggregates attribution, revenue, devices and idempotent events', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);
    $funnel = $this->withHeaders($headers)->postJson('/api/v1/funnels', ['name' => 'Revenue Funnel'])->json('data');
    $this->withHeaders($headers)->postJson("/api/v1/funnels/{$funnel['id']}/publish")->assertOk();
    $step = $funnel['steps'][0];
    $url = "/api/v1/public/funnels/{$funnel['id']}/steps/{$step['id']}/events";
    $visitor = (string) Str::uuid(); $session = (string) Str::uuid(); $key = (string) Str::uuid();
    $payload = ['event_type' => 'purchase', 'idempotency_key' => $key, 'visitor_id' => $visitor, 'session_id' => $session, 'consent' => 'analytics', 'utm_source' => 'linkedin', 'utm_campaign' => 'b2b', 'country' => 'AE', 'metadata' => ['amount' => 4500, 'currency' => 'AED']];
    $this->withHeader('User-Agent', 'Mozilla/5.0 (iPhone) AppleWebKit Safari')->postJson($url, $payload)->assertAccepted()->assertJsonPath('data.tracked', true);
    $this->withHeader('User-Agent', 'Mozilla/5.0 (iPhone) AppleWebKit Safari')->postJson($url, $payload)->assertAccepted();

    $analytics = $this->withHeaders($headers)->getJson("/api/v1/funnels/{$funnel['id']}/analytics?source=linkedin&device=mobile")
        ->assertOk()->assertJsonPath('data.orders', 1)->assertJsonPath('data.revenue', 4500)->json('data');
    expect($analytics['sources'][0]['label'])->toBe('linkedin')
        ->and($analytics['campaigns'][0]['label'])->toBe('b2b')
        ->and($analytics['countries'][0]['label'])->toBe('AE');
});

it('respects analytics consent and excludes obvious bots from aggregates', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);
    $funnel = $this->withHeaders($headers)->postJson('/api/v1/funnels', ['name' => 'Privacy Funnel'])->json('data');
    $this->withHeaders($headers)->postJson("/api/v1/funnels/{$funnel['id']}/publish")->assertOk();
    $step = $funnel['steps'][0]; $url = "/api/v1/public/funnels/{$funnel['id']}/steps/{$step['id']}/events";
    $base = ['event_type' => 'step_view', 'visitor_id' => (string) Str::uuid(), 'session_id' => (string) Str::uuid(), 'idempotency_key' => (string) Str::uuid()];
    $this->postJson($url, $base + ['consent' => 'essential'])->assertAccepted()->assertJsonPath('data.tracked', false);
    $this->withHeader('User-Agent', 'Googlebot/2.1')->postJson($url, array_merge($base, ['consent' => 'analytics', 'idempotency_key' => (string) Str::uuid()]))->assertAccepted();
    $this->withHeaders($headers)->getJson("/api/v1/funnels/{$funnel['id']}/analytics")->assertOk()->assertJsonPath('data.unique_visitors', 0);
});

it('fully gates the funnel module without deleting data', function () {
    ['user' => $admin, 'workspace' => $workspace] = adminTenant();
    Sanctum::actingAs($admin);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];
    $funnelId = $this->withHeaders($headers)->postJson('/api/v1/funnels', ['name' => 'Preserved Funnel'])->json('data.id');

    $this->putJson('/api/v1/admin/settings', ['funnels_enabled' => false])->assertOk()->assertJsonPath('data.funnels_enabled', false);
    $this->getJson('/api/v1/features')->assertOk()->assertJsonPath('data.funnels', false);
    $this->withHeaders($headers)->getJson('/api/v1/funnels')->assertNotFound();
    expect(Funnel::query()->find($funnelId))->not->toBeNull();

    $this->putJson('/api/v1/admin/settings', ['funnels_enabled' => true])->assertOk();
    $this->withHeaders($headers)->getJson('/api/v1/funnels')->assertOk();
    expect(PlatformSetting::query()->whereKey('features.funnels')->value('value'))->toBe('1');
});

it('does not expose funnels across workspaces', function () {
    ['user' => $owner, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($owner, $workspace);
    $funnelId = $this->withHeaders($headers)->postJson('/api/v1/funnels', ['name' => 'Private Funnel'])->json('data.id');

    ['user' => $outsider, 'workspace' => $other] = tenant();
    Sanctum::actingAs($outsider);
    $this->withHeaders(['X-Workspace-Id' => (string) $other->id])->getJson("/api/v1/funnels/{$funnelId}")->assertNotFound();
});

it('allows an authorized workspace member to delete a funnel without exposing it publicly', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);
    $funnel = $this->withHeaders($headers)->postJson('/api/v1/funnels', ['name' => 'Disposable Funnel'])->json('data');
    $this->withHeaders($headers)->postJson("/api/v1/funnels/{$funnel['id']}/publish")->assertOk();

    $this->withHeaders($headers)->deleteJson("/api/v1/funnels/{$funnel['id']}")
        ->assertOk()
        ->assertJsonPath('data.ok', true);

    $this->withHeaders($headers)->getJson("/api/v1/funnels/{$funnel['id']}")->assertNotFound();
    $this->postJson("/api/v1/public/funnels/{$funnel['id']}/steps/{$funnel['steps'][0]['id']}/events", [
        'event_type' => 'step_view', 'consent' => 'analytics',
    ])->assertNotFound();
    expect(Funnel::withTrashed()->find($funnel['id']))->not->toBeNull();
});
