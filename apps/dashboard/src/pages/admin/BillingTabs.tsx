import type { Plan, PlanLimitDefinition, PlanLimitSchema } from '@uidesired/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { ApiError } from '../../lib/api'
import { adminApi } from '../../lib/endpoints'
import { Badge, Button, Card, DataTable, Input, Label } from '../../ui/primitives'
import { AdminSearch, formatBytes, statusTone } from './shared'

const UNLIMITED = -1

/** Groups the schema in the order the server listed it, not alphabetically. */
function groupSchema(schema: PlanLimitSchema): Array<[string, Array<[string, PlanLimitDefinition]>]> {
  const groups = new Map<string, Array<[string, PlanLimitDefinition]>>()
  for (const [key, definition] of Object.entries(schema)) {
    const bucket = groups.get(definition.group) ?? []
    bucket.push([key, definition])
    groups.set(definition.group, bucket)
  }

  return [...groups.entries()]
}

function limitValue(plan: Plan, key: string, definition: PlanLimitDefinition): number | boolean {
  const stored = plan.limits?.[key]

  return stored === undefined ? definition.default : (stored as number | boolean)
}

function errorMessage(error: unknown): string | null {
  if (!error) return null

  return error instanceof ApiError ? error.message : String(error)
}

/**
 * One limit control.
 *
 * A quota gets a number with an Unlimited switch rather than asking anyone to
 * remember that -1 means unlimited, and zero is spelled out where it applies,
 * because "0" and "no ceiling" otherwise read as the same kind of number.
 */
function LimitField({
  definition,
  value,
  onChange,
}: {
  definition: PlanLimitDefinition
  value: number | boolean
  onChange: (next: number | boolean) => void
}) {
  if (definition.type === 'flag') {
    return (
      <label className="flex items-start gap-2 py-1">
        <input type="checkbox" className="mt-1" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        <span>
          <span className="block text-sm text-zinc-200">{definition.label}</span>
          <span className="block text-xs text-zinc-500">{definition.help}</span>
        </span>
      </label>
    )
  }

  const numeric = typeof value === 'number' ? value : Number(value)
  const unlimited = numeric === UNLIMITED
  // Turning Unlimited off has to put back the number that was there before it
  // was turned on. Falling back to 0 would read as "excluded from the plan",
  // so a stray double-click would quietly revoke the feature instead of
  // leaving the ceiling where the operator had set it.
  const [remembered, setRemembered] = useState(() => (numeric >= 0 ? numeric : 0))

  return (
    <div className="py-1">
      <Label>
        {definition.label}
        {definition.unit ? <span className="text-zinc-500"> ({definition.unit})</span> : null}
      </Label>
      <div className="mt-1 flex items-center gap-2">
        <Input
          type="number"
          min={0}
          className="w-32"
          disabled={unlimited}
          value={unlimited ? '' : String(numeric)}
          placeholder={unlimited ? 'Unlimited' : ''}
          onChange={(e) => {
            const next = Math.max(0, Number(e.target.value) || 0)
            setRemembered(next)
            onChange(next)
          }}
        />
        <label className="flex items-center gap-1.5 text-xs text-zinc-400">
          <input
            type="checkbox"
            checked={unlimited}
            onChange={(e) => {
              if (e.target.checked) {
                if (numeric >= 0) setRemembered(numeric)
                onChange(UNLIMITED)

                return
              }
              onChange(remembered)
            }}
          />
          Unlimited
        </label>
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        {definition.help}
        {!unlimited && numeric === 0 ? ' Zero excludes this feature from the plan.' : ''}
      </p>
    </div>
  )
}

export function PlansTab() {
  const qc = useQueryClient()
  const plans = useQuery({ queryKey: ['admin-plans-full'], queryFn: adminApi.plansWithSchema })
  const [creating, setCreating] = useState(false)

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-plans-full'] })
    // The AI tab reads plans through its own key.
    qc.invalidateQueries({ queryKey: ['admin-plans'] })
  }

  const savePlan = useMutation({
    mutationFn: (vars: { id: number; body: Record<string, unknown> }) => adminApi.updatePlan(vars.id, vars.body),
    onSuccess: invalidate,
  })
  const removePlan = useMutation({
    mutationFn: (id: number) => adminApi.deletePlan(id),
    onSuccess: invalidate,
  })
  const addPlan = useMutation({
    mutationFn: (body: Record<string, unknown>) => adminApi.createPlan(body),
    onSuccess: () => {
      invalidate()
      setCreating(false)
    },
  })

  const schema = plans.data?.schema ?? {}

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">
          Quotas are checked when the resource is created. Zero excludes a feature; Unlimited removes the ceiling.
        </p>
        <Button variant="outline" onClick={() => setCreating((value) => !value)}>
          {creating ? 'Cancel' : 'New plan'}
        </Button>
      </div>

      {creating ? (
        <NewPlanForm
          schema={schema}
          saving={addPlan.isPending}
          error={addPlan.error}
          onCreate={(body) => addPlan.mutate(body)}
        />
      ) : null}

      {(plans.data?.plans || []).map((plan) => (
        <PlanEditor
          key={plan.id}
          plan={plan}
          schema={schema}
          saving={savePlan.isPending}
          deleting={removePlan.isPending}
          deleteError={removePlan.variables === plan.id ? removePlan.error : null}
          onSave={(body) => savePlan.mutate({ id: plan.id, body })}
          onDelete={() => removePlan.mutate(plan.id)}
        />
      ))}
    </div>
  )
}

