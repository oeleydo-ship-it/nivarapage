<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ClientContactResource;
use App\Http\Resources\ClientResource;
use App\Http\Resources\SiteResource;
use App\Models\Client;
use App\Models\ClientContact;
use App\Models\Site;
use App\Services\ClientService;
use App\Support\CurrentWorkspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index(Request $request, CurrentWorkspace $current)
    {
        $this->authorize('viewAny', Client::class);

        $clients = Client::query()
            ->where('workspace_id', $current->id())
            ->with(['contacts', 'sites.domains'])
            ->withCount(['contacts', 'sites'])
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->when($request->filled('q'), function ($query) use ($request) {
                $term = '%'.trim((string) $request->query('q')).'%';
                $query->where(function ($inner) use ($term) {
                    $inner->where('name', 'like', $term)
                        ->orWhere('company', 'like', $term)
                        ->orWhere('email', 'like', $term)
                        ->orWhere('phone', 'like', $term)
                        ->orWhere('industry', 'like', $term)
                        ->orWhereHas('contacts', function ($contacts) use ($term) {
                            $contacts->where('name', 'like', $term)->orWhere('email', 'like', $term);
                        });
                });
            })
            ->latest()
            ->get();

        return ClientResource::collection($clients);
    }

    public function store(Request $request, ClientService $clients)
    {
        $this->authorize('create', Client::class);

        $client = $clients->create($request->user(), $this->validatedClient($request));

        return (new ClientResource($client))->response()->setStatusCode(201);
    }

    public function show(Client $client)
    {
        $this->authorize('view', $client);

        return new ClientResource($client->load(['contacts', 'sites.domains'])->loadCount(['contacts', 'sites']));
    }

    public function update(Request $request, Client $client, ClientService $clients)
    {
        $this->authorize('update', $client);

        return new ClientResource($clients->update($client, $this->validatedClient($request, true)));
    }

    public function destroy(Client $client, ClientService $clients): JsonResponse
    {
        $this->authorize('delete', $client);
        $clients->delete($client);

        return response()->json(['data' => ['ok' => true]]);
    }

    public function storeContact(Request $request, Client $client, ClientService $clients)
    {
        $this->authorize('update', $client);

        $contact = $clients->addContact($client, $this->validatedContact($request));

        return (new ClientContactResource($contact))->response()->setStatusCode(201);
    }

    public function updateContact(Request $request, ClientContact $clientContact, ClientService $clients)
    {
        $this->authorize('update', $clientContact->client);

        return new ClientContactResource($clients->updateContact($clientContact, $this->validatedContact($request, true)));
    }

    public function destroyContact(ClientContact $clientContact, ClientService $clients): JsonResponse
    {
        $this->authorize('update', $clientContact->client);
        $clients->deleteContact($clientContact);

        return response()->json(['data' => ['ok' => true]]);
    }

    public function attachSite(Request $request, Client $client, ClientService $clients)
    {
        $this->authorize('update', $client);
        $data = $request->validate([
            'site_id' => ['required', 'integer'],
        ]);

        return new SiteResource($clients->attachSite($client, (int) $data['site_id'])->load('domains'));
    }

    public function detachSite(Client $client, Site $site, ClientService $clients): JsonResponse
    {
        $this->authorize('update', $client);
        $clients->detachSite($client, $site);

        return response()->json(['data' => ['ok' => true]]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedClient(Request $request, bool $partial = false): array
    {
        $sometimes = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'name' => [$sometimes, 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:60'],
            'website' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:'.implode(',', Client::STATUSES)],
            'industry' => ['nullable', 'string', 'max:120'],
            'source' => ['nullable', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
            'region' => ['nullable', 'string', 'max:120'],
            'postal_code' => ['nullable', 'string', 'max:40'],
            'country' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string', 'max:10000'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:40'],
            'extras' => ['nullable', 'array'],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedContact(Request $request, bool $partial = false): array
    {
        $sometimes = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'name' => [$sometimes, 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:60'],
            'title' => ['nullable', 'string', 'max:120'],
            'is_primary' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'extras' => ['nullable', 'array'],
        ]);
    }
}
