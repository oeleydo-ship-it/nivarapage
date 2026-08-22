import type { BlockField } from '@uidesired/types'
import type { ElementStyleMap, ElementTextStyle } from './editable'
import { pathId, type EditPath } from './editable'
import { quoteFontStack } from './theme'

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile'

export const RESPONSIVE_DEVICES = ['tablet', 'mobile'] as const
export type ResponsiveDevice = (typeof RESPONSIVE_DEVICES)[number]

export type ResponsiveBuckets = Partial<Record<ResponsiveDevice, Record<string, unknown>>>

/** Matches the builder canvas widths: tablet is 768px, mobile is 390px. */
export const RESPONSIVE_MAX_WIDTH: Record<ResponsiveDevice, number> = {
  tablet: 768,
  mobile: 480,
}

const RESPONSIVE_GROUPS = new Set(['typography', 'spacing', 'layout', 'design', 'background'])

const RESPONSIVE_KEYS = new Set([
  'elementStyles',
  'headingSize',
  'bodySize',
  'fontSize',
  'headingFont',
  'bodyFont',
  'headingWeight',
  'bodyWeight',
  'headingColor',
  'textColor',
  'accentColor',
  'cardColor',
  'backgroundColor',
  'paddingTop',
  'paddingBottom',
  'paddingInline',
  'sectionMinHeight',
  'borderWidth',
  'borderColor',
  'borderRadius',
  'sectionShadow',
  'contentWidth',
  'textAlign',
  'overflow',
  'columns',
  'gap',
  'overlayColor',
  'overlayOpacity',
])

const SECTION_CSS: Record<string, { name: string; px?: boolean }> = {
  headingSize: { name: '--ud-heading-size', px: true },
  bodySize: { name: '--ud-body-size', px: true },
  headingFont: { name: '--font-heading' },
  bodyFont: { name: '--font-body' },
  headingWeight: { name: '--font-heading-weight' },
  bodyWeight: { name: '--font-body-weight' },
  headingColor: { name: '--ud-heading' },
  textColor: { name: '--ud-fg' },
  accentColor: { name: '--ud-accent' },
  cardColor: { name: '--ud-card' },
  backgroundColor: { name: '--ud-bg' },
  paddingTop: { name: '--ud-pt', px: true },
  paddingBottom: { name: '--ud-pb', px: true },
  paddingInline: { name: '--ud-px', px: true },
  sectionMinHeight: { name: '--ud-min-height', px: true },
  borderWidth: { name: '--ud-border-width', px: true },
  borderColor: { name: '--ud-border-color' },
  borderRadius: { name: '--ud-section-radius', px: true },
  gap: { name: '--ud-gap', px: true },
  columns: { name: '--ud-cols' },
}

export function isResponsiveField(field: Pick<BlockField, 'key' | 'group'>): boolean {
  if (RESPONSIVE_KEYS.has(field.key)) return true
  return RESPONSIVE_GROUPS.has(field.group || '')
}

export function readResponsive(props: Record<string, unknown> | undefined): ResponsiveBuckets {
  const raw = props?.responsive
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const source = raw as Record<string, unknown>
  const buckets: ResponsiveBuckets = {}
  for (const device of RESPONSIVE_DEVICES) {
    const entry = source[device]
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) buckets[device] = { ...(entry as Record<string, unknown>) }
  }
  return buckets
}

export function mergeStyleMaps(...maps: unknown[]): ElementStyleMap {
  const merged: ElementStyleMap = {}
  for (const map of maps) {
    if (!map || typeof map !== 'object' || Array.isArray(map)) continue
    for (const [key, value] of Object.entries(map as ElementStyleMap)) {
      if (!value || typeof value !== 'object') continue
      merged[key] = { ...merged[key], ...value }
    }
  }
  return merged
}

export function mergeResponsiveProps(props: Record<string, unknown>, device: PreviewDevice): Record<string, unknown> {
  const { responsive: _ignored, ...base } = props
  if (device === 'desktop') return base
  const buckets = readResponsive(props)
  const layers = device === 'mobile' ? [buckets.tablet, buckets.mobile] : [buckets.tablet]
  const next = { ...base }
  for (const layer of layers) {
    if (!layer) continue
    for (const [key, value] of Object.entries(layer)) {
      if (key === 'elementStyles') next.elementStyles = mergeStyleMaps(next.elementStyles, value)
      else next[key] = value
    }
  }
  return next
}

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function styleDiff(base: ElementTextStyle | undefined, next: ElementTextStyle): ElementTextStyle | undefined {
  const diff: ElementTextStyle = {}
  for (const [key, value] of Object.entries(next) as Array<[keyof ElementTextStyle, ElementTextStyle[keyof ElementTextStyle]]>) {
    if (value === undefined || value === '') continue
    if (base?.[key] !== value) (diff as Record<string, unknown>)[key as string] = value
  }
  return Object.keys(diff).length ? diff : undefined
}

