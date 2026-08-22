import { useQuery } from '@tanstack/react-query'
import { Briefcase, Globe, CheckCircle2, Link2, Inbox, HardDrive, Newspaper } from 'lucide-react'
import { getWorkspaceId } from '../lib/api'
import { overviewApi } from '../lib/endpoints'
import { USAGE_LABELS, atCap } from '../lib/plan'
import { Button, Card, PageHeader } from '../ui/primitives'
import { Link } from 'react-router-dom'

function metric(value: number | undefined, loaded: boolean): string | number {
  if (!loaded) return '—'
  return value ?? 0
}

export function OverviewPage() {
  const workspaceId = getWorkspaceId()
  const query = useQuery({
    queryKey: ['overview', workspaceId],
    queryFn: overviewApi.get,
    enabled: Boolean(workspaceId),
    refetchOnWindowFocus: true,
  })
  const data = query.data
  const loaded = Boolean(data)
  const cards = [
    { label: 'Total Websites', value: metric(data?.total_websites, loaded), icon: Globe },
    { label: 'Published', value: metric(data?.published, loaded), icon: CheckCircle2 },
    { label: 'Custom Domains', value: metric(data?.custom_domains, loaded), icon: Link2 },
    { label: 'Form Submissions', value: metric(data?.form_submissions, loaded), icon: Inbox },
    { label: 'Clients', value: metric(data?.clients, loaded), icon: Briefcase },
    { label: 'Blog posts', value: metric(data?.blog_posts, loaded), icon: Newspaper },
    {
      label: 'Storage Usage',
      value: loaded ? `${Math.round((data?.storage_usage?.bytes || 0) / 1024 / 1024)} MB` : '—',
      icon: HardDrive,
    },
  ]
  return (
    <div>
      <PageHeader title="Overview" />
      {query.isError ? (
        <Card className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-medium text-white">Couldn’t load overview</div>
            <p className="mt-1 text-sm text-zinc-500">
              {query.error instanceof Error ? query.error.message : 'Something went wrong.'}
            </p>
          </div>
          <Button variant="outline" onClick={() => query.refetch()}>
            Try again
          </Button>
        </Card>
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <div className="mb-3 text-zinc-500">
              <c.icon size={18} />
            </div>
            <div className="text-2xl font-semibold text-white">{c.value}</div>
            <div className="mt-1 text-sm text-zinc-400">{c.label}</div>
          </Card>
        ))}
      </div>
      {data?.usage ? (
        <Card className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium text-white">Plan usage{data.plan?.name ? ` · ${data.plan.name}` : ''}</h2>
            <Link to="/billing" className="text-sm text-blue-400">
              Manage billing
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(USAGE_LABELS)
              .filter(([key]) => data.usage?.[key])
              .map(([key, label]) => {
                const entry = data.usage?.[key]
                const capped = atCap(entry)
                return (
                  <div key={key} className="text-sm">
                    <div className="flex justify-between text-zinc-400">
                      <span>{label}</span>
                      <span className={capped ? 'text-amber-400' : 'text-zinc-200'}>
                        {entry?.used ?? 0}
                        <span className="text-zinc-600"> / {entry?.limit === -1 ? '∞' : String(entry?.limit ?? '—')}</span>
                      </span>
                    </div>
                  </div>
                )
              })}
          </div>
        </Card>
      ) : null}
    </div>
  )
}
