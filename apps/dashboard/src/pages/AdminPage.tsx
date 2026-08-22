import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../ui/primitives'
import { AiTab } from './admin/AiTab'
import { PlansTab, SubscriptionsTab } from './admin/BillingTabs'
import { BlocksTab, TemplatesTab } from './admin/CatalogTabs'
import { DashboardTab } from './admin/DashboardTab'
import { GoogleAuthTab } from './admin/GoogleAuthTab'
import { MediaStorageTab } from './admin/MediaStorageTab'
import { PaymentGatewayTab } from './admin/PaymentGatewayTab'
import { ActivityTab, FailedJobsTab, FormsTab, HealthTab, JobsTab, SettingsTab } from './admin/OpsTabs'
import { DomainsTab, SitesTab, UsersTab, WorkspacesTab } from './admin/TenantTabs'

const TABS = [
  { id: 'overview', label: 'Dashboard' },
  { id: 'users', label: 'Users' },
  { id: 'workspaces', label: 'Workspaces' },
  { id: 'sites', label: 'Websites' },
  { id: 'domains', label: 'Domains' },
  { id: 'templates', label: 'Templates' },
  { id: 'blocks', label: 'Blocks' },
  { id: 'plans', label: 'Plans' },
  { id: 'payments', label: 'Payments' },
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'storage', label: 'Storage' },
  { id: 'forms', label: 'Forms' },
  { id: 'activity', label: 'Activity Logs' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'failed-jobs', label: 'Failed Jobs' },
  { id: 'health', label: 'System Health' },
  { id: 'settings', label: 'Settings' },
  { id: 'google-auth', label: 'Google Sign-in' },
  { id: 'ai', label: 'AI' },
] as const

type Tab = (typeof TABS)[number]['id']

function isTab(value: string | null): value is Tab {
  return TABS.some((item) => item.id === value)
}

export function AdminPage() {
  const [params, setParams] = useSearchParams()
  const tab = isTab(params.get('tab')) ? params.get('tab')! : 'overview'

  return (
    <div className="space-y-6">
      <PageHeader title="Admin" description="Platform-wide operations: tenants, domains, audit trail, and queue health." />

      <div className="flex flex-wrap gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1 text-sm">
        {TABS.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              const next = new URLSearchParams(params)
              if (item.id === 'overview') next.delete('tab')
              else next.set('tab', item.id)
              setParams(next, { replace: true })
            }}
            className={`rounded-md px-3 py-1.5 ${tab === item.id ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'overview' ? <DashboardTab /> : null}
      {tab === 'users' ? <UsersTab /> : null}
      {tab === 'workspaces' ? <WorkspacesTab /> : null}
      {tab === 'sites' ? <SitesTab /> : null}
      {tab === 'domains' ? <DomainsTab /> : null}
      {tab === 'templates' ? <TemplatesTab /> : null}
      {tab === 'blocks' ? <BlocksTab /> : null}
      {tab === 'plans' ? <PlansTab /> : null}
      {tab === 'payments' ? <PaymentGatewayTab /> : null}
      {tab === 'subscriptions' ? <SubscriptionsTab /> : null}
      {tab === 'storage' ? <MediaStorageTab /> : null}
      {tab === 'forms' ? <FormsTab /> : null}
      {tab === 'activity' ? <ActivityTab /> : null}
      {tab === 'jobs' ? <JobsTab /> : null}
      {tab === 'failed-jobs' ? <FailedJobsTab /> : null}
      {tab === 'health' ? <HealthTab /> : null}
      {tab === 'settings' ? <SettingsTab /> : null}
      {tab === 'google-auth' ? <GoogleAuthTab /> : null}
      {tab === 'ai' ? <AiTab /> : null}
    </div>
  )
}
