<?php

namespace App\Support;

use Illuminate\Support\Str;

/**
 * Coerces raw model output into sections that are guaranteed to satisfy the page
 * schema before anything is persisted.
 *
 * Every decision is driven by the generated block catalog:
 *  - block types that do not exist (after alias resolution) are dropped
 *  - props that are not declared on the block's schema are dropped
 *  - remaining props are coerced to the field's type and merged onto defaultProps
 *  - section ids and versions are always regenerated server-side
 *
 * The returned report is surfaced to the dashboard and written to the audit log
 * so a silently-degraded generation is still visible.
 */
class AiSectionRepair
{
    /** @var list<string> */
    private array $droppedTypes = [];

    /** @var list<string> */
    private array $droppedProps = [];

    /**
     * @param  array<string, mixed>  $raw
     * @return array{content: array{schemaVersion: int, sections: list<array<string, mixed>>}, report: array<string, mixed>}
     */
    public function repairContent(array $raw): array
    {
        $this->droppedTypes = [];
        $this->droppedProps = [];

        $sections = $this->repairSections($raw['sections'] ?? $raw['blocks'] ?? []);

        return [
            'content' => ['schemaVersion' => 1, 'sections' => $sections],
            'report' => $this->report(count($sections)),
        ];
    }

    /**
     * Repair every page in a sitemap without resetting the dropped-type report
     * between pages.
     *
     * @param  list<array<string, mixed>>  $rawPages
     * @return array{pages: list<array<string, mixed>>, report: array<string, mixed>}
     */
    public function repairPages(array $rawPages): array
    {
        $this->droppedTypes = [];
        $this->droppedProps = [];

        $pages = [];
        $sectionCount = 0;

        foreach ($rawPages as $rawPage) {
            $sections = $this->repairSections($rawPage['sections'] ?? $rawPage['blocks'] ?? []);
            if ($sections === []) {
                continue;
            }

            $sectionCount += count($sections);
            $pages[] = [
                'name' => is_string($rawPage['name'] ?? null) ? $rawPage['name'] : 'Page',
                'slug' => is_string($rawPage['slug'] ?? null) ? $rawPage['slug'] : 'page',
                'is_homepage' => (bool) ($rawPage['is_homepage'] ?? false),
                'content' => ['schemaVersion' => 1, 'sections' => $sections],
            ];
        }

        return [
            'pages' => $pages,
            'report' => $this->report($sectionCount),
        ];
    }

    /**
     * @param  mixed  $rawSections
     * @return list<array<string, mixed>>
     */
    public function repairSections(mixed $rawSections): array
    {
        if (! is_array($rawSections)) {
            $rawSections = [];
        }

        $max = max(1, (int) config('ai.max_sections', 14));
        $sections = [];

        foreach ($rawSections as $rawSection) {
            if (count($sections) >= $max) {
                break;
            }
            $section = $this->repairSection(is_array($rawSection) ? $rawSection : []);
            if ($section !== null) {
                $sections[] = $section;
            }
        }

        return $sections;
    }

    /**
     * @return array<string, mixed>
     */
    private function report(int $sections): array
    {
        return [
            'sections' => $sections,
            'dropped_types' => array_values(array_unique($this->droppedTypes)),
            'dropped_props' => array_values(array_unique($this->droppedProps)),
        ];
    }

