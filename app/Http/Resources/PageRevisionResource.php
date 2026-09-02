<?php

namespace App\Http\Resources;

use App\Models\PageRevision;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin PageRevision
 *
 * A page's whole content is stored per revision, so the history list omits it
 * and callers fetch one revision when they actually want to preview it.
 */
class PageRevisionResource extends JsonResource
{
    /**
     * Content is included by default because this resource is also the page's
     * draft inside PageResource, where callers rely on it. Only the history
     * listing opts out, to avoid shipping every version of every page.
     */
    private bool $withContent = true;

    /** Omit the page content, for listings. */
    public function withoutContent(): self
    {
        $this->withContent = false;

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $content = is_array($this->content_json) ? $this->content_json : [];
        $sections = is_array($content['sections'] ?? null) ? $content['sections'] : [];

        return array_filter([
            'id' => $this->id,
            'page_id' => $this->page_id,
            'version_number' => $this->version_number,
            'reason' => $this->reason,
            'section_count' => count($sections),
            'author' => $this->whenLoaded('user', fn () => $this->user?->name),
            'created_at' => $this->created_at,
            'content' => $this->withContent ? $content : null,
        ], fn ($value) => $value !== null);
    }
}
