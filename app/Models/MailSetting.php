<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Single-row platform SMTP configuration owned by the super admin.
 *
 * The password uses the `encrypted` cast and is hidden so it never leaks
 * through a JSON response.
 */
class MailSetting extends Model
{
    protected $fillable = [
        'transport',
        'host',
        'port',
        'encryption',
        'username',
        'password',
        'from_address',
        'from_name',
        'timeout',
        'last_tested_at',
        'last_test_status',
        'last_test_message',
    ];

    protected $hidden = ['password'];

    protected $casts = [
        'password' => 'encrypted',
        'port' => 'integer',
        'timeout' => 'integer',
        'last_tested_at' => 'datetime',
    ];

    public static function current(): self
    {
        return static::query()->orderBy('id')->first() ?? static::query()->create(['transport' => 'smtp']);
    }
}
