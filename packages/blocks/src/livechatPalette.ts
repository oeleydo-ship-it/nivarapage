/**
 * Colour maths for the livechat widget.
 *
 * The widget is themed from three author-chosen colours (accent, surface,
 * text). Everything else - borders, muted copy, field fills, the ink that sits
 * on a coloured bubble - is derived here, so a light surface stays readable
 * without the author having to supply a second palette.
 *
 * The standalone embed script in `PublicLivechatController` carries a parallel
 * implementation in plain JS, because it must run with no bundle at all. Keep
 * the two in step.
 */

export type LivechatPaletteInput = {
  primary_color?: string | null
  theme?: string | null
  surface_color?: string | null
  text_color?: string | null
  bubble_color?: string | null
}

export type LivechatPalette = Record<string, string>

export function hexToRgb(hex: string): [number, number, number] {
  let value = (hex || '').replace('#', '').trim()
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('')
  }
  if (value.length === 8) value = value.slice(0, 6)
  const int = Number.parseInt(value, 16)
  if (value.length !== 6 || !Number.isFinite(int)) return [24, 24, 27]
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

function toHex(rgb: [number, number, number]): string {
  return (
    '#' +
    rgb
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
      .join('')
  )
}

/** Blends `to` into `from` by `amount` (0-1). */
export function mixHex(from: string, to: string, amount: number): string {
  const a = hexToRgb(from)
  const b = hexToRgb(to)
  return toHex([0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * amount) as [number, number, number])
}

export function alphaHex(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

/** Relative luminance, used to pick legible ink on a coloured fill. */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Black or white, whichever reads better on `hex`. */
export function inkOn(hex: string): string {
  return luminance(hex) > 0.5 ? '#111827' : '#ffffff'
}

export const LIVECHAT_DEFAULTS = {
  accent: '#6366f1',
  darkSurface: '#18181b',
  lightSurface: '#ffffff',
  darkText: '#fafafa',
  lightText: '#18181b',
} as const

/**
 * Turns a widget's saved colours into the CSS custom properties the panel
 * reads. `prefersDark` is only consulted when the theme is left on `auto`.
 */
export function livechatPalette(config: LivechatPaletteInput, prefersDark = true): LivechatPalette {
  const requested = config.theme === 'light' || config.theme === 'dark' ? config.theme : null
  const dark = requested ? requested === 'dark' : prefersDark
  const accent = config.primary_color || LIVECHAT_DEFAULTS.accent
  const surface = config.surface_color || (dark ? LIVECHAT_DEFAULTS.darkSurface : LIVECHAT_DEFAULTS.lightSurface)
  const text = config.text_color || (dark ? LIVECHAT_DEFAULTS.darkText : LIVECHAT_DEFAULTS.lightText)
  const bubble = config.bubble_color || mixHex(surface, text, 0.09)

  return {
    '--ud-lc-accent': accent,
    '--ud-lc-on-accent': inkOn(accent),
    '--ud-lc-surface': surface,
    '--ud-lc-surface-2': mixHex(surface, dark ? '#000000' : '#ffffff', 0.4),
    '--ud-lc-text': text,
    '--ud-lc-muted': mixHex(surface, text, 0.62),
    '--ud-lc-line': alphaHex(text, dark ? 0.12 : 0.14),
    '--ud-lc-soft': alphaHex(text, dark ? 0.06 : 0.05),
    '--ud-lc-field': mixHex(surface, dark ? '#000000' : text, dark ? 0.45 : 0.05),
    '--ud-lc-bubble': bubble,
    '--ud-lc-on-bubble': inkOn(bubble),
    '--ud-lc-shadow': alphaHex(dark ? '#000000' : mixHex(text, '#000000', 0.2), dark ? 0.55 : 0.22),
    '--ud-lc-fab-2': mixHex(accent, '#000000', 0.45),
  }
}
