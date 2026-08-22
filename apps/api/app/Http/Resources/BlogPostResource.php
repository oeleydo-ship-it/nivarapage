<?php

namespace App\Http\Resources;

use App\Services\BlogService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\BlogPost */
class BlogPostResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $site = $this->whenLoaded('site') ? $this->site : null;
        $path = $site ? app(BlogService::class)->indexPath($site).'/'.$this->slug : '/blog/'.$this->slug;

        return [
            'id' => $this->id,
            'workspace_id' => $this->workspace_id,
            'site_id' => $this->site_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'body' => $this->body,
            'cover_image' => $this->cover_image,
            'author_name' => $this->author_name,
            'category' => $this->category,
            'tags' => $this->tags ?? [],
            'status' => $this->status,
            'published_at' => $this->published_at,
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
            'path' => $path,
            'site' => $this->whenLoaded('site', fn () => $this->site ? [
                'id' => $this->site->id,
                'name' => $this->site->name,
                'status' => $this->site->status,
                'domains' => DomainResource::collection($this->site->relationLoaded('domains') ? $this->site->domains : collect()),
            ] : null),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
