<?php

namespace App\Services\Cloudflare;

use App\Models\Domain;

class CustomHostnameService
{
    public function __construct(private readonly CloudflareClient $client) {}

    /**
     * @return array<string, mixed>
     */
    public function create(Domain $domain): array
    {
        return $this->client->request('POST', 'zones/'.$this->client->zoneId().'/custom_hostnames', [
            'json' => [
                'hostname' => $domain->hostname,
                'ssl' => [
                    // TXT validation lets a customer prove ownership before their
                    // DNS points at us. HTTP validation cannot work during
                    // onboarding: it needs the hostname to already resolve here,
                    // which is the very thing being set up.
                    'method' => $this->validationMethod(),
                    'type' => 'dv',
                    'bundle_method' => 'ubiquitous',
                    'wildcard' => false,
                    'settings' => [
                        'min_tls_version' => (string) config('uidesired.cloudflare.min_tls_version', '1.2'),
                    ],
                ],
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function status(Domain $domain): array
    {
        $id = $domain->provider_reference;
        if (! $id) {
            return ['success' => false];
        }

        return $this->client->request('GET', 'zones/'.$this->client->zoneId().'/custom_hostnames/'.$id);
    }

    /**
     * Asks Cloudflare to re-run validation. Without this a customer who fixes
     * their DNS waits for Cloudflare's own retry schedule instead of the next
     * time they press "Check connection".
     *
     * @return array<string, mixed>
     */
    public function revalidate(Domain $domain): array
    {
        $id = $domain->provider_reference;
        if (! $id) {
            return ['success' => false];
        }

        return $this->client->request('PATCH', 'zones/'.$this->client->zoneId().'/custom_hostnames/'.$id, [
            'json' => ['ssl' => ['method' => $this->validationMethod(), 'type' => 'dv']],
        ]);
    }

    public function delete(Domain $domain): void
    {
        if (! $domain->provider_reference) {
            return;
        }

        $this->client->request('DELETE', 'zones/'.$this->client->zoneId().'/custom_hostnames/'.$domain->provider_reference);
    }

    private function validationMethod(): string
    {
        $method = (string) config('uidesired.cloudflare.ssl_validation', 'txt');

        return in_array($method, ['txt', 'http', 'email'], true) ? $method : 'txt';
    }
}
