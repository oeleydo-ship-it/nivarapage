<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['date', 'workspace_id', 'funnel_id', 'step_id', 'visitor_id', 'source', 'campaign', 'device', 'country'])]
class FunnelDailyVisitor extends Model
{
    protected function casts(): array
    {
        return ['date' => 'date'];
    }
}
