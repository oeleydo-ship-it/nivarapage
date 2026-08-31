<?php

namespace App\Jobs;

use App\Contracts\DomainProviderInterface;
use App\Models\Domain;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class RetryFailedCustomHostname implements ShouldQueue
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

        $provider->createCustomHostname($domain);
    }
}
