import type { PlanLimitError } from '@uidesired/types'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PLAN_LIMIT_EVENT } from '../lib/api'
import { planLimitMessage } from '../lib/plan'
import { Button } from '../ui/primitives'

export function UpgradePrompt() {
  const [error, setError] = useState<PlanLimitError | null>(null)

  useEffect(() => {
    function onLimit(event: Event) {
      const detail = (event as CustomEvent<PlanLimitError>).detail
      setError(detail || { message: 'Plan limit reached. Upgrade to continue.' })
    }
    window.addEventListener(PLAN_LIMIT_EVENT, onLimit)
    return () => window.removeEventListener(PLAN_LIMIT_EVENT, onLimit)
  }, [])

  if (!error) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
        <div className="text-lg font-medium text-white">Upgrade to continue</div>
        <p className="mt-2 text-sm text-zinc-400">{planLimitMessage(error)}</p>
        {error.limit_key ? (
          <p className="mt-2 text-xs text-zinc-500">
            Usage: {String(error.used ?? '—')} / {String(error.limit ?? '—')}
          </p>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setError(null)}>
            Not now
          </Button>
          <Link to="/billing" onClick={() => setError(null)}>
            <Button>View plans</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
