/**
 * Inline (on-canvas) editing support.
 *
 * Editing is opt-in through a binding that the builder injects into a section's
 * props as `__edit`; the public renderer never provides one, so published markup
 * carries no editing attributes at all (asserted in the dashboard test suite).
 * The client boundary for the whole block tree sits on `BlockRenderer`, so this
 * module needs no `"use client"` of its own.
 */
import { createContext, useContext, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { sanitizeRichText } from './sanitize'
import { quoteFontStack } from './theme'

export type EditPath = Array<string | number>

export type ElementTextStyle = {
  color?: string
  fontFamily?: string
  fontSize?: number
  fontWeight?: string | number
  lineHeight?: number
  letterSpacing?: number
  textAlign?: 'left' | 'center' | 'right'
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  fontStyle?: 'normal' | 'italic'
  textDecoration?: 'none' | 'underline'
}

export type ElementStyleMap = Record<string, ElementTextStyle>

const ElementStyleContext = createContext<ElementStyleMap>({})

/** Makes saved per-element styles available to every editable text primitive. */
export function ElementStyleProvider({ styles, children }: { styles?: unknown; children: ReactNode }) {
  const value = styles && typeof styles === 'object' && !Array.isArray(styles) ? (styles as ElementStyleMap) : {}
  return <ElementStyleContext.Provider value={value}>{children}</ElementStyleContext.Provider>
}

export type EditBinding = {
  /** Writes a committed value back to the section props at `path`. */
  commit: (path: EditPath, value: string) => void
  /** Opens the dashboard media picker for an image prop. */
  pickImage?: (path: EditPath, current: string) => void
}

/** Prop name the builder injects its binding under. */
export const EDIT_PROP = '__edit'

type MaybeProps = Record<string, unknown> | undefined | null

/** Returns the builder's binding, or undefined when rendering a published page. */
export function editOf(props: MaybeProps): EditBinding | undefined {
  const candidate = props?.[EDIT_PROP]
  if (!candidate || typeof candidate !== 'object') return undefined
  const binding = candidate as Partial<EditBinding>
  return typeof binding.commit === 'function' ? (binding as EditBinding) : undefined
}

/** Strips the binding so it never reaches the DOM or a nested renderer. */
export function withoutEditBinding(props: Record<string, unknown>): Record<string, unknown> {
  if (!(EDIT_PROP in props)) return props
  const clone = { ...props }
  delete clone[EDIT_PROP]
  return clone
}

export function pathId(path: EditPath): string {
  return path.map(String).join('.')
}

function useElementStyle(path: EditPath): CSSProperties | undefined {
  const styles = useContext(ElementStyleContext)
  const value = styles[pathId(path)]
  if (!value || typeof value !== 'object') return undefined
  const fontSize = typeof value.fontSize === 'number' && Number.isFinite(value.fontSize) ? `${value.fontSize}px` : undefined
  const lineHeight = typeof value.lineHeight === 'number' && Number.isFinite(value.lineHeight) ? value.lineHeight : undefined
  const letterSpacing = typeof value.letterSpacing === 'number' && Number.isFinite(value.letterSpacing) ? `${value.letterSpacing}px` : undefined
  return {
    color: value.color || undefined,
    fontFamily: value.fontFamily ? quoteFontStack(value.fontFamily) : undefined,
    fontSize,
    fontWeight: value.fontWeight || undefined,
    lineHeight,
    letterSpacing,
    textAlign: value.textAlign || undefined,
    textTransform: value.textTransform === 'none' ? undefined : value.textTransform,
    fontStyle: value.fontStyle === 'italic' ? 'italic' : undefined,
    textDecoration: value.textDecoration === 'underline' ? 'underline' : undefined,
  }
}

function plainText(node: HTMLElement): string {
  // innerText keeps user-visible line breaks; textContent would flatten them.
  return (node.innerText ?? node.textContent ?? '').replace(/\u00a0/g, ' ').trim()
}

type EditableProps = {
  edit?: EditBinding
  path: EditPath
  value: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div' | 'li' | 'strong'
  className?: string
  style?: CSSProperties
  /** Allow Enter to insert a line break instead of committing. */
  multiline?: boolean
  placeholder?: string
  /** Rendered instead of `value` when not editing (e.g. markdown-formatted text). */
  children?: ReactNode
  /**
   * Pre-formatted HTML for the published page. Editing always works on the raw
   * `value`, so inline markers such as `**bold**` stay visible while typing.
   */
  html?: string
  /**
   * Maps the edited text to the value stored at `path`. Used when one visible
   * region is part of a larger prop, e.g. a single line of a newline list.
   */
  transform?: (text: string) => string
}

/**
 * Plain-text inline editor. Without a binding it renders exactly what the block
 * would have rendered anyway.
 */
export function EditableText({
  edit,
  path,
  value,
  as: Tag = 'span',
  className,
  style,
  multiline,
  placeholder,
  children,
  html,
  transform,
}: EditableProps) {
  const elementStyle = useElementStyle(path)
  const resolvedStyle = elementStyle ? { ...style, ...elementStyle } : style
  const shown = children ?? value
  if (!edit) {
    if (!value && !children) return null
    if (html !== undefined) {
      return <Tag className={className} style={resolvedStyle} data-ud-style={pathId(path)} dangerouslySetInnerHTML={{ __html: html }} />
    }
    return (
      <Tag className={className} style={resolvedStyle} data-ud-style={pathId(path)}>
        {shown}
      </Tag>
    )
  }
  const initial = typeof shown === 'string' ? shown : value

  function onKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.currentTarget.textContent = initial
      event.currentTarget.blur()
      return
    }
    if (event.key === 'Enter' && !(multiline && event.shiftKey)) {
      event.preventDefault()
      event.currentTarget.blur()
    }
  }

  return (
    <Tag
      className={className ? `${className} ud-editable` : 'ud-editable'}
      style={resolvedStyle}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-edit-path={pathId(path)}
      data-ud-style={pathId(path)}
      data-edit-empty={initial ? undefined : ''}
      data-placeholder={placeholder || 'Type here'}
      onKeyDown={onKeyDown}
      onBlur={(event) => {
        const text = plainText(event.currentTarget)
        if (text === initial) return
        edit.commit(path, transform ? transform(text) : text)
      }}
    >
      {shown}
    </Tag>
  )
}

