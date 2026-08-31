<?php

namespace App\Policies;

use App\Models\Funnel;
use App\Models\User;

class FunnelPolicy
{
    public function view(User $user, Funnel $funnel): bool
    {
        return $user->membershipFor($funnel->workspace_id) !== null;
    }

    public function create(User $user): bool { return true; }

    public function update(User $user, Funnel $funnel): bool
    {
        return in_array($user->roleIn($funnel->workspace_id), ['owner', 'admin', 'designer', 'editor'], true);
    }

    public function publish(User $user, Funnel $funnel): bool
    {
        return in_array($user->roleIn($funnel->workspace_id), ['owner', 'admin', 'designer'], true);
    }

    public function delete(User $user, Funnel $funnel): bool
    {
        return in_array($user->roleIn($funnel->workspace_id), ['owner', 'admin', 'designer'], true);
    }
}
