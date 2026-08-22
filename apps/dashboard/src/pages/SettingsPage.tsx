import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { getWorkspaceId, setSession, getToken } from '../lib/api'
import { authApi } from '../lib/auth'
import { billingApi, workspacesApi } from '../lib/endpoints'
import { Badge, Button, Card, Input, Label, PageHeader } from '../ui/primitives'

export function SettingsPage() {
  const qc = useQueryClient()
  const workspaceId = Number(getWorkspaceId())
  const [name, setName] = useState('')
  const [newWorkspace, setNewWorkspace] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const me = useQuery({ queryKey: ['me'], queryFn: authApi.user })
  const workspaces = useQuery({ queryKey: ['workspaces'], queryFn: workspacesApi.list })
  const subscription = useQuery({ queryKey: ['subscription'], queryFn: billingApi.subscription })

  const current = (workspaces.data || []).find((workspace) => workspace.id === workspaceId)

  useEffect(() => {
    if (current?.name && !name) setName(current.name)
  }, [current?.name, name])

  const rename = useMutation({
    mutationFn: () => workspacesApi.rename(workspaceId, name),
    onSuccess: () => {
      setError(null)
      setNotice('Workspace name updated.')
      qc.invalidateQueries({ queryKey: ['workspaces'] })
    },
    onError: (err: Error) => setError(err.message),
  })

  const create = useMutation({
    mutationFn: () => workspacesApi.create(newWorkspace),
    onSuccess: async (workspace) => {
      await workspacesApi.switch(workspace.id)
      setSession(getToken()!, workspace.id)
      window.location.assign('/')
    },
    onError: (err: Error) => setError(err.message),
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Workspace identity, your account, and plan details." />

      {error ? <div className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">{error}</div> : null}
      {notice ? (
        <div className="rounded-lg border border-emerald-900 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">{notice}</div>
      ) : null}

      <Card className="max-w-xl space-y-3">
        <h2 className="font-medium text-white">Workspace</h2>
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Slug</Label>
          <Input value={current?.slug ?? ''} disabled />
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          Your role: <Badge tone="info">{current?.role ?? '—'}</Badge>
        </div>
        <Button disabled={!name || name === current?.name || rename.isPending} onClick={() => rename.mutate()}>
          Save changes
        </Button>
      </Card>

      <Card className="max-w-xl space-y-3">
        <h2 className="font-medium text-white">Create a workspace</h2>
        <p className="text-sm text-zinc-500">Separate clients or projects with their own sites, team, and plan.</p>
        <Input placeholder="Acme Agency" value={newWorkspace} onChange={(e) => setNewWorkspace(e.target.value)} />
        <Button variant="outline" disabled={!newWorkspace || create.isPending} onClick={() => create.mutate()}>
          Create and switch
        </Button>
      </Card>

      <Card className="max-w-xl space-y-2">
        <h2 className="font-medium text-white">Account</h2>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Name</span>
          <span className="text-zinc-200">{me.data?.name ?? '—'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Email</span>
          <span className="text-zinc-200">{me.data?.email ?? '—'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Email verified</span>
          <span>{me.data?.email_verified ? <Badge tone="success">verified</Badge> : <Badge tone="warning">pending</Badge>}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Plan</span>
          <span className="text-zinc-200">{subscription.data?.plan?.name ?? '—'}</span>
        </div>
      </Card>
    </div>
  )
}
