<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'site_id',
    'default_description',
    'favicon',
    'social_image',
    'robots',
    'locale',
    'timezone',
    'redirect_secondary_to_primary',
    'branding',
    'extras',
])]
class SiteSetting extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'redirect_secondary_to_primary' => 'boolean',
            'branding' => 'array',
            'extras' => 'array',
        ];
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }
}
