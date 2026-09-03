<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Funnel;
use App\Models\FunnelAutomation;
use App\Services\Funnels\FunnelAutomationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

/**
 * Rules a funnel runs by itself.
 *
 * Where a rule may send is settled here, when it is saved, rather than when it
 * fires: somebody should be told their webhook address is unreachable while
 * they are looking at the form, not have it quietly fail an hour later.
 */
class FunnelAutomationController extends Controller
{
    public function __construct(private readonly FunnelAutomationService $automations) {}

    public function index(Funnel $funnel): JsonResponse
    {
        Gate::authorize('view', $funnel);

        $rules = $funnel->automations()->withCount('runs')->latest('id')->get();

        return response()->json([
            // The secret never comes back out; everything else may.
            'data' => $rules->map(fn (FunnelAutomation $rule) => $rule->toArray() + ['config' => $rule->safeConfig()]),
        ]);
    }

    public function store(Request $request, Funnel $funnel): JsonResponse
    {
        Gate::authorize('update', $funnel);
        $data = $this->validated($request, $funnel);

        $rule = $funnel->automations()->create($data + ['workspace_id' => $funnel->workspace_id]);

        return response()->json(['data' => $rule->toArray() + ['config' => $rule->safeConfig()]], 201);
    }

    public function update(Request $request, Funnel $funnel, string $automation): JsonResponse
    {
        Gate::authorize('update', $funnel);
        $rule = $funnel->automations()->whereKey($automation)->firstOrFail();

        $rule->update($this->validated($request, $funnel, $rule));
        $fresh = $rule->fresh();

        return response()->json(['data' => $fresh->toArray() + ['config' => $fresh->safeConfig()]]);
    }

    public function destroy(Funnel $funnel, string $automation): JsonResponse
    {
        Gate::authorize('update', $funnel);
        $funnel->automations()->whereKey($automation)->firstOrFail()->delete();

        return response()->json(['data' => ['ok' => true]]);
    }

    /** What a rule has actually done, most recent first. */
    public function runs(Funnel $funnel, string $automation): JsonResponse
    {
        Gate::authorize('view', $funnel);
        $rule = $funnel->automations()->whereKey($automation)->firstOrFail();

        return response()->json(['data' => $rule->runs()->latest('id')->limit(100)->get()]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, Funnel $funnel, ?FunnelAutomation $existing = null): array
    {
        $creating = $existing === null;

        $data = $request->validate([
            'name' => [$creating ? 'required' : 'sometimes', 'string', 'max:120'],
            'trigger_event' => [$creating ? 'required' : 'sometimes', Rule::in(FunnelAutomation::TRIGGERS)],
            'trigger_step_id' => ['nullable', 'integer'],
            // Capped at a fortnight: a queue is not a calendar, and a job held
            // for months is one nobody remembers scheduling.
            'delay_minutes' => ['nullable', 'integer', 'min:0', 'max:20160'],
            'action' => [$creating ? 'required' : 'sometimes', Rule::in(FunnelAutomation::ACTIONS)],
            'status' => ['sometimes', 'in:active,paused'],
            'config' => ['sometimes', 'array'],
            'config.to' => ['nullable', 'string', 'max:255'],
            'config.subject' => ['nullable', 'string', 'max:200'],
            'config.body' => ['nullable', 'string', 'max:5000'],
            'config.url' => ['nullable', 'string', 'max:2048'],
            'config.secret' => ['nullable', 'string', 'max:120'],
        ]);

        // A step from another funnel would make a rule that never fires.
        if (! empty($data['trigger_step_id'])) {
            $owned = $funnel->steps()->whereKey($data['trigger_step_id'])->exists();
            abort_unless($owned, 422, 'That step is not part of this funnel.');
        }

        $action = $data['action'] ?? $existing?->action;
        // Merged, so saving a subject does not blank a secret that was never
        // on the form in the first place.
        $config = array_merge($existing?->config ?? [], $data['config'] ?? []);

        try {
            if ($action === 'webhook') {
                if (empty($config['url'])) {
                    throw new InvalidArgumentException('A webhook rule needs an address to call.');
                }
                $this->automations->assertWebhookUrl((string) $config['url']);
            }
            if ($action === 'email') {
                $this->automations->assertRecipient($funnel->workspace, (string) ($config['to'] ?? 'lead'));
            }
        } catch (InvalidArgumentException $e) {
            throw ValidationException::withMessages(['config' => $e->getMessage()]);
        }

        $data['config'] = $config;

        return $data;
    }
}
