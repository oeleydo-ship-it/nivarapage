<?php

namespace App\Services\Cloudflare;

class FallbackOriginService
{
    public function __construct(private readonly CloudflareClient $client) {}

    public function origin(): string
    {
        return (string) config('services.cloudflare.fallback_origin');
    }

    public function sync(): array
    {
        $origin = $this->origin();
        if ($origin === '') {
            return ['success' => false, 'errors' => [['message' => 'Fallback origin is not configured.']]];
        }

        return $this->client->request('PUT', 'zones/'.$this->client->zoneId().'/custom_hostnames/fallback_origin', [
            'json' => ['origin' => $origin],
        ]);
    }
}
