'use client'

import type { BlockProps, PageSection, ThemeTokens } from '@uidesired/types'
import { getBlock } from './registry'
import { ElementStyleProvider } from './editable'

export function UnknownBlock({ type }: { type: string }) {
  return (
    <div
      data-unknown-block={type}
      style={{
        margin: 16,
        padding: 16,
        border: '1px dashed #94a3b8',
        borderRadius: 8,
        color: '#64748b',
        fontFamily: 'system-ui, sans-serif',
        background: '#f8fafc',
      }}
    >
      Unknown block type: {type}
    </div>
  )
}

type RendererProps = {
  type?: string
  props?: BlockProps
  theme?: ThemeTokens
  siteName?: string
  section?: Pick<PageSection, 'type' | 'props'> & { hidden?: boolean; id?: string }
}

export function BlockRenderer({ type, props, theme, section }: RendererProps) {
  if (section?.hidden) return null
  const resolvedType = section?.type ?? type ?? 'unknown'
  const resolvedProps = section?.props ?? props ?? {}
  const def = getBlock(resolvedType)
  if (!def) return <UnknownBlock type={resolvedType} />
  const Cmp = def.component
  return (
    <ElementStyleProvider styles={resolvedProps.elementStyles}>
      <Cmp {...resolvedProps} theme={theme} />
    </ElementStyleProvider>
  )
}
