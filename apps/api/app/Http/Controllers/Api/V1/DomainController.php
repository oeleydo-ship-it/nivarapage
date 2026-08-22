<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\DomainResource;
use App\Models\Domain;
use App\Models\Site;
use App\Services\DomainService;
use App\Services\SubdomainService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use InvalidArgumentException;

class DomainController extends Controller
{
    public function check(Request $request, SubdomainService $subdomains): JsonResponse
    {
        $request->validate(['name' => ['required', 'string']]);

        return response()->json(['data' => $subdomains->check($request->string('name')->toString())]);
    }

    public function index(Site $site)
    {
        $this->authorize('view', $site);

        return DomainResource::collection($site->domains);
    }

    public function store(Request $request, Site $site, DomainService $domains)
    {
        $this->authorize('update', $site);
        $data = $request->validate([
            'hostname' => [
                'required',
                'string',
                'max:253',
                // Soft-deleted rows must not block a re-add: removing a domain
                // and connecting it again is a normal thing to do.
                Rule::unique('domains', 'hostname')->whereNull('deleted_at'),
            ],
        ], [], ['hostname' => 'hostname']);
        try {
            $domain = $domains->addCustom($site, $data['hostname']);
        } catch (InvalidArgumentException $e) {
            abort(422, $e->getMessage());
        }

        return (new DomainResource($domain))->response()->setStatusCode(201);
    }

    public function verify(Domain $domain, DomainService $domains)
    {
        $this->authorize('update', $domain);

        return new DomainResource($domains->verify($domain));
    }

    public function primary(Domain $domain, DomainService $domains)
    {
        $this->authorize('update', $domain);

        return new DomainResource($domains->makePrimary($domain));
    }

    public function retry(Domain $domain, DomainService $domains)
    {
        $this->authorize('update', $domain);

        return new DomainResource($domains->retry($domain));
    }

    public function destroy(Domain $domain, DomainService $domains): JsonResponse
    {
        $this->authorize('delete', $domain);
        $domains->delete($domain);

        return response()->json(['data' => ['ok' => true]]);
    }
}
