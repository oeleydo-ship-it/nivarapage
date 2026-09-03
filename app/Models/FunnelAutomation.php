<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * One rule: when this happens, wait this long, then do this.
 *
 * `config` holds whatever the action needs - a subject and body for an email,
 * a URL and a secret for a webhook - because the two have nothing in common
 * and a shared column would be empty half the time.
 */
class FunnelAutomation extends Model
{
    public const ACTIONS = ['email', 'webhook'];

    /** Events worth reacting to. Not every event type is an occasion. */
    public const TRIGGERS = [
        'lead_created',
        'form_submission',
        'purchase',
        'booking',
        'conversion',
        'step_view',
    ];

    protected $fillable = [
        'workspace_id',
        'funnel_id',
        'trigger_step_id',
        'name',
        'trigger_event',
        'delay_minutes',
        'action',
        'config',
        'status',
    ];

    protected $hidden = ['config'];

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'delay_minutes' => 'integer',
            'run_count' => 'integer',
            'last_run_at' => 'datetime',
        ];
    }

    public function funnel(): BelongsTo
    {
        return $this->belongsTo(Funnel::class);
    }

    public function runs(): HasMany
    {
        return $this->hasMany(FunnelAutomationRun::class);
    }

    /**
     * What the dashboard may see of the configuration.
     *
     * The webhook secret is write-only, the same as any other credential: it
     * is what proves a call came from us, so handing it back out would let
     * anyone who can read the screen forge one.
     *
     * @return array<string, mixed>
     */
    public function safeConfig(): array
    {
        $config = $this->config ?? [];
        unset($config['secret']);

        return $config;
    }
}
