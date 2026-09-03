import type { FunnelStep } from '@uidesired/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FlaskConical, Trash2, Trophy } from 'lucide-react'
import { useState } from 'react'
import { experimentsApi } from '../lib/endpoints'
import { Badge, Button, Card, DataTable, EmptyState, Input, Label, Select } from '../ui/primitives'

/**
 * A/B testing one step of a funnel.
 *
 * The step's own page is the control and is never something you can delete
 * here; a variant is an alternative to it. Rates are worked out from the
 * events, so a version that ran and was paused still shows what it did while it
 * was running.
 *
 * No winner is suggested below a hundred views a side. Traffic that thin says
 * nothing, and a page that declares a leader after nine visitors teaches people
 * to trust a number that has not earned it.
 */

/** Below this, a difference between two variants is noise. */
const ENOUGH = 100

export function FunnelExperiments({ funnelId, steps }: { funnelId: string | number; steps: FunnelStep[] }) {
  const qc = useQueryClient()
  const [stepId, setStepId] = useState(() => String(steps[0]?.id ?? ''))
  const [name, setName] = useState('')
  const [weight, setWeight] = useState('1')
  const [error, setError] = useState<string | null>(null)

  const results = useQuery({
    queryKey: ['funnel-experiment', funnelId, stepId],
    queryFn: () => experimentsApi.results(funnelId, stepId),
    enabled: Boolean(stepId),
  })

  const refresh = () => void qc.invalidateQueries({ queryKey: ['funnel-experiment', funnelId, stepId] })

  const create = useMutation({
    mutationFn: () => experimentsApi.create(funnelId, stepId, { name, weight: Number(weight) || 1 }),
    onSuccess: () => {
      setName('')
      setWeight('1')
      setError(null)
      refresh()
    },
    onError: (err: Error) => setError(err.message),
  })

  const remove = useMutation({
    mutationFn: (variantId: number) => experimentsApi.remove(funnelId, stepId, variantId),
    onSuccess: refresh,
  })

  const declare = useMutation({
    mutationFn: (key: string) => experimentsApi.winner(funnelId, stepId, key),
    onSuccess: refresh,
  })

  const data = results.data
  const variants = data?.variants || []
  // The control is in this list too, so a test only exists once there is
  // something to compare it against.
  const running = variants.length > 1
  const best = running
    ? variants.reduce((a, b) => (b.rate > a.rate ? b : a))
    : undefined
  const settled = running && variants.every((variant) => variant.views >= ENOUGH)

  return (
    <Card className="mt-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-medium text-white">
            <FlaskConical size={16} className="text-violet-400" />
            A/B tests
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Split traffic to one step between alternative versions. The step's own page is the control.
          </p>
        </div>
        <div className="w-56">
          <Label>Step</Label>
          <Select value={stepId} onChange={(e) => setStepId(e.target.value)}>
            {steps.map((step) => (
              <option key={step.id} value={step.id}>
                {step.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {results.isLoading ? (
        <p className="mt-4 text-xs text-zinc-500">Loading results…</p>
      ) : variants.length <= 1 ? (
        <EmptyState
          title="Only the control is running"
          description="Add a version to start splitting traffic. It begins as a copy of this step, so you change one thing rather than build a page from nothing."
        />
      ) : (
        <div className="mt-4">
          <DataTable headers={['Version', 'Share', 'Views', 'Conversions', 'Rate', 'Status', '']}>
            {variants.map((variant) => (
              <tr key={variant.key} className="border-t border-zinc-800">
                <td className="px-3 py-2 text-sm text-white">
                  <span className="flex items-center gap-2">
                    {variant.name}
                    {variant.id === null ? <Badge>control</Badge> : null}
                    {settled && best?.key === variant.key ? (
                      <Trophy size={13} className="text-amber-400" aria-label="Leading" />
                    ) : null}
                  </span>
                </td>
                <td className="px-3 py-2 text-zinc-500">{variant.weight}</td>
                <td className="px-3 py-2 text-zinc-300">{variant.views}</td>
                <td className="px-3 py-2 text-zinc-300">{variant.conversions}</td>
                <td className="px-3 py-2 text-zinc-300">{variant.rate}%</td>
                <td className="px-3 py-2">
                  <Badge tone={variant.status === 'active' ? 'success' : 'neutral'}>{variant.status}</Badge>
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      disabled={declare.isPending}
                      title="Make this the step's page and stop the test"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Make “${variant.name}” the live page for this step? The other versions stop running.`,
                          )
                        )
                          declare.mutate(variant.key)
                      }}
                    >
                      Declare winner
                    </Button>
                    {variant.id === null ? null : (
                      <button
                        type="button"
                        title="Delete this version"
                        className="p-1 text-zinc-600 hover:text-red-400"
                        onClick={() => {
                          if (window.confirm(`Delete “${variant.name}”? What it recorded so far goes with it.`))
                            remove.mutate(variant.id as number)
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>

          <p className="mt-3 text-xs text-zinc-500">
            {settled
              ? `“${best?.name}” is ahead on ${best?.rate}%.`
              : `Not enough traffic to call this yet — each version needs about ${ENOUGH} views.`}{' '}
            {data ? `${data.total_views} views and ${data.total_conversions} conversions so far.` : null}
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-zinc-800 pt-4">
        <div className="max-w-xs flex-1">
          <Label>New version</Label>
          <Input placeholder="Shorter headline" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="w-28">
          <Label>Share</Label>
          <Input type="number" min="1" max="100" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
        <Button disabled={create.isPending || !name.trim() || !stepId} onClick={() => create.mutate()}>
          {create.isPending ? 'Adding…' : 'Add version'}
        </Button>
      </div>
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
      <p className="mt-2 text-xs text-zinc-500">
        Share is relative: two versions at 1 and 3 send a quarter and three quarters of the traffic. A visitor keeps the
        version they first saw.
      </p>
    </Card>
  )
}
