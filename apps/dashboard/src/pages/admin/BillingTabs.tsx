import type { Plan } from '@uidesired/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { adminApi } from '../../lib/endpoints'
import { Badge, Button, Card, DataTable, Input } from '../../ui/primitives'
import { AdminSearch, formatBytes, statusTone } from './shared'

export function PlansTab() {
  const qc = useQueryClient()
  const plans = useQuery({ queryKey: ['admin-plans'], queryFn: adminApi.plans })
  const savePlan = useMutation({
    mutationFn: (vars: { id: number; body: Record<string, unknown> }) => adminApi.updatePlan(vars.id, vars.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-plans'] }),
  })

  return (
    <div className="space-y-4">
      {(plans.data || []).map((plan) => (
        <PlanEditor key={plan.id} plan={plan} saving={savePlan.isPending} onSave={(body) => savePlan.mutate({ id: plan.id, body })} />
      ))}
    </div>
  )
}

function PlanEditor({
  plan,
  saving,
  onSave,
}: {
  plan: Plan
  saving: boolean
  onSave: (body: Record<string, unknown>) => void
}) {
  const [name, setName] = useState(plan.name)
  const [monthly, setMonthly] = useState(String(plan.prices?.monthly ?? 0))
  const [yearly, setYearly] = useState(String(plan.prices?.yearly ?? 0))
  const [sites, setSites] = useState(String(plan.limits?.number_of_sites ?? 0))
  const [stripeMonthly, setStripeMonthly] = useState(String(plan.stripe_price_monthly ?? ''))
  const [stripeYearly, setStripeYearly] = useState(String(plan.stripe_price_yearly ?? ''))
  const [active, setActive] = useState(plan.is_active !== false)

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-medium text-white">{plan.name}</h2>
          <p className="text-xs text-zinc-500">
            {plan.slug} · {plan.subscriptions_count ?? 0} subscriptions
          </p>
        </div>
        <Badge tone={active ? 'success' : 'warning'}>{active ? 'active' : 'inactive'}</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs text-zinc-500">
          Name
          <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="text-xs text-zinc-500">
          Monthly (cents)
          <Input className="mt-1" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
        </label>
        <label className="text-xs text-zinc-500">
          Yearly (cents)
          <Input className="mt-1" value={yearly} onChange={(e) => setYearly(e.target.value)} />
        </label>
        <label className="text-xs text-zinc-500">
          Site limit
          <Input className="mt-1" value={sites} onChange={(e) => setSites(e.target.value)} />
        </label>
        <label className="text-xs text-zinc-500 sm:col-span-2">
          Stripe price ID (monthly)
          <Input className="mt-1 font-mono text-xs" placeholder="price_…" value={stripeMonthly} onChange={(e) => setStripeMonthly(e.target.value)} />
        </label>
        <label className="text-xs text-zinc-500 sm:col-span-2">
          Stripe price ID (yearly)
          <Input className="mt-1 font-mono text-xs" placeholder="price_…" value={stripeYearly} onChange={(e) => setStripeYearly(e.target.value)} />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setActive((value) => !value)}>
          {active ? 'Mark inactive' : 'Mark active'}
        </Button>
        <Button
          disabled={saving}
          onClick={() =>
            onSave({
              name,
              is_active: active,
              prices: { monthly: Number(monthly) || 0, yearly: Number(yearly) || 0 },
              limits: { number_of_sites: Number(sites) || 0 },
              stripe_price_monthly: stripeMonthly.trim() || null,
              stripe_price_yearly: stripeYearly.trim() || null,
            })
          }
        >
          Save plan
        </Button>
      </div>
    </Card>
  )
}

export function SubscriptionsTab() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const subscriptions = useQuery({
    queryKey: ['admin-subscriptions', query],
    queryFn: () => adminApi.subscriptions({ q: query || undefined }),
  })

  return (
    <Card>
      <AdminSearch
        value={search}
        onChange={setSearch}
        onSubmit={() => setQuery(search)}
        placeholder="Search workspace, plan, or status…"
      />
      <DataTable headers={['Workspace', 'Plan', 'Status', 'Provider', 'Interval', 'Period end']}>
        {(subscriptions.data?.data || []).map((item) => (
          <tr key={item.id}>
            <td className="py-3 pr-4">
              <div className="text-zinc-200">{item.workspace?.name ?? `workspace #${item.workspace_id}`}</div>
              <div className="text-xs text-zinc-500">{item.workspace?.slug ?? '—'}</div>
            </td>
            <td className="py-3 pr-4 text-zinc-200">{item.plan?.name ?? '—'}</td>
            <td className="py-3 pr-4">
              <Badge tone={statusTone(item.status)}>{item.status ?? '—'}</Badge>
            </td>
            <td className="py-3 pr-4 text-zinc-400">{item.provider ?? '—'}</td>
            <td className="py-3 pr-4 text-zinc-400">{item.interval ?? '—'}</td>
            <td className="py-3 pr-4 text-zinc-500">
              {item.current_period_end ? new Date(item.current_period_end).toLocaleDateString() : '—'}
            </td>
          </tr>
        ))}
      </DataTable>
    </Card>
  )
}

export function StorageTab() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const storage = useQuery({
    queryKey: ['admin-storage', query],
    queryFn: () => adminApi.storage({ q: query || undefined }),
  })

  return (
    <Card>
      <AdminSearch value={search} onChange={setSearch} onSubmit={() => setQuery(search)} placeholder="Search workspace storage…" />
      <DataTable headers={['Workspace', 'Plan', 'Used', 'Limit', 'Status']}>
        {(storage.data?.data || []).map((row) => (
          <tr key={row.id}>
            <td className="py-3 pr-4">
              <div className="text-zinc-200">{row.name}</div>
              <div className="text-xs text-zinc-500">{row.slug}</div>
            </td>
            <td className="py-3 pr-4 text-zinc-400">{row.plan?.name ?? '—'}</td>
            <td className="py-3 pr-4 text-zinc-200">
              {formatBytes(row.bytes)} <span className="text-zinc-500">({row.mb} MB)</span>
            </td>
            <td className="py-3 pr-4 text-zinc-400">
              {row.limit_mb == null ? '—' : row.limit_mb < 0 ? 'Unlimited' : `${row.limit_mb} MB`}
            </td>
            <td className="py-3 pr-4">
              <Badge tone={statusTone(row.status)}>{row.status ?? '—'}</Badge>
            </td>
          </tr>
        ))}
      </DataTable>
    </Card>
  )
}
