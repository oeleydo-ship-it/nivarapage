/**
 * Novalta — an AI-innovation studio template, ported from the "StartHub
 * Twelve" design (starthubtwelve.liquid-themes.com).
 *
 * Visual language: a soft off-white page, one signature blue-to-coral
 * gradient painted across every primary button and highlighted headline
 * word, playful rounded Fredoka display type over plain Manrope body copy,
 * arch-topped photography, floating pastel stat bubbles, full-bleed stacked
 * colour panels for the studio's story, and a near-black gradient footer
 * band carrying the closing call to action.
 *
 * Every block routes through `schema()`, which appends the shared design /
 * typography / background / spacing / content-width controls, so each one is
 * editable on the canvas and in the side panel and stays reusable on any
 * page. Buttons, grids and media reuse the shared primitives (`Button`,
 * `Grid`, `Media`) rather than bespoke components, so the family recolours
 * from theme tokens instead of hard-coded styling.
 */
import { useState, type CSSProperties } from 'react'
import { EditableImage, EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import { Button, Grid, Heading, Media, SafeText, SectionShell, bool, cx, items, sectionVars, str } from '../primitives'
import {
  descriptionField,
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
} from '../schema'
import { defineBlock } from '../types'

/* ------------------------------------------------------------------ head */

function NvHead({ props, align = 'left' }: { props: Record<string, unknown>; align?: 'left' | 'center' }) {
  const edit = editOf(props)
  const badge = str(props.badgeLabel)
  const heading = str(props.heading)
  const highlight = str(props.headingHighlight)
  const description = str(props.description)
  if (!edit && !heading && !description && !badge) return null
  return (
    <div className={cx('ud-nv-head', align === 'center' && 'ud-nv-head--center')}>
      {badge || edit ? (
        <span className="ud-nv-badge">
          <EditableText edit={edit} path={['badgeLabel']} value={badge} placeholder="Badge" />
        </span>
      ) : null}
      {heading || highlight || edit ? (
        <h2 className="ud-nv-title">
          <EditableText edit={edit} path={['heading']} value={heading} as="span" placeholder="Heading" />{' '}
          {highlight || edit ? (
            <EditableText edit={edit} path={['headingHighlight']} value={highlight} as="span" className="ud-nv-title__grad" placeholder="highlight" />
          ) : null}
        </h2>
      ) : null}
      {description || edit ? (
        <SafeText value={description} className="ud-nv-lead" edit={edit} path={['description']} placeholder="Short description" />
      ) : null}
    </div>
  )
}

const logoFields = [text('logo', 'Wordmark'), image('logoImage', 'Logo image'), link('logoUrl', 'Logo link')]

function NovaltaLogo({ props }: { props: Record<string, unknown> }) {
  const edit = editOf(props)
  const src = str(props.logoImage)
  return (
    <a className="ud-nv-logo" href={str(props.logoUrl, '/')}>
      {src ? (
        <span className="ud-nv-logo__img">
          <img src={src} alt={str(props.logo, 'Logo')} />
          <EditableImage edit={edit} path={['logoImage']} current={src} label="Replace logo" />
        </span>
      ) : (
        <span className="ud-nv-logo__mark" aria-hidden />
      )}
      <EditableText edit={edit} path={['logo']} value={str(props.logo, 'Novalta')} as="span" className="ud-nv-logo__name" placeholder="Brand" />
    </a>
  )
}

/* --------------------------------------------------------------- navbar.novalta */

export const navbarNovalta = defineBlock({
  type: 'navbar.novalta',
  version: 1,
  category: 'navigation',
  label: 'Novalta navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Novalta',
    logoImage: '',
    logoUrl: '/',
    links: [
      { label: 'Home', url: '/' },
      { label: 'Services', url: '/services' },
      { label: 'Solutions', url: '/solutions' },
      { label: 'About', url: '/about' },
      { label: 'Contact', url: '/contact' },
    ],
    buttonLabel: 'Send a message',
    buttonUrl: '/contact',
    sticky: true,
    animation: 'fade-down',
    animationTrigger: 'load',
  },
  schema: schema(...logoFields, navLinksField('links', 'Links'), text('buttonLabel', 'Button label'), link('buttonUrl', 'Button link'), stickyField),
  component: function NavbarNovalta(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    return (
      <header className={cx('ud-nv', 'ud-nv-nav', bool(props.sticky, true) && 'ud-nv-nav--sticky')} style={sectionVars(props, 'default') as CSSProperties}>
        <div className="ud-container ud-nv-nav__bar">
          <NovaltaLogo props={props} />
          <nav className={cx('ud-nv-nav__links', open && 'is-open')} aria-label="Primary">
            {items(props.links, []).map((item, index) => (
              <a key={index} className="ud-nv-nav__link" href={str(item.url, '#')}>
                <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
              </a>
            ))}
          </nav>
          <div className="ud-nv-nav__end">
            {str(props.buttonLabel) || edit ? (
              <Button href={str(props.buttonUrl, '#')} variant="primary" className="ud-nv-nav__cta">
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
              </Button>
            ) : null}
            <button
              type="button"
              className="ud-nv-nav__toggle"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              <Icon name={open ? 'close' : 'menu'} size={20} />
            </button>
          </div>
        </div>
      </header>
    )
  },
})

