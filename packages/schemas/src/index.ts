import { z } from 'zod'

export const blockFieldTypeSchema = z.enum([
  'text',
  'textarea',
  'richtext',
  'image',
  'color',
  'select',
  'toggle',
  'number',
  'slider',
  'spacing',
  'link',
  'icon',
  'alignment',
  'background',
])

export const blockFieldGroupSchema = z.enum([
  'content',
  'design',
  'layout',
  'spacing',
  'typography',
  'background',
])

export const blockFieldSchema = z.object({
  key: z.string(),
  type: blockFieldTypeSchema,
  label: z.string(),
  group: blockFieldGroupSchema.optional(),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
})

export const blockSettingsSchema = z.object({
  fields: z.array(blockFieldSchema),
})

export const pageSectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  version: z.number().default(1),
  hidden: z.boolean().default(false),
  props: z.record(z.any()).default({}),
})

export const pageContentSchema = z.object({
  schemaVersion: z.literal(1),
  sections: z.array(pageSectionSchema),
})

export type PageContentInput = z.infer<typeof pageContentSchema>
export type PageSectionInput = z.infer<typeof pageSectionSchema>
