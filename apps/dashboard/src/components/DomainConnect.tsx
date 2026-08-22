import type { Domain, DomainDnsRecord } from '@uidesired/types'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { domainStatus } from '../lib/domainStatus'
import { Badge } from '../ui/primitives'

/** Copy-to-clipboard button. DNS values are long and easy to mistype. */
function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(() => {
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1400)
        })
      }}
      className="shrink-0 rounded-md border border-zinc-700 p-1 text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
    >
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </button>
  )
}

function RecordValue({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-start gap-2">
      <code className="min-w-0 flex-1 break-all font-mono text-xs text-zinc-200">{value}</code>
      <CopyButton value={value} label={label} />
    </div>
  )
}

const PURPOSE_GROUPS: Array<{ key: string; title: string; blurb: string }> = [
  { key: 'routing', title: '1. Send traffic here', blurb: 'The record that actually points your domain at your site.' },
  { key: 'ownership', title: '2. Prove you own it', blurb: 'Confirms the domain is yours before we serve it.' },
  { key: 'certificate', title: '3. Issue the HTTPS certificate', blurb: 'Lets the certificate authority validate the domain.' },
]

function RecordGroup({ title, blurb, records }: { title: string; blurb: string; records: DomainDnsRecord[] }) {
  if (records.length === 0) return null
  return (
    <div className="space-y-2">
      <div>
        <h4 className="text-sm font-medium text-white">{title}</h4>
        <p className="text-xs text-zinc-500">{blurb}</p>
      </div>
      {records.map((record, index) => (
        <div key={`${record.type}-${record.name}-${index}`} className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
          <div className="grid gap-3 sm:grid-cols-[80px_150px_1fr_70px]">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">Type</div>
              <div className="font-mono text-xs text-zinc-200">{record.type}</div>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">Name / Host</div>
              <RecordValue value={record.name} label="record name" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">Value / Points to</div>
              <RecordValue value={record.value} label="record value" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">TTL</div>
              <div className="font-mono text-xs text-zinc-200">{record.ttl}</div>
            </div>
          </div>
          {record.help ? <p className="mt-2 text-[11px] text-zinc-500">{record.help}</p> : null}
        </div>
      ))}
    </div>
  )
}

/**
 * The full "how to connect this domain" panel: current state, the exact records
 * to create, and the order to do it in.
 */
export function DomainConnect({ domain }: { domain: Domain }) {
  const dns = domain.dns
  const state = domainStatus(domain)

  if (!dns) {
    return <p className="text-sm text-zinc-500">DNS instructions are not available for this domain yet.</p>
  }

  const grouped = PURPOSE_GROUPS.map((group) => ({
    ...group,
    records: dns.records.filter((record) => record.purpose === group.key),
  }))
  const ungrouped = dns.records.filter((record) => !PURPOSE_GROUPS.some((g) => g.key === record.purpose))

  return (
    <div className="space-y-6">
      {dns.errors.length > 0 ? (
        <div className="rounded-lg border border-red-900 bg-red-950/40 p-3">
          <h4 className="text-sm font-medium text-red-200">Cloudflare reported a problem</h4>
          <ul className="mt-1 list-inside list-disc space-y-1 text-xs text-red-300">
            {dns.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <h3 className="text-sm font-medium text-white">How to connect {dns.hostname}</h3>
        <ol className="mt-2 space-y-2">
          {dns.steps.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-zinc-700 text-[11px] text-zinc-400">
                {index + 1}
              </span>
              <div>
                <div className="text-sm text-zinc-200">{step.title}</div>
                <p className="text-xs text-zinc-500">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-4">
        {grouped.map((group) => (
          <RecordGroup key={group.key} title={group.title} blurb={group.blurb} records={group.records} />
        ))}
        {ungrouped.length > 0 ? <RecordGroup title="Other records" blurb="" records={ungrouped} /> : null}
      </div>

      {dns.notes.length > 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
          <h4 className="text-sm font-medium text-zinc-300">Good to know</h4>
          <ul className="mt-1 list-inside list-disc space-y-1 text-xs text-zinc-500">
            {dns.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        <Badge tone={state.tone}>{state.label}</Badge>
        <span>{state.detail}</span>
        <a
          className="ml-auto inline-flex items-center gap-1 text-blue-400 hover:underline"
          href={`https://dnschecker.org/#CNAME/${encodeURIComponent(dns.hostname)}`}
          target="_blank"
          rel="noreferrer noopener"
        >
          Check propagation <ExternalLink size={12} />
        </a>
      </div>
    </div>
  )
}
