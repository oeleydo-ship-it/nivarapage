import { PageRenderer, getBlock } from '@uidesired/blocks'
import { defaultThemeTokens } from '@uidesired/design-system'
import type { ThemeTokens } from '@uidesired/types'
import { X } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Badge, Button } from '../ui/primitives'
import { GoogleFonts } from './GoogleFonts'

export type BlockPreviewTarget = {
  title: string
  type: string
  subtitle?: string
  props?: Record<string, unknown>
}

export function BlockPreviewModal({
  target,
  onClose,
}: {
  target: BlockPreviewTarget | null
  onClose: () => void
}) {
  const def = target ? getBlock(target.type) : undefined
  const props = useMemo(() => {
    if (!target) return {}
    return { ...(def?.defaultProps ?? {}), ...(target.props ?? {}) }
  }, [def, target])

  useEffect(() => {
    if (!target) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [target, onClose])

  if (!target) return null

  const theme = defaultThemeTokens as ThemeTokens
  const section = {
    id: `admin-preview-${target.type}`,
    type: target.type,
    version: def?.version ?? 1,
    hidden: false,
    props,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="block-preview-title"
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800 px-5 py-4">
          <div className="min-w-0">
            <h2 id="block-preview-title" className="truncate text-lg font-medium text-white">
              {target.title}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge>{target.type}</Badge>
              {def?.label ? <span className="text-xs text-zinc-500">{def.label}</span> : null}
              {target.subtitle ? <span className="text-xs text-zinc-500">{target.subtitle}</span> : null}
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} aria-label="Close preview">
            <X size={16} />
            Close
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-zinc-900 p-4">
          {def ? (
            <div
              className="overflow-hidden rounded-xl border border-zinc-800 bg-white"
              onClick={(event) => {
                const link = (event.target as HTMLElement).closest('a')
                if (link) event.preventDefault()
              }}
            >
              <GoogleFonts theme={theme} content={{ sections: [section] }} />
              <PageRenderer content={{ schemaVersion: 1, sections: [section] }} theme={theme} />
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-zinc-400">This block type is not in the local catalog.</p>
          )}
        </div>
      </div>
    </div>
  )
}
