<?php

use App\Models\FunnelEvent;
use App\Models\FunnelLead;
use App\Models\FunnelVisitor;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

/**
 * The form a funnel exists to collect details with.
 *
 * Every step type used to start life as the same placeholder hero, so a funnel
 * built to capture leads shipped with nothing on it that could capture one. And
 * a submission under the default consent was answered politely and thrown away,
 * because the whole request was treated as analytics.
 */

/**
 * @return array{headers: array<string, string>, funnel: array<string, mixed>}
 */
function optinFunnel(string $name = 'Optin Funnel', array $extra = []): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $funnel = test()->withHeaders($headers)
        ->postJson('/api/v1/funnels', array_merge(['name' => $name], $extra))
        ->assertCreated()
        ->json('data');

    test()->withHeaders($headers)->postJson("/api/v1/funnels/{$funnel['id']}/publish")->assertOk();

    return ['headers' => $headers, 'funnel' => $funnel];
}

function stepTypes(array $funnel, string $slug): array
{
    $step = collect($funnel['steps'])->firstWhere('slug', $slug);

    return array_column($step['draft_content']['sections'] ?? [], 'type');
}

it('puts a real form on the step that is meant to collect details', function () {
    ['funnel' => $funnel] = optinFunnel();

    // The lead step has the opt-in; the landing step is still a landing page.
    expect(stepTypes($funnel, 'capture'))->toBe(['funnel.optin']);
    expect(stepTypes($funnel, 'start'))->toBe(['hero.centered']);
});

it('asks a qualification step for a little more', function () {
    ['funnel' => $funnel] = optinFunnel('Consulting', ['template' => 'consultation']);

    $step = collect($funnel['steps'])->firstWhere('slug', 'qualify');
    $section = $step['draft_content']['sections'][0];

    expect($section['type'])->toBe('funnel.optin');
    expect($section['props']['fields'])->toBe(['name', 'email', 'company']);
});

it('keeps the details somebody typed in even without analytics consent', function () {
    ['headers' => $headers, 'funnel' => $funnel] = optinFunnel();
    $step = collect($funnel['steps'])->firstWhere('slug', 'capture');

    $response = test()->postJson(
        "/api/v1/public/funnels/{$funnel['id']}/steps/{$step['id']}/events",
        [
            'event_type' => 'lead_created',
            'consent' => 'essential',
            'metadata' => ['contact' => ['name' => 'Ada', 'email' => 'ADA@Example.com ']],
        ],
    )->assertAccepted();

    // Not tracked, but not thrown away either.
    $response->assertJsonPath('data.tracked', false);

    $lead = FunnelLead::query()->sole();
    expect($lead->email)->toBe('ada@example.com');
    expect($lead->first_name)->toBe('Ada');
    expect($lead->funnel_step_id)->toBe($step['id']);

    // The rows that profile behaviour still need consent.
    expect(FunnelVisitor::query()->count())->toBe(0);
    expect(FunnelEvent::query()->count())->toBe(0);
});

it('tells the form which step comes next', function () {
    ['funnel' => $funnel] = optinFunnel();
    $step = collect($funnel['steps'])->firstWhere('slug', 'capture');

    test()->postJson(
        "/api/v1/public/funnels/{$funnel['id']}/steps/{$step['id']}/events",
        ['event_type' => 'lead_created', 'consent' => 'essential', 'metadata' => ['contact' => ['email' => 'a@b.test']]],
    )
        ->assertAccepted()
        // Where to send the visitor is decided by the step graph, not baked
        // into the page, so rewiring the funnel does not need a republish.
        ->assertJsonPath('data.next_step', 'thanks');
});

