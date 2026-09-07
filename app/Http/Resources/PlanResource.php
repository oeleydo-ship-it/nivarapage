<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlanResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'prices' => $this->prices,
            'limits' => $this->limits,
            'is_active' => $this->is_active,
            'billing_type' => $this->billing_type ?? 'recurring',
            'trial_days' => $this->trial_days,
            'stripe_price_monthly' => $this->stripe_price_monthly,
            'stripe_price_yearly' => $this->stripe_price_yearly,
            'stripe_price_lifetime' => $this->stripe_price_lifetime,
            'subscriptions_count' => $this->whenCounted('subscriptions'),
        ];
    }
}
