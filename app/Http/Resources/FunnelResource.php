<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Funnel */
class FunnelResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'public_id' => $this->public_id,
            'workspace_id' => $this->workspace_id,
            'site_id' => $this->site_id,
            'domain_id' => $this->domain_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'type' => $this->type,
            'goal' => $this->goal,
            'status' => $this->status,
            'settings' => $this->settings ?? [],
            'published_at' => $this->published_at,
            'site' => $this->whenLoaded('site', fn () => ['id' => $this->site->id, 'name' => $this->site->name, 'slug' => $this->site->slug]),
            'steps' => $this->whenLoaded('steps', fn () => $this->steps->map(fn ($step) => [
                'id' => $step->id,
                'funnel_id' => $step->funnel_id,
                'page_id' => $step->page_id,
                'draft_content' => $step->draft_content,
                'published_content' => $step->published_content,
                'name' => $step->name,
                'slug' => $step->slug,
                'type' => $step->type,
                'status' => $step->status,
                'position' => $step->position,
                'canvas_x' => $step->canvas_x,
                'canvas_y' => $step->canvas_y,
                'settings' => $step->settings ?? [],
                'seo_title' => $step->seo_title,
                'seo_description' => $step->seo_description,
                'page' => $step->relationLoaded('page') && $step->page ? ['id' => $step->page->id, 'name' => $step->page->name, 'slug' => $step->page->slug] : null,
            ])),
            'connections' => $this->whenLoaded('connections', fn () => $this->connections->map(fn ($connection) => [
                'id' => $connection->id,
                'source_step_id' => $connection->source_step_id,
                'target_step_id' => $connection->target_step_id,
                'connection_type' => $connection->connection_type,
                'conditions' => $connection->conditions ?? [],
                'priority' => $connection->priority,
            ])),
            'steps_count' => $this->whenCounted('steps'),
            'leads_count' => $this->whenCounted('leads'),
            'events_count' => $this->whenCounted('events'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
