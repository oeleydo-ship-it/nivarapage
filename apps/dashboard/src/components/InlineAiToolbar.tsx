import { Check, LoaderCircle, Sparkles, Undo2, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '../lib/api'
import { aiApi, type AiRewriteMode } from '../lib/endpoints'
import type { EditPath } from '@uidesired/blocks'

/**
 * The AI half of on-canvas editing.
 *
 * Clicking a piece of text on the canvas already makes it editable. This puts a
 * small toolbar above whatever is focused so the same click also offers to
 * rewrite it, using the `/ai/rewrite` endpoint that already existed with no UI
 * on it. Only the focused string is sent and only a string comes back, so a
 * rewrite can never alter the block, its layout, or any other field.
 */

type Target = {
  element: HTMLElement
  sectionId: string
  path: EditPath
  original: string
  rect: { top: number; left: number; width: number }
}

const ACTIONS: Array<{ mode: AiRewriteMode; label: string; hint: string }> = [
  { mode: 'improve', label: 'Improve', hint: 'Sharpen the wording' },
  { mode: 'shorten', label: 'Shorten', hint: 'Say it in fewer words' },
  { mode: 'expand', label: 'Expand', hint: 'Add a little more detail' },
  { mode: 'fix', label: 'Fix', hint: 'Spelling, grammar and punctuation only' },
]

/** `data-edit-path` is the path joined with dots; list indices must go back to numbers. */
function parsePath(value: string): EditPath {
  return value
    .split('.')
    .filter((part) => part !== '')
    .map((part) => (/^\d+$/.test(part) ? Number(part) : part))
}

function readTarget(element: HTMLElement): Target | null {
  const raw = element.getAttribute('data-edit-path')
  const sectionId = element.closest('[data-section-id]')?.getAttribute('data-section-id')
  if (!raw || !sectionId) return null

  const rect = element.getBoundingClientRect()
  return {
    element,
    sectionId,
    path: parsePath(raw),
    original: element.textContent ?? '',
    rect: { top: rect.top, left: rect.left, width: rect.width },
  }
}

export function InlineAiToolbar({
  siteId,
  onApply,
  tone,
}: {
  siteId: string | number | undefined
  /** Writes the new string into the section props, exactly as a manual edit would. */
  onApply: (sectionId: string, path: EditPath, value: string) => void
  tone?: string
}) {
  const [target, setTarget] = useState<Target | null>(null)
  const [busy, setBusy] = useState<AiRewriteMode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [undoTo, setUndoTo] = useState<string | null>(null)
  const toolbar = useRef<HTMLDivElement>(null)

  // Focus is the signal, so the toolbar follows whatever the person is editing
  // without every block having to know it exists.
  useEffect(() => {
    function onFocusIn(event: FocusEvent) {
      const element = event.target as HTMLElement | null
      if (!element?.getAttribute?.('data-edit-path')) return
      setTarget(readTarget(element))
      setError(null)
      setUndoTo(null)
    }

    function onFocusOut(event: FocusEvent) {
      // Moving into the toolbar itself is not leaving the text.
      const next = event.relatedTarget as Node | null
      if (next && toolbar.current?.contains(next)) return
      setTarget(null)
      setBusy(null)
    }

    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  // The canvas scrolls under the toolbar, so keep it pinned to its text.
  useEffect(() => {
    if (!target) return
    function reposition() {
      setTarget((current) => {
        if (!current) return current
        const rect = current.element.getBoundingClientRect()
        return { ...current, rect: { top: rect.top, left: rect.left, width: rect.width } }
      })
    }
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [target?.element])

  const write = useCallback(
    (next: string) => {
      if (!target) return
      // The DOM node is what the person is looking at; props are what gets saved.
      target.element.textContent = next
      onApply(target.sectionId, target.path, next)
    },
    [onApply, target],
  )

  async function run(mode: AiRewriteMode) {
    if (!target || busy || siteId === undefined) return
    const text = (target.element.textContent ?? '').trim()
    if (!text) {
      setError('There is nothing written here yet.')
      return
    }

    setBusy(mode)
    setError(null)
    try {
      const result = await aiApi.rewrite({
        site_id: siteId,
        text,
        mode,
        tone,
        // Which field this is tells the model what kind of string to write back:
        // a button label should come back a button label, not a sentence.
        context: target.path.join(' · '),
      })
      const next = (result.text || '').trim()
      if (!next) {
        setError('The AI returned nothing usable. Try again.')
        return
      }
      setUndoTo(text)
      write(next)
    } catch (caught) {
      const message = caught instanceof ApiError && caught.status === 402
        ? 'You have used this month’s AI allowance.'
        : caught instanceof Error
          ? caught.message
          : 'The rewrite failed.'
      setError(message)
    } finally {
      setBusy(null)
    }
  }

  if (!target || siteId === undefined) return null

  const top = Math.max(8, target.rect.top - 46)
  const left = Math.max(8, Math.min(target.rect.left, window.innerWidth - 360))

  return (
    <div
      ref={toolbar}
      // Keeping mousedown off the document stops the browser blurring the text
      // before the click lands, which would close the toolbar mid-action.
      onMouseDown={(event) => event.preventDefault()}
      style={{ top, left }}
      className="fixed z-50 flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg"
      role="toolbar"
      aria-label="Rewrite this text with AI"
    >
      <span className="flex items-center gap-1 pl-2 pr-1 text-[11px] font-medium text-zinc-400">
        <Sparkles size={12} />
        AI
      </span>

      {ACTIONS.map((action) => (
        <button
          key={action.mode}
          type="button"
          title={action.hint}
          disabled={busy !== null}
          onClick={() => run(action.mode)}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50"
        >
          {busy === action.mode ? <LoaderCircle size={12} className="animate-spin" /> : null}
          {action.label}
        </button>
      ))}

      {undoTo !== null ? (
        <button
          type="button"
          title="Put the original wording back"
          onClick={() => {
            write(undoTo)
            setUndoTo(null)
          }}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
        >
          <Undo2 size={12} />
          Undo
        </button>
      ) : null}

      {error ? (
        <span className="flex max-w-[220px] items-center gap-1 rounded-lg bg-red-50 px-2 py-1.5 text-[11px] text-red-600">
          <X size={12} className="shrink-0" />
          {error}
        </span>
      ) : null}

      {!error && undoTo !== null && busy === null ? (
        <span className="flex items-center gap-1 px-1 text-[11px] text-emerald-600">
          <Check size={12} />
          Rewritten
        </span>
      ) : null}
    </div>
  )
}
