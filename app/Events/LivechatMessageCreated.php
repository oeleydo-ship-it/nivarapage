<?php

namespace App\Events;

use App\Http\Resources\LivechatMessageResource;
use App\Models\LivechatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LivechatMessageCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $queue = 'livechat';

    public function __construct(public LivechatMessage $message)
    {
        $this->message->loadMissing(['conversation.site', 'user']);
    }

    /**
     * @return list<Channel>
     */
    public function broadcastOn(): array
    {
        $conversation = $this->message->conversation;

        return [
            new PrivateChannel('livechat.workspace.'.$conversation->workspace_id),
            new Channel('livechat.visitor.'.$conversation->uuid),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->message->conversation_id,
            'conversation_uuid' => $this->message->conversation?->uuid,
            'site_id' => $this->message->conversation?->site_id,
            'message' => (new LivechatMessageResource($this->message))->resolve(),
        ];
    }
}
