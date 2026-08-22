<?php

namespace App\Support;

use App\Services\HtmlSanitizer;
use InvalidArgumentException;

class PageSchemaValidator
{
    public function __construct(private readonly HtmlSanitizer $sanitizer) {}

    /**
     * @param  array<string, mixed>  $content
     * @return array<string, mixed>
     */
    public function validate(array $content): array
    {
        if (($content['schemaVersion'] ?? null) !== 1) {
            throw new InvalidArgumentException('Invalid or missing schemaVersion.');
        }

        if (! isset($content['sections']) || ! is_array($content['sections'])) {
            throw new InvalidArgumentException('sections must be an array.');
        }

        $sections = [];
        foreach ($content['sections'] as $index => $section) {
            if (! is_array($section)) {
                throw new InvalidArgumentException("Section {$index} must be an object.");
            }

            foreach (['id', 'type', 'version', 'props'] as $required) {
                if (! array_key_exists($required, $section)) {
                    throw new InvalidArgumentException("Section {$index} is missing {$required}.");
                }
            }

            if (! is_string($section['id']) || $section['id'] === '') {
                throw new InvalidArgumentException("Section {$index} has an invalid id.");
            }

            if (! is_string($section['type']) || ! BlockRegistry::isAllowed($section['type'])) {
                throw new InvalidArgumentException("Unknown block type: {$section['type']}.");
            }

            if ((int) $section['version'] < 1) {
                throw new InvalidArgumentException("Section {$index} has an invalid version.");
            }

            if (! is_array($section['props'])) {
                throw new InvalidArgumentException("Section {$index} props must be an object.");
            }

            $sections[] = [
                'id' => $section['id'],
                'type' => $section['type'],
                'version' => (int) $section['version'],
                'hidden' => (bool) ($section['hidden'] ?? false),
                'props' => $this->sanitizeProps($section['props']),
            ];
        }

        return [
            'schemaVersion' => 1,
            'sections' => $sections,
        ];
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    private function sanitizeProps(array $props): array
    {
        foreach ($props as $key => $value) {
            if (is_string($value)) {
                $props[$key] = $this->sanitizer->sanitize($value);
            } elseif (is_array($value)) {
                $props[$key] = $this->sanitizeProps($value);
            }
        }

        return $props;
    }
}
