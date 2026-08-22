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
            'stripe_price_monthly' => $this->stripe_price_monthly,
            'stripe_price_yearly' => $this->stripe_price_yearly,
            'subscriptions_count' => $this->whenCounted('subscriptions'),
        ];
    }
}
