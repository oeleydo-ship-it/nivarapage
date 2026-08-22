import type { PlanLimitError, UsageEntry } from '@uidesired/types'
import { useQuery } from '@tanstack/react-query'
import { billingApi } from './endpoints'

export const USAGE_LABELS: Record<string, string> = {
  number_of_sites: 'Websites',
  custom_domains: 'Custom domains',
  storage_mb: 'Storage',
  form_submissions: 'Form submissions',
  team_members: 'Team members',
  pages_per_site: 'Pages per site',
  ai_generations: 'AI generations',
}

export function atCap(entry?: UsageEntry | null): boolean {
  if (!entry) return false
  if (typeof entry.limit !== 'number') return false
  if (entry.limit < 0) return false
  return (entry.used ?? 0) >= entry.limit
}

export function featureEnabled(entry?: UsageEntry | null): boolean {
  return Boolean(entry?.enabled)
}

export function useSubscription() {
  return useQuery({ queryKey: ['subscription'], queryFn: billingApi.subscription })
}

export function limitLabel(key?: string): string {
  if (!key) return 'this feature'
  return USAGE_LABELS[key] ?? key.replace(/_/g, ' ')
}

export function planLimitMessage(error?: PlanLimitError | null): string {
  if (error?.message) return error.message
  return `Plan limit reached for ${limitLabel(error?.limit_key)}. Upgrade to continue.`
}
