<?php

namespace App\Services\Domains;

use Illuminate\Support\Facades\Cache;
use Throwable;

/**
 * Whether a domain's DNS is hosted on Cloudflare.
 *
 * This changes the connection instructions completely rather than in detail.
 * Our edge is Cloudflare, so the addresses a root domain would normally be
 * pointed at are Cloudflare's. From a zone that is itself on Cloudflare, an
 * unproxied record holding those addresses is refused outright - "Error 1000:
 * DNS points to prohibited IP" - and no amount of waiting fixes it.
 *
 * A customer on Cloudflare has to use a proxied CNAME instead, which Cloudflare
 * supports between two Cloudflare zones and flattens at the root. A customer
 * anywhere else uses ALIAS/ANAME, or address records where their provider has
 * no ALIAS support.
 */
class DnsProviderProbe
{
    private const CACHE_PREFIX = 'dns:nameservers:';

    /** Delegation changes rarely, and a stale answer only mis-words guidance. */
    private const TTL = 3600;

    /**
     * True on Cloudflare, false elsewhere, null when the lookup told us nothing.
     *
     * Null matters: guessing "not Cloudflare" would hand a Cloudflare customer
     * the address records that cannot work for them, so the caller shows both
     * paths instead.
     */
    public function isCloudflare(string $root): ?bool
    {
        $root = trim($root);
        if ($root === '') {
            return null;
        }

        $nameservers = Cache::remember(
            self::CACHE_PREFIX.$root,
            self::TTL,
            fn () => $this->nameservers($root),
        );

        if (! is_array($nameservers) || $nameservers === []) {
            return null;
        }

        foreach ($nameservers as $host) {
            if (str_ends_with($host, '.ns.cloudflare.com') || $host === 'ns.cloudflare.com') {
                return true;
            }
        }

        return false;
    }

    /**
     * Protected so tests can answer without a live resolver.
     *
     * @return list<string>
     */
    protected function nameservers(string $root): array
    {
        try {
            $records = @dns_get_record($root, DNS_NS);
        } catch (Throwable) {
            return [];
        }

        if (! is_array($records)) {
            return [];
        }

        $out = [];
        foreach ($records as $record) {
            $target = strtolower(trim((string) ($record['target'] ?? '')));
            if ($target !== '') {
                $out[] = rtrim($target, '.');
            }
        }

        return array_values(array_unique($out));
    }
}