/* ----------------------------------------------------------- pagehead.novalta */

export const pageHeadNovalta = defineBlock({
  type: 'pagehead.novalta',
  version: 1,
  category: 'hero',
  label: 'Novalta page header',
  icon: 'Layout',
  defaultProps: {
    heading: 'About Us',
    homeLabel: 'Home',
    homeUrl: '/',
    parentLabel: 'Pages',
  },
  schema: schema(headingField, text('homeLabel', 'Home link label'), link('homeUrl', 'Home link'), text('parentLabel', 'Middle crumb label')),
  component: function PageHeadNovalta(props) {
    const edit = editOf(props)
    const heading = str(props.heading, 'Page')
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-nv ud-nv-pagehead">
        <EditableText edit={edit} path={['heading']} value={heading} as="h1" className="ud-nv-title ud-nv-title--xl" placeholder="Page title" />
        <nav className="ud-nv-crumbs" aria-label="Breadcrumb">
          <a href={str(props.homeUrl, '/')}>
            <EditableText edit={edit} path={['homeLabel']} value={str(props.homeLabel, 'Home')} placeholder="Home" />
          </a>
          <span aria-hidden>/</span>
          <EditableText edit={edit} path={['parentLabel']} value={str(props.parentLabel, 'Pages')} placeholder="Pages" />
          <span aria-hidden>/</span>
          <span className="is-current">{heading}</span>
        </nav>
      </SectionShell>
    )
  },
  settings: null,
})

/* -------------------------------------------------------------- hero.novalta */

export const heroNovalta = defineBlock({
  type: 'hero.novalta',
  version: 1,
  category: 'hero',
  label: 'Novalta gradient-button hero',
  icon: 'Sparkles',
  defaultProps: {
    heading: 'pioneering',
    headingHighlight: 'AI innovation',
    description: 'We develop custom AI solutions designed to meet your specific business needs, transforming your operations.',
    buttonLabel: 'View Works',
    buttonUrl: '/solutions',
    image: '',
  },
  schema: schema(
    headingField,
    text('headingHighlight', 'Highlighted phrase'),
    descriptionField,
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    image('image', 'Side image'),
  ),
  component: function HeroNovalta(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" className="ud-nv ud-nv-hero">
        <div className="ud-nv-hero__copy">
          <h1 className="ud-nv-title ud-nv-title--xl">
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="span" placeholder="Headline" />{' '}
            <span className="ud-nv-hero__bolt" aria-hidden>
              <Icon name="zap" size={30} />
            </span>
            <br />
            <EditableText edit={edit} path={['headingHighlight']} value={str(props.headingHighlight)} as="span" className="ud-nv-title__grad" placeholder="highlight" />
          </h1>
          {str(props.description) || edit ? (
            <SafeText value={str(props.description)} className="ud-nv-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
          ) : null}
          {str(props.buttonLabel) || edit ? (
            <Button href={str(props.buttonUrl, '#')} variant="primary" className="ud-nv-hero__cta">
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
            </Button>
          ) : null}
        </div>
        <Media src={props.image} alt="" ratio="square" className="ud-nv-hero__img" edit={edit} path={['image']} />
      </SectionShell>
    )
  },
  settings: null,
})

