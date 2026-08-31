<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\PageRevision */
class PageRevisionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'page_id' => $this->page_id,
            'version_number' => $this->version_number,
            'content' => $this->content_json,
            'reason' => $this->reason,
            'created_at' => $this->created_at,
        ];
    }
}
