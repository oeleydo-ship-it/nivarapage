<?php

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * AI failures the dashboard is expected to handle gracefully. The `error` code
 * drives the UI state (admin disabled AI, no key, provider down, bad output).
 */
class AiException extends HttpException
{
    public function __construct(string $message, public readonly string $error, int $status = 503)
    {
        parent::__construct($status, $message);
    }

    public static function disabled(): self
    {
        return new self('AI features are turned off by the platform administrator.', 'ai_disabled', 503);
    }

    public static function notConfigured(): self
    {
        return new self('AI is not configured yet. An administrator must add a provider API key.', 'ai_not_configured', 503);
    }

    public static function providerError(string $message): self
    {
        return new self($message, 'ai_provider_error', 502);
    }

    public static function invalidOutput(string $message = 'The AI response could not be turned into page content. Try again with a more specific prompt.'): self
    {
        return new self($message, 'ai_invalid_output', 422);
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'error' => $this->error,
        ], $this->getStatusCode());
    }
}
