<?php

namespace App\Policies;

use App\Models\Media;
use App\Models\User;

class MediaPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Media $media): bool
    {
        return $user->membershipFor($media->workspace_id) !== null;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Media $media): bool
    {
        return in_array($user->roleIn($media->workspace_id), ['owner', 'admin', 'designer', 'editor'], true);
    }

    public function delete(User $user, Media $media): bool
    {
        return in_array($user->roleIn($media->workspace_id), ['owner', 'admin', 'designer'], true);
    }
}
