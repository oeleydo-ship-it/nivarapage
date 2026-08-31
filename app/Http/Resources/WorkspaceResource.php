<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Workspace */
class WorkspaceResource extends JsonResource
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
            'status' => $this->status,
            'branding_removed' => $this->branding_removed,
            'role' => $this->whenPivotLoaded('workspace_users', fn () => $this->pivot->role),
            'owner_id' => $this->owner_id,
            'created_at' => $this->created_at,
            'plan' => $this->whenLoaded('subscription', fn () => $this->subscription?->plan?->only(['id', 'slug', 'name'])),
            'subscription_status' => $this->whenLoaded('subscription', fn () => $this->subscription?->status),
        ];
    }
}
