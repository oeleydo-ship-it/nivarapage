import type { CSSProperties, ReactNode } from 'react'
import { EditableImage, EditableRich, EditableText, EDIT_PROP, editOf, type EditBinding, type EditPath } from './editable'
import { Icon } from './icons'
import { markdownBoldToHtml, sanitizeRichText } from './sanitize'
import { ANIMATION_IDS } from './schema'
import { quoteFontStack } from './theme'

export type Props = Record<string, unknown>

/* ------------------------------------------------------------------ values */

export function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback
}

export function num(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value)
  return fallback
}

export function optNum(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value)
  return undefined
}

export function bool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

export function arr(value: unknown): Props[] {
  if (Array.isArray(value)) return value.filter((item) => item && typeof item === 'object') as Props[]
  if (typeof value === 'string' && value.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed.filter((item) => item && typeof item === 'object') as Props[]
    } catch {
      return []
    }
  }
  return []
}

/** Repeater items with a fallback so a freshly inserted block never looks empty. */
export function items(value: unknown, fallback: Props[]): Props[] {
  const list = arr(value)
  return list.length ? list : fallback
}

export function lines(value: unknown, fallback: string[] = []): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean)
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/\r?\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
  }
  return fallback
}

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}

/* -------------------------------------------------------------- backgrounds */

export type Tone = 'default' | 'surface' | 'dark' | 'primary' | 'accent' | 'gradient'

const TONES: Record<Tone, CSSProperties> = {
  default: {
    '--ud-bg': 'var(--color-background, #fff)',
    '--ud-fg': 'var(--color-text, #0f172a)',
    '--ud-muted': 'var(--color-muted, #64748b)',
    '--ud-card': 'var(--color-surface, #f8fafc)',
    '--ud-accent': 'var(--color-primary, #2563eb)',
  } as CSSProperties,
  surface: {
    '--ud-bg': 'var(--color-surface, #f8fafc)',
    '--ud-fg': 'var(--color-text, #0f172a)',
    '--ud-muted': 'var(--color-muted, #64748b)',
    '--ud-card': 'var(--color-background, #fff)',
    '--ud-accent': 'var(--color-primary, #2563eb)',
  } as CSSProperties,
  dark: {
    '--ud-bg': 'var(--color-secondary, #0f172a)',
    '--ud-fg': '#ffffff',
    '--ud-muted': 'rgba(255,255,255,0.72)',
    '--ud-card': 'rgba(255,255,255,0.07)',
    '--ud-accent': 'var(--color-accent, #f59e0b)',
  } as CSSProperties,
  primary: {
    '--ud-bg': 'var(--color-primary, #2563eb)',
    '--ud-fg': '#ffffff',
    '--ud-muted': 'rgba(255,255,255,0.82)',
    '--ud-card': 'rgba(255,255,255,0.12)',
    '--ud-accent': '#ffffff',
  } as CSSProperties,
  accent: {
    '--ud-bg': 'var(--color-accent, #f59e0b)',
    '--ud-fg': '#111111',
    '--ud-muted': 'rgba(0,0,0,0.65)',
    '--ud-card': 'rgba(255,255,255,0.5)',
    '--ud-accent': '#111111',
  } as CSSProperties,
  gradient: {
    '--ud-bg':
      'linear-gradient(135deg, var(--color-primary, #2563eb), color-mix(in srgb, var(--color-secondary, #0f172a) 80%, var(--color-primary, #2563eb)))',
    '--ud-fg': '#ffffff',
    '--ud-muted': 'rgba(255,255,255,0.78)',
    '--ud-card': 'rgba(255,255,255,0.12)',
    '--ud-accent': '#ffffff',
  } as CSSProperties,
}

const WIDTHS: Record<string, string> = {
  narrow: '760px',
  default: 'var(--container-width, 1120px)',
  wide: '1360px',
  full: '100%',
}

