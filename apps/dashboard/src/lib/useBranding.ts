import { useQuery } from '@tanstack/react-query'
import { brandingApi, type PlatformBranding } from './endpoints'

/**
 * The platform's own name/logo. Reads the public endpoint so it works on the
 * sign-in screen too, and is cached because it changes about once a year.
 */
export function useBranding() {
  return useQuery<PlatformBranding>({
    queryKey: ['branding'],
    queryFn: brandingApi.get,
    staleTime: 5 * 60_000,
    retry: false,
  })
}
