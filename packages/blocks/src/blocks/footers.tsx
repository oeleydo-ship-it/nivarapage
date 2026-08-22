import type { CSSProperties, ReactNode } from 'react'
import { EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Button,
  Heading,
  LinkLines,
  SafeText,
  animationOf,
  bool,
  cx,
  gridStyle,
  items,
  num,
  sectionVars,
  str,
  type Props,
  type Tone,
} from '../primitives'
import { bareSchema, field, gapField, icon, image, link, repeater, select, text, toggle, withoutFields } from '../schema'
import { defineBlock } from '../types'

const socialDefaults = [
  { icon: 'instagram', url: '#' },
  { icon: 'twitter', url: '#' },
  { icon: 'linkedin', url: '#' },
]

const columnDefaults = [
  { title: 'Product', links: 'Overview\nPricing\nTemplates\nChangelog' },
  { title: 'Company', links: 'About\nCareers\nContact' },
  { title: 'Legal', links: 'Privacy\nTerms\nCookies' },
]

const brandFields = [
  text('brand', 'Brand name'),
  image('logoImage', 'Logo image'),
  field('tagline', 'textarea', 'Tagline', 'content'),
  text('copyright', 'Copyright line'),
]

const socialRepeater = repeater('social', 'Social links', [icon('icon', 'Icon'), link('url', 'Link')], {
  itemLabel: 'Social link',
  itemDefaults: { icon: 'instagram', url: '#' },
})

const legalRepeater = repeater('legal', 'Legal links', [text('label', 'Label'), link('url', 'Link')], {
  itemLabel: 'Link',
  itemDefaults: { label: 'Privacy', url: '/privacy' },
})

const footerChrome = [
  select('tone', 'Color scheme', [['default', 'Light'], ['surface', 'Surface'], ['dark', 'Dark'], ['primary', 'Primary']], 'design'),
  field('backgroundColor', 'color', 'Background color', 'background'),
  toggle('showBorder', 'Top border', 'design'),
  field('paddingTop', 'spacing', 'Padding top', 'spacing', { min: 0, max: 200, unit: 'px' }),
  field('paddingBottom', 'spacing', 'Padding bottom', 'spacing', { min: 0, max: 200, unit: 'px' }),
]

function FooterShell({
  props,
  tone,
  children,
  compact,
}: {
  props: Props
  tone: Tone
  children: ReactNode
  compact?: boolean
}) {
  const resolvedTone = (str(props.tone, tone) as Tone) || tone
  const anim = animationOf(props)
  return (
    <footer
      className={cx('ud-section', anim.className)}
      style={{
        ...sectionVars(props, resolvedTone),
        ...anim.style,
        paddingBlock: compact ? 'var(--ud-pt, 40px) var(--ud-pb, 40px)' : 'var(--ud-pt, 64px) var(--ud-pb, 48px)',
        borderTop: bool(props.showBorder, true) ? '1px solid color-mix(in srgb, var(--ud-fg) 12%, transparent)' : undefined,
      } as CSSProperties}
      data-ud-anim={anim.trigger}
    >
      <div className="ud-container">{children}</div>
    </footer>
  )
}

function SocialRow({ props, align = 'flex-start' }: { props: Props; align?: string }) {
  const links = items(props.social, [])
  if (!links.length) return null
  return (
    <div className="ud-row" style={{ gap: 10, justifyContent: align }}>
      {links.map((item, index) => (
        <a
          key={index}
          href={str(item.url, '#')}
          aria-label={str(item.icon, 'social')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 38,
            height: 38,
            borderRadius: 999,
            color: 'inherit',
            border: '1px solid color-mix(in srgb, var(--ud-fg) 18%, transparent)',
          }}
        >
          <Icon name={str(item.icon, 'globe')} size={17} />
        </a>
      ))}
    </div>
  )
}

function LegalRow({ props }: { props: Props }) {
  const links = items(props.legal, [])
  if (!links.length) return null
  return (
    <div className="ud-row" style={{ gap: 18 }}>
      {links.map((item, index) => (
        <a key={index} href={str(item.url, '#')} className="ud-small" style={{ color: 'inherit', textDecoration: 'none' }}>
          <EditableText edit={editOf(props)} path={['legal', index, 'label']} value={str(item.label)} placeholder="Link" />
        </a>
      ))}
    </div>
  )
}

