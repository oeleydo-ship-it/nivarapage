import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { adminApi, type AdminGoogleAuthSettings } from '../../lib/endpoints'
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
  return 'not set'
}

const PROMPT_LABELS: Record<string, string> = {
  select_account: 'Always ask which account (recommended)',
  consent: 'Always show the consent screen',
  none: 'Silent — reuse the active Google session',
}

export function GoogleAuthTab() {
  const qc = useQueryClient()
  const settings = useQuery({ queryKey: ['admin-google-auth'], queryFn: adminApi.googleAuth })

  const [enabled, setEnabled] = useState(false)
  const [allowRegistration, setAllowRegistration] = useState(true)
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [redirectUri, setRedirectUri] = useState('')
  const [allowedDomains, setAllowedDomains] = useState('')
  const [prompt, setPrompt] = useState('select_account')
  const [notice, setNotice] = useState<string | null>(null)
  const [testMessage, setTestMessage] = useState<string | null>(null)

  useEffect(() => {
    const data = settings.data
    if (!data) return
    setEnabled(Boolean(data.enabled))
    setAllowRegistration(Boolean(data.allow_registration))
    setClientId(data.client_id || '')
    setClientSecret('')
    setRedirectUri(data.redirect_source === 'settings' ? data.redirect_uri : '')
    setAllowedDomains(data.allowed_domains || '')
    setPrompt(data.prompt || 'select_account')
  }, [settings.data])

  const save = useMutation({
    mutationFn: () => {
      const body: Record<string, unknown> = {
        enabled,
        allow_registration: allowRegistration,
        prompt,
        client_id: clientId.trim(),
        allowed_domains: allowedDomains.trim(),
      }
      // Omitted fields keep their stored value; only send what the admin typed.
      if (clientSecret.trim() !== '') body.client_secret = clientSecret.trim()
      if (redirectUri.trim() !== '') body.redirect_uri = redirectUri.trim()
      return adminApi.updateGoogleAuth(body)
    },
    onSuccess: (data) => {
      setNotice('Google sign-in settings saved. The client secret is never returned to the dashboard.')
      setTestMessage(null)
      setClientSecret('')
      qc.setQueryData(['admin-google-auth'], data)
    },
  })

  const clearSecret = useMutation({
    mutationFn: () => adminApi.updateGoogleAuth({ client_secret: '' }),
    onSuccess: (data) => {
      setNotice('Stored client secret cleared. The GOOGLE_CLIENT_SECRET environment value is used if set.')
      setClientSecret('')
      qc.setQueryData(['admin-google-auth'], data)
    },
  })

  const clearRedirect = useMutation({
    mutationFn: () => adminApi.updateGoogleAuth({ redirect_uri: '' }),
    onSuccess: (data) => {
      setNotice('Custom redirect URI cleared. The default callback URL is used again.')
      setRedirectUri('')
      qc.setQueryData(['admin-google-auth'], data)
    },
  })

  const test = useMutation({
    mutationFn: adminApi.testGoogleAuth,
    onSuccess: (result) => {
      setTestMessage(result.message || (result.ok ? 'Credentials accepted.' : 'Credentials rejected.'))
      if (result.status) qc.setQueryData(['admin-google-auth'], result.status)
      else qc.invalidateQueries({ queryKey: ['admin-google-auth'] })
    },
    onError: (error) => {
      setTestMessage(nestedMessage(error, 'Credential check failed.'))
      if (error instanceof ApiError && error.body && typeof error.body === 'object') {
        const status = (error.body as { data?: { status?: AdminGoogleAuthSettings } }).data?.status
        if (status) qc.setQueryData(['admin-google-auth'], status)
      }
    },
  })

  const data = settings.data
  const busy = save.isPending || clearSecret.isPending || clearRedirect.isPending || test.isPending
  const callbackUrl = redirectUri.trim() || data?.redirect_uri || data?.default_redirect_uri || ''

  return (
    <div className="space-y-4">
      <StatusCard data={data} />

      <Card className="max-w-2xl space-y-4">
        <div>
          <h2 className="font-medium text-white">Google OAuth client</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Create an OAuth 2.0 Web application client in the{' '}
            <a
              className="text-blue-400 hover:text-blue-300"
              href={data?.console_url || 'https://console.cloud.google.com/apis/credentials'}
              target="_blank"
              rel="noreferrer"
            >
              Google Cloud console
            </a>
            , then paste its credentials here. Admin-stored values override environment variables.
          </p>
        </div>

        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="rounded border-zinc-700"
          />
          Enable “Continue with Google” on sign-in and sign-up
        </label>

        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={allowRegistration}
            onChange={(e) => setAllowRegistration(e.target.checked)}
            className="rounded border-zinc-700"
          />
          Let new people create an account with Google
        </label>
        {!allowRegistration ? (
          <p className="-mt-2 text-xs text-zinc-500">
            Only email addresses that already have an account will be able to sign in with Google.
          </p>
        ) : null}

        <div>
          <Label>Client ID</Label>
          <Input
            className="mt-1 font-mono text-xs"
            placeholder="1234567890-abc123.apps.googleusercontent.com"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-zinc-500">Source: {sourceLabel(data?.client_id_source)}</p>
        </div>

        <div>
          <Label>Client secret</Label>
          <Input
            className="mt-1 font-mono text-xs"
            type="password"
            placeholder={
              data?.client_secret_hint ? `Stored (${data.client_secret_hint}) — leave blank to keep` : 'GOCSPX-…'
            }
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            autoComplete="new-password"
          />
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span>Source: {sourceLabel(data?.client_secret_source)}</span>
            {data?.client_secret_source === 'settings' ? (
              <button
                type="button"
                className="text-amber-400 hover:text-amber-300"
                disabled={busy}
                onClick={() => clearSecret.mutate()}
              >
                Clear stored secret
              </button>
            ) : null}
          </div>
        </div>

        <div>
          <Label>Redirect URI override</Label>
          <Input
            className="mt-1 font-mono text-xs"
            placeholder={data?.default_redirect_uri || ''}
            value={redirectUri}
            onChange={(e) => setRedirectUri(e.target.value)}
            autoComplete="off"
          />
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span>Leave blank to use the default callback below.</span>
            {data?.redirect_source === 'settings' ? (
              <button
                type="button"
                className="text-amber-400 hover:text-amber-300"
                disabled={busy}
                onClick={() => clearRedirect.mutate()}
              >
                Reset to default
              </button>
            ) : null}
          </div>
        </div>

        <div>
          <Label>Restrict to email domains</Label>
          <Input
            className="mt-1 text-xs"
            placeholder="acme.com, partner.io — blank allows any domain"
            value={allowedDomains}
            onChange={(e) => setAllowedDomains(e.target.value)}
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Comma separated. Google accounts outside these domains are refused at sign-in.
          </p>
        </div>

        <div>
          <Label>Account chooser</Label>
          <Select className="mt-1 w-full" value={prompt} onChange={(e) => setPrompt(e.target.value)}>
            {(data?.prompts || ['select_account', 'consent', 'none']).map((option) => (
              <option key={option} value={option}>
                {PROMPT_LABELS[option] || option}
              </option>
            ))}
          </Select>
        </div>

        {callbackUrl ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs text-zinc-400">
            <div className="font-medium text-zinc-300">Authorized redirect URI</div>
            <code className="mt-1 block break-all text-zinc-200">{callbackUrl}</code>
            <p className="mt-2">
              Paste this exact value into your OAuth client under “Authorized redirect URIs”. Google rejects the sign-in
              if it does not match character for character.
            </p>
          </div>
        ) : null}

        {notice ? <p className="text-sm text-emerald-400">{notice}</p> : null}
        {save.isError ? (
          <p className="text-sm text-red-400">{nestedMessage(save.error, 'Could not save settings.')}</p>
        ) : null}
        {testMessage ? (
          <p className={`text-sm ${test.isError ? 'text-red-400' : 'text-emerald-400'}`}>{testMessage}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button disabled={busy} onClick={() => save.mutate()}>
            {save.isPending ? 'Saving…' : 'Save Google settings'}
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => test.mutate()}>
            {test.isPending ? 'Checking…' : 'Test credentials'}
          </Button>
        </div>
      </Card>

      <Card className="max-w-2xl">
        <h2 className="font-medium text-white">Setup checklist</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-400">
          <li>In Google Cloud → APIs &amp; Services → Credentials, create an OAuth client of type “Web application”.</li>
          <li>Add the authorized redirect URI shown above to that client.</li>
          <li>Configure the OAuth consent screen with your app name, support email, and logo.</li>
          <li>Paste the client ID and secret here, tick “Enable”, then run Test credentials.</li>
          <li>
            The “Continue with Google” button appears on the sign-in and sign-up screens only once this tab reports
            <span className="text-zinc-200"> ready</span>.
          </li>
        </ol>
      </Card>
    </div>
  )
}

function StatusCard({ data }: { data?: AdminGoogleAuthSettings }) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-medium text-white">Google sign-in status</h2>
          <p className="mt-1 text-sm text-zinc-500">
            One-click sign-in and sign-up for every workspace on this platform.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={data?.enabled ? 'success' : 'neutral'}>{data?.enabled ? 'enabled' : 'disabled'}</Badge>
          <Badge tone={data?.configured ? 'success' : 'warning'}>{data?.configured ? 'ready' : 'not ready'}</Badge>
          <Badge tone="neutral">{data?.allow_registration ? 'signup allowed' : 'existing users only'}</Badge>
        </div>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        {[
          ['Client ID', data?.client_id_source === 'none' ? 'missing' : sourceLabel(data?.client_id_source)],
          ['Client secret', data?.client_secret_configured ? sourceLabel(data?.client_secret_source) : 'missing'],
          ['Domain limit', data?.allowed_domains ? data.allowed_domains : 'any domain'],
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
