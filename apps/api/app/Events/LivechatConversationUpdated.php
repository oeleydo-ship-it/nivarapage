<?php

namespace App\Events;

use App\Http\Resources\LivechatConversationResource;
use App\Models\LivechatConversation;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LivechatConversationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $queue = 'livechat';

    public function __construct(public LivechatConversation $conversation)
    {
        $this->conversation->loadMissing(['site', 'assignee', 'client']);
    }

    /**
     * @return list<PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('livechat.workspace.'.$this->conversation->workspace_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'conversation';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'conversation' => (new LivechatConversationResource($this->conversation))->resolve(),
        ];
    }
}