function toneOf(props: Props, fallback: Tone): Tone {
  const value = str(props.tone)
  return (value in TONES ? value : fallback) as Tone
}

/**
 * Resolves the design/layout/spacing/background props every block shares into
 * CSS variables so a single stylesheet can drive both the canvas and the
 * published site.
 */
export function sectionVars(props: Props, fallbackTone: Tone = 'default'): CSSProperties {
  const tone = toneOf(props, fallbackTone)
  const vars: Record<string, string> = { ...(TONES[tone] as Record<string, string>) }

  const backgroundType = str(props.backgroundType, 'tone')
  if (backgroundType === 'color') {
    const color = str(props.backgroundColor)
    if (color) vars['--ud-bg'] = color
  } else if (backgroundType === 'gradient') {
    const from = str(props.gradientFrom, 'var(--color-primary, #2563eb)')
    const to = str(props.gradientTo, 'var(--color-secondary, #0f172a)')
    vars['--ud-bg'] = `linear-gradient(${num(props.gradientAngle, 135)}deg, ${from}, ${to})`
  } else if (backgroundType === 'image') {
    const image = str(props.backgroundImage)
    const opacity = Math.min(Math.max(num(props.overlayOpacity, 55), 0), 100) / 100
    const overlay = str(props.overlayColor, '#0f172a')
    const layers = [
      `linear-gradient(color-mix(in srgb, ${overlay} ${Math.round(opacity * 100)}%, transparent), color-mix(in srgb, ${overlay} ${Math.round(opacity * 100)}%, transparent))`,
    ]
    if (image) layers.push(`url("${image.replace(/"/g, '')}") center / cover no-repeat`)
    vars['--ud-bg'] = layers.join(', ')
  }

  if (backgroundType === 'video') {
    vars['--ud-bg'] = 'transparent'
    vars['--ud-overlay-color'] = str(props.overlayColor, '#0f172a')
    vars['--ud-overlay-opacity'] = `${Math.min(Math.max(num(props.overlayOpacity, 55), 0), 100)}%`
  }

  const lightText = backgroundType === 'image' || backgroundType === 'gradient' || backgroundType === 'video' ? bool(props.lightText, true) : false
  if (lightText) {
    vars['--ud-fg'] = '#ffffff'
    vars['--ud-muted'] = 'rgba(255,255,255,0.78)'
    vars['--ud-card'] = 'rgba(255,255,255,0.12)'
  }

  const textColor = str(props.textColor)
  if (textColor) vars['--ud-fg'] = textColor
  const headingColor = str(props.headingColor)
  if (headingColor) vars['--ud-heading'] = headingColor
  const accentColor = str(props.accentColor)
  if (accentColor) vars['--ud-accent'] = accentColor
  const cardColor = str(props.cardColor)
  if (cardColor) vars['--ud-card'] = cardColor

  // Empty font/size/weight props inherit the site theme from `--font-*` on :root.
  const headingFont = str(props.headingFont)
  if (headingFont) vars['--font-heading'] = quoteFontStack(headingFont)
  const bodyFont = str(props.bodyFont)
  if (bodyFont) vars['--font-body'] = quoteFontStack(bodyFont)
  const headingWeight = optNum(props.headingWeight)
  if (headingWeight !== undefined) vars['--font-heading-weight'] = String(headingWeight)
  const bodyWeight = optNum(props.bodyWeight)
  if (bodyWeight !== undefined) vars['--font-body-weight'] = String(bodyWeight)
  const headingSize = optNum(props.headingSize)
  if (headingSize !== undefined) vars['--ud-heading-size'] = `${headingSize}px`
  const bodySize = optNum(props.bodySize)
  if (bodySize !== undefined) vars['--ud-body-size'] = `${bodySize}px`

  const paddingTop = optNum(props.paddingTop)
  if (paddingTop !== undefined) vars['--ud-pt'] = `${paddingTop}px`
  const paddingBottom = optNum(props.paddingBottom)
  if (paddingBottom !== undefined) vars['--ud-pb'] = `${paddingBottom}px`
  const paddingInline = optNum(props.paddingInline)
  if (paddingInline !== undefined) vars['--ud-px'] = `${paddingInline}px`

  const minHeight = optNum(props.sectionMinHeight)
  if (minHeight !== undefined) vars['--ud-min-height'] = `${minHeight}px`
  const borderWidth = optNum(props.borderWidth)
  if (borderWidth !== undefined) vars['--ud-border-width'] = `${borderWidth}px`
  const borderColor = str(props.borderColor)
  if (borderColor) vars['--ud-border-color'] = borderColor
  const borderRadius = optNum(props.borderRadius)
  if (borderRadius !== undefined) vars['--ud-section-radius'] = `${borderRadius}px`
  const overflow = str(props.overflow)
  if (overflow === 'hidden' || overflow === 'visible') vars['--ud-overflow'] = overflow
  const shadow = str(props.sectionShadow)
  const shadows: Record<string, string> = {
    none: 'none',
    soft: '0 12px 32px -20px rgba(15,23,42,.28)',
    medium: '0 24px 54px -28px rgba(15,23,42,.4)',
    strong: '0 32px 72px -30px rgba(15,23,42,.58)',
  }
  if (shadow in shadows) vars['--ud-section-shadow'] = shadows[shadow]

  const width = str(props.contentWidth, 'default')
  vars['--ud-max'] = WIDTHS[width] || WIDTHS.default

  const gap = optNum(props.gap)
  if (gap !== undefined) vars['--ud-gap'] = `${gap}px`

  const columns = optNum(props.columns)
  if (columns !== undefined) vars['--ud-cols'] = String(Math.min(Math.max(columns, 1), 6))

  return vars as CSSProperties
}

