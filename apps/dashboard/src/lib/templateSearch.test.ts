import { describe, expect, it } from 'vitest'
import {
  blankTemplateMatches,
  filterTemplates,
  templateCategoryNames,
  templateMatchesQuery,
} from './templateSearch'

const aiTool = {
  name: 'AI Tool',
  slug: 'aitool',
  description: 'A dark OpenAI + Next.js SaaS kit',
  category: { id: 1, name: 'SaaS', slug: 'saas' },
}

const barber = {
  name: 'Barber',
  slug: 'barber',
  description: 'Cuts, beard work, and walk-ins',
  category: { id: 2, name: 'Barber', slug: 'barber' },
}

describe('template search', () => {
  it('matches name, slug, description, and category', () => {
    expect(templateMatchesQuery(aiTool, '')).toBe(true)
    expect(templateMatchesQuery(aiTool, 'ai tool')).toBe(true)
    expect(templateMatchesQuery(aiTool, 'AITOOL')).toBe(true)
    expect(templateMatchesQuery(aiTool, 'saas')).toBe(true)
    expect(templateMatchesQuery(aiTool, 'navy')).toBe(false)
  })

  it('filters by query and category together', () => {
    const templates = [aiTool, barber]
    expect(filterTemplates(templates, 'ai', 'all')).toEqual([aiTool])
    expect(filterTemplates(templates, '', 'SaaS')).toEqual([aiTool])
    expect(filterTemplates(templates, 'barber', 'SaaS')).toEqual([])
  })

  it('shows the blank canvas unless a category is selected or the query is unrelated', () => {
    expect(blankTemplateMatches('')).toBe(true)
    expect(blankTemplateMatches('blank')).toBe(true)
    expect(blankTemplateMatches('start')).toBe(true)
    expect(blankTemplateMatches('ai tool')).toBe(false)
    expect(blankTemplateMatches('', 'SaaS')).toBe(false)
  })

  it('lists unique category names', () => {
    expect(templateCategoryNames([aiTool, barber, aiTool])).toEqual(['Barber', 'SaaS'])
  })
})
