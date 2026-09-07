<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Workspace;
use App\Services\Commerce\ProductService;
use App\Support\CurrentWorkspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * A workspace's product catalogue.
 *
 * Scoped to the current workspace on every read and write - a product id from
 * another tenant simply is not found rather than being refused, so the API
 * never confirms that somebody else's product exists.
 */
class ProductController extends Controller
{
    public function __construct(
        private readonly ProductService $products,
        private readonly CurrentWorkspace $currentWorkspace,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $workspace = $this->workspace();

        $query = Product::query()->where('workspace_id', $workspace->id)->latest('id');
        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }
        if ($term = $request->string('q')->toString()) {
            $query->where(fn ($q) => $q->where('name', 'like', '%'.$term.'%')->orWhere('metadata->sku', 'like', '%'.$term.'%')->orWhere('metadata->category', 'like', '%'.$term.'%'));
        }

        return response()->json(['data' => $query->limit(200)->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $workspace = $this->workspace();
        $data = $this->validated($request);

        return response()->json(
            ['data' => $this->products->create($workspace, $request->user(), $data)],
            201,
        );
    }

    public function show(string $product): JsonResponse
    {
        return response()->json(['data' => $this->find($product)]);
    }

    public function update(Request $request, string $product): JsonResponse
    {
        $model = $this->find($product);

        return response()->json(['data' => $this->products->update($model, $this->validated($request, false))]);
    }

    public function destroy(string $product): JsonResponse
    {
        $this->products->delete($this->find($product));

        return response()->json(['data' => ['ok' => true]]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, bool $creating = true): array
    {
        $data = $request->validate([
            'name' => [$creating ? 'required' : 'sometimes', 'string', 'max:160'],
            'slug' => ['nullable', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:4000'],
            'image' => ['nullable', 'string', 'max:2048'],
            // Minor units, so this is a whole number of pence or cents.
            'price' => [$creating ? 'required' : 'sometimes', 'integer', 'min:0', 'max:99999999'],
            'currency' => ['nullable', 'string', 'size:3'],
            'type' => ['nullable', 'in:one_time,subscription'],
            'interval' => ['nullable', 'in:day,week,month,year'],
            'status' => ['nullable', 'in:draft,active,archived'],
            'success_url' => ['nullable', 'url', 'max:2048'],
            'inventory' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'metadata' => ['nullable', 'array'],
            'metadata.sku' => ['nullable', 'string', 'max:100'],
            'metadata.category' => ['nullable', 'string', 'max:100'],
            'metadata.images' => ['nullable', 'array', 'max:8'],
            'metadata.images.*' => ['required', 'url:http,https', 'max:2048'],
            'metadata.kind' => ['nullable', 'in:physical,digital'],
            'metadata.shipping_price' => ['nullable', 'integer', 'min:0', 'max:99999999'],
            'metadata.shipping_countries' => ['nullable', 'array', 'max:50'],
            'metadata.shipping_countries.*' => ['required', 'string', 'regex:/^[A-Z]{2}$/'],
            'metadata.delivery_url' => ['nullable', 'url:http,https', 'max:2048'],
        ]);
        $existing = $creating ? null : $this->find((string) $request->route('product'));
        $metadata = [...($existing?->metadata ?? []), ...($data['metadata'] ?? [])];
        $type = $data['type'] ?? $existing?->type ?? 'one_time';
        $status = $data['status'] ?? $existing?->status ?? 'draft';
        if (($metadata['kind'] ?? null) === 'physical') {
            if (empty($metadata['shipping_countries'])) {
                throw \Illuminate\Validation\ValidationException::withMessages(['metadata.shipping_countries' => 'Choose at least one shipping country.']);
            }
            if ($type === 'subscription') {
                throw \Illuminate\Validation\ValidationException::withMessages(['type' => 'Physical products currently support one-time purchases.']);
            }
        }
        if (($metadata['kind'] ?? null) === 'digital' && $status === 'active' && empty($metadata['delivery_url'])) {
            throw \Illuminate\Validation\ValidationException::withMessages(['metadata.delivery_url' => 'Add a delivery URL before activating this digital product.']);
        }
        if (array_key_exists('metadata', $data)) $data['metadata'] = $metadata;
        return $data;
    }

    private function find(string $product): Product
    {
        return Product::query()
            ->where('workspace_id', $this->workspace()->id)
            ->whereKey($product)
            ->firstOrFail();
    }

    private function workspace(): Workspace
    {
        $workspace = $this->currentWorkspace->workspace;
        abort_unless($workspace, 422, 'Workspace is required.');

        return $workspace;
    }
}
