<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\User;
use App\Models\Workspace;
use App\Support\CurrentWorkspace;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AuditService
{
    public function __construct(
        private readonly CurrentWorkspace $currentWorkspace,
        private readonly Request $request,
    ) {}

    /**
     * @param  array<string, mixed>  $metadata
     */
    public function log(
        string $action,
        ?Model $target = null,
        array $metadata = [],
        ?Workspace $workspace = null,
        ?User $actor = null,
    ): Activity {
        return Activity::query()->create([
            'workspace_id' => $workspace?->id ?? $this->currentWorkspace->id(),
            'actor_id' => $actor?->id ?? $this->request->user()?->id,
            'action' => $action,
            'target_type' => $target ? $target::class : null,
            'target_id' => $target?->getKey(),
            'ip' => $this->request->ip(),
            'metadata' => array_filter(array_merge([
                'target_name' => $this->targetName($target),
            ], $metadata), fn ($value) => $value !== null && $value !== ''),
        ]);
    }

    private function targetName(?Model $target): ?string
    {
        if (! $target) {
            return null;
        }

        foreach (['name', 'hostname', 'filename', 'email', 'title', 'slug'] as $attribute) {
            $value = $target->getAttribute($attribute);
            if (is_string($value) && $value !== '') {
                return $value;
            }
        }

        return class_basename($target).'#'.$target->getKey();
    }
}
