import type { BlockField, BlockFieldGroup, BlogPost, PageContent, PageSection, SiteForm, ThemeTokens } from '@uidesired/types'
import {
  BlockStyles,
  EDIT_PROP,
  PageRenderer,
  blockRegistry,
  getBlock,
  isResponsiveField,
  mergeResponsiveProps,
  mergeStyleMaps,
  patchResponsiveElementStyle,
  patchResponsiveProps,
  responsiveOverrideKeys,
  type EditBinding,
  type EditPath,
  type ElementStyleMap,
  type ElementTextStyle,
} from '@uidesired/blocks'
import { themeToCssVars } from '@uidesired/design-system'
import { createId, debounce } from '@uidesired/utilities'
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ClipboardPaste,
  Copy,
  CopyPlus,
  Eye,
  EyeOff,
  GripVertical,
  Monitor,
  PanelLeft,
  PanelLeftClose,
  PanelRight,
  PanelRightClose,
  Redo2,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  Undo2,
  History,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { blogApi, formsApi, menusApi, pagesApi, productsApi, sitesApi } from '../lib/endpoints'
import { setAtPath } from '../lib/props'
import { liveUrl, pagePath, previewUrl } from '../lib/siteUrls'
import { AiPanel } from '../components/AiPanel'
import { BlockPalette } from '../components/BlockPalette'
import { FieldControl, fieldVisible } from '../components/FieldControls'
import { GoogleFonts } from '../components/GoogleFonts'
import { InlineAiToolbar } from '../components/InlineAiToolbar'
import { MediaPicker } from '../components/MediaLibrary'
import { PageMenu } from '../components/PageMenu'
import { HistoryPanel } from '../components/HistoryPanel'
import { ThemePanel } from '../components/ThemePanel'
import { ThemeToggle } from '../components/ThemeToggle'
import { PageSeoFields } from './SeoPages'
import { DEVICE_WIDTHS, useDevicePreviewStore } from '../stores/devicePreviewStore'
import { useEditorStore } from '../stores/editorStore'
import { useHistoryStore } from '../stores/historyStore'
import { useSelectionStore } from '../stores/selectionStore'
import { useSiteStore } from '../stores/siteStore'
import { Button } from '../ui/primitives'
import { applyPageStyleProfile } from '../lib/sectionDefaults'
import { publishSiteWithRenders } from '@/lib/publishSite'

const TABS: Array<{ id: BlockFieldGroup; label: string }> = [
  { id: 'content', label: 'Content' },
  { id: 'design', label: 'Design' },
  { id: 'layout', label: 'Layout' },
  { id: 'spacing', label: 'Spacing' },
  { id: 'typography', label: 'Type' },
  { id: 'animation', label: 'Motion' },
  { id: 'background', label: 'Background' },
  { id: 'image', label: 'Images' },
]

function bindFormSections(sections: PageSection[], forms: SiteForm[]): { sections: PageSection[]; changed: boolean } {
  if (!forms.length) return { sections, changed: false }
  let changed = false
  const next = sections.map((section) => {
    if (!section.type.startsWith('form.')) return section
    const rawKind = section.type.split('.')[1]
    const kind = rawKind === 'cinder' || rawKind === 'lumen_contact' ? 'contact' : rawKind === 'lumen_booking' ? 'quote' : rawKind
    const current = String(section.props?.formId || '')
    if (forms.some((form) => String(form.id) === current)) return section
    const match = forms.find((form) => form.type === kind) || forms[0]
    changed = true
    return { ...section, props: { ...section.props, formId: String(match.id) } }
  })
  return { sections: next, changed }
}

function isBlogIndexSlug(slug?: string | null) {
  return slug === 'blog' || slug === 'journal'
}

function sectionUsesSitePosts(props: Record<string, unknown> | undefined, pageSlug?: string | null) {
  if (props && Object.prototype.hasOwnProperty.call(props, 'useSitePosts')) return Boolean(props.useSitePosts)
  return isBlogIndexSlug(pageSlug)
}

