<?php

namespace App\Services\Ai;

/**
 * Effective AI configuration: the encrypted settings row merged over the
 * environment defaults from config/ai.php.
 */
final class AiConfig
{
    public function __construct(
        public readonly bool $enabled,
        public readonly string $provider,
        public readonly string $model,
        public readonly string $baseUrl,
        public readonly ?string $apiKey,
        public readonly int $maxTokens,
        public readonly float $temperature,
        public readonly int $timeout,
        public readonly string $keySource = 'none',
    ) {}

    public function configured(): bool
    {
        return is_string($this->apiKey) && trim($this->apiKey) !== '' && $this->baseUrl !== '';
    }

    /** Last four characters only, so operators can tell which key is loaded. */
    public function keyHint(): ?string
    {
        if (! is_string($this->apiKey) || trim($this->apiKey) === '') {
            return null;
        }

        return '••••'.mb_substr(trim($this->apiKey), -4);
    }
}
