<?php

namespace App\Services\Ai;

/**
 * Turns an upstream failure into a message that is safe to show an operator:
 * status-based wording plus a trimmed provider message with anything that looks
 * like a credential removed.
 */
final class AiErrorMessage
{
    public static function from(int $status, mixed $providerMessage): string
    {
        $prefix = match (true) {
            $status === 401 || $status === 403 => 'The AI provider rejected the API key.',
            $status === 404 => 'The AI provider rejected the model or endpoint.',
            $status === 429 => 'The AI provider is rate limiting this key.',
            $status >= 500 => 'The AI provider is unavailable right now.',
            default => 'The AI provider returned an error.',
        };

        $detail = is_string($providerMessage) ? self::scrub($providerMessage) : '';

        return $detail === '' ? $prefix : $prefix.' '.$detail;
    }

    public static function scrub(string $message): string
    {
        $message = preg_replace('/\b(sk|pk|rk)[-_][A-Za-z0-9\-_]{8,}/', '[redacted]', $message) ?? $message;
        $message = preg_replace('/\b[A-Za-z0-9\-_]{32,}\b/', '[redacted]', $message) ?? $message;

        return trim(mb_substr($message, 0, 300));
    }
}
