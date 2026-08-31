<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class TurnstileService
{
    public function configured(): bool
    {
        return filled(config('uidesired.turnstile.site_key'))
            && filled(config('uidesired.turnstile.secret'));
    }

    public function verify(?string $token, ?string $ip = null): bool
    {
        // A form setting may outlive its environment variables (for example after
        // importing a template into a local workspace). Do not make every public
        // form unusable when Turnstile is not actually configured.
        if (! $this->configured()) {
            return true;
        }

        if (blank($token)) {
            return false;
        }

        $secret = (string) config('uidesired.turnstile.secret');
        $response = Http::asForm()
            ->timeout(8)
            ->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                'secret' => $secret,
                'response' => $token,
                'remoteip' => $ip,
            ]);

        return (bool) $response->json('success');
    }
}
