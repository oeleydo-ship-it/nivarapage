import { describe, expect, it } from 'vitest'
import { activeTemplateKit, templateKitFor } from './components/BlockPalette'

describe('block palette kit filter', () => {
  it('treats Tessera blocks as their own kit', () => {
    expect(templateKitFor('compare.tessera')?.id).toBe('tessera')
    expect(templateKitFor('navbar.tessera')?.id).toBe('tessera')
  })

  it('picks the kit already on the page and ignores other ready templates', () => {
    const kit = activeTemplateKit(['navbar.tessera', 'compare.tessera', 'hero.tessera', 'navbar.lumen'])
    expect(kit?.id).toBe('tessera')
  })

  it('has no ready-template kit on a generic page', () => {
    expect(activeTemplateKit(['hero.centered', 'footer.simple'])).toBeUndefined()
  })
})
