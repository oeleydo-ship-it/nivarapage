<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Workspace;
use App\Support\CurrentWorkspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * The discount codes a shop hands out.
 *
 * How many times a code has been used is not writable here. That number is
 * counted when money arrives, and letting it be typed would let a shop
 * accidentally hand a limited code back out.
 */
class CouponController extends Controller
{
    public function __construct(private readonly CurrentWorkspace $currentWorkspace) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Coupon::query()
                ->where('workspace_id', $this->workspace()->id)
                ->latest('id')
                ->limit(200)
                ->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $workspace = $this->workspace();
        $data = $this->validated($request, $workspace);

        $coupon = Coupon::query()->create($data + ['workspace_id' => $workspace->id]);

        return response()->json(['data' => $coupon], 201);
    }

    public function update(Request $request, string $coupon): JsonResponse
    {
        $model = $this->find($coupon);
        $model->update($this->validated($request, $this->workspace(), $model->id, false));

        return response()->json(['data' => $model->fresh()]);
    }

    public function destroy(string $coupon): JsonResponse
    {
        $this->find($coupon)->delete();

        return response()->json(['data' => ['ok' => true]]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, Workspace $workspace, ?int $ignoreId = null, bool $creating = true): array
    {
        // Folded before the unique rule runs, not after. Checking "save20" and
        // then storing "SAVE20" let a duplicate past validation and straight
        // into a constraint violation, which reads as the app being broken.
        if ($request->filled('code')) {
            $request->merge(['code' => Coupon::normalizeCode((string) $request->input('code'))]);
        }

        $data = $request->validate([
            'code' => [
                $creating ? 'required' : 'sometimes',
                'string',
                'max:60',
                // Scoped to the workspace: two shops may both run SAVE20.
                Rule::unique('coupons', 'code')
                    ->where('workspace_id', $workspace->id)
                    ->ignore($ignoreId),
            ],
            'type' => ['sometimes', 'in:percent,fixed'],
            // Percent is whole points; fixed is minor units, like a price.
            'value' => [$creating ? 'required' : 'sometimes', 'integer', 'min:0', 'max:99999999'],
            'currency' => ['nullable', 'string', 'size:3'],
            'product_id' => ['nullable', 'integer'],
            'max_redemptions' => ['nullable', 'integer', 'min:1', 'max:1000000'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date'],
            'status' => ['sometimes', 'in:active,disabled'],
        ]);

        // A percent over 100 would take more off than the thing costs.
        if (($data['type'] ?? 'percent') === 'percent' && isset($data['value'])) {
            $data['value'] = min(100, $data['value']);
        }
        // A product from another workspace would scope this code to something
        // the shop does not own.
        if (! empty($data['product_id'])) {
            $owned = $workspace->products()->whereKey($data['product_id'])->exists();
            abort_unless($owned, 422, 'That product is not in this workspace.');
        }

        return $data;
    }

    private function find(string $coupon): Coupon
    {
        return Coupon::query()
            ->where('workspace_id', $this->workspace()->id)
            ->whereKey($coupon)
            ->firstOrFail();
    }

    private function workspace(): Workspace
    {
        $workspace = $this->currentWorkspace->workspace;
        abort_unless($workspace, 422, 'Workspace is required.');

        return $workspace;
    }
}
