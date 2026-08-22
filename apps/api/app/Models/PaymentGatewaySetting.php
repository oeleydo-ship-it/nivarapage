<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Single-row payment gateway configuration owned by the super admin.
 *
 * Secret and webhook secret use the `encrypted` cast and are hidden so they
 * never leak through JSON responses. Publishable keys are public by design.
 */
class PaymentGatewaySetting extends Model
{
    protected $fillable = [
        'enabled',
        'provider',
        'mode',
        'publishable_key',
        'secret_key',
        'webhook_secret',
        'last_tested_at',
        'last_test_status',
        'last_test_message',
    ];

    protected $attributes = [
        'enabled' => true,
        'provider' => 'stripe',
        'mode' => 'test',
    ];

    protected $hidden = ['secret_key', 'webhook_secret'];

    protected $casts = [
        'enabled' => 'boolean',
        'secret_key' => 'encrypted',
        'webhook_secret' => 'encrypted',
        'last_tested_at' => 'datetime',
    ];

    public static function current(): self
    {
        return static::query()->orderBy('id')->first() ?? static::query()->create([
            'enabled' => true,
            'provider' => 'stripe',
            'mode' => 'test',
        ]);
    }
}
