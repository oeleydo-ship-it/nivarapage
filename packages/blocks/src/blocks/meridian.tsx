/**
 * Meridian — a developer-infrastructure / fintech platform template.
 *
 * Visual language: near-white pages, two-tone headlines that fade from black to
 * grey on the second line, pastel gradient-mesh panels behind product imagery,
 * a lavender band for company pages, an inkwell-dark band for enterprise
 * sections, hairline cards on a faint lilac tint, and pill buttons in solid
 * black beside a white outline.
 *
 * Everything routes through `schema()`, which appends the shared design /
 * typography / background / spacing / content-width controls, so every block is
 * editable on the canvas and in the side panel, can be narrowed or widened, and
 * is reusable on any page.
 */
import type { CSSProperties, ReactNode } from 'react'
import { Fragment, useState } from 'react'
import { EditableImage, EditableRich, EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Media,
  SafeText,
  SectionShell,
  animationOf,
  bool,
  cx,
  items,
  lines,
  num,
  sectionVars,
  str,
  type Props,
} from '../primitives'
import { PublicForm } from '../public-form'
import {
  descriptionField,
  eyebrowField,
  field,
  headingField,
  icon,
  image,
  link,
  navLinksField,
  repeater,
  schema,
  select,
  stickyField,
  text,
  textarea,
  toggle,
} from '../schema'
import { NavItem, Submenu, SubmenuCaret, hasSubmenu } from '../submenu'
import { defineBlock } from '../types'

/* ------------------------------------------------------------------ helpers */

/**
 * The signature headline: a black first line with a grey second line under it.
 * `headingAlt` is optional so the same component serves plain headings.
 */
function TwoTone({
  props,
  as = 'h2',
  className,
}: {
  props: Props
  as?: 'h1' | 'h2' | 'h3'
  className?: string
}) {
  const edit = editOf(props)
  const heading = str(props.heading)
  const alt = str(props.headingAlt)
  if (!heading && !alt && !edit) return null
  const Tag = as
  return (
    <Tag className={cx('ud-md-title', as === 'h1' && 'ud-md-title--xl', className)}>
      {heading || edit ? (
        <EditableText edit={edit} path={['heading']} value={heading} as="span" className="ud-md-title__a" placeholder="Headline" />
      ) : null}
      {alt || edit ? (
        <EditableText edit={edit} path={['headingAlt']} value={alt} as="span" className="ud-md-title__b" placeholder="Second line" />
      ) : null}
    </Tag>
  )
}

const twoToneFields = [headingField, text('headingAlt', 'Heading second line')]

/** Small uppercase kicker above a heading. */
function Eyebrow({ props }: { props: Props }) {
  const edit = editOf(props)
  const value = str(props.eyebrow)
  if (!value && !edit) return null
  return <EditableText edit={edit} path={['eyebrow']} value={value} as="p" className="ud-md-eyebrow" placeholder="Label" />
}

/** Section head: eyebrow, two-tone heading, lead paragraph. */
function Head({ props, as = 'h2', align = 'center' }: { props: Props; as?: 'h1' | 'h2'; align?: 'left' | 'center' }) {
  const edit = editOf(props)
  const description = str(props.description)
  if (!edit && !str(props.heading) && !str(props.headingAlt) && !description && !str(props.eyebrow)) return null
  return (
    <div className={cx('ud-md-head', align === 'center' && 'ud-md-head--center')}>
      <Eyebrow props={props} />
      <TwoTone props={props} as={as} />
      {description || edit ? (
        <SafeText value={description} className="ud-md-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
      ) : null}
    </div>
  )
}

/** Pill button: solid black, white outline, or white-on-dark. */
function MdButton({
  href,
  children,
  variant = 'dark',
}: {
  href: string
  children: ReactNode
  variant?: 'dark' | 'outline' | 'light'
}) {
  return (
    <a className={cx('ud-md-btn', `ud-md-btn--${variant}`)} href={href || '#'}>
      {children}
    </a>
  )
}

function Buttons({ props, primary = 'dark' }: { props: Props; primary?: 'dark' | 'light' }) {
  const edit = editOf(props)
  const a = str(props.buttonLabel)
  const b = str(props.secondaryLabel)
  if (!a && !b && !edit) return null
  return (
    <div className="ud-md-buttons">
      {a || edit ? (
        <MdButton href={str(props.buttonUrl, '#')} variant={primary}>
          <EditableText edit={edit} path={['buttonLabel']} value={a} as="span" placeholder="Get started" />
        </MdButton>
      ) : null}
      {b || edit ? (
        <MdButton href={str(props.secondaryUrl, '#')} variant="outline">
          <EditableText edit={edit} path={['secondaryLabel']} value={b} as="span" placeholder="Contact sales" />
        </MdButton>
      ) : null}
    </div>
  )
}

const buttonFields = [
  text('buttonLabel', 'Button label'),
  link('buttonUrl', 'Button link'),
  text('secondaryLabel', 'Second button label'),
  link('secondaryUrl', 'Second button link'),
]

/** Brand wordmark with the round mark, replaced by an uploaded logo. */
function Logo({ props, light = false }: { props: Props; light?: boolean }) {
  const edit = editOf(props)
  const src = str(props.logoImage)
  const height = Math.min(Math.max(num(props.logoHeight, 24), 14), 120)
  return (
    <a className={cx('ud-md-logo', light && 'ud-md-logo--light')} href={str(props.logoUrl, '/')}>
      {src ? (
        <span className="ud-md-logo__img">
          <img src={src} alt={str(props.logo, 'Logo')} style={{ height, width: 'auto', display: 'block' }} />
          <EditableImage edit={edit} path={['logoImage']} current={src} label="Replace logo" />
        </span>
      ) : (
        <>
          <span className="ud-md-logo__dot" aria-hidden />
          <EditableText edit={edit} path={['logo']} value={str(props.logo, 'Meridian')} as="span" className="ud-md-logo__text" placeholder="Brand" />
          <EditableText edit={edit} path={['logoNote']} value={str(props.logoNote)} as="span" className="ud-md-logo__note" placeholder="a company" />
        </>
      )}
    </a>
  )
}

