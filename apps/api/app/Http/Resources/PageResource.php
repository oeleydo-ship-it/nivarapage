<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Page */
class PageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'site_id' => $this->site_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'type' => $this->type,
            'status' => $this->status,
            'is_homepage' => $this->is_homepage,
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
            'seo_image' => $this->seo_image,
            'canonical_url' => $this->canonical_url,
            'og_title' => $this->og_title,
            'og_description' => $this->og_description,
            'og_image' => $this->og_image,
            'robots_index' => $this->robots_index,
            'draft_revision_id' => $this->draft_revision_id,
            'published_revision_id' => $this->published_revision_id,
            'draft' => new PageRevisionResource($this->whenLoaded('draftRevision')),
            'published' => new PageRevisionResource($this->whenLoaded('publishedRevision')),
        ];
    }
}
