<?php

namespace App\Support;

/**
 * One Laravel application answers on three kinds of hostname: the dashboard,
 * the published customer sites, and the preview host. Everything downstream of
 * routing needs the same answer to "which is this?", so the decision lives
 * here rather than being re-derived per route.
 */
class HostRole
{
    public const DASHBOARD = 'dashboard';

    public const PREVIEW = 'preview';

    public const PUBLISHED = 'published';

    public static function for(?string $host): string
    {
        $host = Hostname::normalize((string) $host);

        if ($host === '') {
            return self::DASHBOARD;
        }

        if (in_array($host, self::previewHosts(), true)) {
            return self::PREVIEW;
        }

        if (in_array($host, self::dashboardHosts(), true)) {
            return self::DASHBOARD;
        }

        return self::PUBLISHED;
    }

    public static function isDashboard(?string $host): bool
    {
        return self::for($host) === self::DASHBOARD;
    }

    /**
     * @return array<int, string>
     */
    public static function dashboardHosts(): array
    {
        $configured = array_merge(
            (array) config('uidesired.dashboard_hosts', []),
            array_filter(array_map('trim', explode(',', (string) config('uidesired.extra_dashboard_hosts', '')))),
        );

        $hosts = array_map(fn ($host) => Hostname::normalize((string) $host), $configured);

        return array_values(array_unique(array_filter($hosts)));
    }

    /**
     * @return array<int, string>
     */
    public static function previewHosts(): array
    {
        $preview = Hostname::normalize((string) config('uidesired.preview_domain', ''));

        return $preview === '' ? [] : [$preview];
    }
}
