<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Site */
class SiteResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'workspace_id' => $this->workspace_id,
            'client_id' => $this->client_id,
            'name' => $this->name,
            'business_name' => $this->business_name,
            'slug' => $this->slug,
            'category' => $this->category,
            'description' => $this->description,
            'status' => $this->status,
            'domains' => DomainResource::collection($this->whenLoaded('domains')),
            'created_at' => $this->created_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
}
