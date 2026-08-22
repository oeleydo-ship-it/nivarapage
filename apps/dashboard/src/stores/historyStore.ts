import type { PageContent } from '@uidesired/types'
import { create } from 'zustand'

interface HistoryState {
  past: PageContent[]
  future: PageContent[]
  /** Records the state that existed *before* the change being applied. */
  push: (content: PageContent) => void
  /** Returns the previous snapshot; `current` is moved onto the redo stack. */
  undo: (current: PageContent) => PageContent | null
  redo: (current: PageContent) => PageContent | null
  reset: () => void
}

function clone(content: PageContent): PageContent {
  return JSON.parse(JSON.stringify(content)) as PageContent
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  push: (content) =>
    set((state) => ({
      past: [...state.past.slice(-49), clone(content)],
      future: [],
    })),
  undo: (current) => {
    const { past, future } = get()
    const previous = past[past.length - 1]
    if (!previous) return null
    set({ past: past.slice(0, -1), future: [clone(current), ...future].slice(0, 50) })
    return clone(previous)
  },
  redo: (current) => {
    const { past, future } = get()
    const next = future[0]
    if (!next) return null
    set({ past: [...past, clone(current)].slice(-50), future: future.slice(1) })
    return clone(next)
  },
  reset: () => set({ past: [], future: [] }),
}))
