<?php

namespace App\Services;

use App\Models\Site;
use App\Models\SiteSetting;
use App\Support\PageSchemaValidator;

/**
 * The header and footer a site shows on every page.
 *
 * Both are section arrays in exactly the shape a page's content takes, so the
 * same validator guards them, the same blocks render them, and the builder can
 * edit them with the canvas it already has. Composition happens at render time
 * rather than by copying the sections into each page, so changing the header
 * changes every page at once and no page can drift out of step.
 */
class SiteChromeService
{
    public function __construct(
        private readonly PageSchemaValidator $validator,
        private readonly TenantCacheService $cache,
        private readonly AuditService $audit,
    ) {}

    /**
     * @return array{header: array<string, mixed>, footer: array<string, mixed>}
     */
    public function get(Site $site): array
    {
        $settings = $site->settings;

        return [
            'header' => $this->normalize($settings?->header_json),
            'footer' => $this->normalize($settings?->footer_json),
        ];
    }

    /**
     * Only the keys present are written, so saving a header cannot blank a
     * footer the caller never sent.
     *
     * @param  array<string, mixed>  $data
     * @return array{header: array<string, mixed>, footer: array<string, mixed>}
     */
    public function update(Site $site, array $data): array
    {
        $settings = $site->settings ?: SiteSetting::query()->create(['site_id' => $site->id]);
        $attributes = [];

        foreach (['header', 'footer'] as $slot) {
            if (! array_key_exists($slot, $data)) {
                continue;
            }
            if ($data[$slot] === null) {
                $attributes[$slot.'_json'] = null;

                continue;
            }

            $content = is_array($data[$slot]) ? $data[$slot] : [];
            // Request validation only returns the keys it has rules for, and the
            // shared page validator refuses content without a schemaVersion.
            $content['schemaVersion'] ??= 1;
            $content['sections'] ??= [];

            $attributes[$slot.'_json'] = $this->validator->validate($content);
        }

        if ($attributes !== []) {
            $settings->update($attributes);
            $site->setRelation('settings', $settings->fresh());
            // Every page embeds this, so the whole site's cached payloads go.
            $this->cache->invalidateSite($site);
            $this->audit->log('site.chrome_updated', $site, [
                'slots' => array_keys($attributes),
            ], $site->workspace);
        }

        return $this->get($site->fresh('settings'));
    }

    /**
     * Content is stored in a page's shape, and an empty slot reads as an empty
     * section list rather than null so callers never have to special-case it.
     *
     * @return array<string, mixed>
     */
    private function normalize(mixed $content): array
    {
        if (! is_array($content) || ! isset($content['sections']) || ! is_array($content['sections'])) {
            return ['schemaVersion' => 1, 'sections' => []];
        }

        return $content;
    }
}
