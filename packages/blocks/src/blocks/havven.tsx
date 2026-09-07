/**
 * Havven — a digital-agency and creative-studio template.
 *
 * Visual language: a warm cream page with white cards, one near-black forest
 * ink carrying every heading, pill button and dark band, bold tight-tracked
 * Plus Jakarta Sans headlines over plain Inter body copy, pill badges with a
 * hairline border above every section heading, and every primary button
 * paired with a small circular arrow badge.
 *
 * Every block routes through `schema()`, which appends the shared design /
 * typography / background / spacing / content-width controls, so each one is
 * editable on the canvas and in the side panel and stays reusable on any
 * page. Buttons, grids and media reuse the shared primitives (`Button`,
 * `CtaGroup`, `Grid`, `Media`) rather than bespoke components, so the family
 * recolours from theme tokens instead of hard-coded styling.
 */
import { useState, type CSSProperties } from 'react'
import { EditableImage, EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Button,
  Grid,
  Heading,
  Media,
  SafeText,
  SectionShell,
  bool,
  cx,
  items,
  sectionVars,
  str,
} from '../primitives'
import { PublicForm } from '../public-form'
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

function HvHead({ props, align = 'center' }: { props: Record<string, unknown>; align?: 'left' | 'center' }) {
  const edit = editOf(props)
  const badge = str(props.badgeLabel)
  const heading = str(props.heading)
  const description = str(props.description)
  if (!edit && !heading && !description && !badge) return null
  return (
    <div className={cx('ud-hv-head', align === 'center' && 'ud-hv-head--center')}>
      {badge || edit ? (
        <span className="ud-hv-badge">
          <EditableText edit={edit} path={['badgeLabel']} value={badge} placeholder="Badge" />
        </span>
      ) : null}
      {heading || edit ? (
        <EditableText edit={edit} path={['heading']} value={heading} as="h2" className="ud-hv-title" placeholder="Heading" />
      ) : null}
      {description || edit ? (
        <SafeText value={description} className="ud-hv-lead" edit={edit} path={['description']} placeholder="Short description" />
      ) : null}
    </div>
  )
}

const logoFields = [text('logo', 'Wordmark'), image('logoImage', 'Logo image'), link('logoUrl', 'Logo link')]

function HavvenLogo({ props }: { props: Record<string, unknown> }) {
  const edit = editOf(props)
  const src = str(props.logoImage)
  return (
    <a className="ud-hv-logo" href={str(props.logoUrl, '/')}>
      {src ? (
        <span className="ud-hv-logo__img">
          <img src={src} alt={str(props.logo, 'Logo')} />
          <EditableImage edit={edit} path={['logoImage']} current={src} label="Replace logo" />
        </span>
      ) : (
        <span className="ud-hv-logo__mark" aria-hidden>
          <i />
          <i />
        </span>
      )}
      <EditableText edit={edit} path={['logo']} value={str(props.logo, 'Havven')} as="span" className="ud-hv-logo__name" placeholder="Brand" />
    </a>
  )
}

/* ---------------------------------------------------------- navbar.havven */

