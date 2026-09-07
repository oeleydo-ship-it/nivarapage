/**
 * Aterra — an architecture and interior-design studio template.
 *
 * Visual language: a warm white sheet broken only by full-bleed photography
 * and a single deep-teal brand colour that carries every button, heading,
 * eyebrow and dark band (the process strip, testimonial cards and footer),
 * a pill-shaped floating nav bar, and DM Sans set at a light display weight
 * throughout.
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
  slider,
  stickyField,
  text,
  textarea,
} from '../schema'
import { defineBlock } from '../types'

/* ------------------------------------------------------------------ head */

function AtHead({ props, align = 'left' }: { props: Record<string, unknown>; align?: 'left' | 'center' }) {
  const edit = editOf(props)
  const eyebrow = str(props.eyebrow)
  const heading = str(props.heading)
  const description = str(props.description)
  if (!edit && !heading && !description && !eyebrow) return null
  return (
    <div className={cx('ud-at-head', align === 'center' && 'ud-at-head--center')}>
      {eyebrow || edit ? (
        <EditableText edit={edit} path={['eyebrow']} value={eyebrow} as="p" className="ud-at-kicker" placeholder="Eyebrow" />
      ) : null}
      {heading || edit ? (
        <EditableText edit={edit} path={['heading']} value={heading} as="h2" className="ud-at-title" placeholder="Heading" />
      ) : null}
      {description || edit ? (
        <SafeText value={description} className="ud-at-lead" edit={edit} path={['description']} placeholder="Short description" />
      ) : null}
    </div>
  )
}

const logoFields = [text('logo', 'Wordmark'), image('logoImage', 'Logo image'), link('logoUrl', 'Logo link')]

function AterraLogo({ props, light = false }: { props: Record<string, unknown>; light?: boolean }) {
  const edit = editOf(props)
  const src = str(props.logoImage)
  return (
    <a className={cx('ud-at-logo', light && 'ud-at-logo--light')} href={str(props.logoUrl, '/')}>
      {src ? (
        <span className="ud-at-logo__img">
          <img src={src} alt={str(props.logo, 'Logo')} />
          <EditableImage edit={edit} path={['logoImage']} current={src} label="Replace logo" />
        </span>
      ) : (
        <span className="ud-at-logo__mark">
          <span className="ud-at-logo__dot" aria-hidden>
            <Icon name="home" size={14} />
          </span>
          <EditableText edit={edit} path={['logo']} value={str(props.logo, 'Aterra')} as="span" placeholder="Brand" />
        </span>
      )}
    </a>
  )
}

/* ---------------------------------------------------------- navbar.aterra */

export const navbarAterra = defineBlock({
  type: 'navbar.aterra',
  version: 1,
  category: 'navigation',
  label: 'Aterra pill navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Aterra',
    logoImage: '',
    logoUrl: '/',
    links: [
      { label: 'Home', url: '/' },
      { label: 'About', url: '/about' },
      { label: 'Services', url: '/services' },
      { label: 'Projects', url: '/projects' },
      { label: 'Blog', url: '/blog' },
      { label: 'Contact', url: '/contact' },
    ],
    buttonLabel: 'Book a Consultation',
    buttonUrl: '/contact',
    sticky: true,
    animation: 'fade-down',
    animationTrigger: 'load',
  },
  schema: schema(...logoFields, navLinksField('links', 'Links'), text('buttonLabel', 'Button label'), link('buttonUrl', 'Button link'), stickyField),
  component: function NavbarAterra(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    return (
      <header className={cx('ud-at', 'ud-at-nav', bool(props.sticky, true) && 'ud-at-nav--sticky')} style={sectionVars(props, 'default') as CSSProperties}>
        <div className="ud-container">
          <div className={cx('ud-at-nav__pill', open && 'is-open')}>
            <AterraLogo props={props} />
            <nav className="ud-at-nav__links" aria-label="Primary">
              {items(props.links, []).map((item, index) => (
                <a key={index} className="ud-at-nav__link" href={str(item.url, '#')}>
                  <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
                </a>
              ))}
            </nav>
            <div className="ud-at-nav__end">
              {str(props.buttonLabel) || edit ? (
                <Button href={str(props.buttonUrl, '#')} variant="primary" className="ud-at-nav__cta">
                  <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
                </Button>
              ) : null}
              <button
                type="button"
                className="ud-at-nav__toggle"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
              >
                <Icon name={open ? 'close' : 'menu'} size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>
    )
  },
})

