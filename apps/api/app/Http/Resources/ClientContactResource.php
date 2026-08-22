<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\ClientContact */
class ClientContactResource extends JsonResource
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
            'email' => $this->email,
            'phone' => $this->phone,
            'title' => $this->title,
            'is_primary' => (bool) $this->is_primary,
            'notes' => $this->notes,
            'extras' => $this->extras ?? [],
            'created_at' => $this->created_at,
        ];
    }
}
