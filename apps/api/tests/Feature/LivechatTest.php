<?php

use App\Jobs\GenerateLivechatAiReply;
use App\Models\Client;
use App\Models\LivechatConversation;
use App\Models\LivechatMessage;
use App\Services\Ai\FakeAiProvider;
use Illuminate\Support\Facades\Queue;

it('starts a public chat, captures a CRM lead, and answers with AI', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);
    enableAi();
    FakeAiProvider::reset();
    FakeAiProvider::push('We are open weekdays 9 to 5.');

    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Harbor', 'subdomain' => 'harborchat'])
        ->assertCreated()
        ->json('data.id');

    $this->withHeaders($headers)
        ->putJson('/api/v1/sites/'.$siteId.'/livechat', [
            'enabled' => true,
            'ai_enabled' => true,
            'mode' => 'ai_first',
            'greeting' => 'Welcome to Harbor',
        ])
        ->assertOk()
        ->assertJsonPath('data.enabled', true);

    $key = $this->withHeaders($headers)
        ->getJson('/api/v1/sites/'.$siteId.'/livechat')
        ->assertOk()
        ->json('data.public_key');

    $this->withHeaders($headers)
        ->postJson('/api/v1/sites/'.$siteId.'/livechat/knowledge', [
            'title' => 'Hours',
            'content' => 'Harbor is open weekdays 9 to 5.',
        ])
        ->assertCreated();

    $started = $this->postJson('/api/v1/public/livechat/'.$key.'/conversations', [
        'name' => 'Ava Patel',
        'email' => 'ava@harbor.test',
        'phone' => '+15551212',
        'page_url' => 'https://harbor.test/pricing',
        'locale' => 'en-US',
        'timezone' => 'America/New_York',
        'city' => 'Brooklyn',
        'country' => 'US',
    ], ['User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0'])
        ->assertCreated()
        ->json('data');

    expect($started['visitor_name'])->toBe('Ava Patel');
    expect($started['visitor_token'])->toBeString()->not->toBeEmpty();
    expect($started['browser'])->toBe('Chrome');
    expect($started['os'])->toBe('macOS');
    expect($started['site_id'])->toBe($siteId);

    $client = Client::query()->where('email', 'ava@harbor.test')->first();
    expect($client)->not->toBeNull();
    expect($client->source)->toBe('livechat');
    expect($client->phone)->toBe('+15551212');

    $this->withHeaders(['X-Livechat-Token' => $started['visitor_token']])
        ->postJson('/api/v1/public/livechat/'.$key.'/conversations/'.$started['uuid'].'/messages', [
            'body' => 'What are your hours?',
        ])
        ->assertCreated();

    $ai = LivechatMessage::query()->where('role', 'ai')->first();
    expect($ai?->body)->toBe('We are open weekdays 9 to 5.');

    $inbox = $this->withHeaders($headers)
        ->getJson('/api/v1/livechat/conversations')
        ->assertOk()
        ->json('data');
    expect($inbox)->not->toBeEmpty();

    $this->withHeaders($headers)
        ->postJson('/api/v1/livechat/conversations/'.$inbox[0]['id'].'/messages', [
            'body' => 'A human will take it from here.',
        ])
        ->assertCreated();

    expect(LivechatConversation::query()->first()->handler)->toBe('human');
    expect(LivechatConversation::query()->first()->client_id)->toBe($client->id);
});

it('returns grounded AI metadata, suggested replies, and hands off to a human', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);
    enableAi();
    FakeAiProvider::reset();
    FakeAiProvider::push(json_encode([
        'reply' => 'Weekday appointments are available from 9 AM to 5 PM.',
        'confidence' => 'high',
        'handoff' => false,
        'handoff_reason' => null,
        'suggested_replies' => ['Book an appointment', 'What should I bring?'],
        'sources' => ['Appointments'],
    ]));

    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Clinic', 'subdomain' => 'clinicchat'])
        ->assertCreated()
        ->json('data.id');
    $key = $this->withHeaders($headers)
        ->putJson('/api/v1/sites/'.$siteId.'/livechat', [
            'enabled' => true,
            'ai_enabled' => true,
            'mode' => 'ai_first',
            'require_contact' => false,
        ])
        ->assertOk()
        ->json('data.public_key');
    $this->withHeaders($headers)
        ->postJson('/api/v1/sites/'.$siteId.'/livechat/knowledge', [
            'title' => 'Appointments',
            'content' => 'Appointments are available weekdays from 9 AM to 5 PM.',
        ])
        ->assertCreated();

    $started = $this->postJson('/api/v1/public/livechat/'.$key.'/conversations', [])
        ->assertCreated()
        ->json('data');
    $visitorHeaders = ['X-Livechat-Token' => $started['visitor_token']];

    $this->withHeaders($visitorHeaders)
        ->postJson('/api/v1/public/livechat/'.$key.'/conversations/'.$started['uuid'].'/messages', [
            'body' => 'When can I book an appointment?',
        ])
        ->assertCreated();

    $answer = LivechatMessage::query()->where('role', 'ai')->latest('id')->firstOrFail();
    expect($answer->meta['confidence'])->toBe('high');
    expect($answer->meta['sources'])->toBe(['Appointments']);
    expect($answer->meta['suggested_replies'])->toContain('Book an appointment');

    $handoff = $this->withHeaders($visitorHeaders)
        ->postJson('/api/v1/public/livechat/'.$key.'/conversations/'.$started['uuid'].'/handoff', [
            'reason' => 'Visitor wants help booking.',
        ])
        ->assertOk()
        ->json('data');

    expect($handoff['handler'])->toBe('human');
    expect($handoff['status'])->toBe('waiting');
    expect(collect($handoff['messages'])->pluck('meta.kind'))->toContain('handoff');
});

