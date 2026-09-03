import type { BlockField, Page, Product, SiteForm, ThemeTokens } from '@uidesired/types'
import { ICON_NAMES, Icon, pathId, type EditPath, type ElementStyleMap, type ElementTextStyle } from '@uidesired/blocks'
import { fontCatalogGroups, quoteFontStack } from '@uidesired/blocks/theme'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  ChevronUp,
  Copy,
  Italic,
  Link2,
  List,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { LiveColorInput } from './LiveColorInput'
import { MediaPicker } from './MediaLibrary'
import { Button, Input, Label } from '../ui/primitives'

type Props = Record<string, unknown>

export type FieldContext = {
  forms?: SiteForm[]
  /** The workspace's products, so a buy button can be pointed at one. */
  products?: Product[]
  pages?: Page[]
  theme?: ThemeTokens
  siteId?: string | number
  sectionId?: string
  /** Nested content path used by repeaters for per-element text styling. */
  pathPrefix?: EditPath
  elementStyles?: ElementStyleMap
  onElementStyleChange?: (path: EditPath, style: ElementTextStyle | undefined) => void
  device?: 'desktop' | 'tablet' | 'mobile'
  overridden?: boolean
}

const SECTION_COLOR_VARS: Record<string, string> = {
  headingColor: '--ud-heading',
  textColor: '--ud-fg',
  accentColor: '--ud-accent',
  cardColor: '--ud-card',
  backgroundColor: '--ud-bg',
}

function previewSectionColor(sectionId: string | undefined, fieldKey: string, color: string) {
  if (!sectionId) return
  const cssVar = SECTION_COLOR_VARS[fieldKey]
  if (!cssVar) return
  const section = document.querySelector<HTMLElement>(`[data-section-frame="${CSS.escape(sectionId)}"] .ud-section`)
  if (!section) return
  if (color) section.style.setProperty(cssVar, color)
  else section.style.removeProperty(cssVar)
}

/** Evaluates a field's `when` clause against sibling prop values. */
export function fieldVisible(field: BlockField, values: Props): boolean {
  const when = field.when
  if (!when) return true
  const current = values[when.key]
  if (when.in) return when.in.includes(current)
  if ('not' in when) return current !== when.not
  if ('equals' in when) {
    if (when.equals === 'tone' && (current === undefined || current === '')) return true
    return current === when.equals
  }
  return true
}

const DeviceHintContext = createContext<string | undefined>(undefined)

function Row({ label, help, children, action, deviceHint }: { label?: string; help?: string; children: React.ReactNode; action?: React.ReactNode; deviceHint?: string }) {
  const hint = deviceHint ?? useContext(DeviceHintContext)
  return (
    <div>
      {label ? (
        <div className="flex items-center justify-between">
          <Label>
            {label}
            {hint ? <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide text-blue-400">{hint}</span> : null}
          </Label>
          {action}
        </div>
      ) : null}
      {children}
      {help ? <p className="mt-1 text-[11px] text-zinc-500">{help}</p> : null}
    </div>
  )
}

function TextArea({ value, onChange, rows = 4 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea
      rows={rows}
      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

function Select({
  value,
  onChange,
  options,
  previewFont = false,
}: {
  value: string
  onChange: (v: string) => void
  options: { label: string; value: string }[]
  previewFont?: boolean
}) {
  const groups = previewFont ? fontCatalogGroups() : null
  const groupedValues = new Set(groups?.flatMap((group) => group.fonts.map((font) => font.stack)) ?? [])
  const extra = previewFont && value && !groupedValues.has(value) ? [{ value, label: value.split(',')[0] || value }] : []

  return (
    <select
      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      style={previewFont && value ? { fontFamily: quoteFontStack(value) } : undefined}
    >
      {groups
        ? [
            options.find((option) => option.value === '') ? (
              <option key="theme" value="">
                Site theme
              </option>
            ) : null,
            ...groups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.fonts.map((font) => (
                  <option key={font.stack} value={font.stack} style={{ fontFamily: quoteFontStack(font.stack) }}>
                    {font.label}
                  </option>
                ))}
              </optgroup>
            )),
            extra.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            )),
          ]
        : options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
    </select>
  )
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-left text-sm text-zinc-200"
    >
      <span>{label}</span>
      <span className={`relative h-5 w-9 rounded-full transition ${value ? 'bg-blue-600' : 'bg-zinc-700'}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${value ? 'left-4' : 'left-0.5'}`} />
      </span>
    </button>
  )
}

