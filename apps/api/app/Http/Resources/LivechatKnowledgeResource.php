<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\LivechatKnowledge */
class LivechatKnowledgeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'site_id' => $this->site_id,
            'title' => $this->title,
            'source' => $this->source,
            'filename' => $this->filename,
            'mime' => $this->mime,
            'bytes' => $this->bytes,
            'excerpt' => mb_substr(strip_tags((string) $this->content), 0, 180),
            'created_at' => $this->created_at,
        ];
    }
}
