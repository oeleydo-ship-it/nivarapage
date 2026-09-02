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
    /**
     * How often to tell the caller the request is still alive. Comfortably
     * inside the tightest idle limit in front of us, which is nginx's 60s.
     */
    private const HEARTBEAT_SECONDS = 10.0;

    public function __construct(private readonly AiConfig $config) {}

    public function name(): string
    {
        return $this->config->provider;
    }

    /**
     * Why nothing came back, in terms someone can act on.
     *
     * "The AI provider returned an empty response" is true of every one of
     * these and useless for all of them. A reasoning model that used its whole
     * budget thinking is the common one, and the fix is a bigger ceiling.
     *
     * @param  array<string, mixed>|null  $body
     */
    private static function emptyReason(?array $body): string
    {
        $choice = is_array($body['choices'][0] ?? null) ? $body['choices'][0] : [];
        $finish = is_string($choice['finish_reason'] ?? null) ? $choice['finish_reason'] : '';
        $reasoning = $choice['message']['reasoning_content'] ?? null;

        if ($finish === 'length') {
            return is_string($reasoning) && trim($reasoning) !== ''
                ? 'The model spent its whole token budget thinking and never wrote an answer. Raise Max tokens in Admin → AI, or pick a model that does not reason.'
                : 'The model hit its token limit before finishing. Raise Max tokens in Admin → AI.';
        }

        if ($finish === 'content_filter') {
            return 'The provider blocked this request with a content filter.';
        }

        if (is_string($reasoning) && trim($reasoning) !== '') {
            return 'The model returned its reasoning but no answer. Raise Max tokens in Admin → AI, or pick a model that does not reason.';
        }

        return 'The AI provider returned an empty response'.($finish !== '' ? ' (finish reason: '.$finish.').' : '.');
    }

    public function complete(string $system, string $prompt, array $options = []): string
    {
        $payload = AiChatPayload::openaiCompatible($this->config, $system, $prompt, $options);

        try {
            $request = Http::withToken($this->config->apiKey ?? '')
                ->connectTimeout(20)
                ->timeout(max(30, $this->config->timeout))
                ->acceptJson();

            // A whole-site generation is a minute or more of silence while the
            // model writes, and everything between the browser and here gives up
            // on an idle connection long before that - nginx at 60 seconds,
            // Cloudflare at 100. curl calls this while it waits, so the caller
            // can keep the stream alive without knowing anything about HTTP.
            $beat = $options['on_progress'] ?? null;
            if (is_callable($beat)) {
                $last = 0.0;
                $request = $request->withOptions(['progress' => function () use ($beat, &$last): void {
                    $now = microtime(true);
                    if ($now - $last < self::HEARTBEAT_SECONDS) {
                        return;
                    }
                    $last = $now;
                    $beat();
                }]);
            }

            $response = $request->post(rtrim($this->config->baseUrl, '/').'/chat/completions', $payload);
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

        // Some OpenAI-compatible APIs return the content as a list of parts
        // rather than a string; Moonshot does this for some models.
        if (is_array($text)) {
            $text = implode('', array_map(
                static fn ($part) => is_array($part) ? (string) ($part['text'] ?? '') : (string) $part,
                $text,
            ));
        }

        if (! is_string($text) || trim($text) === '') {
            $text = $response->json('output_text');
        }

        if (! is_string($text) || trim($text) === '') {
            throw new AiProviderException(self::emptyReason($response->json()));
        }

        return $text;
    }
}
