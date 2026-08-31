<?php

namespace App\Jobs;

use App\Models\Domain;
use App\Services\AuditService;
use App\Services\TenantCacheService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ActivateCustomHostname implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $domainId)
    {
        $this->onQueue('domains');
    }

    public function handle(TenantCacheService $cache, AuditService $audit): void
    {
        $domain = Domain::query()->find($this->domainId);
        if (! $domain) {
            return;
        }

        $alreadyActive = $domain->status === 'active';

        $domain->update([
            'status' => 'active',
            'ssl_status' => 'active',
            'verified_at' => now(),
            'activated_at' => now(),
        ]);

        $domain = $domain->fresh();
        $cache->invalidateDomain($domain);

        if (! $alreadyActive) {
            $audit->log('domain.activated', $domain, ['site_id' => $domain->site_id], $domain->workspace);
        }
    }
}