const ANIMATION_SET = new Set<string>(ANIMATION_IDS)

export function animationOf(props: Props): {
  className?: string
  style?: CSSProperties
  trigger?: 'load' | 'scroll'
} {
  const name = str(props.animation)
  if (!name || name === 'none' || !ANIMATION_SET.has(name)) return {}
  const duration = optNum(props.animationDuration) ?? 700
  const delay = optNum(props.animationDelay) ?? 0
  const trigger =
    props[EDIT_PROP] || str(props.animationTrigger, 'scroll') === 'load' ? 'load' : 'scroll'
  return {
    className: `ud-anim ud-anim-${name}`,
    style: {
      '--ud-anim-duration': `${Math.min(Math.max(duration, 120), 3000)}ms`,
      '--ud-anim-delay': `${Math.min(Math.max(delay, 0), 4000)}ms`,
    } as CSSProperties,
    trigger,
  }
}

export function alignClass(props: Props, fallback: 'left' | 'center' | 'right' = 'left'): string {
  const align = str(props.textAlign, fallback)
  return align === 'center' ? 'ud-center' : align === 'right' ? 'ud-right' : ''
}

export function isCentered(props: Props, fallback: 'left' | 'center' | 'right' = 'left'): boolean {
  return str(props.textAlign, fallback) === 'center'
}

/* ---------------------------------------------------------------- structure */

/**
 * Outer wrapper for every block. Applies tone, background, spacing, width and
 * alignment, then renders children inside the themed container.
 */
