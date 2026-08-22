import type { Template } from '@uidesired/types'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '../ui/primitives'
import { TEMPLATE_PREVIEW_HEIGHT, TemplateLivePreview } from './TemplatePreview'
import { templatePreviewPath } from '../lib/templatePreview'

export function TemplateSelectModal({
  open,
  template,
  onClose,
  onContinue,
}: {
  open: boolean
  template: Template | null
  onClose: () => void
  onContinue: () => void
}) {
  useEffect(() => {
    if (!open) return
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
  }, [open, onClose])

  if (!open) return null

  const title = template?.name || 'Start blank'
  const description = template
    ? template.description || 'Starter layout'
    : 'Empty homepage, then add sections.'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-select-title"
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="min-h-0 flex-1 overflow-auto">
          {template ? (
            <TemplateLivePreview template={template} height={TEMPLATE_PREVIEW_HEIGHT} />
          ) : (
            <div
              className="flex items-center justify-center border-b border-dashed border-zinc-800 bg-zinc-950/60 text-zinc-500"
              style={{ height: TEMPLATE_PREVIEW_HEIGHT }}
            >
              Blank canvas
            </div>
          )}
          <div className="px-5 pt-4 pb-2">
            <h2 id="template-select-title" className="text-lg font-medium text-white">
              {title}
            </h2>
            <p className="mt-1 text-sm text-zinc-400">{description}</p>
            {template?.category ? <p className="mt-2 text-xs text-zinc-500">{template.category.name}</p> : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-zinc-800 px-5 py-4">
          <Button variant="ghost" onClick={onClose} aria-label="Choose another template">
            <X size={16} />
            Choose another
          </Button>
          <div className="flex items-center gap-2">
            {template?.slug ? (
              <a
                href={templatePreviewPath(template.slug)}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg px-3 py-2 text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                Preview
              </a>
            ) : null}
            <Button autoFocus onClick={onContinue}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
