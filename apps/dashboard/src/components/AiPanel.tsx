import type { PageSection, ThemeTokens } from '@uidesired/types'
import { getBlock } from '@uidesired/blocks'
import { useQuery } from '@tanstack/react-query'
import { ArrowUp, CheckCircle2, Code2, FileText, Layers3, LoaderCircle, Plus, Sparkles, Square, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../lib/api'
import {
  aiApi,
  sitesApi,
  type AiChatAction,
  type AiChatResult,
  type AiGenerationMode,
  type AiGeneratedPage,
  type AiStatus,
  type AiStreamEvent,
} from '../lib/endpoints'
import { useEditorStore } from '../stores/editorStore'
import { useHistoryStore } from '../stores/historyStore'
import { useSelectionStore } from '../stores/selectionStore'
import { useSiteStore } from '../stores/siteStore'
import { Button } from '../ui/primitives'

type ChatRole = 'user' | 'assistant'
type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  action?: AiChatAction
  applied?: string
}

const SUGGESTIONS: Array<{ label: string; mode: AiGenerationMode }> = [
  { label: 'Build a multi-page site for my business', mode: 'full_site' },
  { label: 'Redesign this page with stronger copy', mode: 'current_page' },
  { label: 'Insert a FAQ and call-to-action', mode: 'blocks' },
  { label: 'Switch the theme to navy and gold', mode: 'auto' },
]

const GENERATION_MODES: Array<{ id: AiGenerationMode; label: string; hint: string }> = [
  { id: 'auto', label: 'Auto', hint: 'AI chooses the smallest useful scope' },
  { id: 'full_site', label: 'Website', hint: 'Build a complete multi-page website' },
  { id: 'current_page', label: 'Page', hint: 'Replace and improve the current page' },
  { id: 'blocks', label: 'Blocks', hint: 'Insert new sections into this page' },
]

type GenerationLine = { id: string; kind: 'status' | 'page' | 'block' | 'done'; text: string }

function usageLabel(status?: Pick<AiStatus, 'used' | 'limit'> | null) {
  if (!status) return ''
  if (status.limit < 0) return `${status.used} used · unlimited`
  return `${status.used} / ${status.limit} this month`
}

function errorCode(error: unknown): string | null {
  if (!(error instanceof ApiError) || !error.body || typeof error.body !== 'object') return null
  const code = (error.body as { error?: unknown }).error
  return typeof code === 'string' ? code : null
}

function isQuotaError(error: unknown) {
  return error instanceof ApiError && (error.status === 402 || errorCode(error) === 'plan_limit')
}

function friendlyError(error: unknown): string | null {
  if (!(error instanceof Error) && !error) return null
  const message = error instanceof Error ? error.message : 'Generation failed'
  if (/maximum execution time/i.test(message) || errorCode(error) === 'ai_timeout') {
    return 'The AI took too long. Try again — a full site can take up to a minute — or ask for one page first.'
  }
  return message
}

function sectionLabel(section: PageSection) {
  return getBlock(section.type)?.label || section.type
}

