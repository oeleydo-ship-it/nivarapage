<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['template_category_id', 'name', 'slug', 'description', 'is_premium', 'is_active', 'is_featured', 'thumbnail', 'theme_tokens'])]
class Template extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_premium' => 'boolean',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'theme_tokens' => 'array',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(TemplateCategory::class, 'template_category_id');
    }

    public function pages(): HasMany
    {
        return $this->hasMany(TemplatePage::class);
    }

    public function resolveRouteBinding($value, $field = null)
    {
        $query = static::query();
        if ($field) {
            return $query->where($field, $value)->firstOrFail();
        }

        return $query
            ->where(function ($inner) use ($value) {
                $inner->where('slug', $value);
                if (ctype_digit((string) $value)) {
                    $inner->orWhere('id', (int) $value);
                }
            })
            ->firstOrFail();
    }

    public function homepage(): HasOne
    {
        return $this->hasOne(TemplatePage::class)->where('is_homepage', true);
    }

    /**
     * Compact homepage JSON for gallery cards: real blocks, no footer, no scroll animations.
     *
     * @return array{schemaVersion: int, sections: list<array<string, mixed>>}|null
     */
    public function previewContent(int $maxSections = 8): ?array
    {
        $page = null;
        if ($this->relationLoaded('homepage') && $this->homepage) {
            $page = $this->homepage;
        } elseif ($this->relationLoaded('pages')) {
            $page = $this->pages->firstWhere('is_homepage', true) ?? $this->pages->first();
        }

        $content = $page?->content_json;
        if (! is_array($content) || ! is_array($content['sections'] ?? null)) {
            return null;
        }

        $sections = [];
        foreach ($content['sections'] as $section) {
            if (! is_array($section)) {
                continue;
            }
            $type = (string) ($section['type'] ?? '');
            if ($type === '' || str_starts_with($type, 'footer.')) {
                continue;
            }
            $props = is_array($section['props'] ?? null) ? $section['props'] : [];
            unset($props['animation'], $props['animationTrigger']);
            $sections[] = array_merge($section, ['props' => $props]);
            if (count($sections) >= $maxSections) {
                break;
            }
        }

        if ($sections === []) {
            return null;
        }

        return [
            'schemaVersion' => (int) ($content['schemaVersion'] ?? 1),
            'sections' => $sections,
        ];
    }
}
