<?php

declare(strict_types=1);

$database = realpath(__DIR__.'/../database/database.sqlite');
if ($database === false) {
    throw new RuntimeException('SQLite database was not found.');
}

$pdo = new PDO('sqlite:'.$database, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$now = date('Y-m-d H:i:s');

$template = $pdo->query("SELECT id, theme_tokens FROM templates WHERE slug = 'cinder-row' LIMIT 1")->fetch(PDO::FETCH_ASSOC);
if (! $template) {
    throw new RuntimeException('Seed the cinder-row template first.');
}

$user = $pdo->query('SELECT id, current_workspace_id FROM users ORDER BY id LIMIT 1')->fetch(PDO::FETCH_ASSOC);
if (! $user || ! $user['current_workspace_id']) {
    throw new RuntimeException('A user with a current workspace is required.');
}

$workspaceId = (int) $user['current_workspace_id'];
$userId = (int) $user['id'];
$requestedSiteId = isset($argv[1]) && ctype_digit($argv[1]) ? (int) $argv[1] : null;
$pdo->beginTransaction();

try {
    $siteQuery = $requestedSiteId
        ? $pdo->prepare('SELECT id FROM sites WHERE workspace_id = :workspace AND id = :id AND deleted_at IS NULL LIMIT 1')
        : $pdo->prepare("SELECT id FROM sites WHERE workspace_id = :workspace AND slug = 'cinder-row' AND deleted_at IS NULL ORDER BY id DESC LIMIT 1");
    $siteQuery->execute($requestedSiteId ? ['workspace' => $workspaceId, 'id' => $requestedSiteId] : ['workspace' => $workspaceId]);
    $siteId = $siteQuery->fetchColumn();

    if ($siteId === false) {
        $insertSite = $pdo->prepare("INSERT INTO sites (workspace_id, name, business_name, slug, category, description, status, created_by, created_at, updated_at) VALUES (:workspace, 'Cinder & Row', 'Cinder & Row', 'cinder-row', 'business', :description, 'draft', :user, :created, :updated)");
        $insertSite->execute([
            'workspace' => $workspaceId,
            'description' => 'Independent North London heating engineers with clear pricing and careful local service.',
            'user' => $userId,
            'created' => $now,
            'updated' => $now,
        ]);
        $siteId = (int) $pdo->lastInsertId();
    } else {
        $siteId = (int) $siteId;
        $pdo->prepare("UPDATE sites SET name = 'Cinder & Row', business_name = 'Cinder & Row', description = :description, updated_at = :updated WHERE id = :id")
            ->execute(['description' => 'Independent North London heating engineers with clear pricing and careful local service.', 'updated' => $now, 'id' => $siteId]);
    }

    $pdo->prepare('INSERT INTO site_settings (site_id, default_description, robots, locale, timezone, redirect_secondary_to_primary, created_at, updated_at) VALUES (:site, :description, :robots, :locale, :timezone, 1, :created, :updated) ON CONFLICT(site_id) DO UPDATE SET default_description = excluded.default_description, updated_at = excluded.updated_at')
        ->execute(['site' => $siteId, 'description' => 'Independent North London heating engineers with clear pricing and careful local service.', 'robots' => 'index', 'locale' => 'en', 'timezone' => 'Europe/London', 'created' => $now, 'updated' => $now]);

    $pdo->prepare('INSERT INTO site_theme_settings (site_id, tokens, created_at, updated_at) VALUES (:site, :tokens, :created, :updated) ON CONFLICT(site_id) DO UPDATE SET tokens = excluded.tokens, updated_at = excluded.updated_at')
        ->execute(['site' => $siteId, 'tokens' => $template['theme_tokens'], 'created' => $now, 'updated' => $now]);

    $domain = $pdo->prepare("SELECT id FROM domains WHERE hostname = 'cinder-row.sites.localhost' AND deleted_at IS NULL LIMIT 1");
    $domain->execute();
    if ($domain->fetchColumn() === false) {
        $pdo->prepare("INSERT INTO domains (workspace_id, site_id, type, hostname, is_primary, status, provider, verified_at, activated_at, created_at, updated_at) VALUES (:workspace, :site, 'subdomain', 'cinder-row.sites.localhost', 1, 'active', 'platform', :verified, :activated, :created, :updated)")
            ->execute(['workspace' => $workspaceId, 'site' => $siteId, 'verified' => $now, 'activated' => $now, 'created' => $now, 'updated' => $now]);
    }

    $existingPageIds = $pdo->prepare('SELECT id FROM pages WHERE site_id = :site');
    $existingPageIds->execute(['site' => $siteId]);
    $ids = $existingPageIds->fetchAll(PDO::FETCH_COLUMN);
    if ($ids !== []) {
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $pdo->prepare("DELETE FROM page_revisions WHERE page_id IN ($placeholders)")->execute($ids);
    }
    $pdo->prepare('DELETE FROM pages WHERE site_id = :site')->execute(['site' => $siteId]);

    $templatePages = $pdo->prepare('SELECT name, slug, is_homepage, content_json FROM template_pages WHERE template_id = :template ORDER BY id');
    $templatePages->execute(['template' => $template['id']]);
    $pageInsert = $pdo->prepare("INSERT INTO pages (site_id, name, slug, type, status, is_homepage, robots_index, created_at, updated_at) VALUES (:site, :name, :slug, 'page', 'draft', :homepage, 1, :created, :updated)");
    $revisionInsert = $pdo->prepare("INSERT INTO page_revisions (page_id, user_id, version_number, content_json, reason, created_at, updated_at) VALUES (:page, :user, 1, :content, 'created', :created, :updated)");
    $createdPages = [];

    foreach ($templatePages->fetchAll(PDO::FETCH_ASSOC) as $page) {
        $pageInsert->execute(['site' => $siteId, 'name' => $page['name'], 'slug' => $page['slug'], 'homepage' => $page['is_homepage'], 'created' => $now, 'updated' => $now]);
        $pageId = (int) $pdo->lastInsertId();
        $revisionInsert->execute(['page' => $pageId, 'user' => $userId, 'content' => $page['content_json'], 'created' => $now, 'updated' => $now]);
        $revisionId = (int) $pdo->lastInsertId();
        $pdo->prepare('UPDATE pages SET draft_revision_id = :revision WHERE id = :page')->execute(['revision' => $revisionId, 'page' => $pageId]);
        $createdPages[$page['slug']] = $pageId;
    }

    $menuIds = $pdo->prepare('SELECT id FROM menus WHERE site_id = :site');
    $menuIds->execute(['site' => $siteId]);
    $oldMenus = $menuIds->fetchAll(PDO::FETCH_COLUMN);
    if ($oldMenus !== []) {
        $placeholders = implode(',', array_fill(0, count($oldMenus), '?'));
        $pdo->prepare("DELETE FROM menu_items WHERE menu_id IN ($placeholders)")->execute($oldMenus);
    }
    $pdo->prepare('DELETE FROM menus WHERE site_id = :site')->execute(['site' => $siteId]);
    $pdo->prepare("INSERT INTO menus (site_id, name, location, created_at, updated_at) VALUES (:site, 'Main navigation', 'header', :created, :updated)")->execute(['site' => $siteId, 'created' => $now, 'updated' => $now]);
    $menuId = (int) $pdo->lastInsertId();
    $itemInsert = $pdo->prepare("INSERT INTO menu_items (menu_id, type, label, url, page_id, sort_order, target, created_at, updated_at) VALUES (:menu, 'page', :label, :url, :page, :sort, '_self', :created, :updated)");
    $order = 0;
    foreach (['home' => 'Home', 'story' => 'Story', 'services' => 'Services', 'journal' => 'Journal', 'contact' => 'Contact'] as $slug => $label) {
        $itemInsert->execute(['menu' => $menuId, 'label' => $label, 'url' => $slug === 'home' ? '/' : '/'.$slug, 'page' => $createdPages[$slug], 'sort' => $order++, 'created' => $now, 'updated' => $now]);
    }

    $pdo->commit();
    echo "Created Cinder & Row website #{$siteId} with ".count($createdPages)." editable pages.\n";
} catch (Throwable $exception) {
    $pdo->rollBack();
    throw $exception;
}
