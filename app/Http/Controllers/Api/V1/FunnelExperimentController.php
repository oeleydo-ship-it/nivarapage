<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Services\Funnels\FunnelExperimentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * A/B testing one step of a funnel.
 *
 * The step's own content is the control and is never a row here; a variant is
 * an alternative to it. Results are read from the events, so a version that ran
 * and was paused still shows what it did while it was running.
 */
class FunnelExperimentController extends Controller
{
    public function __construct(private readonly FunnelExperimentService $experiments) {}

    public function index(Funnel $funnel, string $step): JsonResponse
    {
        Gate::authorize('view', $funnel);

        return response()->json(['data' => $this->experiments->results($this->step($funnel, $step))]);
    }

    public function store(Request $request, Funnel $funnel, string $step): JsonResponse
    {
        Gate::authorize('update', $funnel);
        $model = $this->step($funnel, $step);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'weight' => ['nullable', 'integer', 'min:1', 'max:100'],
            'content' => ['nullable', 'array'],
        ]);

        $variant = $model->variants()->create([
            'workspace_id' => $funnel->workspace_id,
            'key' => $this->experiments->uniqueKey($model, $data['name']),
            'name' => $data['name'],
            'weight' => $data['weight'] ?? 1,
            // Starts as a copy of the step, so the first thing anybody does is
            // change something rather than build a page from nothing.
            'draft_content' => $data['content'] ?? $model->draft_content,
            'status' => 'active',
        ]);

        return response()->json(['data' => $variant], 201);
    }

    public function update(Request $request, Funnel $funnel, string $step, string $variant): JsonResponse
    {
        Gate::authorize('update', $funnel);
        $model = $this->step($funnel, $step);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:80'],
            'weight' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'status' => ['sometimes', 'in:active,paused'],
            'content' => ['sometimes', 'array'],
        ]);

        $row = $model->variants()->whereKey($variant)->firstOrFail();
        $row->update(array_filter([
            'name' => $data['name'] ?? null,
            'weight' => $data['weight'] ?? null,
            'status' => $data['status'] ?? null,
            'draft_content' => $data['content'] ?? null,
        ], fn ($value) => $value !== null));

        return response()->json(['data' => $row->fresh()]);
    }

    public function destroy(Funnel $funnel, string $step, string $variant): JsonResponse
    {
        Gate::authorize('update', $funnel);
        $this->step($funnel, $step)->variants()->whereKey($variant)->firstOrFail()->delete();

        return response()->json(['data' => ['ok' => true]]);
    }

    /**
     * Ends the experiment and sends everyone to one version.
     *
     * Losing variants are kept rather than removed: the numbers that justified
     * the decision should still be there to look at afterwards.
     */
    public function winner(Request $request, Funnel $funnel, string $step): JsonResponse
    {
        Gate::authorize('update', $funnel);
        $data = $request->validate(['key' => ['required', 'string', 'max:32']]);

        return response()->json([
            'data' => $this->experiments->declareWinner($this->step($funnel, $step), $data['key']),
        ]);
    }

    private function step(Funnel $funnel, string $step): FunnelStep
    {
        return $funnel->steps()->whereKey($step)->firstOrFail();
    }
}
