import { describe, expect, it } from 'vitest'
import { hexToRgb, inkOn, livechatPalette, mixHex } from '@uidesired/blocks'

describe('colour primitives', () => {
  it('expands shorthand hex', () => {
    expect(hexToRgb('#fff')).toEqual([255, 255, 255])
    expect(hexToRgb('#2563eb')).toEqual([37, 99, 235])
  })

  it('ignores an alpha channel', () => {
    expect(hexToRgb('#2563eb80')).toEqual([37, 99, 235])
  })

  it('falls back rather than throwing on junk', () => {
    expect(hexToRgb('not-a-colour')).toEqual([24, 24, 27])
    expect(hexToRgb('')).toEqual([24, 24, 27])
  })

  it('blends towards the target', () => {
    expect(mixHex('#000000', '#ffffff', 0)).toBe('#000000')
    expect(mixHex('#000000', '#ffffff', 1)).toBe('#ffffff')
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('#808080')
  })

  it('picks ink that can be read on the fill', () => {
    expect(inkOn('#ffffff')).toBe('#111827')
    expect(inkOn('#f5d90a')).toBe('#111827')
    expect(inkOn('#18181b')).toBe('#ffffff')
    expect(inkOn('#2563eb')).toBe('#ffffff')
  })
})

describe('livechat palette', () => {
  it('uses the accent the author picked', () => {
    const palette = livechatPalette({ primary_color: '#16a34a' })
    expect(palette['--ud-lc-accent']).toBe('#16a34a')
  })

  it('defaults to a dark panel', () => {
    const palette = livechatPalette({})
    expect(palette['--ud-lc-surface']).toBe('#18181b')
    expect(palette['--ud-lc-text']).toBe('#fafafa')
  })

  it('flips the defaults for a light theme', () => {
    const palette = livechatPalette({ theme: 'light' })
    expect(palette['--ud-lc-surface']).toBe('#ffffff')
    expect(palette['--ud-lc-text']).toBe('#18181b')
  })

  it('follows the device only when the theme is auto', () => {
    expect(livechatPalette({ theme: 'auto' }, false)['--ud-lc-surface']).toBe('#ffffff')
    expect(livechatPalette({ theme: 'auto' }, true)['--ud-lc-surface']).toBe('#18181b')
    // An explicit theme wins over the device preference.
    expect(livechatPalette({ theme: 'dark' }, false)['--ud-lc-surface']).toBe('#18181b')
  })

  it('lets explicit colours override the theme', () => {
    const palette = livechatPalette({ theme: 'dark', surface_color: '#0f1c14', text_color: '#ecfdf5' })
    expect(palette['--ud-lc-surface']).toBe('#0f1c14')
    expect(palette['--ud-lc-text']).toBe('#ecfdf5')
  })

  it('derives the agent bubble from the panel when none is given', () => {
    const palette = livechatPalette({ theme: 'light' })
    expect(palette['--ud-lc-bubble']).toBe(mixHex('#ffffff', '#18181b', 0.09))
  })

  it('keeps bubble text legible on a custom bubble colour', () => {
    expect(livechatPalette({ bubble_color: '#ffffff' })['--ud-lc-on-bubble']).toBe('#111827')
    expect(livechatPalette({ bubble_color: '#111111' })['--ud-lc-on-bubble']).toBe('#ffffff')
  })

  it('keeps accent text legible on a pale accent', () => {
    expect(livechatPalette({ primary_color: '#fde047' })['--ud-lc-on-accent']).toBe('#111827')
  })

  it('emits every variable the widget stylesheet reads', () => {
    const palette = livechatPalette({ primary_color: '#2563eb' })
    for (const key of [
      '--ud-lc-accent',
      '--ud-lc-on-accent',
      '--ud-lc-surface',
      '--ud-lc-surface-2',
      '--ud-lc-text',
      '--ud-lc-muted',
      '--ud-lc-line',
      '--ud-lc-soft',
      '--ud-lc-field',
      '--ud-lc-bubble',
      '--ud-lc-on-bubble',
      '--ud-lc-shadow',
      '--ud-lc-fab-2',
    ]) {
      expect(palette[key], key).toBeTruthy()
    }
  })
})
