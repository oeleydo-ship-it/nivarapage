<?php

namespace App\Notifications;

use App\Models\FormSubmission;
use App\Services\BrandingService;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FormSubmissionReceived extends Notification
{
    public function __construct(public FormSubmission $submission)
    {
    }

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->submission->loadMissing(['form.site', 'page']);
        $form = $this->submission->form;
        $site = $form?->site;

        $mail = (new MailMessage)
            ->subject('New '.($form?->name ?: 'form').' submission')
            ->line('A visitor submitted '.($form?->name ?: 'a form').' on '.($site?->name ?: 'your website').'.');

        if ($this->submission->name) {
            $mail->line('Name: '.$this->submission->name);
        }
        if ($this->submission->email) {
            $mail->line('Email: '.$this->submission->email);
        }

        foreach ($this->submission->payload ?? [] as $key => $value) {
            if (in_array($key, ['website', 'honeypot', 'cf-turnstile-response'], true)) {
                continue;
            }
            $mail->line(ucfirst(str_replace('_', ' ', (string) $key)).': '.(is_scalar($value) ? (string) $value : json_encode($value)));
        }

        return $mail->line('Open the Forms inbox in '.app(BrandingService::class)->public()['platform_name'].' to follow up.');
    }
}
