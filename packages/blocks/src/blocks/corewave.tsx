/**
 * Corewave — a software and product-development studio template, ported
 * from the "StartHub" design (starthub-8.liquid-themes.com).
 *
 * Visual language: a warm off-white page carries a floating gradient-blob
 * hero card, medium-weight Space Grotesk headlines over plain Sora body
 * copy, one vivid violet accent and one lime-green accent trading off
 * across highlighted words, pill badges and buttons, hand-drawn doodle
 * accents, organic blob-cropped photography, giant ghost numerals behind
 * numbered process steps, and a dark navy band carrying every primary
 * button and the footer.
 *
 * Every block routes through `schema()`, which appends the shared design /
 * typography / background / spacing / content-width controls, so each one is
 * editable on the canvas and in the side panel and stays reusable on any
 * page. Buttons, grids and media reuse the shared primitives (`Button`,
 * `Grid`, `Media`, `Stars`) rather than bespoke components, so the family
 * recolours from theme tokens instead of hard-coded styling.
 */
import { useState, type CSSProperties } from 'react'
import { EditableImage, EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import { Button, Grid, Heading, Media, SafeText, SectionShell, Stars, bool, cx, items, sectionVars, str } from '../primitives'
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

/** A heading split in three so the highlighted middle phrase stays a plain, editable field instead of fragile string-splitting. */
function CwHead({ props, align = 'left' }: { props: Record<string, unknown>; align?: 'left' | 'center' }) {
  const edit = editOf(props)
  const badge = str(props.badgeLabel)
  const heading = str(props.heading)
  const highlight = str(props.headingHighlight)
  const headingEnd = str(props.headingEnd)
  const description = str(props.description)
  if (!edit && !heading && !description && !badge) return null
  return (
    <div className={cx('ud-cw-head', align === 'center' && 'ud-cw-head--center')}>
      {badge || edit ? (
        <span className="ud-cw-badge">
          <EditableText edit={edit} path={['badgeLabel']} value={badge} placeholder="Badge" />
        </span>
      ) : null}
      {heading || headingEnd || edit ? (
        <h2 className="ud-cw-title">
          <EditableText edit={edit} path={['heading']} value={heading} as="span" placeholder="Heading" />{' '}
          {highlight || edit ? (
            <EditableText edit={edit} path={['headingHighlight']} value={highlight} as="span" className="ud-cw-title__mark" placeholder="highlight" />
          ) : null}{' '}
          <EditableText edit={edit} path={['headingEnd']} value={headingEnd} as="span" placeholder="…" />
        </h2>
      ) : null}
      {description || edit ? (
        <SafeText value={description} className="ud-cw-lead" edit={edit} path={['description']} placeholder="Short description" />
      ) : null}
    </div>
  )
}

const logoFields = [text('logo', 'Wordmark'), image('logoImage', 'Logo image'), link('logoUrl', 'Logo link')]

function CorewaveLogo({ props }: { props: Record<string, unknown> }) {
  const edit = editOf(props)
  const src = str(props.logoImage)
  return (
    <a className="ud-cw-logo" href={str(props.logoUrl, '/')}>
      {src ? (
        <span className="ud-cw-logo__img">
          <img src={src} alt={str(props.logo, 'Logo')} />
          <EditableImage edit={edit} path={['logoImage']} current={src} label="Replace logo" />
        </span>
      ) : (
        <span className="ud-cw-logo__mark" aria-hidden />
      )}
      <EditableText edit={edit} path={['logo']} value={str(props.logo, 'Corewave')} as="span" className="ud-cw-logo__name" placeholder="Brand" />
    </a>
  )
}

/* --------------------------------------------------------------- navbar.corewave */

export const navbarCorewave = defineBlock({
  type: 'navbar.corewave',
  version: 1,
  category: 'navigation',
  label: 'Corewave navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Corewave',
    logoImage: '',
    logoUrl: '/',
    links: [
      { label: 'Home', url: '/' },
      { label: 'Services', url: '/services' },
      { label: 'Projects', url: '/projects' },
      { label: 'Testimonials', url: '/testimonials' },
      { label: 'Contact', url: '/contact' },
    ],
    secondaryLabel: 'Join the community',
    secondaryUrl: '/contact',
    buttonLabel: 'Get in touch',
    buttonUrl: '/contact',
    sticky: true,
    animation: 'fade-down',
    animationTrigger: 'load',
  },
  schema: schema(
    ...logoFields,
    navLinksField('links', 'Links'),
    text('secondaryLabel', 'Secondary link label'),
    link('secondaryUrl', 'Secondary link'),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    stickyField,
  ),
  component: function NavbarCorewave(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    return (
      <header className={cx('ud-cw', 'ud-cw-nav', bool(props.sticky, true) && 'ud-cw-nav--sticky')} style={sectionVars(props, 'default') as CSSProperties}>
        <div className="ud-container ud-cw-nav__bar">
          <CorewaveLogo props={props} />
          <nav className={cx('ud-cw-nav__links', open && 'is-open')} aria-label="Primary">
            {items(props.links, []).map((item, index) => (
              <a key={index} className="ud-cw-nav__link" href={str(item.url, '#')}>
                <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
              </a>
            ))}
            <a className="ud-cw-nav__secondary" href={str(props.secondaryUrl, '#')}>
              <EditableText edit={edit} path={['secondaryLabel']} value={str(props.secondaryLabel)} placeholder="Secondary link" />
            </a>
          </nav>
          <div className="ud-cw-nav__end">
            {str(props.buttonLabel) || edit ? (
              <Button href={str(props.buttonUrl, '#')} variant="primary" className="ud-cw-nav__cta">
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
              </Button>
            ) : null}
            <button
              type="button"
              className="ud-cw-nav__toggle"
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

/* ----------------------------------------------------------- pagehead.corewave */

export const pageHeadCorewave = defineBlock({
  type: 'pagehead.corewave',
  version: 1,
  category: 'hero',
  label: 'Corewave page header',
  icon: 'Layout',
  defaultProps: {
    heading: 'About Us',
    homeLabel: 'Home',
    homeUrl: '/',
    parentLabel: 'Pages',
  },
  schema: schema(headingField, text('homeLabel', 'Home link label'), link('homeUrl', 'Home link'), text('parentLabel', 'Middle crumb label')),
  component: function PageHeadCorewave(props) {
    const edit = editOf(props)
    const heading = str(props.heading, 'Page')
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-cw ud-cw-pagehead">
        <EditableText edit={edit} path={['heading']} value={heading} as="h1" className="ud-cw-title ud-cw-title--xl" placeholder="Page title" />
        <nav className="ud-cw-crumbs" aria-label="Breadcrumb">
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

/* -------------------------------------------------------------- hero.corewave */

export const heroCorewave = defineBlock({
  type: 'hero.corewave',
  version: 1,
  category: 'hero',
  label: 'Corewave gradient-blob hero',
  icon: 'Sparkles',
  defaultProps: {
    heading: 'Developing eCommerce websites, apps and',
    headingHighlight: 'tailor-made',
    headingEnd: 'digital solutions.',
    buttonLabel: 'Start a project',
    buttonUrl: '/contact',
    items: [
      { icon: 'palette', title: 'Web Design', text: 'Clean, conversion-focused sites built on a design system that scales with your brand.' },
      { icon: 'cart', title: 'eCommerce', text: 'Storefronts tuned for checkout speed, search ranking and repeat customers.' },
      { icon: 'lock', title: 'Support', text: 'A dedicated team on call for updates, security patches and new features.' },
    ],
  },
  schema: schema(
    headingField,
    text('headingHighlight', 'Highlighted phrase'),
    text('headingEnd', 'Heading — after the highlight'),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    repeater('items', 'Feature bullets', [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Description')], { itemLabel: 'Bullet' }),
  ),
  component: function HeroCorewave(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-cw ud-cw-hero">
        <div className="ud-cw-hero__card">
          <h1 className="ud-cw-title ud-cw-title--xl">
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="span" placeholder="Headline" />{' '}
            {str(props.headingHighlight) || edit ? (
              <EditableText edit={edit} path={['headingHighlight']} value={str(props.headingHighlight)} as="span" className="ud-cw-title__mark" placeholder="highlight" />
            ) : null}{' '}
            <EditableText edit={edit} path={['headingEnd']} value={str(props.headingEnd)} as="span" placeholder="…" />
          </h1>
          {str(props.buttonLabel) || edit ? (
            <Button href={str(props.buttonUrl, '#')} variant="primary" className="ud-cw-hero__cta">
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
              <Icon name="arrow" size={14} />
            </Button>
          ) : null}
        </div>
        <div className="ud-cw-hero__bullets">
          {rows.map((item, index) => (
            <div key={index} className="ud-cw-bullet">
              <span className="ud-cw-bullet__icon" aria-hidden>
                <Icon name={str(item.icon, 'palette')} size={18} />
              </span>
              <p>
                <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="strong" placeholder="Title" />{' '}
                <EditableText edit={edit} path={['items', index, 'text']} value={str(item.text)} as="span" placeholder="Description" />
              </p>
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- intro.corewave */

const introItems = [
  { icon: 'palette', title: 'Brand Strategy', text: 'We start with positioning and message before a single pixel — a brand that holds up under its own name.' },
  { icon: 'code', title: 'Development', text: 'Premium builds for web and mobile, engineered for speed and maintained long after launch.' },
  { icon: 'cpu', title: 'Mobile Apps', text: 'Native-feel interfaces shaped by real usage data, tested through iteration, not guesswork.' },
]

export const introCorewave = defineBlock({
  type: 'intro.corewave',
  version: 1,
  category: 'features',
  label: 'Corewave services intro',
  icon: 'Layers',
  defaultProps: {
    badgeLabel: 'Design Services',
    heading: 'New',
    headingHighlight: 'ways',
    headingEnd: 'to build.',
    description: 'Corewave is a product studio that designs and develops eCommerce websites, apps and tailor-made digital solutions.',
    items: introItems,
  },
  schema: schema(
    text('badgeLabel', 'Badge label'),
    headingField,
    text('headingHighlight', 'Highlighted word'),
    text('headingEnd', 'Heading — after the highlight'),
    descriptionField,
    repeater('items', 'Services', [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Description')], { itemLabel: 'Service' }),
  ),
  component: function IntroCorewave(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-cw ud-cw-intro">
        <CwHead props={props} align="center" />
        <Grid cols={Math.min(rows.length || 1, 3)} gap={32} style={{ marginTop: 44, textAlign: 'left' }}>
          {rows.map((item, index) => (
            <div key={index} className="ud-cw-service">
              <span className="ud-cw-service__icon" aria-hidden>
                <Icon name={str(item.icon, 'palette')} size={20} />
              </span>
              <Heading level={4} edit={edit} path={['items', index, 'title']}>
                {str(item.title, 'Service')}
              </Heading>
              <SafeText value={item.text} className="ud-cw-service__text" edit={edit} path={['items', index, 'text']} placeholder="Description" />
            </div>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* ----------------------------------------------------------- creative.corewave */

const creativeItems = [
  { label: 'Development Services', title: 'Mobile Development', image: '', url: '/services' },
  { label: 'Brand Identity', title: 'Branding Strategy', image: '', url: '/services' },
  { label: 'Creative Direction', title: 'Art Direction', image: '', url: '/services' },
]

export const creativeCorewave = defineBlock({
  type: 'creative.corewave',
  version: 1,
  category: 'services',
  label: 'Corewave blob-photo services',
  icon: 'Image',
  defaultProps: {
    badgeLabel: 'Creative Services',
    items: creativeItems,
  },
  schema: schema(
    text('badgeLabel', 'Badge label'),
    repeater('items', 'Services', [image('image', 'Photo'), text('label', 'Category label'), text('title', 'Title'), link('url', 'Link')], { itemLabel: 'Service' }),
  ),
  component: function CreativeCorewave(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="surface" className="ud-cw ud-cw-creative">
        {str(props.badgeLabel) || edit ? (
          <span className="ud-cw-badge">
            <EditableText edit={edit} path={['badgeLabel']} value={str(props.badgeLabel)} placeholder="Badge" />
          </span>
        ) : null}
        <Grid cols={Math.min(rows.length || 1, 3)} gap={24} style={{ marginTop: 24 }}>
          {rows.map((item, index) => (
            <div key={index} className="ud-cw-creative-card">
              <Media src={item.image} alt={str(item.title)} ratio="square" className="ud-cw-creative-card__img" edit={edit} path={['items', index, 'image']} />
              <span className="ud-cw-creative-card__label">
                <EditableText edit={edit} path={['items', index, 'label']} value={str(item.label)} placeholder="Category" />
              </span>
              <Heading level={4} edit={edit} path={['items', index, 'title']}>
                {str(item.title, 'Service')}
              </Heading>
              <a className="ud-cw-creative-card__link" href={str(item.url, '#')}>
                Learn more
              </a>
            </div>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* ----------------------------------------------------------- projects.corewave */

const projectItems = [
  { title: 'Skyline Air', category: 'Branding', image: '', url: '/projects' },
  { title: 'Continuum', category: 'Illustration', image: '', url: '/projects' },
  { title: 'Nova Interface', category: 'Product Design', image: '', url: '/projects' },
  { title: 'Pulse Fintech', category: 'Web Design', image: '', url: '/projects' },
]

export const galleryCorewave = defineBlock({
  type: 'projects.corewave',
  version: 1,
  category: 'gallery',
  label: 'Corewave project gallery',
  icon: 'Image',
  defaultProps: {
    badgeLabel: 'Selected Projects',
    heading: 'Some of the projects',
    headingHighlight: '',
    headingEnd: "we're proud of.",
    moreLabel: 'See more',
    moreUrl: '/projects',
    items: projectItems,
  },
  schema: schema(
    text('badgeLabel', 'Badge label'),
    headingField,
    text('headingHighlight', 'Highlighted word (optional)'),
    text('headingEnd', 'Heading — after the highlight'),
    text('moreLabel', '"See more" label'),
    link('moreUrl', '"See more" link'),
    repeater('items', 'Projects', [image('image', 'Image'), text('title', 'Title'), text('category', 'Category'), link('url', 'Link')], { itemLabel: 'Project' }),
  ),
  component: function GalleryCorewave(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-cw ud-cw-projects">
        <div className="ud-cw-projects__head">
          <CwHead props={props} align="left" />
          {str(props.moreLabel) || edit ? (
            <a className="ud-cw-projects__more" href={str(props.moreUrl, '#')}>
              <EditableText edit={edit} path={['moreLabel']} value={str(props.moreLabel)} placeholder="See more" />
              <Icon name="arrow" size={14} />
            </a>
          ) : null}
        </div>
        <div className="ud-cw-projects__grid">
          {rows.map((item, index) => (
            <a key={index} className="ud-cw-project" href={str(item.url, '#')}>
              <Media src={item.image} alt={str(item.title)} ratio="portrait" className="ud-cw-project__img" edit={edit} path={['items', index, 'image']} />
              <span className="ud-cw-project__caption">
                <Heading level={4} edit={edit} path={['items', index, 'title']}>
                  {str(item.title, 'Project')}
                </Heading>
                <EditableText edit={edit} path={['items', index, 'category']} value={str(item.category)} as="span" className="ud-cw-project__tag" placeholder="Category" />
              </span>
            </a>
          ))}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------ process.corewave */

export const processCorewave = defineBlock({
  type: 'process.corewave',
  version: 1,
  category: 'features',
  label: 'Corewave ghost-numeral steps',
  icon: 'ListChecks',
  defaultProps: {
    items: [
      { step: '1', title: 'Kickoff & Discovery', text: 'We map goals, users and constraints before any design work begins.' },
      { step: '2', title: 'Design & Prototype', text: 'Clickable prototypes get tested with real users before a line of code ships.' },
      { step: '3', title: 'Build & Ship', text: 'Weekly builds, staged reviews and a launch checklist that leaves nothing to chance.' },
    ],
  },
  schema: schema(repeater('items', 'Steps', [text('step', 'Step number'), text('title', 'Title'), textarea('text', 'Description')], { itemLabel: 'Step' })),
  component: function ProcessCorewave(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-cw ud-cw-process">
        <div className="ud-cw-process__list">
          {rows.map((item, index) => (
            <div key={index} className="ud-cw-step">
              <span className="ud-cw-step__ghost" aria-hidden>
                {str(item.step, String(index + 1))}
              </span>
              <span className="ud-cw-step__label">
                Step <EditableText edit={edit} path={['items', index, 'step']} value={str(item.step, String(index + 1))} placeholder="1" />
              </span>
              <Heading level={3} edit={edit} path={['items', index, 'title']}>
                {str(item.title, 'Step')}
              </Heading>
              <SafeText value={item.text} className="ud-cw-lead" edit={edit} path={['items', index, 'text']} placeholder="Description" />
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- vision.corewave */

export const visionCorewave = defineBlock({
  type: 'vision.corewave',
  version: 1,
  category: 'content',
  label: 'Corewave vision statement',
  icon: 'Info',
  defaultProps: {
    badgeLabel: 'Our Vision',
    heading: 'Great products come from',
    headingHighlight: 'obsessive craft',
    headingEnd: 'and honest feedback.',
    description: 'We marry creative insight with data to deliver successful user experiences. Through a process of iteration and prototyping, we design interfaces that bring joy to people while helping them get things done.',
    image: '',
  },
  schema: schema(
    text('badgeLabel', 'Badge label'),
    headingField,
    text('headingHighlight', 'Highlighted phrase'),
    text('headingEnd', 'Heading — after the highlight'),
    descriptionField,
    image('image', 'Photo'),
  ),
  component: function VisionCorewave(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="surface" className="ud-cw ud-cw-vision">
        <CwHead props={props} align="left" />
        <Media src={props.image} alt="" ratio="ultrawide" className="ud-cw-vision__img" edit={edit} path={['image']} />
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------- testimonials.corewave */

export const testimonialsCorewave = defineBlock({
  type: 'testimonials.corewave',
  version: 1,
  category: 'testimonials',
  label: 'Corewave tinted quote grid',
  icon: 'Quote',
  defaultProps: {
    badgeLabel: 'Testimonials',
    heading: 'People',
    headingHighlight: '',
    headingEnd: 'are talking.',
    ratingLabel: 'Rated 4.9 out of 5 on Trustpilot',
    items: [
      { quote: 'Corewave took our half-formed idea and shipped a store that converts better than anything we tried before. Communication was excellent the whole way through.', name: 'Priya Malhotra', role: 'Founder, Loomcraft', image: '', tint: 'mint' },
      { quote: "Every request got a same-day reply, and the fixes actually held. It's rare to find a team this responsive after launch.", name: 'Owen Marsh', role: 'Head of Growth, Fenwick & Co', image: '', tint: 'peach' },
      { quote: "I'm early in building my second product with them and already impressed by how fast questions get answered. That responsiveness is what keeps us coming back.", name: 'Aiko Tanaka', role: 'Product Lead, Driftline', image: '', tint: 'lavender' },
      { quote: 'Simply the best build process we have run. Every round of feedback came back fast, and the finished app is the fastest thing we ship.', name: 'Marcus Webb', role: 'CTO, Ravel Labs', image: '', tint: 'mint' },
    ],
  },
  schema: schema(
    text('badgeLabel', 'Badge label'),
    headingField,
    text('headingHighlight', 'Highlighted word (optional)'),
    text('headingEnd', 'Heading — after the highlight'),
    text('ratingLabel', 'Rating badge text'),
    repeater(
      'items',
      'Quotes',
      [image('image', 'Photo'), textarea('quote', 'Quote'), text('name', 'Name'), text('role', 'Role'), text('tint', 'Card tint (mint / peach / lavender)')],
      { itemLabel: 'Quote' },
    ),
  ),
  component: function TestimonialsCorewave(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const [visible, setVisible] = useState(0)
    const perPage = 3
    const pages = Math.max(Math.ceil(rows.length / perPage), 1)
    const page = Math.min(visible, pages - 1)
    const shown = rows.slice(page * perPage, page * perPage + perPage)
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-cw ud-cw-testimonials">
        <CwHead props={props} align="center" />
        {str(props.ratingLabel) || edit ? (
          <span className="ud-cw-rating">
            <Stars count={5} />
            <EditableText edit={edit} path={['ratingLabel']} value={str(props.ratingLabel)} placeholder="Rating" />
          </span>
        ) : null}
        <div className="ud-cw-quotes">
          {shown.map((item, shownIndex) => {
            const index = page * perPage + shownIndex
            return (
              <div key={index} className={cx('ud-cw-quote', `ud-cw-quote--${str(item.tint, 'mint')}`)}>
                <Icon name="quote" size={22} filled />
                <SafeText value={str(item.quote)} className="ud-cw-quote__text" edit={edit} path={['items', index, 'quote']} placeholder="Quote" />
                <div className="ud-cw-quote__person">
                  <Media src={item.image} alt={str(item.name)} ratio="square" className="ud-cw-quote__avatar" edit={edit} path={['items', index, 'image']} />
                  <span>
                    <EditableText edit={edit} path={['items', index, 'name']} value={str(item.name)} as="strong" placeholder="Name" />
                    <EditableText edit={edit} path={['items', index, 'role']} value={str(item.role)} as="span" className="ud-cw-quote__role" placeholder="Role" />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        {pages > 1 ? (
          <div className="ud-cw-quotes__dots">
            {Array.from({ length: pages }).map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                className={cx('ud-cw-quotes__dot', dotIndex === page && 'is-active')}
                aria-label={`Show testimonials page ${dotIndex + 1}`}
                onClick={() => setVisible(dotIndex)}
              />
            ))}
          </div>
        ) : null}
      </SectionShell>
    )
  },
  settings: null,
})

/* ----------------------------------------------------------- brands.corewave */

export const brandsCorewave = defineBlock({
  type: 'brands.corewave',
  version: 1,
  category: 'content',
  label: 'Corewave trusted-by strip',
  icon: 'Award',
  defaultProps: {
    heading: 'Trusted by global brands.',
    subheading: 'Join thousands of teams already building with Corewave.',
    items: [{ name: 'Nordly' }, { name: 'Ashfield' }, { name: 'Ferro & Co' }, { name: 'Larkspur' }, { name: 'Vantree' }],
  },
  schema: schema(text('heading', 'Heading'), text('subheading', 'Subheading'), repeater('items', 'Brands', [text('name', 'Name')], { itemLabel: 'Brand' })),
  component: function BrandsCorewave(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-cw ud-cw-brands">
        <p className="ud-cw-brands__lead">
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="span" placeholder="Heading" />{' '}
          <EditableText edit={edit} path={['subheading']} value={str(props.subheading)} as="span" className="ud-cw-brands__lead-muted" placeholder="Subheading" />
        </p>
        <div className="ud-cw-brands__row">
          {rows.map((item, index) => (
            <span key={index} className="ud-cw-brands__name">
              <EditableText edit={edit} path={['items', index, 'name']} value={str(item.name)} placeholder="Brand" />
            </span>
          ))}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------ footer.corewave */

export const footerCorewave = defineBlock({
  type: 'footer.corewave',
  version: 1,
  category: 'footer',
  label: 'Corewave dark footer',
  icon: 'Layout',
  defaultProps: {
    columns: [
      {
        title: 'Company',
        links: [
          { label: 'Contact Us', url: '/contact' },
          { label: 'FAQ', url: '#' },
          { label: 'About Us', url: '/about' },
        ],
      },
      {
        title: 'Support',
        links: [
          { label: 'Privacy Policy', url: '#' },
          { label: 'Careers', url: '#' },
          { label: 'Community', url: '#' },
        ],
      },
    ],
    helpLabel: 'Need help?',
    phone: '+1 (234) 567 8901',
    email: 'hello@corewave.example',
    communityHeading: 'Join the community',
    communityText: 'Get product updates, invites to events and early access to new features.',
    communityButtonLabel: 'Join the community',
    communityButtonUrl: '/contact',
    social: [
      { label: 'Instagram', url: '#' },
      { label: 'Twitter', url: '#' },
      { label: 'LinkedIn', url: '#' },
      { label: 'Facebook', url: '#' },
    ],
    copyright: 'Corewave. All images are for demo purposes.',
  },
  schema: schema(
    repeater(
      'columns',
      'Link columns',
      [text('title', 'Column title'), repeater('links', 'Links', [text('label', 'Label'), link('url', 'Link')], { itemLabel: 'Link' })],
      { itemLabel: 'Column' },
    ),
    text('helpLabel', 'Help label'),
    text('phone', 'Phone'),
    text('email', 'Email'),
    text('communityHeading', 'Community card heading'),
    textarea('communityText', 'Community card text'),
    text('communityButtonLabel', 'Community button label'),
    link('communityButtonUrl', 'Community button link'),
    repeater('social', 'Social links', [text('label', 'Label'), link('url', 'Link')], { itemLabel: 'Link' }),
    text('copyright', 'Copyright (after the ©)'),
  ),
  component: function FooterCorewave(props) {
    const edit = editOf(props)
    const columns = items(props.columns, [])
    const social = items(props.social, [])
    const email = str(props.email)
    const phone = str(props.phone)
    return (
      <footer className="ud-cw ud-cw-footer">
        <div className="ud-container">
          <div className="ud-cw-footer__grid">
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="ud-cw-footer__col">
                <EditableText edit={edit} path={['columns', colIndex, 'title']} value={str(column.title)} as="span" className="ud-cw-footer__col-title" placeholder="Column" />
                <ul>
                  {items(column.links, []).map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href={str(link.url, '#')}>
                        <EditableText edit={edit} path={['columns', colIndex, 'links', linkIndex, 'label']} value={str(link.label)} placeholder="Link" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="ud-cw-footer__col">
              <span className="ud-cw-footer__col-title">
                <EditableText edit={edit} path={['helpLabel']} value={str(props.helpLabel, 'Need help?')} placeholder="Need help?" />
              </span>
              {phone || edit ? (
                <a className="ud-cw-footer__contact" href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
                  <EditableText edit={edit} path={['phone']} value={phone} placeholder="Phone" />
                </a>
              ) : null}
              {email || edit ? (
                <a className="ud-cw-footer__contact" href={`mailto:${email}`}>
                  <EditableText edit={edit} path={['email']} value={email} placeholder="Email" />
                </a>
              ) : null}
            </div>
            <div className="ud-cw-footer__community">
              <EditableText edit={edit} path={['communityHeading']} value={str(props.communityHeading)} as="h3" placeholder="Heading" />
              <SafeText value={str(props.communityText)} edit={edit} path={['communityText']} placeholder="Description" />
              {str(props.communityButtonLabel) || edit ? (
                <Button href={str(props.communityButtonUrl, '#')} variant="accent" className="ud-cw-footer__community-btn">
                  <EditableText edit={edit} path={['communityButtonLabel']} value={str(props.communityButtonLabel)} placeholder="Button" />
                </Button>
              ) : null}
            </div>
          </div>
          <div className="ud-cw-footer__base">
            <CorewaveLogo props={props} />
            <p>
              &copy;{' '}
              <EditableText edit={edit} path={['copyright']} value={str(props.copyright, 'Corewave. All rights reserved.')} placeholder="Studio, All rights reserved." />
            </p>
            {social.length ? (
              <div className="ud-cw-footer__social">
                {social.map((item, index) => (
                  <a key={index} href={str(item.url, '#')} aria-label={str(item.label)}>
                    <Icon name={str(item.label).toLowerCase()} size={16} />
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
