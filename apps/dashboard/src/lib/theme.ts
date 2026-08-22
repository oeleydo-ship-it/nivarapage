/**
 * Dashboard light/dark switch.
 *
 * The theme is a `data-theme` attribute on `<html>`; `index.css` remaps the zinc
 * ramp under it, so no component needs to know which theme is active. Applied
 * from `main.tsx` before the first render so the page never flashes the wrong
 * background.
 */
export type UiTheme = 'dark' | 'light'

const STORAGE_KEY = 'uidesired:theme'

export function readTheme(): UiTheme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // Private mode or a blocked storage partition: fall through to the default.
  }
  if (typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: light)').matches) return 'light'
  return 'dark'
}

export function applyTheme(theme: UiTheme): void {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

export function storeTheme(theme: UiTheme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Not being able to remember the choice must not break switching it.
  }
}
