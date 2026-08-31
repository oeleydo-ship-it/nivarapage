<?php

namespace App\Policies;

use App\Models\BlogPost;
use App\Models\User;
use App\Support\CurrentWorkspace;

class BlogPostPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->workspaces()->exists();
    }

    public function view(User $user, BlogPost $blogPost): bool
    {
        return $user->membershipFor($blogPost->workspace_id) !== null;
    }

    public function create(User $user): bool
    {
        $role = app(CurrentWorkspace::class)->role();

        return in_array($role, ['owner', 'admin', 'designer', 'editor'], true);
    }

    public function update(User $user, BlogPost $blogPost): bool
    {
        return in_array($user->roleIn($blogPost->workspace_id), ['owner', 'admin', 'designer', 'editor'], true);
    }

    public function delete(User $user, BlogPost $blogPost): bool
    {
        return in_array($user->roleIn($blogPost->workspace_id), ['owner', 'admin', 'designer'], true);
    }
}
