<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A restorable snapshot of a site.
 *
 * `payload` holds the whole site as JSON. It is hidden by default so a listing
 * never ships megabytes of page content to the browser.
 */
#[Fillable(['workspace_id', 'site_id', 'user_id', 'label', 'kind', 'page_count', 'bytes', 'payload'])]
class SiteBackup extends Model
{
    protected $hidden = ['payload'];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'page_count' => 'integer',
            'bytes' => 'integer',
        ];
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }
}
