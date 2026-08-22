<?php

namespace App\Services\Ai;

/**
 * Extracts a JSON object from a completion, tolerating the usual model noise
 * (code fences, a leading sentence, trailing prose).
 */
final class AiJson
{
    /**
     * @return array<string, mixed>|null
     */
    public static function object(string $raw): ?array
    {
        $text = trim($raw);

        // Strip ```json … ``` fences.
        if (str_starts_with($text, '```')) {
            $text = preg_replace('/^```[a-zA-Z]*\s*/', '', $text) ?? $text;
            $text = preg_replace('/```\s*$/', '', $text) ?? $text;
            $text = trim($text);
        }

        $decoded = json_decode($text, true);
        if (is_array($decoded)) {
            return self::normalise($decoded);
        }

        $start = strpos($text, '{');
        $end = strrpos($text, '}');
        if ($start !== false && $end !== false && $end > $start) {
            $decoded = json_decode(substr($text, $start, $end - $start + 1), true);
            if (is_array($decoded)) {
                return self::normalise($decoded);
            }
        }

        $start = strpos($text, '[');
        $end = strrpos($text, ']');
        if ($start !== false && $end !== false && $end > $start) {
            $decoded = json_decode(substr($text, $start, $end - $start + 1), true);
            if (is_array($decoded)) {
                return self::normalise($decoded);
            }
        }

        return null;
    }

    /**
     * @param  array<mixed>  $decoded
     * @return array<string, mixed>
     */
    private static function normalise(array $decoded): array
    {
        // A bare array of sections is a common shortcut the model takes.
        return array_is_list($decoded) ? ['sections' => $decoded] : $decoded;
    }
}