/**
 * Rich-text inline editor. Commits sanitized HTML; the inspector keeps the full
 * TipTap editor for the same field.
 */
export function EditableRich({
  edit,
  path,
  html,
  className,
  style,
}: {
  edit?: EditBinding
  path: EditPath
  html: string
  className?: string
  style?: CSSProperties
}) {
  const elementStyle = useElementStyle(path)
  const resolvedStyle = elementStyle ? { ...style, ...elementStyle } : style
  const safe = sanitizeRichText(html)
  if (!edit) {
    return <div className={className} style={resolvedStyle} data-ud-style={pathId(path)} dangerouslySetInnerHTML={{ __html: safe }} />
  }
  return (
    <div
      className={className ? `${className} ud-editable` : 'ud-editable'}
      style={resolvedStyle}
      contentEditable
      suppressContentEditableWarning
      data-edit-path={pathId(path)}
      data-ud-style={pathId(path)}
      data-edit-rich=""
      dangerouslySetInnerHTML={{ __html: safe }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          event.currentTarget.blur()
        }
      }}
      onBlur={(event) => {
        const next = sanitizeRichText(event.currentTarget.innerHTML)
        if (next !== safe) edit.commit(path, next)
      }}
    />
  )
}

/**
 * Click target that opens the media picker for an image prop. Renders nothing
 * when there is no binding, so published pages get no extra markup.
 */
export function EditableImage({
  edit,
  path,
  current,
  label = 'Replace image',
}: {
  edit?: EditBinding
  path: EditPath
  current?: unknown
  label?: string
}) {
  if (!edit?.pickImage) return null
  const src = typeof current === 'string' ? current : ''
  return (
    <span
      className="ud-edit-image"
      data-edit-path={pathId(path)}
      role="button"
      tabIndex={0}
      title={label}
      onClick={(event) => {
        event.stopPropagation()
        edit.pickImage?.(path, src)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          edit.pickImage?.(path, src)
        }
      }}
    >
      {src ? label : 'Add image'}
    </span>
  )
}
