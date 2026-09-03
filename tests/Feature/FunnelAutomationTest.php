<?php

use App\Jobs\RunFunnelAutomation;
use App\Mail\FunnelAutomationMail;
use App\Models\FunnelAutomation;
use App\Models\FunnelAutomationRun;
use App\Models\FunnelEvent;
use App\Models\User;
use App\Services\FeatureService;
use App\Services\Funnels\FunnelAutomationService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

/**
 * Things a funnel does by itself.
 *
 * Two things this must never become: a way to mail whoever a tenant likes, and
 * a way to reach machines behind our own firewall. Most of what is asserted
 * here is about those two, because the rest is only convenience.
 */

/**
 * @return array{headers: array<string, string>, funnel: array<string, mixed>, step: array<string, mixed>, user: User}
 */
function automationFunnel(): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $plan = $workspace->load('subscription.plan')->subscription->plan;
    $plan->update(['limits' => array_merge($plan->limits ?? [], ['funnels' => 5])]);
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $funnel = test()->withHeaders($headers)
        ->postJson('/api/v1/funnels', ['name' => 'Automation Funnel'])
        ->assertCreated()
        ->json('data');

    test()->withHeaders($headers)->postJson("/api/v1/funnels/{$funnel['id']}/publish")->assertOk();

    return ['headers' => $headers, 'funnel' => $funnel, 'step' => $funnel['steps'][0], 'user' => $user];
}

function makeRule(array $fx, array $overrides = []): array
{
    return test()->withHeaders($fx['headers'])
        ->postJson("/api/v1/funnels/{$fx['funnel']['id']}/automations", array_merge([
            'name' => 'Welcome email',
            'trigger_event' => 'lead_created',
            'action' => 'email',
            'config' => ['to' => 'lead', 'subject' => 'Hello {{first_name}}', 'body' => 'Thanks for signing up.'],
        ], $overrides))
        ->assertCreated()
        ->json('data');
}

function sendLead(array $fx, string $email = 'ada@example.com'): void
{
    test()->postJson("/api/v1/public/funnels/{$fx['funnel']['id']}/steps/{$fx['step']['id']}/events", [
        'event_type' => 'lead_created',
        'consent' => 'analytics',
        'visitor_id' => (string) Str::uuid(),
        'session_id' => (string) Str::uuid(),
        'metadata' => ['contact' => ['name' => 'Ada', 'email' => $email]],
    ])->assertAccepted();
}

it('refuses a webhook that points inside our own network', function () {
    $fx = automationFunnel();

    foreach ([
        'https://localhost/hook',
        'https://127.0.0.1/hook',
        'https://10.0.0.5/hook',
        'https://192.168.1.10/hook',
        'https://169.254.169.254/latest/meta-data',
    ] as $url) {
        test()->withHeaders($fx['headers'])
            ->postJson("/api/v1/funnels/{$fx['funnel']['id']}/automations", [
                'name' => 'Sneaky', 'trigger_event' => 'lead_created', 'action' => 'webhook',
                'config' => ['url' => $url],
            ])
            ->assertStatus(422);
    }

    expect(FunnelAutomation::query()->count())->toBe(0);
});

it('refuses a webhook that is not https', function () {
    $fx = automationFunnel();

    test()->withHeaders($fx['headers'])
        ->postJson("/api/v1/funnels/{$fx['funnel']['id']}/automations", [
            'name' => 'Plain', 'trigger_event' => 'lead_created', 'action' => 'webhook',
            'config' => ['url' => 'http://example.com/hook'],
        ])
        ->assertStatus(422);
});

it('will not mail somebody who is not on the workspace', function () {
    $fx = automationFunnel();

    // Otherwise this is a way to send mail to anyone, from us.
    test()->withHeaders($fx['headers'])
        ->postJson("/api/v1/funnels/{$fx['funnel']['id']}/automations", [
            'name' => 'Spam', 'trigger_event' => 'lead_created', 'action' => 'email',
            'config' => ['to' => 'stranger@example.com', 'body' => 'Buy this'],
        ])
        ->assertStatus(422);
});

it('lets a rule mail the lead, or somebody on the workspace', function () {
    $fx = automationFunnel();

    makeRule($fx, ['config' => ['to' => 'lead', 'body' => 'Hi']]);
    makeRule($fx, ['name' => 'Tell me', 'config' => ['to' => $fx['user']->email, 'body' => 'A lead arrived']]);

    expect(FunnelAutomation::query()->count())->toBe(2);
});

it('never hands the webhook secret back out', function () {
    $fx = automationFunnel();

    $created = test()->withHeaders($fx['headers'])
        ->postJson("/api/v1/funnels/{$fx['funnel']['id']}/automations", [
            'name' => 'Notify', 'trigger_event' => 'purchase', 'action' => 'webhook',
            'config' => ['url' => 'https://example.com/hook', 'secret' => 'sh-super-secret'],
        ])
        ->assertCreated()
        ->json('data');

    expect($created['config'])->not->toHaveKey('secret');

    $listed = test()->withHeaders($fx['headers'])
        ->getJson("/api/v1/funnels/{$fx['funnel']['id']}/automations")
        ->assertOk()
        ->getContent();

    // It is what proves a call came from us, so reading the screen must not
    // let anybody forge one.
    expect($listed)->not->toContain('sh-super-secret');
    expect(FunnelAutomation::query()->sole()->config['secret'])->toBe('sh-super-secret');
});

it('books a run when the event it watches for happens', function () {
    Queue::fake();
    $fx = automationFunnel();
    makeRule($fx);

    sendLead($fx);

    Queue::assertPushed(RunFunnelAutomation::class);
    expect(FunnelAutomationRun::query()->count())->toBe(1);
});

