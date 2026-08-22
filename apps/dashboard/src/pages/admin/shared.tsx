import type { FormEvent, ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Button, Input } from '../../ui/primitives'

export function statusTone(status?: string | null) {
  if (!status) return 'neutral' as const
  if (['active', 'published', 'ok', 'verified'].includes(status)) return 'success' as const
  if (['suspended', 'disabled', 'failed', 'degraded'].includes(status)) return 'danger' as const
  if (['pending', 'verifying', 'ssl_pending', 'draft', 'past_due', 'canceled'].includes(status)) return 'warning' as const
  return 'neutral' as const
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`
  return `${(bytes / 1073741824).toFixed(2)} GB`
}

export function unixTimestamp(value?: number | string | null): string {
  if (value == null || value === '') return '—'
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric) || numeric <= 0) return '—'
  const ms = numeric > 1e12 ? numeric : numeric * 1000
  return new Date(ms).toLocaleString()
}

export function AdminSearch({
  value,
  onChange,
  onSubmit,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder: string
}) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="mb-4 flex gap-2" onSubmit={handleSubmit}>
      <Input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      <Button type="submit" variant="outline">
        <Search size={14} />
        Search
      </Button>
    </form>
  )
}

export function AdminNotice({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-sm text-zinc-500">{children}</p>
}
