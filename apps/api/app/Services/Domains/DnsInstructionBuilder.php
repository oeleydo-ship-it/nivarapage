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
    /**
     * @return array<string, mixed>
     */
    public function for(Domain $domain): array
    {
        $hostname = Hostname::normalize($domain->hostname);
        $isApex = DomainName::isApex($hostname);
        $target = $this->cnameTarget();
        $apexIps = $this->apexIps();

        return [
            'hostname' => $hostname,
            'root' => DomainName::registrableRoot($hostname),
            'is_apex' => $isApex,
            'cname_target' => $target,
            'apex_ips' => $apexIps,
            'records' => $this->records($domain, $hostname, $isApex, $target, $apexIps),
            'steps' => $this->steps($hostname, $isApex, $target),
            'notes' => $this->notes($isApex, $target, $apexIps),
            'errors' => $this->errors($domain),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function records(Domain $domain, string $hostname, bool $isApex, string $target, array $apexIps): array
    {
        $records = [];
        $data = is_array($domain->verification_data) ? $domain->verification_data : [];

        // 1. Routing: what actually sends traffic to us.
        if ($isApex && $apexIps !== []) {
            foreach ($apexIps as $ip) {
                $records[] = [
                    'purpose' => 'routing',
                    'type' => 'A',
                    'name' => DomainName::recordName($hostname),
                    'value' => $ip,
                    'ttl' => 'Auto',
                    'required' => true,
                    'help' => 'Points the domain at our edge.',
                ];
            }
        } else {
            $records[] = [
                'purpose' => 'routing',
                'type' => $isApex ? 'ALIAS' : 'CNAME',
                'name' => DomainName::recordName($hostname),
                'value' => $target,
                'ttl' => 'Auto',
                'required' => true,
                'help' => $isApex
                    ? 'Some registrars call this ANAME or "CNAME flattening".'
                    : 'Points the domain at our edge.',
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
    private function steps(string $hostname, bool $isApex, string $target): array
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
            $steps[] = [
                'title' => 'Check apex support',
                'detail' => 'A root domain cannot use a plain CNAME. If your provider offers ALIAS, ANAME or CNAME flattening, use that. If it does not, connect www.'.DomainName::registrableRoot($hostname).' instead and set up a redirect from the root.',
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
    private function notes(bool $isApex, string $target, array $apexIps): array
    {
        $notes = [];
        if ($target === '' && $apexIps === []) {
            $notes[] = 'No CNAME target is configured on this deployment yet, so the routing record below is incomplete. Set CLOUDFLARE_CNAME_TARGET before asking customers to connect a domain.';
        }
        if ($isApex && $apexIps === []) {
            $notes[] = 'This is a root domain. Plain CNAME records are not valid at the zone apex, so your provider must support ALIAS/ANAME/CNAME flattening.';
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

    /**
     * @return list<string>
     */
    private function apexIps(): array
    {
        return array_values(array_filter((array) config('uidesired.cloudflare.apex_ips', [])));
    }
}
