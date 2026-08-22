import type { PageContent, PageSection } from '@uidesired/types'
import { create } from 'zustand'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface EditorState {
  siteId: string | null
  pageId: string | null
  content: PageContent
  dirty: boolean
  saveStatus: SaveStatus
  setContext: (siteId: string, pageId: string) => void
  setContent: (content: PageContent, dirty?: boolean) => void
  setSaveStatus: (saveStatus: SaveStatus) => void
  updateSection: (id: string, patch: Partial<PageSection>) => void
  updateProps: (id: string, props: Record<string, unknown>) => void
  setSections: (sections: PageSection[]) => void
}

const empty: PageContent = { schemaVersion: 1, sections: [] }

function withSections(content: PageContent, sections: PageSection[]): PageContent {
  return { schemaVersion: 1, sections }
}

export const useEditorStore = create<EditorState>((set) => ({
  siteId: null,
  pageId: null,
  content: empty,
  dirty: false,
  saveStatus: 'idle',
  setContext: (siteId, pageId) => set({ siteId, pageId }),
  setContent: (content, dirty = false) => set({ content, dirty }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  updateSection: (id, patch) =>
    set((s) => ({
      dirty: true,
      content: withSections(
        s.content,
        s.content.sections.map((sec) => (sec.id === id ? { ...sec, ...patch } : sec)),
      ),
    })),
  updateProps: (id, props) =>
    set((s) => ({
      dirty: true,
      content: withSections(
        s.content,
        s.content.sections.map((sec) => (sec.id === id ? { ...sec, props: { ...sec.props, ...props } } : sec)),
      ),
    })),
  setSections: (sections) => set((s) => ({ dirty: true, content: withSections(s.content, sections) })),
}))
