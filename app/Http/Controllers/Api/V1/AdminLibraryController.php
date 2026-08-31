<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BlockPresetResource;
use App\Http\Resources\TemplateResource;
use App\Models\BlockPreset;
use App\Services\Ai\AiGenerator;
use App\Services\LibraryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminLibraryController extends Controller
{
    public function generateTemplate(Request $request, LibraryService $library, AiGenerator $generator): JsonResponse
    {
        $generator->config();
        $data = $request->validate([
            'prompt' => ['required', 'string', 'min:8', 'max:2000'],
            'name' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'category' => ['nullable', 'string', 'max:80'],
            'tone' => ['nullable', 'string', 'max:60'],
            'is_premium' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
        ]);

        $result = $library->generateTemplate($data, $request->user());

        return response()->json(['data' => [
            'template' => (new TemplateResource($result['template']))->resolve(),
            'report' => $result['report'],
        ]], 201);
    }

    public function generateBlock(Request $request, LibraryService $library, AiGenerator $generator): JsonResponse
    {
        $generator->config();
        $data = $request->validate([
            'prompt' => ['required', 'string', 'min:3', 'max:2000'],
            'name' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'type' => ['nullable', 'string', 'max:80'],
            'tone' => ['nullable', 'string', 'max:60'],
            'is_featured' => ['sometimes', 'boolean'],
        ]);

        $result = $library->generateBlock($data, $request->user());

        return response()->json(['data' => [
            'preset' => (new BlockPresetResource($result['preset']))->resolve(),
            'report' => $result['report'],
        ]], 201);
    }

    public function presets()
    {
        return BlockPresetResource::collection(
            BlockPreset::query()->orderByDesc('is_featured')->orderByDesc('id')->get()
        );
    }

    public function updatePreset(Request $request, BlockPreset $preset): BlockPresetResource
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
        ]);
        $preset->update($data);

        return new BlockPresetResource($preset->fresh());
    }

    public function destroyPreset(BlockPreset $preset): JsonResponse
    {
        $preset->delete();

        return response()->json(['data' => ['ok' => true]]);
    }
}
