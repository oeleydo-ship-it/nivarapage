<?php

namespace App\Policies;

use App\Models\Site;
use App\Models\User;

class SitePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->workspaces()->exists();
    }

    public function view(User $user, Site $site): bool
    {
        return $user->membershipFor($site->workspace_id) !== null;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Site $site): bool
    {
        return in_array($user->roleIn($site->workspace_id), ['owner', 'admin', 'designer'], true);
    }

    public function delete(User $user, Site $site): bool
    {
        return in_array($user->roleIn($site->workspace_id), ['owner', 'admin'], true);
    }

    public function restore(User $user, Site $site): bool
    {
        return $this->delete($user, $site);
    }

    public function publish(User $user, Site $site): bool
    {
        return in_array($user->roleIn($site->workspace_id), ['owner', 'admin', 'designer'], true);
    }

    public function duplicate(User $user, Site $site): bool
    {
        return $this->update($user, $site);
    }
}
