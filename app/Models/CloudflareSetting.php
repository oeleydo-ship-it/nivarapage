<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Single-row Cloudflare for SaaS configuration owned by the super admin.
 *
 * The API token and webhook secret use the `encrypted` cast and are hidden so
 * they never leak through JSON responses. Every other column is nullable and
 * falls back to the CLOUDFLARE_* environment variables when empty.
 */
class CloudflareSetting extends Model
{
    protected $fillable = [
        'enabled',
        'api_token',
        'webhook_secret',
        'zone_id',
        'account_id',
        'fallback_origin',
        'cname_target',
        'apex_ips',
        'ssl_validation',
        'min_tls_version',
        'last_tested_at',
        'last_test_status',
        'last_test_message',
        'fallback_synced_at',
        'fallback_status',
        'fallback_message',
    ];

    protected $hidden = ['api_token', 'webhook_secret'];

    protected $casts = [
        'enabled' => 'boolean',
        'api_token' => 'encrypted',
        'webhook_secret' => 'encrypted',
        'last_tested_at' => 'datetime',
        'fallback_synced_at' => 'datetime',
    ];

    public static function current(): self
    {
        return static::query()->orderBy('id')->first() ?? static::query()->create([]);
    }
}
