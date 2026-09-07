/**
 * Gleam — a home and office cleaning-services template.
 *
 * Visual language: a playful, high-contrast palette of one bold indigo-violet
 * and one warm yellow over a navy-ink text colour, fully-pill buttons, big
 * rounded Rubik headlines, and full-bleed photography with no dark scrim —
 * legibility comes from a light-to-transparent wash instead.
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
  num,
  sectionVars,
  str,
} from '../primitives'
import {
  descriptionField,
  eyebrowField,
  headingField,
  icon,
  image,
  link,
  navLinksField,
  primaryCtaFields,
  repeater,
  schema,
  stickyField,
  text,
  textarea,
} from '../schema'
import { defineBlock } from '../types'

/* ------------------------------------------------------------------ head */

function GlHead({ props }: { props: Record<string, unknown> }) {
  const edit = editOf(props)
  const eyebrow = str(props.eyebrow)
  const heading = str(props.heading)
  const description = str(props.description)
  if (!edit && !heading && !description && !eyebrow) return null
  return (
    <div className="ud-gl-head">
      {eyebrow || edit ? (
        <EditableText edit={edit} path={['eyebrow']} value={eyebrow} as="p" className="ud-gl-kicker" placeholder="Eyebrow" />
      ) : null}
      {heading || edit ? (
        <EditableText edit={edit} path={['heading']} value={heading} as="h2" className="ud-gl-title" placeholder="Heading" />
      ) : null}
      {description || edit ? (
        <SafeText value={description} className="ud-gl-lead" edit={edit} path={['description']} placeholder="Short description" />
      ) : null}
    </div>
  )
}

const logoFields = [text('logo', 'Wordmark'), image('logoImage', 'Logo image'), link('logoUrl', 'Logo link')]

function GleamLogo({ props, light = false }: { props: Record<string, unknown>; light?: boolean }) {
  const edit = editOf(props)
  const src = str(props.logoImage)
  return (
    <a className={cx('ud-gl-logo', light && 'ud-gl-logo--light')} href={str(props.logoUrl, '/')}>
      {src ? (
        <span className="ud-gl-logo__img">
          <img src={src} alt={str(props.logo, 'Logo')} />
          <EditableImage edit={edit} path={['logoImage']} current={src} label="Replace logo" />
        </span>
      ) : (
        <span className="ud-gl-logo__mark">
          <span className="ud-gl-logo__dot" aria-hidden>
            <Icon name="sparkles" size={14} />
          </span>
          <EditableText edit={edit} path={['logo']} value={str(props.logo, 'Gleam')} as="span" placeholder="Brand" />
        </span>
      )}
    </a>
  )
}

/* ---------------------------------------------------------- navbar.gleam */

