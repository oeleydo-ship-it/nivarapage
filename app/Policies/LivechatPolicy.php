<?php

namespace App\Policies;

use App\Models\LivechatConversation;
use App\Models\LivechatWidget;
use App\Models\User;
use App\Support\CurrentWorkspace;

class LivechatPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->workspaces()->exists();
    }

    public function view(User $user, LivechatWidget|LivechatConversation $target): bool
    {
        return $user->membershipFor($target->workspace_id) !== null;
    }

    public function update(User $user, LivechatWidget|LivechatConversation $target): bool
    {
        return in_array($user->roleIn($target->workspace_id), ['owner', 'admin', 'designer', 'editor'], true);
    }

    public function manage(User $user, LivechatWidget $widget): bool
    {
        $role = $user->roleIn($widget->workspace_id) ?? app(CurrentWorkspace::class)->role();

        return in_array($role, ['owner', 'admin', 'designer'], true);
    }
}
