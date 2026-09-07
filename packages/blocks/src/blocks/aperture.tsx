/**
 * Aperture — a creative-agency / studio template.
 *
 * Visual language: a white sheet broken by two recurring bands — an ink-black
 * one for services and tickers, and a faint cool-grey one for process and
 * pricing. Headlines are large geometric sans set tight (-0.03em) with a very
 * open line-height, body copy is a soft slate rather than black, photography is
 * heavily rounded, and one warm coral accent carries numbering, kickers and the
 * hover state on every card.
 *
 * Everything routes through `schema()`, which appends the shared design /
 * typography / background / spacing / content-width controls, so every block is
 * editable on the canvas and in the side panel, can be narrowed or widened, and
 * is reusable on any page.
 */
import type { CSSProperties, ReactNode } from 'react'
import { isValidElement, useState } from 'react'
import { EditableImage, EditableRich, EditableText, editOf, useElementStyle, pathId, type EditPath } from '../editable'
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

/** Small coral kicker with a leading rule, used above most section headings. */
function Kicker({ props, path = 'eyebrow' }: { props: Props; path?: string }) {
  const edit = editOf(props)
  const value = str(props[path])
  if (!value && !edit) return null
  return (
    <p className="ud-ap-kicker">
      <span className="ud-ap-kicker__rule" aria-hidden />
      <EditableText edit={edit} path={[path]} value={value} as="span" placeholder="Label" />
    </p>
  )
}

/** Kicker, heading and lead paragraph, left or centred. */
function ApHead({
  props,
  as = 'h2',
  align = 'left',
  size = 'md',
}: {
  props: Props
  as?: 'h1' | 'h2'
  align?: 'left' | 'center'
  size?: 'md' | 'lg'
}) {
  const edit = editOf(props)
  const heading = str(props.heading)
  const description = str(props.description)
  if (!edit && !heading && !description && !str(props.eyebrow)) return null
  const Tag = as
  return (
    <div className={cx('ud-ap-head', align === 'center' && 'ud-ap-head--center')}>
      <Kicker props={props} />
      {heading || edit ? (
        <EditableText
          edit={edit}
          path={['heading']}
          value={heading}
          as={Tag}
          className={cx('ud-ap-title', size === 'lg' && 'ud-ap-title--lg')}
          placeholder="Headline"
        />
      ) : null}
      {description || edit ? (
        <SafeText value={description} className="ud-ap-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
      ) : null}
    </div>
  )
}

/**
 * Pill button. `dark` is the default call to action, `outline` sits beside it,
 * `light` is the same pair inverted for use on the ink band.
 */
function ApButton({
  href,
  children,
  variant = 'dark',
  arrow = false,
}: {
  href: string
  children: ReactNode
  variant?: 'dark' | 'outline' | 'light' | 'accent'
  arrow?: boolean
}) {
  const labelPath = isValidElement<{ path?: EditPath }>(children) ? children.props.path : undefined
  const boxPath = [...(labelPath || []), '$box']
  const appearance = useElementStyle(boxPath)
  return (
    <a style={appearance} data-ud-style={pathId(boxPath)} className={cx('ud-ap-btn', `ud-ap-btn--${variant}`)} href={href || '#'}>
      <span className="ud-ap-btn__label">{children}</span>
      {arrow ? (
        <span className="ud-ap-btn__arrow" aria-hidden>
          <Icon name="arrow" size={16} />
        </span>
      ) : null}
    </a>
  )
}

function ApButtons({ props, primary = 'dark' }: { props: Props; primary?: 'dark' | 'light' | 'accent' }) {
  const edit = editOf(props)
  const a = str(props.buttonLabel)
  const b = str(props.secondaryLabel)
  if (!a && !b && !edit) return null
  return (
    <div className="ud-ap-buttons">
      {a || edit ? (
        <ApButton href={str(props.buttonUrl, '#')} variant={primary} arrow>
          <EditableText edit={edit} path={['buttonLabel']} value={a} as="span" placeholder="Get started" />
        </ApButton>
      ) : null}
      {b || edit ? (
        <ApButton href={str(props.secondaryUrl, '#')} variant="outline">
          <EditableText edit={edit} path={['secondaryLabel']} value={b} as="span" placeholder="Learn more" />
        </ApButton>
      ) : null}
    </div>
  )
}

const buttonFields = [
  { ...text('buttonLabel', 'Button label'), styleTarget: 'button' as const },
  link('buttonUrl', 'Button link'),
  { ...text('secondaryLabel', 'Second button label'), styleTarget: 'button' as const },
  link('secondaryUrl', 'Second button link'),
]

/** Brand wordmark with a coral aperture mark, replaced by an uploaded logo. */
function Logo({ props, light = false }: { props: Props; light?: boolean }) {
  const edit = editOf(props)
  const src = str(props.logoImage)
  const height = Math.min(Math.max(num(props.logoHeight, 26), 14), 120)
  const widthRaw = Number(props.logoWidth)
  const width = Number.isFinite(widthRaw) && widthRaw > 0 ? Math.min(Math.max(widthRaw, 16), 400) : 'auto'
  return (
    <a className={cx('ud-ap-logo', light && 'ud-ap-logo--light')} href={str(props.logoUrl, '/')}>
      {src ? (
        <span className="ud-ap-logo__img">
          <img src={src} alt={str(props.logo, 'Logo')} style={{ height, width, display: 'block' }} />
          <EditableImage edit={edit} path={['logoImage']} current={src} label="Replace logo" />
        </span>
      ) : (
        <>
          <span className="ud-ap-logo__mark" aria-hidden />
          <EditableText
            edit={edit}
            path={['logo']}
            value={str(props.logo, 'Aperture')}
            as="span"
            className="ud-ap-logo__text"
            placeholder="Brand"
          />
        </>
      )}
    </a>
  )
}

const logoFields = [
  text('logo', 'Wordmark'),
  image('logoImage', 'Logo image'),
  field('logoHeight', 'slider', 'Logo height', 'design', { min: 14, max: 120, unit: 'px' }),
  field('logoWidth', 'slider', 'Logo width', 'design', {
    min: 16,
    max: 400,
    unit: 'px',
    help: "Leave empty to keep the logo's natural aspect ratio.",
  }),
  link('logoUrl', 'Logo link'),
]

/** Tick list shared by the pricing and feature blocks. */
function Ticks({ props, path, className }: { props: Props; path: string; className?: string }) {
  const edit = editOf(props)
  const values = lines(props[path], [])
  if (!values.length && !edit) return null
  return (
    <ul className={cx('ud-ap-ticks', className)}>
      {values.map((value, index) => (
        <li key={index}>
          <span className="ud-ap-ticks__mark" aria-hidden>
            <Icon name="check" size={11} />
          </span>
          <EditableText edit={edit} path={[path, index]} value={value} as="span" placeholder="Feature" />
        </li>
      ))}
    </ul>
  )
}

/** Two-digit index used by the service, process and pricing blocks. */
function Ordinal({ index, className }: { index: number; className?: string }) {
  return <span className={cx('ud-ap-ordinal', className)}>{String(index + 1).padStart(2, '0')}</span>
}

