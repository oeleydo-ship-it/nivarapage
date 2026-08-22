<?php

declare(strict_types=1);

require __DIR__.'/../database/seeders/TemplateContent.php';
require __DIR__.'/../database/seeders/TemplateCinderRow.php';

use Database\Seeders\TemplateCinderRow;

$database = realpath(__DIR__.'/../database/database.sqlite');
if ($database === false) {
    throw new RuntimeException('SQLite database was not found.');
}

$pdo = new PDO('sqlite:'.$database, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$now = date('Y-m-d H:i:s');

$pdo->beginTransaction();
try {
    $category = $pdo->prepare('SELECT id FROM template_categories WHERE slug = :slug LIMIT 1');
    $category->execute(['slug' => 'business']);
    $categoryId = $category->fetchColumn();

    if ($categoryId === false) {
        $insertCategory = $pdo->prepare('INSERT INTO template_categories (name, slug, created_at, updated_at) VALUES (:name, :slug, :created, :updated)');
        $insertCategory->execute(['name' => 'Small business', 'slug' => 'business', 'created' => $now, 'updated' => $now]);
        $categoryId = (int) $pdo->lastInsertId();
    }

    $templateQuery = $pdo->prepare('SELECT id FROM templates WHERE slug = :slug LIMIT 1');
    $templateQuery->execute(['slug' => 'cinder-row']);
    $templateId = $templateQuery->fetchColumn();

    $values = [
        'category' => $categoryId,
        'name' => 'Cinder & Row',
        'slug' => 'cinder-row',
        'description' => 'A full-width editorial heating-service template with oversized serif type, orange italic accents, bento services, local coverage, journal, story, pricing, contact form, and five fully editable pages.',
        'premium' => 0,
        'active' => 1,
        'featured' => 1,
        'theme' => json_encode(TemplateCinderRow::theme(), JSON_THROW_ON_ERROR),
        'updated' => $now,
    ];

    if ($templateId === false) {
        $insert = $pdo->prepare('INSERT INTO templates (template_category_id, name, slug, description, is_premium, is_active, is_featured, theme_tokens, created_at, updated_at) VALUES (:category, :name, :slug, :description, :premium, :active, :featured, :theme, :created, :updated)');
        $insert->execute([...$values, 'created' => $now]);
        $templateId = (int) $pdo->lastInsertId();
    } else {
        $update = $pdo->prepare('UPDATE templates SET template_category_id = :category, name = :name, description = :description, is_premium = :premium, is_active = :active, is_featured = :featured, theme_tokens = :theme, updated_at = :updated WHERE slug = :slug');
        $update->execute($values);
        $templateId = (int) $templateId;
    }

    $pdo->prepare('DELETE FROM template_pages WHERE template_id = :id')->execute(['id' => $templateId]);
    $pageInsert = $pdo->prepare('INSERT INTO template_pages (template_id, name, slug, is_homepage, content_json, created_at, updated_at) VALUES (:template, :name, :slug, :homepage, :content, :created, :updated)');
    foreach (TemplateCinderRow::pages() as $page) {
        $pageInsert->execute([
            'template' => $templateId,
            'name' => $page['name'],
            'slug' => $page['slug'],
            'homepage' => $page['is_homepage'] ? 1 : 0,
            'content' => json_encode($page['content_json'], JSON_THROW_ON_ERROR),
            'created' => $now,
            'updated' => $now,
        ]);
    }

    $pdo->commit();
    echo "Seeded Cinder & Row with 5 editable pages.\n";
} catch (Throwable $exception) {
    $pdo->rollBack();
    throw $exception;
}

