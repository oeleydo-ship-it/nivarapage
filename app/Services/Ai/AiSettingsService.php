<?php

namespace App\Services\Ai;

use App\Models\AiSetting;
use App\Support\EncryptedSettings;

/**
 * Reads and writes the platform AI configuration.
 *
 * The API key lives either in the environment or in the encrypted settings row;
 * it is never included in any array this service returns. `status()` only ever
 * exposes whether a key is configured plus a four-character hint.
 */
class AiSettingsService
{
    public const PROVIDERS = ['openai', 'anthropic', 'kimi', 'openai_compatible', 'fake'];

    public function settings(): AiSetting
    {
        return AiSetting::current();
    }

    public function config(): AiConfig
    {
        $row = $this->settings();

        $provider = $this->normaliseProvider($row->provider ?? config('ai.provider'));
        $defaults = config('ai.defaults.'.$provider, []);

        $stored = EncryptedSettings::read($row, 'api_key');
        $dbKey = $stored !== null && trim($stored) !== '' ? trim($stored) : null;
        $envKey = is_string(config('ai.api_key')) && trim((string) config('ai.api_key')) !== ''
            ? trim((string) config('ai.api_key'))
            : null;

        $baseUrl = $this->firstFilled([
            $row->base_url,
            config('ai.base_url'),
            $defaults['base_url'] ?? null,
        ]);

        return new AiConfig(
            enabled: (bool) $row->enabled,
            provider: $provider,
            model: (string) ($this->firstFilled([$row->model, config('ai.model'), $defaults['model'] ?? null]) ?? ''),
            baseUrl: (string) ($baseUrl ?? ''),
            apiKey: $dbKey ?? $envKey,
            maxTokens: max(256, (int) ($row->max_tokens ?: config('ai.max_tokens', 4000))),
            temperature: (float) ($row->temperature ?? config('ai.temperature', 0.7)),
            timeout: max(5, (int) config('ai.timeout', 90)),
            keySource: $dbKey !== null ? 'settings' : ($envKey !== null ? 'env' : 'none'),
        );
    }

    /**
     * Dashboard-facing status. Deliberately contains no secret material.
     *
     * @return array<string, mixed>
     */
    public function status(): array
    {
        $config = $this->config();
        $row = $this->settings();

        return [
            'enabled' => $config->enabled,
            'configured' => $config->configured(),
            'provider' => $config->provider,
            'providers' => array_values(array_filter(
                self::PROVIDERS,
                fn (string $provider) => $provider !== 'fake' || app()->environment('local', 'testing'),
            )),
            'model' => $config->model,
            'models' => config('ai.models', []),
            'base_url' => $config->baseUrl,
            'max_tokens' => $config->maxTokens,
            'temperature' => $config->temperature,
            'key_source' => $config->keySource,
            'key_hint' => $config->keyHint(),
            'env_key_present' => $config->keySource === 'env',
            'catalog_blocks' => count(\App\Support\BlockCatalog::types()),
            'last_tested_at' => $row->last_tested_at?->toIso8601String(),
            'last_test_status' => $row->last_test_status,
            'last_test_message' => $row->last_test_message,
        ];
    }

    /**
     * `api_key` semantics: omit the field to keep the stored key; send an empty
     * string or null to clear it (Laravel converts "" to null). Any other value
     * replaces the stored key. Falls back to AI_API_KEY when cleared.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(array $data): AiSetting
    {
        $row = $this->settings();
        EncryptedSettings::discardUnreadable($row, 'api_key');
        $update = [];

        if (array_key_exists('enabled', $data)) {
            $update['enabled'] = (bool) $data['enabled'];
        }
        if (array_key_exists('provider', $data) && $data['provider'] !== null) {
            $update['provider'] = $this->normaliseProvider($data['provider']);
        }
        foreach (['model', 'base_url'] as $key) {
            if (array_key_exists($key, $data)) {
                $value = is_string($data[$key]) ? trim($data[$key]) : null;
                $update[$key] = $value === '' ? null : $value;
            }
        }
        if (array_key_exists('max_tokens', $data) && $data['max_tokens'] !== null) {
            $update['max_tokens'] = max(256, min(128000, (int) $data['max_tokens']));
        }
        if (array_key_exists('temperature', $data) && $data['temperature'] !== null) {
            $update['temperature'] = max(0.0, min(2.0, (float) $data['temperature']));
        }
        if (array_key_exists('api_key', $data)) {
            $key = is_string($data['api_key']) ? trim($data['api_key']) : '';
            $update['api_key'] = $key === '' ? null : $key;
        }

        $row->update($update);

        return $row->fresh();
    }

    /**
     * Performs the smallest possible completion to prove the credentials work.
     *
     * @return array{ok: bool, message: string}
     */
    public function testConnection(AiProviderFactory $factory): array
    {
        $config = $this->config();

        if (! $config->configured()) {
            return $this->recordTest(false, 'No API key is configured. Set AI_API_KEY or paste a key above.');
        }

        try {
            $reply = $factory->make($config)->complete(
                'You are a connectivity probe. Reply with the single word: ok',
                'Reply with: ok',
                ['max_tokens' => 16, 'temperature' => 0, 'json' => false],
            );
        } catch (AiProviderException $exception) {
            return $this->recordTest(false, AiErrorMessage::scrub($exception->getMessage()));
        }

        return $this->recordTest(true, 'Connected to '.$config->provider.' ('.$config->model.'): "'.trim(mb_substr($reply, 0, 40)).'"');
    }

    /**
     * @return array{ok: bool, message: string}
     */
    private function recordTest(bool $ok, string $message): array
    {
        $this->settings()->update([
            'last_tested_at' => now(),
            'last_test_status' => $ok ? 'ok' : 'failed',
            'last_test_message' => $message,
        ]);

        return ['ok' => $ok, 'message' => $message];
    }

    private function normaliseProvider(mixed $provider): string
    {
        $value = is_string($provider) ? strtolower(trim($provider)) : '';
        if ($value === 'moonshot') {
            $value = 'kimi';
        }

        return in_array($value, self::PROVIDERS, true) ? $value : 'openai';
    }

    /**
     * @param  list<mixed>  $values
     */
    private function firstFilled(array $values): ?string
    {
        foreach ($values as $value) {
            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }
        }

        return null;
    }
}
