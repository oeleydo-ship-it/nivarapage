<?php

use App\Models\Funnel;
use App\Models\PageRender;
use Laravel\Sanctum\Sanctum;

/**
 * Serving a published funnel step.
 *
 * Funnels were made standalone - site_id became nullable - but the rendering
 * half was left behind. Steps were uploaded against the funnel's owning site
 * and looked up the same way, so a funnel with no site had nowhere to store its
 * HTML and asking for a page answered with a type error rather than a page.
 */

/**
 * @return array{headers: array<string, string>, funnel: array<string, mixed>}
 */
function publishedFunnel(): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $plan = $workspace->load('subscription.plan')->subscription->plan;
    $plan->update(['limits' => array_merge($plan->limits ?? [], ['funnels' => 5])]);
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $funnel = test()->withHeaders($headers)
        ->postJson('/api/v1/funnels', ['name' => 'Served Funnel'])
        ->assertCreated()
        ->json('data');

    test()->withHeaders($headers)->postJson("/api/v1/funnels/{$funnel['id']}/publish")->assertOk();

    return ['headers' => $headers, 'funnel' => $funnel];
}

it('creates funnels with no site of their own', function () {
    $fx = publishedFunnel();

    // The premise of the bug: there is no site to key a render by.
    expect(Funnel::query()->findOrFail($fx['funnel']['id'])->site_id)->toBeNull();
});

it('serves a step of a funnel that has no site', function () {
    $fx = publishedFunnel();
    $publicId = $fx['funnel']['public_id'];

    test()->withHeaders($fx['headers'])
        ->postJson("/api/v1/funnels/{$fx['funnel']['id']}/renders", [
            'renders' => [['path' => "/f/{$publicId}/start", 'html' => '<!doctype html><title>Start</title>Hello']],
        ])
        ->assertOk()
        ->assertJsonPath('data.stored', 1);

    // This used to be a 500 from a null site, not a page.
    $response = test()->get("/f/{$publicId}/start");
    $response->assertOk();
    expect($response->getContent())->toContain('Hello');
});

it('answers a step that was never published without falling over', function () {
    $fx = publishedFunnel();

    test()->get("/f/{$fx['funnel']['public_id']}/start")->assertNotFound();
    test()->get("/f/{$fx['funnel']['public_id']}/nothing-here")->assertNotFound();
    test()->get('/f/de21517a-ab9a-447b-bf65-7174c7ac444e/start')->assertNotFound();
});

it('defaults to the first step when no step is named', function () {
    $fx = publishedFunnel();
    $publicId = $fx['funnel']['public_id'];

    test()->withHeaders($fx['headers'])
        ->postJson("/api/v1/funnels/{$fx['funnel']['id']}/renders", [
            'renders' => [['path' => "/f/{$publicId}/start", 'html' => 'First step']],
        ])
        ->assertOk();

    $response = test()->get("/f/{$publicId}");
    $response->assertOk();
    expect($response->getContent())->toContain('First step');
});

it('will not let one funnel publish HTML over another', function () {
    $fx = publishedFunnel();

    $other = test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/funnels', ['name' => 'Other Funnel'])
        ->assertCreated()
        ->json('data');
    test()->withHeaders($fx['headers'])->postJson("/api/v1/funnels/{$other['id']}/publish")->assertOk();

    // A path belonging to the other funnel is dropped rather than written.
    test()->withHeaders($fx['headers'])
        ->postJson("/api/v1/funnels/{$fx['funnel']['id']}/renders", [
            'renders' => [['path' => "/f/{$other['public_id']}/start", 'html' => 'Hijacked']],
        ])
        ->assertOk()
        ->assertJsonPath('data.stored', 0);

    expect(PageRender::query()->where('html', 'Hijacked')->exists())->toBeFalse();
});

it('does not let another workspace publish into this funnel', function () {
    $fx = publishedFunnel();

    ['user' => $otherUser, 'workspace' => $otherWorkspace] = tenant();
    Sanctum::actingAs($otherUser);

    test()->withHeaders(['X-Workspace-Id' => (string) $otherWorkspace->id])
        ->postJson("/api/v1/funnels/{$fx['funnel']['id']}/renders", [
            'renders' => [['path' => "/f/{$fx['funnel']['public_id']}/start", 'html' => 'Not yours']],
        ])
        ->assertNotFound();
});

it('republishing identical HTML does not move the modified time', function () {
    $fx = publishedFunnel();
    $publicId = $fx['funnel']['public_id'];
    $body = ['renders' => [['path' => "/f/{$publicId}/start", 'html' => 'Same every time']]];

    test()->withHeaders($fx['headers'])->postJson("/api/v1/funnels/{$fx['funnel']['id']}/renders", $body)->assertOk();
    $first = PageRender::query()->where('funnel_id', $fx['funnel']['id'])->sole();

    test()->travel(5)->minutes();
    test()->withHeaders($fx['headers'])->postJson("/api/v1/funnels/{$fx['funnel']['id']}/renders", $body)->assertOk();

    // updated_at becomes Last-Modified, so moving it would invalidate caches
    // for HTML that did not change.
    expect(PageRender::query()->sole()->updated_at->timestamp)->toBe($first->updated_at->timestamp);
});
