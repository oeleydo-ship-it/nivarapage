<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Workspace;
use App\Support\CurrentWorkspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * What a workspace has sold.
 *
 * Read only. An order is opened by a checkout and settled by a webhook, so
 * there is nothing here a person should be able to edit - least of all whether
 * something was paid for.
 */
class OrderController extends Controller
{
    public function __construct(private readonly CurrentWorkspace $currentWorkspace) {}

    public function index(Request $request): JsonResponse
    {
        $workspace = $this->workspace();

        $query = Order::query()
            ->with('product:id,name')
            ->where('workspace_id', $workspace->id)
            ->latest('id');

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }
        if ($term = $request->string('q')->toString()) {
            $query->where(function ($inner) use ($term) {
                $inner->where('customer_email', 'like', '%'.$term.'%')
                    ->orWhere('reference', 'like', '%'.$term.'%');
            });
        }

        $orders = $query->limit(200)->get();

        return response()->json([
            'data' => $orders,
            'meta' => [
                // Only settled money is counted. A pending row is a checkout
                // somebody opened and may never have paid for.
                'paid_count' => $orders->where('status', 'paid')->count(),
                'paid_total' => $orders->where('status', 'paid')->sum('amount'),
                'currency' => $orders->first()->currency ?? null,
            ],
        ]);
    }

    private function workspace(): Workspace
    {
        $workspace = $this->currentWorkspace->workspace;
        abort_unless($workspace, 422, 'Workspace is required.');

        return $workspace;
    }
}
