<?php

namespace App\Services\Cloudflare;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class CloudflareClient
{
    public function __construct(private readonly ?Client $http = null) {}

    public function request(string $method, string $uri, array $options = []): array
    {
        // Every zone endpoint is built as 'zones/'.$zoneId.'/…', so an
        // unconfigured zone produces 'zones//…'. Cloudflare answers that with
        // "Could not route to /client/v4/zones/custom_hostnames, perhaps your
        // object identifier is invalid?", which sends operators hunting for a
        // permissions problem that does not exist. Say what is actually wrong.
        if (str_contains($uri, 'zones//')) {
            return ['success' => false, 'errors' => [[
                'message' => 'Cloudflare zone ID is not configured on this deployment. Set it in Admin → Domain HTTPS, and check that the stored API token can still be read.',
            ]]];
        }

        // With no token the Authorization header goes out as a bare "Bearer ",
        // and Cloudflare replies "Missing X-Auth-Key, X-Auth-Email or
        // Authorization headers" - which reads like the client is sending the
        // wrong kind of credentials rather than none. The common way to arrive
        // here is a token that was stored under a previous APP_KEY and can no
        // longer be decrypted, so it is worth naming.
        if (blank(config('services.cloudflare.api_token'))) {
            return ['success' => false, 'errors' => [[
                'message' => 'Cloudflare API token is not configured on this deployment. Enter it in Admin → Domain HTTPS. If a token is already stored there, it was encrypted with a different APP_KEY and has to be entered again.',
            ]]];
        }

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
