<?php

use App\Models\Page;
use App\Models\Site;
use App\Models\SiteBackup;
use App\Models\Workspace;

/**
 * @return array{headers: array<string, string>, site: int}
 */
function backupFixture(): array
{
    ['user' => $user, 'workspace' => $workspace] = tenant();
    $headers = authHeaders($user, $workspace);

    $siteId = test()->withHeaders($headers)
        ->postJson('/api/v1/sites', ['name' => 'Backup Site', 'subdomain' => 'backupsite'])
        ->assertCreated()
        ->json('data.id');

    return ['headers' => $headers, 'site' => (int) $siteId];
}

/** Raises the site allowance so a test can create more than the plan default. */
function allowSites(int $count): void
{
    $workspace = Workspace::query()->latest('id')->firstOrFail();
    $plan = $workspace->subscription->plan;
    $plan->update(['limits' => array_merge($plan->limits, ['number_of_sites' => $count])]);
}

function addPage(array $fx, string $name, string $slug, string $heading): int
{
    return (int) test()->withHeaders($fx['headers'])
        ->postJson('/api/v1/sites/'.$fx['site'].'/pages', [
            'name' => $name,
            'slug' => $slug,
            'content' => [
                'schemaVersion' => 1,
                'sections' => [
                    ['id' => 'a', 'type' => 'hero.centered', 'version' => 1, 'props' => ['heading' => $heading]],
                ],
            ],
        ])
        ->assertCreated()
        ->json('data.id');
}

function pageSlugs(array $fx): array
{
    return collect(test()->withHeaders($fx['headers'])->getJson('/api/v1/sites/'.$fx['site'].'/pages')->json('data'))
        ->pluck('slug')->sort()->values()->all();
}

