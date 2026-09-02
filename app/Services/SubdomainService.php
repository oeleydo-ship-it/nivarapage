<?php

namespace App\Services;

use App\Models\Domain;
use Illuminate\Support\Str;
use InvalidArgumentException;

class SubdomainService
{
    /**
     * @var list<string>
     */
    public const RESERVED = [
        'www', 'api', 'app', 'admin', 'dashboard', 'billing', 'mail', 'smtp', 'ftp',
        'support', 'help', 'docs', 'status', 'cdn', 'assets', 'static', 'dev',
        'staging', 'preview', 'localhost',
    ];

    /**
     * @return array{available: bool, hostname: string, name: string, reason?: string, platform_domain?: string}
     */
    public function check(string $name): array
    {
        $normalized = $this->normalize($name);
        $hostname = $this->hostname($normalized);

        if ($normalized === '' || ! preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $normalized)) {
            return [
                'available' => false,
                'hostname' => $hostname,
                'name' => $normalized,
                'reason' => 'invalid',
                'platform_domain' => app(PlatformSettingsService::class)->platformDomain(),
            ];
        }

        if (in_array($normalized, self::RESERVED, true)) {
            return [
                'available' => false,
                'hostname' => $hostname,
                'name' => $normalized,
                'reason' => 'reserved',
                'platform_domain' => app(PlatformSettingsService::class)->platformDomain(),
            ];
        }

        if (Domain::query()->where('hostname', $hostname)->exists()) {
            return [
                'available' => false,
                'hostname' => $hostname,
                'name' => $normalized,
                'reason' => 'taken',
                'platform_domain' => app(PlatformSettingsService::class)->platformDomain(),
            ];
        }

        return [
            'available' => true,
            'hostname' => $hostname,
            'name' => $normalized,
            'platform_domain' => app(PlatformSettingsService::class)->platformDomain(),
        ];
    }

    public function reserve(string $name, int $workspaceId, int $siteId): Domain
    {
        $result = $this->check($name);
        if (! $result['available']) {
            throw new InvalidArgumentException($result['reason'] ?? 'Subdomain is not available.');
        }

        // check() reads through the soft-delete scope but the unique index on
        // hostname does not, so a subdomain freed with its site is available and
        // still fails to insert. Clear the tombstone the same way a custom
        // domain does before claiming the name.
        Domain::withTrashed()
            ->whereNotNull('deleted_at')
            ->where('hostname', $result['hostname'])
            ->forceDelete();

        return Domain::query()->create([
            'workspace_id' => $workspaceId,
            'site_id' => $siteId,
            'type' => 'subdomain',
            'hostname' => $result['hostname'],
            'is_primary' => true,
            'status' => 'active',
            'provider' => 'platform',
            'activated_at' => now(),
            'verified_at' => now(),
        ]);
    }

    public function normalize(string $name): string
    {
        $name = Str::lower(trim($name));
        $name = preg_replace('/[^a-z0-9-]/', '', $name) ?? '';
        $name = trim($name, '-');

        return $name;
    }

    public function hostname(string $name): string
    {
        return $name.'.'.app(PlatformSettingsService::class)->platformDomain();
    }
}
