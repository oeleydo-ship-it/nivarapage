/**
 * The Mechanic — an auto-repair and garage-services template.
 *
 * Visual language: a deep navy blue carrying every dark band, headline and
 * button outline, one warm gold accent for eyebrows and highlights, pill
 * buttons throughout, big bold Epilogue type, and full-bleed workshop
 * photography under numbered service cards and a photo-cutout feature grid.
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
  CtaGroup,
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
  eyebrowField,
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

function McHead({ props, align = 'left' }: { props: Record<string, unknown>; align?: 'left' | 'center' }) {
  const edit = editOf(props)
  const eyebrow = str(props.eyebrow)
  const heading = str(props.heading)
  const description = str(props.description)
  if (!edit && !heading && !description && !eyebrow) return null
  return (
    <div className={cx('ud-mc-head', align === 'center' && 'ud-mc-head--center')}>
      {eyebrow || edit ? (
        <EditableText edit={edit} path={['eyebrow']} value={eyebrow} as="p" className="ud-mc-kicker" placeholder="Eyebrow" />
      ) : null}
      {heading || edit ? (
        <EditableText edit={edit} path={['heading']} value={heading} as="h2" className="ud-mc-title" placeholder="Heading" />
      ) : null}
      {description || edit ? (
        <SafeText value={description} className="ud-mc-lead" edit={edit} path={['description']} placeholder="Short description" />
      ) : null}
    </div>
  )
}

const logoFields = [text('logo', 'Wordmark'), image('logoImage', 'Logo image'), link('logoUrl', 'Logo link')]

function MechanicLogo({ props, light = false }: { props: Record<string, unknown>; light?: boolean }) {
  const edit = editOf(props)
  const src = str(props.logoImage)
  return (
    <a className={cx('ud-mc-logo', light && 'ud-mc-logo--light')} href={str(props.logoUrl, '/')}>
      {src ? (
        <span className="ud-mc-logo__img">
          <img src={src} alt={str(props.logo, 'Logo')} />
          <EditableImage edit={edit} path={['logoImage']} current={src} label="Replace logo" />
        </span>
      ) : (
        <span className="ud-mc-logo__mark">
          <span className="ud-mc-logo__dot" aria-hidden>
            <Icon name="cpu" size={15} />
          </span>
          <EditableText edit={edit} path={['logo']} value={str(props.logo, 'The Mechanic')} as="span" placeholder="Brand" />
        </span>
      )}
    </a>
  )
}

/* ---------------------------------------------------------- navbar.mechanic */