it('does not fire for an event it was not watching', function () {
    Queue::fake();
    $fx = automationFunnel();
    makeRule($fx, ['trigger_event' => 'purchase']);

    sendLead($fx);

    Queue::assertNotPushed(RunFunnelAutomation::class);
    expect(FunnelAutomationRun::query()->count())->toBe(0);
});

it('only fires on the step it was pinned to', function () {
    Queue::fake();
    $fx = automationFunnel();
    $other = collect($fx['funnel']['steps'])->firstWhere('slug', 'thanks');
    makeRule($fx, ['trigger_step_id' => $other['id']]);

    sendLead($fx);

    Queue::assertNotPushed(RunFunnelAutomation::class);
});

it('books a delayed rule once, and only once per event', function () {
    Queue::fake();
    $fx = automationFunnel();
    makeRule($fx, ['delay_minutes' => 60]);

    sendLead($fx);

    $run = FunnelAutomationRun::query()->sole();
    // Visible while it waits, rather than appearing out of nowhere an hour on.
    expect($run->status)->toBe('waiting');

    // A queue that delivers twice must not book a second send.
    expect(app(FunnelAutomationService::class)->schedule(
        FunnelAutomation::query()->sole(),
        FunnelEvent::query()->sole(),
    ))->toBeNull();
    expect(FunnelAutomationRun::query()->count())->toBe(1);
});

it('sends the email, filling in what it knows about the lead', function () {
    // Held back on purpose: on the sync driver a dispatch runs there and then,
    // which is not the order the real thing happens in.
    Queue::fake();
    Mail::fake();
    $fx = automationFunnel();
    makeRule($fx);
    sendLead($fx);

    app(RunFunnelAutomation::class, ['runId' => FunnelAutomationRun::query()->sole()->id])
        ->handle(app(FeatureService::class), app(FunnelAutomationService::class));

    Mail::assertSent(FunnelAutomationMail::class, function (FunnelAutomationMail $mail) {
        // The placeholder is filled from the lead, so the subject greets Ada.
        return $mail->hasTo('ada@example.com') && str_contains($mail->subjectLine, 'Ada');
    });

    $run = FunnelAutomationRun::query()->sole();
    expect($run->status)->toBe('done');
    expect($run->detail)->toContain('ada@example.com');
});

it('signs the webhook so the receiver can tell it came from us', function () {
    Queue::fake();
    Http::fake(['*' => Http::response(['ok' => true])]);
    $fx = automationFunnel();
    makeRule($fx, [
        'name' => 'Notify', 'action' => 'webhook',
        'config' => ['url' => 'https://example.com/hook', 'secret' => 'topsecret'],
    ]);
    sendLead($fx);

    app(RunFunnelAutomation::class, ['runId' => FunnelAutomationRun::query()->sole()->id])
        ->handle(app(FeatureService::class), app(FunnelAutomationService::class));

    Http::assertSent(function ($request) {
        $expected = hash_hmac('sha256', $request->body(), 'topsecret');

        return $request->url() === 'https://example.com/hook'
            && $request->header('X-Uidesired-Signature')[0] === $expected;
    });

    expect(FunnelAutomationRun::query()->sole()->status)->toBe('done');
});

it('records a failure rather than losing it', function () {
    Queue::fake();
    Http::fake(['*' => Http::response('nope', 500)]);
    $fx = automationFunnel();
    makeRule($fx, ['name' => 'Notify', 'action' => 'webhook', 'config' => ['url' => 'https://example.com/hook']]);
    sendLead($fx);

    app(RunFunnelAutomation::class, ['runId' => FunnelAutomationRun::query()->sole()->id])
        ->handle(app(FeatureService::class), app(FunnelAutomationService::class));

    $run = FunnelAutomationRun::query()->sole();
    // A rule that quietly failed is worse than one that visibly did.
    expect($run->status)->toBe('failed');
    expect($run->detail)->toContain('500');
});

it('does not run a rule that was switched off while it waited', function () {
    // The delay is the queue's, so the job has to be held back for the pause
    // to land in between - which is exactly what happens in production.
    Queue::fake();
    Mail::fake();
    $fx = automationFunnel();
    $rule = makeRule($fx, ['delay_minutes' => 60]);
    sendLead($fx);

    test()->withHeaders($fx['headers'])
        ->patchJson("/api/v1/funnels/{$fx['funnel']['id']}/automations/{$rule['id']}", ['status' => 'paused'])
        ->assertOk();

    expect(FunnelAutomation::query()->sole()->status)->toBe('paused');

    app(RunFunnelAutomation::class, ['runId' => FunnelAutomationRun::query()->sole()->id])
        ->handle(app(FeatureService::class), app(FunnelAutomationService::class));

    // The decision that counts is the one in force when it would reach somebody.
    Mail::assertNothingSent();
    expect(FunnelAutomationRun::query()->sole()->status)->toBe('skipped');
});

it('does not let another workspace read or change the rules', function () {
    $fx = automationFunnel();
    makeRule($fx);

    ['user' => $otherUser, 'workspace' => $otherWorkspace] = tenant();
    Sanctum::actingAs($otherUser);
    $otherHeaders = ['X-Workspace-Id' => (string) $otherWorkspace->id];

    test()->withHeaders($otherHeaders)->getJson("/api/v1/funnels/{$fx['funnel']['id']}/automations")->assertNotFound();
    test()->withHeaders($otherHeaders)
        ->postJson("/api/v1/funnels/{$fx['funnel']['id']}/automations", [
            'name' => 'Theirs', 'trigger_event' => 'lead_created', 'action' => 'email', 'config' => ['to' => 'lead'],
        ])
        ->assertNotFound();
});
