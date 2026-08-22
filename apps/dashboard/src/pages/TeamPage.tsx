import type { WorkspaceMember } from '@uidesired/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Crown, Mail, Trash2, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { getWorkspaceId } from '../lib/api'
import { authApi } from '../lib/auth'
import { workspacesApi } from '../lib/endpoints'
import { atCap, useSubscription } from '../lib/plan'
import { Badge, Button, Card, DataTable, EmptyState, Input, Label, PageHeader, Select } from '../ui/primitives'

const ASSIGNABLE_ROLES = ['admin', 'designer', 'editor', 'viewer'] as const

const ROLE_HELP: Record<string, string> = {
  owner: 'Full access, billing, and ownership transfer',
  admin: 'Manage sites, team, and settings',
  designer: 'Build and publish sites and themes',
  editor: 'Edit content on existing pages',
  viewer: 'Read-only access',
}

export function TeamPage() {
  const workspaceId = Number(getWorkspaceId())
  const qc = useQueryClient()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string>('editor')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const me = useQuery({ queryKey: ['me'], queryFn: authApi.user })
  const sub = useSubscription()
  const teamCapped = atCap(sub.data?.usage?.team_members)
  const members = useQuery({
    queryKey: ['members', workspaceId],
    queryFn: () => workspacesApi.members(workspaceId),
    enabled: Boolean(workspaceId),
  })
  const invitations = useQuery({
    queryKey: ['invitations', workspaceId],
    queryFn: () => workspacesApi.invitations(workspaceId),
    enabled: Boolean(workspaceId),
  })

  const currentUserId = me.data?.id
  const myRole = (members.data || []).find((member) => member.id === currentUserId)?.role
  const canManage = myRole === 'owner' || myRole === 'admin'

  function refresh() {
    qc.invalidateQueries({ queryKey: ['members', workspaceId] })
    qc.invalidateQueries({ queryKey: ['invitations', workspaceId] })
    qc.invalidateQueries({ queryKey: ['subscription'] })
  }

  function handle<T>(promise: Promise<T>, message?: string) {
    setError(null)
    setNotice(null)
    return promise
      .then((result) => {
        if (message) setNotice(message)
        refresh()
        return result
      })
      .catch((err: Error) => {
        setError(err.message)
        throw err
      })
  }

  const invite = useMutation({
    mutationFn: () => handle(workspacesApi.invite(workspaceId, { email, role }), `Invitation sent to ${email}.`),
    onSuccess: () => setEmail(''),
    onError: () => undefined,
  })

  const updateRole = useMutation({
    mutationFn: (vars: { userId: number; role: string }) =>
      handle(workspacesApi.updateMember(workspaceId, vars.userId, vars.role), 'Role updated.'),
    onError: () => undefined,
  })

  const removeMember = useMutation({
    mutationFn: (userId: number) => handle(workspacesApi.removeMember(workspaceId, userId), 'Member removed.'),
    onError: () => undefined,
  })

  const transfer = useMutation({
    mutationFn: (userId: number) => handle(workspacesApi.transfer(workspaceId, userId), 'Ownership transferred.'),
    onError: () => undefined,
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Team" description="Invite teammates and control what each of them can do in this workspace." />

      {error ? <div className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">{error}</div> : null}
      {notice ? (
        <div className="rounded-lg border border-emerald-900 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">{notice}</div>
      ) : null}

      <Card>
        <h2 className="mb-4 font-medium text-white">Invite a teammate</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label>Email address</Label>
            <Input
              type="email"
              placeholder="teammate@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!canManage}
            />
          </div>
          <div className="sm:w-48">
            <Label>Role</Label>
            <Select className="w-full" value={role} onChange={(e) => setRole(e.target.value)} disabled={!canManage}>
              {ASSIGNABLE_ROLES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
          <Button
            disabled={!canManage || !email || invite.isPending || teamCapped}
            title={teamCapped ? 'Upgrade to invite more teammates' : undefined}
            onClick={() => invite.mutate()}
          >
            <UserPlus size={14} />
            Send invite
          </Button>
        </div>
        <p className="mt-3 text-xs text-zinc-500">{ROLE_HELP[role]}</p>
        {!canManage ? (
          <p className="mt-1 text-xs text-amber-400">Only owners and admins can manage team members.</p>
        ) : null}
      </Card>

      <Card>
        <h2 className="mb-4 font-medium text-white">Members</h2>
        {(members.data || []).length ? (
          <DataTable headers={['Name', 'Email', 'Role', 'Verified', 'Actions']}>
            {(members.data || []).map((member: WorkspaceMember) => (
              <tr key={member.id}>
                <td className="py-3 pr-4 text-zinc-200">
                  {member.name}
                  {member.id === currentUserId ? <span className="ml-2 text-xs text-zinc-500">you</span> : null}
                </td>
                <td className="py-3 pr-4 text-zinc-400">{member.email}</td>
                <td className="py-3 pr-4">
                  {member.role === 'owner' ? (
                    <Badge tone="info">owner</Badge>
                  ) : (
                    <Select
                      value={member.role ?? 'viewer'}
                      disabled={!canManage || updateRole.isPending}
                      onChange={(e) => updateRole.mutate({ userId: member.id, role: e.target.value })}
                    >
                      {ASSIGNABLE_ROLES.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  )}
                </td>
                <td className="py-3 pr-4">
                  {member.email_verified ? <Badge tone="success">verified</Badge> : <Badge tone="warning">pending</Badge>}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex gap-2">
                    {myRole === 'owner' && member.role !== 'owner' ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (window.confirm(`Transfer ownership of this workspace to ${member.name}?`)) transfer.mutate(member.id)
                        }}
                      >
                        <Crown size={14} />
                        Make owner
                      </Button>
                    ) : null}
                    {canManage && member.role !== 'owner' ? (
                      <Button
                        variant="danger"
                        onClick={() => {
                          if (window.confirm(`Remove ${member.name} from this workspace?`)) removeMember.mutate(member.id)
                        }}
                      >
                        <Trash2 size={14} />
                        Remove
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        ) : (
          <EmptyState title="No members yet" description="Invite a teammate to collaborate on your websites." />
        )}
      </Card>

      <Card>
        <h2 className="mb-4 font-medium text-white">Pending invitations</h2>
        {(invitations.data || []).length ? (
          <DataTable headers={['Email', 'Role', 'Expires']}>
            {(invitations.data || []).map((invitation) => (
              <tr key={invitation.id}>
                <td className="py-3 pr-4 text-zinc-200">
                  <span className="inline-flex items-center gap-2">
                    <Mail size={14} className="text-zinc-500" />
                    {invitation.email}
                  </span>
                </td>
                <td className="py-3 pr-4 text-zinc-400">{invitation.role}</td>
                <td className="py-3 pr-4 text-zinc-400">
                  {invitation.expires_at ? new Date(invitation.expires_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </DataTable>
        ) : (
          <EmptyState title="No pending invitations" />
        )}
      </Card>
    </div>
  )
}
