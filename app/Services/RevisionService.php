<?php

namespace App\Services;

use App\Models\Page;
use App\Models\PageRevision;
use App\Models\User;

class RevisionService
{
    public function __construct(
        private readonly PageService $pages,
        private readonly AuditService $audit,
    ) {}

    public function restore(Page $page, PageRevision $revision, User $user): PageRevision
    {
        if ($revision->page_id !== $page->id) {
            abort(404);
        }

        $content = $revision->content_json;
        $newRevision = $this->pages->createRevision($page, $user, $content, 'restore');
        $page->update([
            'draft_revision_id' => $newRevision->id,
            'status' => 'draft',
        ]);

        $this->audit->log('page.restored', $page, [
            'restored_from_revision_id' => $revision->id,
            'revision_id' => $newRevision->id,
        ], $page->site->workspace, $user);

        $this->pages->pruneRevisions($page);

        return $newRevision;
    }
}
