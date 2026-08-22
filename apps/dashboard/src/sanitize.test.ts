import { describe, expect, it } from 'vitest'
import { sanitizeHtml, sanitizeRichText } from '@uidesired/blocks'

/**
 * Rich text is stored per block and rendered through `dangerouslySetInnerHTML`
 * on the published site, so every case here is a payload that used to survive
 * the old regex-based stripping.
 */
describe('sanitizeRichText', () => {
  it('keeps the formatting TipTap produces', () => {
    const html =
      '<h2>Title</h2><p><strong>Bold</strong> and <em>italic</em> and <a href="/pricing">a link</a>.</p><ul><li>One</li></ul>'
    expect(sanitizeRichText(html)).toContain('<strong>Bold</strong>')
    expect(sanitizeRichText(html)).toContain('<a href="/pricing">')
    expect(sanitizeRichText(html)).toContain('<li>One</li>')
  })

  it('keeps colour and alignment styles but drops the rest', () => {
    const out = sanitizeRichText('<p style="color:#ff0000;text-align:center;position:fixed;inset:0">hi</p>')
    expect(out).toContain('color:#ff0000')
    expect(out).toContain('text-align:center')
    expect(out).not.toContain('position')
    expect(out).not.toContain('inset')
  })

  it('drops event handlers however they are attached', () => {
    // A slash after a quoted value ends it, so `onerror` here is a real attribute.
    expect(sanitizeRichText('<img src="x"/onerror=alert(1)>')).toBe('<img src="x" />')
    expect(sanitizeRichText('<img src=x onerror=alert(1)>')).toBe('<img src="x" />')
    expect(sanitizeRichText('<img src="x" onerror="alert(1)">')).toBe('<img src="x" />')
    expect(sanitizeRichText('<a href="#" onmouseover=alert(1)>x</a>')).toBe('<a href="#">x</a>')
    expect(sanitizeRichText('<div onclick=alert(1)>x</div>')).toBe('<div>x</div>')
  })

  it('rejects script URLs however they are encoded', () => {
    for (const href of ['javascript:alert(1)', 'jav&#97;script:alert(1)', 'JaVaScRiPt:alert(1)', 'java\tscript:alert(1)']) {
      const out = sanitizeRichText(`<a href="${href}">x</a>`)
      expect(out, href).not.toContain('href=')
    }
    expect(sanitizeRichText('<a href="/safe">x</a>')).toContain('href="/safe"')
  })

  it('does not let a split tag reassemble into a script', () => {
    const out = sanitizeHtml('<scr<script>ipt>alert(1)</scr</script>ipt>')
    expect(out).not.toContain('<script')
    expect(out).not.toContain('<scr')
  })

  it('drops disallowed elements along with their contents', () => {
    expect(sanitizeRichText('<p>before</p><iframe src="https://evil.test"></iframe><p>after</p>')).toBe(
      '<p>before</p><p>after</p>',
    )
    expect(sanitizeRichText('<svg><script>alert(1)</script></svg>')).toBe('')
  })

  it('adds noreferrer to links that open a new tab', () => {
    expect(sanitizeRichText('<a href="https://x.test" target="_blank">x</a>')).toContain('rel="noreferrer"')
  })

  it('allows uploaded images but not data URLs that can carry markup', () => {
    expect(sanitizeRichText('<img src="/storage/a.png" alt="A">')).toContain('src="/storage/a.png"')
    expect(sanitizeRichText('<img src="data:image/svg+xml;base64,PHN2Zz4=">')).not.toContain('src=')
  })
})
