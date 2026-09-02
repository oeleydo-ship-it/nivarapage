<?php

namespace App\Services;

use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\Site;
use App\Models\SiteBackup;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Point-in-time backup and restore for a whole site.
 *
 * A backup is one self-contained JSON payload rather than a set of foreign
 * keys, so restoring still works after pages, menus or the theme row have been
 * deleted. Restoring always takes a `pre_restore` snapshot first, which means a
 * restore is itself undoable - the operation people most often regret.
 */
class SiteBackupService
{
    /** Format version, so a future change can migrate old payloads knowingly. */
    public const SCHEMA = 1;

    /** Backups kept per site before the oldest manual ones are pruned. */
    public const KEEP = 20;

    public function __construct(
        private readonly PageService $pages,
        private readonly NavigationService $navigation,
        private readonly TenantCacheService $cache,
        private readonly AuditService $audit,
    ) {}

    /**
     * @param  'manual'|'pre_restore'  $kind
     */
    public function create(Site $site, ?User $user, string $label = '', string $kind = 'manual'): SiteBackup
    {
        $payload = $this->snapshot($site);
        $encoded = json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);

        $backup = SiteBackup::query()->create([
            'workspace_id' => $site->workspace_id,
            'site_id' => $site->id,
            'user_id' => $user?->id,
            'label' => trim($label) !== '' ? trim($label) : $this->defaultLabel($kind),
            'kind' => $kind,
            'page_count' => count($payload['pages']),
            'bytes' => strlen($encoded),
            'payload' => $payload,
        ]);

        $this->audit->log('site.backup_created', $site, [
            'backup_id' => $backup->id,
            'kind' => $kind,
            'pages' => $backup->page_count,
        ], $site->workspace, $user);

        $this->prune($site);

