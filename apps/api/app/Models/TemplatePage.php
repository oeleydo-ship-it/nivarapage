<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['template_id', 'name', 'slug', 'is_homepage', 'content_json'])]
class TemplatePage extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_homepage' => 'boolean',
            'content_json' => 'array',
        ];
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }
}
