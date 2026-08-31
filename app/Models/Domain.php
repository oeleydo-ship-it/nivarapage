<?php

namespace App\Models;

use Database\Factories\DomainFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'workspace_id',
    'site_id',
    'type',
    'hostname',
    'is_primary',
    'status',
    'provider',
    'provider_reference',
    'verification_method',
    'verification_status',
    'verification_data',
    'ssl_status',
    'last_checked_at',
    'verified_at',
    'activated_at',
])]
class Domain extends Model
{
    /** @use HasFactory<DomainFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'verification_data' => 'array',
            'last_checked_at' => 'datetime',
            'verified_at' => 'datetime',
            'activated_at' => 'datetime',
        ];
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }
}
