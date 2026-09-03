<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * A discount code.
 *
 * Percent discounts hold whole points (20 means 20%); fixed ones hold minor
 * units, the same as a price. Nothing here is ever read from a request - a code
 * is looked up and the amount is worked out from what is stored.
 */
class Coupon extends Model
{
    protected $fillable = [
        'workspace_id',
        'product_id',
        'code',
        'type',
        'value',
        'currency',
        'max_redemptions',
        'starts_at',
        'expires_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'integer',
            'max_redemptions' => 'integer',
            'redeemed_count' => 'integer',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    /** Codes are matched without case, so they are stored folded. */
    public static function normalizeCode(string $code): string
    {
        return Str::upper(trim($code));
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Whether this code can be used on this product, right now.
     *
     * A code scoped to one product is refused on anything else rather than
     * quietly ignored: a shopper told the code applies and then charged full
     * price has been misled.
     */
    public function usableFor(Product $product, ?\DateTimeInterface $at = null): bool
    {
        $at ??= now();

        if ($this->status !== 'active') {
            return false;
        }
        if ($this->workspace_id !== $product->workspace_id) {
            return false;
        }
        if ($this->product_id !== null && $this->product_id !== $product->id) {
            return false;
        }
        if ($this->starts_at && $this->starts_at->isAfter($at)) {
            return false;
        }
        if ($this->expires_at && $this->expires_at->isBefore($at)) {
            return false;
        }
        if ($this->max_redemptions !== null && $this->redeemed_count >= $this->max_redemptions) {
            return false;
        }

        // A fixed discount in another currency would be a different amount of
        // money than the one it was written for.
        return ! ($this->type === 'fixed' && $this->currency && $this->currency !== $product->currency);
    }

    /**
     * What comes off the price, in minor units.
     *
     * Never more than the price itself: Stripe will not take a negative amount,
     * and a shop that meant to discount should not end up owing anybody.
     */
    public function discountFor(Product $product): int
    {
        $off = $this->type === 'percent'
            ? (int) floor($product->price * min(100, max(0, $this->value)) / 100)
            : $this->value;

        return max(0, min($off, $product->price));
    }
}
