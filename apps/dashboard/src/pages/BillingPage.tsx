import type { UsageEntry } from '@uidesired/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, CreditCard, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { billingApi } from '../lib/endpoints'
import { Badge, Button, Card, PageHeader } from '../ui/primitives'

const USAGE_LABELS: Record<string, string> = {
  number_of_sites: 'Websites',
  custom_domains: 'Custom domains',
  storage_mb: 'Storage',
  form_submissions: 'Form submissions',
  team_members: 'Team members',
  ai_generations: 'AI generations',
}

const FEATURE_ROWS: { key: string; label: string; format: (value: unknown) => string }[] = [
  { key: 'number_of_sites', label: 'Websites', format: (v) => formatLimit(v) },
  { key: 'custom_domains', label: 'Custom domains', format: (v) => formatLimit(v) },
  { key: 'pages_per_site', label: 'Pages per site', format: (v) => formatLimit(v) },
  { key: 'storage_mb', label: 'Storage', format: (v) => (typeof v === 'number' ? formatStorage(v) : formatLimit(v)) },
  { key: 'form_submissions', label: 'Form submissions', format: (v) => formatLimit(v) },
  { key: 'team_members', label: 'Team members', format: (v) => formatLimit(v) },
  { key: 'revision_history', label: 'Revision history', format: (v) => formatLimit(v) },
  { key: 'premium_templates', label: 'Premium templates', format: (v) => (v ? 'Included' : 'Not included') },
  { key: 'remove_branding', label: 'Remove branding', format: (v) => (v ? 'Included' : 'Not included') },
  { key: 'ai_generations', label: 'AI generations / month', format: (v) => formatLimit(v) },
]

function formatLimit(value: unknown): string {
  if (value === -1) return 'Unlimited'
  if (typeof value === 'boolean') return value ? 'Included' : 'Not included'
  if (value === null || value === undefined) return '—'
  return String(value)
}

function formatStorage(mb: number): string {
  if (mb === -1) return 'Unlimited'
  return mb >= 1024 ? `${Math.round(mb / 1024)} GB` : `${mb} MB`
}

function formatPrice(cents?: number): string {
  if (!cents) return 'Free'
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

function statusTone(status?: string | null) {
  if (status === 'active' || status === 'trialing') return 'success' as const
  if (status === 'past_due') return 'danger' as const
  if (status === 'canceled') return 'warning' as const
  return 'neutral' as const
}

function UsageMeter({ name, entry }: { name: string; entry: UsageEntry }) {
  const used = entry.used ?? 0
  const limit = typeof entry.limit === 'number' ? entry.limit : null
  const unlimited = limit === null || limit < 0
  const percent = unlimited || limit === 0 ? 0 : Math.min(100, Math.round((used / limit) * 100))
  const tone = percent >= 100 ? 'bg-red-500' : percent >= 80 ? 'bg-amber-500' : 'bg-blue-500'
  const isStorage = name === 'storage_mb'

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="text-zinc-400">{USAGE_LABELS[name] ?? name}</span>
        <span className="text-zinc-300">
          {isStorage ? formatStorage(used) : used}
          <span className="text-zinc-600"> / {isStorage && limit !== null ? formatStorage(limit) : formatLimit(entry.limit)}</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div className={`h-full rounded-full ${unlimited ? 'bg-zinc-600' : tone}`} style={{ width: `${unlimited ? 4 : percent}%` }} />
      </div>
    </div>
  )
}

function isPaidPlan(slug?: string, monthly?: number) {
  return slug !== 'free' && (monthly ?? 0) > 0
}

