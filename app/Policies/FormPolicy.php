<?php

namespace App\Policies;

use App\Models\Form;
use App\Models\User;

class FormPolicy
{
    public function view(User $user, Form $form): bool
    {
        return $user->membershipFor($form->workspace_id) !== null;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Form $form): bool
    {
        return in_array($user->roleIn($form->workspace_id), ['owner', 'admin', 'designer'], true);
    }

    public function delete(User $user, Form $form): bool
    {
        return $this->update($user, $form);
    }

    public function viewSubmissions(User $user, Form $form): bool
    {
        return in_array($user->roleIn($form->workspace_id), ['owner', 'admin', 'designer', 'editor'], true);
    }
}
