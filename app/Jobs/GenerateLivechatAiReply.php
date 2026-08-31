<?php

namespace App\Jobs;

use App\Events\LivechatConversationUpdated;
use App\Events\LivechatMessageCreated;
use App\Models\LivechatConversation;
use App\Services\Livechat\LivechatAiResponder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class GenerateLivechatAiReply implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    public int $timeout = 90;

    public function __construct(public int $conversationId, public int $afterMessageId)
    {
        $this->onQueue('livechat');
    }

    public function handle(LivechatAiResponder $responder): void
    {
        $conversation = LivechatConversation::query()
            ->with(['widget', 'site', 'messages'])
            ->find($this->conversationId);

        if (! $conversation || $conversation->status === 'closed') {
            return;
        }
        if ($conversation->handler !== 'ai') {
            return;
        }
        if (! $conversation->widget?->ai_enabled) {
            return;
        }

        $response = $responder->respond($conversation);
        $conversation->refresh();
        $latestVisitorId = $conversation->messages()
            ->where('role', 'visitor')
            ->orderByDesc('id')
            ->value('id');
        if ($conversation->handler !== 'ai' || (int) $latestVisitorId !== $this->afterMessageId) {
            $conversation->update(['agent_typing_until' => null]);

            return;
        }

        $reply = trim($response['reply']);
        $handoff = (bool) $response['handoff'];
        if ($reply !== '') {
            $message = $conversation->messages()->create([
                'role' => 'ai',
                'body' => $reply,
                'meta' => [
                    'after_message_id' => $this->afterMessageId,
                    'confidence' => $response['confidence'],
                    'sources' => $response['sources'],
                    'suggested_replies' => $response['suggested_replies'],
                    'handoff' => $handoff,
                    'handoff_reason' => $response['handoff_reason'],
                ],
            ]);
            LivechatMessageCreated::dispatch($message);
        }

        $conversation->update([
            'handler' => $handoff ? 'human' : 'ai',
            'status' => $handoff ? 'waiting' : 'open',
            'last_message_at' => now(),
            'agent_typing_until' => null,
        ]);
        if ($handoff) {
            NotifyLivechatAgents::dispatch($conversation->id);
        }
        LivechatConversationUpdated::dispatch($conversation->fresh(['site', 'assignee', 'client']));
    }

    public function failed(\Throwable $exception): void
    {
        LivechatConversation::query()->where('id', $this->conversationId)->update(['agent_typing_until' => null]);
        Log::warning('livechat.ai.failed', [
            'conversation_id' => $this->conversationId,
            'message' => $exception->getMessage(),
        ]);
    }
}
