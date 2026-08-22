/**
 * Junction — an automation / AI-orchestration product template family.
 *
 * Visual language: Figtree headlines on warm off-white, a single hot-orange
 * accent, near-black buttons, tinted screenshot cards, deep olive and indigo
 * impact bands, and grouped FAQ accordions.
 *
 * Every string, image, list item and colour routes through `schema()`, which
 * appends the shared design / typography / background / spacing controls, so a
 * page built from these blocks is fully editable on canvas and in the side panel.
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
  lines,
  num,
  sectionVars,
  str,
  type Props,
} from '../primitives'
import {
  ctaFields,
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

function jnLinks(props: Props) {
  return items(props.links, []).map((item) => ({
    label: str(item.label),
    url: str(item.url) || str(item.href) || '#',
    children: item.children,
  }))
}

function pad(index: number): string {
  return String(index + 1)
}

/** Small orange eyebrow with the leading tick mark. */
function Eyebrow({ props, path = ['eyebrow'] }: { props: Props; path?: Array<string | number> }) {
  const edit = editOf(props)
  const key = path[path.length - 1]
  const value = str(path.length === 1 ? props[key as string] : props.eyebrow)
  if (!value && !edit) return null
  return (
    <p className="ud-jn-eyebrow">
      <span className="ud-jn-eyebrow__mark" aria-hidden />
      <EditableText edit={edit} path={path} value={value} as="span" placeholder="EYEBROW" />
    </p>
  )
}

/**
 * Eyebrow + heading + lead. `headingAccent` renders after the heading with the
 * orange underline the reference uses to stress the last few words.
 */
function Head({
  props,
  as = 'h2',
  align = 'left',
  className,
}: {
  props: Props
  as?: 'h1' | 'h2'
  align?: 'left' | 'center'
  className?: string
}) {
  const edit = editOf(props)
  const heading = str(props.heading)
  const accent = str(props.headingAccent)
  const description = str(props.description)
  const Tag = as
  if (!edit && !heading && !description && !str(props.eyebrow)) return null
  return (
    <div className={cx('ud-jn-head', align === 'center' && 'ud-jn-head--center', className)}>
      <Eyebrow props={props} />
      {heading || accent || edit ? (
        <Tag className={as === 'h1' ? 'ud-jn-display' : 'ud-jn-title'}>
          <EditableText edit={edit} path={['heading']} value={heading} as="span" placeholder="Heading" />
          {accent || edit ? (
            <>
              {' '}
              <EditableText
                edit={edit}
                path={['headingAccent']}
                value={accent}
                as="span"
                className="ud-jn-mark"
                placeholder="accent"
              />
            </>
          ) : null}
        </Tag>
      ) : null}
      {description || edit ? (
        <SafeText value={description} className="ud-jn-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
      ) : null}
    </div>
  )
}

const headAccentFields = [eyebrowField, headingField, text('headingAccent', 'Heading accent'), descriptionField]

type BtnVariant = 'orange' | 'dark' | 'outline' | 'light' | 'blue'

function JnButton({
  href,
  children,
  variant = 'orange',
  className,
}: {
  href: string
  children: ReactNode
  variant?: BtnVariant
  className?: string
}) {
  return (
    <a className={cx('ud-jn-btn', `ud-jn-btn--${variant}`, className)} href={href || '#'}>
      {children}
    </a>
  )
}

/** Primary + secondary CTA pair, editable in place. */
function Ctas({
  props,
  primary = 'orange',
  secondary = 'outline',
}: {
  props: Props
  primary?: BtnVariant
  secondary?: BtnVariant
}) {
  const edit = editOf(props)
  const one = str(props.buttonLabel)
  const two = str(props.secondaryLabel)
  if (!one && !two && !edit) return null
  return (
    <div className="ud-jn-btns">
      {one || edit ? (
        <JnButton href={str(props.buttonUrl, '#')} variant={primary}>
          <EditableText edit={edit} path={['buttonLabel']} value={one} placeholder="Primary" />
          <Icon name="arrow" size={14} />
        </JnButton>
      ) : null}
      {two || edit ? (
        <JnButton href={str(props.secondaryUrl, '#')} variant={secondary}>
          <EditableText edit={edit} path={['secondaryLabel']} value={two} placeholder="Secondary" />
        </JnButton>
      ) : null}
    </div>
  )
}

const defaultNavLinks = [
  { label: 'Product', url: '/platform' },
  { label: 'Solutions', url: '/solutions' },
  { label: 'Resources', url: '/integrations' },
  { label: 'Platform', url: '/platform' },
  { label: 'Pricing', url: '/pricing' },
]

/* ----------------------------------------------------------- navbar.junction */

