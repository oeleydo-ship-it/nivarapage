<?php

namespace App\Console\Commands;

use App\Models\Domain;
use App\Models\Site;
use Illuminate\Console\Command;

/**
 * Frees hostnames left behind by sites deleted before deletion released them.
 *
 * Site deletion now hands a site's hostnames back, but rows stranded before
 * that cannot free themselves: the site they point at is gone, so its Domains
 * page is unreachable and the name stays taken with no way to disconnect it.
 * This is the one-off cleanup for those.
 */
class ReleaseOrphanedDomains extends Command
{
    protected $signature = 'domains:release-orphaned {--force : Release them, instead of only listing what would be released}';

    protected $description = 'Free hostnames still held by sites that have been deleted';

    public function handle(): int
    {
        // A domain whose site is soft deleted, or whose site row is gone entirely.
        $liveSiteIds = Site::query()->select('id');

        $orphans = Domain::query()
            ->whereNotIn('site_id', $liveSiteIds)
            ->get();

        if ($orphans->isEmpty()) {
            $this->info('No orphaned domains. Every live hostname belongs to a live site.');

            return self::SUCCESS;
        }

        $this->table(
            ['id', 'hostname', 'type', 'site_id', 'status'],
            $orphans->map(fn (Domain $domain) => [
                $domain->id,
                $domain->hostname,
                $domain->type,
                $domain->site_id,
                $domain->status,
            ])->all(),
        );

        if (! $this->option('force')) {
            $this->warn($orphans->count().' hostname(s) would be freed. Re-run with --force to release them.');

            return self::SUCCESS;
        }

        // Erased rather than soft deleted: the site these belonged to is gone,
        // so there is nothing left to restore them onto, and a tombstone would
        // still block the unique index until something else cleared it.
        foreach ($orphans as $orphan) {
            $orphan->forceDelete();
        }

        $this->info('Freed '.$orphans->count().' hostname(s).');

        return self::SUCCESS;
    }
}
