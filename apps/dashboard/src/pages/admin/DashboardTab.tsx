import { useQuery } from '@tanstack/react-query'
import { Globe, LayoutDashboard, Search, Users } from 'lucide-react'
import { useState } from 'react'
import { adminApi, type DomainLookup } from '../../lib/endpoints'
import { Badge, Button, Card, Input } from '../../ui/primitives'

export function DashboardTab() {
  const [hostname, setHostname] = useState('')
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [lookup, setLookup] = useState<DomainLookup | null>(null)
  const stats = useQuery({ queryKey: ['admin-stats'], queryFn: adminApi.stats })

  async function runLookup() {
    setLookupError(null)
    setLookup(null)
    try {
      setLookup(await adminApi.lookupDomain(hostname))
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Lookup failed')
    }
  }

  const statCards: Array<{ key: 'workspaces' | 'users' | 'sites' | 'domains'; label: string; icon: typeof LayoutDashboard }> = [
    { key: 'workspaces', label: 'Workspaces', icon: LayoutDashboard },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'sites', label: 'Websites', icon: Globe },
    { key: 'domains', label: 'Domains', icon: Globe },
  ]

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.key}>
            <div className="mb-3 text-zinc-500">
              <card.icon size={18} />
            </div>
            <div className="text-2xl font-semibold text-white">{stats.data?.[card.key] ?? '—'}</div>
            <div className="mt-1 text-sm text-zinc-400">{card.label}</div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Templates', stats.data?.templates],
          ['Forms', stats.data?.forms],
          ['Pending jobs', stats.data?.pending_jobs],
          ['Failed jobs', stats.data?.failed_jobs],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <div className="text-2xl font-semibold text-white">{value ?? '—'}</div>
            <div className="mt-1 text-sm text-zinc-400">{label}</div>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="mb-3 font-medium text-white">Stripe connection</h2>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          {[
            ['Secret key', stats.data?.stripe?.configured ? 'configured' : 'missing'],
            ['Publishable key', stats.data?.stripe?.publishable_key ? 'set' : 'missing'],
            ['Webhook secret', stats.data?.stripe?.webhook_configured ? 'configured' : 'missing'],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-zinc-500">{label}</dt>
              <dd className="mt-1">
                <Badge tone={value === 'missing' ? 'warning' : 'success'}>{value}</Badge>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-zinc-500">
          Manage keys under Admin → Payments. Empty secrets keep local plan swaps for demos and tests.
        </p>
      </Card>
      <Card>
        <h2 className="mb-3 font-medium text-white">Domain lookup</h2>
        <p className="mb-3 text-sm text-zinc-500">hostname → site → workspace → owner</p>
        <div className="flex gap-2">
          <Input
            placeholder="www.customer-domain.com"
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void runLookup()
            }}
          />
          <Button variant="outline" onClick={() => void runLookup()}>
            <Search size={14} />
            Lookup
          </Button>
        </div>
        {lookupError ? <p className="mt-3 text-sm text-red-400">{lookupError}</p> : null}
        {lookup ? <DomainLookupResult lookup={lookup} /> : null}
      </Card>
    </>
  )
}

export function DomainLookupResult({ lookup }: { lookup: DomainLookup }) {
  return (
    <div className="mt-4 space-y-4">
      <ol className="grid gap-2 text-sm sm:grid-cols-4">
        {[
          ['Hostname', lookup.hostname],
          ['Site', lookup.site?.name ?? `site #${lookup.site_id}`],
          ['Workspace', lookup.workspace?.name ?? '—'],
          ['Owner', lookup.owner ? `${lookup.owner.name} (${lookup.owner.email})` : '—'],
        ].map(([label, value], index) => (
          <li key={label} className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              {index + 1}. {label}
            </div>
            <div className="mt-1 text-zinc-200">{value}</div>
          </li>
        ))}
      </ol>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
        {[
          ['Hostname', lookup.hostname],
          ['Site ID', lookup.site_id],
          ['Type', lookup.type],
          ['Status', lookup.status],
          ['SSL', lookup.ssl_status ?? '—'],
          ['Provider', lookup.provider ?? '—'],
          ['Primary', lookup.is_primary ? 'yes' : 'no'],
          ['Verification', lookup.verification_status ?? '—'],
          ['Workspace status', lookup.workspace?.status ?? '—'],
        ].map(([label, value]) => (
          <div key={String(label)}>
            <dt className="text-zinc-500">{label}</dt>
            <dd className="text-zinc-200">{String(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
