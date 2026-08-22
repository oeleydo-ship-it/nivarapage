import { create } from 'zustand'

interface SelectionState {
  sectionId: string | null
  select: (sectionId: string | null) => void
}

export const useSelectionStore = create<SelectionState>((set) => ({
  sectionId: null,
  select: (sectionId) => set({ sectionId }),
}))