export const navbarMechanic = defineBlock({
  type: 'navbar.mechanic',
  version: 1,
  category: 'navigation',
  label: 'Mechanic topbar navbar',
  icon: 'Menu',
  defaultProps: {
    topLabel: 'Opening hours',
    topHours: 'Mon-Fri 8h-15h',
    logo: 'The Mechanic',
    logoImage: '',
    logoUrl: '/',
    links: [
      { label: 'Home', url: '/' },
      { label: 'About', url: '/about' },
      { label: 'Services', url: '/services' },
      { label: 'Team', url: '/team' },
      { label: 'Contact', url: '/contact' },
    ],
    buttonLabel: 'Need a car inspection?',
    buttonUrl: '/contact',
    sticky: true,
    animation: 'fade-down',
    animationTrigger: 'load',
  },
  schema: schema(
    text('topLabel', 'Topbar label'),
    text('topHours', 'Topbar hours'),
    ...logoFields,
    navLinksField('links', 'Links'),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    stickyField,
  ),
  component: function NavbarMechanic(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    const topLabel = str(props.topLabel)
    const topHours = str(props.topHours)
    return (
      <header className={cx('ud-mc', 'ud-mc-nav', bool(props.sticky, true) && 'ud-mc-nav--sticky')} style={sectionVars(props, 'dark') as CSSProperties}>
        {topLabel || topHours || edit ? (
          <div className="ud-mc-nav__top">
            <Icon name="clock" size={14} />
            {topLabel || edit ? (
              <EditableText edit={edit} path={['topLabel']} value={topLabel} as="span" placeholder="Opening hours" />
            ) : null}
            {topLabel && topHours ? <span aria-hidden>:</span> : null}
            {topHours || edit ? (
              <EditableText edit={edit} path={['topHours']} value={topHours} as="span" placeholder="Mon-Fri 8h-15h" />
            ) : null}
          </div>
        ) : null}
        <div className="ud-container ud-mc-nav__bar">
          <MechanicLogo props={props} light />
          <nav className={cx('ud-mc-nav__links', open && 'is-open')} aria-label="Primary">
            {items(props.links, []).map((item, index) => (
              <a key={index} className="ud-mc-nav__link" href={str(item.url, '#')}>
                <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
              </a>
            ))}
          </nav>
          <div className="ud-mc-nav__end">
            {str(props.buttonLabel) || edit ? (
              <Button href={str(props.buttonUrl, '#')} variant="outline" className="ud-mc-nav__cta">
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
              </Button>
            ) : null}
            <button
              type="button"
              className="ud-mc-nav__toggle"
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

/* ----------------------------------------------------------- pagehead.mechanic */

export const pageHeadMechanic = defineBlock({
  type: 'pagehead.mechanic',
  version: 1,
  category: 'hero',
  label: 'Mechanic page header',
  icon: 'Layout',
  defaultProps: {
    heading: 'About Us',
    homeLabel: 'Home',
    homeUrl: '/',
    parentLabel: 'Pages',
  },
  schema: schema(headingField, text('homeLabel', 'Home link label'), link('homeUrl', 'Home link'), text('parentLabel', 'Middle crumb label')),
  component: function PageHeadMechanic(props) {
    const edit = editOf(props)
    const heading = str(props.heading, 'Page')
    return (
      <SectionShell props={props} tone="dark" align="center" className="ud-mc ud-mc-pagehead">
        <EditableText edit={edit} path={['heading']} value={heading} as="h1" className="ud-mc-title ud-mc-title--xl" placeholder="Page title" />
        <nav className="ud-mc-crumbs" aria-label="Breadcrumb">
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

/* -------------------------------------------------------------- hero.mechanic */

export const heroMechanic = defineBlock({
  type: 'hero.mechanic',
  version: 1,
  category: 'hero',
  label: 'Mechanic dark hero',
  icon: 'Sparkles',
  defaultProps: {
    eyebrow: 'Welcome to The Mechanic',
    heading: 'Highly Skilled Certified Mechanics Guaranteed.',
    description: 'Full diagnostics, honest pricing and same-week appointments for every make and model.',
    buttonLabel: 'Need a car inspection?',
    buttonUrl: '/contact',
    secondaryLabel: 'Learn more',
    secondaryUrl: '/about',
    calloutQuestion: 'Got a question about our services?',
    calloutLabel: 'Call us:',
    calloutPhone: '+1 (555) 240 8890',
    calloutAvatar: '',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    text('buttonLabel', 'Primary button label'),
    link('buttonUrl', 'Primary button link'),
    text('secondaryLabel', 'Secondary button label'),
    link('secondaryUrl', 'Secondary button link'),
    text('calloutQuestion', 'Callout question'),
    text('calloutLabel', 'Callout phone label'),
    text('calloutPhone', 'Callout phone number'),
    image('calloutAvatar', 'Callout avatar'),
  ),
  component: function HeroMechanic(props) {
    const edit = editOf(props)
    const phone = str(props.calloutPhone)
    return (
      <SectionShell props={props} tone="dark" className="ud-mc ud-mc-hero">
        <div className="ud-mc-hero__top">
          <div className="ud-mc-hero__copy">
            {str(props.eyebrow) || edit ? (
              <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-mc-kicker" placeholder="Eyebrow" />
            ) : null}
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h1" className="ud-mc-title ud-mc-title--xl" placeholder="Headline" />
            {str(props.description) || edit ? (
              <SafeText value={str(props.description)} className="ud-mc-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
            ) : null}
            <div className="ud-mc-hero__actions">
              {str(props.buttonLabel) || edit ? (
                <Button href={str(props.buttonUrl, '#')} variant="outline">
                  <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
                </Button>
              ) : null}
              {str(props.secondaryLabel) || edit ? (
                <Button href={str(props.secondaryUrl, '#')} variant="light">
                  <EditableText edit={edit} path={['secondaryLabel']} value={str(props.secondaryLabel)} placeholder="Secondary" />
                </Button>
              ) : null}
            </div>
          </div>
          <div className="ud-mc-hero__callout">
            <Media src={props.calloutAvatar} alt="" ratio="square" className="ud-mc-hero__avatar" edit={edit} path={['calloutAvatar']} />
            <div>
              <EditableText edit={edit} path={['calloutQuestion']} value={str(props.calloutQuestion)} as="p" className="ud-mc-hero__question" placeholder="Got a question?" />
              <a className="ud-mc-hero__phone" href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
                <EditableText edit={edit} path={['calloutLabel']} value={str(props.calloutLabel, 'Call us:')} as="span" placeholder="Call us:" />
                <EditableText edit={edit} path={['calloutPhone']} value={phone} as="span" placeholder="Phone" />
              </a>
            </div>
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- about.mechanic */

const aboutPhotos = [
  { image: '', caption: 'Professional engineer' },
  { image: '', caption: 'Best price available' },
  { image: '', caption: 'Certified workshop' },
]

export const aboutMechanic = defineBlock({
  type: 'about.mechanic',
  version: 1,
  category: 'content',
  label: 'Mechanic split about',
  icon: 'Info',
  defaultProps: {
    heading: 'Trusted repairs, done right the first time.',
    description: 'We combine factory-level diagnostics with mechanics who explain every repair in plain language before any work begins.',
    buttonLabel: 'Learn more about us',
    buttonUrl: '/about',
    items: aboutPhotos,
  },
  schema: schema(
    headingField,
    descriptionField,
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    repeater('items', 'Photo cards', [image('image', 'Photo'), text('caption', 'Caption')], { itemLabel: 'Card' }),
  ),
  component: function AboutMechanic(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="surface" className="ud-mc ud-mc-about">
        <div className="ud-split">
          <div className="ud-mc-about__copy">
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-mc-title" placeholder="Heading" />
            {str(props.description) || edit ? (
              <SafeText value={str(props.description)} className="ud-mc-lead" edit={edit} path={['description']} placeholder="Description" />
            ) : null}
            {str(props.buttonLabel) || edit ? (
              <Button href={str(props.buttonUrl, '#')} variant="primary" className="ud-mc-about__cta">
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
              </Button>
            ) : null}
          </div>
          <div className="ud-mc-about__stack">
            {rows.map((item, index) => (
              <figure key={index} className="ud-mc-photo">
                <Media src={item.image} alt={str(item.caption)} ratio="landscape" edit={edit} path={['items', index, 'image']} />
                <figcaption>
                  <EditableText edit={edit} path={['items', index, 'caption']} value={str(item.caption)} placeholder="Caption" />
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------- features.mechanic */

const featureCards = [
  { icon: 'cpu', title: 'Engine performance', text: 'Tuning and repair that restores real power and fuel efficiency.' },
  { icon: 'search', title: 'Detailed diagnostic', text: 'A full computer scan before we ever quote a repair.' },
  { icon: 'wrench', title: 'Reasonable price', text: 'A written estimate up front, with no surprise line items.' },
]

export const featuresMechanic = defineBlock({
  type: 'features.mechanic',
  version: 1,
  category: 'features',
  label: 'Mechanic dark feature cards',
  icon: 'CheckSquare',
  defaultProps: {
    items: featureCards,
  },
  schema: schema(repeater('items', 'Features', [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Description')], { itemLabel: 'Feature' })),
  component: function FeaturesMechanic(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-mc ud-mc-features">
        <Grid cols={Math.min(rows.length || 1, 3)} gap={20}>
          {rows.map((item, index) => (
            <div key={index} className="ud-mc-feature">
              <span className="ud-mc-feature__icon" aria-hidden>
                <Icon name={str(item.icon, 'cpu')} size={30} />
              </span>
              <Heading level={4} edit={edit} path={['items', index, 'title']}>
                {str(item.title, 'Feature')}
              </Heading>
              <SafeText value={item.text} className="ud-mc-feature__text" edit={edit} path={['items', index, 'text']} placeholder="Description" />
            </div>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* -------------------------------------------------------------- faq.mechanic */

export const faqMechanic = defineBlock({
  type: 'faq.mechanic',
  version: 1,
  category: 'faq',
  label: 'Mechanic photo FAQ',
  icon: 'HelpCircle',
  defaultProps: {
    image: '',
    heading: 'Frequently asked questions.',
    description: 'Straight answers about how we work, what things cost and how long repairs take.',
    items: [
      { question: 'How long does a typical repair take?', answer: 'Most diagnostics and standard repairs are done same-day. Larger jobs get a clear timeline before we start.' },
      { question: 'Do you work on all makes and models?', answer: 'Yes, our bay is equipped for domestic, European and Asian vehicles alike.' },
      { question: 'Will I get a quote before you start?', answer: 'Always. We call with a written estimate before any billable work begins.' },
    ],
  },
  schema: schema(
    image('image', 'Photo'),
    headingField,
    descriptionField,
    repeater('items', 'Questions', [text('question', 'Question'), textarea('answer', 'Answer')], { itemLabel: 'Question' }),
  ),
  component: function FaqMechanic(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const [open, setOpen] = useState(0)
    return (
      <SectionShell props={props} tone="default" className="ud-mc ud-mc-faq" bleed>
        <Media src={props.image} alt="" ratio="ultrawide" className="ud-mc-faq__img" edit={edit} path={['image']} />
        <div className="ud-container ud-mc-faq__body">
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-mc-title ud-mc-title--underline" placeholder="Heading" />
          {str(props.description) || edit ? (
            <SafeText value={str(props.description)} className="ud-mc-lead" edit={edit} path={['description']} placeholder="Description" />
          ) : null}
          <div className="ud-mc-faq__list">
            {rows.map((item, index) => {
              const isOpen = Boolean(edit) || open === index
              return (
                <div key={index} className={cx('ud-mc-faq__row', isOpen && 'is-open')}>
                  <button type="button" className="ud-mc-faq__q" aria-expanded={isOpen} onClick={() => setOpen((current) => (current === index ? -1 : index))}>
                    <span className="ud-mc-faq__sign" aria-hidden>
                      <Icon name={isOpen ? 'minus' : 'plus'} size={16} />
                    </span>
                    <EditableText edit={edit} path={['items', index, 'question']} value={str(item.question)} as="span" placeholder="Question" />
                  </button>
                  <div className="ud-mc-faq__a" hidden={!isOpen}>
                    <SafeText value={str(item.answer)} edit={edit} path={['items', index, 'answer']} placeholder="Answer" />
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

/* ------------------------------------------------------------- stats.mechanic */

export const statsMechanic = defineBlock({
  type: 'stats.mechanic',
  version: 1,
  category: 'features',
  label: 'Mechanic counter row',
  icon: 'TrendingUp',
  defaultProps: {
    items: [
      { value: '25+', label: 'Years of experience' },
      { value: '35', label: 'Skilled mechanics' },
      { value: '10k+', label: 'Hours of maintenance' },
      { value: '2k+', label: 'Repairs completed' },
    ],
  },
  schema: schema(repeater('items', 'Counters', [text('value', 'Value'), text('label', 'Label')], { itemLabel: 'Counter' })),
  component: function StatsMechanic(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="surface" align="center" className="ud-mc ud-mc-stats">
        <Grid cols={Math.min(rows.length || 1, 4)} gap={24}>
          {rows.map((item, index) => (
            <div key={index} className="ud-mc-stat">
              <EditableText edit={edit} path={['items', index, 'value']} value={str(item.value)} as="div" className="ud-mc-stat__value" placeholder="0" />
              <EditableText edit={edit} path={['items', index, 'label']} value={str(item.label)} as="p" className="ud-mc-stat__label" placeholder="Label" />
            </div>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- logos.mechanic */

export const logosMechanic = defineBlock({
  type: 'logos.mechanic',
  version: 1,
  category: 'content',
  label: 'Mechanic partner strip',
  icon: 'Layers',
  defaultProps: {
    heading: 'Trusted by drivers and fleets across the region',
    logos: [{ label: 'Roadwise' }, { label: 'Fleetcare' }, { label: 'Autoguild' }, { label: 'Torque & Co' }],
  },
  schema: schema(text('heading', 'Heading'), repeater('logos', 'Logo wordmarks', [text('label', 'Wordmark')], { itemLabel: 'Logo' })),
  component: function LogosMechanic(props) {
    const edit = editOf(props)
    const logos = items(props.logos, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-mc ud-mc-logos">
        {str(props.heading) || edit ? (
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="p" className="ud-mc-logos__heading" placeholder="Heading" />
        ) : null}
        <div className="ud-mc-logos__row">
          {logos.map((logo, index) => (
            <EditableText key={index} edit={edit} path={['logos', index, 'label']} value={str(logo.label)} as="span" className="ud-mc-logos__word" placeholder="Brand" />
          ))}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ----------------------------------------------------------------- cta.mechanic */

export const ctaMechanic = defineBlock({
  type: 'cta.mechanic',
  version: 1,
  category: 'cta',
  label: 'Mechanic photo CTA',
  icon: 'Megaphone',
  defaultProps: {
    heading: 'We strive for excellence in everything we do.',
    description: 'Every repair backed by a written warranty and a team that stands behind the work.',
    buttonLabel: 'Need a car inspection?',
    buttonUrl: '/contact',
    secondaryLabel: 'Frequently asked questions',
    secondaryUrl: '/about',
    backgroundType: 'image',
    backgroundImage: '',
    overlayColor: '#02061a',
    overlayOpacity: 58,
    lightText: true,
  },
  schema: schema(headingField, descriptionField, text('buttonLabel', 'Button label'), link('buttonUrl', 'Button link'), text('secondaryLabel', 'Secondary link label'), link('secondaryUrl', 'Secondary link')),
  component: function CtaMechanic(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="dark" align="center" className="ud-mc ud-mc-cta">
        <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-mc-title" placeholder="Heading" />
        {str(props.description) || edit ? (
          <SafeText value={str(props.description)} className="ud-mc-lead ud-mc-lead--accent" edit={edit} path={['description']} placeholder="Description" />
        ) : null}
        <div className="ud-mc-cta__actions">
          {str(props.buttonLabel) || edit ? (
            <Button href={str(props.buttonUrl, '#')} variant="light">
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
            </Button>
          ) : null}
          {str(props.secondaryLabel) || edit ? (
            <a className="ud-mc-cta__link" href={str(props.secondaryUrl, '#')}>
              <Icon name="play" size={14} filled />
              <EditableText edit={edit} path={['secondaryLabel']} value={str(props.secondaryLabel)} placeholder="Secondary link" />
            </a>
          ) : null}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- team.mechanic */

const teamMembers = [
  { name: 'Cheryl Dobson', role: 'Automotive Technician', image: '' },
  { name: 'Andrew McNiel', role: 'Transmission Specialist', image: '' },
  { name: 'Kristopher Wagner', role: 'Diesel Mechanic', image: '' },
  { name: 'Jonas Case', role: 'Maintenance Mechanic', image: '' },
]

export const teamMechanic = defineBlock({
  type: 'team.mechanic',
  version: 1,
  category: 'team',
  label: 'Mechanic team grid',
  icon: 'Users',
  defaultProps: {
    eyebrow: '',
    heading: 'Team members',
    items: teamMembers,
  },
  schema: schema(eyebrowField, headingField, repeater('items', 'Team', [image('image', 'Photo'), text('name', 'Name'), text('role', 'Role')], { itemLabel: 'Member' })),
  component: function TeamMechanic(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-mc ud-mc-team">
        <McHead props={props} />
        <Grid cols={Math.min(rows.length || 1, 4)} gap={24} style={{ marginTop: 40 }}>
          {rows.map((item, index) => (
            <div key={index} className="ud-mc-member">
              <Media src={item.image} alt={str(item.name)} ratio="portrait" edit={edit} path={['items', index, 'image']} />
              <EditableText edit={edit} path={['items', index, 'name']} value={str(item.name)} as="h4" className="ud-h4" placeholder="Name" />
              <EditableText edit={edit} path={['items', index, 'role']} value={str(item.role)} as="p" className="ud-mc-member__role" placeholder="Role" />
            </div>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------- services.mechanic */

const numberedServices = [
  { title: 'Diagnostic service', text: 'A full computer scan that finds the real problem before we touch a wrench.', image: '' },
  { title: 'Vehicle inspection', text: 'Pre-purchase and safety inspections with a plain-language report.', image: '' },
  { title: 'Performance upgrade', text: 'Tuning, brakes and suspension work for drivers who want more.', image: '' },
]

export const servicesMechanic = defineBlock({
  type: 'services.mechanic',
  version: 1,
  category: 'services',
  label: 'Mechanic numbered photo services',
  icon: 'Layers',
  defaultProps: {
    items: numberedServices,
  },
  schema: schema(repeater('items', 'Services', [image('image', 'Photo'), text('title', 'Title'), textarea('text', 'Description')], { itemLabel: 'Service' })),
  component: function ServicesMechanic(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-mc ud-mc-services" bleed>
        {rows.map((item, index) => (
          <div key={index} className="ud-mc-service">
            <Media src={item.image} alt={str(item.title)} ratio="wide" className="ud-mc-service__img" edit={edit} path={['items', index, 'image']} />
            <div className="ud-container ud-mc-service__body">
              <span className="ud-mc-service__no">{String(index + 1).padStart(2, '0')}</span>
              <Heading level={3} edit={edit} path={['items', index, 'title']} className="ud-mc-service__title">
                {str(item.title, 'Service')}
              </Heading>
              <SafeText value={item.text} className="ud-mc-service__text" edit={edit} path={['items', index, 'text']} placeholder="Description" />
            </div>
          </div>
        ))}
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------ footer.mechanic */

export const footerMechanic = defineBlock({
  type: 'footer.mechanic',
  version: 1,
  category: 'footer',
  label: 'Mechanic footer + booking form',
  icon: 'Layout',
  defaultProps: {
    logo: 'The Mechanic',
    logoImage: '',
    logoUrl: '/',
    description: 'A certified auto-repair shop built on honest diagnostics, fair pricing and mechanics who explain the work.',
    topLabel: 'Opening hours',
    topHours: 'Mon-Fri 8h-15h',
    formHeading: 'Book an appointment',
    formId: '',
    submitLabel: 'Get an appointment',
    columns: [
      {
        title: 'Pages',
        links: [
          { label: 'About', url: '/about' },
          { label: 'Services', url: '/services' },
          { label: 'Team', url: '/team' },
          { label: 'Contact', url: '/contact' },
        ],
      },
    ],
    social: [
      { icon: 'facebook', url: '#' },
      { icon: 'instagram', url: '#' },
      { icon: 'twitter', url: '#' },
    ],
    copyright: 'The Mechanic. All rights reserved.',
  },
  schema: schema(
    ...logoFields,
    textarea('description', 'Description'),
    text('topLabel', 'Opening-hours label'),
    text('topHours', 'Opening hours'),
    text('formHeading', 'Form heading'),
    text('submitLabel', 'Form button label'),
    repeater('columns', 'Link columns', [text('title', 'Title'), repeater('links', 'Links', [text('label', 'Label'), link('url', 'Link')], { itemLabel: 'Link' })], { itemLabel: 'Column' }),
    repeater('social', 'Social links', [icon('icon', 'Icon'), link('url', 'Link')], { itemLabel: 'Link' }),
    text('copyright', 'Copyright (after the ©)'),
  ),
  component: function FooterMechanic(props) {
    const edit = editOf(props)
    const columns = items(props.columns, [])
    const social = items(props.social, [])
    return (
      <footer className="ud-mc ud-mc-footer">
        <div className="ud-container ud-mc-footer__top">
          <div className="ud-mc-footer__brand">
            <MechanicLogo props={props} light />
            <SafeText value={str(props.description)} className="ud-mc-footer__desc" edit={edit} path={['description']} placeholder="Description" />
            <p className="ud-mc-footer__hours">
              <Icon name="clock" size={14} />
              <EditableText edit={edit} path={['topLabel']} value={str(props.topLabel)} as="span" placeholder="Opening hours" />
              <span aria-hidden>:</span>
              <EditableText edit={edit} path={['topHours']} value={str(props.topHours)} as="span" placeholder="Mon-Fri 8h-15h" />
            </p>
            {columns.map((column, index) => (
              <nav key={index} className="ud-mc-footer__links" aria-label={str(column.title, 'Links')}>
                {items(column.links, []).map((item, linkIndex) => (
                  <a key={linkIndex} href={str(item.url, '#')}>
                    <EditableText edit={edit} path={['columns', index, 'links', linkIndex, 'label']} value={str(item.label)} placeholder="Link" />
                  </a>
                ))}
              </nav>
            ))}
            {social.length ? (
              <div className="ud-mc-footer__social">
                {social.map((item, index) => (
                  <a key={index} href={str(item.url, '#')} aria-label={str(item.icon, 'Social link')}>
                    <Icon name={str(item.icon, 'link')} size={15} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
          <div className="ud-mc-footer__form">
            {str(props.formHeading) || edit ? (
              <EditableText edit={edit} path={['formHeading']} value={str(props.formHeading)} as="h3" placeholder="Form heading" />
            ) : null}
            <PublicForm
              formId={str(props.formId) || undefined}
              layout="stack"
              submitLabel={str(props.submitLabel, 'Get an appointment')}
              edit={edit}
              submitLabelPath={['submitLabel']}
              fields={[
                { name: 'name', type: 'text', placeholder: 'Your name ...', required: true, hideLabel: true },
                { name: 'email', type: 'email', placeholder: 'Insert your email ...', required: true, hideLabel: true },
                { name: 'car_model', type: 'select', placeholder: 'Car model', hideLabel: true, options: ['Sedan', 'SUV', 'Truck', 'Van', 'Other'] },
              ]}
            />
          </div>
        </div>
        <div className="ud-container ud-mc-footer__base">
          <p>
            &copy;{' '}
            <EditableText edit={edit} path={['copyright']} value={str(props.copyright, 'The Mechanic. All rights reserved.')} placeholder="Studio, All rights reserved." />
          </p>
        </div>
      </footer>
    )
  },
})
