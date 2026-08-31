<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Subscription */
class SubscriptionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'workspace_id' => $this->workspace_id,
            'plan_id' => $this->plan_id,
            'status' => $this->status,
            'provider' => $this->provider,
            'provider_ref' => $this->provider_ref,
            'interval' => $this->interval,
            'current_period_end' => $this->current_period_end,
            'cancel_at_period_end' => $this->cancel_at_period_end,
            'workspace' => $this->whenLoaded('workspace', fn () => $this->workspace ? [
                'id' => $this->workspace->id,
                'name' => $this->workspace->name,
                'slug' => $this->workspace->slug,
                'status' => $this->workspace->status,
            ] : null),
            'plan' => $this->whenLoaded('plan', fn () => $this->plan ? [
                'id' => $this->plan->id,
                'slug' => $this->plan->slug,
                'name' => $this->plan->name,
            ] : null),
        ];
    }
}
