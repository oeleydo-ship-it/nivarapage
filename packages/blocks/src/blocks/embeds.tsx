/**
 * Generic embed blocks: paste-your-own HTML/CSS/JS and paste-a-URL iframe.
 *
 * Unlike rich text (which strips <script>/<iframe> in sanitize.ts because it
 * can carry a stranger's input), the `code` and `url` props here are content
 * the site owner deliberately pasted for their own page, the same trust level
 * as writing the page itself. Both categories are `content`, not tied to any
 * `*.family` kit, so they show up in every template's block palette.
 */
import { editOf } from '../editable'
import { SectionHead, SectionShell, bool, num, str } from '../primitives'
import { field, headingField, schema, slider, text, toggle } from '../schema'
import { defineBlock } from '../types'

/** Only http(s) reaches the `src` attribute — anything else (javascript:, data:, …) is dropped. */
function safeEmbedUrl(value: string): string | null {
  const trimmed = value.trim()
  return /^https?:\/\//i.test(trimmed) ? trimmed : null
}

/* ------------------------------------------------------------ embed.custom */

export const embedCustomCode = defineBlock({
  type: 'embed.custom',
  version: 1,
  category: 'content',
  label: 'Custom code embed',
  icon: 'Code',
  defaultProps: {
    heading: '',
    code: '',
    height: 400,
  },
  schema: schema(
    headingField,
    field('code', 'textarea', 'HTML, CSS & JavaScript', 'content', {
      help: 'Paste a widget snippet, booking script, chat embed or your own markup. It runs inside a sandboxed frame, isolated from the rest of the page and from visitor cookies.',
    }),
    slider('height', 'Height', 160, 1400, 'layout', { unit: 'px' }),
  ),
  component: function EmbedCustomCode(props) {
    const edit = editOf(props)
    const code = str(props.code)
    const height = Math.min(Math.max(num(props.height, 400), 100), 2000)
    return (
      <SectionShell props={props} tone="default">
        {str(props.heading) || edit ? <SectionHead props={props} /> : null}
        {code ? (
          <iframe
            className="ud-embed-frame"
            style={{ height }}
            // No `allow-same-origin`: the pasted code cannot read this site's
            // cookies, localStorage or reach into the parent page's DOM.
            sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals"
            srcDoc={code}
            title={str(props.heading, 'Embedded content')}
            loading="lazy"
          />
        ) : (
          <div className="ud-embed-placeholder" style={{ height }}>
            Paste HTML, CSS or JavaScript in the panel to fill this space.
          </div>
        )}
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------ embed.iframe */

export const embedIframe = defineBlock({
  type: 'embed.iframe',
  version: 1,
  category: 'content',
  label: 'Embed (iframe)',
  icon: 'Globe',
  defaultProps: {
    heading: '',
    url: '',
    title: '',
    height: 480,
    allowFullscreen: true,
    lazy: true,
  },
  schema: schema(
    headingField,
    field('url', 'text', 'Embed URL', 'content', {
      help: 'A calendar, map, form, dashboard or video page to embed. Must start with https:// or http://.',
    }),
    text('title', 'Accessible title', { help: 'Read by screen readers; describe what the embed shows.' }),
    slider('height', 'Height', 160, 1400, 'layout', { unit: 'px' }),
    toggle('allowFullscreen', 'Allow fullscreen', 'layout'),
    toggle('lazy', 'Lazy load', 'layout'),
  ),
  component: function EmbedIframe(props) {
    const edit = editOf(props)
    const src = safeEmbedUrl(str(props.url))
    const height = Math.min(Math.max(num(props.height, 480), 100), 2000)
    return (
      <SectionShell props={props} tone="default">
        {str(props.heading) || edit ? <SectionHead props={props} /> : null}
        {src ? (
          <iframe
            className="ud-embed-frame"
            style={{ height }}
            src={src}
            title={str(props.title) || str(props.heading, 'Embedded content')}
            loading={bool(props.lazy, true) ? 'lazy' : 'eager'}
            allowFullScreen={bool(props.allowFullscreen, true)}
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="ud-embed-placeholder" style={{ height }}>
            Paste an https:// URL in the panel to fill this space.
          </div>
        )}
      </SectionShell>
    )
  },
  settings: null,
})
