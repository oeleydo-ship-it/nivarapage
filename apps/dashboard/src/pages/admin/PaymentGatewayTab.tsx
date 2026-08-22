import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { adminApi, type AdminPaymentGatewaySettings } from '../../lib/endpoints'
import { ApiError } from '../../lib/api'
import { Badge, Button, Card, Input, Label, Select } from '../../ui/primitives'

function nestedMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.body && typeof error.body === 'object') {
    const body = error.body as { message?: unknown; data?: { message?: unknown; status?: AdminPaymentGatewaySettings } }
    if (typeof body.data?.message === 'string' && body.data.message) return body.data.message
    if (typeof body.message === 'string' && body.message) return body.message
  }
  return error instanceof Error && error.message ? error.message : fallback
}

function sourceLabel(source?: string) {
  if (source === 'settings') return 'stored in Admin'
  if (source === 'env') return 'from environment'
  return 'not set'
}

export function PaymentGatewayTab() {
  const qc = useQueryClient()
  const settings = useQuery({ queryKey: ['admin-payment-gateway'], queryFn: adminApi.paymentGateway })

  const [enabled, setEnabled] = useState(true)
  const [mode, setMode] = useState('test')
  const [publishableKey, setPublishableKey] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [testMessage, setTestMessage] = useState<string | null>(null)

  useEffect(() => {
    const data = settings.data
    if (!data) return
    setEnabled(Boolean(data.enabled))
    setMode(data.mode === 'live' ? 'live' : 'test')
    setPublishableKey(data.publishable_key || '')
    setSecretKey('')
    setWebhookSecret('')
  }, [settings.data])

  const save = useMutation({
    mutationFn: () => {
      const body: Record<string, unknown> = {
        enabled,
        provider: 'stripe',
        mode,
        publishable_key: publishableKey.trim(),
      }
      if (secretKey.trim() !== '') body.secret_key = secretKey.trim()
      if (webhookSecret.trim() !== '') body.webhook_secret = webhookSecret.trim()
      return adminApi.updatePaymentGateway(body)
    },
    onSuccess: (data) => {
      setNotice('Payment gateway settings saved. Secret and webhook values are never returned to the dashboard.')
      setTestMessage(null)
      setSecretKey('')
      setWebhookSecret('')
      qc.setQueryData(['admin-payment-gateway'], data)
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const clearSecret = useMutation({
    mutationFn: () => adminApi.updatePaymentGateway({ secret_key: '' }),
    onSuccess: (data) => {
      setNotice('Stored secret key cleared. The STRIPE_SECRET environment value is used if set.')
      setSecretKey('')
      qc.setQueryData(['admin-payment-gateway'], data)
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const clearWebhook = useMutation({
    mutationFn: () => adminApi.updatePaymentGateway({ webhook_secret: '' }),
    onSuccess: (data) => {
      setNotice('Stored webhook secret cleared. The STRIPE_WEBHOOK_SECRET environment value is used if set.')
      setWebhookSecret('')
      qc.setQueryData(['admin-payment-gateway'], data)
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const test = useMutation({
    mutationFn: adminApi.testPaymentGateway,
    onSuccess: (result) => {
      setTestMessage(result.message || (result.ok ? 'Connection succeeded.' : 'Connection failed.'))
      if (result.status) qc.setQueryData(['admin-payment-gateway'], result.status)
      else qc.invalidateQueries({ queryKey: ['admin-payment-gateway'] })
    },
    onError: (error) => {
      setTestMessage(nestedMessage(error, 'Connection failed.'))
      if (error instanceof ApiError && error.body && typeof error.body === 'object') {
        const status = (error.body as { data?: { status?: AdminPaymentGatewaySettings } }).data?.status
        if (status) qc.setQueryData(['admin-payment-gateway'], status)
      }
    },
  })

  const data = settings.data
  const busy = save.isPending || clearSecret.isPending || clearWebhook.isPending || test.isPending

  return (
    <div className="space-y-4">
      <StatusCard data={data} />

      <Card className="max-w-2xl space-y-4">
        <div>
          <h2 className="font-medium text-white">Stripe gateway</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Configure Checkout and Billing Portal for workspace subscriptions. Admin-stored keys override environment
            variables.
          </p>
        </div>

        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="rounded border-zinc-700" />
          Enable Stripe payments
        </label>

        <div>
          <Label>Mode</Label>
          <Select className="mt-1 w-full" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="test">Test mode</option>
            <option value="live">Live mode</option>
          </Select>
          <p className="mt-1 text-xs text-zinc-500">Use matching pk_/sk_ keys for the selected mode.</p>
        </div>

        <div>
          <Label>Publishable key</Label>
          <Input
            className="mt-1 font-mono text-xs"
            placeholder="pk_test_…"
            value={publishableKey}
            onChange={(e) => setPublishableKey(e.target.value)}
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-zinc-500">Source: {sourceLabel(data?.publishable_source)}</p>
        </div>

        <div>
          <Label>Secret key</Label>
          <Input
            className="mt-1 font-mono text-xs"
            type="password"
            placeholder={data?.secret_hint ? `Stored (${data.secret_hint}) — leave blank to keep` : 'sk_test_…'}
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            autoComplete="new-password"
          />
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span>Source: {sourceLabel(data?.secret_source)}</span>
            {data?.secret_source === 'settings' ? (
              <button type="button" className="text-amber-400 hover:text-amber-300" disabled={busy} onClick={() => clearSecret.mutate()}>
                Clear stored secret
              </button>
            ) : null}
          </div>
        </div>

        <div>
          <Label>Webhook signing secret</Label>
          <Input
            className="mt-1 font-mono text-xs"
            type="password"
            placeholder={data?.webhook_hint ? `Stored (${data.webhook_hint}) — leave blank to keep` : 'whsec_…'}
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            autoComplete="new-password"
          />
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span>Source: {sourceLabel(data?.webhook_source)}</span>
            {data?.webhook_source === 'settings' ? (
              <button type="button" className="text-amber-400 hover:text-amber-300" disabled={busy} onClick={() => clearWebhook.mutate()}>
                Clear stored webhook secret
              </button>
            ) : null}
          </div>
        </div>

        {data?.webhook_url ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs text-zinc-400">
            <div className="font-medium text-zinc-300">Webhook endpoint</div>
            <code className="mt-1 block break-all text-zinc-200">{data.webhook_url}</code>
            <p className="mt-2">Add this URL in Stripe Dashboard → Developers → Webhooks for checkout and subscription events.</p>
          </div>
        ) : null}

        {notice ? <p className="text-sm text-emerald-400">{notice}</p> : null}
        {save.isError ? (
          <p className="text-sm text-red-400">{save.error instanceof Error ? save.error.message : 'Could not save settings.'}</p>
        ) : null}
        {testMessage ? (
          <p className={`text-sm ${test.isError || testMessage.toLowerCase().includes('fail') ? 'text-red-400' : 'text-emerald-400'}`}>
            {testMessage}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button disabled={busy} onClick={() => save.mutate()}>
            {save.isPending ? 'Saving…' : 'Save gateway'}
          </Button>
          <Button variant="outline" disabled={busy || !enabled} onClick={() => test.mutate()}>
            {test.isPending ? 'Testing…' : 'Test connection'}
          </Button>
        </div>
      </Card>

      <Card className="max-w-2xl">
        <h2 className="font-medium text-white">Next steps</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-400">
          <li>Save Stripe keys and run Test connection.</li>
          <li>Open Admin → Plans and set each paid plan’s Stripe Price IDs (monthly / yearly).</li>
          <li>Point a Stripe webhook at the endpoint above for checkout and invoice events.</li>
          <li>Workspaces use Billing → Checkout when Stripe is enabled; free plan swaps stay local.</li>
        </ol>
      </Card>
    </div>
  )
}

function StatusCard({ data }: { data?: AdminPaymentGatewaySettings }) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-medium text-white">Payment gateway status</h2>
          <p className="mt-1 text-sm text-zinc-500">Stripe Checkout powers paid plan upgrades across workspaces.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={data?.enabled ? 'success' : 'neutral'}>{data?.enabled ? 'enabled' : 'disabled'}</Badge>
          <Badge tone={data?.configured ? 'success' : 'warning'}>{data?.configured ? 'ready' : 'not ready'}</Badge>
          <Badge tone="neutral">{data?.mode || 'test'}</Badge>
        </div>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        {[
          ['Secret key', data?.secret_source === 'none' ? 'missing' : sourceLabel(data?.secret_source)],
          ['Publishable key', data?.publishable_source === 'none' ? 'missing' : sourceLabel(data?.publishable_source)],
          ['Webhook secret', data?.webhook_configured ? sourceLabel(data?.webhook_source) : 'missing'],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-zinc-500">{label}</dt>
            <dd className="mt-1 text-zinc-200">{value}</dd>
          </div>
        ))}
      </dl>
      {data?.last_tested_at ? (
        <p className="mt-3 text-xs text-zinc-500">
          Last test {new Date(data.last_tested_at).toLocaleString()} · {data.last_test_status || '—'}
          {data.last_test_message ? ` — ${data.last_test_message}` : ''}
        </p>
      ) : null}
    </Card>
  )
}