export function SectionShell({
  props = {},
  tone = 'default',
  children,
  bleed = false,
  className,
  style,
  align,
  anchorId,
}: {
  props?: Props
  tone?: Tone
  children: ReactNode
  bleed?: boolean
  className?: string
  style?: CSSProperties
  align?: 'left' | 'center' | 'right'
  anchorId?: string
}) {
  const id = str(props.anchorId, anchorId || '')
  const anim = animationOf(props)
  const backgroundType = str(props.backgroundType, 'tone')
  const videoSrc = str(props.backgroundVideo) || str(props.backgroundVideoUrl)
  const textAnimation = str(props.textAnimation, 'none')
  const textStyle = {
    '--ud-text-duration': `${Math.min(Math.max(num(props.textAnimationDuration, 700), 100), 3000)}ms`,
    '--ud-text-delay': `${Math.min(Math.max(num(props.textAnimationDelay, 80), 0), 2000)}ms`,
  } as CSSProperties
  const content = bleed ? children : <div className="ud-container">{children}</div>
  return (
    <section
      id={id || undefined}
      className={cx('ud-section', bleed && 'ud-section--bleed', alignClass(props, align || 'left'), anim.className, textAnimation !== 'none' && 'ud-text-anim', textAnimation !== 'none' && `ud-text-anim--${textAnimation}`, className)}
      style={{ ...sectionVars(props, tone), ...anim.style, ...textStyle, ...style }}
      data-ud-anim={anim.trigger}
    >
      {backgroundType === 'video' && videoSrc ? (
        <video className="ud-section__video" src={videoSrc} poster={str(props.videoPoster) || undefined} autoPlay={bool(props.videoAutoplay, true)} loop={bool(props.videoLoop, true)} muted={bool(props.videoMuted, true)} playsInline aria-hidden="true" />
      ) : null}
      {backgroundType === 'video' && videoSrc ? <span className="ud-section__video-overlay" aria-hidden="true" /> : null}
      {content}
    </section>
  )
}

export function Container({ children, style, className }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <div className={cx('ud-container', className)} style={style}>
      {children}
    </div>
  )
}

/** Kept for compatibility with earlier block code. */
export function Section({ children, style, className }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <section className={cx('ud-section', className)} style={{ ...(TONES.default as CSSProperties), ...style }}>
      {children}
    </section>
  )
}

export function Heading({
  children,
  as: Tag = 'h2',
  level,
  style,
  className,
  edit,
  path,
  placeholder,
}: {
  children: ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div'
  level?: 1 | 2 | 3 | 4
  style?: CSSProperties
  className?: string
  /** Builder binding; when present the heading becomes inline editable. */
  edit?: EditBinding
  path?: EditPath
  placeholder?: string
}) {
  const size = level ?? (Tag === 'h1' ? 1 : Tag === 'h3' ? 3 : Tag === 'h4' ? 4 : 2)
  const tag = size === 1 ? 'h1' : size === 3 ? 'h3' : size === 4 ? 'h4' : 'h2'
  if (path) {
    return (
      <EditableText
        edit={edit}
        path={path}
        value={typeof children === 'string' ? children : ''}
        as={Tag === 'p' || Tag === 'div' ? Tag : tag}
        className={cx(`ud-h${size}`, className)}
        style={style}
        placeholder={placeholder || 'Heading'}
      />
    )
  }
  return (
    <Tag className={cx(`ud-h${size}`, className)} style={style}>
      {children}
    </Tag>
  )
}

/** Eyebrow + heading + description group used by most section blocks. */
export function SectionHead({
  props,
  headingKey = 'heading',
  descriptionKey = 'description',
  defaultHeading,
  level = 2,
  center,
  className,
}: {
  props: Props
  headingKey?: string
  descriptionKey?: string
  defaultHeading?: string
  level?: 1 | 2 | 3
  center?: boolean
  className?: string
}) {
  const edit = editOf(props)
  const eyebrow = str(props.eyebrow)
  const heading = str(props[headingKey], defaultHeading || '')
  const descriptionSourceKey = str(props[descriptionKey]) || !str(props.subheading) ? descriptionKey : 'subheading'
  const description = str(props[descriptionKey]) || str(props.subheading)
  const centered = center ?? isCentered(props)
  const pill = str(props.eyebrowStyle) === 'pill'
  if (!edit && !eyebrow && !heading && !description) return null
  return (
    <div className={cx('ud-head', centered && 'ud-head--center', className)}>
      {eyebrow || edit ? (
        pill ? (
          <span className="ud-badge" style={{ marginBottom: 16 }}>
            <Icon name="sparkles" size={14} />
            <EditableText edit={edit} path={['eyebrow']} value={eyebrow} placeholder="Eyebrow" />
          </span>
        ) : (
          <EditableText edit={edit} path={['eyebrow']} value={eyebrow} as="p" className="ud-eyebrow" placeholder="Eyebrow" />
        )
      ) : null}
      {heading || edit ? (
        <EditableText
          edit={edit}
          path={[headingKey]}
          value={heading}
          as={level === 1 ? 'h1' : level === 3 ? 'h3' : 'h2'}
          className={`ud-h${level}`}
          placeholder="Heading"
        />
      ) : null}
      {description || edit ? (
        <SafeText
          value={description}
          className="ud-lead"
          edit={edit}
          path={[descriptionSourceKey]}
          placeholder="Short description"
        />
      ) : null}
    </div>
  )
}