const THEME_SWATCH_KEYS = ['primary', 'secondary', 'accent', 'background', 'surface', 'text', 'muted'] as const

function ColorField({
  value,
  onChange,
  theme,
  fieldKey,
  sectionId,
}: {
  value: string
  onChange: (v: string) => void
  theme?: ThemeTokens
  fieldKey: string
  sectionId?: string
}) {
  const swatches = THEME_SWATCH_KEYS.map((key) => String((theme as Props | undefined)?.[key] || '')).filter(Boolean)

  function apply(next: string, previewOnly = false) {
    previewSectionColor(sectionId, fieldKey, next)
    if (!previewOnly && next !== value) onChange(next)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <LiveColorInput
          value={value}
          onPreview={(hex) => apply(hex, true)}
          onCommit={(hex) => apply(hex)}
        />
        <Input value={value} placeholder="Inherit from theme" onChange={(event) => apply(event.target.value)} />
        {value ? (
          <button type="button" title="Reset" className="px-1 text-zinc-500 hover:text-white" onClick={() => apply('')}>
            <RotateCcw size={14} />
          </button>
        ) : null}
      </div>
      {swatches.length ? (
        <div className="flex gap-1.5">
          {swatches.map((color) => (
            <button
              key={color}
              type="button"
              title={color}
              onClick={() => apply(color)}
              className="h-5 w-5 rounded-full border border-zinc-700"
              style={{ background: color }}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function SliderField({
  value,
  onChange,
  field,
  fallback,
}: {
  value: unknown
  onChange: (v: unknown) => void
  field: BlockField
  fallback: number
}) {
  const min = field.min ?? 0
  const max = field.max ?? 100
  const current = typeof value === 'number' ? value : Number(value) || fallback
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="range"
          className="w-full accent-blue-500"
          min={min}
          max={max}
          step={field.step ?? 1}
          value={current}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <input
          className="w-16 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-100"
          value={String(value ?? '')}
          placeholder="auto"
          onChange={(event) => onChange(event.target.value === '' ? undefined : Number(event.target.value))}
        />
        {field.unit ? <span className="text-[11px] text-zinc-500">{field.unit}</span> : null}
      </div>
      {field.placeholder === 'theme' ? (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={`rounded px-2 py-0.5 text-[11px] ${value === undefined || value === '' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300'}`}
        >
          theme
        </button>
      ) : null}
    </div>
  )
}

function SpacingField({ value, onChange, field }: { value: unknown; onChange: (v: unknown) => void; field: BlockField }) {
  const presets = [0, 24, 48, 80, 120, 160]
  return (
    <div className="space-y-2">
      <SliderField value={value} onChange={onChange} field={field} fallback={80} />
      <div className="flex flex-wrap gap-1">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`rounded px-2 py-0.5 text-[11px] ${value === preset ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300'}`}
          >
            {preset}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={`rounded px-2 py-0.5 text-[11px] ${value === undefined ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300'}`}
        >
          theme
        </button>
      </div>
    </div>
  )
}

function AlignmentField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    { value: 'left', icon: AlignLeft },
    { value: 'center', icon: AlignCenter },
    { value: 'right', icon: AlignRight },
  ]
  return (
    <div className="flex overflow-hidden rounded-lg border border-zinc-800">
      {options.map((option) => {
        const Glyph = option.icon
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex flex-1 items-center justify-center py-2 ${value === option.value ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'}`}
          >
            <Glyph size={15} />
          </button>
        )
      })}
    </div>
  )
}

const ELEMENT_FONT_WEIGHTS = [
  { value: '', label: 'Inherit' },
  { value: '300', label: '300 Light' },
  { value: '400', label: '400 Regular' },
  { value: '500', label: '500 Medium' },
  { value: '600', label: '600 Semibold' },
  { value: '700', label: '700 Bold' },
  { value: '800', label: '800 Extra bold' },
  { value: '900', label: '900 Black' },
]

function ElementStyleEditor({ path, context }: { path: EditPath; context: FieldContext }) {
  const [open, setOpen] = useState(false)
  if (!context.onElementStyleChange) return null
  const key = pathId(path)
  const value = context.elementStyles?.[key] || {}
  const active = Object.values(value).some((entry) => entry !== undefined && entry !== '')

  function patch<K extends keyof ElementTextStyle>(property: K, next: ElementTextStyle[K] | undefined) {
    const updated = { ...value, [property]: next }
    for (const [name, entry] of Object.entries(updated)) {
      if (entry === undefined || entry === '' || entry === 'normal' || entry === 'none') delete (updated as Record<string, unknown>)[name]
    }
    context.onElementStyleChange?.(path, Object.keys(updated).length ? updated : undefined)
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-xs text-zinc-300 hover:text-white"
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-2">
          <span className="font-serif text-sm">Aa</span> Individual text style
          {context.device && context.device !== 'desktop' ? (
            <span className="rounded bg-blue-600/20 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-300">
              {context.device}
            </span>
          ) : null}
        </span>
        <span className="flex items-center gap-2">
          {active ? <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> : null}
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>
      {open ? (
        <div className="space-y-3 border-t border-zinc-800 p-3">
          <Row label="Color">
            <ColorField
              value={value.color || ''}
              onChange={(next) => patch('color', next || undefined)}
              theme={context.theme}
              fieldKey={`element:${key}:color`}
              sectionId={context.sectionId}
            />
          </Row>
          <Row label="Font family">
            <Select
              value={value.fontFamily || ''}
              onChange={(next) => patch('fontFamily', next || undefined)}
              options={[{ value: '', label: 'Inherit' }]}
              previewFont
            />
          </Row>
          <Row label="Font size">
            <SliderField
              value={value.fontSize}
              onChange={(next) => patch('fontSize', typeof next === 'number' ? next : undefined)}
              field={{ key: 'fontSize', type: 'slider', label: 'Font size', min: 8, max: 160, step: 1, unit: 'px', placeholder: 'theme' }}
              fallback={16}
            />
          </Row>
          <Row label="Font weight">
            <Select
              value={String(value.fontWeight || '')}
              onChange={(next) => patch('fontWeight', next || undefined)}
              options={ELEMENT_FONT_WEIGHTS}
            />
          </Row>
          <Row label="Alignment">
            <AlignmentField value={value.textAlign || ''} onChange={(next) => patch('textAlign', next as ElementTextStyle['textAlign'])} />
          </Row>
          <Row label="Line height">
            <SliderField
              value={value.lineHeight}
              onChange={(next) => patch('lineHeight', typeof next === 'number' ? next : undefined)}
              field={{ key: 'lineHeight', type: 'slider', label: 'Line height', min: 0.8, max: 3, step: 0.05 }}
              fallback={1.4}
            />
          </Row>
          <Row label="Letter spacing">
            <SliderField
              value={value.letterSpacing}
              onChange={(next) => patch('letterSpacing', typeof next === 'number' ? next : undefined)}
              field={{ key: 'letterSpacing', type: 'slider', label: 'Letter spacing', min: -4, max: 20, step: 0.1, unit: 'px' }}
              fallback={0}
            />
          </Row>
          <Row label="Letter case">
            <Select
              value={value.textTransform || ''}
              onChange={(next) => patch('textTransform', (next || undefined) as ElementTextStyle['textTransform'])}
              options={[
                { value: '', label: 'Inherit' },
                { value: 'uppercase', label: 'UPPERCASE' },
                { value: 'lowercase', label: 'lowercase' },
                { value: 'capitalize', label: 'Capitalize' },
              ]}
            />
          </Row>
          <Toggle value={value.fontStyle === 'italic'} onChange={(next) => patch('fontStyle', next ? 'italic' : undefined)} label="Italic" />
          <Toggle value={value.textDecoration === 'underline'} onChange={(next) => patch('textDecoration', next ? 'underline' : undefined)} label="Underline" />
          {active ? (
            <button type="button" className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white" onClick={() => context.onElementStyleChange?.(path, undefined)}>
              <RotateCcw size={12} /> Reset this text style
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function SegmentedField({
  value,
  onChange,
  options,
  fallback,
}: {
  value: string
  onChange: (v: string) => void
  options: { label: string; value: string }[]
  fallback: string
}) {
  const current = value || fallback
  return (
    <div className="grid grid-cols-2 gap-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-lg px-2 py-1.5 text-xs ${current === option.value ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function pageHref(page: Pick<Page, 'slug' | 'is_homepage'>): string {
  return page.is_homepage ? '/' : `/${String(page.slug || '').replace(/^\//, '')}`
}

type LinkMode = 'page' | 'url' | 'anchor'

function linkModeOf(value: string): LinkMode {
  if (value.startsWith('#')) return 'anchor'
  if (/^(https?:|mailto:|tel:)/i.test(value)) return 'url'
  return 'page'
}

function LinkField({ value, onChange, pages }: { value: string; onChange: (v: string) => void; pages?: Page[] }) {
  // The stored value decides the mode unless the editor explicitly switched tabs.
  const [override, setOverride] = useState<LinkMode | null>(null)
  const mode = override ?? linkModeOf(value)
  const known = (pages || []).map((page) => ({ page, href: pageHref(page) }))
  const matched = known.find((entry) => entry.href === value)

  const MODES: Array<{ id: LinkMode; label: string }> = [
    { id: 'page', label: 'Page' },
    { id: 'url', label: 'URL' },
    { id: 'anchor', label: 'Anchor' },
  ]

  return (
    <div className="space-y-2">
      <div className="flex overflow-hidden rounded-lg border border-zinc-800">
        {MODES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={`flex-1 px-2 py-1 text-[11px] ${
              mode === entry.id ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
            }`}
            onClick={() => {
              setOverride(entry.id)
              if (entry.id === 'anchor' && !value.startsWith('#')) onChange('#section')
              if (entry.id === 'page' && known.length && !known.some((item) => item.href === value)) {
                onChange(known[0].href)
              }
              if (entry.id === 'url' && !/^(https?:|mailto:|tel:)/i.test(value)) onChange('https://')
            }}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {mode === 'page' ? (
        known.length ? (
          <select
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-2 text-sm text-zinc-100"
            value={matched ? matched.href : ''}
            onChange={(event) => onChange(event.target.value)}
          >
            {matched ? null : <option value="">{value ? `Custom: ${value}` : 'Select a page…'}</option>}
            {known.map(({ page, href }) => (
              <option key={page.id} value={href}>
                {page.name} · {href}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-[11px] text-zinc-500">No pages yet — add one from the page menu in the toolbar.</p>
        )
      ) : (
        <div className="flex items-center gap-2">
          <Link2 size={14} className="shrink-0 text-zinc-500" />
          <Input
            value={value}
            placeholder={mode === 'anchor' ? '#pricing' : 'https://example.com'}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      )}
    </div>
  )
}

function IconField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const names = useMemo(
    () => ICON_NAMES.filter((name) => !query || name.includes(query.toLowerCase())),
    [query],
  )
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-left text-sm"
      >
        <span className="flex h-6 w-6 items-center justify-center text-blue-400">
          <Icon name={value || 'sparkles'} size={18} />
        </span>
        <span className="flex-1 truncate">{value || 'sparkles'}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2">
          <Input placeholder="Search icons" value={query} onChange={(event) => setQuery(event.target.value)} />
          <div className="mt-2 grid max-h-44 grid-cols-7 gap-1 overflow-auto">
            {names.map((name) => (
              <button
                key={name}
                type="button"
                title={name}
                onClick={() => {
                  onChange(name)
                  setOpen(false)
                }}
                className={`flex h-8 items-center justify-center rounded ${value === name ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:bg-zinc-800'}`}
              >
                <Icon name={name} size={16} />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function RichTextField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '<p></p>',
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose-invert min-h-24 max-w-none px-3 py-2 text-sm text-zinc-100 outline-none',
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML()) editor.commands.setContent(value || '<p></p>', { emitUpdate: false })
    // Only resynchronise when the selected section changes the incoming value.
  }, [value, editor])

  if (!editor) return <TextArea value={value} onChange={onChange} rows={6} />

  const tools = [
    { label: <Bold size={13} />, run: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { label: <Italic size={13} />, run: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { label: 'H2', run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
    { label: 'H3', run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
    { label: <List size={13} />, run: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
  ]

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950">
      <div className="flex gap-1 border-b border-zinc-800 p-1">
        {tools.map((tool, index) => (
          <button
            key={index}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={tool.run}
            className={`flex h-6 min-w-6 items-center justify-center rounded px-1 text-[11px] ${tool.active ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:bg-zinc-800'}`}
          >
            {tool.label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

function RepeaterField({
  field,
  value,
  onChange,
  context,
}: {
  field: BlockField
  value: unknown
  onChange: (v: unknown) => void
  context: FieldContext
}) {
  const rows: Props[] = Array.isArray(value) ? (value as Props[]) : []
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const children = field.fields || []

  function update(next: Props[]) {
    onChange(next)
  }

  function patchRow(index: number, patch: Props) {
    update(rows.map((row, position) => (position === index ? { ...row, ...patch } : row)))
  }

  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= rows.length) return
    const next = [...rows]
    const [row] = next.splice(index, 1)
    next.splice(target, 0, row)
    update(next)
  }

  const itemLabel = field.itemLabel || 'Item'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{field.label}</Label>
        <span className="text-[11px] text-zinc-500">{rows.length}</span>
      </div>
      <div className="space-y-1.5">
        {rows.map((row, index) => {
          const open = openIndex === index
          const title = String(row.title || row.name || row.label || row.question || row.value || `${itemLabel} ${index + 1}`)
          return (
            <div key={index} className="rounded-lg border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-1 px-2 py-1.5">
                <button type="button" className="flex-1 truncate text-left text-xs text-zinc-200" onClick={() => setOpenIndex(open ? null : index)}>
                  {title}
                </button>
                <button type="button" title="Move up" className="text-zinc-500 hover:text-white" onClick={() => move(index, -1)}>
                  <ChevronUp size={13} />
                </button>
                <button type="button" title="Move down" className="text-zinc-500 hover:text-white" onClick={() => move(index, 1)}>
                  <ChevronDown size={13} />
                </button>
                <button
                  type="button"
                  title={`Duplicate ${itemLabel.toLowerCase()}`}
                  className="text-zinc-500 hover:text-white"
                  onClick={() => {
                    const next = [...rows]
                    next.splice(index + 1, 0, { ...row })
                    update(next)
                  }}
                >
                  <Copy size={12} />
                </button>
                <button
                  type="button"
                  title={`Delete ${itemLabel.toLowerCase()}`}
                  className="text-zinc-500 hover:text-red-400"
                  onClick={() => update(rows.filter((_, position) => position !== index))}
                >
                  <Trash2 size={12} />
                </button>
              </div>
              {open ? (
                <div className="space-y-3 border-t border-zinc-800 p-2">
                  {children.map((child) => (
                    <FieldControl
                      key={child.key}
                      field={child}
                      value={row[child.key]}
                      values={row}
                      onChange={(next) => patchRow(index, { [child.key]: next })}
                      context={{ ...context, pathPrefix: [...(context.pathPrefix || []), field.key, index] }}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => {
          update([...rows, { ...(field.itemDefaults || {}) }])
          setOpenIndex(rows.length)
        }}
      >
        <Plus size={14} /> Add {itemLabel.toLowerCase()}
      </Button>
    </div>
  )
}

export function FieldControl({
  field,
  value,
  values,
  onChange,
  context,
}: {
  field: BlockField
  value: unknown
  values: Props
  onChange: (v: unknown) => void
  context: FieldContext
}) {
  if (!fieldVisible(field, values)) return null

  return (
    <DeviceHintContext.Provider value={context.overridden ? context.device : undefined}>
      <FieldControlFields field={field} value={value} values={values} onChange={onChange} context={context} />
    </DeviceHintContext.Provider>
  )
}

function FieldControlFields({
  field,
  value,
  values,
  onChange,
  context,
}: {
  field: BlockField
  value: unknown
  values: Props
  onChange: (v: unknown) => void
  context: FieldContext
}) {
  const asString = typeof value === 'string' ? value : value === undefined || value === null ? '' : String(value)
  const elementPath: EditPath = [...(context.pathPrefix || []), field.key]
  const showElementStyle = (field.group || 'content') === 'content'

  if (field.key === 'productId' && context.products) {
    return (
      <Row label={field.label} help="The price and what is charged come from the product, not from this page.">
        <Select
          value={asString}
          onChange={onChange as (v: string) => void}
          options={[
            { label: 'Choose a product…', value: '' },
            ...context.products.map((product) => ({
              label: `${product.name}${product.status === 'active' ? '' : ` (${product.status})`}`,
              value: String(product.id),
            })),
          ]}
        />
      </Row>
    )
  }

  if (field.key === 'formId' && context.forms) {
    return (
      <Row label={field.label} help="Visitor messages are emailed to verified workspace members and listed under Submissions.">
        <Select
          value={asString}
          onChange={onChange as (v: string) => void}
          options={[
            { label: 'Choose a form…', value: '' },
            ...context.forms.map((form) => ({ label: `${form.name} (${form.type})`, value: String(form.id) })),
          ]}
        />
      </Row>
    )
  }

  switch (field.type) {
    case 'repeater':
      return <RepeaterField field={field} value={value} onChange={onChange} context={context} />
    case 'toggle':
      return (
        <>
          <Toggle value={Boolean(value)} onChange={onChange} label={field.label} />
          {field.help ? <p className="mt-1 text-[11px] text-zinc-500">{field.help}</p> : null}
        </>
      )
    case 'textarea':
      return (
        <div className="space-y-2">
          <Row label={field.label} help={field.help}>
            <TextArea value={asString} onChange={onChange} />
          </Row>
          {showElementStyle ? <ElementStyleEditor path={elementPath} context={context} /> : null}
        </div>
      )
    case 'richtext':
      return (
        <div className="space-y-2">
          <Row label={field.label} help={field.help}>
            <RichTextField value={asString} onChange={onChange} />
          </Row>
          {showElementStyle ? <ElementStyleEditor path={elementPath} context={context} /> : null}
        </div>
      )
    case 'color':
      return (
        <Row label={field.label} help={field.help}>
          <ColorField
            fieldKey={field.key}
            sectionId={context.sectionId}
            value={asString}
            onChange={onChange as (v: string) => void}
            theme={context.theme}
          />
        </Row>
      )
    case 'background':
      return (
        <Row label={field.label} help={field.help}>
          <SegmentedField
            value={asString}
            fallback="tone"
            onChange={onChange}
            options={field.options || [{ label: 'Theme', value: 'tone' }, { label: 'Color', value: 'color' }]}
          />
        </Row>
      )
    case 'alignment':
      return (
        <Row label={field.label} help={field.help}>
          <AlignmentField value={asString || 'left'} onChange={onChange} />
        </Row>
      )
    case 'slider':
      return (
        <Row label={field.label} help={field.help}>
          <SliderField value={value} onChange={onChange} field={field} fallback={field.min ?? 0} />
        </Row>
      )
    case 'spacing':
      return (
        <Row label={field.label} help={field.help}>
          <SpacingField value={value} onChange={onChange} field={field} />
        </Row>
      )
    case 'number':
      return (
        <Row label={field.label} help={field.help}>
          <Input
            type="number"
            min={field.min}
            max={field.max}
            value={value === undefined || value === null ? '' : String(value)}
            onChange={(event) => onChange(event.target.value === '' ? undefined : Number(event.target.value))}
          />
        </Row>
      )
    case 'image':
      return (
        <Row label={field.label} help={field.help}>
          <MediaPicker value={asString} onChange={(url) => onChange(url)} siteId={context.siteId} kind="image" />
        </Row>
      )
    case 'video':
      return (
        <Row label={field.label} help={field.help}>
          <MediaPicker value={asString} onChange={(url) => onChange(url)} siteId={context.siteId} kind="video" />
        </Row>
      )
    case 'select':
      return (
        <Row label={field.label} help={field.help}>
          <Select
            value={
              field.key === 'animation' && !asString
                ? 'none'
                : field.key === 'animationTrigger' && !asString
                  ? 'scroll'
                  : asString
            }
            onChange={onChange}
            options={field.options || []}
            previewFont={field.key === 'headingFont' || field.key === 'bodyFont'}
          />
        </Row>
      )
    case 'link':
      return (
        <Row label={field.label} help={field.help}>
          <LinkField value={asString} onChange={onChange} pages={context.pages} />
        </Row>
      )
    case 'icon':
      return (
        <Row label={field.label} help={field.help}>
          <IconField value={asString} onChange={onChange} />
        </Row>
      )
    case 'text':
      return (
        <div className="space-y-2">
          <Row label={field.label} help={field.help}>
            <Input value={asString} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} />
          </Row>
          {showElementStyle ? <ElementStyleEditor path={elementPath} context={context} /> : null}
        </div>
      )
    default:
      return (
        <Row label={field.label} help={field.help}>
          <Input value={asString} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} />
        </Row>
      )
  }
}
