import type { ThemeTokens } from '@uidesired/types'

const TOKEN_TO_CSS: Record<string, string> = {
  primary: '--color-primary',
  secondary: '--color-secondary',
  accent: '--color-accent',
  background: '--color-background',
  surface: '--color-surface',
  text: '--color-text',
  muted: '--color-muted',
  headingFont: '--font-heading',
  bodyFont: '--font-body',
  buttonRadius: '--radius-button',
  cardRadius: '--radius-card',
  containerWidth: '--container-width',
  sectionSpacing: '--section-spacing',
}

export function themeToCssVars(tokens?: Partial<ThemeTokens> | null): Record<string, string> {
  const vars: Record<string, string> = {}
  if (!tokens) return vars
  for (const [key, value] of Object.entries(tokens)) {
    const cssKey = TOKEN_TO_CSS[key]
    if (cssKey && value !== undefined && value !== null) {
      if ((key === 'headingFont' || key === 'bodyFont') && typeof value === 'string') {
        vars[cssKey] = quoteFontFamily(value)
      } else {
        vars[cssKey] = String(value)
      }
    }
  }
  if (tokens.headingWeight) vars['--font-heading-weight'] = String(tokens.headingWeight)
  if (tokens.bodyWeight) vars['--font-body-weight'] = String(tokens.bodyWeight)
  return vars
}

function quoteFontFamily(stack: string): string {
  return stack
    .split(',')
    .map((part) => part.replace(/["']/g, '').trim())
    .filter(Boolean)
    .map((name) => {
      if (/^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-sans-serif|ui-serif|ui-monospace|inherit)$/i.test(name)) {
        return name
      }
      return /[^A-Za-z0-9-]/.test(name) ? `"${name}"` : name
    })
    .join(', ')
}

export const defaultThemeTokens: ThemeTokens = {
  primary: '#2563eb',
  secondary: '#0f172a',
  accent: '#f59e0b',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#0f172a',
  muted: '#64748b',
  headingFont: 'Inter, system-ui, sans-serif',
  bodyFont: 'Inter, system-ui, sans-serif',
  monoFont: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  serifFont: 'Georgia, serif',
  headingWeight: 700,
  bodyWeight: 400,
  buttonRadius: '8px',
  cardRadius: '12px',
  containerWidth: '1120px',
  sectionSpacing: '80px',
}
