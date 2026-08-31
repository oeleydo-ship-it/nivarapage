<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Single-row platform media storage configuration owned by the super admin.
 *
 * Access keys use the `encrypted` cast and are hidden so they never leak
 * through JSON responses.
 */
class StorageSetting extends Model
{
    protected $fillable = [
        'provider',
        'bucket',
        'region',
        'endpoint',
        'public_url',
        'root',
        'use_path_style_endpoint',
        'access_key_id',
        'secret_access_key',
        'last_tested_at',
        'last_test_status',
        'last_test_message',
    ];

    protected $hidden = [
        'access_key_id',
        'secret_access_key',
    ];

    protected $casts = [
        'use_path_style_endpoint' => 'boolean',
        'access_key_id' => 'encrypted',
        'secret_access_key' => 'encrypted',
        'last_tested_at' => 'datetime',
    ];

    public static function current(): self
    {
        return static::query()->orderBy('id')->first() ?? static::query()->create([
            'provider' => 'local',
        ]);
    }
}
