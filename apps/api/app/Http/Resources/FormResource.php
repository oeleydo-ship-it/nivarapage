<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FormResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'site_id' => $this->site_id,
            'workspace_id' => $this->workspace_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'type' => $this->type,
            'settings' => $this->settings,
            'submissions_count' => $this->whenCounted('submissions'),
            'workspace' => $this->whenLoaded('workspace', fn () => $this->workspace ? [
                'id' => $this->workspace->id,
                'name' => $this->workspace->name,
            ] : null),
            'site' => $this->whenLoaded('site', fn () => $this->site ? [
                'id' => $this->site->id,
                'name' => $this->site->name,
            ] : null),
            'fields' => $this->whenLoaded('fields', fn () => $this->fields->map(fn ($field) => [
                'id' => $field->id,
                'name' => $field->name,
                'label' => $field->label,
                'type' => $field->type,
                'required' => $field->required,
                'options' => $field->options,
                'sort_order' => $field->sort_order,
            ])->values()),
        ];
    }
}
