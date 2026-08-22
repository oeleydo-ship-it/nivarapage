<?php

namespace App\Jobs;

use App\Models\FormSubmission;
use App\Notifications\FormSubmissionReceived;
use App\Services\FormService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class NotifyFormSubmission implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $submissionId)
    {
        $this->onQueue('notifications');
    }

    public function handle(FormService $forms): void
    {
        $submission = FormSubmission::query()->with(['form.workspace.members', 'form.site', 'page'])->find($this->submissionId);
        if (! $submission?->form) {
            return;
        }

        $recipients = $forms->verifiedRecipients($submission->form);
        foreach ($recipients as $user) {
            $user->notifyNow(new FormSubmissionReceived($submission));
        }

        Log::info('form.submission.received', [
            'id' => $submission->id,
            'form_id' => $submission->form_id,
            'notified' => count($recipients),
        ]);
    }
}
