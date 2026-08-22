/**
 * HTML sanitiser for stored rich text.
 *
 * Rich text reaches `dangerouslySetInnerHTML` in both the builder canvas and the
 * published site, so this runs on every render in Node (SSR) and the browser.
 * It tokenises the input and rebuilds it from an allow-list of tags, attributes,
 * URL schemes and CSS properties: anything not on a list is dropped rather than
 * pattern-matched away, because "strip the bad parts" regexes are bypassable
 * (`<img src=x/onerror=…>`, `jav&#97;script:`, `<scr<script>ipt>`).
 */

const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'del',
  'mark',
  'sub',
  'sup',
  'a',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'pre',
  'code',
  'hr',
  'img',
  'span',
  'div',
  'figure',
  'figcaption',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
  'colgroup',
  'col',
])

/** Tags whose *contents* are dropped with them, not unwrapped into text. */
const VOID_CONTENT_TAGS = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'noscript',
  'template',
  'svg',
  'math',
  'form',
  'textarea',
  'select',
  'title',
]

/** Tags that never get a closing tag. */
const VOID_TAGS = new Set(['br', 'hr', 'img', 'col'])

const GLOBAL_ATTRS = new Set(['class', 'title', 'dir', 'lang', 'id', 'style'])

const TAG_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel', 'name']),
  img: new Set(['src', 'alt', 'width', 'height', 'loading']),
  td: new Set(['colspan', 'rowspan', 'headers', 'scope']),
  th: new Set(['colspan', 'rowspan', 'headers', 'scope']),
  col: new Set(['span', 'width']),
  colgroup: new Set(['span']),
  ol: new Set(['start', 'type', 'reversed']),
  li: new Set(['value']),
  table: new Set(['summary']),
}

/** Inline styles TipTap writes (colour, highlight, alignment) stay; everything else goes. */
const ALLOWED_STYLE_PROPS = new Set([
  'color',
  'background-color',
  'text-align',
  'text-decoration',
  'text-transform',
  'font-style',
  'font-weight',
  'font-size',
  'font-family',
  'line-height',
  'letter-spacing',
  'margin-left',
  'padding-left',
  'width',
  'height',
])

const SAFE_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:', 'ftp:', 'sms:']

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  colon: ':',
  tab: '\t',
  newline: '\n',
  nbsp: ' ',
  sol: '/',
}

/**
 * Resolves an attribute value the way a browser would before deciding whether it
 * is safe: entities decoded, control characters and whitespace removed.
 */
function decodeForUrlCheck(value: string): string {
  const decoded = value.replace(/&(#[0-9]+|#[xX][0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);?/g, (match, body: string) => {
    if (body[0] === '#') {
      const code =
        body[1] === 'x' || body[1] === 'X' ? Number.parseInt(body.slice(2), 16) : Number.parseInt(body.slice(1), 10)
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ''
    }
    const named = NAMED_ENTITIES[body.toLowerCase()]
    return named === undefined ? match : named
  })
  return decoded.replace(/[\u0000-\u0020\u007f-\u00a0]/g, '').toLowerCase()
}

function isSafeUrl(value: string, allowDataImage: boolean): boolean {
  const probe = decodeForUrlCheck(value)
  if (!probe) return false
  // Relative paths, anchors and query-only links carry no scheme, so they are fine.
  const scheme = /^([a-z][a-z0-9+.-]*):/.exec(probe)
  if (!scheme) return true
  if (allowDataImage && /^data:image\/(png|jpeg|jpg|gif|webp|avif);base64,/.test(probe)) return true
  return SAFE_SCHEMES.includes(`${scheme[1]}:`)
}

