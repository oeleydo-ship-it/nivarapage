<?php

namespace App\Models;

use Database\Factories\BlogPostFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'workspace_id',
    'site_id',
    'created_by',
    'title',
    'slug',
    'excerpt',
    'body',
    'cover_image',
    'author_name',
    'category',
    'tags',
    'status',
    'published_at',
    'seo_title',
    'seo_description',
    'extras',
])]
class BlogPost extends Model
{
    /** @use HasFactory<BlogPostFactory> */
    use HasFactory, SoftDeletes;

    public const STATUSES = ['draft', 'published'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'extras' => 'array',
            'published_at' => 'datetime',
        ];
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeLive(Builder $query): Builder
    {
        return $query->where('status', 'published')
            ->where(function (Builder $inner) {
                $inner->whereNull('published_at')->orWhere('published_at', '<=', now());
            });
    }
}
