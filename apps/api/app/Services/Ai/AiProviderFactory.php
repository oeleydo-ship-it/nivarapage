<?php

namespace App\Services\Ai;

class AiProviderFactory
{
    public function make(AiConfig $config): AiProvider
    {
        return match ($config->provider) {
            'fake' => app(FakeAiProvider::class),
            'anthropic' => new AnthropicProvider($config),
            'kimi', 'moonshot' => new OpenAiProvider($config),
            default => new OpenAiProvider($config),
        };
    }
}