const logoFields = [
  text('logo', 'Wordmark'),
  text('logoNote', 'Wordmark note'),
  image('logoImage', 'Logo image'),
  field('logoHeight', 'slider', 'Logo height', 'design', { min: 14, max: 120, unit: 'px' }),
  link('logoUrl', 'Logo link'),
]

/** Tick list used by the pricing and feature blocks. */
function Ticks({ props, path, className }: { props: Props; path: string; className?: string }) {
  const edit = editOf(props)
  const values = lines(props[path], [])
  if (!values.length && !edit) return null
  return (
    <ul className={cx('ud-md-ticks', className)}>
      {values.map((value, index) => (
        <li key={index}>
          <Icon name="check" size={12} />
          <EditableText edit={edit} path={[path, index]} value={value} as="span" placeholder="Feature" />
        </li>
      ))}
    </ul>
  )
}

/** The pastel gradient wash that sits behind product imagery. */
function Mesh({ tint = 'violet', className }: { tint?: string; className?: string }) {
  return <span className={cx('ud-md-mesh', `ud-md-mesh--${tint}`, className)} aria-hidden />
}

const tintField = select(
  'tint',
  'Gradient tint',
  [
    ['violet', 'Violet'],
    ['rose', 'Rose'],
    ['sky', 'Sky'],
    ['mint', 'Mint'],
    ['lilac', 'Lilac'],
  ],
  'design',
)

/* ----------------------------------------------------------- navbar.meridian */

export const navbarMeridian = defineBlock({
  type: 'navbar.meridian',
  version: 1,
  category: 'navigation',
  label: 'Meridian navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Meridian',
    logoNote: 'a payments company',
    logoImage: '',
    logoUrl: '/',
    links: [
      {
        label: 'Products',
        url: '/product',
        children: [
          { label: 'User wallets', url: '/product' },
          { label: 'Treasury wallets', url: '/product' },
          { label: 'Key management', url: '/product' },
          { label: 'Policy engine', url: '/product' },
        ],
      },
      {
        label: 'Solutions',
        url: '/solutions',
        children: [
          { label: 'Banking', url: '/solutions' },
          { label: 'Payments', url: '/solutions' },
          { label: 'Marketplaces', url: '/solutions' },
        ],
      },
      { label: 'Developers', url: '/product' },
      { label: 'Company', url: '/company' },
      { label: 'Pricing', url: '/pricing' },
    ],
    secondaryLabel: 'Docs',
    secondaryUrl: '/product',
    buttonLabel: 'Log in',
    buttonUrl: '/contact',
    sticky: true,
    animation: 'fade-down',
    animationTrigger: 'load',
  },
  schema: schema(
    ...logoFields,
    navLinksField('links', 'Links'),
    text('secondaryLabel', 'Plain link label'),
    link('secondaryUrl', 'Plain link'),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    stickyField,
  ),
  component: function NavbarMeridian(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    const anim = animationOf(props)
    return (
      <header
        className={cx('ud-md', 'ud-md-nav', bool(props.sticky, true) && 'ud-md-nav--sticky', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container ud-md-nav__bar">
          <Logo props={props} />
          <nav className={cx('ud-md-nav__links', open && 'is-open')} aria-label="Primary">
            {items(props.links, []).map((item, index) => (
              <NavItem key={index} item={item}>
                <a className="ud-md-nav__link" href={str(item.url, '#')}>
                  <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
                  <SubmenuCaret show={hasSubmenu(item)} />
                </a>
                <Submenu props={props} item={item} index={index} />
              </NavItem>
            ))}
          </nav>
          <div className="ud-md-nav__end">
            {str(props.secondaryLabel) || edit ? (
              <a className="ud-md-nav__plain" href={str(props.secondaryUrl, '#')}>
                <EditableText edit={edit} path={['secondaryLabel']} value={str(props.secondaryLabel)} as="span" placeholder="Docs" />
              </a>
            ) : null}
            {str(props.buttonLabel) || edit ? (
              <MdButton href={str(props.buttonUrl, '#')} variant="outline">
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} as="span" placeholder="Log in" />
              </MdButton>
            ) : null}
            <button type="button" className="ud-md-nav__toggle" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
              <Icon name="menu" size={18} />
            </button>
          </div>
        </div>
      </header>
    )
  },
})

/* ------------------------------------------------------------- hero.meridian */

