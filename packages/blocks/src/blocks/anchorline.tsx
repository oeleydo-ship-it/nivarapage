/**
 * Anchorline — an editorial freight-forwarding and logistics template.
 *
 * Visual language: a wide near-white sheet ruled by hairline dividers instead
 * of colour changes, high-contrast serif headlines set in a generous left
 * column, small grey uppercase eyebrows, sans-serif body copy at a quiet size,
 * square-cornered outline buttons, and one photographic hero cut by a diagonal
 * brand wedge. Sections separate by rules and whitespace, so the page reads as
 * one continuous document rather than a stack of cards.
 *
 * Everything routes through `schema()`, which appends the shared design /
 * typography / background / spacing / content-width controls, so every block is
 * editable on the canvas and in the side panel, can be narrowed or widened, and
 * is reusable on any page.
 *
 * Every colour derives from a theme token (`--color-primary`, `--color-accent`,
 * `--color-text`, `--color-surface`, …), so the whole family recolours from
 * Theme settings rather than stranding literals from the reference palette.
 */
import type { CSSProperties, ReactNode } from 'react'
import { useState } from 'react'
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
  richtext,
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

/** Small grey label that sits above a serif headline. */
function Eyebrow({ props }: { props: Props }) {
  const edit = editOf(props)
  const value = str(props.eyebrow)
  if (!value && !edit) return null
  return <EditableText edit={edit} path={['eyebrow']} value={value} as="p" className="ud-an-eyebrow" placeholder="Label" />
}

