import type { BlockDefinition } from '@uidesired/blocks'
import { BLOCK_CATEGORIES, PageRenderer, listBlocks } from '@uidesired/blocks'
import type { BlockCategory, ThemeTokens } from '@uidesired/types'
import { themeToCssVars } from '@uidesired/design-system'
import { cn } from '@uidesired/utilities'
import { useDraggable } from '@dnd-kit/core'
import { ChevronDown, ChevronRight, GripVertical, Plus, Search } from 'lucide-react'
import { memo, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'

/** Width the block is rendered at before being scaled down into the palette. */
const RENDER_WIDTH = 1240

const CATEGORY_LABELS: Record<BlockCategory, string> = {
  navigation: 'Navigation',
  hero: 'Hero',
  features: 'Features',
  services: 'Services',
  content: 'Content',
  gallery: 'Gallery',
  pricing: 'Pricing',
  faq: 'FAQ',
  cta: 'Call to action',
  footer: 'Footer',
  form: 'Forms',
  testimonials: 'Testimonials',
  team: 'Team',
  blog: 'Blog',
}

type TemplateKit = { id: string; label: string; matches: (type: string) => boolean }

/** Bespoke blocks introduced by complete templates. Other kits stay out of this site’s palette. */
export const TEMPLATE_KITS: TemplateKit[] = [
  { id: 'tessera', label: 'Tessera', matches: (type) => type.includes('.tessera') },
  { id: 'axiom-north', label: 'Axiom North', matches: (type) => type.includes('.axiom') },
  { id: 'lumen-lane', label: 'Lumen & Lane', matches: (type) => type.includes('.lumen') || type.includes('_lumen') },
  { id: 'cinder-row', label: 'Cinder & Row', matches: (type) => type.includes('.cinder') || type.includes('_cinder') },
  { id: 'nivara', label: 'Nivara', matches: (type) => type.includes('.moksha') || type.includes('_moksha') },
  { id: 'solara', label: 'Solara', matches: (type) => type.includes('.solara') || type.includes('_solara') },
  { id: 'verdara', label: 'Verdara', matches: (type) => type.includes('.verdara') || type === 'cta.crew' },
  {
    id: 'hale',
    label: 'Hale',
    matches: (type) => ['navbar.counsel', 'hero.panel', 'content.markers', 'content.band', 'content.ruled'].includes(type),
  },
  {
    id: 'genesis',
    label: 'Genesis',
    matches: (type) => ['hero.glow', 'features.rail', 'process.zigzag', 'testimonials.rail'].includes(type),
  },
  {
    id: 'chatdeck',
    label: 'Chatdeck',
    matches: (type) => ['hero.product', 'features.minimal', 'team.circle', 'testimonials.compact'].includes(type),
  },
  { id: 'vantage', label: 'Vantage.OS', matches: (type) => type.includes('.vantage') },
  { id: 'junction', label: 'Junction', matches: (type) => type.includes('.junction') },
  { id: 'kindred', label: 'Kindred', matches: (type) => type.includes('.kindred') },
  { id: 'northbook', label: 'Northbook', matches: (type) => type.includes('.northbook') },
  { id: 'voltera', label: 'Voltera', matches: (type) => type.includes('.voltera') },
  { id: 'halcyon', label: 'Halcyon', matches: (type) => type.includes('.halcyon') },
  {
    id: 'studio',
    label: 'Studio',
    matches: (type) => ['hero.studio', 'content.capabilities', 'cta.bar', 'gallery.projects', 'testimonials.bento', 'pricing.duo', 'cta.gradient'].includes(type),
  },
]

export function templateKitFor(type: string): TemplateKit | undefined {
  return TEMPLATE_KITS.find((kit) => kit.matches(type))
}

/** The kit this site is built from: the family that appears most on the page. */
export function activeTemplateKit(usedTypes?: string[]): TemplateKit | undefined {
  const counts = new Map<string, number>()
  for (const type of usedTypes ?? []) {
    const kit = templateKitFor(type)
    if (!kit) continue
    counts.set(kit.id, (counts.get(kit.id) || 0) + 1)
  }
  if (!counts.size) return undefined
  const winner = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
  return TEMPLATE_KITS.find((kit) => kit.id === winner)
}

function useInView<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!enabled || inView) return
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '240px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [enabled, inView])

  return { ref, inView }
}

/**
 * Renders the real block component at desktop width and scales it down, so the
 * palette shows the actual design rather than a static screenshot.
 */
export const BlockPreview = memo(function BlockPreview({
  def,
  width,
  height,
  theme,
}: {
  def: BlockDefinition
  width: number
  height: number
  theme?: ThemeTokens
}) {
  const scale = width / RENDER_WIDTH
  const section = useMemo(
    () => ({ id: `preview-${def.type}`, type: def.type, version: def.version, hidden: false, props: def.defaultProps }),
    [def],
  )
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none overflow-hidden bg-white"
      style={{ width, height }}
    >
      <div
        className="canvas-theme"
        style={{
          width: RENDER_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          ...(themeToCssVars(theme) as CSSProperties),
        }}
      >
        <PageRenderer content={{ schemaVersion: 1, sections: [section] }} theme={theme} includeStyles={false} />
      </div>
    </div>
  )
})