    /**
     * @param  array<string, mixed>  $raw
     * @return array{section: array<string, mixed>|null, report: array<string, mixed>}
     */
    public function repairOne(array $raw, ?string $forceType = null): array
    {
        $this->droppedTypes = [];
        $this->droppedProps = [];

        $section = $this->repairSection($raw, $forceType);

        return [
            'section' => $section,
            'report' => [
                'sections' => $section ? 1 : 0,
                'dropped_types' => array_values(array_unique($this->droppedTypes)),
                'dropped_props' => array_values(array_unique($this->droppedProps)),
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $raw
     * @return array<string, mixed>|null
     */
    private function repairSection(array $raw, ?string $forceType = null): ?array
    {
        $requested = $forceType ?? ($raw['type'] ?? $raw['block'] ?? null);
        $type = BlockCatalog::resolveType($requested);

        if ($type === null) {
            $this->droppedTypes[] = is_string($requested) && $requested !== '' ? $requested : '(missing type)';

            return null;
        }

        $props = $raw['props'] ?? $raw['properties'] ?? [];

        return [
            'id' => (string) Str::uuid(),
            'type' => $type,
            'version' => BlockCatalog::version($type),
            'hidden' => (bool) ($raw['hidden'] ?? false),
            'props' => $this->repairProps($type, is_array($props) ? $props : []),
        ];
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    public function repairProps(string $type, array $props): array
    {
        $fields = BlockCatalog::fieldMap($type);
        $merged = BlockCatalog::defaultProps($type);

        // AI-native blocks have attractive defaults for manual insertion, but
        // those sample words must never leak into generated customer sites.
        // Keep only structural defaults and require the model to author every
        // visible content value itself.
        if (str_starts_with($type, 'generated.')) {
            $structural = ['layout', 'surface', 'density', 'wash', 'image', 'imageAlt', 'logoUrl', 'buttonUrl', 'secondaryUrl', 'formId'];
            foreach ($fields as $key => $field) {
                if (! in_array($key, $structural, true) && array_key_exists($key, $merged)) {
                    $merged[$key] = ($field['type'] ?? null) === 'repeater' ? [] : '';
                }
            }
        }

        foreach ($props as $key => $value) {
            if (! is_string($key) || ! isset($fields[$key])) {
                $this->droppedProps[] = $type.'.'.(is_string($key) ? $key : '(non-string key)');

                continue;
            }

            if (str_starts_with($type, 'generated.') && $key === 'image' && ! $this->isSafeGeneratedMedia($value)) {
                $this->droppedProps[] = $type.'.image';
                $merged[$key] = '';

                continue;
            }

            $coerced = $this->coerce($fields[$key], $value);
            if (str_starts_with($type, 'generated.') && ! in_array($key, $structural ?? [], true)) {
                $coerced = $this->removePlaceholderContent($coerced);
            }
            if ($coerced === null) {
                $this->droppedProps[] = $type.'.'.$key;

                continue;
            }

            $merged[$key] = $coerced;
        }

        return $merged;
    }

    private function isSafeGeneratedMedia(mixed $value): bool
    {
        if (! is_string($value) || trim($value) === '') {
            return true;
        }

        $url = trim($value);
        if (str_starts_with($url, '/') && ! str_starts_with($url, '//')) {
            return true;
        }

        if (filter_var($url, FILTER_VALIDATE_URL) === false) {
            return false;
        }

        $path = strtolower((string) parse_url($url, PHP_URL_PATH));

        return str_contains($path, '/storage/')
            || str_contains($path, '/media/')
            || str_contains($path, '/uploads/');
    }

    private function removePlaceholderContent(mixed $value): mixed
    {
        if (is_string($value)) {
            $text = strtolower(trim($value));
            if ($text === '' || preg_match('/\b(lorem ipsum|your text here|placeholder|sample text|dummy text)\b/i', $text) === 1) {
                return null;
            }
            if (preg_match('/^(item|feature|service|benefit|question|answer|plan)(\s+|\s*#?)\d*$/i', $text) === 1) {
                return null;
            }
            if (in_array($text, ['a short original line.', 'describe this item', 'feature one', 'feature two', 'feature three'], true)) {
                return null;
            }

            return $value;
        }

        if (! is_array($value)) {
            return $value;
        }

        $clean = [];
        foreach ($value as $key => $item) {
            $item = $this->removePlaceholderContent($item);
            if ($item !== null && $item !== [] && $item !== '') {
                $clean[$key] = $item;
            }
        }

        return array_is_list($value) ? array_values($clean) : $clean;
    }

    /**
     * @param  array<string, mixed>  $field
     */
    private function coerce(array $field, mixed $value): mixed
    {
        $type = (string) ($field['type'] ?? 'text');

        if ($type === 'repeater') {
            return $this->coerceRepeater($field, $value);
        }

        if ($type === 'toggle') {
            return is_bool($value) ? $value : (is_scalar($value) ? filter_var($value, FILTER_VALIDATE_BOOLEAN) : null);
        }

        if (in_array($type, ['number', 'slider', 'spacing'], true)) {
            if (! is_numeric($value)) {
                return null;
            }
            $number = $value + 0;
            if (isset($field['min']) && is_numeric($field['min'])) {
                $number = max($field['min'] + 0, $number);
            }
            if (isset($field['max']) && is_numeric($field['max'])) {
                $number = min($field['max'] + 0, $number);
            }

            return $number;
        }

        if (! is_scalar($value)) {
            return null;
        }

        $text = trim((string) $value);

        if (in_array($type, ['select', 'alignment', 'background'], true) && is_array($field['options'] ?? null) && $field['options'] !== []) {
            $options = array_map('strval', $field['options']);

            return in_array($text, $options, true) ? $text : null;
        }

        return $text;
    }

    /**
     * @param  array<string, mixed>  $field
     * @return list<array<string, mixed>>|null
     */
    private function coerceRepeater(array $field, mixed $value): ?array
    {
        if (! is_array($value) || $value === []) {
            return null;
        }

        $children = [];
        foreach (is_array($field['fields'] ?? null) ? $field['fields'] : [] as $child) {
            if (is_array($child) && is_string($child['key'] ?? null)) {
                $children[$child['key']] = $child;
            }
        }

        $rows = [];
        foreach ($value as $row) {
            if (! is_array($row)) {
                continue;
            }

            $clean = [];
            foreach ($row as $key => $childValue) {
                if (! is_string($key) || ! isset($children[$key])) {
                    continue;
                }
                $coerced = $this->coerce($children[$key], $childValue);
                if ($coerced !== null) {
                    $clean[$key] = $coerced;
                }
            }

            if ($clean !== []) {
                $rows[] = $clean;
            }
        }

        return $rows === [] ? null : $rows;
    }
}