export const heroMeridian = defineBlock({
  type: 'hero.meridian',
  version: 1,
  category: 'hero',
  label: 'Meridian split hero',
  icon: 'Sparkles',
  defaultProps: {
    heading: 'Build products that hold, move, and grow',
    headingAlt: 'digital assets',
    description:
      'Spin up accounts, hold balances, move money and automate settlement — from the first transaction through to global scale.',
    buttonLabel: 'Get started',
    buttonUrl: '/contact',
    secondaryLabel: 'Contact sales',
    secondaryUrl: '/contact',
    image: '',
    tint: 'violet',
    animation: 'fade-up',
    animationTrigger: 'load',
  },
  schema: schema(...twoToneFields, descriptionField, ...buttonFields, image('image', 'Product image'), tintField),
  component: function HeroMeridian(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" className="ud-md ud-md-hero" bleed>
        <div className="ud-md-hero__grid">
          <div className="ud-md-hero__copy">
            <TwoTone props={props} as="h1" />
            {str(props.description) || edit ? (
              <SafeText value={str(props.description)} className="ud-md-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
            ) : null}
            <Buttons props={props} />
          </div>
          <div className="ud-md-hero__panel">
            <Mesh tint={str(props.tint, 'violet')} />
            <Media src={props.image} alt={str(props.heading)} ratio="landscape" className="ud-md-hero__img" edit={edit} path={['image']} />
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- pagehead.meridian */

export const pageHeadMeridian = defineBlock({
  type: 'pagehead.meridian',
  version: 1,
  category: 'hero',
  label: 'Meridian page header',
  icon: 'Layout',
  defaultProps: {
    eyebrow: '',
    heading: 'Pricing that scales',
    headingAlt: 'with your business.',
    description: 'From first build to global rollout, transparent pricing that grows with what you ship.',
    buttonLabel: '',
    buttonUrl: '',
    secondaryLabel: '',
    secondaryUrl: '',
    surface: 'plain',
    animation: 'fade-up',
    animationTrigger: 'load',
  },
  schema: schema(
    eyebrowField,
    ...twoToneFields,
    descriptionField,
    ...buttonFields,
    select('surface', 'Background', [['plain', 'White'], ['lilac', 'Lavender panel'], ['tint', 'Faint tint']], 'design'),
  ),
  component: function PageHeadMeridian(props) {
    const surface = str(props.surface, 'plain')
    return (
      <SectionShell
        props={props}
        tone="default"
        align="center"
        className={cx('ud-md', 'ud-md-pagehead', `ud-md-pagehead--${surface}`)}
      >
        <Head props={props} as="h1" align="center" />
        <Buttons props={props} />
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ logos.meridian */

export const logosMeridian = defineBlock({
  type: 'logos.meridian',
  version: 1,
  category: 'logos',
  label: 'Meridian logo rail',
  icon: 'Grid',
  defaultProps: {
    heading: '',
    items: [
      { label: 'Northwind' },
      { label: 'Cardplane' },
      { label: 'Ferrous' },
      { label: 'Bluewater' },
      { label: 'Kestrel' },
      { label: 'Tandem' },
      { label: 'Vantage Pay' },
      { label: 'Odeon' },
    ],
    animation: 'fade-up',
  },
  schema: schema(headingField, repeater('items', 'Logos', [text('label', 'Label'), image('image', 'Logo')], { itemLabel: 'Logo' })),
  component: function LogosMeridian(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-md ud-md-logos" bleed>
        {str(props.heading) || edit ? (
          <div className="ud-container">
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="p" className="ud-md-logos__title" placeholder="Trusted by" />
          </div>
        ) : null}
        <div className="ud-md-logos__rail">
          {rows.map((item, index) =>
            str(item.image) ? (
              <Media key={index} src={item.image} alt={str(item.label)} ratio="wide" className="ud-md-logos__img" edit={edit} path={['items', index, 'image']} />
            ) : (
              <EditableText
                key={index}
                edit={edit}
                path={['items', index, 'label']}
                value={str(item.label)}
                as="span"
                className="ud-md-logos__word"
                placeholder="Brand"
              />
            ),
          )}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ bento.meridian */

export const bentoMeridian = defineBlock({
  type: 'bento.meridian',
  version: 1,
  category: 'features',
  label: 'Meridian bento grid',
  icon: 'Grid',
  defaultProps: {
    heading: 'Launch modern financial experiences with',
    headingAlt: 'programmable money',
    description: '',
    items: [
      { title: 'Bring digital accounts to every user', text: 'Let people anywhere hold and use balances through products they already understand.', image: '', tint: 'rose', span: 'wide' },
      { title: 'Build high-performance trading systems', text: 'Support low-latency execution for high-frequency flows.', image: '', tint: 'violet', span: 'normal' },
      { title: 'Automate treasury operations', text: 'Route and deploy capital with fine-grained approvals and programmable policy.', image: '', tint: 'sky', span: 'normal' },
      { title: 'Launch modern banking experiences', text: 'Everything you need to build products that help people store, save, spend and move money globally.', image: '', tint: 'lilac', span: 'wide' },
      { title: 'Execute agentic payments', text: 'Let software hold funds and transact autonomously inside limits you define.', image: '', tint: 'mint', span: 'normal' },
      { title: 'Enable card spend from balances', text: 'Turn held balances into everyday spending power with global card acceptance.', image: '', tint: 'violet', span: 'normal' },
      { title: 'Put idle balances to work', text: 'Access yield markets and pass returns directly on to your users.', image: '', tint: 'rose', span: 'normal' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    ...twoToneFields,
    descriptionField,
    repeater(
      'items',
      'Cards',
      [
        text('title', 'Title'),
        textarea('text', 'Text'),
        image('image', 'Image'),
        select('tint', 'Tint', [['violet', 'Violet'], ['rose', 'Rose'], ['sky', 'Sky'], ['mint', 'Mint'], ['lilac', 'Lilac']], 'design'),
        select('span', 'Width', [['normal', 'Normal'], ['wide', 'Wide']], 'layout'),
      ],
      { itemLabel: 'Card' },
    ),
  ),
  component: function BentoMeridian(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-md ud-md-bento">
        <Head props={props} align="left" />
        <div className="ud-md-bento__grid">
          {rows.map((item, index) => (
            <article key={index} className={cx('ud-md-bento__card', str(item.span, 'normal') === 'wide' && 'is-wide')}>
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-md-bento__title"
                placeholder="Title"
              />
              <SafeText value={str(item.text)} className="ud-md-bento__text" edit={edit} path={['items', index, 'text']} placeholder="Text" />
              <div className="ud-md-bento__frame">
                <Mesh tint={str(item.tint, 'violet')} />
                <Media src={item.image} alt={str(item.title)} ratio="landscape" edit={edit} path={['items', index, 'image']} />
              </div>
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ stats.meridian */

export const statsMeridian = defineBlock({
  type: 'stats.meridian',
  version: 1,
  category: 'stats',
  label: 'Meridian stat row',
  icon: 'BarChart',
  defaultProps: {
    items: [
      { value: '160M+', label: 'global accounts' },
      { value: '180+', label: 'countries supported' },
      { value: '$15B+', label: 'processed monthly' },
      { value: '99.99%', label: 'historical uptime' },
    ],
    surface: 'tint',
    animation: 'fade-up',
  },
  schema: schema(
    repeater('items', 'Stats', [text('value', 'Value'), text('label', 'Label')], { itemLabel: 'Stat' }),
    select('surface', 'Background', [['plain', 'White'], ['tint', 'Faint tint'], ['dark', 'Dark']], 'design'),
  ),
  component: function StatsMeridian(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const surface = str(props.surface, 'tint')
    return (
      <SectionShell props={props} tone="default" className={cx('ud-md', 'ud-md-stats', `ud-md-stats--${surface}`)}>
        <div className="ud-md-stats__grid">
          {rows.map((item, index) => (
            <div key={index} className="ud-md-stat">
              <EditableText
                edit={edit}
                path={['items', index, 'value']}
                value={str(item.value)}
                as="div"
                className="ud-md-stat__value"
                placeholder="160M+"
              />
              <EditableText
                edit={edit}
                path={['items', index, 'label']}
                value={str(item.label)}
                as="div"
                className="ud-md-stat__label"
                placeholder="global accounts"
              />
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ cases.meridian */

export const casesMeridian = defineBlock({
  type: 'cases.meridian',
  version: 1,
  category: 'content',
  label: 'Meridian case tiles',
  icon: 'Grid',
  defaultProps: {
    heading: 'See what’s possible with',
    headingAlt: 'Meridian',
    linkLabel: 'All case studies',
    linkUrl: '/company',
    items: [
      { brand: 'Northwind', text: 'Northwind powers global payouts and card-linked balances on Meridian accounts.', image: '', colour: '#e9f36a', url: '/company' },
      { brand: 'Cardplane', text: 'Cardplane brings dollar-backed balances to contractors in ninety countries.', image: '', colour: '#d9d4f7', url: '/company' },
      { brand: 'Ferrous', text: 'Ferrous makes advanced trading available to anyone, anywhere.', image: '', colour: '#9ef0d2', url: '/company' },
      { brand: 'Kestrel', text: 'Kestrel partnered with us to build simple, secure consumer wallets.', image: '', colour: '#f9a8d0', url: '/company' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    ...twoToneFields,
    text('linkLabel', 'Link label'),
    link('linkUrl', 'Link'),
    repeater(
      'items',
      'Case studies',
      [text('brand', 'Brand'), textarea('text', 'Text'), image('image', 'Image'), field('colour', 'color', 'Tile colour', 'design'), link('url', 'Link')],
      { itemLabel: 'Case study' },
    ),
  ),
  component: function CasesMeridian(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-md ud-md-cases">
        <div className="ud-md-cases__top">
          <TwoTone props={props} />
          {str(props.linkLabel) || edit ? (
            <a className="ud-md-link" href={str(props.linkUrl, '#')}>
              <EditableText edit={edit} path={['linkLabel']} value={str(props.linkLabel)} as="span" placeholder="All case studies" />
              <Icon name="arrow" size={13} />
            </a>
          ) : null}
        </div>
        <div className="ud-md-cases__grid">
          {rows.map((item, index) => (
            <a key={index} className="ud-md-case" href={str(item.url, '#')} style={{ background: str(item.colour, '#eef0fa') }}>
              <EditableText
                edit={edit}
                path={['items', index, 'brand']}
                value={str(item.brand)}
                as="div"
                className="ud-md-case__brand"
                placeholder="Brand"
              />
              <SafeText value={str(item.text)} className="ud-md-case__text" edit={edit} path={['items', index, 'text']} placeholder="What they built" />
              <Media src={item.image} alt={str(item.brand)} ratio="landscape" className="ud-md-case__img" edit={edit} path={['items', index, 'image']} />
            </a>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ split.meridian */

export const splitMeridian = defineBlock({
  type: 'split.meridian',
  version: 1,
  category: 'content',
  label: 'Meridian split feature',
  icon: 'Columns',
  defaultProps: {
    eyebrow: 'Embedded accounts',
    heading: 'Create accounts',
    headingAlt: 'behind the scenes',
    description: 'Provision an account in the background the moment someone signs up, with no extra step for them and no key material for you to hold.',
    bullets: 'Instant account creation\nNo seed phrase to explain\nWorks across every supported rail',
    linkLabel: 'Learn more',
    linkUrl: '/product',
    image: '',
    tint: 'rose',
    reverse: false,
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    ...twoToneFields,
    descriptionField,
    textarea('bullets', 'Bullets (one per line)'),
    text('linkLabel', 'Link label'),
    link('linkUrl', 'Link'),
    image('image', 'Image'),
    tintField,
    toggle('reverse', 'Image first', 'layout'),
  ),
  component: function SplitMeridian(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" className={cx('ud-md', 'ud-md-split', bool(props.reverse) && 'ud-md-split--reverse')}>
        <div className="ud-md-split__grid">
          <div className="ud-md-split__copy">
            <Head props={props} align="left" />
            <Ticks props={props} path="bullets" />
            {str(props.linkLabel) || edit ? (
              <a className="ud-md-link" href={str(props.linkUrl, '#')}>
                <EditableText edit={edit} path={['linkLabel']} value={str(props.linkLabel)} as="span" placeholder="Learn more" />
                <Icon name="arrow" size={13} />
              </a>
            ) : null}
          </div>
          <div className="ud-md-split__frame">
            <Mesh tint={str(props.tint, 'rose')} />
            <Media src={props.image} alt={str(props.heading)} ratio="landscape" edit={edit} path={['image']} />
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- pillars.meridian */

export const pillarsMeridian = defineBlock({
  type: 'pillars.meridian',
  version: 1,
  category: 'features',
  label: 'Meridian pillar cards',
  icon: 'Grid',
  defaultProps: {
    heading: 'Everything people need to hold, move,',
    headingAlt: 'and manage digital assets',
    description: '',
    items: [
      { icon: 'users', title: 'Onboard instantly', text: 'Create accounts automatically when someone signs up, with no extra knowledge required.' },
      { icon: 'zap', title: 'Fund seamlessly', text: 'Let people add funds through the methods they already use, wherever they are.' },
      { icon: 'shield', title: 'Transact without friction', text: 'Let users sign and settle without repeated approvals or context switching.' },
      { icon: 'globe', title: 'Scale globally from day one', text: 'Support each currency, country and rail without renegotiating your architecture.' },
    ],
    columns: 4,
    animation: 'fade-up',
  },
  schema: schema(
    ...twoToneFields,
    descriptionField,
    repeater('items', 'Pillars', [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Pillar' }),
    select('columns', 'Columns', [['2', '2'], ['3', '3'], ['4', '4']], 'layout'),
  ),
  component: function PillarsMeridian(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-md ud-md-pillars">
        <Head props={props} align="center" />
        <div className="ud-md-pillars__grid" data-cols={String(num(props.columns, 4))}>
          {rows.map((item, index) => (
            <article key={index} className="ud-md-pillar">
              <span className="ud-md-pillar__icon" aria-hidden>
                <Icon name={str(item.icon, 'zap')} size={15} />
              </span>
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-md-pillar__title"
                placeholder="Title"
              />
              <SafeText value={str(item.text)} className="ud-md-pillar__text" edit={edit} path={['items', index, 'text']} placeholder="Text" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- pricing.meridian */

export const pricingMeridian = defineBlock({
  type: 'pricing.meridian',
  version: 1,
  category: 'pricing',
  label: 'Meridian pricing pair',
  icon: 'CreditCard',
  defaultProps: {
    items: [
      {
        name: 'Builder',
        text: 'For teams getting started. Access to the core feature set, with a free monthly allowance to launch on.',
        tiers: '0 – 499 accounts | Free\n500 – 2,499 accounts | $299 / mo\n2,500 – 9,999 accounts | $499 / mo',
        features: '',
        buttonLabel: 'Get started',
        url: '/contact',
        note: 'Learn more in the docs',
        featured: false,
      },
      {
        name: 'Enterprise',
        text: 'For scaled platforms that need advanced controls, custom terms and global reach.',
        tiers: '',
        features: 'Custom pricing per account or transaction\nPremium support and a named contact\nAudit hooks, SSO and custom integrations\nVolume rates from $0.001 per signature',
        buttonLabel: 'Talk to sales',
        url: '/contact',
        note: '',
        featured: true,
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    repeater(
      'items',
      'Plans',
      [
        text('name', 'Name'),
        textarea('text', 'Description'),
        textarea('tiers', 'Tiers (label | price per line)'),
        textarea('features', 'Features (one per line)'),
        text('buttonLabel', 'Button label'),
        link('url', 'Button link'),
        text('note', 'Footnote'),
        toggle('featured', 'Outlined', 'design'),
      ],
      { itemLabel: 'Plan' },
    ),
  ),
  component: function PricingMeridian(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-md ud-md-pricing">
        <div className="ud-md-pricing__grid">
          {rows.map((item, index) => (
            <article key={index} className={cx('ud-md-plan', bool(item.featured) && 'ud-md-plan--outlined')}>
              <EditableText
                edit={edit}
                path={['items', index, 'name']}
                value={str(item.name)}
                as="h3"
                className="ud-md-plan__name"
                placeholder="Plan"
              />
              <SafeText value={str(item.text)} className="ud-md-plan__text" edit={edit} path={['items', index, 'text']} placeholder="Who it suits" />

              {lines(item.tiers, []).length ? (
                <ul className="ud-md-plan__tiers">
                  {lines(item.tiers, []).map((line, lineIndex) => {
                    const [label, price] = line.split('|')
                    return (
                      <li key={lineIndex}>
                        <EditableText
                          edit={edit}
                          path={['items', index, 'tiers', lineIndex]}
                          value={line}
                          as="span"
                          className="ud-md-plan__tierline"
                          placeholder="0 – 499 accounts | Free"
                        />
                        <span className="ud-md-plan__tierview" aria-hidden>
                          <span>{(label || '').trim()}</span>
                          <strong>{(price || '').trim()}</strong>
                        </span>
                      </li>
                    )
                  })}
                </ul>
              ) : null}

              <Ticks props={item as Props} path="features" />

              {str(item.buttonLabel) || edit ? (
                <MdButton href={str(item.url, '#')} variant={bool(item.featured) ? 'outline' : 'dark'}>
                  <EditableText
                    edit={edit}
                    path={['items', index, 'buttonLabel']}
                    value={str(item.buttonLabel)}
                    as="span"
                    placeholder="Get started"
                  />
                </MdButton>
              ) : null}
              {str(item.note) ? (
                <EditableText
                  edit={edit}
                  path={['items', index, 'note']}
                  value={str(item.note)}
                  as="p"
                  className="ud-md-plan__note"
                  placeholder="Footnote"
                />
              ) : null}
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- compare.meridian */

export const compareMeridian = defineBlock({
  type: 'compare.meridian',
  version: 1,
  category: 'pricing',
  label: 'Meridian comparison matrix',
  icon: 'Columns',
  defaultProps: {
    heading: 'Feature comparison matrix',
    headingAlt: '',
    columns: 'Builder | Enterprise',
    groups: [
      {
        title: 'Core platform',
        rows: 'Key-based authentication | yes | yes\nEmbedded accounts | yes | yes\nDelegated access | yes | yes\nNative fee sponsorship | yes | yes\nMulti-account support | yes | yes\nWebhooks | no | yes',
      },
      {
        title: 'SDKs and UI',
        rows: 'Web, mobile and server SDKs | yes | yes\nWhite-label components | yes | yes\nUsage analytics and reporting | yes | yes',
      },
      {
        title: 'Security and compliance',
        rows: 'Policy engine | no | yes\nApproval quorums | no | yes\nAdvanced SSO | add-on | yes\nCustodial accounts | no | yes',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    ...twoToneFields,
    text('columns', 'Column headings (pipe separated)'),
    repeater('groups', 'Groups', [text('title', 'Group title'), textarea('rows', 'Rows (label | a | b)')], { itemLabel: 'Group' }),
  ),
  component: function CompareMeridian(props) {
    const edit = editOf(props)
    const headings = str(props.columns, '')
      .split('|')
      .map((value) => value.trim())
      .filter(Boolean)
    const groups = items(props.groups, [])

    const cell = (value: string) => {
      const clean = value.trim().toLowerCase()
      if (clean === 'yes') return <span className="ud-md-matrix__dot" aria-label="Included" />
      if (clean === 'no' || clean === '') return <span className="ud-md-matrix__none" aria-label="Not included" />
      return <span className="ud-md-matrix__note">{value.trim()}</span>
    }

    return (
      <SectionShell props={props} tone="default" className="ud-md ud-md-matrixwrap">
        <div className="ud-md-matrix">
          <TwoTone props={props} className="ud-md-matrix__title" />
          <div className="ud-md-matrix__scroll">
            <table className="ud-md-matrix__table">
              <thead>
                <tr>
                  <th />
                  {headings.map((heading, index) => (
                    <th key={index}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map((group, groupIndex) => (
                  <Fragment key={'g' + String(groupIndex)}>
                    <tr className="ud-md-matrix__group">
                      <th colSpan={headings.length + 1}>
                        <EditableText
                          edit={edit}
                          path={['groups', groupIndex, 'title']}
                          value={str(group.title)}
                          as="span"
                          placeholder="Group"
                        />
                      </th>
                    </tr>
                    {lines(group.rows, []).map((row, rowIndex) => {
                      const parts = row.split('|')
                      return (
                        <tr key={'g' + String(groupIndex) + 'r' + String(rowIndex)}>
                          <td>
                            <EditableText
                              edit={edit}
                              path={['groups', groupIndex, 'rows', rowIndex]}
                              value={row}
                              as="span"
                              className="ud-md-matrix__rowline"
                              placeholder="Feature | yes | yes"
                            />
                            <span className="ud-md-matrix__rowview" aria-hidden>
                              {(parts[0] || '').trim()}
                            </span>
                          </td>
                          {headings.map((_, columnIndex) => (
                            <td key={columnIndex} className="ud-md-matrix__cell">
                              {cell(parts[columnIndex + 1] ?? '')}
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------------- faq.meridian */

export const faqMeridian = defineBlock({
  type: 'faq.meridian',
  version: 1,
  category: 'faq',
  label: 'Meridian FAQ',
  icon: 'HelpCircle',
  defaultProps: {
    heading: 'Frequently asked.',
    headingAlt: '',
    description: 'Have a question we have not covered? Write to the team and a human answers.',
    items: [
      { question: 'How are monthly active accounts counted?', answer: 'An active account is one that authenticated and held at least one session in the last thirty days. Connecting the same account from several devices still counts once.' },
      { question: 'What happens as we grow?', answer: 'When you pass a tier, the next one applies automatically and billing follows the same month. We flag it in the dashboard before it happens.' },
      { question: 'What happens if we cancel?', answer: 'You keep access until the end of the period you already paid for, and can export everything before it ends.' },
      { question: 'What counts as a transaction signature?', answer: 'Any cryptographic signature request made through an embedded account, including transfers, approvals and typed-data signing.' },
      { question: 'How do you prevent abuse?', answer: 'Rate limits and an invisible challenge run on the sign-up path by default, and you can tighten or relax them per environment.' },
      { question: 'How do we start an enterprise plan?', answer: 'Write to the sales team. Most platforms move across once they are approaching ten thousand active accounts.' },
      { question: 'Can we talk to someone before committing?', answer: 'Yes. Book a call, or join the developer community and ask the engineers who build it.' },
      { question: 'What if we need something you do not support yet?', answer: 'Tell us. A good share of the roadmap comes from exactly that conversation.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    ...twoToneFields,
    descriptionField,
    repeater('items', 'Questions', [text('question', 'Question'), textarea('answer', 'Answer')], { itemLabel: 'Question' }),
  ),
  component: function FaqMeridian(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const [open, setOpen] = useState(-1)
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-md ud-md-faq">
        <Head props={props} align="center" />
        <div className="ud-md-faq__list">
          {rows.map((item, index) => {
            const isOpen = open === index
            return (
              <div key={index} className={cx('ud-md-faq__row', isOpen && 'is-open')}>
                <button type="button" className="ud-md-faq__head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : index)}>
                  <EditableText
                    edit={edit}
                    path={['items', index, 'question']}
                    value={str(item.question)}
                    as="span"
                    className="ud-md-faq__q"
                    placeholder="Question"
                  />
                  <span className="ud-md-faq__sign" aria-hidden>
                    <Icon name={isOpen ? 'minus' : 'plus'} size={14} />
                  </span>
                </button>
                {isOpen || edit ? (
                  <SafeText value={str(item.answer)} className="ud-md-faq__a" edit={edit} path={['items', index, 'answer']} placeholder="Answer" />
                ) : null}
              </div>
            )
          })}
        </div>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- resources.meridian */

export const resourcesMeridian = defineBlock({
  type: 'resources.meridian',
  version: 1,
  category: 'content',
  label: 'Meridian resource rows',
  icon: 'FileText',
  defaultProps: {
    heading: 'Resources for building better',
    headingAlt: 'on modern money rails',
    description: 'Practical primers on accounts, yield and custody, grounded in real deployments.',
    items: [
      { title: 'Stable value, explained.', text: 'A primer on how stable digital money works and how to design around it, written for teams building their first product.', buttonLabel: 'Download', url: '#', image: '', reverse: false },
      { title: 'Yield, unlocked.', text: 'An introduction to yield mechanics and what to weigh before you route customer balances into them.', buttonLabel: 'Download', url: '#', image: '', reverse: true },
      { title: 'Custody, your way.', text: 'A guide to custody models and which one fits, from fully delegated through to customer-controlled.', buttonLabel: 'Download', url: '#', image: '', reverse: false },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    ...twoToneFields,
    descriptionField,
    repeater(
      'items',
      'Resources',
      [text('title', 'Title'), textarea('text', 'Text'), text('buttonLabel', 'Button label'), link('url', 'Link'), image('image', 'Cover'), toggle('reverse', 'Image right', 'layout')],
      { itemLabel: 'Resource' },
    ),
  ),
  component: function ResourcesMeridian(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-md ud-md-resources">
        <Head props={props} align="center" />
        <div className="ud-md-resources__list">
          {rows.map((item, index) => (
            <article key={index} className={cx('ud-md-resource', bool(item.reverse) && 'is-reverse')}>
              <Media src={item.image} alt={str(item.title)} ratio="landscape" className="ud-md-resource__img" edit={edit} path={['items', index, 'image']} />
              <div className="ud-md-resource__copy">
                <EditableText
                  edit={edit}
                  path={['items', index, 'title']}
                  value={str(item.title)}
                  as="h3"
                  className="ud-md-resource__title"
                  placeholder="Title"
                />
                <SafeText value={str(item.text)} className="ud-md-resource__text" edit={edit} path={['items', index, 'text']} placeholder="Text" />
                {str(item.buttonLabel) || edit ? (
                  <MdButton href={str(item.url, '#')}>
                    <EditableText
                      edit={edit}
                      path={['items', index, 'buttonLabel']}
                      value={str(item.buttonLabel)}
                      as="span"
                      placeholder="Download"
                    />
                  </MdButton>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- positions.meridian */

export const positionsMeridian = defineBlock({
  type: 'positions.meridian',
  version: 1,
  category: 'content',
  label: 'Meridian open positions',
  icon: 'Users',
  defaultProps: {
    heading: 'Open positions.',
    headingAlt: '',
    groups: [
      {
        title: 'Engineering',
        roles: 'Security Engineer | London\nSolutions Engineer | London\nEngineering Manager, Forward Deployed | London\nBackend Engineer | London or Lisbon\nEngineering Manager, Product | London or Lisbon\nFull-stack Engineer | London or Lisbon\nInfrastructure Engineer | London or Lisbon',
      },
      {
        title: 'Go to market',
        roles: 'Account Executive | London\nDeveloper Advocate | Remote\nTechnical Writer | Remote',
      },
    ],
    url: '/contact',
    animation: 'fade-up',
  },
  schema: schema(
    ...twoToneFields,
    repeater('groups', 'Departments', [text('title', 'Department'), textarea('roles', 'Roles (title | location per line)')], { itemLabel: 'Department' }),
    link('url', 'Application link'),
  ),
  component: function PositionsMeridian(props) {
    const edit = editOf(props)
    const groups = items(props.groups, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-md ud-md-positions">
        <TwoTone props={props} />
        <div className="ud-md-positions__list">
          {groups.map((group, groupIndex) => (
            <div key={groupIndex} className="ud-md-positions__group">
              <EditableText
                edit={edit}
                path={['groups', groupIndex, 'title']}
                value={str(group.title)}
                as="h3"
                className="ud-md-positions__dept"
                placeholder="Department"
              />
              <ul>
                {lines(group.roles, []).map((role, roleIndex) => {
                  const [title, location] = role.split('|')
                  return (
                    <li key={roleIndex}>
                      <a href={str(props.url, '#')} className="ud-md-position">
                        <EditableText
                          edit={edit}
                          path={['groups', groupIndex, 'roles', roleIndex]}
                          value={role}
                          as="span"
                          className="ud-md-position__line"
                          placeholder="Role | Location"
                        />
                        <span className="ud-md-position__view" aria-hidden>
                          <span className="ud-md-position__title">{(title || '').trim()}</span>
                          <span className="ud-md-position__place">
                            {(location || '').trim()}
                            <Icon name="arrow" size={13} />
                          </span>
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------------- band.meridian */

export const bandMeridian = defineBlock({
  type: 'band.meridian',
  version: 1,
  category: 'cta',
  label: 'Meridian statement band',
  icon: 'Megaphone',
  defaultProps: {
    heading: 'Technical decisions are moral decisions.',
    headingAlt: '',
    description: '',
    buttonLabel: 'Read the manifesto',
    buttonUrl: '/company',
    secondaryLabel: '',
    secondaryUrl: '',
    surface: 'lilac',
    animation: 'fade-up',
  },
  schema: schema(
    ...twoToneFields,
    descriptionField,
    ...buttonFields,
    select('surface', 'Background', [['lilac', 'Lavender'], ['tint', 'Faint tint'], ['dark', 'Dark']], 'design'),
  ),
  component: function BandMeridian(props) {
    const surface = str(props.surface, 'lilac')
    return (
      <SectionShell
        props={props}
        tone="default"
        align="center"
        className={cx('ud-md', 'ud-md-band', `ud-md-band--${surface}`)}
      >
        <Head props={props} align="center" />
        <Buttons props={props} primary={surface === 'dark' ? 'light' : 'dark'} />
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------------- cta.meridian */

export const ctaMeridian = defineBlock({
  type: 'cta.meridian',
  version: 1,
  category: 'cta',
  label: 'Meridian closing CTA',
  icon: 'Megaphone',
  defaultProps: {
    heading: 'Get started in minutes',
    headingAlt: 'go live in hours',
    description: 'Build accounts, move value and automate settlement — from first transaction to global scale.',
    buttonLabel: 'Get started',
    buttonUrl: '/contact',
    secondaryLabel: 'Contact sales',
    secondaryUrl: '/contact',
    animation: 'fade-up',
  },
  schema: schema(...twoToneFields, descriptionField, ...buttonFields),
  component: function CtaMeridian(props) {
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-md ud-md-cta">
        <Head props={props} align="center" />
        <Buttons props={props} />
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- richtext.meridian */

export const richTextMeridian = defineBlock({
  type: 'richtext.meridian',
  version: 1,
  category: 'content',
  label: 'Meridian long copy',
  icon: 'FileText',
  defaultProps: {
    body: '<h2>Why we are here</h2><p>We build developer tooling that puts people first. By leaning on modern cryptography we shift the default around ownership, and protect the accounts and assets of millions of users.</p><h3>How we work</h3><p>All engineering here is product engineering. We move the space forward by focusing on impact today, and we find our true north by letting customers guide our work.</p><p>We talk about capabilities, not primitives. We ship features for precise customers, not imagined archetypes. We value a simple explanation over a clever one.</p>',
    contentWidth: 'narrow',
    animation: 'fade-up',
  },
  schema: schema(field('body', 'richtext', 'Body', 'content')),
  component: function RichTextMeridian(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" className="ud-md ud-md-rich">
        <EditableRich edit={edit} path={['body']} html={str(props.body)} className="ud-md-rich__body" />
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- contact.meridian */

export const contactMeridian = defineBlock({
  type: 'contact.meridian',
  version: 1,
  category: 'form',
  label: 'Meridian stepped contact form',
  icon: 'Mail',
  defaultProps: {
    heading: 'We want to hear',
    headingAlt: 'from you',
    steps: [{ label: 'Your email' }, { label: 'Your info' }, { label: 'Complete' }],
    activeStep: 0,
    formTitle: '',
    formId: '',
    buttonLabel: 'Continue',
    regions: 'United Kingdom\nUnited States\nCanada\nGermany\nFrance\nSingapore\nAustralia\nSomewhere else',
    fineprint: 'We handle your details under our privacy policy.',
    animation: 'fade-up',
    animationTrigger: 'load',
  },
  schema: schema(
    ...twoToneFields,
    repeater('steps', 'Steps', [text('label', 'Label')], { itemLabel: 'Step' }),
    field('activeStep', 'number', 'Active step', 'layout', { min: 0, max: 6 }),
    textarea('regions', 'Country options (one per line)'),
    text('formId', 'Form ID'),
    text('buttonLabel', 'Submit label'),
    text('fineprint', 'Fine print'),
  ),
  component: function ContactMeridian(props) {
    const edit = editOf(props)
    const steps = items(props.steps, [])
    const active = num(props.activeStep, 0)
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-md ud-md-contact">
        <TwoTone props={props} as="h1" className="ud-md-title--xl" />
        <div className="ud-md-contact__panel">
          {steps.length ? (
            <ol className="ud-md-steps">
              {steps.map((step, index) => (
                <li key={index} className={cx('ud-md-step', index === active && 'is-active')}>
                  <span className="ud-md-step__dot" aria-hidden />
                  <EditableText edit={edit} path={['steps', index, 'label']} value={str(step.label)} as="span" placeholder="Step" />
                </li>
              ))}
            </ol>
          ) : null}
          <PublicForm
            formId={str(props.formId) || undefined}
            submitLabel={str(props.buttonLabel, 'Continue')}
            fields={[
              { name: 'email', label: 'Work email', type: 'email', required: true, placeholder: 'jane@example.com' },
              { name: 'region', label: 'Country / Region', type: 'select', required: true, options: lines(props.regions, ['United Kingdom']) },
            ]}
          />
          {str(props.fineprint) || edit ? (
            <EditableText
              edit={edit}
              path={['fineprint']}
              value={str(props.fineprint)}
              as="p"
              className="ud-md-contact__fine"
              placeholder="We handle your details under our privacy policy."
            />
          ) : null}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- footer.meridian */

export const footerMeridian = defineBlock({
  type: 'footer.meridian',
  version: 1,
  category: 'footer',
  label: 'Meridian footer',
  icon: 'Layout',
  defaultProps: {
    logo: 'Meridian',
    logoImage: '',
    logoUrl: '/',
    tagline: 'Technical decisions are moral decisions.',
    columns: [
      {
        title: 'Product',
        links: [
          { label: 'User accounts', url: '/product' },
          { label: 'Treasury', url: '/product' },
          { label: 'Key management', url: '/product' },
          { label: 'Policy engine', url: '/product' },
          { label: 'On and off ramps', url: '/product' },
          { label: 'Cards and spend', url: '/product' },
        ],
      },
      {
        title: 'Solutions',
        links: [
          { label: 'Banking', url: '/solutions' },
          { label: 'Payments', url: '/solutions' },
          { label: 'Payroll', url: '/solutions' },
          { label: 'Marketplaces', url: '/solutions' },
          { label: 'Exchanges', url: '/solutions' },
        ],
      },
      {
        title: 'Developers',
        links: [
          { label: 'Docs', url: '/product' },
          { label: 'Demo', url: '/product' },
          { label: 'Security handbook', url: '/product' },
          { label: 'Trust centre', url: '/product' },
          { label: 'Support', url: '/contact' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'About', url: '/company' },
          { label: 'Careers', url: '/company' },
          { label: 'Blog', url: '/company' },
          { label: 'Contact', url: '/contact' },
          { label: 'Privacy policy', url: '/company' },
        ],
      },
    ],
    social: [
      { icon: 'twitter', url: '#' },
      { icon: 'github', url: '#' },
      { icon: 'linkedin', url: '#' },
    ],
    copyright: '© Meridian',
    animation: 'fade-up',
  },
  schema: schema(
    ...logoFields,
    text('tagline', 'Tagline'),
    repeater(
      'columns',
      'Link columns',
      [text('title', 'Title'), repeater('links', 'Links', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Link' })],
      { itemLabel: 'Column' },
    ),
    repeater('social', 'Social', [icon('icon', 'Icon'), link('url', 'URL')], { itemLabel: 'Profile' }),
    text('copyright', 'Copyright'),
  ),
  component: function FooterMeridian(props) {
    const edit = editOf(props)
    const columns = items(props.columns, [])
    const anim = animationOf(props)
    return (
      <footer
        className={cx('ud-md', 'ud-md-footer', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container ud-md-footer__grid">
          {columns.map((column, index) => (
            <div key={index} className="ud-md-footer__col">
              <EditableText
                edit={edit}
                path={['columns', index, 'title']}
                value={str(column.title)}
                as="h3"
                placeholder="Column"
              />
              <ul>
                {items(column.links, []).map((item, linkIndex) => (
                  <li key={linkIndex}>
                    <a href={str(item.url, '#')}>
                      <EditableText
                        edit={edit}
                        path={['columns', index, 'links', linkIndex, 'label']}
                        value={str(item.label)}
                        as="span"
                        placeholder="Link"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="ud-md-footer__brand">
            <Logo props={props} />
            <EditableText edit={edit} path={['tagline']} value={str(props.tagline)} as="p" className="ud-md-footer__tagline" placeholder="Tagline" />
            <div className="ud-md-footer__social">
              {items(props.social, []).map((item, index) => (
                <a key={index} href={str(item.url, '#')} aria-label={str(item.icon, 'social')}>
                  <Icon name={str(item.icon, 'globe')} size={15} />
                </a>
              ))}
            </div>
            <EditableText edit={edit} path={['copyright']} value={str(props.copyright)} as="p" className="ud-md-footer__copy" placeholder="© Meridian" />
          </div>
        </div>
      </footer>
    )
  },
})
