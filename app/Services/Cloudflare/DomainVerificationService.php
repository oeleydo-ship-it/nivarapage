<?php

namespace App\Services\Cloudflare;

use App\Models\Domain;

class DomainVerificationService
{
    public function __construct(private readonly CustomHostnameService $hostnames) {}

    public function refresh(Domain $domain): Domain
    {
        $status = $this->hostnames->status($domain);
        $result = $status['result'] ?? [];

        $ssl = $result['ssl']['status'] ?? $domain->ssl_status;
        $ownership = $result['ownership_verification'] ?? $domain->verification_data;
        $cfStatus = $result['status'] ?? null;

        $mapped = match ($cfStatus) {
            'active' => 'active',
            'pending', 'pending_validation' => 'verifying',
            'moved' => 'dns_required',
            default => $domain->status,
        };

        $domain->update([
            'status' => $mapped === 'active' ? 'active' : $mapped,
            'ssl_status' => $ssl,
            'verification_data' => is_array($ownership) ? $ownership : $domain->verification_data,
            'verification_status' => $cfStatus,
            'last_checked_at' => now(),
            'verified_at' => $mapped === 'active' ? now() : $domain->verified_at,
            'activated_at' => $mapped === 'active' ? ($domain->activated_at ?? now()) : $domain->activated_at,
        ]);

        return $domain->fresh();
    }
}
