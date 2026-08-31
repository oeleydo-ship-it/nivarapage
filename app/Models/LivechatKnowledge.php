<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'workspace_id',
    'site_id',
    'widget_id',
    'title',
    'source',
    'filename',
    'mime',
    'bytes',
    'content',
])]
class LivechatKnowledge extends Model
{
    protected $table = 'livechat_knowledge';

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function widget(): BelongsTo
    {
        return $this->belongsTo(LivechatWidget::class, 'widget_id');
    }
}
