<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Activity */
class ActivityResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $targetType = $this->target_type ? class_basename($this->target_type) : null;

        return [
            'id' => $this->id,
            'action' => $this->action,
            'label' => $this->label($this->action),
            'actor' => $this->whenLoaded('actor', fn () => $this->actor ? [
                'id' => $this->actor->id,
                'name' => $this->actor->name,
                'email' => $this->actor->email,
            ] : null),
            'actor_id' => $this->actor_id,
            'target' => [
                'type' => $targetType,
                'id' => $this->target_id,
                'name' => $this->metadata['target_name'] ?? null,
            ],
            'workspace' => $this->whenLoaded('workspace', fn () => $this->workspace ? [
                'id' => $this->workspace->id,
                'name' => $this->workspace->name,
            ] : null),
            'workspace_id' => $this->workspace_id,
            'ip' => $this->ip,
            'metadata' => $this->metadata,
            'timestamp' => $this->created_at?->toIso8601String(),
            'created_at' => $this->created_at,
        ];
    }

    private function label(string $action): string
    {
        return match ($action) {
            'site.created' => 'Site created',
            'site.deleted' => 'Site deleted',
            'site.duplicated' => 'Site duplicated',
            'site.restored' => 'Site restored',
            'site.template_applied' => 'Template applied',
            'page.created' => 'Page created',
            'page.published' => 'Page published',
            'page.restored' => 'Page restored',
            'page.deleted' => 'Page deleted',
            'domain.created' => 'Domain added',
            'domain.activated' => 'Domain activated',
            'domain.deleted' => 'Domain removed',
            'user.invited' => 'User invited',
            'user.role_changed' => 'Role changed',
            'user.removed' => 'User removed',
            'ownership.transferred' => 'Ownership transferred',
            'media.deleted' => 'Media deleted',
            'media.uploaded' => 'Media uploaded',
            'billing.plan_changed' => 'Plan changed',
            'ai.chat' => 'AI chat',
            'ai.page_generated' => 'AI page generated',
            'ai.site_applied' => 'AI site applied',
            'ai.block_generated' => 'AI block generated',
            'ai.text_rewritten' => 'AI text rewritten',
            'ai.settings_updated' => 'AI settings updated',
            'ai.library_block_created' => 'AI library block created',
            'ai.template_created' => 'AI template created',
            'workspace.created' => 'Workspace created',
            default => str_replace('.', ' ', $action),
        };
    }
}
