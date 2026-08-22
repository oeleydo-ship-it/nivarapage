<?php

namespace App\Jobs;

use App\Contracts\DomainProviderInterface;
use App\Models\Domain;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SyncCustomHostnameStatus implements ShouldQueue
{
    use Queueable;

    /**
     * Every state a domain can sit in while still waiting on the provider.
     * `ssl_pending` belongs here: a hostname that validated but whose
     * certificate is still issuing would otherwise never be polled again.
     *
     * @var list<string>
     */
    private const PENDING_STATUSES = ['pending', 'verifying', 'ssl_pending'];

    public function __construct(public ?int $domainId = null)
    {
        $this->onQueue('domains');
    }

    public function handle(DomainProviderInterface $provider): void
    {
        $query = Domain::query()
            ->where('type', 'custom')
            ->whereIn('status', self::PENDING_STATUSES);

        if ($this->domainId) {
            $query->where('id', $this->domainId);
        }

        $query->each(function (Domain $domain) use ($provider): void {
            $status = $provider->getStatus($domain);
            $domain->update($provider->attributesFrom($status));

            $ready = ($status['result']['status'] ?? null) === 'active'
                && ($status['result']['ssl']['status'] ?? null) === 'active';

            if ($ready) {
                ActivateCustomHostname::dispatch($domain->id)->onQueue('domains');
            }
        });
    }
}