/** The signature serif headline. `size` picks the display step. */
function Title({
  props,
  as = 'h2',
  size = 'md',
  className,
}: {
  props: Props
  as?: 'h1' | 'h2' | 'h3'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const edit = editOf(props)
  const value = str(props.heading)
  if (!value && !edit) return null
  return (
    <EditableText
      edit={edit}
      path={['heading']}
      value={value}
      as={as}
      className={cx('ud-an-title', `ud-an-title--${size}`, className)}
      placeholder="Headline"
    />
  )
}

/** Lead paragraph under a heading. */
function Lead({ props, className }: { props: Props; className?: string }) {
  const edit = editOf(props)
  const value = str(props.description)
  if (!value && !edit) return null
  return (
    <SafeText value={value} className={cx('ud-an-lead', className)} edit={edit} path={['description']} placeholder="Supporting copy" />
  )
}

/** Square-cornered button: hairline outline, solid ink, or light on dark. */
function AnButton({
  href,
  children,
  variant = 'outline',
}: {
  href: string
  children: ReactNode
  variant?: 'outline' | 'solid' | 'light'
}) {
  return (
    <a className={cx('ud-an-btn', `ud-an-btn--${variant}`)} href={href || '#'}>
      {children}
    </a>
  )
}

function Buttons({
  props,
  primary = 'outline',
  className,
}: {
  props: Props
  primary?: 'outline' | 'solid' | 'light'
  className?: string
}) {
  const edit = editOf(props)
  const a = str(props.buttonLabel)
  const b = str(props.secondaryLabel)
  if (!a && !b && !edit) return null
  return (
    <div className={cx('ud-an-buttons', className)}>
      {a || edit ? (
        <AnButton href={str(props.buttonUrl, '#')} variant={primary}>
          <EditableText edit={edit} path={['buttonLabel']} value={a} as="span" placeholder="Learn more" />
        </AnButton>
      ) : null}
      {b || edit ? (
        <AnButton href={str(props.secondaryUrl, '#')} variant="outline">
          <EditableText edit={edit} path={['secondaryLabel']} value={b} as="span" placeholder="Contact us" />
        </AnButton>
      ) : null}
    </div>
  )
}

const buttonFields = [
  text('buttonLabel', 'Button label'),
  link('buttonUrl', 'Button link'),
  text('secondaryLabel', 'Secondary label'),
  link('secondaryUrl', 'Secondary link'),
]

const logoFields = [
  text('logo', 'Wordmark'),
  text('logoNote', 'Wordmark note'),
  image('logoImage', 'Logo image'),
  field('logoHeight', 'slider', 'Logo height', 'design', { min: 14, max: 120, unit: 'px' }),
  field('logoWidth', 'slider', 'Logo width', 'design', { min: 16, max: 400, unit: 'px', help: 'Leave empty to keep the logo\'s natural aspect ratio.' }),
  link('logoUrl', 'Logo link'),
]

/**
 * Wordmark or uploaded logo. The mark is a hairline ring rather than a filled
 * dot, so it reads as part of the ruled sheet the rest of the family draws on.
 */
function Logo({ props, light = false }: { props: Props; light?: boolean }) {
  const edit = editOf(props)
  const src = str(props.logoImage)
  const height = Math.min(Math.max(num(props.logoHeight, 30), 14), 120)
  const widthRaw = Number(props.logoWidth)
  const width = Number.isFinite(widthRaw) && widthRaw > 0 ? Math.min(Math.max(widthRaw, 16), 400) : 'auto'
  return (
    <a className={cx('ud-an-logo', light && 'ud-an-logo--light')} href={str(props.logoUrl, '/')}>
      {src ? (
        <span className="ud-an-logo__img">
          <img src={src} alt={str(props.logo, 'Logo')} style={{ height, width, display: 'block' }} />
          <EditableImage edit={edit} path={['logoImage']} current={src} label="Replace logo" />
        </span>
      ) : (
        <>
          <span className="ud-an-logo__ring" aria-hidden />
          <span className="ud-an-logo__words">
            <EditableText
              edit={edit}
              path={['logo']}
              value={str(props.logo, 'Anchorline')}
              as="span"
              className="ud-an-logo__text"
              placeholder="Brand"
            />
            <EditableText
              edit={edit}
              path={['logoNote']}
              value={str(props.logoNote)}
              as="span"
              className="ud-an-logo__note"
              placeholder="freight & logistics"
            />
          </span>
        </>
      )}
    </a>
  )
}

/** Section head: eyebrow, serif heading, lead. */
function Head({
  props,
  as = 'h2',
  size = 'md',
  align = 'left',
}: {
  props: Props
  as?: 'h1' | 'h2'
  size?: 'sm' | 'md' | 'lg'
  align?: 'left' | 'center'
}) {
  const edit = editOf(props)
  if (!edit && !str(props.eyebrow) && !str(props.heading) && !str(props.description)) return null
  return (
    <div className={cx('ud-an-head', align === 'center' && 'ud-an-head--center')}>
      <Eyebrow props={props} />
      <Title props={props} as={as} size={size} />
      <Lead props={props} />
    </div>
  )
}

/** Repeater shared by the text-grid blocks. */
const gridItemFields = [text('title', 'Title'), textarea('text', 'Text')]

const columnsField = select('columns', 'Columns', [
  ['2', '2'],
  ['3', '3'],
  ['4', '4'],
])

/* ----------------------------------------------------------------- top bar */

export const topbarAnchor = defineBlock({
  type: 'topbar.anchor',
  version: 1,
  category: 'navigation',
  label: 'Anchorline utility bar',
  icon: 'Clock',
  defaultProps: {
    left: 'Office hours: 08:00 – 17:00, Sunday to Thursday · 24/7 operations desk',
    right: '+44 20 7946 0311  |  Unit 14, Dockgate Park, Southampton SO14',
    animation: 'none',
  },
  schema: schema(text('left', 'Left text'), text('right', 'Right text'), stickyField),
  component: function TopbarAnchor(props) {
    const edit = editOf(props)
    const anim = animationOf(props)
    return (
      <div
        className={cx('ud-an', 'ud-an-topbar', bool(props.sticky) && 'ud-is-sticky', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container ud-an-topbar__row">
          <EditableText edit={edit} path={['left']} value={str(props.left)} as="p" placeholder="Office hours" />
          <EditableText edit={edit} path={['right']} value={str(props.right)} as="p" placeholder="Phone | Address" />
        </div>
      </div>
    )
  },
})

/* ------------------------------------------------------------------ navbar */

export const navbarAnchor = defineBlock({
  type: 'navbar.anchor',
  version: 1,
  category: 'navigation',
  label: 'Anchorline navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Anchorline',
    logoNote: 'freight & logistics',
    logoImage: '',
    logoUrl: '/',
    links: [
      { label: 'Home', url: '/' },
      { label: 'About Us', url: '/about' },
      { label: 'Services', url: '/services' },
      { label: 'Gallery', url: '/gallery' },
      { label: 'Track Shipment', url: '/tracking' },
      { label: 'Contact', url: '/contact' },
    ],
    buttonLabel: "Let's Talk!",
    buttonUrl: '/contact',
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
  component: function NavbarAnchor(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    const anim = animationOf(props)
    return (
      <header
        className={cx('ud-an', 'ud-an-nav', bool(props.sticky, true) && 'ud-an-nav--sticky', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container ud-an-nav__bar">
          <Logo props={props} />
          <nav className={cx('ud-an-nav__links', open && 'is-open')} aria-label="Primary">
            {items(props.links, []).map((item, index) => (
              <NavItem key={index} item={item}>
                <a className="ud-an-nav__link" href={str(item.url, '#')}>
                  <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
                  <SubmenuCaret show={hasSubmenu(item)} />
                </a>
                <Submenu props={props} item={item} index={index} />
              </NavItem>
            ))}
          </nav>
          <div className="ud-an-nav__end">
            {str(props.buttonLabel) || edit ? (
              <AnButton href={str(props.buttonUrl, '#')} variant="outline">
                <EditableText
                  edit={edit}
                  path={['buttonLabel']}
                  value={str(props.buttonLabel)}
                  as="span"
                  placeholder="Let's Talk!"
                />
              </AnButton>
            ) : null}
            <button
              type="button"
              className="ud-an-nav__toggle"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <Icon name={open ? 'close' : 'menu'} size={20} />
            </button>
          </div>
        </div>
      </header>
    )
  },
})

/* -------------------------------------------------------------------- hero */

/** The diagonal brand wedge that cuts across the hero photograph. */
function Wedge() {
  return (
    <>
      <span className="ud-an-wedge ud-an-wedge--a" aria-hidden />
      <span className="ud-an-wedge ud-an-wedge--b" aria-hidden />
    </>
  )
}

export const heroAnchor = defineBlock({
  type: 'hero.anchor',
  version: 1,
  category: 'hero',
  label: 'Anchorline photo hero',
  icon: 'Image',
  defaultProps: {
    heading: 'Your Freight,\nOur Priority',
    brandLine: 'ANCHORLINE FREIGHT & LOGISTICS',
    tagline: 'Moving cargo the world depends on',
    image: '',
    buttonLabel: '',
    buttonUrl: '/contact',
    secondaryLabel: '',
    secondaryUrl: '/services',
    overlay: 55,
    wedge: true,
    animation: 'fade',
    animationTrigger: 'load',
  },
  schema: schema(
    textarea('heading', 'Heading (one line per row)'),
    text('brandLine', 'Brand line'),
    text('tagline', 'Tagline'),
    image('image', 'Background photograph'),
    ...buttonFields,
    field('overlay', 'slider', 'Photo darkening', 'design', { min: 0, max: 100, unit: '%' }),
    toggle('wedge', 'Brand wedge', 'design'),
  ),
  component: function HeroAnchor(props) {
    const edit = editOf(props)
    const heading = lines(props.heading, [])
    const src = str(props.image)
    return (
      <SectionShell
        props={props}
        tone="default"
        className="ud-an ud-an-hero"
        bleed
        style={{ '--an-overlay': `${Math.min(Math.max(num(props.overlay, 55), 0), 100) / 100}` } as CSSProperties}
      >
        <div className="ud-an-hero__media">
          {src ? <img src={src} alt={str(props.brandLine, 'Freight')} className="ud-an-hero__img" /> : null}
          <span className="ud-an-hero__scrim" aria-hidden />
          {bool(props.wedge, true) ? <Wedge /> : null}
          {edit ? <EditableImage edit={edit} path={['image']} current={src} label="Replace photo" /> : null}
        </div>
        <div className="ud-container ud-an-hero__inner">
          <div className="ud-an-hero__copy">
            {heading.length || edit ? (
              <EditableText
                edit={edit}
                path={['heading']}
                value={str(props.heading)}
                as="h1"
                className="ud-an-hero__title"
                placeholder="Your Freight, Our Priority"
                multiline
              >
                {heading.map((line, index) => (
                  <span key={index} className="ud-an-hero__line">
                    {line}
                  </span>
                ))}
              </EditableText>
            ) : null}
            {str(props.brandLine) || edit ? (
              <EditableText
                edit={edit}
                path={['brandLine']}
                value={str(props.brandLine)}
                as="p"
                className="ud-an-hero__brand"
                placeholder="Brand line"
              />
            ) : null}
            {str(props.tagline) || edit ? (
              <EditableText
                edit={edit}
                path={['tagline']}
                value={str(props.tagline)}
                as="p"
                className="ud-an-hero__tag"
                placeholder="Tagline"
              />
            ) : null}
            <Buttons props={props} primary="light" />
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------------- page head */

export const pageHeadAnchor = defineBlock({
  type: 'pagehead.anchor',
  version: 1,
  category: 'hero',
  label: 'Anchorline page header',
  icon: 'Type',
  defaultProps: {
    eyebrow: 'Services',
    heading: 'Delivering world-class logistics solutions that are efficient, dependable, and built for your success.',
    description: '',
    animation: 'fade-up',
    animationTrigger: 'load',
  },
  schema: schema(eyebrowField, textarea('heading', 'Heading'), descriptionField, ...buttonFields),
  component: function PageHeadAnchor(props) {
    return (
      <SectionShell props={props} tone="default" className="ud-an ud-an-pagehead">
        <div className="ud-an-pagehead__inner">
          <Eyebrow props={props} />
          <Title props={props} as="h1" size="lg" />
          <Lead props={props} />
          <Buttons props={props} />
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------------- intro */

export const introAnchor = defineBlock({
  type: 'intro.anchor',
  version: 1,
  category: 'content',
  label: 'Anchorline two-column intro',
  icon: 'Columns',
  defaultProps: {
    eyebrow: '',
    heading: 'About\nAnchorline',
    description:
      'Anchorline is a full-service logistics provider handling air freight, LCL consolidations, FCL ocean freight, road haulage, project cargo, door-to-door delivery, relocations, warehousing, packing and customs clearance.',
    buttonLabel: 'See more about us',
    buttonUrl: '/about',
    animation: 'fade-up',
  },
  schema: schema(eyebrowField, textarea('heading', 'Heading'), descriptionField, ...buttonFields),
  component: function IntroAnchor(props) {
    const edit = editOf(props)
    const heading = lines(props.heading, [])
    return (
      <SectionShell props={props} tone="default" className="ud-an ud-an-intro">
        <div className="ud-an-intro__grid">
          <div className="ud-an-intro__lead">
            <Eyebrow props={props} />
            {heading.length || edit ? (
              <EditableText
                edit={edit}
                path={['heading']}
                value={str(props.heading)}
                as="h2"
                className="ud-an-title ud-an-title--md"
                placeholder="About"
                multiline
              >
                {heading.map((line, index) => (
                  <span key={index} className="ud-an-intro__line">
                    {line}
                  </span>
                ))}
              </EditableText>
            ) : null}
          </div>
          <div className="ud-an-intro__body">
            <Lead props={props} />
            <Buttons props={props} className="ud-an-buttons--end" />
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------------- services */

export const servicesAnchor = defineBlock({
  type: 'services.anchor',
  version: 1,
  category: 'features',
  label: 'Anchorline service grid',
  icon: 'Grid',
  defaultProps: {
    heading: 'Our Services',
    description: '',
    columns: '3',
    rule: true,
    items: [
      {
        title: 'Import / Export Customs Clearance',
        text: 'A comprehensive customs service that keeps your air and sea freight accompanied by every document the countries of origin and destination require.',
      },
      {
        title: 'Air Freight Services',
        text: 'A turnkey service for international air transport. We work with the world’s leading commercial carriers so long-distance freight lands on time, consistently.',
      },
      {
        title: 'Sea Freight Services (LCL/FCL)',
        text: 'The most economical way to handle small and large-scale international movements, through an established network of ocean carriers and consolidators.',
      },
      {
        title: 'Global Relocation',
        text: 'Customised relocation services for corporate clients and private individuals, from a single crate to a whole office floor.',
      },
      {
        title: 'Seaway Bill Issuance',
        text: 'We issue our own sea waybills, which gives us end-to-end management and tracking of every shipment from collection to final delivery.',
      },
      {
        title: 'Warehousing & Distribution',
        text: 'Bonded and general storage with pick, pack and onward distribution, so stock sits close to the customers waiting for it.',
      },
    ],
    buttonLabel: 'See more services',
    buttonUrl: '/services',
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    columnsField,
    toggle('rule', 'Rule between rows', 'design'),
    repeater('items', 'Services', gridItemFields, { itemLabel: 'Service' }),
    ...buttonFields,
  ),
  component: function ServicesAnchor(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    const columns = Math.min(Math.max(num(props.columns, 3), 2), 4)
    return (
      <SectionShell props={props} tone="default" className="ud-an ud-an-services">
        <Head props={props} />
        <div
          className={cx('ud-an-grid', bool(props.rule, true) && 'ud-an-grid--ruled')}
          data-cols={columns}
          style={{ '--an-cols': columns } as CSSProperties}
        >
          {list.map((item, index) => (
            <article key={index} className="ud-an-cell">
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-an-cell__title"
                placeholder="Service"
              />
              <SafeText
                value={str(item.text)}
                className="ud-an-cell__text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="What this service covers"
              />
            </article>
          ))}
        </div>
        <Buttons props={props} className="ud-an-buttons--end" />
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------------- feature */

export const featureAnchor = defineBlock({
  type: 'feature.anchor',
  version: 1,
  category: 'content',
  label: 'Anchorline text and image',
  icon: 'Layout',
  defaultProps: {
    eyebrow: '',
    heading: 'Complete logistics. Global expertise.',
    body:
      '<p>At <strong>Anchorline</strong> we deliver tailored logistics and freight solutions for international and domestic needs. With a focus on reliability and efficiency, our team handles every shipment — by air, sea or road — with precision and care.</p><p>From customs clearance to relocations and urgent deliveries, we provide end-to-end support that simplifies global transport. Whether it is a single pallet or a complete move, we make it smooth, secure and stress free.</p>',
    image: '',
    reverse: false,
    buttonLabel: 'Learn more',
    buttonUrl: '/about',
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    richtext('body', 'Body'),
    image('image', 'Image'),
    toggle('reverse', 'Image first', 'layout'),
    ...buttonFields,
  ),
  component: function FeatureAnchor(props) {
    const edit = editOf(props)
    return (
      <SectionShell
        props={props}
        tone="default"
        className={cx('ud-an ud-an-feature', bool(props.reverse) && 'is-reverse')}
      >
        <div className="ud-an-feature__grid">
          <div className="ud-an-feature__copy">
            <Eyebrow props={props} />
            <Title props={props} size="md" />
            <EditableRich edit={edit} path={['body']} html={str(props.body)} className="ud-an-rich" />
            <Buttons props={props} />
          </div>
          <div className="ud-an-feature__media">
            <Media src={props.image} alt={str(props.heading)} ratio="landscape" edit={edit} path={['image']} />
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------------- principles */

export const principlesAnchor = defineBlock({
  type: 'principles.anchor',
  version: 1,
  category: 'content',
  label: 'Anchorline vision and mission',
  icon: 'Target',
  defaultProps: {
    items: [
      {
        title: 'Vision',
        text: 'To be a world-class freight forwarding and logistics provider with a dominant presence in every lane our customers trade on, delivering complete solutions tailored to what each of them actually needs.',
      },
      {
        title: 'Mission',
        text: 'To provide exceptional service that goes beyond expectation, through clear and concise two-way communication. We build relationships by staying flexible as our customers’ demands and requirements change.',
      },
    ],
    image: '',
    reverse: false,
    animation: 'fade-up',
  },
  schema: schema(
    repeater('items', 'Statements', [text('title', 'Label'), textarea('text', 'Text')], { itemLabel: 'Statement' }),
    image('image', 'Image'),
    toggle('reverse', 'Image first', 'layout'),
  ),
  component: function PrinciplesAnchor(props) {
    const edit = editOf(props)
    return (
      <SectionShell
        props={props}
        tone="default"
        className={cx('ud-an ud-an-principles', bool(props.reverse) && 'is-reverse')}
      >
        <div className="ud-an-principles__grid">
          <div className="ud-an-principles__copy">
            {items(props.items, []).map((item, index) => (
              <div key={index} className="ud-an-principles__item">
                <EditableText
                  edit={edit}
                  path={['items', index, 'title']}
                  value={str(item.title)}
                  as="h3"
                  className="ud-an-principles__label"
                  placeholder="Vision"
                />
                <SafeText
                  value={str(item.text)}
                  className="ud-an-principles__text"
                  edit={edit}
                  path={['items', index, 'text']}
                  placeholder="What we aim for"
                />
              </div>
            ))}
          </div>
          <div className="ud-an-principles__media">
            <Media src={props.image} alt="" ratio="landscape" edit={edit} path={['image']} />
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------------ accent */

export const accentAnchor = defineBlock({
  type: 'accent.anchor',
  version: 1,
  category: 'content',
  label: 'Anchorline accent split',
  icon: 'Sparkles',
  defaultProps: {
    heading: 'Corporate concept',
    description:
      'Our customers benefit from a keen combination of logistics and forwarding services: clear, fast and flexible execution, achieved by simplifying the process chain and reducing the number of parties involved.',
    image: '',
    reverse: false,
    buttonLabel: '',
    buttonUrl: '/about',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    descriptionField,
    image('image', 'Image'),
    toggle('reverse', 'Text first', 'layout'),
    ...buttonFields,
  ),
  component: function AccentAnchor(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" className={cx('ud-an ud-an-accent', bool(props.reverse) && 'is-reverse')}>
        <div className="ud-an-accent__grid">
          <div className="ud-an-accent__media">
            <span className="ud-an-accent__disc" aria-hidden />
            <Media
              src={props.image}
              alt={str(props.heading)}
              ratio="landscape"
              className="ud-an-accent__img"
              edit={edit}
              path={['image']}
            />
          </div>
          <div className="ud-an-accent__copy">
            <Title props={props} size="md" />
            <Lead props={props} />
            <Buttons props={props} />
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------------- stats */

export const statsAnchor = defineBlock({
  type: 'stats.anchor',
  version: 1,
  category: 'features',
  label: 'Anchorline figures',
  icon: 'Chart',
  defaultProps: {
    heading: '',
    items: [
      { value: '2011', label: 'Trading since' },
      { value: '94', label: 'Countries served' },
      { value: '18,400', label: 'Shipments a year' },
      { value: '99.2%', label: 'On-time delivery' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    repeater('items', 'Figures', [text('value', 'Value'), text('label', 'Label')], { itemLabel: 'Figure' }),
  ),
  component: function StatsAnchor(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-an ud-an-stats">
        <Title props={props} size="sm" />
        <div className="ud-an-stats__row" style={{ '--an-cols': Math.max(list.length, 1) } as CSSProperties}>
          {list.map((item, index) => (
            <div key={index} className="ud-an-stat">
              <EditableText
                edit={edit}
                path={['items', index, 'value']}
                value={str(item.value)}
                as="p"
                className="ud-an-stat__value"
                placeholder="99%"
              />
              <EditableText
                edit={edit}
                path={['items', index, 'label']}
                value={str(item.label)}
                as="p"
                className="ud-an-stat__label"
                placeholder="Label"
              />
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------------- steps */

export const stepsAnchor = defineBlock({
  type: 'steps.anchor',
  version: 1,
  category: 'features',
  label: 'Anchorline numbered process',
  icon: 'Layers',
  defaultProps: {
    heading: 'How a shipment moves',
    description: '',
    columns: '4',
    items: [
      {
        title: 'Quote and booking',
        text: 'Send us the lane, the commodity and the dates. You get a costed routing back the same working day.',
      },
      {
        title: 'Collection and packing',
        text: 'We collect, pack to export standard and raise the documents the destination will ask for.',
      },
      {
        title: 'Carriage and clearance',
        text: 'Cargo moves on the routing you approved while our brokers clear it at both ends.',
      },
      {
        title: 'Delivery and proof',
        text: 'Final-mile delivery against a signed receipt, with the paperwork filed to your account.',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    columnsField,
    repeater('items', 'Steps', gridItemFields, { itemLabel: 'Step' }),
  ),
  component: function StepsAnchor(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    const columns = Math.min(Math.max(num(props.columns, 4), 2), 4)
    return (
      <SectionShell props={props} tone="default" className="ud-an ud-an-steps">
        <Head props={props} />
        <div className="ud-an-grid ud-an-grid--ruled" data-cols={columns} style={{ '--an-cols': columns } as CSSProperties}>
          {list.map((item, index) => (
            <article key={index} className="ud-an-cell">
              <p className="ud-an-cell__num">{String(index + 1).padStart(2, '0')}</p>
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-an-cell__title"
                placeholder="Step"
              />
              <SafeText
                value={str(item.text)}
                className="ud-an-cell__text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="What happens"
              />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------------- gallery */

export const galleryAnchor = defineBlock({
  type: 'gallery.anchor',
  version: 1,
  category: 'gallery',
  label: 'Anchorline photo grid',
  icon: 'Camera',
  defaultProps: {
    eyebrow: '',
    heading: 'From the yard and the quayside',
    description: '',
    columns: '3',
    items: [{ image: '', caption: '' }],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    columnsField,
    repeater('items', 'Photographs', [image('image', 'Photograph'), text('caption', 'Caption')], {
      itemLabel: 'Photograph',
    }),
  ),
  component: function GalleryAnchor(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    const columns = Math.min(Math.max(num(props.columns, 3), 2), 4)
    return (
      <SectionShell props={props} tone="default" className="ud-an ud-an-gallery">
        <Head props={props} />
        <div className="ud-an-gallery__grid" style={{ '--an-cols': columns } as CSSProperties}>
          {list.map((item, index) => (
            <figure key={index} className="ud-an-shot">
              <Media src={item.image} alt={str(item.caption)} ratio="landscape" edit={edit} path={['items', index, 'image']} />
              {str(item.caption) || edit ? (
                <EditableText
                  edit={edit}
                  path={['items', index, 'caption']}
                  value={str(item.caption)}
                  as="p"
                  className="ud-an-shot__caption"
                  placeholder="Caption"
                />
              ) : null}
            </figure>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------------- tracking */

export const trackAnchor = defineBlock({
  type: 'track.anchor',
  version: 1,
  category: 'form',
  label: 'Anchorline shipment tracking',
  icon: 'Search',
  defaultProps: {
    eyebrow: 'Track shipment',
    heading: 'Where is my cargo?',
    description:
      'Enter the booking reference, air waybill or bill of lading number printed on your paperwork and we will come straight back with its current status.',
    formId: '',
    buttonLabel: 'Track',
    fineprint: 'Reference numbers are 9 to 12 characters. Lost yours? Call the operations desk and we will find it.',
    animation: 'fade-up',
    animationTrigger: 'load',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    text('formId', 'Form ID'),
    text('buttonLabel', 'Submit label'),
    text('fineprint', 'Fine print'),
  ),
  component: function TrackAnchor(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" className="ud-an ud-an-track">
        <div className="ud-an-track__panel">
          <Eyebrow props={props} />
          <Title props={props} as="h1" size="md" />
          <Lead props={props} />
          <PublicForm
            formId={str(props.formId) || undefined}
            submitLabel={str(props.buttonLabel, 'Track')}
            layout="inline"
            fields={[{ name: 'reference', label: 'Reference number', type: 'text', required: true, placeholder: 'ANL-000000000' }]}
          />
          {str(props.fineprint) || edit ? (
            <EditableText
              edit={edit}
              path={['fineprint']}
              value={str(props.fineprint)}
              as="p"
              className="ud-an-track__fine"
              placeholder="Fine print"
            />
          ) : null}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------------- contact */

export const contactAnchor = defineBlock({
  type: 'contact.anchor',
  version: 1,
  category: 'form',
  label: 'Anchorline contact panel',
  icon: 'Mail',
  defaultProps: {
    eyebrow: 'Contact',
    heading: 'Get in touch with us',
    description:
      '<p><strong>Anchorline Freight &amp; Logistics</strong> moves shipping, forwarding and customs work across Europe, the Gulf and South East Asia. Whether it is freight forwarding, warehousing or customs support, our desk is here at every step.</p>',
    emailLabel: 'Email:',
    email: 'desk@anchorline.example',
    social: [
      { icon: 'facebook', url: '#' },
      { icon: 'twitter', url: '#' },
      { icon: 'instagram', url: '#' },
      { icon: 'linkedin', url: '#' },
    ],
    formId: '',
    buttonLabel: 'Submit',
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    richtext('description', 'Description'),
    text('emailLabel', 'Email label'),
    text('email', 'Email address'),
    repeater('social', 'Social', [icon('icon', 'Icon'), link('url', 'URL')], { itemLabel: 'Profile' }),
    text('formId', 'Form ID'),
    text('buttonLabel', 'Submit label'),
  ),
  component: function ContactAnchor(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" className="ud-an ud-an-contact">
        <div className="ud-an-contact__grid">
          <div className="ud-an-contact__info">
            <Eyebrow props={props} />
            <Title props={props} as="h1" size="md" />
            <EditableRich edit={edit} path={['description']} html={str(props.description)} className="ud-an-rich" />
            <div className="ud-an-contact__email">
              <EditableText
                edit={edit}
                path={['emailLabel']}
                value={str(props.emailLabel)}
                as="p"
                className="ud-an-contact__emaillabel"
                placeholder="Email:"
              />
              <a href={`mailto:${str(props.email)}`}>
                <EditableText edit={edit} path={['email']} value={str(props.email)} as="span" placeholder="desk@example.com" />
              </a>
            </div>
            <div className="ud-an-contact__social">
              {items(props.social, []).map((item, index) => (
                <a key={index} href={str(item.url, '#')} aria-label={str(item.icon, 'social')}>
                  <Icon name={str(item.icon, 'globe')} size={19} />
                </a>
              ))}
            </div>
          </div>
          <div className="ud-an-contact__form">
            <PublicForm
              formId={str(props.formId) || undefined}
              submitLabel={str(props.buttonLabel, 'Submit')}
              fields={[
                { name: 'name', label: 'Full Name', type: 'text', required: true },
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'phone', label: 'Phone Number', type: 'text' },
                { name: 'message', label: 'Message', type: 'textarea' },
              ]}
            />
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------------- offices */

export const officesAnchor = defineBlock({
  type: 'offices.anchor',
  version: 1,
  category: 'content',
  label: 'Anchorline offices and branches',
  icon: 'Globe',
  defaultProps: {
    heading: 'Offices & branches',
    description: '',
    columns: '3',
    items: [
      {
        title: 'Southampton, UK',
        address: 'Unit 14, Dockgate Park, Southampton SO14 3PQ',
        phones: '+44 20 7946 0311\n+44 23 8033 1180',
      },
      { title: 'Rotterdam, NL', address: 'Waalhaven Oostzijde 62, 3087 BM Rotterdam', phones: '+31 10 205 4477' },
      {
        title: 'Jebel Ali, UAE',
        address: 'Warehouse 6, JAFZA South Zone, Dubai',
        phones: '+971 4 881 2260\n+971 4 881 2261',
      },
      { title: 'Port Klang, MY', address: 'Lot 118, Jalan Sultan Hishamuddin, 42000 Port Klang', phones: '+60 3 3168 9040' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    columnsField,
    repeater(
      'items',
      'Offices',
      [text('title', 'Office'), textarea('address', 'Address'), textarea('phones', 'Phone numbers (one per line)')],
      { itemLabel: 'Office' },
    ),
  ),
  component: function OfficesAnchor(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    const columns = Math.min(Math.max(num(props.columns, 3), 2), 4)
    return (
      <SectionShell props={props} tone="default" className="ud-an ud-an-offices">
        <Head props={props} size="lg" />
        <div className="ud-an-grid ud-an-grid--ruled" data-cols={columns} style={{ '--an-cols': columns } as CSSProperties}>
          {list.map((item, index) => (
            <article key={index} className="ud-an-cell ud-an-office">
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-an-cell__title"
                placeholder="City"
              />
              <SafeText
                value={str(item.address)}
                className="ud-an-cell__text"
                edit={edit}
                path={['items', index, 'address']}
                placeholder="Address"
              />
              <ul className="ud-an-office__phones">
                {lines(item.phones, []).map((phone, phoneIndex) => (
                  <li key={phoneIndex}>
                    <Icon name="phone" size={14} />
                    <a href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------------- positions */

export const positionsAnchor = defineBlock({
  type: 'positions.anchor',
  version: 1,
  category: 'content',
  label: 'Anchorline open positions',
  icon: 'Briefcase',
  defaultProps: {
    eyebrow: 'Careers',
    heading: 'Open positions',
    description: '',
    items: [
      { title: 'Ocean freight coordinator', meta: 'Southampton · Full time', url: '/contact' },
      { title: 'Customs entry clerk', meta: 'Southampton · Full time', url: '/contact' },
      { title: 'Warehouse supervisor', meta: 'Jebel Ali · Full time', url: '/contact' },
      { title: 'Key account manager', meta: 'Rotterdam · Full time', url: '/contact' },
    ],
    linkLabel: 'Apply',
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater('items', 'Positions', [text('title', 'Role'), text('meta', 'Location and hours'), link('url', 'Link')], {
      itemLabel: 'Position',
    }),
    text('linkLabel', 'Link label'),
  ),
  component: function PositionsAnchor(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" className="ud-an ud-an-positions">
        <Head props={props} />
        <ul className="ud-an-positions__list">
          {items(props.items, []).map((item, index) => (
            <li key={index} className="ud-an-role">
              <div className="ud-an-role__copy">
                <EditableText
                  edit={edit}
                  path={['items', index, 'title']}
                  value={str(item.title)}
                  as="h3"
                  className="ud-an-role__title"
                  placeholder="Role"
                />
                <EditableText
                  edit={edit}
                  path={['items', index, 'meta']}
                  value={str(item.meta)}
                  as="p"
                  className="ud-an-role__meta"
                  placeholder="Location · Hours"
                />
              </div>
              <a className="ud-an-role__link" href={str(item.url, '#')}>
                {str(props.linkLabel, 'Apply')}
              </a>
            </li>
          ))}
        </ul>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------------------- faq */

export const faqAnchor = defineBlock({
  type: 'faq.anchor',
  version: 1,
  category: 'faq',
  label: 'Anchorline questions',
  icon: 'Message',
  defaultProps: {
    eyebrow: '',
    heading: 'Questions we are asked most',
    description: '',
    items: [
      {
        question: 'How quickly can you quote a lane?',
        answer: 'Same working day for anything on a routing we already run, and within two for project cargo that needs a survey first.',
      },
      {
        question: 'Do you handle customs yourselves?',
        answer: 'Yes. Our own brokers file entries at origin and destination, so declarations are not sitting with a third party.',
      },
      {
        question: 'Can you store goods before delivery?',
        answer: 'We hold bonded and general stock at all four of our sites and release it against your instruction.',
      },
      {
        question: 'What insurance is included?',
        answer: 'Carriage is covered to standard trading conditions. All-risk marine cover is available per shipment or as an annual policy.',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater('items', 'Questions', [text('question', 'Question'), textarea('answer', 'Answer')], { itemLabel: 'Question' }),
  ),
  component: function FaqAnchor(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" className="ud-an ud-an-faq">
        <Head props={props} />
        <div className="ud-an-faq__list">
          {items(props.items, []).map((item, index) => (
            <details key={index} className="ud-an-faq__item" open={index === 0}>
              <summary className="ud-an-faq__q">
                <EditableText
                  edit={edit}
                  path={['items', index, 'question']}
                  value={str(item.question)}
                  as="span"
                  placeholder="Question"
                />
                <Icon name="plus" size={16} />
              </summary>
              <SafeText
                value={str(item.answer)}
                className="ud-an-faq__a"
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

/* --------------------------------------------------------------------- cta */

export const ctaAnchor = defineBlock({
  type: 'cta.anchor',
  version: 1,
  category: 'cta',
  label: 'Anchorline closing band',
  icon: 'Send',
  defaultProps: {
    heading: 'Let’s talk,\nwe respond quickly',
    columns: [
      { title: 'Address', text: 'Unit 14, Dockgate Park, Southampton SO14 3PQ, United Kingdom' },
      { title: 'Contact', text: 'desk@anchorline.example\n+44 20 7946 0311\n+44 23 8033 1180' },
    ],
    buttonLabel: '',
    buttonUrl: '/contact',
    animation: 'fade-up',
  },
  schema: schema(
    textarea('heading', 'Heading'),
    repeater('columns', 'Detail columns', [text('title', 'Label'), textarea('text', 'Text')], { itemLabel: 'Column' }),
    ...buttonFields,
  ),
  component: function CtaAnchor(props) {
    const edit = editOf(props)
    const heading = lines(props.heading, [])
    return (
      <SectionShell props={props} tone="default" className="ud-an ud-an-cta">
        <div className="ud-an-cta__grid">
          {heading.length || edit ? (
            <EditableText
              edit={edit}
              path={['heading']}
              value={str(props.heading)}
              as="h2"
              className="ud-an-title ud-an-title--md"
              placeholder="Let’s talk"
              multiline
            >
              {heading.map((line, index) => (
                <span key={index} className="ud-an-cta__line">
                  {line}
                </span>
              ))}
            </EditableText>
          ) : null}
          {items(props.columns, []).map((column, index) => (
            <div key={index} className="ud-an-cta__col">
              <EditableText
                edit={edit}
                path={['columns', index, 'title']}
                value={str(column.title)}
                as="p"
                className="ud-an-cta__label"
                placeholder="Address"
              />
              <SafeText
                value={str(column.text)}
                className="ud-an-cta__text"
                edit={edit}
                path={['columns', index, 'text']}
                placeholder="Details"
              />
            </div>
          ))}
        </div>
        <Buttons props={props} />
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------------ footer */

export const footerAnchor = defineBlock({
  type: 'footer.anchor',
  version: 1,
  category: 'footer',
  label: 'Anchorline footer',
  icon: 'Layout',
  defaultProps: {
    columns: [
      {
        title: '',
        links: [
          { label: 'Southampton LinkedIn', url: '#' },
          { label: 'Rotterdam LinkedIn', url: '#' },
          { label: 'Jebel Ali LinkedIn', url: '#' },
          { label: 'Instagram', url: '#' },
        ],
      },
      {
        title: '',
        links: [
          { label: 'Home', url: '/' },
          { label: 'About Us', url: '/about' },
          { label: 'Contact us', url: '/contact' },
        ],
      },
      {
        title: '',
        links: [
          { label: 'Services', url: '/services' },
          { label: 'Gallery', url: '/gallery' },
          { label: 'Careers', url: '/careers' },
        ],
      },
    ],
    newsletterTitle: 'Join to get the latest news',
    newsletterFormId: '',
    newsletterLabel: 'Submit',
    copyright: '© Anchorline Freight & Logistics',
    animation: 'fade-up',
  },
  schema: schema(
    repeater(
      'columns',
      'Link columns',
      [text('title', 'Title'), repeater('links', 'Links', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Link' })],
      { itemLabel: 'Column' },
    ),
    text('newsletterTitle', 'Newsletter title'),
    text('newsletterFormId', 'Newsletter form ID'),
    text('newsletterLabel', 'Newsletter submit label'),
    text('copyright', 'Copyright'),
  ),
  component: function FooterAnchor(props) {
    const edit = editOf(props)
    const anim = animationOf(props)
    return (
      <footer
        className={cx('ud-an', 'ud-an-footer', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container ud-an-footer__grid">
          <div className="ud-an-footer__links">
            {items(props.columns, []).map((column, index) => (
              <div key={index} className="ud-an-footer__col">
                {str(column.title) || edit ? (
                  <EditableText
                    edit={edit}
                    path={['columns', index, 'title']}
                    value={str(column.title)}
                    as="h3"
                    className="ud-an-footer__coltitle"
                    placeholder="Column"
                  />
                ) : null}
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
          </div>
          <div className="ud-an-footer__signup">
            <EditableText
              edit={edit}
              path={['newsletterTitle']}
              value={str(props.newsletterTitle)}
              as="h3"
              className="ud-an-footer__signuptitle"
              placeholder="Join to get the latest news"
            />
            <PublicForm
              formId={str(props.newsletterFormId) || undefined}
              submitLabel={str(props.newsletterLabel, 'Submit')}
              fields={[{ name: 'email', label: '', type: 'email', required: true, placeholder: 'Email Address' }]}
            />
          </div>
        </div>
        <div className="ud-container ud-an-footer__base">
          <EditableText edit={edit} path={['copyright']} value={str(props.copyright)} as="p" placeholder="© Anchorline" />
        </div>
      </footer>
    )
  },
})
