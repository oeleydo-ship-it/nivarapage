<?php

namespace App\Services;

use App\Models\Site;
use Illuminate\Support\Facades\URL;

class PreviewTokenService
{
    public function create(Site $site): string
    {
        // Relative so the renderer can POST using API_URL (e.g. 127.0.0.1)
        // even when APP_URL is localhost — absolute signatures include the host.
        return URL::temporarySignedRoute(
            'public.preview',
            now()->addMinutes(30),
            ['site' => $site->id],
            absolute: false,
        );
    }

    public function payload(Site $site): array
    {
        return [
            'token_url' => $this->create($site),
            'expires_at' => now()->addMinutes(30)->toIso8601String(),
            'site_id' => $site->id,
        ];
    }
}
