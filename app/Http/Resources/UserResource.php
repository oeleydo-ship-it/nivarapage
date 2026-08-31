<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\User */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $subscriptionWorkspace = null;
        $candidates = collect();
        if ($this->relationLoaded('currentWorkspace') && $this->currentWorkspace) {
            $candidates->push($this->currentWorkspace);
        }
        if ($this->relationLoaded('ownedWorkspaces')) {
            $candidates = $candidates->merge($this->ownedWorkspaces);
        }
        if ($this->relationLoaded('workspaces')) {
            $candidates = $candidates->merge($this->workspaces);
        }
        $subscriptionWorkspace = $candidates->first(fn ($workspace) => $workspace->relationLoaded('subscription') && $workspace->subscription)
            ?? $candidates->first();

        $plan = $subscriptionWorkspace?->subscription?->plan;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified' => $this->hasVerifiedEmail(),
            'email_verified_at' => $this->email_verified_at,
            'role' => $this->whenPivotLoaded('workspace_users', fn () => $this->pivot->role),
            'current_workspace_id' => $this->current_workspace_id,
            'is_super_admin' => $this->is_super_admin,
            'is_blocked' => $this->blocked_at !== null,
            'blocked_at' => $this->blocked_at,
            'blocked_reason' => $this->blocked_reason,
            'subscription' => $this->when(
                $this->relationLoaded('currentWorkspace')
                    || $this->relationLoaded('ownedWorkspaces')
                    || $this->relationLoaded('workspaces'),
                fn () => [
                    'plan_name' => $plan?->name,
                    'plan_slug' => $plan?->slug,
                    'status' => $subscriptionWorkspace?->subscription?->status,
                    'workspace_id' => $subscriptionWorkspace?->id,
                    'workspace_name' => $subscriptionWorkspace?->name,
                ],
            ),
            'created_at' => $this->created_at,
        ];
    }
}