describe('site backups', function () {
    it('starts with no backups', function () {
        $fx = backupFixture();

        test()->withHeaders($fx['headers'])
            ->getJson('/api/v1/sites/'.$fx['site'].'/backups')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    });

    it('captures the site and counts its pages', function () {
        $fx = backupFixture();
        addPage($fx, 'Pricing', 'pricing', 'Plans');

        $backup = test()->withHeaders($fx['headers'])
            ->postJson('/api/v1/sites/'.$fx['site'].'/backups', ['label' => 'Before redesign'])
            ->assertCreated()
            ->json('data');

        expect($backup['label'])->toBe('Before redesign');
        expect($backup['kind'])->toBe('manual');
        expect($backup['page_count'])->toBeGreaterThan(1);
        expect($backup['bytes'])->toBeGreaterThan(0);
    });

    it('never ships the payload in a listing', function () {
        $fx = backupFixture();
        test()->withHeaders($fx['headers'])->postJson('/api/v1/sites/'.$fx['site'].'/backups')->assertCreated();

        $body = test()->withHeaders($fx['headers'])
            ->getJson('/api/v1/sites/'.$fx['site'].'/backups')
            ->assertOk()
            ->json('data');

        expect($body[0])->not->toHaveKey('payload');
    });

    it('brings back a page that was deleted after the backup', function () {
        $fx = backupFixture();
        $pageId = addPage($fx, 'Pricing', 'pricing', 'Plans');

        $backup = test()->withHeaders($fx['headers'])
            ->postJson('/api/v1/sites/'.$fx['site'].'/backups')
            ->assertCreated()
            ->json('data');

        test()->withHeaders($fx['headers'])->deleteJson('/api/v1/pages/'.$pageId)->assertOk();
        expect(pageSlugs($fx))->not->toContain('pricing');

        test()->withHeaders($fx['headers'])
            ->postJson('/api/v1/sites/'.$fx['site'].'/backups/'.$backup['id'].'/restore')
            ->assertOk();

        expect(pageSlugs($fx))->toContain('pricing');
    });

    it('restores the page content, not just the page row', function () {
        $fx = backupFixture();
        addPage($fx, 'About', 'about', 'Original heading');

        $backup = test()->withHeaders($fx['headers'])
            ->postJson('/api/v1/sites/'.$fx['site'].'/backups')
            ->assertCreated()
            ->json('data');

        // Rewrite the page after the snapshot.
        $page = Page::query()->where('site_id', $fx['site'])->where('slug', 'about')->firstOrFail();
        test()->withHeaders($fx['headers'])
            ->putJson('/api/v1/pages/'.$page->id.'/draft', [
                'content' => [
                    'schemaVersion' => 1,
                    'sections' => [
                        ['id' => 'a', 'type' => 'hero.centered', 'version' => 1, 'props' => ['heading' => 'Replaced heading']],
                    ],
                ],
            ])
            ->assertOk();

        test()->withHeaders($fx['headers'])
            ->postJson('/api/v1/sites/'.$fx['site'].'/backups/'.$backup['id'].'/restore')
            ->assertOk();

        $restored = Page::query()->where('site_id', $fx['site'])->where('slug', 'about')->firstOrFail();
        $json = json_encode($restored->draftRevision->content_json);
        expect($json)->toContain('Original heading');
        expect($json)->not->toContain('Replaced heading');
    });

    it('restores the theme', function () {
        $fx = backupFixture();
        test()->withHeaders($fx['headers'])
            ->putJson('/api/v1/sites/'.$fx['site'].'/theme', ['tokens' => ['primary' => '#112233']])
            ->assertOk();

        $backup = test()->withHeaders($fx['headers'])
            ->postJson('/api/v1/sites/'.$fx['site'].'/backups')
            ->assertCreated()
            ->json('data');

        test()->withHeaders($fx['headers'])
            ->putJson('/api/v1/sites/'.$fx['site'].'/theme', ['tokens' => ['primary' => '#ff0000']])
            ->assertOk();

        test()->withHeaders($fx['headers'])
            ->postJson('/api/v1/sites/'.$fx['site'].'/backups/'.$backup['id'].'/restore')
            ->assertOk();

        test()->withHeaders($fx['headers'])
            ->getJson('/api/v1/sites/'.$fx['site'].'/theme')
            ->assertOk()
            ->assertJsonPath('data.tokens.primary', '#112233');
    });

    it('takes a safety copy so a restore can be undone', function () {
        $fx = backupFixture();
        addPage($fx, 'Only in the newer version', 'newer', 'Newer');

        // A snapshot from before that page existed.
        $older = SiteBackup::query()->create([
            'workspace_id' => Site::query()->find($fx['site'])->workspace_id,
            'site_id' => $fx['site'],
            'label' => 'Older',
            'kind' => 'manual',
            'page_count' => 0,
            'bytes' => 2,
            'payload' => ['schema' => 1, 'pages' => [], 'menus' => []],
        ]);

        $result = test()->withHeaders($fx['headers'])
            ->postJson('/api/v1/sites/'.$fx['site'].'/backups/'.$older->id.'/restore')
            ->assertOk()
            ->json('data');

        expect(pageSlugs($fx))->not->toContain('newer');
        expect($result['undo_backup']['kind'])->toBe('pre_restore');

        // Undo by restoring the safety copy.
        test()->withHeaders($fx['headers'])
            ->postJson('/api/v1/sites/'.$fx['site'].'/backups/'.$result['undo_backup']['id'].'/restore')
            ->assertOk();

        expect(pageSlugs($fx))->toContain('newer');
    });

    it('rejects a backup that belongs to another site', function () {
        $a = backupFixture();
        allowSites(4);
        $bId = test()->withHeaders($a['headers'])
            ->postJson('/api/v1/sites', ['name' => 'Other', 'subdomain' => 'othersite'])
            ->assertCreated()
            ->json('data.id');

        $backup = test()->withHeaders($a['headers'])
            ->postJson('/api/v1/sites/'.$a['site'].'/backups')
            ->assertCreated()
            ->json('data');

        test()->withHeaders($a['headers'])
            ->postJson('/api/v1/sites/'.$bId.'/backups/'.$backup['id'].'/restore')
            ->assertNotFound();
    });

    it('refuses a corrupt payload rather than wiping the site', function () {
        $fx = backupFixture();
        $broken = SiteBackup::query()->create([
            'workspace_id' => Site::query()->find($fx['site'])->workspace_id,
            'site_id' => $fx['site'],
            'label' => 'Corrupt',
            'kind' => 'manual',
            'page_count' => 0,
            'bytes' => 2,
            'payload' => ['schema' => 1],
        ]);

        test()->withHeaders($fx['headers'])
            ->postJson('/api/v1/sites/'.$fx['site'].'/backups/'.$broken->id.'/restore')
            ->assertStatus(422);

        expect(pageSlugs($fx))->not->toBeEmpty();
    });

    it('deletes a backup', function () {
        $fx = backupFixture();
        $backup = test()->withHeaders($fx['headers'])
            ->postJson('/api/v1/sites/'.$fx['site'].'/backups')
            ->assertCreated()
            ->json('data');

        test()->withHeaders($fx['headers'])
            ->deleteJson('/api/v1/sites/'.$fx['site'].'/backups/'.$backup['id'])
            ->assertOk();

        test()->withHeaders($fx['headers'])
            ->getJson('/api/v1/sites/'.$fx['site'].'/backups')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    });

    it('is closed to another workspace', function () {
        $fx = backupFixture();
        $backup = test()->withHeaders($fx['headers'])
            ->postJson('/api/v1/sites/'.$fx['site'].'/backups')
            ->assertCreated()
            ->json('data');

        ['user' => $other, 'workspace' => $otherWorkspace] = tenant();
        $otherHeaders = authHeaders($other, $otherWorkspace);

        test()->withHeaders($otherHeaders)->getJson('/api/v1/sites/'.$fx['site'].'/backups')->assertNotFound();
        test()->withHeaders($otherHeaders)
            ->postJson('/api/v1/sites/'.$fx['site'].'/backups/'.$backup['id'].'/restore')
            ->assertNotFound();
    });
});

