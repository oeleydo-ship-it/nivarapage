<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['workspace_id', 'funnel_id', 'source_step_id', 'target_step_id', 'connection_type', 'conditions', 'priority'])]
class FunnelConnection extends Model
{
    protected function casts(): array { return ['conditions' => 'array']; }
    public function funnel(): BelongsTo { return $this->belongsTo(Funnel::class); }
    public function source(): BelongsTo { return $this->belongsTo(FunnelStep::class, 'source_step_id'); }
    public function target(): BelongsTo { return $this->belongsTo(FunnelStep::class, 'target_step_id'); }
}
