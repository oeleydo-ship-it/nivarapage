'use client'

import { createContext, useContext, type ReactNode } from 'react'

const SiteNameContext = createContext<string | null>(null)

export function SiteProvider({ name, children }: { name?: string | null; children: ReactNode }) {
  return <SiteNameContext.Provider value={name ?? null}>{children}</SiteNameContext.Provider>
}

/** Site name from the renderer, used as the fallback brand in footers. */
export function useSiteName(fallback = ''): string {
  return useContext(SiteNameContext) || fallback
}
