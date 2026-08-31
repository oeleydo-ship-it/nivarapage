import type { Activity } from '@uidesired/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { adminApi, type FailedJob } from '../../lib/endpoints'
import { Badge, Button, Card, DataTable, EmptyState, Input, Label } from '../../ui/primitives'
import { actionTone, formatTimestamp, metadataSummary } from '../ActivityPage'
import { BrandingPanel, MailPanel } from './BrandingMailPanels'
import { AdminSearch, unixTimestamp } from './shared'

export function FormsTab() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const forms = useQuery({
    queryKey: ['admin-forms', query],
    queryFn: () => adminApi.forms({ q: query || undefined }),
  })

  return (
    <Card>
      <AdminSearch value={search} onChange={setSearch} onSubmit={() => setQuery(search)} placeholder="Search forms, sites, or workspaces…" />
      <DataTable headers={['Form', 'Workspace', 'Website', 'Type', 'Submissions']}>
        {(forms.data?.data || []).map((form) => (
          <tr key={form.id}>
            <td className="py-3 pr-4 text-zinc-200">{form.name}</td>
            <td className="py-3 pr-4 text-zinc-400">{form.workspace?.name ?? form.workspace_id ?? '—'}</td>
            <td className="py-3 pr-4 text-zinc-400">{form.site?.name ?? form.site_id ?? '—'}</td>
            <td className="py-3 pr-4 text-zinc-400">{form.type ?? '—'}</td>
            <td className="py-3 pr-4 text-zinc-200">{form.submissions_count ?? 0}</td>
          </tr>
        ))}
      </DataTable>
    </Card>
  )
}

export function ActivityTab() {
  const [activitySearch, setActivitySearch] = useState('')
  const [activityQuery, setActivityQuery] = useState('')
  const activities = useQuery({
    queryKey: ['admin-activities', activityQuery],
    queryFn: () => adminApi.activities({ q: activityQuery || undefined }),
  })

  return (
    <Card>
      <AdminSearch
        value={activitySearch}
        onChange={setActivitySearch}
        onSubmit={() => setActivityQuery(activitySearch)}
        placeholder="Search all workspaces by actor, target, action, or IP…"
      />
      {((activities.data?.data || []) as Activity[]).length ? (
        <DataTable headers={['When', 'Workspace', 'Actor', 'Action', 'Target', 'IP', 'Details']}>
          {((activities.data?.data || []) as Activity[]).map((item) => (
            <tr key={item.id}>
              <td className="whitespace-nowrap py-3 pr-4 text-zinc-400">{formatTimestamp(item.timestamp)}</td>
              <td className="py-3 pr-4 text-zinc-400">{item.workspace?.name ?? '—'}</td>
              <td className="py-3 pr-4 text-zinc-200">{item.actor?.name ?? 'System'}</td>
              <td className="py-3 pr-4">
                <Badge tone={actionTone(item.action)}>{item.label ?? item.action}</Badge>
              </td>
              <td className="py-3 pr-4 text-zinc-300">{item.target?.name ?? '—'}</td>
              <td className="py-3 pr-4 text-zinc-500">{item.ip ?? '—'}</td>
              <td className="max-w-xs truncate py-3 pr-4 text-xs text-zinc-500">{metadataSummary(item.metadata)}</td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState title="No matching activity" description="Try a different search term." />
      )}
    </Card>
  )
}

export function JobsTab() {
  const qc = useQueryClient()
  const jobs = useQuery({ queryKey: ['admin-jobs'], queryFn: adminApi.jobs })

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-medium text-white">Pending jobs</h2>
        <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ['admin-jobs'] })}>
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>
      {(jobs.data?.pending || []).length ? (
        <DataTable headers={['ID', 'Name', 'Queue', 'Attempts', 'Available']}>
          {(jobs.data?.pending || []).map((job) => (
            <tr key={job.id}>
              <td className="py-3 pr-4 text-zinc-500">{job.id}</td>
              <td className="py-3 pr-4 text-zinc-200">{job.name ?? 'job'}</td>
              <td className="py-3 pr-4 text-zinc-400">{job.queue ?? '—'}</td>
              <td className="py-3 pr-4 text-zinc-400">{job.attempts ?? 0}</td>
              <td className="py-3 pr-4 text-zinc-500">{unixTimestamp(job.available_at)}</td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState title="No pending jobs" description="The queue is empty." />
      )}
      <p className="mt-4 text-xs text-zinc-500">{(jobs.data?.failed || []).length} failed jobs in the dead letter queue.</p>
    </Card>
  )
}

export function FailedJobsTab() {
  const qc = useQueryClient()
  const jobs = useQuery({ queryKey: ['admin-jobs'], queryFn: adminApi.jobs })
  const retry = useMutation({
    mutationFn: (id: number) => adminApi.retryFailedJob(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-jobs'] }),
  })

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-medium text-white">Failed jobs</h2>
        <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ['admin-jobs'] })}>
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>
      {(jobs.data?.failed || []).length ? (
        <DataTable headers={['ID', 'Queue', 'Failed at', 'Exception', 'Actions']}>
          {(jobs.data?.failed || []).map((job: FailedJob) => (
            <tr key={job.id}>
              <td className="py-3 pr-4 text-zinc-500">{job.id}</td>
              <td className="py-3 pr-4 text-zinc-400">{job.queue ?? '—'}</td>
              <td className="py-3 pr-4 text-zinc-400">{job.failed_at ? formatTimestamp(job.failed_at) : '—'}</td>
              <td className="max-w-md truncate py-3 pr-4 text-xs text-zinc-500" title={job.exception}>
                {(job.exception || '').split('\n')[0] || '—'}
              </td>
              <td className="py-3 pr-4">
                <Button variant="outline" disabled={retry.isPending} onClick={() => retry.mutate(job.id)}>
                  Retry
                </Button>
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState title="No failed jobs" description="The queue is healthy." />
      )}
      <p className="mt-4 text-xs text-zinc-500">{(jobs.data?.pending || []).length} jobs currently pending.</p>
    </Card>
  )
}

export function HealthTab() {
  const qc = useQueryClient()
  const health = useQuery({ queryKey: ['admin-health'], queryFn: adminApi.health })
  const ready = health.data?.ready?.status === 'ok'
  const live = health.data?.live?.status === 'ok'

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ['admin-health'] })}>
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="text-xs text-zinc-500">Live · /api/v1/health</div>
          <div className="mt-2">
            <Badge tone={live ? 'success' : 'danger'}>{health.data?.live?.status ?? '—'}</Badge>
          </div>
        </Card>
        <Card>
          <div className="text-xs text-zinc-500">Ready · /api/v1/health/ready</div>
          <div className="mt-2">
            <Badge tone={ready ? 'success' : 'danger'}>{health.data?.ready?.status ?? '—'}</Badge>
          </div>
        </Card>
        <Card>
          <div className="text-xs text-zinc-500">Pending jobs</div>
          <div className="mt-2 text-2xl font-semibold text-white">{health.data?.queue?.pending ?? '—'}</div>
        </Card>
        <Card>
          <div className="text-xs text-zinc-500">Failed jobs</div>
          <div className="mt-2 text-2xl font-semibold text-white">{health.data?.queue?.failed ?? '—'}</div>
        </Card>
      </div>
      <Card>
        <h2 className="mb-3 font-medium text-white">Readiness checks</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-zinc-500">Database</dt>
            <dd className="mt-1">
              <Badge tone={health.data?.ready?.checks?.database ? 'success' : 'danger'}>
                {health.data?.ready?.checks?.database ? 'ok' : 'down'}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Redis / cache</dt>
            <dd className="mt-1">
              <Badge tone={health.data?.ready?.checks?.redis ? 'success' : 'danger'}>
                {health.data?.ready?.checks?.redis ? 'ok' : 'down'}
              </Badge>
            </dd>
          </div>
        </dl>
      </Card>

      <RendererDiagnosticsCard />
    </div>
  )
}

