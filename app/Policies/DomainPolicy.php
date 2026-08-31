<?php

namespace App\Policies;

use App\Models\Domain;
use App\Models\User;

class DomainPolicy
{
    public function view(User $user, Domain $domain): bool
    {
        return $user->membershipFor($domain->workspace_id) !== null;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Domain $domain): bool
    {
        return in_array($user->roleIn($domain->workspace_id), ['owner', 'admin'], true);
    }

    public function delete(User $user, Domain $domain): bool
    {
        return $this->update($user, $domain);
    }
}