describe('page revision history', function () {
    it('lists revisions newest first without their content', function () {
        $fx = backupFixture();
        $pageId = addPage($fx, 'Story', 'story', 'First');

        // Saves inside the checkpoint window fold together on purpose; move past
        // it so this save opens a new revision.
        test()->travel(20)->minutes();
        test()->withHeaders($fx['headers'])
            ->putJson('/api/v1/pages/'.$pageId.'/draft', [
                'content' => ['schemaVersion' => 1, 'sections' => [
                    ['id' => 'a', 'type' => 'hero.centered', 'version' => 1, 'props' => ['heading' => 'Second']],
                ]],
            ])
            ->assertSuccessful();

        $rows = test()->withHeaders($fx['headers'])
            ->getJson('/api/v1/pages/'.$pageId.'/revisions')
            ->assertOk()
            ->json('data');

        expect(count($rows))->toBeGreaterThan(1);
        expect($rows[0]['version_number'])->toBeGreaterThan($rows[1]['version_number']);
        expect($rows[0])->not->toHaveKey('content');
        expect($rows[0])->toHaveKey('section_count');
    });

    it('returns one revision with its content for previewing', function () {
        $fx = backupFixture();
        $pageId = addPage($fx, 'Story', 'story2', 'Preview me');

        $rows = test()->withHeaders($fx['headers'])
            ->getJson('/api/v1/pages/'.$pageId.'/revisions')
            ->assertOk()
            ->json('data');

        $one = test()->withHeaders($fx['headers'])
            ->getJson('/api/v1/pages/'.$pageId.'/revisions/'.$rows[0]['id'])
            ->assertOk()
            ->json('data');

        expect($one)->toHaveKey('content');
        expect(json_encode($one['content']))->toContain('Preview me');
    });

    it('will not read a revision through the wrong page', function () {
        $fx = backupFixture();
        $a = addPage($fx, 'A', 'page-a', 'A');
        $b = addPage($fx, 'B', 'page-b', 'B');

        $rows = test()->withHeaders($fx['headers'])->getJson('/api/v1/pages/'.$a.'/revisions')->json('data');

        test()->withHeaders($fx['headers'])
            ->getJson('/api/v1/pages/'.$b.'/revisions/'.$rows[0]['id'])
            ->assertNotFound();
    });

    it('restores an older revision as a new one', function () {
        $fx = backupFixture();
        $pageId = addPage($fx, 'Story', 'story3', 'Original');

        $original = test()->withHeaders($fx['headers'])->getJson('/api/v1/pages/'.$pageId.'/revisions')->json('data.0');

        test()->travel(20)->minutes();
        test()->withHeaders($fx['headers'])
            ->putJson('/api/v1/pages/'.$pageId.'/draft', [
                'content' => ['schemaVersion' => 1, 'sections' => [
                    ['id' => 'a', 'type' => 'hero.centered', 'version' => 1, 'props' => ['heading' => 'Changed']],
                ]],
            ])
            ->assertSuccessful();

        test()->withHeaders($fx['headers'])
            ->postJson('/api/v1/pages/'.$pageId.'/revisions/'.$original['id'].'/restore')
            ->assertOk();

        $page = Page::query()->findOrFail($pageId);
        expect(json_encode($page->draftRevision->content_json))->toContain('Original');
    });
    it('folds rapid autosaves into one revision', function () {
        $fx = backupFixture();
        $pageId = addPage($fx, 'Draft', 'draft-fold', 'One');
        $before = count(test()->withHeaders($fx['headers'])->getJson('/api/v1/pages/'.$pageId.'/revisions')->json('data'));

        foreach (['Two', 'Three', 'Four'] as $heading) {
            test()->withHeaders($fx['headers'])
                ->putJson('/api/v1/pages/'.$pageId.'/draft', [
                    'content' => ['schemaVersion' => 1, 'sections' => [
                        ['id' => 'a', 'type' => 'hero.centered', 'version' => 1, 'props' => ['heading' => $heading]],
                    ]],
                ])
                ->assertSuccessful();
        }

        $after = count(test()->withHeaders($fx['headers'])->getJson('/api/v1/pages/'.$pageId.'/revisions')->json('data'));
        expect($after)->toBe($before);
    });

    it('opens a new revision once the checkpoint window passes', function () {
        $fx = backupFixture();
        $pageId = addPage($fx, 'Draft', 'draft-window', 'One');
        $before = count(test()->withHeaders($fx['headers'])->getJson('/api/v1/pages/'.$pageId.'/revisions')->json('data'));

        test()->travel(20)->minutes();
        test()->withHeaders($fx['headers'])
            ->putJson('/api/v1/pages/'.$pageId.'/draft', [
                'content' => ['schemaVersion' => 1, 'sections' => [
                    ['id' => 'a', 'type' => 'hero.centered', 'version' => 1, 'props' => ['heading' => 'Later']],
                ]],
            ])
            ->assertSuccessful();

        $after = count(test()->withHeaders($fx['headers'])->getJson('/api/v1/pages/'.$pageId.'/revisions')->json('data'));
        expect($after)->toBe($before + 1);
    });
});
