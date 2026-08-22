<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;
use App\Support\CurrentWorkspace;

class ClientPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->workspaces()->exists();
    }

    public function view(User $user, Client $client): bool
    {
        return $user->membershipFor($client->workspace_id) !== null;
    }

    public function create(User $user): bool
    {
        $role = app(CurrentWorkspace::class)->role();

        return in_array($role, ['owner', 'admin', 'designer', 'editor'], true);
    }

    public function update(User $user, Client $client): bool
    {
        return in_array($user->roleIn($client->workspace_id), ['owner', 'admin', 'designer', 'editor'], true);
    }

    public function delete(User $user, Client $client): bool
    {
        return in_array($user->roleIn($client->workspace_id), ['owner', 'admin'], true);
    }
}
