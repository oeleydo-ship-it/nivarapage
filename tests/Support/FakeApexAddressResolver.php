<?php

namespace Tests\Support;

use App\Services\Domains\ApexAddressResolver;

/**
 * Apex address resolver with the DNS read stubbed out, so tests never depend on
 * a live resolver answering for the deployment's CNAME target.
 */
class FakeApexAddressResolver extends ApexAddressResolver
{
    /** @var list<string> */
    public array $ipv4;

    /** @var list<string> */
    public array $ipv6;

    /** Hostnames the resolver was asked about. */
    public array $lookups = [];

    /**
     * @param  list<string>  $ipv4
     * @param  list<string>  $ipv6
     */
    public function __construct(array $ipv4 = [], array $ipv6 = [])
    {
        $this->ipv4 = $ipv4;
        $this->ipv6 = $ipv6;
    }

    protected function lookup(string $target): array
    {
        $this->lookups[] = $target;

        return ['ipv4' => $this->ipv4, 'ipv6' => $this->ipv6];
    }
}
