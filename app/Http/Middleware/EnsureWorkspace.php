<?php

namespace App\Http\Middleware;

use App\Models\Workspace;
use App\Models\WorkspaceUser;
use App\Support\CurrentWorkspace;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureWorkspace
{
    public function __construct(private readonly CurrentWorkspace $currentWorkspace) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        $requestedId = $request->header('X-Workspace-Id');

        if ($requestedId !== null && $requestedId !== '') {
            $membership = WorkspaceUser::query()
                ->where('user_id', $user->id)
                ->where('workspace_id', $requestedId)
                ->first();

            if (! $membership) {
                abort(403, 'You do not belong to this workspace.');
            }

            $workspace = Workspace::query()->findOrFail($membership->workspace_id);
        } else {
            $workspaceId = $user->current_workspace_id;
            if (! $workspaceId) {
                abort(422, 'X-Workspace-Id header is required.');
            }

            $membership = WorkspaceUser::query()
                ->where('user_id', $user->id)
                ->where('workspace_id', $workspaceId)
                ->first();

            if (! $membership) {
                abort(403, 'You do not belong to this workspace.');
            }

            $workspace = Workspace::query()->findOrFail($workspaceId);
        }

        $this->currentWorkspace->set($workspace, $membership);
        $request->attributes->set('workspace', $workspace);

        return $next($request);
    }
}
