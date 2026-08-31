import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { adminApi, type AdminCloudflareSettings, type CloudflareFallbackOrigin } from '../../lib/endpoints'
import { ApiError } from '../../lib/api'
import { Badge, Button, Card, Input, Label, Select } from '../../ui/primitives'

function nestedMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.body && typeof error.body === 'object') {
    const body = error.body as { message?: unknown; data?: { message?: unknown } }
    if (typeof body.data?.message === 'string' && body.data.message) return body.data.message
    if (typeof body.message === 'string' && body.message) return body.message
  }
  return error instanceof Error && error.message ? error.message : fallback
}

function sourceLabel(source?: string) {
  if (source === 'settings') return 'stored in Admin'
  if (source === 'env') return 'from environment'
  if (source === 'fallback_origin') return 'same as fallback origin'
  return 'not set'
}

const VALIDATION_LABELS: Record<string, string> = {
  txt: 'TXT record (works before DNS points here — recommended)',
  http: 'HTTP file (only once the domain already resolves here)',
}

export function CloudflareTab() {
  const qc = useQueryClient()
  const settings = useQuery({ queryKey: ['admin-cloudflare'], queryFn: adminApi.cloudflare })

  const [enabled, setEnabled] = useState(false)
  const [apiToken, setApiToken] = useState('')
  const [zoneId, setZoneId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [fallbackOrigin, setFallbackOrigin] = useState('')
  const [cnameTarget, setCnameTarget] = useState('')
  const [apexIps, setApexIps] = useState('')
  const [sslValidation, setSslValidation] = useState('txt')
  const [minTls, setMinTls] = useState('1.2')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [testMessage, setTestMessage] = useState<string | null>(null)
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null)
  const [fallbackError, setFallbackError] = useState(false)

  useEffect(() => {
    const data = settings.data
    if (!data) return
    setEnabled(Boolean(data.enabled))
    setApiToken('')
    setWebhookSecret('')
    setZoneId(data.zone_id || '')
    setAccountId(data.account_id || '')
    setFallbackOrigin(data.fallback_origin || '')
    setCnameTarget(data.cname_target_source === 'fallback_origin' ? '' : data.cname_target || '')
    setApexIps(data.apex_ips || '')
    setSslValidation(data.ssl_validation || 'txt')
    setMinTls(data.min_tls_version || '1.2')
  }, [settings.data])

  const save = useMutation({
    mutationFn: () => {
      const body: Record<string, unknown> = {
        enabled,
        zone_id: zoneId.trim(),
        account_id: accountId.trim(),
        fallback_origin: fallbackOrigin.trim(),
        cname_target: cnameTarget.trim(),
        apex_ips: apexIps.trim(),
        ssl_validation: sslValidation,
        min_tls_version: minTls,
      }
      // Omitted secrets keep their stored value; only send what the admin typed.
      if (apiToken.trim() !== '') body.api_token = apiToken.trim()
      if (webhookSecret.trim() !== '') body.webhook_secret = webhookSecret.trim()
      return adminApi.updateCloudflare(body)
    },
    onSuccess: (data) => {
      setNotice('Cloudflare settings saved. The API token is never returned to the dashboard.')
      setTestMessage(null)
      setApiToken('')
      setWebhookSecret('')
      qc.setQueryData(['admin-cloudflare'], data)
      qc.invalidateQueries({ queryKey: ['admin-cloudflare-fallback'] })
    },
  })

  const clearToken = useMutation({
    mutationFn: () => adminApi.updateCloudflare({ api_token: '' }),
    onSuccess: (data) => {
      setNotice('Stored API token cleared. The CLOUDFLARE_API_TOKEN environment value is used if set.')
      setApiToken('')
      qc.setQueryData(['admin-cloudflare'], data)
    },
  })

  const test = useMutation({
    mutationFn: adminApi.testCloudflare,
    onSuccess: (result) => {
      setTestMessage(result.message || (result.ok ? 'Cloudflare reachable.' : 'Cloudflare rejected the credentials.'))
      if (result.status) qc.setQueryData(['admin-cloudflare'], result.status)
      else qc.invalidateQueries({ queryKey: ['admin-cloudflare'] })
      qc.invalidateQueries({ queryKey: ['admin-cloudflare-fallback'] })
    },
    onError: (error) => {
      setTestMessage(nestedMessage(error, 'Connection check failed.'))
      if (error instanceof ApiError && error.body && typeof error.body === 'object') {
        const status = (error.body as { data?: { status?: AdminCloudflareSettings } }).data?.status
        if (status) qc.setQueryData(['admin-cloudflare'], status)
      }
    },
  })

  const data = settings.data
  const busy = save.isPending || clearToken.isPending || test.isPending

  return (
    <div className="space-y-4">
      <StatusCard data={data} />

      <Card className="max-w-2xl space-y-4">
        <div>
          <h2 className="font-medium text-white">Cloudflare for SaaS</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Custom customer domains are issued HTTPS certificates through Cloudflare for SaaS custom hostnames. Paste an
            API token scoped to your zone here — values stored in Admin override the CLOUDFLARE_* environment variables.
          </p>
        </div>

        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="rounded border-zinc-700"
          />
          Enable Cloudflare for SaaS custom hostnames
        </label>
        {!enabled ? (
          <p className="-mt-2 text-xs text-zinc-500">
            While this is off, customers can still add a domain but it stays on the built-in stub provider — no
            certificate is requested and the domain never goes live.
          </p>
        ) : null}

        <div>
          <Label>API token</Label>
          <Input
            className="mt-1 font-mono text-xs"
            type="password"
            placeholder={data?.api_token_hint ? `Stored (${data.api_token_hint}) — leave blank to keep` : 'Cloudflare API token'}
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            autoComplete="new-password"
          />
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span>Source: {sourceLabel(data?.api_token_source)}</span>
            <span>Needs Zone: Read plus SSL and Certificates: Edit on the zone below.</span>
            {data?.api_token_source === 'settings' ? (
              <button
                type="button"
                className="text-amber-400 hover:text-amber-300"
                disabled={busy}
                onClick={() => clearToken.mutate()}
              >
                Clear stored token
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Zone ID</Label>
            <Input
              className="mt-1 font-mono text-xs"
              placeholder="32-character zone ID"
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-zinc-500">Source: {sourceLabel(data?.zone_id_source)}</p>
          </div>
          <div>
            <Label>Account ID</Label>
            <Input
              className="mt-1 font-mono text-xs"
              placeholder="Optional — used for dashboard links"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-zinc-500">Source: {sourceLabel(data?.account_id_source)}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Fallback origin</Label>
            <Input
              className="mt-1 font-mono text-xs"
              placeholder="fallback.example.com"
              value={fallbackOrigin}
              onChange={(e) => setFallbackOrigin(e.target.value)}
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-zinc-500">
              A hostname inside your zone that every custom hostname proxies to. Source:{' '}
              {sourceLabel(data?.fallback_origin_source)}
            </p>
          </div>
          <div>
            <Label>CNAME target for customers</Label>
            <Input
              className="mt-1 font-mono text-xs"
              placeholder={data?.fallback_origin || 'cname.example.com'}
              value={cnameTarget}
              onChange={(e) => setCnameTarget(e.target.value)}
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Shown in the customer DNS instructions. Blank uses the fallback origin. Source:{' '}
              {sourceLabel(data?.cname_target_source)}
            </p>
          </div>
        </div>

        <div>
          <Label>Apex address override</Label>
          <Input
            className="mt-1 font-mono text-xs"
            placeholder="198.51.100.10, 198.51.100.11 — blank resolves the CNAME target instead"
            value={apexIps}
            onChange={(e) => setApexIps(e.target.value)}
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Root domains cannot take a CNAME, so customers are given A records instead. Leave this blank and we use
            whatever the CNAME target resolves to. Set it only on a deployment with its own dedicated or BYOIP
            addresses. IPv4 and IPv6, comma separated.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Certificate validation</Label>
            <Select className="mt-1 w-full" value={sslValidation} onChange={(e) => setSslValidation(e.target.value)}>
              {(data?.ssl_validations || ['txt', 'http']).map((option) => (
                <option key={option} value={option}>
                  {VALIDATION_LABELS[option] || option}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Minimum TLS version</Label>
            <Select className="mt-1 w-full" value={minTls} onChange={(e) => setMinTls(e.target.value)}>
              {(data?.tls_versions || ['1.0', '1.1', '1.2', '1.3']).map((option) => (
                <option key={option} value={option}>
                  TLS {option}
                  {option === '1.2' ? ' (recommended)' : ''}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label>Webhook secret</Label>
          <Input
            className="mt-1 font-mono text-xs"
            type="password"
            placeholder={
              data?.webhook_secret_hint ? `Stored (${data.webhook_secret_hint}) — leave blank to keep` : 'Optional'
            }
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            autoComplete="new-password"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Signs Cloudflare custom-hostname notifications. Source: {sourceLabel(data?.webhook_secret_source)}
          </p>
        </div>

        {notice ? <p className="text-sm text-emerald-400">{notice}</p> : null}
        {save.isError ? (
          <p className="text-sm text-red-400">{nestedMessage(save.error, 'Could not save settings.')}</p>
        ) : null}
        {testMessage ? (
          <p className={`text-sm ${test.isError ? 'text-red-400' : 'text-emerald-400'}`}>{testMessage}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button disabled={busy} onClick={() => save.mutate()}>
            {save.isPending ? 'Saving…' : 'Save Cloudflare settings'}
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => test.mutate()}>
            {test.isPending ? 'Checking…' : 'Test connection'}
          </Button>
        </div>
      </Card>

      <ApexAddressesCard data={data} />

      <FallbackOriginCard
        data={data}
        message={fallbackMessage}
        isError={fallbackError}
        onMessage={(message, isError) => {
          setFallbackMessage(message)
          setFallbackError(isError)
        }}
      />

      <Card className="max-w-2xl">
        <h2 className="font-medium text-white">Setup checklist</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-400">
          <li>Add the zone that hosts your platform domain to Cloudflare and enable Cloudflare for SaaS on it.</li>
          <li>
            Create a proxied DNS record inside that zone for the fallback origin (for example{' '}
            <code className="text-zinc-200">{data?.fallback_origin || 'fallback.example.com'}</code>) pointing at this
            application, and make sure it serves HTTPS.
          </li>
          <li>
            Create an API token with <span className="text-zinc-200">Zone: Read</span> and{' '}
            <span className="text-zinc-200">SSL and Certificates: Edit</span> on that zone, paste it above with the zone
            ID, then run Test connection.
          </li>
          <li>Press “Sync fallback origin” so Cloudflare routes every custom hostname to it.</li>
          <li>
            Customers then CNAME their domain to{' '}
            <code className="text-zinc-200">{data?.cname_target || 'your CNAME target'}</code> and add the TXT records
            the dashboard shows them. Certificates issue automatically once DNS resolves.
          </li>
          <li>
            Root domains (<code className="text-zinc-200">example.com</code>) work too: they get an ALIAS record, or the
            A records above when their provider has no ALIAS/ANAME support.
          </li>
        </ol>
      </Card>
    </div>
  )
}

/**
 * Root domains are given A/AAAA records rather than a CNAME. This shows which
 * addresses customers are currently handed, and where they came from.
 */
function ApexAddressesCard({ data }: { data?: AdminCloudflareSettings }) {
  const qc = useQueryClient()
  const addresses = data?.apex_addresses
  const ipv4 = addresses?.ipv4 || []
  const ipv6 = addresses?.ipv6 || []
  const found = ipv4.length + ipv6.length > 0

  const refresh = useMutation({
    mutationFn: () => adminApi.cloudflareApexAddresses(true),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-cloudflare'] }),
  })

  return (
    <Card className="max-w-2xl space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-medium text-white">Root domain addresses</h2>
          <p className="mt-1 text-sm text-zinc-500">
            A customer connecting <code className="text-zinc-300">example.com</code> gets an ALIAS record when their DNS
            provider supports one, and these A/AAAA records when it does not.
          </p>
        </div>
        <Badge tone={found ? 'success' : 'warning'}>
          {addresses?.source === 'configured' ? 'override' : found ? 'resolved' : 'none'}
        </Badge>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500">Resolved from</dt>
          <dd className="mt-1 break-all text-zinc-200">
            {addresses?.source === 'configured' ? 'Admin override' : addresses?.target || '—'}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">A records handed out</dt>
          <dd className="mt-1 break-all font-mono text-xs text-zinc-200">{ipv4.join(', ') || 'none'}</dd>
        </div>
        {ipv6.length ? (
          <div className="sm:col-span-2">
            <dt className="text-zinc-500">AAAA records handed out</dt>
            <dd className="mt-1 break-all font-mono text-xs text-zinc-200">{ipv6.join(', ')}</dd>
          </div>
        ) : null}
      </dl>

      {found && addresses?.source === 'resolved' ? (
        <p className="text-xs text-zinc-500">
          These must be Cloudflare edge addresses. If you recognise your own server&apos;s IP here, the{' '}
          {addresses.target} record in your zone is not proxied (grey cloud) — customer root domains would then bypass
          Cloudflare and fail TLS.
        </p>
      ) : null}

      {!found ? (
        <p className="text-sm text-amber-400">
          {addresses?.target
            ? `${addresses.target} does not resolve to any address yet, so root domains only get the ALIAS record. Create and proxy that DNS record in your Cloudflare zone, then refresh.`
            : 'Set a fallback origin or CNAME target above so root domains have somewhere to point.'}
        </p>
      ) : null}

      <div>
        <Button variant="outline" disabled={refresh.isPending} onClick={() => refresh.mutate()}>
          {refresh.isPending ? 'Looking up…' : 'Re-check DNS'}
        </Button>
      </div>
    </Card>
  )
}

function FallbackOriginCard({
  data,
  message,
  isError,
  onMessage,
}: {
  data?: AdminCloudflareSettings
  message: string | null
  isError: boolean
  onMessage: (message: string | null, isError: boolean) => void
}) {
  const qc = useQueryClient()
  const ready = Boolean(data?.api_token_configured && data?.zone_id)

  const live = useQuery<CloudflareFallbackOrigin>({
    queryKey: ['admin-cloudflare-fallback'],
    queryFn: adminApi.cloudflareFallbackOrigin,
    enabled: ready,
  })

  const sync = useMutation({
    mutationFn: adminApi.syncCloudflareFallbackOrigin,
    onSuccess: (result) => {
      onMessage(result.message || 'Fallback origin synced.', !result.ok)
      if (result.status) qc.setQueryData(['admin-cloudflare'], result.status)
      qc.invalidateQueries({ queryKey: ['admin-cloudflare-fallback'] })
    },
    onError: (error) => onMessage(nestedMessage(error, 'Could not set the fallback origin.'), true),
  })

  const current = live.data
  const tone = !ready ? 'neutral' : current?.matches && current.status === 'active' ? 'success' : 'warning'

  return (
    <Card className="max-w-2xl space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-medium text-white">Zone fallback origin</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Cloudflare sends traffic for every custom hostname to this record. Until it is set and active, connected
            domains resolve but return an error.
          </p>
        </div>
        <Badge tone={tone}>{!ready ? 'not configured' : current?.status || 'unknown'}</Badge>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500">Configured here</dt>
          <dd className="mt-1 break-all text-zinc-200">{data?.fallback_origin || '—'}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Live on Cloudflare</dt>
          <dd className="mt-1 break-all text-zinc-200">
            {live.isLoading ? 'checking…' : current?.origin || (ready ? 'not set' : '—')}
          </dd>
        </div>
      </dl>

      {ready && current && !current.matches && current.origin ? (
        <p className="text-sm text-amber-400">
          Cloudflare is using {current.origin}, not {data?.fallback_origin}. Sync to change it.
        </p>
      ) : null}
      {current?.errors?.length ? (
        <ul className="list-disc space-y-1 pl-5 text-sm text-amber-400">
          {current.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
      {message ? <p className={`text-sm ${isError ? 'text-red-400' : 'text-emerald-400'}`}>{message}</p> : null}
      {data?.fallback_synced_at ? (
        <p className="text-xs text-zinc-500">
          Last sync {new Date(data.fallback_synced_at).toLocaleString()} · {data.fallback_status || '—'}
          {data.fallback_message ? ` — ${data.fallback_message}` : ''}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button disabled={!ready || sync.isPending} onClick={() => sync.mutate()}>
          {sync.isPending ? 'Syncing…' : 'Sync fallback origin'}
        </Button>
        <Button
          variant="outline"
          disabled={!ready || live.isFetching}
          onClick={() => qc.invalidateQueries({ queryKey: ['admin-cloudflare-fallback'] })}
        >
          {live.isFetching ? 'Refreshing…' : 'Refresh status'}
        </Button>
      </div>
    </Card>
  )
}

function StatusCard({ data }: { data?: AdminCloudflareSettings }) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-medium text-white">Custom domain HTTPS</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Cloudflare for SaaS issues and renews the certificate for every customer domain connected on this platform.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={data?.enabled ? 'success' : 'neutral'}>{data?.enabled ? 'enabled' : 'disabled'}</Badge>
          <Badge tone={data?.configured ? 'success' : 'warning'}>{data?.configured ? 'ready' : 'not ready'}</Badge>
          <Badge tone={data?.live ? 'success' : 'neutral'}>{data?.live ? 'live provider' : 'stub provider'}</Badge>
        </div>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        {[
          ['API token', data?.api_token_configured ? sourceLabel(data.api_token_source) : 'missing'],
          ['Zone', data?.zone_id ? `${data.zone_id} (${sourceLabel(data.zone_id_source)})` : 'missing'],
          ['CNAME target', data?.cname_target || 'missing'],
          ['Fallback origin', data?.fallback_origin || 'missing'],
          ['Validation', data?.ssl_validation ? data.ssl_validation.toUpperCase() : '—'],
          ['Minimum TLS', data?.min_tls_version ? `TLS ${data.min_tls_version}` : '—'],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-zinc-500">{label}</dt>
            <dd className="mt-1 break-words text-zinc-200">{value}</dd>
          </div>
        ))}
      </dl>
      {data?.last_tested_at ? (
        <p className="mt-3 text-xs text-zinc-500">
          Last check {new Date(data.last_tested_at).toLocaleString()} · {data.last_test_status || '—'}
          {data.last_test_message ? ` — ${data.last_test_message}` : ''}
        </p>
      ) : null}
    </Card>
  )
}
