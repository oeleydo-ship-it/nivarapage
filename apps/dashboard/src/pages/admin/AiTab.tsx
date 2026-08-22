import type { Plan } from '@uidesired/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { adminApi, type AdminAiSettings } from '../../lib/endpoints'
import { ApiError } from '../../lib/api'
import { Badge, Button, Card, Input, Label, Select } from '../../ui/primitives'

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  kimi: 'Kimi (Moonshot)',
  openai_compatible: 'OpenAI-compatible',
  fake: 'Fake (local / tests)',
}

const PROVIDER_URLS: Record<string, string> = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com',
  kimi: 'https://api.moonshot.ai/v1',
}

function nestedMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.body && typeof error.body === 'object') {
    const body = error.body as { message?: unknown; data?: { message?: unknown; status?: AdminAiSettings } }
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

export function AiTab() {
  const qc = useQueryClient()
  const settings = useQuery({ queryKey: ['admin-ai'], queryFn: adminApi.aiSettings })
  const plans = useQuery({ queryKey: ['admin-plans'], queryFn: adminApi.plans })

  const [enabled, setEnabled] = useState(false)
  const [provider, setProvider] = useState('openai')
  const [model, setModel] = useState('')
  const [modelCustom, setModelCustom] = useState(false)
  const [baseUrl, setBaseUrl] = useState('')
  const [maxTokens, setMaxTokens] = useState('4000')
  const [temperature, setTemperature] = useState('0.7')
  const [apiKey, setApiKey] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [testMessage, setTestMessage] = useState<string | null>(null)

  useEffect(() => {
    const data = settings.data
    if (!data) return
    setEnabled(Boolean(data.enabled))
    setProvider(data.provider || 'openai')
    setModel(data.model || '')
    const presets = data.models?.[data.provider || 'openai'] || []
    setModelCustom(Boolean(data.model) && !presets.some((item) => item.id === data.model))
    setBaseUrl(data.base_url || '')
    setMaxTokens(String(data.max_tokens ?? 4000))
    setTemperature(String(data.temperature ?? 0.7))
    setApiKey('')
  }, [settings.data])

  const save = useMutation({
    mutationFn: () => {
      const body: Record<string, unknown> = {
        enabled,
        provider,
        model: model.trim() || null,
        base_url: baseUrl.trim() || null,
        max_tokens: Number(maxTokens) || 4000,
        temperature: Number(temperature),
      }
      if (apiKey.trim() !== '') body.api_key = apiKey.trim()
      return adminApi.updateAiSettings(body)
    },
    onSuccess: (data) => {
      setNotice('AI settings saved. The API key is never returned to the dashboard.')
      setTestMessage(null)
      setApiKey('')
      qc.setQueryData(['admin-ai'], data)
    },
  })

  const clearKey = useMutation({
    mutationFn: () => adminApi.updateAiSettings({ api_key: '' }),
    onSuccess: (data) => {
      setNotice('Stored API key cleared. The environment key is used if one is set.')
      setApiKey('')
      qc.setQueryData(['admin-ai'], data)
    },
  })

  const test = useMutation({
    mutationFn: adminApi.testAiSettings,
    onSuccess: (result) => {
      setTestMessage(result.message || (result.ok ? 'Connection succeeded.' : 'Connection failed.'))
      if (result.status) qc.setQueryData(['admin-ai'], result.status)
      else qc.invalidateQueries({ queryKey: ['admin-ai'] })
    },
    onError: (error) => {
      setTestMessage(nestedMessage(error, 'Connection failed.'))
      if (error instanceof ApiError && error.body && typeof error.body === 'object') {
        const status = (error.body as { data?: { status?: AdminAiSettings } }).data?.status
        if (status) qc.setQueryData(['admin-ai'], status)
      }
    },
  })

  const data = settings.data

  return (
    <div className="space-y-4">
      <StatusCard data={data} />

      <Card className="max-w-2xl space-y-3">
        <h2 className="font-medium text-white">Provider</h2>
        <p className="text-sm text-zinc-500">
          Keys are write-only. Paste a new key to replace the stored one; leave the field blank to keep it.
        </p>
        {notice ? <p className="text-sm text-emerald-400">{notice}</p> : null}
        {save.isError ? (
          <p className="text-sm text-red-400">{save.error instanceof Error ? save.error.message : 'Save failed'}</p>
        ) : null}

        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
          Enable AI generation for tenants
        </label>

        <div>
          <Label>Provider</Label>
          <Select
            className="w-full"
            value={provider}
            onChange={(event) => {
              const next = event.target.value
              setProvider(next)
              const presets = data?.models?.[next] || []
              if (presets.length && !presets.some((item) => item.id === model)) {
                setModel(presets[0].id)
                setModelCustom(false)
              }
              if (PROVIDER_URLS[next]) setBaseUrl(PROVIDER_URLS[next])
            }}
          >
            {(data?.providers || ['openai', 'anthropic', 'kimi', 'openai_compatible']).map((item) => (
              <option key={item} value={item}>
                {PROVIDER_LABELS[item] || item}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Model</Label>
          {(data?.models?.[provider] || []).length && !modelCustom ? (
            <Select
              className="w-full"
              value={(data?.models?.[provider] || []).some((item) => item.id === model) ? model : '__custom'}
              onChange={(event) => {
                if (event.target.value === '__custom') {
                  setModelCustom(true)
                  return
                }
                setModel(event.target.value)
              }}
            >
              {(data?.models?.[provider] || []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.id})
                </option>
              ))}
              <option value="__custom">Custom model id…</option>
            </Select>
          ) : (
            <Input value={model} onChange={(event) => setModel(event.target.value)} placeholder="gpt-5.6" />
          )}
          {provider === 'kimi' ? (
            <p className="mt-1 text-xs text-zinc-500">Uses the Moonshot OpenAI-compatible API. Paste a Moonshot key below.</p>
          ) : null}
        </div>
        <div>
          <Label>Base URL</Label>
          <Input
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
            placeholder="https://api.openai.com/v1"
          />
          {provider === 'openai_compatible' ? (
            <p className="mt-1 text-xs text-zinc-500">Required for OpenRouter, Azure, Ollama, vLLM, and similar gateways.</p>
          ) : null}
          {provider === 'kimi' ? (
            <p className="mt-1 text-xs text-zinc-500">Default is https://api.moonshot.ai/v1</p>
          ) : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Max tokens</Label>
            <Input value={maxTokens} onChange={(event) => setMaxTokens(event.target.value)} />
          </div>
          <div>
            <Label>Temperature</Label>
            <Input value={temperature} onChange={(event) => setTemperature(event.target.value)} />
          </div>
        </div>
        <div>
          <Label>API key</Label>
          <Input
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder={data?.key_hint ? `Key on file (${data.key_hint})` : 'Paste a provider key'}
          />
          <p className="mt-1 text-xs text-zinc-500">
            {data?.configured
              ? `Configured ${keySourceLabel(data.key_source)}${data.key_hint ? ` · ${data.key_hint}` : ''}.`
              : 'No key is configured. Set AI_API_KEY or paste one here.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? 'Saving…' : 'Save settings'}
          </Button>
          <Button variant="outline" disabled={test.isPending} onClick={() => test.mutate()}>
            {test.isPending ? 'Testing…' : 'Test connection'}
          </Button>
          {data?.key_source === 'settings' ? (
            <Button variant="ghost" disabled={clearKey.isPending} onClick={() => clearKey.mutate()}>
              Clear stored key
            </Button>
          ) : null}
        </div>
        {testMessage ? (
          <p className={`text-sm ${test.data?.ok === false || test.isError ? 'text-red-400' : 'text-zinc-300'}`}>
            {testMessage}
          </p>
        ) : null}
      </Card>

      <Card>
        <h2 className="font-medium text-white">Per-plan gating</h2>
        <p className="mt-1 mb-4 text-sm text-zinc-500">
          Monthly AI generations. <code className="text-zinc-400">0</code> turns AI off for that plan,{' '}
          <code className="text-zinc-400">-1</code> is unlimited.
        </p>
        <div className="space-y-3">
          {(plans.data || []).map((plan) => (
            <PlanAiLimit key={plan.id} plan={plan} />
          ))}
        </div>
      </Card>
    </div>
  )
}

function StatusCard({ data }: { data?: AdminAiSettings }) {
  if (!data) {
    return (
      <Card>
        <p className="text-sm text-zinc-500">Loading AI configuration…</p>
      </Card>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <div className="text-xs text-zinc-500">Status</div>
        <div className="mt-2">
          <Badge tone={data.enabled ? 'success' : 'warning'}>{data.enabled ? 'enabled' : 'disabled'}</Badge>
        </div>
      </Card>
      <Card>
        <div className="text-xs text-zinc-500">API key</div>
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
        <div className="text-xs text-zinc-500">Block catalog</div>
        <div className="mt-2 text-2xl font-semibold text-white">{data.catalog_blocks}</div>
        <p className="mt-1 text-xs text-zinc-500">{data.provider} · {data.model || 'no model'}</p>
      </Card>
    </div>
  )
}

function PlanAiLimit({ plan }: { plan: Plan }) {
  const qc = useQueryClient()
  const current = Number(plan.limits?.ai_generations ?? 0)
  const [value, setValue] = useState(String(current))
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    setValue(String(plan.limits?.ai_generations ?? 0))
  }, [plan.limits?.ai_generations])

  const save = useMutation({
    mutationFn: () => {
      const parsed = Number(value)
      return adminApi.updatePlan(plan.id, {
        limits: { ai_generations: Number.isFinite(parsed) ? parsed : 0 },
      })
    },
    onSuccess: () => {
      setNotice('Saved')
      qc.invalidateQueries({ queryKey: ['admin-plans'] })
    },
  })

  const numeric = Number(value)
  const label = numeric < 0 ? 'unlimited' : numeric === 0 ? 'off' : `${numeric} / month`

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-800 p-3">
      <div className="min-w-[10rem] flex-1">
        <div className="text-sm font-medium text-white">{plan.name}</div>
        <div className="text-xs text-zinc-500">{plan.slug}</div>
      </div>
      <div className="w-40">
        <Label>AI generations</Label>
        <Input value={value} onChange={(event) => setValue(event.target.value)} />
      </div>
      <Badge tone={numeric < 0 ? 'success' : numeric === 0 ? 'warning' : 'info'}>{label}</Badge>
      <Button variant="outline" disabled={save.isPending} onClick={() => save.mutate()}>
        {save.isPending ? 'Saving…' : 'Save'}
      </Button>
      {notice ? <span className="text-xs text-emerald-400">{notice}</span> : null}
      {save.isError ? (
        <span className="text-xs text-red-400">{save.error instanceof Error ? save.error.message : 'Save failed'}</span>
      ) : null}
    </div>
  )
}