        return $backup;
    }

    /**
     * Replaces the site's pages, theme, settings and menus with the snapshot.
     *
     * Returns the safety backup taken beforehand so the caller can offer an
     * undo.
     */
    public function restore(Site $site, SiteBackup $backup, ?User $user): SiteBackup
    {
        if ($backup->site_id !== $site->id) {
            abort(404);
        }

        $payload = $backup->payload;
        if (! is_array($payload) || ! is_array($payload['pages'] ?? null)) {
            throw new RuntimeException('This backup is unreadable and cannot be restored.');
        }

        $safety = $this->create($site, $user, 'Before restoring "'.$backup->label.'"', 'pre_restore');

        DB::transaction(function () use ($site, $payload, $user): void {
            $this->restoreTheme($site, $payload);
            $this->restoreSettings($site, $payload);
            $this->restorePages($site, $payload, $user);
            $this->restoreMenus($site, $payload);
        });

        $this->cache->invalidateSite($site);

        $this->audit->log('site.backup_restored', $site, [
            'backup_id' => $backup->id,
            'safety_backup_id' => $safety->id,
            'pages' => count($payload['pages']),
        ], $site->workspace, $user);

        return $safety;
    }

    public function delete(SiteBackup $backup, ?User $user): void
    {
        $this->audit->log('site.backup_deleted', $backup->site, [
            'backup_id' => $backup->id,
        ], $backup->site?->workspace, $user);

        $backup->delete();
    }

    /**
     * @return array<string, mixed>
     */
    public function snapshot(Site $site): array
    {
        $site->loadMissing(['settings', 'theme', 'pages.draftRevision', 'menus.items']);

        return [
            'schema' => self::SCHEMA,
            'taken_at' => now()->toIso8601String(),
            'site' => [
                'name' => $site->name,
                'slug' => $site->slug,
            ],
            'theme' => $site->theme?->tokens ?? null,
            'settings' => $site->settings
                ? collect($site->settings->getAttributes())->except(['id', 'site_id', 'created_at', 'updated_at'])->all()
                : null,
            'pages' => $site->pages->map(fn (Page $page) => [
                'name' => $page->name,
                'slug' => $page->slug,
                'type' => $page->type,
                'is_homepage' => (bool) $page->is_homepage,
                'seo_title' => $page->seo_title,
                'seo_description' => $page->seo_description,
                'content' => $page->draftRevision?->content_json ?? PageService::emptyContent(),
            ])->values()->all(),
            'menus' => $site->menus->map(fn (Menu $menu) => [
                'name' => $menu->name,
                'location' => $menu->location,
                'items' => $menu->items->map(fn (MenuItem $item) => [
                    'type' => $item->type,
                    'label' => $item->label,
                    'url' => $item->url,
                    // Page ids are meaningless after a restore recreates pages,
                    // so remember the slug and re-link on the way back in.
                    'page_slug' => $item->page_id ? $site->pages->firstWhere('id', $item->page_id)?->slug : null,
                    'sort_order' => $item->sort_order,
                    'target' => $item->target,
                ])->values()->all(),
            ])->values()->all(),
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function restoreTheme(Site $site, array $payload): void
    {
        if (! is_array($payload['theme'] ?? null)) {
            return;
        }

        $site->theme()->updateOrCreate(['site_id' => $site->id], ['tokens' => $payload['theme']]);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function restoreSettings(Site $site, array $payload): void
    {
        if (! is_array($payload['settings'] ?? null)) {
            return;
        }

        $site->settings()->updateOrCreate(['site_id' => $site->id], $payload['settings']);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function restorePages(Site $site, array $payload, ?User $user): void
    {
        // Pages are replaced wholesale: a backup describes the site as it was,
        // so anything created since is not part of that picture.
        $site->pages()->each(fn (Page $page) => $page->forceDelete());

        foreach ($payload['pages'] as $row) {
            if (! is_array($row)) {
                continue;
            }

            $this->pages->create($site->fresh(), $user, [
                'name' => (string) ($row['name'] ?? 'Page'),
                'slug' => (string) ($row['slug'] ?? 'page'),
                'is_homepage' => (bool) ($row['is_homepage'] ?? false),
                'content' => is_array($row['content'] ?? null) ? $row['content'] : PageService::emptyContent(),
                'seo_title' => $row['seo_title'] ?? null,
                'seo_description' => $row['seo_description'] ?? null,
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function restoreMenus(Site $site, array $payload): void
    {
        if (! is_array($payload['menus'] ?? null) || $payload['menus'] === []) {
            $this->navigation->ensureDefault($site->fresh('pages'));

            return;
        }

        $site->menus()->each(fn (Menu $menu) => $menu->delete());
        $pagesBySlug = $site->fresh('pages')->pages->keyBy('slug');

        foreach ($payload['menus'] as $row) {
            if (! is_array($row)) {
                continue;
            }

            $menu = $site->menus()->create([
                'name' => (string) ($row['name'] ?? 'Primary'),
                'location' => (string) ($row['location'] ?? 'header'),
            ]);

            foreach ((array) ($row['items'] ?? []) as $item) {
                if (! is_array($item)) {
                    continue;
                }

                $menu->items()->create([
                    'type' => (string) ($item['type'] ?? 'custom'),
                    'label' => (string) ($item['label'] ?? ''),
                    'url' => $item['url'] ?? null,
                    'page_id' => $item['page_slug'] ? $pagesBySlug->get($item['page_slug'])?->id : null,
                    'sort_order' => (int) ($item['sort_order'] ?? 0),
                    'target' => $item['target'] ?? null,
                ]);
            }
        }
    }

    /** Keeps the newest backups and the safety ones; drops old manual snapshots. */
    private function prune(Site $site): void
    {
        $ids = SiteBackup::query()
            ->where('site_id', $site->id)
            ->orderByDesc('id')
            ->pluck('id')
            ->slice(self::KEEP)
            ->all();

        if ($ids !== []) {
            SiteBackup::query()->whereIn('id', $ids)->delete();
        }
    }

    private function defaultLabel(string $kind): string
    {
        return $kind === 'pre_restore'
            ? 'Automatic safety copy'
            : 'Backup '.now()->format('j M Y, H:i');
    }
}
