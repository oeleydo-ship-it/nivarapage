<?php

declare(strict_types=1);

$database = realpath(__DIR__.'/../database/database.sqlite');
$pdo = new PDO('sqlite:'.$database, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

$motion = static function (array $content): array {
    if (! is_array($content['sections'] ?? null)) {
        return $content;
    }

    foreach ($content['sections'] as &$section) {
        $type = (string) ($section['type'] ?? '');
        if (! str_contains($type, '.cinder')) {
            continue;
        }
        $isLoadBlock = in_array($type, ['navbar.cinder', 'hero.cinder'], true);
        $section['props'] = array_replace([
            'animation' => $type === 'navbar.cinder' ? 'fade-down' : ($type === 'hero.cinder' ? 'fade' : 'fade-up'),
            'animationDuration' => $type === 'hero.cinder' ? 1100 : 780,
            'animationDelay' => $type === 'hero.cinder' ? 80 : 0,
            'animationTrigger' => $isLoadBlock ? 'load' : 'scroll',
        ], is_array($section['props'] ?? null) ? $section['props'] : []);
    }
    unset($section);

    return $content;
};

$pdo->beginTransaction();
try {
    $templates = $pdo->query("SELECT tp.id, tp.content_json FROM template_pages tp JOIN templates t ON t.id = tp.template_id WHERE t.slug = 'cinder-row'")->fetchAll(PDO::FETCH_ASSOC);
    $updateTemplate = $pdo->prepare('UPDATE template_pages SET content_json = :content, updated_at = :updated WHERE id = :id');
    foreach ($templates as $page) {
        $content = $motion(json_decode($page['content_json'], true, 512, JSON_THROW_ON_ERROR));
        $updateTemplate->execute(['content' => json_encode($content, JSON_THROW_ON_ERROR), 'updated' => date('Y-m-d H:i:s'), 'id' => $page['id']]);
    }

    $revisions = $pdo->query("SELECT r.id, r.content_json FROM page_revisions r JOIN pages p ON p.id = r.page_id JOIN sites s ON s.id = p.site_id WHERE s.slug = 'cinder-row' AND s.deleted_at IS NULL")->fetchAll(PDO::FETCH_ASSOC);
    $updateRevision = $pdo->prepare('UPDATE page_revisions SET content_json = :content, updated_at = :updated WHERE id = :id');
    foreach ($revisions as $revision) {
        $content = $motion(json_decode($revision['content_json'], true, 512, JSON_THROW_ON_ERROR));
        $updateRevision->execute(['content' => json_encode($content, JSON_THROW_ON_ERROR), 'updated' => date('Y-m-d H:i:s'), 'id' => $revision['id']]);
    }

    $pdo->commit();
    echo 'Animated '.count($templates).' template pages and '.count($revisions)." site page revisions.\n";
} catch (Throwable $exception) {
    $pdo->rollBack();
    throw $exception;
}
