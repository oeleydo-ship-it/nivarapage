<?php

namespace App\Support;

final class DomainName
{
    /**
     * Two-label public suffixes common enough to be worth special-casing.
     *
     * This is a heuristic, not the Public Suffix List: without a PSL package we
     * cannot know that `foo.uk.com` is a registrable domain. It only decides
     * whether we *warn* about apex CNAME support, so a wrong guess costs the
     * customer an unnecessary hint rather than a broken connection.
     *
     * @var list<string>
     */
    private const MULTIPART_SUFFIXES = [
        'co.uk', 'org.uk', 'me.uk', 'ltd.uk', 'plc.uk', 'net.uk', 'sch.uk', 'ac.uk', 'gov.uk',
        'com.au', 'net.au', 'org.au', 'edu.au', 'gov.au', 'id.au',
        'co.nz', 'net.nz', 'org.nz', 'govt.nz',
        'co.za', 'org.za', 'net.za', 'web.za',
        'com.br', 'net.br', 'org.br', 'gov.br',
        'com.mx', 'com.ar', 'com.co', 'com.pe', 've.co',
        'co.jp', 'or.jp', 'ne.jp', 'ac.jp', 'go.jp',
        'co.kr', 'or.kr',
        'co.in', 'net.in', 'org.in', 'gen.in', 'firm.in',
        'com.sg', 'com.my', 'com.hk', 'com.tw', 'com.ph', 'com.vn', 'co.th', 'com.tr',
        'com.pl', 'com.ua', 'com.ru', 'co.il', 'com.cn', 'net.cn', 'org.cn', 'gov.cn',
    ];

    /**
     * True when the hostname is a registrable root such as `example.com` or
     * `example.co.uk` - the case where a plain CNAME is not allowed by the DNS
     * spec and most registrars refuse it.
     */
    public static function isApex(string $hostname): bool
    {
        $host = Hostname::normalize($hostname);
        if ($host === '' || filter_var($host, FILTER_VALIDATE_IP)) {
            return false;
        }

        $labels = explode('.', $host);
        $count = count($labels);
        if ($count < 2) {
            return false;
        }
        if ($count === 2) {
            return true;
        }

        $lastTwo = implode('.', array_slice($labels, -2));

        return $count === 3 && in_array($lastTwo, self::MULTIPART_SUFFIXES, true);
    }

    /**
     * The part of the hostname a customer types into their DNS provider's
     * "name" / "host" field. Registrars want the record relative to the zone,
     * and use `@` for the zone root.
     */
    public static function recordName(string $hostname, string $prefix = ''): string
    {
        $host = Hostname::normalize($hostname);
        $labels = explode('.', $host);
        $rootLabels = self::isApex($host) ? $labels : array_slice($labels, self::subdomainDepth($host));
        $root = implode('.', $rootLabels);

        $relative = $root === $host ? '' : rtrim(substr($host, 0, max(0, strlen($host) - strlen($root) - 1)), '.');
        $name = trim($prefix === '' ? $relative : ($relative === '' ? $prefix : $prefix.'.'.$relative), '.');

        return $name === '' ? '@' : $name;
    }

    /** The registrable root, e.g. `www.shop.example.co.uk` -> `example.co.uk`. */
    public static function registrableRoot(string $hostname): string
    {
        $host = Hostname::normalize($hostname);
        $labels = explode('.', $host);
        if (count($labels) < 2) {
            return $host;
        }

        return implode('.', array_slice($labels, self::subdomainDepth($host)));
    }

    /** How many leading labels are subdomain rather than registrable root. */
    private static function subdomainDepth(string $host): int
    {
        $labels = explode('.', $host);
        $count = count($labels);
        if ($count <= 2) {
            return 0;
        }

        $lastTwo = implode('.', array_slice($labels, -2));
        $rootSize = in_array($lastTwo, self::MULTIPART_SUFFIXES, true) ? 3 : 2;

        return max(0, $count - $rootSize);
    }
}
