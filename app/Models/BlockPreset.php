<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'name',
    'slug',
    'description',
    'category',
    'block_type',
    'props',
    'is_active',
    'is_featured',
    'source',
    'prompt',
    'created_by',
])]
class BlockPreset extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'props' => 'array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
