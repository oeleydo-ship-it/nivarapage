<?php

use App\Models\LivechatConversation;

/**
 * Sets up a site with the widget enabled and returns everything needed to drive
 * both the public visitor endpoints and the agent inbox.
 *
 * @return array{headers: array<string, string>, key: string, uuid: string, token: string, id: int}
 */
function livechatFixture(): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);

    $siteId = test()->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Unread', 'subdomain' => 'unreadchat'])
        ->assertCreated()
        ->json('data.id');

    test()->withHeaders($headers)
        ->putJson('/api/v1/sites/'.$siteId.'/livechat', ['enabled' => true, 'ai_enabled' => false, 'mode' => 'human_first'])
        ->assertOk();

    $key = test()->withHeaders($headers)
        ->getJson('/api/v1/sites/'.$siteId.'/livechat')
        ->assertOk()
        ->json('data.public_key');

    $started = test()->postJson('/api/v1/public/livechat/'.$key.'/conversations', [
        'name' => 'Unread Visitor',
        'email' => 'unread@example.test',
        'phone' => '+15550000',
    ])->assertCreated()->json('data');

    return [
        'headers' => $headers,
        'key' => $key,
        'uuid' => $started['uuid'],
        'token' => $started['visitor_token'],
        'id' => (int) $started['id'],
    ];
}

function visitorSays(array $fx, string $body): void
{
    test()->withHeaders(['X-Livechat-Token' => $fx['token']])
        ->postJson('/api/v1/public/livechat/'.$fx['key'].'/conversations/'.$fx['uuid'].'/messages', ['body' => $body])
        ->assertCreated();
}

function unreadInInbox(array $fx): int
{
    $rows = test()->withHeaders($fx['headers'])->getJson('/api/v1/livechat/conversations')->assertOk()->json('data');
    $row = collect($rows)->firstWhere('id', $fx['id']);

    return (int) ($row['unread_count'] ?? 0);
}

it('counts unread visitor messages in the inbox', function () {
    $fx = livechatFixture();
    visitorSays($fx, 'hello');
    visitorSays($fx, 'anyone there?');

    expect(unreadInInbox($fx))->toBe(2);
});

it('clears the unread badge once an agent opens the conversation', function () {
    $fx = livechatFixture();
    visitorSays($fx, 'hello');
    expect(unreadInInbox($fx))->toBe(1);

    $this->withHeaders($fx['headers'])
        ->getJson('/api/v1/livechat/conversations/'.$fx['id'])
        ->assertOk();

    expect(unreadInInbox($fx))->toBe(0);
});

it('marks a conversation unread again when the visitor writes back', function () {
    $fx = livechatFixture();
    visitorSays($fx, 'first');
    $this->withHeaders($fx['headers'])->getJson('/api/v1/livechat/conversations/'.$fx['id'])->assertOk();
    expect(unreadInInbox($fx))->toBe(0);

    $this->travel(5)->seconds();
    visitorSays($fx, 'second');

    expect(unreadInInbox($fx))->toBe(1);
});

it('does not count agent, AI or system messages as unread', function () {
    $fx = livechatFixture();

    $this->withHeaders($fx['headers'])
        ->postJson('/api/v1/livechat/conversations/'.$fx['id'].'/messages', ['body' => 'Hi, an agent here.'])
        ->assertCreated();

    // Opening the thread above already marked it read; the agent reply must not
    // put it back into the unread state.
    expect(unreadInInbox($fx))->toBe(0);
});

it('reopens a closed conversation and puts it back in the queue', function () {
    $fx = livechatFixture();

    $this->withHeaders($fx['headers'])
        ->postJson('/api/v1/livechat/conversations/'.$fx['id'].'/close')
        ->assertOk()
        ->assertJsonPath('data.status', 'closed');

    $this->withHeaders($fx['headers'])
        ->postJson('/api/v1/livechat/conversations/'.$fx['id'].'/reopen')
        ->assertOk()
        ->assertJsonPath('data.status', 'waiting');

    $conversation = LivechatConversation::query()->find($fx['id']);
    expect($conversation->closed_at)->toBeNull();
    expect($conversation->messages()->where('role', 'system')->get()->contains(
        fn ($message) => str_contains($message->body, 'reopened'),
    ))->toBeTrue();
});

it('leaves an already open conversation alone when reopened', function () {
    $fx = livechatFixture();
    $before = LivechatConversation::query()->find($fx['id'])->messages()->count();

    $this->withHeaders($fx['headers'])
        ->postJson('/api/v1/livechat/conversations/'.$fx['id'].'/reopen')
        ->assertOk();

    $after = LivechatConversation::query()->find($fx['id']);
    expect($after->status)->not->toBe('closed');
    expect($after->messages()->count())->toBe($before);
});

it('refuses to reopen a conversation in another workspace', function () {
    $fx = livechatFixture();
    ['user' => $other, 'workspace' => $otherWorkspace] = tenant();

    // The route binding is workspace-scoped, so another tenant gets a 404
    // rather than a 403 - the conversation's existence is not disclosed.
    $this->withHeaders(authHeaders($other, $otherWorkspace))
        ->postJson('/api/v1/livechat/conversations/'.$fx['id'].'/reopen')
        ->assertNotFound();

    expect(LivechatConversation::query()->find($fx['id'])->status)->not->toBe('closed');
});
