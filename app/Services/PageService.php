<?php

namespace App\Services;

use App\Models\Page;
use App\Models\PageRevision;
use App\Models\Site;
use App\Models\Template;
use App\Models\User;
use App\Support\PageSchemaValidator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PageService
{
    public function __construct(
        private readonly PageSchemaValidator $validator,
        private readonly PlanLimitService $limits,
        private readonly AuditService $audit,
        private readonly SeoService $seo,
        private readonly FormService $forms,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(Site $site, User $user, array $data): Page
    {
        $this->limits->assertPagesPerSite($site->workspace, $site);

        return DB::transaction(function () use ($site, $user, $data) {
            if (! empty($data['is_homepage'])) {
                Page::query()->where('site_id', $site->id)->update(['is_homepage' => false]);
            }

            $page = Page::query()->create([
                'site_id' => $site->id,
                'name' => $data['name'],
                'slug' => $data['slug'] ?? Str::slug($data['name']),
                'type' => $data['type'] ?? 'page',
                'status' => 'draft',
                'is_homepage' => (bool) ($data['is_homepage'] ?? false),
                'seo_title' => $data['seo_title'] ?? null,
                'seo_description' => $data['seo_description'] ?? null,
                'seo_image' => $data['seo_image'] ?? null,
                'canonical_url' => $data['canonical_url'] ?? null,
                'og_title' => $data['og_title'] ?? null,
                'og_description' => $data['og_description'] ?? null,
                'og_image' => $data['og_image'] ?? null,
                'robots_index' => $data['robots_index'] ?? true,
            ]);

            $content = $this->forms->bindContent($site, $this->validator->validate($data['content'] ?? self::emptyContent()));
            $revision = $this->createRevision($page, $user, $content, 'created');
            $page->update(['draft_revision_id' => $revision->id]);
            $this->pruneRevisions($page);

            $this->audit->log('page.created', $page, ['site_id' => $site->id], $site->workspace, $user);

            return $page->fresh(['draftRevision']);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Page $page, array $data): Page
    {
        if (! empty($data['is_homepage'])) {
            Page::query()->where('site_id', $page->site_id)->where('id', '!=', $page->id)->update(['is_homepage' => false]);
        }

        $data = $this->seo->sanitizePageSeo($data);
        $page->fill(collect($data)->except('content')->all());
        $page->save();

        return $page->fresh();
    }

    /**
     * @param  array<string, mixed>  $content
     */
    public function saveDraft(Page $page, User $user, array $content): PageRevision
    {
        $page->loadMissing('site.forms');
        $validated = $this->forms->bindContent($page->site, $this->validator->validate($content));

        $draft = $page->draftRevision;
        if ($draft && $page->published_revision_id !== $draft->id && $this->withinCheckpoint($draft)) {
            // Still inside the current checkpoint window, so fold this save into
            // the open revision. Without this the editor's autosave would write
            // a row per keystroke.
            $draft->update([
                'content_json' => $validated,
                'user_id' => $user->id,
                'reason' => 'draft',
            ]);

            return $draft->fresh();
        }

        $revision = $this->createRevision($page, $user, $validated, 'draft');
        $page->update(['draft_revision_id' => $revision->id, 'status' => 'draft']);
        $this->pruneRevisions($page);

        return $revision;
    }

    public function cloneFromTemplate(Site $site, Template $template, User $user): void
    {
        $template->load('pages');
        $site->loadMissing('forms');
        $existing = $site->pages()->get()->keyBy('slug');

        foreach ($template->pages as $templatePage) {
            $content = is_array($templatePage->content_json) ? $templatePage->content_json : self::emptyContent();
            $page = $existing->get($templatePage->slug);

            if ($page instanceof Page) {
                $this->saveDraft($page, $user, $content);
                $updates = ['name' => $templatePage->name];
                if ($templatePage->is_homepage) {
                    Page::query()->where('site_id', $site->id)->where('id', '!=', $page->id)->update(['is_homepage' => false]);
                    $updates['is_homepage'] = true;
                }
                $page->update($updates);

                continue;
            }

            $created = $this->create($site, $user, [
                'name' => $templatePage->name,
                'slug' => $templatePage->slug,
                'is_homepage' => $templatePage->is_homepage,
                'content' => $content,
            ]);
            $existing->put($created->slug, $created);
        }
    }

    public function delete(Page $page): void
    {
        $this->audit->log('page.deleted', $page, ['site_id' => $page->site_id]);
        $page->delete();
    }

    /**
     * @param  array<string, mixed>  $content
     */
    /**
     * Whether a draft revision is still the "current" one to write into.
     *
     * Draft saves coalesce for a while so autosave does not create a row per
     * keystroke, but once the window passes the next save opens a new revision.
     * That is what turns the table into a history someone can actually revert
     * through, rather than a single row that is overwritten forever.
     */
    private function withinCheckpoint(PageRevision $draft): bool
    {
        $minutes = (int) config('uidesired.revisions.checkpoint_minutes', 10);
        if ($minutes <= 0) {
            return true;
        }

        $stamp = $draft->updated_at ?? $draft->created_at;

        return $stamp !== null && $stamp->gt(now()->subMinutes($minutes));
    }

    public function createRevision(Page $page, ?User $user, array $content, ?string $reason = null): PageRevision
    {
        $version = (int) $page->revisions()->max('version_number') + 1;

        return PageRevision::query()->create([
            'page_id' => $page->id,
            'user_id' => $user?->id,
            'version_number' => $version,
            'content_json' => $content,
            'reason' => $reason,
        ]);
    }

    public function pruneRevisions(Page $page): void
    {
        $page->loadMissing('site.workspace');
        $workspace = $page->site?->workspace;
        if (! $workspace) {
            return;
        }

        $limit = $this->limits->revisionLimit($workspace);
        if ($limit === null || $limit < 0) {
            return;
        }

        $keep = max($limit, 1);
        $protected = array_filter([$page->published_revision_id, $page->draft_revision_id]);
        $keepIds = $page->revisions()
            ->orderByDesc('version_number')
            ->limit($keep)
            ->pluck('id')
            ->merge($protected)
            ->unique()
            ->all();

        if ($keepIds === []) {
            return;
        }

        $page->revisions()->whereNotIn('id', $keepIds)->delete();
    }

    /**
     * @return array{schemaVersion: int, sections: array<int, mixed>}
     */
    public static function emptyContent(): array
    {
        return [
            'schemaVersion' => 1,
            'sections' => [],
        ];
    }
}
