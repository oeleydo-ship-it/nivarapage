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
            $query->where('name', 'like', '%'.$term.'%');
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
        return $request->validate([
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
        ]);
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