function sanitizeStyle(value: string): string {
  const kept: string[] = []
  for (const rule of value.split(';')) {
    const index = rule.indexOf(':')
    if (index < 0) continue
    const prop = rule.slice(0, index).trim().toLowerCase()
    const raw = rule.slice(index + 1).trim()
    if (!ALLOWED_STYLE_PROPS.has(prop) || !raw) continue
    const probe = raw.toLowerCase()
    // `url()` loads remote content; `expression()` and escapes hide payloads from this check.
    if (probe.includes('url(') || probe.includes('expression') || probe.includes('\\') || probe.includes('/*')) continue
    kept.push(`${prop}:${raw.replace(/["<>]/g, '')}`)
  }
  return kept.join(';')
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const ATTR_PATTERN = /([a-zA-Z_:][-\w:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'`=<>]+)))?/g

function sanitizeAttrs(tag: string, source: string): string {
  const allowed = TAG_ATTRS[tag]
  const out: string[] = []
  let blankTarget = false
  ATTR_PATTERN.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = ATTR_PATTERN.exec(source))) {
    const name = match[1].toLowerCase()
    const value = match[2] ?? match[3] ?? match[4] ?? ''
    if (!GLOBAL_ATTRS.has(name) && !allowed?.has(name)) continue
    if (name === 'style') {
      const style = sanitizeStyle(value)
      if (style) out.push(`style="${escapeAttr(style)}"`)
      continue
    }
    if ((name === 'href' || name === 'src') && !isSafeUrl(value, tag === 'img')) continue
    if (name === 'target') {
      if (value !== '_blank') continue
      blankTarget = true
      out.push('target="_blank"')
      continue
    }
    // `rel` is re-added below only for the links that need it.
    if (name === 'rel' && tag === 'a') continue
    out.push(value ? `${name}="${escapeAttr(value)}"` : name)
  }
  // A `_blank` link without `noreferrer` hands `window.opener` to the target page.
  if (blankTarget) out.push('rel="noreferrer"')
  return out.length ? ` ${out.join(' ')}` : ''
}

function dropUnsafeBlocks(input: string): string {
  let output = input.replace(/<!--[\s\S]*?-->/g, '').replace(/<![\s\S]*?>/g, '')
  for (const tag of VOID_CONTENT_TAGS) {
    const withContent = new RegExp(`<${tag}\\b[\\s\\S]*?(?:</${tag}\\s*>|$)`, 'gi')
    const bare = new RegExp(`</?${tag}\\b[^>]*>`, 'gi')
    // Repeat until stable: one pass can splice a fresh tag back together.
    let previous: string
    do {
      previous = output
      output = output.replace(withContent, '').replace(bare, '')
    } while (output !== previous)
  }
  return output
}

/** Rebuilds `input` from the tag/attribute allow-list. Unknown tags are unwrapped. */
function sanitize(input: string): string {
  if (!input) return ''
  const source = dropUnsafeBlocks(input)
  const tagPattern = /<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g
  let out = ''
  let last = 0
  let match: RegExpExecArray | null
  while ((match = tagPattern.exec(source))) {
    // Text between tags keeps its own escaping, but a stray `<` must not open one.
    out += source.slice(last, match.index).replace(/</g, '&lt;')
    last = tagPattern.lastIndex
    const closing = match[1] === '/'
    const tag = match[2].toLowerCase()
    if (!ALLOWED_TAGS.has(tag)) continue
    if (closing) {
      if (!VOID_TAGS.has(tag)) out += `</${tag}>`
      continue
    }
    const attrs = sanitizeAttrs(tag, match[3] || '')
    out += VOID_TAGS.has(tag) ? `<${tag}${attrs} />` : `<${tag}${attrs}>`
  }
  return out + source.slice(last).replace(/</g, '&lt;')
}

/** Strips scripting from arbitrary HTML. */
export function sanitizeHtml(input: string): string {
  return sanitize(input)
}

/** Allow article HTML (headings, lists, images, tables) minus anything scriptable. */
export function sanitizeRichText(input: string): string {
  return sanitize(input)
}

export function markdownBoldToHtml(text: string): string {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}
