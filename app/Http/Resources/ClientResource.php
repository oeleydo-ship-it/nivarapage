<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Client */
class ClientResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'workspace_id' => $this->workspace_id,
            'name' => $this->name,
            'company' => $this->company,
            'email' => $this->email,
            'phone' => $this->phone,
            'website' => $this->website,
            'status' => $this->status,
            'industry' => $this->industry,
            'source' => $this->source,
            'address' => $this->address,
            'city' => $this->city,
            'region' => $this->region,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'notes' => $this->notes,
            'tags' => $this->tags ?? [],
            'extras' => $this->extras ?? [],
            'contacts_count' => $this->whenCounted('contacts'),
            'sites_count' => $this->whenCounted('sites'),
            'contacts' => ClientContactResource::collection($this->whenLoaded('contacts')),
            'sites' => SiteResource::collection($this->whenLoaded('sites')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
}