export const navbarHavven = defineBlock({
  type: 'navbar.havven',
  version: 1,
  category: 'navigation',
  label: 'Havven navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Havven',
    logoImage: '',
    logoUrl: '/',
    links: [
      { label: 'Home', url: '/' },
      { label: 'About', url: '/about' },
      { label: 'Services', url: '/services' },
      { label: 'Projects', url: '/projects' },
      { label: 'Contact', url: '/contact' },
    ],
    buttonLabel: 'Get In Touch',
    buttonUrl: '/contact',
    sticky: true,
    animation: 'fade-down',
    animationTrigger: 'load',
  },
  schema: schema(...logoFields, navLinksField('links', 'Links'), text('buttonLabel', 'Button label'), link('buttonUrl', 'Button link'), stickyField),
  component: function NavbarHavven(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    return (
      <header className={cx('ud-hv', 'ud-hv-nav', bool(props.sticky, true) && 'ud-hv-nav--sticky')} style={sectionVars(props, 'default') as CSSProperties}>
        <div className="ud-container ud-hv-nav__bar">
          <HavvenLogo props={props} />
          <nav className={cx('ud-hv-nav__links', open && 'is-open')} aria-label="Primary">
            {items(props.links, []).map((item, index) => (
              <a key={index} className="ud-hv-nav__link" href={str(item.url, '#')}>
                <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
              </a>
            ))}
          </nav>
          <div className="ud-hv-nav__end">
            {str(props.buttonLabel) || edit ? (
              <Button href={str(props.buttonUrl, '#')} variant="primary" className="ud-hv-nav__cta">
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
                <span className="ud-hv-arrow" aria-hidden>
                  <Icon name="arrow" size={13} />
                </span>
              </Button>
            ) : null}
            <button
              type="button"
              className="ud-hv-nav__toggle"
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

/* ----------------------------------------------------------- pagehead.havven */

export const pageHeadHavven = defineBlock({
  type: 'pagehead.havven',
  version: 1,
  category: 'hero',
  label: 'Havven page header',
  icon: 'Layout',
  defaultProps: {
    heading: 'About Us',
    homeLabel: 'Home',
    homeUrl: '/',
    parentLabel: 'Pages',
  },
  schema: schema(headingField, text('homeLabel', 'Home link label'), link('homeUrl', 'Home link'), text('parentLabel', 'Middle crumb label')),
  component: function PageHeadHavven(props) {
    const edit = editOf(props)
    const heading = str(props.heading, 'Page')
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-hv ud-hv-pagehead">
        <EditableText edit={edit} path={['heading']} value={heading} as="h1" className="ud-hv-title ud-hv-title--xl" placeholder="Page title" />
        <nav className="ud-hv-crumbs" aria-label="Breadcrumb">
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

/* -------------------------------------------------------------- hero.havven */

export const heroHavven = defineBlock({
  type: 'hero.havven',
  version: 1,
  category: 'hero',
  label: 'Havven proof-card hero',
  icon: 'Sparkles',
  defaultProps: {
    badgeLabel: 'Grow Business with us',
    heading: 'Empowering brands in the digital age.',
    description: 'At our digital agency, we blend creativity, strategy, and technology to build impactful digital experiences that drive into the digital results.',
    buttonLabel: 'Explore Our Works',
    buttonUrl: '/projects',
    reviewCount: '150+ Reviews',
    reviewText: 'by over 2500+ global satisfied clients',
    platformLabel: 'Provento',
    clientsLabel: 'Trusted global clients',
    avatars: [{ image: '' }, { image: '' }, { image: '' }, { image: '' }],
  },
  schema: schema(
    text('badgeLabel', 'Badge label'),
    headingField,
    descriptionField,
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    text('reviewCount', 'Review count label'),
    text('reviewText', 'Review sub text'),
    text('platformLabel', 'Review platform wordmark'),
    text('clientsLabel', 'Clients label'),
    repeater('avatars', 'Client avatars', [image('image', 'Photo')], { itemLabel: 'Avatar' }),
  ),
  component: function HeroHavven(props) {
    const edit = editOf(props)
    const avatars = items(props.avatars, [])
    return (
      <SectionShell props={props} tone="default" className="ud-hv ud-hv-hero">
        <div className="ud-hv-hero__inner">
          <div className="ud-hv-hero__copy">
            {str(props.badgeLabel) || edit ? (
              <span className="ud-hv-badge">
                <EditableText edit={edit} path={['badgeLabel']} value={str(props.badgeLabel)} placeholder="Badge" />
              </span>
            ) : null}
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h1" className="ud-hv-title ud-hv-title--xl" placeholder="Headline" />
            {str(props.description) || edit ? (
              <SafeText value={str(props.description)} className="ud-hv-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
            ) : null}
            {str(props.buttonLabel) || edit ? (
              <Button href={str(props.buttonUrl, '#')} variant="primary" className="ud-hv-hero__cta">
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
                <span className="ud-hv-arrow" aria-hidden>
                  <Icon name="arrow" size={14} />
                </span>
              </Button>
            ) : null}
          </div>
          <div className="ud-hv-hero__aside">
            <div className="ud-hv-proof">
              <div className="ud-hv-proof__stars" aria-hidden>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Icon key={index} name="star" size={16} filled />
                ))}
              </div>
              <span className="ud-hv-proof__count">
                <EditableText edit={edit} path={['reviewCount']} value={str(props.reviewCount)} as="span" placeholder="150+ Reviews" />
              </span>
              {str(props.reviewText) || edit ? (
                <p className="ud-hv-proof__text">
                  <EditableText edit={edit} path={['reviewText']} value={str(props.reviewText)} placeholder="by over 2500+ clients" />
                </p>
              ) : null}
              {str(props.platformLabel) || edit ? (
                <EditableText edit={edit} path={['platformLabel']} value={str(props.platformLabel)} as="p" className="ud-hv-proof__platform" placeholder="Platform" />
              ) : null}
              <hr className="ud-hv-proof__rule" />
              {str(props.clientsLabel) || edit ? (
                <p className="ud-hv-proof__clients">
                  <EditableText edit={edit} path={['clientsLabel']} value={str(props.clientsLabel)} placeholder="Trusted global clients" />
                </p>
              ) : null}
              {avatars.length ? (
                <div className="ud-hv-proof__avatars">
                  {avatars.map((avatar, index) => (
                    <Media key={index} src={avatar.image} alt="" ratio="square" className="ud-hv-proof__avatar" edit={edit} path={['avatars', index, 'image']} />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- about.havven */

export const aboutHavven = defineBlock({
  type: 'about.havven',
  version: 1,
  category: 'content',
  label: 'Havven centered statement',
  icon: 'Info',
  defaultProps: {
    badgeLabel: 'About Us',
    heading: "We believe in collaboration, innovation, and results. Every brand has a story, and we're here to help you tell it in the most powerful and effective way possible.",
  },
  schema: schema(text('badgeLabel', 'Badge label'), headingField),
  component: function AboutHavven(props) {
    return (
      <SectionShell props={props} tone="surface" align="center" className="ud-hv ud-hv-about">
        <HvHead props={props} align="center" />
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- video.havven */

export const videoHavven = defineBlock({
  type: 'video.havven',
  version: 1,
  category: 'content',
  label: 'Havven video band',
  icon: 'Play',
  defaultProps: {
    image: '',
    videoUrl: '#',
  },
  schema: schema(image('image', 'Photo'), link('videoUrl', 'Video link')),
  component: function VideoHavven(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" className="ud-hv ud-hv-video" bleed>
        <div className="ud-container">
          <a className="ud-hv-video__frame" href={str(props.videoUrl, '#')}>
            <Media src={props.image} alt="" ratio="ultrawide" edit={edit} path={['image']} />
            <span className="ud-hv-play" aria-hidden>
              <Icon name="play" size={20} filled />
            </span>
          </a>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------- features.havven */

const agencyFeatures = [
  { icon: 'users', tag: 'support', title: 'Dedicated Team Member', text: 'Our success powered by passionate team creative minds, technical experts and strategic design thinkers.', image: '' },
  { icon: 'palette', tag: 'design', title: 'Top-notch UI/UX Design', text: 'We create intuitive user-centered UI/UX designs that not only look stunning but seamless digital experiences.', image: '' },
  { icon: 'zap', tag: 'Timely delivery', title: 'Quick & First Delivery', text: "We move fast because your goals can't wait. Our team is committed to delivering high-quality digital solutions.", image: '' },
]

export const featuresHavven = defineBlock({
  type: 'features.havven',
  version: 1,
  category: 'features',
  label: 'Havven tagged feature cards',
  icon: 'Layers',
  defaultProps: {
    items: agencyFeatures,
  },
  schema: schema(
    repeater('items', 'Features', [icon('icon', 'Icon'), image('image', 'Photo (optional)'), text('tag', 'Tag'), text('title', 'Title'), textarea('text', 'Description')], {
      itemLabel: 'Feature',
    }),
  ),
  component: function FeaturesHavven(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-hv ud-hv-features">
        <Grid cols={Math.min(rows.length || 1, 3)} gap={24}>
          {rows.map((item, index) => (
            <div key={index} className="ud-hv-feature">
              <div className="ud-hv-feature__top">
                {item.image ? (
                  <Media src={item.image} alt="" ratio="square" className="ud-hv-feature__img" edit={edit} path={['items', index, 'image']} />
                ) : (
                  <span className="ud-hv-feature__icon" aria-hidden>
                    <Icon name={str(item.icon, 'users')} size={24} />
                  </span>
                )}
                {str(item.tag) || edit ? (
                  <span className="ud-hv-feature__tag">
                    (<EditableText edit={edit} path={['items', index, 'tag']} value={str(item.tag)} placeholder="tag" />)
                  </span>
                ) : null}
              </div>
              <Heading level={4} edit={edit} path={['items', index, 'title']}>
                {str(item.title, 'Feature')}
              </Heading>
              <SafeText value={item.text} className="ud-hv-feature__text" edit={edit} path={['items', index, 'text']} placeholder="Description" />
            </div>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- stats.havven */

export const statsHavven = defineBlock({
  type: 'stats.havven',
  version: 1,
  category: 'features',
  label: 'Havven counter row',
  icon: 'TrendingUp',
  defaultProps: {
    items: [
      { value: '5800', suffix: '+', tag: 'Project complete', text: 'We have a proven track record delivering our projects' },
      { value: '3600', suffix: '+', tag: 'Clients satisfactions', text: 'Client-first approach ensures every project is handled' },
    ],
  },
  schema: schema(repeater('items', 'Counters', [text('value', 'Value'), text('suffix', 'Suffix'), text('tag', 'Tag'), textarea('text', 'Description')], { itemLabel: 'Counter' })),
  component: function StatsHavven(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-hv ud-hv-stats">
        <Grid cols={Math.min(rows.length || 1, 2)} gap={24}>
          {rows.map((item, index) => (
            <div key={index} className="ud-hv-stat">
              <span className="ud-hv-stat__tag">
                (<EditableText edit={edit} path={['items', index, 'tag']} value={str(item.tag)} placeholder="tag" />)
              </span>
              <SafeText value={item.text} className="ud-hv-lead" edit={edit} path={['items', index, 'text']} placeholder="Description" />
              <div className="ud-hv-stat__value">
                <EditableText edit={edit} path={['items', index, 'value']} value={str(item.value)} as="span" placeholder="0" />
                <EditableText edit={edit} path={['items', index, 'suffix']} value={str(item.suffix, '+')} as="span" placeholder="+" />
              </div>
            </div>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* ----------------------------------------------------------- services.havven */

export const servicesHavven = defineBlock({
  type: 'services.havven',
  version: 1,
  category: 'services',
  label: 'Havven numbered accordion services',
  icon: 'ListChecks',
  defaultProps: {
    badgeLabel: '',
    items: [
      { title: 'Branding Design', text: "Your brand is more than just a logo — it's the visual language of your business. We craft cohesive, memorable brand identities that reflect your values and resonate with your audience.", buttonLabel: 'Read more', buttonUrl: '/services' },
      { title: 'UI/UX Design', text: 'We design interfaces people actually enjoy using — research-backed, tested, and built for conversion.', buttonLabel: 'Read more', buttonUrl: '/services' },
      { title: 'Digital Marketing', text: 'Paid, organic and lifecycle marketing built around numbers you can trace back to revenue.', buttonLabel: 'Read more', buttonUrl: '/services' },
      { title: 'Web Development', text: 'Fast, accessible, maintainable builds — from marketing sites to full product platforms.', buttonLabel: 'Read more', buttonUrl: '/services' },
      { title: 'Maintenance', text: 'Ongoing updates, monitoring and support so your site stays fast and secure long after launch.', buttonLabel: 'Read more', buttonUrl: '/services' },
    ],
  },
  schema: schema(
    text('badgeLabel', 'Badge label'),
    repeater('items', 'Services', [text('title', 'Title'), textarea('text', 'Description'), text('buttonLabel', 'Link label'), link('buttonUrl', 'Link')], { itemLabel: 'Service' }),
  ),
  component: function ServicesHavven(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const [open, setOpen] = useState(0)
    return (
      <SectionShell props={props} tone="default" className="ud-hv ud-hv-services">
        <div className="ud-hv-services__list">
          {rows.map((item, index) => {
            const isOpen = Boolean(edit) || open === index
            return (
              <div key={index} className={cx('ud-hv-services__row', isOpen && 'is-open')}>
                <button type="button" className="ud-hv-services__head" aria-expanded={isOpen} onClick={() => setOpen((current) => (current === index ? -1 : index))}>
                  <span className="ud-hv-services__no">{String(index + 1).padStart(2, '0')}</span>
                  <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="span" className="ud-hv-services__title" placeholder="Service" />
                  <span className="ud-hv-services__sign" aria-hidden>
                    <Icon name={isOpen ? 'minus' : 'plus'} size={16} />
                  </span>
                </button>
                <div className="ud-hv-services__body" hidden={!isOpen}>
                  <SafeText value={str(item.text)} className="ud-text" edit={edit} path={['items', index, 'text']} placeholder="Description" />
                  {str(item.buttonLabel) || edit ? (
                    <a className="ud-hv-services__link" href={str(item.buttonUrl, '#')}>
                      <EditableText edit={edit} path={['items', index, 'buttonLabel']} value={str(item.buttonLabel)} placeholder="Read more" />
                      <Icon name="arrow" size={13} />
                    </a>
                  ) : null}
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

/* ----------------------------------------------------------- projects.havven */

const featuredWork = [
  { title: 'Hoodie Design and Branding', tags: ['printing', 'graphic'], image: '', url: '/projects' },
  { title: 'MacBook Product Mockup', tags: ['branding', 'product'], image: '', url: '/projects' },
  { title: 'Mobile Application UI/UX Design', tags: ['apps design', 'product'], image: '', url: '/projects' },
]

export const projectsHavven = defineBlock({
  type: 'projects.havven',
  version: 1,
  category: 'gallery',
  label: 'Havven project gallery',
  icon: 'Image',
  defaultProps: {
    badgeLabel: 'Latest Projects',
    heading: 'Ideas transformed into impactful products',
    items: featuredWork,
  },
  schema: schema(
    text('badgeLabel', 'Badge label'),
    headingField,
    repeater('items', 'Projects', [image('image', 'Image'), text('title', 'Title'), link('url', 'Link'), repeater('tags', 'Tags', [text('label', 'Tag')], { itemLabel: 'Tag' })], {
      itemLabel: 'Project',
    }),
  ),
  component: function ProjectsHavven(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-hv ud-hv-projects">
        <HvHead props={props} align="center" />
        <div className="ud-hv-projects__list">
          {rows.map((item, index) => (
            <a key={index} className="ud-hv-project" href={str(item.url, '#')}>
              <Media src={item.image} alt={str(item.title)} ratio="wide" className="ud-hv-project__img" edit={edit} path={['items', index, 'image']} />
              <Heading level={4} edit={edit} path={['items', index, 'title']}>
                {str(item.title, 'Project')}
              </Heading>
              <div className="ud-hv-project__tags">
                {items(item.tags, []).map((tag, tagIndex) => (
                  <span key={tagIndex} className="ud-hv-project__tag">
                    (<EditableText edit={edit} path={['items', index, 'tags', tagIndex, 'label']} value={str(tag.label)} placeholder="tag" />)
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------ process.havven */

export const processHavven = defineBlock({
  type: 'process.havven',
  version: 1,
  category: 'features',
  label: 'Havven roadmap steps',
  icon: 'ListChecks',
  defaultProps: {
    badgeLabel: 'Working Process',
    heading: 'Our roadmap to building powerful digital products easy process',
    items: [
      { step: '01', title: 'Research & Discover', text: 'We craft user-centric UI/UX designs in Figma — focusing on clean layouts, intuitive flow, and visual consistency.', image: '' },
      { step: '02', title: 'Strategy & Planning', text: 'We map the build against real deadlines and budget, so nothing gets discovered halfway through.', image: '' },
      { step: '03', title: 'Design & Build', text: 'Design and development run in parallel with weekly check-ins, not a single reveal at the end.', image: '' },
      { step: '04', title: 'Launch & Support', text: 'We stay on after launch to fix what real users find in the first weeks.', image: '' },
    ],
  },
  schema: schema(
    text('badgeLabel', 'Badge label'),
    headingField,
    repeater('items', 'Steps', [text('step', 'Step number'), text('title', 'Title'), textarea('text', 'Description'), image('image', 'Photo')], { itemLabel: 'Step' }),
  ),
  component: function ProcessHavven(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="surface" align="center" className="ud-hv ud-hv-process">
        <HvHead props={props} align="center" />
        <div className="ud-hv-process__list">
          {rows.map((item, index) => (
            <div key={index} className={cx('ud-hv-step', index % 2 === 1 && 'ud-hv-step--reverse')}>
              <div className="ud-hv-step__body">
                <span className="ud-hv-step__no">
                  (Step <EditableText edit={edit} path={['items', index, 'step']} value={str(item.step, String(index + 1).padStart(2, '0'))} placeholder="01" />)
                </span>
                <Heading level={3} edit={edit} path={['items', index, 'title']}>
                  {str(item.title, 'Step')}
                </Heading>
                <hr className="ud-hv-step__rule" />
                <SafeText value={item.text} className="ud-hv-lead" edit={edit} path={['items', index, 'text']} placeholder="Description" />
              </div>
              <Media src={item.image} alt="" ratio="square" className="ud-hv-step__img" edit={edit} path={['items', index, 'image']} />
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------------- team.havven */

export const teamHavven = defineBlock({
  type: 'team.havven',
  version: 1,
  category: 'team',
  label: 'Havven team grid',
  icon: 'Users',
  defaultProps: {
    badgeLabel: 'Team Member',
    heading: 'Talent That Transforms Ideas into Reality',
    items: [
      { name: 'Walter D. Gonzales', role: 'CEO & Founder', image: '' },
      { name: 'Arnold T. Madden', role: 'UX UI Designer', image: '' },
      { name: 'Priya Chandran', role: 'Lead Developer', image: '' },
      { name: 'Elena Marsh', role: 'Marketing Strategist', image: '' },
    ],
  },
  schema: schema(text('badgeLabel', 'Badge label'), headingField, repeater('items', 'Team', [image('image', 'Photo'), text('name', 'Name'), text('role', 'Role')], { itemLabel: 'Member' })),
  component: function TeamHavven(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-hv ud-hv-team">
        <HvHead props={props} align="left" />
        <Grid cols={Math.min(rows.length || 1, 2)} gap={24} style={{ marginTop: 40 }}>
          {rows.map((item, index) => (
            <div key={index} className="ud-hv-member">
              <Media src={item.image} alt={str(item.name)} ratio="wide" edit={edit} path={['items', index, 'image']} />
              <EditableText edit={edit} path={['items', index, 'name']} value={str(item.name)} as="h4" className="ud-h4" placeholder="Name" />
              <EditableText edit={edit} path={['items', index, 'role']} value={str(item.role)} as="p" className="ud-hv-member__role" placeholder="Role" />
            </div>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* ----------------------------------------------------------- testimonials.havven */

export const testimonialsHavven = defineBlock({
  type: 'testimonials.havven',
  version: 1,
  category: 'testimonials',
  label: 'Havven dark quote carousel',
  icon: 'Quote',
  defaultProps: {
    badgeLabel: 'Clients Testimonials',
    heading: 'Clients share their experience loud and clear',
    items: [
      { quote: "I've worked with several agencies, but this team stands out. They're fast, creative and incredibly professional.", name: 'Mark S. Bergstrom', role: 'Product Manager, SaaS Startup', image: '' },
      { quote: 'They took a vague brief and turned it into a brand we are genuinely proud of. Communication was excellent throughout.', name: 'Dana Whitfield', role: 'Founder, Retail Startup', image: '' },
      { quote: 'On time, on budget, and the finished site converts better than anything we have run before.', name: 'Ola Fatunde', role: 'Growth Lead, Fintech', image: '' },
    ],
  },
  schema: schema(text('badgeLabel', 'Badge label'), headingField, repeater('items', 'Quotes', [image('image', 'Photo'), textarea('quote', 'Quote'), text('name', 'Name'), text('role', 'Role')], { itemLabel: 'Quote' })),
  component: function TestimonialsHavven(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const [index, setIndex] = useState(0)
    const current = rows[Math.min(index, Math.max(rows.length - 1, 0))] || {}
    return (
      <SectionShell props={props} tone="dark" align="center" className="ud-hv ud-hv-testimonials">
        <HvHead props={props} align="center" />
        <div className="ud-hv-quote">
          <Media src={current.image} alt={str(current.name)} ratio="wide" className="ud-hv-quote__img" edit={edit} path={['items', index, 'image']} />
          <div className="ud-hv-quote__body">
            <Icon name="quote" size={30} filled />
            <SafeText value={str(current.quote)} className="ud-hv-quote__text" edit={edit} path={['items', index, 'quote']} placeholder="Quote" />
            <EditableText edit={edit} path={['items', index, 'name']} value={str(current.name)} as="p" className="ud-hv-quote__name" placeholder="Name" />
            <EditableText edit={edit} path={['items', index, 'role']} value={str(current.role)} as="p" className="ud-hv-quote__role" placeholder="Role" />
          </div>
        </div>
        {rows.length > 1 ? (
          <div className="ud-hv-quote__dots">
            {rows.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                className={cx('ud-hv-quote__dot', dotIndex === index && 'is-active')}
                aria-label={`Show testimonial ${dotIndex + 1}`}
                onClick={() => setIndex(dotIndex)}
              />
            ))}
          </div>
        ) : null}
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------------- blog.havven */

export const blogHavven = defineBlock({
  type: 'blog.havven',
  version: 1,
  category: 'blog',
  label: 'Havven journal cards',
  icon: 'Newspaper',
  defaultProps: {
    badgeLabel: 'Blog & News',
    heading: 'The agency journal news, views & beyond',
    items: [
      { author: 'Admin', date: 'July 23, 2025', title: 'Why Your Business Needs a Strong Digital Presence in 2025', image: '', url: '#' },
      { author: 'Admin', date: 'July 10, 2025', title: 'Five Brand Signals Clients Notice Before They Ever Call You', image: '', url: '#' },
      { author: 'Admin', date: 'June 28, 2025', title: 'What a Good Discovery Call Actually Sounds Like', image: '', url: '#' },
    ],
  },
  schema: schema(
    text('badgeLabel', 'Badge label'),
    headingField,
    repeater('items', 'Posts', [image('image', 'Image'), text('author', 'Author'), text('date', 'Date'), text('title', 'Title'), link('url', 'Link')], { itemLabel: 'Post' }),
  ),
  component: function BlogHavven(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-hv ud-hv-blog">
        <HvHead props={props} align="center" />
        <Grid cols={Math.min(rows.length || 1, 3)} gap={28} style={{ marginTop: 44 }}>
          {rows.map((item, index) => (
            <article key={index} className="ud-hv-post">
              <Media src={item.image} alt={str(item.title)} ratio="landscape" edit={edit} path={['items', index, 'image']} />
              <p className="ud-hv-post__meta">
                <EditableText edit={edit} path={['items', index, 'author']} value={str(item.author)} as="span" placeholder="Author" />
                <span aria-hidden>—</span>
                <EditableText edit={edit} path={['items', index, 'date']} value={str(item.date)} as="span" placeholder="Date" />
              </p>
              <Heading level={4} edit={edit} path={['items', index, 'title']}>
                {str(item.title, 'Post title')}
              </Heading>
              <a className="ud-hv-post__link" href={str(item.url, '#')}>
                Read more
                <span className="ud-hv-arrow" aria-hidden>
                  <Icon name="arrow" size={12} />
                </span>
              </a>
            </article>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------ footer.havven */

export const footerHavven = defineBlock({
  type: 'footer.havven',
  version: 1,
  category: 'footer',
  label: 'Havven CTA footer',
  icon: 'Layout',
  defaultProps: {
    heading: "Let's create digital success together",
    email: 'support@example.com',
    phone: '+1 (234) 456 8899',
    newsletterHeading: 'Subscribe our newsletter to get latest insights and tips',
    formId: '',
    submitLabel: 'Subscribe',
    socialLabel: 'Social Media',
    social: [
      { label: 'Instagram', url: '#' },
      { label: 'Twitter', url: '#' },
      { label: 'LinkedIn', url: '#' },
      { label: 'Facebook', url: '#' },
    ],
    copyright: 'Havven. All rights reserved.',
  },
  schema: schema(
    headingField,
    text('email', 'Email'),
    text('phone', 'Phone'),
    text('newsletterHeading', 'Newsletter heading'),
    text('submitLabel', 'Form button label'),
    text('socialLabel', 'Social label'),
    repeater('social', 'Social links', [text('label', 'Label'), link('url', 'Link')], { itemLabel: 'Link' }),
    text('copyright', 'Copyright (after the ©)'),
  ),
  component: function FooterHavven(props) {
    const edit = editOf(props)
    const email = str(props.email)
    const phone = str(props.phone)
    const social = items(props.social, [])
    return (
      <footer className="ud-hv ud-hv-footer">
        <div className="ud-container">
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-hv-title" placeholder="Heading" />
          <div className="ud-hv-footer__contact">
            {email || edit ? (
              <a href={`mailto:${email}`}>
                <EditableText edit={edit} path={['email']} value={email} placeholder="Email" />
              </a>
            ) : null}
            {phone || edit ? (
              <a href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
                <EditableText edit={edit} path={['phone']} value={phone} placeholder="Phone" />
              </a>
            ) : null}
          </div>
          <div className="ud-hv-footer__card">
            {str(props.newsletterHeading) || edit ? (
              <EditableText edit={edit} path={['newsletterHeading']} value={str(props.newsletterHeading)} as="h3" placeholder="Newsletter heading" />
            ) : null}
            <PublicForm
              formId={str(props.formId) || undefined}
              layout="inline"
              submitLabel={str(props.submitLabel, 'Subscribe')}
              edit={edit}
              submitLabelPath={['submitLabel']}
              fields={[{ name: 'email', type: 'email', placeholder: 'Enter email', required: true, hideLabel: true }]}
            />
            {str(props.socialLabel) || edit ? (
              <p className="ud-hv-footer__social-label">
                <EditableText edit={edit} path={['socialLabel']} value={str(props.socialLabel)} placeholder="Social Media" />
              </p>
            ) : null}
            {social.length ? (
              <div className="ud-hv-footer__social">
                {social.map((item, index) => (
                  <a key={index} href={str(item.url, '#')}>
                    <EditableText edit={edit} path={['social', index, 'label']} value={str(item.label)} placeholder="Platform" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
          <div className="ud-hv-footer__base">
            <a className="ud-hv-footer__top" href="#top" aria-label="Back to top">
              <Icon name="arrow" size={16} />
            </a>
            <p>
              &copy;{' '}
              <EditableText edit={edit} path={['copyright']} value={str(props.copyright, 'Havven. All rights reserved.')} placeholder="Studio, All rights reserved." />
            </p>
          </div>
        </div>
      </footer>
    )
  },
})
