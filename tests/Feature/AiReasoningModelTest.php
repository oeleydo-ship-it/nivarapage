<?php

use App\Services\Ai\AiChatPayload;
use App\Services\Ai\AiConfig;
use App\Services\Ai\AiProviderException;
use App\Services\Ai\OpenAiProvider;
use Illuminate\Support\Facades\Http;

/**
 * A reasoning model spends the same allowance thinking and answering.
 *
 * Ask one for sixteen tokens - which is what the connectivity probe did - and
 * it uses them all deciding what to say, returns nothing, and the only clue
 * was "The AI provider returned an empty response".
 */
function kimiConfig(string $model = 'kimi-k3', int $maxTokens = 4000): AiConfig
{
    return new AiConfig(true, 'kimi', $model, 'https://api.moonshot.ai/v1', 'sk-test', $maxTokens, 0.6, 30);
}

it('gives a reasoning model room to answer even when asked for very little', function () {
    $probe = AiChatPayload::openaiCompatible(kimiConfig(), 'sys', 'user', ['max_tokens' => 16]);

    expect($probe['max_completion_tokens'])->toBe(AiChatPayload::REASONING_FLOOR);
    expect($probe)->not->toHaveKey('max_tokens');
});

it('leaves a generous budget alone', function () {
    $payload = AiChatPayload::openaiCompatible(kimiConfig(), 'sys', 'user', ['max_tokens' => 16000]);

    expect($payload['max_completion_tokens'])->toBe(16000);
});

it('does not inflate a model that answers without thinking first', function () {
    // K2.5 is told not to think, so a small ceiling is a real instruction.
    $payload = AiChatPayload::openaiCompatible(kimiConfig('kimi-k2.5'), 'sys', 'user', ['max_tokens' => 16]);

    expect($payload['max_tokens'])->toBe(16);
    expect($payload['thinking']['type'])->toBe('disabled');
});

it('keeps both Kimi models selectable and correctly shaped', function () {
    $k25 = AiChatPayload::openaiCompatible(kimiConfig('kimi-k2.5'), 'sys', 'user', ['json' => true]);
    $k3 = AiChatPayload::openaiCompatible(kimiConfig('kimi-k3'), 'sys', 'user', ['json' => true]);

    // K2.5: a plain chat model once thinking is off.
    expect($k25)->toHaveKey('max_tokens')->toHaveKey('temperature')->not->toHaveKey('reasoning_effort');

    // K3: fixed temperature, completion-token budget, low effort.
    expect($k3)->toHaveKey('max_completion_tokens')->not->toHaveKey('temperature');
    expect($k3['reasoning_effort'])->toBe('low');

    foreach ([$k25, $k3] as $payload) {
        expect($payload['response_format']['type'])->toBe('json_object');
        expect($payload['messages'])->toHaveCount(2);
    }

    expect(collect(config('ai.models.kimi'))->pluck('id')->all())
        ->toContain('kimi-k2.5')
        ->toContain('kimi-k3');
});

it('says the model ran out of budget rather than that it said nothing', function () {
    Http::fake([
        '*' => Http::response([
            'choices' => [[
                'finish_reason' => 'length',
                'message' => ['content' => '', 'reasoning_content' => 'Thinking about the request at length...'],
            ]],
        ]),
    ]);

    expect(fn () => (new OpenAiProvider(kimiConfig()))->complete('sys', 'user'))
        ->toThrow(AiProviderException::class, 'spent its whole token budget thinking');
});

it('names the finish reason when there is nothing else to go on', function () {
    Http::fake([
        '*' => Http::response(['choices' => [['finish_reason' => 'stop', 'message' => ['content' => '']]]]),
    ]);

    expect(fn () => (new OpenAiProvider(kimiConfig()))->complete('sys', 'user'))
        ->toThrow(AiProviderException::class, 'finish reason: stop');
});

it('reads content returned as parts rather than a plain string', function () {
    Http::fake([
        '*' => Http::response([
            'choices' => [['finish_reason' => 'stop', 'message' => ['content' => [
                ['type' => 'text', 'text' => '{"ok":'],
                ['type' => 'text', 'text' => 'true}'],
            ]]]],
        ]),
    ]);

    expect((new OpenAiProvider(kimiConfig()))->complete('sys', 'user'))->toBe('{"ok":true}');
});

it('still returns a normal string answer', function () {
    Http::fake([
        '*' => Http::response(['choices' => [['finish_reason' => 'stop', 'message' => ['content' => 'ok']]]]),
    ]);

    expect((new OpenAiProvider(kimiConfig()))->complete('sys', 'user'))->toBe('ok');
});
