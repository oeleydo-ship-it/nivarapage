import { useEffect, useRef } from 'react'

/**
 * Native `<input type="color">` fires `input` on every drag tick. React's
 * `onChange` is that same event, so wiring it to Zustand re-renders the whole
 * canvas at 60fps. This control previews via `onPreview` and only calls
 * `onCommit` when the picker closes (`change`) or the pointer pauses.
 */
export function LiveColorInput({
  value,
  fallback = '#2563eb',
  className = 'h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950',
  onPreview,
  onCommit,
}: {
  value: string
  fallback?: string
  className?: string
  onPreview?: (hex: string) => void
  onCommit: (hex: string) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const idle = useRef(0)
  const latest = useRef(value)
  const onCommitRef = useRef(onCommit)
  const onPreviewRef = useRef(onPreview)
  onCommitRef.current = onCommit
  onPreviewRef.current = onPreview

  const hex = /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (document.activeElement !== el && el.value !== hex) el.value = hex
  }, [hex])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const input = el

    function flush() {
      if (idle.current) window.clearTimeout(idle.current)
      idle.current = 0
      onCommitRef.current(latest.current)
    }

    function onNativeChange() {
      latest.current = input.value
      onPreviewRef.current?.(input.value)
      flush()
    }

    input.addEventListener('change', onNativeChange)
    return () => {
      input.removeEventListener('change', onNativeChange)
      if (idle.current) window.clearTimeout(idle.current)
    }
  }, [])

  return (
    <input
      ref={ref}
      type="color"
      className={className}
      defaultValue={hex}
      onInput={(event) => {
        const next = event.currentTarget.value
        latest.current = next
        onPreviewRef.current?.(next)
        if (idle.current) window.clearTimeout(idle.current)
        idle.current = window.setTimeout(() => {
          idle.current = 0
          onCommitRef.current(latest.current)
        }, 250)
      }}
    />
  )
}
