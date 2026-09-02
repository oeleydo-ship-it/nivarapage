<?php

use App\Jobs\GenerateLivechatAiReply;
use App\Models\LivechatConversation;
use Illuminate\Support\Facades\File;
use Laravel\Sanctum\Sanctum;

/**
 * A visitor who asks a question is owed an answer.
 *
 * The AI reply runs on the `livechat` queue. If nothing drains that queue, or
 * the model errors, the typing indicator used to stop and nothing arrived at
 * all - the visitor was left staring at a dead conversation.
 */

/**
 * @return array{key: string, conversation: array<string, mixed>}
 */
function aiChatFixture(): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = ['X-Workspace-Id' => (string) $workspace->id];

    $siteId = test()->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Fallback', 'subdomain' => 'fallbackchat'])
        ->assertCreated()
        ->json('data.id');

    test()->withHeaders($headers)
        ->putJson('/api/v1/sites/'.$siteId.'/livechat', [
            'enabled' => true,
            'ai_enabled' => true,
            'mode' => 'ai_first',
        ])
        ->assertOk();

    $key = test()->withHeaders($headers)
        ->getJson('/api/v1/sites/'.$siteId.'/livechat')
        ->json('data.public_key');

    $started = test()->postJson('/api/v1/public/livechat/'.$key.'/conversations', [
        'name' => 'Pat',
        'email' => 'pat@fallback.test',
        'phone' => '1',
    ])->assertCreated()->json('data');

    return ['key' => $key, 'conversation' => $started];
}

it('answers the visitor and fetches a human when the AI reply fails', function () {
    $fx = aiChatFixture();
    $conversation = LivechatConversation::query()->findOrFail($fx['conversation']['id']);

    $message = $conversation->messages()->create(['role' => 'visitor', 'body' => 'Do you ship to Spain?']);
    $conversation->update(['agent_typing_until' => now()->addSeconds(90)]);

    (new GenerateLivechatAiReply($conversation->id, $message->id))
        ->failed(new RuntimeException('provider exploded'));

    $conversation->refresh();

    // Something is said, rather than the indicator simply stopping.
    $last = $conversation->messages()->orderByDesc('id')->first();
    expect($last->role)->toBe('ai');
    expect($last->body)->toContain('colleague');

    // And a person is now on the hook for it.
    expect($conversation->handler)->toBe('human');
    expect($conversation->status)->toBe('waiting');
    expect($conversation->agent_typing_until)->toBeNull();
});

it('stays quiet when the conversation already moved to a human', function () {
    $fx = aiChatFixture();
    $conversation = LivechatConversation::query()->findOrFail($fx['conversation']['id']);

    $message = $conversation->messages()->create(['role' => 'visitor', 'body' => 'Hello']);
    $conversation->update(['handler' => 'human', 'agent_typing_until' => now()->addSeconds(90)]);

    $before = $conversation->messages()->count();

    (new GenerateLivechatAiReply($conversation->id, $message->id))
        ->failed(new RuntimeException('provider exploded'));

    $conversation->refresh();

    // An agent is already handling it; a canned apology would talk over them.
    expect($conversation->messages()->count())->toBe($before);
    expect($conversation->agent_typing_until)->toBeNull();
});

it('tells the visitor the widget label is about an agent, not an AI', function () {
    $fx = aiChatFixture();

    $script = test()->get('/api/v1/public/livechat/'.$fx['key'].'/widget.js')->assertOk()->getContent();

    expect($script)->toContain('Agent is checking the details');
    expect($script)->not->toContain('AI is checking the details');
});

/**
 * Every queue a job posts to has to be one a worker drains, or the job simply
 * never runs. `livechat` was missing from the documented worker command and
 * `analytics` from both it and Horizon, so those jobs sat forever.
 */
it('processes every queue the application actually uses', function () {
    $used = [];
    foreach (File::allFiles(app_path()) as $file) {
        preg_match_all("/onQueue\(['\"]([a-z_]+)['\"]\)/", $file->getContents(), $matches);
        foreach ($matches[1] as $queue) {
            $used[$queue] = true;
        }
    }
    $used = array_keys($used);
    expect($used)->not->toBeEmpty();

    $horizon = config('horizon.defaults.supervisor-1.queue', []);
    foreach ($used as $queue) {
        expect($horizon)->toContain($queue);
    }

    // The deploy guide's plain worker is what a non-Horizon install runs.
    $documented = File::get(base_path('DEPLOY.md'));
    preg_match('/queue:work --queue=([a-z,]+)/', $documented, $found);
    expect($found)->not->toBeEmpty();
    foreach ($used as $queue) {
        expect(explode(',', $found[1]))->toContain($queue);
    }
});
