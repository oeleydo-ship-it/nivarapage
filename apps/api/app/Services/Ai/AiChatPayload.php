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

        if (self::usesCompletionTokens($model)) {
            $payload['max_completion_tokens'] = $max;
        } else {
            $payload['max_tokens'] = $max;
        }

        if (self::supportsTemperature($model)) {
            $payload['temperature'] = (float) ($options['temperature'] ?? $config->temperature);
        }

        if ($json) {
            $payload['response_format'] = ['type' => 'json_object'];
        }

        if (self::isKimiK25($model)) {
            $payload['thinking'] = ['type' => 'disabled'];
        }

        if (self::isKimiK3($model)) {
            $payload['reasoning_effort'] = $max <= 64 ? 'low' : 'high';
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

    public static function supportsTemperature(string $model): bool
    {
        $model = strtolower($model);

        return ! str_starts_with($model, 'gpt-5')
            && ! self::isKimiK3($model)
            && ! str_starts_with($model, 'kimi-k2.7');
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
