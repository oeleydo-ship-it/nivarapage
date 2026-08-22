<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MediaResource;
use App\Models\Media;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class MediaController extends Controller
{
    public function index(Request $request, MediaService $media)
    {
        $this->authorize('viewAny', Media::class);

        $items = $media->list(
            $request->query('q'),
            $request->integer('site_id') ?: null,
        );

        return MediaResource::collection($items);
    }

    public function store(Request $request, MediaService $media)
    {
        $this->authorize('create', Media::class);
        $request->validate([
            // 50 MB — enough for short background loops (mp4/webm); plan storage still applies.
            'file' => ['required', 'file', 'max:51200'],
            'site_id' => ['nullable', 'integer'],
            'alt_text' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $item = $media->store(
                $request->file('file'),
                $request->user(),
                $request->integer('site_id') ?: null,
                $request->input('alt_text'),
            );
        } catch (InvalidArgumentException $e) {
            abort(422, $e->getMessage());
        }

        return (new MediaResource($item))->response()->setStatusCode(201);
    }

    public function show(Request $request, Media $media, MediaService $service)
    {
        $this->authorize('view', $media);

        return response()->json([
            'data' => array_merge(
                (new MediaResource($media))->resolve($request),
                ['usage' => $service->usage($media)],
            ),
        ]);
    }

    public function update(Request $request, Media $media, MediaService $service)
    {
        $this->authorize('update', $media);
        $data = $request->validate([
            'alt_text' => ['nullable', 'string', 'max:255'],
            'filename' => ['sometimes', 'string', 'max:255'],
        ]);

        return new MediaResource($service->update($media, $data));
    }

    public function destroy(Request $request, Media $media, MediaService $service): JsonResponse
    {
        $this->authorize('delete', $media);
        $service->delete($media, $request->user());

        return response()->json(['data' => ['ok' => true]]);
    }
}
