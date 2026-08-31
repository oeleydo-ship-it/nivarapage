import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { DomainConnect } from '../components/DomainConnect'
import { SiteSubnav } from '../components/SiteChrome'
import { domainStatus, lastCheckedLabel } from '../lib/domainStatus'
import { domainsApi, sitesApi } from '../lib/endpoints'
import { atCap, useSubscription } from '../lib/plan'
import { Badge, Button, Card, Input, Label, PageHeader } from '../ui/primitives'
import { normalizeHostname } from '@uidesired/utilities'

export function DomainsPage() {
  const { id } = useParams()
  const qc = useQueryClient()
  const { data: domains } = useQuery({
    queryKey: ['domains', id],
    queryFn: () => domainsApi.list(id!),
    // While anything is mid-connection the state changes without us doing
    // anything, so keep the page fresh instead of making the user reload.
    refetchInterval: (query) =>
      (query.state.data || []).some((d) => domainStatus(d).polling) ? 20_000 : false,
  })
  const sub = useSubscription()
  const domainsCapped = atCap(sub.data?.usage?.custom_domains)
  const [hostname, setHostname] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [error, setError] = useState('')

  const refresh = () => qc.invalidateQueries({ queryKey: ['domains', id] })
  const candidate = hostname.trim() ? normalizeHostname(hostname) : ''

  const add = useMutation({
    mutationFn: () => domainsApi.add(id!, candidate),
    onSuccess: (d) => {
      void refresh()
      setExpanded(d.id)
      setHostname('')
      setError('')
    },
    onError: (e: unknown) => setError(messageOf(e)),
  })
  const check = useMutation({
    mutationFn: (domainId: number) => domainsApi.verify(domainId),
    onSuccess: () => void refresh(),
  })
  const retry = useMutation({
    mutationFn: (domainId: number) => domainsApi.retry(domainId),
    onSuccess: () => void refresh(),
  })
  const primary = useMutation({
    mutationFn: (domainId: number) => domainsApi.primary(domainId),
    onSuccess: () => void refresh(),
  })
  const remove = useMutation({
    mutationFn: (domainId: number) => domainsApi.remove(domainId),
    onSuccess: () => void refresh(),
  })

  return (
    <div>
      <PageHeader
        title="Domains"
        description="Connect a domain you own, or keep using the free platform subdomain."
      />
      <SiteSubnav />

      <div className="space-y-3">
        {(domains || []).map((d) => {
          const state = domainStatus(d)
          const open = expanded === d.id
          return (
            <Card key={d.id} className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-white">{d.hostname}</span>
                    {d.is_primary ? <Badge tone="info">primary</Badge> : null}
                    <Badge tone={state.tone}>{state.label}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">{state.detail}</p>
                  {d.type === 'custom' ? (
                    <p className="mt-0.5 text-xs text-zinc-600">{lastCheckedLabel(d.last_checked_at)}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {d.type === 'custom' ? (
                    <>
                      <Button variant="outline" onClick={() => setExpanded(open ? null : d.id)}>
                        {open ? 'Hide setup' : 'Setup guide'}
                      </Button>
                      <Button variant="ghost" disabled={check.isPending} onClick={() => check.mutate(d.id)}>
                        {check.isPending ? 'Checking…' : 'Check connection'}
                      </Button>
                      {state.stage === 'failed' ? (
                        <Button variant="ghost" disabled={retry.isPending} onClick={() => retry.mutate(d.id)}>
                          Retry
                        </Button>
                      ) : null}
                      {!d.is_primary && state.stage === 'live' ? (
                        <Button variant="ghost" onClick={() => primary.mutate(d.id)}>
                          Set primary
                        </Button>
                      ) : null}
                      <Button variant="danger" onClick={() => remove.mutate(d.id)}>
                        Remove
                      </Button>
                    </>
                  ) : (
                    <Badge tone="success">Platform domain active</Badge>
                  )}
                </div>
              </div>
              {open && d.type === 'custom' ? (
                <div className="border-t border-zinc-800 pt-4">
                  <DomainConnect domain={d} />
                </div>
              ) : null}
            </Card>
          )
        })}
      </div>

      <Card className="mt-6 max-w-xl space-y-3">
        <div>
          <h2 className="font-medium text-white">Connect a domain</h2>
          <p className="text-xs text-zinc-500">
            Enter the exact hostname visitors will use. We will show you the DNS records to add next.
          </p>
        </div>
        <div>
          <Label>Hostname</Label>
          <Input
            value={hostname}
            onChange={(e) => {
              setHostname(e.target.value)
              setError('')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && candidate && !domainsCapped) add.mutate()
            }}
            placeholder="www.example.com"
          />
        </div>
        {candidate && looksApex(candidate) ? (
          <p className="text-xs text-zinc-400">
            {candidate} is a root domain. That works: after connecting we show you an ALIAS record, plus A records to use
            instead if your DNS provider has no ALIAS/ANAME support.
          </p>
        ) : null}
        <Button
          onClick={() => add.mutate()}
          disabled={!candidate || domainsCapped || add.isPending}
          title={domainsCapped ? 'Upgrade to add a custom domain' : undefined}
        >
          {add.isPending ? 'Connecting…' : 'Connect'}
        </Button>
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
        {domainsCapped ? <p className="text-xs text-amber-400">Custom domain limit reached. Upgrade to continue.</p> : null}
      </Card>
    </div>
  )
}

/**
 * Client-side apex hint so the warning appears before the domain is created.
 * The API does the authoritative check; this only avoids a surprise.
 */
function looksApex(hostname: string): boolean {
  const labels = hostname.split('.')
  if (labels.length === 2) return true
  const lastTwo = labels.slice(-2).join('.')
  return labels.length === 3 && /^(co|com|org|net|ac|gov|edu|me|or|ne|go|id|web|firm|gen|govt|sch|ltd|plc|ve)\.[a-z]{2}$/.test(lastTwo)
}

function messageOf(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message || 'Could not connect that domain.')
  }
  return 'Could not connect that domain.'
}

export function ThemePage() {
  const { id } = useParams()
  const { data } = useQuery({ queryKey: ['theme', id], queryFn: () => sitesApi.theme(id!) })
  const tokens = ((data as { tokens?: Record<string, string> })?.tokens || data || {}) as Record<string, string>
  const [draft, setDraft] = useState<Record<string, string>>({})
  const merged = { ...tokens, ...draft }
  return (
    <div>
      <PageHeader title="Theme" description="Brand colors used across published pages." />
      <SiteSubnav />
      <Card className="grid max-w-xl grid-cols-2 gap-3">
        {['primary', 'secondary', 'accent', 'background', 'surface', 'text', 'muted'].map((key) => (
          <div key={key}>
            <Label>{key}</Label>
            <Input
              type="color"
              value={String(merged[key] || '#000000')}
              onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
            />
          </div>
        ))}
        <div className="col-span-2">
          <Button onClick={() => sitesApi.updateTheme(id!, merged)}>Save theme</Button>
        </div>
      </Card>
    </div>
  )
}
