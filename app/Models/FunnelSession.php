<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['workspace_id', 'visitor_id', 'funnel_id', 'landing_step_id', 'session_uuid', 'source', 'medium', 'campaign', 'term', 'content', 'landing_page', 'referrer', 'device', 'browser', 'os', 'country', 'region', 'city', 'is_bot', 'consent', 'started_at', 'last_activity_at', 'converted_at', 'ended_at'])]
class FunnelSession extends Model
{
    protected function casts(): array { return ['is_bot' => 'boolean', 'started_at' => 'datetime', 'last_activity_at' => 'datetime', 'converted_at' => 'datetime', 'ended_at' => 'datetime']; }
}
