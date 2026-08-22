<?php

namespace App\Support;

final class Hostname
{
    public static function normalize(string $host): string
    {
        $host = strtolower(trim($host));
        $host = preg_replace('#^https?://#', '', $host) ?? $host;
        $host = explode('/', $host, 2)[0];
        $host = explode('?', $host, 2)[0];
        $host = explode('#', $host, 2)[0];
        $host = explode('@', $host);
        $host = end($host);
        $host = preg_replace('/:\d+$/', '', $host) ?? $host;

        return rtrim($host, '.');
    }

    public static function isValid(string $host): bool
    {
        $host = self::normalize($host);
        if ($host === '' || strlen($host) > 253) {
            return false;
        }

        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return true;
        }

        return (bool) preg_match(
            '/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/',
            $host,
        );
    }
}
