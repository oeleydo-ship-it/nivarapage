<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['site_id', 'funnel_id', 'page_id', 'revision_id', 'path', 'html', 'hash'])]
class PageRender extends Model
{
    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    /** Set instead of a site when the render belongs to a standalone funnel. */
    public function funnel(): BelongsTo
    {
        return $this->belongsTo(Funnel::class);
    }
}
