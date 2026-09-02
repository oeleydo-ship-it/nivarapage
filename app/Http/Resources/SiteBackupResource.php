<?php

namespace App\Http\Resources;

use App\Models\SiteBackup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin SiteBackup
 *
 * The payload itself is never sent: a listing would otherwise carry every
 * page's content for every snapshot.
 */
class SiteBackupResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'site_id' => $this->site_id,
            'label' => $this->label,
            'kind' => $this->kind,
            'page_count' => $this->page_count,
            'bytes' => $this->bytes,
            'author' => $this->whenLoaded('user', fn () => $this->user?->name),
            'created_at' => $this->created_at,
        ];
    }
}
