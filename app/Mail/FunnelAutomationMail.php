<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * The message a funnel automation sends.
 *
 * Plain text on purpose. The body is written by whoever set the rule up, and
 * rendering it as HTML would mean either trusting their markup or stripping it
 * badly; as text it arrives exactly as they typed it.
 */
class FunnelAutomationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $subjectLine,
        public readonly string $body,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->subjectLine);
    }

    public function content(): Content
    {
        return new Content(text: 'mail.funnel-automation', with: ['body' => $this->body]);
    }
}
