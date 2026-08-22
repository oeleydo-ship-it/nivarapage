<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['date', 'workspace_id', 'funnel_id', 'step_id', 'source', 'campaign', 'device', 'country', 'views', 'unique_visitors', 'sessions', 'leads', 'conversions', 'orders', 'bookings', 'checkout_starts', 'revenue'])]
class FunnelDailyStat extends Model
{
    protected function casts(): array { return ['date' => 'date', 'revenue' => 'decimal:2']; }
}
