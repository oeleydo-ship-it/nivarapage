<?php

namespace App\Services\Cloudflare;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class CloudflareClient
{
    public function __construct(private readonly ?Client $http = null) {}

    public function request(string $method, string $uri, array $options = []): array
    {
        $client = $this->http ?? new Client([
            'base_uri' => 'https://api.cloudflare.com/client/v4/',
            'headers' => [
                'Authorization' => 'Bearer '.config('services.cloudflare.api_token'),
                'Content-Type' => 'application/json',
            ],
            'http_errors' => false,
        ]);

        try {
            $response = $client->request($method, ltrim($uri, '/'), $options);
        } catch (GuzzleException $e) {
            return ['success' => false, 'errors' => [['message' => $e->getMessage()]]];
        }

        return json_decode((string) $response->getBody(), true) ?? [];
    }

    public function zoneId(): string
    {
        return (string) config('services.cloudflare.zone_id');
    }

    /**
     * @param  list<string>  $hosts
     * @return array<string, mixed>
     */
    public function purgeHosts(array $hosts): array
    {
        $hosts = array_values(array_unique(array_filter($hosts)));
        if ($hosts === [] || $this->zoneId() === '') {
            return ['success' => false, 'skipped' => true];
        }

        return $this->request('POST', 'zones/'.$this->zoneId().'/purge_cache', [
            'json' => ['hosts' => $hosts],
        ]);
    }
}
