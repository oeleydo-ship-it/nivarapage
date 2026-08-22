<?php

namespace Tests\Support;

use App\Services\Cloudflare\CloudflareClient;

/**
 * In-memory Cloudflare API used by tests instead of live custom-hostname calls.
 */
class FakeCloudflareClient extends CloudflareClient
{
    /** @var array<string, array<string, mixed>> */
    public array $hostnames = [];

    /** @var list<array{0: string, 1: string, 2: array<string, mixed>}> */
    public array $calls = [];

    public array $purgedHosts = [];

    /** @var list<string> ids the caller asked Cloudflare to re-validate */
    public array $revalidated = [];

    public function zoneId(): string
    {
        return 'zone_fake';
    }

    public function request(string $method, string $uri, array $options = []): array
    {
        $this->calls[] = [$method, $uri, $options];
        $method = strtoupper($method);
        $uri = ltrim($uri, '/');

        if ($method === 'POST' && str_contains($uri, 'purge_cache')) {
            $this->purgedHosts = array_merge($this->purgedHosts, $options['json']['hosts'] ?? []);

            return ['success' => true];
        }

        if ($method === 'POST' && str_contains($uri, 'custom_hostnames')) {
            $hostname = $options['json']['hostname'] ?? 'example.test';
            $id = 'cfh_'.substr(md5($hostname), 0, 10);
            // Mirrors the shape Cloudflare for SaaS returns for a TXT-validated
            // custom hostname, so the DNS instructions we build are exercised.
            $this->hostnames[$id] = [
                'id' => $id,
                'hostname' => $hostname,
                'status' => 'pending',
                'ssl' => [
                    'status' => 'pending_validation',
                    'method' => $options['json']['ssl']['method'] ?? 'txt',
                    'type' => 'dv',
                    'validation_records' => [[
                        'status' => 'pending',
                        'txt_name' => '_acme-challenge.'.$hostname,
                        'txt_value' => 'dv-'.$id,
                    ]],
                ],
                'ownership_verification' => [
                    'type' => 'txt',
                    'name' => '_cf-custom-hostname.'.$hostname,
                    'value' => 'uidesired-verify='.$id,
                ],
            ];

            return ['success' => true, 'result' => $this->hostnames[$id]];
        }

        if (preg_match('#custom_hostnames/([^/]+)$#', $uri, $matches) === 1) {
            $id = $matches[1];
            if ($method === 'GET') {
                $row = $this->hostnames[$id] ?? null;

                return $row ? ['success' => true, 'result' => $row] : ['success' => false, 'errors' => [['message' => 'not found']]];
            }
            if ($method === 'PATCH') {
                $this->revalidated[] = $id;
                $row = $this->hostnames[$id] ?? null;

                return $row ? ['success' => true, 'result' => $row] : ['success' => false];
            }
            if ($method === 'DELETE') {
                unset($this->hostnames[$id]);

                return ['success' => true];
            }
        }

        return ['success' => false, 'errors' => [['message' => 'unhandled '.$method.' '.$uri]]];
    }

    public function markActive(string $id): void
    {
        if (! isset($this->hostnames[$id])) {
            return;
        }

        $this->hostnames[$id]['status'] = 'active';
        $this->hostnames[$id]['ssl']['status'] = 'active';
    }
}
