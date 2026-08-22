'use client'

import { createContext, useContext, type ReactNode } from 'react'

export type NavLinkItem = {
  label: string
  href: string
  target?: string
  children?: NavLinkItem[]
}

const NavigationContext = createContext<NavLinkItem[] | null>(null)

export function NavigationProvider({ items, children }: { items?: NavLinkItem[] | null; children: ReactNode }) {
  return <NavigationContext.Provider value={items ?? null}>{children}</NavigationContext.Provider>
}

export function useNavigationItems(fallback: NavLinkItem[]): NavLinkItem[] {
  const items = useContext(NavigationContext)
  return items && items.length ? items : fallback
}

export function hrefForMenuItem(item: {
  type?: string | null
  href?: string | null
  url?: string | null
  label: string
}): string {
  if (item.href) return item.href
  if (item.url) return item.url
  const slug = item.label.toLowerCase().replace(/\s+/g, '-')
  return slug === 'home' ? '/' : `/${slug}`
}
