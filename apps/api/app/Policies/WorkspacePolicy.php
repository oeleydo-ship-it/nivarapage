<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Workspace;

class WorkspacePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Workspace $workspace): bool
    {
        return $user->membershipFor($workspace->id) !== null;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Workspace $workspace): bool
    {
        return in_array($user->roleIn($workspace->id), ['owner', 'admin'], true);
    }

    public function delete(User $user, Workspace $workspace): bool
    {
        return $user->roleIn($workspace->id) === 'owner';
    }

    public function invite(User $user, Workspace $workspace): bool
    {
        return in_array($user->roleIn($workspace->id), ['owner', 'admin'], true);
    }

    public function manageMembers(User $user, Workspace $workspace): bool
    {
        return in_array($user->roleIn($workspace->id), ['owner', 'admin'], true);
    }

    public function transfer(User $user, Workspace $workspace): bool
    {
        return $user->roleIn($workspace->id) === 'owner';
    }
}
