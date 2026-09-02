import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { brandingApi, type PlatformBranding } from './endpoints'

/**
 * The platform's own name/logo. Reads the public endpoint so it works on the
 * sign-in screen too, and is cached because it changes about once a year.
 */
export function useBranding() {
  const query = useQuery<PlatformBranding>({
    queryKey: ['branding'],
    queryFn: brandingApi.get,
    staleTime: 5 * 60_000,
    retry: false,
  })

  const name = query.data?.platform_name
  useEffect(() => {
    if (name) document.title = name
  }, [name])

  const favicon = query.data?.favicon_url
  useEffect(() => {
    if (!favicon) return
    let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = favicon
  }, [favicon])

  return query
}
