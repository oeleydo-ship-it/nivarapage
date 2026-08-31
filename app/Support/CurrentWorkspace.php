<?php

namespace App\Support;

use App\Models\Workspace;
use App\Models\WorkspaceUser;

class CurrentWorkspace
{
    public ?Workspace $workspace = null;

    public ?WorkspaceUser $membership = null;

    public function id(): ?int
    {
        return $this->workspace?->id;
    }

    public function role(): ?string
    {
        return $this->membership?->role;
    }

    public function set(Workspace $workspace, WorkspaceUser $membership): void
    {
        $this->workspace = $workspace;
        $this->membership = $membership;
    }
}