/* ----------------------------------------------------------- pagehead.aterra */

export const pageHeadAterra = defineBlock({
  type: 'pagehead.aterra',
  version: 1,
  category: 'hero',
  label: 'Aterra page header',
  icon: 'Layout',
  defaultProps: {
    heading: 'About Us',
    homeLabel: 'Home',
    homeUrl: '/',
    parentLabel: 'Pages',
    backgroundType: 'image',
    backgroundImage: '',
    overlayColor: '#0b1f1d',
    overlayOpacity: 66,
  },
  schema: schema(headingField, text('homeLabel', 'Home link label'), link('homeUrl', 'Home link'), text('parentLabel', 'Middle crumb label')),
  component: function PageHeadAterra(props) {
    const edit = editOf(props)
    const heading = str(props.heading, 'Page')
    return (
      <SectionShell props={props} tone="dark" align="center" className="ud-at ud-at-pagehead">
        <EditableText edit={edit} path={['heading']} value={heading} as="h1" className="ud-at-title ud-at-title--xl" placeholder="Page title" />
        <nav className="ud-at-crumbs" aria-label="Breadcrumb">
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

/* -------------------------------------------------------------- hero.aterra */

export const heroAterra = defineBlock({
  type: 'hero.aterra',
  version: 1,
  category: 'hero',
  label: 'Aterra photo hero',
  icon: 'Sparkles',
  defaultProps: {
    badgeLabel: 'Trusted Since 1994',
    heading: 'Designing Spaces, Elevating Living',
    description: 'We shape interiors and architecture around how you actually live — considered, calm and built to last.',
    buttonLabel: 'Book a Consultation',
    buttonUrl: '/contact',
    backgroundType: 'image',
    backgroundImage: '',
    overlayColor: '#0b1f1d',
    overlayOpacity: 48,
    lightText: true,
    minHeight: 620,
  },
  schema: schema(text('badgeLabel', 'Badge label'), headingField, descriptionField, ...primaryCtaFields, slider('minHeight', 'Minimum height', 380, 900, 'layout', { unit: 'px' })),
  component: function HeroAterra(props) {
    const edit = editOf(props)
    const badge = str(props.badgeLabel)
    return (
      <SectionShell props={props} tone="dark" className="ud-at ud-at-hero" style={{ minHeight: num(props.minHeight, 620) }}>
        <div className="ud-at-hero__inner">
          {badge || edit ? (
            <span className="ud-at-badge">
              <EditableText edit={edit} path={['badgeLabel']} value={badge} placeholder="Badge" />
            </span>
          ) : null}
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h1" className="ud-at-title ud-at-title--xl" placeholder="Headline" />
          {str(props.description) || edit ? (
            <SafeText value={str(props.description)} className="ud-at-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
          ) : null}
          <CtaGroup props={props} primaryVariant="light" />
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- about.aterra */

export const aboutAterra = defineBlock({
  type: 'about.aterra',
  version: 1,
  category: 'content',
  label: 'Aterra about + counters',
  icon: 'Info',
  defaultProps: {
    eyebrow: 'About Us',
    heading: 'Architecture & Interior Design',
    description: 'We turn ordinary rooms into considered spaces — pairing architectural rigour with an eye for how light, material and layout actually feel to live in.',
    buttonLabel: 'More Information',
    buttonUrl: '/about',
    image: '',
    stats: [
      { value: '180+', label: 'Projects Completed' },
      { value: '18', label: 'Years in Practice' },
      { value: '240+', label: 'Satisfied Clients' },
      { value: '97%', label: 'On-Time Delivery' },
    ],
  },
  schema: schema(eyebrowField, headingField, descriptionField, ...primaryCtaFields, image('image', 'Image'), repeater('stats', 'Counters', [text('value', 'Value'), text('label', 'Label')], { itemLabel: 'Counter' })),
  component: function AboutAterra(props) {
    const edit = editOf(props)
    const stats = items(props.stats, [])
    return (
      <SectionShell props={props} tone="default" className="ud-at ud-at-about">
        <div className="ud-split">
          <div>
            <AtHead props={props} />
            <CtaGroup props={props} primaryVariant="primary" />
          </div>
          <div>
            <Media src={props.image} alt={str(props.heading)} ratio="landscape" edit={edit} path={['image']} style={{ marginBottom: 20 }} />
            <Grid cols={2} gap={16}>
              {stats.map((stat, index) => (
                <div key={index} className="ud-at-stat">
                  <EditableText edit={edit} path={['stats', index, 'value']} value={str(stat.value)} as="div" className="ud-at-stat__value" placeholder="0" />
                  <EditableText edit={edit} path={['stats', index, 'label']} value={str(stat.label)} as="p" className="ud-at-stat__label" placeholder="Label" />
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

/* -------------------------------------------------------- testimonials.aterra */

export const testimonialsAterra = defineBlock({
  type: 'testimonials.aterra',
  version: 1,
  category: 'testimonials',
  label: 'Aterra client reviews',
  icon: 'Quote',
  defaultProps: {
    eyebrow: 'Reviews',
    heading: 'What Clients Say',
    description: 'A few words from people who let us loose on their homes and workplaces.',
    items: [
      { quote: 'They pushed back on our first-pass floor plan and were right to. The finished space works far better than what we originally asked for.', name: 'Elena Cross', role: 'Homeowner', avatar: '' },
      { quote: 'On time, on budget, and they actually explained the trade-offs instead of just picking for us. Rare in this trade.', name: 'Marcus Webb', role: 'Managing Director', avatar: '' },
      { quote: 'Our office renovation happened around a live team with zero disruption. That alone was worth the fee.', name: 'Priya Anand', role: 'Operations Lead', avatar: '' },
    ],
  },
  schema: schema(eyebrowField, headingField, descriptionField, repeater('items', 'Quotes', [textarea('quote', 'Quote'), text('name', 'Name'), text('role', 'Role'), image('avatar', 'Photo')], { itemLabel: 'Quote' })),
  component: function TestimonialsAterra(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-at ud-at-quotes">
        <AtHead props={props} />
        <Grid cols={Math.min(rows.length || 1, 3)} gap={24} style={{ marginTop: 40 }}>
          {rows.map((item, index) => (
            <figure key={index} className="ud-at-quote">
              <Icon name="quote" size={26} />
              <SafeText value={str(item.quote)} className="ud-at-quote__text" edit={edit} path={['items', index, 'quote']} placeholder="What did they say?" />
              <figcaption>
                <Media src={item.avatar} alt={str(item.name)} ratio="square" className="ud-at-quote__avatar" edit={edit} path={['items', index, 'avatar']} />
                <span>
                  <EditableText edit={edit} path={['items', index, 'name']} value={str(item.name)} as="span" className="ud-at-quote__name" placeholder="Name" />
                  <EditableText edit={edit} path={['items', index, 'role']} value={str(item.role)} as="span" className="ud-at-quote__role" placeholder="Role" />
                </span>
              </figcaption>
            </figure>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------- services.aterra */

const studioServices = [
  { icon: 'home', title: 'Home Interiors', text: 'Full-home interiors from layout to the last cushion, matched to how your household actually moves.', image: '', url: '/services' },
  { icon: 'briefcase', title: 'Hospitality Design', text: 'Restaurants, hotels and cafés designed to hold up under real covers, not just a photoshoot.', image: '', url: '/services' },
  { icon: 'target', title: 'Office Interiors', text: 'Workspaces planned around focus, collaboration and the headcount you will actually have next year.', image: '', url: '/services' },
]

export const servicesAterra = defineBlock({
  type: 'services.aterra',
  version: 1,
  category: 'services',
  label: 'Aterra photo service cards',
  icon: 'Layers',
  defaultProps: {
    eyebrow: 'Services',
    heading: 'Get Your Dream Space With Expert Help',
    buttonLabel: 'View All Services',
    buttonUrl: '/services',
    items: studioServices,
  },
  schema: schema(eyebrowField, headingField, ...primaryCtaFields, repeater('items', 'Services', [image('image', 'Image'), icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Description'), link('url', 'Link')], { itemLabel: 'Service' })),
  component: function ServicesAterra(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-at ud-at-services">
        <div className="ud-at-services__top">
          <AtHead props={props} />
          <CtaGroup props={props} primaryVariant="outline" />
        </div>
        <Grid cols={Math.min(rows.length || 1, 3)} gap={24} style={{ marginTop: 40 }}>
          {rows.map((item, index) => (
            <a key={index} className="ud-at-service" href={str(item.url, '#')}>
              <Media src={item.image} alt={str(item.title)} ratio="portrait" className="ud-at-service__img" edit={edit} path={['items', index, 'image']} />
              <div className="ud-at-service__body">
                <span className="ud-at-service__icon" aria-hidden>
                  <Icon name={str(item.icon, 'home')} size={20} />
                </span>
                <Heading level={4} edit={edit} path={['items', index, 'title']}>
                  {str(item.title, 'Service')}
                </Heading>
                <SafeText value={item.text} className="ud-text" edit={edit} path={['items', index, 'text']} placeholder="Description" />
              </div>
            </a>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* ----------------------------------------------------------- process.aterra */

const workProcess = [
  { title: 'Initial Consultation', text: 'A first conversation about the space, the budget and what a good outcome looks like for you.' },
  { title: 'Concept Development', text: 'Mood, materials and an early layout so we agree on direction before any drawings are finalised.' },
  { title: 'Design Development', text: 'Detailed drawings, finishes and fixtures, priced against your budget line by line.' },
  { title: 'Permits & Approvals', text: 'We handle the paperwork and inspections so the build can start without a delay.' },
  { title: 'Project Handover', text: 'A final walkthrough, a snag list cleared, and the keys back in your hands.' },
]

export const processAterra = defineBlock({
  type: 'process.aterra',
  version: 1,
  category: 'features',
  label: 'Aterra numbered process',
  icon: 'ListChecks',
  defaultProps: {
    eyebrow: 'Our Process',
    heading: 'How We Work',
    description: '',
    items: workProcess,
  },
  schema: schema(eyebrowField, headingField, descriptionField, repeater('items', 'Steps', [text('title', 'Title'), textarea('text', 'Description')], { itemLabel: 'Step' })),
  component: function ProcessAterra(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="dark" className="ud-at ud-at-process">
        <AtHead props={props} />
        <Grid cols={3} gap={24} style={{ marginTop: 40 }}>
          {rows.map((item, index) => (
            <div key={index} className="ud-at-step">
              <span className="ud-at-step__no">{String(index + 1).padStart(2, '0')}</span>
              <Heading level={4} edit={edit} path={['items', index, 'title']}>
                {str(item.title, 'Step')}
              </Heading>
              <SafeText value={item.text} className="ud-text" edit={edit} path={['items', index, 'text']} placeholder="Description" />
            </div>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------- projects.aterra */

const featuredProjects = [
  { title: 'Birchwood Residence', category: 'Interior Design', image: '', url: '/projects' },
  { title: 'Solace House', category: 'Architecture Plan', image: '', url: '/projects' },
  { title: 'The Corner Loft', category: 'Architecture Plan', image: '', url: '/projects' },
  { title: 'Maple & Co Interior', category: 'Interior Design', image: '', url: '/projects' },
  { title: 'Harborview Offices', category: 'Interior Design', image: '', url: '/projects' },
  { title: 'Titan Workspace', category: 'Exterior Design', image: '', url: '/projects' },
]

export const projectsAterra = defineBlock({
  type: 'projects.aterra',
  version: 1,
  category: 'gallery',
  label: 'Aterra project gallery',
  icon: 'Image',
  defaultProps: {
    eyebrow: 'Selected Work',
    heading: 'Our Projects & Designs',
    buttonLabel: 'View All Projects',
    buttonUrl: '/projects',
    items: featuredProjects,
  },
  schema: schema(eyebrowField, headingField, ...primaryCtaFields, repeater('items', 'Projects', [image('image', 'Image'), text('title', 'Title'), text('category', 'Category'), link('url', 'Link')], { itemLabel: 'Project' })),
  component: function ProjectsAterra(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-at ud-at-projects">
        <div className="ud-at-services__top">
          <AtHead props={props} />
          <CtaGroup props={props} primaryVariant="outline" />
        </div>
        <Grid cols={Math.min(rows.length || 1, 3)} gap={20} style={{ marginTop: 40 }}>
          {rows.map((item, index) => (
            <a key={index} className="ud-at-project" href={str(item.url, '#')}>
              <Media src={item.image} alt={str(item.title)} ratio="square" className="ud-at-project__img" edit={edit} path={['items', index, 'image']} />
              <div className="ud-at-project__meta">
                <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="h4" className="ud-h4" placeholder="Title" />
                <EditableText edit={edit} path={['items', index, 'category']} value={str(item.category)} as="span" className="ud-at-project__tag" placeholder="Category" />
              </div>
            </a>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------------- cta.aterra */

export const ctaAterra = defineBlock({
  type: 'cta.aterra',
  version: 1,
  category: 'cta',
  label: 'Aterra photo CTA',
  icon: 'Megaphone',
  defaultProps: {
    heading: 'Ready to Start Your Next Project?',
    description: 'Tell us what you’re picturing and we’ll come back with a plan and a realistic budget.',
    buttonLabel: 'Get In Touch',
    buttonUrl: '/contact',
    phoneLabel: 'Call Us',
    phone: '+1 (555) 240 8890',
    backgroundType: 'image',
    backgroundImage: '',
    overlayColor: '#0b1f1d',
    overlayOpacity: 62,
    lightText: true,
  },
  schema: schema(headingField, descriptionField, ...primaryCtaFields, text('phoneLabel', 'Phone label'), text('phone', 'Phone number')),
  component: function CtaAterra(props) {
    const edit = editOf(props)
    const phone = str(props.phone)
    return (
      <SectionShell props={props} tone="dark" className="ud-at ud-at-cta">
        <div className="ud-at-cta__inner">
          <div>
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-at-title" placeholder="Heading" />
            {str(props.description) || edit ? (
              <SafeText value={str(props.description)} className="ud-at-lead" edit={edit} path={['description']} placeholder="Description" />
            ) : null}
          </div>
          <div className="ud-at-cta__actions">
            <CtaGroup props={props} primaryVariant="light" />
            {phone || edit ? (
              <a className="ud-at-cta__phone" href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
                <Icon name="phone" size={16} />
                <span>
                  <EditableText edit={edit} path={['phoneLabel']} value={str(props.phoneLabel)} as="span" placeholder="Call Us" />
                  <EditableText edit={edit} path={['phone']} value={phone} as="span" placeholder="Phone" />
                </span>
              </a>
            ) : null}
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------------- faq.aterra */

export const faqAterra = defineBlock({
  type: 'faq.aterra',
  version: 1,
  category: 'faq',
  label: 'Aterra questions',
  icon: 'HelpCircle',
  defaultProps: {
    eyebrow: 'FAQs',
    heading: 'Still Have a Question?',
    description: '',
    items: [
      { question: 'How long does a typical project take?', answer: 'A single room usually runs six to eight weeks. A full home or office fit-out is closer to four to six months once permits are in.' },
      { question: 'Do you work on both residential and commercial spaces?', answer: 'Yes — homes, offices, and hospitality fit-outs all run through the same process, just scaled to the project.' },
      { question: 'Can I see 3D renders before construction begins?', answer: 'Always. Nothing goes to a contractor until you have approved a full render set and a materials board.' },
      { question: 'Do you offer a fixed-price quote?', answer: 'For defined scopes, yes. Larger renovations get a detailed estimate with contingency called out separately.' },
      { question: 'What if I already have an architect?', answer: 'We regularly join a project mid-way and work alongside an existing architect or contractor.' },
      { question: 'Do you handle permits and approvals?', answer: 'Yes, permitting and inspections are part of every project we take on — it is built into the timeline, not billed as a surprise.' },
    ],
  },
  schema: schema(eyebrowField, headingField, descriptionField, repeater('items', 'Questions', [text('question', 'Question'), textarea('answer', 'Answer')], { itemLabel: 'Question' })),
  component: function FaqAterra(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const [open, setOpen] = useState(0)
    return (
      <SectionShell props={props} tone="default" className="ud-at ud-at-faq">
        <AtHead props={props} />
        <div className="ud-at-faq__list">
          {rows.map((item, index) => {
            const isOpen = Boolean(edit) || open === index
            return (
              <div key={index} className={cx('ud-at-faq__row', isOpen && 'is-open')}>
                <button type="button" className="ud-at-faq__q" aria-expanded={isOpen} onClick={() => setOpen((current) => (current === index ? -1 : index))}>
                  <span className="ud-at-faq__no">{String(index + 1).padStart(2, '0')}</span>
                  <EditableText edit={edit} path={['items', index, 'question']} value={str(item.question)} as="span" placeholder="Question" />
                  <span className="ud-at-faq__sign" aria-hidden>
                    <Icon name={isOpen ? 'minus' : 'plus'} size={16} />
                  </span>
                </button>
                <div className="ud-at-faq__a" hidden={!isOpen}>
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

/* -------------------------------------------------------------- footer.aterra */

export const footerAterra = defineBlock({
  type: 'footer.aterra',
  version: 1,
  category: 'footer',
  label: 'Aterra footer',
  icon: 'Layout',
  defaultProps: {
    logo: 'Aterra',
    logoImage: '',
    logoUrl: '/',
    description: 'An architecture and interior-design studio building considered spaces for homes, offices and hospitality.',
    social: [
      { icon: 'facebook', url: '#' },
      { icon: 'instagram', url: '#' },
      { icon: 'linkedin', url: '#' },
    ],
    columns: [
      { title: 'Studio', links: [{ label: 'About', url: '/about' }, { label: 'Services', url: '/services' }, { label: 'Projects', url: '/projects' }, { label: 'Careers', url: '/careers' }] },
      { title: 'Resources', links: [{ label: 'Blog', url: '/blog' }, { label: 'FAQs', url: '/faqs' }, { label: 'Reviews', url: '/reviews' }, { label: 'Contact', url: '/contact' }] },
    ],
    address: '412 Birchwood Avenue, Austin, TX 78701',
    phone: '+1 (555) 240 8890',
    email: 'studio@aterra.example',
    copyright: 'Aterra Studio. All rights reserved.',
  },
  schema: schema(
    ...logoFields,
    textarea('description', 'Description'),
    repeater('social', 'Social links', [icon('icon', 'Icon'), link('url', 'Link')], { itemLabel: 'Link' }),
    repeater('columns', 'Link columns', [text('title', 'Title'), repeater('links', 'Links', [text('label', 'Label'), link('url', 'Link')], { itemLabel: 'Link' })], { itemLabel: 'Column' }),
    text('address', 'Address'),
    text('phone', 'Phone'),
    text('email', 'Email'),
    text('copyright', 'Copyright (after the ©)'),
  ),
  component: function FooterAterra(props) {
    const edit = editOf(props)
    const social = items(props.social, [])
    const columns = items(props.columns, [])
    return (
      <footer className="ud-at ud-at-footer">
        <div className="ud-container ud-at-footer__grid">
          <div className="ud-at-footer__brand">
            <AterraLogo props={props} light />
            <SafeText value={str(props.description)} className="ud-at-footer__desc" edit={edit} path={['description']} placeholder="Description" />
            {social.length ? (
              <div className="ud-at-footer__social">
                {social.map((item, index) => (
                  <a key={index} href={str(item.url, '#')} aria-label={str(item.icon, 'Social link')}>
                    <Icon name={str(item.icon, 'link')} size={15} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
          {columns.map((column, index) => (
            <div key={index} className="ud-at-footer__col">
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
          <div className="ud-at-footer__col">
            <h3>Contact</h3>
            <ul className="ud-at-footer__contact">
              <li>
                <Icon name="map-pin" size={15} />
                <EditableText edit={edit} path={['address']} value={str(props.address)} placeholder="Address" />
              </li>
              <li>
                <Icon name="phone" size={15} />
                <EditableText edit={edit} path={['phone']} value={str(props.phone)} placeholder="Phone" />
              </li>
              <li>
                <Icon name="mail" size={15} />
                <EditableText edit={edit} path={['email']} value={str(props.email)} placeholder="Email" />
              </li>
            </ul>
          </div>
        </div>
        <div className="ud-container ud-at-footer__base">
          <p>
            &copy;{' '}
            <EditableText edit={edit} path={['copyright']} value={str(props.copyright, 'Aterra Studio. All rights reserved.')} placeholder="Studio, All rights reserved." />
          </p>
        </div>
      </footer>
    )
  },
})
