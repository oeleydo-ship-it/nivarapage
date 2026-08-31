<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['workspace_id', 'funnel_id', 'funnel_step_id', 'visitor_id', 'first_name', 'last_name', 'email', 'phone', 'company', 'country', 'source', 'campaign', 'data'])]
class FunnelLead extends Model
{
    protected function casts(): array { return ['data' => 'array']; }
    public function funnel(): BelongsTo { return $this->belongsTo(Funnel::class); }
    public function step(): BelongsTo { return $this->belongsTo(FunnelStep::class, 'funnel_step_id'); }
}
