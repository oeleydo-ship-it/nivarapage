<?php

namespace App\Http\Resources;

use App\Services\MediaService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Media */
class MediaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $service = app(MediaService::class);

        return [
            'id' => $this->id,
            'site_id' => $this->site_id,
            'filename' => $this->filename,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'width' => $this->width,
            'height' => $this->height,
            'alt_text' => $this->alt_text,
            'path' => $this->path,
            'disk' => $this->disk,
            'url' => $service->url($this->resource),
            'created_at' => $this->created_at,
        ];
    }
}
