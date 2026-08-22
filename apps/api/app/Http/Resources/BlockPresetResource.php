<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\BlockPreset */
class BlockPresetResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'category' => $this->category,
            'block_type' => $this->block_type,
            'type' => $this->block_type,
            'props' => $this->props,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'source' => $this->source,
            'prompt' => $this->when($request->user()?->is_super_admin, $this->prompt),
            'created_at' => $this->created_at,
        ];
    }
}
