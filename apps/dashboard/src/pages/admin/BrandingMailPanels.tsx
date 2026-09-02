import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Send, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { adminApi } from '../../lib/endpoints'
import { Badge, Button, Card, Input, Label, Select } from '../../ui/primitives'

function errorText(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

/* ------------------------------------------------------------------ branding */

function LogoSlot({
  variant,
  url,
  label,
  hint,
  accept = 'image/png,image/jpeg,image/webp,image/svg+xml',
  emptyText = 'No logo — the wordmark is used',
  previewClassName = 'max-h-12 max-w-full object-contain',
  onChanged,
}: {
  variant: 'light' | 'dark' | 'favicon'
  url: string | null
  label: string
  hint: string
  accept?: string
  emptyText?: string
  previewClassName?: string
  onChanged: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  const upload = useMutation({
    mutationFn: (file: File) => adminApi.uploadLogo(file, variant),
    onSuccess: () => {
      setError('')
      onChanged()
    },
    onError: (e: unknown) => setError(errorText(e, 'Upload failed.')),
  })
  const clear = useMutation({
    mutationFn: () => adminApi.clearLogo(variant),
    onSuccess: () => onChanged(),
  })

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div className="text-sm font-medium text-white">{label}</div>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
      <div
        className={`mt-3 flex h-20 items-center justify-center rounded-lg border border-dashed border-zinc-700 px-4 ${
          variant === 'dark' ? 'bg-zinc-950' : 'bg-white'
        }`}
      >
        {url ? (
          <img src={url} alt={`${label} preview`} className={previewClassName} />
        ) : (
          <span className="text-xs text-zinc-500">{emptyText}</span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) upload.mutate(file)
            e.target.value = ''
          }}
        />
        <Button variant="outline" disabled={upload.isPending} onClick={() => fileRef.current?.click()}>
          <Upload size={15} />
          {upload.isPending ? 'Uploading…' : url ? 'Replace' : 'Upload'}
        </Button>
        {url ? (
          <Button variant="ghost" disabled={clear.isPending} onClick={() => clear.mutate()}>
            <Trash2 size={15} />
            Remove
          </Button>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </div>
  )
}

export function BrandingPanel() {
  const qc = useQueryClient()
  const branding = useQuery({ queryKey: ['admin-branding'], queryFn: adminApi.branding })

  // The sidebar and sign-in screen read the public endpoint, so refresh both.
  const onChanged = () => {
    void qc.invalidateQueries({ queryKey: ['admin-branding'] })
    void qc.invalidateQueries({ queryKey: ['branding'] })
  }

  return (
    <Card className="max-w-xl space-y-3">
      <div>
        <h2 className="font-medium text-white">Logo</h2>
        <p className="text-sm text-zinc-500">
          Replaces the wordmark in the sidebar and on the sign-in screen. PNG, JPEG, WebP or SVG, up to 2 MB.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <LogoSlot
          variant="light"
          label="Logo"
          hint="Used everywhere unless a dark variant is set."
          url={branding.data?.logo_url ?? null}
          onChanged={onChanged}
        />
        <LogoSlot
          variant="dark"
          label="Dark background logo"
          hint="Optional. Used where the surface behind it is dark."
          url={branding.data?.logo_dark_url ?? null}
          onChanged={onChanged}
        />
      </div>
    </Card>
  )
}

export function FaviconPanel() {
  const qc = useQueryClient()
  const branding = useQuery({ queryKey: ['admin-branding'], queryFn: adminApi.branding })

  const onChanged = () => {
    void qc.invalidateQueries({ queryKey: ['admin-branding'] })
    void qc.invalidateQueries({ queryKey: ['branding'] })
  }

  return (
    <Card className="max-w-xl space-y-3">
      <div>
        <h2 className="font-medium text-white">Favicon</h2>
        <p className="text-sm text-zinc-500">
          The browser-tab icon for the dashboard and sign-in screens. ICO, PNG or SVG, up to 2 MB.
        </p>
      </div>
      <div className="max-w-[220px]">
        <LogoSlot
          variant="favicon"
          label="Favicon"
          hint="Square works best — it's shown small."
          accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml,.ico"
          emptyText="No custom favicon — the default is used"
          previewClassName="h-8 w-8 object-contain"
          url={branding.data?.favicon_url ?? null}
          onChanged={onChanged}
        />
      </div>
    </Card>
  )
}

/* ---------------------------------------------------------------------- smtp */

const TRANSPORTS: Array<{ value: string; label: string }> = [
  { value: 'smtp', label: 'SMTP server' },
  { value: 'log', label: 'Write to the log (no delivery)' },
  { value: 'array', label: 'Discard (testing only)' },
]

export function MailPanel() {
  const qc = useQueryClient()
  const mail = useQuery({ queryKey: ['admin-mail-settings'], queryFn: adminApi.mailSettings })

  const [form, setForm] = useState({
    transport: 'smtp',
    host: '',
    port: 587,
    encryption: 'tls',
    username: '',
    from_address: '',
    from_name: '',
  })
  // Empty means "leave the stored password alone"; the user must opt in to
  // changing it, so a save never wipes a working secret by accident.
  const [password, setPassword] = useState('')
  const [clearPassword, setClearPassword] = useState(false)
  const [testTo, setTestTo] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    const data = mail.data
    if (!data) return
    setForm({
      transport: data.transport || 'smtp',
      host: data.host || '',
      port: data.port || 587,
      encryption: data.encryption || 'tls',
      username: data.username || '',
      from_address: data.from_address || '',
      from_name: data.from_name || '',
    })
  }, [mail.data])

  const save = useMutation({
    mutationFn: () => {
      const body: Record<string, unknown> = { ...form }
      if (clearPassword) body.password = ''
      else if (password) body.password = password
      return adminApi.updateMailSettings(body)
    },
    onSuccess: () => {
      setNotice('Mail settings saved.')
      setPassword('')
      setClearPassword(false)
      void qc.invalidateQueries({ queryKey: ['admin-mail-settings'] })
    },
    onError: () => setNotice(null),
  })

  const test = useMutation({
    mutationFn: () => adminApi.testMailSettings(testTo),
    onSuccess: (result) => {
      setNotice(result.message || 'Test message sent.')
      void qc.invalidateQueries({ queryKey: ['admin-mail-settings'] })
    },
    onError: () => setNotice(null),
  })

  const status = mail.data
  const isSmtp = form.transport === 'smtp'

  return (
    <Card className="max-w-xl space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-medium text-white">Outbound mail</h2>
          <p className="text-sm text-zinc-500">
            Used for password resets, invitations and notifications. Leave a field blank to fall back to the
            deployment&rsquo;s own MAIL_* configuration.
          </p>
        </div>
        {status ? <Badge tone={status.configured ? 'success' : 'warning'}>{status.configured ? 'Configured' : 'Incomplete'}</Badge> : null}
      </div>

      {notice ? <p className="text-sm text-emerald-400">{notice}</p> : null}
      {save.isError ? <p className="text-sm text-red-400">{errorText(save.error, 'Save failed.')}</p> : null}
      {test.isError ? <p className="text-sm text-red-400">{errorText(test.error, 'The test message could not be sent.')}</p> : null}

      <div>
        <Label>Transport</Label>
        <Select
          className="w-full"
          value={form.transport}
          onChange={(e) => setForm((f) => ({ ...f, transport: e.target.value }))}
        >
          {TRANSPORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {isSmtp ? (
        <>
          <div className="grid grid-cols-[1fr_110px] gap-3">
            <div>
              <Label>Host</Label>
              <Input
                value={form.host}
                placeholder="smtp.example.com"
                onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))}
              />
            </div>
            <div>
              <Label>Port</Label>
              <Input
                type="number"
                min={1}
                max={65535}
                value={form.port}
                onChange={(e) => setForm((f) => ({ ...f, port: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Encryption</Label>
              <Select
                className="w-full"
                value={form.encryption}
                onChange={(e) => setForm((f) => ({ ...f, encryption: e.target.value }))}
              >
                <option value="tls">STARTTLS (usually port 587)</option>
                <option value="ssl">SSL/TLS (usually port 465)</option>
                <option value="none">None</option>
              </Select>
            </div>
            <div>
              <Label>Username</Label>
              <Input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
            </div>
          </div>

          <div>
            <Label>Password</Label>
            <Input
              type="password"
              autoComplete="new-password"
              value={password}
              disabled={clearPassword}
              placeholder={status?.password_set ? 'Stored — leave blank to keep it' : 'Not set'}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              <span>
                {status?.password_source === 'database'
                  ? 'Saved here, encrypted at rest.'
                  : status?.password_source === 'env'
                    ? 'Coming from the deployment environment.'
                    : 'No password set.'}
              </span>
              {status?.password_source === 'database' ? (
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked={clearPassword} onChange={(e) => setClearPassword(e.target.checked)} />
                  Clear it
                </label>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>From address</Label>
          <Input
            type="email"
            value={form.from_address}
            placeholder="noreply@example.com"
            onChange={(e) => setForm((f) => ({ ...f, from_address: e.target.value }))}
          />
        </div>
        <div>
          <Label>From name</Label>
          <Input value={form.from_name} onChange={(e) => setForm((f) => ({ ...f, from_name: e.target.value }))} />
        </div>
      </div>

      <Button disabled={save.isPending} onClick={() => save.mutate()}>
        {save.isPending ? 'Saving…' : 'Save mail settings'}
      </Button>

      <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <div className="text-sm font-medium text-white">Send a test message</div>
        <p className="text-xs text-zinc-500">Save first — the test uses the settings currently stored.</p>
        <div className="flex flex-wrap gap-2">
          <Input
            type="email"
            className="min-w-[220px] flex-1"
            value={testTo}
            placeholder="you@example.com"
            onChange={(e) => setTestTo(e.target.value)}
          />
          <Button variant="outline" disabled={!testTo || test.isPending} onClick={() => test.mutate()}>
            <Send size={15} />
            {test.isPending ? 'Sending…' : 'Send test'}
          </Button>
        </div>
        {status?.last_test_status ? (
          <p className={`text-xs ${status.last_test_status === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
            Last test: {status.last_test_message || status.last_test_status}
          </p>
        ) : null}
      </div>
    </Card>
  )
}
