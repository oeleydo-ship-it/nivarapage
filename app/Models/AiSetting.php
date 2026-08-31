<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Single-row platform AI configuration owned by the super admin.
 *
 * `api_key` uses the `encrypted` cast so the value is unreadable at rest, and
 * it is deliberately hidden so it can never leak through a JSON response.
 */
class AiSetting extends Model
{
    protected $fillable = [
        'enabled',
        'provider',
        'model',
        'base_url',
        'api_key',
        'max_tokens',
        'temperature',
        'last_tested_at',
        'last_test_status',
        'last_test_message',
    ];

    protected $hidden = ['api_key'];

    protected $casts = [
        'enabled' => 'boolean',
        'api_key' => 'encrypted',
        'max_tokens' => 'integer',
        'temperature' => 'float',
        'last_tested_at' => 'datetime',
    ];

    public static function current(): self
    {
        return static::query()->orderBy('id')->first() ?? static::query()->create([]);
    }
}
