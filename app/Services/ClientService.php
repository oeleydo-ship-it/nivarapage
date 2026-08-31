<?php

namespace App\Services;

use App\Models\Client;
use App\Models\ClientContact;
use App\Models\Site;
use App\Models\User;
use App\Support\CurrentWorkspace;
use Illuminate\Support\Facades\DB;

class ClientService
{
    public function __construct(
        private readonly AuditService $audit,
        private readonly CurrentWorkspace $currentWorkspace,
        private readonly PlanLimitService $limits,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(User $user, array $data): Client
    {
        $workspace = $this->currentWorkspace->workspace;
        abort_unless($workspace, 422, 'Workspace is required.');
        $this->limits->assertOrFail($workspace, 'clients');

        $client = Client::query()->create([
            ...$this->clientAttributes($data),
            'workspace_id' => $workspace->id,
            'created_by' => $user->id,
        ]);

        $this->audit->log('client.created', $client, [], $workspace, $user);

        return $client->fresh(['contacts', 'sites.domains']);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Client $client, array $data): Client
    {
        $client->update($this->clientAttributes($data, $client));
        $this->audit->log('client.updated', $client);

        return $client->fresh(['contacts', 'sites.domains']);
    }

    public function delete(Client $client): void
    {
        $client->sites()->update(['client_id' => null]);
        $client->delete();
        $this->audit->log('client.deleted', $client);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function addContact(Client $client, array $data): ClientContact
    {
        $contact = DB::transaction(function () use ($client, $data) {
            $primary = (bool) ($data['is_primary'] ?? false);
            if ($primary) {
                $client->contacts()->update(['is_primary' => false]);
            } elseif ($client->contacts()->count() === 0) {
                $primary = true;
            }

            return $client->contacts()->create([
                'workspace_id' => $client->workspace_id,
                'name' => $data['name'],
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'title' => $data['title'] ?? null,
                'is_primary' => $primary,
                'notes' => $data['notes'] ?? null,
                'extras' => $data['extras'] ?? [],
            ]);
        });

        $this->audit->log('client.contact_created', $client, ['contact_id' => $contact->id]);

        return $contact;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateContact(ClientContact $contact, array $data): ClientContact
    {
        DB::transaction(function () use ($contact, $data) {
            if (! empty($data['is_primary'])) {
                $contact->client?->contacts()->where('id', '!=', $contact->id)->update(['is_primary' => false]);
            }
            $contact->update($data);
        });

        $this->audit->log('client.contact_updated', $contact->client, ['contact_id' => $contact->id]);

        return $contact->fresh();
    }

    public function deleteContact(ClientContact $contact): void
    {
        $client = $contact->client;
        $contact->delete();
        if ($client && ! $client->contacts()->where('is_primary', true)->exists()) {
            $client->contacts()->orderBy('id')->first()?->update(['is_primary' => true]);
        }
        $this->audit->log('client.contact_deleted', $client, ['contact_id' => $contact->id]);
    }

    public function attachSite(Client $client, int $siteId): Site
    {
        $site = Site::query()
            ->where('workspace_id', $client->workspace_id)
            ->where('id', $siteId)
            ->firstOrFail();

        $site->update(['client_id' => $client->id]);
        $this->audit->log('client.site_attached', $client, ['site_id' => $site->id]);

        return $site->fresh('domains');
    }

    public function detachSite(Client $client, Site $site): void
    {
        abort_unless($site->workspace_id === $client->workspace_id && $site->client_id === $client->id, 404);
        $site->update(['client_id' => null]);
        $this->audit->log('client.site_detached', $client, ['site_id' => $site->id]);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function clientAttributes(array $data, ?Client $existing = null): array
    {
        $keys = [
            'name', 'company', 'email', 'phone', 'website', 'status', 'industry', 'source',
            'address', 'city', 'region', 'postal_code', 'country', 'notes', 'tags', 'extras',
        ];

        $attributes = [];
        foreach ($keys as $key) {
            if (array_key_exists($key, $data)) {
                $attributes[$key] = $data[$key];
            }
        }

        if (! isset($attributes['status']) && ! $existing) {
            $attributes['status'] = 'lead';
        }
        if (array_key_exists('tags', $attributes) && ! is_array($attributes['tags'])) {
            $attributes['tags'] = [];
        }
        if (array_key_exists('extras', $attributes) && ! is_array($attributes['extras'])) {
            $attributes['extras'] = [];
        }

        return $attributes;
    }
}
