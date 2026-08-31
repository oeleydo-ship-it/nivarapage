<?php

namespace App\Services;

use App\Events\SitePublished;
use App\Jobs\RecordPublish;
use App\Models\Page;
use App\Models\Site;
use App\Models\User;
use App\Support\PageSchemaValidator;
use Illuminate\Support\Facades\DB;

class PublishService
{
    public function __construct(
        private readonly PageSchemaValidator $validator,
        private readonly PageService $pages,
        private readonly TenantCacheService $cache,
        private readonly AuditService $audit,
    ) {}

    public function publishPage(Page $page, User $user): Page
    {
        if (! $user->hasVerifiedEmail()) {
            abort(403, 'Email verification is required to publish.');
        }

        $publishedPage = DB::transaction(fn () => $this->publishPageContent($page, $user));
        $site = $publishedPage->site;

        $this->afterPagePublished($publishedPage, $site, $user);
        SitePublished::dispatch($site->fresh());

        return $publishedPage->fresh(['publishedRevision', 'draftRevision']);
    }

    public function publishSite(Site $site, User $user): Site
    {
        if (! $user->hasVerifiedEmail()) {
            abort(403, 'Email verification is required to publish.');
        }

        // Publish the complete site in one transaction. This prevents a queue
        // worker using the SQLite database from interleaving with the loop and
        // leaving a multi-page template only partially published.
        $publishedPages = DB::transaction(function () use ($site, $user) {
            $published = collect();
            $pages = $site->pages()->with('draftRevision')->get();

            foreach ($pages as $page) {
                if ($page->draft_revision_id && $page->draft_revision_id !== $page->published_revision_id) {
                    $published->push($this->publishPageContent($page, $user));
                }
            }

            $site->update(['status' => 'published']);

            return $published;
        });

        $freshSite = $site->fresh(['domains', 'pages.publishedRevision', 'workspace']);
        $this->cache->invalidateSite($freshSite);

        foreach ($publishedPages as $page) {
            RecordPublish::dispatch($page->id, $user->id)->onQueue('publishing');
            $this->audit->log(
                'page.published',
                $page,
                ['revision_id' => $page->published_revision_id],
                $freshSite->workspace,
                $user,
            );
        }

        SitePublished::dispatch($freshSite);

        return $freshSite->fresh(['pages']);
    }

    private function publishPageContent(Page $page, User $user): Page
    {
        $draft = $page->draftRevision;
        abort_unless($draft, 422, 'No draft content to publish.');

        $content = $this->validator->validate($draft->content_json);
        $published = $this->pages->createRevision($page, $user, $content, 'published');
        $newDraft = $this->pages->createRevision($page, $user, $content, 'draft');

        $page->update([
            'published_revision_id' => $published->id,
            'draft_revision_id' => $newDraft->id,
            'status' => 'published',
        ]);

        $site = $page->site;
        if ($site->status === 'draft') {
            $site->update(['status' => 'published']);
        }

        return $page->fresh(['site.workspace', 'publishedRevision', 'draftRevision']);
    }

    private function afterPagePublished(Page $page, Site $site, User $user): void
    {
        $freshSite = $site->fresh(['domains', 'pages.publishedRevision']);
        $this->cache->invalidateSite($freshSite);
        RecordPublish::dispatch($page->id, $user->id)->onQueue('publishing');
        $this->audit->log(
            'page.published',
            $page,
            ['revision_id' => $page->published_revision_id],
            $site->workspace,
            $user,
        );
    }
}
