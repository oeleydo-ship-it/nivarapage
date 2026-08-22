<?php

namespace App\Models;

use Database\Factories\PageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'site_id',
    'name',
    'slug',
    'type',
    'status',
    'is_homepage',
    'seo_title',
    'seo_description',
    'seo_image',
    'canonical_url',
    'og_title',
    'og_description',
    'og_image',
    'robots_index',
    'draft_revision_id',
    'published_revision_id',
])]
class Page extends Model
{
    /** @use HasFactory<PageFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_homepage' => 'boolean',
            'robots_index' => 'boolean',
        ];
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(PageRevision::class);
    }

    public function funnelSteps(): HasMany
    {
        return $this->hasMany(FunnelStep::class);
    }

    public function draftRevision(): BelongsTo
    {
        return $this->belongsTo(PageRevision::class, 'draft_revision_id');
    }

    public function publishedRevision(): BelongsTo
    {
        return $this->belongsTo(PageRevision::class, 'published_revision_id');
    }
}
