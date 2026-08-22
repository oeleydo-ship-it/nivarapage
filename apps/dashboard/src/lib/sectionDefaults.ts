import type { PageSection } from '@uidesired/types'

/**
 * Style props that are page-wide conventions rather than per-section choices.
 *
 * A template sets these consistently across its sections (Northbook, for
 * example, fades every section up on scroll over 680ms). A block dragged in
 * from the core library carries none of them, so it lands looking like it came
 * from a different site. These are inherited on insert; anything that is a
 * genuine per-section design decision — tone, padding, alignment, background —
 * is deliberately left alone.
 */
export const INHERITED_SECTION_PROPS = [
  'animation',
  'animationTrigger',
  'animationDuration',
  'contentWidth',
  'headingFont',
  'bodyFont',
  'headingWeight',
  'bodyWeight',
  'eyebrowStyle',
] as const

/** Chrome blocks have their own conventions and should not skew the profile. */
function isChrome(type: string): boolean {
  return /^(navbar|topbar|subnav|footer)\./.test(type)
}

/** A value has to be shared by this share of the sections that set it at all. */
const AGREEMENT = 0.6

/**
 * Derives the page's prevailing style settings so a newly inserted block can
 * adopt them. Only values a clear majority of sections agree on are returned,
 * so one oddly-styled section never becomes the template.
 */
export function pageStyleProfile(sections: readonly PageSection[] | null | undefined): Record<string, unknown> {
  const body = (sections ?? []).filter((section) => section && !isChrome(section.type))
  const profile: Record<string, unknown> = {}
  if (body.length < 2) return profile

  for (const key of INHERITED_SECTION_PROPS) {
    const tally = new Map<string, { value: unknown; count: number }>()
    let defined = 0

    for (const section of body) {
      const value = (section.props as Record<string, unknown> | undefined)?.[key]
      if (value === undefined || value === null || value === '') continue
      defined += 1
      const id = JSON.stringify(value)
      const entry = tally.get(id) ?? { value, count: 0 }
      entry.count += 1
      tally.set(id, entry)
    }

    if (defined < 2) continue
    const winner = [...tally.values()].sort((a, b) => b.count - a.count)[0]
    if (winner && winner.count / defined >= AGREEMENT) profile[key] = winner.value
  }

  return profile
}

/**
 * Applies the page profile to a freshly created section's props. Returns the
 * same object so it can be used inline.
 */
export function applyPageStyleProfile(
  props: Record<string, unknown>,
  sections: readonly PageSection[] | null | undefined,
): Record<string, unknown> {
  const profile = pageStyleProfile(sections)
  for (const [key, value] of Object.entries(profile)) {
    props[key] = value
  }
  return props
}
