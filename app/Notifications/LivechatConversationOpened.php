<?php

namespace App\Notifications;

use App\Models\LivechatConversation;
use App\Services\BrandingService;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LivechatConversationOpened extends Notification
{
    public function __construct(public LivechatConversation $conversation) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->conversation->loadMissing('site');
        $site = $this->conversation->site?->name ?: 'a website';
        $name = $this->conversation->visitor_name ?: 'A visitor';

        return (new MailMessage)
            ->subject('New live chat on '.$site)
            ->line($name.' started a chat on '.$site.'.')
            ->line('Email: '.($this->conversation->visitor_email ?: '—'))
            ->line('Phone: '.($this->conversation->visitor_phone ?: '—'))
            ->line('Browser: '.trim(($this->conversation->browser ?: '').' / '.($this->conversation->os ?: '')))
            ->line('Location: '.trim(collect([
                $this->conversation->city,
                $this->conversation->region,
                $this->conversation->country,
            ])->filter()->implode(', ') ?: '—'))
            ->line('Open Livechat in '.app(BrandingService::class)->public()['platform_name'].' to reply.');
    }
}
