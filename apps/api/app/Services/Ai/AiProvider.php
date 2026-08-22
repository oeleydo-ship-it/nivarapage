<?php

namespace App\Services\Ai;

/**
 * Minimal completion contract every AI backend implements.
 *
 * Providers only ever return raw text; parsing, repairing and validating the
 * model output is the caller's job (see AiGenerator + AiSectionRepair).
 */
interface AiProvider
{
    public function name(): string;

    /**
     * @param  array{max_tokens?:int,temperature?:float,json?:bool}  $options
     *
     * @throws AiProviderException
     */
    public function complete(string $system, string $prompt, array $options = []): string;
}
