/**
 * Tessera — a light, editorial B2B product family.
 *
 * Design language: a near-white page ruled by hairline dividers, one warm
 * ember accent, a geometric grotesk set tight for headlines, and two-tone
 * headings where the second line drops to muted. Sections are separated by
 * 1px rules rather than colour changes, so the page reads as one continuous
 * sheet with a black footer closing it.
 *
 * Every block is inline-editable and inherits the shared tone / animation /
 * typography / spacing / background controls through `schema()`.
 */
import type { CSSProperties, ReactNode } from 'react'
import { Fragment, useState } from 'react'
import { EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Button,
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

function tsLinks(props: Props) {
  return items(props.links, []).map((item) => ({
    label: str(item.label),
    url: str(item.url) || str(item.href) || '#',
    children: item.children,
  }))
}

function BrandMark({ props, className }: { props: Props; className?: string }) {
  const edit = editOf(props)
  return (
    <a href={str(props.logoUrl, '/')} className={cx('ud-ts-brand', className)}>
      <span className="ud-ts-brand__mark" aria-hidden>
        <Icon name={str(props.logoIcon, 'layers')} size={15} />
      </span>
      <EditableText edit={edit} path={['logo']} value={str(props.logo, 'Tessera')} placeholder="Brand" />
    </a>
  )
}

/** Pill button with the trailing arrow disc used across the family. */
function TsButton({
  href,
  children,
  variant = 'primary',
  arrow = false,
}: {
  href: string
  children: ReactNode
  variant?: 'primary' | 'quiet' | 'solid'
  arrow?: boolean
}) {
  return (
    <Button
      href={href}
      variant={variant === 'solid' ? 'primary' : 'ghost'}
      className={cx('ud-ts-btn', `ud-ts-btn--${variant}`)}
    >
      <span>{children}</span>
      {arrow ? (
        <span className="ud-ts-btn__disc" aria-hidden>
          <Icon name="arrow" size={13} />
        </span>
      ) : null}
    </Button>
  )
}

/**
 * Two-tone section heading: the first line sits at full contrast, the trailing
 * phrase drops to muted. Both halves are separate props so either can be
 * edited on canvas without touching the other.
 */
function DuoHeading({
  props,
  as: Tag = 'h2',
  className,
  leadPlaceholder = 'Heading',
  tailPlaceholder = 'second line',
}: {
  props: Props
  as?: 'h1' | 'h2'
  className?: string
  leadPlaceholder?: string
  tailPlaceholder?: string
}) {
  const edit = editOf(props)
  const tail = str(props.headingTail)
  return (
    <Tag className={cx(Tag === 'h1' ? 'ud-h1' : 'ud-h2', 'ud-ts-duo', className)}>
      <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="span" placeholder={leadPlaceholder} />
      {tail || edit ? (
        <>
          {' '}
          <EditableText
            edit={edit}
            path={['headingTail']}
            value={tail}
            as="span"
            className="ud-ts-duo__tail"
            placeholder={tailPlaceholder}
          />
        </>
      ) : null}
    </Tag>
  )
}

function SectionHead({
  props,
  centered = true,
  as = 'h2',
}: {
  props: Props
  centered?: boolean
  as?: 'h1' | 'h2'
}) {
  const edit = editOf(props)
  return (
    <header className={cx('ud-ts-head', centered && 'ud-ts-head--center')}>
      {str(props.eyebrow) || edit ? (
        <EditableText
          edit={edit}
          path={['eyebrow']}
          value={str(props.eyebrow)}
          as="p"
          className="ud-ts-eyebrow"
          placeholder="SECTION"
        />
      ) : null}
      <DuoHeading props={props} as={as} />
      {str(props.description) || edit ? (
        <SafeText
          value={str(props.description)}
          className="ud-ts-lead"
          edit={edit}
          path={['description']}
          placeholder="Supporting copy"
        />
      ) : null}
    </header>
  )
}

const navLinkDefaults = [
  { label: 'Platform', url: '/platform' },
  { label: 'Solutions', url: '/platform#solutions' },
  { label: 'Pricing', url: '/pricing' },
  { label: 'Company', url: '/careers' },
]

const itemFields = [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Text')]

/* ---------------------------------------------------------- announce.tessera */

export const announceTessera = defineBlock({
  type: 'announce.tessera',
  version: 1,
  category: 'navigation',
  label: 'Tessera announcement bar',
  icon: 'Sparkles',
  defaultProps: {
    message: 'Winter release is live · Route Planner and anomaly alerts',
    buttonLabel: 'See what shipped',
    buttonUrl: '/platform',
    // Off by default: the strip is meant to scroll away and leave the navbar
    // pinned on its own. Turn it on and both bars stack, navbar on top.
    sticky: false,
    animation: 'fade-down',
    animationTrigger: 'load',
    animationDuration: 500,
  },
  schema: schema(text('message', 'Message'), ...primaryCtaFields, stickyField),
  component: function AnnounceTessera(props) {
    const edit = editOf(props)
    const anim = animationOf(props)
    return (
      <aside
        className={cx('ud-ts-announce', bool(props.sticky) && 'ud-ts-announce--sticky', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container ud-ts-announce__bar">
          <EditableText
            edit={edit}
            path={['message']}
            value={str(props.message)}
            as="span"
            className="ud-ts-announce__text"
            placeholder="Announcement"
          />
          {str(props.buttonLabel) || edit ? (
            <a href={str(props.buttonUrl, '#')} className="ud-ts-announce__link">
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Link" />
              <Icon name="arrow" size={12} />
            </a>
          ) : null}
        </div>
      </aside>
    )
  },
})

/* ------------------------------------------------------------ navbar.tessera */

export const navbarTessera = defineBlock({
  type: 'navbar.tessera',
  version: 1,
  category: 'navigation',
  label: 'Tessera navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Tessera',
    logoIcon: 'layers',
    logoUrl: '/',
    links: navLinkDefaults,
    secondaryLabel: 'Sign in',
    secondaryUrl: '/pricing',
    buttonLabel: 'Start free',
    buttonUrl: '/pricing',
    sticky: true,
    animation: 'fade',
    animationTrigger: 'load',
  },
  schema: schema(
    text('logo', 'Brand'),
    icon('logoIcon', 'Mark icon'),
    link('logoUrl', 'Brand link'),
    navLinksField('links', 'Links'),
    ...ctaFields,
    stickyField,
  ),
  component: function NavbarTessera(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    const links = tsLinks(props)
    const anim = animationOf(props)
    return (
      <header
        className={cx('ud-ts-nav', bool(props.sticky, true) && 'ud-ts-nav--sticky', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container ud-ts-nav__bar">
          <BrandMark props={props} />
          <nav className={cx('ud-ts-nav__links', open && 'is-open')} aria-label="Primary">
            {links.map((item, index) => (
              <NavItem key={`${item.url}-${index}`} item={item}>
                <a href={item.url} className="ud-ts-nav__link">
                  <EditableText edit={edit} path={['links', index, 'label']} value={item.label} placeholder="Link" />
                  <SubmenuCaret show={hasSubmenu(item)} />
                </a>
                <Submenu props={props} item={item} index={index} />
              </NavItem>
            ))}
          </nav>
          <div className="ud-ts-nav__actions">
            {str(props.secondaryLabel) || edit ? (
              <a href={str(props.secondaryUrl, '#')} className="ud-ts-nav__signin">
                <EditableText edit={edit} path={['secondaryLabel']} value={str(props.secondaryLabel)} placeholder="Sign in" />
              </a>
            ) : null}
            {str(props.buttonLabel) || edit ? (
              <TsButton href={str(props.buttonUrl, '#')}>
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Start free" />
              </TsButton>
            ) : null}
          </div>
          <button
            type="button"
            className="ud-ts-nav__toggle"
            aria-expanded={open}
            aria-label="Menu"
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </header>
    )
  },
})

/* -------------------------------------------------------------- hero.tessera */

export const heroTessera = defineBlock({
  type: 'hero.tessera',
  version: 1,
  category: 'hero',
  label: 'Tessera hero',
  icon: 'Sparkles',
  defaultProps: {
    heading: 'See every site, asset, and crew',
    headingTail: 'before the day goes sideways',
    description:
      'Depots, plant rooms, and field crews all report differently. Tessera folds those feeds into one operating picture, flags drift before it becomes downtime, and tells your dispatchers where to go next.',
    buttonLabel: 'Start free',
    buttonUrl: '/pricing',
    secondaryLabel: 'Book a walkthrough',
    secondaryUrl: '/platform',
    animation: 'fade-up',
    animationTrigger: 'load',
    animationDuration: 900,
  },
  schema: schema(
    headingField,
    text('headingTail', 'Heading second line'),
    descriptionField,
    ...ctaFields,
  ),
  component: function HeroTessera(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-ts ud-ts-hero" align="center">
        <div className="ud-ts-hero__copy">
          <DuoHeading
            props={props}
            as="h1"
            className="ud-ts-hero__title"
            leadPlaceholder="Headline"
            tailPlaceholder="second line"
          />
          <SafeText
            value={str(props.description)}
            className="ud-ts-hero__lead"
            edit={edit}
            path={['description']}
            placeholder="Supporting copy"
          />
          <div className="ud-ts-hero__cta">
            {str(props.buttonLabel) || edit ? (
              <TsButton href={str(props.buttonUrl, '#')} arrow>
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Start free" />
              </TsButton>
            ) : null}
            {str(props.secondaryLabel) || edit ? (
              <TsButton href={str(props.secondaryUrl, '#')} variant="quiet">
                <EditableText
                  edit={edit}
                  path={['secondaryLabel']}
                  value={str(props.secondaryLabel)}
                  placeholder="Book a demo"
                />
              </TsButton>
            ) : null}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- showcase.tessera */

export const showcaseTessera = defineBlock({
  type: 'showcase.tessera',
  version: 1,
  category: 'features',
  label: 'Tessera showcase columns',
  icon: 'Layers',
  defaultProps: {
    items: [
      {
        icon: 'cpu',
        badge: 'Early access',
        title: 'Asset Telemetry',
        text: 'Stream readings from pumps, chillers, and generators into one timeline with drift detection built in.',
        linkLabel: 'Explore Asset Telemetry',
        linkUrl: '/platform#telemetry',
        image:
          'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80',
      },
      {
        icon: 'truck',
        badge: 'Early access',
        title: 'Crew Dispatch',
        text: 'Match the nearest qualified crew to the work order, with travel time and parts availability already priced in.',
        linkLabel: 'Explore Crew Dispatch',
        linkUrl: '/platform#dispatch',
        image:
          'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1000&q=80',
      },
      {
        icon: 'chart',
        badge: 'Early access',
        title: 'Route Planner',
        text: 'Sequence planned, reactive, and statutory work into one run per van, with a repair slot held back.',
        linkLabel: 'Explore Route Planner',
        linkUrl: '/platform#routing',
        image:
          'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1000&q=80',
      },
    ],
    columns: '3',
    animation: 'fade-up',
  },
  schema: schema(
    select('columns', 'Columns', [['2', '2'], ['3', '3'], ['4', '4']], 'layout'),
    repeater(
      'items',
      'Cards',
      [
        image('image', 'Image'),
        icon('icon', 'Mark icon'),
        text('badge', 'Badge'),
        text('title', 'Title'),
        textarea('text', 'Text'),
        text('linkLabel', 'Link label'),
        link('linkUrl', 'Link URL'),
      ],
      { itemLabel: 'Card' },
    ),
  ),
  component: function ShowcaseTessera(props) {
    const edit = editOf(props)
    const cards = items(props.items, [])
    // Falls back to the card count so a row never ends in an empty cell; the
    // Columns control overrides it when someone wants a deliberate gap.
    const columns = Math.min(Math.max(num(props.columns, Math.min(cards.length || 3, 4)), 1), 4)
    /*
     * Content width drives the wrapper. Narrow / Default / Wide put the cards
     * inside `.ud-container`, so they line up with every other section on the
     * site — Default resolves to the theme's own container width. Only Full
     * bleeds edge to edge, where a bordered box would have nothing to sit in.
     */
    const fullBleed = str(props.contentWidth, 'default') === 'full'
    return (
      <SectionShell
        props={props}
        className={cx('ud-ts', 'ud-ts-showcase', fullBleed ? 'ud-ts-showcase--bleed' : 'ud-ts-showcase--boxed')}
        bleed={fullBleed}
      >
        <div className="ud-ts-showcase__grid" data-count={columns}>
          {cards.map((item, index) => (
            <article key={index} className="ud-ts-showcase__card">
              <Media
                src={item.image}
                alt={str(item.title)}
                ratio="landscape"
                className="ud-ts-showcase__media"
                edit={edit}
                path={['items', index, 'image']}
              />
              <div className="ud-ts-showcase__body">
                <div className="ud-ts-showcase__meta">
                  <span className="ud-ts-chip" aria-hidden>
                    <Icon name={str(item.icon, 'layers')} size={14} />
                  </span>
                  {str(item.badge) || edit ? (
                    <EditableText
                      edit={edit}
                      path={['items', index, 'badge']}
                      value={str(item.badge)}
                      as="span"
                      className="ud-ts-pill"
                      placeholder="Badge"
                    />
                  ) : null}
                </div>
                <EditableText
                  edit={edit}
                  path={['items', index, 'title']}
                  value={str(item.title)}
                  as="h3"
                  className="ud-ts-showcase__title"
                  placeholder="Title"
                />
                <SafeText
                  value={str(item.text)}
                  className="ud-ts-showcase__text"
                  edit={edit}
                  path={['items', index, 'text']}
                  placeholder="Description"
                />
                {str(item.linkLabel) || edit ? (
                  <a href={str(item.linkUrl, '#')} className="ud-ts-link">
                    <EditableText
                      edit={edit}
                      path={['items', index, 'linkLabel']}
                      value={str(item.linkLabel)}
                      placeholder="Learn more"
                    />
                    <Icon name="arrow" size={13} />
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- pillars.tessera */

export const pillarsTessera = defineBlock({
  type: 'pillars.tessera',
  version: 1,
  category: 'features',
  label: 'Tessera ruled columns',
  icon: 'Columns',
  defaultProps: {
    heading: 'Why fragmented ops',
    headingTail: 'cost you twice',
    description: 'It is not a reporting problem. It is a sequencing problem that reporting made visible.',
    items: [
      {
        title: 'Signals arrive late',
        text: 'By the time a spreadsheet reaches the depot manager, the window to act cheaply has already closed.',
      },
      {
        title: 'Crews get double-booked',
        text: 'Two systems, two truths. The nearest van is dispatched to the wrong site while a critical one waits.',
      },
      {
        title: 'Nobody owns the pattern',
        text: 'Recurring faults look like one-offs when each site keeps its own log in its own format.',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    text('headingTail', 'Heading second line'),
    descriptionField,
    repeater('items', 'Columns', [text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Column' }),
  ),
  component: function PillarsTessera(props) {
    const edit = editOf(props)
    const cols = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-ts ud-ts-pillars">
        <SectionHead props={props} />
        <div className="ud-ts-pillars__grid" data-count={cols.length}>
          {cols.map((item, index) => (
            <div key={index} className="ud-ts-pillars__col">
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-ts-pillars__title"
                placeholder="Title"
              />
              <SafeText
                value={str(item.text)}
                className="ud-ts-pillars__text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="Text"
              />
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- split.tessera */

export const splitTessera = defineBlock({
  type: 'split.tessera',
  version: 1,
  category: 'content',
  label: 'Tessera split panel',
  icon: 'Layout',
  defaultProps: {
    heading: 'One queue for the whole network',
    description:
      'Tessera ranks open work by cost of delay, not by whoever shouted last. Dispatchers see the same list on the wallboard and in the cab.',
    buttonLabel: 'Start free',
    buttonUrl: '/pricing',
    secondaryLabel: 'Book a walkthrough',
    secondaryUrl: '/platform',
    panelTitle: 'Bay 04 · Chiller 2',
    panelBadge: 'Priority',
    panelText: 'Discharge pressure has drifted 14% above baseline across the last three cycles.',
    cardTitle: 'Dispatch · Rivas, M.',
    cardMeta: 'ETA 24 min · Parts on van',
    cardImage:
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&q=80',
    reverse: false,
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    descriptionField,
    ...ctaFields,
    text('panelTitle', 'Panel title'),
    text('panelBadge', 'Panel badge'),
    textarea('panelText', 'Panel text'),
    text('cardTitle', 'Card title'),
    text('cardMeta', 'Card meta'),
    image('cardImage', 'Card image'),
    toggle('reverse', 'Panel on the left'),
  ),
  component: function SplitTessera(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-ts ud-ts-split">
        <div className={cx('ud-ts-split__grid', bool(props.reverse) && 'ud-ts-split__grid--reverse')}>
          <div className="ud-ts-split__copy">
            <EditableText
              edit={edit}
              path={['heading']}
              value={str(props.heading)}
              as="h2"
              className="ud-h2 ud-ts-split__title"
              placeholder="Heading"
            />
            <SafeText
              value={str(props.description)}
              className="ud-ts-lead"
              edit={edit}
              path={['description']}
              placeholder="Supporting copy"
            />
            <div className="ud-ts-split__cta">
              {str(props.buttonLabel) || edit ? (
                <TsButton href={str(props.buttonUrl, '#')} arrow>
                  <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Start free" />
                </TsButton>
              ) : null}
              {str(props.secondaryLabel) || edit ? (
                <TsButton href={str(props.secondaryUrl, '#')} variant="quiet">
                  <EditableText
                    edit={edit}
                    path={['secondaryLabel']}
                    value={str(props.secondaryLabel)}
                    placeholder="Book a demo"
                  />
                </TsButton>
              ) : null}
            </div>
          </div>

          <div className="ud-ts-split__panel">
            <div className="ud-ts-panel__head">
              <span className="ud-ts-chip ud-ts-chip--accent" aria-hidden>
                <Icon name="cpu" size={14} />
              </span>
              <div>
                <EditableText
                  edit={edit}
                  path={['panelTitle']}
                  value={str(props.panelTitle)}
                  as="strong"
                  className="ud-ts-panel__title"
                  placeholder="Panel title"
                />
                <EditableText
                  edit={edit}
                  path={['panelBadge']}
                  value={str(props.panelBadge)}
                  as="span"
                  className="ud-ts-panel__badge"
                  placeholder="Badge"
                />
              </div>
            </div>
            <SafeText
              value={str(props.panelText)}
              className="ud-ts-panel__text"
              edit={edit}
              path={['panelText']}
              placeholder="Panel text"
            />
            <div className="ud-ts-panel__card">
              <div className="ud-ts-panel__card-copy">
                <EditableText
                  edit={edit}
                  path={['cardTitle']}
                  value={str(props.cardTitle)}
                  as="strong"
                  className="ud-ts-panel__card-title"
                  placeholder="Card title"
                />
                <EditableText
                  edit={edit}
                  path={['cardMeta']}
                  value={str(props.cardMeta)}
                  as="span"
                  className="ud-ts-panel__card-meta"
                  placeholder="Card meta"
                />
              </div>
              <Media
                src={props.cardImage}
                alt={str(props.cardTitle)}
                ratio="square"
                className="ud-ts-panel__card-media"
                edit={edit}
                path={['cardImage']}
              />
            </div>
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- metrics.tessera */

export const metricsTessera = defineBlock({
  type: 'metrics.tessera',
  version: 1,
  category: 'content',
  label: 'Tessera metrics strip',
  icon: 'Chart',
  defaultProps: {
    eyebrow: 'MEASURED ACROSS 40 NETWORKS',
    heading: 'What changes in the first quarter',
    headingTail: 'of running Tessera',
    items: [
      { value: '31%', title: 'Fewer emergency call-outs', text: 'Drift alerts move work into planned windows.' },
      { value: '2.4h', title: 'Saved per crew, per week', text: 'Routing accounts for parts and travel together.' },
      { value: '96%', title: 'Work orders closed on first visit', text: 'The van arrives already carrying the right part.' },
      { value: '11 days', title: 'To first full network view', text: 'Connectors cover the meters you already run.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    text('headingTail', 'Heading second line'),
    descriptionField,
    repeater('items', 'Metrics', [text('value', 'Value'), text('title', 'Title'), textarea('text', 'Text')], {
      itemLabel: 'Metric',
    }),
  ),
  component: function MetricsTessera(props) {
    const edit = editOf(props)
    const stats = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-ts ud-ts-metrics">
        <SectionHead props={props} />
        <div className="ud-ts-metrics__grid" data-count={stats.length}>
          {stats.map((item, index) => (
            <div key={index} className="ud-ts-metrics__cell">
              <EditableText
                edit={edit}
                path={['items', index, 'value']}
                value={str(item.value)}
                as="strong"
                className="ud-ts-metrics__value"
                placeholder="00%"
              />
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-ts-metrics__title"
                placeholder="Title"
              />
              <SafeText
                value={str(item.text)}
                className="ud-ts-metrics__text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="Text"
              />
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ logos.tessera */

export const logosTessera = defineBlock({
  type: 'logos.tessera',
  version: 1,
  category: 'gallery',
  label: 'Tessera logo rail',
  icon: 'Grid',
  defaultProps: {
    heading: 'Running under the floor at',
    items: [
      { label: 'Calder Utilities' },
      { label: 'Ferrowest' },
      { label: 'Vale & Marsh' },
      { label: 'Northgate Cold' },
      { label: 'Piera Group' },
      { label: 'Brackenline' },
    ],
    animation: 'fade',
  },
  schema: schema(
    headingField,
    repeater('items', 'Logos', [text('label', 'Name'), image('image', 'Logo image')], { itemLabel: 'Logo' }),
  ),
  component: function LogosTessera(props) {
    const edit = editOf(props)
    const logos = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-ts ud-ts-logos" align="center">
        {str(props.heading) || edit ? (
          <EditableText
            edit={edit}
            path={['heading']}
            value={str(props.heading)}
            as="p"
            className="ud-ts-logos__label"
            placeholder="Trusted by"
          />
        ) : null}
        <div className="ud-ts-logos__row">
          {logos.map((item, index) =>
            str(item.image) ? (
              <img key={index} src={str(item.image)} alt={str(item.label)} className="ud-ts-logos__img" loading="lazy" />
            ) : (
              <EditableText
                key={index}
                edit={edit}
                path={['items', index, 'label']}
                value={str(item.label)}
                as="span"
                className="ud-ts-logos__name"
                placeholder="Company"
              />
            ),
          )}
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- pricing.tessera */

export const pricingTessera = defineBlock({
  type: 'pricing.tessera',
  version: 1,
  category: 'pricing',
  label: 'Tessera pricing tiers',
  icon: 'Tag',
  defaultProps: {
    heading: 'Pricing',
    items: [
      {
        name: 'Depot',
        blurb: 'For a single site getting its first shared view.',
        price: '£180',
        period: '/month',
        buttonLabel: 'Try it free, 14 days',
        buttonUrl: '/pricing',
        featured: false,
        features: '1 site\n40 monitored assets\n8 crew seats\nDaily sync\nEmail support',
      },
      {
        name: 'Network',
        blurb: 'For operators running several depots and a shared fleet.',
        price: '£540',
        period: '/month',
        badge: 'Most chosen',
        buttonLabel: 'Try it free, 14 days',
        buttonUrl: '/pricing',
        featured: true,
        features: '10 sites\n600 monitored assets\n40 crew seats\nLive sync\nRoute planner\nPriority support',
      },
      {
        name: 'Regional',
        blurb: 'For multi-region estates with their own compliance rules.',
        price: '£1,290',
        period: '/month',
        buttonLabel: 'Talk to us',
        buttonUrl: '/platform',
        featured: false,
        features: 'Unlimited sites\n3,000 monitored assets\nUnlimited crew seats\nLive sync\nRoute planner\nNamed engineer',
      },
    ],
    customTitle: 'Estate',
    customText: 'For national estates that need custom connectors, retention rules, and a dedicated onboarding squad.',
    customFeatures:
      'Everything in Regional\nCustom connectors\nUnlimited retention\nSSO and SCIM\nQuarterly reliability review\nOn-site enablement',
    customButtonLabel: 'Talk to us',
    customButtonUrl: '/platform',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    descriptionField,
    repeater(
      'items',
      'Tiers',
      [
        text('name', 'Name'),
        textarea('blurb', 'Blurb'),
        text('price', 'Price'),
        text('period', 'Period'),
        text('badge', 'Badge'),
        textarea('features', 'Features (one per line)'),
        text('buttonLabel', 'Button label'),
        link('buttonUrl', 'Button link'),
        toggle('featured', 'Highlight tier', 'content'),
      ],
      { itemLabel: 'Tier' },
    ),
    text('customTitle', 'Custom tier title'),
    textarea('customText', 'Custom tier text'),
    textarea('customFeatures', 'Custom tier features (one per line)'),
    text('customButtonLabel', 'Custom tier button'),
    link('customButtonUrl', 'Custom tier link'),
  ),
  component: function PricingTessera(props) {
    const edit = editOf(props)
    const tiers = items(props.items, [])
    const customFeatures = str(props.customFeatures)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    return (
      <SectionShell props={props} className="ud-ts ud-ts-pricing">
        {str(props.heading) || edit ? (
          <EditableText
            edit={edit}
            path={['heading']}
            value={str(props.heading)}
            as="h2"
            className="ud-h2 ud-ts-pricing__title"
            placeholder="Pricing"
          />
        ) : null}
        {str(props.description) || edit ? (
          <SafeText
            value={str(props.description)}
            className="ud-ts-lead"
            edit={edit}
            path={['description']}
            placeholder="Supporting copy"
          />
        ) : null}

        <div className="ud-ts-pricing__grid" data-count={tiers.length}>
          {tiers.map((tier, index) => {
            const features = str(tier.features)
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)
            return (
              <article key={index} className={cx('ud-ts-tier', bool(tier.featured) && 'ud-ts-tier--featured')}>
                <div className="ud-ts-tier__head">
                  <EditableText
                    edit={edit}
                    path={['items', index, 'name']}
                    value={str(tier.name)}
                    as="h3"
                    className="ud-ts-tier__name"
                    placeholder="Tier"
                  />
                  {str(tier.badge) || edit ? (
                    <EditableText
                      edit={edit}
                      path={['items', index, 'badge']}
                      value={str(tier.badge)}
                      as="span"
                      className="ud-ts-tier__badge"
                      placeholder="Badge"
                    />
                  ) : null}
                </div>
                <SafeText
                  value={str(tier.blurb)}
                  className="ud-ts-tier__blurb"
                  edit={edit}
                  path={['items', index, 'blurb']}
                  placeholder="Who it is for"
                />
                <p className="ud-ts-tier__price">
                  <EditableText
                    edit={edit}
                    path={['items', index, 'price']}
                    value={str(tier.price)}
                    as="span"
                    className="ud-ts-tier__amount"
                    placeholder="£0"
                  />
                  <EditableText
                    edit={edit}
                    path={['items', index, 'period']}
                    value={str(tier.period)}
                    as="span"
                    className="ud-ts-tier__period"
                    placeholder="/month"
                  />
                </p>
                {str(tier.buttonLabel) || edit ? (
                  <TsButton
                    href={str(tier.buttonUrl, '#')}
                    variant={bool(tier.featured) ? 'solid' : 'quiet'}
                  >
                    <EditableText
                      edit={edit}
                      path={['items', index, 'buttonLabel']}
                      value={str(tier.buttonLabel)}
                      placeholder="Get started"
                    />
                  </TsButton>
                ) : null}
                <ul className="ud-ts-tier__list">
                  {features.map((line, lineIndex) => (
                    <li key={lineIndex}>
                      <Icon name="check" size={13} />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>

        {str(props.customTitle) || edit ? (
          <aside className="ud-ts-custom">
            <div className="ud-ts-custom__copy">
              <EditableText
                edit={edit}
                path={['customTitle']}
                value={str(props.customTitle)}
                as="h3"
                className="ud-ts-custom__title"
                placeholder="Custom"
              />
              <SafeText
                value={str(props.customText)}
                className="ud-ts-custom__text"
                edit={edit}
                path={['customText']}
                placeholder="Who it is for"
              />
              <ul className="ud-ts-custom__list">
                {customFeatures.map((line, index) => (
                  <li key={index}>
                    <Icon name="check" size={13} />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            {str(props.customButtonLabel) || edit ? (
              <TsButton href={str(props.customButtonUrl, '#')} variant="solid" arrow>
                <EditableText
                  edit={edit}
                  path={['customButtonLabel']}
                  value={str(props.customButtonLabel)}
                  placeholder="Talk to us"
                />
              </TsButton>
            ) : null}
          </aside>
        ) : null}
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- compare.tessera */

export const compareTessera = defineBlock({
  type: 'compare.tessera',
  version: 1,
  category: 'pricing',
  label: 'Tessera comparison table',
  icon: 'Table',
  defaultProps: {
    heading: 'Compare plans',
    columns: [
      { name: 'Depot', note: '£180/mo' },
      { name: 'Network', note: '£540/mo' },
      { name: 'Regional', note: '£1,290/mo' },
      { name: 'Estate', note: 'Custom' },
    ],
    rows: [
      { group: 'Coverage', label: 'Sites', values: '1|10|Unlimited|Unlimited' },
      { group: '', label: 'Monitored assets', values: '40|600|3,000|Custom' },
      { group: '', label: 'Crew seats', values: '8|40|Unlimited|Unlimited' },
      { group: 'Operations', label: 'Route planner', values: '—|yes|yes|yes' },
      { group: '', label: 'Anomaly alerts', values: 'Daily|Live|Live|Live' },
      { group: '', label: 'Offline capture', values: 'yes|yes|yes|yes' },
      { group: 'Governance', label: 'Data retention', values: '12 months|3 years|Unlimited|Unlimited' },
      { group: '', label: 'SSO and SCIM', values: '—|—|yes|yes' },
      { group: '', label: 'Named engineer', values: '—|—|yes|yes' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    descriptionField,
    repeater('columns', 'Plan columns', [text('name', 'Name'), text('note', 'Price note')], { itemLabel: 'Column' }),
    repeater(
      'rows',
      'Rows',
      [
        text('group', 'Group heading (optional)'),
        text('label', 'Row label'),
        text('values', 'Values, separated by |'),
      ],
      { itemLabel: 'Row' },
    ),
  ),
  component: function CompareTessera(props) {
    const edit = editOf(props)
    const columns = items(props.columns, [])
    const rows = items(props.rows, [])
    return (
      <SectionShell props={props} tone="dark" className="ud-ts ud-ts-compare">
        {str(props.heading) || edit ? (
          <EditableText
            edit={edit}
            path={['heading']}
            value={str(props.heading)}
            as="h2"
            className="ud-h2 ud-ts-compare__title"
            placeholder="Compare plans"
          />
        ) : null}
        <div className="ud-ts-compare__scroll">
          <table className="ud-ts-compare__table">
            <thead>
              <tr>
                <th scope="col" />
                {columns.map((column, index) => (
                  <th key={index} scope="col">
                    <EditableText
                      edit={edit}
                      path={['columns', index, 'name']}
                      value={str(column.name)}
                      as="span"
                      className="ud-ts-compare__col"
                      placeholder="Plan"
                    />
                    <EditableText
                      edit={edit}
                      path={['columns', index, 'note']}
                      value={str(column.note)}
                      as="span"
                      className="ud-ts-compare__note"
                      placeholder="£0/mo"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const values = str(row.values).split('|')
                const group = str(row.group)
                return (
                  <Fragment key={index}>
                    {group ? (
                      <tr className="ud-ts-compare__group">
                        <th scope="colgroup" colSpan={columns.length + 1}>
                          <EditableText
                            edit={edit}
                            path={['rows', index, 'group']}
                            value={group}
                            as="span"
                            placeholder="Group"
                          />
                        </th>
                      </tr>
                    ) : null}
                    <tr>
                      <th scope="row">
                        <EditableText
                          edit={edit}
                          path={['rows', index, 'label']}
                          value={str(row.label)}
                          as="span"
                          placeholder="Feature"
                        />
                      </th>
                      {columns.map((_column, cellIndex) => {
                        const value = (values[cellIndex] || '').trim()
                        return (
                          <td key={cellIndex}>
                            {value === 'yes' ? (
                              <Icon name="check" size={15} />
                            ) : (
                              <span className={cx(value === '—' && 'ud-ts-compare__off')}>{value}</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------------- faq.tessera */

export const faqTessera = defineBlock({
  type: 'faq.tessera',
  version: 1,
  category: 'faq',
  label: 'Tessera FAQ',
  icon: 'HelpCircle',
  defaultProps: {
    heading: 'Frequently asked',
    headingTail: 'questions.',
    items: [
      {
        question: 'What has to be installed on site?',
        answer:
          'Usually nothing. Tessera reads from the controllers and meters you already run through a local collector, and falls back to a small gateway only where a site has no network path.',
      },
      {
        question: 'How long until the first useful view?',
        answer:
          'Most networks reach a full asset picture in under two weeks. The first depot is normally reporting within three days of the connector going in.',
      },
      {
        question: 'Does this replace our maintenance system?',
        answer:
          'No. Tessera sits above it. Work orders still close where your team closes them today — we push the priority and the context, then read the outcome back.',
      },
      {
        question: 'Can crews use it without signal?',
        answer:
          'Yes. The field app captures readings, photos, and sign-off offline, then reconciles when the van comes back into coverage.',
      },
      {
        question: 'Who can see which sites?',
        answer:
          'Access follows your own hierarchy. A regional lead sees their estate, a contractor sees only the assets on their contract, and every view is logged.',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    text('headingTail', 'Heading second line'),
    descriptionField,
    repeater('items', 'Questions', [text('question', 'Question'), textarea('answer', 'Answer')], {
      itemLabel: 'Question',
    }),
  ),
  component: function FaqTessera(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-ts ud-ts-faq">
        <DuoHeading props={props} className="ud-ts-faq__title" leadPlaceholder="Frequently asked" tailPlaceholder="questions." />
        <div className="ud-ts-faq__list">
          {rows.map((item, index) => (
            <details key={index} className="ud-ts-faq__row" open={index === 0 ? undefined : undefined}>
              <summary className="ud-ts-faq__q">
                <EditableText
                  edit={edit}
                  path={['items', index, 'question']}
                  value={str(item.question)}
                  as="span"
                  placeholder="Question"
                />
                <span className="ud-ts-faq__caret" aria-hidden>
                  <Icon name="arrow" size={14} />
                </span>
              </summary>
              <SafeText
                value={str(item.answer)}
                className="ud-ts-faq__a"
                edit={edit}
                path={['items', index, 'answer']}
                placeholder="Answer"
              />
            </details>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------- principles.tessera */

export const principlesTessera = defineBlock({
  type: 'principles.tessera',
  version: 1,
  category: 'content',
  label: 'Tessera numbered principles',
  icon: 'List',
  defaultProps: {
    eyebrow: 'OPERATING PRINCIPLES',
    heading: 'How we work',
    headingTail: 'at Tessera',
    description: 'Small crews, short loops, and a bias for the boring fix that holds.',
    items: [
      { title: 'Ship the smallest honest thing', text: 'A rough tool in a depot beats a polished demo in a deck.' },
      { title: 'Go to the site', text: 'Every engineer spends time in a plant room before shipping for one.' },
      { title: 'Write it down', text: 'Decisions live in text so the next person inherits the reasoning, not just the result.' },
      { title: 'No heroics', text: 'If a release needs someone awake at 3am, the release is the problem.' },
      { title: 'Leave the estate better', text: 'We measure ourselves on the customer’s uptime, not our feature count.' },
    ],
    statTitle: 'We are hiring across the board',
    statText: '48 people · 4 depots visited weekly · 200+ networks live',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    text('headingTail', 'Heading second line'),
    descriptionField,
    repeater('items', 'Principles', [text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Principle' }),
    text('statTitle', 'Stat title'),
    textarea('statText', 'Stat text'),
  ),
  component: function PrinciplesTessera(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-ts ud-ts-principles">
        <div className="ud-ts-principles__grid">
          <div className="ud-ts-principles__aside">
            {str(props.eyebrow) || edit ? (
              <EditableText
                edit={edit}
                path={['eyebrow']}
                value={str(props.eyebrow)}
                as="p"
                className="ud-ts-eyebrow"
                placeholder="EYEBROW"
              />
            ) : null}
            <DuoHeading props={props} className="ud-ts-principles__title" />
            {str(props.description) || edit ? (
              <SafeText
                value={str(props.description)}
                className="ud-ts-lead"
                edit={edit}
                path={['description']}
                placeholder="Supporting copy"
              />
            ) : null}
          </div>

          <div className="ud-ts-principles__list">
            {rows.map((item, index) => (
              <div key={index} className="ud-ts-principles__row">
                <span className="ud-ts-principles__index">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <EditableText
                    edit={edit}
                    path={['items', index, 'title']}
                    value={str(item.title)}
                    as="h3"
                    className="ud-ts-principles__name"
                    placeholder="Principle"
                  />
                  <SafeText
                    value={str(item.text)}
                    className="ud-ts-principles__text"
                    edit={edit}
                    path={['items', index, 'text']}
                    placeholder="Text"
                  />
                </div>
              </div>
            ))}
            {str(props.statTitle) || edit ? (
              <div className="ud-ts-principles__stat">
                <EditableText
                  edit={edit}
                  path={['statTitle']}
                  value={str(props.statTitle)}
                  as="h3"
                  className="ud-ts-principles__stat-title"
                  placeholder="Stat title"
                />
                <SafeText
                  value={str(props.statText)}
                  className="ud-ts-principles__stat-text"
                  edit={edit}
                  path={['statText']}
                  placeholder="Stat text"
                />
              </div>
            ) : null}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- benefits.tessera */

export const benefitsTessera = defineBlock({
  type: 'benefits.tessera',
  version: 1,
  category: 'features',
  label: 'Tessera benefits grid',
  icon: 'Gift',
  defaultProps: {
    heading: 'Benefits',
    description: 'We look after the crew that keeps everyone else’s crews running.',
    columns: 3,
    items: [
      { icon: 'award', title: 'Real ownership', text: 'Meaningful equity from your first day, with a long exercise window.' },
      { icon: 'chart', title: 'Room to grow', text: 'Scope follows outcomes. Nobody waits for a title to lead something.' },
      { icon: 'cpu', title: 'Tools that hold', text: 'Work alongside engineers who would rather delete code than defend it.' },
      { icon: 'clock', title: 'Sane hours', text: 'Set your own shape around two overlap hours. No pager theatre.' },
      { icon: 'truck', title: 'Site visits covered', text: 'Travel, boots, and kit for every depot week — on us.' },
      { icon: 'heart', title: 'Health and rest', text: 'Private cover, a wellbeing budget, and a genuine 30 days off.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    descriptionField,
    select('columns', 'Columns', [['2', '2'], ['3', '3'], ['4', '4']], 'layout'),
    repeater('items', 'Benefits', itemFields, { itemLabel: 'Benefit' }),
  ),
  component: function BenefitsTessera(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const columns = Math.min(Math.max(num(props.columns, 3), 2), 4)
    return (
      <SectionShell props={props} className="ud-ts ud-ts-benefits" align="center">
        {str(props.heading) || edit ? (
          <EditableText
            edit={edit}
            path={['heading']}
            value={str(props.heading)}
            as="h2"
            className="ud-h2 ud-ts-benefits__title"
            placeholder="Benefits"
          />
        ) : null}
        {str(props.description) || edit ? (
          <SafeText
            value={str(props.description)}
            className="ud-ts-lead"
            edit={edit}
            path={['description']}
            placeholder="Supporting copy"
          />
        ) : null}
        <div className="ud-ts-benefits__grid" data-count={columns}>
          {rows.map((item, index) => (
            <div key={index} className="ud-ts-benefits__cell">
              <span className="ud-ts-chip ud-ts-chip--accent" aria-hidden>
                <Icon name={str(item.icon, 'star')} size={15} />
              </span>
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-ts-benefits__name"
                placeholder="Benefit"
              />
              <SafeText
                value={str(item.text)}
                className="ud-ts-benefits__text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="Text"
              />
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- roles.tessera */

export const rolesTessera = defineBlock({
  type: 'roles.tessera',
  version: 1,
  category: 'team',
  label: 'Tessera open roles',
  icon: 'Users',
  defaultProps: {
    heading: 'Open roles',
    description: 'If nothing fits, write to us anyway — we open seats around good people.',
    items: [
      { title: 'Field Reliability Engineer', meta: 'Leeds · Full-time', url: '#' },
      { title: 'Senior Backend Engineer, Ingest', meta: 'Remote (UK/EU) · Full-time', url: '#' },
      { title: 'Product Designer', meta: 'London · Full-time', url: '#' },
      { title: 'Solutions Lead, Utilities', meta: 'Manchester · Full-time', url: '#' },
      { title: 'Customer Engineer, DACH', meta: 'Berlin · Full-time', url: '#' },
      { title: 'Technical Writer', meta: 'Remote (UK) · Part-time', url: '#' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    descriptionField,
    repeater('items', 'Roles', [text('title', 'Role'), text('meta', 'Location and type'), link('url', 'Link')], {
      itemLabel: 'Role',
    }),
  ),
  component: function RolesTessera(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-ts ud-ts-roles">
        {str(props.heading) || edit ? (
          <EditableText
            edit={edit}
            path={['heading']}
            value={str(props.heading)}
            as="h2"
            className="ud-h2 ud-ts-roles__title"
            placeholder="Open roles"
          />
        ) : null}
        {str(props.description) || edit ? (
          <SafeText
            value={str(props.description)}
            className="ud-ts-lead"
            edit={edit}
            path={['description']}
            placeholder="Supporting copy"
          />
        ) : null}
        <ul className="ud-ts-roles__list">
          {rows.map((item, index) => (
            <li key={index} className="ud-ts-roles__row">
              <a href={str(item.url, '#')} className="ud-ts-roles__link">
                <span className="ud-ts-roles__copy">
                  <EditableText
                    edit={edit}
                    path={['items', index, 'title']}
                    value={str(item.title)}
                    as="span"
                    className="ud-ts-roles__name"
                    placeholder="Role"
                  />
                  <EditableText
                    edit={edit}
                    path={['items', index, 'meta']}
                    value={str(item.meta)}
                    as="span"
                    className="ud-ts-roles__meta"
                    placeholder="Location · Type"
                  />
                </span>
                <span className="ud-ts-roles__go" aria-hidden>
                  <Icon name="arrow" size={14} />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- ctaband.tessera */

export const ctaBandTessera = defineBlock({
  type: 'ctaband.tessera',
  version: 1,
  category: 'cta',
  label: 'Tessera CTA band',
  icon: 'Megaphone',
  defaultProps: {
    heading: 'Ready to run the network from one screen?',
    description: 'Connect a single depot, see the difference in a fortnight, then decide.',
    buttonLabel: 'Start free',
    buttonUrl: '/pricing',
    secondaryLabel: 'Book a walkthrough',
    secondaryUrl: '/platform',
    animation: 'fade-up',
  },
  schema: schema(headingField, descriptionField, ...ctaFields),
  component: function CtaBandTessera(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="dark" className="ud-ts ud-ts-ctaband">
        <div className="ud-ts-ctaband__inner">
          <EditableText
            edit={edit}
            path={['heading']}
            value={str(props.heading)}
            as="h2"
            className="ud-h2 ud-ts-ctaband__title"
            placeholder="Heading"
          />
          <SafeText
            value={str(props.description)}
            className="ud-ts-ctaband__text"
            edit={edit}
            path={['description']}
            placeholder="Supporting copy"
          />
          <div className="ud-ts-ctaband__cta">
            {str(props.buttonLabel) || edit ? (
              <TsButton href={str(props.buttonUrl, '#')} variant="solid" arrow>
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Start free" />
              </TsButton>
            ) : null}
            {str(props.secondaryLabel) || edit ? (
              <TsButton href={str(props.secondaryUrl, '#')} variant="quiet">
                <EditableText
                  edit={edit}
                  path={['secondaryLabel']}
                  value={str(props.secondaryLabel)}
                  placeholder="Book a demo"
                />
              </TsButton>
            ) : null}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ footer.tessera */

export const footerTessera = defineBlock({
  type: 'footer.tessera',
  version: 1,
  category: 'footer',
  label: 'Tessera footer',
  icon: 'Layout',
  defaultProps: {
    logo: 'Tessera',
    logoIcon: 'layers',
    logoUrl: '/',
    address: 'Tessera Systems Ltd\n14 Meadowhall Way\nSheffield, S9 1EA',
    columns: [
      {
        title: 'Platform',
        links: [
          { label: 'Asset Telemetry', url: '/platform#telemetry' },
          { label: 'Crew Dispatch', url: '/platform#dispatch' },
          { label: 'Route Planner', url: '/platform#routing' },
          { label: 'Offline capture', url: '/platform' },
          { label: 'Connectors', url: '/platform' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { label: 'Documentation', url: '#' },
          { label: 'Reliability guides', url: '#' },
          { label: 'Connector library', url: '#' },
          { label: 'Status', url: '#' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'About', url: '/careers' },
          { label: 'Careers', url: '/careers' },
          { label: 'Customers', url: '/' },
          { label: 'Contact', url: '/platform' },
        ],
      },
      {
        title: 'Compare',
        links: [
          { label: 'All comparisons', url: '#' },
          { label: 'vs spreadsheets', url: '#' },
          { label: 'vs legacy CMMS', url: '#' },
          { label: 'vs in-house builds', url: '#' },
        ],
      },
    ],
    social: [
      { icon: 'linkedin', url: '#' },
      { icon: 'twitter', url: '#' },
      { icon: 'github', url: '#' },
      { icon: 'youtube', url: '#' },
    ],
    copyright: '© 2026 Tessera Systems Ltd. Registered in England and Wales, No. 14802255.',
    disclaimer:
      'Operational guidance published here is general information, not engineering advice. Always follow your own safety procedures and statutory inspection regime.',
    legal: [
      { label: 'Terms of Service', url: '#' },
      { label: 'Privacy Policy', url: '#' },
      { label: 'Cookies', url: '#' },
      { label: 'Security', url: '#' },
    ],
    animation: 'fade',
  },
  schema: schema(
    text('logo', 'Brand'),
    icon('logoIcon', 'Mark icon'),
    link('logoUrl', 'Brand link'),
    textarea('address', 'Address'),
    repeater(
      'columns',
      'Link columns',
      [text('title', 'Title'), repeater('links', 'Links', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Link' })],
      { itemLabel: 'Column' },
    ),
    repeater('social', 'Social', [icon('icon', 'Icon'), link('url', 'URL')], { itemLabel: 'Link' }),
    textarea('copyright', 'Copyright'),
    textarea('disclaimer', 'Disclaimer'),
    repeater('legal', 'Legal links', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Link' }),
  ),
  component: function FooterTessera(props) {
    const edit = editOf(props)
    const columns = items(props.columns, [])
    const social = items(props.social, [])
    const legal = items(props.legal, [])
    return (
      <SectionShell props={props} tone="dark" className="ud-ts ud-ts-footer">
        <div className="ud-ts-footer__top">
          <div className="ud-ts-footer__brand">
            <BrandMark props={props} className="ud-ts-brand--light" />
            <SafeText
              value={str(props.address)}
              className="ud-ts-footer__address"
              edit={edit}
              path={['address']}
              placeholder="Address"
              multiline
            />
          </div>
          <div className="ud-ts-footer__cols">
            {columns.map((column, index) => (
              <div key={index} className="ud-ts-footer__col">
                <EditableText
                  edit={edit}
                  path={['columns', index, 'title']}
                  value={str(column.title)}
                  as="h3"
                  className="ud-ts-footer__col-title"
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

        <div className="ud-ts-footer__bottom">
          <div className="ud-ts-footer__legal">
            <SafeText
              value={str(props.copyright)}
              className="ud-ts-footer__copy"
              edit={edit}
              path={['copyright']}
              placeholder="Copyright"
            />
            <SafeText
              value={str(props.disclaimer)}
              className="ud-ts-footer__disclaimer"
              edit={edit}
              path={['disclaimer']}
              placeholder="Disclaimer"
            />
            <ul className="ud-ts-footer__links">
              {legal.map((item, index) => (
                <li key={index}>
                  <a href={str(item.url, '#')}>
                    <EditableText
                      edit={edit}
                      path={['legal', index, 'label']}
                      value={str(item.label)}
                      placeholder="Legal"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="ud-ts-footer__social">
            {social.map((item, index) => (
              <a key={index} href={str(item.url, '#')} aria-label={str(item.icon, 'link')}>
                <Icon name={str(item.icon, 'globe')} size={16} />
              </a>
            ))}
          </div>
        </div>
      </SectionShell>
    )
  },
})
