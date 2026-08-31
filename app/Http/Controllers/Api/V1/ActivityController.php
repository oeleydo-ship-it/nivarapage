<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityResource;
use App\Models\Activity;
use App\Support\CurrentWorkspace;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function index(Request $request, CurrentWorkspace $current)
    {
        $items = Activity::query()
            ->with(['actor', 'workspace'])
            ->where('workspace_id', $current->id())
            ->when($request->filled('action'), fn (Builder $query) => $query->where('action', $request->string('action')))
            ->when($request->filled('actor_id'), fn (Builder $query) => $query->where('actor_id', $request->integer('actor_id')))
            ->when($request->filled('q'), function (Builder $query) use ($request) {
                $term = '%'.$request->string('q').'%';
                $query->where(function (Builder $inner) use ($term) {
                    $inner->where('action', 'like', $term)
                        ->orWhere('ip', 'like', $term)
                        ->orWhere('metadata', 'like', $term)
                        ->orWhereHas('actor', fn (Builder $actor) => $actor
                            ->where('name', 'like', $term)
                            ->orWhere('email', 'like', $term));
                });
            })
            ->latest()
            ->paginate((int) min($request->integer('per_page', 50) ?: 50, 100))
            ->withQueryString();

        return ActivityResource::collection($items);
    }

    public function actions(CurrentWorkspace $current): JsonResponse
    {
        $actions = Activity::query()
            ->where('workspace_id', $current->id())
            ->distinct()
            ->orderBy('action')
            ->pluck('action');

        return response()->json(['data' => $actions]);
    }
}
