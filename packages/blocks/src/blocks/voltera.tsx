/**
 * Voltera — a high-energy digital-marketing agency template.
 *
 * Visual language: electric indigo-blue panels against white, a chartreuse lime
 * accent used for every pill button and eyebrow badge, near-black geometric
 * headlines, generously rounded cards with hairline borders, and a lime arrow
 * motif in the corner of the blue bands.
 *
 * Everything routes through `schema()`, which appends the shared design /
 * typography / background / spacing / content-width controls, so every block is
 * editable on the canvas and in the side panel, can be narrowed or widened, and
 * is reusable on any page.
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

/** Lime pill eyebrow badge. */
function Badge({ props, path = ['eyebrow'], light = false }: { props: Props; path?: Array<string | number>; light?: boolean }) {
  const edit = editOf(props)
  const value = str(props[String(path[path.length - 1])])
  if (!value && !edit) return null
  return (
    <EditableText
      edit={edit}
      path={path}
      value={value}
      as="span"
      className={cx('ud-vt-badge', light && 'ud-vt-badge--light')}
      placeholder="Badge"
    />
  )
}

/** Badge + headline + lead paragraph, left or centred. */
function Head({
  props,
  as = 'h2',
  align = 'left',
  light = false,
}: {
  props: Props
  as?: 'h1' | 'h2'
  align?: 'left' | 'center'
  light?: boolean
}) {
  const edit = editOf(props)
  const heading = str(props.heading)
  const description = str(props.description)
  if (!edit && !heading && !description && !str(props.eyebrow)) return null
  const Tag = as
  return (
    <div className={cx('ud-vt-head', align === 'center' && 'ud-vt-head--center', light && 'ud-vt-head--light')}>
      <Badge props={props} light={light} />
      {heading || edit ? (
        <Tag className={cx('ud-vt-title', as === 'h1' && 'ud-vt-title--xl')}>
          <EditableText edit={edit} path={['heading']} value={heading} as="span" placeholder="Heading" />
        </Tag>
      ) : null}
      {description || edit ? (
        <SafeText value={description} className="ud-vt-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
      ) : null}
    </div>
  )
}

/** Pill button. Lime is the default; the blue and outline variants sit on it. */
function VtButton({
  href,
  children,
  variant = 'lime',
  arrow = true,
}: {
  href: string
  children: ReactNode
  variant?: 'lime' | 'blue' | 'outline' | 'light'
  arrow?: boolean
}) {
  return (
    <a className={cx('ud-vt-btn', `ud-vt-btn--${variant}`)} href={href || '#'}>
      {children}
      {arrow ? (
        <span className="ud-vt-btn__arrow" aria-hidden>
          <Icon name="arrow" size={14} />
        </span>
      ) : null}
    </a>
  )
}

