<?php

namespace App\Contracts;

use App\Models\Domain;

interface DomainProviderInterface
{
    /**
     * @return array<string, mixed>
     */
    public function createCustomHostname(Domain $domain): array;

    public function deleteCustomHostname(Domain $domain): void;

    /**
     * @return array<string, mixed>
     */
    public function getStatus(Domain $domain): array;

    /**
     * Ask the provider to re-run validation now rather than waiting for its own
     * retry schedule.
     *
     * @return array<string, mixed>
     */
    public function revalidate(Domain $domain): array;

    /**
     * Map a provider status payload onto Domain columns.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function attributesFrom(array $payload): array;
}
