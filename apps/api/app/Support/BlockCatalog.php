<?php

namespace App\Support;

/**
 * Reads the generated block catalog (`resources/blocks/block-catalog.json`).
 *
 * The catalog is produced from packages/blocks/src/registry.ts by
 * `pnpm blocks:catalog`, so allowed block types, their versions, their default
 * props and their prop keys always match the real block library. AI prompts and
 * AI output validation are both built from this data.
 */
final class BlockCatalog
{
    /** @var array<string, mixed>|null */
    private static ?array $data = null;

    private static ?int $mtime = null;

    /**
     * @return array<string, mixed>
     */
    public static function load(): array
    {
        $path = (string) config('ai.block_catalog');
        $mtime = ($path !== '' && is_file($path)) ? (int) filemtime($path) : 0;

        if (self::$data !== null && self::$mtime === $mtime) {
            return self::$data;
        }

        self::$mtime = $mtime;
        $decoded = null;

        if ($path !== '' && is_file($path)) {
            $decoded = json_decode((string) file_get_contents($path), true);
        }

        if (! is_array($decoded) || ! isset($decoded['blocks']) || ! is_array($decoded['blocks'])) {
            return self::$data = ['blocks' => [], 'aliases' => [], 'categories' => []];
        }

        $blocks = [];
        foreach ($decoded['blocks'] as $block) {
            if (is_array($block) && is_string($block['type'] ?? null)) {
                $blocks[$block['type']] = $block;
            }
        }

        return self::$data = [
            'blocks' => $blocks,
            'aliases' => is_array($decoded['aliases'] ?? null) ? $decoded['aliases'] : [],
            'categories' => is_array($decoded['categories'] ?? null) ? $decoded['categories'] : [],
        ];
    }

    public static function flush(): void
    {
        self::$data = null;
        self::$mtime = null;
    }

    public static function loaded(): bool
    {
        return self::load()['blocks'] !== [];
    }

    /**
     * @return list<string>
     */
    public static function types(): array
    {
        return array_keys(self::load()['blocks']);
    }

    /**
     * Original composition types used by site / template / chat generation.
     *
     * @return list<string>
     */
    public static function generatedTypes(): array
    {
        return array_values(array_filter(
            self::types(),
            static fn (string $type) => str_starts_with($type, 'generated.'),
        ));
    }

    /**
     * @return list<string>
     */
    public static function categories(): array
    {
        return array_values(self::load()['categories']);
    }

    /**
     * Maps a model-supplied type onto a real registry type, honouring the same
     * aliases the front-end registry accepts (`nav.simple` → `navbar.simple`).
     */
    public static function resolveType(mixed $type): ?string
    {
        if (! is_string($type) || $type === '') {
            return null;
        }

        $catalog = self::load();
        $candidate = strtolower(trim($type));

        if (isset($catalog['blocks'][$candidate])) {
            return $candidate;
        }

        $alias = $catalog['aliases'][$candidate] ?? null;
        if (is_string($alias) && isset($catalog['blocks'][$alias])) {
            return $alias;
        }

        return null;
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function block(string $type): ?array
    {
        $resolved = self::resolveType($type);

        return $resolved === null ? null : self::load()['blocks'][$resolved];
    }

    /**
     * @return array<string, mixed>
     */
    public static function defaultProps(string $type): array
    {
        $props = self::block($type)['defaultProps'] ?? [];

        return is_array($props) ? $props : [];
    }

    public static function version(string $type): int
    {
        return max(1, (int) (self::block($type)['version'] ?? 1));
    }

    /**
     * Field definitions keyed by prop name, used to coerce and filter props.
     *
     * @return array<string, array<string, mixed>>
     */
    public static function fieldMap(string $type): array
    {
        $fields = self::block($type)['fields'] ?? [];
        $map = [];
        foreach (is_array($fields) ? $fields : [] as $field) {
            if (is_array($field) && is_string($field['key'] ?? null)) {
                $map[$field['key']] = $field;
            }
        }

        return $map;
    }

    /**
     * Compact, prompt-sized description of the library: one line per block with
     * its editable content props so the model can only reference real keys.
     *
     * @param  list<string>|null  $onlyTypes
     * @return list<array<string, mixed>>
     */
    public static function promptBlocks(?array $onlyTypes = null): array
    {
        $out = [];
        foreach (self::load()['blocks'] as $type => $block) {
            if ($onlyTypes !== null && ! in_array($type, $onlyTypes, true)) {
                continue;
            }

            $props = [];
            foreach (is_array($block['fields'] ?? null) ? $block['fields'] : [] as $field) {
                if (! is_array($field) || ($field['group'] ?? 'content') !== 'content') {
                    continue;
                }
                $props[] = self::describeField($field);
            }

            $out[] = [
                'type' => $type,
                'label' => $block['label'] ?? $type,
                'category' => $block['category'] ?? 'content',
                'props' => $props,
            ];
        }

        return $out;
    }

    /**
     * @param  array<string, mixed>  $field
     */
    private static function describeField(array $field): string
    {
        $key = (string) ($field['key'] ?? '');
        $type = (string) ($field['type'] ?? 'text');

        if ($type === 'repeater') {
            $children = [];
            foreach (is_array($field['fields'] ?? null) ? $field['fields'] : [] as $child) {
                if (is_array($child) && is_string($child['key'] ?? null)) {
                    $children[] = $child['key'].':'.($child['type'] ?? 'text');
                }
            }

            return $key.': array of {'.implode(', ', $children).'}';
        }

        if ($type === 'select' && is_array($field['options'] ?? null) && $field['options'] !== []) {
            $values = [];
            foreach ($field['options'] as $option) {
                if (is_array($option)) {
                    $values[] = (string) ($option['value'] ?? '');
                } else {
                    $values[] = (string) $option;
                }
            }
            $values = array_values(array_filter($values, static fn (string $value) => $value !== ''));

            return $key.': one of ['.implode('|', $values).']';
        }

        return $key.': '.$type;
    }
}
