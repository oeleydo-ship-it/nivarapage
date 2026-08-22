import type { BlockField } from '@uidesired/types'
import { BLOCK_CATEGORIES, TYPE_ALIASES, blockRegistry } from './registry'

/**
 * Machine-readable description of the block library.
 *
 * The API consumes a serialised copy of this (see `pnpm blocks:catalog`) so AI
 * prompts and AI output validation are derived from the real registry instead
 * of a hand-maintained list that drifts as blocks are added.
 */
export interface CatalogField {
  key: string
  type: BlockField['type']
  label: string
  group: string
  options?: string[]
  /** Child fields for `repeater` collections. */
  fields?: CatalogField[]
}

export interface CatalogBlock {
  type: string
  label: string
  category: string
  version: number
  defaultProps: Record<string, unknown>
  fields: CatalogField[]
}

export interface BlockCatalog {
  schemaVersion: 1
  categories: string[]
  aliases: Record<string, string>
  blocks: CatalogBlock[]
}

function toCatalogField(field: BlockField): CatalogField {
  const entry: CatalogField = {
    key: field.key,
    type: field.type,
    label: field.label,
    group: field.group || 'content',
  }
  if (field.options?.length) entry.options = field.options.map((option) => option.value)
  if (field.fields?.length) entry.fields = field.fields.map(toCatalogField)
  return entry
}

export function buildBlockCatalog(): BlockCatalog {
  return {
    schemaVersion: 1,
    categories: [...BLOCK_CATEGORIES],
    aliases: { ...TYPE_ALIASES },
    blocks: Object.values(blockRegistry).map((block) => ({
      type: block.type,
      label: block.label,
      category: block.category,
      version: block.version,
      defaultProps: JSON.parse(JSON.stringify(block.defaultProps)) as Record<string, unknown>,
      fields: block.schema.fields.map(toCatalogField),
    })),
  }
}
