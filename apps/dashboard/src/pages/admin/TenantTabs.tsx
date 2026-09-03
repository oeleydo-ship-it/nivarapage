import type { Domain, Site, User, Workspace } from '@uidesired/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { getToken, getWorkspaceId, setImpersonation } from '../../lib/api'
import { persistAuth } from '../../lib/auth'
import { adminApi } from '../../lib/endpoints'
import { Badge, Button, Card, DataTable } from '../../ui/primitives'
import { AdminSearch, statusTone } from './shared'

export function UsersTab() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const users = useQuery({ queryKey: ['admin-users', query], queryFn: () => adminApi.users({ q: query || undefined }) })

  const refresh = () => qc.invalidateQueries({ queryKey: ['admin-users'] })

  const block = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => adminApi.blockUser(id, reason),
    onSuccess: refresh,
  })
  const unblock = useMutation({
    mutationFn: (id: number) => adminApi.unblockUser(id),
    onSuccess: refresh,
  })
  const remove = useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: refresh,
  })
  const impersonate = useMutation({
    mutationFn: (id: number) => adminApi.impersonateUser(id),
    onSuccess: (payload) => {
      const adminToken = getToken()
      if (!adminToken || !payload.impersonation) return
      setImpersonation({
        adminToken,
        adminWorkspaceId: getWorkspaceId(),
        adminName: payload.impersonation.admin_name,
        adminEmail: payload.impersonation.admin_email,
        targetName: payload.impersonation.target_name,
        targetEmail: payload.impersonation.target_email,
      })
      persistAuth(payload)
      window.location.assign('/')
    },
  })

  const busy = block.isPending || unblock.isPending || remove.isPending || impersonate.isPending
  const actionError =
    (block.error || unblock.error || remove.error || impersonate.error) instanceof Error
      ? ((block.error || unblock.error || remove.error || impersonate.error) as Error).message
      : null

  return (
    <Card>
      <AdminSearch value={search} onChange={setSearch} onSubmit={() => setQuery(search)} placeholder="Search users by name or email…" />
      {actionError ? <p className="mb-3 text-sm text-red-400">{actionError}</p> : null}
      <DataTable headers={['ID', 'Name', 'Email', 'Subscription', 'Status', 'Super admin', 'Joined', 'Actions']}>
        {(users.data?.data || []).map((user: User) => {
          const plan = user.subscription?.plan_name
          const subStatus = user.subscription?.status
          return (
            <tr key={user.id}>
              <td className="py-3 pr-4 text-zinc-500">{user.id}</td>
              <td className="py-3 pr-4 text-zinc-200">{user.name}</td>
              <td className="py-3 pr-4 text-zinc-400">{user.email}</td>
              <td className="py-3 pr-4">
                {plan ? (
                  <div>
                    <div className="text-zinc-200">{plan}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                      {subStatus ? <Badge tone={statusTone(subStatus)}>{subStatus}</Badge> : null}
                      {user.subscription?.workspace_name ? <span>{user.subscription.workspace_name}</span> : null}
                    </div>
                  </div>
                ) : (
                  <span className="text-zinc-600">—</span>
                )}
              </td>
              <td className="py-3 pr-4">
                {user.is_blocked ? <Badge tone="danger">blocked</Badge> : <Badge tone="success">active</Badge>}
              </td>
              <td className="py-3 pr-4 text-zinc-400">{user.is_super_admin ? 'yes' : 'no'}</td>
              <td className="py-3 pr-4 text-zinc-500">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</td>
              <td className="py-3 pr-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    disabled={busy || Boolean(user.is_super_admin) || Boolean(user.is_blocked)}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Impersonate ${user.name} for support?\nYou will browse the app as this user. Exit from the yellow banner anytime.`,
                        )
                      ) {
                        impersonate.mutate(user.id)
                      }
                    }}
                  >
                    Impersonate
                  </Button>
                  {user.is_blocked ? (
                    <Button
                      variant="outline"
                      disabled={busy || Boolean(user.is_super_admin)}
                      onClick={() => unblock.mutate(user.id)}
                    >
                      Unblock
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      disabled={busy || Boolean(user.is_super_admin)}
                      onClick={() => {
                        const reason = window.prompt(`Block ${user.name}? Optional reason:`, 'Support review')
                        if (reason === null) return
                        block.mutate({ id: user.id, reason: reason.trim() || undefined })
                      }}
                    >
                      Block
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    disabled={busy || Boolean(user.is_super_admin)}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Permanently delete ${user.name} (${user.email})?\nThis fails if they still own workspaces — block them instead in that case.`,
                        )
                      ) {
                        remove.mutate(user.id)
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          )
        })}
      </DataTable>
    </Card>
  )
}

export function WorkspacesTab() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const workspaces = useQuery({
    queryKey: ['admin-workspaces', query],
    queryFn: () => adminApi.workspaces({ q: query || undefined }),
  })
  const suspendWorkspace = useMutation({
    mutationFn: (id: number) => adminApi.suspendWorkspace(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-workspaces'] }),
  })

  return (
    <Card>
      <AdminSearch value={search} onChange={setSearch} onSubmit={() => setQuery(search)} placeholder="Search workspaces by name or slug…" />
      <DataTable headers={['ID', 'Name', 'Slug', 'Plan', 'Billing', 'Status', 'Actions']}>
        {(workspaces.data?.data || []).map((workspace: Workspace) => (
          <tr key={workspace.id}>
            <td className="py-3 pr-4 text-zinc-500">{workspace.id}</td>
            <td className="py-3 pr-4 text-zinc-200">{workspace.name}</td>
            <td className="py-3 pr-4 text-zinc-400">{workspace.slug}</td>
            <td className="py-3 pr-4 text-zinc-200">{workspace.plan?.name ?? '—'}</td>
            <td className="py-3 pr-4">
              <Badge tone={statusTone(workspace.subscription_status ?? undefined)}>{workspace.subscription_status ?? '—'}</Badge>
            </td>
            <td className="py-3 pr-4">
              <Badge tone={statusTone(workspace.status)}>{workspace.status ?? '—'}</Badge>
            </td>
            <td className="py-3 pr-4">
              <Button
                variant="danger"
                disabled={workspace.status === 'suspended'}
                onClick={() => {
                  if (window.confirm(`Suspend workspace ${workspace.name}?`)) suspendWorkspace.mutate(workspace.id)
                }}
              >
                Suspend
              </Button>
            </td>
          </tr>
        ))}
      </DataTable>
    </Card>
  )
}

export function SitesTab() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const sites = useQuery({
    queryKey: ['admin-sites', query],
    queryFn: () => adminApi.sites({ q: query || undefined }),
  })
  const suspendSite = useMutation({
    mutationFn: (id: number) => adminApi.suspendSite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-sites'] }),
  })

  return (
    <Card>
      <AdminSearch
        value={search}
        onChange={setSearch}
        onSubmit={() => setQuery(search)}
        placeholder="Search websites by name, slug, or hostname…"
      />
      <DataTable headers={['ID', 'Name', 'Workspace', 'Status', 'Primary domain', 'Actions']}>
        {(sites.data?.data || []).map((site: Site) => (
          <tr key={site.id}>
            <td className="py-3 pr-4 text-zinc-500">{site.id}</td>
            <td className="py-3 pr-4 text-zinc-200">{site.name}</td>
            <td className="py-3 pr-4 text-zinc-400">{site.workspace_id}</td>
            <td className="py-3 pr-4">
              <Badge tone={statusTone(site.status)}>{site.status}</Badge>
            </td>
            <td className="py-3 pr-4 text-zinc-400">
              {(site.domains || []).find((domain) => domain.is_primary)?.hostname ?? site.domains?.[0]?.hostname ?? '—'}
            </td>
            <td className="py-3 pr-4">
              <Button
                variant="danger"
                disabled={site.status === 'disabled'}
                onClick={() => {
                  if (window.confirm(`Suspend site ${site.name}?`)) suspendSite.mutate(site.id)
                }}
              >
                Suspend
              </Button>
            </td>
          </tr>
        ))}
      </DataTable>
    </Card>
  )
}

export function DomainsTab() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const domains = useQuery({
    queryKey: ['admin-domains', query],
    queryFn: () => adminApi.domains({ q: query || undefined }),
  })

  const remove = useMutation({
    mutationFn: (id: number) => adminApi.deleteDomain(id),
    onSuccess: () => {
      setError(null)
      void qc.invalidateQueries({ queryKey: ['admin-domains'] })
    },
    onError: (err: Error) => setError(err.message),
  })

  return (
    <Card>
      <AdminSearch value={search} onChange={setSearch} onSubmit={() => setQuery(search)} placeholder="Search hostname…" />
      {error ? <p className="mb-3 text-xs text-red-400">{error}</p> : null}
      <DataTable headers={['ID', 'Hostname', 'Site', 'Type', 'Status', 'SSL', 'Primary', '']}>
        {(domains.data?.data || []).map((domain: Domain) => (
          <tr key={domain.id}>
            <td className="py-3 pr-4 text-zinc-500">{domain.id}</td>
            <td className="py-3 pr-4 text-zinc-200">{domain.hostname}</td>
            <td className="py-3 pr-4 text-zinc-400">{domain.site_id}</td>
            <td className="py-3 pr-4 text-zinc-400">{domain.type}</td>
            <td className="py-3 pr-4">
              <Badge tone={statusTone(domain.status)}>{domain.status}</Badge>
            </td>
            <td className="py-3 pr-4 text-zinc-400">{domain.ssl_status ?? '—'}</td>
            <td className="py-3 pr-4 text-zinc-400">{domain.is_primary ? 'yes' : 'no'}</td>
            <td className="py-3 text-right">
              <button
                type="button"
                title="Remove this domain from the platform"
                className="p-1 text-zinc-500 hover:text-red-400 disabled:opacity-40"
                disabled={remove.isPending}
                onClick={() => {
                  // Irreversible and it takes a live site off its hostname, so
                  // the name has to be typed rather than clicked past.
                  const typed = window.prompt(
                    `Remove ${domain.hostname} from the platform? This frees the name so it can be connected again. Type the hostname to confirm.`,
                  )
                  if (typed?.trim().toLowerCase() === domain.hostname.toLowerCase()) remove.mutate(domain.id)
                }}
              >
                <Trash2 size={14} />
              </button>
            </td>
          </tr>
        ))}
      </DataTable>
    </Card>
  )
}
