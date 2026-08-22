import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { adminApi, type AdminStorageSettings } from '../../lib/endpoints'
import { ApiError } from '../../lib/api'
import { Badge, Button, Card, Input, Label, Select } from '../../ui/primitives'
import { StorageTab as UsageTab } from './BillingTabs'

const FALLBACK_LABELS: Record<string, string> = {
  local: 'Local server (public disk)',
  aws_s3: 'Amazon S3',
  digitalocean: 'DigitalOcean Spaces',
  cloudflare_r2: 'Cloudflare R2',
  wasabi: 'Wasabi Hot Cloud Storage',
  s3_compatible: 'Custom S3-compatible',
}

const WASABI_REGIONS = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-central-1',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'ap-northeast-1',
  'ap-northeast-2',
]

function wasabiEndpoint(region: string) {
  const value = region.trim() || 'us-east-1'
  return value === 'us-east-1' ? 'https://s3.wasabisys.com' : `https://s3.${value}.wasabisys.com`
}

function wasabiPublicUrl(bucket: string, region: string) {
  if (!bucket.trim()) return ''
  const host = wasabiEndpoint(region).replace(/^https?:\/\//, '')
  return `https://${bucket.trim()}.${host}`
}

function nestedMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.body && typeof error.body === 'object') {
    const body = error.body as { message?: unknown; data?: { message?: unknown } }
    if (typeof body.data?.message === 'string' && body.data.message) return body.data.message
    if (typeof body.message === 'string' && body.message) return body.message
  }
  return error instanceof Error && error.message ? error.message : fallback
}

function keySourceLabel(source?: string) {
  if (source === 'settings') return 'stored in Admin'
  if (source === 'env') return 'from environment'
  return 'not set'
}

