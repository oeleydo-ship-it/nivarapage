<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One attempt to buy something.
 *
 * Opened when a checkout session is created and settled when the provider says
 * it was paid. `provider_session_id` is unique so a webhook delivered twice -
 * which Stripe does not promise not to do - settles the same row instead of
 * opening a second order.
 */
class Order extends Model
{
    protected $fillable = [
        'workspace_id',
        'product_id',
        'site_id',
        'funnel_id',
        'reference',
        'provider_session_id',
        'provider_payment_id',
        'status',
        'amount',
        'currency',
        'customer_email',
        'customer_name',
        'metadata',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'metadata' => 'array',
            'paid_at' => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }
}
