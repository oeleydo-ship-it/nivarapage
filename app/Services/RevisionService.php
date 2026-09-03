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
        private readonly TenantCacheService $cache,
    ) {}

    public function restore(Page $page, PageRevision $revision, User $user): PageRevision
    {
        if ($revision->page_id !== $page->id) {
            abort(404);
        }

        // Put the theme back before writing the new revision, so the snapshot
        // that revision takes is the one being restored rather than the one
        // being replaced. Otherwise restoring twice walks the theme backwards.
        $themeRestored = $this->restoreTheme($page, $revision);

        $content = $revision->content_json;
        $newRevision = $this->pages->createRevision($page, $user, $content, 'restore');
        $page->update([
            'draft_revision_id' => $newRevision->id,
            'status' => 'draft',
        ]);

        $this->audit->log('page.restored', $page, [
            'restored_from_revision_id' => $revision->id,
            'revision_id' => $newRevision->id,
            'theme_restored' => $themeRestored,
        ], $page->site->workspace, $user);

        $this->pages->pruneRevisions($page);

        if ($themeRestored) {
            $this->cache->invalidateSite($page->site->fresh(['domains', 'pages.publishedRevision']));
        }

        return $newRevision;
    }

    /**
     * Puts the site's colours, fonts, spacing and text size back to what they
     * were when the revision was saved.
     *
     * Revisions written before theme snapshots existed carry nothing, and a
     * site may have no theme row at all; both mean "leave the theme alone"
     * rather than "blank it", so a restore from old history still returns the
     * content it promised without stripping a live site's design.
     */
    private function restoreTheme(Page $page, PageRevision $revision): bool
    {
        $tokens = $revision->theme_tokens;
        if (! is_array($tokens) || $tokens === []) {
            return false;
        }

        $page->loadMissing('site.theme');
        $site = $page->site;
        if ($site === null) {
            return false;
        }

        if (($site->theme?->tokens ?? null) === $tokens) {
            return false;
        }

        $site->theme()->updateOrCreate(['site_id' => $site->id], ['tokens' => $tokens]);
        $site->load('theme');

        return true;
    }
}
