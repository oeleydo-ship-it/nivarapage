<?php

declare(strict_types=1);

$database = realpath(__DIR__.'/../database/database.sqlite');
if ($database === false) {
    throw new RuntimeException('SQLite database was not found.');
}

$pdo = new PDO('sqlite:'.$database, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$now = date('Y-m-d H:i:s');

$pdo->beginTransaction();
try {
    $sites = $pdo->query("SELECT id, workspace_id FROM sites WHERE slug = 'cinder-row' AND deleted_at IS NULL")->fetchAll(PDO::FETCH_ASSOC);
    $fieldExists = $pdo->prepare('SELECT 1 FROM form_fields WHERE form_id = :form AND name = :name LIMIT 1');
    $insertField = $pdo->prepare('INSERT INTO form_fields (form_id, name, label, type, required, options, sort_order, created_at, updated_at) VALUES (:form, :name, :label, :type, :required, :options, :sort, :created, :updated)');
    $revisionsForSite = $pdo->prepare('SELECT r.id, r.content_json FROM page_revisions r JOIN pages p ON p.id = r.page_id WHERE p.site_id = :site');
    $updateRevision = $pdo->prepare('UPDATE page_revisions SET content_json = :content, updated_at = :updated WHERE id = :id');
    $wired = 0;

    foreach ($sites as $site) {
        $formQuery = $pdo->prepare("SELECT id FROM forms WHERE site_id = :site AND type = 'contact' ORDER BY id LIMIT 1");
        $formQuery->execute(['site' => $site['id']]);
        $formId = $formQuery->fetchColumn();
        if ($formId === false) {
            continue;
        }

        $sort = (int) $pdo->query('SELECT COALESCE(MAX(sort_order), -1) + 1 FROM form_fields WHERE form_id = '.(int) $formId)->fetchColumn();
        $fields = [
            ['name' => 'postcode', 'label' => 'Postcode', 'type' => 'text', 'required' => 0, 'options' => null],
            ['name' => 'service', 'label' => 'What do you need?', 'type' => 'radio', 'required' => 0, 'options' => json_encode(['Boiler repair', 'Annual service', 'Safety check', 'New installation', 'Something else'], JSON_THROW_ON_ERROR)],
        ];
        foreach ($fields as $field) {
            $fieldExists->execute(['form' => $formId, 'name' => $field['name']]);
            if ($fieldExists->fetchColumn() !== false) {
                continue;
            }
            $insertField->execute($field + ['form' => $formId, 'sort' => $sort++, 'created' => $now, 'updated' => $now]);
        }

        $revisionsForSite->execute(['site' => $site['id']]);
        foreach ($revisionsForSite->fetchAll(PDO::FETCH_ASSOC) as $revision) {
            $content = json_decode($revision['content_json'], true, 512, JSON_THROW_ON_ERROR);
            $changed = false;
            foreach (($content['sections'] ?? []) as $index => $section) {
                if (($section['type'] ?? null) !== 'form.cinder') {
                    continue;
                }
                $content['sections'][$index]['props']['formId'] = (string) $formId;
                $changed = true;
            }
            if ($changed) {
                $updateRevision->execute(['content' => json_encode($content, JSON_THROW_ON_ERROR), 'updated' => $now, 'id' => $revision['id']]);
                $wired++;
            }
        }
    }

    $pdo->commit();
    echo 'Wired '.count($sites).' Cinder site(s) and updated '.$wired." page revision(s).\n";
} catch (Throwable $exception) {
    $pdo->rollBack();
    throw $exception;
}
