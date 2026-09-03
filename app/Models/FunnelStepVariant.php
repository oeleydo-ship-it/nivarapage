<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One version of a funnel step in an experiment.
 *
 * The step's own content is the control. A variant is an alternative to it, and
 * the two are compared on what visitors actually did.
 */
class FunnelStepVariant extends Model
{
    /** The key the step's own content answers to, so control is addressable too. */
    public const CONTROL = 'control';

    protected $fillable = [
        'workspace_id',
        'funnel_step_id',
        'key',
        'name',
        'draft_content',
        'published_content',
        'weight',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'draft_content' => 'array',
            'published_content' => 'array',
            'weight' => 'integer',
        ];
    }

    public function step(): BelongsTo
    {
        return $this->belongsTo(FunnelStep::class, 'funnel_step_id');
    }
}
