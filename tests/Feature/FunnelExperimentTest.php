<?php

use App\Models\FunnelStep;
use App\Models\FunnelStepVariant;
use App\Services\Funnels\FunnelExperimentService;
use Laravel\Sanctum\Sanctum;

/**
 * A/B testing a funnel step.
 *
 * The step's own content is the control. What matters most here is that a
 * visitor stays in the bucket they were put in: somebody shown a different
 * version on every visit tells you nothing about either of them, and their
 * conversion cannot honestly be credited to one.
 */

/**
 * @return array{headers: array<string, string>, funnel: array<string, mixed>, step: array<string, mixed>}
 */
function experimentFunnel(): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $plan = $workspace->load('subscription.plan')->subscription->plan;
    $plan->update(['limits' => array_merge($plan->limits ?? [], ['funnels' => 5])]);
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $funnel = test()->withHeaders($headers)
        ->postJson('/api/v1/funnels', ['name' => 'Experiment Funnel'])
        ->assertCreated()
        ->json('data');

    test()->withHeaders($headers)->postJson("/api/v1/funnels/{$funnel['id']}/publish")->assertOk();

    return ['headers' => $headers, 'funnel' => $funnel, 'step' => $funnel['steps'][0]];
}

function addVariant(array $fx, string $name = 'Bolder headline', int $weight = 1): array
{
    return test()->withHeaders($fx['headers'])
        ->postJson("/api/v1/funnels/{$fx['funnel']['id']}/steps/{$fx['step']['id']}/variants", [
            'name' => $name,
            'weight' => $weight,
        ])
        ->assertCreated()
        ->json('data');
}

it('starts a variant as a copy of the step rather than an empty page', function () {
    $fx = experimentFunnel();
    $variant = addVariant($fx);

    expect($variant['key'])->toBe('bolder-headline');
    // Otherwise the first thing anybody does is rebuild the page from nothing.
    expect($variant['draft_content'])->toBe($fx['step']['draft_content']);
});

it('serves the control while there is nothing to test against', function () {
    $fx = experimentFunnel();
    $step = FunnelStep::query()->findOrFail($fx['step']['id']);
    $pool = app(FunnelExperimentService::class)->pool($step);

    expect($pool)->toHaveCount(1);
    expect($pool[0]['key'])->toBe(FunnelStepVariant::CONTROL);
    expect($pool[0]['id'])->toBeNull();
});

it('puts the control in the running once a variant exists', function () {
    $fx = experimentFunnel();
    addVariant($fx);
    $step = FunnelStep::query()->findOrFail($fx['step']['id']);

    $keys = array_column(app(FunnelExperimentService::class)->pool($step), 'key');

    // The control has to be one of the options or there is nothing to compare.
    expect($keys)->toBe([FunnelStepVariant::CONTROL, 'bolder-headline']);
});

it('gives the same visitor the same version every time', function () {
    $fx = experimentFunnel();
    addVariant($fx);
    $step = FunnelStep::query()->findOrFail($fx['step']['id']);
    $experiments = app(FunnelExperimentService::class);
    $pool = $experiments->pool($step);

    // The whole point: a person who sees a different page on each visit tells
    // you nothing about either one.
    $first = $experiments->assign($pool, 'visitor-abc|'.$step->id);
    for ($i = 0; $i < 20; $i++) {
        expect($experiments->assign($pool, 'visitor-abc|'.$step->id))->toBe($first);
    }
});

it('does not put everybody in the same bucket', function () {
    $fx = experimentFunnel();
    addVariant($fx);
    $step = FunnelStep::query()->findOrFail($fx['step']['id']);
    $experiments = app(FunnelExperimentService::class);
    $pool = $experiments->pool($step);

    $seen = [];
    for ($i = 0; $i < 200; $i++) {
        $seen[$experiments->assign($pool, "visitor-{$i}|{$step->id}")['key']] = true;
    }

    expect(array_keys($seen))->toHaveCount(2);
});

it('splits by weight', function () {
    $fx = experimentFunnel();
    addVariant($fx, 'Heavy', 9);
    $step = FunnelStep::query()->findOrFail($fx['step']['id']);
    $experiments = app(FunnelExperimentService::class);
    $pool = $experiments->pool($step);

    $counts = ['control' => 0, 'heavy' => 0];
    for ($i = 0; $i < 1000; $i++) {
        $counts[$experiments->assign($pool, "v{$i}|{$step->id}")['key']]++;
    }

    // One against nine, so the heavy side should take the clear majority.
    // Loose bounds: this asserts the weighting works, not that a hash is
    // perfectly uniform.
    expect($counts['heavy'])->toBeGreaterThan($counts['control'] * 3);
});

it('keeps a visitor apart on different steps', function () {
    $fx = experimentFunnel();
    $experiments = app(FunnelExperimentService::class);
    $pool = [
        ['key' => 'control', 'id' => null, 'weight' => 1],
        ['key' => 'b', 'id' => 1, 'weight' => 1],
    ];

    // Two steps must be able to disagree about the same person, or a visitor
    // unlucky once is unlucky through the whole funnel.
    $spread = [];
    for ($i = 0; $i < 50; $i++) {
        $a = $experiments->assign($pool, "person-{$i}|1")['key'];
        $b = $experiments->assign($pool, "person-{$i}|2")['key'];
        $spread[$a === $b ? 'same' : 'different'] = true;
    }

    expect($spread)->toHaveKey('different');
});

