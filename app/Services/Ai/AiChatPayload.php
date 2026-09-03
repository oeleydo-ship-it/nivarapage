<?php

namespace App\Services\Ai;

/**
 * Builds a chat-completions body that newer models will actually accept.
 *
 * GPT-5.x wants max_completion_tokens and rejects custom temperature.
 * Kimi K2.5 thinks by default (disable it for JSON). Kimi K3 fixes
 * temperature and uses reasoning_effort instead.
 */
final class AiChatPayload
{
    /**
     * Least a reasoning model needs before it can answer at all: enough to
     * think and still have room to write. Applied only to models that reason,
     * so a plain chat model keeps whatever ceiling it was given.
     */
    public const REASONING_FLOOR = 1024;

    /**
     * @param  array<string, mixed>  $options
     * @return array<string, mixed>
     */
    public static function openaiCompatible(AiConfig $config, string $system, string $prompt, array $options = []): array
    {
        $model = $config->model;
        $max = max(16, (int) ($options['max_tokens'] ?? $config->maxTokens));
        $json = (bool) ($options['json'] ?? false);

        $payload = [
            'model' => $model,
            'messages' => [
                ['role' => 'system', 'content' => $system],
                ['role' => 'user', 'content' => $prompt],
            ],
        ];

        // A reasoning model spends the same budget thinking and answering, so a
        // small ceiling is used up before it writes anything and the reply comes
        // back empty. The connectivity probe asks for 16 tokens, which no
        // reasoning model can answer in.
        if (self::reasons($model)) {
            $max = max($max, self::REASONING_FLOOR);
        }

        if (self::usesCompletionTokens($model)) {
            $payload['max_completion_tokens'] = $max;
        } else {
            $payload['max_tokens'] = $max;
        }

        if (self::supportsTemperature($model)) {
            $payload['temperature'] = self::fixedTemperature($model)
                ?? (float) ($options['temperature'] ?? $config->temperature);
        }

        if ($json) {
            $payload['response_format'] = ['type' => 'json_object'];
        }

        if (self::isKimiK25($model)) {
            $payload['thinking'] = ['type' => 'disabled'];
        }

        if (self::isKimiK3($model)) {
            // Low, not high. What is being asked for here is structured JSON
            // built from a catalogue that is already in the prompt, and every
            // token spent deliberating is one not spent writing the answer -
            // on a tight budget that is the difference between a site and an
            // empty response.
            $payload['reasoning_effort'] = 'low';
        }

        return $payload;
    }

    /**
     * @param  array<string, mixed>  $options
     * @return array<string, mixed>
     */
    public static function anthropic(AiConfig $config, string $system, string $prompt, array $options = []): array
    {
        $model = $config->model;
        $max = max(16, (int) ($options['max_tokens'] ?? $config->maxTokens));

        if (self::isOpus5($model)) {
            $max = max($max, 16000);
        }

        $payload = [
            'model' => $model,
            'max_tokens' => $max,
            'system' => $system,
            'messages' => [['role' => 'user', 'content' => $prompt]],
        ];

        if (! self::isOpus5($model)) {
            $payload['temperature'] = (float) ($options['temperature'] ?? $config->temperature);
        }

        return $payload;
    }

    public static function usesCompletionTokens(string $model): bool
    {
        $model = strtolower($model);

        return str_starts_with($model, 'gpt-5') || self::isKimiK3($model);
    }

    /**
     * The one temperature a model will accept, when it accepts only one.
     *
     * Moonshot answers anything else on K2.5 with "invalid temperature: only
     * 0.6 is allowed for this model" - which both the 0.7 default and the
     * connectivity probe's deliberate 0 walked straight into, so the model
     * could be selected and saved but never used. Pinning it where the body is
     * built fixes generation and the probe together, instead of asking every
     * caller to remember which models are fussy.
     */
    public static function fixedTemperature(string $model): ?float
    {
        return self::isKimiK25($model) ? 0.6 : null;
    }

    public static function supportsTemperature(string $model): bool
    {
        $model = strtolower($model);

        return ! str_starts_with($model, 'gpt-5')
            && ! self::isKimiK3($model)
            && ! str_starts_with($model, 'kimi-k2.7');
    }

    /**
     * Models that think before they answer, and so need headroom for both.
     *
     * K2.5 reasons by default but is told not to above; K3 always does, and
     * GPT-5.x reasons too.
     */
    public static function reasons(string $model): bool
    {
        $model = strtolower($model);

        return self::isKimiK3($model) || str_starts_with($model, 'gpt-5');
    }

    public static function isKimiK25(string $model): bool
    {
        return str_starts_with(strtolower($model), 'kimi-k2.5');
    }

    public static function isKimiK3(string $model): bool
    {
        return str_starts_with(strtolower($model), 'kimi-k3');
    }

    public static function isOpus5(string $model): bool
    {
        return (bool) preg_match('/claude-opus-5|^opus-5/i', $model);
    }
}
