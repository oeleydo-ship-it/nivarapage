<?php

namespace App\Jobs;

use App\Models\LivechatConversation;
use App\Notifications\LivechatConversationOpened;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class NotifyLivechatAgents implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $conversationId)
    {
        $this->onQueue('notifications');
    }

    public function handle(): void
    {
        $conversation = LivechatConversation::query()
            ->with(['site', 'workspace.members'])
            ->find($this->conversationId);
        if (! $conversation?->workspace) {
            return;
        }

        foreach ($conversation->workspace->members as $member) {
            if (! $member->hasVerifiedEmail()) {
                continue;
            }
            $member->notify(new LivechatConversationOpened($conversation));
        }
    }
}
