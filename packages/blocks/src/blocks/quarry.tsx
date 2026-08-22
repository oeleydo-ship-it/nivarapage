/**
 * Quarry — a regulated-operations platform family.
 *
 * Design language: warm bone and off-white grounds, deep forest green bands,
 * one theme accent used as a marker highlight behind words and as blocky
 * pixel art. Headings are uppercase grotesk set tight; eyebrows are mono
 * micro-labels prefixed with a small square. Cards are square-ish, hairline
 * bordered, and sit on the shared container grid.
 *
 * Every block is inline-editable and inherits the shared tone / animation /
 * typography / spacing / background controls through `schema()`.
 */
import type { CSSProperties, ReactNode } from 'react'
import { useState } from 'react'
import { EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Media,
  SafeText,
  SectionShell,
  animationOf,
  bool,
  cx,
  items,
  num,
  sectionVars,
  str,
  type Props,
} from '../primitives'
import { PublicForm } from '../public-form'
import {
  ctaFields,
  descriptionField,
  headingField,
  icon,
  image,
  link,
  navLinksField,
  primaryCtaFields,
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

/* ------------------------------------------------------------------ shared */

function qrLinks(props: Props) {
  return items(props.links, []).map((item) => ({
    label: str(item.label),
    url: str(item.url) || str(item.href) || '#',
    children: item.children,
  }))
}

function BrandMark({ props, className }: { props: Props; className?: string }) {
  const edit = editOf(props)
  return (
    <a href={str(props.logoUrl, '/')} className={cx('ud-qr-brand', className)}>
      <span className="ud-qr-brand__mark" aria-hidden>
        <Icon name={str(props.logoIcon, 'layers')} size={16} />
      </span>
      <EditableText edit={edit} path={['logo']} value={str(props.logo, 'Quarry')} placeholder="Brand" />
    </a>
  )
}

/**
 * Blocky accent-coloured pixel art. Deterministic — a seeded bitmap rather
 * than random — so the server and client render identical markup.
 */
const PIXEL_PATTERNS: Record<string, number[][]> = {
  ridge: [
    [0, 0, 2, 1, 0, 0, 1, 0],
    [0, 1, 1, 0, 2, 1, 1, 0],
    [1, 1, 0, 0, 1, 0, 2, 1],
    [0, 2, 1, 1, 0, 0, 1, 1],
    [0, 0, 1, 2, 1, 1, 0, 0],
    [1, 0, 0, 1, 1, 2, 1, 0],
  ],
  stair: [
    [1, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0],
    [0, 1, 2, 0, 0, 0],
    [0, 0, 2, 1, 0, 0],
    [0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 1, 2],
  ],
  scatter: [
    [0, 1, 0, 0, 2, 0, 1, 0],
    [1, 0, 0, 1, 0, 0, 0, 1],
    [0, 0, 2, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 1, 0, 2, 0],
  ],
}

function PixelArt({ pattern = 'ridge', className }: { pattern?: string; className?: string }) {
  const grid = PIXEL_PATTERNS[pattern] || PIXEL_PATTERNS.ridge
  return (
    <div
      className={cx('ud-qr-pixels', className)}
      style={{ '--qr-pixel-cols': grid[0].length } as CSSProperties}
      aria-hidden
    >
      {grid.map((row, y) =>
        row.map((cell, x) => (
          <span key={`${y}-${x}`} className={cx('ud-qr-pixels__cell', cell === 1 && 'is-accent', cell === 2 && 'is-deep')} />
        )),
      )}
    </div>
  )
}

/** Mono micro-label prefixed with a small square, e.g. `■ CONTACT US`. */
function Eyebrow({ props, path = ['eyebrow'], value }: { props: Props; path?: Array<string | number>; value?: string }) {
  const edit = editOf(props)
  const text = value ?? str(props.eyebrow)
  if (!text && !edit) return null
  return (
    <p className="ud-qr-eyebrow">
      <span className="ud-qr-eyebrow__dot" aria-hidden />
      <EditableText edit={edit} path={path} value={text} as="span" placeholder="SECTION" />
    </p>
  )
}

/**
 * Uppercase heading with an optional accent marker highlight behind a phrase.
 * Lead / highlight / tail are separate props so each can be edited on canvas.
 */
function MarkerHeading({
  props,
  as: Tag = 'h2',
  className,
}: {
  props: Props
  as?: 'h1' | 'h2'
  className?: string
}) {
  const edit = editOf(props)
  const highlight = str(props.headingHighlight)
  const tail = str(props.headingTail)
  return (
    <Tag className={cx(Tag === 'h1' ? 'ud-h1' : 'ud-h2', 'ud-qr-title', className)}>
      <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="span" placeholder="Heading" />
      {highlight || edit ? (
        <>
          {' '}
          <EditableText
            edit={edit}
            path={['headingHighlight']}
            value={highlight}
            as="span"
            className="ud-qr-mark"
            placeholder="highlight"
          />
        </>
      ) : null}
      {tail || edit ? (
        <>
          {' '}
          <EditableText edit={edit} path={['headingTail']} value={tail} as="span" placeholder="rest of heading" />
        </>
      ) : null}
    </Tag>
  )
}

/** Square-cornered button with the trailing ↗ glyph the family uses. */
function QrButton({
  href,
  children,
  variant = 'solid',
  arrow = true,
}: {
  href: string
  children: ReactNode
  variant?: 'solid' | 'accent' | 'outline' | 'ghost'
  arrow?: boolean
}) {
  return (
    <a href={href || '#'} className={cx('ud-qr-btn', `ud-qr-btn--${variant}`)}>
      <span>{children}</span>
      {arrow ? (
        <span className="ud-qr-btn__arrow" aria-hidden>
          ↗
        </span>
      ) : null}
    </a>
  )
}

function HeadBlock({ props, centered = false }: { props: Props; centered?: boolean }) {
  const edit = editOf(props)
  return (
    <header className={cx('ud-qr-head', centered && 'ud-qr-head--center')}>
      <Eyebrow props={props} />
      <MarkerHeading props={props} />
      {str(props.description) || edit ? (
        <SafeText
          value={str(props.description)}
          className="ud-qr-lead"
          edit={edit}
          path={['description']}
          placeholder="Supporting copy"
        />
      ) : null}
    </header>
  )
}

const navLinkDefaults = [
  { label: 'Automated Ops', url: '/platform' },
  { label: 'Platform', url: '/platform#backbone' },
  { label: 'Solutions', url: '/onboarding' },
  { label: 'Ecosystem', url: '/ecosystem' },
  { label: 'Resources', url: '/ecosystem#resources' },
]

const patternField = select(
  'pattern',
  'Pixel pattern',
  [['ridge', 'Ridge'], ['stair', 'Stair'], ['scatter', 'Scatter'], ['none', 'None']],
  'design',
)

/* ------------------------------------------------------------ navbar.quarry */

export const navbarQuarry = defineBlock({
  type: 'navbar.quarry',
  version: 1,
  category: 'navigation',
  label: 'Quarry navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Quarry',
    logoIcon: 'layers',
    logoUrl: '/',
    links: navLinkDefaults,
    secondaryLabel: 'Log in',
    secondaryUrl: '/contact',
    buttonLabel: 'Book a demo',
    buttonUrl: '/contact',
    sticky: true,
    animation: 'fade-down',
    animationTrigger: 'load',
    animationDuration: 500,
  },
  schema: schema(
    text('logo', 'Brand'),
    icon('logoIcon', 'Mark icon'),
    link('logoUrl', 'Brand link'),
    navLinksField('links', 'Links'),
    ...ctaFields,
    stickyField,
  ),
  component: function NavbarQuarry(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    const links = qrLinks(props)
    const anim = animationOf(props)
    return (
      <header
        className={cx('ud-qr', 'ud-qr-nav', bool(props.sticky, true) && 'ud-qr-nav--sticky', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container">
          <div className="ud-qr-nav__bar">
            <BrandMark props={props} />
            <nav className={cx('ud-qr-nav__links', open && 'is-open')} aria-label="Primary">
              {links.map((item, index) => (
                <NavItem key={`${item.url}-${index}`} item={item}>
                  <a href={item.url} className="ud-qr-nav__link">
                    <EditableText edit={edit} path={['links', index, 'label']} value={item.label} placeholder="Link" />
                    <SubmenuCaret show={hasSubmenu(item)} />
                  </a>
                  <Submenu props={props} item={item} index={index} />
                </NavItem>
              ))}
            </nav>
            <div className="ud-qr-nav__actions">
              {str(props.secondaryLabel) || edit ? (
                <a href={str(props.secondaryUrl, '#')} className="ud-qr-nav__login">
                  <EditableText edit={edit} path={['secondaryLabel']} value={str(props.secondaryLabel)} placeholder="Log in" />
                </a>
              ) : null}
              {str(props.buttonLabel) || edit ? (
                <QrButton href={str(props.buttonUrl, '#')}>
                  <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Book a demo" />
                </QrButton>
              ) : null}
            </div>
            <button
              type="button"
              className="ud-qr-nav__toggle"
              aria-expanded={open}
              aria-label="Menu"
              onClick={() => setOpen(!open)}
            >
              <Icon name={open ? 'close' : 'menu'} size={20} />
            </button>
          </div>
        </div>
      </header>
    )
  },
})

/* -------------------------------------------------------------- hero.quarry */

export const heroQuarry = defineBlock({
  type: 'hero.quarry',
  version: 1,
  category: 'hero',
  label: 'Quarry hero',
  icon: 'Sparkles',
  defaultProps: {
    eyebrow: 'THE OPERATIONS BACKBONE',
    heading: 'THE OPERATIONAL INFRASTRUCTURE LICENSED',
    headingHighlight: 'ENERGY SUPPLIERS',
    headingTail: 'RUN ON',
    description:
      'Meter data, switching, billing exceptions, and regulatory reporting in one control plane — with every action logged for your auditor.',
    buttonLabel: 'Book a demo',
    buttonUrl: '/contact',
    secondaryLabel: 'See how it works',
    secondaryUrl: '/platform',
    pattern: 'ridge',
    animation: 'fade-up',
    animationTrigger: 'load',
    animationDuration: 900,
  },
  schema: schema(
    headingField,
    text('headingHighlight', 'Highlighted phrase'),
    text('headingTail', 'Heading end'),
    descriptionField,
    ...ctaFields,
    patternField,
  ),
  component: function HeroQuarry(props) {
    const edit = editOf(props)
    const pattern = str(props.pattern, 'ridge')
    return (
      <SectionShell props={props} tone="dark" className="ud-qr ud-qr-hero">
        <div className="ud-qr-hero__grid">
          <div className="ud-qr-hero__copy">
            <Eyebrow props={props} />
            <MarkerHeading props={props} as="h1" className="ud-qr-hero__title" />
            <SafeText
              value={str(props.description)}
              className="ud-qr-hero__lead"
              edit={edit}
              path={['description']}
              placeholder="Supporting copy"
            />
            <div className="ud-qr-hero__cta">
              {str(props.buttonLabel) || edit ? (
                <QrButton href={str(props.buttonUrl, '#')} variant="accent">
                  <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Book a demo" />
                </QrButton>
              ) : null}
              {str(props.secondaryLabel) || edit ? (
                <QrButton href={str(props.secondaryUrl, '#')} variant="ghost">
                  <EditableText
                    edit={edit}
                    path={['secondaryLabel']}
                    value={str(props.secondaryLabel)}
                    placeholder="See how it works"
                  />
                </QrButton>
              ) : null}
            </div>
          </div>
          {pattern !== 'none' ? <PixelArt pattern={pattern} className="ud-qr-hero__art" /> : null}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- logos.quarry */

export const logosQuarry = defineBlock({
  type: 'logos.quarry',
  version: 1,
  category: 'gallery',
  label: 'Quarry logo rail',
  icon: 'Grid',
  defaultProps: {
    items: [
      { label: 'northmeter' },
      { label: 'Halden' },
      { label: 'Brightcurrent' },
      { label: 'Kelvara' },
      { label: 'peatworks' },
      { label: 'Solvent' },
    ],
    animation: 'fade',
  },
  schema: schema(
    headingField,
    repeater('items', 'Logos', [text('label', 'Name'), image('image', 'Logo image')], { itemLabel: 'Logo' }),
  ),
  component: function LogosQuarry(props) {
    const edit = editOf(props)
    const logos = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-qr ud-qr-logos" align="center">
        {str(props.heading) || edit ? (
          <EditableText
            edit={edit}
            path={['heading']}
            value={str(props.heading)}
            as="p"
            className="ud-qr-logos__label"
            placeholder="Trusted by"
          />
        ) : null}
        <div className="ud-qr-logos__row">
          {logos.map((item, index) =>
            str(item.image) ? (
              <img key={index} src={str(item.image)} alt={str(item.label)} className="ud-qr-logos__img" loading="lazy" />
            ) : (
              <EditableText
                key={index}
                edit={edit}
                path={['items', index, 'label']}
                value={str(item.label)}
                as="span"
                className="ud-qr-logos__name"
                placeholder="Company"
              />
            ),
          )}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- stats.quarry */

export const statsQuarry = defineBlock({
  type: 'stats.quarry',
  version: 1,
  category: 'content',
  label: 'Quarry key figures',
  icon: 'Chart',
  defaultProps: {
    eyebrow: 'KEY FIGURES',
    heading: 'STOP RUNNING YOUR',
    headingHighlight: 'OPERATIONS',
    headingTail: 'LIKE IT IS 2011',
    description: 'Four numbers our customers quote back to us after the first billing cycle.',
    items: [
      { index: 'FIGURE 01', value: '3x', title: 'Faster exception clearing', text: 'Billing holds resolve in hours, not across a full cycle.' },
      { index: 'FIGURE 02', value: '+50%', title: 'More switches on time', text: 'Objection windows are worked before they lapse.' },
      { index: 'FIGURE 03', value: '100%', title: 'Actions carry evidence', text: 'Every write is attributed, timestamped, and replayable.' },
      { index: 'FIGURE 04', value: '12', title: 'Weeks to first go-live', text: 'One market segment live before the next quarter.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    text('headingHighlight', 'Highlighted phrase'),
    text('headingTail', 'Heading end'),
    descriptionField,
    repeater(
      'items',
      'Figures',
      [text('index', 'Index label'), text('value', 'Value'), text('title', 'Title'), textarea('text', 'Text')],
      { itemLabel: 'Figure' },
    ),
  ),
  component: function StatsQuarry(props) {
    const edit = editOf(props)
    const stats = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-qr ud-qr-stats">
        <HeadBlock props={props} />
        <div className="ud-qr-stats__grid" data-count={Math.min(stats.length || 4, 4)}>
          {stats.map((item, index) => (
            <article key={index} className="ud-qr-stats__card">
              <EditableText
                edit={edit}
                path={['items', index, 'index']}
                value={str(item.index)}
                as="span"
                className="ud-qr-stats__index"
                placeholder="FIGURE 01"
              />
              <EditableText
                edit={edit}
                path={['items', index, 'value']}
                value={str(item.value)}
                as="strong"
                className="ud-qr-stats__value"
                placeholder="3x"
              />
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-qr-stats__title"
                placeholder="Title"
              />
              <SafeText
                value={str(item.text)}
                className="ud-qr-stats__text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="Text"
              />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- split.quarry */

export const splitQuarry = defineBlock({
  type: 'split.quarry',
  version: 1,
  category: 'content',
  label: 'Quarry split panel',
  icon: 'Layout',
  defaultProps: {
    eyebrow: 'ONE CONTROL PLANE',
    heading: 'ONE LAYER BETWEEN YOUR TEAM, YOUR DATA, AND YOUR',
    headingHighlight: 'SUPPLIERS',
    description:
      'Quarry sits above the systems you already run. It reads from your settlement feeds, writes back through your own credentials, and keeps a record of both.',
    buttonLabel: 'See the platform',
    buttonUrl: '/platform',
    bullets:
      'Reads industry flows without a migration\nWrites back through your existing credentials\nEvery step attributed to a person or an agent\nNo customer data leaves your tenancy',
    image: '',
    imageAlt: 'Product interface',
    reverse: false,
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    text('headingHighlight', 'Highlighted phrase'),
    descriptionField,
    textarea('bullets', 'Bullets (one per line)'),
    ...primaryCtaFields,
    image('image', 'Panel image'),
    text('imageAlt', 'Image alt text'),
    toggle('reverse', 'Panel on the left'),
  ),
  component: function SplitQuarry(props) {
    const edit = editOf(props)
    const bullets = str(props.bullets)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    return (
      <SectionShell props={props} className="ud-qr ud-qr-split">
        <div className={cx('ud-qr-split__grid', bool(props.reverse) && 'ud-qr-split__grid--reverse')}>
          <div className="ud-qr-split__copy">
            <Eyebrow props={props} />
            <MarkerHeading props={props} className="ud-qr-split__title" />
            <SafeText
              value={str(props.description)}
              className="ud-qr-lead"
              edit={edit}
              path={['description']}
              placeholder="Supporting copy"
            />
            {bullets.length ? (
              <ul className="ud-qr-split__list">
                {bullets.map((line, index) => (
                  <li key={index}>
                    <span className="ud-qr-tick" aria-hidden>
                      <Icon name="check" size={12} />
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {str(props.buttonLabel) || edit ? (
              <div className="ud-qr-split__cta">
                <QrButton href={str(props.buttonUrl, '#')}>
                  <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Learn more" />
                </QrButton>
              </div>
            ) : null}
          </div>
          <div className="ud-qr-split__panel">
            <Media
              src={props.image}
              alt={str(props.imageAlt)}
              ratio="landscape"
              className="ud-qr-split__media"
              edit={edit}
              path={['image']}
            />
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- pillars.quarry */

export const pillarsQuarry = defineBlock({
  type: 'pillars.quarry',
  version: 1,
  category: 'features',
  label: 'Quarry layered pillars',
  icon: 'Layers',
  defaultProps: {
    eyebrow: 'BUILT FOR OVERSIGHT',
    heading: 'FOUR LAYERS THAT MAKE AUTOMATED OPS SAFE IN',
    headingHighlight: 'LICENSED MARKETS',
    description:
      'Automation is the easy part. Proving what happened, to whom, and on whose authority is the part your regulator asks about.',
    bullets:
      'Every write carries an identity and a reason\nPermissions inherit from your own role model\nModels are pinned, versioned, and replayable\nEvidence exports in the format your auditor expects',
    items: [
      { title: 'Sovereign data', text: 'Records stay in your tenancy. Quarry holds pointers, never copies.' },
      { title: 'Scoped authority', text: 'An agent can only ever do what the person who ran it could do.' },
      { title: 'Human checkpoints', text: 'Value thresholds and risk bands route decisions back to a named reviewer.' },
      { title: 'Open attribution', text: 'One trail across people, agents, and jobs — exportable end to end.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    text('headingHighlight', 'Highlighted phrase'),
    descriptionField,
    textarea('bullets', 'Bullets (one per line)'),
    repeater('items', 'Layers', [text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Layer' }),
  ),
  component: function PillarsQuarry(props) {
    const edit = editOf(props)
    const layers = items(props.items, [])
    const bullets = str(props.bullets)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    return (
      <SectionShell props={props} className="ud-qr ud-qr-pillars">
        <div className="ud-qr-pillars__grid">
          <div className="ud-qr-pillars__copy">
            <Eyebrow props={props} />
            <MarkerHeading props={props} className="ud-qr-pillars__title" />
            <SafeText
              value={str(props.description)}
              className="ud-qr-lead"
              edit={edit}
              path={['description']}
              placeholder="Supporting copy"
            />
            {bullets.length ? (
              <ul className="ud-qr-pillars__list">
                {bullets.map((line, index) => (
                  <li key={index}>
                    <span className="ud-qr-tick" aria-hidden>
                      <Icon name="check" size={12} />
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="ud-qr-pillars__cards">
            {layers.map((item, index) => (
              <article key={index} className={cx('ud-qr-layer', index % 3 === 1 && 'ud-qr-layer--accent', index % 3 === 2 && 'ud-qr-layer--deep')}>
                <span className="ud-qr-layer__index" aria-hidden>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <EditableText
                  edit={edit}
                  path={['items', index, 'title']}
                  value={str(item.title)}
                  as="h3"
                  className="ud-qr-layer__title"
                  placeholder="Layer"
                />
                <SafeText
                  value={str(item.text)}
                  className="ud-qr-layer__text"
                  edit={edit}
                  path={['items', index, 'text']}
                  placeholder="Text"
                />
              </article>
            ))}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- steps.quarry */

export const stepsQuarry = defineBlock({
  type: 'steps.quarry',
  version: 1,
  category: 'features',
  label: 'Quarry numbered cards',
  icon: 'List',
  defaultProps: {
    eyebrow: 'WHY NOW',
    heading: 'THE TECH IS READY. THE ECONOMICS WORK. THE CONTEXT PROBLEM',
    headingHighlight: 'HAS AN ANSWER',
    columns: '3',
    items: [
      {
        title: 'Swap providers without rebuilding',
        text: 'Screening, metering, and payment vendors sit behind one contract. Changing one is a configuration change, not a project.',
      },
      {
        title: 'Measurable return in the first cycle',
        text: 'Price the work before you commit to it. Every automated path reports what it saved against the manual baseline.',
      },
      {
        title: 'Operational context, logged and observable',
        text: 'The reasoning behind each decision is captured next to the decision, so a review six months later is a lookup.',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    text('headingHighlight', 'Highlighted phrase'),
    descriptionField,
    select('columns', 'Columns', [['2', '2'], ['3', '3'], ['4', '4']], 'layout'),
    repeater('items', 'Cards', [text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Card' }),
  ),
  component: function StepsQuarry(props) {
    const edit = editOf(props)
    const cards = items(props.items, [])
    const columns = Math.min(Math.max(num(props.columns, Math.min(cards.length || 3, 4)), 1), 4)
    return (
      <SectionShell props={props} className="ud-qr ud-qr-steps">
        <HeadBlock props={props} />
        <div className="ud-qr-steps__grid" data-count={columns}>
          {cards.map((item, index) => (
            <article key={index} className="ud-qr-step">
              <span className="ud-qr-step__index" aria-hidden>
                {String(index + 1).padStart(2, '0')}
              </span>
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-qr-step__title"
                placeholder="Title"
              />
              <SafeText
                value={str(item.text)}
                className="ud-qr-step__text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="Text"
              />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- compare.quarry */

export const compareQuarry = defineBlock({
  type: 'compare.quarry',
  version: 1,
  category: 'pricing',
  label: 'Quarry comparison table',
  icon: 'Table',
  defaultProps: {
    eyebrow: 'AUTOMATED OPS IN LICENSED MARKETS',
    heading: 'THE SUPPLIERS WINNING TODAY RUN OPS ON A BACKBONE THAT IS',
    headingHighlight: 'GOVERNED BY DESIGN',
    tableTitle: 'What “governed by design” means when a licensed supplier automates its operations.',
    columnA: 'WHAT IT MEANS TO AUTOMATE OPS',
    columnB: 'WHAT GOVERNED BY DESIGN LOOKS LIKE',
    rows: [
      { label: 'Data residency', a: 'Customer data stays wherever it already lives.', b: 'Pointers, not copies. Nothing is duplicated into a vendor cloud.' },
      { label: 'Record of account', a: 'Every action is written back to your system of record.', b: 'One trail across people, agents, and jobs — exportable end to end.' },
      { label: 'Scoped permissions', a: 'Each agent operates inside a named role.', b: 'Same role model, one identity per action, revoked in one place.' },
      { label: 'Human escalation', a: 'Risk bands route the call back to a person.', b: 'Escalation thresholds set per segment, versioned with the policy.' },
      { label: 'Vendor neutrality', a: 'Providers are swapped by configuration.', b: 'No rebuild, no rewrite, no migration window.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    text('headingHighlight', 'Highlighted phrase'),
    text('tableTitle', 'Table intro'),
    text('columnA', 'Column A heading'),
    text('columnB', 'Column B heading'),
    repeater(
      'rows',
      'Rows',
      [text('label', 'Row label'), textarea('a', 'Column A'), textarea('b', 'Column B')],
      { itemLabel: 'Row' },
    ),
  ),
  component: function CompareQuarry(props) {
    const edit = editOf(props)
    const rows = items(props.rows, [])
    return (
      <SectionShell props={props} tone="dark" className="ud-qr ud-qr-compare">
        <Eyebrow props={props} />
        <MarkerHeading props={props} className="ud-qr-compare__title" />
        <div className="ud-qr-compare__panel">
          {str(props.tableTitle) || edit ? (
            <SafeText
              value={str(props.tableTitle)}
              className="ud-qr-compare__intro"
              edit={edit}
              path={['tableTitle']}
              placeholder="Table intro"
            />
          ) : null}
          <div className="ud-qr-compare__scroll">
            <table className="ud-qr-compare__table">
              <thead>
                <tr>
                  <th scope="col" />
                  <th scope="col">
                    <EditableText edit={edit} path={['columnA']} value={str(props.columnA)} as="span" placeholder="Column A" />
                  </th>
                  <th scope="col" className="ud-qr-compare__col--accent">
                    <EditableText edit={edit} path={['columnB']} value={str(props.columnB)} as="span" placeholder="Column B" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <th scope="row">
                      <EditableText edit={edit} path={['rows', index, 'label']} value={str(row.label)} as="span" placeholder="Row" />
                    </th>
                    <td>
                      <SafeText value={str(row.a)} edit={edit} path={['rows', index, 'a']} placeholder="Column A" />
                    </td>
                    <td className="ud-qr-compare__col--accent">
                      <SafeText value={str(row.b)} edit={edit} path={['rows', index, 'b']} placeholder="Column B" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- quote.quarry */

export const quoteQuarry = defineBlock({
  type: 'quote.quarry',
  version: 1,
  category: 'testimonials',
  label: 'Quarry accent quote',
  icon: 'Quote',
  defaultProps: {
    badge: 'Kelvara',
    quote: 'Our obligation is to clear a switch inside the industry window, every time. Quarry made that measurable instead of hopeful.',
    name: 'Marit Sundqvist',
    role: 'Head of Market Operations',
    pattern: 'scatter',
    animation: 'fade-up',
  },
  schema: schema(
    text('badge', 'Badge'),
    textarea('quote', 'Quote'),
    text('name', 'Name'),
    text('role', 'Role'),
    patternField,
  ),
  component: function QuoteQuarry(props) {
    const edit = editOf(props)
    const pattern = str(props.pattern, 'scatter')
    return (
      <SectionShell props={props} className="ud-qr ud-qr-quote">
        <div className="ud-qr-quote__band">
          {pattern !== 'none' ? <PixelArt pattern={pattern} className="ud-qr-quote__art" /> : null}
          <div className="ud-qr-quote__card">
            {str(props.badge) || edit ? (
              <EditableText
                edit={edit}
                path={['badge']}
                value={str(props.badge)}
                as="span"
                className="ud-qr-quote__badge"
                placeholder="Customer"
              />
            ) : null}
            <SafeText
              value={str(props.quote)}
              className="ud-qr-quote__text"
              edit={edit}
              path={['quote']}
              placeholder="Quote"
            />
            <p className="ud-qr-quote__by">
              <EditableText edit={edit} path={['name']} value={str(props.name)} as="strong" placeholder="Name" />
              <EditableText edit={edit} path={['role']} value={str(props.role)} as="span" placeholder="Role" />
            </p>
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- directory.quarry */

export const directoryQuarry = defineBlock({
  type: 'directory.quarry',
  version: 1,
  category: 'gallery',
  label: 'Quarry ecosystem grid',
  icon: 'Grid',
  defaultProps: {
    eyebrow: 'THE ECOSYSTEM',
    heading: 'EXPLORE THE FULL',
    headingHighlight: 'QUARRY ECOSYSTEM',
    description: 'Connect the data platforms, industry systems, and agents your operation already depends on.',
    columns: '4',
    items: [
      { title: 'Northmeter', text: 'Half-hourly meter reads streamed straight into your validation queue.', tags: 'METERING' },
      { title: 'Halden Grid', text: 'Settlement flows and industry messaging without a bespoke adapter.', tags: 'SETTLEMENT' },
      { title: 'Brightcurrent', text: 'Tariff modelling and price-change orchestration across segments.', tags: 'BILLING' },
      { title: 'Kelvara', text: 'Vulnerable-customer flags surfaced beside the account, not in a separate tool.', tags: 'CARE' },
      { title: 'Peatworks', text: 'Carbon and REGO reconciliation with an exportable audit position.', tags: 'REPORTING' },
      { title: 'Solvent', text: 'Payment retries and arrears journeys governed by your own policy.', tags: 'PAYMENTS' },
      { title: 'Cairnstack', text: 'Warehouse connectors for the models your analysts already trust.', tags: 'DATA' },
      { title: 'Lowfield', text: 'Field-visit scheduling that respects safeguarding and access notes.', tags: 'FIELD OPS' },
    ],
    buttonLabel: 'Browse the ecosystem',
    buttonUrl: '/ecosystem',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    text('headingHighlight', 'Highlighted phrase'),
    descriptionField,
    select('columns', 'Columns', [['2', '2'], ['3', '3'], ['4', '4']], 'layout'),
    repeater(
      'items',
      'Entries',
      [icon('icon', 'Icon'), text('title', 'Name'), textarea('text', 'Text'), text('tags', 'Tag')],
      { itemLabel: 'Entry' },
    ),
    ...primaryCtaFields,
  ),
  component: function DirectoryQuarry(props) {
    const edit = editOf(props)
    const entries = items(props.items, [])
    const columns = Math.min(Math.max(num(props.columns, 4), 1), 4)
    return (
      <SectionShell props={props} className="ud-qr ud-qr-directory">
        <HeadBlock props={props} />
        <div className="ud-qr-directory__grid" data-count={columns}>
          {entries.map((item, index) => (
            <article key={index} className="ud-qr-tool">
              <span className="ud-qr-tool__mark" aria-hidden>
                <Icon name={str(item.icon, 'layers')} size={15} />
              </span>
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-qr-tool__title"
                placeholder="Name"
              />
              <SafeText
                value={str(item.text)}
                className="ud-qr-tool__text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="Text"
              />
              {str(item.tags) || edit ? (
                <EditableText
                  edit={edit}
                  path={['items', index, 'tags']}
                  value={str(item.tags)}
                  as="span"
                  className="ud-qr-tool__tag"
                  placeholder="TAG"
                />
              ) : null}
            </article>
          ))}
        </div>
        {str(props.buttonLabel) || edit ? (
          <div className="ud-qr-directory__cta">
            <QrButton href={str(props.buttonUrl, '#')}>
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Browse" />
            </QrButton>
          </div>
        ) : null}
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------------- faq.quarry */

export const faqQuarry = defineBlock({
  type: 'faq.quarry',
  version: 1,
  category: 'faq',
  label: 'Quarry FAQ',
  icon: 'HelpCircle',
  defaultProps: {
    heading: 'FREQUENTLY ASKED',
    headingTail: 'QUESTIONS',
    description: 'Still have a question? Book a conversation with a Quarry engineer.',
    buttonLabel: 'Book a demo',
    buttonUrl: '/contact',
    items: [
      {
        question: 'What is automated ops?',
        answer:
          'Software that carries out an operational task end to end — reading the data, applying your policy, writing the result back — while recording who authorised it and why. It is not a chatbot bolted onto a queue.',
      },
      {
        question: 'How is this different from the automation we already have?',
        answer:
          'Rule engines break the moment a case falls outside the rule. Quarry handles the judgement cases by escalating them with the full context attached, rather than dropping them into an exceptions report nobody reads.',
      },
      {
        question: 'Does our customer data leave our environment?',
        answer:
          'No. Quarry holds pointers and executes against your systems using your credentials. Records stay in the tenancy they already live in.',
      },
      {
        question: 'Which industry systems can you connect to?',
        answer:
          'Settlement and metering flows, the major billing platforms, your warehouse, and anything with a documented API. Connectors are configuration, not bespoke development.',
      },
      {
        question: 'How long does a first go-live take?',
        answer:
          'One segment in about twelve weeks, including the evidence pack your compliance team signs off. Broader rollout follows segment by segment.',
      },
      {
        question: 'How do you handle model changes?',
        answer:
          'Models are pinned per workflow and versioned with the policy that invoked them. A change is a deliberate, reviewable event, never a silent upgrade.',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    text('headingTail', 'Heading second line'),
    descriptionField,
    ...primaryCtaFields,
    repeater('items', 'Questions', [text('question', 'Question'), textarea('answer', 'Answer')], {
      itemLabel: 'Question',
    }),
  ),
  component: function FaqQuarry(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-qr ud-qr-faq">
        <div className="ud-qr-faq__grid">
          <div className="ud-qr-faq__aside">
            <h2 className="ud-h2 ud-qr-title ud-qr-faq__title">
              <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="span" placeholder="Frequently asked" />
              <br />
              <EditableText edit={edit} path={['headingTail']} value={str(props.headingTail)} as="span" placeholder="questions" />
            </h2>
            {str(props.description) || edit ? (
              <SafeText
                value={str(props.description)}
                className="ud-qr-faq__lead"
                edit={edit}
                path={['description']}
                placeholder="Supporting copy"
              />
            ) : null}
            {str(props.buttonLabel) || edit ? (
              <QrButton href={str(props.buttonUrl, '#')}>
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Book a demo" />
              </QrButton>
            ) : null}
          </div>
          <div className="ud-qr-faq__list">
            {rows.map((item, index) => (
              <details key={index} className="ud-qr-faq__row">
                <summary className="ud-qr-faq__q">
                  <EditableText
                    edit={edit}
                    path={['items', index, 'question']}
                    value={str(item.question)}
                    as="span"
                    placeholder="Question"
                  />
                  <span className="ud-qr-faq__sign" aria-hidden />
                </summary>
                <SafeText
                  value={str(item.answer)}
                  className="ud-qr-faq__a"
                  edit={edit}
                  path={['items', index, 'answer']}
                  placeholder="Answer"
                />
              </details>
            ))}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- ctaband.quarry */

export const ctaBandQuarry = defineBlock({
  type: 'ctaband.quarry',
  version: 1,
  category: 'cta',
  label: 'Quarry CTA band',
  icon: 'Megaphone',
  defaultProps: {
    eyebrow: 'GET STARTED',
    heading: 'LEVEL UP YOUR',
    headingHighlight: 'OPS GAME',
    description: 'One control plane. Every action traced — human, agent, or scheduled job.',
    buttonLabel: 'Book a demo',
    buttonUrl: '/contact',
    pattern: 'stair',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    text('headingHighlight', 'Highlighted phrase'),
    descriptionField,
    ...primaryCtaFields,
    patternField,
  ),
  component: function CtaBandQuarry(props) {
    const edit = editOf(props)
    const pattern = str(props.pattern, 'stair')
    return (
      <SectionShell props={props} className="ud-qr ud-qr-ctaband">
        <div className="ud-qr-ctaband__band">
          <div className="ud-qr-ctaband__copy">
            <Eyebrow props={props} />
            <MarkerHeading props={props} className="ud-qr-ctaband__title" />
            <SafeText
              value={str(props.description)}
              className="ud-qr-ctaband__text"
              edit={edit}
              path={['description']}
              placeholder="Supporting copy"
            />
            {str(props.buttonLabel) || edit ? (
              <QrButton href={str(props.buttonUrl, '#')} variant="accent">
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Book a demo" />
              </QrButton>
            ) : null}
          </div>
          {pattern !== 'none' ? <PixelArt pattern={pattern} className="ud-qr-ctaband__art" /> : null}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- contact.quarry */

export const contactQuarry = defineBlock({
  type: 'contact.quarry',
  version: 1,
  category: 'form',
  label: 'Quarry contact form',
  icon: 'Mail',
  defaultProps: {
    eyebrow: 'CONTACT US',
    heading: 'READY TO',
    headingHighlight: 'HELP',
    description: 'Describe your request and our team will point you at the shortest route to a solution.',
    formId: '',
    buttonLabel: 'Submit',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    text('headingHighlight', 'Highlighted phrase'),
    descriptionField,
    text('formId', 'Connected form'),
    text('buttonLabel', 'Submit label'),
  ),
  component: function ContactQuarry(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="surface" className="ud-qr ud-qr-contact">
        <div className="ud-qr-contact__grid">
          <div className="ud-qr-contact__copy">
            <span className="ud-qr-contact__chip">
              <span className="ud-qr-eyebrow__dot" aria-hidden />
              <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="span" placeholder="CONTACT US" />
            </span>
            <MarkerHeading props={props} className="ud-qr-contact__title" />
            <SafeText
              value={str(props.description)}
              className="ud-qr-contact__lead"
              edit={edit}
              path={['description']}
              placeholder="Supporting copy"
            />
          </div>
          <div className="ud-qr-contact__card">
            <PublicForm
              formId={str(props.formId) || undefined}
              submitLabel={str(props.buttonLabel, 'Submit')}
              edit={edit}
              submitLabelPath={['buttonLabel']}
              fields={[
                { name: 'first_name', label: 'First Name', type: 'text', required: true, placeholder: 'Jane' },
                { name: 'last_name', label: 'Last Name', type: 'text', required: true, placeholder: 'Smith' },
                { name: 'company', label: 'Company', type: 'text', placeholder: 'Acme Corporation' },
                { name: 'email', label: 'Work email', type: 'email', required: true, placeholder: 'jane@quarry.app' },
                { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 555 123 4567' },
                {
                  name: 'message',
                  label: 'Comments (optional)',
                  type: 'textarea',
                  placeholder: 'Anything else you would like to share for more context?',
                },
              ]}
            />
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ footer.quarry */

export const footerQuarry = defineBlock({
  type: 'footer.quarry',
  version: 1,
  category: 'footer',
  label: 'Quarry mega footer',
  icon: 'Layout',
  defaultProps: {
    logo: 'Quarry',
    logoIcon: 'layers',
    logoUrl: '/',
    tagline: 'The operational infrastructure licensed suppliers grow on',
    social: [
      { icon: 'twitter', url: '#' },
      { icon: 'linkedin', url: '#' },
      { icon: 'youtube', url: '#' },
      { icon: 'message', url: '#' },
    ],
    copyright: 'Copyright © 2026 Quarry',
    columns: [
      {
        title: 'GET STARTED',
        links: [
          { label: 'Automated Ops', url: '/platform' },
          { label: 'Sign up for free', url: '/contact' },
          { label: 'Book a demo', url: '/contact' },
        ],
      },
      {
        title: 'CUSTOMER LIFECYCLE',
        links: [
          { label: 'Customer onboarding', url: '/onboarding' },
          { label: 'Account management', url: '/onboarding' },
          { label: 'Billing exceptions', url: '/platform' },
          { label: 'Disputes & support cases', url: '/platform' },
          { label: 'Annual statement runs', url: '/platform' },
          { label: 'Request for information', url: '/contact' },
        ],
      },
      {
        title: 'PROCESSES',
        links: [
          { label: 'Meter data validation', url: '/platform' },
          { label: 'Supplier switching', url: '/platform' },
          { label: 'Arrears & affordability', url: '/platform' },
          { label: 'Regulatory reporting', url: '/platform' },
          { label: 'Multi-supplier orchestration', url: '/platform' },
        ],
      },
      {
        title: 'INDUSTRIES',
        links: [
          { label: 'Energy retail', url: '/onboarding' },
          { label: 'Water', url: '/onboarding' },
          { label: 'District heating', url: '/onboarding' },
          { label: 'EV charging networks', url: '/onboarding' },
          { label: 'Metering agents', url: '/onboarding' },
        ],
      },
      {
        title: 'COMPANY',
        links: [
          { label: 'Contact', url: '/contact' },
          { label: 'Trust Center', url: '#' },
          { label: 'Support', url: '/contact' },
          { label: 'Blog', url: '#' },
          { label: 'Podcast', url: '#' },
        ],
      },
      {
        title: 'PLATFORM',
        links: [
          { label: 'Quarry Backend', url: '/platform#backbone' },
          { label: 'Data integration', url: '/platform' },
          { label: 'Dashboards & analytics', url: '/platform' },
          { label: 'Workflows', url: '/platform' },
          { label: 'Approvals & escalation', url: '/platform' },
          { label: 'Audit trails', url: '/platform' },
          { label: 'Roles & permissions', url: '/platform' },
        ],
      },
      {
        title: 'ECOSYSTEM',
        links: [
          { label: 'Integrations', url: '/ecosystem' },
          { label: 'Agents', url: '/ecosystem' },
          { label: 'Utilities', url: '/ecosystem' },
          { label: 'Partners', url: '/ecosystem' },
        ],
      },
      {
        title: 'DEVELOPERS',
        links: [
          { label: 'Documentation', url: '#' },
          { label: 'GitHub', url: '#' },
          { label: 'Status', url: '#' },
          { label: 'Forum', url: '#' },
        ],
      },
    ],
    badges: [
      { label: 'AICPA SOC 2' },
      { label: 'GDPR' },
      { label: 'ISO 27001' },
    ],
    legal: [
      { label: 'Privacy Policy', url: '#' },
      { label: 'Terms and Conditions', url: '#' },
      { label: 'Data Processing Addendum', url: '#' },
      { label: 'Sub-processors', url: '#' },
      { label: 'Responsible disclosure Policy', url: '#' },
    ],
    pattern: 'stair',
    animation: 'fade',
  },
  schema: schema(
    text('logo', 'Brand'),
    icon('logoIcon', 'Mark icon'),
    link('logoUrl', 'Brand link'),
    textarea('tagline', 'Tagline'),
    repeater('social', 'Social', [icon('icon', 'Icon'), link('url', 'URL')], { itemLabel: 'Link' }),
    text('copyright', 'Copyright'),
    repeater(
      'columns',
      'Link columns',
      [text('title', 'Title'), repeater('links', 'Links', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Link' })],
      { itemLabel: 'Column' },
    ),
    repeater('badges', 'Compliance badges', [text('label', 'Label')], { itemLabel: 'Badge' }),
    repeater('legal', 'Legal links', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Link' }),
    patternField,
  ),
  component: function FooterQuarry(props) {
    const edit = editOf(props)
    const columns = items(props.columns, [])
    const social = items(props.social, [])
    const badges = items(props.badges, [])
    const legal = items(props.legal, [])
    const pattern = str(props.pattern, 'stair')
    return (
      <SectionShell props={props} tone="default" className="ud-qr ud-qr-footer">
        <div className="ud-qr-footer__top">
          <div className="ud-qr-footer__brand">
            <BrandMark props={props} />
            <SafeText
              value={str(props.tagline)}
              className="ud-qr-footer__tagline"
              edit={edit}
              path={['tagline']}
              placeholder="Tagline"
            />
            <div className="ud-qr-footer__social">
              {social.map((item, index) => (
                <a key={index} href={str(item.url, '#')} aria-label={str(item.icon, 'link')}>
                  <Icon name={str(item.icon, 'globe')} size={15} />
                </a>
              ))}
            </div>
            <SafeText
              value={str(props.copyright)}
              className="ud-qr-footer__copy"
              edit={edit}
              path={['copyright']}
              placeholder="Copyright"
            />
            {pattern !== 'none' ? <PixelArt pattern={pattern} className="ud-qr-footer__art" /> : null}
          </div>

          <div className="ud-qr-footer__cols">
            {columns.map((column, index) => (
              <div key={index} className="ud-qr-footer__col">
                <EditableText
                  edit={edit}
                  path={['columns', index, 'title']}
                  value={str(column.title)}
                  as="h3"
                  className="ud-qr-footer__col-title"
                  placeholder="COLUMN"
                />
                <ul>
                  {items(column.links, []).map((item, linkIndex) => (
                    <li key={linkIndex}>
                      <a href={str(item.url, '#')}>
                        <EditableText
                          edit={edit}
                          path={['columns', index, 'links', linkIndex, 'label']}
                          value={str(item.label)}
                          placeholder="Link"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="ud-qr-footer__bottom">
          <div className="ud-qr-footer__badges">
            {badges.map((item, index) => (
              <span key={index} className="ud-qr-badge">
                <EditableText
                  edit={edit}
                  path={['badges', index, 'label']}
                  value={str(item.label)}
                  as="span"
                  placeholder="BADGE"
                />
              </span>
            ))}
          </div>
          <ul className="ud-qr-footer__legal">
            {legal.map((item, index) => (
              <li key={index}>
                <a href={str(item.url, '#')}>
                  <EditableText edit={edit} path={['legal', index, 'label']} value={str(item.label)} placeholder="Legal" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </SectionShell>
    )
  },
})

/* Re-exported so the registry import stays a single statement. */
export const quarryBlocks = [
  navbarQuarry,
  heroQuarry,
  logosQuarry,
  statsQuarry,
  splitQuarry,
  pillarsQuarry,
  stepsQuarry,
  compareQuarry,
  quoteQuarry,
  directoryQuarry,
  faqQuarry,
  ctaBandQuarry,
  contactQuarry,
  footerQuarry,
]
