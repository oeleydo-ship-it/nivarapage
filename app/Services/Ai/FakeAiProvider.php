<?php

namespace App\Services\Ai;

/**
 * Test/demo provider. Tests queue canned completions with `push()` (or an
 * exception with `pushFailure()`), so the suite never performs a live call.
 */
class FakeAiProvider implements AiProvider
{
    /** @var list<string|AiProviderException> */
    private static array $queue = [];

    /** @var list<array{system:string,prompt:string,options:array<string,mixed>}> */
    private static array $calls = [];

    public static function push(string $response): void
    {
        self::$queue[] = $response;
    }

    public static function pushFailure(string $message = 'Provider exploded'): void
    {
        self::$queue[] = new AiProviderException($message);
    }

    public static function reset(): void
    {
        self::$queue = [];
        self::$calls = [];
    }

    /**
     * @return list<array{system:string,prompt:string,options:array<string,mixed>}>
     */
    public static function calls(): array
    {
        return self::$calls;
    }

    public function name(): string
    {
        return 'fake';
    }

    public function complete(string $system, string $prompt, array $options = []): string
    {
        self::$calls[] = compact('system', 'prompt', 'options');

        $next = array_shift(self::$queue);

        if ($next instanceof AiProviderException) {
            throw $next;
        }

        if ($next === null) {
            throw new AiProviderException('No fake AI response queued.');
        }

        return $next;
    }
}
