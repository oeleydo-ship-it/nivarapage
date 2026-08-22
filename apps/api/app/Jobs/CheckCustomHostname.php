<?php

namespace App\Jobs;

use App\Contracts\DomainProviderInterface;
use App\Models\Domain;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class CheckCustomHostname implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $domainId)
    {
        $this->onQueue('domains');
    }

    public function handle(DomainProviderInterface $provider): void
    {
        $domain = Domain::query()->find($this->domainId);
        if (! $domain) {
            return;
        }

        $status = $provider->getStatus($domain);
        $domain->update($provider->attributesFrom($status));

        // Both have to be true: an active hostname whose certificate has not
        // issued still fails TLS in the browser.
        $ready = ($status['result']['status'] ?? null) === 'active'
            && ($status['result']['ssl']['status'] ?? null) === 'active';

        if ($ready) {
            ActivateCustomHostname::dispatch($domain->id)->onQueue('domains');
        }
    }
}
