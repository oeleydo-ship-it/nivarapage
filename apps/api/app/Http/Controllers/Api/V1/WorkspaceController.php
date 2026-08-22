<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Resources\WorkspaceResource;
use App\Models\User;
use App\Models\Workspace;
use App\Services\WorkspaceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkspaceController extends Controller
{
    public function index(Request $request)
    {
        return WorkspaceResource::collection($request->user()->workspaces);
    }

    public function store(Request $request, WorkspaceService $service)
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255']]);
        $workspace = $service->create($request->user(), $data['name']);

        return (new WorkspaceResource($workspace))->response()->setStatusCode(201);
    }

    public function switch(Request $request, Workspace $workspace, WorkspaceService $service)
    {
        $this->authorize('view', $workspace);
        $service->switch($request->user(), $workspace);

        return response()->json(['data' => ['current_workspace_id' => $workspace->id]]);
    }

    public function update(Request $request, Workspace $workspace)
    {
        $this->authorize('update', $workspace);
        $data = $request->validate(['name' => ['required', 'string', 'max:255']]);
        $workspace->update(['name' => $data['name']]);

        return new WorkspaceResource($workspace->fresh());
    }

    public function members(Workspace $workspace)
    {
        $this->authorize('view', $workspace);

        return UserResource::collection($workspace->members()->orderBy('users.id')->get());
    }

    public function invitations(Workspace $workspace)
    {
        $this->authorize('manageMembers', $workspace);

        return response()->json([
            'data' => $workspace->invitations()
                ->whereNull('accepted_at')
                ->latest()
                ->get()
                ->map(fn ($invitation) => [
                    'id' => $invitation->id,
                    'email' => $invitation->email,
                    'role' => $invitation->role,
                    'expires_at' => $invitation->expires_at,
                    'created_at' => $invitation->created_at,
                ]),
        ]);
    }

    public function invite(Request $request, Workspace $workspace, WorkspaceService $service)
    {
        $this->authorize('invite', $workspace);
        $data = $request->validate([
            'email' => ['required', 'email'],
            'role' => ['required', 'in:admin,designer,editor,viewer'],
        ]);

        $invitation = $service->invite($workspace, $request->user(), $data);

        return response()->json(['data' => [
            'id' => $invitation->id,
            'email' => $invitation->email,
            'role' => $invitation->role,
            'token' => $invitation->token,
            'expires_at' => $invitation->expires_at,
        ]], 201);
    }

    public function acceptInvitation(Request $request, string $token, WorkspaceService $service)
    {
        $workspace = $service->acceptInvitation($request->user(), $token);

        return new WorkspaceResource($workspace);
    }

    public function updateMember(Request $request, Workspace $workspace, User $user, WorkspaceService $service)
    {
        $this->authorize('manageMembers', $workspace);
        $data = $request->validate(['role' => ['required', 'in:admin,designer,editor,viewer']]);
        $membership = $service->updateMemberRole($workspace, $user, $data['role']);

        return response()->json(['data' => $membership]);
    }

    public function removeMember(Workspace $workspace, User $user, WorkspaceService $service): JsonResponse
    {
        $this->authorize('manageMembers', $workspace);
        $service->removeMember($workspace, $user);

        return response()->json(['data' => ['ok' => true]]);
    }

    public function transfer(Request $request, Workspace $workspace, WorkspaceService $service)
    {
        $this->authorize('transfer', $workspace);
        $data = $request->validate(['user_id' => ['required', 'exists:users,id']]);
        $service->transfer($workspace, User::query()->findOrFail($data['user_id']));

        return new WorkspaceResource($workspace->fresh());
    }
}