/**
 * The renderer talks to the API over HTTP. When that call fails, visitors see a
 * generic "not found" page and there is nothing in the dashboard to explain it -
 * so this replays the renderer's own calls and reports which one broke.
 */
function RendererDiagnosticsCard() {
  const [host, setHost] = useState('')
  const [checked, setChecked] = useState('')

  const diagnostics = useQuery({
    queryKey: ['admin-diagnostics', checked],
    queryFn: () => adminApi.diagnostics(checked ? { host: checked } : undefined),
  })
  const hostInfo = useQuery({
    queryKey: ['admin-diagnostics-host', checked],
    queryFn: () => adminApi.diagnoseHost(checked),
    enabled: checked !== '',
  })

  const data = diagnostics.data

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-medium text-white">Renderer connection</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Runs the exact calls the renderer makes for a published page and a signed preview.
          </p>
        </div>
        {data ? <Badge tone={data.ok ? 'success' : 'danger'}>{data.ok ? 'healthy' : 'broken'}</Badge> : null}
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[240px] flex-1">
          <Label>Hostname to test (optional)</Label>
          <Input
            className="mt-1"
            placeholder="dager.sites.example.com"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setChecked(host.trim())
            }}
          />
        </div>
        <Button variant="outline" disabled={diagnostics.isFetching} onClick={() => setChecked(host.trim())}>
          {diagnostics.isFetching ? 'Checking…' : 'Run checks'}
        </Button>
      </div>

      {data ? (
        <>
          <div className="space-y-2">
            {data.checks.map((check) => (
              <div key={check.key} className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
                <Badge tone={check.ok ? 'success' : 'danger'}>{check.ok ? 'pass' : 'fail'}</Badge>
                <div className="min-w-0">
                  <div className="text-sm text-zinc-200">{check.label}</div>
                  <p className="text-xs text-zinc-500">{check.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <dl className="grid gap-3 text-xs sm:grid-cols-3">
            {[
              ['API_URL', data.api_url],
              ['RENDERER_URL', data.renderer_url],
              ['Platform domain', data.platform_domain],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-zinc-500">{label}</dt>
                <dd className="mt-1 break-all font-mono text-zinc-300">{value}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}

      {hostInfo.data ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-zinc-200">{hostInfo.data.host}</span>
            <Badge tone={hostInfo.data.resolves ? 'success' : 'warning'}>
              {hostInfo.data.resolves ? 'resolves' : 'not connected'}
            </Badge>
            {hostInfo.data.domain ? <Badge tone="neutral">{hostInfo.data.domain.status}</Badge> : null}
            {hostInfo.data.site ? <Badge tone="neutral">site #{hostInfo.data.site.id}</Badge> : null}
          </div>
          {hostInfo.data.notes.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-zinc-400">
              {hostInfo.data.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}
          {hostInfo.data.suggestions.length ? (
            <p className="mt-2 text-xs text-zinc-500">
              Similar active hostnames: {hostInfo.data.suggestions.join(', ')}
            </p>
          ) : null}
        </div>
      ) : null}
    </Card>
  )
}

export function SettingsTab() {
  const qc = useQueryClient()
  const settings = useQuery({ queryKey: ['admin-settings'], queryFn: adminApi.settings })
  const [platformName, setPlatformName] = useState('')
  const [platformTagline, setPlatformTagline] = useState('')
  const [supportEmail, setSupportEmail] = useState('')
  const [platformDomain, setPlatformDomain] = useState('')
  const [funnelsEnabled, setFunnelsEnabled] = useState(true)
  const [eventRetention, setEventRetention] = useState(90)
  const [sessionRetention, setSessionRetention] = useState(180)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!settings.data) return
    setPlatformName(settings.data.platform_name)
    setPlatformTagline(settings.data.platform_tagline)
    setSupportEmail(settings.data.support_email)
    setPlatformDomain(settings.data.platform_domain)
    setFunnelsEnabled(settings.data.funnels_enabled)
    setEventRetention(settings.data.funnel_events_retention_days)
    setSessionRetention(settings.data.funnel_sessions_retention_days)
  }, [settings.data])

  const save = useMutation({
    mutationFn: () => adminApi.updateSettings({ platform_name: platformName, platform_tagline: platformTagline, support_email: supportEmail, platform_domain: platformDomain, funnels_enabled: funnelsEnabled, funnel_events_retention_days: eventRetention, funnel_sessions_retention_days: sessionRetention }),
    onSuccess: () => {
      setNotice('Settings saved.')
      qc.invalidateQueries({ queryKey: ['admin-settings'] })
      qc.invalidateQueries({ queryKey: ['features'] })
      // The sidebar reads the public branding endpoint.
      qc.invalidateQueries({ queryKey: ['branding'] })
    },
  })

  return (
    <div className="space-y-4">
    <Card className="max-w-xl space-y-3">
      <h2 className="font-medium text-white">Platform</h2>
      <p className="text-sm text-zinc-500">Shown to operators. Secrets stay in environment variables.</p>
      {notice ? <p className="text-sm text-emerald-400">{notice}</p> : null}
      {save.isError ? <p className="text-sm text-red-400">{save.error instanceof Error ? save.error.message : 'Save failed'}</p> : null}
      <div>
        <Label>Platform name</Label>
        <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
      </div>
      <div>
        <Label>Tagline</Label>
        <Input value={platformTagline} onChange={(e) => setPlatformTagline(e.target.value)} placeholder="Website builder" />
      </div>
      <div>
        <Label>Support email</Label>
        <Input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
      </div>
      <div>
        <Label>Published sites domain</Label>
        <Input
          value={platformDomain}
          onChange={(e) => setPlatformDomain(e.target.value.toLowerCase().trim())}
          placeholder="sites.aidirectory.com"
        />
        <p className="mt-1.5 text-xs text-zinc-500">
          Tenant websites are created as <span className="font-mono text-zinc-400">subdomain.{platformDomain || 'sites.example.com'}</span>.
          No http://. DNS for this host and a wildcard must point at this server.
        </p>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <div>
          <div className="text-sm font-medium text-white">Funnels module</div>
          <div className="mt-1 text-xs text-zinc-500">Hide navigation and disable all dashboard, public, and tracking routes without deleting data.</div>
        </div>
        <button type="button" role="switch" aria-checked={funnelsEnabled} onClick={() => setFunnelsEnabled((value) => !value)} className={`relative h-7 w-12 rounded-full transition ${funnelsEnabled ? 'bg-blue-600' : 'bg-zinc-700'}`}>
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${funnelsEnabled ? 'left-6' : 'left-1'}`} />
        </button>
      </div>
      {funnelsEnabled ? <div className="grid grid-cols-2 gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4"><div><Label>Raw events retention (days)</Label><Input type="number" min={7} max={730} value={eventRetention} onChange={e=>setEventRetention(Number(e.target.value))}/></div><div><Label>Anonymous sessions retention (days)</Label><Input type="number" min={7} max={730} value={sessionRetention} onChange={e=>setSessionRetention(Number(e.target.value))}/></div></div>:null}
      <Button disabled={save.isPending || !platformName} onClick={() => save.mutate()}>
        Save settings
      </Button>
    </Card>
      <BrandingPanel />
      <MailPanel />
    </div>
  )
}
