import type { Template } from '@uidesired/types'

export type TemplateSearchFields = Pick<Template, 'name' | 'slug' | 'description' | 'category'>

function haystack(template: TemplateSearchFields): string {
  return [template.name, template.slug, template.description, template.category?.name, template.category?.slug]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function templateMatchesQuery(template: TemplateSearchFields, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return haystack(template).includes(q)
}

export function blankTemplateMatches(query: string, category = 'all'): boolean {
  if (category !== 'all') return false
  const q = query.trim().toLowerCase()
  if (!q) return true
  return 'blank empty start canvas starter'.includes(q)
}

export function filterTemplates<T extends TemplateSearchFields>(
  templates: T[],
  query: string,
  category = 'all',
): T[] {
  return templates.filter((template) => {
    if (category !== 'all' && template.category?.name !== category) return false
    return templateMatchesQuery(template, query)
  })
}

export function templateCategoryNames(templates: TemplateSearchFields[]): string[] {
  const names = new Set<string>()
  for (const template of templates) {
    if (template.category?.name) names.add(template.category.name)
  }
  return [...names].sort((a, b) => a.localeCompare(b))
}
