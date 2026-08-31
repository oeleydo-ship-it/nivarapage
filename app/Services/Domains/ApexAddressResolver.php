<?php

namespace App\Services\Domains;

use App\Support\Hostname;
use Illuminate\Support\Facades\Cache;
use Throwable;

/**
 * The A/AAAA addresses a root domain has to point at.
 *
 * `example.com` cannot take a CNAME, so Cloudflare for SaaS customers whose DNS
 * provider has no ALIAS/ANAME support have to use address records instead. The
 * right addresses are whatever our CNAME target resolves to - the Cloudflare
 * anycast IPs in front of the zone - so we look them up rather than asking the
 * operator to keep a hardcoded list in sync.
 *
 * An explicit `CLOUDFLARE_APEX_IPS` (or the admin field) still wins: a
 * deployment on BYOIP or a dedicated address wants its own list.
 */
class ApexAddressResolver
{
    private const CACHE_PREFIX = 'cloudflare:apex-addresses:';

    /**
     * Cloudflare's anycast IPs are stable but not contractually fixed, so this
     * is a cache, not a stored setting. An hour keeps DNS lookups off the hot
     * path without pinning a stale address for long.
     */
    private const TTL = 3600;

    /**
     * @return array{ipv4: list<string>, ipv6: list<string>, source: string, target: string|null}
     */
    public function addresses(): array
    {
        $configured = $this->configured();
        if ($configured['ipv4'] !== [] || $configured['ipv6'] !== []) {
            return $configured + ['source' => 'configured', 'target' => $this->target()];
        }

        $target = $this->target();
        if ($target === null) {
            return ['ipv4' => [], 'ipv6' => [], 'source' => 'none', 'target' => null];
        }

        $resolved = Cache::remember(
            self::CACHE_PREFIX.$target,
            self::TTL,
            fn () => $this->lookup($target),
        );

        $ipv4 = $resolved['ipv4'] ?? [];
        $ipv6 = $resolved['ipv6'] ?? [];

        return [
            'ipv4' => $ipv4,
            'ipv6' => $ipv6,
            'source' => $ipv4 === [] && $ipv6 === [] ? 'none' : 'resolved',
            'target' => $target,
        ];
    }

    /**
     * Drops the cached lookup so the next call re-reads DNS. Used by the admin
     * "refresh" action after the fallback origin changes.
     *
     * @return array{ipv4: list<string>, ipv6: list<string>, source: string, target: string|null}
     */
    public function refresh(): array
    {
        $target = $this->target();
        if ($target !== null) {
            Cache::forget(self::CACHE_PREFIX.$target);
        }

        return $this->addresses();
    }

    /** The hostname whose addresses a root domain should copy. */
    public function target(): ?string
    {
        $target = Hostname::normalize((string) (config('uidesired.cloudflare.cname_target')
            ?: config('uidesired.cloudflare.fallback_origin')
            ?: ''));

        return $target === '' ? null : $target;
    }

    /**
     * @return array{ipv4: list<string>, ipv6: list<string>}
     */
    private function configured(): array
    {
        $ipv4 = [];
        $ipv6 = [];
        foreach ((array) config('uidesired.cloudflare.apex_ips', []) as $ip) {
            $ip = trim((string) $ip);
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
                $ipv4[] = $ip;
            } elseif (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
                $ipv6[] = $ip;
            }
        }

        return ['ipv4' => array_values(array_unique($ipv4)), 'ipv6' => array_values(array_unique($ipv6))];
    }

    /**
     * The raw DNS read. Protected so tests (and any deployment that resolves
     * differently) can substitute it without faking the cache.
     *
     * @return array{ipv4: list<string>, ipv6: list<string>}
     */
    protected function lookup(string $target): array
    {
        return [
            'ipv4' => $this->records($target, DNS_A, 'ip'),
            'ipv6' => $this->records($target, DNS_AAAA, 'ipv6'),
        ];
    }

    /**
     * @return list<string>
     */
    private function records(string $target, int $type, string $key): array
    {
        try {
            $records = @dns_get_record($target, $type);
        } catch (Throwable) {
            // A resolver failure must not break the DNS instructions panel; the
            // customer still gets the ALIAS record and the "no addresses" note.
            return [];
        }

        if (! is_array($records)) {
            return [];
        }

        $out = [];
        foreach ($records as $record) {
            $value = $record[$key] ?? null;
            if (is_string($value) && filter_var($value, FILTER_VALIDATE_IP)) {
                $out[] = $value;
            }
        }

        sort($out);

        return array_values(array_unique($out));
    }
}