export const navbarGleam = defineBlock({
  type: 'navbar.gleam',
  version: 1,
  category: 'navigation',
  label: 'Gleam topbar navbar',
  icon: 'Menu',
  defaultProps: {
    topLabel: 'Need a quick clean?',
    topPhoneLabel: 'Call Us:',
    topPhone: '+1 (555) 240 8890',
    logo: 'Gleam',
    logoImage: '',
    logoUrl: '/',
    links: [
      { label: 'Home', url: '/' },
      { label: 'About', url: '#about' },
      { label: 'Services', url: '#services' },
      { label: 'Blog', url: '#blog' },
      { label: 'Contact', url: '#contact' },
    ],
    buttonLabel: 'Make An Appointment',
    buttonUrl: '#contact',
    sticky: true,
    animation: 'fade-down',
    animationTrigger: 'load',
  },
  schema: schema(
    text('topLabel', 'Topbar message'),
    text('topPhoneLabel', 'Topbar phone label'),
    text('topPhone', 'Topbar phone number'),
    ...logoFields,
    navLinksField('links', 'Links'),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    stickyField,
  ),
  component: function NavbarGleam(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    const topLabel = str(props.topLabel)
    const topPhone = str(props.topPhone)
    return (
      <header className={cx('ud-gl', 'ud-gl-nav', bool(props.sticky, true) && 'ud-gl-nav--sticky')} style={sectionVars(props, 'default') as CSSProperties}>
        {topLabel || topPhone || edit ? (
          <div className="ud-gl-nav__top">
            {topLabel || edit ? (
              <EditableText edit={edit} path={['topLabel']} value={topLabel} as="span" placeholder="Need a quick clean?" />
            ) : null}
            {topPhone || edit ? (
              <a className="ud-gl-nav__topphone" href={`tel:${topPhone.replace(/[^+\d]/g, '')}`}>
                <Icon name="phone" size={14} />
                <EditableText edit={edit} path={['topPhoneLabel']} value={str(props.topPhoneLabel, 'Call Us:')} as="span" placeholder="Call Us:" />
                <EditableText edit={edit} path={['topPhone']} value={topPhone} as="span" placeholder="Phone" />
              </a>
            ) : null}
          </div>
        ) : null}
        <div className="ud-container ud-gl-nav__bar">
          <GleamLogo props={props} />
          <nav className={cx('ud-gl-nav__links', open && 'is-open')} aria-label="Primary">
            {items(props.links, []).map((item, index) => (
              <a key={index} className="ud-gl-nav__link" href={str(item.url, '#')}>
                <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
              </a>
            ))}
          </nav>
          <div className="ud-gl-nav__end">
            {str(props.buttonLabel) || edit ? (
              <Button href={str(props.buttonUrl, '#')} variant="primary" className="ud-gl-nav__cta">
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
              </Button>
            ) : null}
            <button
              type="button"
              className="ud-gl-nav__toggle"
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

/* ----------------------------------------------------------- pagehead.gleam */

export const pageHeadGleam = defineBlock({
  type: 'pagehead.gleam',
  version: 1,
  category: 'hero',
  label: 'Gleam page header',
  icon: 'Layout',
  defaultProps: {
    heading: 'About Us',
    homeLabel: 'Home',
    homeUrl: '/',
    parentLabel: 'Pages',
  },
  schema: schema(headingField, text('homeLabel', 'Home link label'), link('homeUrl', 'Home link'), text('parentLabel', 'Middle crumb label')),
  component: function PageHeadGleam(props) {
    const edit = editOf(props)
    const heading = str(props.heading, 'Page')
    return (
      <SectionShell props={props} tone="dark" align="center" className="ud-gl ud-gl-pagehead">
        <EditableText edit={edit} path={['heading']} value={heading} as="h1" className="ud-gl-title ud-gl-title--xl" placeholder="Page title" />
        <nav className="ud-gl-crumbs" aria-label="Breadcrumb">
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

/* -------------------------------------------------------------- hero.gleam */

export const heroGleam = defineBlock({
  type: 'hero.gleam',
  version: 1,
  category: 'hero',
  label: 'Gleam photo hero',
  icon: 'Sparkles',
  defaultProps: {
    eyebrow: 'Award Winning Cleaning Service Company',
    heading: 'Professional Cleaning Services You Can Trust.',
    phoneLabel: 'Call:',
    phone: '+1 (555) 240 8890',
    buttonLabel: 'Make An Appointment',
    buttonUrl: '#contact',
    backgroundType: 'image',
    backgroundImage: '',
    overlayColor: '#ffffff',
    overlayOpacity: 48,
    lightText: false,
    ratings: [
      { value: '4.9', label: 'Out of 5' },
      { value: '4.8', label: 'Out of 5' },
    ],
    minHeight: 640,
  },
  schema: schema(
    eyebrowField,
    headingField,
    text('phoneLabel', 'Phone label'),
    text('phone', 'Phone number'),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    repeater('ratings', 'Rating badges', [text('value', 'Value'), text('label', 'Label')], { itemLabel: 'Rating' }),
  ),
  component: function HeroGleam(props) {
    const edit = editOf(props)
    const phone = str(props.phone)
    const ratings = items(props.ratings, [])
    return (
      <SectionShell props={props} tone="default" className="ud-gl ud-gl-hero" style={{ minHeight: num(props.minHeight, 640) }}>
        <div className="ud-gl-hero__inner">
          {str(props.eyebrow) || edit ? (
            <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-gl-kicker" placeholder="Eyebrow" />
          ) : null}
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h1" className="ud-gl-title ud-gl-title--xl" placeholder="Headline" />
          <div className="ud-gl-hero__actions">
            {phone || edit ? (
              <a className="ud-btn ud-btn--secondary ud-gl-hero__phone" href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
                <Icon name="phone" size={16} />
                <EditableText edit={edit} path={['phoneLabel']} value={str(props.phoneLabel, 'Call:')} as="span" placeholder="Call:" />
                <EditableText edit={edit} path={['phone']} value={phone} as="span" placeholder="Phone" />
              </a>
            ) : null}
            {str(props.buttonLabel) || edit ? (
              <Button href={str(props.buttonUrl, '#')} variant="primary">
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
              </Button>
            ) : null}
          </div>
          {ratings.length ? (
            <div className="ud-gl-hero__ratings">
              {ratings.map((rating, index) => (
                <div key={index} className="ud-gl-rating">
                  <Icon name="star" size={16} filled />
                  <EditableText edit={edit} path={['ratings', index, 'value']} value={str(rating.value)} as="span" className="ud-gl-rating__value" placeholder="4.9" />
                  <EditableText edit={edit} path={['ratings', index, 'label']} value={str(rating.label)} as="span" placeholder="Out of 5" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------- services.gleam */

const cleaningServices = [
  { icon: 'layers', title: 'Floor Cleaning', url: '#services' },
  { icon: 'home', title: 'House Cleaning', url: '#services' },
  { icon: 'shield', title: 'Pest Control', url: '#services' },
  { icon: 'sparkles', title: 'Window Cleaning', url: '#services' },
]

export const servicesGleam = defineBlock({
  type: 'services.gleam',
  version: 1,
  category: 'services',
  label: 'Gleam icon service grid',
  icon: 'Layers',
  defaultProps: {
    eyebrow: 'Highest Level Of Service',
    heading: 'We provide our best cleaning services for you',
    description: 'Our team covers everything from home cleaning to office cleaning, using the right method and equipment for each surface.',
    buttonLabel: 'Discover More',
    items: cleaningServices,
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    text('buttonLabel', 'Item link label'),
    repeater('items', 'Services', [icon('icon', 'Icon'), text('title', 'Title'), link('url', 'Link')], { itemLabel: 'Service' }),
  ),
  component: function ServicesGleam(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const linkLabel = str(props.buttonLabel, 'Discover More')
    return (
      <SectionShell props={props} tone="surface" align="center" className="ud-gl ud-gl-services">
        <GlHead props={props} />
        <Grid cols={Math.min(rows.length || 1, 4)} gap={28} style={{ marginTop: 44 }}>
          {rows.map((item, index) => (
            <div key={index} className="ud-gl-service">
              <span className="ud-gl-service__icon" aria-hidden>
                <Icon name={str(item.icon, 'sparkles')} size={22} />
              </span>
              <Heading level={4} edit={edit} path={['items', index, 'title']}>
                {str(item.title, 'Service')}
              </Heading>
              <a className="ud-gl-service__link" href={str(item.url, '#')}>
                {linkLabel}
                <Icon name="arrow" size={14} />
              </a>
            </div>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- about.gleam */

export const aboutGleam = defineBlock({
  type: 'about.gleam',
  version: 1,
  category: 'content',
  label: 'Gleam collage + hours',
  icon: 'Info',
  defaultProps: {
    image: '',
    image2: '',
    eyebrow: 'Who Are We',
    heading: 'Your comfort is our main priority',
    description: 'We appreciate your trust greatly. Customers choose Gleam because they know we are the best in the field.',
    schedule: [
      { days: 'Mon - Fri', hours: '9 AM – 6 PM' },
      { days: 'Saturday', hours: '9 AM – 4 PM' },
    ],
    phoneLabel: 'Call:',
    phone: '+1 (555) 240 8890',
  },
  schema: schema(
    image('image', 'Background photo'),
    image('image2', 'Foreground photo'),
    eyebrowField,
    headingField,
    descriptionField,
    repeater('schedule', 'Hours', [text('days', 'Days'), text('hours', 'Hours')], { itemLabel: 'Row' }),
    text('phoneLabel', 'Phone label'),
    text('phone', 'Phone number'),
  ),
  component: function AboutGleam(props) {
    const edit = editOf(props)
    const rows = items(props.schedule, [])
    const phone = str(props.phone)
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-gl ud-gl-about">
        <div className="ud-gl-collage">
          <Media src={props.image} alt="" ratio="landscape" className="ud-gl-collage__back" edit={edit} path={['image']} />
          <Media src={props.image2} alt="" ratio="square" className="ud-gl-collage__front" edit={edit} path={['image2']} />
        </div>
        <GlHead props={props} />
        {rows.length ? (
          <div className="ud-gl-schedule">
            {rows.map((row, index) => (
              <p key={index}>
                <EditableText edit={edit} path={['schedule', index, 'days']} value={str(row.days)} as="span" className="ud-gl-schedule__days" placeholder="Days" />
                <EditableText edit={edit} path={['schedule', index, 'hours']} value={str(row.hours)} as="span" placeholder="Hours" />
              </p>
            ))}
          </div>
        ) : null}
        {phone || edit ? (
          <a className="ud-gl-about__phone" href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
            <EditableText edit={edit} path={['phoneLabel']} value={str(props.phoneLabel, 'Call:')} as="span" placeholder="Call:" />
            <EditableText edit={edit} path={['phone']} value={phone} as="span" placeholder="Phone" />
          </a>
        ) : null}
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------- features.gleam */

export const featuresGleam = defineBlock({
  type: 'features.gleam',
  version: 1,
  category: 'features',
  label: 'Gleam photo band + features',
  icon: 'CheckSquare',
  defaultProps: {
    eyebrow: 'What We Do',
    heading: 'Best cleaning company in the area',
    description: 'We offer a complete range of cleaning services: deep cleans, move-outs, recurring office visits, upholstery and more.',
    image: '',
    items: [
      { title: 'Service and guarantees', text: 'We provide the best possible care, with a satisfaction guarantee on every visit.' },
      { title: 'Team of professionals', text: 'A trained, background-checked team that gets it right on the first visit.' },
    ],
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    image('image', 'Photo'),
    repeater('items', 'Features', [text('title', 'Title'), textarea('text', 'Description')], { itemLabel: 'Feature' }),
  ),
  component: function FeaturesGleam(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-gl ud-gl-features" bleed>
        <div className="ud-container">
          <GlHead props={props} />
        </div>
        <Media src={props.image} alt={str(props.heading)} ratio="ultrawide" className="ud-gl-features__img" edit={edit} path={['image']} />
        <div className="ud-gl-features__band">
          <div className="ud-container">
            <Grid cols={Math.min(rows.length || 1, 2)} gap={32}>
              {rows.map((item, index) => (
                <div key={index}>
                  <Heading level={4} edit={edit} path={['items', index, 'title']}>
                    {str(item.title, 'Feature')}
                  </Heading>
                  <SafeText value={item.text} className="ud-text" edit={edit} path={['items', index, 'text']} placeholder="Description" />
                </div>
              ))}
            </Grid>
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- stats.gleam */

const partnerLogos = [{ label: 'Brightscape' }, { label: 'Homely' }, { label: 'Suburbly' }, { label: 'Northwick' }]

export const statsGleam = defineBlock({
  type: 'stats.gleam',
  version: 1,
  category: 'features',
  label: 'Gleam counter + logos',
  icon: 'TrendingUp',
  defaultProps: {
    value: '4,035',
    label: 'Happy Customers & Counting',
    logos: partnerLogos,
  },
  schema: schema(
    text('value', 'Number'),
    text('label', 'Label'),
    repeater('logos', 'Logo wordmarks', [text('label', 'Wordmark')], { itemLabel: 'Logo' }),
  ),
  component: function StatsGleam(props) {
    const edit = editOf(props)
    const logos = items(props.logos, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-gl ud-gl-stats">
        <EditableText edit={edit} path={['value']} value={str(props.value)} as="div" className="ud-gl-stats__value" placeholder="0" />
        <EditableText edit={edit} path={['label']} value={str(props.label)} as="p" className="ud-gl-stats__label" placeholder="Label" />
        {logos.length ? (
          <div className="ud-gl-stats__logos">
            {logos.map((logo, index) => (
              <EditableText key={index} edit={edit} path={['logos', index, 'label']} value={str(logo.label)} as="span" className="ud-gl-stats__logo" placeholder="Brand" />
            ))}
          </div>
        ) : null}
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------ testimonials.gleam */

export const testimonialsGleam = defineBlock({
  type: 'testimonials.gleam',
  version: 1,
  category: 'testimonials',
  label: 'Gleam quote carousel',
  icon: 'Quote',
  defaultProps: {
    items: [
      {
        quote: 'Gleam is the best cleaning service we have used. They cover everything from our home to the office, and always leave the place looking its best.',
        name: 'Jack Morrison',
        meta: '36, New York',
        avatar: '',
      },
      {
        quote: 'Their team turned up on time, worked fast and were genuinely careful with our things. Booking again was an easy decision.',
        name: 'Diane Osei',
        meta: '41, Chicago',
        avatar: '',
      },
      {
        quote: 'We switched our office contract to Gleam after one trial clean. Consistent, on schedule, and the invoicing is painless.',
        name: 'Marco Lindqvist',
        meta: '29, Boston',
        avatar: '',
      },
    ],
  },
  schema: schema(
    repeater('items', 'Quotes', [textarea('quote', 'Quote'), text('name', 'Name'), text('meta', 'Meta (age, city)'), image('avatar', 'Photo')], { itemLabel: 'Quote' }),
  ),
  component: function TestimonialsGleam(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const [index, setIndex] = useState(0)
    const current = rows[Math.min(index, Math.max(rows.length - 1, 0))] || {}
    const go = (delta: number) => setIndex((value) => (rows.length ? (value + delta + rows.length) % rows.length : 0))
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-gl ud-gl-testimonials">
        <div className="ud-gl-quote">
          <div className="ud-gl-quote__avatar">
            <Media src={current.avatar} alt={str(current.name)} ratio="square" edit={edit} path={['items', index, 'avatar']} />
            <span className="ud-gl-quote__badge" aria-hidden>
              <Icon name="quote" size={14} filled />
            </span>
          </div>
          <EditableText edit={edit} path={['items', index, 'name']} value={str(current.name)} as="p" className="ud-gl-quote__name" placeholder="Name" />
          <EditableText edit={edit} path={['items', index, 'meta']} value={str(current.meta)} as="p" className="ud-gl-quote__meta" placeholder="Age, City" />
          <SafeText value={str(current.quote)} className="ud-gl-quote__text" edit={edit} path={['items', index, 'quote']} placeholder="Quote" />
          {rows.length > 1 ? (
            <div className="ud-gl-quote__nav">
              <button type="button" onClick={() => go(-1)} aria-label="Previous testimonial" className="is-prev">
                <Icon name="arrow" size={16} />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next testimonial">
                <Icon name="arrow" size={16} />
              </button>
            </div>
          ) : null}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* -------------------------------------------------------------- blog.gleam */

const cleaningPosts = [
  { category: 'Kitchen', date: 'April 04, 2025', title: 'The secret of cleaning your kitchen.', image: '', url: '#' },
  { category: 'Apartment', date: 'April 04, 2025', title: 'How to clean wooden floors without creating dust.', image: '', url: '#' },
  { category: 'Office', date: 'April 04, 2025', title: 'The secret of cleaning your wooden furniture.', image: '', url: '#' },
]

export const blogGleam = defineBlock({
  type: 'blog.gleam',
  version: 1,
  category: 'blog',
  label: 'Gleam recent posts',
  icon: 'Newspaper',
  defaultProps: {
    eyebrow: 'Recent Posts',
    heading: 'Our latest news from blog',
    buttonLabel: 'Read All Articles',
    buttonUrl: '#',
    items: cleaningPosts,
  },
  schema: schema(
    eyebrowField,
    headingField,
    ...primaryCtaFields,
    repeater('items', 'Posts', [image('image', 'Image'), text('category', 'Category'), text('date', 'Date'), text('title', 'Title'), link('url', 'Link')], { itemLabel: 'Post' }),
  ),
  component: function BlogGleam(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="surface" align="center" className="ud-gl ud-gl-blog">
        <GlHead props={props} />
        <Grid cols={Math.min(rows.length || 1, 3)} gap={28} style={{ marginTop: 44 }}>
          {rows.map((item, index) => (
            <a key={index} className="ud-gl-post" href={str(item.url, '#')}>
              <Media src={item.image} alt={str(item.title)} ratio="landscape" className="ud-gl-post__img" edit={edit} path={['items', index, 'image']} />
              <p className="ud-gl-post__meta">
                <EditableText edit={edit} path={['items', index, 'category']} value={str(item.category)} as="span" className="ud-gl-post__cat" placeholder="Category" />
                <span aria-hidden>·</span>
                <EditableText edit={edit} path={['items', index, 'date']} value={str(item.date)} as="span" placeholder="Date" />
              </p>
              <Heading level={4} edit={edit} path={['items', index, 'title']}>
                {str(item.title, 'Post title')}
              </Heading>
            </a>
          ))}
        </Grid>
        <CtaGroup props={props} primaryVariant="link" className="ud-gl-blog__cta" />
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------------- cta.gleam */

export const ctaGleam = defineBlock({
  type: 'cta.gleam',
  version: 1,
  category: 'cta',
  label: 'Gleam solid band CTA',
  icon: 'Megaphone',
  defaultProps: {
    eyebrow: 'Contact Us',
    heading: 'Discuss our services or make an appointment',
    description: 'Tell us what needs cleaning and we will get back to you with a time and a price the same day.',
    phoneLabel: 'Call:',
    phone: '+1 (555) 240 8890',
    buttonLabel: 'Make An Appointment',
    buttonUrl: '#contact',
  },
  schema: schema(eyebrowField, headingField, descriptionField, text('phoneLabel', 'Phone label'), text('phone', 'Phone number'), text('buttonLabel', 'Button label'), link('buttonUrl', 'Button link')),
  component: function CtaGleam(props) {
    const edit = editOf(props)
    const phone = str(props.phone)
    return (
      <SectionShell props={props} tone="dark" align="center" className="ud-gl ud-gl-cta">
        <GlHead props={props} />
        <div className="ud-gl-cta__actions">
          {phone || edit ? (
            <a className="ud-btn ud-btn--light" href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
              <Icon name="phone" size={16} />
              <EditableText edit={edit} path={['phoneLabel']} value={str(props.phoneLabel, 'Call:')} as="span" placeholder="Call:" />
              <EditableText edit={edit} path={['phone']} value={phone} as="span" placeholder="Phone" />
            </a>
          ) : null}
          {str(props.buttonLabel) || edit ? (
            <Button href={str(props.buttonUrl, '#')} variant="secondary">
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
            </Button>
          ) : null}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------ footer.gleam */

export const footerGleam = defineBlock({
  type: 'footer.gleam',
  version: 1,
  category: 'footer',
  label: 'Gleam footer',
  icon: 'Layout',
  defaultProps: {
    logo: 'Gleam',
    logoImage: '',
    logoUrl: '/',
    social: [
      { icon: 'facebook', url: '#' },
      { icon: 'twitter', url: '#' },
      { icon: 'linkedin', url: '#' },
    ],
    columns: [
      {
        title: 'Pages',
        links: [
          { label: 'Home', url: '/' },
          { label: 'Services', url: '#services' },
          { label: 'About Us', url: '#about' },
          { label: 'Contact', url: '#contact' },
        ],
      },
      {
        title: 'Services',
        links: [
          { label: 'Home Cleaning', url: '#services' },
          { label: 'Window Cleaning', url: '#services' },
          { label: 'Pest Control', url: '#services' },
          { label: 'Floor Cleaning', url: '#services' },
        ],
      },
    ],
    copyright: 'Gleam. All rights reserved.',
  },
  schema: schema(
    ...logoFields,
    repeater('social', 'Social links', [icon('icon', 'Icon'), link('url', 'Link')], { itemLabel: 'Link' }),
    repeater('columns', 'Link columns', [text('title', 'Title'), repeater('links', 'Links', [text('label', 'Label'), link('url', 'Link')], { itemLabel: 'Link' })], { itemLabel: 'Column' }),
    text('copyright', 'Copyright (after the ©)'),
  ),
  component: function FooterGleam(props) {
    const edit = editOf(props)
    const social = items(props.social, [])
    const columns = items(props.columns, [])
    return (
      <footer className="ud-gl ud-gl-footer">
        <div className="ud-container ud-gl-footer__grid">
          <div className="ud-gl-footer__brand">
            <GleamLogo props={props} light />
          </div>
          {columns.map((column, index) => (
            <div key={index} className="ud-gl-footer__col">
              <EditableText edit={edit} path={['columns', index, 'title']} value={str(column.title)} as="h3" placeholder="Column" />
              <ul>
                {items(column.links, []).map((item, linkIndex) => (
                  <li key={linkIndex}>
                    <a href={str(item.url, '#')}>
                      <EditableText edit={edit} path={['columns', index, 'links', linkIndex, 'label']} value={str(item.label)} placeholder="Link" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="ud-gl-footer__col">
            <h3>Social</h3>
            <ul>
              {social.map((item, index) => (
                <li key={index}>
                  <a href={str(item.url, '#')}>{str(item.icon, 'link')}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="ud-container ud-gl-footer__base">
          <p>
            &copy;{' '}
            <EditableText edit={edit} path={['copyright']} value={str(props.copyright, 'Gleam. All rights reserved.')} placeholder="Studio, All rights reserved." />
          </p>
        </div>
      </footer>
    )
  },
})