export function patchResponsiveProps(
  props: Record<string, unknown>,
  device: PreviewDevice,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  if (device === 'desktop') return patch
  const buckets = readResponsive(props)
  const bucket = { ...(buckets[device] || {}) }
  for (const [key, value] of Object.entries(patch)) {
    if (key === 'elementStyles') {
      if (!value || (typeof value === 'object' && !Array.isArray(value) && !Object.keys(value as object).length)) {
        delete bucket.elementStyles
      } else {
        bucket.elementStyles = value
      }
      continue
    }
    if (value === undefined || sameValue(value, props[key])) delete bucket[key]
    else bucket[key] = value
  }
  const next: ResponsiveBuckets = { ...buckets, [device]: Object.keys(bucket).length ? bucket : undefined }
  if (!next.tablet) delete next.tablet
  if (!next.mobile) delete next.mobile
  return { responsive: Object.keys(next).length ? next : undefined }
}

export function patchResponsiveElementStyle(
  props: Record<string, unknown>,
  device: PreviewDevice,
  path: EditPath,
  style: ElementTextStyle | undefined,
): Record<string, unknown> {
  const key = pathId(path)
  const baseMap =
    props.elementStyles && typeof props.elementStyles === 'object' && !Array.isArray(props.elementStyles)
      ? (props.elementStyles as ElementStyleMap)
      : {}

  if (device === 'desktop') {
    const next = { ...baseMap }
    if (style) next[key] = style
    else delete next[key]
    return { elementStyles: Object.keys(next).length ? next : undefined }
  }

  const buckets = readResponsive(props)
  const current =
    buckets[device]?.elementStyles && typeof buckets[device]?.elementStyles === 'object'
      ? { ...(buckets[device]!.elementStyles as ElementStyleMap) }
      : {}
  if (!style) delete current[key]
  else {
    const diff = styleDiff(baseMap[key], style)
    if (diff) current[key] = diff
    else delete current[key]
  }
  return patchResponsiveProps(props, device, { elementStyles: Object.keys(current).length ? current : undefined })
}

export function responsiveOverrideKeys(props: Record<string, unknown> | undefined, device: PreviewDevice): Set<string> {
  if (device === 'desktop') return new Set()
  const bucket = readResponsive(props)[device]
  return new Set(bucket ? Object.keys(bucket) : [])
}

function cssValue(key: string, value: unknown): string | undefined {
  const spec = SECTION_CSS[key]
  if (!spec || value === undefined || value === null || value === '') return undefined
  if (spec.name === '--font-heading' || spec.name === '--font-body') return quoteFontStack(String(value))
  if (spec.px) return `${value}px`
  return String(value)
}

function elementDecls(style: ElementTextStyle): string {
  const decls: string[] = []
  if (style.color) decls.push(`color:${style.color} !important`)
  if (style.fontFamily) decls.push(`font-family:${quoteFontStack(style.fontFamily)} !important`)
  if (typeof style.fontSize === 'number') decls.push(`font-size:${style.fontSize}px !important`)
  if (style.fontWeight) decls.push(`font-weight:${style.fontWeight} !important`)
  if (typeof style.lineHeight === 'number') decls.push(`line-height:${style.lineHeight} !important`)
  if (typeof style.letterSpacing === 'number') decls.push(`letter-spacing:${style.letterSpacing}px !important`)
  if (style.textAlign) decls.push(`text-align:${style.textAlign} !important`)
  if (style.textTransform && style.textTransform !== 'none') decls.push(`text-transform:${style.textTransform} !important`)
  if (style.fontStyle === 'italic') decls.push('font-style:italic !important')
  if (style.textDecoration === 'underline') decls.push('text-decoration:underline !important')
  return decls.join(';')
}

function sectionDecls(layer: Record<string, unknown>): string {
  const decls: string[] = []
  for (const [key, value] of Object.entries(layer)) {
    const css = cssValue(key, value)
    if (css) decls.push(`${SECTION_CSS[key].name}:${css} !important`)
    if (key === 'textAlign' && (value === 'left' || value === 'center' || value === 'right')) {
      decls.push(`text-align:${value} !important`)
    }
  }
  return decls.join(';')
}

function wrapMedia(device: ResponsiveDevice, body: string): string {
  if (!body) return ''
  return `@media (max-width:${RESPONSIVE_MAX_WIDTH[device]}px){${body}}`
}

function escapeCss(value: string): string {
  return typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(value) : value.replace(/["\\]/g, '\\$&')
}

export function responsiveSectionCss(sectionId: string, props: Record<string, unknown>): string {
  if (!sectionId) return ''
  const root = `[data-section-id="${escapeCss(sectionId)}"]`
  const section = `${root},${root} .ud-section`
  const chunks: string[] = []

  for (const device of RESPONSIVE_DEVICES) {
    const layer = readResponsive(props)[device]
    if (!layer) continue
    const parts: string[] = []
    const vars = sectionDecls(layer)
    if (vars) parts.push(`${section}{${vars}}`)
    const styles =
      layer.elementStyles && typeof layer.elementStyles === 'object' ? (layer.elementStyles as ElementStyleMap) : {}
    for (const [path, style] of Object.entries(styles)) {
      const decls = elementDecls(style)
      if (decls) parts.push(`${root} [data-ud-style="${escapeCss(path)}"]{${decls}}`)
    }
    chunks.push(wrapMedia(device, parts.join('')))
  }
  return chunks.join('')
}