function Brand({ props, size = 'md' }: { props: Props; size?: 'md' | 'lg' }) {
  const logo = str(props.logoImage)
  if (logo) return <img src={logo} alt={str(props.brand, 'Logo')} style={{ height: size === 'lg' ? 36 : 28, width: 'auto' }} />
  return (
    <EditableText
      edit={editOf(props)}
      path={['brand']}
      value={str(props.brand, 'UiDesired')}
      as="strong"
      className={size === 'lg' ? 'ud-h3' : 'ud-h4'}
      style={{ display: 'block' }}
      placeholder="Brand"
    />
  )
}

/* ------------------------------------------------------------ footer.simple */

export const footerSimple = defineBlock({
  type: 'footer.simple',
  version: 1,
  category: 'footer',
  label: 'Simple footer',
  icon: 'PanelBottom',
  defaultProps: {
    brand: 'UiDesired',
    copyright: `© ${new Date().getFullYear()} UiDesired. All rights reserved.`,
    legal: [
      { label: 'Privacy', url: '/privacy' },
      { label: 'Terms', url: '/terms' },
    ],
    social: socialDefaults,
    showBorder: true,
  },
  // The compact bar has no room for a tagline.
  schema: bareSchema(...withoutFields(brandFields, 'tagline'), legalRepeater, socialRepeater, ...footerChrome),
  component: (props) => (
    <FooterShell props={props} tone="default" compact>
      <div className="ud-row ud-row--stack ud-between" style={{ gap: 18 }}>
        <div className="ud-row" style={{ gap: 16 }}>
          <Brand props={props} />
          <EditableText
            edit={editOf(props)}
            path={['copyright']}
            value={str(props.copyright, '© UiDesired')}
            as="span"
            className="ud-small"
            placeholder="© Your company"
          />
        </div>
        <div className="ud-row" style={{ gap: 20 }}>
          <LegalRow props={props} />
          <SocialRow props={props} />
        </div>
      </div>
    </FooterShell>
  ),
  settings: null,
})

/* ---------------------------------------------------------- footer.centered */

export const footerCentered = defineBlock({
  type: 'footer.centered',
  version: 1,
  category: 'footer',
  label: 'Centered footer',
  icon: 'Minus',
  defaultProps: {
    brand: 'UiDesired',
    tagline: 'Websites that look designed, not assembled.',
    copyright: `© ${new Date().getFullYear()} UiDesired`,
    links: [
      { label: 'Home', url: '/' },
      { label: 'Work', url: '/work' },
      { label: 'Pricing', url: '/pricing' },
      { label: 'Contact', url: '/contact' },
    ],
    social: socialDefaults,
    tone: 'surface',
    showBorder: false,
  },
  schema: bareSchema(
    ...brandFields,
    repeater('links', 'Links', [text('label', 'Label'), link('url', 'Link')], {
      itemLabel: 'Link',
      itemDefaults: { label: 'New link', url: '/' },
    }),
    socialRepeater,
    ...footerChrome,
  ),
  component: (props) => (
    <FooterShell props={props} tone="surface">
      <div style={{ textAlign: 'center', display: 'grid', gap: 18, justifyItems: 'center' }}>
        <Brand props={props} size="lg" />
        <SafeText
          value={props.tagline}
          className="ud-small"
          style={{ maxWidth: 520, margin: 0 }}
          edit={editOf(props)}
          path={['tagline']}
          placeholder="Tagline"
        />
        <div className="ud-row" style={{ justifyContent: 'center', gap: 22 }}>
          {items(props.links, []).map((item, index) => (
            <a key={index} href={str(item.url, '#')} className="ud-nav__link">
              <EditableText edit={editOf(props)} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
            </a>
          ))}
        </div>
        <SocialRow props={props} align="center" />
        <EditableText
          edit={editOf(props)}
          path={['copyright']}
          value={str(props.copyright)}
          as="span"
          className="ud-small"
          placeholder="© Your company"
        />
      </div>
    </FooterShell>
  ),
  settings: null,
})

/* ----------------------------------------------------- footer.multi_column */

