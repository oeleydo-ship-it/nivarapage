<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Something a customer sells.
 *
 * Owned by the workspace rather than by one site, so the same product can be
 * put on a site page and on a funnel step without being duplicated.
 *
 * `price` is in minor units - pence, cents - the way Stripe counts, so money
 * never passes through a float.
 */
class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'workspace_id',
        'created_by',
        'name',
        'slug',
        'description',
        'image',
        'price',
        'currency',
        'type',
        'interval',
        'status',
        'success_url',
        'inventory',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'inventory' => 'integer',
            'metadata' => 'array',
        ];
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function isPurchasable(): bool
    {
        return $this->status === 'active' && ($this->inventory === null || $this->inventory > 0);
    }
}
