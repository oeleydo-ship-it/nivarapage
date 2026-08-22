<?php

namespace App\Policies;

use App\Models\Page;
use App\Models\User;

class PagePolicy
{
    public function view(User $user, Page $page): bool
    {
        return $user->membershipFor($page->site->workspace_id) !== null;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Page $page): bool
    {
        return in_array($user->roleIn($page->site->workspace_id), ['owner', 'admin', 'designer', 'editor'], true);
    }

    public function delete(User $user, Page $page): bool
    {
        return in_array($user->roleIn($page->site->workspace_id), ['owner', 'admin', 'designer'], true);
    }

    public function publish(User $user, Page $page): bool
    {
        return in_array($user->roleIn($page->site->workspace_id), ['owner', 'admin', 'designer'], true);
    }
}
