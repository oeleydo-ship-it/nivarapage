<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['workspace_id', 'funnel_id', 'step_id', 'visitor_id', 'session_id', 'lead_id', 'idempotency_key', 'event_type', 'source', 'medium', 'campaign', 'device', 'browser', 'country', 'revenue', 'currency', 'is_bot', 'event_data', 'url', 'referrer', 'occurred_at', 'processed_at'])]
class FunnelEvent extends Model
{
    protected function casts(): array { return ['event_data' => 'array', 'revenue' => 'decimal:2', 'is_bot' => 'boolean', 'occurred_at' => 'datetime', 'processed_at' => 'datetime']; }
}
