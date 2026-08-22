import type { BlockCategory, BlockProps, BlockSchema, ThemeTokens } from '@uidesired/types'
import type { ComponentType, ReactNode } from 'react'

export interface BlockDefinition {
  type: string
  version: number
  category: BlockCategory
  label: string
  icon: string
  thumbnail?: string
  defaultProps: BlockProps
  schema: BlockSchema
  component: ComponentType<BlockProps & { theme?: ThemeTokens }>
  settings?: ComponentType<{ props: BlockProps; onChange: (props: BlockProps) => void }> | null
}

export function defineBlock(def: BlockDefinition): BlockDefinition {
  return def
}

export function EmptySettings(): ReactNode {
  return null
}
