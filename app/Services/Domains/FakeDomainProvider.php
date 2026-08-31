<?php

namespace App\Services\Domains;

use App\Contracts\DomainProviderInterface;
use App\Models\Domain;

class FakeDomainProvider implements DomainProviderInterface
{
    /**
     * @var array<string, array<string, mixed>>
     */
    private static array $store = [];

    public function createCustomHostname(Domain $domain): array
    {
        $id = 'fake_'.$domain->id;
        $payload = $this->payload($id, $domain->hostname, 'pending', 'pending_validation');
        self::$store[$domain->hostname] = $payload;

        $domain->update(array_merge(
            ['provider' => 'fake', 'provider_reference' => $id, 'status' => 'verifying'],
            $this->attributesFrom(['result' => $payload]),
        ));

        return ['success' => true, 'result' => $payload];
    }

    public function deleteCustomHostname(Domain $domain): void
    {
        unset(self::$store[$domain->hostname]);
        $domain->update(['provider_reference' => null, 'status' => 'disabled']);
    }

    public function getStatus(Domain $domain): array
    {
        $payload = self::$store[$domain->hostname] ?? $this->payload(
            (string) $domain->provider_reference,
            $domain->hostname,
            $domain->status === 'active' ? 'active' : 'pending',
            $domain->ssl_status ?? 'pending_validation',
        );

        return ['success' => true, 'result' => $payload];
    }

    public function revalidate(Domain $domain): array
    {
        return $this->getStatus($domain);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function attributesFrom(array $payload): array
    {
        $result = (array) ($payload['result'] ?? []);
        $ssl = (array) ($result['ssl'] ?? []);

        return [
            'verification_method' => 'txt',
            'verification_status' => $result['status'] ?? null,
            'ssl_status' => $ssl['status'] ?? null,
            'verification_data' => [
                'ownership' => $result['ownership_verification'] ?? null,
                'ownership_http' => null,
                'ssl_validation' => $ssl['validation_records'] ?? [],
                'ssl_errors' => [],
                'errors' => [],
            ],
            'last_checked_at' => now(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(string $id, string $hostname, string $status, string $sslStatus): array
    {
        return [
            'id' => $id,
            'hostname' => $hostname,
            'status' => $status,
            'ssl' => [
                'status' => $sslStatus,
                'method' => 'txt',
                'validation_records' => [
                    ['txt_name' => '_acme-challenge.'.$hostname, 'txt_value' => 'fake-dv-'.$id],
                ],
            ],
            'ownership_verification' => [
                'type' => 'txt',
                'name' => '_cf-custom-hostname.'.$hostname,
                'value' => 'uidesired-verify='.$id,
            ],
        ];
    }

    public static function markActive(string $hostname): void
    {
        if (isset(self::$store[$hostname])) {
            self::$store[$hostname]['status'] = 'active';
            self::$store[$hostname]['ssl']['status'] = 'active';
        }
    }

    public static function reset(): void
    {
        self::$store = [];
    }
}