export const navbarJunction = defineBlock({
  type: 'navbar.junction',
  version: 1,
  category: 'navigation',
  label: 'Junction navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'junction',
    logoUrl: '/',
    links: defaultNavLinks,
    utilityLinks: [
      { label: 'Explore apps', url: '/integrations' },
      { label: 'Contact sales', url: '/pricing' },
      { label: 'Log in', url: '/pricing' },
    ],
    buttonLabel: 'Sign up',
    buttonUrl: '/pricing',
    sticky: true,
    animation: 'fade-down',
    animationTrigger: 'load',
  },
  schema: schema(
    text('logo', 'Wordmark'),
    link('logoUrl', 'Wordmark link'),
    navLinksField('links', 'Primary links'),
    repeater('utilityLinks', 'Utility links', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Link' }),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    stickyField,
  ),
  component: function NavbarJunction(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    const anim = animationOf(props)
    const links = jnLinks(props)
    const utility = items(props.utilityLinks, [])
    return (
      <header
        className={cx('ud-jn', 'ud-jn-nav', bool(props.sticky, true) && 'ud-jn-nav--sticky', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container ud-jn-nav__bar">
          <a className="ud-jn-logo" href={str(props.logoUrl, '/')}>
            <span className="ud-jn-logo__mark" aria-hidden />
            <EditableText edit={edit} path={['logo']} value={str(props.logo, 'junction')} placeholder="brand" />
          </a>
          <nav className={cx('ud-jn-nav__links', open && 'is-open')} aria-label="Primary">
            {links.map((item, index) => (
              <NavItem key={index} item={item}>
                <a href={item.url} className="ud-jn-nav__link">
                  <EditableText edit={edit} path={['links', index, 'label']} value={item.label} placeholder="Link" />
                  <SubmenuCaret show={hasSubmenu(item)} />
                </a>
                <Submenu props={props} item={item} index={index} />
              </NavItem>
            ))}
          </nav>
          <div className="ud-jn-nav__utility">
            {utility.map((item, index) => (
              <a key={index} href={str(item.url, '#')} className="ud-jn-nav__util">
                <EditableText edit={edit} path={['utilityLinks', index, 'label']} value={str(item.label)} placeholder="Link" />
              </a>
            ))}
            {str(props.buttonLabel) || edit ? (
              <JnButton href={str(props.buttonUrl, '#')} className="ud-jn-nav__cta">
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Sign up" />
              </JnButton>
            ) : null}
          </div>
          <button type="button" className="ud-jn-nav__toggle" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>
            <Icon name={open ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </header>
    )
  },
})

/* ------------------------------------------------------------- hero.junction */

export const heroJunction = defineBlock({
  type: 'hero.junction',
  version: 1,
  category: 'hero',
  label: 'Junction hero',
  icon: 'Sparkles',
  defaultProps: {
    eyebrow: '',
    heading: 'Wire your tools together once.',
    headingAccent: 'Stop rebuilding it every quarter.',
    description:
      'Junction is the shared wiring layer for the software your company already runs. Build a connection, put a name on it, and let it keep working long after whoever made it has moved on.',
    buttonLabel: 'Try a build',
    buttonUrl: '/pricing',
    secondaryLabel: 'Book a walkthrough',
    secondaryUrl: '/solutions',
    note: 'No card, no sales call, cancel whenever',
    stats: [
      { value: '8,000+', label: 'Apps in the catalogue' },
      { value: '40M', label: 'Steps run weekly' },
      { value: '99.99%', label: 'Uptime last 12 months' },
      { value: '4 min', label: 'To a working build' },
    ],
    animation: 'fade-up',
    animationTrigger: 'load',
  },
  schema: schema(
    ...headAccentFields,
    ...ctaFields,
    text('note', 'Note under buttons'),
    repeater('stats', 'Trust stats', [text('value', 'Value'), text('label', 'Label')], { itemLabel: 'Stat' }),
  ),
  component: function HeroJunction(props) {
    const edit = editOf(props)
    const stats = items(props.stats, [])
    // Centred like the marketing home page by default; the shared alignment
    // control switches it to the left-aligned treatment inner pages use.
    const centered = str(props.textAlign, 'center') === 'center'
    return (
      <SectionShell
        props={props}
        className={cx('ud-jn', 'ud-jn-hero', !centered && 'ud-jn-hero--left')}
        tone="default"
      >
        <Head props={props} as="h1" align={centered ? 'center' : 'left'} />
        <div className="ud-jn-hero__cta">
          <Ctas props={props} primary="dark" secondary="outline" />
          {str(props.note) || edit ? (
            <EditableText edit={edit} path={['note']} value={str(props.note)} as="p" className="ud-jn-note" placeholder="Note" />
          ) : null}
        </div>
        {stats.length || edit ? (
          <div className="ud-jn-hero__stats">
            {stats.map((item, index) => (
              <div key={index} className="ud-jn-hero__stat">
                <EditableText
                  edit={edit}
                  path={['stats', index, 'value']}
                  value={str(item.value)}
                  as="p"
                  className="ud-jn-hero__stat-value"
                  placeholder="8,000+"
                />
                <EditableText
                  edit={edit}
                  path={['stats', index, 'label']}
                  value={str(item.label)}
                  as="p"
                  className="ud-jn-hero__stat-label"
                  placeholder="Label"
                />
              </div>
            ))}
          </div>
        ) : null}
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- apphero.junction */

export const appHeroJunction = defineBlock({
  type: 'apphero.junction',
  version: 1,
  category: 'hero',
  label: 'Junction app hero',
  icon: 'Layers',
  defaultProps: {
    appName: 'Ledgerly integrations',
    appCategory: 'ERP (Enterprise Resource Planning)',
    appBadge: 'Premium',
    appIcon: 'database',
    heading: 'Wire Ledgerly into everything that touches an invoice',
    description:
      'Finance runs on handoffs. A deal closes over here, an invoice appears over there, and somebody reconciles the two on Friday afternoon. Junction removes the somebody.',
    buttonLabel: 'Connect Ledgerly',
    buttonUrl: '/pricing',
    secondaryLabel: 'Sign in with SSO',
    secondaryUrl: '/pricing',
    chips: [
      { label: 'Build it without code' },
      { label: 'Every change is logged' },
      { label: 'SOC 2 and ISO 27001' },
      { label: 'Syncs in both directions' },
      { label: 'Free while you evaluate' },
    ],
    searchPlaceholder: 'Find an app…',
    pairLabel: 'Or start from the other side',
    apps: [
      { name: 'Fluxdesk', category: 'CRM (Customer Relationship Management)', icon: 'users', color: '#2f7d59' },
      { name: 'Northmail', category: 'Marketing Automation', icon: 'mail', color: '#e8631a' },
      { name: 'Mailspring', category: 'Marketing Automation', icon: 'message', color: '#f2b705' },
      { name: 'Gridsheet', category: 'Spreadsheets', icon: 'layers', color: '#2f7d59' },
      { name: 'Cadence', category: 'Drip Campaigns', icon: 'zap', color: '#2563c7' },
      { name: 'Signalbox', category: 'Project Management', icon: 'target', color: '#7c3aed' },
      { name: 'Pipeline', category: 'CRM (Customer Relationship Management)', icon: 'chart', color: '#2563c7' },
      { name: 'Outreach', category: 'Email, Microsoft', icon: 'briefcase', color: '#1f6fb2' },
      { name: 'Formworks', category: 'Forms & Surveys', icon: 'pen', color: '#7c3aed' },
    ],
    logoNote: 'Finance teams running Ledgerly on Junction',
    logos: [{ label: 'Northwind' }, { label: 'Meridian' }, { label: 'Halcyon' }, { label: 'Dropstone' }, { label: 'Aster' }],
    animation: 'fade-up',
    animationTrigger: 'load',
  },
  schema: schema(
    text('appName', 'App name'),
    text('appCategory', 'App category'),
    text('appBadge', 'App badge'),
    icon('appIcon', 'App icon'),
    headingField,
    descriptionField,
    ...ctaFields,
    repeater('chips', 'Feature chips', [text('label', 'Label')], { itemLabel: 'Chip' }),
    text('searchPlaceholder', 'Search placeholder'),
    text('pairLabel', 'Pair label'),
    repeater(
      'apps',
      'App tiles',
      [text('name', 'Name'), text('category', 'Category'), icon('icon', 'Icon'), field('color', 'color', 'Tile color', 'content')],
      { itemLabel: 'App' },
    ),
    text('logoNote', 'Logo strip note'),
    repeater('logos', 'Logos', [text('label', 'Label')], { itemLabel: 'Logo' }),
  ),
  component: function AppHeroJunction(props) {
    const edit = editOf(props)
    const chips = items(props.chips, [])
    const apps = items(props.apps, [])
    const logos = items(props.logos, [])
    return (
      <SectionShell props={props} className="ud-jn ud-jn-apphero" tone="default">
        <div className="ud-jn-apphero__bar">
          <span className="ud-jn-apphero__icon" aria-hidden>
            <Icon name={str(props.appIcon, 'database')} size={22} />
          </span>
          <div>
            <p className="ud-jn-apphero__name">
              <EditableText edit={edit} path={['appName']} value={str(props.appName)} as="span" placeholder="App name" />
              {str(props.appBadge) || edit ? (
                <EditableText
                  edit={edit}
                  path={['appBadge']}
                  value={str(props.appBadge)}
                  as="span"
                  className="ud-jn-apphero__badge"
                  placeholder="Badge"
                />
              ) : null}
            </p>
            <EditableText
              edit={edit}
              path={['appCategory']}
              value={str(props.appCategory)}
              as="p"
              className="ud-jn-apphero__category"
              placeholder="Category"
            />
          </div>
        </div>
        <div className="ud-jn-apphero__body">
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h1" className="ud-jn-display" placeholder="Headline" />
          <SafeText value={str(props.description)} className="ud-jn-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
          <div className="ud-jn-apphero__cta">
            {str(props.buttonLabel) || edit ? (
              <JnButton href={str(props.buttonUrl, '#')} className="ud-jn-btn--wide">
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Primary" />
              </JnButton>
            ) : null}
            {str(props.secondaryLabel) || edit ? (
              <JnButton href={str(props.secondaryUrl, '#')} variant="outline" className="ud-jn-btn--wide">
                <EditableText edit={edit} path={['secondaryLabel']} value={str(props.secondaryLabel)} placeholder="Secondary" />
              </JnButton>
            ) : null}
          </div>
          {chips.length || edit ? (
            <div className="ud-jn-apphero__chips">
              {chips.map((item, index) => (
                <span key={index} className="ud-jn-chip">
                  <Icon name="check" size={12} />
                  <EditableText edit={edit} path={['chips', index, 'label']} value={str(item.label)} as="span" placeholder="Chip" />
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="ud-jn-apphero__search" aria-hidden>
          <span className="ud-jn-apphero__search-icon">
            <Icon name="search" size={15} />
          </span>
          <EditableText
            edit={edit}
            path={['searchPlaceholder']}
            value={str(props.searchPlaceholder)}
            as="span"
            placeholder="Search…"
          />
        </div>
        <EditableText
          edit={edit}
          path={['pairLabel']}
          value={str(props.pairLabel)}
          as="p"
          className="ud-jn-apphero__pair"
          placeholder="Or pick an app"
        />
        <div className="ud-jn-apps">
          {apps.map((item, index) => (
            <div key={index} className="ud-jn-app">
              <span className="ud-jn-app__icon" style={{ background: str(item.color, '#2f7d59') } as CSSProperties} aria-hidden>
                <Icon name={str(item.icon, 'layers')} size={18} />
              </span>
              <EditableText
                edit={edit}
                path={['apps', index, 'name']}
                value={str(item.name)}
                as="p"
                className="ud-jn-app__name"
                placeholder="App"
              />
              <EditableText
                edit={edit}
                path={['apps', index, 'category']}
                value={str(item.category)}
                as="p"
                className="ud-jn-app__category"
                placeholder="Category"
              />
            </div>
          ))}
        </div>
        {logos.length || edit ? (
          <div className="ud-jn-apphero__logos">
            <EditableText edit={edit} path={['logoNote']} value={str(props.logoNote)} as="p" className="ud-jn-note" placeholder="Note" />
            <div className="ud-jn-logos__row">
              {logos.map((item, index) => (
                <EditableText
                  key={index}
                  edit={edit}
                  path={['logos', index, 'label']}
                  value={str(item.label)}
                  as="span"
                  className="ud-jn-logo-word"
                  placeholder="Logo"
                />
              ))}
            </div>
          </div>
        ) : null}
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- banner.junction */

export const bannerJunction = defineBlock({
  type: 'banner.junction',
  version: 1,
  category: 'cta',
  label: 'Junction notice banner',
  icon: 'Sparkles',
  defaultProps: {
    heading: 'One balance, wherever the work happens.',
    description:
      'Runs, agents and connectors all draw from one shared balance, so a single number tells you exactly what you have left this month.',
    buttonLabel: 'How volume is counted',
    buttonUrl: '/pricing',
    animation: 'fade-up',
  },
  schema: schema(headingField, descriptionField, text('buttonLabel', 'Link label'), link('buttonUrl', 'Link URL')),
  component: function BannerJunction(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-jn ud-jn-banner" tone="default">
        <div className="ud-jn-banner__panel">
          <EditableText
            edit={edit}
            path={['heading']}
            value={str(props.heading)}
            as="p"
            className="ud-jn-banner__title"
            placeholder="Announcement"
          />
          <SafeText
            value={str(props.description)}
            className="ud-jn-banner__text"
            edit={edit}
            path={['description']}
            placeholder="Details"
          />
          {str(props.buttonLabel) || edit ? (
            <a className="ud-jn-banner__link" href={str(props.buttonUrl, '#')}>
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} as="span" placeholder="Learn more" />
              <Icon name="arrow" size={13} />
            </a>
          ) : null}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ cards.junction */

export const cardsJunction = defineBlock({
  type: 'cards.junction',
  version: 1,
  category: 'features',
  label: 'Junction feature cards',
  icon: 'Layers',
  defaultProps: {
    heading: 'Four habits that turn one-off scripts into',
    headingAccent: 'shared infrastructure.',
    description: 'None of them are clever. All of them are why the thing still works in March.',
    columns: 2,
    items: [
      {
        eyebrow: 'Define',
        title: 'Sketch it before you wire it',
        text: 'Map the path on a canvas first. Argue about it there, where changing your mind costs nothing.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
        tint: '#e7eee8',
      },
      {
        eyebrow: 'Compose',
        title: 'Connect without filing a ticket',
        text: 'Pick from connections your admins already cleared. Nothing waits in a queue you cannot see.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
        tint: '#eceaf6',
      },
      {
        eyebrow: 'Observe',
        title: 'Know the moment something drifts',
        text: 'Every execution leaves a trail you can search, replay against frozen data, and hand to whoever asks.',
        image: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=900&q=80',
        tint: '#f4ece3',
      },
      {
        eyebrow: 'Scale',
        title: 'Pass it on without losing it',
        text: 'Publish a working build to the shared library with its owner, its limits and its notes still attached.',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
        tint: '#e6ecf3',
      },
    ],
    buttonLabel: 'See what a build looks like',
    buttonUrl: '/platform',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    text('headingAccent', 'Heading accent'),
    descriptionField,
    select('columns', 'Columns', [['2', '2'], ['3', '3']], 'layout'),
    repeater(
      'items',
      'Cards',
      [
        text('eyebrow', 'Eyebrow'),
        text('title', 'Title'),
        textarea('text', 'Text'),
        image('image', 'Screenshot'),
        field('tint', 'color', 'Card tint', 'content'),
      ],
      { itemLabel: 'Card' },
    ),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
  ),
  component: function CardsJunction(props) {
    const edit = editOf(props)
    const cards = items(props.items, [])
    const cols = Math.min(Math.max(num(props.columns, 2), 2), 3)
    return (
      <SectionShell props={props} className="ud-jn ud-jn-cards" tone="default">
        <Head props={props} align="center" />
        <div className="ud-jn-cards__grid" data-cols={cols}>
          {cards.map((item, index) => (
            <article key={index} className="ud-jn-card" style={{ '--jn-tint': str(item.tint, '#eeeae6') } as CSSProperties}>
              <div className="ud-jn-card__copy">
                <EditableText
                  edit={edit}
                  path={['items', index, 'eyebrow']}
                  value={str(item.eyebrow)}
                  as="p"
                  className="ud-jn-card__eyebrow"
                  placeholder="Eyebrow"
                />
                <EditableText
                  edit={edit}
                  path={['items', index, 'title']}
                  value={str(item.title)}
                  as="h3"
                  className="ud-jn-card__title"
                  placeholder="Card title"
                />
                <SafeText
                  value={str(item.text)}
                  className="ud-jn-card__text"
                  edit={edit}
                  path={['items', index, 'text']}
                  placeholder="Describe this card"
                />
              </div>
              <div className="ud-jn-card__shot">
                <Media src={item.image} alt="" ratio="16 / 10" edit={edit} path={['items', index, 'image']} />
              </div>
            </article>
          ))}
        </div>
        {str(props.buttonLabel) || edit ? (
          <div className="ud-jn-cards__foot">
            <JnButton href={str(props.buttonUrl, '#')} variant="outline">
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
            </JnButton>
          </div>
        ) : null}
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ split.junction */

export const splitJunction = defineBlock({
  type: 'split.junction',
  version: 1,
  category: 'content',
  label: 'Junction dark split',
  icon: 'Layers',
  defaultProps: {
    heading: 'Show us the process nobody wants to own.',
    description:
      'Ninety minutes with an engineer who has untangled this shape of problem before. You leave with a working prototype and a written plan, whether or not you ever pay us.',
    buttonLabel: 'Claim a session',
    buttonUrl: '/solutions',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    reverse: false,
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    descriptionField,
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    image('image', 'Image'),
    toggle('reverse', 'Image on the left', 'layout'),
  ),
  component: function SplitJunction(props) {
    const edit = editOf(props)
    return (
      <SectionShell
        props={props}
        className={cx('ud-jn', 'ud-jn-dark', 'ud-jn-split', bool(props.reverse) && 'ud-jn-split--reverse')}
        tone="dark"
      >
        <div className="ud-jn-split__grid">
          <div className="ud-jn-split__copy">
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-jn-title" placeholder="Heading" />
            <SafeText value={str(props.description)} className="ud-jn-lead" edit={edit} path={['description']} placeholder="Copy" />
            {str(props.buttonLabel) || edit ? (
              <JnButton href={str(props.buttonUrl, '#')}>
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
              </JnButton>
            ) : null}
          </div>
          <Media src={props.image} alt="" ratio="4 / 3" className="ud-jn-split__media" edit={edit} path={['image']} />
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------- accordion.junction */

export const accordionJunction = defineBlock({
  type: 'accordion.junction',
  version: 1,
  category: 'features',
  label: 'Junction accordion + shot',
  icon: 'Layers',
  defaultProps: {
    heading: 'Room to build,',
    headingAccent: 'rails that hold',
    description: 'Four things that stop an open platform turning into a junk drawer.',
    items: [
      {
        title: 'Ownership is a required field',
        text: 'No build goes live without a named human behind it. The orphaned ones are always the ones that hurt.',
      },
      { title: 'Sandboxes that cannot reach production', text: 'Separate workspaces keep experiments away from anything customer-facing.' },
      { title: 'A second pair of eyes, only where it earns its keep', text: 'Flag the three steps that touch money or customers. The other forty do not need a meeting.' },
      { title: 'Dead builds get archived, not inherited', text: 'Usage signals surface stale builds so the library stays worth reading.' },
    ],
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1100&q=80',
    secondImage: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=1100&q=80',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    text('headingAccent', 'Heading accent'),
    descriptionField,
    repeater('items', 'Rows', [text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Row' }),
    image('image', 'Primary screenshot'),
    image('secondImage', 'Secondary screenshot'),
  ),
  component: function AccordionJunction(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-jn ud-jn-accordion" tone="default">
        <Head props={props} align="center" />
        <div className="ud-jn-accordion__grid">
          <div className="ud-jn-accordion__list">
            {rows.map((item, index) => (
              <details key={index} className="ud-jn-accordion__item" open={index === 0}>
                <summary
                  onClick={(event) => {
                    if (edit && (event.target as HTMLElement).closest('.ud-editable')) event.preventDefault()
                  }}
                >
                  <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="span" placeholder="Title" />
                  <span className="ud-jn-accordion__mark" aria-hidden>
                    <Icon name="plus" size={13} />
                  </span>
                </summary>
                <SafeText
                  value={str(item.text)}
                  className="ud-jn-accordion__text"
                  edit={edit}
                  path={['items', index, 'text']}
                  placeholder="Details"
                />
              </details>
            ))}
          </div>
          <div className="ud-jn-accordion__art">
            <Media src={props.image} alt="" ratio="4 / 3" edit={edit} path={['image']} />
            <Media src={props.secondImage} alt="" ratio="16 / 9" className="ud-jn-accordion__art-second" edit={edit} path={['secondImage']} />
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- secure.junction */

export const secureJunction = defineBlock({
  type: 'secure.junction',
  version: 1,
  category: 'features',
  label: 'Junction security grid',
  icon: 'Shield',
  defaultProps: {
    heading: 'Controls your auditor will',
    headingAccent: 'actually accept',
    description: '',
    leadTitle: 'Verified by people who are not us',
    leadText: 'Outside auditors, on a fixed schedule, with reports we hand over before anyone chases us.',
    leadPoints: 'SOC 2 Type II and ISO 27001, renewed every year\nPick a region once: Frankfurt, Virginia or Sydney\nBring your own keys and rotate on your schedule\nDirectory sync, SSO and session limits included',
    leadImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80',
    items: [
      {
        title: 'One inventory of every connection',
        text: 'One place to see every connection, who owns it, and what it can reach.',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
        tint: '#eef0ea',
      },
      {
        title: 'Scope it down to a single field',
        text: 'When a build only needs one column, give it one column. Not the whole table.',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
        tint: '#f2ece6',
      },
      {
        title: 'Run it inside your own perimeter',
        text: 'Bring your own cloud, or run the runtime inside your own perimeter.',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
        tint: '#e9edf2',
      },
      {
        title: 'Evidence you can hand over',
        text: 'Every change, run and approval exported to your own SIEM.',
        image: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=800&q=80',
        tint: '#e8eee9',
      },
    ],
    buttonLabel: 'Read the security notes',
    buttonUrl: '/platform',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    text('headingAccent', 'Heading accent'),
    descriptionField,
    text('leadTitle', 'Lead card title'),
    textarea('leadText', 'Lead card text'),
    textarea('leadPoints', 'Lead card points', { help: 'One per line.' }),
    image('leadImage', 'Lead card image'),
    repeater(
      'items',
      'Cards',
      [text('title', 'Title'), textarea('text', 'Text'), image('image', 'Image'), field('tint', 'color', 'Tint', 'content')],
      { itemLabel: 'Card' },
    ),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
  ),
  component: function SecureJunction(props) {
    const edit = editOf(props)
    const cards = items(props.items, [])
    const points = lines(props.leadPoints, [])
    return (
      <SectionShell props={props} className="ud-jn ud-jn-secure" tone="default">
        <Head props={props} align="center" />
        <div className="ud-jn-secure__lead">
          <div className="ud-jn-secure__lead-copy">
            <EditableText
              edit={edit}
              path={['leadTitle']}
              value={str(props.leadTitle)}
              as="h3"
              className="ud-jn-card__title"
              placeholder="Title"
            />
            <SafeText value={str(props.leadText)} className="ud-jn-card__text" edit={edit} path={['leadText']} placeholder="Copy" />
            {points.length || edit ? (
              <ul className="ud-jn-checks">
                {points.map((value, index) => (
                  <li key={index}>
                    <Icon name="check" size={13} />
                    <EditableText
                      edit={edit}
                      path={['leadPoints']}
                      value={value}
                      as="span"
                      placeholder="Point"
                      transform={(next) => points.map((line, position) => (position === index ? next : line)).join('\n')}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <Media src={props.leadImage} alt="" ratio="4 / 3" className="ud-jn-secure__lead-shot" edit={edit} path={['leadImage']} />
        </div>
        <div className="ud-jn-secure__grid">
          {cards.map((item, index) => (
            <article key={index} className="ud-jn-card" style={{ '--jn-tint': str(item.tint, '#eeeae6') } as CSSProperties}>
              <div className="ud-jn-card__copy">
                <EditableText
                  edit={edit}
                  path={['items', index, 'title']}
                  value={str(item.title)}
                  as="h3"
                  className="ud-jn-card__title"
                  placeholder="Title"
                />
                <SafeText
                  value={str(item.text)}
                  className="ud-jn-card__text"
                  edit={edit}
                  path={['items', index, 'text']}
                  placeholder="Copy"
                />
              </div>
              <div className="ud-jn-card__shot">
                <Media src={item.image} alt="" ratio="16 / 10" edit={edit} path={['items', index, 'image']} />
              </div>
            </article>
          ))}
        </div>
        {str(props.buttonLabel) || edit ? (
          <div className="ud-jn-cards__foot">
            <JnButton href={str(props.buttonUrl, '#')}>
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
            </JnButton>
          </div>
        ) : null}
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ steps.junction */

export const stepsJunction = defineBlock({
  type: 'steps.junction',
  version: 1,
  category: 'content',
  label: 'Junction numbered steps',
  icon: 'Target',
  defaultProps: {
    heading: 'Five steps to your first Ledgerly build',
    items: [
      { title: 'Authorise Ledgerly once' },
      { title: 'Pick what Junction should watch for' },
      { title: 'Say what should happen in Ledgerly' },
      { title: 'Point the fields at each other' },
      { title: 'Rehearse it, then let it run' },
    ],
    animation: 'fade-up',
  },
  schema: schema(headingField, repeater('items', 'Steps', [text('title', 'Title')], { itemLabel: 'Step' })),
  component: function StepsJunction(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-jn ud-jn-indigo ud-jn-steps" tone="dark">
        <EditableText
          edit={edit}
          path={['heading']}
          value={str(props.heading)}
          as="h2"
          className="ud-jn-title ud-jn-title--center"
          placeholder="Heading"
        />
        <ol className="ud-jn-steps__list">
          {rows.map((item, index) => (
            <li key={index} className="ud-jn-step">
              <span className="ud-jn-step__num">{pad(index)}</span>
              <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="span" placeholder="Step" />
            </li>
          ))}
        </ol>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- usecases.junction */

export const useCasesJunction = defineBlock({
  type: 'usecases.junction',
  version: 1,
  category: 'content',
  label: 'Junction use-case cards',
  icon: 'Book',
  defaultProps: {
    heading: 'Where Ledgerly usually leaks time',
    description: '',
    items: [
      {
        title: 'The invoice that follows the deal',
        text: 'A won deal becomes a draft invoice with the right terms already on it, before anyone opens a tab.',
      },
      {
        title: 'Answers without the Slack message',
        text: 'Payment status lands on the account record, so sales stops pinging finance for an update.',
      },
      {
        title: 'Handoffs that do not need chasing',
        text: 'The moment an approval clears, the next owner hears about it with the record attached.',
      },
      {
        title: 'A month-end that starts finished',
        text: 'The reconciliation pack assembles itself overnight and is waiting when the team logs on.',
      },
      {
        title: 'Catch the rate that quietly moved',
        text: 'Anything billed above the agreed rate gets held and flagged before a payment run touches it.',
      },
      {
        title: 'Analytics that stays current',
        text: 'Typed rows arrive in the warehouse on your schedule, not whenever somebody exports a CSV.',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    descriptionField,
    repeater('items', 'Cards', [text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Card' }),
  ),
  component: function UseCasesJunction(props) {
    const edit = editOf(props)
    const cards = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-jn ud-jn-usecases" tone="surface">
        <Head props={props} align="center" />
        <div className="ud-jn-usecases__grid">
          {cards.map((item, index) => (
            <article key={index} className="ud-jn-usecase">
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-jn-usecase__title"
                placeholder="Title"
              />
              <SafeText
                value={str(item.text)}
                className="ud-jn-usecase__text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="Copy"
              />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------- workflows.junction */

export const workflowsJunction = defineBlock({
  type: 'workflows.junction',
  version: 1,
  category: 'content',
  label: 'Junction workflow rows',
  icon: 'Zap',
  defaultProps: {
    heading: 'Start from a build that already works',
    searchPlaceholder: 'Which app should Ledgerly talk to?',
    items: [
      { title: 'Open a Ledgerly account the moment Fluxdesk marks a deal won', pair: 'Fluxdesk → Ledgerly', badge: 'Premium' },
      { title: 'Kick off a Cadence onboarding sequence when an invoice is issued', pair: 'Ledgerly → Cadence', badge: 'Premium' },
      { title: 'Log billable hours in Ledgerly when a Signalbox task is closed', pair: 'Signalbox → Ledgerly', badge: '' },
      { title: 'Mirror every Ledgerly entry into a Gridsheet the finance team already reads', pair: 'Ledgerly → Gridsheet', badge: '' },
      { title: 'Trigger a Northmail receipt whenever a payment settles', pair: 'Ledgerly → Northmail', badge: '' },
      { title: 'Flag the account in Pipeline when an invoice passes thirty days', pair: 'Ledgerly → Pipeline', badge: '' },
    ],
    buttonLabel: 'Show more',
    buttonUrl: '#',
    rowActionLabel: 'Use this',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    text('searchPlaceholder', 'Search placeholder'),
    repeater('items', 'Workflows', [text('title', 'Title'), text('pair', 'App pair'), text('badge', 'Badge')], { itemLabel: 'Workflow' }),
    text('rowActionLabel', 'Row button label'),
    text('buttonLabel', 'Show more label'),
    link('buttonUrl', 'Show more link'),
  ),
  component: function WorkflowsJunction(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-jn ud-jn-workflows" tone="default">
        <EditableText
          edit={edit}
          path={['heading']}
          value={str(props.heading)}
          as="h2"
          className="ud-jn-title ud-jn-title--center"
          placeholder="Heading"
        />
        <div className="ud-jn-workflows__search" aria-hidden>
          <Icon name="search" size={15} />
          <EditableText
            edit={edit}
            path={['searchPlaceholder']}
            value={str(props.searchPlaceholder)}
            as="span"
            placeholder="Search…"
          />
        </div>
        <div className="ud-jn-workflows__list">
          {rows.map((item, index) => (
            <div key={index} className="ud-jn-wf">
              <span className="ud-jn-wf__icons" aria-hidden>
                <i />
                <i />
              </span>
              <div className="ud-jn-wf__copy">
                <EditableText
                  edit={edit}
                  path={['items', index, 'title']}
                  value={str(item.title)}
                  as="p"
                  className="ud-jn-wf__title"
                  placeholder="Workflow"
                />
                <EditableText
                  edit={edit}
                  path={['items', index, 'pair']}
                  value={str(item.pair)}
                  as="p"
                  className="ud-jn-wf__pair"
                  placeholder="App + App"
                />
              </div>
              <div className="ud-jn-wf__actions">
                {str(item.badge) ? (
                  <EditableText
                    edit={edit}
                    path={['items', index, 'badge']}
                    value={str(item.badge)}
                    as="span"
                    className="ud-jn-wf__badge"
                    placeholder="Badge"
                  />
                ) : null}
                <span className="ud-jn-wf__try">
                  <EditableText edit={edit} path={['rowActionLabel']} value={str(props.rowActionLabel, 'Use this')} as="span" placeholder="Use this" />
                </span>
              </div>
            </div>
          ))}
        </div>
        {str(props.buttonLabel) || edit ? (
          <div className="ud-jn-cards__foot">
            <JnButton href={str(props.buttonUrl, '#')} variant="outline">
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Show more" />
            </JnButton>
          </div>
        ) : null}
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- triggers.junction */

export const triggersJunction = defineBlock({
  type: 'triggers.junction',
  version: 1,
  category: 'features',
  label: 'Junction triggers & actions',
  icon: 'Zap',
  defaultProps: {
    heading: 'What Junction can watch, and what it can do',
    description:
      'A trigger is Junction noticing something. An action is Junction doing something. String together as many as the job needs.',
    triggerTabLabel: 'Triggers',
    actionTabLabel: 'Actions',
    triggers: [
      { title: 'A new entry lands', text: 'Runs the moment a fresh entry lands, on standard and custom objects alike.' },
      { title: 'An entry changes', text: 'Runs on creation or on any edit, with the changed fields handed to the next step.' },
      { title: 'An import finishes', text: 'Waits for a queued bulk import to finish, then reports what made it through.' },
      { title: 'Delete record', text: 'Runs when an entry is archived or deleted, so downstream systems can catch up.' },
    ],
    actions: [
      { title: 'Look up an entry', text: 'Search on any field and hand the match to whatever comes next.' },
      { title: 'Attach running file to record', text: 'Attaches a file to the record the run is working on.' },
      { title: 'Create or amend an entry', text: 'Write a new entry, or amend the existing one when a match turns up.' },
      { title: 'Remove an attachment', text: 'Detach a document from an entry without destroying the file itself.' },
    ],
    buttonLabel: 'Show more',
    buttonUrl: '#',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    descriptionField,
    text('triggerTabLabel', 'Triggers tab label'),
    text('actionTabLabel', 'Actions tab label'),
    repeater('triggers', 'Triggers', [text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Trigger' }),
    repeater('actions', 'Actions', [text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Action' }),
    text('buttonLabel', 'Show more label'),
    link('buttonUrl', 'Show more link'),
  ),
  component: function TriggersJunction(props) {
    const edit = editOf(props)
    const [tab, setTab] = useState<'triggers' | 'actions'>('triggers')
    const rows = items(tab === 'triggers' ? props.triggers : props.actions, [])
    const collection = tab === 'triggers' ? 'triggers' : 'actions'
    return (
      <SectionShell props={props} className="ud-jn ud-jn-triggers" tone="default">
        <Head props={props} align="center" />
        <div className="ud-jn-tabs" role="group" aria-label="Triggers and actions">
          <button type="button" className={cx('ud-jn-tab', tab === 'triggers' && 'is-on')} onClick={() => setTab('triggers')}>
            <EditableText edit={edit} path={['triggerTabLabel']} value={str(props.triggerTabLabel, 'Triggers')} as="span" placeholder="Triggers" />
          </button>
          <button type="button" className={cx('ud-jn-tab', tab === 'actions' && 'is-on')} onClick={() => setTab('actions')}>
            <EditableText edit={edit} path={['actionTabLabel']} value={str(props.actionTabLabel, 'Actions')} as="span" placeholder="Actions" />
          </button>
        </div>
        <div className="ud-jn-triggers__grid">
          {rows.map((item, index) => (
            <article key={index} className="ud-jn-trigger">
              <span className={cx('ud-jn-trigger__tag', collection === 'actions' && 'is-action')}>
                {collection === 'actions' ? 'Action' : 'Trigger'}
              </span>
              <EditableText
                edit={edit}
                path={[collection, index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-jn-trigger__title"
                placeholder="Title"
              />
              <SafeText
                value={str(item.text)}
                className="ud-jn-trigger__text"
                edit={edit}
                path={[collection, index, 'text']}
                placeholder="Describe it"
              />
            </article>
          ))}
        </div>
        {str(props.buttonLabel) || edit ? (
          <div className="ud-jn-cards__foot">
            <JnButton href={str(props.buttonUrl, '#')} variant="outline">
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Show more" />
            </JnButton>
          </div>
        ) : null}
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- code.junction */

export const codeJunction = defineBlock({
  type: 'code.junction',
  version: 1,
  category: 'features',
  label: 'Junction developer cards',
  icon: 'Code',
  defaultProps: {
    eyebrow: 'For engineers',
    heading: 'Let your agents safely reach Ledgerly',
    description:
      'Your assistants get the same catalogue your people use, narrowed to what you approved, with every call logged under the agent name.',
    leftTitle: 'Ask for it in a sentence, through Bridge',
    leftText: 'Point a compatible assistant at your workspace. It sees the actions on your approved list and nothing beyond them.',
    leftSample: 'Draft the Northwind renewal on net-30, attach the signed order form, and show me exactly what you changed.',
    leftMeta: 'Any assistant that speaks the open tool protocol',
    leftButtonLabel: 'Set up Bridge',
    leftButtonUrl: '/platform',
    rightTitle: 'Or call the same thing from your own code',
    rightText: 'One package, the whole catalogue, fully typed. Same permissions, same audit trail, your runtime.',
    code: 'npm install @junction/sdk\n\nimport { Junction } from "@junction/sdk"\n\nconst jn = new Junction({ key: process.env.JUNCTION_KEY })\n\nconst invoice = await jn.run("ledgerly.invoice.create", {\n  account: "northwind",\n  terms: "net-30",\n  lines: [{ sku: "seat", qty: 42 }],\n})\n\nconsole.log(invoice.id)',
    rightButtonLabel: 'Read the Kit reference',
    rightButtonUrl: '/platform',
    footnote: 'Junction Bridge and SDK are available on every paid plan. Usage draws from the same shared run balance.',
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    text('leftTitle', 'Left title'),
    textarea('leftText', 'Left text'),
    textarea('leftSample', 'Left sample prompt'),
    text('leftMeta', 'Left meta'),
    text('leftButtonLabel', 'Left button label'),
    link('leftButtonUrl', 'Left button link'),
    text('rightTitle', 'Right title'),
    textarea('rightText', 'Right text'),
    textarea('code', 'Code sample'),
    text('rightButtonLabel', 'Right button label'),
    link('rightButtonUrl', 'Right button link'),
    text('footnote', 'Footnote'),
  ),
  component: function CodeJunction(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-jn ud-jn-code" tone="default">
        <Head props={props} />
        <div className="ud-jn-code__grid">
          <article className="ud-jn-code__card">
            <EditableText edit={edit} path={['leftTitle']} value={str(props.leftTitle)} as="h3" className="ud-jn-card__title" placeholder="Title" />
            <SafeText value={str(props.leftText)} className="ud-jn-card__text" edit={edit} path={['leftText']} placeholder="Copy" />
            <div className="ud-jn-code__sample">
              <span className="ud-jn-code__sample-label">Example prompt</span>
              <SafeText value={str(props.leftSample)} className="ud-jn-code__sample-text" edit={edit} path={['leftSample']} placeholder="Prompt" />
            </div>
            <EditableText edit={edit} path={['leftMeta']} value={str(props.leftMeta)} as="p" className="ud-jn-code__meta" placeholder="Meta" />
            {str(props.leftButtonLabel) || edit ? (
              <JnButton href={str(props.leftButtonUrl, '#')} variant="dark">
                <EditableText edit={edit} path={['leftButtonLabel']} value={str(props.leftButtonLabel)} placeholder="Button" />
              </JnButton>
            ) : null}
          </article>
          <article className="ud-jn-code__card">
            <EditableText edit={edit} path={['rightTitle']} value={str(props.rightTitle)} as="h3" className="ud-jn-card__title" placeholder="Title" />
            <SafeText value={str(props.rightText)} className="ud-jn-card__text" edit={edit} path={['rightText']} placeholder="Copy" />
            <div className="ud-jn-code__block">
              <EditableText edit={edit} path={['code']} value={str(props.code)} as="div" multiline placeholder="Code" />
            </div>
            {str(props.rightButtonLabel) || edit ? (
              <JnButton href={str(props.rightButtonUrl, '#')} variant="outline">
                <EditableText edit={edit} path={['rightButtonLabel']} value={str(props.rightButtonLabel)} placeholder="Button" />
              </JnButton>
            ) : null}
          </article>
        </div>
        {str(props.footnote) || edit ? (
          <EditableText edit={edit} path={['footnote']} value={str(props.footnote)} as="p" className="ud-jn-footnote" placeholder="Footnote" />
        ) : null}
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ stats.junction */

export const statsJunction = defineBlock({
  type: 'stats.junction',
  version: 1,
  category: 'features',
  label: 'Junction big number band',
  icon: 'Chart',
  defaultProps: {
    heading: 'Skip the demo magic.',
    headingAccent: 'Here is the meter.',
    bigNumber: '593,138,971',
    bigLabel: 'AI tasks completed on Junction last month',
    items: [
      { title: 'A catalogue you do not maintain', text: 'One catalogue, one auth model, one place to revoke.' },
      { title: 'Agents with a budget and a leash', text: 'Scoped tools, budgets and a reviewer for anything sensitive.' },
      { title: 'No migration required', text: 'It wires into the stack you have. Nothing gets replaced to make room.' },
    ],
    buttonLabel: 'See a build end to end',
    buttonUrl: '/platform',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    text('headingAccent', 'Heading accent'),
    text('bigNumber', 'Big number'),
    text('bigLabel', 'Big number label'),
    repeater('items', 'Columns', [text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Column' }),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
  ),
  component: function StatsJunction(props) {
    const edit = editOf(props)
    const cols = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-jn ud-jn-dark ud-jn-bignum" tone="dark">
        <div className="ud-jn-bignum__head">
          <h2 className="ud-jn-title ud-jn-title--center">
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="span" placeholder="Heading" />{' '}
            <EditableText edit={edit} path={['headingAccent']} value={str(props.headingAccent)} as="span" className="ud-jn-mark" placeholder="accent" />
          </h2>
        </div>
        <EditableText
          edit={edit}
          path={['bigNumber']}
          value={str(props.bigNumber)}
          as="p"
          className="ud-jn-bignum__value"
          placeholder="000,000"
        />
        <EditableText
          edit={edit}
          path={['bigLabel']}
          value={str(props.bigLabel)}
          as="p"
          className="ud-jn-bignum__label"
          placeholder="Label"
        />
        <div className="ud-jn-bignum__grid">
          {cols.map((item, index) => (
            <div key={index} className="ud-jn-bignum__col">
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-jn-bignum__col-title"
                placeholder="Title"
              />
              <SafeText
                value={str(item.text)}
                className="ud-jn-bignum__col-text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="Copy"
              />
            </div>
          ))}
        </div>
        {str(props.buttonLabel) || edit ? (
          <div className="ud-jn-cards__foot">
            <JnButton href={str(props.buttonUrl, '#')}>
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
            </JnButton>
          </div>
        ) : null}
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- metrics.junction */

export const metricsJunction = defineBlock({
  type: 'metrics.junction',
  version: 1,
  category: 'features',
  label: 'Junction outcome metrics',
  icon: 'Chart',
  defaultProps: {
    heading: 'What actually',
    headingAccent: 'moved for them',
    description: 'Reported by customers six months in. We stopped publishing the year-three figures; nobody believed them.',
    items: [
      { value: '11h', title: 'Given back per person, weekly', text: 'Time that used to go to copying records between systems.' },
      { value: '3.4x', title: 'More builds reaching production', text: 'The queue stopped being the reason things sat half-finished.' },
      { value: '62%', title: 'Drop in after-hours pages', text: 'Most breakages now surface in a rehearsal, at four in the afternoon.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    text('headingAccent', 'Heading accent'),
    descriptionField,
    repeater('items', 'Metrics', [text('value', 'Value'), text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Metric' }),
  ),
  component: function MetricsJunction(props) {
    const edit = editOf(props)
    const cols = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-jn ud-jn-metrics" tone="default">
        <Head props={props} align="center" />
        <div className="ud-jn-metrics__grid">
          {cols.map((item, index) => (
            <div key={index} className="ud-jn-metric">
              <EditableText
                edit={edit}
                path={['items', index, 'value']}
                value={str(item.value)}
                as="p"
                className="ud-jn-metric__value"
                placeholder="42%"
              />
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-jn-metric__title"
                placeholder="Title"
              />
              <SafeText
                value={str(item.text)}
                className="ud-jn-metric__text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="Copy"
              />
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ quote.junction */

export const quoteJunction = defineBlock({
  type: 'quote.junction',
  version: 1,
  category: 'testimonials',
  label: 'Junction customer proof',
  icon: 'Quote',
  defaultProps: {
    heading: 'From two-person startups to',
    headingAccent: 'companies with a compliance department',
    quote:
      'We had forty spreadsheets pretending to be a system. Now there are eleven builds, each with a name on it, and I can answer "who changed that" in about nine seconds.',
    author: 'Priya Raghavan',
    role: 'Director of Operations, Northwind',
    logoLabel: 'NORTHWIND',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1000&q=80',
    stats: [
      { value: '42+', label: 'People building each week' },
      { value: '87%', label: 'Of requests never reached IT' },
    ],
    buttonLabel: 'Read how they did it',
    buttonUrl: '/solutions',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    text('headingAccent', 'Heading accent'),
    textarea('quote', 'Quote'),
    text('author', 'Author'),
    text('role', 'Role'),
    text('logoLabel', 'Overlay wordmark'),
    image('image', 'Photo'),
    repeater('stats', 'Stats', [text('value', 'Value'), text('label', 'Label')], { itemLabel: 'Stat' }),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
  ),
  component: function QuoteJunction(props) {
    const edit = editOf(props)
    const stats = items(props.stats, [])
    return (
      <SectionShell props={props} className="ud-jn ud-jn-quote" tone="surface">
        <h2 className="ud-jn-title ud-jn-title--center">
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="span" placeholder="Heading" />{' '}
          <EditableText edit={edit} path={['headingAccent']} value={str(props.headingAccent)} as="span" className="ud-jn-mark" placeholder="accent" />
        </h2>
        <div className="ud-jn-quote__grid">
          <div className="ud-jn-quote__copy">
            <SafeText value={str(props.quote)} className="ud-jn-quote__text" edit={edit} path={['quote']} placeholder="Quote" />
            <p className="ud-jn-quote__by">
              <EditableText edit={edit} path={['author']} value={str(props.author)} as="strong" placeholder="Name" />
              <EditableText edit={edit} path={['role']} value={str(props.role)} as="span" placeholder="Role" />
            </p>
            <div className="ud-jn-quote__stats">
              {stats.map((item, index) => (
                <div key={index}>
                  <EditableText
                    edit={edit}
                    path={['stats', index, 'value']}
                    value={str(item.value)}
                    as="p"
                    className="ud-jn-quote__stat-value"
                    placeholder="42+"
                  />
                  <EditableText
                    edit={edit}
                    path={['stats', index, 'label']}
                    value={str(item.label)}
                    as="p"
                    className="ud-jn-quote__stat-label"
                    placeholder="Label"
                  />
                </div>
              ))}
            </div>
            {str(props.buttonLabel) || edit ? (
              <JnButton href={str(props.buttonUrl, '#')} variant="outline">
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
              </JnButton>
            ) : null}
          </div>
          <div className="ud-jn-quote__art">
            <Media src={props.image} alt="" ratio="4 / 5" edit={edit} path={['image']} />
            <EditableText
              edit={edit}
              path={['logoLabel']}
              value={str(props.logoLabel)}
              as="span"
              className="ud-jn-quote__word"
              placeholder="WORDMARK"
            />
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ logos.junction */

export const logosJunction = defineBlock({
  type: 'logos.junction',
  version: 1,
  category: 'gallery',
  label: 'Junction logo strip',
  icon: 'Globe',
  defaultProps: {
    heading: 'Operations teams wiring their stack on Junction',
    items: [
      { label: 'Northwind' },
      { label: 'Meridian' },
      { label: 'Halcyon' },
      { label: 'Dropstone' },
      { label: 'Aster' },
      { label: 'Brine & Co' },
      { label: 'Quillbank' },
      { label: 'Vale Orbit' },
    ],
    animation: 'fade-up',
  },
  schema: schema(headingField, repeater('items', 'Logos', [text('label', 'Label')], { itemLabel: 'Logo' })),
  component: function LogosJunction(props) {
    const edit = editOf(props)
    const logos = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-jn ud-jn-logos" tone="default">
        <EditableText
          edit={edit}
          path={['heading']}
          value={str(props.heading)}
          as="p"
          className="ud-jn-logos__title"
          placeholder="Heading"
        />
        <div className="ud-jn-logos__row">
          {logos.map((item, index) => (
            <EditableText
              key={index}
              edit={edit}
              path={['items', index, 'label']}
              value={str(item.label)}
              as="span"
              className="ud-jn-logo-word"
              placeholder="Logo"
            />
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- pricing.junction */

/** One plan column. Shared by every tab so the shapes stay identical. */
const planFields = [
  text('name', 'Name'),
  text('sub', 'Sub label'),
  text('price', 'Fallback price'),
  text('unit', 'Price unit'),
  textarea('priceTiers', 'Monthly price per slider stop', { help: 'One price per line, aligned to the slider stops.' }),
  textarea('yearlyPriceTiers', 'Yearly price per slider stop', { help: 'One price per line. Leave blank to reuse the monthly list.' }),
  textarea('text', 'Description'),
  text('buttonLabel', 'Button label'),
  link('buttonUrl', 'Button link'),
  text('featuresLabel', 'Features label'),
  textarea('features', 'Features', { help: 'One per line.' }),
  text('linkLabel', 'Secondary link label'),
  link('linkUrl', 'Secondary link URL'),
  field('featured', 'toggle', 'Highlight', 'content'),
]

const runtimePlans = [
  {
    name: 'Free',
    sub: 'Always free',
    price: '$0',
    unit: '/month',
    priceTiers: '$0\n$0\n—\n—\n—\n—\n—\n—',
    yearlyPriceTiers: '$0\n$0\n—\n—\n—\n—\n—\n—',
    text: 'Enough to wire your first few connections and find out whether this holds up.',
    buttonLabel: 'Start building',
    buttonUrl: '/pricing',
    featuresLabel: 'What you get:',
    features: 'The whole runtime\nUnlimited Tables and Forms\nTwo-step builds\nCommunity library',
    featured: false,
    linkLabel: '',
    linkUrl: '',
  },
  {
    name: 'Builder',
    sub: 'From',
    price: '$24',
    unit: '/month',
    priceTiers: '$24\n$39\n$79\n$169\n$289\n$620\n$980\nLet us talk',
    yearlyPriceTiers: '$20\n$32\n$66\n$141\n$241\n$517\n$817\nLet us talk',
    text: 'For one person who has decided to stop doing it by hand.',
    buttonLabel: 'Start building',
    buttonUrl: '/pricing',
    featuresLabel: 'What you get:',
    features: 'Unlimited steps per build\nEvery connector, no premium tier\nWebhooks and schedules\nVersion history\nEmail support',
    featured: false,
    linkLabel: '',
    linkUrl: '',
  },
  {
    name: 'Crew',
    sub: 'From',
    price: '$74',
    unit: '/month',
    priceTiers: '$74\n$96\n$168\n$340\n$560\n$1,180\n$1,860\nLet us talk',
    yearlyPriceTiers: '$62\n$80\n$140\n$284\n$467\n$984\n$1,550\nLet us talk',
    text: 'For a group that needs to see each other work and share the same connections.',
    buttonLabel: 'Start building',
    buttonUrl: '/pricing',
    featuresLabel: 'What you get:',
    features: '25 seats included\nShared workspaces\nShared connections\nDirectory sync and SSO\nApproval gates',
    featured: true,
    linkLabel: 'Talk to us',
    linkUrl: '/pricing',
  },
  {
    name: 'Enterprise',
    sub: '',
    price: 'Let us talk',
    unit: '',
    priceTiers: '',
    yearlyPriceTiers: '',
    text: 'For companies where a wrong permission is a real incident.',
    buttonLabel: 'Talk to us',
    buttonUrl: '/pricing',
    featuresLabel: 'What you get:',
    features: 'Seats without a ceiling\nFine-grained admin roles\nRun it in your own perimeter\nRegion pinned per workspace\nLog streaming\nA named engineer',
    featured: false,
    linkLabel: 'What Enterprise adds',
    linkUrl: '/platform',
  },
]

const agentPlans = [
  {
    name: 'Trial',
    sub: 'Always free',
    price: '$0',
    unit: '/month',
    priceTiers: '$0\n$0\n—\n—\n—\n—\n—\n—',
    yearlyPriceTiers: '$0\n$0\n—\n—\n—\n—\n—\n—',
    text: 'One agent, a small budget, and every guardrail switched on.',
    buttonLabel: 'Start building',
    buttonUrl: '/pricing',
    featuresLabel: 'What you get:',
    features: 'One live agent\nScoped tool lists\nSpend ceiling per run\nFull decision log',
    featured: false,
    linkLabel: '',
    linkUrl: '',
  },
  {
    name: 'Squad',
    sub: 'From',
    price: '$59',
    unit: '/month',
    priceTiers: '$59\n$88\n$180\n$370\n$610\n$1,290\n$2,040\nLet us talk',
    yearlyPriceTiers: '$49\n$73\n$150\n$309\n$509\n$1,076\n$1,700\nLet us talk',
    text: 'For teams handing real judgement calls to an agent for the first time.',
    buttonLabel: 'Start building',
    buttonUrl: '/pricing',
    featuresLabel: 'What you get:',
    features: 'Ten live agents\nBring your own model keys\nHuman review on flagged steps\nPer-agent budgets\nReplay any decision',
    featured: true,
    linkLabel: 'Talk to us',
    linkUrl: '/pricing',
  },
  {
    name: 'Fleet',
    sub: '',
    price: 'Let us talk',
    unit: '',
    priceTiers: '',
    yearlyPriceTiers: '',
    text: 'For agents acting on customer data, where the audit matters as much as the outcome.',
    buttonLabel: 'Talk to us',
    buttonUrl: '/pricing',
    featuresLabel: 'What you get:',
    features: 'Agents without a ceiling\nPrivate model endpoints\nPolicy tests before release\nLog streaming\nA named engineer',
    featured: false,
    linkLabel: 'What Enterprise adds',
    linkUrl: '/platform',
  },
]

const assistantPlans = [
  {
    name: 'Starter',
    sub: 'Always free',
    price: '$0',
    unit: '/month',
    priceTiers: '$0\n$0\n—\n—\n—\n—\n—\n—',
    yearlyPriceTiers: '$0\n$0\n—\n—\n—\n—\n—\n—',
    text: 'One assistant on your own docs, answering in your own words.',
    buttonLabel: 'Start building',
    buttonUrl: '/pricing',
    featuresLabel: 'What you get:',
    features: 'One assistant\nUp to 200 documents\nWeb and Slack surfaces\nConversation history',
    featured: false,
    linkLabel: '',
    linkUrl: '',
  },
  {
    name: 'Desk',
    sub: 'From',
    price: '$39',
    unit: '/month',
    priceTiers: '$39\n$62\n$130\n$268\n$440\n$930\n$1,470\nLet us talk',
    yearlyPriceTiers: '$33\n$52\n$108\n$223\n$367\n$775\n$1,225\nLet us talk',
    text: 'For a support desk that wants deflection without sounding like a robot.',
    buttonLabel: 'Start building',
    buttonUrl: '/pricing',
    featuresLabel: 'What you get:',
    features: 'Five assistants\nUnlimited documents\nHandover to a human\nTone and refusal rules\nAnswer quality reports',
    featured: true,
    linkLabel: 'Talk to us',
    linkUrl: '/pricing',
  },
  {
    name: 'Company',
    sub: '',
    price: 'Let us talk',
    unit: '',
    priceTiers: '',
    yearlyPriceTiers: '',
    text: 'For assistants that speak to customers under your name and your legal team.',
    buttonLabel: 'Talk to us',
    buttonUrl: '/pricing',
    featuresLabel: 'What you get:',
    features: 'Assistants without a ceiling\nRegion pinned per workspace\nRedaction before storage\nTranscript export\nA named engineer',
    featured: false,
    linkLabel: 'What Enterprise adds',
    linkUrl: '/platform',
  },
]

/** Price for a plan at the current slider stop, falling back to the flat price. */
function tierPrice(plan: Props, stop: number, yearly: boolean) {
  const monthly = lines(plan.priceTiers, [])
  const yearlyList = lines(plan.yearlyPriceTiers, [])
  const list = yearly && yearlyList.length ? yearlyList : monthly
  if (!list.length) return { value: str(plan.price), key: 'price', index: -1 }
  const index = Math.min(Math.max(stop, 0), list.length - 1)
  return { value: list[index], key: yearly && yearlyList.length ? 'yearlyPriceTiers' : 'priceTiers', index }
}

export const pricingJunction = defineBlock({
  type: 'pricing.junction',
  version: 2,
  category: 'pricing',
  label: 'Junction pricing tiers',
  icon: 'Chart',
  defaultProps: {
    segmentLabel: 'Runtime',
    addOnLabel: 'Extras',
    segments: [{ label: 'Full runtime', plans: runtimePlans }],
    addOns: [
      { label: 'Agents', plans: agentPlans },
      { label: 'Assistants', plans: assistantPlans },
    ],
    sliderLabel: 'What monthly volume are you planning for?',
    sliderLink: 'How volume is counted',
    sliderUnit: 'steps / month',
    sliderTicks: [
      { label: '750' },
      { label: '2K' },
      { label: '10K' },
      { label: '50K' },
      { label: '100K' },
      { label: '500K' },
      { label: '1M' },
      { label: '2M+' },
    ],
    startStop: 2,
    monthlyLabel: 'Billed monthly',
    yearlyLabel: 'Billed yearly — two months free',
    currencyLabel: 'USD ($)',
    footnote: 'Volume and controls change between tiers. The runtime does not.',
    buttonLabel: 'Compare every line',
    buttonUrl: '#',
    animation: 'fade-up',
  },
  schema: schema(
    text('segmentLabel', 'First group label'),
    text('addOnLabel', 'Second group label'),
    repeater('segments', 'First group tabs', [text('label', 'Tab label'), repeater('plans', 'Plans', planFields, { itemLabel: 'Plan' })], {
      itemLabel: 'Tab',
    }),
    repeater('addOns', 'Second group tabs', [text('label', 'Tab label'), repeater('plans', 'Plans', planFields, { itemLabel: 'Plan' })], {
      itemLabel: 'Tab',
    }),
    text('sliderLabel', 'Slider label'),
    text('sliderLink', 'Slider link label'),
    text('sliderUnit', 'Slider unit'),
    repeater('sliderTicks', 'Slider stops', [text('label', 'Label')], { itemLabel: 'Stop' }),
    repeater('items', 'Plans (legacy pages)', planFields, { itemLabel: 'Plan' }),
    field('startStop', 'number', 'Default slider stop', 'content', { min: 0, max: 20 }),
    text('monthlyLabel', 'Monthly label'),
    text('yearlyLabel', 'Yearly label'),
    text('currencyLabel', 'Currency label'),
    text('footnote', 'Footnote'),
    text('buttonLabel', 'Footer button label'),
    link('buttonUrl', 'Footer button link'),
  ),
  component: function PricingJunction(props) {
    const edit = editOf(props)
    const segments = items(props.segments, [])
    const addOns = items(props.addOns, [])
    const ticks = items(props.sliderTicks, [])
    const maxStop = Math.max(ticks.length - 1, 0)

    // `group` picks which repeater the active tab lives in, so each tab keeps
    // its own plan set and the side panel edits the one you are looking at.
    const [tab, setTab] = useState<{ group: 'segments' | 'addOns'; index: number }>({ group: 'segments', index: 0 })
    const [stop, setStop] = useState(Math.min(Math.max(num(props.startStop, 2), 0), maxStop))
    const [yearly, setYearly] = useState(true)

    const active = (tab.group === 'segments' ? segments : addOns)[tab.index]
    const group = active ? tab.group : 'segments'
    const index = active ? tab.index : 0
    const tabPlans = items(active ? active.plans : [], [])
    // Pages built against v1 stored their plans in a flat `items` array. Fall
    // back to it so an existing site keeps rendering after this block upgrades.
    const legacyPlans = items(props.items, [])
    const usingLegacy = tabPlans.length === 0 && legacyPlans.length > 0
    const plans = usingLegacy ? legacyPlans : tabPlans
    const planPath = (planIndex: number, ...rest: Array<string | number>) =>
      usingLegacy ? ['items', planIndex, ...rest] : [group, index, 'plans', planIndex, ...rest]
    const tick = ticks[Math.min(stop, maxStop)]

    /** A tab button; while editing, clicking the label edits instead of switching. */
    const Tab = ({ item, itemGroup, itemIndex }: { item: Props; itemGroup: 'segments' | 'addOns'; itemIndex: number }) => (
      <button
        type="button"
        className={cx('ud-jn-seg__btn', group === itemGroup && index === itemIndex && 'is-on')}
        aria-pressed={group === itemGroup && index === itemIndex}
        onClick={(event) => {
          if (edit && (event.target as HTMLElement).closest('.ud-editable')) return
          setTab({ group: itemGroup, index: itemIndex })
        }}
      >
        <EditableText edit={edit} path={[itemGroup, itemIndex, 'label']} value={str(item.label)} as="span" placeholder="Tab" />
      </button>
    )

    return (
      <SectionShell props={props} className="ud-jn ud-jn-pricing" tone="default">
        <div className="ud-jn-pricing__segments">
          <div className="ud-jn-seg">
            <EditableText edit={edit} path={['segmentLabel']} value={str(props.segmentLabel)} as="p" className="ud-jn-seg__label" placeholder="Group" />
            <div className="ud-jn-seg__row">
              {segments.map((item, itemIndex) => (
                <Tab key={itemIndex} item={item} itemGroup="segments" itemIndex={itemIndex} />
              ))}
            </div>
          </div>
          <div className="ud-jn-seg">
            <EditableText edit={edit} path={['addOnLabel']} value={str(props.addOnLabel)} as="p" className="ud-jn-seg__label" placeholder="Add-ons" />
            <div className="ud-jn-seg__row">
              {addOns.map((item, itemIndex) => (
                <Tab key={itemIndex} item={item} itemGroup="addOns" itemIndex={itemIndex} />
              ))}
            </div>
          </div>
        </div>

        <div className="ud-jn-slider">
          <div className="ud-jn-slider__top">
            <EditableText edit={edit} path={['sliderLabel']} value={str(props.sliderLabel)} as="p" className="ud-jn-slider__label" placeholder="How much volume?" />
            <a className="ud-jn-slider__link" href="#">
              <EditableText edit={edit} path={['sliderLink']} value={str(props.sliderLink)} as="span" placeholder="How volume is counted" />
            </a>
          </div>
          <p className="ud-jn-slider__value">
            <strong>{str(tick && tick.label, '—')}</strong>
            <EditableText edit={edit} path={['sliderUnit']} value={str(props.sliderUnit)} as="span" placeholder="steps / month" />
          </p>
          <input
            className="ud-jn-slider__range"
            type="range"
            min={0}
            max={maxStop}
            step={1}
            value={Math.min(stop, maxStop)}
            aria-label={str(props.sliderLabel, 'Volume')}
            onChange={(event) => setStop(Number(event.target.value))}
          />
          <div className="ud-jn-slider__ticks">
            {ticks.map((item, itemIndex) => (
              <span key={itemIndex} className={cx('ud-jn-slider__tick', itemIndex === stop && 'is-on')}>
                <EditableText edit={edit} path={['sliderTicks', itemIndex, 'label']} value={str(item.label)} as="span" placeholder="1K" />
              </span>
            ))}
          </div>
        </div>

        <div className="ud-jn-pricing__billing">
          <button type="button" className={cx('ud-jn-radio', !yearly && 'is-on')} onClick={(event) => {
            if (edit && (event.target as HTMLElement).closest('.ud-editable')) return
            setYearly(false)
          }}>
            <span className="ud-jn-radio__dot" aria-hidden />
            <EditableText edit={edit} path={['monthlyLabel']} value={str(props.monthlyLabel, 'Billed monthly')} as="span" placeholder="Billed monthly" />
          </button>
          <button type="button" className={cx('ud-jn-radio', yearly && 'is-on')} onClick={(event) => {
            if (edit && (event.target as HTMLElement).closest('.ud-editable')) return
            setYearly(true)
          }}>
            <span className="ud-jn-radio__dot" aria-hidden />
            <EditableText edit={edit} path={['yearlyLabel']} value={str(props.yearlyLabel, 'Billed yearly')} as="span" placeholder="Billed yearly" />
          </button>
          <span className="ud-jn-currency">
            <EditableText edit={edit} path={['currencyLabel']} value={str(props.currencyLabel, 'USD ($)')} as="span" placeholder="USD ($)" />
          </span>
        </div>

        <div className="ud-jn-plans">
          {plans.map((plan, planIndex) => {
            const features = lines(plan.features, [])
            const price = tierPrice(plan, stop, yearly)
            const pricePath =
              price.index >= 0 ? planPath(planIndex, price.key, price.index) : planPath(planIndex, 'price')
            return (
              <article key={planIndex} className={cx('ud-jn-plan', bool(plan.featured) && 'ud-jn-plan--featured')}>
                <EditableText
                  edit={edit}
                  path={planPath(planIndex, 'name')}
                  value={str(plan.name)}
                  as="h3"
                  className="ud-jn-plan__name"
                  placeholder="Plan"
                />
                {str(plan.sub) || edit ? (
                  <EditableText
                    edit={edit}
                    path={planPath(planIndex, 'sub')}
                    value={str(plan.sub)}
                    as="p"
                    className="ud-jn-plan__sub"
                    placeholder="From"
                  />
                ) : null}
                <p className="ud-jn-plan__price">
                  {price.index >= 0 ? (
                    <EditableText
                      edit={edit}
                      path={planPath(planIndex, price.key)}
                      value={price.value}
                      as="span"
                      placeholder="$0"
                      transform={(next) =>
                        lines(plan[price.key], []).map((line, position) => (position === price.index ? next : line)).join('\n')
                      }
                    />
                  ) : (
                    <EditableText edit={edit} path={pricePath} value={price.value} as="span" placeholder="$0" />
                  )}
                  <EditableText
                    edit={edit}
                    path={planPath(planIndex, 'unit')}
                    value={str(plan.unit)}
                    as="span"
                    className="ud-jn-plan__unit"
                    placeholder="/month"
                  />
                </p>
                <SafeText
                  value={str(plan.text)}
                  className="ud-jn-plan__text"
                  edit={edit}
                  path={planPath(planIndex, 'text')}
                  placeholder="Who it is for"
                />
                <a
                  className={cx('ud-jn-btn', 'ud-jn-plan__cta', bool(plan.featured) ? 'ud-jn-btn--orange' : 'ud-jn-btn--dark')}
                  href={str(plan.buttonUrl, '#')}
                >
                  <EditableText
                    edit={edit}
                    path={planPath(planIndex, 'buttonLabel')}
                    value={str(plan.buttonLabel)}
                    placeholder="Start building"
                  />
                  <Icon name="arrow" size={13} />
                </a>
                {str(plan.linkLabel) ? (
                  <a className="ud-jn-plan__link" href={str(plan.linkUrl, '#')}>
                    <EditableText
                      edit={edit}
                      path={planPath(planIndex, 'linkLabel')}
                      value={str(plan.linkLabel)}
                      as="span"
                      placeholder="Talk to us"
                    />
                  </a>
                ) : null}
                <EditableText
                  edit={edit}
                  path={planPath(planIndex, 'featuresLabel')}
                  value={str(plan.featuresLabel, 'What you get:')}
                  as="p"
                  className="ud-jn-plan__flabel"
                  placeholder="What you get:"
                />
                <ul className="ud-jn-plan__list">
                  {features.map((value, featureIndex) => (
                    <li key={featureIndex}>
                      <Icon name="check" size={12} />
                      <EditableText
                        edit={edit}
                        path={planPath(planIndex, 'features')}
                        value={value}
                        as="span"
                        placeholder="Feature"
                        transform={(next) => features.map((line, position) => (position === featureIndex ? next : line)).join('\n')}
                      />
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
        {str(props.footnote) || edit ? (
          <EditableText edit={edit} path={['footnote']} value={str(props.footnote)} as="p" className="ud-jn-footnote" placeholder="Footnote" />
        ) : null}
        {str(props.buttonLabel) || edit ? (
          <div className="ud-jn-cards__foot">
            <JnButton href={str(props.buttonUrl, '#')} variant="outline">
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Compare every line" />
              <Icon name="arrow" size={13} />
            </JnButton>
          </div>
        ) : null}
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- included.junction */

export const includedJunction = defineBlock({
  type: 'included.junction',
  version: 1,
  category: 'pricing',
  label: 'Junction plan includes',
  icon: 'Layers',
  defaultProps: {
    heading: 'Every paid tier ships with',
    columns: [
      {
        title: 'The whole build surface',
        points: 'Unlimited premium apps\nTables for data storage and Forms for custom flows\nUnlimited app integrations\nBuilt-in AI and workflow tools',
      },
      {
        title: 'Change management that scales capabilities',
        points: 'Version control\nCustom error notifications\nAdvanced run settings',
      },
    ],
    accessTitle: 'The whole toolkit, every tier',
    access: [
      { label: 'Forms', icon: 'pen', color: '#e8631a' },
      { label: 'Tables', icon: 'layers', color: '#2f7d59' },
      { label: 'Runs', icon: 'zap', color: '#2563c7' },
      { label: 'Canvas', icon: 'palette', color: '#7c3aed' },
      { label: 'Agents', icon: 'cpu', color: '#e8631a' },
      { label: 'SDK', icon: 'code', color: '#1f1d1b' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    repeater('columns', 'Columns', [text('title', 'Title'), textarea('points', 'Points', { help: 'One per line.' })], { itemLabel: 'Column' }),
    text('accessTitle', 'Access column title'),
    repeater('access', 'Products', [text('label', 'Label'), icon('icon', 'Icon'), field('color', 'color', 'Color', 'content')], {
      itemLabel: 'Product',
    }),
  ),
  component: function IncludedJunction(props) {
    const edit = editOf(props)
    const columns = items(props.columns, [])
    const access = items(props.access, [])
    return (
      <SectionShell props={props} className="ud-jn ud-jn-included" tone="default">
        <div className="ud-jn-included__panel">
          <EditableText
            edit={edit}
            path={['heading']}
            value={str(props.heading)}
            as="h2"
            className="ud-jn-included__title"
            placeholder="Heading"
          />
          <div className="ud-jn-included__cols">
            {columns.map((column, index) => {
              const points = lines(column.points, [])
              return (
                <div key={index}>
                  <EditableText
                    edit={edit}
                    path={['columns', index, 'title']}
                    value={str(column.title)}
                    as="h3"
                    className="ud-jn-included__col-title"
                    placeholder="Title"
                  />
                  <ul className="ud-jn-checks">
                    {points.map((value, pointIndex) => (
                      <li key={pointIndex}>
                        <Icon name="check" size={12} />
                        <EditableText
                          edit={edit}
                          path={['columns', index, 'points']}
                          value={value}
                          as="span"
                          placeholder="Point"
                          transform={(next) => points.map((line, position) => (position === pointIndex ? next : line)).join('\n')}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
            <div>
              <EditableText
                edit={edit}
                path={['accessTitle']}
                value={str(props.accessTitle)}
                as="h3"
                className="ud-jn-included__col-title"
                placeholder="Title"
              />
              <ul className="ud-jn-access">
                {access.map((item, index) => (
                  <li key={index}>
                    <span className="ud-jn-access__icon" style={{ color: str(item.color, '#e8631a') } as CSSProperties} aria-hidden>
                      <Icon name={str(item.icon, 'layers')} size={15} />
                    </span>
                    <EditableText edit={edit} path={['access', index, 'label']} value={str(item.label)} as="span" placeholder="Product" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------- platform.junction */

export const platformJunction = defineBlock({
  type: 'platform.junction',
  version: 1,
  category: 'features',
  label: 'Junction platform band',
  icon: 'Layers',
  defaultProps: {
    heading: 'The pieces, and how they fit',
    description:
      'With your Junction plan you can use the whole platform to build complete automation systems. Each tool stands alone, and they compose into something bigger.',
    brand: 'junction',
    brandNote: 'One runtime, three surfaces',
    items: [
      { title: 'Junction Flows', text: 'Build multi-step builds with logic, branching, AI processing, Tables and Forms.', linkLabel: 'Open Flows', linkUrl: '/platform' },
      { title: 'Junction Kit', text: 'The same catalogue, callable from your own services in TypeScript or Python.', linkLabel: 'Open Kit', linkUrl: '/platform' },
      { title: 'Junction Bridge', text: 'Hand an assistant a scoped tool list and a spend ceiling. It reports back what it used.', linkLabel: 'Open Bridge', linkUrl: '/platform' },
    ],
    stripTitle: 'Models are yours to choose',
    stripText: 'Transform your builds with AI that works with your current tools, so you build smarter systems in minutes instead of months.',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    descriptionField,
    text('brand', 'Panel wordmark'),
    text('brandNote', 'Panel note'),
    repeater('items', 'Products', [text('title', 'Title'), textarea('text', 'Text'), text('linkLabel', 'Link label'), link('linkUrl', 'Link URL')], {
      itemLabel: 'Product',
    }),
    text('stripTitle', 'Strip title'),
    textarea('stripText', 'Strip text'),
  ),
  component: function PlatformJunction(props) {
    const edit = editOf(props)
    const products = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-jn ud-jn-dark ud-jn-platform" tone="dark">
        <div className="ud-jn-platform__head">
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-jn-display" placeholder="Heading" />
          <SafeText value={str(props.description)} className="ud-jn-lead" edit={edit} path={['description']} placeholder="Copy" />
        </div>
        <div className="ud-jn-platform__panel">
          <div className="ud-jn-platform__brand">
            <span className="ud-jn-logo ud-jn-logo--light">
              <span className="ud-jn-logo__mark" aria-hidden />
              <EditableText edit={edit} path={['brand']} value={str(props.brand, 'junction')} as="span" placeholder="brand" />
            </span>
            <EditableText edit={edit} path={['brandNote']} value={str(props.brandNote)} as="span" className="ud-jn-platform__note" placeholder="Note" />
          </div>
          <div className="ud-jn-platform__grid">
            {products.map((item, index) => (
              <div key={index} className="ud-jn-platform__cell">
                <p className="ud-jn-platform__cell-title">
                  <span className="ud-jn-platform__spark" aria-hidden>
                    <Icon name="zap" size={13} />
                  </span>
                  <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="span" placeholder="Product" />
                </p>
                <SafeText
                  value={str(item.text)}
                  className="ud-jn-platform__cell-text"
                  edit={edit}
                  path={['items', index, 'text']}
                  placeholder="Copy"
                />
                <a className="ud-jn-platform__link" href={str(item.linkUrl, '#')}>
                  <EditableText edit={edit} path={['items', index, 'linkLabel']} value={str(item.linkLabel)} as="span" placeholder="Explore" />
                </a>
              </div>
            ))}
          </div>
          <div className="ud-jn-platform__strip">
            <p className="ud-jn-platform__cell-title">
              <span className="ud-jn-platform__spark" aria-hidden>
                <Icon name="sparkles" size={13} />
              </span>
              <EditableText edit={edit} path={['stripTitle']} value={str(props.stripTitle)} as="span" placeholder="Models are yours to choose" />
            </p>
            <SafeText
              value={str(props.stripText)}
              className="ud-jn-platform__cell-text"
              edit={edit}
              path={['stripText']}
              placeholder="Copy"
            />
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------------- faq.junction */

export const faqJunction = defineBlock({
  type: 'faq.junction',
  version: 1,
  category: 'faq',
  label: 'Junction grouped FAQ',
  icon: 'Message',
  defaultProps: {
    heading: 'Questions we get asked a lot',
    groups: [
      {
        title: 'Getting oriented',
        items: [
          { question: 'Is this going to need an engineer?', answer: 'Not for most of it. Builds are assembled visually, and the code escape hatch is there for the day you want it.' },
          { question: 'What counts as an app?', answer: 'Anything with an API that we maintain a connector for. Around eight thousand of them, and we keep them current so you do not have to.' },
          { question: 'What exactly is a build?', answer: 'One automated path: something Junction watches for, the steps that follow, and the rules wrapped around them.' },
          { question: 'How does a step get counted?', answer: 'A run is one execution of a build. Runs draw from a single shared balance across your account.' },
          { question: 'What kicks a build off?', answer: 'A new record, a clock, an inbound webhook, or a person pressing a button. Whichever fits the job.' },
          { question: 'How do I size this without guessing?', answer: 'Drag the slider above. Most teams land between two and ten thousand in month one, then grow into it.' },
        ],
      },
      {
        title: 'Money questions',
        items: [
          { question: 'Crew or Enterprise — how do I tell?', answer: 'Crew fits one department sharing ownership. Move to Enterprise when a wrong permission becomes an incident report.' },
          { question: 'Where does the seat count stop mattering?', answer: 'At Enterprise. Crew ships with 25 seats and you can add more whenever you need them.' },
          { question: 'Can I try the paid parts first?', answer: 'Fourteen days of everything, no card. If you need longer to get a real build live, ask and we will extend it.' },
          { question: 'What if I pick the wrong tier?', answer: 'Move in either direction whenever you like. Upgrades prorate to the day, downgrades take effect at renewal.' },
          { question: 'Is anything off the list price?', answer: 'Annual billing gives you two months back. Registered non-profits and pre-seed companies get half off, no negotiation needed.' },
        ],
      },
      {
        title: 'When things go wrong',
        items: [
          { question: 'Will I get handed to a salesperson?', answer: 'We do, and they are engineers first. Claim a session and you will get a plan, not a pitch.' },
          { question: 'What happens when something breaks at 2am?', answer: 'Crew gets priority email and chat during working hours. Enterprise gets a named engineer and a response window in writing.' },
          { question: 'Which region holds my data?', answer: 'Frankfurt, Virginia or Sydney. You choose per workspace on day one and it stays pinned there.' },
        ],
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    repeater(
      'groups',
      'Groups',
      [text('title', 'Group title'), repeater('items', 'Questions', [text('question', 'Question'), textarea('answer', 'Answer')], { itemLabel: 'Question' })],
      { itemLabel: 'Group' },
    ),
  ),
  component: function FaqJunction(props) {
    const edit = editOf(props)
    const groups = items(props.groups, [])
    return (
      <SectionShell props={props} className="ud-jn ud-jn-faq" tone="default">
        <EditableText
          edit={edit}
          path={['heading']}
          value={str(props.heading)}
          as="h2"
          className="ud-jn-title ud-jn-title--center"
          placeholder="Heading"
        />
        <div className="ud-jn-faq__body">
          {groups.map((group, index) => (
            <div key={index} className="ud-jn-faq__group">
              <EditableText
                edit={edit}
                path={['groups', index, 'title']}
                value={str(group.title)}
                as="p"
                className="ud-jn-faq__group-title"
                placeholder="Group"
              />
              {items(group.items, []).map((item, itemIndex) => (
                <details key={itemIndex} className="ud-jn-faq__item">
                  <summary
                    onClick={(event) => {
                      if (edit && (event.target as HTMLElement).closest('.ud-editable')) event.preventDefault()
                    }}
                  >
                    <EditableText
                      edit={edit}
                      path={['groups', index, 'items', itemIndex, 'question']}
                      value={str(item.question)}
                      as="span"
                      placeholder="Question"
                    />
                    <span className="ud-jn-faq__mark" aria-hidden>
                      <Icon name="plus" size={14} />
                    </span>
                  </summary>
                  <SafeText
                    value={str(item.answer)}
                    className="ud-jn-faq__answer"
                    edit={edit}
                    path={['groups', index, 'items', itemIndex, 'answer']}
                    placeholder="Answer"
                  />
                </details>
              ))}
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- ctaband.junction */

export const ctaBandJunction = defineBlock({
  type: 'ctaband.junction',
  version: 1,
  category: 'cta',
  label: 'Junction CTA band',
  icon: 'Rocket',
  defaultProps: {
    heading: 'Wire up one workflow and see whether it holds',
    description: '',
    buttonLabel: 'Start building',
    buttonUrl: '/pricing',
    secondaryLabel: 'Talk to an engineer, not a rep',
    secondaryUrl: '/solutions',
    animation: 'fade-up',
  },
  schema: schema(headingField, descriptionField, ...ctaFields),
  component: function CtaBandJunction(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-jn ud-jn-dark ud-jn-ctaband" tone="dark">
        <EditableText
          edit={edit}
          path={['heading']}
          value={str(props.heading)}
          as="h2"
          className="ud-jn-title ud-jn-title--center"
          placeholder="Heading"
        />
        {str(props.description) || edit ? (
          <SafeText value={str(props.description)} className="ud-jn-lead ud-jn-lead--center" edit={edit} path={['description']} placeholder="Copy" />
        ) : null}
        <div className="ud-jn-ctaband__btns">
          <Ctas props={props} primary="orange" secondary="blue" />
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- footer.junction */

export const footerJunction = defineBlock({
  type: 'footer.junction',
  version: 1,
  category: 'footer',
  label: 'Junction footer',
  icon: 'Layers',
  defaultProps: {
    ctaHeading: 'Someone on your team is automating this weekend.',
    ctaAccent: 'Give them rails to do it on.',
    buttonLabel: 'Start building',
    buttonUrl: '/pricing',
    secondaryLabel: 'Claim a session',
    secondaryUrl: '/solutions',
    logo: 'junction',
    columns: [
      { title: 'Product', links: [{ label: 'Platform', url: '/platform' }, { label: 'Integrations', url: '/integrations' }, { label: 'Pricing', url: '/pricing' }, { label: 'Security', url: '/platform' }] },
      { title: 'Solutions', links: [{ label: 'Marketing', url: '/solutions' }, { label: 'Finance', url: '/solutions' }, { label: 'Support', url: '/solutions' }, { label: 'IT', url: '/solutions' }] },
      { title: 'Resources', links: [{ label: 'Docs', url: '#' }, { label: 'Templates', url: '#' }, { label: 'Community', url: '#' }, { label: 'Changelog', url: '#' }] },
      { title: 'Company', links: [{ label: 'About', url: '#' }, { label: 'Careers', url: '#' }, { label: 'Press', url: '#' }, { label: 'Contact', url: '/pricing' }] },
    ],
    social: [{ icon: 'twitter', url: '#' }, { icon: 'linkedin', url: '#' }, { icon: 'github', url: '#' }, { icon: 'youtube', url: '#' }],
    socialLabel: 'Follow us',
    legalLinks: [{ label: 'Privacy', url: '#' }, { label: 'Terms', url: '#' }, { label: 'Cookies', url: '#' }],
    copyright: '© 2026 Junction, Inc.',
    animation: 'fade-up',
  },
  schema: schema(
    text('ctaHeading', 'CTA heading'),
    text('ctaAccent', 'CTA accent'),
    ...ctaFields,
    text('logo', 'Wordmark'),
    repeater(
      'columns',
      'Link columns',
      [text('title', 'Title'), repeater('links', 'Links', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Link' })],
      { itemLabel: 'Column' },
    ),
    text('socialLabel', 'Social label'),
    repeater('social', 'Social', [icon('icon', 'Icon'), link('url', 'URL')], { itemLabel: 'Profile' }),
    repeater('legalLinks', 'Legal links', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Link' }),
    text('copyright', 'Copyright'),
  ),
  component: function FooterJunction(props) {
    const edit = editOf(props)
    const columns = items(props.columns, [])
    const social = items(props.social, [])
    const legal = items(props.legalLinks, [])
    const anim = animationOf(props)
    return (
      <footer
        className={cx('ud-jn', 'ud-jn-footer', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-jn-footer__cta">
          <div className="ud-container">
            <h2 className="ud-jn-title ud-jn-title--center">
              <EditableText edit={edit} path={['ctaHeading']} value={str(props.ctaHeading)} as="span" placeholder="Heading" />{' '}
              <EditableText edit={edit} path={['ctaAccent']} value={str(props.ctaAccent)} as="span" className="ud-jn-mark" placeholder="accent" />
            </h2>
            <div className="ud-jn-ctaband__btns">
              <Ctas props={props} primary="orange" secondary="light" />
            </div>
          </div>
        </div>
        <div className="ud-container ud-jn-footer__body">
          <div className="ud-jn-footer__grid">
            {columns.map((column, index) => (
              <div key={index} className="ud-jn-footer__col">
                <EditableText
                  edit={edit}
                  path={['columns', index, 'title']}
                  value={str(column.title)}
                  as="p"
                  className="ud-jn-footer__col-title"
                  placeholder="Column"
                />
                {items(column.links, []).map((item, linkIndex) => (
                  <a key={linkIndex} className="ud-jn-footer__link" href={str(item.url, '#')}>
                    <EditableText
                      edit={edit}
                      path={['columns', index, 'links', linkIndex, 'label']}
                      value={str(item.label)}
                      as="span"
                      placeholder="Link"
                    />
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div className="ud-jn-footer__bar">
            <a className="ud-jn-logo" href="/">
              <span className="ud-jn-logo__mark" aria-hidden />
              <EditableText edit={edit} path={['logo']} value={str(props.logo, 'junction')} placeholder="brand" />
            </a>
            <div className="ud-jn-footer__social">
              <EditableText edit={edit} path={['socialLabel']} value={str(props.socialLabel)} as="span" placeholder="Follow us" />
              {social.map((item, index) => (
                <a key={index} className="ud-jn-social" href={str(item.url, '#')} aria-label={str(item.icon, 'link')}>
                  <Icon name={str(item.icon, 'globe')} size={15} />
                </a>
              ))}
            </div>
            <div className="ud-jn-footer__legal">
              {legal.map((item, index) => (
                <a key={index} href={str(item.url, '#')}>
                  <EditableText edit={edit} path={['legalLinks', index, 'label']} value={str(item.label)} as="span" placeholder="Legal" />
                </a>
              ))}
              <EditableText edit={edit} path={['copyright']} value={str(props.copyright)} as="span" placeholder="© 2026" />
            </div>
          </div>
        </div>
      </footer>
    )
  },
})
