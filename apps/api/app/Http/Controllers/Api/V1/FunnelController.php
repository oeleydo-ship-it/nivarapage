<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\FunnelResource;
use App\Models\Funnel;
use App\Models\FunnelConnection;
use App\Models\FunnelStep;
use App\Services\FeatureService;
use App\Services\Funnels\FunnelAnalyticsService;
use App\Services\Funnels\FunnelService;
use App\Support\CurrentWorkspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FunnelController extends Controller
{
    public function features(FeatureService $features): JsonResponse { return response()->json(['data' => $features->all()]); }

    public function index(Request $request, CurrentWorkspace $workspace)
    {
        $query = Funnel::query()->where('workspace_id', $workspace->id())->with('site')->withCount(['steps', 'leads', 'events'])->latest();
        if ($request->filled('q')) $query->where('name', 'like', '%'.$request->string('q').'%');
        if ($request->filled('status')) $query->where('status', $request->string('status'));
        return FunnelResource::collection($query->paginate(min($request->integer('per_page', 24), 100)));
    }

    public function store(Request $request, FunnelService $funnels, CurrentWorkspace $workspace)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:2000'],
            'type' => ['nullable', 'string', 'max:60'],
            'goal' => ['nullable', 'string', 'max:60'],
            'template' => ['nullable', 'in:lead_magnet,consultation,product_launch'],
        ]);
        abort_unless($workspace->workspace, 422, 'Select a workspace first.');
        return (new FunnelResource($funnels->create($workspace->workspace, $request->user(), $data)))->response()->setStatusCode(201);
    }

    public function show(Funnel $funnel, FunnelService $funnels) { $this->authorize('view', $funnel); return new FunnelResource($funnels->load($funnel)); }

    public function update(Request $request, Funnel $funnel, FunnelService $funnels)
    {
        $this->authorize('update', $funnel);
        $data = $request->validate(['name' => ['sometimes', 'string', 'max:255'], 'description' => ['nullable', 'string', 'max:2000'], 'type' => ['sometimes', 'string', 'max:60'], 'goal' => ['sometimes', 'string', 'max:60'], 'domain_id' => ['nullable', 'integer'], 'settings' => ['sometimes', 'array']]);
        return new FunnelResource($funnels->update($funnel, $data));
    }

    public function destroy(Funnel $funnel): JsonResponse { $this->authorize('delete', $funnel); $funnel->delete(); return response()->json(['data' => ['ok' => true]]); }
    public function publish(Request $request, Funnel $funnel, FunnelService $funnels) { $this->authorize('publish', $funnel); return new FunnelResource($funnels->publish($funnel, $request->user())); }
    public function pause(Funnel $funnel, FunnelService $funnels) { $this->authorize('publish', $funnel); $funnel->update(['status' => 'paused']); return new FunnelResource($funnels->load($funnel)); }
    public function duplicate(Request $request, Funnel $funnel, FunnelService $funnels) { $this->authorize('update', $funnel); return new FunnelResource($funnels->duplicate($funnel, $request->user())); }

    public function addStep(Request $request, Funnel $funnel, FunnelService $funnels)
    {
        $this->authorize('update', $funnel);
        $data = $request->validate(['name' => ['required', 'string', 'max:255'], 'slug' => ['nullable', 'string', 'max:160'], 'type' => ['required', 'string', 'max:60'], 'position' => ['nullable', 'integer'], 'canvas_x' => ['nullable', 'integer'], 'canvas_y' => ['nullable', 'integer'], 'settings' => ['nullable', 'array']]);
        return response()->json(['data' => $funnels->addStep($funnel, $request->user(), $data)->load('page')], 201);
    }

    public function updateStep(Request $request, Funnel $funnel, FunnelStep $funnelStep, FunnelService $funnels)
    {
        $this->authorize('update', $funnel);
        $data = $request->validate(['name' => ['sometimes', 'string', 'max:255'], 'type' => ['sometimes', 'string', 'max:60'], 'status' => ['sometimes', 'in:draft,published,hidden'], 'position' => ['sometimes', 'integer'], 'canvas_x' => ['sometimes', 'integer'], 'canvas_y' => ['sometimes', 'integer'], 'settings' => ['sometimes', 'array']]);
        return response()->json(['data' => $funnels->updateStep($funnel, $funnelStep, $data)]);
    }

    public function saveStepContent(Request $request, Funnel $funnel, FunnelStep $funnelStep, FunnelService $funnels): JsonResponse
    {
        $this->authorize('update', $funnel);
        $content = $request->validate(['schemaVersion' => ['required', 'integer', 'in:1'], 'sections' => ['required', 'array']]);
        return response()->json(['data' => $funnels->saveStepContent($funnel, $funnelStep, $content)]);
    }

    public function deleteStep(Funnel $funnel, FunnelStep $funnelStep, FunnelService $funnels): JsonResponse { $this->authorize('update', $funnel); abort_unless($funnelStep->funnel_id === $funnel->id, 404); $funnelStep->page?->update(['status' => 'hidden', 'published_revision_id' => null]); $funnelStep->delete(); return response()->json(['data' => ['ok' => true]]); }
    public function connect(Request $request, Funnel $funnel, FunnelService $funnels) { $this->authorize('update', $funnel); $data=$request->validate(['source_step_id'=>['required','integer'],'target_step_id'=>['required','integer'],'connection_type'=>['nullable','string','max:40'],'conditions'=>['nullable','array'],'priority'=>['nullable','integer']]); return response()->json(['data'=>$funnels->connect($funnel,$data)],201); }
    public function disconnect(Funnel $funnel, FunnelConnection $funnelConnection): JsonResponse { $this->authorize('update', $funnel); abort_unless($funnelConnection->funnel_id === $funnel->id,404); $funnelConnection->delete(); return response()->json(['data'=>['ok'=>true]]); }
    public function analytics(Request $request, FunnelAnalyticsService $analytics, ?Funnel $funnel = null): JsonResponse { if($funnel) $this->authorize('view',$funnel); $filters=$request->validate(['funnel_id'=>['nullable','integer'],'domain_id'=>['nullable','integer'],'source'=>['nullable','string','max:120'],'campaign'=>['nullable','string','max:255'],'device'=>['nullable','in:desktop,mobile,tablet,unknown'],'country'=>['nullable','string','max:80']]); return response()->json(['data'=>$analytics->overview($funnel,$request->integer('days',30),$filters)]); }
    public function leads(Request $request, CurrentWorkspace $workspace): JsonResponse { $rows=\App\Models\FunnelLead::query()->where('workspace_id',$workspace->id())->with(['funnel:id,name','step:id,name'])->latest()->paginate(min($request->integer('per_page',50),100)); return response()->json(['data'=>$rows->items(),'meta'=>['current_page'=>$rows->currentPage(),'last_page'=>$rows->lastPage(),'total'=>$rows->total()]]); }
}
