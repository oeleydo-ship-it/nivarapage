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
    'google_analytics_id',
    'google_site_verification',
    'locale',
    'timezone',
    'redirect_secondary_to_primary',
    'branding',
    'header_json',
    'footer_json',
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
            'header_json' => 'array',
            'footer_json' => 'array',
            'extras' => 'array',
        ];
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }
}
