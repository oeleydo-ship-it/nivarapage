<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['slug', 'name', 'prices', 'limits', 'is_active', 'billing_type', 'trial_days', 'stripe_price_monthly', 'stripe_price_yearly', 'stripe_price_lifetime'])]
class Plan extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'prices' => 'array',
            'limits' => 'array',
            'is_active' => 'boolean',
            'trial_days' => 'integer',
        ];
    }

    public function isOneTime(): bool
    {
        return $this->billing_type === 'one_time';
    }

    public function hasTrial(): bool
    {
        return ! $this->isOneTime() && (int) $this->trial_days > 0;
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}
