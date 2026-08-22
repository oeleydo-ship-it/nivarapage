/**
 * Vantage.OS — a calm platform / IT-services template family.
 *
 * Visual language: Playfair Display headlines on near-white, monospace micro
 * labels with rule marks, a single royal-blue accent, deep-navy impact bands and
 * a watercolor signature panel above the footer.
 *
 * Every string, image, list item and colour is exposed through `schema()`, which
 * appends the shared design / typography / background / spacing controls, so all
 * of it is editable both on canvas and from the side panel.
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
  sectionVars,
  str,
  type Props,
} from '../primitives'
import { PublicForm } from '../public-form'
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
  stickyField,
  text,
  textarea,
  toggle,
} from '../schema'
import { NavItem, Submenu, SubmenuCaret, hasSubmenu } from '../submenu'
import { defineBlock } from '../types'

/* ------------------------------------------------------------------ helpers */

function nxLinks(props: Props) {
  return items(props.links, []).map((item) => ({
    label: str(item.label),
    url: str(item.url) || str(item.href) || '#',
    children: item.children,
  }))
}

function pad(index: number): string {
  return String(index + 1).padStart(2, '0')
}

/** Shared rail fields: the `01 / 06 ——— ABOUT` marker above most sections. */
const railFields = [
  text('railIndex', 'Rail index', { help: 'Small counter above the section, e.g. 01.' }),
  text('railTotal', 'Rail total'),
  text('railLabel', 'Rail label'),
]

function railDefaults(index: string, total: string, label: string) {
  return { railIndex: index, railTotal: total, railLabel: label }
}

/** `01 / 06 ——— ABOUT` marker. Hidden on published pages when fully blank. */
function Rail({ props }: { props: Props }) {
  const edit = editOf(props)
  const index = str(props.railIndex)
  const total = str(props.railTotal)
  const label = str(props.railLabel)
  if (!edit && !index && !total && !label) return null
  return (
    <div className="ud-nx-rail">
      <EditableText edit={edit} path={['railIndex']} value={index} as="span" placeholder="01" />
      <span className="ud-nx-rail__slash">/</span>
      <EditableText edit={edit} path={['railTotal']} value={total} as="span" placeholder="06" />
      <span className="ud-nx-rail__dash" aria-hidden />
      <EditableText edit={edit} path={['railLabel']} value={label} as="span" className="ud-nx-rail__label" placeholder="SECTION" />
    </div>
  )
}

/** Eyebrow + serif heading + lead paragraph. */
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
  const heading = str(props.heading)
  const description = str(props.description)
  if (!edit && !eyebrow && !heading && !description) return null
  return (
    <div className={cx('ud-nx-head', align === 'center' && 'ud-nx-head--center')}>
      {eyebrow || edit ? (
        <EditableText
          edit={edit}
          path={['eyebrow']}
          value={eyebrow}
          as="p"
          className="ud-nx-eyebrow ud-nx-eyebrow--dashed"
          placeholder="Eyebrow"
        />
      ) : null}
      {heading || edit ? (
        <EditableText
          edit={edit}
          path={['heading']}
          value={heading}
          as={as}
          className={as === 'h1' ? 'ud-nx-display' : 'ud-nx-title'}
          placeholder="Heading"
        />
      ) : null}
      {description || edit ? (
        <SafeText value={description} className="ud-nx-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
      ) : null}
    </div>
  )
}

/** Blue rectangle button. */
function NxButton({
  href,
  children,
  variant = 'solid',
}: {
  href: string
  children: ReactNode
  variant?: 'solid' | 'ghost' | 'dark'
}) {
  return (
    <a className={cx('ud-nx-btn', variant !== 'solid' && `ud-nx-btn--${variant}`)} href={href || '#'}>
      {children}
    </a>
  )
}

/** Circular icon + label link — the "Book a Demo" / "Learn More" affordance. */
function RoundAction({
  props,
  labelKey = 'buttonLabel',
  urlKey = 'buttonUrl',
  iconName = 'arrow',
  placeholder = 'Learn more',
}: {
  props: Props
  labelKey?: string
  urlKey?: string
  iconName?: string
  placeholder?: string
}) {
  const edit = editOf(props)
  const label = str(props[labelKey])
  if (!label && !edit) return null
  return (
    <a className="ud-nx-round" href={str(props[urlKey], '#')}>
      <span className="ud-nx-round__dot" aria-hidden>
        <Icon name={str(props.buttonIcon, iconName)} size={15} />
      </span>
      <EditableText edit={edit} path={[labelKey]} value={label} as="span" placeholder={placeholder} />
    </a>
  )
}

/** Decorative corner brackets used on the darker panels. */
function Corners() {
  return (
    <span className="ud-nx-corners" aria-hidden>
      <i />
      <i />
      <i />
      <i />
    </span>
  )
}

const defaultNavLinks = [
  { label: 'Home', url: '/' },
  { label: 'Features', url: '/features' },
  { label: 'Pricing', url: '/pricing' },
  { label: 'Contact', url: '/contact' },
]

/* ------------------------------------------------------------ navbar.vantage */

