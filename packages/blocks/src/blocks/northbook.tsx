/**
 * Northbook — a professional accountancy / financial-services template.
 *
 * Visual language: deep teal-navy headings closed by a green full stop, a pale
 * sage hero band, pill buttons in a single green, thin-bordered white cards with
 * small green glyphs, and a navy consultation band.
 *
 * Everything routes through `schema()`, which appends the shared design /
 * typography / background / spacing controls, so every block is editable on the
 * canvas and in the side panel and reusable on any page.
 */
import type { CSSProperties, ReactNode } from 'react'
import { useState } from 'react'
import { EditableImage, EditableText, editOf } from '../editable'
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

/** Heading closed by the signature green full stop. */
function DotHeading({
  props,
  as = 'h2',
  className,
  path = ['heading'],
}: {
  props: Props
  as?: 'h1' | 'h2' | 'h3'
  className?: string
  path?: Array<string | number>
}) {
  const edit = editOf(props)
  const key = String(path[path.length - 1])
  const value = str(props[key])
  if (!value && !edit) return null
  const Tag = as
  return (
    <Tag className={cx('ud-nb-title', as === 'h1' && 'ud-nb-title--xl', className)}>
      <EditableText edit={edit} path={path} value={value} as="span" placeholder="Heading" />
      {bool(props.showDot, true) ? <span className="ud-nb-dot">.</span> : null}
    </Tag>
  )
}

const dotField = toggle('showDot', 'Green full stop', 'design')

/** Eyebrow + dotted heading + lead paragraph. */
function Head({
  props,
  as = 'h2',
  align = 'left',
}: {
  props: Props
  as?: 'h1' | 'h2'
  align?: 'left' | 'center'
}) {
  const edit = editOf(props)
  const eyebrow = str(props.eyebrow)
  const description = str(props.description)
  if (!edit && !eyebrow && !str(props.heading) && !description) return null
  return (
    <div className={cx('ud-nb-head', align === 'center' && 'ud-nb-head--center')}>
      {eyebrow || edit ? (
        <EditableText edit={edit} path={['eyebrow']} value={eyebrow} as="p" className="ud-nb-eyebrow" placeholder="Eyebrow" />
      ) : null}
      <DotHeading props={props} as={as} />
      {description || edit ? (
        <SafeText value={description} className="ud-nb-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
      ) : null}
    </div>
  )
}

/** Green pill button. */
function NbButton({
  href,
  children,
  variant = 'green',
}: {
  href: string
  children: ReactNode
  variant?: 'green' | 'outline' | 'light'
}) {
  return (
    <a className={cx('ud-nb-btn', `ud-nb-btn--${variant}`)} href={href || '#'}>
      {children}
    </a>
  )
}

/** Brand wordmark, replaced by an uploaded logo when one is set. */
function Logo({ props, light = false }: { props: Props; light?: boolean }) {
  const edit = editOf(props)
  const src = str(props.logoImage)
  const height = Math.min(Math.max(num(props.logoHeight, 40), 14), 120)
  const widthRaw = Number(props.logoWidth)
  const width = Number.isFinite(widthRaw) && widthRaw > 0 ? Math.min(Math.max(widthRaw, 16), 400) : 'auto'
  return (
    <a className={cx('ud-nb-logo', light && 'ud-nb-logo--light')} href={str(props.logoUrl, '/')}>
      {src ? (
        <span className="ud-nb-logo__img">
          <img src={src} alt={str(props.logo, 'Logo')} style={{ height, width, display: 'block' }} />
          <EditableImage edit={edit} path={['logoImage']} current={src} label="Replace logo" />
        </span>
      ) : (
        <span className="ud-nb-logo__text">
          <EditableText edit={edit} path={['logo']} value={str(props.logo, 'northbook')} as="span" placeholder="Brand" />
          <span className="ud-nb-logo__mark" aria-hidden>
            <Icon name="sparkles" size={13} />
          </span>
          <EditableText edit={edit} path={['logoSub']} value={str(props.logoSub)} as="span" className="ud-nb-logo__sub" placeholder="accountants" />
        </span>
      )}
    </a>
  )
}

const logoFields = [
  text('logo', 'Wordmark'),
  text('logoSub', 'Wordmark second line'),
  image('logoImage', 'Logo image'),
  field('logoHeight', 'slider', 'Logo height', 'design', { min: 14, max: 120, unit: 'px' }),
  field('logoWidth', 'slider', 'Logo width', 'design', { min: 16, max: 400, unit: 'px', help: 'Leave empty to keep the logo\'s natural aspect ratio.' }),
  link('logoUrl', 'Logo link'),
]

/* ---------------------------------------------------------- topbar.northbook */