it('counts views and conversions against the version that earned them', function () {
    $fx = experimentFunnel();
    $variant = addVariant($fx);
    $url = "/api/v1/public/funnels/{$fx['funnel']['id']}/steps/{$fx['step']['id']}/events";
    $seen = ['consent' => 'analytics', 'visitor_id' => (string) Str::uuid(), 'session_id' => (string) Str::uuid()];

    // Control: one view, no conversion.
    test()->postJson($url, $seen + ['event_type' => 'step_view'])->assertAccepted();

    // Variant: one view and one conversion.
    test()->postJson($url, ['event_type' => 'step_view', 'variant' => $variant['key'], 'consent' => 'analytics', 'visitor_id' => (string) Str::uuid(), 'session_id' => (string) Str::uuid()])->assertAccepted();
    test()->postJson($url, ['event_type' => 'conversion', 'variant' => $variant['key'], 'consent' => 'analytics', 'visitor_id' => (string) Str::uuid(), 'session_id' => (string) Str::uuid()])->assertAccepted();

    $results = test()->withHeaders($fx['headers'])
        ->getJson("/api/v1/funnels/{$fx['funnel']['id']}/steps/{$fx['step']['id']}/variants")
        ->assertOk()
        ->json('data');

    $control = collect($results['variants'])->firstWhere('key', 'control');
    $tested = collect($results['variants'])->firstWhere('key', $variant['key']);

    expect($control['views'])->toBe(1);
    // JSON turns 0.0 into 0, so compare by value rather than by type.
    expect((float) $control['rate'])->toBe(0.0);
    expect($tested['views'])->toBe(1);
    expect($tested['conversions'])->toBe(1);
    expect((float) $tested['rate'])->toBe(100.0);
});

it('ignores a variant key that belongs to another step', function () {
    $fx = experimentFunnel();
    $url = "/api/v1/public/funnels/{$fx['funnel']['id']}/steps/{$fx['step']['id']}/events";

    test()->postJson($url, [
        'event_type' => 'step_view',
        'variant' => 'not-a-real-variant',
        'consent' => 'analytics',
        'visitor_id' => (string) Str::uuid(),
        'session_id' => (string) Str::uuid(),
    ])->assertAccepted();

    $results = test()->withHeaders($fx['headers'])
        ->getJson("/api/v1/funnels/{$fx['funnel']['id']}/steps/{$fx['step']['id']}/variants")
        ->json('data');

    // Counted as the control rather than credited to somebody else's test.
    expect(collect($results['variants'])->firstWhere('key', 'control')['views'])->toBe(1);
});

it('sends everyone to the winner once one is chosen', function () {
    $fx = experimentFunnel();
    $variant = addVariant($fx);

    test()->withHeaders($fx['headers'])
        ->postJson("/api/v1/funnels/{$fx['funnel']['id']}/steps/{$fx['step']['id']}/winner", ['key' => $variant['key']])
        ->assertOk();

    $step = FunnelStep::query()->findOrFail($fx['step']['id']);
    $pool = app(FunnelExperimentService::class)->pool($step);

    // The experiment is over: one version, and it is the winner.
    expect($pool)->toHaveCount(1);
    expect($pool[0]['key'])->toBe($variant['key']);
});

it('keeps the losing versions and their numbers', function () {
    $fx = experimentFunnel();
    $loser = addVariant($fx, 'Loser');
    $winner = addVariant($fx, 'Winner');

    test()->withHeaders($fx['headers'])
        ->postJson("/api/v1/funnels/{$fx['funnel']['id']}/steps/{$fx['step']['id']}/winner", ['key' => $winner['key']])
        ->assertOk();

    // The numbers that justified the decision should still be there to read.
    $statuses = FunnelStepVariant::query()->pluck('status', 'key')->all();
    expect($statuses[$loser['key']])->toBe('lost');
    expect($statuses[$winner['key']])->toBe('winner');
});

it('goes back to the step content when the control wins', function () {
    $fx = experimentFunnel();
    addVariant($fx);

    test()->withHeaders($fx['headers'])
        ->postJson("/api/v1/funnels/{$fx['funnel']['id']}/steps/{$fx['step']['id']}/winner", ['key' => 'control'])
        ->assertOk();

    $step = FunnelStep::query()->findOrFail($fx['step']['id']);
    $pool = app(FunnelExperimentService::class)->pool($step);

    expect($pool)->toHaveCount(1);
    expect($pool[0]['key'])->toBe(FunnelStepVariant::CONTROL);
});

it('does not let another workspace read or change an experiment', function () {
    $fx = experimentFunnel();
    addVariant($fx);

    ['user' => $otherUser, 'workspace' => $otherWorkspace] = tenant();
    Sanctum::actingAs($otherUser);
    $otherHeaders = ['X-Workspace-Id' => (string) $otherWorkspace->id];

    test()->withHeaders($otherHeaders)
        ->getJson("/api/v1/funnels/{$fx['funnel']['id']}/steps/{$fx['step']['id']}/variants")
        ->assertNotFound();

    test()->withHeaders($otherHeaders)
        ->postJson("/api/v1/funnels/{$fx['funnel']['id']}/steps/{$fx['step']['id']}/variants", ['name' => 'Theirs'])
        ->assertNotFound();
});
