<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One firing of one rule.
 *
 * Written before the work is attempted and updated after, so a run that never
 * finished is still visible. An automation nobody can see the history of is one
 * nobody can trust.
 */
class FunnelAutomationRun extends Model
{
    protected $fillable = [
        'workspace_id',
        'funnel_automation_id',
        'funnel_event_id',
        'funnel_lead_id',
        'status',
        'detail',
        'ran_at',
    ];

    protected function casts(): array
    {
        return ['ran_at' => 'datetime'];
    }

    public function automation(): BelongsTo
    {
        return $this->belongsTo(FunnelAutomation::class, 'funnel_automation_id');
    }
}
