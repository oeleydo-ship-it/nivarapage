<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

#[Fillable([
    'workspace_id',
    'site_id',
    'public_key',
    'enabled',
    'ai_enabled',
    'mode',
    'greeting',
    'offline_message',
    'primary_color',
    'theme',
    'surface_color',
    'text_color',
    'bubble_color',
    'position',
    'launcher_label',
    'launcher_icon',
    'collect_name',
    'collect_email',
    'collect_phone',
    'require_contact',
    'settings',
])]
class LivechatWidget extends Model
{
    public const MODES = ['ai_first', 'human_first', 'hybrid'];

    public const THEMES = ['dark', 'light', 'auto'];

    public const LAUNCHER_ICONS = ['chat', 'bubble', 'headset', 'sparkle'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'ai_enabled' => 'boolean',
            'collect_name' => 'boolean',
            'collect_email' => 'boolean',
            'collect_phone' => 'boolean',
            'require_contact' => 'boolean',
            'settings' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $widget): void {
            if (! $widget->public_key) {
                $widget->public_key = Str::lower(Str::ulid()->toBase32());
            }
        });
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function knowledge(): HasMany
    {
        return $this->hasMany(LivechatKnowledge::class, 'widget_id');
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(LivechatConversation::class, 'widget_id');
    }
}
