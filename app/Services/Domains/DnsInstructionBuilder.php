<?php

namespace App\Services\Domains;

use App\Models\Domain;
use App\Support\DomainName;
use App\Support\Hostname;

/**
 * Turns a Domain plus whatever Cloudflare told us about it into the exact list
 * of DNS records a customer has to create, in the order they should create
 * them.
 *
 * The dashboard renders this verbatim, so every string here is customer-facing.
 */
class DnsInstructionBuilder
{
    public function __construct(private readonly ApexAddressResolver $apex) {}

    /**
     * @return array<string, mixed>
     */
    public function for(Domain $domain): array
    {
        $hostname = Hostname::normalize($domain->hostname);
        $isApex = DomainName::isApex($hostname);
        $target = $this->cnameTarget();
        $addresses = $isApex
            ? $this->apex->addresses()
            : ['ipv4' => [], 'ipv6' => [], 'source' => 'none', 'target' => $target];

        return [
            'hostname' => $hostname,
            'root' => DomainName::registrableRoot($hostname),
            'is_apex' => $isApex,
            'cname_target' => $target,
            'apex_ips' => $addresses['ipv4'],
            'apex_ipv6' => $addresses['ipv6'],
            'apex_source' => $addresses['source'],
            'records' => $this->records($domain, $hostname, $isApex, $target, $addresses),
            'steps' => $this->steps($hostname, $isApex, $target, $addresses),
            'notes' => $this->notes($hostname, $isApex, $target, $addresses),
            'errors' => $this->errors($domain),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function records(Domain $domain, string $hostname, bool $isApex, string $target, array $addresses): array
    {
        $records = [];
        $data = is_array($domain->verification_data) ? $domain->verification_data : [];

        // 1. Routing: what actually sends traffic to us.
        if ($isApex) {
            $records = $this->apexRoutingRecords($hostname, $target, $addresses);
        } else {
            $records[] = [
                'purpose' => 'routing',
                'type' => 'CNAME',
                'name' => DomainName::recordName($hostname),
                'value' => $target,
                'ttl' => 'Auto',
                'required' => true,
                'help' => 'Points the domain at our edge.',
            ];
        }

        // 2. Ownership: proves the customer controls the hostname. Cloudflare
        // only needs this while the hostname is not yet serving from our edge.
        $ownership = $data['ownership'] ?? null;
        if (is_array($ownership) && ! empty($ownership['name']) && ! empty($ownership['value'])) {
            $records[] = [
                'purpose' => 'ownership',
                'type' => strtoupper((string) ($ownership['type'] ?? 'TXT')),
                'name' => $this->relativeName((string) $ownership['name'], $hostname),
                'value' => (string) $ownership['value'],
                'ttl' => 'Auto',
                'required' => true,
                'help' => 'Proves you control this hostname. Can be deleted once the domain is active.',
            ];
        }

        // 3. Certificate: DV validation for the SSL certificate.
        foreach ($this->validationRecords($data) as $validation) {
            $records[] = [
                'purpose' => 'certificate',
                'type' => 'TXT',
                'name' => $this->relativeName((string) $validation['txt_name'], $hostname),
                'value' => (string) $validation['txt_value'],
                'ttl' => 'Auto',
                'required' => true,
                'help' => 'Issues the HTTPS certificate. Can be deleted once the domain is active.',
            ];
        }

        return $records;
    }

    /**
     * A root domain has two ways to reach us, and which one a customer can use
     * depends on their DNS provider rather than on anything we control. Both
     * are listed and flagged as alternatives, so nobody ends up creating
     * conflicting records at the zone apex.
     *
     * @param  array{ipv4: list<string>, ipv6: list<string>, source: string}  $addresses
     * @return list<array<string, mixed>>
     */
    private function apexRoutingRecords(string $hostname, string $target, array $addresses): array
    {
        $name = DomainName::recordName($hostname);
        $hasAddresses = $addresses['ipv4'] !== [] || $addresses['ipv6'] !== [];

        $records = [[
            'purpose' => 'routing',
            'type' => 'ALIAS',
            'name' => $name,
            'value' => $target,
            'ttl' => 'Auto',
            'required' => ! $hasAddresses,
            'option' => 'alias',
            'option_label' => $hasAddresses ? 'Option A - recommended' : null,
            'help' => 'Some providers call this ANAME or CNAME flattening. It follows our edge on its own, so it keeps working even if our addresses change.',
        ]];

        if (! $hasAddresses) {
            return $records;
        }

        foreach ($addresses['ipv4'] as $ip) {
            $records[] = [
                'purpose' => 'routing',
                'type' => 'A',
                'name' => $name,
                'value' => $ip,
                'ttl' => 'Auto',
                'required' => false,
                'option' => 'address',
                'option_label' => 'Option B',
                'help' => 'Only if your provider has no ALIAS/ANAME support. Add every A record listed here, and do not keep the ALIAS record as well.',
            ];
        }

        foreach ($addresses['ipv6'] as $ip) {
            $records[] = [
                'purpose' => 'routing',
                'type' => 'AAAA',
                'name' => $name,
                'value' => $ip,
                'ttl' => 'Auto',
                'required' => false,
                'option' => 'address',
                'option_label' => 'Option B',
                'help' => 'Optional IPv6 companion to the A records above.',
            ];
        }

        return $records;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return list<array{txt_name: string, txt_value: string}>
     */
    private function validationRecords(array $data): array
    {
        $out = [];
        foreach ((array) ($data['ssl_validation'] ?? []) as $record) {
            if (is_array($record) && ! empty($record['txt_name']) && ! empty($record['txt_value'])) {
                $out[] = ['txt_name' => (string) $record['txt_name'], 'txt_value' => (string) $record['txt_value']];
            }
        }

        return $out;
    }

    /**
     * DNS providers want the record name relative to the zone, so strip the
     * registrable root off the fully-qualified name Cloudflare hands back.
     */
    private function relativeName(string $fqdn, string $hostname): string
    {
        $fqdn = Hostname::normalize($fqdn);
        $root = DomainName::registrableRoot($hostname);
        if ($root !== '' && str_ends_with($fqdn, '.'.$root)) {
            return substr($fqdn, 0, -1 * (strlen($root) + 1));
        }

        return $fqdn === $root ? '@' : $fqdn;
    }

    /**
     * @return list<array{title: string, detail: string}>
     */
    private function steps(string $hostname, bool $isApex, string $target, array $addresses): array
    {
        $steps = [
            [
                'title' => 'Open your DNS provider',
                'detail' => 'Sign in wherever '.DomainName::registrableRoot($hostname).' is managed - your registrar (GoDaddy, Namecheap, Google Domains) or your DNS host (Cloudflare, Route 53).',
            ],
            [
                'title' => 'Add the records below',
                'detail' => 'Create each record exactly as shown. Leave TTL on the default. If a record with the same name already exists, edit it rather than adding a second one.',
            ],
        ];

        if ($isApex) {
            $hasAddresses = $addresses['ipv4'] !== [] || $addresses['ipv6'] !== [];
            $steps[] = [
                'title' => 'Pick one routing option',
                'detail' => $hasAddresses
                    ? 'A root domain cannot take a plain CNAME, so there are two ways to route it. If your provider offers ALIAS, ANAME or CNAME flattening, create the ALIAS record (Option A). If it does not, create the A records instead (Option B). Create one option or the other - never both.'
                    : 'A root domain cannot take a plain CNAME. Use your provider\'s ALIAS, ANAME or CNAME flattening record. If it has none, connect www.'.DomainName::registrableRoot($hostname).' instead and redirect the root to it at your registrar.',
            ];
        }

        if ($target !== '') {
            $steps[] = [
                'title' => 'Turn off proxying if you use Cloudflare DNS',
                'detail' => 'If '.DomainName::registrableRoot($hostname).' is on Cloudflare, set the routing record to "DNS only" (grey cloud). Proxying it there would send traffic through Cloudflare twice and the certificate will not issue.',
            ];
        }

        $steps[] = [
            'title' => 'Wait for DNS, then check the connection',
            'detail' => 'Records usually propagate in a few minutes but can take up to 24 hours. Use "Check connection" to re-test; we also re-check automatically every few minutes.',
        ];

        return $steps;
    }

    /**
     * @return list<string>
     */
    private function notes(string $hostname, bool $isApex, string $target, array $addresses): array
    {
        $notes = [];
        $hasAddresses = $addresses['ipv4'] !== [] || $addresses['ipv6'] !== [];

        if ($target === '' && ! $hasAddresses) {
            $notes[] = 'No CNAME target is configured on this deployment yet, so the routing record below is incomplete. Set the Cloudflare CNAME target in Admin before asking customers to connect a domain.';
        }
        if ($isApex && ! $hasAddresses) {
            $notes[] = 'This is a root domain. Plain CNAME records are not valid at the zone apex, so your provider must support ALIAS/ANAME/CNAME flattening.';
        }
        if ($isApex && $hasAddresses && ($addresses['source'] ?? null) === 'resolved') {
            $notes[] = 'The A records above are our current edge addresses. They rarely change, but ALIAS/ANAME is the safer choice because it follows us automatically - use it if your provider supports it.';
        }
        if ($isApex) {
            $notes[] = 'Most people also connect www.'.DomainName::registrableRoot($hostname).'. Add it as a second domain here, then set one of the two as primary so the other redirects to it.';
        }
        $notes[] = 'Keep your existing MX and TXT records for email. Only the records listed here need to change.';

        return $notes;
    }

    /**
     * Anything Cloudflare is unhappy about, flattened into plain sentences.
     *
     * @return list<string>
     */
    private function errors(Domain $domain): array
    {
        $data = is_array($domain->verification_data) ? $domain->verification_data : [];
        $out = [];

        foreach ((array) ($data['errors'] ?? []) as $error) {
            if (is_string($error) && $error !== '') {
                $out[] = $error;
            }
        }
        foreach ((array) ($data['ssl_errors'] ?? []) as $error) {
            $message = is_array($error) ? ($error['message'] ?? null) : $error;
            if (is_string($message) && $message !== '') {
                $out[] = $message;
            }
        }

        return array_values(array_unique($out));
    }

    private function cnameTarget(): string
    {
        return (string) (config('uidesired.cloudflare.cname_target')
            ?: config('uidesired.cloudflare.fallback_origin')
            ?: '');
    }
}
