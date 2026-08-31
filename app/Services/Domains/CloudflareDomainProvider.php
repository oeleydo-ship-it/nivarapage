<?php

namespace App\Services\Domains;

use App\Contracts\DomainProviderInterface;
use App\Models\Domain;
use App\Services\Cloudflare\CustomHostnameService;

class CloudflareDomainProvider implements DomainProviderInterface
{
    public function __construct(private readonly CustomHostnameService $hostnames) {}

    public function createCustomHostname(Domain $domain): array
    {
        $result = $this->hostnames->create($domain);

        if (! ($result['success'] ?? false) && empty($result['result']['id'])) {
            $domain->update([
                'provider' => 'cloudflare',
                'status' => 'failed',
                'verification_data' => array_merge((array) $domain->verification_data, [
                    'errors' => $this->messages($result['errors'] ?? []),
                ]),
                'last_checked_at' => now(),
            ]);

            return $result;
        }

        $domain->update(array_merge(
            ['provider' => 'cloudflare', 'provider_reference' => $result['result']['id'] ?? null, 'status' => 'verifying'],
            $this->attributesFrom($result),
        ));

        return $result;
    }

    public function deleteCustomHostname(Domain $domain): void
    {
        $this->hostnames->delete($domain);
    }

    public function getStatus(Domain $domain): array
    {
        return $this->hostnames->status($domain);
    }

    public function revalidate(Domain $domain): array
    {
        return $this->hostnames->revalidate($domain);
    }

    /**
     * Normalises a Cloudflare custom-hostname payload into Domain columns.
     * Shared by create, the status poller and the manual check so all three
     * agree on what the record means.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function attributesFrom(array $payload): array
    {
        $result = (array) ($payload['result'] ?? []);
        $ssl = (array) ($result['ssl'] ?? []);

        return [
            'verification_method' => (string) ($ssl['method'] ?? config('uidesired.cloudflare.ssl_validation', 'txt')),
            'verification_status' => $result['status'] ?? null,
            'ssl_status' => $ssl['status'] ?? null,
            'verification_data' => [
                'ownership' => $result['ownership_verification'] ?? null,
                'ownership_http' => $result['ownership_verification_http'] ?? null,
                'ssl_validation' => $ssl['validation_records'] ?? [],
                'ssl_errors' => $this->messages($ssl['validation_errors'] ?? []),
                'errors' => $this->messages($result['verification_errors'] ?? []),
            ],
            'last_checked_at' => now(),
        ];
    }

    /**
     * Cloudflare returns errors as bare strings in some fields and
     * `{"message": "..."}` objects in others.
     *
     * @return list<string>
     */
    private function messages(mixed $errors): array
    {
        $out = [];
        foreach ((array) $errors as $error) {
            $message = is_array($error) ? ($error['message'] ?? null) : $error;
            if (is_string($message) && $message !== '') {
                $out[] = $message;
            }
        }

        return array_values(array_unique($out));
    }
}
