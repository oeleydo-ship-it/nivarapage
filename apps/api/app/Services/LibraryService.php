<?php

namespace App\Services;

use App\Models\BlockPreset;
use App\Models\Template;
use App\Models\TemplateCategory;
use App\Models\TemplatePage;
use App\Models\User;
use App\Services\Ai\AiGenerator;
use App\Support\BlockCatalog;
use Illuminate\Support\Str;

/**
 * Super-admin AI library: generated templates and block presets become available
 * to every tenant in the site wizard and the visual editor.
 */
class LibraryService
{
    public function __construct(
        private readonly AiGenerator $generator,
        private readonly AuditService $audit,
    ) {}

    /**
     * @param  array<string, mixed>  $input
     * @return array{template: Template, report: array<string, mixed>}
     */
    public function generateTemplate(array $input, User $actor): array
    {
        $result = $this->generator->generateLibraryPage($input);
        $name = trim((string) ($input['name'] ?? '')) ?: $this->headingFrom($result['content']) ?: 'AI template';
        $category = $this->category((string) ($input['category'] ?? 'AI library'));
        $pages = $result['pages'] ?? [[
            'name' => 'Home',
            'slug' => 'home',
            'is_homepage' => true,
            'content' => $result['content'],
        ]];

        $template = Template::query()->create([
            'template_category_id' => $category->id,
            'name' => $name,
            'slug' => $this->uniqueSlug($name, 'templates'),
            'description' => trim((string) ($input['description'] ?? '')) ?: mb_substr(trim((string) ($input['prompt'] ?? '')), 0, 240),
            'is_premium' => (bool) ($input['is_premium'] ?? false),
            'is_active' => true,
            'is_featured' => (bool) ($input['is_featured'] ?? false),
            'theme_tokens' => $result['theme'] ?? [],
        ]);

        foreach ($pages as $page) {
            TemplatePage::query()->create([
                'template_id' => $template->id,
                'name' => (string) ($page['name'] ?? 'Page'),
                'slug' => (string) ($page['slug'] ?? 'page'),
                'is_homepage' => (bool) ($page['is_homepage'] ?? false),
                'content_json' => $page['content'] ?? $result['content'],
            ]);
        }

        $this->audit->log('ai.template_created', $template, [
            'prompt' => mb_substr((string) ($input['prompt'] ?? ''), 0, 240),
            'pages' => count($pages),
            'sections' => $result['report']['sections'] ?? [],
            'dropped_types' => $result['report']['dropped_types'] ?? [],
        ], null, $actor);

        return [
            'template' => $template->fresh()->load('category')->loadCount('pages')->load('pages'),
            'report' => $result['report'],
        ];
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array{preset: BlockPreset, report: array<string, mixed>}
     */
    public function generateBlock(array $input, User $actor): array
    {
        $result = $this->generator->generateLibraryBlock($input);
        $section = $result['section'];
        $type = (string) $section['type'];
        $props = is_array($section['props'] ?? null) ? $section['props'] : [];
        $catalog = BlockCatalog::block($type) ?? [];
        $name = trim((string) ($input['name'] ?? ''))
            ?: $this->headingFrom(['sections' => [$section]])
            ?: (is_string($catalog['label'] ?? null) ? $catalog['label'] : 'AI block');

        $preset = BlockPreset::query()->create([
            'name' => $name,
            'slug' => $this->uniqueSlug($name, 'block_presets'),
            'description' => trim((string) ($input['description'] ?? '')) ?: mb_substr(trim((string) ($input['prompt'] ?? '')), 0, 240),
            'category' => is_string($catalog['category'] ?? null) ? $catalog['category'] : 'content',
            'block_type' => $type,
            'props' => $props,
            'is_active' => true,
            'is_featured' => (bool) ($input['is_featured'] ?? false),
            'source' => 'ai',
            'prompt' => mb_substr(trim((string) ($input['prompt'] ?? '')), 0, 2000),
            'created_by' => $actor->id,
        ]);

        $this->audit->log('ai.library_block_created', $preset, [
            'prompt' => mb_substr((string) ($input['prompt'] ?? ''), 0, 240),
            'block_type' => $type,
        ], null, $actor);

        return [
            'preset' => $preset,
            'report' => $result['report'],
        ];
    }

    private function category(string $name): TemplateCategory
    {
        $name = trim($name) !== '' ? trim($name) : 'AI library';
        $slug = Str::slug($name) ?: 'ai-library';

        return TemplateCategory::query()->firstOrCreate(
            ['slug' => $slug],
            ['name' => $name],
        );
    }

    /**
     * @param  array<string, mixed>  $content
     */
    private function headingFrom(array $content): ?string
    {
        foreach ($content['sections'] ?? [] as $section) {
            if (! is_array($section)) {
                continue;
            }
            $props = is_array($section['props'] ?? null) ? $section['props'] : [];
            foreach (['heading', 'title', 'logo', 'brand'] as $key) {
                if (is_string($props[$key] ?? null) && trim($props[$key]) !== '') {
                    return mb_substr(trim($props[$key]), 0, 80);
                }
            }
        }

        return null;
    }

    private function uniqueSlug(string $name, string $table): string
    {
        $base = Str::slug($name) ?: 'item';
        $candidate = $base;
        $i = 2;
        while (\Illuminate\Support\Facades\DB::table($table)->where('slug', $candidate)->exists()) {
            $candidate = $base.'-'.$i;
            $i++;
        }

        return $candidate;
    }
}
