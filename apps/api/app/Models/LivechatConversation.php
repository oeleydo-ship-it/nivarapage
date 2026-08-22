<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

#[Fillable([
    'uuid',
    'workspace_id',
    'site_id',
    'widget_id',
    'client_id',
    'assigned_user_id',
    'visitor_token_hash',
    'status',
    'handler',
    'visitor_name',
    'visitor_email',
    'visitor_phone',
    'page_url',
    'ip',
    'country',
    'region',
    'city',
    'locale',
    'timezone',
    'browser',
    'os',
    'device',
    'user_agent',
    'last_message_at',
    'agent_last_read_at',
    'agent_typing_until',
    'closed_at',
    'meta',
])]
#[Hidden(['visitor_token_hash'])]
class LivechatConversation extends Model
{
    public const STATUSES = ['open', 'waiting', 'assigned', 'closed'];

    public const HANDLERS = ['ai', 'human'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'meta' => 'array',
            'last_message_at' => 'datetime',
            'agent_last_read_at' => 'datetime',
            'agent_typing_until' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $conversation): void {
            if (! $conversation->uuid) {
                $conversation->uuid = (string) Str::uuid();
            }
        });
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function widget(): BelongsTo
    {
        return $this->belongsTo(LivechatWidget::class, 'widget_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(LivechatMessage::class, 'conversation_id');
    }

    public function matchesVisitorToken(string $token): bool
    {
        return hash_equals($this->visitor_token_hash, hash('sha256', $token));
    }

    public function latestVisibleMessage(): ?LivechatMessage
    {
        if ($this->relationLoaded('messages')) {
            return $this->messages
                ->sortByDesc('id')
                ->first(fn (LivechatMessage $message) => $message->role !== 'system');
        }

        return $this->messages()
            ->where('role', '!=', 'system')
            ->orderByDesc('id')
            ->first();
    }

    public function awaitingAgentReply(): bool
    {
        return $this->latestVisibleMessage()?->role === 'visitor';
    }

    public function isAgentTyping(): bool
    {
        return $this->awaitingAgentReply()
            && $this->agent_typing_until !== null
            && $this->agent_typing_until->isFuture();
    }
}
