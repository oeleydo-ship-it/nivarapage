<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Template */
class TemplateResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'is_premium' => $this->is_premium,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'thumbnail' => $this->thumbnail,
            // Where the public demo of this template lives, so the marketing
            // site can link to it without knowing how the app routes.
            'demo_path' => '/demo/'.$this->slug,
            'theme_tokens' => $this->theme_tokens,
            'page_count' => $this->whenCounted('pages'),
            'category' => $this->whenLoaded('category'),
            'pages' => $this->whenLoaded('pages'),
            'preview' => $this->when(
                $this->relationLoaded('homepage') || $this->relationLoaded('pages'),
                fn () => $this->previewContent(),
            ),
        ];
    }
}
