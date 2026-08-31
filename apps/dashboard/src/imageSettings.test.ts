import { describe, expect, it } from 'vitest'
import { imageSettings } from '@uidesired/blocks'

describe('block image settings', () => {
  it('emits nothing at all for a block nobody has touched', () => {
    // The whole feature hangs off these attributes, so an empty result is what
    // guarantees an existing site keeps rendering exactly as its template wrote it.
    const { vars, attrs } = imageSettings({})

    expect(attrs).toEqual({})
    expect(vars).toEqual({})
  })

  it('leaves the other groups alone when only one is used', () => {
    const { vars, attrs } = imageSettings({ imageRadius: 16 })

    expect(Object.keys(attrs)).toEqual(['data-img-edge'])
    expect(vars['--ud-img-radius']).toBe('16px')
    expect(vars['--ud-img-fit']).toBeUndefined()
    expect(vars['--ud-img-filter']).toBeUndefined()
  })

  it('implies cover when a focal point is chosen', () => {
    // Positioning only means anything once the picture is cropped.
    const { vars, attrs } = imageSettings({ imageFocusX: 20, imageFocusY: 80 })

    expect(attrs).toHaveProperty('data-img-fit')
    expect(vars['--ud-img-fit']).toBe('cover')
    expect(vars['--ud-img-pos']).toBe('20% 80%')
  })

  it('builds one filter chain and tints with an inset shadow', () => {
    const { vars, attrs } = imageSettings({
      imageGrayscale: 100,
      imageBlur: 4,
      imageTintColor: '#ff0000',
      imageTintOpacity: 40,
    })

    expect(attrs).toHaveProperty('data-img-fx')
    expect(vars['--ud-img-filter']).toBe('grayscale(100%) blur(4px)')
    // A replaced element cannot take a pseudo-element, so the tint is painted
    // by an inset shadow large enough to cover the box.
    expect(vars['--ud-img-tint']).toContain('inset 0 0 0 9999px')
    expect(vars['--ud-img-tint']).toContain('#ff0000 40%')
  })

  it('clamps values that would otherwise produce nonsense css', () => {
    const { vars } = imageSettings({ imageFocusX: 999, imageFocusY: -50, imageRadius: -8 })

    expect(vars['--ud-img-pos']).toBe('100% 0%')
    expect(vars['--ud-img-radius']).toBe('0px')
  })

  it('keeps aspect ratio and height in their own group', () => {
    const { vars, attrs } = imageSettings({ imageAspect: '16 / 9', imageMaxHeight: 420 })

    expect(Object.keys(attrs)).toEqual(['data-img-box'])
    expect(vars['--ud-img-aspect']).toBe('16 / 9')
    expect(vars['--ud-img-max-h']).toBe('420px')
  })
})
