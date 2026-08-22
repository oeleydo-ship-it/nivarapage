<?php

namespace App\Services\Ai;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

/**
 * Chat-completions provider. Works for OpenAI itself and for any
 * OpenAI-compatible endpoint (Azure gateways, OpenRouter, Ollama, vLLM, …)
 * by pointing `base_url` elsewhere.
 */
class OpenAiProvider implements AiProvider
{
    public function __construct(private readonly AiConfig $config) {}

    public function name(): string
    {
        return $this->config->provider;
    }

    public function complete(string $system, string $prompt, array $options = []): string
    {
        $payload = AiChatPayload::openaiCompatible($this->config, $system, $prompt, $options);

        try {
            $response = Http::withToken($this->config->apiKey ?? '')
                ->connectTimeout(20)
                ->timeout(max(30, $this->config->timeout))
                ->acceptJson()
                ->post(rtrim($this->config->baseUrl, '/').'/chat/completions', $payload);
        } catch (ConnectionException $exception) {
            throw new AiProviderException('Could not reach the AI provider: '.$exception->getMessage());
        }

        if ($response->failed()) {
            throw new AiProviderException(AiErrorMessage::from(
                $response->status(),
                $response->json('error.message') ?? $response->json('message'),
            ));
        }

        $text = $response->json('choices.0.message.content');
        if (! is_string($text) || trim($text) === '') {
            $text = $response->json('output_text');
        }

        if (! is_string($text) || trim($text) === '') {
            throw new AiProviderException('The AI provider returned an empty response.');
        }

        return $text;
    }
}