it('lets an agent take over from AI and announces it to the visitor widget', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);
    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Takeover', 'subdomain' => 'takeoverchat'])
        ->assertCreated()
        ->json('data.id');
    $key = $this->withHeaders($headers)
        ->putJson('/api/v1/sites/'.$siteId.'/livechat', [
            'enabled' => true,
            'ai_enabled' => true,
            'mode' => 'ai_first',
            'require_contact' => false,
        ])
        ->assertOk()
        ->json('data.public_key');
    $started = $this->postJson('/api/v1/public/livechat/'.$key.'/conversations', [])
        ->assertCreated()
        ->json('data');

    $taken = $this->withHeaders($headers)
        ->postJson('/api/v1/livechat/conversations/'.$started['id'].'/takeover')
        ->assertOk()
        ->json('data');

    expect($taken['handler'])->toBe('human');
    expect($taken['status'])->toBe('assigned');
    expect($taken['assigned_user_id'])->toBe($user->id);
    expect($taken['assignee']['name'])->toBe($user->name);

    $visitor = $this->withHeaders(['X-Livechat-Token' => $started['visitor_token']])
        ->getJson('/api/v1/public/livechat/'.$key.'/conversations/'.$started['uuid'])
        ->assertOk()
        ->json('data');

    expect($visitor['handler'])->toBe('human');
    expect($visitor['assignee']['name'])->toBe($user->name);
    expect(collect($visitor['messages'])->pluck('meta.kind'))->toContain('takeover');
});

it('shows typing only after the visitor sends, and stops after the agent replies', function () {
    Queue::fake();
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);
    enableAi();

    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Typing', 'subdomain' => 'typingchat'])
        ->assertCreated()
        ->json('data.id');

    $this->withHeaders($headers)
        ->putJson('/api/v1/sites/'.$siteId.'/livechat', [
            'enabled' => true,
            'ai_enabled' => true,
            'mode' => 'ai_first',
        ])
        ->assertOk();

    $key = $this->withHeaders($headers)
        ->getJson('/api/v1/sites/'.$siteId.'/livechat')
        ->json('data.public_key');

    $started = $this->postJson('/api/v1/public/livechat/'.$key.'/conversations', [
        'name' => 'Pat',
        'email' => 'pat@typing.test',
        'phone' => '1',
    ])->assertCreated()->json('data');

    $poll = fn () => $this->withHeaders(['X-Livechat-Token' => $started['visitor_token']])
        ->getJson('/api/v1/public/livechat/'.$key.'/conversations/'.$started['uuid'])
        ->assertOk()
        ->json('data');

    expect($poll()['agent_typing'])->toBeFalse();

    $this->withHeaders(['X-Livechat-Token' => $started['visitor_token']])
        ->postJson('/api/v1/public/livechat/'.$key.'/conversations/'.$started['uuid'].'/messages', [
            'body' => 'Hello',
        ])
        ->assertCreated();

    expect($poll()['agent_typing'])->toBeTrue();
    Queue::assertPushed(GenerateLivechatAiReply::class);

    $conversation = LivechatConversation::query()->findOrFail($started['id']);
    $this->withHeaders($headers)
        ->postJson('/api/v1/livechat/conversations/'.$conversation->id.'/messages', [
            'body' => 'Thanks, we got your note.',
        ])
        ->assertCreated();

    expect($poll()['agent_typing'])->toBeFalse();

    $this->withHeaders($headers)
        ->postJson('/api/v1/livechat/conversations/'.$conversation->id.'/typing')
        ->assertOk();

    expect($poll()['agent_typing'])->toBeFalse();
});

it('rejects chats when the widget is disabled', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);
    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Quiet', 'subdomain' => 'quietchat'])
        ->assertCreated()
        ->json('data.id');

    $key = $this->withHeaders($headers)
        ->putJson('/api/v1/sites/'.$siteId.'/livechat', ['enabled' => false])
        ->assertOk()
        ->json('data.public_key');

    $this->getJson('/api/v1/public/livechat/'.$key)->assertNotFound();
    $this->postJson('/api/v1/public/livechat/'.$key.'/conversations', [
        'name' => 'Sam',
        'email' => 'sam@test.com',
        'phone' => '1',
    ])->assertForbidden();
});

it('does not leak conversations across workspaces', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);
    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Alpha', 'subdomain' => 'alphachat'])
        ->assertCreated()
        ->json('data.id');
    $key = $this->withHeaders($headers)
        ->putJson('/api/v1/sites/'.$siteId.'/livechat', ['enabled' => true, 'ai_enabled' => false, 'mode' => 'human_first'])
        ->json('data.public_key');

    $started = $this->postJson('/api/v1/public/livechat/'.$key.'/conversations', [
        'name' => 'Lee',
        'email' => 'lee@alpha.test',
        'phone' => '555',
    ])->assertCreated()->json('data');

    ['user' => $other, 'workspace' => $otherWorkspace] = tenant();
    $this->withHeaders(authHeaders($other, $otherWorkspace))
        ->getJson('/api/v1/livechat/conversations/'.$started['id'])
        ->assertNotFound();
});