export function BillingPage() {
  const qc = useQueryClient()
  const [searchParams] = useSearchParams()
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [error, setError] = useState<string | null>(null)
  const [pendingSlug, setPendingSlug] = useState<string | null>(null)

  const plans = useQuery({ queryKey: ['plans'], queryFn: billingApi.plans })
  const sub = useQuery({ queryKey: ['subscription'], queryFn: billingApi.subscription })

  const stripeEnabled = Boolean(sub.data?.stripe_enabled)
  const currentSlug = sub.data?.plan?.slug
  const usage = sub.data?.usage ?? {}
  const meterKeys = Object.keys(USAGE_LABELS).filter((key) => usage[key])
  const periodEnd = sub.data?.current_period_end ? new Date(sub.data.current_period_end) : null
  const success = searchParams.get('success') === '1'
  const canceled = searchParams.get('canceled') === '1'

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['subscription'] })
    qc.invalidateQueries({ queryKey: ['overview'] })
    qc.invalidateQueries({ queryKey: ['sites'] })
  }

  const changePlan = useMutation({
    mutationFn: (slug: string) => billingApi.changePlan(slug, cycle),
    onSuccess: () => {
      setError(null)
      refresh()
    },
    onError: (err: Error) => setError(err.message),
    onSettled: () => setPendingSlug(null),
  })

  const checkout = useMutation({
    mutationFn: (slug: string) => billingApi.checkout(slug, cycle),
    onSuccess: (session) => {
      if (session.url) window.location.assign(session.url)
    },
    onError: (err: Error) => setError(err.message),
    onSettled: () => setPendingSlug(null),
  })

  const portal = useMutation({
    mutationFn: () => billingApi.portal(),
    onSuccess: (session) => {
      if (session.url) window.location.assign(session.url)
    },
    onError: (err: Error) => setError(err.message),
  })

  const busy = changePlan.isPending || checkout.isPending

  function selectPlan(slug: string, paid: boolean) {
    const label = currentSlug ? `Switch from ${currentSlug} to ${slug}?` : `Start the ${slug} plan?`
    if (!window.confirm(label)) return
    setError(null)
    setPendingSlug(slug)
    if (stripeEnabled && paid) {
      checkout.mutate(slug)
      return
    }
    changePlan.mutate(slug)
  }

  const notice = useMemo(() => {
    if (success) return 'Payment completed. Your plan updates as soon as Stripe confirms the subscription.'
    if (canceled) return 'Checkout was canceled. Your current plan is unchanged.'
    if (sub.data?.cancel_at_period_end) {
      return `Cancellation is scheduled. You’ll stay on ${sub.data.plan?.name ?? 'your plan'} until ${periodEnd ? periodEnd.toLocaleDateString() : 'period end'}.`
    }
    return null
  }, [success, canceled, sub.data, periodEnd])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Manage your subscription, monitor plan usage, and upgrade when you outgrow your limits."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {stripeEnabled && sub.data?.portal_available ? (
              <Button variant="outline" disabled={portal.isPending} onClick={() => portal.mutate()}>
                <CreditCard size={14} />
                {portal.isPending ? 'Opening…' : 'Manage billing'}
              </Button>
            ) : null}
            <div className="flex rounded-lg border border-zinc-800 bg-zinc-900 p-0.5 text-sm">
              {(['monthly', 'yearly'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setCycle(option)}
                  className={`rounded-md px-3 py-1.5 capitalize ${cycle === option ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {notice ? (
        <div className="rounded-lg border border-blue-900 bg-blue-950/40 px-4 py-3 text-sm text-blue-200">{notice}</div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Current plan</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl font-semibold text-white">{sub.data?.plan?.name ?? '—'}</span>
            {sub.data?.status ? <Badge tone={statusTone(sub.data.status)}>{sub.data.status}</Badge> : null}
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Price</dt>
              <dd className="text-zinc-300">
                {formatPrice(sub.data?.plan?.prices?.[cycle])}
                <span className="text-zinc-600">{cycle === 'monthly' ? '/mo' : '/yr'}</span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Renews</dt>
              <dd className="text-zinc-300">{periodEnd ? periodEnd.toLocaleDateString() : '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Provider</dt>
              <dd className="capitalize text-zinc-300">{sub.data?.provider ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Payments</dt>
              <dd className="text-zinc-300">{stripeEnabled ? 'Stripe Checkout' : 'Local (no card)'}</dd>
            </div>
          </dl>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-4 text-xs uppercase tracking-wide text-zinc-500">Usage this period</div>
          {meterKeys.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {meterKeys.map((key) => (
                <UsageMeter key={key} name={key} entry={usage[key]} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Usage becomes available once your workspace has a subscription.</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(plans.data || []).map((plan) => {
          const isCurrent = plan.slug === currentSlug
          const price = plan.prices?.[cycle]
          const paid = isPaidPlan(plan.slug, plan.prices?.monthly)
          return (
            <Card key={plan.id} className={isCurrent ? 'border-blue-600 ring-1 ring-blue-600/40' : undefined}>
              <div className="flex items-center justify-between">
                <div className="text-lg font-medium text-white">{plan.name}</div>
                {isCurrent ? <Badge tone="info">Current</Badge> : null}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-white">{formatPrice(price)}</span>
                {price ? <span className="text-sm text-zinc-500">{cycle === 'monthly' ? '/mo' : '/yr'}</span> : null}
              </div>
              <ul className="mt-4 space-y-1.5 text-sm">
                {FEATURE_ROWS.map((row) => {
                  const value = plan.limits?.[row.key]
                  return (
                    <li key={row.key} className="flex items-start gap-2">
                      <Check size={14} className={`mt-0.5 shrink-0 ${value ? 'text-emerald-500' : 'text-zinc-700'}`} />
                      <span className="text-zinc-400">
                        {row.label}: <span className="text-zinc-200">{row.format(value)}</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
              <Button
                className="mt-5 w-full"
                variant={isCurrent ? 'outline' : 'primary'}
                disabled={isCurrent || busy}
                onClick={() => selectPlan(plan.slug, paid)}
              >
                {busy && pendingSlug === plan.slug ? <Loader2 size={14} className="animate-spin" /> : null}
                {isCurrent ? 'Current plan' : stripeEnabled && paid ? 'Upgrade with Stripe' : 'Change plan'}
              </Button>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