/** Optional pair of buttons shared by the hero-ish blocks. */
function Buttons({ props, variant = 'lime', secondary = 'outline' }: { props: Props; variant?: 'lime' | 'blue'; secondary?: 'outline' | 'light' }) {
  const edit = editOf(props)
  const primaryLabel = str(props.buttonLabel)
  const secondaryLabel = str(props.secondaryLabel)
  if (!primaryLabel && !secondaryLabel && !edit) return null
  return (
    <div className="ud-vt-buttons">
      {primaryLabel || edit ? (
        <VtButton href={str(props.buttonUrl, '#')} variant={variant}>
          <EditableText edit={edit} path={['buttonLabel']} value={primaryLabel} as="span" placeholder="Get in touch" />
        </VtButton>
      ) : null}
      {secondaryLabel || edit ? (
        <VtButton href={str(props.secondaryUrl, '#')} variant={secondary} arrow={false}>
          <EditableText edit={edit} path={['secondaryLabel']} value={secondaryLabel} as="span" placeholder="See services" />
        </VtButton>
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

/** The lime corner arrow that decorates every blue panel. */
function CornerArrow({ className }: { className?: string }) {
  return (
    <span className={cx('ud-vt-corner', className)} aria-hidden>
      <svg viewBox="0 0 100 100" width="100" height="100">
        <path d="M18 82 L82 18 M46 18 L82 18 L82 54" fill="none" stroke="currentColor" strokeWidth="20" />
      </svg>
    </span>
  )
}

/** Brand wordmark, replaced by an uploaded logo when one is set. */
function Logo({ props, light = false }: { props: Props; light?: boolean }) {
  const edit = editOf(props)
  const src = str(props.logoImage)
  const height = Math.min(Math.max(num(props.logoHeight, 30), 14), 120)
  return (
    <a className={cx('ud-vt-logo', light && 'ud-vt-logo--light')} href={str(props.logoUrl, '/')}>
      {src ? (
        <span className="ud-vt-logo__img">
          <img src={src} alt={str(props.logo, 'Logo')} style={{ height, width: 'auto', display: 'block' }} />
          <EditableImage edit={edit} path={['logoImage']} current={src} label="Replace logo" />
        </span>
      ) : (
        <>
          <span className="ud-vt-logo__mark" aria-hidden>
            <Icon name="zap" size={15} />
          </span>
          <EditableText edit={edit} path={['logo']} value={str(props.logo, 'Voltera')} as="span" className="ud-vt-logo__text" placeholder="Brand" />
        </>
      )}
    </a>
  )
}

const logoFields = [
  text('logo', 'Wordmark'),
  image('logoImage', 'Logo image'),
  field('logoHeight', 'slider', 'Logo height', 'design', { min: 14, max: 120, unit: 'px' }),
  link('logoUrl', 'Logo link'),
]

/** Tick list used by the split and pricing blocks. */
function TickList({ props, path, className }: { props: Props; path: string; className?: string }) {
  const edit = editOf(props)
  const values = lines(props[path], [])
  if (!values.length && !edit) return null
  return (
    <ul className={cx('ud-vt-ticks', className)}>
      {values.map((value, index) => (
        <li key={index}>
          <span className="ud-vt-tick" aria-hidden>
            <Icon name="check" size={12} />
          </span>
          <EditableText edit={edit} path={[path, index]} value={value} as="span" placeholder="Feature" />
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------ navbar.voltera */

export const navbarVoltera = defineBlock({
  type: 'navbar.voltera',
  version: 1,
  category: 'navigation',
  label: 'Voltera navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Voltera',
    logoImage: '',
    logoUrl: '/',
    links: [
      { label: 'Services', url: '/services' },
      { label: 'About Us', url: '/about' },
      { label: 'Pricing', url: '/pricing' },
      { label: 'Case Studies', url: '/work' },
      {
        label: 'Pages',
        url: '/blog',
        children: [
          { label: 'Blog', url: '/blog' },
          { label: 'Article', url: '/article' },
          { label: 'Contact us', url: '/contact' },
        ],
      },
    ],
    buttonLabel: 'Get in Touch',
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
  component: function NavbarVoltera(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    const anim = animationOf(props)
    const links = items(props.links, [])
    return (
      <header
        className={cx('ud-vt', 'ud-vt-nav', bool(props.sticky, true) && 'ud-vt-nav--sticky', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container ud-vt-nav__bar">
          <Logo props={props} />
          <nav className={cx('ud-vt-nav__links', open && 'is-open')} aria-label="Primary">
            {links.map((item, index) => (
              <NavItem key={index} item={item}>
                <a className="ud-vt-nav__link" href={str(item.url, '#')}>
                  <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
                  <SubmenuCaret show={hasSubmenu(item)} />
                </a>
                <Submenu props={props} item={item} index={index} />
              </NavItem>
            ))}
          </nav>
          <div className="ud-vt-nav__end">
            {str(props.buttonLabel) || edit ? (
              <VtButton href={str(props.buttonUrl, '#')}>
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} as="span" placeholder="Get in Touch" />
              </VtButton>
            ) : null}
            <button type="button" className="ud-vt-nav__toggle" aria-label="Menu" onClick={() => setOpen((value) => !value)}>
              <Icon name="menu" size={20} />
            </button>
          </div>
        </div>
      </header>
    )
  },
})

/* -------------------------------------------------------------- hero.voltera */

export const heroVoltera = defineBlock({
  type: 'hero.voltera',
  version: 1,
  category: 'hero',
  label: 'Voltera hero',
  icon: 'Sparkles',
  defaultProps: {
    eyebrow: 'All-in-one marketing agency',
    heading: 'Ignite Your Brand with Voltera',
    description:
      'Let us help you navigate the complete digital landscape and reach the goals you set for the year with almost unfair confidence.',
    buttonLabel: 'Get in Touch',
    buttonUrl: '/contact',
    secondaryLabel: 'See all Services',
    secondaryUrl: '/services',
    image: '',
    stats: [
      { value: '500+', label: 'Satisfied Clients' },
      { value: '1000+', label: 'Successful Projects' },
      { value: '$10M+', label: 'Revenue Generated' },
    ],
    highlights: [
      { icon: 'award', label: 'Award-Winning Team' },
      { icon: 'target', label: 'Tailored Solutions' },
      { icon: 'trending-up', label: 'Proven Results' },
    ],
    animation: 'fade-up',
    animationTrigger: 'load',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    ...buttonFields,
    image('image', 'Hero image'),
    repeater('stats', 'Stats', [text('value', 'Value'), text('label', 'Label')], { itemLabel: 'Stat' }),
    repeater('highlights', 'Floating highlights', [icon('icon', 'Icon'), text('label', 'Label')], { itemLabel: 'Highlight' }),
  ),
  component: function HeroVoltera(props) {
    const edit = editOf(props)
    const stats = items(props.stats, [])
    const highlights = items(props.highlights, [])
    return (
      <SectionShell props={props} tone="default" className="ud-vt ud-vt-hero">
        <div className="ud-vt-hero__grid">
          <div className="ud-vt-hero__copy">
            <Badge props={props} />
            {str(props.heading) || edit ? (
              <h1 className="ud-vt-title ud-vt-title--xl">
                <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="span" placeholder="Headline" />
              </h1>
            ) : null}
            {str(props.description) || edit ? (
              <SafeText value={str(props.description)} className="ud-vt-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
            ) : null}
            <Buttons props={props} />
            {stats.length ? (
              <div className="ud-vt-hero__stats">
                {stats.map((item, index) => (
                  <div key={index} className="ud-vt-stat">
                    <EditableText
                      edit={edit}
                      path={['stats', index, 'value']}
                      value={str(item.value)}
                      as="div"
                      className="ud-vt-stat__value"
                      placeholder="500+"
                    />
                    <EditableText
                      edit={edit}
                      path={['stats', index, 'label']}
                      value={str(item.label)}
                      as="div"
                      className="ud-vt-stat__label"
                      placeholder="Satisfied clients"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="ud-vt-hero__media">
            <div className="ud-vt-hero__panel">
              <CornerArrow className="ud-vt-corner--tr" />
              <Media
                src={props.image}
                alt={str(props.heading)}
                ratio="portrait"
                className="ud-vt-hero__img"
                edit={edit}
                path={['image']}
              />
            </div>
            {highlights.length ? (
              <div className="ud-vt-hero__float">
                {highlights.map((item, index) => (
                  <div key={index} className="ud-vt-hero__floatrow">
                    <span className="ud-vt-hero__floaticon" aria-hidden>
                      <Icon name={str(item.icon, 'check')} size={13} />
                    </span>
                    <EditableText
                      edit={edit}
                      path={['highlights', index, 'label']}
                      value={str(item.label)}
                      as="span"
                      placeholder="Highlight"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- pagehero.voltera */

export const pageHeroVoltera = defineBlock({
  type: 'pagehero.voltera',
  version: 1,
  category: 'hero',
  label: 'Voltera page header',
  icon: 'Layout',
  defaultProps: {
    eyebrow: 'Our services',
    heading: 'Comprehensive Marketing Solutions by Voltera',
    description: 'Explore our services below and discover how we can help you achieve your marketing goals.',
    buttonLabel: 'Get in Touch',
    buttonUrl: '/contact',
    secondaryLabel: 'See Case Studies',
    secondaryUrl: '/work',
    image: '',
    stats: [
      { value: '500+', label: 'Satisfied Clients' },
      { value: '1000+', label: 'Successful Projects' },
      { value: '$10M+', label: 'Revenue Generated' },
    ],
    animation: 'fade-up',
    animationTrigger: 'load',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    ...buttonFields,
    image('image', 'Header image'),
    repeater('stats', 'Stats', [text('value', 'Value'), text('label', 'Label')], { itemLabel: 'Stat' }),
  ),
  component: function PageHeroVoltera(props) {
    const edit = editOf(props)
    const stats = items(props.stats, [])
    const src = str(props.image)
    return (
      <SectionShell props={props} tone="default" className="ud-vt ud-vt-pagehero" align="center">
        <Head props={props} as="h1" align="center" />
        <Buttons props={props} />
        {stats.length ? (
          <div className="ud-vt-pagehero__stats">
            {stats.map((item, index) => (
              <div key={index} className="ud-vt-stat">
                <EditableText
                  edit={edit}
                  path={['stats', index, 'value']}
                  value={str(item.value)}
                  as="div"
                  className="ud-vt-stat__value"
                  placeholder="500+"
                />
                <EditableText
                  edit={edit}
                  path={['stats', index, 'label']}
                  value={str(item.label)}
                  as="div"
                  className="ud-vt-stat__label"
                  placeholder="Satisfied clients"
                />
              </div>
            ))}
          </div>
        ) : null}
        {src || edit ? (
          <Media src={props.image} alt={str(props.heading)} ratio="wide" className="ud-vt-pagehero__img" edit={edit} path={['image']} />
        ) : null}
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- services.voltera */

export const servicesVoltera = defineBlock({
  type: 'services.voltera',
  version: 1,
  category: 'features',
  label: 'Voltera service accordion',
  icon: 'List',
  defaultProps: {
    eyebrow: 'Our services',
    heading: 'Unleash Your Brand’s Potential',
    description: 'Our innovative strategies and expert execution ensure that your brand not only stands out but also thrives in today’s competitive landscape.',
    items: [
      { title: 'Digital Strategy Development', text: 'A comprehensive plan aligned to your brand, built so every effort drives growth rather than noise.', url: '/services' },
      { title: 'Social Media Management', text: 'Engaging content, managed presence and targeted campaigns that lift engagement and conversion.', url: '/services' },
      { title: 'Search Engine Optimisation', text: 'Technical fixes and content that earn rankings, then keep them once the competition notices.', url: '/services' },
      { title: 'Email Marketing', text: 'Personalised campaigns that nurture leads, retain customers and stay out of the promotions tab.', url: '/services' },
    ],
    openIndex: -1,
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater('items', 'Services', [text('title', 'Title'), textarea('text', 'Text'), link('url', 'Link')], { itemLabel: 'Service' }),
    field('openIndex', 'number', 'Row open by default (-1 for none)', 'layout', { min: -1, max: 20 }),
  ),
  component: function ServicesVoltera(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const [open, setOpen] = useState(num(props.openIndex, -1))
    return (
      <SectionShell props={props} tone="dark" className="ud-vt ud-vt-band ud-vt-services" align="center">
        <CornerArrow className="ud-vt-corner--bl" />
        <Head props={props} align="center" light />
        <div className="ud-vt-accordion">
          {rows.map((item, index) => {
            const isOpen = open === index
            return (
              <div key={index} className={cx('ud-vt-accordion__row', isOpen && 'is-open')}>
                <button
                  type="button"
                  className="ud-vt-accordion__head"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : index)}
                >
                  <EditableText
                    edit={edit}
                    path={['items', index, 'title']}
                    value={str(item.title)}
                    as="span"
                    className="ud-vt-accordion__title"
                    placeholder="Service"
                  />
                  <span className="ud-vt-accordion__icon" aria-hidden>
                    <Icon name="arrow" size={14} />
                  </span>
                </button>
                {isOpen || edit ? (
                  <div className="ud-vt-accordion__body">
                    <SafeText
                      value={str(item.text)}
                      edit={edit}
                      path={['items', index, 'text']}
                      placeholder="What this service covers"
                    />
                    {str(item.url) ? (
                      <a className="ud-vt-textlink" href={str(item.url, '#')}>
                        Learn more <Icon name="arrow" size={13} />
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------- servicecards.voltera */

export const serviceCardsVoltera = defineBlock({
  type: 'servicecards.voltera',
  version: 1,
  category: 'features',
  label: 'Voltera numbered service cards',
  icon: 'Grid',
  defaultProps: {
    items: [
      {
        title: 'Digital Strategy Development',
        text: 'Our team collaborates with you to understand your business goals, target audience and market landscape, then crafts a plan tailored to your brand.',
        bullets: 'Comprehensive market analysis\nTailored strategy aligned with business goals\nRoadmap for sustainable growth',
        buttonLabel: 'Learn More',
        url: '/services',
      },
      {
        title: 'Social Media Management',
        text: 'Amplify your brand’s voice and connect with your audience on a deeper level through our social media management services.',
        bullets: 'Increased brand awareness\nHigher engagement rates\nData-driven campaign optimisation',
        buttonLabel: 'Learn More',
        url: '/services',
      },
      {
        title: 'Content Creation & Marketing',
        text: 'Content is king, and our team excels at creating compelling content that captivates and converts, from blog posts to video.',
        bullets: 'High-quality, engaging content\nMulti-channel content distribution\nImproved brand storytelling',
        buttonLabel: 'Learn More',
        url: '/services',
      },
      {
        title: 'Search Engine Optimisation',
        text: 'Improve your website’s visibility and attract more organic traffic with expert SEO services and best practice technical work.',
        bullets: 'Enhanced search engine rankings\nIncreased organic traffic\nBetter user experience',
        buttonLabel: 'Learn More',
        url: '/services',
      },
    ],
    columns: 2,
    animation: 'fade-up',
  },
  schema: schema(
    repeater(
      'items',
      'Services',
      [
        text('title', 'Title'),
        textarea('text', 'Text'),
        textarea('bullets', 'Bullets (one per line)'),
        text('buttonLabel', 'Button label'),
        link('url', 'Link'),
      ],
      { itemLabel: 'Service' },
    ),
    select('columns', 'Columns', [['1', '1'], ['2', '2'], ['3', '3']], 'layout'),
  ),
  component: function ServiceCardsVoltera(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="dark" className="ud-vt ud-vt-band ud-vt-svccards">
        <CornerArrow className="ud-vt-corner--tr" />
        <CornerArrow className="ud-vt-corner--bl" />
        <div className="ud-vt-svccards__grid" data-cols={String(num(props.columns, 2))}>
          {rows.map((item, index) => (
            <article key={index} className="ud-vt-svccard">
              <div className="ud-vt-svccard__num">{String(index + 1).padStart(2, '0')}</div>
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-vt-svccard__title"
                placeholder="Service"
              />
              <SafeText
                value={str(item.text)}
                className="ud-vt-svccard__text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="What it covers"
              />
              <ul className="ud-vt-ticks ud-vt-ticks--blue">
                {lines(item.bullets, []).map((line, lineIndex) => (
                  <li key={lineIndex}>
                    <span className="ud-vt-tick" aria-hidden>
                      <Icon name="check" size={11} />
                    </span>
                    <EditableText
                      edit={edit}
                      path={['items', index, 'bullets', lineIndex]}
                      value={line}
                      as="span"
                      placeholder="Outcome"
                    />
                  </li>
                ))}
              </ul>
              {str(item.buttonLabel) || edit ? (
                <VtButton href={str(item.url, '#')}>
                  <EditableText
                    edit={edit}
                    path={['items', index, 'buttonLabel']}
                    value={str(item.buttonLabel)}
                    as="span"
                    placeholder="Learn More"
                  />
                </VtButton>
              ) : null}
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ process.voltera */

export const processVoltera = defineBlock({
  type: 'process.voltera',
  version: 1,
  category: 'features',
  label: 'Voltera process steps',
  icon: 'Workflow',
  defaultProps: {
    eyebrow: 'Our process',
    heading: 'From Vision to Victory',
    description: 'Our streamlined process is designed to deliver outstanding results at every stage of your marketing journey. Here’s how we do it.',
    buttonLabel: 'Get in Touch',
    buttonUrl: '/contact',
    secondaryLabel: 'Case Studies',
    secondaryUrl: '/work',
    items: [
      { step: 'Step 1', title: 'Discovery & Strategy', text: 'We take the time to understand your goals, challenges and target audience.', image: '' },
      { step: 'Step 2', title: 'Execution & Optimisation', text: 'We continuously monitor performance, making real-time adjustments to optimise results.', image: '' },
      { step: 'Step 3', title: 'Analysis & Growth', text: 'We report on what moved, what did not, and where the next gain is hiding.', image: '' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    ...buttonFields,
    repeater('items', 'Steps', [text('step', 'Step label'), text('title', 'Title'), textarea('text', 'Text'), image('image', 'Image')], {
      itemLabel: 'Step',
    }),
  ),
  component: function ProcessVoltera(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-vt ud-vt-process">
        <div className="ud-vt-process__top">
          <Head props={props} />
          <Buttons props={props} />
        </div>
        <div className="ud-vt-process__grid">
          {rows.map((item, index) => (
            <article key={index} className="ud-vt-step">
              <div className="ud-vt-step__frame">
                {str(item.image) ? (
                  <Media src={item.image} alt={str(item.title)} ratio="landscape" edit={edit} path={['items', index, 'image']} />
                ) : (
                  <div className="ud-vt-step__mock" aria-hidden>
                    <span className="ud-vt-step__bar" />
                    <span className="ud-vt-step__bar ud-vt-step__bar--wide" />
                    <span className="ud-vt-step__bar" />
                    <span className="ud-vt-step__chip" />
                  </div>
                )}
              </div>
              <EditableText
                edit={edit}
                path={['items', index, 'step']}
                value={str(item.step)}
                as="div"
                className="ud-vt-step__label"
                placeholder="Step 1"
              />
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-vt-step__title"
                placeholder="Discovery"
              />
              <SafeText value={str(item.text)} className="ud-vt-step__text" edit={edit} path={['items', index, 'text']} placeholder="What happens here" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- statsband.voltera */

export const statsBandVoltera = defineBlock({
  type: 'statsband.voltera',
  version: 1,
  category: 'features',
  label: 'Voltera image stats band',
  icon: 'BarChart',
  defaultProps: {
    image: '',
    cardTitle: 'Voltera',
    stats: [
      { value: '500+', label: 'Satisfied Clients' },
      { value: '1000+', label: 'Successful Projects' },
      { value: '$10M+', label: 'Revenue Generated' },
    ],
    buttonLabel: 'Learn More',
    buttonUrl: '/about',
    animation: 'fade-up',
  },
  schema: schema(
    image('image', 'Background image'),
    text('cardTitle', 'Card title'),
    repeater('stats', 'Stats', [text('value', 'Value'), text('label', 'Label')], { itemLabel: 'Stat' }),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
  ),
  component: function StatsBandVoltera(props) {
    const edit = editOf(props)
    const stats = items(props.stats, [])
    return (
      <SectionShell props={props} tone="surface" className="ud-vt ud-vt-statsband" align="center">
        <div className="ud-vt-statsband__frame">
          <Media src={props.image} alt={str(props.cardTitle)} ratio="wide" edit={edit} path={['image']} />
          <div className="ud-vt-statsband__card">
            <div className="ud-vt-statsband__brand">
              <span className="ud-vt-logo__mark" aria-hidden>
                <Icon name="zap" size={13} />
              </span>
              <EditableText edit={edit} path={['cardTitle']} value={str(props.cardTitle)} as="span" placeholder="Brand" />
            </div>
            <div className="ud-vt-statsband__stats">
              {stats.map((item, index) => (
                <div key={index} className="ud-vt-stat">
                  <EditableText
                    edit={edit}
                    path={['stats', index, 'value']}
                    value={str(item.value)}
                    as="div"
                    className="ud-vt-stat__value"
                    placeholder="500+"
                  />
                  <EditableText
                    edit={edit}
                    path={['stats', index, 'label']}
                    value={str(item.label)}
                    as="div"
                    className="ud-vt-stat__label"
                    placeholder="Clients"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        {str(props.buttonLabel) || edit ? (
          <div className="ud-vt-buttons ud-vt-buttons--center">
            <VtButton href={str(props.buttonUrl, '#')}>
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} as="span" placeholder="Learn More" />
            </VtButton>
          </div>
        ) : null}
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------- statsstrip.voltera */

export const statsStripVoltera = defineBlock({
  type: 'statsstrip.voltera',
  version: 1,
  category: 'features',
  label: 'Voltera stat strip',
  icon: 'BarChart',
  defaultProps: {
    stats: [
      { value: '500+', label: 'Satisfied Clients' },
      { value: '1000+', label: 'Successful Projects' },
      { value: '$10M+', label: 'Revenue Generated' },
    ],
    animation: 'fade-up',
  },
  schema: schema(repeater('stats', 'Stats', [text('value', 'Value'), text('label', 'Label')], { itemLabel: 'Stat' })),
  component: function StatsStripVoltera(props) {
    const edit = editOf(props)
    const stats = items(props.stats, [])
    return (
      <SectionShell props={props} tone="dark" className="ud-vt ud-vt-band ud-vt-strip">
        <CornerArrow className="ud-vt-corner--tr" />
        <CornerArrow className="ud-vt-corner--bl" />
        <div className="ud-vt-strip__grid">
          {stats.map((item, index) => (
            <div key={index} className="ud-vt-stat ud-vt-stat--light">
              <EditableText
                edit={edit}
                path={['stats', index, 'value']}
                value={str(item.value)}
                as="div"
                className="ud-vt-stat__value"
                placeholder="500+"
              />
              <EditableText
                edit={edit}
                path={['stats', index, 'label']}
                value={str(item.label)}
                as="div"
                className="ud-vt-stat__label"
                placeholder="Satisfied clients"
              />
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- split.voltera */

export const splitVoltera = defineBlock({
  type: 'split.voltera',
  version: 1,
  category: 'content',
  label: 'Voltera split with checklist',
  icon: 'Columns',
  defaultProps: {
    eyebrow: 'Our mission',
    heading: 'Empowering Brands with Strategic Excellence',
    description: 'We are committed to empowering brands through innovative marketing solutions that drive measurable results.',
    bullets: 'Leverage the latest technologies and trends to stay ahead of the curve\nDeliver tailored strategies that align with our clients’ goals\nFoster long-term partnerships based on trust and success',
    buttonLabel: 'Get in Touch',
    buttonUrl: '/contact',
    image: '',
    reverse: false,
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    textarea('bullets', 'Checklist (one per line)'),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    image('image', 'Image'),
    toggle('reverse', 'Image first', 'layout'),
  ),
  component: function SplitVoltera(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" className={cx('ud-vt', 'ud-vt-split', bool(props.reverse) && 'ud-vt-split--reverse')}>
        <div className="ud-vt-split__grid">
          <div className="ud-vt-split__copy">
            <Head props={props} />
            <TickList props={props} path="bullets" className="ud-vt-ticks--dots" />
            {str(props.buttonLabel) || edit ? (
              <div className="ud-vt-buttons">
                <VtButton href={str(props.buttonUrl, '#')}>
                  <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} as="span" placeholder="Get in Touch" />
                </VtButton>
              </div>
            ) : null}
          </div>
          <Media
            src={props.image}
            alt={str(props.heading)}
            ratio="landscape"
            className="ud-vt-split__media"
            edit={edit}
            path={['image']}
          />
        </div>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------------- why.voltera */

export const whyVoltera = defineBlock({
  type: 'why.voltera',
  version: 1,
  category: 'features',
  label: 'Voltera reasons list',
  icon: 'CheckCircle',
  defaultProps: {
    eyebrow: 'Why us?',
    heading: 'Why Choose Voltera?',
    items: [
      { title: 'Transparent Pricing', text: 'No hidden fees or unexpected costs. What you see is what you get.' },
      { title: 'Tailored Solutions', text: 'Each plan is designed to meet the specific needs of your business, ensuring you get the most value from your investment.' },
      { title: 'Expert Team', text: 'Work with a team of experienced professionals dedicated to your success.' },
      { title: 'Proven Results', text: 'Our strategies are backed by data and proven to drive real results.' },
    ],
    buttonLabel: 'Get in Touch',
    buttonUrl: '/contact',
    image: '',
    reverse: false,
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    repeater('items', 'Reasons', [text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Reason' }),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    image('image', 'Image'),
    toggle('reverse', 'Image first', 'layout'),
  ),
  component: function WhyVoltera(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className={cx('ud-vt', 'ud-vt-why', bool(props.reverse) && 'ud-vt-why--reverse')}>
        <div className="ud-vt-why__grid">
          <div className="ud-vt-why__copy">
            <Head props={props} />
            <ul className="ud-vt-why__list">
              {rows.map((item, index) => (
                <li key={index}>
                  <span className="ud-vt-why__mark" aria-hidden>
                    <Icon name="check" size={11} />
                  </span>
                  <div>
                    <EditableText
                      edit={edit}
                      path={['items', index, 'title']}
                      value={str(item.title)}
                      as="h3"
                      className="ud-vt-why__title"
                      placeholder="Reason"
                    />
                    <SafeText
                      value={str(item.text)}
                      className="ud-vt-why__text"
                      edit={edit}
                      path={['items', index, 'text']}
                      placeholder="Why it matters"
                    />
                  </div>
                </li>
              ))}
            </ul>
            {str(props.buttonLabel) || edit ? (
              <div className="ud-vt-buttons">
                <VtButton href={str(props.buttonUrl, '#')}>
                  <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} as="span" placeholder="Get in Touch" />
                </VtButton>
              </div>
            ) : null}
          </div>
          <Media src={props.image} alt={str(props.heading)} ratio="portrait" className="ud-vt-why__media" edit={edit} path={['image']} />
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ values.voltera */

export const valuesVoltera = defineBlock({
  type: 'values.voltera',
  version: 1,
  category: 'features',
  label: 'Voltera value cards',
  icon: 'Grid',
  defaultProps: {
    eyebrow: 'Our values',
    heading: 'The Pillars of Our Success',
    description: 'At Voltera, our core values define who we are and guide everything we do.',
    items: [
      { title: 'Integrity', text: 'We believe in transparency and honesty in all our business and personal interactions.', image: '' },
      { title: 'Innovation', text: 'We are dedicated to pushing the boundaries and welcoming the change.', image: '' },
      { title: 'Collaboration', text: 'We work as a cohesive team, leveraging each member’s strengths to achieve outstanding results.', image: '' },
    ],
    columns: 3,
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater('items', 'Values', [text('title', 'Title'), textarea('text', 'Text'), image('image', 'Image')], { itemLabel: 'Value' }),
    select('columns', 'Columns', [['2', '2'], ['3', '3'], ['4', '4']], 'layout'),
  ),
  component: function ValuesVoltera(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="surface" className="ud-vt ud-vt-values" align="center">
        <Head props={props} align="center" />
        <div className="ud-vt-values__grid" data-cols={String(num(props.columns, 3))}>
          {rows.map((item, index) => (
            <article key={index} className="ud-vt-value">
              <div className="ud-vt-value__frame">
                <Media src={item.image} alt={str(item.title)} ratio="landscape" edit={edit} path={['items', index, 'image']} />
                <CornerArrow className="ud-vt-corner--tl ud-vt-corner--sm" />
                <CornerArrow className="ud-vt-corner--br ud-vt-corner--sm" />
              </div>
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-vt-value__title"
                placeholder="Value"
              />
              <SafeText value={str(item.text)} className="ud-vt-value__text" edit={edit} path={['items', index, 'text']} placeholder="What it means" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------------- team.voltera */

export const teamVoltera = defineBlock({
  type: 'team.voltera',
  version: 1,
  category: 'team',
  label: 'Voltera team grid',
  icon: 'Users',
  defaultProps: {
    eyebrow: 'Our team',
    heading: 'The People Behind the Work',
    description: 'A senior team that stays on your account from kick-off to reporting.',
    items: [
      { name: 'June Smith', role: 'Chief Executive Officer', image: '' },
      { name: 'John Doe', role: 'Chief Marketing Officer', image: '' },
      { name: 'Sarah Davis', role: 'Senior Marketing Strategist', image: '' },
    ],
    columns: 3,
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater('items', 'People', [text('name', 'Name'), text('role', 'Role'), image('image', 'Photo'), link('url', 'Profile link')], {
      itemLabel: 'Person',
    }),
    select('columns', 'Columns', [['2', '2'], ['3', '3'], ['4', '4']], 'layout'),
  ),
  component: function TeamVoltera(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-vt ud-vt-team" align="center">
        <Head props={props} align="center" />
        <div className="ud-vt-team__grid" data-cols={String(num(props.columns, 3))}>
          {rows.map((item, index) => (
            <article key={index} className="ud-vt-person">
              <Media src={item.image} alt={str(item.name)} ratio="portrait" className="ud-vt-person__img" edit={edit} path={['items', index, 'image']} />
              <EditableText
                edit={edit}
                path={['items', index, 'name']}
                value={str(item.name)}
                as="h3"
                className="ud-vt-person__name"
                placeholder="Name"
              />
              <EditableText
                edit={edit}
                path={['items', index, 'role']}
                value={str(item.role)}
                as="p"
                className="ud-vt-person__role"
                placeholder="Role"
              />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------- featuredcase.voltera */

export const featuredCaseVoltera = defineBlock({
  type: 'featuredcase.voltera',
  version: 1,
  category: 'content',
  label: 'Voltera featured case study',
  icon: 'Star',
  defaultProps: {
    tag: 'Social media management',
    title: 'Revamping Kataka’s Social Media Presence',
    text: 'Kataka Corporation, a leading consumer electronics brand, approached Voltera to enhance their social media presence and turn a quiet feed into a channel that sells.',
    panelColor: '#fde7ec',
    logo: '',
    logoText: 'KATAKA',
    metrics: [
      { value: '150%', label: 'Increased Engagement Rate' },
      { value: '80%', label: 'Follower Growth Across Platforms' },
      { value: '45%', label: 'Website Traffic Increased' },
      { value: '35%', label: 'Increase in Sales Conversion' },
    ],
    buttonLabel: 'Read More',
    buttonUrl: '/work',
    animation: 'fade-up',
  },
  schema: schema(
    text('tag', 'Tag'),
    text('title', 'Title'),
    textarea('text', 'Text'),
    field('panelColor', 'color', 'Panel colour', 'design'),
    image('logo', 'Client logo'),
    text('logoText', 'Logo fallback text'),
    repeater('metrics', 'Metrics', [text('value', 'Value'), text('label', 'Label')], { itemLabel: 'Metric' }),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
  ),
  component: function FeaturedCaseVoltera(props) {
    const edit = editOf(props)
    const metrics = items(props.metrics, [])
    const logo = str(props.logo)
    return (
      <SectionShell props={props} tone="default" className="ud-vt ud-vt-featured">
        <div className="ud-vt-featured__panel">
          <div className="ud-vt-featured__logo" style={{ background: str(props.panelColor, '#fde7ec') }}>
            <EditableText edit={edit} path={['tag']} value={str(props.tag)} as="span" className="ud-vt-chip" placeholder="Category" />
            {logo ? (
              <Media src={props.logo} alt={str(props.logoText)} ratio="square" className="ud-vt-featured__mark" edit={edit} path={['logo']} />
            ) : (
              <EditableText
                edit={edit}
                path={['logoText']}
                value={str(props.logoText)}
                as="span"
                className="ud-vt-featured__wordmark"
                placeholder="CLIENT"
              />
            )}
          </div>
          <div className="ud-vt-featured__body">
            <EditableText edit={edit} path={['title']} value={str(props.title)} as="h3" className="ud-vt-featured__title" placeholder="Case title" />
            <SafeText value={str(props.text)} className="ud-vt-featured__text" edit={edit} path={['text']} placeholder="What happened" />
            {metrics.length ? (
              <ul className="ud-vt-featured__metrics">
                {metrics.map((item, index) => (
                  <li key={index}>
                    <span className="ud-vt-featured__arrow" aria-hidden>
                      <Icon name="trending-up" size={13} />
                    </span>
                    <EditableText
                      edit={edit}
                      path={['metrics', index, 'value']}
                      value={str(item.value)}
                      as="strong"
                      placeholder="150%"
                    />
                    <EditableText
                      edit={edit}
                      path={['metrics', index, 'label']}
                      value={str(item.label)}
                      as="span"
                      placeholder="Increased engagement"
                    />
                  </li>
                ))}
              </ul>
            ) : null}
            {str(props.buttonLabel) || edit ? (
              <VtButton href={str(props.buttonUrl, '#')}>
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} as="span" placeholder="Read More" />
              </VtButton>
            ) : null}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------- casestudies.voltera */

export const caseStudiesVoltera = defineBlock({
  type: 'casestudies.voltera',
  version: 1,
  category: 'content',
  label: 'Voltera case study grid',
  icon: 'Grid',
  defaultProps: {
    eyebrow: 'Voltera case studies',
    heading: 'Transformative Case Studies of Marketing Excellence',
    description: 'Each case study highlights the challenges faced, our innovative solutions, and the remarkable results achieved.',
    buttonLabel: '',
    buttonUrl: '',
    secondaryLabel: '',
    secondaryUrl: '',
    items: [
      { tag: 'Content marketing', title: 'Elevating Gozaru Enterprises’ Brand', text: 'Gozaru, an old player in the media space, needed a powerful blog launch strategy for their first category.', logoText: 'GOZARU', panelColor: '#1f2b45', dark: true, url: '/work' },
      { tag: 'Email marketing', title: 'Transforming Konstant’s Email Marketing', text: 'Konstant, a large metal company, was struggling with low organic search visibility and a list that never opened.', logoText: 'Konstant', panelColor: '#e8f2e2', dark: false, url: '/work' },
      { tag: 'Search engine optimisation', title: 'Boosting Godud’s Organic Traffic', text: 'Godud Inc., a mid-sized e-commerce company, was struggling with low organic search visibility.', logoText: 'Godud', panelColor: '#efa22a', dark: true, url: '/work' },
      { tag: 'Pay-per-click advertising', title: 'Launching Potrone’s First Ads Campaign', text: 'Potrone Ltd., a new entrant in the fashion industry, needed a powerful launch strategy for their first product line.', logoText: 'Potrone', panelColor: '#2fb98a', dark: true, url: '/work' },
    ],
    columns: 2,
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    ...buttonFields,
    repeater(
      'items',
      'Case studies',
      [
        text('tag', 'Tag'),
        text('title', 'Title'),
        textarea('text', 'Text'),
        image('logo', 'Client logo'),
        text('logoText', 'Logo fallback text'),
        field('panelColor', 'color', 'Panel colour', 'design'),
        toggle('dark', 'Light logo text', 'design'),
        link('url', 'Link'),
      ],
      { itemLabel: 'Case study' },
    ),
    select('columns', 'Columns', [['1', '1'], ['2', '2'], ['3', '3']], 'layout'),
  ),
  component: function CaseStudiesVoltera(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const hasHead = str(props.heading) || str(props.eyebrow) || str(props.description) || edit
    return (
      <SectionShell props={props} tone="default" className="ud-vt ud-vt-cases">
        {hasHead ? (
          <div className="ud-vt-cases__top">
            <Head props={props} />
            <Buttons props={props} />
          </div>
        ) : null}
        <div className="ud-vt-cases__grid" data-cols={String(num(props.columns, 2))}>
          {rows.map((item, index) => (
            <article key={index} className="ud-vt-case">
              <div
                className={cx('ud-vt-case__panel', bool(item.dark) && 'ud-vt-case__panel--dark')}
                style={{ background: str(item.panelColor, '#f1f2f7') }}
              >
                <EditableText edit={edit} path={['items', index, 'tag']} value={str(item.tag)} as="span" className="ud-vt-chip" placeholder="Category" />
                {str(item.logo) ? (
                  <Media src={item.logo} alt={str(item.logoText)} ratio="square" className="ud-vt-case__mark" edit={edit} path={['items', index, 'logo']} />
                ) : (
                  <EditableText
                    edit={edit}
                    path={['items', index, 'logoText']}
                    value={str(item.logoText)}
                    as="span"
                    className="ud-vt-case__wordmark"
                    placeholder="CLIENT"
                  />
                )}
              </div>
              <div className="ud-vt-case__body">
                <div>
                  <EditableText
                    edit={edit}
                    path={['items', index, 'title']}
                    value={str(item.title)}
                    as="h3"
                    className="ud-vt-case__title"
                    placeholder="Case title"
                  />
                  <SafeText
                    value={str(item.text)}
                    className="ud-vt-case__text"
                    edit={edit}
                    path={['items', index, 'text']}
                    placeholder="What happened"
                  />
                </div>
                <a className="ud-vt-round" href={str(item.url, '#')} aria-label={str(item.title, 'Read more')}>
                  <Icon name="arrow" size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------- testimonials.voltera */

export const testimonialsVoltera = defineBlock({
  type: 'testimonials.voltera',
  version: 1,
  category: 'testimonials',
  label: 'Voltera testimonials',
  icon: 'Quote',
  defaultProps: {
    eyebrow: 'Testimonials',
    heading: 'Client Testimonials on the Voltera Experience',
    description: 'Here are some of the voices from our satisfied clients who have experienced the transformative power of Voltera.',
    items: [
      {
        quote: 'Voltera transformed our online presence. The results were beyond our expectations. Our social media engagement skyrocketed, and we saw a significant increase in sales. Their team is creative, professional, and truly understands our brand’s vision.',
        name: 'Jonas Khanwald',
        role: 'Marketing Director',
        company: 'Logo Ipsum',
        image: '',
      },
      {
        quote: 'The team at Voltera is exceptional. Our engagement rates soared, and our search rankings improved dramatically. They provided us with a clear strategy and executed it flawlessly. Highly recommended.',
        name: 'Martha Nielsen',
        role: 'Chief Executive Officer',
        company: 'Logo Ipsum',
        image: '',
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
      'Testimonials',
      [textarea('quote', 'Quote'), text('name', 'Name'), text('role', 'Role'), text('company', 'Company'), image('image', 'Photo')],
      { itemLabel: 'Testimonial' },
    ),
  ),
  component: function TestimonialsVoltera(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const [index, setIndex] = useState(0)
    const active = rows.length ? Math.min(index, rows.length - 1) : 0
    const item = rows[active] || {}
    return (
      <SectionShell props={props} tone="dark" className="ud-vt ud-vt-band ud-vt-quotes" align="center">
        <CornerArrow className="ud-vt-corner--tr" />
        <CornerArrow className="ud-vt-corner--bl" />
        <Head props={props} align="center" light />
        {rows.length ? (
          <div className="ud-vt-quote">
            <Media src={item.image} alt={str(item.name)} ratio="portrait" className="ud-vt-quote__img" edit={edit} path={['items', active, 'image']} />
            <div className="ud-vt-quote__body">
              <div className="ud-vt-quote__top">
                <EditableText
                  edit={edit}
                  path={['items', active, 'company']}
                  value={str(item.company)}
                  as="span"
                  className="ud-vt-quote__company"
                  placeholder="Logo Ipsum"
                />
                <div className="ud-vt-quote__nav">
                  <button type="button" aria-label="Previous" onClick={() => setIndex((v) => (v - 1 + rows.length) % rows.length)}>
                    <Icon name="arrow" size={13} />
                  </button>
                  <button type="button" aria-label="Next" onClick={() => setIndex((v) => (v + 1) % rows.length)}>
                    <Icon name="arrow" size={13} />
                  </button>
                </div>
              </div>
              <SafeText
                value={str(item.quote)}
                className="ud-vt-quote__text"
                edit={edit}
                path={['items', active, 'quote']}
                placeholder="What the client said"
              />
              <EditableText
                edit={edit}
                path={['items', active, 'name']}
                value={str(item.name)}
                as="div"
                className="ud-vt-quote__name"
                placeholder="Name"
              />
              <EditableText
                edit={edit}
                path={['items', active, 'role']}
                value={str(item.role)}
                as="div"
                className="ud-vt-quote__role"
                placeholder="Role"
              />
            </div>
          </div>
        ) : null}
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ pricing.voltera */

export const pricingVoltera = defineBlock({
  type: 'pricing.voltera',
  version: 1,
  category: 'pricing',
  label: 'Voltera pricing plans',
  icon: 'CreditCard',
  defaultProps: {
    eyebrow: 'Pricing',
    heading: 'Transparent Pricing for Exceptional Value',
    description: 'Our flexible plans are designed to meet the unique needs of your business, ensuring you get the most out of your marketing investment.',
    items: [
      {
        name: 'Starter Plan',
        price: '$1,000',
        period: '/month',
        text: 'Perfect for small businesses looking to establish a strong online presence.',
        features: 'Basic SEO\nSocial Media Management\nContent Creation (4 posts/month)\nMonthly Performance Report',
        buttonLabel: 'Get Started',
        url: '/contact',
        featured: false,
        badge: '',
      },
      {
        name: 'Growth Plan',
        price: '$2,500',
        period: '/month',
        text: 'Ideal for growing businesses aiming to boost engagement and conversions.',
        features: 'Basic SEO\nSocial Media Management\nContent Creation (8 posts/month)\nPaid Social Advertising\nBi-Weekly Performance Reports',
        buttonLabel: 'Get Started',
        url: '/contact',
        featured: true,
        badge: 'Popular',
      },
      {
        name: 'Premium Plan',
        price: '$5,000',
        period: '/month',
        text: 'Best for established businesses seeking comprehensive digital strategies.',
        features: 'Premium SEO\nSocial Media Management\nContent Creation (12 posts/month)\nPaid Social & PPC Advertising\nEmail Marketing Campaigns\nWeekly Performance Reports',
        buttonLabel: 'Get Started',
        url: '/contact',
        featured: false,
        badge: '',
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
        text('buttonLabel', 'Button label'),
        link('url', 'Button link'),
        toggle('featured', 'Highlight', 'design'),
        text('badge', 'Badge'),
      ],
      { itemLabel: 'Plan' },
    ),
  ),
  component: function PricingVoltera(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-vt ud-vt-pricing" align="center">
        <Head props={props} align="center" />
        <div className="ud-vt-pricing__grid" data-cols={String(Math.min(Math.max(rows.length || 3, 1), 4))}>
          {rows.map((item, index) => {
            const featured = bool(item.featured)
            return (
              <article key={index} className={cx('ud-vt-plan', featured && 'ud-vt-plan--featured')}>
                {str(item.badge) ? (
                  <span className="ud-vt-plan__badge">
                    <Icon name="sparkles" size={11} />
                    <EditableText edit={edit} path={['items', index, 'badge']} value={str(item.badge)} as="span" placeholder="Popular" />
                  </span>
                ) : null}
                <EditableText
                  edit={edit}
                  path={['items', index, 'name']}
                  value={str(item.name)}
                  as="h3"
                  className="ud-vt-plan__name"
                  placeholder="Plan"
                />
                <div className="ud-vt-plan__price">
                  <EditableText edit={edit} path={['items', index, 'price']} value={str(item.price)} as="span" placeholder="$1,000" />
                  <EditableText
                    edit={edit}
                    path={['items', index, 'period']}
                    value={str(item.period)}
                    as="span"
                    className="ud-vt-plan__period"
                    placeholder="/month"
                  />
                </div>
                <SafeText
                  value={str(item.text)}
                  className="ud-vt-plan__text"
                  edit={edit}
                  path={['items', index, 'text']}
                  placeholder="Who this suits"
                />
                <ul className="ud-vt-ticks">
                  {lines(item.features, []).map((line, lineIndex) => (
                    <li key={lineIndex}>
                      <span className="ud-vt-tick" aria-hidden>
                        <Icon name="check" size={11} />
                      </span>
                      <EditableText
                        edit={edit}
                        path={['items', index, 'features', lineIndex]}
                        value={line}
                        as="span"
                        placeholder="Feature"
                      />
                    </li>
                  ))}
                </ul>
                {str(item.buttonLabel) || edit ? (
                  <VtButton href={str(item.url, '#')}>
                    <EditableText
                      edit={edit}
                      path={['items', index, 'buttonLabel']}
                      value={str(item.buttonLabel)}
                      as="span"
                      placeholder="Get Started"
                    />
                  </VtButton>
                ) : null}
              </article>
            )
          })}
        </div>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- customplan.voltera */

export const customPlanVoltera = defineBlock({
  type: 'customplan.voltera',
  version: 1,
  category: 'cta',
  label: 'Voltera inline callout',
  icon: 'MessageCircle',
  defaultProps: {
    icon: 'message',
    heading: 'Custom Plans',
    description: 'Need something more tailored? Contact us for a customised plan that fits your specific requirements and budget.',
    buttonLabel: 'Contact Sales',
    buttonUrl: '/contact',
    animation: 'fade-up',
  },
  schema: schema(icon('icon', 'Icon'), headingField, descriptionField, text('buttonLabel', 'Button label'), link('buttonUrl', 'Button link')),
  component: function CustomPlanVoltera(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" className="ud-vt ud-vt-callout">
        <div className="ud-vt-callout__panel">
          <span className="ud-vt-callout__icon" aria-hidden>
            <Icon name={str(props.icon, 'message')} size={18} />
          </span>
          <div className="ud-vt-callout__copy">
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h3" className="ud-vt-callout__title" placeholder="Custom Plans" />
            <SafeText value={str(props.description)} className="ud-vt-callout__text" edit={edit} path={['description']} placeholder="Tell them what to do" />
          </div>
          {str(props.buttonLabel) || edit ? (
            <VtButton href={str(props.buttonUrl, '#')}>
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} as="span" placeholder="Contact Sales" />
            </VtButton>
          ) : null}
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------------- faq.voltera */

export const faqVoltera = defineBlock({
  type: 'faq.voltera',
  version: 1,
  category: 'faq',
  label: 'Voltera FAQ',
  icon: 'HelpCircle',
  defaultProps: {
    eyebrow: 'FAQs',
    heading: 'Frequently Asked Questions',
    description: 'We’ve compiled a list of the most frequently asked questions to help you get the information you need and doubts cleared.',
    items: [
      { question: 'What services does Voltera offer?', answer: 'Strategy, social, content, SEO, paid media and email — either as a full programme or as the one piece you are missing.' },
      { question: 'How does Voltera develop a digital marketing strategy?', answer: 'We start with your goals and your numbers, audit what is already working, then build a roadmap you can actually staff.' },
      { question: 'What industries does Voltera specialise in?', answer: 'We work best with consumer brands, e-commerce and B2B services, but the method travels further than the sector list.' },
      { question: 'How does Voltera measure the success of its campaigns?', answer: 'Against the metric you agreed at kick-off. Reports show the number, the movement and what we are changing next.' },
      { question: 'Can Voltera help with both organic and paid marketing efforts?', answer: 'Yes, and we prefer to run them together — paid buys the data that makes organic faster.' },
    ],
    footerTitle: 'Still have questions?',
    footerText: 'Can’t find the answer you’re looking for? Please chat to our friendly team.',
    buttonLabel: 'Get in Touch',
    buttonUrl: '/contact',
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater('items', 'Questions', [text('question', 'Question'), textarea('answer', 'Answer')], { itemLabel: 'Question' }),
    text('footerTitle', 'Footer title'),
    textarea('footerText', 'Footer text'),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
  ),
  component: function FaqVoltera(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const [open, setOpen] = useState(-1)
    return (
      <SectionShell props={props} tone="default" className="ud-vt ud-vt-faq" align="center">
        <Head props={props} align="center" />
        <div className="ud-vt-faq__list">
          {rows.map((item, index) => {
            const isOpen = open === index
            return (
              <div key={index} className={cx('ud-vt-faq__row', isOpen && 'is-open')}>
                <button type="button" className="ud-vt-faq__head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : index)}>
                  <EditableText
                    edit={edit}
                    path={['items', index, 'question']}
                    value={str(item.question)}
                    as="span"
                    className="ud-vt-faq__q"
                    placeholder="Question"
                  />
                  <span className="ud-vt-round ud-vt-round--lime" aria-hidden>
                    <Icon name="arrow" size={14} />
                  </span>
                </button>
                {isOpen || edit ? (
                  <SafeText
                    value={str(item.answer)}
                    className="ud-vt-faq__a"
                    edit={edit}
                    path={['items', index, 'answer']}
                    placeholder="Answer"
                  />
                ) : null}
              </div>
            )
          })}
        </div>
        {str(props.footerTitle) || edit ? (
          <div className="ud-vt-faq__foot">
            <EditableText edit={edit} path={['footerTitle']} value={str(props.footerTitle)} as="h3" placeholder="Still have questions?" />
            <SafeText value={str(props.footerText)} edit={edit} path={['footerText']} placeholder="Tell them what to do next" />
            {str(props.buttonLabel) || edit ? (
              <div className="ud-vt-buttons ud-vt-buttons--center">
                <VtButton href={str(props.buttonUrl, '#')}>
                  <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} as="span" placeholder="Get in Touch" />
                </VtButton>
              </div>
            ) : null}
          </div>
        ) : null}
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------------- posts.voltera */

export const postsVoltera = defineBlock({
  type: 'posts.voltera',
  version: 1,
  category: 'blog',
  label: 'Voltera article cards',
  icon: 'FileText',
  defaultProps: {
    eyebrow: '',
    heading: 'Marketing Mastery',
    description: '',
    buttonLabel: 'Get in Touch',
    buttonUrl: '/contact',
    secondaryLabel: 'View all Blogs',
    secondaryUrl: '/blog',
    filters: [],
    items: [
      {
        category: 'Content Marketing',
        date: 'May 16, 2024',
        title: 'Brand Loyalty Through Personalised Audience Marketing',
        text: 'Personalised marketing is key to building strong brand loyalty and long-term, sustainable customer relationships.',
        image: '',
        url: '/article',
      },
      {
        category: 'Content Marketing',
        date: 'Jan 24, 2024',
        title: 'Email Marketing Trends and Best Practices for 2024',
        text: 'Email marketing remains one of the most effective ways to engage with your audience. Here is our strategy.',
        image: '',
        url: '/article',
      },
      {
        category: 'Content Marketing',
        date: 'Dec 11, 2023',
        title: 'How to Create Original Compelling Content That Converts',
        text: 'Discover the secrets to crafting original content that converts your audience into loyal customers.',
        image: '',
        url: '/article',
      },
    ],
    columns: 3,
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    ...buttonFields,
    repeater('filters', 'Filter pills', [text('label', 'Label'), link('url', 'URL'), toggle('active', 'Active', 'design')], { itemLabel: 'Filter' }),
    repeater(
      'items',
      'Articles',
      [text('category', 'Category'), text('date', 'Date'), text('title', 'Title'), textarea('text', 'Excerpt'), image('image', 'Image'), link('url', 'Link')],
      { itemLabel: 'Article' },
    ),
    select('columns', 'Columns', [['2', '2'], ['3', '3'], ['4', '4']], 'layout'),
  ),
  component: function PostsVoltera(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const filters = items(props.filters, [])
    const hasHead = str(props.heading) || str(props.eyebrow) || str(props.description) || edit
    return (
      <SectionShell props={props} tone="default" className="ud-vt ud-vt-posts">
        {hasHead ? (
          <div className="ud-vt-posts__top">
            <Head props={props} />
            {filters.length ? (
              <div className="ud-vt-filters">
                {filters.map((item, index) => (
                  <a
                    key={index}
                    className={cx('ud-vt-filter', bool(item.active) && 'is-active')}
                    href={str(item.url, '#')}
                  >
                    <EditableText edit={edit} path={['filters', index, 'label']} value={str(item.label)} as="span" placeholder="All" />
                  </a>
                ))}
              </div>
            ) : (
              <Buttons props={props} />
            )}
          </div>
        ) : null}
        <div className="ud-vt-posts__grid" data-cols={String(num(props.columns, 3))}>
          {rows.map((item, index) => (
            <article key={index} className="ud-vt-post">
              <Media src={item.image} alt={str(item.title)} ratio="landscape" className="ud-vt-post__img" edit={edit} path={['items', index, 'image']} />
              <div className="ud-vt-post__meta">
                <EditableText edit={edit} path={['items', index, 'category']} value={str(item.category)} as="span" placeholder="Category" />
                <span className="ud-vt-post__dot" aria-hidden />
                <span className="ud-vt-post__date">
                  <Icon name="calendar" size={12} />
                  <EditableText edit={edit} path={['items', index, 'date']} value={str(item.date)} as="span" placeholder="May 16, 2024" />
                </span>
              </div>
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-vt-post__title"
                placeholder="Article title"
              />
              <SafeText value={str(item.text)} className="ud-vt-post__text" edit={edit} path={['items', index, 'text']} placeholder="Excerpt" />
              <a className="ud-vt-textlink" href={str(item.url, '#')}>
                Read more <Icon name="arrow" size={13} />
              </a>
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- richtext.voltera */

export const richTextVoltera = defineBlock({
  type: 'richtext.voltera',
  version: 1,
  category: 'content',
  label: 'Voltera article body',
  icon: 'FileText',
  defaultProps: {
    body: '<p>Personalisation is a key benefit of data analytics in marketing. By understanding the unique preferences and behaviours of different consumer segments, marketers can create highly targeted campaigns.</p><h2>Optimising Campaign Performance</h2><p>Data analytics empowers marketers to make informed, real-time decisions. With insights from data analysis they pivot strategies, allocate resources effectively, and optimise campaigns for maximum return.</p><h3>Predictive Analytics</h3><p>Predictive analytics stands as a potent tool in marketing, leveraging historical data and patterns to forecast future trends and behaviours.</p><blockquote>Staying ahead of the curve is not a slogan. It is a reporting cadence, an argument with your own assumptions, and the willingness to kill a campaign that is working slightly.</blockquote><p>Armed with predictive insights, marketers can refine their targeting, messaging and offerings to align with evolving consumer expectations.</p>',
    contentWidth: 'narrow',
    animation: 'fade-up',
  },
  schema: schema(field('body', 'richtext', 'Body', 'content')),
  component: function RichTextVoltera(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" className="ud-vt ud-vt-rich">
        <EditableRich edit={edit} path={['body']} html={str(props.body)} className="ud-vt-rich__body" />
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ ctaband.voltera */

export const ctaBandVoltera = defineBlock({
  type: 'ctaband.voltera',
  version: 1,
  category: 'cta',
  label: 'Voltera CTA band',
  icon: 'Megaphone',
  defaultProps: {
    eyebrow: 'Contact us',
    heading: 'Unleash Your Brand’s Potential with Voltera!',
    description: 'Join the hundreds of satisfied clients who have transformed their business with Voltera. Contact us today to get started!',
    buttonLabel: 'Get in Touch',
    buttonUrl: '/contact',
    secondaryLabel: 'View Services',
    secondaryUrl: '/services',
    animation: 'fade-up',
  },
  schema: schema(eyebrowField, headingField, descriptionField, ...buttonFields),
  component: function CtaBandVoltera(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" className="ud-vt ud-vt-cta">
        <div className="ud-vt-cta__panel">
          <div className="ud-vt-cta__copy">
            <Badge props={props} light />
            {str(props.heading) || edit ? (
              <h2 className="ud-vt-title ud-vt-cta__title">
                <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="span" placeholder="Headline" />
              </h2>
            ) : null}
            <SafeText value={str(props.description)} className="ud-vt-cta__text" edit={edit} path={['description']} placeholder="Supporting copy" />
          </div>
          <Buttons props={props} secondary="light" />
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- contact.voltera */

export const contactVoltera = defineBlock({
  type: 'contact.voltera',
  version: 1,
  category: 'form',
  label: 'Voltera contact form',
  icon: 'Mail',
  defaultProps: {
    eyebrow: 'Contact us',
    heading: 'Let’s Connect and Ignite Your Success',
    description: 'We’re excited to hear from you! Reach out to us and let’s take your business to the next level with Voltera.',
    emailLabel: 'Email',
    email: 'info@voltera.com',
    phoneLabel: 'Phone',
    phone: '+1 (123) 456-7891',
    socialLabel: 'Follow us!',
    social: [
      { icon: 'linkedin', url: '#' },
      { icon: 'twitter', url: '#' },
      { icon: 'facebook', url: '#' },
      { icon: 'instagram', url: '#' },
    ],
    formId: '',
    buttonLabel: 'Submit',
    services: 'Digital strategy\nSocial media\nContent marketing\nSEO\nPaid media',
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    text('emailLabel', 'Email label'),
    text('email', 'Email'),
    text('phoneLabel', 'Phone label'),
    text('phone', 'Phone'),
    text('socialLabel', 'Social label'),
    repeater('social', 'Social', [icon('icon', 'Icon'), link('url', 'URL')], { itemLabel: 'Profile' }),
    textarea('services', 'Service options (one per line)'),
    text('formId', 'Form ID'),
    text('buttonLabel', 'Submit label'),
  ),
  component: function ContactVoltera(props) {
    const edit = editOf(props)
    const social = items(props.social, [])
    return (
      <SectionShell props={props} tone="default" className="ud-vt ud-vt-contact">
        <div className="ud-vt-contact__grid">
          <div className="ud-vt-contact__copy">
            <Head props={props} />
            <div className="ud-vt-contact__details">
              <div>
                <EditableText edit={edit} path={['emailLabel']} value={str(props.emailLabel)} as="h3" placeholder="Email" />
                <EditableText edit={edit} path={['email']} value={str(props.email)} as="p" placeholder="hello@example.com" />
              </div>
              <div>
                <EditableText edit={edit} path={['phoneLabel']} value={str(props.phoneLabel)} as="h3" placeholder="Phone" />
                <EditableText edit={edit} path={['phone']} value={str(props.phone)} as="p" placeholder="+1 (123) 456-7891" />
              </div>
            </div>
            {social.length ? (
              <div className="ud-vt-contact__social">
                <EditableText edit={edit} path={['socialLabel']} value={str(props.socialLabel)} as="h3" placeholder="Follow us!" />
                <div className="ud-vt-contact__icons">
                  {social.map((item, index) => (
                    <a key={index} href={str(item.url, '#')} aria-label={str(item.icon, 'social')}>
                      <Icon name={str(item.icon, 'globe')} size={15} />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <div className="ud-vt-contact__form">
            <PublicForm
              formId={str(props.formId) || undefined}
              submitLabel={str(props.buttonLabel, 'Submit')}
              fields={[
                { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'John Doe' },
                { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'abc@company.com' },
                { name: 'company', label: 'Company Name', type: 'text', placeholder: 'ABC Corp.' },
                { name: 'service', label: 'Services', type: 'select', options: lines(props.services, ['Digital strategy']) },
                { name: 'budget', label: 'Budget', type: 'text', placeholder: '$2,000-$5,000' },
                { name: 'message', label: 'Your Message', type: 'textarea', required: true, placeholder: 'Write Your Message…' },
              ]}
            />
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------------- map.voltera */

/** Pin coordinates are percentages of the map box, so the dots stay put. */
const DOT_ROWS = 26
const DOT_COLS = 60

export const mapVoltera = defineBlock({
  type: 'map.voltera',
  version: 1,
  category: 'content',
  label: 'Voltera office map',
  icon: 'MapPin',
  defaultProps: {
    eyebrow: 'Our global presence',
    heading: 'Voltera Offices Around the World',
    description: 'To better serve our clients, Voltera has established a strong global presence with offices in key locations around the world.',
    pins: [
      { label: 'Vancouver', x: 17, y: 30 },
      { label: 'Austin', x: 21, y: 40 },
      { label: 'London', x: 44, y: 26 },
      { label: 'Warsaw', x: 52, y: 28 },
      { label: 'Dubai', x: 60, y: 45 },
      { label: 'Singapore', x: 72, y: 58 },
      { label: 'Sydney', x: 84, y: 70 },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater('pins', 'Offices', [text('label', 'City'), field('x', 'number', 'X %', 'layout', { min: 0, max: 100 }), field('y', 'number', 'Y %', 'layout', { min: 0, max: 100 })], {
      itemLabel: 'Office',
    }),
  ),
  component: function MapVoltera(props) {
    const edit = editOf(props)
    const pins = items(props.pins, [])
    const dots: ReactNode[] = []
    for (let row = 0; row < DOT_ROWS; row += 1) {
      for (let col = 0; col < DOT_COLS; col += 1) {
        // A coarse mask that reads as continents without shipping an image.
        const x = col / DOT_COLS
        const y = row / DOT_ROWS
        const land =
          (x > 0.08 && x < 0.3 && y > 0.15 && y < 0.55) ||
          (x > 0.22 && x < 0.34 && y > 0.55 && y < 0.92) ||
          (x > 0.42 && x < 0.56 && y > 0.12 && y < 0.42) ||
          (x > 0.46 && x < 0.62 && y > 0.42 && y < 0.82) ||
          (x > 0.56 && x < 0.86 && y > 0.18 && y < 0.62) ||
          (x > 0.78 && x < 0.92 && y > 0.62 && y < 0.85)
        if (!land) continue
        dots.push(
          <circle key={String(row) + '-' + String(col)} cx={col * 10 + 5} cy={row * 10 + 5} r={2.4} />,
        )
      }
    }
    return (
      <SectionShell props={props} tone="surface" className="ud-vt ud-vt-map" align="center">
        <Head props={props} align="center" />
        <div className="ud-vt-map__frame">
          <svg className="ud-vt-map__dots" viewBox={'0 0 ' + String(DOT_COLS * 10) + ' ' + String(DOT_ROWS * 10)} role="presentation">
            {dots}
          </svg>
          {pins.map((pin, index) => (
            <span
              key={index}
              className="ud-vt-map__pin"
              style={{ left: String(num(pin.x, 50)) + '%', top: String(num(pin.y, 50)) + '%' }}
              title={str(pin.label)}
            >
              <EditableText edit={edit} path={['pins', index, 'label']} value={str(pin.label)} as="span" className="ud-vt-map__label" placeholder="City" />
            </span>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- logos.voltera */

export const logosVoltera = defineBlock({
  type: 'logos.voltera',
  version: 1,
  category: 'gallery',
  label: 'Voltera logo row',
  icon: 'Grid',
  defaultProps: {
    heading: 'Trusted by teams that measure everything',
    items: [
      { label: 'Kataka' },
      { label: 'GOZARU' },
      { label: 'Konstant' },
      { label: 'Godud' },
      { label: 'Potrone' },
      { label: 'Nimbus' },
    ],
    animation: 'fade-up',
  },
  schema: schema(headingField, repeater('items', 'Logos', [text('label', 'Label'), image('image', 'Logo')], { itemLabel: 'Logo' })),
  component: function LogosVoltera(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-vt ud-vt-logos" align="center">
        {str(props.heading) || edit ? (
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="p" className="ud-vt-logos__title" placeholder="Trusted by" />
        ) : null}
        <div className="ud-vt-logos__row">
          {rows.map((item, index) =>
            str(item.image) ? (
              <Media key={index} src={item.image} alt={str(item.label)} ratio="wide" className="ud-vt-logos__img" edit={edit} path={['items', index, 'image']} />
            ) : (
              <EditableText
                key={index}
                edit={edit}
                path={['items', index, 'label']}
                value={str(item.label)}
                as="span"
                className="ud-vt-logos__word"
                placeholder="Brand"
              />
            ),
          )}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ footer.voltera */

export const footerVoltera = defineBlock({
  type: 'footer.voltera',
  version: 1,
  category: 'footer',
  label: 'Voltera footer',
  icon: 'Layout',
  defaultProps: {
    logo: 'Voltera',
    logoImage: '',
    logoUrl: '/',
    tagline: 'Fuelling Your Brand’s Brilliance',
    columns: [
      {
        title: 'Pages',
        links: [
          { label: 'Homepage', url: '/' },
          { label: 'Services', url: '/services' },
          { label: 'About Us', url: '/about' },
          { label: 'Case Studies', url: '/work' },
        ],
      },
      {
        title: '',
        links: [
          { label: 'Pricing', url: '/pricing' },
          { label: 'Blog', url: '/blog' },
          { label: 'Article', url: '/article' },
          { label: 'Contact Us', url: '/contact' },
        ],
      },
      {
        title: 'Utility Pages',
        links: [
          { label: 'Style Guide', url: '/' },
          { label: 'Password Protected', url: '/' },
          { label: '404 Page', url: '/' },
          { label: 'Licenses', url: '/' },
        ],
      },
    ],
    contactTitle: 'Contact',
    phone: '(405) 123-456',
    phoneUrl: 'tel:405123456',
    email: 'hello@voltera.com',
    emailUrl: 'mailto:hello@voltera.com',
    social: [
      { icon: 'facebook', url: '#' },
      { icon: 'instagram', url: '#' },
      { icon: 'twitter', url: '#' },
      { icon: 'linkedin', url: '#' },
    ],
    copyright: '© Voltera',
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
    text('contactTitle', 'Contact title'),
    text('phone', 'Phone'),
    link('phoneUrl', 'Phone link'),
    text('email', 'Email'),
    link('emailUrl', 'Email link'),
    repeater('social', 'Social', [icon('icon', 'Icon'), link('url', 'URL')], { itemLabel: 'Profile' }),
    text('copyright', 'Copyright'),
  ),
  component: function FooterVoltera(props) {
    const edit = editOf(props)
    const columns = items(props.columns, [])
    const social = items(props.social, [])
    const anim = animationOf(props)
    return (
      <footer
        className={cx('ud-vt', 'ud-vt-footer', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <CornerArrow className="ud-vt-corner--tr ud-vt-corner--lg" />
        <div className="ud-container ud-vt-footer__grid">
          <div className="ud-vt-footer__brand">
            <Logo props={props} light />
            <EditableText edit={edit} path={['tagline']} value={str(props.tagline)} as="p" className="ud-vt-footer__tagline" placeholder="Tagline" />
          </div>
          {columns.map((column, index) => (
            <div key={index} className="ud-vt-footer__col">
              <EditableText
                edit={edit}
                path={['columns', index, 'title']}
                value={str(column.title)}
                as="h3"
                className="ud-vt-footer__title"
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
          <div className="ud-vt-footer__col">
            <EditableText
              edit={edit}
              path={['contactTitle']}
              value={str(props.contactTitle)}
              as="h3"
              className="ud-vt-footer__title"
              placeholder="Contact"
            />
            <ul>
              <li>
                <a href={str(props.phoneUrl, '#')}>
                  <EditableText edit={edit} path={['phone']} value={str(props.phone)} as="span" placeholder="(405) 123-456" />
                </a>
              </li>
              <li>
                <a href={str(props.emailUrl, '#')}>
                  <EditableText edit={edit} path={['email']} value={str(props.email)} as="span" placeholder="hello@example.com" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="ud-container ud-vt-footer__bar">
          <EditableText edit={edit} path={['copyright']} value={str(props.copyright)} as="span" placeholder="© Voltera" />
          <div className="ud-vt-footer__social">
            {social.map((item, index) => (
              <a key={index} href={str(item.url, '#')} aria-label={str(item.icon, 'social')}>
                <Icon name={str(item.icon, 'globe')} size={15} />
              </a>
            ))}
          </div>
        </div>
      </footer>
    )
  },
})