/**
 * Title of a repeater item (`props[collection][index].title`). Blocks use this so
 * item text is inline editable without each block wiring paths by hand.
 */
export function ItemTitle({
  props,
  item,
  index,
  collection = 'items',
  titleKey = 'title',
  fallback = 'Title',
  level = 4,
  className,
  style,
}: {
  props: Props
  item: Props
  index: number
  collection?: string
  titleKey?: string
  fallback?: string
  level?: 2 | 3 | 4
  className?: string
  style?: CSSProperties
}) {
  return (
    <EditableText
      edit={editOf(props)}
      path={[collection, index, titleKey]}
      value={str(item[titleKey], fallback)}
      as={level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4'}
      className={cx(`ud-h${level}`, className)}
      style={style}
      placeholder={fallback}
    />
  )
}

/** Body copy of a repeater item, tolerating the legacy `description` key. */
export function ItemText({
  props,
  item,
  index,
  collection = 'items',
  className = 'ud-text',
  style,
  placeholder = 'Describe this item',
}: {
  props: Props
  item: Props
  index: number
  collection?: string
  className?: string
  style?: CSSProperties
  placeholder?: string
}) {
  const key = typeof item.text === 'string' || item.description === undefined ? 'text' : 'description'
  return (
    <SafeText
      value={item.text || item.description}
      className={className}
      style={style}
      edit={editOf(props)}
      path={[collection, index, key]}
      placeholder={placeholder}
    />
  )
}

export function Body({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={cx('ud-body', className)} style={style}>
      {children}
    </div>
  )
}

/**
 * Responsive column grid. The column count lives in `data-cols` so container
 * queries can step it down without fighting inline styles.
 */
export function Grid({
  cols = 3,
  gap = 24,
  children,
  className,
  style,
}: {
  cols?: number
  gap?: number
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  const columns = Math.min(Math.max(Math.round(cols) || 1, 1), 6)
  return (
    <div
      className={cx('ud-body', 'ud-grid', className)}
      data-cols={columns}
      style={{ '--ud-cols': String(columns), '--ud-gap': `${gap}px`, ...style } as CSSProperties}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ buttons */

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'light' | 'link'

const BUTTON_VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'accent', 'outline', 'ghost', 'light', 'link']

export function variantOf(value: unknown, fallback: ButtonVariant = 'primary'): ButtonVariant {
  const name = str(value)
  return (BUTTON_VARIANTS as string[]).includes(name) ? (name as ButtonVariant) : fallback
}

export function Button({
  children,
  href = '#',
  variant = 'primary',
  target,
  type: _type,
  className,
  style,
}: {
  children: ReactNode
  href?: string
  variant?: ButtonVariant
  target?: string
  /** Accepted for form-oriented blocks; Button renders a styled link. */
  type?: 'button' | 'submit'
  className?: string
  style?: CSSProperties
}) {
  if (_type) {
    return (
      <button className={cx('ud-btn', `ud-btn--${variant}`, className)} type={_type} style={style}>
        {children}
      </button>
    )
  }

  return (
    <a
      className={cx('ud-btn', `ud-btn--${variant}`, className)}
      href={href || '#'}
      target={target === '_blank' ? '_blank' : undefined}
      rel={target === '_blank' ? 'noreferrer' : undefined}
      style={style}
    >
      {children}
    </a>
  )
}

type Link = { label: string; url: string; target?: string }

function linkFrom(value: unknown, labelFallback: string): Link | null {
  if (typeof value === 'string') {
    return value.trim() ? { label: value, url: '#' } : null
  }
  if (value && typeof value === 'object') {
    const obj = value as { label?: unknown; text?: unknown; url?: unknown; href?: unknown; target?: unknown }
    const label = str(obj.label) || str(obj.text) || labelFallback
    const url = str(obj.url) || str(obj.href) || '#'
    if (!label) return null
    return { label, url, target: str(obj.target) || undefined }
  }
  return null
}

/** Primary/secondary button pair, tolerant of the several prop shapes in page JSON. */
export function ctaLinks(props: Props): { primary: Link | null; secondary: Link | null } {
  const primaryLabel = str(props.buttonLabel) || str(props.ctaLabel) || str(props.cta) || str(props.primaryLabel)
  const primaryUrl = str(props.buttonUrl) || str(props.ctaUrl) || str(props.primaryUrl) || '#'
  let primary: Link | null = primaryLabel ? { label: primaryLabel, url: primaryUrl, target: str(props.buttonTarget) || undefined } : null
  if (!primary) primary = linkFrom(props.primaryButton, 'Get started') || linkFrom(props.cta, 'Get started')

  const secondaryLabel = str(props.secondaryLabel) || str(props.secondaryButtonLabel)
  const secondaryUrl = str(props.secondaryUrl) || str(props.secondaryButtonUrl) || '#'
  let secondary: Link | null = secondaryLabel ? { label: secondaryLabel, url: secondaryUrl } : null
  if (!secondary) secondary = linkFrom(props.secondaryButton, 'Learn more')

  return { primary, secondary }
}

export function CtaGroup({
  props,
  primaryVariant = 'primary',
  secondaryVariant = 'outline',
  className,
}: {
  props: Props
  primaryVariant?: ButtonVariant
  secondaryVariant?: ButtonVariant
  className?: string
}) {
  const { primary, secondary } = ctaLinks(props)
  const edit = editOf(props)
  if (!primary && !secondary) return null
  // Each block picks the style that suits its layout; the props only override it.
  const primaryStyle = variantOf(props.buttonVariant, primaryVariant)
  const secondaryStyle = variantOf(props.secondaryVariant, secondaryVariant)
  return (
    <div className={cx('ud-btns', className)}>
      {primary ? (
        <Button href={primary.url} variant={primaryStyle} target={primary.target}>
          <EditableText edit={edit} path={[ctaLabelKey(props, 'primary')]} value={primary.label} placeholder="Button" />
        </Button>
      ) : null}
      {secondary ? (
        <Button href={secondary.url} variant={secondaryStyle} target={secondary.target}>
          <EditableText edit={edit} path={[ctaLabelKey(props, 'secondary')]} value={secondary.label} placeholder="Button" />
        </Button>
      ) : null}
    </div>
  )
}

/** Which prop holds a CTA label, so inline edits write back to the right key. */
function ctaLabelKey(props: Props, which: 'primary' | 'secondary'): string {
  const candidates =
    which === 'primary'
      ? ['buttonLabel', 'ctaLabel', 'primaryLabel', 'buttonText']
      : ['secondaryLabel', 'secondaryButtonLabel', 'secondaryCtaLabel']
  for (const key of candidates) {
    if (typeof props[key] === 'string') return key
  }
  return candidates[0]
}

/* -------------------------------------------------------------------- media */

const RATIOS: Record<string, string> = {
  square: '1 / 1',
  landscape: '4 / 3',
  wide: '16 / 9',
  portrait: '3 / 4',
  tall: '4 / 5',
  ultrawide: '21 / 9',
}

export function Media({
  src,
  alt = '',
  ratio = 'landscape',
  className,
  style,
  zoom = false,
  children,
  edit,
  path,
}: {
  src?: unknown
  alt?: string
  ratio?: string
  className?: string
  style?: CSSProperties
  zoom?: boolean
  children?: ReactNode
  edit?: EditBinding
  path?: EditPath
}) {
  const url = str(src)
  return (
    <div
      className={cx('ud-media-box', zoom && 'ud-media-box--zoom', className)}
      style={{ aspectRatio: RATIOS[ratio] || ratio, ...style }}
    >
      {url ? <img src={url} alt={alt} loading="lazy" /> : null}
      {edit && path ? <EditableImage edit={edit} path={path} current={url} /> : null}
      {children}
    </div>
  )
}

export function Card({
  children,
  style,
  className,
  variant = 'solid',
  hover = true,
}: {
  children: ReactNode
  style?: CSSProperties
  className?: string
  variant?: 'solid' | 'flat' | 'outline' | 'featured'
  hover?: boolean
}) {
  return (
    <div
      className={cx(
        'ud-card',
        variant === 'flat' && 'ud-card--flat',
        variant === 'outline' && 'ud-card--outline',
        variant === 'featured' && 'ud-card--featured',
        hover && variant !== 'flat' && 'ud-card--hover',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  )
}

export function IconBadge({
  name,
  shape = 'rounded',
  size = 'md',
  solid = false,
  className,
}: {
  name?: unknown
  shape?: 'rounded' | 'round' | 'plain'
  size?: 'sm' | 'md' | 'lg'
  solid?: boolean
  className?: string
}) {
  return (
    <span
      className={cx(
        'ud-icon',
        shape === 'round' && 'ud-icon--round',
        shape === 'plain' && 'ud-icon--plain',
        size === 'sm' && 'ud-icon--sm',
        size === 'lg' && 'ud-icon--lg',
        solid && 'ud-icon--solid',
        className,
      )}
    >
      <Icon name={name} />
    </span>
  )
}

export function Stars({ count = 5 }: { count?: number }) {
  const total = Math.min(Math.max(Math.round(count), 0), 5)
  return (
    <span className="ud-stars" aria-label={`${total} out of 5`}>
      {Array.from({ length: total }).map((_, index) => (
        <Icon key={index} name="star" filled />
      ))}
    </span>
  )
}

export function Avatar({
  src,
  name,
  edit,
  path,
}: {
  src?: unknown
  name?: unknown
  edit?: EditBinding
  path?: EditPath
}) {
  const url = str(src)
  const label = str(name, '?')
  const face = url ? (
    <img className="ud-avatar" src={url} alt={label} loading="lazy" />
  ) : (
    <span className="ud-avatar">{label.slice(0, 1).toUpperCase()}</span>
  )
  if (!edit?.pickImage || !path) return face
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      {face}
      <EditableImage edit={edit} path={path} current={url} label={url ? 'Replace photo' : 'Add photo'} />
    </span>
  )
}

export function CheckList({
  values,
  icon = 'check',
  variant = 'plain',
  edit,
  path,
}: {
  values: string[]
  icon?: string
  variant?: 'plain' | 'pills'
  /** When bound, each line edits the newline-separated source prop. */
  edit?: EditBinding
  path?: EditPath
}) {
  if (!values.length && !edit) return null
  return (
    <ul className={cx('ud-list', variant === 'pills' && 'ud-list--pills')}>
      {values.map((value, index) => (
        <li key={`${value}-${index}`}>
          <Icon name={icon} />
          {edit && path ? (
            <EditableText
              edit={edit}
              path={path}
              value={value}
              as="span"
              placeholder="List item"
              transform={(text) => values.map((line, position) => (position === index ? text : line)).join('\n')}
            />
          ) : (
            <span>{value}</span>
          )}
        </li>
      ))}
    </ul>
  )
}

/**
 * Footer-style link column stored as one `Label|/url` per line. Each label is
 * inline editable and commits the whole newline block back, so the URLs and the
 * other lines survive the edit.
 */
export function LinkLines({
  value,
  edit,
  path,
  as = 'ul',
  className,
  linkClassName,
  linkStyle,
}: {
  value?: unknown
  edit?: EditBinding
  path?: EditPath
  as?: 'ul' | 'div'
  className?: string
  linkClassName?: string
  linkStyle?: CSSProperties
}) {
  const lines = String(typeof value === 'string' ? value : '')
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (!lines.length) return null
  const Wrapper = as
  const Item = as === 'ul' ? 'li' : 'div'
  return (
    <Wrapper className={className}>
      {lines.map((line, index) => {
        const [label, url] = line.split('|').map((part) => part.trim())
        const body =
          edit && path ? (
            <EditableText
              edit={edit}
              path={path}
              value={label}
              as="span"
              placeholder="Link label"
              transform={(text) =>
                lines
                  .map((entry, position) => {
                    if (position !== index) return entry
                    const target = entry.split('|')[1]
                    return target ? `${text}|${target.trim()}` : text
                  })
                  .join('\n')
              }
            />
          ) : (
            label
          )
        return (
          <Item key={`${line}-${index}`}>
            {url ? (
              <a href={url} className={linkClassName} style={linkStyle}>
                {body}
              </a>
            ) : (
              body
            )}
          </Item>
        )
      })}
    </Wrapper>
  )
}

/* --------------------------------------------------------------------- text */

export function SafeText({
  value,
  as: Tag = 'p',
  style,
  className,
  edit,
  path,
  placeholder,
  multiline,
}: {
  value?: unknown
  as?: 'p' | 'span' | 'div'
  style?: CSSProperties
  className?: string
  /** Builder binding; when present the text becomes inline editable. */
  edit?: EditBinding
  path?: EditPath
  placeholder?: string
  multiline?: boolean
}) {
  const text = typeof value === 'string' ? value : ''
  if (path) {
    return (
      <EditableText
        edit={edit}
        path={path}
        value={text}
        as={Tag}
        className={className}
        style={style}
        placeholder={placeholder}
        multiline={multiline ?? true}
        // Without a binding this is a published page, where `**bold**` must render
        // as markup rather than as literal asterisks.
        html={edit ? undefined : markdownBoldToHtml(text)}
      />
    )
  }
  if (!text) return null
  return <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: markdownBoldToHtml(text) }} />
}

export function SafeRich({
  html,
  style,
  className,
  edit,
  path,
}: {
  html?: unknown
  style?: CSSProperties
  className?: string
  edit?: EditBinding
  path?: EditPath
}) {
  const raw = typeof html === 'string' ? html : ''
  if (path) {
    return <EditableRich edit={edit} path={path} html={raw} className={cx('ud-prose', className)} style={style} />
  }
  return <div className={cx('ud-prose', className)} style={style} dangerouslySetInnerHTML={{ __html: sanitizeRichText(raw) }} />
}

/* ------------------------------------------------------- legacy prop helpers */

export function resolveCta(props: Props): { label: string; url: string } {
  const { primary } = ctaLinks(props)
  return primary ? { label: primary.label, url: primary.url } : { label: 'Get started', url: '#' }
}

export function resolveSub(props: Props): string {
  return str(props.description) || str(props.subheading)
}

export const defaultLinks = [
  { label: 'Home', url: '/' },
  { label: 'About', url: '/about' },
  { label: 'Services', url: '/services' },
  { label: 'Contact', url: '/contact' },
]

export const gridStyle = (columns: number, gap = 24): CSSProperties =>
  ({ '--ud-cols': String(columns), '--ud-gap': `${gap}px` }) as CSSProperties