/* ---------------------------------------------------------- navbar.aperture */

export const navbarAperture = defineBlock({
  type: 'navbar.aperture',
  version: 1,
  category: 'navigation',
  label: 'Aperture navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Aperture',
    logoImage: '',
    logoUrl: '/',
    links: [
      { label: 'Home', url: '/' },
      { label: 'About', url: '/about' },
      {
        label: 'Studio',
        url: '/about',
        children: [
          { label: 'Our people', url: '/team' },
          { label: 'How we work', url: '/about' },
          { label: 'Careers', url: '/about' },
        ],
      },
      { label: 'Services', url: '/services' },
      { label: 'Work', url: '/work' },
      {
        label: 'More',
        url: '/pricing',
        children: [
          { label: 'Pricing', url: '/pricing' },
          { label: 'Journal', url: '/journal' },
          { label: 'Contact', url: '/contact' },
        ],
      },
    ],
    phoneLabel: 'Call any time',
    phone: '+1 (555) 240 8890',
    buttonLabel: "Start a project",
    buttonUrl: '/contact',
    sticky: true,
    animation: 'fade-down',
    animationTrigger: 'load',
  },
  schema: schema(
    ...logoFields,
    navLinksField('links', 'Links'),
    text('phoneLabel', 'Phone label'),
    text('phone', 'Phone number'),
    { ...text('buttonLabel', 'Button label'), styleTarget: 'button' as const },
    link('buttonUrl', 'Button link'),
    stickyField,
  ),
  component: function NavbarAperture(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    const anim = animationOf(props)
    const phone = str(props.phone)
    return (
      <header
        className={cx('ud-ap', 'ud-ap-nav', bool(props.sticky, true) && 'ud-ap-nav--sticky', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container ud-ap-nav__bar">
          <Logo props={props} />
          <nav className={cx('ud-ap-nav__links', open && 'is-open')} aria-label="Primary">
            {items(props.links, []).map((item, index) => (
              <NavItem key={index} item={item}>
                <a className="ud-ap-nav__link" href={str(item.url, '#')}>
                  <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
                  <SubmenuCaret show={hasSubmenu(item)} />
                </a>
                <Submenu props={props} item={item} index={index} />
              </NavItem>
            ))}
            {phone ? (
              <a className="ud-ap-nav__drawerlink" href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
                {phone}
              </a>
            ) : null}
          </nav>
          <div className="ud-ap-nav__end">
            {phone || edit ? (
              <a className="ud-ap-nav__phone" href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
                <span className="ud-ap-nav__phone-icon" aria-hidden>
                  <Icon name="phone" size={15} />
                </span>
                <span className="ud-ap-nav__phone-text">
                  <EditableText
                    edit={edit}
                    path={['phoneLabel']}
                    value={str(props.phoneLabel)}
                    as="span"
                    className="ud-ap-nav__phone-label"
                    placeholder="Call any time"
                  />
                  <EditableText
                    edit={edit}
                    path={['phone']}
                    value={phone}
                    as="span"
                    className="ud-ap-nav__phone-value"
                    placeholder="Phone"
                  />
                </span>
              </a>
            ) : null}
            {str(props.buttonLabel) || edit ? (
              <ApButton href={str(props.buttonUrl, '#')} variant="dark" arrow>
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} as="span" placeholder="Start a project" />
              </ApButton>
            ) : null}
            <button
              type="button"
              className="ud-ap-nav__toggle"
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

/* ------------------------------------------------------------ hero.aperture */

export const heroAperture = defineBlock({
  type: 'hero.aperture',
  version: 1,
  category: 'hero',
  label: 'Aperture split hero',
  icon: 'Sparkles',
  defaultProps: {
    eyebrow: 'Creative ideas that inspire growth',
    heading: 'A studio for brands with something to prove',
    description:
      'We build identities, sites and campaigns for teams who would rather be remembered than merely noticed — strategy first, craft all the way through.',
    buttonLabel: 'Start a project',
    buttonUrl: '/contact',
    secondaryLabel: 'Watch the reel',
    secondaryUrl: '/work',
    image: '',
    badge: 'Trusted by 240+ teams',
    animation: 'fade-up',
    animationTrigger: 'load',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    ...buttonFields,
    image('image', 'Hero image'),
    text('badge', 'Image badge'),
    { ...text('contentColumn', 'Content column'), group: 'design', styleTarget: 'column' },
    { ...text('imageColumn', 'Image column'), group: 'design', styleTarget: 'column' },
  ),
  component: function HeroAperture(props) {
    const edit = editOf(props)
    const contentStyle = useElementStyle(['contentColumn'])
    const imageStyle = useElementStyle(['imageColumn'])
    return (
      <SectionShell props={props} tone="default" className="ud-ap ud-ap-hero">
        <div className="ud-ap-hero__grid">
          <div className="ud-ap-hero__copy" data-ud-style="contentColumn" style={contentStyle}>
            <Kicker props={props} />
            <EditableText
              edit={edit}
              path={['heading']}
              value={str(props.heading)}
              as="h1"
              className="ud-ap-title ud-ap-title--xl"
              placeholder="Headline"
            />
            {str(props.description) || edit ? (
              <SafeText
                value={str(props.description)}
                className="ud-ap-lead"
                edit={edit}
                path={['description']}
                placeholder="Supporting copy"
              />
            ) : null}
            <ApButtons props={props} />
          </div>
          <div className="ud-ap-hero__figure" data-ud-style="imageColumn" style={imageStyle}>
            <Media
              src={props.image}
              alt={str(props.heading)}
              ratio="portrait"
              className="ud-ap-hero__img"
              edit={edit}
              path={['image']}
            />
            {str(props.badge) || edit ? (
              <EditableText
                edit={edit}
                path={['badge']}
                value={str(props.badge)}
                as="span"
                className="ud-ap-hero__badge"
                placeholder="Badge"
              />
            ) : null}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------- pagehead.aperture */

export const pageHeadAperture = defineBlock({
  type: 'pagehead.aperture',
  version: 1,
  category: 'hero',
  label: 'Aperture page header',
  icon: 'Layout',
  defaultProps: {
    eyebrow: '',
    heading: 'About the studio',
    description: 'Who we are, how we work, and why clients stay past the first project.',
    surface: 'tint',
    animation: 'fade-up',
    animationTrigger: 'load',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    select(
      'surface',
      'Background',
      [
        ['tint', 'Cool tint'],
        ['plain', 'White'],
        ['ink', 'Ink black'],
      ],
      'design',
    ),
  ),
  component: function PageHeadAperture(props) {
    const surface = str(props.surface, 'tint')
    return (
      <SectionShell
        props={props}
        tone="default"
        align="center"
        className={cx('ud-ap', 'ud-ap-pagehead', `ud-ap-pagehead--${surface}`)}
      >
        <ApHead props={props} as="h1" align="center" size="lg" />
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- logos.aperture */

export const logosAperture = defineBlock({
  type: 'logos.aperture',
  version: 1,
  category: 'gallery',
  label: 'Aperture partner rail',
  icon: 'Grid',
  defaultProps: {
    heading: 'Trusted partners worldwide',
    scroll: true,
    speed: 32,
    items: [
      { label: 'Halden' },
      { label: 'Ovalfoot' },
      { label: 'Persimmon' },
      { label: 'Brightmoor' },
      { label: 'Turnstile' },
      { label: 'Kelp & Co' },
      { label: 'Vireo' },
      { label: 'Marlowe' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    repeater('items', 'Partners', [text('label', 'Label'), image('image', 'Logo')], { itemLabel: 'Partner' }),
    toggle('scroll', 'Scroll continuously', 'design'),
    field('speed', 'slider', 'Seconds per loop', 'design', { min: 10, max: 90, unit: 's' }),
  ),
  component: function LogosAperture(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    // Scrolling is off while editing, so a label cannot slide away mid-edit.
    const scrolling = bool(props.scroll, true) && !edit && rows.length > 0
    const seconds = Math.min(Math.max(num(props.speed, 32), 10), 90)
    // The rail is duplicated until it is comfortably wider than the viewport,
    // so a short list still fills the strip and the loop never shows a gap.
    const passes = rows.length ? Math.max(1, Math.ceil(10 / rows.length)) : 1

    const cell = (item: Props, index: number, keyPrefix: string, decorative: boolean) =>
      str(item.image) ? (
        <Media
          key={keyPrefix + String(index)}
          src={item.image}
          alt={decorative ? '' : str(item.label)}
          ratio="wide"
          className="ud-ap-logos__img"
          edit={decorative ? undefined : edit}
          path={['items', index, 'image']}
        />
      ) : decorative ? (
        <span key={keyPrefix + String(index)} className="ud-ap-logos__word" aria-hidden>
          {str(item.label)}
        </span>
      ) : (
        <EditableText
          key={keyPrefix + String(index)}
          edit={edit}
          path={['items', index, 'label']}
          value={str(item.label)}
          as="span"
          className="ud-ap-logos__word"
          placeholder="Partner"
        />
      )

    const track = Array.from({ length: scrolling ? passes * 2 : 1 }).flatMap((_, pass) =>
      rows.map((item, index) => cell(item, index, `p${pass}-`, pass > 0)),
    )

    return (
      <SectionShell props={props} tone="default" className="ud-ap ud-ap-logos" bleed>
        {str(props.heading) || edit ? (
          <div className="ud-container">
            <EditableText
              edit={edit}
              path={['heading']}
              value={str(props.heading)}
              as="p"
              className="ud-ap-logos__heading"
              placeholder="Trusted by"
            />
          </div>
        ) : null}
        <div className={cx('ud-ap-logos__viewport', scrolling && 'is-scrolling')}>
          <div className="ud-ap-logos__rail" style={{ '--ap-marquee': `${seconds}s` } as CSSProperties}>
            {track}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- about.aperture */

export const aboutAperture = defineBlock({
  type: 'about.aperture',
  version: 1,
  category: 'content',
  label: 'Aperture about + counters',
  icon: 'Info',
  defaultProps: {
    eyebrow: 'About us',
    heading: 'Who we are, and how we got here',
    description:
      'A team of strategists, designers and engineers who would rather ship one considered thing than five forgettable ones.',
    stats: [
      { value: '12', suffix: '+', label: 'Years shipping work we still stand behind' },
      { value: '240', suffix: '+', label: 'Brands launched, rebuilt or rescued' },
      { value: '18', suffix: '', label: 'Industry awards, none of them self-nominated' },
      { value: '96', suffix: '%', label: 'Of clients come back for a second project' },
    ],
    buttonLabel: 'More about us',
    buttonUrl: '/about',
    phoneLabel: 'Get a free quote',
    phone: '+1 (555) 240 8890',
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater(
      'stats',
      'Counters',
      [text('value', 'Value'), text('suffix', 'Suffix'), text('label', 'Label')],
      { itemLabel: 'Counter' },
    ),
    { ...text('buttonLabel', 'Button label'), styleTarget: 'button' as const },
    link('buttonUrl', 'Button link'),
    text('phoneLabel', 'Phone label'),
    text('phone', 'Phone number'),
  ),
  component: function AboutAperture(props) {
    const edit = editOf(props)
    const stats = items(props.stats, [])
    const phone = str(props.phone)
    return (
      <SectionShell props={props} tone="default" className="ud-ap ud-ap-about">
        <ApHead props={props} />
        {stats.length ? (
          <div className="ud-ap-about__stats">
            {stats.map((stat, index) => (
              <div key={index} className="ud-ap-stat">
                <p className="ud-ap-stat__value">
                  <EditableText edit={edit} path={['stats', index, 'value']} value={str(stat.value)} as="span" placeholder="0" />
                  <EditableText
                    edit={edit}
                    path={['stats', index, 'suffix']}
                    value={str(stat.suffix)}
                    as="span"
                    className="ud-ap-stat__suffix"
                    placeholder="+"
                  />
                </p>
                <EditableText
                  edit={edit}
                  path={['stats', index, 'label']}
                  value={str(stat.label)}
                  as="p"
                  className="ud-ap-stat__label"
                  placeholder="What it measures"
                />
              </div>
            ))}
          </div>
        ) : null}
        <div className="ud-ap-about__foot">
          {str(props.buttonLabel) || edit ? (
            <ApButton href={str(props.buttonUrl, '#')} variant="dark" arrow>
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} as="span" placeholder="More about us" />
            </ApButton>
          ) : null}
          {phone || edit ? (
            <a className="ud-ap-about__phone" href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
              <span className="ud-ap-about__phone-icon" aria-hidden>
                <Icon name="phone" size={16} />
              </span>
              <span>
                <EditableText
                  edit={edit}
                  path={['phoneLabel']}
                  value={str(props.phoneLabel)}
                  as="span"
                  className="ud-ap-about__phone-label"
                  placeholder="Get a free quote"
                />
                <EditableText
                  edit={edit}
                  path={['phone']}
                  value={phone}
                  as="span"
                  className="ud-ap-about__phone-value"
                  placeholder="Phone"
                />
              </span>
            </a>
          ) : null}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- stats.aperture */

export const statsAperture = defineBlock({
  type: 'stats.aperture',
  version: 1,
  category: 'features',
  label: 'Aperture counter row',
  icon: 'BarChart',
  defaultProps: {
    heading: '',
    items: [
      { value: '12', suffix: '+', label: 'Years in practice' },
      { value: '240', suffix: '+', label: 'Projects delivered' },
      { value: '18', suffix: '', label: 'Awards won' },
      { value: '96', suffix: '%', label: 'Client return rate' },
    ],
    tone: 'ink',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    repeater('items', 'Counters', [text('value', 'Value'), text('suffix', 'Suffix'), text('label', 'Label')], {
      itemLabel: 'Counter',
    }),
    select(
      'tone',
      'Band',
      [
        ['ink', 'Ink black'],
        ['tint', 'Cool tint'],
        ['plain', 'White'],
      ],
      'design',
    ),
  ),
  component: function StatsAperture(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const tone = str(props.tone, 'ink')
    return (
      <SectionShell props={props} tone="default" className={cx('ud-ap', 'ud-ap-statband', `ud-ap-statband--${tone}`)}>
        {str(props.heading) || edit ? (
          <EditableText
            edit={edit}
            path={['heading']}
            value={str(props.heading)}
            as="h2"
            className="ud-ap-title"
            placeholder="Headline"
          />
        ) : null}
        <div className="ud-ap-statband__grid">
          {rows.map((stat, index) => (
            <div key={index} className="ud-ap-stat">
              <p className="ud-ap-stat__value">
                <EditableText edit={edit} path={['items', index, 'value']} value={str(stat.value)} as="span" placeholder="0" />
                <EditableText
                  edit={edit}
                  path={['items', index, 'suffix']}
                  value={str(stat.suffix)}
                  as="span"
                  className="ud-ap-stat__suffix"
                  placeholder="+"
                />
              </p>
              <EditableText
                edit={edit}
                path={['items', index, 'label']}
                value={str(stat.label)}
                as="p"
                className="ud-ap-stat__label"
                placeholder="What it measures"
              />
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------- services.aperture */

export const servicesAperture = defineBlock({
  type: 'services.aperture',
  version: 1,
  category: 'services',
  label: 'Aperture numbered services',
  icon: 'Layers',
  defaultProps: {
    eyebrow: 'Services',
    heading: 'Your needs, our expertise',
    description:
      'Bring us a brief, a half-formed idea or a business that has outgrown its brand. We take it from there.',
    items: [
      {
        title: 'Brand identity',
        text: 'Naming, marks, palettes and the guidelines that keep it all intact once we hand it over.',
        icon: 'sparkles',
      },
      {
        title: 'Web design',
        text: 'Layout, typography and motion built around what a visitor is actually trying to do.',
        icon: 'layout',
      },
      {
        title: 'Development',
        text: 'Fast, accessible front-ends and the CMS work that lets your team publish without us.',
        icon: 'code',
      },
      {
        title: 'Product design',
        text: 'Research, flows and interface systems for teams shipping software rather than pages.',
        icon: 'grid',
      },
    ],
    buttonLabel: '',
    buttonUrl: '',
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater('items', 'Services', [text('title', 'Title'), textarea('text', 'Description'), icon('icon', 'Icon'), link('url', 'Link')], {
      itemLabel: 'Service',
    }),
    { ...text('buttonLabel', 'Button label'), styleTarget: 'button' as const },
    link('buttonUrl', 'Button link'),
  ),
  component: function ServicesAperture(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-ap ud-ap-services">
        <div className="ud-ap-services__top">
          <ApHead props={props} />
          {str(props.buttonLabel) || edit ? (
            <ApButton href={str(props.buttonUrl, '#')} variant="light" arrow>
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} as="span" placeholder="All services" />
            </ApButton>
          ) : null}
        </div>
        <div className="ud-ap-services__list">
          {rows.map((item, index) => (
            <a key={index} className="ud-ap-service" href={str(item.url, '#')}>
              <Ordinal index={index} className="ud-ap-service__no" />
              <div className="ud-ap-service__body">
                <EditableText
                  edit={edit}
                  path={['items', index, 'title']}
                  value={str(item.title)}
                  as="h3"
                  className="ud-ap-service__title"
                  placeholder="Service"
                />
                <SafeText
                  value={str(item.text)}
                  className="ud-ap-service__text"
                  edit={edit}
                  path={['items', index, 'text']}
                  placeholder="What it covers"
                />
              </div>
              <span className="ud-ap-service__icon" aria-hidden>
                <Icon name={str(item.icon, 'arrow')} size={20} />
              </span>
            </a>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------- portfolio.aperture */

export const portfolioAperture = defineBlock({
  type: 'portfolio.aperture',
  version: 1,
  category: 'gallery',
  label: 'Aperture project grid',
  icon: 'Image',
  defaultProps: {
    eyebrow: 'Portfolio',
    heading: 'Selected work',
    description: '',
    columns: 2,
    items: [
      {
        title: 'Wayfinding for a city transit network',
        text: 'A signage and app system that cut wrong-platform boardings by a third.',
        category: 'Product design',
        meta: 'March 2026',
        image: '',
        url: '/work',
      },
      {
        title: 'A storefront rebuilt around one checkout',
        text: 'Consolidating four purchase paths into one lifted completed orders sharply.',
        category: 'Development',
        meta: 'January 2026',
        image: '',
        url: '/work',
      },
      {
        title: 'Identity for an independent record label',
        text: 'A mark and sleeve system flexible enough for forty releases a year.',
        category: 'Brand identity',
        meta: 'November 2025',
        image: '',
        url: '/work',
      },
      {
        title: 'A learning portal children actually finish',
        text: 'Progress mechanics and plain language pushed course completion well past target.',
        category: 'Web design',
        meta: 'September 2025',
        image: '',
        url: '/work',
      },
    ],
    buttonLabel: 'View all work',
    buttonUrl: '/work',
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    field('columns', 'slider', 'Columns', 'layout', { min: 1, max: 3 }),
    repeater(
      'items',
      'Projects',
      [
        text('title', 'Title'),
        textarea('text', 'Description'),
        text('category', 'Category'),
        text('meta', 'Date or client'),
        image('image', 'Image'),
        link('url', 'Link'),
      ],
      { itemLabel: 'Project' },
    ),
    { ...text('buttonLabel', 'Button label'), styleTarget: 'button' as const },
    link('buttonUrl', 'Button link'),
  ),
  component: function PortfolioAperture(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const columns = Math.min(Math.max(num(props.columns, 2), 1), 3)
    return (
      <SectionShell props={props} tone="default" className="ud-ap ud-ap-portfolio">
        <div className="ud-ap-portfolio__top">
          <ApHead props={props} />
          {str(props.buttonLabel) || edit ? (
            <ApButton href={str(props.buttonUrl, '#')} variant="outline" arrow>
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} as="span" placeholder="View all" />
            </ApButton>
          ) : null}
        </div>
        <div className="ud-ap-portfolio__grid" style={{ '--ap-cols': columns } as CSSProperties}>
          {rows.map((item, index) => (
            <article key={index} className="ud-ap-project">
              <a className="ud-ap-project__figure" href={str(item.url, '#')}>
                <Media
                  src={item.image}
                  alt={str(item.title)}
                  ratio="landscape"
                  className="ud-ap-project__img"
                  edit={edit}
                  path={['items', index, 'image']}
                />
                <span className="ud-ap-project__view" aria-hidden>
                  <Icon name="arrow" size={18} />
                </span>
              </a>
              <div className="ud-ap-project__meta">
                <EditableText
                  edit={edit}
                  path={['items', index, 'category']}
                  value={str(item.category)}
                  as="span"
                  className="ud-ap-project__tag"
                  placeholder="Category"
                />
                <EditableText
                  edit={edit}
                  path={['items', index, 'meta']}
                  value={str(item.meta)}
                  as="span"
                  className="ud-ap-project__date"
                  placeholder="Date"
                />
              </div>
              <h3 className="ud-ap-project__title">
                <a href={str(item.url, '#')}>
                  <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="span" placeholder="Project" />
                </a>
              </h3>
              <SafeText
                value={str(item.text)}
                className="ud-ap-project__text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="What you built"
              />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- process.aperture */

export const processAperture = defineBlock({
  type: 'process.aperture',
  version: 1,
  category: 'features',
  label: 'Aperture working process',
  icon: 'ListChecks',
  defaultProps: {
    eyebrow: 'Working process',
    heading: 'Three steps, no mystery',
    description: '',
    items: [
      { title: 'Discovery and strategy', text: 'We learn the business, the audience and the constraint nobody mentioned in the brief.' },
      { title: 'Design and build', text: 'Concepts, then a working thing you can click, reviewed in the open rather than revealed at the end.' },
      { title: 'Launch and iterate', text: 'We ship, watch how it performs, and keep tuning the parts that are underperforming.' },
    ],
    buttonLabel: 'Start a project',
    buttonUrl: '/contact',
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater('items', 'Steps', [text('title', 'Title'), textarea('text', 'Description')], { itemLabel: 'Step' }),
    { ...text('buttonLabel', 'Button label'), styleTarget: 'button' as const },
    link('buttonUrl', 'Button link'),
  ),
  component: function ProcessAperture(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-ap ud-ap-process">
        <div className="ud-ap-process__top">
          <ApHead props={props} />
          {str(props.buttonLabel) || edit ? (
            <ApButton href={str(props.buttonUrl, '#')} variant="dark" arrow>
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} as="span" placeholder="Start a project" />
            </ApButton>
          ) : null}
        </div>
        <ol className="ud-ap-process__list">
          {rows.map((item, index) => (
            <li key={index} className="ud-ap-step">
              <Ordinal index={index} className="ud-ap-step__no" />
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-ap-step__title"
                placeholder="Step"
              />
              <SafeText
                value={str(item.text)}
                className="ud-ap-step__text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="What happens"
              />
            </li>
          ))}
        </ol>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- ticker.aperture */

export const tickerAperture = defineBlock({
  type: 'ticker.aperture',
  version: 1,
  category: 'content',
  label: 'Aperture discipline ticker',
  icon: 'ArrowRight',
  defaultProps: {
    items: [
      { label: 'Brand identity' },
      { label: 'Web design' },
      { label: 'Product design' },
      { label: 'Art direction' },
      { label: 'Development' },
      { label: 'Motion' },
    ],
    speed: 26,
    tone: 'ink',
    animation: 'none',
  },
  schema: schema(
    repeater('items', 'Words', [text('label', 'Word')], { itemLabel: 'Word' }),
    field('speed', 'slider', 'Seconds per loop', 'design', { min: 10, max: 90, unit: 's' }),
    select(
      'tone',
      'Band',
      [
        ['ink', 'Ink black'],
        ['accent', 'Coral'],
        ['tint', 'Cool tint'],
      ],
      'design',
    ),
  ),
  component: function TickerAperture(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const seconds = Math.min(Math.max(num(props.speed, 26), 10), 90)
    const tone = str(props.tone, 'ink')
    const moving = !edit && rows.length > 0
    const passes = rows.length ? Math.max(1, Math.ceil(12 / rows.length)) : 1

    const cell = (item: Props, index: number, keyPrefix: string, decorative: boolean) => (
      <span key={keyPrefix + String(index)} className="ud-ap-ticker__cell" aria-hidden={decorative || undefined}>
        {decorative ? (
          <span className="ud-ap-ticker__word">{str(item.label)}</span>
        ) : (
          <EditableText
            edit={edit}
            path={['items', index, 'label']}
            value={str(item.label)}
            as="span"
            className="ud-ap-ticker__word"
            placeholder="Word"
          />
        )}
        <span className="ud-ap-ticker__dot" aria-hidden />
      </span>
    )

    const track = Array.from({ length: moving ? passes * 2 : 1 }).flatMap((_, pass) =>
      rows.map((item, index) => cell(item, index, `p${pass}-`, pass > 0)),
    )

    return (
      <SectionShell props={props} tone="default" className={cx('ud-ap', 'ud-ap-ticker', `ud-ap-ticker--${tone}`)} bleed>
        <div className={cx('ud-ap-ticker__viewport', moving && 'is-scrolling')}>
          <div className="ud-ap-ticker__rail" style={{ '--ap-marquee': `${seconds}s` } as CSSProperties}>
            {track}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------- testimonials.aperture */

export const testimonialsAperture = defineBlock({
  type: 'testimonials.aperture',
  version: 1,
  category: 'testimonials',
  label: 'Aperture testimonial wall',
  icon: 'Quote',
  defaultProps: {
    eyebrow: 'Testimonials',
    heading: 'What clients say once the work is live',
    description: '',
    items: [
      {
        text: 'They pushed back on half our brief, and they were right about most of it. The launch did what the old site never managed.',
        name: 'Rosa Feld',
        role: 'Marketing lead, Halden',
        image: '',
      },
      {
        text: 'We arrived with a vague idea and left with a plan we could actually budget. Nothing was ever a surprise.',
        name: 'Ingrid Mwangi',
        role: 'CTO, Ovalfoot',
        image: '',
      },
      {
        text: 'The attention to detail is the part I keep noticing months later. Small things that nobody would have missed, done properly anyway.',
        name: 'Tobias Renn',
        role: 'Founder, Persimmon',
        image: '',
      },
      {
        text: 'Responsive, direct, and happy to say when something was a bad idea. Rarer than it should be.',
        name: 'Amara Lindqvist',
        role: 'Ops director, Brightmoor',
        image: '',
      },
    ],
    columns: 2,
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater(
      'items',
      'Quotes',
      [textarea('text', 'Quote'), text('name', 'Name'), text('role', 'Role'), image('image', 'Portrait')],
      { itemLabel: 'Quote' },
    ),
    field('columns', 'slider', 'Columns', 'layout', { min: 1, max: 3 }),
  ),
  component: function TestimonialsAperture(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const columns = Math.min(Math.max(num(props.columns, 2), 1), 3)
    return (
      <SectionShell props={props} tone="default" className="ud-ap ud-ap-quotes">
        <ApHead props={props} />
        <div className="ud-ap-quotes__grid" style={{ '--ap-cols': columns } as CSSProperties}>
          {rows.map((item, index) => (
            <figure key={index} className="ud-ap-quote">
              <span className="ud-ap-quote__mark" aria-hidden>
                <Icon name="quote" size={22} />
              </span>
              <SafeText
                value={str(item.text)}
                className="ud-ap-quote__text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="What they said"
              />
              <figcaption className="ud-ap-quote__by">
                {str(item.image) || edit ? (
                  <Media
                    src={item.image}
                    alt={str(item.name)}
                    ratio="square"
                    className="ud-ap-quote__avatar"
                    edit={edit}
                    path={['items', index, 'image']}
                  />
                ) : null}
                <span className="ud-ap-quote__who">
                  <EditableText
                    edit={edit}
                    path={['items', index, 'name']}
                    value={str(item.name)}
                    as="span"
                    className="ud-ap-quote__name"
                    placeholder="Name"
                  />
                  <EditableText
                    edit={edit}
                    path={['items', index, 'role']}
                    value={str(item.role)}
                    as="span"
                    className="ud-ap-quote__role"
                    placeholder="Role"
                  />
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ team.aperture */

export const teamAperture = defineBlock({
  type: 'team.aperture',
  version: 1,
  category: 'team',
  label: 'Aperture team grid',
  icon: 'Users',
  defaultProps: {
    eyebrow: 'The studio',
    heading: 'The people who do the work',
    description: '',
    columns: 4,
    items: [
      { name: 'Rosa Feld', role: 'Founder, strategy', bio: 'Runs the first workshop and the last review.', image: '' },
      { name: 'Ingrid Mwangi', role: 'Design director', bio: 'Type, grid, and the argument for restraint.', image: '' },
      { name: 'Tobias Renn', role: 'Engineering lead', bio: 'Builds the thing and keeps it fast afterwards.', image: '' },
      { name: 'Amara Lindqvist', role: 'Client partner', bio: 'Scope, schedule, and the honest status update.', image: '' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    field('columns', 'slider', 'Columns', 'layout', { min: 2, max: 4 }),
    repeater('items', 'People', [text('name', 'Name'), text('role', 'Role'), textarea('bio', 'Bio'), image('image', 'Portrait')], {
      itemLabel: 'Person',
    }),
  ),
  component: function TeamAperture(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const columns = Math.min(Math.max(num(props.columns, 4), 2), 4)
    return (
      <SectionShell props={props} tone="default" className="ud-ap ud-ap-team">
        <ApHead props={props} />
        <div className="ud-ap-team__grid" style={{ '--ap-cols': columns } as CSSProperties}>
          {rows.map((item, index) => (
            <article key={index} className="ud-ap-person">
              <Media
                src={item.image}
                alt={str(item.name)}
                ratio="portrait"
                className="ud-ap-person__img"
                edit={edit}
                path={['items', index, 'image']}
              />
              <EditableText
                edit={edit}
                path={['items', index, 'name']}
                value={str(item.name)}
                as="h3"
                className="ud-ap-person__name"
                placeholder="Name"
              />
              <EditableText
                edit={edit}
                path={['items', index, 'role']}
                value={str(item.role)}
                as="p"
                className="ud-ap-person__role"
                placeholder="Role"
              />
              <SafeText
                value={str(item.bio)}
                className="ud-ap-person__bio"
                edit={edit}
                path={['items', index, 'bio']}
                placeholder="Short bio"
              />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- pricing.aperture */

export const pricingAperture = defineBlock({
  type: 'pricing.aperture',
  version: 1,
  category: 'pricing',
  label: 'Aperture engagement pricing',
  icon: 'CreditCard',
  defaultProps: {
    eyebrow: 'Pricing',
    heading: 'Ways to work with us',
    description: 'Fixed scopes for defined problems, retainers for the ones that keep moving.',
    items: [
      {
        name: 'Sprint',
        price: '$6,000',
        period: 'per two weeks',
        text: 'A short, defined piece of work: a landing page, a rebrand of one surface, an audit with a plan attached.',
        features: 'One workstream at a time\nWeekly review calls\nSource files handed over\nTwo rounds of revisions',
        buttonLabel: 'Book a sprint',
        buttonUrl: '/contact',
        featured: false,
      },
      {
        name: 'Project',
        price: '$28,000',
        period: 'typical engagement',
        text: 'The usual shape: discovery, design and build of a full site or identity, start to launch.',
        features: 'Strategy and discovery phase\nFull design system\nBuild and CMS setup\nLaunch support for 30 days',
        buttonLabel: 'Scope a project',
        buttonUrl: '/contact',
        featured: true,
      },
      {
        name: 'Partner',
        price: 'From $9,000',
        period: 'per month',
        text: 'An ongoing team for companies shipping continuously rather than once a year.',
        features: 'Dedicated designer and engineer\nShared roadmap and backlog\nSame-day response window\nQuarterly strategy review',
        buttonLabel: 'Talk to us',
        buttonUrl: '/contact',
        featured: false,
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater(
      'items',
      'Plans',
      [
        text('name', 'Name'),
        text('price', 'Price'),
        text('period', 'Period'),
        textarea('text', 'Description'),
        textarea('features', 'Features (one per line)'),
        { ...text('buttonLabel', 'Button label'), styleTarget: 'button' as const },
        link('buttonUrl', 'Button link'),
        toggle('featured', 'Highlight', 'content'),
      ],
      { itemLabel: 'Plan' },
    ),
  ),
  component: function PricingAperture(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-ap ud-ap-pricing">
        <ApHead props={props} align="center" />
        <div className="ud-ap-pricing__grid">
          {rows.map((item, index) => (
            <article key={index} className={cx('ud-ap-plan', bool(item.featured, false) && 'is-featured')}>
              <EditableText
                edit={edit}
                path={['items', index, 'name']}
                value={str(item.name)}
                as="h3"
                className="ud-ap-plan__name"
                placeholder="Plan"
              />
              <p className="ud-ap-plan__price">
                <EditableText edit={edit} path={['items', index, 'price']} value={str(item.price)} as="span" placeholder="$0" />
                <EditableText
                  edit={edit}
                  path={['items', index, 'period']}
                  value={str(item.period)}
                  as="span"
                  className="ud-ap-plan__period"
                  placeholder="per month"
                />
              </p>
              <SafeText
                value={str(item.text)}
                className="ud-ap-plan__text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="Who it is for"
              />
              <Ticks props={item} path="features" className="ud-ap-plan__features" />
              {str(item.buttonLabel) || edit ? (
                <ApButton href={str(item.buttonUrl, '#')} variant={bool(item.featured, false) ? 'accent' : 'outline'} arrow>
                  <EditableText
                    edit={edit}
                    path={['items', index, 'buttonLabel']}
                    value={str(item.buttonLabel)}
                    as="span"
                    placeholder="Get started"
                  />
                </ApButton>
              ) : null}
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- faq.aperture */

export const faqAperture = defineBlock({
  type: 'faq.aperture',
  version: 1,
  category: 'faq',
  label: 'Aperture questions',
  icon: 'HelpCircle',
  defaultProps: {
    eyebrow: 'Questions',
    heading: 'Before you get in touch',
    description: '',
    items: [
      {
        question: 'How long does a typical project take?',
        answer: 'Most full engagements run eight to twelve weeks. Shorter sprints are two weeks. We tell you which one your brief is on the first call.',
      },
      {
        question: 'Do you work with in-house teams?',
        answer: 'Often. We can lead the work, or sit alongside your designers and engineers and hand over cleanly at the end.',
      },
      {
        question: 'What do you need from us to start?',
        answer: 'A decision-maker who can attend reviews, whatever brand material already exists, and access to the people who talk to your customers.',
      },
      {
        question: 'What happens after launch?',
        answer: 'Thirty days of support is included on every project. After that, most clients move to a partner retainer or come back for the next sprint.',
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
  component: function FaqAperture(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const [open, setOpen] = useState(0)
    return (
      <SectionShell props={props} tone="default" className="ud-ap ud-ap-faq">
        <ApHead props={props} />
        <div className="ud-ap-faq__list">
          {rows.map((item, index) => {
            // In the builder every answer stays open, so copy is never hidden
            // behind an interaction the editor has to discover.
            const isOpen = Boolean(edit) || open === index
            return (
              <div key={index} className={cx('ud-ap-faq__row', isOpen && 'is-open')}>
                <button
                  type="button"
                  className="ud-ap-faq__q"
                  aria-expanded={isOpen}
                  onClick={() => setOpen((current) => (current === index ? -1 : index))}
                >
                  <EditableText
                    edit={edit}
                    path={['items', index, 'question']}
                    value={str(item.question)}
                    as="span"
                    placeholder="Question"
                  />
                  <span className="ud-ap-faq__sign" aria-hidden>
                    <Icon name={isOpen ? 'minus' : 'plus'} size={16} />
                  </span>
                </button>
                <div className="ud-ap-faq__a" hidden={!isOpen}>
                  <SafeText
                    value={str(item.answer)}
                    edit={edit}
                    path={['items', index, 'answer']}
                    placeholder="Answer"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ blog.aperture */

export const blogAperture = defineBlock({
  type: 'blog.aperture',
  version: 1,
  category: 'blog',
  label: 'Aperture journal cards',
  icon: 'FileText',
  defaultProps: {
    eyebrow: 'Journal',
    heading: 'Notes from the studio',
    description: '',
    columns: 3,
    items: [
      {
        title: 'The brief is never the problem',
        text: 'What clients ask for and what they need are usually two questions apart. Here is how we find the second one.',
        category: 'Strategy',
        meta: '12 August 2026',
        image: '',
        url: '/journal',
      },
      {
        title: 'Why we stopped designing in isolation',
        text: 'Static comps hide the decisions that matter. Moving to a working prototype earlier changed our review process.',
        category: 'Process',
        meta: '30 July 2026',
        image: '',
        url: '/journal',
      },
      {
        title: 'A type scale you can actually maintain',
        text: 'Six sizes, two weights, one ratio. What we use on every project and why it survives a handover.',
        category: 'Craft',
        meta: '14 July 2026',
        image: '',
        url: '/journal',
      },
    ],
    buttonLabel: 'Browse the journal',
    buttonUrl: '/journal',
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    field('columns', 'slider', 'Columns', 'layout', { min: 1, max: 3 }),
    repeater(
      'items',
      'Articles',
      [
        text('title', 'Title'),
        textarea('text', 'Excerpt'),
        text('category', 'Category'),
        text('meta', 'Date'),
        image('image', 'Image'),
        link('url', 'Link'),
      ],
      { itemLabel: 'Article' },
    ),
    { ...text('buttonLabel', 'Button label'), styleTarget: 'button' as const },
    link('buttonUrl', 'Button link'),
  ),
  component: function BlogAperture(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const columns = Math.min(Math.max(num(props.columns, 3), 1), 3)
    return (
      <SectionShell props={props} tone="default" className="ud-ap ud-ap-blog">
        <div className="ud-ap-blog__top">
          <ApHead props={props} />
          {str(props.buttonLabel) || edit ? (
            <ApButton href={str(props.buttonUrl, '#')} variant="outline" arrow>
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} as="span" placeholder="Browse all" />
            </ApButton>
          ) : null}
        </div>
        <div className="ud-ap-blog__grid" style={{ '--ap-cols': columns } as CSSProperties}>
          {rows.map((item, index) => (
            <article key={index} className="ud-ap-post">
              <a className="ud-ap-post__figure" href={str(item.url, '#')}>
                <Media
                  src={item.image}
                  alt={str(item.title)}
                  ratio="landscape"
                  className="ud-ap-post__img"
                  edit={edit}
                  path={['items', index, 'image']}
                />
              </a>
              <div className="ud-ap-post__meta">
                <EditableText
                  edit={edit}
                  path={['items', index, 'category']}
                  value={str(item.category)}
                  as="span"
                  className="ud-ap-post__tag"
                  placeholder="Category"
                />
                <EditableText
                  edit={edit}
                  path={['items', index, 'meta']}
                  value={str(item.meta)}
                  as="span"
                  className="ud-ap-post__date"
                  placeholder="Date"
                />
              </div>
              <h3 className="ud-ap-post__title">
                <a href={str(item.url, '#')}>
                  <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="span" placeholder="Title" />
                </a>
              </h3>
              <SafeText
                value={str(item.text)}
                className="ud-ap-post__text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="Excerpt"
              />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- cta.aperture */

export const ctaAperture = defineBlock({
  type: 'cta.aperture',
  version: 1,
  category: 'cta',
  label: 'Aperture closing call to action',
  icon: 'Megaphone',
  defaultProps: {
    eyebrow: '',
    heading: 'Have a project in mind? Tell us about it.',
    description: 'One call, no deck, no obligation — we will tell you honestly whether we are the right studio for it.',
    buttonLabel: "Let's talk",
    buttonUrl: '/contact',
    secondaryLabel: 'See our work',
    secondaryUrl: '/work',
    tone: 'ink',
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    ...buttonFields,
    select(
      'tone',
      'Band',
      [
        ['ink', 'Ink black'],
        ['tint', 'Cool tint'],
        ['accent', 'Coral'],
      ],
      'design',
    ),
  ),
  component: function CtaAperture(props) {
    const tone = str(props.tone, 'ink')
    return (
      <SectionShell
        props={props}
        tone="default"
        align="center"
        className={cx('ud-ap', 'ud-ap-cta', `ud-ap-cta--${tone}`)}
      >
        <ApHead props={props} align="center" size="lg" />
        <ApButtons props={props} primary={tone === 'ink' ? 'light' : 'dark'} />
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- contact.aperture */

export const contactAperture = defineBlock({
  type: 'contact.aperture',
  version: 1,
  category: 'form',
  label: 'Aperture contact form',
  icon: 'Mail',
  defaultProps: {
    eyebrow: 'Contact',
    heading: 'Tell us what you are working on',
    description: 'The more you can share up front, the more useful our first reply will be.',
    details: [
      { icon: 'phone', label: 'Phone', value: '+1 (555) 240 8890' },
      { icon: 'mail', label: 'Email', value: 'studio@aperture.example' },
      { icon: 'map-pin', label: 'Studio', value: '18 Wexford Lane, Portland, OR 97209' },
    ],
    formId: '',
    buttonLabel: 'Send enquiry',
    fineprint: 'We reply to every enquiry within one working day.',
    animation: 'fade-up',
    animationTrigger: 'load',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater('details', 'Contact details', [icon('icon', 'Icon'), text('label', 'Label'), text('value', 'Value')], {
      itemLabel: 'Detail',
    }),
    text('formId', 'Form ID'),
    text('buttonLabel', 'Submit label'),
    text('fineprint', 'Fine print'),
  ),
  component: function ContactAperture(props) {
    const edit = editOf(props)
    const details = items(props.details, [])
    return (
      <SectionShell props={props} tone="default" className="ud-ap ud-ap-contact">
        <div className="ud-ap-contact__grid">
          <div className="ud-ap-contact__copy">
            <ApHead props={props} />
            {details.length ? (
              <ul className="ud-ap-contact__details">
                {details.map((item, index) => (
                  <li key={index}>
                    <span className="ud-ap-contact__icon" aria-hidden>
                      <Icon name={str(item.icon, 'mail')} size={16} />
                    </span>
                    <span className="ud-ap-contact__pair">
                      <EditableText
                        edit={edit}
                        path={['details', index, 'label']}
                        value={str(item.label)}
                        as="span"
                        className="ud-ap-contact__label"
                        placeholder="Label"
                      />
                      <EditableText
                        edit={edit}
                        path={['details', index, 'value']}
                        value={str(item.value)}
                        as="span"
                        className="ud-ap-contact__value"
                        placeholder="Value"
                      />
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="ud-ap-contact__panel">
            <PublicForm
              formId={str(props.formId)}
              submitLabel={str(props.buttonLabel, 'Send enquiry')}
              edit={edit}
              submitLabelPath={['buttonLabel']}
            />
            {str(props.fineprint) || edit ? (
              <EditableText
                edit={edit}
                path={['fineprint']}
                value={str(props.fineprint)}
                as="p"
                className="ud-ap-contact__fine"
                placeholder="Fine print"
              />
            ) : null}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------- richtext.aperture */

export const richtextAperture = defineBlock({
  type: 'richtext.aperture',
  version: 1,
  category: 'content',
  label: 'Aperture long-form text',
  icon: 'FileText',
  defaultProps: {
    eyebrow: '',
    heading: '',
    body: '<p>Long-form copy for policy, terms and studio notes. Headings, lists and links all inherit the template type scale.</p>',
    animation: 'fade-up',
  },
  schema: schema(eyebrowField, headingField, richtext('body', 'Body')),
  component: function RichtextAperture(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" className="ud-ap ud-ap-rich">
        <ApHead props={props} />
        <EditableRich edit={edit} path={['body']} html={str(props.body)} className="ud-ap-rich__body" />
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- footer.aperture */

export const footerAperture = defineBlock({
  type: 'footer.aperture',
  version: 1,
  category: 'footer',
  label: 'Aperture footer',
  icon: 'Layout',
  defaultProps: {
    logo: 'Aperture',
    logoImage: '',
    logoUrl: '/',
    newsletterHeading: 'Studio notes, once a month. Nothing else.',
    newsletterLabel: 'Subscribe',
    formId: '',
    columns: [
      {
        title: 'Studio',
        links: [
          { label: 'About', url: '/about' },
          { label: 'Our people', url: '/team' },
          { label: 'Journal', url: '/journal' },
          { label: 'Contact', url: '/contact' },
        ],
      },
      {
        title: 'Services',
        links: [
          { label: 'Brand identity', url: '/services' },
          { label: 'Web design', url: '/services' },
          { label: 'Development', url: '/services' },
          { label: 'Product design', url: '/services' },
        ],
      },
      {
        title: 'Work',
        links: [
          { label: 'Selected projects', url: '/work' },
          { label: 'Case studies', url: '/work' },
          { label: 'Pricing', url: '/pricing' },
        ],
      },
    ],
    contactHeading: 'Get in touch',
    details: [
      { icon: 'phone', value: '+1 (555) 240 8890' },
      { icon: 'mail', value: 'studio@aperture.example' },
      { icon: 'map-pin', value: '18 Wexford Lane, Portland, OR 97209' },
    ],
    social: [
      { icon: 'twitter', url: '#' },
      { icon: 'instagram', url: '#' },
      { icon: 'linkedin', url: '#' },
    ],
    copyright: '© Aperture Studio',
    animation: 'fade-up',
  },
  schema: schema(
    ...logoFields,
    text('newsletterHeading', 'Newsletter heading'),
    text('newsletterLabel', 'Newsletter button'),
    text('formId', 'Newsletter form ID'),
    repeater(
      'columns',
      'Link columns',
      [text('title', 'Title'), repeater('links', 'Links', [text('label', 'Label'), link('url', 'Link')], { itemLabel: 'Link' })],
      { itemLabel: 'Column' },
    ),
    text('contactHeading', 'Contact heading'),
    repeater('details', 'Contact details', [icon('icon', 'Icon'), text('value', 'Value')], { itemLabel: 'Detail' }),
    repeater('social', 'Social links', [icon('icon', 'Icon'), link('url', 'Link')], { itemLabel: 'Link' }),
    text('copyright', 'Copyright'),
  ),
  component: function FooterAperture(props) {
    const edit = editOf(props)
    const anim = animationOf(props)
    const columns = items(props.columns, [])
    const details = items(props.details, [])
    const social = items(props.social, [])
    return (
      <footer
        className={cx('ud-ap', 'ud-ap-footer', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container">
          {str(props.newsletterHeading) || edit ? (
            <div className="ud-ap-footer__news">
              <EditableText
                edit={edit}
                path={['newsletterHeading']}
                value={str(props.newsletterHeading)}
                as="h2"
                className="ud-ap-footer__newshead"
                placeholder="Newsletter heading"
              />
              <div className="ud-ap-footer__newsform">
                <PublicForm
                  formId={str(props.formId)}
                  layout="inline"
                  submitLabel={str(props.newsletterLabel, 'Subscribe')}
                  edit={edit}
                  submitLabelPath={['newsletterLabel']}
                />
              </div>
            </div>
          ) : null}

          <div className="ud-ap-footer__grid">
            <div className="ud-ap-footer__brand">
              <Logo props={props} light />
              {details.length ? (
                <ul className="ud-ap-footer__details">
                  {str(props.contactHeading) || edit ? (
                    <li className="ud-ap-footer__detailhead">
                      <EditableText
                        edit={edit}
                        path={['contactHeading']}
                        value={str(props.contactHeading)}
                        as="span"
                        placeholder="Get in touch"
                      />
                    </li>
                  ) : null}
                  {details.map((item, index) => (
                    <li key={index}>
                      <span className="ud-ap-footer__icon" aria-hidden>
                        <Icon name={str(item.icon, 'mail')} size={15} />
                      </span>
                      <EditableText
                        edit={edit}
                        path={['details', index, 'value']}
                        value={str(item.value)}
                        as="span"
                        placeholder="Detail"
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {columns.map((column, index) => (
              <div key={index} className="ud-ap-footer__col">
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
                          placeholder="Link"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="ud-ap-footer__base">
            <EditableText
              edit={edit}
              path={['copyright']}
              value={str(props.copyright)}
              as="p"
              className="ud-ap-footer__copy"
              placeholder="© Studio"
            />
            {social.length ? (
              <div className="ud-ap-footer__social">
                {social.map((item, index) => (
                  <a key={index} href={str(item.url, '#')} aria-label={str(item.icon, 'Social link')}>
                    <Icon name={str(item.icon, 'link')} size={16} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </footer>
    )
  },
})
