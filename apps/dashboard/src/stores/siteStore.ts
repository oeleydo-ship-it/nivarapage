import type { Site, ThemeTokens } from '@uidesired/types'
import { defaultThemeTokens } from '@uidesired/design-system'
import { create } from 'zustand'

interface SiteState {
  site: Site | null
  theme: ThemeTokens
  setSite: (site: Site | null) => void
  setTheme: (theme: Partial<ThemeTokens>) => void
}

export const useSiteStore = create<SiteState>((set) => ({
  site: null,
  theme: defaultThemeTokens,
  setSite: (site) => set({ site }),
  setTheme: (theme) => set((s) => ({ theme: { ...s.theme, ...theme } as ThemeTokens })),
}))
