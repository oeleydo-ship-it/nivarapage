import { create } from 'zustand'
import { applyTheme, readTheme, storeTheme, type UiTheme } from '../lib/theme'

type ThemeState = {
  theme: UiTheme
  setTheme: (theme: UiTheme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readTheme(),
  setTheme: (theme) => {
    applyTheme(theme)
    storeTheme(theme)
    set({ theme })
  },
  toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
}))