export function MediaStorageTab() {
  const qc = useQueryClient()
  const settings = useQuery({ queryKey: ['admin-storage-settings'], queryFn: adminApi.storageSettings })

  const [provider, setProvider] = useState('local')
  const [bucket, setBucket] = useState('')
  const [region, setRegion] = useState('')
  const [endpoint, setEndpoint] = useState('')
  const [publicUrl, setPublicUrl] = useState('')
  const [root, setRoot] = useState('')
  const [pathStyle, setPathStyle] = useState(false)
  const [accessKeyId, setAccessKeyId] = useState('')
  const [secretAccessKey, setSecretAccessKey] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [testMessage, setTestMessage] = useState<string | null>(null)

  useEffect(() => {
    const data = settings.data
    if (!data) return
    setProvider(data.provider || 'local')
    setBucket(data.bucket || '')
    setRegion(data.region || '')
    setEndpoint(data.endpoint || '')
    setPublicUrl(data.public_url || '')
    setRoot(data.root || '')
    setPathStyle(Boolean(data.use_path_style_endpoint))
    setAccessKeyId('')
    setSecretAccessKey('')
  }, [settings.data])

  const save = useMutation({
    mutationFn: () => {
      const body: Record<string, unknown> = {
        provider,
        bucket: bucket.trim() || null,
        region: region.trim() || null,
        endpoint: endpoint.trim() || null,
        public_url: publicUrl.trim() || null,
        root: root.trim() || null,
        use_path_style_endpoint: pathStyle,
      }
      if (accessKeyId.trim() !== '') body.access_key_id = accessKeyId.trim()
      if (secretAccessKey.trim() !== '') body.secret_access_key = secretAccessKey.trim()
      return adminApi.updateStorageSettings(body)
    },
    onSuccess: (data) => {
      setNotice('Storage settings saved. New uploads use this destination for every workspace.')
      setTestMessage(null)
      setAccessKeyId('')
      setSecretAccessKey('')
      qc.setQueryData(['admin-storage-settings'], data)
    },
  })

  const clearKeys = useMutation({
    mutationFn: () => adminApi.updateStorageSettings({ access_key_id: '', secret_access_key: '' }),
    onSuccess: (data) => {
      setNotice('Stored keys cleared. Environment credentials are used if set.')
      setAccessKeyId('')
      setSecretAccessKey('')
      qc.setQueryData(['admin-storage-settings'], data)
    },
  })

  const test = useMutation({
    mutationFn: adminApi.testStorageSettings,
    onSuccess: (result) => {
      setTestMessage(result.message || (result.ok ? 'Connection succeeded.' : 'Connection failed.'))
      if (result.status) qc.setQueryData(['admin-storage-settings'], result.status)
      else qc.invalidateQueries({ queryKey: ['admin-storage-settings'] })
    },
    onError: (error) => {
      setTestMessage(nestedMessage(error, 'Connection failed.'))
      if (error instanceof ApiError && error.body && typeof error.body === 'object') {
        const status = (error.body as { data?: { status?: AdminStorageSettings } }).data?.status
        if (status) qc.setQueryData(['admin-storage-settings'], status)
      }
    },
  })

  const data = settings.data
  const external = provider !== 'local'
  const labels = data?.provider_labels || FALLBACK_LABELS

  return (
    <div className="space-y-4">
      <StatusCard data={data} />

      <Card className="max-w-2xl space-y-3">
        <h2 className="font-medium text-white">Upload destination</h2>
        <p className="text-sm text-zinc-500">
          Choose where all tenant media uploads are stored. Supported: local disk, Amazon S3,
          DigitalOcean Spaces, Cloudflare R2, Wasabi, or any custom S3-compatible host.
        </p>
        {notice ? <p className="text-sm text-emerald-400">{notice}</p> : null}
        {save.isError ? (
          <p className="text-sm text-red-400">{save.error instanceof Error ? save.error.message : 'Save failed'}</p>
        ) : null}

        <div>
          <Label>Provider</Label>
          <Select
            className="w-full"
            value={provider}
            onChange={(event) => {
              const next = event.target.value
              setProvider(next)
              if (next === 'digitalocean' && !region) setRegion('nyc3')
              if (next === 'cloudflare_r2') {
                setPathStyle(true)
                if (!region) setRegion('auto')
              }
              if (next === 'aws_s3' && !region) setRegion('us-east-1')
              if (next === 'wasabi') {
                const nextRegion = region && WASABI_REGIONS.includes(region) ? region : 'us-east-1'
                setRegion(nextRegion)
                setPathStyle(false)
                setEndpoint(wasabiEndpoint(nextRegion))
                if (bucket.trim() && !publicUrl.trim()) {
                  setPublicUrl(wasabiPublicUrl(bucket, nextRegion))
                }
              }
              if (next === 's3_compatible') setPathStyle(true)
            }}
          >
            {(data?.providers || Object.keys(FALLBACK_LABELS)).map((item) => (
              <option key={item} value={item}>
                {labels[item] || FALLBACK_LABELS[item] || item}
              </option>
            ))}
          </Select>
        </div>

        {external ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Bucket</Label>
                <Input value={bucket} onChange={(event) => setBucket(event.target.value)} placeholder="my-media-bucket" />
              </div>
              <div>
                <Label>Region</Label>
                {provider === 'wasabi' ? (
                  <Select
                    className="w-full"
                    value={(data?.regions?.wasabi || WASABI_REGIONS).includes(region) ? region : 'us-east-1'}
                    onChange={(event) => {
                      const nextRegion = event.target.value
                      setRegion(nextRegion)
                      setEndpoint(wasabiEndpoint(nextRegion))
                      if (bucket.trim()) {
                        setPublicUrl(wasabiPublicUrl(bucket, nextRegion))
                      }
                    }}
                  >
                    {(data?.regions?.wasabi || WASABI_REGIONS).map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    value={region}
                    onChange={(event) => setRegion(event.target.value)}
                    placeholder={provider === 'digitalocean' ? 'nyc3' : provider === 'cloudflare_r2' ? 'auto' : 'us-east-1'}
                  />
                )}
              </div>
            </div>
            <div>
              <Label>Endpoint</Label>
              <Input
                value={endpoint}
                onChange={(event) => setEndpoint(event.target.value)}
                placeholder={
                  provider === 'digitalocean'
                    ? 'https://nyc3.digitaloceanspaces.com'
                    : provider === 'cloudflare_r2'
                      ? 'https://<accountid>.r2.cloudflarestorage.com'
                      : provider === 'wasabi'
                        ? 'https://s3.wasabisys.com'
                        : 'https://s3.amazonaws.com'
                }
              />
              <p className="mt-1 text-xs text-zinc-500">
                {provider === 'digitalocean'
                  ? 'Defaults to https://{region}.digitaloceanspaces.com when left blank.'
                  : provider === 'wasabi'
                    ? 'Auto-filled from region (e.g. https://s3.wasabisys.com). Leave blank to use the default.'
                    : provider === 'aws_s3'
                      ? 'Leave blank for standard AWS endpoints.'
                      : 'Required for R2 and most custom S3-compatible hosts.'}
              </p>
            </div>
            <div>
              <Label>Public / CDN URL</Label>
              <Input
                value={publicUrl}
                onChange={(event) => setPublicUrl(event.target.value)}
                placeholder={
                  provider === 'wasabi'
                    ? bucket
                      ? wasabiPublicUrl(bucket, region || 'us-east-1')
                      : 'https://your-bucket.s3.wasabisys.com'
                    : 'https://cdn.example.com'
                }
              />
              <p className="mt-1 text-xs text-zinc-500">
                {provider === 'wasabi'
                  ? 'Public base URL for website images. Make the bucket (or objects) publicly readable, or point this at a CDN in front of Wasabi.'
                  : 'Public base URL used in published websites for images. Use your CDN origin so browsers can load assets without signing.'}
              </p>
            </div>
            <div>
              <Label>Root prefix (optional)</Label>
              <Input value={root} onChange={(event) => setRoot(event.target.value)} placeholder="uidesired" />
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" checked={pathStyle} onChange={(event) => setPathStyle(event.target.checked)} />
              Path-style endpoint (needed for MinIO / some S3-compatible hosts)
            </label>
            <div>
              <Label>Access key ID</Label>
              <Input
                type="password"
                autoComplete="off"
                value={accessKeyId}
                onChange={(event) => setAccessKeyId(event.target.value)}
                placeholder={data?.key_hint ? `Key on file (${data.key_hint})` : 'Access key'}
              />
            </div>
            <div>
              <Label>Secret access key</Label>
              <Input
                type="password"
                autoComplete="off"
                value={secretAccessKey}
                onChange={(event) => setSecretAccessKey(event.target.value)}
                placeholder="Leave blank to keep the stored secret"
              />
              <p className="mt-1 text-xs text-zinc-500">
                {data?.configured
                  ? `Configured ${keySourceLabel(data.key_source)}${data.key_hint ? ` · ${data.key_hint}` : ''}.`
                  : 'No keys configured. Paste keys here or set WASABI_* / AWS_* / R2_* in the environment.'}
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-zinc-400">
            Files are stored on this server under the local public disk and served from{' '}
            <code className="text-zinc-300">/storage/…</code>.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? 'Saving…' : 'Save settings'}
          </Button>
          <Button variant="outline" disabled={test.isPending} onClick={() => test.mutate()}>
            {test.isPending ? 'Testing…' : 'Test connection'}
          </Button>
          {data?.key_source === 'settings' ? (
            <Button variant="ghost" disabled={clearKeys.isPending} onClick={() => clearKeys.mutate()}>
              Clear stored keys
            </Button>
          ) : null}
        </div>
        {testMessage ? (
          <p className={`text-sm ${test.data?.ok === false || test.isError ? 'text-red-400' : 'text-zinc-300'}`}>
            {testMessage}
          </p>
        ) : null}
      </Card>

      <div>
        <h2 className="mb-2 font-medium text-white">Workspace usage</h2>
        <UsageTab />
      </div>
    </div>
  )
}

function StatusCard({ data }: { data?: AdminStorageSettings }) {
  if (!data) {
    return (
      <Card>
        <p className="text-sm text-zinc-500">Loading storage configuration…</p>
      </Card>
    )
  }

  const label = data.provider_labels?.[data.provider] || FALLBACK_LABELS[data.provider] || data.provider

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <div className="text-xs text-zinc-500">Provider</div>
        <div className="mt-2 text-sm font-medium text-white">{label}</div>
        <p className="mt-1 text-xs text-zinc-500">disk: {data.disk}</p>
      </Card>
      <Card>
        <div className="text-xs text-zinc-500">Credentials</div>
        <div className="mt-2">
          <Badge tone={data.configured ? 'success' : 'danger'}>
            {data.configured ? keySourceLabel(data.key_source) : 'missing'}
          </Badge>
        </div>
        {data.key_hint ? <p className="mt-2 text-xs text-zinc-500">{data.key_hint}</p> : null}
      </Card>
      <Card>
        <div className="text-xs text-zinc-500">Last test</div>
        <div className="mt-2">
          <Badge tone={data.last_test_status === 'ok' ? 'success' : data.last_test_status ? 'danger' : 'neutral'}>
            {data.last_test_status ?? 'never'}
          </Badge>
        </div>
        {data.last_tested_at ? (
          <p className="mt-2 text-xs text-zinc-500">{new Date(data.last_tested_at).toLocaleString()}</p>
        ) : null}
      </Card>
      <Card>
        <div className="text-xs text-zinc-500">Public URL</div>
        <div className="mt-2 break-all text-sm text-zinc-300">{data.public_url || data.bucket || 'local /storage'}</div>
      </Card>
    </div>
  )
}
