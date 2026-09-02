<?php

namespace App\Models;

use Database\Factories\SiteFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['workspace_id', 'client_id', 'name', 'business_name', 'slug', 'category', 'description', 'status', 'created_by'])]
class Site extends Model
{
    /** @use HasFactory<SiteFactory> */
    use HasFactory, SoftDeletes;

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function settings(): HasOne
    {
        return $this->hasOne(SiteSetting::class);
    }

    public function theme(): HasOne
    {
        return $this->hasOne(SiteThemeSetting::class);
    }

    public function domains(): HasMany
    {
        return $this->hasMany(Domain::class);
    }

    public function pages(): HasMany
    {
        return $this->hasMany(Page::class);
    }

    public function backups(): HasMany
    {
        return $this->hasMany(SiteBackup::class);
    }

    public function menus(): HasMany
    {
        return $this->hasMany(Menu::class);
    }

    public function forms(): HasMany
    {
        return $this->hasMany(Form::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(Media::class);
    }

    public function blogPosts(): HasMany
    {
        return $this->hasMany(BlogPost::class);
    }

    public function livechatWidget(): HasOne
    {
        return $this->hasOne(LivechatWidget::class);
    }

    public function livechatConversations(): HasMany
    {
        return $this->hasMany(LivechatConversation::class);
    }
}