function headingOf(section: PageSection) {
  const props = section.props
  for (const key of ['heading', 'title', 'logo', 'question', 'copyright']) {
    const value = props[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return ''
}

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function blockCode(section: PageSection) {
  const heading = headingOf(section)
  return `<${section.type}${heading ? ` heading=${JSON.stringify(heading.slice(0, 46))}` : ''} />`
}

function storageKey(siteId: string | number) {
  return `uidesired.ai.chat.${siteId}`
}

export function AiPanel({
  siteId,
  pageId,
  pageName,
  pageSlug,
  pageType,
  isHomepage,
  existingPages,
  onClose,
  onApplied,
}: {
  siteId: string | number
  pageId?: string | number
  pageName?: string
  pageSlug?: string
  pageType?: string
  isHomepage?: boolean
  existingPages?: Array<{ name: string; slug: string }>
  onClose: () => void
  onApplied?: () => void
}) {
  const statusQuery = useQuery({ queryKey: ['ai-status'], queryFn: aiApi.status })
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [generationMode, setGenerationMode] = useState<AiGenerationMode>('auto')
  const [requestedPages, setRequestedPages] = useState(5)
  const [progress, setProgress] = useState(0)
  const [generationLines, setGenerationLines] = useState<GenerationLine[]>([])
  const [generationPages, setGenerationPages] = useState<Array<{ name: string; slug: string; blocks: number; built: number }>>([])
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = sessionStorage.getItem(storageKey(siteId))
      return raw ? (JSON.parse(raw) as ChatMessage[]) : []
    } catch {
      return []
    }
  })
  const scroller = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const selectedId = useSelectionStore((s) => s.sectionId)
  const content = useEditorStore((s) => s.content)
  const selected = content.sections.find((section) => section.id === selectedId)
  const theme = useSiteStore((s) => s.theme)
  const status = statusQuery.data

  const unlimited = (status?.limit ?? 0) < 0
  const remaining = unlimited ? Number.POSITIVE_INFINITY : Math.max(0, (status?.limit ?? 0) - (status?.used ?? 0))
  const planBlocked = Boolean(status) && (!status!.entitled || remaining <= 0)
  const platformOff = Boolean(status) && !status!.enabled
  const notConfigured = Boolean(status) && !status!.configured
  const canSend = Boolean(status?.available && status.entitled && remaining > 0) && !busy && draft.trim().length > 0

  useEffect(() => {
    sessionStorage.setItem(storageKey(siteId), JSON.stringify(messages.slice(-24)))
  }, [messages, siteId])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy, generationLines])

  async function applyResult(result: AiChatResult): Promise<string | undefined> {
    const pages = result.pages || []
    const sections = result.sections || []
    const nextTheme = result.theme && Object.keys(result.theme).length ? result.theme : undefined

    if (result.action === 'insert_blocks' && sections.length) {
      const current = useEditorStore.getState().content
      useHistoryStore.getState().push(current)
      const list = [...current.sections]
      const index = list.findIndex((section) => section.id === selectedId)
      const at = index >= 0 ? index + 1 : list.length
      list.splice(at, 0, ...sections)
      useEditorStore.getState().setContent({ schemaVersion: 1, sections: list }, true)
      useSelectionStore.getState().select(sections[0].id)
      return `Inserted ${sections.map(sectionLabel).join(', ')}.`
    }

    if ((result.action === 'apply_site' || result.action === 'create_page' || result.action === 'replace_page') && pages.length) {
      return applyPages(pages, nextTheme, result.action)
    }

    if (result.action === 'replace_page' && sections.length && !pages.length) {
      useHistoryStore.getState().push(useEditorStore.getState().content)
      useEditorStore.getState().setContent({ schemaVersion: 1, sections }, true)
      return 'Replaced this page.'
    }

    if ((result.action === 'update_theme' || nextTheme) && nextTheme) {
      useSiteStore.getState().setTheme(nextTheme as Partial<ThemeTokens>)
      await sitesApi.updateTheme(siteId, { ...theme, ...nextTheme })
      onApplied?.()
      return 'Theme updated. You can still tweak it in Theme.'
    }

    return undefined
  }

  async function applyPages(pages: AiGeneratedPage[], nextTheme: Record<string, unknown> | undefined, action: AiChatAction) {
    if (action === 'replace_page' && pages.length === 1) {
      useHistoryStore.getState().push(useEditorStore.getState().content)
      useEditorStore.getState().setContent(pages[0].content, true)
      if (nextTheme) {
        useSiteStore.getState().setTheme(nextTheme as Partial<ThemeTokens>)
        await sitesApi.updateTheme(siteId, { ...useSiteStore.getState().theme, ...nextTheme })
      }
      return 'Updated this page. Ask for another revision anytime.'
    }

    const applied = await aiApi.applyGeneration({
      site_id: siteId,
      page_id: pageId,
      pages,
      theme: nextTheme,
    })
    if (applied.current_content) {
      useEditorStore.getState().setContent(applied.current_content, false)
    } else if (action === 'replace_page' && pages[0]) {
      useEditorStore.getState().setContent(pages[0].content, false)
    }
    if (applied.theme) useSiteStore.getState().setTheme(applied.theme as Partial<ThemeTokens>)
    onApplied?.()
    const skipped = applied.skipped?.length ? ` ${applied.skipped.length} page(s) skipped by the plan limit.` : ''
    if (action === 'create_page') {
      return `Added ${pages.map((page) => page.name).join(', ')}. Switch pages in the builder to edit.${skipped}`
    }
    return `Applied ${pages.length} page${pages.length === 1 ? '' : 's'}. Follow up to revise copy, blocks, or the theme.${skipped}`
  }

  async function send(text: string, modeOverride?: AiGenerationMode) {
    const prompt = text.trim()
    if (!prompt || busy) return
    setError(null)
    const userMessage: ChatMessage = { id: uid(), role: 'user', content: prompt }
    const nextHistory = [...messages, userMessage]
    setMessages(nextHistory)
    setDraft('')
    setBusy(true)
    setProgress(2)
    setGenerationLines([])
    setGenerationPages([])
    const controller = new AbortController()
    abortRef.current = controller
    const originalContent = useEditorStore.getState().content
    const originalTheme = useSiteStore.getState().theme
    const pageDrafts = new Map<number, PageSection[]>()
    const blockDrafts: PageSection[] = []

    const addLine = (kind: GenerationLine['kind'], text: string) => {
      setGenerationLines((current) => [...current.slice(-79), { id: uid(), kind, text }])
    }

    const onStreamEvent = (event: AiStreamEvent) => {
      if ('progress' in event && typeof event.progress === 'number') setProgress(event.progress)
      if ((event.type === 'start' || event.type === 'progress') && event.message) {
        addLine('status', event.code || `// ${event.message}`)
      }
      if (event.type === 'plan') {
        addLine('status', `defineGeneration({ action: "${event.action}", pages: ${event.pages}, blocks: ${event.sections} });`)
      }
      if (event.type === 'page') {
        pageDrafts.set(event.index, [])
        setGenerationPages((current) => [
          ...current,
          { name: event.page.name, slug: event.page.slug, blocks: event.blocks, built: 0 },
        ])
        addLine('page', `page("/${event.page.slug}", { name: ${JSON.stringify(event.page.name)} })`)
      }
      if (event.type === 'block') {
        addLine('block', `  + ${blockCode(event.section)}`)
        setProgress(Math.min(98, 90 + Math.round(((event.index + 1) / Math.max(event.total, 1)) * 8)))

        if (event.page_index !== null) {
          const draft = [...(pageDrafts.get(event.page_index) || []), event.section]
          pageDrafts.set(event.page_index, draft)
          setGenerationPages((current) =>
            current.map((page, index) => index === event.page_index ? { ...page, built: draft.length } : page),
          )
          const currentMatches =
            event.page_slug === (pageSlug || 'home') ||
            (Boolean(isHomepage) && Boolean(event.page_home)) ||
            (!pageId && event.page_index === 0)
          if (currentMatches) {
            useEditorStore.getState().setContent({ schemaVersion: 1, sections: draft }, false)
          }
        } else {
          blockDrafts.push(event.section)
          const list = [...originalContent.sections]
          const selectedIndex = list.findIndex((section) => section.id === selectedId)
          list.splice(selectedIndex >= 0 ? selectedIndex + 1 : list.length, 0, ...blockDrafts)
          useEditorStore.getState().setContent({ schemaVersion: 1, sections: list }, false)
        }
      }
      if (event.type === 'done') {
        setProgress(100)
        addLine('done', '✓ generation.complete()')
      }
    }

    try {
      const result = await aiApi.chatStream({
        site_id: siteId,
        page_id: pageId,
        page_name: pageName || 'Home',
        page_slug: pageSlug || 'home',
        is_homepage: Boolean(isHomepage),
        messages: nextHistory.map((item) => ({ role: item.role, content: item.content })),
        existing_pages: existingPages,
        theme,
        current_content: content,
        selected_type: selected?.type,
        selected_heading: selected ? headingOf(selected) : undefined,
        generation_mode: modeOverride || generationMode,
        requested_pages: (modeOverride || generationMode) === 'full_site' ? requestedPages : undefined,
      }, onStreamEvent, controller.signal)

      // The stream is a non-dirty live preview. Restore the saved canvas before
      // applying once, so generated blocks are never duplicated.
      useEditorStore.getState().setContent(originalContent, false)
      useSiteStore.getState().setTheme(originalTheme)
      const applied = await applyResult(result)
      setMessages((current) => [
        ...current,
        {
          id: uid(),
          role: 'assistant',
          content: result.message,
          action: result.action,
          applied,
        },
      ])
      await statusQuery.refetch()
    } catch (caught) {
      useEditorStore.getState().setContent(originalContent, false)
      useSiteStore.getState().setTheme(originalTheme)
      if (caught instanceof DOMException && caught.name === 'AbortError') {
        setError(new Error('Generation cancelled. Your original page was restored.'))
        addLine('done', '// generation cancelled')
      } else {
        setError(caught)
      }
    } finally {
      abortRef.current = null
      setBusy(false)
    }
  }

  function newChat() {
    setMessages([])
    setError(null)
    setProgress(0)
    setGenerationLines([])
    setGenerationPages([])
    sessionStorage.removeItem(storageKey(siteId))
  }

  const quota = isQuotaError(error)
  const disabledCode = errorCode(error)
  const errorMessage = friendlyError(error)

  return (
    <div
      className="absolute inset-0 z-30 flex justify-end bg-slate-900/40"
      onClick={() => {
        abortRef.current?.abort()
        onClose()
      }}
    >
      <div
        className="flex h-full w-[34rem] max-w-full flex-col border-l border-zinc-200 bg-zinc-50 text-zinc-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
          <div>
            <h2 className="flex items-center gap-2 font-semibold text-zinc-900">
              <Sparkles size={16} className="text-blue-600" />
              Generate with AI
            </h2>
            {status ? <p className="mt-0.5 text-xs text-zinc-500">{usageLabel(status)}</p> : null}
          </div>
          <div className="flex items-center gap-1">
            {messages.length ? (
              <button type="button" onClick={newChat} className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900" title="New chat">
                <Plus size={16} />
              </button>
            ) : null}
            <button type="button" onClick={() => { abortRef.current?.abort(); onClose() }} className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900">
              <X size={16} />
            </button>
          </div>
        </div>

        <div ref={scroller} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          {platformOff ? <Blocked title="AI is turned off" body="The platform administrator has disabled AI generation." /> : null}
          {notConfigured && !platformOff ? (
            <Blocked
              title="AI is not configured"
              body="An administrator must add a provider API key in Admin → AI before generation can run."
            />
          ) : null}
          {planBlocked && status?.available ? (
            <Blocked
              title={status.entitled ? 'Monthly AI quota reached' : 'AI is not on your plan'}
              body={
                status.entitled
                  ? `This workspace has used ${status.used} of ${status.limit} generations this month.`
                  : 'Upgrade to a plan that includes AI generations to use this panel.'
              }
              billing
            />
          ) : null}

          {messages.length === 0 && !platformOff && !notConfigured && !planBlocked ? (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600">
                Chat to build or revise this site. Follow up to add pages, insert blocks, or change the theme.
              </p>
              <p className="text-[11px] text-zinc-500">
                Editing <span className="font-medium text-zinc-800">{pageName || 'Home'}</span>
                {pageType ? ` · ${pageType}` : ''}. Each message uses one generation.
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    disabled={busy || !status?.available || planBlocked || platformOff || notConfigured}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-left text-xs text-zinc-700 shadow-sm hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"
                    onClick={() => {
                      setGenerationMode(item.mode)
                      void send(item.label, item.mode)
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((item) => (
            <div key={item.id} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                  item.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'border border-zinc-200 bg-white text-zinc-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{item.content}</p>
                {item.applied ? <p className="mt-2 text-[11px] font-medium text-emerald-700">{item.applied}</p> : null}
              </div>
            </div>
          ))}

          {generationLines.length ? (
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-lg">
              <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
                <div className="flex items-center gap-2 text-xs font-medium">
                  {busy ? <LoaderCircle size={14} className="animate-spin text-blue-400" /> : <CheckCircle2 size={14} className="text-emerald-400" />}
                  <Code2 size={14} className="text-violet-400" />
                  Live generation
                </div>
                <span className="font-mono text-[11px] text-zinc-400">{progress}%</span>
              </div>
              <div className="h-1 bg-zinc-900">
                <div className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              {generationPages.length ? (
                <div className="flex gap-1.5 overflow-x-auto border-b border-zinc-800 px-3 py-2">
                  {generationPages.map((page) => (
                    <span key={`${page.slug}-${page.name}`} className="flex shrink-0 items-center gap-1.5 rounded-md bg-zinc-900 px-2 py-1 text-[10px] text-zinc-300">
                      <FileText size={11} className="text-blue-400" />
                      /{page.slug}
                      <span className="text-zinc-500">{page.built}/{page.blocks}</span>
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="max-h-56 overflow-y-auto px-3 py-2 font-mono text-[11px] leading-5">
                {generationLines.map((line) => (
                  <div key={line.id} className={line.kind === 'page' ? 'text-blue-300' : line.kind === 'block' ? 'text-emerald-300' : line.kind === 'done' ? 'text-fuchsia-300' : 'text-zinc-400'}>
                    {line.kind === 'block' ? <Layers3 size={10} className="mr-1 inline" /> : null}
                    {line.text}
                  </div>
                ))}
                {busy ? <span className="inline-block h-3 w-1.5 animate-pulse bg-blue-400 align-middle" /> : null}
              </div>
              <div className="flex items-center justify-between border-t border-zinc-800 px-3 py-2 text-[10px] text-zinc-500">
                <span>{busy ? 'Updating the canvas as validated blocks arrive' : 'Generation applied to the builder'}</span>
                {busy ? (
                  <button type="button" className="flex items-center gap-1 text-zinc-300 hover:text-white" onClick={() => abortRef.current?.abort()}>
                    <Square size={10} fill="currentColor" /> Stop
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <p>{errorMessage}</p>
              {quota ? (
                <Link to="/billing" className="mt-2 inline-block text-xs font-medium text-red-700 underline">
                  View plans
                </Link>
              ) : null}
              {disabledCode === 'ai_disabled' || disabledCode === 'ai_not_configured' ? (
                <p className="mt-2 text-xs text-red-600">Ask an administrator to enable AI in Admin → AI.</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <form
          className="border-t border-zinc-200 bg-white p-3"
          onSubmit={(event) => {
            event.preventDefault()
            void send(draft)
          }}
        >
          <div className="mb-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Generate</span>
              <span className="text-[11px] text-zinc-400">{GENERATION_MODES.find((item) => item.id === generationMode)?.hint}</span>
            </div>
            <div className="grid grid-cols-4 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 p-1">
              {GENERATION_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  disabled={busy}
                  className={`rounded-md px-2 py-1.5 text-xs transition ${generationMode === mode.id ? 'bg-white font-medium text-blue-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                  onClick={() => setGenerationMode(mode.id)}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            {generationMode === 'full_site' ? (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-blue-50 px-2.5 py-2">
                <span className="text-xs text-blue-800">Pages to generate</span>
                <div className="flex gap-1">
                  {[3, 4, 5, 6, 7, 8].map((count) => (
                    <button
                      key={count}
                      type="button"
                      disabled={busy}
                      onClick={() => setRequestedPages(count)}
                      className={`h-6 w-6 rounded text-[11px] ${requestedPages === count ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 hover:bg-blue-100'}`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex items-end gap-2 rounded-xl border border-zinc-300 bg-zinc-50 px-2 py-2 focus-within:border-blue-400 focus-within:bg-white">
            <textarea
              className="max-h-32 min-h-[2.75rem] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
              rows={2}
              value={draft}
              disabled={busy || platformOff || notConfigured || planBlocked}
              placeholder="Ask for a site, a new page, a block, or a theme change…"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void send(draft)
                }
              }}
            />
            <Button type="submit" disabled={!canSend} className="h-9 w-9 shrink-0 px-0">
              <ArrowUp size={16} />
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">Enter to send · Shift+Enter for a new line</p>
        </form>
      </div>
    </div>
  )
}

function Blocked({ title, body, billing }: { title: string; body: string; billing?: boolean }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
      <div className="text-sm font-medium text-zinc-900">{title}</div>
      <p className="mt-1 text-xs text-zinc-600">{body}</p>
      {billing ? (
        <Link to="/billing" className="mt-2 inline-block text-xs font-medium text-blue-600 hover:text-blue-500">
          View plans
        </Link>
      ) : null}
    </div>
  )
}