function PaletteCard({
  def,
  theme,
  onAdd,
  onHover,
}: {
  def: BlockDefinition
  theme?: ThemeTokens
  onAdd: () => void
  onHover: (def: BlockDefinition | null, top: number) => void
}) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${def.type}`,
    data: { kind: 'palette', blockType: def.type },
  })

  // Previews contain real block markup (including buttons and summaries), so the card
  // itself must not be a <button> — nested interactive elements are invalid HTML.
  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      title={`Add ${def.label}`}
      className={`group cursor-pointer overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 text-left transition hover:border-blue-500/70 focus:outline-none focus-visible:border-blue-500 ${
        isDragging ? 'opacity-40' : ''
      }`}
      onMouseEnter={(event) => onHover(def, event.currentTarget.getBoundingClientRect().top)}
      onMouseLeave={() => onHover(null, 0)}
      onClick={onAdd}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onAdd()
        }
      }}
    >
      <div className="h-[104px] w-full overflow-hidden border-b border-zinc-800 bg-white">
        {inView ? (
          <BlockPreview def={def} width={246} height={104} theme={theme} />
        ) : (
          <div className="h-full w-full animate-pulse bg-zinc-800/60" />
        )}
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <span
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          className="cursor-grab text-zinc-600 group-hover:text-zinc-300"
          title="Drag onto the canvas"
          onClick={(event) => event.stopPropagation()}
        >
          <GripVertical size={13} />
        </span>
        <span className="flex-1 truncate text-xs text-zinc-200">{def.label}</span>
        <Plus size={13} className="text-zinc-600 group-hover:text-blue-400" />
      </div>
    </div>
  )
}

export function BlockPalette({
  theme,
  onAdd,
  categories = BLOCK_CATEGORIES,
  className,
  usedTypes,
}: {
  theme?: ThemeTokens
  onAdd: (type: string) => void
  categories?: BlockCategory[]
  className?: string
  /** Block types already on the page, used to spot which kit this site is built from. */
  usedTypes?: string[]
}) {
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState<Partial<Record<string, boolean>>>({})
  const [hovered, setHovered] = useState<{ def: BlockDefinition; top: number } | null>(null)
  const activeKit = useMemo(() => activeTemplateKit(usedTypes), [usedTypes])

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return listBlocks().filter((def) => {
      if (!categories.includes(def.category)) return false
      const kit = templateKitFor(def.type)
      if (kit && kit.id !== activeKit?.id) return false
      if (!needle) return true
      return (
        def.label.toLowerCase().includes(needle) ||
        def.type.toLowerCase().includes(needle) ||
        def.category.includes(needle) ||
        kit?.label.toLowerCase().includes(needle)
      )
    })
  }, [activeKit?.id, categories, query])

  return (
    <aside className={cn('flex w-72 shrink-0 flex-col border-r border-zinc-800', className)}>
      <div className="border-b border-zinc-800 p-3">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-2.5 text-zinc-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search blocks"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2 pl-8 pr-3 text-sm text-zinc-100 outline-none focus:border-blue-500"
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {activeKit ? (
          <p className="mb-3 text-[11px] uppercase tracking-wide text-zinc-500">{activeKit.label} blocks</p>
        ) : null}
        {categories.map((category) => {
          const blocks = matches.filter((def) => def.category === category)
          if (!blocks.length) return null
          const isCollapsed = Boolean(collapsed[category]) && !query
          return (
            <div key={category} className="mb-4">
              <button
                type="button"
                className="mb-2 flex w-full items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500 hover:text-zinc-300"
                onClick={() => setCollapsed((state) => ({ ...state, [category]: !state[category] }))}
              >
                {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                {CATEGORY_LABELS[category]}
                <span className="ml-auto text-zinc-600">{blocks.length}</span>
              </button>
              {isCollapsed ? null : (
                <div className="space-y-2">
                  {blocks.map((def) => (
                    <PaletteCard
                      key={def.type}
                      def={def}
                      theme={theme}
                      onAdd={() => onAdd(def.type)}
                      onHover={(hoveredDef, top) => setHovered(hoveredDef ? { def: hoveredDef, top } : null)}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
        {!matches.length ? <p className="text-sm text-zinc-500">No blocks match “{query}”.</p> : null}
      </div>
      {hovered ? (
        <div
          className="pointer-events-none fixed left-[19rem] z-40 overflow-hidden rounded-xl border border-zinc-700 bg-white shadow-2xl"
          style={{ top: Math.max(72, Math.min(hovered.top, window.innerHeight - 360)) }}
        >
          <BlockPreview def={hovered.def} width={520} height={330} theme={theme} />
        </div>
      ) : null}
    </aside>
  )
}
