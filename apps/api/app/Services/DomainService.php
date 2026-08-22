<?php

namespace App\Services;

use App\Contracts\DomainProviderInterface;
use App\Jobs\ActivateCustomHostname;
use App\Jobs\DeleteCustomHostname;
use App\Jobs\RetryFailedCustomHostname;
use App\Models\Domain;
use App\Models\Site;
use App\Support\CurrentWorkspace;
use App\Support\Hostname;
use InvalidArgumentException;

class DomainService
{
    public function __construct(
        private readonly PlanLimitService $limits,
        private readonly CurrentWorkspace $currentWorkspace,
        private readonly DomainProviderInterface $provider,
        private readonly TenantCacheService $cache,
        private readonly AuditService $audit,
        private readonly PublicSiteResolver $resolver,
    ) {}

    public function addCustom(Site $site, string $hostname): Domain
    {
        $workspace = $this->currentWorkspace->workspace ?? $site->workspace;
        $hostname = $this->resolver->normalizeHost($hostname);
        $this->assertConnectable($hostname);

        $this->limits->assertOrFail($workspace, 'custom_domains');

        // `hostname` is uniquely indexed and the model soft deletes, so a
        // previously removed domain leaves a tombstone that would block the
        // insert. The domain is already gone as far as anyone can see, and the
        // audit log keeps the history, so clear the row out.
        Domain::withTrashed()->whereNotNull('deleted_at')->where('hostname', $hostname)->forceDelete();

        $domain = Domain::query()->create([
            'workspace_id' => $workspace->id,
            'site_id' => $site->id,
            'type' => 'custom',
            'hostname' => $hostname,
            'is_primary' => false,
            'status' => 'pending',
            'provider' => config('uidesired.domain_provider', 'fake'),
        ]);

        // Registered synchronously so the customer gets their DNS records on the
        // same request. Queueing it as well would create the hostname twice.
        $this->provider->createCustomHostname($domain);

        $this->cache->invalidateDomain($domain->fresh('site'));
        $this->audit->log('domain.created', $domain, ['site_id' => $site->id], $workspace);

        return $domain->fresh();
    }

    /**
     * Re-reads the provider status and moves the domain forward if it is ready.
     *
     * A hostname is only live when Cloudflare reports both that the hostname is
     * active *and* that its certificate issued - going active on the hostname
     * alone would advertise a domain that then fails TLS in the browser.
     */
    public function verify(Domain $domain): Domain
    {
        $status = $this->provider->getStatus($domain);
        $attributes = $this->provider->attributesFrom($status);

        $hostnameActive = ($status['result']['status'] ?? null) === 'active';
        $sslActive = ($status['result']['ssl']['status'] ?? null) === 'active';

        if ($hostnameActive && $sslActive) {
            $domain->update(array_merge($attributes, ['status' => 'ssl_pending']));
            ActivateCustomHostname::dispatch($domain->id)->onQueue('domains');

            return $domain->fresh();
        }

        // Nudge the provider to re-check now: the customer just told us they
        // finished their DNS changes by pressing the button.
        if (! $hostnameActive || ! $sslActive) {
            $this->provider->revalidate($domain);
        }

        $domain->update(array_merge($attributes, [
            'status' => $hostnameActive ? 'ssl_pending' : 'verifying',
        ]));

        return $domain->fresh();
    }

    public function makePrimary(Domain $domain): Domain
    {
        Domain::query()->where('site_id', $domain->site_id)->update(['is_primary' => false]);
        $domain->update(['is_primary' => true]);
        $this->cache->invalidateDomain($domain);

        return $domain->fresh();
    }

    public function retry(Domain $domain): Domain
    {
        $domain->update(['status' => 'pending']);
        RetryFailedCustomHostname::dispatch($domain->id)->onQueue('domains');

        return $domain->fresh();
    }

    public function delete(Domain $domain): void
    {
        DeleteCustomHostname::dispatch($domain->id)->onQueue('domains');
        $this->cache->invalidateDomain($domain);
        $this->audit->log('domain.deleted', $domain, ['site_id' => $domain->site_id], $domain->workspace);
        $domain->delete();
    }

    /**
     * @throws InvalidArgumentException when the hostname can never work
     */
    private function assertConnectable(string $hostname): void
    {
        if (! Hostname::isValid($hostname) || ! str_contains($hostname, '.')) {
            throw new InvalidArgumentException('Enter a valid hostname like www.example.com.');
        }

        if (filter_var($hostname, FILTER_VALIDATE_IP)) {
            throw new InvalidArgumentException('Enter a hostname, not an IP address.');
        }

        // Platform subdomains are handed out by us and routed by a different
        // path; letting one be registered as a custom hostname would shadow the
        // real site.
        foreach ($this->reservedSuffixes() as $suffix) {
            if ($hostname === $suffix || str_ends_with($hostname, '.'.$suffix)) {
                throw new InvalidArgumentException(
                    'That hostname belongs to the platform. Connect a domain you own, or change the site subdomain instead.',
                );
            }
        }
    }

    /**
     * @return list<string>
     */
    private function reservedSuffixes(): array
    {
        return array_values(array_filter([
            Hostname::normalize((string) config('uidesired.platform_domain', '')),
            Hostname::normalize((string) config('uidesired.preview_domain', '')),
        ]));
    }
}
