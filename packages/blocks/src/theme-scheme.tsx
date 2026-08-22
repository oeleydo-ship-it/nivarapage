'use client'

import type { ThemeTokens } from '@uidesired/types'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Icon } from './icons'

export type ColorScheme = 'dark' | 'light'

type SchemeContext = {
  scheme: ColorScheme
  toggle: () => void
  available: boolean
}

const ThemeSchemeContext = createContext<SchemeContext>({
  scheme: 'dark',
  toggle: () => undefined,
  available: false,
})

export function themeHasSchemeSwitch(theme?: ThemeTokens | null): boolean {
  return typeof theme?.lightBackground === 'string' && theme.lightBackground.trim() !== ''
}

export function defaultSchemeOf(theme?: ThemeTokens | null): ColorScheme {
  return theme?.defaultScheme === 'light' ? 'light' : 'dark'
}

export function tokensForScheme(theme: ThemeTokens | undefined, scheme: ColorScheme): ThemeTokens | undefined {
  if (!theme) return theme
  if (scheme !== 'light' || !themeHasSchemeSwitch(theme)) return theme
  return {
    ...theme,
    background: String(theme.lightBackground),
    surface: String(theme.lightSurface || '#f6f3ff'),
    text: String(theme.lightText || '#0f172a'),
    muted: String(theme.lightMuted || '#64748b'),
    secondary: String(theme.lightSecondary || '#eef2ff'),
    surfacePattern: '',
  }
}

export function ThemeSchemeProvider({
  theme,
  siteName,
  children,
}: {
  theme?: ThemeTokens
  siteName?: string | null
  children: ReactNode
}) {
  const available = themeHasSchemeSwitch(theme)
  const fallback = defaultSchemeOf(theme)
  const storageKey = siteName ? `ud-scheme:${siteName}` : null
  const [scheme, setScheme] = useState<ColorScheme>(fallback)

  useEffect(() => {
    setScheme(fallback)
  }, [fallback, siteName])

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return
    const stored = window.localStorage.getItem(storageKey)
    if (stored === 'light' || stored === 'dark') setScheme(stored)
  }, [storageKey])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onScheme = (event: Event) => {
      const detail = (event as CustomEvent<{ scheme?: string; key?: string | null }>).detail
      if (detail?.scheme !== 'light' && detail?.scheme !== 'dark') return
      if (storageKey && detail.key && detail.key !== storageKey) return
      setScheme(detail.scheme)
    }
    window.addEventListener('ud-color-scheme', onScheme)
    return () => window.removeEventListener('ud-color-scheme', onScheme)
  }, [storageKey])

  const toggle = useCallback(() => {
    setScheme((current) => {
      const next: ColorScheme = current === 'dark' ? 'light' : 'dark'
      if (typeof window !== 'undefined') {
        if (storageKey) window.localStorage.setItem(storageKey, next)
        window.dispatchEvent(new CustomEvent('ud-color-scheme', { detail: { scheme: next, key: storageKey } }))
      }
      return next
    })
  }, [storageKey])

  const value = useMemo(() => ({ scheme, toggle, available }), [scheme, toggle, available])

  return <ThemeSchemeContext.Provider value={value}>{children}</ThemeSchemeContext.Provider>
}

export function useThemeScheme(): SchemeContext {
  return useContext(ThemeSchemeContext)
}

export function ThemeSwitch({ className }: { className?: string }) {
  const { scheme, toggle, available } = useThemeScheme()
  if (!available) return null
  const next = scheme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      className={className ? `ud-scheme-toggle ${className}` : 'ud-scheme-toggle'}
      aria-label={`Switch to ${next} background`}
      title={scheme === 'dark' ? 'Light background' : 'Dark background'}
      onClick={toggle}
    >
      <Icon name={scheme === 'dark' ? 'sun' : 'moon'} size={18} />
    </button>
  )
}
