<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['workspace_id', 'funnel_id', 'page_id', 'draft_content', 'published_content', 'name', 'slug', 'type', 'status', 'position', 'canvas_x', 'canvas_y', 'settings', 'seo_title', 'seo_description'])]
class FunnelStep extends Model
{
    use SoftDeletes;
    protected function casts(): array { return ['settings' => 'array', 'draft_content' => 'array', 'published_content' => 'array']; }
    public function funnel(): BelongsTo { return $this->belongsTo(Funnel::class); }
    public function page(): BelongsTo { return $this->belongsTo(Page::class); }
}