export const topbarNorthbook = defineBlock({
  type: 'topbar.northbook',
  version: 1,
  category: 'navigation',
  label: 'Northbook utility bar',
  icon: 'Menu',
  defaultProps: {
    links: [
      { label: 'Offices', url: '/about' },
      { label: 'Careers', url: '/about' },
      { label: 'FAQs', url: '/services' },
    ],
    phone: '(555) 802-1234',
    phoneUrl: 'tel:5558021234',
    emailLabel: 'Email us',
    emailUrl: 'mailto:hello@northbook.com',
    social: [
      { icon: 'facebook', url: '#' },
      { icon: 'twitter', url: '#' },
      { icon: 'instagram', url: '#' },
      { icon: 'youtube', url: '#' },
      { icon: 'linkedin', url: '#' },
    ],
    sticky: false,
    animation: 'none',
  },
  schema: schema(
    repeater('links', 'Links', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Link' }),
    text('phone', 'Phone'),
    link('phoneUrl', 'Phone link'),
    text('emailLabel', 'Email label'),
    link('emailUrl', 'Email link'),
    repeater('social', 'Social', [icon('icon', 'Icon'), link('url', 'URL')], { itemLabel: 'Profile' }),
    stickyField,
  ),
  component: function TopbarNorthbook(props) {
    const edit = editOf(props)
    const anim = animationOf(props)
    return (
      <div
        className={cx('ud-nb', 'ud-nb-topbar', bool(props.sticky) && 'ud-is-sticky', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container ud-nb-topbar__bar">
          <nav className="ud-nb-topbar__links" aria-label="Utility">
            {items(props.links, []).map((item, index) => (
              <a key={index} href={str(item.url, '#')}>
                <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} as="span" placeholder="Link" />
              </a>
            ))}
          </nav>
          <div className="ud-nb-topbar__contact">
            <a href={str(props.phoneUrl, '#')}>
              <Icon name="phone" size={13} />
              <EditableText edit={edit} path={['phone']} value={str(props.phone)} as="span" placeholder="Phone" />
            </a>
            <a href={str(props.emailUrl, '#')}>
              <Icon name="mail" size={13} />
              <EditableText edit={edit} path={['emailLabel']} value={str(props.emailLabel)} as="span" placeholder="Email us" />
            </a>
          </div>
          <div className="ud-nb-topbar__social">
            {items(props.social, []).map((item, index) => (
              <a key={index} href={str(item.url, '#')} aria-label={str(item.icon, 'social')}>
                <Icon name={str(item.icon, 'globe')} size={14} />
              </a>
            ))}
          </div>
        </div>
      </div>
    )
  },
})

/* ---------------------------------------------------------- navbar.northbook */

export const navbarNorthbook = defineBlock({
  type: 'navbar.northbook',
  version: 1,
  category: 'navigation',
  label: 'Northbook navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'northbook',
    logoSub: 'accountants',
    logoImage: '',
    logoUrl: '/',
    links: [
      { label: 'Home', url: '/' },
      {
        label: 'Services',
        url: '/services',
        children: [
          { label: 'Tax preparation', url: '/services' },
          { label: 'Bookkeeping', url: '/services' },
          { label: 'Payroll', url: '/services' },
          { label: 'Advisory', url: '/services' },
        ],
      },
      { label: 'Industries', url: '/industries' },
      { label: 'Resources', url: '/news' },
      { label: 'About us', url: '/about' },
      { label: 'News', url: '/news' },
    ],
    buttonLabel: 'Free consultation',
    buttonUrl: '/about',
    sticky: true,
    animation: 'fade-down',
    animationTrigger: 'load',
  },
  schema: schema(
    ...logoFields,
    navLinksField('links', 'Links'),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    stickyField,
  ),
  component: function NavbarNorthbook(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    const anim = animationOf(props)
    const links = items(props.links, [])
    return (
      <header
        className={cx('ud-nb', 'ud-nb-nav', bool(props.sticky, true) && 'ud-nb-nav--sticky', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container ud-nb-nav__bar">
          <Logo props={props} />
          <nav className={cx('ud-nb-nav__links', open && 'is-open')} aria-label="Primary">
            {links.map((item, index) => (
              <NavItem key={index} item={item}>
                <a className="ud-nb-nav__link" href={str(item.url, '#')}>
                  <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
                  <SubmenuCaret show={hasSubmenu(item)} />
                </a>
                <Submenu props={props} item={item} index={index} />
              </NavItem>
            ))}
          </nav>
          <div className="ud-nb-nav__end">
            {str(props.buttonLabel) || edit ? (
              <NbButton href={str(props.buttonUrl, '#')}>
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Free consultation" />
              </NbButton>
            ) : null}
            <button type="button" className="ud-nb-nav__toggle" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>
              <Icon name={open ? 'close' : 'menu'} size={20} />
            </button>
          </div>
        </div>
      </header>
    )
  },
})

/* ------------------------------------------------------------ hero.northbook */

export const heroNorthbook = defineBlock({
  type: 'hero.northbook',
  version: 1,
  category: 'hero',
  label: 'Northbook hero',
  icon: 'Sparkles',
  defaultProps: {
    bandColor: '#dfe9e9',
    eyebrow: 'Accounting',
    heading: 'Books that balance, advice that lands',
    showDot: true,
    description: 'Straight-talking accountants for owner-run businesses. We keep the filings on time and the surprises to none.',
    buttonLabel: 'Free consultation',
    buttonUrl: '/about',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1000&q=80',
    animation: 'fade-up',
    animationTrigger: 'load',
  },
  schema: schema(
    field('bandColor', 'color', 'Band colour', 'design'),
    eyebrowField,
    headingField,
    dotField,
    descriptionField,
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    image('image', 'Image'),
  ),
  component: function HeroNorthbook(props) {
    const edit = editOf(props)
    return (
      <SectionShell
        props={props}
        className="ud-nb ud-nb-hero"
        tone="default"
        style={{ '--nb-band': str(props.bandColor, '#dfe9e9') } as CSSProperties}
      >
        <div className="ud-nb-hero__grid">
          <div className="ud-nb-hero__copy">
            <Head props={props} as="h1" />
            {str(props.buttonLabel) || edit ? (
              <NbButton href={str(props.buttonUrl, '#')}>
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Free consultation" />
              </NbButton>
            ) : null}
          </div>
          <Media src={props.image} alt="" ratio="4 / 3" className="ud-nb-hero__media" edit={edit} path={['image']} />
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------- pagehero.northbook */

export const pageHeroNorthbook = defineBlock({
  type: 'pagehero.northbook',
  version: 1,
  category: 'hero',
  label: 'Northbook page hero',
  icon: 'Sparkles',
  defaultProps: {
    bandColor: '#dfe9e9',
    eyebrow: 'News',
    heading: 'Accounting and tax tips',
    showDot: true,
    description: 'Short, practical notes from the people who file the returns. No jargon, no filler.',
    align: 'center',
    animation: 'fade-up',
    animationTrigger: 'load',
  },
  schema: schema(
    field('bandColor', 'color', 'Band colour', 'design'),
    eyebrowField,
    headingField,
    dotField,
    descriptionField,
    select('align', 'Alignment', [['center', 'Centred'], ['left', 'Left']], 'layout'),
  ),
  component: function PageHeroNorthbook(props) {
    const centered = str(props.align, 'center') === 'center'
    return (
      <SectionShell
        props={props}
        className="ud-nb ud-nb-pagehero"
        tone="default"
        style={{ '--nb-band': str(props.bandColor, '#dfe9e9') } as CSSProperties}
      >
        <Head props={props} as="h1" align={centered ? 'center' : 'left'} />
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------- services.northbook */

export const servicesNorthbook = defineBlock({
  type: 'services.northbook',
  version: 1,
  category: 'services',
  label: 'Northbook service cards',
  icon: 'Layers',
  defaultProps: {
    heading: 'Solutions for every business need',
    showDot: true,
    description: '',
    columns: 3,
    items: [
      { icon: 'chart', title: 'Accounting', text: 'Monthly management accounts you can actually read, closed within five working days.' },
      { icon: 'briefcase', title: 'Tax management', text: 'Corporation tax, VAT and self assessment handled end to end, filed early rather than nearly late.' },
      { icon: 'trending-up', title: 'Financial planning', text: 'Cash-flow forecasts and scenario models that answer the question you actually asked.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    dotField,
    descriptionField,
    select('columns', 'Columns', [['2', '2'], ['3', '3'], ['4', '4']], 'layout'),
    repeater('items', 'Cards', [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Text'), link('url', 'Link')], { itemLabel: 'Card' }),
  ),
  component: function ServicesNorthbook(props) {
    const edit = editOf(props)
    const cards = items(props.items, [])
    const cols = Math.min(Math.max(num(props.columns, 3), 2), 4)
    return (
      <SectionShell props={props} className="ud-nb ud-nb-services" tone="default">
        <Head props={props} align="center" />
        <div className="ud-nb-cards" data-cols={cols}>
          {cards.map((item, index) => (
            <article key={index} className="ud-nb-card">
              <span className="ud-nb-glyph" aria-hidden>
                <Icon name={str(item.icon, 'chart')} size={20} />
              </span>
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-nb-card__title"
                placeholder="Service"
              />
              <SafeText
                value={str(item.text)}
                className="ud-nb-card__text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="Describe the service"
              />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ list.northbook */

export const listNorthbook = defineBlock({
  type: 'list.northbook',
  version: 1,
  category: 'features',
  label: 'Northbook icon list',
  icon: 'Layers',
  defaultProps: {
    heading: 'We bring you the best possible solutions for your company',
    showDot: true,
    description: '',
    columns: 2,
    items: [
      { icon: 'chart', title: 'Income tax preparation', text: 'Returns prepared, reviewed and filed with every allowance you are entitled to and none you are not.' },
      { icon: 'target', title: 'Income tax planning', text: 'We look at next year before it happens, so the bill is a decision rather than a shock.' },
      { icon: 'users', title: 'Business start-up consulting', text: 'Structure, registrations and the first set of books, set up so they still work at year three.' },
      { icon: 'layers', title: 'General ledger review', text: 'A second pair of eyes over the ledger before it becomes an auditor problem.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    dotField,
    descriptionField,
    select('columns', 'Columns', [['1', '1'], ['2', '2']], 'layout'),
    repeater('items', 'Items', [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Item' }),
  ),
  component: function ListNorthbook(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const cols = Math.min(Math.max(num(props.columns, 2), 1), 2)
    return (
      <SectionShell props={props} className="ud-nb ud-nb-list" tone="surface">
        <Head props={props} align="center" />
        <div className="ud-nb-list__grid" data-cols={cols}>
          {rows.map((item, index) => (
            <div key={index} className="ud-nb-listitem">
              <span className="ud-nb-glyph" aria-hidden>
                <Icon name={str(item.icon, 'check')} size={18} />
              </span>
              <div>
                <EditableText
                  edit={edit}
                  path={['items', index, 'title']}
                  value={str(item.title)}
                  as="h3"
                  className="ud-nb-listitem__title"
                  placeholder="Title"
                />
                <SafeText
                  value={str(item.text)}
                  className="ud-nb-listitem__text"
                  edit={edit}
                  path={['items', index, 'text']}
                  placeholder="Describe it"
                />
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- split.northbook */

export const splitNorthbook = defineBlock({
  type: 'split.northbook',
  version: 1,
  category: 'content',
  label: 'Northbook image + copy',
  icon: 'Layers',
  defaultProps: {
    eyebrow: 'Industries',
    heading: 'We enjoy working with a wide variety of service businesses',
    showDot: true,
    description: 'Trades, clinics, studios and shops. Different rhythms, same need for numbers that arrive before the decision does.',
    bullets: 'Financial assessment reports\nIncome tax planning and consulting\nPayroll and sales taxes',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80',
    reverse: false,
    buttonLabel: '',
    buttonUrl: '',
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    dotField,
    descriptionField,
    textarea('bullets', 'Pill list', { help: 'One per line. Leave blank to hide.' }),
    image('image', 'Image'),
    toggle('reverse', 'Image on the right', 'layout'),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
  ),
  component: function SplitNorthbook(props) {
    const edit = editOf(props)
    const bullets = lines(props.bullets, [])
    return (
      <SectionShell
        props={props}
        className={cx('ud-nb', 'ud-nb-split', bool(props.reverse) && 'ud-nb-split--reverse')}
        tone="default"
      >
        <div className="ud-nb-split__grid">
          <Media src={props.image} alt="" ratio="4 / 3" className="ud-nb-split__media" edit={edit} path={['image']} />
          <div className="ud-nb-split__copy">
            <Head props={props} />
            {bullets.length || edit ? (
              <ul className="ud-nb-pills">
                {bullets.map((value, index) => (
                  <li key={index}>
                    <Icon name="check-circle" size={15} />
                    <EditableText
                      edit={edit}
                      path={['bullets']}
                      value={value}
                      as="span"
                      placeholder="Point"
                      transform={(next) => bullets.map((line, position) => (position === index ? next : line)).join('\n')}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
            {str(props.buttonLabel) || edit ? (
              <NbButton href={str(props.buttonUrl, '#')}>
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
              </NbButton>
            ) : null}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- stats.northbook */

export const statsNorthbook = defineBlock({
  type: 'stats.northbook',
  version: 1,
  category: 'features',
  label: 'Northbook stat boxes',
  icon: 'Chart',
  defaultProps: {
    items: [
      { label: 'Years of experience', value: '30' },
      { label: 'Clients served', value: '160K' },
      { label: 'Countries covered', value: '89' },
    ],
    animation: 'fade-up',
  },
  schema: schema(repeater('items', 'Stats', [text('label', 'Label'), text('value', 'Value')], { itemLabel: 'Stat' })),
  component: function StatsNorthbook(props) {
    const edit = editOf(props)
    const cols = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-nb ud-nb-stats" tone="default">
        <div className="ud-nb-stats__grid">
          {cols.map((item, index) => (
            <div key={index} className="ud-nb-stat">
              <EditableText
                edit={edit}
                path={['items', index, 'label']}
                value={str(item.label)}
                as="p"
                className="ud-nb-stat__label"
                placeholder="Label"
              />
              <EditableText
                edit={edit}
                path={['items', index, 'value']}
                value={str(item.value)}
                as="p"
                className="ud-nb-stat__value"
                placeholder="30"
              />
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- logos.northbook */

export const logosNorthbook = defineBlock({
  type: 'logos.northbook',
  version: 1,
  category: 'gallery',
  label: 'Northbook logo strip',
  icon: 'Globe',
  defaultProps: {
    heading: 'Trusted by the world’s fastest-growing companies',
    items: [{ label: 'abstract' }, { label: 'CGLOBAL' }, { label: 'digitalbox' }, { label: 'HEMISFERIO' }, { label: 'next' }, { label: '[spaces]' }],
    animation: 'fade-up',
  },
  schema: schema(headingField, repeater('items', 'Logos', [text('label', 'Label'), image('image', 'Logo image')], { itemLabel: 'Logo' })),
  component: function LogosNorthbook(props) {
    const edit = editOf(props)
    const logos = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-nb ud-nb-logos" tone="default">
        <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="p" className="ud-nb-logos__title" placeholder="Trusted by" />
        <div className="ud-nb-logos__row">
          {logos.map((item, index) =>
            str(item.image) ? (
              <img key={index} src={str(item.image)} alt={str(item.label)} loading="lazy" />
            ) : (
              <EditableText
                key={index}
                edit={edit}
                path={['items', index, 'label']}
                value={str(item.label)}
                as="span"
                className="ud-nb-logoword"
                placeholder="Logo"
              />
            ),
          )}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------- resources.northbook */

export const resourcesNorthbook = defineBlock({
  type: 'resources.northbook',
  version: 1,
  category: 'features',
  label: 'Northbook navy resources',
  icon: 'Layers',
  defaultProps: {
    heading: 'Exceptional accountancy resources',
    showDot: true,
    description: 'Spreadsheets, calculators and checklists we actually use with clients. Free, no email wall.',
    items: [
      { icon: 'chart', title: 'Savings tracker', text: 'A single sheet that shows what a change to drawings does to your tax bill.' },
      { icon: 'briefcase', title: 'Tax calculator', text: 'Rough numbers in ninety seconds, before you book a call with anyone.' },
      { icon: 'book', title: 'Chequebook balancer', text: 'For the businesses still reconciling by hand, and there are more than you think.' },
      { icon: 'target', title: 'VAT calculator', text: 'Flat rate against standard, side by side, with the switch-over point marked.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    dotField,
    descriptionField,
    repeater('items', 'Resources', [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Text'), link('url', 'Link')], { itemLabel: 'Resource' }),
  ),
  component: function ResourcesNorthbook(props) {
    const edit = editOf(props)
    const cards = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-nb ud-nb-navy ud-nb-resources" tone="dark">
        <div className="ud-nb-resources__grid">
          <div className="ud-nb-resources__copy">
            <DotHeading props={props} />
            <SafeText value={str(props.description)} className="ud-nb-lead" edit={edit} path={['description']} placeholder="Copy" />
          </div>
          <div className="ud-nb-resources__items">
            {cards.map((item, index) => (
              <div key={index} className="ud-nb-resource">
                <span className="ud-nb-glyph ud-nb-glyph--dark" aria-hidden>
                  <Icon name={str(item.icon, 'chart')} size={16} />
                </span>
                <EditableText
                  edit={edit}
                  path={['items', index, 'title']}
                  value={str(item.title)}
                  as="h3"
                  className="ud-nb-resource__title"
                  placeholder="Resource"
                />
                <SafeText
                  value={str(item.text)}
                  className="ud-nb-resource__text"
                  edit={edit}
                  path={['items', index, 'text']}
                  placeholder="Describe it"
                />
              </div>
            ))}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------- testimonials.northbook */

export const testimonialsNorthbook = defineBlock({
  type: 'testimonials.northbook',
  version: 1,
  category: 'testimonials',
  label: 'Northbook testimonials',
  icon: 'Quote',
  defaultProps: {
    heading: '',
    showDot: true,
    items: [
      {
        logo: 'abstract',
        title: 'Northbook has been a lifesaver for my growing business',
        quote: 'We went from a shoebox of receipts to management accounts by the fifth of the month. I stopped dreading January.',
        author: 'Rachel Simms',
        role: 'Founder, Abstract',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      },
      {
        logo: 'HEMISFERIO',
        title: 'Northbook was the missing piece of the puzzle',
        quote: 'They found a structure that saved more in year one than the fees cost. Then they explained it in plain English.',
        author: 'Katie Schaefer',
        role: 'Director, Hemisferio',
        image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    dotField,
    repeater(
      'items',
      'Testimonials',
      [image('image', 'Photo'), text('logo', 'Company wordmark'), text('title', 'Headline'), textarea('quote', 'Quote'), text('author', 'Name'), text('role', 'Role')],
      { itemLabel: 'Testimonial' },
    ),
  ),
  component: function TestimonialsNorthbook(props) {
    const edit = editOf(props)
    const cards = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-nb ud-nb-quotes" tone="default">
        {str(props.heading) || edit ? <DotHeading props={props} className="ud-nb-title--center" /> : null}
        <div className="ud-nb-quotes__grid">
          {cards.map((item, index) => (
            <figure key={index} className="ud-nb-quote">
              <Media src={item.image} alt="" ratio="4 / 3" className="ud-nb-quote__media" edit={edit} path={['items', index, 'image']} />
              <EditableText
                edit={edit}
                path={['items', index, 'logo']}
                value={str(item.logo)}
                as="span"
                className="ud-nb-quote__logo"
                placeholder="Company"
              />
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-nb-quote__title"
                placeholder="Headline"
              />
              <SafeText
                value={str(item.quote)}
                className="ud-nb-quote__text"
                edit={edit}
                path={['items', index, 'quote']}
                placeholder="Quote"
              />
              <figcaption>
                <EditableText edit={edit} path={['items', index, 'author']} value={str(item.author)} as="strong" placeholder="Name" />
                <EditableText edit={edit} path={['items', index, 'role']} value={str(item.role)} as="span" placeholder="Role" />
              </figcaption>
            </figure>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- personas.northbook */

export const personasNorthbook = defineBlock({
  type: 'personas.northbook',
  version: 1,
  category: 'testimonials',
  label: 'Northbook persona cards',
  icon: 'Users',
  defaultProps: {
    heading: 'No matter who you are, we’ve got what you need',
    showDot: true,
    items: [
      { title: 'Private clients', quote: 'They took a decade of half-finished paperwork and turned it into one tidy return.', author: 'Gina Mellow', role: 'Hemisferio', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80' },
      { title: 'Entrepreneurs', quote: 'I get a call before the deadline, not an invoice after it. That is the whole difference.', author: 'Dan Billson', role: 'Abstract', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80' },
      { title: 'Professional firms', quote: 'Our partners stopped arguing about numbers because everyone finally trusts the same set.', author: 'Rachel Park', role: 'Spaces', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    dotField,
    repeater('items', 'Cards', [text('title', 'Title'), textarea('quote', 'Quote'), text('author', 'Name'), text('role', 'Company'), image('image', 'Portrait')], { itemLabel: 'Card' }),
  ),
  component: function PersonasNorthbook(props) {
    const edit = editOf(props)
    const cards = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-nb ud-nb-personas" tone="surface">
        <DotHeading props={props} className="ud-nb-title--center" />
        <div className="ud-nb-cards" data-cols={3}>
          {cards.map((item, index) => (
            <article key={index} className="ud-nb-persona">
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-nb-persona__title"
                placeholder="Persona"
              />
              <span className="ud-nb-persona__avatar">
                <Media src={item.image} alt="" ratio="1 / 1" edit={edit} path={['items', index, 'image']} />
              </span>
              <SafeText value={str(item.quote)} className="ud-nb-persona__quote" edit={edit} path={['items', index, 'quote']} placeholder="Quote" />
              <p className="ud-nb-persona__by">
                <EditableText edit={edit} path={['items', index, 'author']} value={str(item.author)} as="strong" placeholder="Name" />
                <EditableText edit={edit} path={['items', index, 'role']} value={str(item.role)} as="span" placeholder="Company" />
              </p>
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- inline.northbook */

export const inlineCtaNorthbook = defineBlock({
  type: 'inlinecta.northbook',
  version: 1,
  category: 'cta',
  label: 'Northbook inline CTA',
  icon: 'Rocket',
  defaultProps: {
    heading: 'Need a personalised solution',
    showDot: false,
    suffix: '?',
    description: 'Tell us what the business does and where it hurts. We will tell you whether we can help, honestly.',
    buttonLabel: 'How we can help',
    buttonUrl: '/about',
    animation: 'fade-up',
  },
  schema: schema(headingField, dotField, text('suffix', 'Heading suffix'), descriptionField, text('buttonLabel', 'Button label'), link('buttonUrl', 'Button link')),
  component: function InlineCtaNorthbook(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-nb ud-nb-inline" tone="default">
        <h2 className="ud-nb-title ud-nb-title--center">
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="span" placeholder="Heading" />
          <span className="ud-nb-dot">
            <EditableText edit={edit} path={['suffix']} value={str(props.suffix, '?')} as="span" placeholder="?" />
          </span>
        </h2>
        <SafeText value={str(props.description)} className="ud-nb-lead ud-nb-lead--center" edit={edit} path={['description']} placeholder="Copy" />
        {str(props.buttonLabel) || edit ? (
          <div className="ud-nb-inline__foot">
            <NbButton href={str(props.buttonUrl, '#')}>
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="How we can help" />
            </NbButton>
          </div>
        ) : null}
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- compare.northbook */

export const compareNorthbook = defineBlock({
  type: 'compare.northbook',
  version: 1,
  category: 'features',
  label: 'Northbook comparison',
  icon: 'Layers',
  defaultProps: {
    heading: 'Great benefits from Northbook',
    showDot: true,
    description: 'The same work, done by people who answer the phone. Here is what changes when you move.',
    ourLabel: 'northbook',
    theirLabel: 'Other accountancy firms',
    ours: 'A named accountant, not a ticket queue\nManagement accounts by the fifth working day\nFixed monthly fee agreed up front\nTax planning before year end, not after\nPlain-English explanations as standard\nSoftware set up and paid for by us\nUnlimited questions, no clock running',
    theirs: 'Whoever picks up the phone that day\nAccounts arriving four months late\nHourly billing with surprise line items\nA return filed, and no advice attached\nJargon you have to translate yourself\nAn extra licence fee on top\nEvery call logged and charged',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    dotField,
    descriptionField,
    text('ourLabel', 'Our column label'),
    text('theirLabel', 'Their column label'),
    textarea('ours', 'Our points', { help: 'One per line.' }),
    textarea('theirs', 'Their points', { help: 'One per line.' }),
  ),
  component: function CompareNorthbook(props) {
    const edit = editOf(props)
    const ours = lines(props.ours, [])
    const theirs = lines(props.theirs, [])
    return (
      <SectionShell props={props} className="ud-nb ud-nb-compare" tone="surface">
        <Head props={props} align="center" />
        <div className="ud-nb-compare__panel">
          <div className="ud-nb-compare__col">
            <EditableText edit={edit} path={['ourLabel']} value={str(props.ourLabel)} as="p" className="ud-nb-compare__label" placeholder="Us" />
            <ul>
              {ours.map((value, index) => (
                <li key={index}>
                  <Icon name="check-circle" size={15} />
                  <EditableText
                    edit={edit}
                    path={['ours']}
                    value={value}
                    as="span"
                    placeholder="Point"
                    transform={(next) => ours.map((line, position) => (position === index ? next : line)).join('\n')}
                  />
                </li>
              ))}
            </ul>
          </div>
          <div className="ud-nb-compare__col ud-nb-compare__col--muted">
            <EditableText edit={edit} path={['theirLabel']} value={str(props.theirLabel)} as="p" className="ud-nb-compare__label" placeholder="Them" />
            <ul>
              {theirs.map((value, index) => (
                <li key={index}>
                  <Icon name="close" size={15} />
                  <EditableText
                    edit={edit}
                    path={['theirs']}
                    value={value}
                    as="span"
                    placeholder="Point"
                    transform={(next) => theirs.map((line, position) => (position === index ? next : line)).join('\n')}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- contact.northbook */

export const contactNorthbook = defineBlock({
  type: 'contact.northbook',
  version: 1,
  category: 'form',
  label: 'Northbook consultation form',
  icon: 'Mail',
  defaultProps: {
    heading: 'Get a personal consultation',
    showDot: true,
    officeLabel: 'Office',
    office: 'Northbook 1234 Harbour Avenue,\nBristol, BS1 4TR',
    contactLabel: 'Contact',
    contact: 'hello@northbook.com\nsupport@northbook.com',
    hoursLabel: 'Open hours',
    hours: 'Monday to Saturday: 8am — 6pm\nSunday: 11am — 4pm',
    formId: '',
    buttonLabel: 'Request a quote',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    dotField,
    text('officeLabel', 'Office label'),
    textarea('office', 'Office address'),
    text('contactLabel', 'Contact label'),
    textarea('contact', 'Contact details'),
    text('hoursLabel', 'Hours label'),
    textarea('hours', 'Opening hours'),
    field('formId', 'text', 'Connected form', 'content'),
    text('buttonLabel', 'Submit label'),
  ),
  component: function ContactNorthbook(props) {
    const edit = editOf(props)
    const rows: Array<[string, string, string]> = [
      ['map-pin', 'officeLabel', 'office'],
      ['mail', 'contactLabel', 'contact'],
      ['clock', 'hoursLabel', 'hours'],
    ]
    return (
      <SectionShell props={props} className="ud-nb ud-nb-consult" tone="default" anchorId="contact">
        <div className="ud-nb-consult__panel">
          <div className="ud-nb-consult__copy">
            <DotHeading props={props} className="ud-nb-title--light" />
            <ul className="ud-nb-consult__details">
              {rows.map(([iconName, labelKey, valueKey]) => (
                <li key={labelKey}>
                  <span className="ud-nb-consult__icon" aria-hidden>
                    <Icon name={iconName} size={14} />
                  </span>
                  <div>
                    <EditableText
                      edit={edit}
                      path={[labelKey]}
                      value={str(props[labelKey])}
                      as="p"
                      className="ud-nb-consult__label"
                      placeholder="Label"
                    />
                    <SafeText
                      value={str(props[valueKey])}
                      className="ud-nb-consult__text"
                      edit={edit}
                      path={[valueKey]}
                      placeholder="Details"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="ud-nb-consult__form">
            <PublicForm
              formId={str(props.formId) || undefined}
              submitLabel={str(props.buttonLabel, 'Request a quote')}
              fields={[
                { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'John Stuart' },
                { name: 'phone', label: 'Phone', type: 'text', required: true, placeholder: '(123) 456-7890' },
                { name: 'email', label: 'Email address', type: 'email', required: true, placeholder: 'name@company.com' },
                { name: 'service', label: 'Service interested in', type: 'select', options: ['Accounting', 'Tax management', 'Payroll', 'Advisory'] },
                { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Personal tax planning' },
                { name: 'message', label: 'How can we help?', type: 'textarea', required: true, placeholder: 'I need help with…' },
              ]}
            />
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- ctaband.northbook */

export const ctaBandNorthbook = defineBlock({
  type: 'ctaband.northbook',
  version: 1,
  category: 'cta',
  label: 'Northbook navy CTA band',
  icon: 'Rocket',
  defaultProps: {
    heading: 'Get a personal consultation',
    showDot: true,
    description: 'We will take care of your accounting and administrative services.',
    buttonLabel: 'Free consultation',
    buttonUrl: '/about',
    phone: '(555) 802-1234',
    phoneUrl: 'tel:5558021234',
    animation: 'fade-up',
  },
  schema: schema(headingField, dotField, descriptionField, text('buttonLabel', 'Button label'), link('buttonUrl', 'Button link'), text('phone', 'Phone'), link('phoneUrl', 'Phone link')),
  component: function CtaBandNorthbook(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-nb ud-nb-ctaband" tone="default">
        <div className="ud-nb-ctaband__panel">
          <div>
            <DotHeading props={props} className="ud-nb-title--light" />
            <SafeText value={str(props.description)} className="ud-nb-ctaband__text" edit={edit} path={['description']} placeholder="Copy" />
          </div>
          <div className="ud-nb-ctaband__end">
            {str(props.buttonLabel) || edit ? (
              <NbButton href={str(props.buttonUrl, '#')}>
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Free consultation" />
              </NbButton>
            ) : null}
            {str(props.phone) || edit ? (
              <a className="ud-nb-ctaband__phone" href={str(props.phoneUrl, '#')}>
                <Icon name="phone" size={14} />
                <EditableText edit={edit} path={['phone']} value={str(props.phone)} as="span" placeholder="Phone" />
              </a>
            ) : null}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ posts.northbook */

export const postsNorthbook = defineBlock({
  type: 'posts.northbook',
  version: 1,
  category: 'blog',
  label: 'Northbook article grid',
  icon: 'Book',
  defaultProps: {
    heading: '',
    showDot: true,
    columns: 2,
    items: [
      { title: 'How to run payroll and avoid the usual mistakes', date: 'September 1, 2026', tags: 'Accounting, Tools', read: '2 min', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80', url: '#' },
      { title: 'A bookkeeping template that survives contact with reality', date: 'September 1, 2026', tags: 'Tools, Trends', read: '2 min', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80', url: '#' },
      { title: 'Business accounting: a guide for first-time owners', date: 'August 18, 2026', tags: 'Accounting, Trends', read: '4 min', image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80', url: '#' },
      { title: 'How to defer a tax payment without getting into trouble', date: 'August 4, 2026', tags: 'Accounting, Taxes', read: '3 min', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80', url: '#' },
      { title: 'What to prepare if you are selling your business', date: 'July 22, 2026', tags: 'Resources, Taxes', read: '5 min', image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80', url: '#' },
      { title: 'Introducing the principles of financial accounting', date: 'July 9, 2026', tags: 'Accounting, Resources', read: '6 min', image: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?auto=format&fit=crop&w=800&q=80', url: '#' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    dotField,
    select('columns', 'Columns', [['2', '2'], ['3', '3']], 'layout'),
    repeater('items', 'Articles', [text('title', 'Title'), text('date', 'Date'), text('tags', 'Categories'), text('read', 'Read time'), image('image', 'Image'), link('url', 'Link')], { itemLabel: 'Article' }),
  ),
  component: function PostsNorthbook(props) {
    const edit = editOf(props)
    const cards = items(props.items, [])
    const cols = Math.min(Math.max(num(props.columns, 2), 2), 3)
    return (
      <SectionShell props={props} className="ud-nb ud-nb-posts" tone="default">
        {str(props.heading) || edit ? <DotHeading props={props} className="ud-nb-title--center" /> : null}
        <div className="ud-nb-posts__grid" data-cols={cols}>
          {cards.map((item, index) => (
            <a key={index} className="ud-nb-post" href={str(item.url, '#')}>
              <Media src={item.image} alt="" ratio="16 / 10" className="ud-nb-post__media" zoom edit={edit} path={['items', index, 'image']} />
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-nb-post__title"
                placeholder="Article title"
              />
              <span className="ud-nb-post__meta">
                <EditableText edit={edit} path={['items', index, 'date']} value={str(item.date)} as="span" placeholder="Date" />
                <EditableText edit={edit} path={['items', index, 'tags']} value={str(item.tags)} as="span" placeholder="Categories" />
                <EditableText edit={edit} path={['items', index, 'read']} value={str(item.read)} as="span" placeholder="2 min" />
              </span>
            </a>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------- newsletter.northbook */

export const newsletterNorthbook = defineBlock({
  type: 'newsletter.northbook',
  version: 1,
  category: 'form',
  label: 'Northbook newsletter',
  icon: 'Mail',
  defaultProps: {
    heading: 'Join the newsletter',
    showDot: true,
    description: 'One short email a month. Deadlines, changes and the odd thing worth knowing.',
    placeholder: 'Enter your email',
    buttonLabel: 'Subscribe',
    formId: '',
    animation: 'fade-up',
  },
  schema: schema(headingField, dotField, descriptionField, text('placeholder', 'Field placeholder'), text('buttonLabel', 'Button label'), field('formId', 'text', 'Connected form', 'content')),
  component: function NewsletterNorthbook(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-nb ud-nb-news" tone="default">
        <div className="ud-nb-news__panel">
          <div>
            <DotHeading props={props} as="h3" />
            <SafeText value={str(props.description)} className="ud-nb-news__text" edit={edit} path={['description']} placeholder="Copy" />
          </div>
          <div className="ud-nb-news__form">
            <PublicForm
              formId={str(props.formId) || undefined}
              layout="inline"
              submitLabel={str(props.buttonLabel, 'Subscribe')}
              fields={[{ name: 'email', label: 'Email', type: 'email', required: true, hideLabel: true, placeholder: str(props.placeholder, 'Enter your email') }]}
            />
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- team.northbook */

export const teamNorthbook = defineBlock({
  type: 'team.northbook',
  version: 1,
  category: 'team',
  label: 'Northbook team grid',
  icon: 'Users',
  defaultProps: {
    heading: 'Meet the team',
    showDot: true,
    columns: 3,
    items: [
      { name: 'Richard Park', role: 'Director', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80' },
      { name: 'Jennifer Voss', role: 'Office manager', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80' },
      { name: 'Adam Neville', role: 'Partner', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80' },
      { name: 'Pamela Hickson', role: 'Advisory', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80' },
      { name: 'Steve Beadle', role: 'Tax and business', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80' },
      { name: 'Patricia Worley', role: 'Legal and services', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80' },
    ],
    social: [{ icon: 'twitter' }, { icon: 'facebook' }, { icon: 'linkedin' }, { icon: 'mail' }],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    dotField,
    select('columns', 'Columns', [['2', '2'], ['3', '3'], ['4', '4']], 'layout'),
    repeater('items', 'People', [text('name', 'Name'), text('role', 'Role'), image('image', 'Photo')], { itemLabel: 'Person' }),
    repeater('social', 'Social icons', [icon('icon', 'Icon')], { itemLabel: 'Icon' }),
  ),
  component: function TeamNorthbook(props) {
    const edit = editOf(props)
    const people = items(props.items, [])
    const social = items(props.social, [])
    const cols = Math.min(Math.max(num(props.columns, 3), 2), 4)
    return (
      <SectionShell props={props} className="ud-nb ud-nb-team" tone="default">
        <DotHeading props={props} className="ud-nb-title--center" />
        <div className="ud-nb-team__grid" data-cols={cols}>
          {people.map((item, index) => (
            <div key={index} className="ud-nb-member">
              <Media src={item.image} alt="" ratio="1 / 1" className="ud-nb-member__media" edit={edit} path={['items', index, 'image']} />
              <EditableText
                edit={edit}
                path={['items', index, 'name']}
                value={str(item.name)}
                as="h3"
                className="ud-nb-member__name"
                placeholder="Name"
              />
              <EditableText
                edit={edit}
                path={['items', index, 'role']}
                value={str(item.role)}
                as="p"
                className="ud-nb-member__role"
                placeholder="Role"
              />
              <span className="ud-nb-member__social">
                {social.map((s, si) => (
                  <Icon key={si} name={str(s.icon, 'globe')} size={13} />
                ))}
              </span>
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- values.northbook */

export const valuesNorthbook = defineBlock({
  type: 'values.northbook',
  version: 1,
  category: 'features',
  label: 'Northbook values',
  icon: 'Heart',
  defaultProps: {
    heading: 'Our values',
    showDot: true,
    description: 'Four things we will not trade away, even when it costs us the work.',
    items: [
      { icon: 'users', title: 'Client first', text: 'Your deadline beats our convenience.' },
      { icon: 'heart', title: 'Passion', text: 'We like this work. It shows in the detail.' },
      { icon: 'shield', title: 'Integrity', text: 'We will tell you when the answer is no.' },
      { icon: 'check-circle', title: 'Excellence', text: 'Checked twice, by two people, every time.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(headingField, dotField, descriptionField, repeater('items', 'Values', [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Value' })),
  component: function ValuesNorthbook(props) {
    const edit = editOf(props)
    const cards = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-nb ud-nb-values" tone="surface">
        <div className="ud-nb-values__grid">
          <div className="ud-nb-values__copy">
            <DotHeading props={props} />
            <SafeText value={str(props.description)} className="ud-nb-lead" edit={edit} path={['description']} placeholder="Copy" />
          </div>
          <div className="ud-nb-values__cards">
            {cards.map((item, index) => (
              <div key={index} className="ud-nb-value">
                <span className="ud-nb-glyph" aria-hidden>
                  <Icon name={str(item.icon, 'heart')} size={18} />
                </span>
                <EditableText
                  edit={edit}
                  path={['items', index, 'title']}
                  value={str(item.title)}
                  as="h3"
                  className="ud-nb-value__title"
                  placeholder="Value"
                />
                <SafeText value={str(item.text)} className="ud-nb-value__text" edit={edit} path={['items', index, 'text']} placeholder="Copy" />
              </div>
            ))}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- offices.northbook */

export const officesNorthbook = defineBlock({
  type: 'offices.northbook',
  version: 1,
  category: 'content',
  label: 'Northbook offices',
  icon: 'Map-pin',
  defaultProps: {
    heading: 'Our offices',
    showDot: true,
    items: [
      { city: 'Bristol, UK', address: '1234 Harbour Avenue,\nBristol, BS1 4TR', linkLabel: 'Contact us', url: '#', image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=700&q=80' },
      { city: 'Leeds, UK', address: '18 Wellington Place,\nLeeds, LS1 4AP', linkLabel: 'Contact us', url: '#', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=700&q=80' },
      { city: 'Glasgow, UK', address: '40 St Vincent Street,\nGlasgow, G2 5TS', linkLabel: 'Contact us', url: '#', image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=700&q=80' },
    ],
    buttonLabel: 'View all offices',
    buttonUrl: '#',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    dotField,
    repeater('items', 'Offices', [text('city', 'City'), textarea('address', 'Address'), text('linkLabel', 'Link label'), link('url', 'Link'), image('image', 'Map image')], { itemLabel: 'Office' }),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
  ),
  component: function OfficesNorthbook(props) {
    const edit = editOf(props)
    const cards = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-nb ud-nb-offices" tone="default">
        <DotHeading props={props} className="ud-nb-title--center" />
        <div className="ud-nb-cards" data-cols={3}>
          {cards.map((item, index) => (
            <article key={index} className="ud-nb-office">
              <Media src={item.image} alt="" ratio="4 / 3" className="ud-nb-office__map" edit={edit} path={['items', index, 'image']} />
              <EditableText
                edit={edit}
                path={['items', index, 'city']}
                value={str(item.city)}
                as="h3"
                className="ud-nb-office__city"
                placeholder="City"
              />
              <SafeText value={str(item.address)} className="ud-nb-office__address" edit={edit} path={['items', index, 'address']} placeholder="Address" />
              <a className="ud-nb-link" href={str(item.url, '#')}>
                <EditableText edit={edit} path={['items', index, 'linkLabel']} value={str(item.linkLabel)} as="span" placeholder="Contact us" />
              </a>
            </article>
          ))}
        </div>
        {str(props.buttonLabel) || edit ? (
          <div className="ud-nb-inline__foot">
            <NbButton href={str(props.buttonUrl, '#')} variant="outline">
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="View all offices" />
            </NbButton>
          </div>
        ) : null}
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- gallery.northbook */

export const galleryNorthbook = defineBlock({
  type: 'gallery.northbook',
  version: 1,
  category: 'gallery',
  label: 'Northbook image band',
  icon: 'Camera',
  defaultProps: {
    bandColor: '#dfe9e9',
    caption: 'The Bristol office, mid deadline week.',
    items: [
      { image: 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?auto=format&fit=crop&w=600&q=80' },
      { image: 'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=1200&q=80' },
      { image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80' },
    ],
    animation: 'fade-up',
  },
  schema: schema(field('bandColor', 'color', 'Band colour', 'design'), text('caption', 'Caption'), repeater('items', 'Images', [image('image', 'Image')], { itemLabel: 'Image' })),
  component: function GalleryNorthbook(props) {
    const edit = editOf(props)
    const shots = items(props.items, [])
    return (
      <SectionShell
        props={props}
        className="ud-nb ud-nb-band"
        tone="default"
        style={{ '--nb-band': str(props.bandColor, '#dfe9e9') } as CSSProperties}
      >
        <div className="ud-nb-band__grid">
          {shots.map((item, index) => (
            <Media key={index} src={item.image} alt="" ratio={index === 1 ? '16 / 10' : '3 / 4'} edit={edit} path={['items', index, 'image']} />
          ))}
        </div>
        <EditableText edit={edit} path={['caption']} value={str(props.caption)} as="p" className="ud-nb-band__caption" placeholder="Caption" />
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- richtext.northbook */

export const richTextNorthbook = defineBlock({
  type: 'richtext.northbook',
  version: 1,
  category: 'content',
  label: 'Northbook long copy',
  icon: 'Book',
  defaultProps: {
    heading: 'Overview',
    showDot: true,
    body: 'Northbook started in 1996 with two accountants, one filing cabinet and a conviction that most people are not bad with money, they are just badly served.\n\nThirty years on the cabinet is gone and the conviction is not. We look after around sixteen hundred owner-run businesses across the UK, from single-van trades to firms with a finance director who simply wants a second opinion.\n\nWe are deliberately not the cheapest. We are the ones who ring you in November about a decision that is due in April.',
    animation: 'fade-up',
  },
  schema: schema(headingField, dotField, textarea('body', 'Body copy', { help: 'Blank line starts a new paragraph.' })),
  component: function RichTextNorthbook(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-nb ud-nb-rich" tone="default">
        <DotHeading props={props} />
        <SafeText value={str(props.body)} className="ud-nb-rich__body" edit={edit} path={['body']} placeholder="Body copy" />
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- footer.northbook */

export const footerNorthbook = defineBlock({
  type: 'footer.northbook',
  version: 1,
  category: 'footer',
  label: 'Northbook footer',
  icon: 'Layers',
  defaultProps: {
    logo: 'northbook',
    logoSub: 'accountants',
    logoImage: '',
    logoUrl: '/',
    description: 'Straight-talking accountants for owner-run businesses across the UK. Filings on time, advice in plain English.',
    columns: [
      { title: 'Overview', links: [{ label: 'Services', url: '/services' }, { label: 'Industries', url: '/industries' }, { label: 'Who we are', url: '/about' }, { label: 'Resources', url: '/news' }, { label: 'News', url: '/news' }] },
      { title: '', links: [{ label: 'Offices', url: '/about' }, { label: 'Careers', url: '/about' }, { label: 'FAQs', url: '/services' }] },
    ],
    infoTitle: 'Business info',
    address: 'Northbook 1234 Harbour Avenue,\nBristol, BS1 4TR',
    phone: '(555) 802-1234',
    phoneUrl: 'tel:5558021234',
    email: 'hello@northbook.com',
    emailUrl: 'mailto:hello@northbook.com',
    social: [{ icon: 'facebook', url: '#' }, { icon: 'twitter', url: '#' }, { icon: 'instagram', url: '#' }, { icon: 'youtube', url: '#' }, { icon: 'linkedin', url: '#' }],
    copyright: '© 2026 Northbook',
    topLabel: 'Back to top',
    animation: 'fade-up',
  },
  schema: schema(
    ...logoFields,
    descriptionField,
    repeater('columns', 'Link columns', [text('title', 'Title'), repeater('links', 'Links', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Link' })], { itemLabel: 'Column' }),
    text('infoTitle', 'Info column title'),
    textarea('address', 'Address'),
    text('phone', 'Phone'),
    link('phoneUrl', 'Phone link'),
    text('email', 'Email'),
    link('emailUrl', 'Email link'),
    repeater('social', 'Social', [icon('icon', 'Icon'), link('url', 'URL')], { itemLabel: 'Profile' }),
    text('copyright', 'Copyright'),
    text('topLabel', 'Back to top label'),
  ),
  component: function FooterNorthbook(props) {
    const edit = editOf(props)
    const columns = items(props.columns, [])
    const social = items(props.social, [])
    const anim = animationOf(props)
    return (
      <footer
        className={cx('ud-nb', 'ud-nb-footer', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container">
          <div className="ud-nb-footer__grid">
            <div className="ud-nb-footer__brand">
              <Logo props={props} />
              <SafeText value={str(props.description)} className="ud-nb-footer__text" edit={edit} path={['description']} placeholder="Copy" />
            </div>
            {columns.map((column, index) => (
              <div key={index} className="ud-nb-footer__col">
                {str(column.title) || edit ? (
                  <EditableText
                    edit={edit}
                    path={['columns', index, 'title']}
                    value={str(column.title)}
                    as="p"
                    className="ud-nb-footer__col-title"
                    placeholder="Column"
                  />
                ) : null}
                {items(column.links, []).map((item, linkIndex) => (
                  <a key={linkIndex} className="ud-nb-footer__link" href={str(item.url, '#')}>
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
            <div className="ud-nb-footer__col ud-nb-footer__col--info">
              <EditableText edit={edit} path={['infoTitle']} value={str(props.infoTitle)} as="p" className="ud-nb-footer__col-title" placeholder="Business info" />
              <SafeText value={str(props.address)} className="ud-nb-footer__text" edit={edit} path={['address']} placeholder="Address" />
              <a className="ud-nb-footer__pill" href={str(props.phoneUrl, '#')}>
                <Icon name="phone" size={13} />
                <EditableText edit={edit} path={['phone']} value={str(props.phone)} as="span" placeholder="Phone" />
              </a>
              <a className="ud-nb-footer__pill" href={str(props.emailUrl, '#')}>
                <Icon name="mail" size={13} />
                <EditableText edit={edit} path={['email']} value={str(props.email)} as="span" placeholder="Email" />
              </a>
            </div>
          </div>
          <div className="ud-nb-footer__base">
            <EditableText edit={edit} path={['copyright']} value={str(props.copyright)} as="span" placeholder="© 2026" />
            <span className="ud-nb-footer__social">
              {social.map((item, index) => (
                <a key={index} href={str(item.url, '#')} aria-label={str(item.icon, 'social')}>
                  <Icon name={str(item.icon, 'globe')} size={14} />
                </a>
              ))}
            </span>
            <a className="ud-nb-footer__top" href="#top">
              <EditableText edit={edit} path={['topLabel']} value={str(props.topLabel)} as="span" placeholder="Back to top" />
            </a>
          </div>
        </div>
      </footer>
    )
  },
})
