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

    /**
     * Art-direction answers, queued separately.
     *
     * Generating a blank site asks two questions: which kit and palette, then
     * the pages themselves. Almost every test only cares about the second, so
     * this queue answers the first without a test having to know it was asked.
     * Push here to steer the choice, or to hand back something unusable and see
     * generation fall back.
     *
     * @var list<string>
     */
    private static array $artQueue = [];

    /** @var list<array{system:string,prompt:string,options:array<string,mixed>}> */
    private static array $calls = [];

    private const DEFAULT_ART = '{"kit":"voltera","theme":{"primary":"#1d4ed8"},"motion":{"animation":"fade-up"},"reason":"Default test art direction."}';

    public static function push(string $response): void
    {
        self::$queue[] = $response;
    }

    public static function pushArt(string $response): void
    {
        self::$artQueue[] = $response;
    }

    public static function pushFailure(string $message = 'Provider exploded'): void
    {
        self::$queue[] = new AiProviderException($message);
    }

    public static function reset(): void
    {
        self::$queue = [];
        self::$artQueue = [];
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

        // Art direction is answered from its own queue so it never eats the
        // response a test queued for the generation it actually cares about.
        if (str_contains($system, 'You are the art director')) {
            return array_shift(self::$artQueue) ?? self::DEFAULT_ART;
        }

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