/* ----------------------------------------------------------- services.novalta */

const serviceItems = [
  { icon: 'palette', title: 'Web Design' },
  { icon: 'target', title: 'Strategy' },
  { icon: 'cart', title: 'eCommerce' },
]

export const servicesNovalta = defineBlock({
  type: 'services.novalta',
  version: 1,
  category: 'services',
  label: 'Novalta services + tag cloud',
  icon: 'Layers',
  defaultProps: {
    badgeLabel: 'Digital Solutions',
    heading: 'Range of',
    headingHighlight: 'Services',
    description: 'Our experts provide strategic AI consulting to help you understand the potential of AI for your business and develop a roadmap for implementation.',
    buttonLabel: 'View Works',
    buttonUrl: '/services',
    items: serviceItems,
    tags: [
      { label: 'Startup Solutions' },
      { label: '(PPC) Advertising' },
      { label: 'Development' },
      { label: 'E-commerce Solutions' },
      { label: 'Web Design' },
      { label: 'AI Integration' },
      { label: 'Social Media' },
      { label: 'User Experience' },
    ],
  },
  schema: schema(
    text('badgeLabel', 'Badge label'),
    headingField,
    text('headingHighlight', 'Highlighted word'),
    descriptionField,
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    repeater('items', 'Orbit icons', [icon('icon', 'Icon'), text('title', 'Label')], { itemLabel: 'Icon' }),
    repeater('tags', 'Tag cloud', [text('label', 'Tag')], { itemLabel: 'Tag' }),
  ),
  component: function ServicesNovalta(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const tags = items(props.tags, [])
    return (
      <SectionShell props={props} tone="default" className="ud-nv ud-nv-services">
        <div className="ud-nv-services__top">
          <NvHead props={props} align="left" />
          {str(props.buttonLabel) || edit ? (
            <Button href={str(props.buttonUrl, '#')} variant="outline" className="ud-nv-services__cta">
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
            </Button>
          ) : null}
        </div>
        <div className="ud-nv-services__orbit">
          {rows.map((item, index) => (
            <div key={index} className="ud-nv-orbit-icon">
              <span aria-hidden>
                <Icon name={str(item.icon, 'palette')} size={20} />
              </span>
              <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} placeholder="Label" />
            </div>
          ))}
        </div>
        {tags.length ? (
          <div className="ud-nv-services__tags">
            {tags.map((tag, index) => (
              <span key={index} className="ud-nv-tag">
                <EditableText edit={edit} path={['tags', index, 'label']} value={str(tag.label)} placeholder="Tag" />
              </span>
            ))}
          </div>
        ) : null}
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- about.novalta */

export const aboutNovalta = defineBlock({
  type: 'about.novalta',
  version: 1,
  category: 'content',
  label: 'Novalta arch-image about',
  icon: 'Info',
  defaultProps: {
    badgeLabel: 'Years of experience',
    heading: 'Trusted',
    headingHighlight: 'Partner',
    description: 'Our team of experts combines deep technical knowledge with creative thinking to develop AI-driven strategies that drive efficiency, innovation, and growth.',
    buttonLabel: 'Learn more',
    buttonUrl: '/about',
    image: '',
  },
  schema: schema(
    text('badgeLabel', 'Badge label'),
    headingField,
    text('headingHighlight', 'Highlighted word'),
    descriptionField,
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    image('image', 'Photo'),
  ),
  component: function AboutNovalta(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" className="ud-nv ud-nv-about">
        <Media src={props.image} alt="" ratio="portrait" className="ud-nv-about__img" edit={edit} path={['image']} />
        <div className="ud-nv-about__copy">
          <NvHead props={props} align="left" />
          {str(props.buttonLabel) || edit ? (
            <Button href={str(props.buttonUrl, '#')} variant="outline" className="ud-nv-about__cta">
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
            </Button>
          ) : null}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- stats.novalta */

export const statsNovalta = defineBlock({
  type: 'stats.novalta',
  version: 1,
  category: 'features',
  label: 'Novalta floating stat bubbles',
  icon: 'TrendingUp',
  defaultProps: {
    items: [
      { value: '32', suffix: '+', label: 'offices' },
      { value: '10', suffix: '+', label: 'projects' },
      { value: '15', suffix: '+', label: 'years experience' },
    ],
  },
  schema: schema(repeater('items', 'Stats', [text('value', 'Value'), text('suffix', 'Suffix'), text('label', 'Label')], { itemLabel: 'Stat' })),
  component: function StatsNovalta(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-nv ud-nv-stats">
        <div className="ud-nv-stats__row">
          {rows.map((item, index) => (
            <div key={index} className="ud-nv-bubble">
              <span className="ud-nv-bubble__value">
                <EditableText edit={edit} path={['items', index, 'value']} value={str(item.value)} as="span" placeholder="0" />
                <EditableText edit={edit} path={['items', index, 'suffix']} value={str(item.suffix, '+')} as="span" placeholder="+" />
              </span>
              <EditableText edit={edit} path={['items', index, 'label']} value={str(item.label)} as="span" className="ud-nv-bubble__label" placeholder="Label" />
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------ process.novalta */

export const processNovalta = defineBlock({
  type: 'process.novalta',
  version: 1,
  category: 'features',
  label: 'Novalta connected-step process',
  icon: 'ListChecks',
  defaultProps: {
    items: [
      { title: "Understand our client's needs through discussions", buttonLabel: 'Learn more', buttonUrl: '/contact' },
      { title: 'Strategize and create a detailed project plan.', buttonLabel: 'Learn more', buttonUrl: '/contact' },
      { title: 'Bring the designs to life through development.', buttonLabel: 'Learn more', buttonUrl: '/contact' },
      { title: 'Launch the project, ensuring everything runs smoothly.', buttonLabel: 'Learn more', buttonUrl: '/contact' },
    ],
  },
  schema: schema(repeater('items', 'Steps', [textarea('title', 'Step text'), text('buttonLabel', 'Link label'), link('buttonUrl', 'Link')], { itemLabel: 'Step' })),
  component: function ProcessNovalta(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-nv ud-nv-process">
        <div className="ud-nv-process__list">
          {rows.map((item, index) => (
            <div key={index} className="ud-nv-step">
              <span className="ud-nv-step__no">{index + 1}</span>
              <SafeText value={str(item.title)} className="ud-nv-step__text" edit={edit} path={['items', index, 'title']} placeholder="Step" />
              {str(item.buttonLabel) || edit ? (
                <a className="ud-nv-step__link" href={str(item.buttonUrl, '#')}>
                  <EditableText edit={edit} path={['items', index, 'buttonLabel']} value={str(item.buttonLabel)} placeholder="Learn more" />
                </a>
              ) : null}
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------- solutions.novalta */

export const solutionsNovalta = defineBlock({
  type: 'solutions.novalta',
  version: 1,
  category: 'services',
  label: 'Novalta solutions accordion',
  icon: 'ListChecks',
  defaultProps: {
    badgeLabel: 'Digital Solutions',
    heading: 'Custom',
    headingHighlight: 'Solutions',
    description: 'We partner with you to understand your unique challenges and craft custom AI solutions that deliver real results, tailored to meet your specific needs.',
    image: '',
    items: [
      { title: 'Developing AI-driven Applications', text: 'Native-feel apps shaped by real usage data and tested through iteration.' },
      { title: 'Strategic AI Advisory', text: 'A roadmap for where AI actually moves the needle in your business.' },
      { title: 'Creating Bespoke AI Solutions', text: 'Purpose-built tools instead of a one-size-fits-all platform.' },
    ],
  },
  schema: schema(
    text('badgeLabel', 'Badge label'),
    headingField,
    text('headingHighlight', 'Highlighted word'),
    descriptionField,
    image('image', 'Photo'),
    repeater('items', 'Solutions', [text('title', 'Title'), textarea('text', 'Description')], { itemLabel: 'Solution' }),
  ),
  component: function SolutionsNovalta(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const [open, setOpen] = useState(0)
    return (
      <SectionShell props={props} tone="surface" className="ud-nv ud-nv-solutions">
        <Media src={props.image} alt="" ratio="portrait" className="ud-nv-solutions__img" edit={edit} path={['image']} />
        <div className="ud-nv-solutions__copy">
          <NvHead props={props} align="left" />
          <div className="ud-nv-solutions__list">
            {rows.map((item, index) => {
              const isOpen = Boolean(edit) || open === index
              return (
                <div key={index} className={cx('ud-nv-solution', isOpen && 'is-open')}>
                  <button type="button" className="ud-nv-solution__head" aria-expanded={isOpen} onClick={() => setOpen((current) => (current === index ? -1 : index))}>
                    <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="span" placeholder="Title" />
                    <span className="ud-nv-solution__sign" aria-hidden>
                      <Icon name={isOpen ? 'minus' : 'plus'} size={15} />
                    </span>
                  </button>
                  <div className="ud-nv-solution__body" hidden={!isOpen}>
                    <SafeText value={str(item.text)} edit={edit} path={['items', index, 'text']} placeholder="Description" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- panels.novalta */

const panelItems = [
  {
    tint: 'lavender',
    number: '01',
    title: 'studio',
    text: "Whether you're a startup or a large enterprise, our solutions are designed to meet the needs of businesses of all sizes. Our journey began with a mission to help businesses harness the power of technology to achieve their goals.",
  },
  {
    tint: 'mint',
    number: '02',
    title: 'awards',
    text: 'Celebrating our achievements and accolades from leading industry organizations. Here are the significant milestones and awards that showcase our growth and success over the years.',
  },
  {
    tint: 'lime',
    number: '03',
    title: 'partnership',
    text: "Whether you're a startup or a large enterprise, our solutions are designed to meet the needs of businesses of all sizes. We proudly partner with industry leaders to bring you the best solutions and services.",
  },
  {
    tint: 'sky',
    number: '04',
    title: 'capabilities',
    text: 'We strive to revolutionize the digital landscape by delivering innovative and effective solutions tailored to your business needs.',
  },
]

export const panelsNovalta = defineBlock({
  type: 'panels.novalta',
  version: 1,
  category: 'content',
  label: 'Novalta full-bleed story panels',
  icon: 'Layers',
  defaultProps: { items: panelItems },
  schema: schema(
    repeater('items', 'Panels', [text('tint', 'Tint (lavender / mint / lime / sky)'), text('number', 'Number badge'), text('title', 'Title'), textarea('text', 'Description')], {
      itemLabel: 'Panel',
    }),
  ),
  component: function PanelsNovalta(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-nv ud-nv-panels" bleed>
        {rows.map((item, index) => (
          <div key={index} className={cx('ud-nv-panel', `ud-nv-panel--${str(item.tint, 'lavender')}`)}>
            <div className="ud-container ud-nv-panel__inner">
              <span className="ud-nv-panel__no">
                <EditableText edit={edit} path={['items', index, 'number']} value={str(item.number, String(index + 1).padStart(2, '0'))} placeholder="01" />
              </span>
              <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="h3" className="ud-nv-panel__title" placeholder="Title" />
              <SafeText value={str(item.text)} className="ud-nv-panel__text" edit={edit} path={['items', index, 'text']} placeholder="Description" />
            </div>
          </div>
        ))}
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- projects.novalta */

const workItems = [
  { title: 'Aperture App', category: 'Digital Design', image: '', url: '/solutions' },
  { title: 'Fernbank Print Kit', category: 'Custom Print', image: '', url: '/solutions' },
  { title: 'Solace Skincare', category: 'Branding', image: '', url: '/solutions' },
  { title: 'Cartwheel Market', category: 'Ecommerce', image: '', url: '/solutions' },
]

export const galleryNovalta = defineBlock({
  type: 'projects.novalta',
  version: 1,
  category: 'gallery',
  label: 'Novalta filtered work grid',
  icon: 'Image',
  defaultProps: {
    badgeLabel: 'Our Work',
    heading: 'Our',
    headingHighlight: 'Works',
    description: 'Explore our diverse portfolio of AI solutions implemented across various industries. Each project demonstrates our commitment to innovation and our clients’ success.',
    filters: [{ label: 'All' }, { label: 'Branding' }, { label: 'Custom Print' }, { label: 'Digital Design' }, { label: 'Ecommerce' }],
    moreLabel: 'View More',
    moreUrl: '/solutions',
    items: workItems,
  },
  schema: schema(
    text('badgeLabel', 'Badge label'),
    headingField,
    text('headingHighlight', 'Highlighted word'),
    descriptionField,
    repeater('filters', 'Filter labels', [text('label', 'Label')], { itemLabel: 'Filter' }),
    text('moreLabel', 'Button label'),
    link('moreUrl', 'Button link'),
    repeater('items', 'Projects', [image('image', 'Image'), text('title', 'Title'), text('category', 'Category'), link('url', 'Link')], { itemLabel: 'Project' }),
  ),
  component: function GalleryNovalta(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const filters = items(props.filters, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-nv ud-nv-projects">
        <NvHead props={props} align="center" />
        {filters.length ? (
          <div className="ud-nv-projects__filters">
            <span>Filter by</span>
            {filters.map((filter, index) => (
              <span key={index} className={cx('ud-nv-filter', index === 0 && 'is-active')}>
                <EditableText edit={edit} path={['filters', index, 'label']} value={str(filter.label)} placeholder="Filter" />
              </span>
            ))}
          </div>
        ) : null}
        <div className="ud-nv-projects__grid">
          {rows.map((item, index) => (
            <a key={index} className="ud-nv-project" href={str(item.url, '#')}>
              <Media src={item.image} alt={str(item.title)} ratio="square" className="ud-nv-project__img" edit={edit} path={['items', index, 'image']} />
              <Heading level={4} edit={edit} path={['items', index, 'title']}>
                {str(item.title, 'Project')}
              </Heading>
              <EditableText edit={edit} path={['items', index, 'category']} value={str(item.category)} as="span" className="ud-nv-project__tag" placeholder="Category" />
            </a>
          ))}
        </div>
        {str(props.moreLabel) || edit ? (
          <Button href={str(props.moreUrl, '#')} variant="outline" className="ud-nv-projects__more">
            <EditableText edit={edit} path={['moreLabel']} value={str(props.moreLabel)} placeholder="View More" />
          </Button>
        ) : null}
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------- casestudies.novalta */

export const caseStudiesNovalta = defineBlock({
  type: 'casestudies.novalta',
  version: 1,
  category: 'testimonials',
  label: 'Novalta case-study accordion',
  icon: 'Award',
  defaultProps: {
    badgeLabel: 'Our Partners',
    heading: 'Success',
    headingHighlight: 'Stories',
    description: 'Discover the success stories from our clients who have benefited from our cutting-edge AI solutions.',
    items: [
      { name: 'Meridian Motors', title: 'Revolutionizing Business Operations', text: 'The client saw a 25% increase in average order value and a 30% boost in customer retention within the first six months.', role: 'Technology Partner' },
      { name: 'Wayfare Goods', title: 'Innovation in Action', text: 'A streamlined supply chain delivered a 40% improvement in efficiency and a 20% reduction in production costs.', role: 'Retail Partner' },
      { name: 'Transit Labs', title: 'Driving Customer Satisfaction', text: 'Advanced data analytics lifted user engagement by 35% and cut average wait times in half.', role: 'Technology Partner' },
    ],
  },
  schema: schema(
    text('badgeLabel', 'Badge label'),
    headingField,
    text('headingHighlight', 'Highlighted word'),
    descriptionField,
    repeater('items', 'Case studies', [text('name', 'Client name'), text('title', 'Result headline'), textarea('text', 'Result description'), text('role', 'Relationship')], {
      itemLabel: 'Case study',
    }),
  ),
  component: function CaseStudiesNovalta(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const [open, setOpen] = useState(0)
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-nv ud-nv-cases">
        <NvHead props={props} align="center" />
        <div className="ud-nv-cases__list">
          {rows.map((item, index) => {
            const isOpen = Boolean(edit) || open === index
            return (
              <button key={index} type="button" className={cx('ud-nv-case', isOpen && 'is-open')} onClick={() => setOpen(index)}>
                <span className="ud-nv-case__name">
                  <EditableText edit={edit} path={['items', index, 'name']} value={str(item.name)} placeholder="Client" />
                </span>
                {isOpen ? (
                  <span className="ud-nv-case__detail">
                    <Heading level={4} edit={edit} path={['items', index, 'title']}>
                      {str(item.title, 'Result')}
                    </Heading>
                    <SafeText value={str(item.text)} edit={edit} path={['items', index, 'text']} placeholder="Description" />
                    <span className="ud-nv-case__role">
                      <EditableText edit={edit} path={['items', index, 'name']} value={str(item.name)} placeholder="Client" />, <EditableText edit={edit} path={['items', index, 'role']} value={str(item.role)} placeholder="Relationship" />
                    </span>
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------------- faq.novalta */

export const faqNovalta = defineBlock({
  type: 'faq.novalta',
  version: 1,
  category: 'faq',
  label: 'Novalta FAQ',
  icon: 'HelpCircle',
  defaultProps: {
    badgeLabel: '',
    heading: 'Have a',
    headingHighlight: 'question?',
    description: 'Simply contact us through our website, and we will schedule a consultation to discuss your project and how we can help bring your vision to life.',
    items: [
      { question: 'Do you customize your consultation services?', answer: 'Yes — every engagement starts with a scoping call so the plan matches your actual constraints.' },
      { question: 'Do you provide ongoing support after implementation?', answer: 'We offer monthly retainers for monitoring, updates and iteration once a project ships.' },
      { question: 'Do you offer virtual consultations?', answer: 'Yes, every consultation can be done remotely over video.' },
      { question: 'Can you estimate the average cost of consultation?', answer: 'Initial consultations are free; project estimates follow the scoping call.' },
    ],
  },
  schema: schema(
    headingField,
    text('headingHighlight', 'Highlighted word'),
    descriptionField,
    repeater('items', 'Questions', [text('question', 'Question'), textarea('answer', 'Answer')], { itemLabel: 'Question' }),
  ),
  component: function FaqNovalta(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const [open, setOpen] = useState(0)
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-nv ud-nv-faq">
        <NvHead props={props} align="center" />
        <div className="ud-nv-faq__list">
          {rows.map((item, index) => {
            const isOpen = Boolean(edit) || open === index
            return (
              <div key={index} className={cx('ud-nv-faq-row', isOpen && 'is-open')}>
                <button type="button" className="ud-nv-faq-row__head" aria-expanded={isOpen} onClick={() => setOpen((current) => (current === index ? -1 : index))}>
                  <EditableText edit={edit} path={['items', index, 'question']} value={str(item.question)} as="span" placeholder="Question" />
                  <span className="ud-nv-faq-row__sign" aria-hidden>
                    <Icon name={isOpen ? 'minus' : 'plus'} size={15} />
                  </span>
                </button>
                <div className="ud-nv-faq-row__body" hidden={!isOpen}>
                  <SafeText value={str(item.answer)} edit={edit} path={['items', index, 'answer']} placeholder="Answer" />
                </div>
              </div>
            )
          })}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- footer.novalta */

export const footerNovalta = defineBlock({
  type: 'footer.novalta',
  version: 1,
  category: 'footer',
  label: 'Novalta gradient-CTA footer',
  icon: 'Layout',
  defaultProps: {
    badgeLabel: 'Stay Connected',
    heading: "Let's",
    headingHighlight: 'collaborate.',
    description: 'Join us on this exciting journey and discover how our expertise and passion for technology can help your business achieve its full potential.',
    buttonLabel: 'Contact Us',
    buttonUrl: '/contact',
    aboutLabel: 'About Us',
    aboutUrl: '/about',
    social: [
      { label: 'Twitter', url: '#' },
      { label: 'Youtube', url: '#' },
      { label: 'Instagram', url: '#' },
    ],
    copyright: 'Novalta. All images are for demo purposes.',
  },
  schema: schema(
    text('badgeLabel', 'Badge label'),
    headingField,
    text('headingHighlight', 'Highlighted word'),
    descriptionField,
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    text('aboutLabel', 'Secondary link label'),
    link('aboutUrl', 'Secondary link'),
    repeater('social', 'Social links', [text('label', 'Label'), link('url', 'Link')], { itemLabel: 'Link' }),
    text('copyright', 'Copyright (after the ©)'),
  ),
  component: function FooterNovalta(props) {
    const edit = editOf(props)
    const social = items(props.social, [])
    return (
      <footer className="ud-nv ud-nv-footer">
        <div className="ud-container">
          {str(props.badgeLabel) || edit ? (
            <div className="ud-nv-footer__social-top">
              {social.map((item, index) => (
                <a key={index} href={str(item.url, '#')}>
                  <EditableText edit={edit} path={['social', index, 'label']} value={str(item.label)} placeholder="Platform" />
                </a>
              ))}
            </div>
          ) : null}
          <div className="ud-nv-footer__cta">
            <span className="ud-nv-footer__icon" aria-hidden>
              <Icon name="sparkles" size={20} />
            </span>
            <h2 className="ud-nv-title">
              <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="span" placeholder="Heading" />{' '}
              <EditableText edit={edit} path={['headingHighlight']} value={str(props.headingHighlight)} as="span" className="ud-nv-title__grad" placeholder="highlight" />
            </h2>
            <SafeText value={str(props.description)} className="ud-nv-lead" edit={edit} path={['description']} placeholder="Description" />
            {str(props.buttonLabel) || edit ? (
              <Button href={str(props.buttonUrl, '#')} variant="primary" className="ud-nv-footer__btn">
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
              </Button>
            ) : null}
          </div>
          <div className="ud-nv-footer__base">
            <NovaltaLogo props={props} />
            <a href={str(props.aboutUrl, '/about')}>
              <EditableText edit={edit} path={['aboutLabel']} value={str(props.aboutLabel)} placeholder="About Us" />
            </a>
            <p>
              &copy;{' '}
              <EditableText edit={edit} path={['copyright']} value={str(props.copyright, 'Novalta. All rights reserved.')} placeholder="Studio, All rights reserved." />
            </p>
          </div>
        </div>
      </footer>
    )
  },
})
