import { describe, expect, it } from 'vitest'
import {
  mergeResponsiveProps,
  patchResponsiveElementStyle,
  patchResponsiveProps,
  responsiveSectionCss,
} from '@uidesired/blocks'

const desktop = {
  heading: 'Warm homes,',
  headingSize: 90,
  elementStyles: { heading: { fontSize: 90, color: '#111' } },
}

describe('responsive device styles', () => {
  it('keeps mobile font-size off the desktop and tablet views', () => {
    let props: Record<string, unknown> = { ...desktop }
    props = { ...props, ...patchResponsiveProps(props, 'mobile', { headingSize: 32 }) }
    props = {
      ...props,
      ...patchResponsiveElementStyle(props, 'mobile', ['heading'], { fontSize: 32, color: '#111' }),
    }

    expect(props.headingSize).toBe(90)
    expect((props.elementStyles as { heading: { fontSize: number } }).heading.fontSize).toBe(90)
    expect(mergeResponsiveProps(props, 'desktop').headingSize).toBe(90)
    expect((mergeResponsiveProps(props, 'desktop').elementStyles as { heading: { fontSize: number } }).heading.fontSize).toBe(90)
    expect(mergeResponsiveProps(props, 'tablet').headingSize).toBe(90)
    expect(mergeResponsiveProps(props, 'mobile').headingSize).toBe(32)
    expect((mergeResponsiveProps(props, 'mobile').elementStyles as { heading: { fontSize: number } }).heading.fontSize).toBe(32)
  })

  it('emits published CSS that only applies under the mobile breakpoint', () => {
    const css = responsiveSectionCss('hero-1', {
      ...desktop,
      responsive: { mobile: { headingSize: 32, elementStyles: { heading: { fontSize: 32 } } } },
    })
    expect(css).toContain('@media (max-width:480px)')
    expect(css).toContain('--ud-heading-size:32px')
    expect(css).toContain('[data-ud-style="heading"]')
    expect(css).toContain('font-size:32px')
    expect(css).not.toContain('@media (max-width:768px)')
  })
})
