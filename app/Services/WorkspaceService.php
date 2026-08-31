<?php

namespace App\Services;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Models\WorkspaceUser;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;

class WorkspaceService
{
    public function __construct(
        private readonly PlanLimitService $limits,
        private readonly SubscriptionService $subscriptions,
        private readonly AuditService $audit,
    ) {}

    public function createPersonal(User $user, ?string $name = null): Workspace
    {
        $name ??= $user->name."'s Workspace";

        $workspace = Workspace::query()->create([
            'name' => $name,
            'slug' => $this->uniqueSlug(Str::slug($name) ?: 'workspace'),
            'owner_id' => $user->id,
            'status' => 'active',
            'branding_removed' => false,
        ]);

        WorkspaceUser::query()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => 'owner',
        ]);

        $this->subscriptions->assignFreePlan($workspace);

        $user->forceFill(['current_workspace_id' => $workspace->id])->save();

        $this->audit->log('workspace.created', $workspace, [], $workspace, $user);

        return $workspace->fresh(['subscription.plan']);
    }

    public function create(User $user, string $name): Workspace
    {
        return $this->createPersonal($user, $name);
    }

    public function switch(User $user, Workspace $workspace): User
    {
        if (! $user->membershipFor($workspace->id)) {
            abort(403, 'You do not belong to this workspace.');
        }

        $user->forceFill(['current_workspace_id' => $workspace->id])->save();

        return $user;
    }

    /**
     * @param  array{email: string, role: string}  $data
     */
    public function invite(Workspace $workspace, User $inviter, array $data): WorkspaceInvitation
    {
        $this->limits->assertTeamSeat($workspace);

        $invitation = WorkspaceInvitation::query()->create([
            'workspace_id' => $workspace->id,
            'email' => strtolower($data['email']),
            'role' => $data['role'],
            'token' => Str::random(48),
            'invited_by' => $inviter->id,
            'expires_at' => now()->addDays(7),
        ]);

        $this->audit->log('user.invited', $invitation, [
            'email' => $invitation->email,
            'role' => $invitation->role,
        ], $workspace, $inviter);

        return $invitation;
    }

    public function acceptInvitation(User $user, string $token): Workspace
    {
        $invitation = WorkspaceInvitation::query()->where('token', $token)->firstOrFail();

        if ($invitation->accepted_at || $invitation->expires_at->isPast()) {
            throw new HttpException(422, 'Invitation is no longer valid.');
        }

        if (strcasecmp($invitation->email, $user->email) !== 0) {
            throw new HttpException(403, 'This invitation was sent to a different email.');
        }

        $this->limits->assertOrFail($invitation->workspace, 'team_members');

        WorkspaceUser::query()->updateOrCreate(
            ['workspace_id' => $invitation->workspace_id, 'user_id' => $user->id],
            ['role' => $invitation->role],
        );

        $invitation->update(['accepted_at' => now()]);

        $user->forceFill(['current_workspace_id' => $invitation->workspace_id])->save();

        $this->audit->log('invitation.accepted', $user, [
            'email' => $user->email,
            'role' => $invitation->role,
        ], $invitation->workspace, $user);

        return $invitation->workspace;
    }

    public function updateMemberRole(Workspace $workspace, User $member, string $role): WorkspaceUser
    {
        $membership = WorkspaceUser::query()
            ->where('workspace_id', $workspace->id)
            ->where('user_id', $member->id)
            ->firstOrFail();

        if ($membership->role === 'owner') {
            throw new HttpException(422, 'Cannot change the owner role. Transfer ownership instead.');
        }

        $previous = $membership->role;
        $membership->update(['role' => $role]);

        $this->audit->log('user.role_changed', $member, [
            'email' => $member->email,
            'from' => $previous,
            'to' => $role,
        ], $workspace);

        return $membership;
    }

    public function removeMember(Workspace $workspace, User $member): void
    {
        $membership = WorkspaceUser::query()
            ->where('workspace_id', $workspace->id)
            ->where('user_id', $member->id)
            ->firstOrFail();

        if ($membership->role === 'owner') {
            throw new HttpException(422, 'Cannot remove the workspace owner.');
        }

        $membership->delete();

        $this->audit->log('user.removed', $member, ['email' => $member->email], $workspace);
    }

    public function transfer(Workspace $workspace, User $newOwner): void
    {
        $membership = $workspace->memberships()->where('user_id', $newOwner->id)->firstOrFail();

        $workspace->memberships()->where('role', 'owner')->update(['role' => 'admin']);
        $membership->update(['role' => 'owner']);
        $workspace->update(['owner_id' => $newOwner->id]);

        $this->audit->log('ownership.transferred', $newOwner, ['email' => $newOwner->email], $workspace);
    }

    private function uniqueSlug(string $base): string
    {
        $slug = $base;
        $i = 1;
        while (Workspace::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