export const navbarVantage = defineBlock({
  type: 'navbar.vantage',
  version: 1,
  category: 'navigation',
  label: 'Vantage navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Vantage.OS',
    logoUrl: '/',
    links: defaultNavLinks,
    secondaryLabel: 'Sign in',
    secondaryUrl: '/contact',
    buttonLabel: 'Launch Console',
    buttonUrl: '/pricing',
    buttonIcon: 'arrow',
    sticky: true,
    animation: 'fade-down',
    animationTrigger: 'load',
  },
  schema: schema(
    text('logo', 'Wordmark'),
    link('logoUrl', 'Wordmark link'),
    navLinksField('links', 'Links'),
    ...ctaFields,
    icon('buttonIcon', 'Button icon'),
    stickyField,
  ),
  component: function NavbarVantage(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    const links = nxLinks(props)
    const anim = animationOf(props)
    return (
      <header
        className={cx('ud-nx', 'ud-nx-nav', bool(props.sticky, true) && 'ud-nx-nav--sticky', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container ud-nx-nav__bar">
          <a className="ud-nx-wordmark" href={str(props.logoUrl, '/')}>
            <EditableText edit={edit} path={['logo']} value={str(props.logo, 'Vantage.OS')} placeholder="Brand" />
          </a>
          <nav className={cx('ud-nx-nav__links', open && 'is-open')} aria-label="Primary">
            {links.map((item, index) => (
              <NavItem key={`${item.url}-${index}`} item={item}>
                <a href={item.url} className="ud-nx-nav__link">
                  <EditableText edit={edit} path={['links', index, 'label']} value={item.label} placeholder="Link" />
                  <SubmenuCaret show={hasSubmenu(item)} />
                </a>
                <Submenu props={props} item={item} index={index} />
              </NavItem>
            ))}
          </nav>
          <div className="ud-nx-nav__actions">
            {str(props.secondaryLabel) || edit ? (
              <a className="ud-nx-nav__signin" href={str(props.secondaryUrl, '#')}>
                <EditableText edit={edit} path={['secondaryLabel']} value={str(props.secondaryLabel)} placeholder="Sign in" />
              </a>
            ) : null}
            {str(props.buttonLabel) || edit ? (
              <NxButton href={str(props.buttonUrl, '#')}>
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Launch Console" />
                <Icon name={str(props.buttonIcon, 'arrow')} size={14} />
              </NxButton>
            ) : null}
          </div>
          <button type="button" className="ud-nx-nav__toggle" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>
            <Icon name={open ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </header>
    )
  },
})

/* -------------------------------------------------------------- hero.vantage */

export const heroVantage = defineBlock({
  type: 'hero.vantage',
  version: 1,
  category: 'hero',
  label: 'Vantage home hero',
  icon: 'Sparkles',
  defaultProps: {
    wordmark: 'Vantage.OS',
    scrollLabel: 'Scroll down',
    eyebrow: 'Intelligence layer',
    heading: 'Your vantage on a calmer stack. One control plane, shaped to your operation.',
    buttonLabel: 'Book a demo',
    buttonUrl: '/contact',
    buttonIcon: 'play',
    // Empty by default so the soft watercolour wash shows through; any uploaded
    // photo sits under a white scrim so the overlaid copy stays readable.
    image: '',
    chipTitle: 'Live signal',
    chipMeta: 'v3.1 — EU',
    cornerLabel: 'REL 03 / 24',
    animation: 'fade',
    animationTrigger: 'load',
  },
  schema: schema(
    text('wordmark', 'Corner wordmark'),
    text('scrollLabel', 'Scroll label'),
    eyebrowField,
    headingField,
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    icon('buttonIcon', 'Button icon'),
    image('image', 'Hero image'),
    text('chipTitle', 'Floating chip title'),
    text('chipMeta', 'Floating chip meta'),
    text('cornerLabel', 'Corner label'),
  ),
  component: function HeroVantage(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-nx ud-nx-hero" tone="default">
        <div className="ud-nx-hero__top">
          <div className="ud-nx-hero__scroll">
            <EditableText edit={edit} path={['scrollLabel']} value={str(props.scrollLabel)} as="span" placeholder="Scroll down" />
            <span className="ud-nx-hero__scroll-line" aria-hidden />
          </div>
          <EditableText
            edit={edit}
            path={['wordmark']}
            value={str(props.wordmark, 'Vantage.OS')}
            as="p"
            className="ud-nx-hero__wordmark"
            placeholder="Wordmark"
          />
        </div>
        <div className="ud-nx-hero__stage">
          <Media src={props.image} alt="" ratio="21 / 9" className="ud-nx-hero__media" edit={edit} path={['image']}>
            <span className="ud-nx-hero__scrim" aria-hidden />
          </Media>
          <div className="ud-nx-hero__chip">
            <span className="ud-nx-hero__chip-dot" aria-hidden>
              <Icon name="play" size={12} />
            </span>
            <span className="ud-nx-hero__chip-copy">
              <EditableText edit={edit} path={['chipTitle']} value={str(props.chipTitle)} as="strong" placeholder="Live signal" />
              <EditableText edit={edit} path={['chipMeta']} value={str(props.chipMeta)} as="span" placeholder="v3.1" />
            </span>
          </div>
          <div className="ud-nx-hero__copy">
            {str(props.eyebrow) || edit ? (
              <EditableText
                edit={edit}
                path={['eyebrow']}
                value={str(props.eyebrow)}
                as="p"
                className="ud-nx-eyebrow ud-nx-eyebrow--dashed"
                placeholder="Eyebrow"
              />
            ) : null}
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h1" className="ud-nx-display" placeholder="Headline" />
            <RoundAction props={props} iconName="play" placeholder="Book a demo" />
          </div>
          <div className="ud-nx-hero__corner">
            <EditableText edit={edit} path={['cornerLabel']} value={str(props.cornerLabel)} as="span" placeholder="REL 03 / 24" />
            <span className="ud-nx-hero__corner-keys" aria-hidden>
              <i />
              <i />
              <i />
            </span>
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- about.vantage */

export const aboutVantage = defineBlock({
  type: 'about.vantage',
  version: 1,
  category: 'content',
  label: 'Vantage about + stats',
  icon: 'Layers',
  defaultProps: {
    ...railDefaults('01', '06', 'About'),
    description:
      'For nine years our distributed team has partnered with operations-led companies to build calm, dependable infrastructure. We pair deep platform expertise with quiet discipline — designing systems that scale without drama and teams that stay sharp. From first migration to steady state, every engagement is shaped by clarity, craft, and care for the people who depend on what we ship.',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1400&q=80',
    insetImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
    stats: [
      { value: '9+', label: 'Years' },
      { value: '180+', label: 'Clients' },
      { value: '31', label: 'Countries' },
    ],
    buttonLabel: 'Learn more',
    buttonUrl: '/features',
    buttonIcon: 'arrow',
    animation: 'fade-up',
  },
  schema: schema(
    ...railFields,
    descriptionField,
    image('image', 'Main image'),
    image('insetImage', 'Inset image'),
    repeater('stats', 'Stats', [text('value', 'Value'), text('label', 'Label')], { itemLabel: 'Stat' }),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    icon('buttonIcon', 'Button icon'),
  ),
  component: function AboutVantage(props) {
    const edit = editOf(props)
    const stats = items(props.stats, [])
    return (
      <SectionShell props={props} className="ud-nx ud-nx-about" tone="default">
        <Rail props={props} />
        <div className="ud-nx-about__grid">
          <div className="ud-nx-about__art">
            <Media src={props.image} alt="" ratio="4 / 3" className="ud-nx-about__main" edit={edit} path={['image']} />
            <Media src={props.insetImage} alt="" ratio="4 / 3" className="ud-nx-about__inset" edit={edit} path={['insetImage']} />
          </div>
          <div className="ud-nx-about__copy">
            <SafeText value={str(props.description)} className="ud-nx-body" edit={edit} path={['description']} placeholder="About copy" />
            <div className="ud-nx-about__stats">
              {stats.map((item, index) => (
                <div key={index} className="ud-nx-stat">
                  <EditableText
                    edit={edit}
                    path={['stats', index, 'value']}
                    value={str(item.value)}
                    as="p"
                    className="ud-nx-stat__value"
                    placeholder="12+"
                  />
                  <EditableText
                    edit={edit}
                    path={['stats', index, 'label']}
                    value={str(item.label)}
                    as="p"
                    className="ud-nx-stat__label"
                    placeholder="Years"
                  />
                </div>
              ))}
            </div>
            <RoundAction props={props} placeholder="Learn more" />
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- services.vantage */

export const servicesVantage = defineBlock({
  type: 'services.vantage',
  version: 1,
  category: 'services',
  label: 'Vantage service cards',
  icon: 'Layers',
  defaultProps: {
    ...railDefaults('02', '06', 'Services'),
    eyebrow: 'Our services',
    heading: 'Comprehensive systems, tailored to how you actually run.',
    items: [
      {
        title: 'Platform Engineering',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        url: '/features',
      },
      {
        title: 'Managed Operations',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
        url: '/features',
      },
      {
        title: 'Security & Compliance',
        image: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=800&q=80',
        url: '/features',
      },
      {
        title: 'Network Foundations',
        image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
        url: '/features',
      },
    ],
    buttonLabel: 'See more',
    buttonUrl: '/features',
    buttonIcon: 'arrow',
    animation: 'fade-up',
  },
  schema: schema(
    ...railFields,
    eyebrowField,
    headingField,
    repeater('items', 'Cards', [text('title', 'Title'), image('image', 'Image'), link('url', 'Link')], { itemLabel: 'Card' }),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    icon('buttonIcon', 'Button icon'),
  ),
  component: function ServicesVantage(props) {
    const edit = editOf(props)
    const cards = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-nx ud-nx-services" tone="surface">
        <Rail props={props} />
        <Head props={props} />
        <div className="ud-nx-services__grid">
          {cards.map((item, index) => (
            <a key={index} className="ud-nx-service" href={str(item.url, '#')}>
              <Media
                src={item.image}
                alt=""
                ratio="3 / 4"
                className="ud-nx-service__media"
                zoom
                edit={edit}
                path={['items', index, 'image']}
              />
              <p className="ud-nx-service__caption">
                <span className="ud-nx-service__num">{pad(index)}.</span>
                <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="span" placeholder="Service" />
              </p>
            </a>
          ))}
        </div>
        <div className="ud-nx-services__foot">
          <RoundAction props={props} placeholder="See more" />
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- stats.vantage */

export const statsVantage = defineBlock({
  type: 'stats.vantage',
  version: 1,
  category: 'features',
  label: 'Vantage impact band',
  icon: 'Chart',
  defaultProps: {
    ...railDefaults('03', '06', 'Impact'),
    eyebrow: 'By the numbers',
    heading: 'Quiet infrastructure, measurable outcomes.',
    items: [
      { value: '9+', title: 'Years of Practice', text: 'A steady record across regulated and high-traffic platforms.' },
      { value: '34%', title: 'Less Toil per Team', text: 'Streamlined operations and fewer hand-written runbooks.' },
      { value: '97%', title: 'Client Retention', text: 'Trusted by operations leads who stay for the long build.' },
      { value: '420+', title: 'Migrations Landed', text: 'Delivered without a weekend war room or a rollback.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    ...railFields,
    eyebrowField,
    headingField,
    repeater('items', 'Stats', [text('value', 'Value'), text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Stat' }),
  ),
  component: function StatsVantage(props) {
    const edit = editOf(props)
    const cards = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-nx ud-nx-dark ud-nx-impact" tone="dark">
        <Rail props={props} />
        <Head props={props} />
        <div className="ud-nx-impact__grid">
          {cards.map((item, index) => (
            <div key={index} className="ud-nx-impact__card">
              <Corners />
              <EditableText
                edit={edit}
                path={['items', index, 'value']}
                value={str(item.value)}
                as="p"
                className="ud-nx-impact__value"
                placeholder="6+"
              />
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-nx-impact__title"
                placeholder="Metric"
              />
              <SafeText
                value={str(item.text)}
                className="ud-nx-impact__text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="Describe this metric"
              />
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- journal.vantage */

export const journalVantage = defineBlock({
  type: 'journal.vantage',
  version: 1,
  category: 'blog',
  label: 'Vantage journal',
  icon: 'Book',
  defaultProps: {
    ...railDefaults('04', '06', 'Journal'),
    eyebrow: 'Insights',
    heading: 'Field notes & platform updates',
    linkLabel: 'See all articles',
    linkUrl: '/features',
    items: [
      {
        title: 'Migrating without a weekend war room',
        date: 'Jun 04, 2026',
        image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80',
        url: '#',
      },
      {
        title: 'Why runbooks should be rehearsed, not written',
        date: 'May 21, 2026',
        image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80',
        url: '#',
      },
      {
        title: 'The cost of noisy dashboards nobody reads',
        date: 'May 02, 2026',
        image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=80',
        url: '#',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    ...railFields,
    eyebrowField,
    headingField,
    text('linkLabel', 'Corner link label'),
    link('linkUrl', 'Corner link URL'),
    repeater('items', 'Posts', [text('title', 'Title'), text('date', 'Date'), image('image', 'Image'), link('url', 'Link')], {
      itemLabel: 'Post',
    }),
  ),
  component: function JournalVantage(props) {
    const edit = editOf(props)
    const posts = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-nx ud-nx-journal" tone="default">
        <Rail props={props} />
        <div className="ud-nx-journal__head">
          <Head props={props} />
          {str(props.linkLabel) || edit ? (
            <a className="ud-nx-journal__all" href={str(props.linkUrl, '#')}>
              <EditableText edit={edit} path={['linkLabel']} value={str(props.linkLabel)} as="span" placeholder="See all" />
            </a>
          ) : null}
        </div>
        <div className="ud-nx-journal__grid">
          {posts.map((item, index) => (
            <a key={index} className="ud-nx-post" href={str(item.url, '#')}>
              <Media src={item.image} alt="" ratio="4 / 3" className="ud-nx-post__media" zoom edit={edit} path={['items', index, 'image']} />
              <EditableText
                edit={edit}
                path={['items', index, 'date']}
                value={str(item.date)}
                as="p"
                className="ud-nx-post__date"
                placeholder="Jan 01, 2026"
              />
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-nx-post__title"
                placeholder="Article title"
              />
            </a>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- benefits.vantage */

export const benefitsVantage = defineBlock({
  type: 'benefits.vantage',
  version: 1,
  category: 'features',
  label: 'Vantage benefits split',
  icon: 'Shield',
  defaultProps: {
    ...railDefaults('05', '06', 'Why us'),
    eyebrow: 'Why partner with us',
    heading: 'Focus on your mission. Let us hold the platform.',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80',
    items: [
      {
        icon: 'cpu',
        title: 'Proven Engineering',
        text: 'Modern stacks, hardened defaults and reference architecture shaped by years of production duty.',
      },
      {
        icon: 'chart',
        title: 'Cost You Can Predict',
        text: 'Right-sized capacity, transparent commitments and ongoing optimisation reviews that compound into real savings.',
      },
      {
        icon: 'clock',
        title: 'Support That Stays Awake',
        text: 'A calm, follow-the-sun operations team with clear SLAs and observability built in from day one.',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    ...railFields,
    eyebrowField,
    headingField,
    image('image', 'Image'),
    repeater('items', 'Benefits', [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Benefit' }),
  ),
  component: function BenefitsVantage(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-nx ud-nx-benefits" tone="default">
        <Rail props={props} />
        <div className="ud-nx-benefits__grid">
          <Media src={props.image} alt="" ratio="4 / 5" className="ud-nx-benefits__media" edit={edit} path={['image']} />
          <div className="ud-nx-benefits__copy">
            <Head props={props} />
            <ul className="ud-nx-benefits__list">
              {list.map((item, index) => (
                <li key={index} className="ud-nx-benefit">
                  <span className="ud-nx-benefit__icon" aria-hidden>
                    <Icon name={str(item.icon, 'sparkles')} size={16} />
                  </span>
                  <div>
                    <EditableText
                      edit={edit}
                      path={['items', index, 'title']}
                      value={str(item.title)}
                      as="h3"
                      className="ud-nx-benefit__title"
                      placeholder="Benefit"
                    />
                    <SafeText
                      value={str(item.text)}
                      className="ud-nx-benefit__text"
                      edit={edit}
                      path={['items', index, 'text']}
                      placeholder="Describe this benefit"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ footer.vantage */

export const footerVantage = defineBlock({
  type: 'footer.vantage',
  version: 1,
  category: 'footer',
  label: 'Vantage footer',
  icon: 'Layers',
  defaultProps: {
    signature: 'Be.Vantage',
    signatureImage: '',
    columns: [
      { title: '', links: [{ label: 'Home', url: '/' }, { label: 'About', url: '/features' }, { label: 'Book a Service', url: '/contact' }, { label: 'Journal', url: '/features' }] },
      { title: '', links: [{ label: 'Terms & Conditions', url: '#' }, { label: 'Refund Policy', url: '#' }, { label: 'Privacy Policy', url: '#' }, { label: 'Accessibility Statement', url: '#' }] },
      { title: '', links: [{ label: 'Facebook', url: '#' }, { label: 'LinkedIn', url: '#' }, { label: 'X', url: '#' }] },
    ],
    addressTitle: '',
    address: '2400 Harbour Lane, Suite 12\nRotterdam, 3011 EA\nNetherlands',
    email: 'hello@vantageos.com',
    phone: '+31 10 555 0142',
    copyright: '© 2026 Vantage.OS',
    tagline: 'Calm intelligence, by design.',
    animation: 'fade-up',
  },
  schema: schema(
    text('signature', 'Signature wordmark'),
    image('signatureImage', 'Signature panel image'),
    repeater(
      'columns',
      'Link columns',
      [text('title', 'Column title'), repeater('links', 'Links', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Link' })],
      { itemLabel: 'Column' },
    ),
    text('addressTitle', 'Address title'),
    textarea('address', 'Address'),
    text('email', 'Email'),
    text('phone', 'Phone'),
    text('copyright', 'Copyright'),
    text('tagline', 'Tagline'),
  ),
  component: function FooterVantage(props) {
    const edit = editOf(props)
    const columns = items(props.columns, [])
    const anim = animationOf(props)
    return (
      <footer
        className={cx('ud-nx', 'ud-nx-footer', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container">
          <div className="ud-nx-footer__panel">
            {str(props.signatureImage) ? (
              <img className="ud-nx-footer__panel-image" src={str(props.signatureImage)} alt="" loading="lazy" />
            ) : null}
            <EditableText
              edit={edit}
              path={['signature']}
              value={str(props.signature, 'Be.Vantage')}
              as="p"
              className="ud-nx-footer__signature"
              placeholder="Signature"
            />
          </div>
          <div className="ud-nx-footer__grid">
            {columns.map((column, index) => (
              <div key={index} className="ud-nx-footer__col">
                {str(column.title) || edit ? (
                  <EditableText
                    edit={edit}
                    path={['columns', index, 'title']}
                    value={str(column.title)}
                    as="p"
                    className="ud-nx-footer__col-title"
                    placeholder="Column"
                  />
                ) : null}
                {items(column.links, []).map((item, linkIndex) => (
                  <a key={linkIndex} className="ud-nx-footer__link" href={str(item.url, '#')}>
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
            <div className="ud-nx-footer__col">
              {str(props.addressTitle) || edit ? (
                <EditableText
                  edit={edit}
                  path={['addressTitle']}
                  value={str(props.addressTitle)}
                  as="p"
                  className="ud-nx-footer__col-title"
                  placeholder="Address"
                />
              ) : null}
              <SafeText value={str(props.address)} className="ud-nx-footer__address" edit={edit} path={['address']} placeholder="Street, city" />
            </div>
            <div className="ud-nx-footer__col ud-nx-footer__col--contact">
              <a className="ud-nx-footer__link" href={`mailto:${str(props.email, 'hello@example.com')}`}>
                <EditableText edit={edit} path={['email']} value={str(props.email)} as="span" placeholder="Email" />
              </a>
              <a className="ud-nx-footer__link" href={`tel:${str(props.phone).replace(/\s+/g, '')}`}>
                <EditableText edit={edit} path={['phone']} value={str(props.phone)} as="span" placeholder="Phone" />
              </a>
              <EditableText
                edit={edit}
                path={['copyright']}
                value={str(props.copyright)}
                as="p"
                className="ud-nx-footer__fine"
                placeholder="© 2026"
              />
              <EditableText
                edit={edit}
                path={['tagline']}
                value={str(props.tagline)}
                as="p"
                className="ud-nx-footer__fine"
                placeholder="Tagline"
              />
            </div>
          </div>
        </div>
      </footer>
    )
  },
})

/* ---------------------------------------------------------- pagehero.vantage */

export const pageHeroVantage = defineBlock({
  type: 'pagehero.vantage',
  version: 1,
  category: 'hero',
  label: 'Vantage page hero',
  icon: 'Sparkles',
  defaultProps: {
    railIndex: '',
    railTotal: '',
    breadcrumb: 'VANTAGE.OS / FEATURES',
    version: 'V3.1',
    eyebrow: 'Features',
    heading: 'Everything you need to run a calm platform.',
    description:
      'A focused set of capabilities — observability, automation, security and developer ergonomics — engineered to keep teams shipping without drama.',
    pills: [
      { label: '6 pillars' },
      { label: '40+ integrations' },
      { label: 'One API' },
    ],
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80',
    imageLabel: 'ALL SYSTEMS — NOMINAL',
    chipTitle: '41 capabilities',
    chipMeta: 'Vantage.OS',
    chipIcon: 'layers',
    watermark: '',
    animation: 'fade',
    animationTrigger: 'load',
  },
  schema: schema(
    text('breadcrumb', 'Breadcrumb'),
    text('version', 'Version tag'),
    eyebrowField,
    headingField,
    descriptionField,
    repeater('pills', 'Pills', [text('label', 'Label')], { itemLabel: 'Pill' }),
    image('image', 'Image'),
    text('imageLabel', 'Image label'),
    text('chipTitle', 'Chip title'),
    text('chipMeta', 'Chip meta'),
    icon('chipIcon', 'Chip icon'),
    text('watermark', 'Watermark letter'),
  ),
  component: function PageHeroVantage(props) {
    const edit = editOf(props)
    const pills = items(props.pills, [])
    return (
      <SectionShell props={props} className="ud-nx ud-nx-phero" tone="default">
        {str(props.watermark) || edit ? (
          <span className="ud-nx-watermark" aria-hidden>
            <EditableText edit={edit} path={['watermark']} value={str(props.watermark)} as="span" placeholder="A" />
          </span>
        ) : null}
        <div className="ud-nx-phero__crumb">
          <span className="ud-nx-rail__dash" aria-hidden />
          <EditableText edit={edit} path={['breadcrumb']} value={str(props.breadcrumb)} as="span" placeholder="BRAND / PAGE" />
          <EditableText edit={edit} path={['version']} value={str(props.version)} as="span" className="ud-nx-phero__version" placeholder="V1.0" />
        </div>
        <div className="ud-nx-phero__grid">
          <div className="ud-nx-phero__copy">
            <Head props={props} as="h1" />
            {pills.length || edit ? (
              <div className="ud-nx-phero__pills">
                {pills.map((item, index) => (
                  <span key={index} className="ud-nx-pill">
                    <span className="ud-nx-pill__dot" aria-hidden />
                    <EditableText edit={edit} path={['pills', index, 'label']} value={str(item.label)} as="span" placeholder="Pill" />
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="ud-nx-phero__art">
            <Media src={props.image} alt="" ratio="4 / 3" className="ud-nx-phero__media" edit={edit} path={['image']} />
            {str(props.imageLabel) || edit ? (
              <EditableText
                edit={edit}
                path={['imageLabel']}
                value={str(props.imageLabel)}
                as="span"
                className="ud-nx-phero__tag"
                placeholder="LABEL"
              />
            ) : null}
            <div className="ud-nx-phero__chip">
              <span className="ud-nx-phero__chip-dot" aria-hidden>
                <Icon name={str(props.chipIcon, 'layers')} size={13} />
              </span>
              <span className="ud-nx-hero__chip-copy">
                <EditableText edit={edit} path={['chipTitle']} value={str(props.chipTitle)} as="strong" placeholder="Chip title" />
                <EditableText edit={edit} path={['chipMeta']} value={str(props.chipMeta)} as="span" placeholder="Chip meta" />
              </span>
            </div>
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- pillars.vantage */

export const pillarsVantage = defineBlock({
  type: 'pillars.vantage',
  version: 1,
  category: 'features',
  label: 'Vantage pillars grid',
  icon: 'Layers',
  defaultProps: {
    ...railDefaults('01', '05', 'Pillars'),
    eyebrow: 'Core capabilities',
    heading: 'Six pillars that quietly do the heavy lifting.',
    badgeLabel: 'Pillars',
    badgeMeta: '6 of 6',
    badgeIcon: 'layers',
    items: [
      {
        icon: 'chart',
        title: 'Unified Observability',
        text: 'Logs, metrics and traces from every service stitched into one calm timeline you can actually read.',
      },
      {
        icon: 'zap',
        title: 'Automation Engine',
        text: 'Composable runbooks that turn 3am incidents into rehearsed, predictable recovery — no copy-pasted shell scripts.',
      },
      {
        icon: 'shield',
        title: 'Zero-Trust Security',
        text: 'Identity-aware policies, secret rotation and continuous posture checks collapsed to a default, not a project.',
      },
      {
        icon: 'cloud',
        title: 'Multi-Cloud Control',
        text: 'AWS, GCP and on-prem fleets governed under one operating layer with consistent policy and cost guardrails.',
      },
      {
        icon: 'code',
        title: 'Developer Ergonomics',
        text: 'Golden paths, preview environments and one-command rollbacks designed to keep teams in flow.',
      },
      {
        icon: 'trending-up',
        title: 'Cost Intelligence',
        text: 'Real-time spend, anomaly alerts and ownership signals — so finance and engineering finally speak one language.',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    ...railFields,
    eyebrowField,
    headingField,
    text('badgeLabel', 'Badge label'),
    text('badgeMeta', 'Badge meta'),
    icon('badgeIcon', 'Badge icon'),
    repeater('items', 'Pillars', [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Pillar' }),
  ),
  component: function PillarsVantage(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-nx ud-nx-pillars" tone="default">
        <Rail props={props} />
        <div className="ud-nx-pillars__head">
          <Head props={props} />
          <div className="ud-nx-badge">
            <span className="ud-nx-badge__dot" aria-hidden>
              <Icon name={str(props.badgeIcon, 'layers')} size={14} />
            </span>
            <span className="ud-nx-hero__chip-copy">
              <EditableText edit={edit} path={['badgeMeta']} value={str(props.badgeMeta)} as="strong" placeholder="6 of 6" />
              <EditableText edit={edit} path={['badgeLabel']} value={str(props.badgeLabel)} as="span" placeholder="Pillars" />
            </span>
          </div>
        </div>
        <div className="ud-nx-pillars__panel">
          {list.map((item, index) => (
            <div key={index} className="ud-nx-pillar">
              <div className="ud-nx-pillar__top">
                <span className="ud-nx-pillar__icon" aria-hidden>
                  <Icon name={str(item.icon, 'sparkles')} size={16} />
                </span>
                <span className="ud-nx-pillar__num">{pad(index)}</span>
              </div>
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-nx-pillar__title"
                placeholder="Pillar"
              />
              <SafeText
                value={str(item.text)}
                className="ud-nx-pillar__text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="Describe this pillar"
              />
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- split.vantage */

export const splitVantage = defineBlock({
  type: 'split.vantage',
  version: 1,
  category: 'content',
  label: 'Vantage image + bullets',
  icon: 'Layers',
  defaultProps: {
    ...railDefaults('02', '05', 'Deep dive'),
    eyebrow: 'Observability',
    heading: 'See every signal — without drowning in dashboards.',
    description: 'A single, query-friendly plane that correlates logs, traces and golden metrics. Alerts arrive context-rich, not noise-heavy.',
    bullets: 'Auto-instrumented services across Node, Go, Python and JVM\nAdaptive sampling that keeps high-value traces and thins the rest\nService maps that update themselves as architecture changes',
    image: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=1200&q=80',
    imageLabel: 'OBSERVABILITY',
    reverse: false,
    animation: 'fade-up',
  },
  schema: schema(
    ...railFields,
    eyebrowField,
    headingField,
    descriptionField,
    textarea('bullets', 'Bullets', { help: 'One per line.' }),
    image('image', 'Image'),
    text('imageLabel', 'Image label'),
    toggle('reverse', 'Image on the right', 'layout'),
  ),
  component: function SplitVantage(props) {
    const edit = editOf(props)
    const bullets = lines(props.bullets, [])
    return (
      <SectionShell props={props} className={cx('ud-nx', 'ud-nx-split', bool(props.reverse) && 'ud-nx-split--reverse')} tone="default">
        <Rail props={props} />
        <div className="ud-nx-split__grid">
          <div className="ud-nx-split__art">
            <Media src={props.image} alt="" ratio="4 / 3" className="ud-nx-split__media" edit={edit} path={['image']} />
            {str(props.imageLabel) || edit ? (
              <EditableText
                edit={edit}
                path={['imageLabel']}
                value={str(props.imageLabel)}
                as="span"
                className="ud-nx-split__tag"
                placeholder="LABEL"
              />
            ) : null}
          </div>
          <div className="ud-nx-split__copy">
            <Head props={props} />
            {bullets.length || edit ? (
              <ul className="ud-nx-checks">
                {bullets.map((value, index) => (
                  <li key={index}>
                    <Icon name="check" size={14} />
                    <EditableText
                      edit={edit}
                      path={['bullets']}
                      value={value}
                      as="span"
                      placeholder="Bullet"
                      transform={(next) => bullets.map((line, position) => (position === index ? next : line)).join('\n')}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- steps.vantage */

export const stepsVantage = defineBlock({
  type: 'steps.vantage',
  version: 1,
  category: 'content',
  label: 'Vantage step timeline',
  icon: 'Target',
  defaultProps: {
    ...railDefaults('03', '05', 'Flow'),
    eyebrow: '',
    heading: '',
    items: [
      { title: 'Connect', text: 'Plug into your cloud accounts, repos and identity provider. No agents to wrangle, no day-long setup.' },
      { title: 'Map', text: 'Vantage.OS discovers services, dependencies and ownership signals to render a ruling picture of your platform.' },
      { title: 'Govern', text: 'Apply policies, budgets and SLOs as code. Guardrails ship with sensible defaults — opt out, not in.' },
      { title: 'Operate', text: 'Run incidents, releases and rollbacks from one keyboard-first surface that respects your engineers time.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    ...railFields,
    eyebrowField,
    headingField,
    repeater('items', 'Steps', [text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Step' }),
  ),
  component: function StepsVantage(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-nx ud-nx-dark ud-nx-steps" tone="dark">
        <Rail props={props} />
        <Head props={props} />
        <ol className="ud-nx-steps__list">
          {list.map((item, index) => (
            <li key={index} className="ud-nx-step">
              <span className="ud-nx-step__num">{pad(index)}</span>
              <span className="ud-nx-step__node" aria-hidden />
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-nx-step__title"
                placeholder="Step"
              />
              <SafeText
                value={str(item.text)}
                className="ud-nx-step__text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="Describe this step"
              />
            </li>
          ))}
        </ol>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------ integrations.vantage */

export const integrationsVantage = defineBlock({
  type: 'integrations.vantage',
  version: 1,
  category: 'gallery',
  label: 'Vantage integrations',
  icon: 'Globe',
  defaultProps: {
    ...railDefaults('04', '05', 'Stack'),
    eyebrow: 'Integrations',
    heading: 'Built to live where your stack already lives.',
    watermark: '',
    items: [
      { icon: 'cloud', label: 'AWS' },
      { icon: 'globe', label: 'Google Cloud' },
      { icon: 'code', label: 'GitHub' },
      { icon: 'layers', label: 'Kubernetes' },
      { icon: 'message', label: 'Slack' },
      { icon: 'zap', label: 'PagerDuty' },
      { icon: 'database', label: 'Datadog' },
      { icon: 'lock', label: 'Okta' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    ...railFields,
    eyebrowField,
    headingField,
    text('watermark', 'Watermark letter'),
    repeater('items', 'Integrations', [icon('icon', 'Icon'), text('label', 'Label')], { itemLabel: 'Integration' }),
  ),
  component: function IntegrationsVantage(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-nx ud-nx-integrations" tone="default">
        {str(props.watermark) || edit ? (
          <span className="ud-nx-watermark" aria-hidden>
            <EditableText edit={edit} path={['watermark']} value={str(props.watermark)} as="span" placeholder="A" />
          </span>
        ) : null}
        <Rail props={props} />
        <Head props={props} />
        <div className="ud-nx-integrations__grid">
          {list.map((item, index) => (
            <div key={index} className="ud-nx-logo">
              <Icon name={str(item.icon, 'globe')} size={20} />
              <EditableText edit={edit} path={['items', index, 'label']} value={str(item.label)} as="span" placeholder="Tool" />
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- ctacard.vantage */

export const ctaCardVantage = defineBlock({
  type: 'ctacard.vantage',
  version: 1,
  category: 'cta',
  label: 'Vantage CTA card',
  icon: 'Rocket',
  defaultProps: {
    ...railDefaults('05', '05', 'Start'),
    tagLeft: 'READY WHEN YOU ARE',
    tagRight: 'CADENCE — READY',
    heading: 'Try every feature on your own stack.',
    description: 'Spin up a sandbox in minutes, wire it to one service, and feel the difference of a platform that fades into the background.',
    buttonLabel: 'See pricing',
    buttonUrl: '/pricing',
    secondaryLabel: 'Talk to sales',
    secondaryUrl: '/contact',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80',
    animation: 'fade-up',
  },
  schema: schema(
    ...railFields,
    text('tagLeft', 'Left tag'),
    text('tagRight', 'Right tag'),
    headingField,
    descriptionField,
    ...ctaFields,
    image('image', 'Background image'),
  ),
  component: function CtaCardVantage(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-nx ud-nx-ctacard" tone="default">
        <Rail props={props} />
        <div className="ud-nx-ctacard__panel">
          {str(props.image) ? <img className="ud-nx-ctacard__bg" src={str(props.image)} alt="" loading="lazy" /> : null}
          <div className="ud-nx-ctacard__inner">
            <div className="ud-nx-ctacard__tags">
              <EditableText edit={edit} path={['tagLeft']} value={str(props.tagLeft)} as="span" placeholder="LEFT TAG" />
              <EditableText edit={edit} path={['tagRight']} value={str(props.tagRight)} as="span" placeholder="RIGHT TAG" />
            </div>
            <EditableText
              edit={edit}
              path={['heading']}
              value={str(props.heading)}
              as="h2"
              className="ud-nx-title ud-nx-title--light"
              placeholder="Headline"
            />
            <SafeText value={str(props.description)} className="ud-nx-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
            <div className="ud-nx-ctacard__btns">
              {str(props.buttonLabel) || edit ? (
                <NxButton href={str(props.buttonUrl, '#')}>
                  <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Primary" />
                  <Icon name="arrow" size={14} />
                </NxButton>
              ) : null}
              {str(props.secondaryLabel) || edit ? (
                <NxButton href={str(props.secondaryUrl, '#')} variant="ghost">
                  <EditableText edit={edit} path={['secondaryLabel']} value={str(props.secondaryLabel)} placeholder="Secondary" />
                  <Icon name="arrow" size={14} />
                </NxButton>
              ) : null}
            </div>
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- pricing.vantage */

export const pricingVantage = defineBlock({
  type: 'pricing.vantage',
  version: 1,
  category: 'pricing',
  label: 'Vantage pricing tiers',
  icon: 'Chart',
  defaultProps: {
    ...railDefaults('01', '04', 'Plans'),
    monthlyLabel: 'Monthly',
    yearlyLabel: 'Yearly — save 20%',
    yearlyNote: '/ seat / mo billed yearly',
    monthlyNote: '/ seat / mo',
    items: [
      {
        name: 'Starter',
        text: 'For small teams getting their first taste of calm operations.',
        price: '$26',
        yearlyPrice: '$21',
        features: 'Up to 10 services\nUnified logs & metrics\nCommunity runbooks\n7-day data retention\nEmail support',
        buttonLabel: 'Start free',
        buttonUrl: '/contact',
        featured: false,
        badge: '',
      },
      {
        name: 'Growth',
        text: 'The default for product-led companies past their first 50 engineers.',
        price: '$68',
        yearlyPrice: '$54',
        features: 'Up to 100 services\nFull observability suite\nAutomation engine + dry-runs\n30-day data retention\nSlack & PagerDuty integrations\nPriority support',
        buttonLabel: 'Start trial',
        buttonUrl: '/contact',
        featured: true,
        badge: 'Most popular',
      },
      {
        name: 'Enterprise',
        text: 'Custom guardrails, SSO and dedicated humans for regulated workloads.',
        price: 'Custom',
        yearlyPrice: 'Custom',
        features: 'Unlimited services\nSAML SSO + audit logs\nCustom retention & residency\nDedicated solution engineer\nQuarterly architecture review\n24/7 white-glove support',
        buttonLabel: 'Talk to sales',
        buttonUrl: '/contact',
        featured: false,
        badge: '',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    ...railFields,
    text('monthlyLabel', 'Monthly toggle label'),
    text('yearlyLabel', 'Yearly toggle label'),
    text('monthlyNote', 'Monthly price note'),
    text('yearlyNote', 'Yearly price note'),
    repeater(
      'items',
      'Plans',
      [
        text('name', 'Name'),
        textarea('text', 'Description'),
        text('price', 'Monthly price'),
        text('yearlyPrice', 'Yearly price'),
        textarea('features', 'Features', { help: 'One per line.' }),
        text('buttonLabel', 'Button label'),
        link('buttonUrl', 'Button link'),
        text('badge', 'Badge'),
        field('featured', 'toggle', 'Highlight', 'content'),
      ],
      { itemLabel: 'Plan' },
    ),
  ),
  component: function PricingVantage(props) {
    const edit = editOf(props)
    const [yearly, setYearly] = useState(false)
    const plans = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-nx ud-nx-pricing" tone="default">
        <Rail props={props} />
        <div className="ud-nx-toggle" role="group" aria-label="Billing period">
          <button type="button" className={cx('ud-nx-toggle__btn', !yearly && 'is-on')} onClick={() => setYearly(false)}>
            <EditableText edit={edit} path={['monthlyLabel']} value={str(props.monthlyLabel, 'Monthly')} as="span" placeholder="Monthly" />
          </button>
          <button type="button" className={cx('ud-nx-toggle__btn', yearly && 'is-on')} onClick={() => setYearly(true)}>
            <EditableText edit={edit} path={['yearlyLabel']} value={str(props.yearlyLabel, 'Yearly')} as="span" placeholder="Yearly" />
          </button>
        </div>
        <div className="ud-nx-pricing__grid">
          {plans.map((plan, index) => {
            const featured = bool(plan.featured)
            const price = yearly ? str(plan.yearlyPrice) || str(plan.price) : str(plan.price)
            const priceKey = yearly && str(plan.yearlyPrice) ? 'yearlyPrice' : 'price'
            const features = lines(plan.features, [])
            return (
              <div key={index} className={cx('ud-nx-plan', featured && 'ud-nx-plan--featured')}>
                {str(plan.badge) || edit ? (
                  <EditableText
                    edit={edit}
                    path={['items', index, 'badge']}
                    value={str(plan.badge)}
                    as="span"
                    className="ud-nx-plan__badge"
                    placeholder="Badge"
                  />
                ) : null}
                <span className="ud-nx-plan__num">{pad(index)}</span>
                <EditableText
                  edit={edit}
                  path={['items', index, 'name']}
                  value={str(plan.name)}
                  as="h3"
                  className="ud-nx-plan__name"
                  placeholder="Plan"
                />
                <SafeText
                  value={str(plan.text)}
                  className="ud-nx-plan__text"
                  edit={edit}
                  path={['items', index, 'text']}
                  placeholder="Who it is for"
                />
                <p className="ud-nx-plan__price">
                  <EditableText edit={edit} path={['items', index, priceKey]} value={price} as="span" placeholder="$24" />
                  <EditableText
                    edit={edit}
                    path={[yearly ? 'yearlyNote' : 'monthlyNote']}
                    value={yearly ? str(props.yearlyNote, '/ seat / mo') : str(props.monthlyNote, '/ seat / mo')}
                    as="span"
                    className="ud-nx-plan__note"
                    placeholder="/ seat / mo"
                  />
                </p>
                <ul className="ud-nx-plan__list">
                  {features.map((value, featureIndex) => (
                    <li key={featureIndex}>
                      <Icon name="check" size={13} />
                      <EditableText
                        edit={edit}
                        path={['items', index, 'features']}
                        value={value}
                        as="span"
                        placeholder="Feature"
                        transform={(next) => features.map((line, position) => (position === featureIndex ? next : line)).join('\n')}
                      />
                    </li>
                  ))}
                </ul>
                <a className={cx('ud-nx-btn', 'ud-nx-plan__cta', !featured && 'ud-nx-btn--dark')} href={str(plan.buttonUrl, '#')}>
                  <EditableText edit={edit} path={['items', index, 'buttonLabel']} value={str(plan.buttonLabel)} placeholder="Start" />
                  <Icon name="arrow" size={14} />
                </a>
              </div>
            )
          })}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- compare.vantage */

export const compareVantage = defineBlock({
  type: 'compare.vantage',
  version: 1,
  category: 'pricing',
  label: 'Vantage comparison table',
  icon: 'Layers',
  defaultProps: {
    ...railDefaults('02', '04', 'Compare'),
    eyebrow: 'Compare plans',
    heading: 'Every plan, line by line.',
    watermark: '',
    columns: [{ label: 'Starter' }, { label: 'Growth' }, { label: 'Enterprise' }],
    rows: [
      { label: 'Data retention', values: '7 days | 30 days | Custom' },
      { label: 'Unified observability', values: 'yes | yes | yes' },
      { label: 'Automation engine', values: 'no | yes | yes' },
      { label: 'Dry-run simulator', values: 'no | yes | yes' },
      { label: 'Zero-trust policy bundle', values: 'no | yes | yes' },
      { label: 'SAML SSO', values: 'no | no | yes' },
      { label: 'Audit log export', values: 'no | no | yes' },
      { label: 'Dedicated solution engineer', values: 'no | no | yes' },
      { label: 'SLA', values: 'Best effort | 99.9% | 99.98%' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    ...railFields,
    eyebrowField,
    headingField,
    text('watermark', 'Watermark letter'),
    repeater('columns', 'Columns', [text('label', 'Label')], { itemLabel: 'Column' }),
    repeater('rows', 'Rows', [text('label', 'Row label'), text('values', 'Values', { help: 'Separate with | — use yes / no for ticks.' })], {
      itemLabel: 'Row',
    }),
  ),
  component: function CompareVantage(props) {
    const edit = editOf(props)
    const columns = items(props.columns, [])
    const rows = items(props.rows, [])
    const cellsOf = (value: unknown) =>
      str(value)
        .split('|')
        .map((part) => part.trim())
    return (
      <SectionShell props={props} className="ud-nx ud-nx-compare" tone="default">
        {str(props.watermark) || edit ? (
          <span className="ud-nx-watermark" aria-hidden>
            <EditableText edit={edit} path={['watermark']} value={str(props.watermark)} as="span" placeholder="A" />
          </span>
        ) : null}
        <Rail props={props} />
        <Head props={props} />
        <div className="ud-nx-compare__scroll">
          <table className="ud-nx-table">
            <thead>
              <tr>
                <th />
                {columns.map((column, index) => (
                  <th key={index}>
                    <EditableText edit={edit} path={['columns', index, 'label']} value={str(column.label)} as="span" placeholder="Plan" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <th scope="row">
                    <EditableText edit={edit} path={['rows', index, 'label']} value={str(row.label)} as="span" placeholder="Feature" />
                  </th>
                  {cellsOf(row.values).map((cell, cellIndex) => (
                    <td key={cellIndex}>
                      {cell.toLowerCase() === 'yes' ? (
                        <span className="ud-nx-table__yes" aria-label="Included">
                          <Icon name="check" size={15} />
                        </span>
                      ) : cell.toLowerCase() === 'no' ? (
                        <span className="ud-nx-table__no" aria-label="Not included">
                          —
                        </span>
                      ) : (
                        <EditableText
                          edit={edit}
                          path={['rows', index, 'values']}
                          value={cell}
                          as="span"
                          placeholder="Value"
                          transform={(text) =>
                            cellsOf(row.values)
                              .map((entry, position) => (position === cellIndex ? text : entry))
                              .join(' | ')
                          }
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------------- faq.vantage */

export const faqVantage = defineBlock({
  type: 'faq.vantage',
  version: 1,
  category: 'faq',
  label: 'Vantage FAQ',
  icon: 'Message',
  defaultProps: {
    ...railDefaults('03', '04', 'FAQ'),
    eyebrow: 'FAQ',
    heading: 'Quiet answers to loud questions.',
    description: 'Still wondering about something specific? Drop us a line from the contact page — a real human replies within one business day.',
    watermark: '',
    openFirst: true,
    items: [
      {
        question: 'Is there a free trial?',
        answer:
          'Yes — every plan offers a 14-day trial of the full product, no credit card required. We give you sample telemetry and a guided walkthrough so you can evaluate honestly.',
      },
      { question: 'How is a "seat" counted?', answer: 'A seat is any human who signs in during a billing month. Service accounts and read-only dashboards are free.' },
      { question: 'Can I change plans later?', answer: 'Any time, in both directions. Upgrades are prorated to the day; downgrades take effect at the next renewal.' },
      { question: 'Do you offer non-profit or startup discounts?', answer: 'We do — 50% off Growth for registered non-profits and pre-seed companies under 15 people. Ask us and we will sort it out.' },
      { question: 'Where is my data stored?', answer: 'EU (Rotterdam) by default, with US and AP regions available. Enterprise plans can pin residency per workspace.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    ...railFields,
    eyebrowField,
    headingField,
    descriptionField,
    text('watermark', 'Watermark letter'),
    toggle('openFirst', 'Open first item', 'layout'),
    repeater('items', 'Questions', [text('question', 'Question'), textarea('answer', 'Answer')], { itemLabel: 'Question' }),
  ),
  component: function FaqVantage(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-nx ud-nx-dark ud-nx-faq" tone="dark">
        {str(props.watermark) || edit ? (
          <span className="ud-nx-watermark" aria-hidden>
            <EditableText edit={edit} path={['watermark']} value={str(props.watermark)} as="span" placeholder="A" />
          </span>
        ) : null}
        <Rail props={props} />
        <div className="ud-nx-faq__grid">
          <Head props={props} />
          <div className="ud-nx-faq__list">
            {list.map((item, index) => (
              <details key={index} className="ud-nx-faq__item" open={bool(props.openFirst, true) && index === 0}>
                <summary
                  onClick={(event) => {
                    if (edit && (event.target as HTMLElement).closest('.ud-editable')) event.preventDefault()
                  }}
                >
                  <EditableText edit={edit} path={['items', index, 'question']} value={str(item.question)} as="span" placeholder="Question" />
                  <span className="ud-nx-faq__mark" aria-hidden>
                    <Icon name="plus" size={14} />
                  </span>
                </summary>
                <SafeText
                  value={str(item.answer)}
                  className="ud-nx-faq__answer"
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

/* ------------------------------------------------------------ sizing.vantage */

export const sizingVantage = defineBlock({
  type: 'sizing.vantage',
  version: 1,
  category: 'cta',
  label: 'Vantage sizing call',
  icon: 'Users',
  defaultProps: {
    ...railDefaults('04', '04', 'Next'),
    eyebrow: 'Not sure which plan',
    heading: "We'll help you size it right — in under 20 minutes.",
    description:
      'A real solution engineer reviews your stack, walks you through three calmer architectures, and tells you which plan actually fits. No slides.',
    buttonLabel: 'Book a sizing call',
    buttonUrl: '/contact',
    buttonIcon: 'arrow',
    proofLabel: 'Trusted by 1,200+ teams',
    proofMeta: 'AVG. RATING 4.9 / 5',
    avatars: [
      { image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
      { image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
      { image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
    ],
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1000&q=80',
    imageLabel: 'ABOUT 20 MIN CALL',
    animation: 'fade-up',
  },
  schema: schema(
    ...railFields,
    eyebrowField,
    headingField,
    descriptionField,
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    icon('buttonIcon', 'Button icon'),
    text('proofLabel', 'Proof label'),
    text('proofMeta', 'Proof meta'),
    repeater('avatars', 'Avatars', [image('image', 'Photo')], { itemLabel: 'Avatar' }),
    image('image', 'Image'),
    text('imageLabel', 'Image label'),
  ),
  component: function SizingVantage(props) {
    const edit = editOf(props)
    const avatars = items(props.avatars, [])
    return (
      <SectionShell props={props} className="ud-nx ud-nx-sizing" tone="default">
        <Rail props={props} />
        <div className="ud-nx-sizing__panel">
          <div className="ud-nx-sizing__copy">
            <Head props={props} />
            <div className="ud-nx-sizing__foot">
              <RoundAction props={props} placeholder="Book a call" />
              <div className="ud-nx-sizing__proof">
                <div className="ud-nx-avatars">
                  {avatars.map((item, index) => (
                    <img key={index} src={str(item.image)} alt="" loading="lazy" />
                  ))}
                </div>
                <span>
                  <EditableText edit={edit} path={['proofLabel']} value={str(props.proofLabel)} as="strong" placeholder="Trusted by" />
                  <EditableText edit={edit} path={['proofMeta']} value={str(props.proofMeta)} as="span" placeholder="RATING" />
                </span>
              </div>
            </div>
          </div>
          <div className="ud-nx-sizing__art">
            <Media src={props.image} alt="" ratio="4 / 3" className="ud-nx-sizing__media" edit={edit} path={['image']} />
            {str(props.imageLabel) || edit ? (
              <EditableText
                edit={edit}
                path={['imageLabel']}
                value={str(props.imageLabel)}
                as="span"
                className="ud-nx-split__tag"
                placeholder="LABEL"
              />
            ) : null}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- contact.vantage */

export const contactVantage = defineBlock({
  type: 'contact.vantage',
  version: 1,
  category: 'form',
  label: 'Vantage contact form',
  icon: 'Mail',
  defaultProps: {
    ...railDefaults('01', '04', 'Reach out'),
    eyebrow: 'Get in touch',
    heading: 'Drop a note — we read every one.',
    description: 'Tell us a little about where you are today. We will come back with a thoughtful next step — not a generic sales blast.',
    email: 'hello@vantageos.com',
    phone: '+31 10 555 0142',
    hours: 'Mon – Fri · 09:00 – 18:00 CET',
    formId: '',
    buttonLabel: 'Send message',
    topics: 'Sales enquiry\nTechnical demo\nPricing question\nPartnership\nPress / Other',
    consentLabel: 'I agree to be contacted about my enquiry and have read the Privacy Policy.',
    animation: 'fade-up',
  },
  schema: schema(
    ...railFields,
    eyebrowField,
    headingField,
    descriptionField,
    text('email', 'Email'),
    text('phone', 'Phone'),
    text('hours', 'Hours'),
    field('formId', 'text', 'Connected form', 'content'),
    text('buttonLabel', 'Submit label'),
    textarea('topics', 'Topic chips', { help: 'One per line.' }),
    text('consentLabel', 'Consent label'),
  ),
  component: function ContactVantage(props) {
    const edit = editOf(props)
    const topics = lines(props.topics, [])
    return (
      <SectionShell props={props} className="ud-nx ud-nx-contact" tone="default" anchorId="contact">
        <Rail props={props} />
        <div className="ud-nx-contact__grid">
          <div className="ud-nx-contact__copy">
            <Head props={props} />
            <ul className="ud-nx-contact__details">
              <li>
                <span className="ud-nx-contact__icon" aria-hidden>
                  <Icon name="mail" size={15} />
                </span>
                <span>
                  <em>Email</em>
                  <a href={`mailto:${str(props.email, 'hello@example.com')}`}>
                    <EditableText edit={edit} path={['email']} value={str(props.email)} as="span" placeholder="Email" />
                  </a>
                </span>
              </li>
              <li>
                <span className="ud-nx-contact__icon" aria-hidden>
                  <Icon name="phone" size={15} />
                </span>
                <span>
                  <em>Phone</em>
                  <a href={`tel:${str(props.phone).replace(/\s+/g, '')}`}>
                    <EditableText edit={edit} path={['phone']} value={str(props.phone)} as="span" placeholder="Phone" />
                  </a>
                </span>
              </li>
              <li>
                <span className="ud-nx-contact__icon" aria-hidden>
                  <Icon name="clock" size={15} />
                </span>
                <span>
                  <em>Hours</em>
                  <EditableText edit={edit} path={['hours']} value={str(props.hours)} as="span" placeholder="Hours" />
                </span>
              </li>
            </ul>
          </div>
          <div className="ud-nx-contact__panel">
            {topics.length || edit ? (
              <div className="ud-nx-contact__topics">
                <span className="ud-nx-contact__topics-label">Topic</span>
                <div className="ud-nx-contact__chips">
                  {topics.map((value, index) => (
                    <span key={index} className={cx('ud-nx-chip', index === 0 && 'is-on')}>
                      <EditableText
                        edit={edit}
                        path={['topics']}
                        value={value}
                        as="span"
                        placeholder="Topic"
                        transform={(next) => topics.map((line, position) => (position === index ? next : line)).join('\n')}
                      />
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            <PublicForm
              formId={str(props.formId) || undefined}
              submitLabel={str(props.buttonLabel, 'Send message')}
              edit={edit}
              submitLabelPath={['buttonLabel']}
              fields={[
                { name: 'first_name', label: 'First name', type: 'text', required: true, placeholder: 'Ada' },
                { name: 'last_name', label: 'Last name', type: 'text', required: true, placeholder: 'Lovelace' },
                { name: 'email', label: 'Work email', type: 'email', required: true, placeholder: 'ada@yourcompany.com' },
                { name: 'company', label: 'Company', type: 'text', placeholder: 'Your company' },
                { name: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Tell us about your team and your stack…' },
              ]}
            />
            <EditableText
              edit={edit}
              path={['consentLabel']}
              value={str(props.consentLabel)}
              as="p"
              className="ud-nx-contact__consent"
              placeholder="Consent line"
            />
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------------- map.vantage */

export const mapVantage = defineBlock({
  type: 'map.vantage',
  version: 1,
  category: 'content',
  label: 'Vantage map split',
  icon: 'Map-pin',
  defaultProps: {
    ...railDefaults('02', '04', 'Visit'),
    eyebrow: 'Visit us',
    heading: '2400 Harbour Lane',
    description: 'Our Rotterdam studio is open by appointment. Coffee on us — the espresso machine is sourced from a friend in Trieste.',
    buttonLabel: 'Get directions',
    buttonUrl: '#',
    buttonIcon: 'map-pin',
    embedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=4.45%2C51.90%2C4.52%2C51.93&layer=mapnik',
    image: '',
    animation: 'fade-up',
  },
  schema: schema(
    ...railFields,
    eyebrowField,
    headingField,
    descriptionField,
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    icon('buttonIcon', 'Button icon'),
    field('embedUrl', 'text', 'Map embed URL', 'content', { help: 'Any embeddable map URL. Leave blank to show the image instead.' }),
    image('image', 'Fallback image'),
  ),
  component: function MapVantage(props) {
    const edit = editOf(props)
    const embed = str(props.embedUrl)
    return (
      <SectionShell props={props} className="ud-nx ud-nx-map" tone="default">
        <Rail props={props} />
        <div className="ud-nx-map__grid">
          <div className="ud-nx-map__copy">
            <Head props={props} />
            <RoundAction props={props} iconName="map-pin" placeholder="Get directions" />
          </div>
          <div className="ud-nx-map__frame">
            {embed ? (
              <iframe title={str(props.heading, 'Map')} src={embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            ) : (
              <Media src={props.image} alt="" ratio="4 / 3" edit={edit} path={['image']} />
            )}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- offices.vantage */

export const officesVantage = defineBlock({
  type: 'offices.vantage',
  version: 1,
  category: 'content',
  label: 'Vantage offices',
  icon: 'Globe',
  defaultProps: {
    ...railDefaults('03', '04', 'Offices'),
    eyebrow: 'Our offices',
    heading: 'Three time zones, one calm phone tree.',
    badgeLabel: '3 hubs · 24h cover',
    badgeMeta: 'Availability',
    badgeIcon: 'globe',
    items: [
      {
        city: 'Rotterdam',
        tag: 'Headquarters',
        address: '2400 Harbour Lane, Suite 12\nRotterdam, 3011 EA, NL',
        hours: 'Mon – Fri · 09:00 – 18:00 CET',
        status: 'Open',
        image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
      },
      {
        city: 'Lisbon',
        tag: 'EMEA hub',
        address: 'Rua da Prata 118\n1100-421 Lisboa, PT',
        hours: 'Mon – Fri · 09:00 – 18:00 WET',
        status: 'Open',
        image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=80',
      },
      {
        city: 'Singapore',
        tag: 'APAC hub',
        address: '8 Marina Boulevard, #05-02\nMarina Bay, 018981 SG',
        hours: 'Mon – Fri · 09:00 – 18:00 SGT',
        status: 'Open',
        image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=900&q=80',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    ...railFields,
    eyebrowField,
    headingField,
    text('badgeLabel', 'Badge label'),
    text('badgeMeta', 'Badge meta'),
    icon('badgeIcon', 'Badge icon'),
    repeater(
      'items',
      'Offices',
      [
        text('city', 'City'),
        text('tag', 'Tag'),
        textarea('address', 'Address'),
        text('hours', 'Hours'),
        text('status', 'Status'),
        image('image', 'Image'),
      ],
      { itemLabel: 'Office' },
    ),
  ),
  component: function OfficesVantage(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-nx ud-nx-offices" tone="default">
        <Rail props={props} />
        <div className="ud-nx-pillars__head">
          <Head props={props} />
          <div className="ud-nx-badge">
            <span className="ud-nx-badge__dot" aria-hidden>
              <Icon name={str(props.badgeIcon, 'globe')} size={14} />
            </span>
            <span className="ud-nx-hero__chip-copy">
              <EditableText edit={edit} path={['badgeLabel']} value={str(props.badgeLabel)} as="strong" placeholder="3 hubs" />
              <EditableText edit={edit} path={['badgeMeta']} value={str(props.badgeMeta)} as="span" placeholder="Availability" />
            </span>
          </div>
        </div>
        <div className="ud-nx-offices__grid">
          {list.map((item, index) => (
            <div key={index} className="ud-nx-office">
              <div className="ud-nx-office__art">
                <Media src={item.image} alt="" ratio="16 / 9" edit={edit} path={['items', index, 'image']} />
                <span className="ud-nx-office__num">{pad(index)}</span>
                <span className="ud-nx-office__status">
                  <EditableText edit={edit} path={['items', index, 'status']} value={str(item.status)} as="span" placeholder="Open" />
                </span>
              </div>
              <div className="ud-nx-office__body">
                <div className="ud-nx-office__top">
                  <span className="ud-nx-office__pin" aria-hidden>
                    <Icon name="map-pin" size={14} />
                  </span>
                  <EditableText
                    edit={edit}
                    path={['items', index, 'tag']}
                    value={str(item.tag)}
                    as="span"
                    className="ud-nx-office__tag"
                    placeholder="Tag"
                  />
                </div>
                <EditableText
                  edit={edit}
                  path={['items', index, 'city']}
                  value={str(item.city)}
                  as="h3"
                  className="ud-nx-office__city"
                  placeholder="City"
                />
                <SafeText
                  value={str(item.address)}
                  className="ud-nx-office__address"
                  edit={edit}
                  path={['items', index, 'address']}
                  placeholder="Street, city"
                />
                <p className="ud-nx-office__hours-label">Hours</p>
                <EditableText
                  edit={edit}
                  path={['items', index, 'hours']}
                  value={str(item.hours)}
                  as="p"
                  className="ud-nx-office__hours"
                  placeholder="Mon – Fri"
                />
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
})