function NewPlanForm({
  schema,
  saving,
  error,
  onCreate,
}: {
  schema: PlanLimitSchema
  saving: boolean
  error: unknown
  onCreate: (body: Record<string, unknown>) => void
}) {
  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const [monthly, setMonthly] = useState('0')
  const [yearly, setYearly] = useState('0')

  return (
    <Card>
      <h2 className="mb-1 font-medium text-white">New plan</h2>
      <p className="mb-4 text-xs text-zinc-500">
        Limits start at their defaults; adjust them below once the plan exists. The slug is permanent.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs text-zinc-500">
          Slug
          <Input className="mt-1 font-mono" placeholder="studio" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </label>
        <label className="text-xs text-zinc-500">
          Name
          <Input className="mt-1" placeholder="Studio" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="text-xs text-zinc-500">
          Monthly (cents)
          <Input className="mt-1" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
        </label>
        <label className="text-xs text-zinc-500">
          Yearly (cents)
          <Input className="mt-1" value={yearly} onChange={(e) => setYearly(e.target.value)} />
        </label>
      </div>
      {errorMessage(error) ? <p className="mt-3 text-xs text-red-400">{errorMessage(error)}</p> : null}
      <div className="mt-4">
        <Button
          disabled={saving || !slug.trim() || !name.trim()}
          onClick={() =>
            onCreate({
              slug: slug.trim().toLowerCase(),
              name: name.trim(),
              is_active: true,
              prices: { monthly: Number(monthly) || 0, yearly: Number(yearly) || 0 },
              limits: Object.fromEntries(Object.entries(schema).map(([key, definition]) => [key, definition.default])),
            })
          }
        >
          Create plan
        </Button>
      </div>
    </Card>
  )
}

function PlanEditor({
  plan,
  schema,
  saving,
  deleting,
  deleteError,
  onSave,
  onDelete,
}: {
  plan: Plan
  schema: PlanLimitSchema
  saving: boolean
  deleting: boolean
  deleteError: unknown
  onSave: (body: Record<string, unknown>) => void
  onDelete: () => void
}) {
  const [name, setName] = useState(plan.name)
  const [monthly, setMonthly] = useState(String(plan.prices?.monthly ?? 0))
  const [yearly, setYearly] = useState(String(plan.prices?.yearly ?? 0))
  const [stripeMonthly, setStripeMonthly] = useState(String(plan.stripe_price_monthly ?? ''))
  const [stripeYearly, setStripeYearly] = useState(String(plan.stripe_price_yearly ?? ''))
  const [active, setActive] = useState(plan.is_active !== false)
  const [limits, setLimits] = useState<Record<string, number | boolean>>(() =>
    Object.fromEntries(Object.entries(schema).map(([key, definition]) => [key, limitValue(plan, key, definition)])),
  )
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const groups = useMemo(() => groupSchema(schema), [schema])
  const subscriptions = plan.subscriptions_count ?? 0
  // The free plan is assigned to every new workspace, so the API refuses to
  // delete it. Saying so here beats sending a request that cannot succeed.
  const removable = plan.slug !== 'free' && subscriptions === 0

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-medium text-white">{plan.name}</h2>
          <p className="text-xs text-zinc-500">
            {plan.slug} · {subscriptions} subscription{subscriptions === 1 ? '' : 's'}
          </p>
        </div>
        <Badge tone={active ? 'success' : 'warning'}>{active ? 'active' : 'inactive'}</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        <label className="text-xs text-zinc-500 lg:col-span-2">
          Stripe price ID (monthly)
          <Input
            className="mt-1 font-mono text-xs"
            placeholder="price_…"
            value={stripeMonthly}
            onChange={(e) => setStripeMonthly(e.target.value)}
          />
        </label>
        <label className="text-xs text-zinc-500">
          Stripe price ID (yearly)
          <Input
            className="mt-1 font-mono text-xs"
            placeholder="price_…"
            value={stripeYearly}
            onChange={(e) => setStripeYearly(e.target.value)}
          />
        </label>
      </div>

      <div className="mt-5 space-y-5">
        {groups.map(([group, entries]) => (
          <div key={group}>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">{group}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map(([key, definition]) => (
                <LimitField
                  key={key}
                  definition={definition}
                  value={limits[key] ?? definition.default}
                  onChange={(next) => setLimits((current) => ({ ...current, [key]: next }))}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {errorMessage(deleteError) ? <p className="mt-3 text-xs text-red-400">{errorMessage(deleteError)}</p> : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          disabled={saving}
          onClick={() =>
            onSave({
              name,
              is_active: active,
              prices: { monthly: Number(monthly) || 0, yearly: Number(yearly) || 0 },
              limits,
              stripe_price_monthly: stripeMonthly.trim() || null,
              stripe_price_yearly: stripeYearly.trim() || null,
            })
          }
        >
          Save plan
        </Button>
        <Button variant="outline" onClick={() => setActive((value) => !value)}>
          {active ? 'Mark inactive' : 'Mark active'}
        </Button>
        {confirmingDelete ? (
          <>
            <Button variant="outline" disabled={deleting} onClick={onDelete}>
              Confirm delete
            </Button>
            <Button variant="outline" onClick={() => setConfirmingDelete(false)}>
              Keep
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            disabled={!removable}
            title={
              removable
                ? undefined
                : plan.slug === 'free'
                  ? 'Every new workspace is assigned the free plan.'
                  : 'Move its subscriptions to another plan first.'
            }
            onClick={() => setConfirmingDelete(true)}
          >
            Delete
          </Button>
        )}
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
