<?php

namespace App\Jobs;

use App\Models\Page;
use App\Services\AuditService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class RecordPublish implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $pageId, public int $userId)
    {
        $this->onQueue('publishing');
    }

    public function handle(AuditService $audit): void
    {
        $page = Page::query()->find($this->pageId);
        if (! $page) {
            return;
        }

        $audit->log('publish.recorded', $page, ['user_id' => $this->userId], $page->site->workspace);
    }
}