it('does not open a lead for an event that carries no email', function () {
    ['funnel' => $funnel] = optinFunnel();
    $step = collect($funnel['steps'])->firstWhere('slug', 'capture');

    test()->postJson(
        "/api/v1/public/funnels/{$funnel['id']}/steps/{$step['id']}/events",
        ['event_type' => 'step_view', 'consent' => 'essential'],
    )->assertAccepted();

    test()->postJson(
        "/api/v1/public/funnels/{$funnel['id']}/steps/{$step['id']}/events",
        ['event_type' => 'lead_created', 'consent' => 'essential', 'metadata' => ['contact' => ['name' => 'No Email']]],
    )->assertAccepted();

    expect(FunnelLead::query()->count())->toBe(0);
});

it('treats the same person signing up twice as one lead', function () {
    ['funnel' => $funnel] = optinFunnel();
    $step = collect($funnel['steps'])->firstWhere('slug', 'capture');
    $url = "/api/v1/public/funnels/{$funnel['id']}/steps/{$step['id']}/events";

    test()->postJson($url, ['event_type' => 'lead_created', 'consent' => 'essential', 'metadata' => ['contact' => ['email' => 'ada@example.com']]])->assertAccepted();
    test()->postJson($url, ['event_type' => 'lead_created', 'consent' => 'analytics', 'visitor_id' => (string) Str::uuid(), 'session_id' => (string) Str::uuid(), 'metadata' => ['contact' => ['email' => 'ada@example.com', 'phone' => '0123']]])->assertAccepted();

    $lead = FunnelLead::query()->sole();
    expect($lead->phone)->toBe('0123');
    // The consenting visit filled the visitor in; the earlier anonymous one
    // must not blank it again.
    expect($lead->visitor_id)->not->toBeNull();
});

it('keeps the visitor on a lead when a later signup has no consent', function () {
    ['funnel' => $funnel] = optinFunnel();
    $step = collect($funnel['steps'])->firstWhere('slug', 'capture');
    $url = "/api/v1/public/funnels/{$funnel['id']}/steps/{$step['id']}/events";

    test()->postJson($url, ['event_type' => 'lead_created', 'consent' => 'analytics', 'visitor_id' => (string) Str::uuid(), 'session_id' => (string) Str::uuid(), 'metadata' => ['contact' => ['email' => 'ada@example.com']]])->assertAccepted();
    $before = FunnelLead::query()->sole()->visitor_id;

    test()->postJson($url, ['event_type' => 'lead_created', 'consent' => 'essential', 'metadata' => ['contact' => ['email' => 'ada@example.com', 'company' => 'Northwind']]])->assertAccepted();

    $lead = FunnelLead::query()->sole();
    expect($lead->company)->toBe('Northwind');
    expect($lead->visitor_id)->toBe($before);
});

it('gives a checkout step something that can take money', function () {
    ['funnel' => $funnel] = optinFunnel('Launch', ['template' => 'product_launch']);

    $checkout = collect($funnel['steps'])->firstWhere('slug', 'checkout');
    $section = $checkout['draft_content']['sections'][0];

    expect($section['type'])->toBe('commerce.buy');
    expect($section['props']['buttonLabel'])->toBe('Pay now');
    // Left blank on purpose: the shop picks which product this sells, and the
    // button says so on the canvas until one is chosen.
    expect($section['props']['productId'])->toBe('');
});

it('asks an upsell to add to the order rather than start a new one', function () {
    ['funnel' => $funnel] = optinFunnel('Launch two', ['template' => 'product_launch']);

    $upsell = collect($funnel['steps'])->firstWhere('slug', 'upsell');
    $props = $upsell['draft_content']['sections'][0]['props'];

    expect($upsell['draft_content']['sections'][0]['type'])->toBe('commerce.buy');
    expect($props['buttonLabel'])->toBe('Yes, add it');
    // Their email was taken at checkout; asking again is friction.
    expect($props['askForEmail'])->toBeFalse();
});

it('leaves a thank you step as a plain page', function () {
    ['funnel' => $funnel] = optinFunnel('Launch three', ['template' => 'product_launch']);

    $thanks = collect($funnel['steps'])->firstWhere('slug', 'thanks');

    expect($thanks['draft_content']['sections'][0]['type'])->toBe('hero.centered');
});