export const footerMulti = defineBlock({
  type: 'footer.multi_column',
  version: 1,
  category: 'footer',
  label: 'Multi-column footer',
  icon: 'Columns3',
  defaultProps: {
    brand: 'UiDesired',
    tagline: 'The website builder for teams that care how things look.',
    copyright: `© ${new Date().getFullYear()} UiDesired. All rights reserved.`,
    columns: columnDefaults,
    social: socialDefaults,
    legal: [
      { label: 'Privacy', url: '/privacy' },
      { label: 'Terms', url: '/terms' },
    ],
    tone: 'dark',
    showNewsletter: true,
    newsletterTitle: 'Product updates',
    newsletterText: 'One short email each month. No noise.',
    columnCount: 3,
  },
  schema: bareSchema(
    ...brandFields,
    repeater('columns', 'Columns', [text('title', 'Title'), field('links', 'textarea', 'Links (one per line)', 'content', { help: 'Use "Label|/url" to set a destination.' })], {
      itemLabel: 'Column',
      itemDefaults: { title: 'New column', links: 'Link one\nLink two' },
    }),
    field('columnCount', 'slider', 'Column count', 'layout', { min: 2, max: 4 }),
    gapField,
    toggle('showNewsletter', 'Show newsletter note', 'content'),
    text('newsletterTitle', 'Newsletter title'),
    field('newsletterText', 'textarea', 'Newsletter text', 'content'),
    text('buttonLabel', 'Brand button label'),
    link('buttonUrl', 'Brand button link'),
    socialRepeater,
    legalRepeater,
    ...footerChrome,
  ),
  component: (props) => {
    const columns = items(props.columns, columnDefaults)
    return (
      <FooterShell props={props} tone="dark">
        <div
          className="ud-grid"
          style={{
            ...gridStyle(num(props.columnCount, 3) + 1, num(props.gap, 32)),
            gridTemplateColumns: `1.6fr repeat(${Math.max(columns.length, 1)}, minmax(0, 1fr))`,
          }}
        >
          <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
            <Brand props={props} size="lg" />
            <SafeText
              value={props.tagline}
              className="ud-small"
              style={{ maxWidth: 320, margin: 0 }}
              edit={editOf(props)}
              path={['tagline']}
              placeholder="Tagline"
            />
            {str(props.buttonLabel) ? (
              <div style={{ marginTop: 6 }}>
                <Button href={str(props.buttonUrl, '/contact')} variant="primary">
                  <EditableText
                    edit={editOf(props)}
                    path={['buttonLabel']}
                    value={str(props.buttonLabel)}
                    placeholder="Get started"
                  />
                </Button>
              </div>
            ) : null}
            <SocialRow props={props} />
          </div>
          {columns.map((column, index) => (
            <div key={index}>
              <EditableText
                edit={editOf(props)}
                path={['columns', index, 'title']}
                value={str(column.title, 'Links')}
                as="h4"
                className="ud-h4"
                style={{ fontSize: '.95rem', letterSpacing: '.02em' }}
                placeholder="Column title"
              />
              <LinkLines
                value={column.links}
                edit={editOf(props)}
                path={['columns', index, 'links']}
                as="div"
                className="ud-footer-links"
                linkClassName="ud-small"
                linkStyle={{ color: 'inherit', textDecoration: 'none' }}
              />
            </div>
          ))}
        </div>
        {bool(props.showNewsletter, false) ? (
          <div
            style={{
              marginTop: 40,
              paddingTop: 28,
              borderTop: '1px solid color-mix(in srgb, var(--ud-fg) 14%, transparent)',
              display: 'grid',
              gap: 6,
            }}
          >
            <EditableText
              edit={editOf(props)}
              path={['newsletterTitle']}
              value={str(props.newsletterTitle, 'Updates')}
              as="strong"
              placeholder="Newsletter title"
            />
            <SafeText
              value={props.newsletterText}
              className="ud-small"
              style={{ margin: 0 }}
              edit={editOf(props)}
              path={['newsletterText']}
              placeholder="One short email a month"
            />
          </div>
        ) : null}
        <div
          className="ud-row ud-row--stack ud-between"
          style={{ marginTop: 32, paddingTop: 22, borderTop: '1px solid color-mix(in srgb, var(--ud-fg) 14%, transparent)', gap: 14 }}
        >
          <EditableText
            edit={editOf(props)}
            path={['copyright']}
            value={str(props.copyright)}
            as="span"
            className="ud-small"
            placeholder="© Your company"
          />
          <LegalRow props={props} />
        </div>
      </FooterShell>
    )
  },
  settings: null,
})
