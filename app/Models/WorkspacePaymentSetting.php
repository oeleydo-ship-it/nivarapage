<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A workspace's own Stripe connection.
 *
 * Distinct from PaymentGatewaySetting, which is the one row the platform uses
 * to charge workspaces for their plan. These are the customer's credentials:
 * charges go to their account and the platform is never in the money path.
 *
 * Secrets use the `encrypted` cast and are hidden, so they cannot leave through
 * a JSON response. The publishable key is public by design.
 */
class WorkspacePaymentSetting extends Model
{
    protected $fillable = [
        'workspace_id',
        'provider',
        'enabled',
        'mode',
        'secret_key',
        'webhook_secret',
        'publishable_key',
        'account_name',
        'currency',
        'verified_at',
        'last_error',
    ];

    protected $hidden = ['secret_key', 'webhook_secret'];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'secret_key' => 'encrypted',
            'webhook_secret' => 'encrypted',
            'verified_at' => 'datetime',
        ];
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }
}
