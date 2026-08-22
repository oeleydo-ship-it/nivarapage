<?php

namespace App\Services\Ai;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class AnthropicProvider implements AiProvider
{
    public function __construct(private readonly AiConfig $config) {}

    public function name(): string
    {
        return 'anthropic';
    }

    public function complete(string $system, string $prompt, array $options = []): string
    {
        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->config->apiKey ?? '',
                'anthropic-version' => (string) config('ai.anthropic_version', '2023-06-01'),
            ])
                ->connectTimeout(20)
                ->timeout(max(30, $this->config->timeout))
                ->acceptJson()
                ->post(rtrim($this->config->baseUrl, '/').'/v1/messages', AiChatPayload::anthropic(
                    $this->config,
                    $system,
                    $prompt,
                    $options,
                ));
        } catch (ConnectionException $exception) {
            throw new AiProviderException('Could not reach the AI provider: '.$exception->getMessage());
        }

        if ($response->failed()) {
            throw new AiProviderException(AiErrorMessage::from(
                $response->status(),
                $response->json('error.message') ?? $response->json('message'),
            ));
        }

        $blocks = $response->json('content');
        $text = '';
        foreach (is_array($blocks) ? $blocks : [] as $block) {
            if (is_array($block) && ($block['type'] ?? null) === 'text' && is_string($block['text'] ?? null)) {
                $text .= $block['text'];
            }
        }

        if (trim($text) === '') {
            throw new AiProviderException('The AI provider returned an empty response.');
        }

        return $text;
    }
}