function formatPostDate(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function sitePostCards(posts: BlogPost[], prefix = '/blog') {
  return posts
    .filter((post) => post.status === 'published')
    .map((post) => ({
      title: post.title,
      excerpt: post.excerpt || '',
      date: formatPostDate(post.published_at),
      tag: post.category || 'Blog',
      image: post.cover_image || '',
      url: post.path || `${prefix}/${post.slug}`,
    }))
}

function isSiteBlogBlock(type: string) {
  return type === 'posts.cards' || type.startsWith('blog.')
}

function withSiteBlogPosts(sections: PageSection[], pageSlug: string | undefined, posts: BlogPost[]): PageSection[] {
  const cards = sitePostCards(posts)
  return sections.map((section) => {
    if (!isSiteBlogBlock(section.type) || !sectionUsesSitePosts(section.props, pageSlug)) return section
    const limit = Number(section.props.limit) || 0
    const items = limit > 0 ? cards.slice(0, limit) : cards
    return { ...section, props: { ...section.props, useSitePosts: true, ...(cards.length ? { items } : {}) } }
  })
}

function cloneSection(section: PageSection): PageSection {
  return { ...section, id: createId('sec'), props: JSON.parse(JSON.stringify(section.props)) as Record<string, unknown> }
}

function newSection(type: string, forms: SiteForm[] = []): PageSection {
  const def = getBlock(type)
  const props = JSON.parse(JSON.stringify(def?.defaultProps || {})) as Record<string, unknown>
  if (type.startsWith('form.') && forms.length) {
    const rawKind = type.split('.')[1]
    const kind = rawKind === 'cinder' || rawKind === 'lumen_contact' ? 'contact' : rawKind === 'lumen_booking' ? 'quote' : rawKind
    const match = forms.find((form) => form.type === kind) || forms[0]
    props.formId = String(match.id)
  }
  return { id: createId('sec'), type, version: def?.version ?? 1, hidden: false, props }
}

type Nav = { label: string; href: string; children?: { label: string; href: string }[] }[]

type Toast = { text: string; tone?: 'ok' | 'err'; link?: { url: string; label: string } }

function errorText(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

/**
 * Which shared slot a block belongs in, if any.
 *
 * Same families the renderer uses to decide whether a page has chrome of its
 * own, so the offer to share only appears on blocks that would actually be
 * replaced by the shared one.
 */
function chromeSlotOf(type: string): 'header' | 'footer' | null {
  const family = type.split('.')[0]
  if (family === 'navbar' || family === 'nav' || family === 'header') return 'header'
  if (family === 'footer') return 'footer'
  return null
}


function SectionFrame({
  section,
  index,
  total,
  selected,
  onSelect,
  navigation,
  pageId,
  theme,
  onMove,
  onDuplicate,
  onDelete,
  onToggleHidden,
  edit,
}: {
  section: PageSection
  index: number
  total: number
  selected: boolean
  onSelect: () => void
  navigation?: Nav
  pageId?: string | number
  theme?: ThemeTokens
  onMove: (delta: number) => void
  onDuplicate: () => void
  onDelete: () => void
  onToggleHidden: () => void
  /** Inline editing binding for this section; blocks pick it up via `editOf(props)`. */
  edit: EditBinding
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  })
  const previewDevice = useDevicePreviewStore((s) => s.device)
  const def = getBlock(section.type)

  return (
    <div
      ref={setNodeRef}
      data-section-frame={section.id}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={`group/section relative outline-offset-[-2px] ${
        selected ? 'outline outline-2 outline-blue-500' : 'hover:outline hover:outline-1 hover:outline-blue-400/70'
      }`}
      onClick={(event) => {
        event.stopPropagation()
        onSelect()
      }}
    >
      <div
        className={`pointer-events-none absolute left-0 top-0 z-20 flex w-full items-start justify-between p-1.5 opacity-0 transition group-hover/section:opacity-100 ${
          selected ? 'opacity-100' : ''
        }`}
      >
        <span className="pointer-events-auto flex items-center gap-1 rounded-md bg-zinc-900/90 px-1.5 py-1 text-[10px] font-medium text-white shadow">
          <button
            ref={setActivatorNodeRef}
            type="button"
            className="cursor-grab text-zinc-400 hover:text-white"
            title="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={12} />
          </button>
          {def?.label || section.type}
        </span>
        <span className="pointer-events-auto flex items-center gap-0.5 rounded-md bg-zinc-900/90 px-1 py-1 text-white shadow">
          <button
            type="button"
            title="Move up"
            disabled={index === 0}
            className="p-1 text-zinc-300 hover:text-white disabled:opacity-30"
            onClick={(event) => {
              event.stopPropagation()
              onMove(-1)
            }}
          >
            <ArrowUp size={12} />
          </button>
          <button
            type="button"
            title="Move down"
            disabled={index === total - 1}
            className="p-1 text-zinc-300 hover:text-white disabled:opacity-30"
            onClick={(event) => {
              event.stopPropagation()
              onMove(1)
            }}
          >
            <ArrowDown size={12} />
          </button>
          <button
            type="button"
            title="Duplicate"
            className="p-1 text-zinc-300 hover:text-white"
            onClick={(event) => {
              event.stopPropagation()
              onDuplicate()
            }}
          >
            <CopyPlus size={12} />
          </button>
          <button
            type="button"
            title={section.hidden ? 'Show section' : 'Hide section'}
            className="p-1 text-zinc-300 hover:text-white"
            onClick={(event) => {
              event.stopPropagation()
              onToggleHidden()
            }}
          >
            {section.hidden ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
          <button
            type="button"
            title="Delete"
            className="p-1 text-zinc-300 hover:text-red-400"
            onClick={(event) => {
              event.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 size={12} />
          </button>
        </span>
      </div>
      <div className={section.hidden ? 'opacity-40' : undefined}>
        <PageRenderer
          content={{
            schemaVersion: 1,
            sections: [{ ...section, hidden: false, props: { ...section.props, [EDIT_PROP]: edit } }],
          }}
          theme={theme}
          navigation={navigation}
          pageId={pageId}
          includeStyles={false}
          formApiBase="/api/v1/public/forms"
          previewDevice={previewDevice}
        />
      </div>
      {section.hidden ? (
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-10">
          <span className="rounded-full bg-zinc-950/80 px-3 py-1 text-xs text-white">Hidden on the published site</span>
        </div>
      ) : null}
    </div>
  )
}

function DropZone({ id, label, active }: { id: string; label: string; active: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  if (!active) return <div ref={setNodeRef} className="h-6" />
  return (
    <div
      ref={setNodeRef}
      className={`m-3 flex h-20 items-center justify-center rounded-xl border-2 border-dashed text-sm transition ${
        isOver ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-zinc-300 text-zinc-400'
      }`}
    >
      {label}
    </div>
  )
}

export function BuilderPage() {
  const { id } = useParams()
  const qc = useQueryClient()
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState<BlockFieldGroup>('content')
  const [themeOpen, setThemeOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  // Content held aside while an older version is shown on the canvas, so
  // cancelling a preview puts the editor back exactly as it was.
  const [preHistorySections, setPreHistorySections] = useState<PageSection[] | null>(null)
  // The theme is part of a version too, so stepping through history has to
  // be able to put the working copy's theme back the same way.
  const [preHistoryTheme, setPreHistoryTheme] = useState<ThemeTokens | null>(null)
  const [aiOpen, setAiOpen] = useState(false)
  const [leftOpen, setLeftOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    const stored = window.localStorage.getItem('ud-editor-left')
    if (stored === '0') return false
    if (stored === '1') return true
    return window.innerWidth >= 1100
  })
  const [rightOpen, setRightOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    const stored = window.localStorage.getItem('ud-editor-right')
    if (stored === '0') return false
    if (stored === '1') return true
    return window.innerWidth >= 1100
  })
  const [dragging, setDragging] = useState<{ kind: 'palette' | 'section'; label: string } | null>(null)
  const [toast, setToastState] = useState<Toast | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const setToast = useCallback(
    (text: string, extra?: Omit<Toast, 'text'>) => setToastState(text ? { text, ...extra } : null),
    [],
  )
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const content = useEditorStore((s) => s.content)
  const setContent = useEditorStore((s) => s.setContent)
  const updateSection = useEditorStore((s) => s.updateSection)
  const updateProps = useEditorStore((s) => s.updateProps)
  const saveStatus = useEditorStore((s) => s.saveStatus)
  const setSections = useEditorStore((s) => s.setSections)
  const storePageId = useEditorStore((s) => s.pageId)
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus)
  const dirty = useEditorStore((s) => s.dirty)
  const setContext = useEditorStore((s) => s.setContext)
  const selectedId = useSelectionStore((s) => s.sectionId)
  const select = useSelectionStore((s) => s.select)
  const device = useDevicePreviewStore((s) => s.device)
  const setDevice = useDevicePreviewStore((s) => s.setDevice)
  const theme = useSiteStore((s) => s.theme)
  const setTheme = useSiteStore((s) => s.setTheme)
  const pushHistory = useHistoryStore((s) => s.push)
  const undoHistory = useHistoryStore((s) => s.undo)
  const redoHistory = useHistoryStore((s) => s.redo)
  const resetHistory = useHistoryStore((s) => s.reset)
  const canUndo = useHistoryStore((s) => s.past.length > 0)
  const canRedo = useHistoryStore((s) => s.future.length > 0)

  const pages = useQuery({ queryKey: ['pages', id], queryFn: () => pagesApi.list(id!) })
  const menus = useQuery({ queryKey: ['menus', id], queryFn: () => menusApi.get(id!) })
  const siteForms = useQuery({ queryKey: ['forms', id], queryFn: () => formsApi.list(id!), enabled: Boolean(id) })
  // Products belong to the workspace rather than the site, so a buy button can
  // be pointed at anything the shop sells from any of its pages.
  const products = useQuery({ queryKey: ['products'], queryFn: () => productsApi.list() })
  const site = useQuery({ queryKey: ['site', id], queryFn: () => sitesApi.get(id!) })
  const sitePosts = useQuery({
    queryKey: ['blog-posts', id, 'published'],
    queryFn: () => blogApi.list({ site_id: id, status: 'published' }),
    enabled: Boolean(id),
  })
  const themeQuery = useQuery({ queryKey: ['theme', id], queryFn: () => sitesApi.theme(id!) })

  const navigation: Nav = (menus.data?.[0]?.items || []).map((item) => ({
    label: String(item.label || ''),
    href: String(item.href || item.url || '#'),
    children: Array.isArray(item.children)
      ? (item.children as Record<string, unknown>[]).map((child) => ({
          label: String(child.label || ''),
          href: String(child.href || child.url || '#'),
        }))
      : [],
  }))

  /**
   * The canvas edits one of three things: a page, the site header, or the site
   * footer. The header and footer are section lists in a page's shape, so the
   * same canvas, palette and settings panel work on them unchanged - only where
   * the content is loaded from and saved to differs.
   */
  const chromeParam = params.get('chrome')
  const chromeSlot = chromeParam === 'header' || chromeParam === 'footer' ? chromeParam : null
  // Read inside the debounced save, which would otherwise close over a stale value.
  const chromeSlotRef = useRef<'header' | 'footer' | null>(chromeSlot)
  chromeSlotRef.current = chromeSlot

  const chromeQuery = useQuery({
    queryKey: ['site-chrome', id],
    queryFn: () => sitesApi.chrome(id!),
    enabled: Boolean(id),
  })

  const currentPage = chromeSlot
    ? undefined
    : pages.data?.find((page) => String(page.id) === params.get('page')) ||
      pages.data?.find((page) => page.is_homepage) ||
      pages.data?.[0]

  useEffect(() => {
    window.localStorage.setItem('ud-editor-left', leftOpen ? '1' : '0')
  }, [leftOpen])

  useEffect(() => {
    window.localStorage.setItem('ud-editor-right', rightOpen ? '1' : '0')
  }, [rightOpen])

  useEffect(() => {
    if (site.data) useSiteStore.getState().setSite(site.data)
  }, [site.data])

  useEffect(() => {
    const tokens = (themeQuery.data as { tokens?: Record<string, never> })?.tokens
    if (tokens) setTheme(tokens)
  }, [themeQuery.data, setTheme])

  useEffect(() => {
    if (chromeSlot || !currentPage) return
    setContext(String(id), String(currentPage.id))
    const draft = currentPage.draft?.content || { schemaVersion: 1 as const, sections: [] }
    setContent(draft, false)
    resetHistory()
    select(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage?.id, chromeSlot])

  useEffect(() => {
    if (!chromeSlot || !chromeQuery.data) return
    // No page id: saving goes to the site's chrome endpoint instead of a draft.
    setContext(String(id), '')
    setContent(chromeQuery.data[chromeSlot] || { schemaVersion: 1 as const, sections: [] }, false)
    resetHistory()
    select(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chromeSlot, chromeQuery.data])

  useEffect(() => {
    const forms = siteForms.data
    if (!forms?.length) return
    const state = useEditorStore.getState()
    const { sections, changed } = bindFormSections(state.content.sections, forms)
    if (!changed) return
    setContent({ ...state.content, sections }, true)
  }, [siteForms.data, currentPage?.id, setContent])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToastState(null), toast.link ? 8000 : 2600)
    return () => clearTimeout(timer)
  }, [toast])

  /**
   * Writes the canvas back to wherever it came from.
   *
   * A page goes to its draft; the header and footer go to the site, where every
   * page picks them up at render time. Sending only the slot being edited
   * leaves the other one alone.
   */
  const writeContent = useCallback(
    async (content: PageContent) => {
      const slot = chromeSlotRef.current
      if (slot) {
        await sitesApi.updateChrome(id!, { [slot]: content })
        await qc.invalidateQueries({ queryKey: ['site-chrome', id] })

        return
      }
      const pageId = useEditorStore.getState().pageId
      if (!pageId) throw new Error('Create a page before saving.')
      await pagesApi.saveDraft(pageId, content)
    },
    [id, qc],
  )

  const saveDraft = useMemo(
    () =>
      debounce(async () => {
        const state = useEditorStore.getState()
        if (!state.dirty) return
        if (!chromeSlotRef.current && !state.pageId) return
        setSaveStatus('saving')
        try {
          await writeContent(state.content)
          setSaveStatus('saved')
          useEditorStore.setState({ dirty: false })
        } catch {
          setSaveStatus('error')
        }
      }, 800),
    [setSaveStatus, writeContent],
  )

  useEffect(() => {
    if (dirty) saveDraft()
  }, [content, dirty, saveDraft])

  const commit = useCallback(
    (sections: PageSection[]) => {
      pushHistory(useEditorStore.getState().content)
      setContent({ schemaVersion: 1, sections }, true)
    },
    [pushHistory, setContent],
  )

  /**
   * Applies an on-canvas edit. Inline edits are discrete actions, so each one gets
   * its own history entry and then rides the normal autosave effect.
   */
  const commitInline = useCallback(
    (sectionId: string, path: EditPath, value: unknown) => {
      const list = useEditorStore.getState().content.sections
      const section = list.find((entry) => entry.id === sectionId)
      if (!section) return
      const nextProps = setAtPath(section.props as Record<string, unknown>, path, value)
      delete nextProps[EDIT_PROP]
      commit(list.map((entry) => (entry.id === sectionId ? { ...entry, props: nextProps } : entry)))
    },
    [commit],
  )

  const [imageEdit, setImageEdit] = useState<{ sectionId: string; path: EditPath; current: string } | null>(null)


  const bindings = useMemo(() => {
    const cache = new Map<string, EditBinding>()
    return (sectionId: string): EditBinding => {
      const existing = cache.get(sectionId)
      if (existing) return existing
      const binding: EditBinding = {
        commit: (path, value) => commitInline(sectionId, path, value),
        pickImage: (path, current) => {
          select(sectionId)
          setImageEdit({ sectionId, path, current })
        },
      }
      cache.set(sectionId, binding)
      return binding
    }
  }, [commitInline, select])

  const sections = content.sections
  const canvasSections = useMemo(
    () => withSiteBlogPosts(sections, currentPage?.slug, sitePosts.data || []),
    [currentPage?.slug, sections, sitePosts.data],
  )
  const selected = sections.find((section) => section.id === selectedId)
  const def = selected ? getBlock(selected.type) : undefined
  const viewProps = selected ? mergeResponsiveProps(selected.props, device) : {}
  const overrideKeys = selected ? responsiveOverrideKeys(selected.props, device) : new Set<string>()

  const insertSection = useCallback(
    (type: string, at?: number) => {
      const section = newSection(type, siteForms.data || [])
      // A block from the core library carries none of the template's
      // conventions, so it lands looking foreign. Adopt whatever the rest of
      // the page already agrees on (motion, width, type) before inserting.
      applyPageStyleProfile(section.props, useEditorStore.getState().content.sections)
      if (isSiteBlogBlock(type) && (isBlogIndexSlug(currentPage?.slug) || type.startsWith('blog.'))) {
        section.props.useSitePosts = true
        if (isBlogIndexSlug(currentPage?.slug) && type === 'posts.cards') section.props.items = []
      }
      const next = [...useEditorStore.getState().content.sections]
      next.splice(at ?? next.length, 0, section)
      commit(next)
      select(section.id)
      setTab('content')
    },
    [commit, currentPage?.slug, select, siteForms.data],
  )

  const duplicateSection = useCallback(
    (sectionId?: string | null) => {
      const list = useEditorStore.getState().content.sections
      const index = list.findIndex((section) => section.id === sectionId)
      if (index < 0) return
      const copy = { ...list[index], id: createId('sec'), props: JSON.parse(JSON.stringify(list[index].props)) }
      const next = [...list]
      next.splice(index + 1, 0, copy)
      commit(next)
      select(copy.id)
    },
    [commit, select],
  )

  const deleteSection = useCallback(
    (sectionId?: string | null) => {
      const list = useEditorStore.getState().content.sections
      if (!list.some((section) => section.id === sectionId)) return
      commit(list.filter((section) => section.id !== sectionId))
      select(null)
    },
    [commit, select],
  )

  const moveSection = useCallback(
    (sectionId: string, delta: number) => {
      const list = useEditorStore.getState().content.sections
      const index = list.findIndex((section) => section.id === sectionId)
      const target = index + delta
      if (index < 0 || target < 0 || target >= list.length) return
      commit(arrayMove(list, index, target))
    },
    [commit],
  )

  const applyUndo = useCallback(() => {
    const snapshot = undoHistory(useEditorStore.getState().content)
    if (snapshot) setContent(snapshot, true)
  }, [setContent, undoHistory])

  const applyRedo = useCallback(() => {
    const snapshot = redoHistory(useEditorStore.getState().content)
    if (snapshot) setContent(snapshot, true)
  }, [redoHistory, setContent])

  const persistDraft = useCallback(async () => {
    const state = useEditorStore.getState()
    if (!chromeSlotRef.current && !state.pageId) return { ok: false, error: 'Create a page before saving.' }
    setSaveStatus('saving')
    try {
      await writeContent(state.content)
      useEditorStore.setState({ dirty: false })
      setSaveStatus('saved')
      return { ok: true as const }
    } catch (error) {
      setSaveStatus('error')
      return { ok: false, error: errorText(error, 'Could not save the draft') }
    }
  }, [setSaveStatus, writeContent])

  const saveNow = useCallback(async () => {
    const result = await persistDraft()
    setToast(result.ok ? 'Draft saved' : result.error || 'Could not save the draft', result.ok ? undefined : { tone: 'err' })
    return result.ok
  }, [persistDraft])

  const [adopting, setAdopting] = useState(false)

  /**
   * Lifts this page's header or footer into the site, and strips the per-page
   * copies so every page renders the shared one from here on.
   */
  const adoptChrome = useCallback(
    async (slot: 'header' | 'footer') => {
      if (!id || adopting) return
      setAdopting(true)
      try {
        // Anything unsaved on this page is part of what is being shared.
        await persistDraft()
        const result = await sitesApi.adoptChrome(id, { slot, page_id: currentPage?.id })
        // The page just lost its copy on the server, so the canvas has to be
        // reloaded or it keeps showing a block the draft no longer has.
        await qc.invalidateQueries({ queryKey: ['pages', id] })
        setToast(
          result.pages > 1
            ? `That ${slot} is now on every page. Removed it from ${result.pages} pages. Publish to put it live.`
            : `That ${slot} is now the site ${slot}. Publish to put it live.`,
        )
      } catch (error) {
        setToast(errorText(error, `Could not share this ${slot}.`), { tone: 'err' })
      } finally {
        setAdopting(false)
      }
    },
    [adopting, currentPage?.id, id, persistDraft, qc, setToast],
  )

  const openPreview = useCallback(async () => {
    // Open the tab synchronously so the popup blocker keeps it: it would drop a
    // window.open() that happens after awaiting the save and token requests.
    const tab = window.open('', '_blank')
    setPreviewing(true)
    try {
      const saved = await persistDraft()
      if (!saved.ok) throw new Error(saved.error)
      const token = await sitesApi.previewToken(id!)
      const url = previewUrl(site.data, token.token_url, pagePath(currentPage))
      if (!url) {
        tab?.close()
        setToast('This site has no domain yet, so it cannot be previewed.', { tone: 'err' })
        return
      }
      if (tab) tab.location.href = url
      else setToast('Preview is ready — your browser blocked the new tab.', { link: { url, label: 'Open preview' } })
    } catch (error) {
      tab?.close()
      setToast(errorText(error, 'Could not create a preview link'), { tone: 'err' })
    } finally {
      setPreviewing(false)
    }
  }, [currentPage, id, persistDraft, site.data])

  /** New pages start with a usable skeleton instead of an empty canvas. */
  const starterContent = useCallback(
    (page: { name: string; slug: string }): PageContent => {
      const forms = siteForms.data || []
      if (isBlogIndexSlug(page.slug)) {
        const existing = useEditorStore.getState().content.sections
        const nav = existing.find((section) => section.type.startsWith('navbar.'))
        const footer = [...existing].reverse().find((section) => section.type.startsWith('footer.'))
        const hero = newSection('hero.page', forms)
        hero.props.heading = page.name
        hero.props.description = 'Articles published on this site.'
        hero.props.breadcrumb = `Home / ${page.name}`
        const posts = newSection('blog.featured', forms)
        posts.props.useSitePosts = true
        posts.props.items = []
        posts.props.heading = ''
        posts.props.eyebrow = ''
        posts.props.description = ''
        posts.props.buttonLabel = ''
        posts.props.buttonUrl = `/${page.slug}`
        return {
          schemaVersion: 1,
          sections: [
            nav ? cloneSection(nav) : newSection('navbar.simple', forms),
            hero,
            posts,
            footer ? cloneSection(footer) : newSection('footer.simple', forms),
          ],
        }
      }
      return {
        schemaVersion: 1,
        sections: ['navbar.simple', 'hero.centered', 'cta.simple', 'footer.simple'].map((type) => newSection(type, forms)),
      }
    },
    [siteForms.data],
  )

  /** Persists in-flight edits before loading another page's draft. */
  const switchPage = useCallback(
    async (page: { id: number | string }) => {
      if (!chromeSlot && String(page.id) === String(currentPage?.id ?? '')) return
      if (useEditorStore.getState().dirty) {
        const saved = await persistDraft()
        if (!saved.ok) {
          setToast(saved.error || 'Could not save the draft', { tone: 'err' })
          return
        }
      }
      setParams({ page: String(page.id) })
    },
    [chromeSlot, currentPage?.id, persistDraft, setParams, setToast],
  )

  /** Same flow as switching pages: whatever is on the canvas is saved first. */
  const switchChrome = useCallback(
    async (slot: 'header' | 'footer') => {
      if (chromeSlot === slot) return
      if (useEditorStore.getState().dirty) {
        const saved = await persistDraft()
        if (!saved.ok) {
          setToast(saved.error || 'Could not save the draft', { tone: 'err' })
          return
        }
      }
      setParams({ chrome: slot })
    },
    [chromeSlot, persistDraft, setParams, setToast],
  )

  const publish = useCallback(async () => {
    setPublishing(true)
    try {
      const saved = await persistDraft()
      if (!saved.ok) throw new Error(saved.error)
      await publishSiteWithRenders(id!)
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['site', id] }),
        qc.invalidateQueries({ queryKey: ['pages', id] }),
      ])
      const url = liveUrl(site.data, pagePath(currentPage))
      setToast('Published', url ? { link: { url, label: 'View live' } } : undefined)
    } catch (error) {
      setToast(errorText(error, 'Publish failed'), { tone: 'err' })
    } finally {
      setPublishing(false)
    }
  }, [currentPage, id, persistDraft, qc, site.data])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const typing =
        !!target &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
          target.closest('[contenteditable="true"]') !== null)
      const meta = event.metaKey || event.ctrlKey

      if (meta && event.key.toLowerCase() === 's') {
        event.preventDefault()
        void saveNow()
        return
      }
      // While inline editing (or in any form control), the browser owns the keyboard:
      // Cmd+Z must undo typing, not roll back the page.
      if (typing) return

      if (meta && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) applyRedo()
        else applyUndo()
        return
      }
      if (meta && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        applyRedo()
        return
      }
      if (meta && event.key.toLowerCase() === 'd') {
        event.preventDefault()
        duplicateSection(selectedId)
        return
      }
      if (meta && event.key.toLowerCase() === 'c' && selectedId) {
        const section = useEditorStore.getState().content.sections.find((entry) => entry.id === selectedId)
        if (section) void navigator.clipboard.writeText(JSON.stringify(section))
        return
      }
      if (event.key === 'Escape') {
        select(null)
        return
      }
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) {
        event.preventDefault()
        deleteSection(selectedId)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [applyRedo, applyUndo, deleteSection, duplicateSection, saveNow, select, selectedId])

  function onDragStart(event: DragStartEvent) {
    const data = event.active.data.current as { kind?: string; blockType?: string } | undefined
    if (data?.kind === 'palette') {
      setDragging({ kind: 'palette', label: getBlock(String(data.blockType))?.label || 'Block' })
    } else {
      const section = sections.find((entry) => entry.id === event.active.id)
      setDragging({ kind: 'section', label: getBlock(section?.type || '')?.label || 'Section' })
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setDragging(null)
    const { active, over } = event
    const data = active.data.current as { kind?: string; blockType?: string } | undefined

    if (data?.kind === 'palette') {
      const type = String(data.blockType || '')
      if (!blockRegistry[type]) return
      let at = sections.length
      if (over && over.id !== 'canvas-end' && over.id !== 'canvas-empty') {
        const index = sections.findIndex((section) => section.id === over.id)
        if (index >= 0) at = index + 1
      }
      insertSection(type, at)
      return
    }

    if (!over || active.id === over.id) return
    const from = sections.findIndex((section) => section.id === active.id)
    const to = sections.findIndex((section) => section.id === over.id)
    if (from < 0 || to < 0) return
    commit(arrayMove(sections, from, to))
  }

  const fields: BlockField[] = def?.schema.fields || []
  const visibleFields = selected ? fields.filter((field) => fieldVisible(field, selected.props)) : []
  const groupOf = (field: BlockField): BlockFieldGroup => field.group || 'content'
  const usedGroups = TABS.filter((entry) => visibleFields.some((field) => groupOf(field) === entry.id))
  const activeTab = usedGroups.some((entry) => entry.id === tab) ? tab : usedGroups[0]?.id || 'content'
  const tabFields = visibleFields.filter((field) => groupOf(field) === activeTab)

  const cssVars = themeToCssVars(theme) as CSSProperties

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="relative flex h-screen flex-col bg-zinc-950 text-zinc-200">
        <GoogleFonts theme={theme} content={content} />
        <header className="flex flex-wrap items-center gap-2 border-b border-zinc-800 px-3 py-2">
          <Link to="/sites" className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <PageMenu
            pages={pages.data || []}
            current={currentPage}
            chromeSlot={chromeSlot}
            onSelectChrome={(slot) => void switchChrome(slot)}
            starterContent={starterContent}
            onSelect={(page) => void switchPage(page)}
            onChanged={() => qc.invalidateQueries({ queryKey: ['pages', id] })}
            onError={(message) => setToast(message, { tone: 'err' })}
            onInfo={(message) => setToast(message)}
          />

          <div className="flex overflow-hidden rounded-lg border border-zinc-800">
            <button
              type="button"
              title={leftOpen ? 'Hide block library' : 'Show block library'}
              className={`px-2 py-1.5 ${leftOpen ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
              onClick={() => setLeftOpen((open) => !open)}
            >
              {leftOpen ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
            </button>
            <button
              type="button"
              title={rightOpen ? 'Hide inspector' : 'Show inspector'}
              className={`px-2 py-1.5 ${rightOpen ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
              onClick={() => setRightOpen((open) => !open)}
            >
              {rightOpen ? <PanelRightClose size={15} /> : <PanelRight size={15} />}
            </button>
          </div>

          <div className="flex overflow-hidden rounded-lg border border-zinc-800">
            {[
              { key: 'desktop' as const, Glyph: Monitor },
              { key: 'tablet' as const, Glyph: Tablet },
              { key: 'mobile' as const, Glyph: Smartphone },
            ].map(({ key, Glyph }) => (
              <button
                key={key}
                type="button"
                title={`${key} preview (${DEVICE_WIDTHS[key]}px) — type and layout edits stay on this screen`}
                className={`px-2 py-1.5 ${device === key ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
                onClick={() => setDevice(key)}
              >
                <Glyph size={15} />
              </button>
            ))}
          </div>

          <div className="flex overflow-hidden rounded-lg border border-zinc-800">
            <button
              type="button"
              title="Undo (Ctrl+Z)"
              disabled={!canUndo}
              className="px-2 py-1.5 text-zinc-300 hover:text-white disabled:opacity-30"
              onClick={applyUndo}
            >
              <Undo2 size={15} />
            </button>
            <button
              type="button"
              title="Redo (Ctrl+Shift+Z)"
              disabled={!canRedo}
              className="px-2 py-1.5 text-zinc-300 hover:text-white disabled:opacity-30"
              onClick={applyRedo}
            >
              <Redo2 size={15} />
            </button>
          </div>

          <span className="text-xs text-zinc-500">
            {saveStatus === 'saving'
              ? 'Saving…'
              : saveStatus === 'error'
                ? 'Save failed'
                : dirty
                  ? 'Unsaved changes'
                  : saveStatus === 'saved'
                    ? 'Saved'
                    : ''}
          </span>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle compact />
            <Link to={`/sites/${id}/navigation`} className="text-sm text-zinc-400 hover:text-white">
              Nav
            </Link>
            <Link to={`/sites/${id}/forms`} className="text-sm text-zinc-400 hover:text-white">
              Forms
            </Link>
            <Link to={`/sites/${id}/seo`} className="text-sm text-zinc-400 hover:text-white">
              SEO
            </Link>
            <Button variant="ghost" onClick={() => setAiOpen(true)}>
              <Sparkles size={15} />
              AI
            </Button>
            <Button variant="ghost" onClick={() => setThemeOpen(true)}>
              Theme
            </Button>
            <Button variant="ghost" onClick={() => setHistoryOpen(true)}>
              <History size={15} />
              History
            </Button>
            <Button variant="outline" disabled={previewing} onClick={openPreview}>
              {previewing ? 'Opening…' : 'Preview'}
            </Button>
            <Button disabled={publishing} onClick={publish}>
              {publishing ? 'Publishing…' : 'Publish'}
            </Button>
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1">
          {leftOpen ? (
            <div className="relative flex min-h-0 shrink-0">
              <BlockPalette
                theme={theme}
                usedTypes={[
                  ...sections.map((section) => section.type),
                  ...(pages.data || []).flatMap((page) =>
                    (page.draft?.content?.sections || page.published?.content?.sections || []).map((section) => section.type),
                  ),
                ]}
                onAdd={(type) => insertSection(type)}
              />
              <button
                type="button"
                title="Collapse block library"
                className="absolute -right-3 top-3 z-20 rounded-full border border-zinc-700 bg-zinc-900 p-1 text-zinc-400 shadow hover:text-white"
                onClick={() => setLeftOpen(false)}
              >
                <PanelLeftClose size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              title="Show block library"
              className="flex w-10 shrink-0 flex-col items-center gap-3 border-r border-zinc-800 bg-zinc-950 py-3 text-zinc-500 hover:bg-zinc-900 hover:text-white"
              onClick={() => setLeftOpen(true)}
            >
              <PanelLeft size={16} />
              <span className="text-[10px] font-medium uppercase tracking-wide" style={{ writingMode: 'vertical-rl' }}>
                Blocks
              </span>
            </button>
          )}

          <div className="min-w-0 flex-1 overflow-auto bg-zinc-900 p-3 sm:p-6" data-canvas-scroll onClick={() => select(null)}>
            <div
              className="canvas-theme mx-auto shadow-2xl transition-[width] duration-200"
              style={{ width: DEVICE_WIDTHS[device], maxWidth: '100%', ...cssVars }}
            >
              <BlockStyles />
              <SortableContext items={canvasSections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
                {canvasSections.map((section, index) => (
                  <SectionFrame
                    key={section.id}
                    section={section}
                    index={index}
                    total={sections.length}
                    selected={section.id === selectedId}
                    onSelect={() => {
                      select(section.id)
                      if (typeof window !== 'undefined' && window.innerWidth < 900) setRightOpen(true)
                    }}
                    navigation={navigation}
                    pageId={currentPage?.id}
                    theme={theme}
                    onMove={(delta) => moveSection(section.id, delta)}
                    onDuplicate={() => duplicateSection(section.id)}
                    onDelete={() => deleteSection(section.id)}
                    onToggleHidden={() => {
                      pushHistory(useEditorStore.getState().content)
                      updateSection(section.id, { hidden: !section.hidden })
                    }}
                    edit={bindings(section.id)}
                  />
                ))}
              </SortableContext>
              {sections.length ? (
                <DropZone id="canvas-end" label="Drop here to add at the end" active={dragging?.kind === 'palette'} />
              ) : (
                <DropZone
                  id="canvas-empty"
                  label={dragging?.kind === 'palette' ? 'Drop to add the first section' : 'Add a section from the library'}
                  active
                />
              )}
            </div>
          </div>

          {rightOpen ? (
            <>
            <button
              type="button"
              aria-label="Close inspector"
              className="absolute inset-0 z-20 bg-black/50 md:hidden"
              onClick={() => setRightOpen(false)}
            />
            <aside className="relative flex w-[min(20rem,100%)] shrink-0 flex-col border-l border-zinc-800 max-md:absolute max-md:inset-y-0 max-md:right-0 max-md:z-30 max-md:bg-zinc-950 max-md:shadow-2xl md:w-80">
              <button
                type="button"
                title="Collapse inspector"
                className="absolute -left-3 top-3 z-20 rounded-full border border-zinc-700 bg-zinc-900 p-1 text-zinc-400 shadow hover:text-white"
                onClick={() => setRightOpen(false)}
              >
                <PanelRightClose size={14} />
              </button>
              {selected && def ? (
              <>
                <div className="border-b border-zinc-800 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="truncate text-sm font-medium text-white">{def.label}</div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Duplicate section (Ctrl+D)"
                        className="p-1 text-zinc-400 hover:text-white"
                        onClick={() => duplicateSection(selected.id)}
                      >
                        <CopyPlus size={14} />
                      </button>
                      <button
                        type="button"
                        title={selected.hidden ? 'Show section' : 'Hide section'}
                        className="p-1 text-zinc-400 hover:text-white"
                        onClick={() => {
                          pushHistory(useEditorStore.getState().content)
                          updateSection(selected.id, { hidden: !selected.hidden })
                        }}
                      >
                        {selected.hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button
                        type="button"
                        title="Copy section JSON"
                        className="p-1 text-zinc-400 hover:text-white"
                        onClick={async () => {
                          await navigator.clipboard.writeText(JSON.stringify(selected))
                          setToast('Section copied')
                        }}
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        type="button"
                        title="Paste section from clipboard"
                        className="p-1 text-zinc-400 hover:text-white"
                        onClick={async () => {
                          try {
                            const text = await navigator.clipboard.readText()
                            const parsed = JSON.parse(text) as PageSection
                            if (!parsed?.type || !blockRegistry[parsed.type]) throw new Error('unknown block')
                            const list = useEditorStore.getState().content.sections
                            const index = list.findIndex((entry) => entry.id === selected.id)
                            const next = [...list]
                            next.splice(index + 1, 0, { ...parsed, id: createId('sec') })
                            commit(next)
                          } catch {
                            setToast('Clipboard does not contain a section')
                          }
                        }}
                      >
                        <ClipboardPaste size={14} />
                      </button>
                      <button
                        type="button"
                        title="Delete section (Del)"
                        className="p-1 text-zinc-400 hover:text-red-400"
                        onClick={() => deleteSection(selected.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {/* A page's own navbar overrides the shared one, so while it
                      is here this header belongs to this page alone. */}
                  {!chromeSlot && chromeSlotOf(selected.type) ? (
                    <div className="mb-2 rounded-md bg-amber-500/10 px-2 py-2 text-[11px] leading-snug text-amber-200">
                      <p>
                        This {chromeSlotOf(selected.type)} is only on this page. Editing it will not change the others.
                      </p>
                      <button
                        type="button"
                        disabled={adopting}
                        className="mt-1.5 rounded bg-amber-500/20 px-2 py-1 font-medium text-amber-100 hover:bg-amber-500/30 disabled:opacity-50"
                        onClick={() => adoptChrome(chromeSlotOf(selected.type)!)}
                      >
                        {adopting ? 'Applying…' : `Use this ${chromeSlotOf(selected.type)} on every page`}
                      </button>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-1">
                    {usedGroups.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        className={`rounded px-2 py-1 text-xs ${activeTab === entry.id ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'}`}
                        onClick={() => setTab(entry.id)}
                      >
                        {entry.label}
                      </button>
                    ))}
                  </div>
                  {device !== 'desktop' ? (
                    <p className="mt-2 rounded-md bg-blue-600/15 px-2 py-1.5 text-[11px] leading-snug text-blue-200">
                      Editing {device} styles. Font, spacing and layout changes stay on this screen and do not change desktop
                      {device === 'mobile' ? ' or tablet' : ''}.
                    </p>
                  ) : null}
                </div>
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
                  {tabFields.map((field) => (
                    <FieldControl
                      key={field.key}
                      field={field}
                      value={viewProps[field.key]}
                      values={viewProps}
                      onChange={(next) => {
                        if (device === 'desktop' || !isResponsiveField(field)) {
                          updateProps(selected.id, { [field.key]: next })
                          return
                        }
                        updateProps(selected.id, patchResponsiveProps(selected.props, device, { [field.key]: next }))
                      }}
                      context={{
                        forms: siteForms.data,
                        products: products.data,
                        pages: pages.data,
                        theme,
                        siteId: id,
                        sectionId: selected.id,
                        device,
                        overridden: isResponsiveField(field) && overrideKeys.has(field.key),
                        elementStyles: mergeStyleMaps(viewProps.elementStyles) as ElementStyleMap,
                        onElementStyleChange: (path: EditPath, style: ElementTextStyle | undefined) => {
                          updateProps(selected.id, patchResponsiveElementStyle(selected.props, device, path, style))
                        },
                      }}
                    />
                  ))}
                  {!tabFields.length ? <p className="text-sm text-zinc-500">Nothing to edit in this tab.</p> : null}
                </div>
              </>
            ) : currentPage ? (
              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                <h2 className="mb-3 text-sm font-medium text-white">Page SEO</h2>
                <PageSeoFields page={currentPage} siteId={id} onSaved={() => qc.invalidateQueries({ queryKey: ['pages', id] })} />
                <div className="mt-6 border-t border-zinc-800 pt-4">
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Sections</h3>
                  <ol className="space-y-1 text-xs text-zinc-400">
                    {sections.map((section, index) => (
                      <li key={section.id}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded px-2 py-1 text-left hover:bg-zinc-900"
                          onClick={() => select(section.id)}
                        >
                          <span className="text-zinc-600">{index + 1}</span>
                          <span className="flex-1 truncate">{getBlock(section.type)?.label || section.type}</span>
                          {section.hidden ? <EyeOff size={12} /> : null}
                        </button>
                      </li>
                    ))}
                  </ol>
                  {!sections.length ? <p className="text-xs text-zinc-500">No sections yet.</p> : null}
                </div>
              </div>
            ) : (
              <div className="p-3">
                <p className="text-sm text-zinc-500">
                  {pages.isLoading ? 'Loading pages…' : 'Create a page to start building.'}
                </p>
              </div>
            )}
            </aside>
            </>
          ) : (
            <button
              type="button"
              title="Show inspector"
              className="flex w-10 shrink-0 flex-col items-center gap-3 border-l border-zinc-800 bg-zinc-950 py-3 text-zinc-500 hover:bg-zinc-900 hover:text-white"
              onClick={() => setRightOpen(true)}
            >
              <PanelRight size={16} />
              <span className="text-[10px] font-medium uppercase tracking-wide" style={{ writingMode: 'vertical-rl' }}>
                Inspect
              </span>
            </button>
          )}
        </div>

        {aiOpen && id ? (
          <AiPanel
            siteId={id}
            pageId={currentPage?.id}
            pageName={currentPage?.name}
            pageSlug={currentPage?.slug}
            pageType={currentPage?.type}
            isHomepage={Boolean(currentPage?.is_homepage)}
            existingPages={(pages.data || []).map((page) => ({ name: page.name, slug: page.slug }))}
            onClose={() => setAiOpen(false)}
            onApplied={() => {
              void qc.invalidateQueries({ queryKey: ['pages', id] })
              void qc.invalidateQueries({ queryKey: ['theme', id] })
            }}
          />
        ) : null}

        {historyOpen && storePageId ? (
          <HistoryPanel
            pageId={storePageId}
            onPreview={(older, revision) => {
              // Remember the working copy the first time only, so stepping
              // through several versions still returns to the real draft.
              setPreHistorySections((current) => current ?? sections)
              setPreHistoryTheme((current) => current ?? theme)
              setSections(older)
              if (revision.theme_tokens) setTheme({ ...theme, ...revision.theme_tokens })
            }}
            onCancelPreview={() => {
              if (preHistorySections) setSections(preHistorySections)
              if (preHistoryTheme) setTheme(preHistoryTheme)
              setPreHistorySections(null)
              setPreHistoryTheme(null)
            }}
            onRestored={(restored, restoredTheme) => {
              setPreHistorySections(null)
              setPreHistoryTheme(null)
              setSections(restored)
              // Already persisted by the restore; this catches the editor up so
              // the canvas is not left showing the theme that was replaced.
              if (restoredTheme) setTheme({ ...theme, ...restoredTheme })
              void qc.invalidateQueries({ queryKey: ['theme', id] })
              setToast(restoredTheme ? 'Version and theme restored' : 'Version restored')
            }}
            onClose={() => {
              if (preHistorySections) setSections(preHistorySections)
              if (preHistoryTheme) setTheme(preHistoryTheme)
              setPreHistorySections(null)
              setPreHistoryTheme(null)
              setHistoryOpen(false)
            }}
          />
        ) : null}

        {themeOpen ? (
          <ThemePanel
            theme={theme}
            onChange={setTheme}
            onClose={() => setThemeOpen(false)}
            onSave={async () => {
              try {
                await sitesApi.updateTheme(id!, theme)
                setToast('Theme saved')
                setThemeOpen(false)
              } catch {
                setToast('Could not save the theme')
              }
            }}
          />
        ) : null}

        {toast ? (
          <div
            role="status"
            className={`absolute bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-lg px-4 py-2 text-sm shadow-xl ${
              toast.tone === 'err' ? 'bg-red-900 text-red-50' : 'bg-zinc-800 text-white'
            }`}
          >
            <span>{toast.text}</span>
            {toast.link ? (
              <a
                href={toast.link.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-2"
              >
                {toast.link.label}
              </a>
            ) : null}
            <button type="button" className="text-current/70 hover:text-current" onClick={() => setToastState(null)}>
              ✕
            </button>
          </div>
        ) : null}

        {imageEdit ? (
          <MediaPicker
            dialogOnly
            siteId={id}
            value={imageEdit.current}
            onClose={() => setImageEdit(null)}
            onChange={(url) => {
              commitInline(imageEdit.sectionId, imageEdit.path, url)
              setImageEdit(null)
            }}
          />
        ) : null}

        {/* Follows whatever text is being edited on the canvas. */}
        <InlineAiToolbar siteId={id} onApply={commitInline} />
      </div>

      <DragOverlay dropAnimation={null}>
        {dragging ? (
          <div className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-xl">{dragging.label}</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
