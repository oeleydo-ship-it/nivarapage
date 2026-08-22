<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Single-row Google sign-in configuration owned by the super admin.
 *
 * The client secret uses the `encrypted` cast and is hidden so it never leaks
 * through JSON responses. The client ID is public by design (it ships in the
 * OAuth redirect URL anyway).
 */
class GoogleAuthSetting extends Model
{
    protected $fillable = [
        'enabled',
        'client_id',
        'client_secret',
        'redirect_uri',
        'allow_registration',
        'allowed_domains',
        'prompt',
        'last_tested_at',
        'last_test_status',
        'last_test_message',
    ];

    protected $attributes = [
        'enabled' => true,
        'allow_registration' => true,
        'prompt' => 'select_account',
    ];

    protected $hidden = ['client_secret'];

    protected $casts = [
        'enabled' => 'boolean',
        'allow_registration' => 'boolean',
        'client_secret' => 'encrypted',
        'last_tested_at' => 'datetime',
    ];

    public static function current(): self
    {
        return static::query()->orderBy('id')->first() ?? static::query()->create([
            'enabled' => true,
            'allow_registration' => true,
            'prompt' => 'select_account',
        ]);
    }
}
