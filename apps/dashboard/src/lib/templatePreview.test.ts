import { describe, expect, it } from 'vitest'
import { isTemplateInternalPath, templatePreviewPath } from './templatePreview'

describe('templatePreviewPath', () => {
  it('builds a homepage preview URL from the slug', () => {
    expect(templatePreviewPath('chatdeck')).toBe('/templates/chatdeck/preview')
    expect(templatePreviewPath('avivo', 'home')).toBe('/templates/avivo/preview')
    expect(templatePreviewPath('avivo', 'about')).toBe('/templates/avivo/preview/about')
  })

  it('treats site-relative links as in-preview navigation', () => {
    expect(isTemplateInternalPath('/features')).toBe(true)
    expect(isTemplateInternalPath('https://example.com')).toBe(false)
    expect(isTemplateInternalPath('#demo')).toBe(false)
  })
})
