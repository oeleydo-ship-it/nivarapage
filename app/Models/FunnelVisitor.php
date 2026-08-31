<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['workspace_id', 'uuid', 'first_seen_at', 'last_seen_at', 'first_source', 'first_medium', 'first_campaign', 'first_referrer', 'last_source', 'last_medium', 'last_campaign', 'last_referrer'])]
class FunnelVisitor extends Model
{
    protected function casts(): array { return ['first_seen_at' => 'datetime', 'last_seen_at' => 'datetime']; }
}
