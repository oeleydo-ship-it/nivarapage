<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['workspace_id', 'public_id', 'site_id', 'domain_id', 'created_by', 'name', 'slug', 'description', 'type', 'goal', 'status', 'settings', 'published_at'])]
class Funnel extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return ['settings' => 'array', 'published_at' => 'datetime'];
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function domain(): BelongsTo
    {
        return $this->belongsTo(Domain::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function steps(): HasMany
    {
        return $this->hasMany(FunnelStep::class)->orderBy('position');
    }

    /** Rules this funnel runs by itself. */
    public function automations(): HasMany
    {
        return $this->hasMany(FunnelAutomation::class);
    }

    public function connections(): HasMany
    {
        return $this->hasMany(FunnelConnection::class)->orderBy('priority');
    }

    public function events(): HasMany
    {
        return $this->hasMany(FunnelEvent::class);
    }

    public function leads(): HasMany
    {
        return $this->hasMany(FunnelLead::class);
    }
}
