<?php

namespace App\Support;

/**
 * Finds the writing inside a set of sections, and puts new writing back.
 *
 * This is what keeps "generate content for this template" from turning into
 * "generate a different template". The model never sees or returns sections: it
 * is handed a flat list of the copy slots the blocks declare and answers with
 * replacement strings for them. Block types, their order, and every design prop
 * are therefore untouched by construction rather than by asking nicely.
 *
 * Which props count as copy comes from the block catalogue's own field
 * definitions, so a block that gains a heading gains a slot with it.
 */
final class TemplateCopySlots
{
    /** Field types that hold prose a writer would edit. */
    private const COPY_TYPES = ['text', 'textarea', 'richtext'];

    /**
     * Text-typed props that are addresses or identifiers rather than writing.
     * Rewriting one breaks a link or an anchor instead of improving a sentence.
     */
    private const SKIP_KEYS = ['anchorId', 'formId', 'publicId', 'embedUrl', 'backgroundVideoUrl', 'videoUrl'];

    /** Longer than this is almost certainly embedded markup, not a sentence. */
    private const MAX_TEXT = 1500;

    /**
     * @param  list<array<string, mixed>>  $sections
     * @return list<array{path: string, label: string, text: string}>
     */
    public static function collect(array $sections): array
    {
        $slots = [];

        foreach ($sections as $index => $section) {
            $type = is_array($section) ? ($section['type'] ?? null) : null;
            $props = is_array($section) ? ($section['props'] ?? []) : [];
            if (! is_string($type) || ! is_array($props)) {
                continue;
            }

            self::walk($props, BlockCatalog::fieldMap($type), (string) $index, $type, $slots);
        }

        return $slots;
    }

    /**
     * @param  list<array<string, mixed>>  $sections
     * @param  array<string, string>  $values  keyed by the path collect() emitted
     * @return list<array<string, mixed>>
     */
    public static function apply(array $sections, array $values): array
    {
        foreach ($values as $path => $text) {
            if (! is_string($text)) {
                continue;
            }

            $steps = explode('.', $path);
            $index = array_shift($steps);
            if (! is_numeric($index) || ! isset($sections[(int) $index]['props']) || $steps === []) {
                continue;
            }

            $props = $sections[(int) $index]['props'];
            if (! is_array($props)) {
                continue;
            }

            $sections[(int) $index]['props'] = self::set($props, $steps, mb_substr($text, 0, self::MAX_TEXT));
        }

        return $sections;
    }

    /**
     * @param  array<string, mixed>  $props
     * @param  array<string, array<string, mixed>>  $fields
     * @param  list<array{path: string, label: string, text: string}>  $slots
     */
    private static function walk(array $props, array $fields, string $prefix, string $blockType, array &$slots): void
    {
        foreach ($fields as $key => $field) {
            $type = is_array($field) ? ($field['type'] ?? null) : null;

            if ($type === 'repeater') {
                $rows = $props[$key] ?? null;
                if (! is_array($rows)) {
                    continue;
                }
                $childFields = [];
                foreach ((array) ($field['fields'] ?? []) as $child) {
                    if (is_array($child) && is_string($child['key'] ?? null)) {
                        $childFields[$child['key']] = $child;
                    }
                }
                foreach ($rows as $rowIndex => $row) {
                    if (is_array($row)) {
                        self::walk($row, $childFields, $prefix.'.'.$key.'.'.$rowIndex, $blockType, $slots);
                    }
                }

                continue;
            }

            if (! in_array($type, self::COPY_TYPES, true) || in_array($key, self::SKIP_KEYS, true)) {
                continue;
            }

            $value = $props[$key] ?? null;
            if (! is_string($value)) {
                continue;
            }

            $text = trim($value);
            // Nothing to rewrite, and a bare URL is an address that happens to
            // be typed as text.
            if ($text === '' || mb_strlen($text) > self::MAX_TEXT || preg_match('~^(https?://|/|\#|mailto:|tel:)~i', $text) === 1) {
                continue;
            }

            $slots[] = [
                'path' => $prefix.'.'.$key,
                // The block and prop name are the only hints the model gets
                // about what a string is for, so they carry real weight.
                'label' => $blockType.' · '.$key,
                'text' => $text,
            ];
        }
    }

    /**
     * @param  array<string, mixed>  $target
     * @param  list<string>  $steps
     * @return array<string, mixed>
     */
    private static function set(array $target, array $steps, string $value): array
    {
        $key = array_shift($steps);

        if ($steps === []) {
            if (array_key_exists($key, $target) && is_string($target[$key])) {
                $target[$key] = $value;
            }

            return $target;
        }

        if (! isset($target[$key]) || ! is_array($target[$key])) {
            return $target;
        }

        $target[$key] = self::set($target[$key], $steps, $value);

        return $target;
    }
}
