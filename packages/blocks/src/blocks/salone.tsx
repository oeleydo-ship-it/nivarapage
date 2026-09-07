/**
 * Salone — a beauty-salon and spa template.
 *
 * Visual language: a warm cream sheet (#f8f7f4) broken only by a near-black
 * footer, one antique-gold accent carrying every button, icon and cursive
 * kicker, Playfair Display serif headlines over Work Sans body copy, and a
 * Dancing Script cursive line introducing every section the way the source
 * template used it above each heading.
 *
 * Every block routes through `schema()`, which appends the shared design /
 * typography / background / spacing / content-width controls, so each one is
 * editable on the canvas and in the side panel and stays reusable on any page.
 * Buttons and lists reuse the shared primitives (`Button`, `CtaGroup`, `Grid`,
 * `IconBadge`) rather than bespoke components, so the family recolours from
 * theme tokens instead of hard-coded styling.
 */
import { useState, type CSSProperties } from 'react'
import { EditableImage, EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Button,
  CtaGroup,
  Grid,
  Heading,
  IconBadge,
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
  primaryCtaFields,
  repeater,
  schema,
  stickyField,
  text,
  textarea,
} from '../schema'
import { NavItem, Submenu, SubmenuCaret, hasSubmenu } from '../submenu'
import { defineBlock } from '../types'

/* ------------------------------------------------------------------ head */

/** Cursive gold kicker line, shown above every section heading. */
function Kicker({ props, path = 'eyebrow' }: { props: Record<string, unknown>; path?: string }) {
  const edit = editOf(props)
  const value = str(props[path])
  if (!value && !edit) return null
  return <EditableText edit={edit} path={[path]} value={value} as="p" className="ud-sal-kicker" placeholder="Welcome" />
}

/** Kicker, heading and lead paragraph, left or centred. */
function SalHead({ props, align = 'left' }: { props: Record<string, unknown>; align?: 'left' | 'center' }) {
  const edit = editOf(props)
  const heading = str(props.heading)
  const description = str(props.description)
  if (!edit && !heading && !description && !str(props.eyebrow)) return null
  return (
    <div className={cx('ud-sal-head', align === 'center' && 'ud-sal-head--center')}>
      <Kicker props={props} />
      {heading || edit ? (
        <EditableText edit={edit} path={['heading']} value={heading} as="h2" className="ud-sal-title" placeholder="Heading" />
      ) : null}
      {description || edit ? (
        <SafeText value={description} className="ud-sal-lead" edit={edit} path={['description']} placeholder="Short description" />
      ) : null}
    </div>
  )
}

const logoFields = [text('logo', 'Wordmark'), image('logoImage', 'Logo image'), link('logoUrl', 'Logo link')]

function SaloneLogo({ props, light = false }: { props: Record<string, unknown>; light?: boolean }) {
  const edit = editOf(props)
  const src = str(props.logoImage)
  return (
    <a className={cx('ud-sal-logo', light && 'ud-sal-logo--light')} href={str(props.logoUrl, '/')}>
      {src ? (
        <span className="ud-sal-logo__img">
          <img src={src} alt={str(props.logo, 'Logo')} />
          <EditableImage edit={edit} path={['logoImage']} current={src} label="Replace logo" />
        </span>
      ) : (
        <span className="ud-sal-logo__mark">
          <Icon name="scissors" size={18} />
          <EditableText edit={edit} path={['logo']} value={str(props.logo, 'Salone')} as="span" placeholder="Brand" />
        </span>
      )}
    </a>
  )
}

/* ---------------------------------------------------------- navbar.salone */

export const navbarSalone = defineBlock({
  type: 'navbar.salone',
  version: 1,
  category: 'navigation',
  label: 'Salone navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Salone',
    logoImage: '',
    logoUrl: '/',
    links: [
      { label: 'Home', url: '/' },
      { label: 'About', url: '/about' },
      { label: 'Service', url: '/service' },
      {
        label: 'Pages',
        url: '/team',
        children: [
          { label: 'Our Team', url: '/team' },
          { label: 'Testimonial', url: '/testimonial' },
        ],
      },
      { label: 'Contact', url: '/contact' },
    ],
    buttonLabel: 'Book Appointment',
    buttonUrl: '/contact',
    sticky: true,
    animation: 'fade-down',
    animationTrigger: 'load',
  },
  schema: schema(...logoFields, navLinksField('links', 'Links'), text('buttonLabel', 'Button label'), link('buttonUrl', 'Button link'), stickyField),
  component: function NavbarSalone(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    return (
      <header
        className={cx('ud-sal', 'ud-sal-nav', bool(props.sticky, true) && 'ud-sal-nav--sticky')}
        style={sectionVars(props, 'surface') as CSSProperties}
      >
        <div className="ud-container ud-sal-nav__bar">
          <SaloneLogo props={props} />
          <nav className={cx('ud-sal-nav__links', open && 'is-open')} aria-label="Primary">
            {items(props.links, []).map((item, index) => (
              <NavItem key={index} item={item}>
                <a className="ud-sal-nav__link" href={str(item.url, '#')}>
                  <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
                  <SubmenuCaret show={hasSubmenu(item)} />
                </a>
                <Submenu props={props} item={item} index={index} />
              </NavItem>
            ))}
          </nav>
          <div className="ud-sal-nav__end">
            {str(props.buttonLabel) || edit ? (
              <Button href={str(props.buttonUrl, '#')} variant="primary">
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
              </Button>
            ) : null}
            <button
              type="button"
              className="ud-sal-nav__toggle"
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

/* -------------------------------------------------------------- hero.salone */

function HeroCarousel({ props }: { props: Record<string, unknown> }) {
  const edit = editOf(props)
  const list = items(props.images, [])
  const [index, setIndex] = useState(0)
  const active = Math.min(index, Math.max(list.length - 1, 0))
  const go = (delta: number) => setIndex((current) => (current + delta + list.length) % Math.max(list.length, 1))
  return (
    <div className="ud-sal-hero__carousel">
      <Media
        src={list[active]?.image}
        alt={str(props.heading)}
        ratio="square"
        className="ud-sal-hero__slide"
        edit={edit}
        path={['images', active, 'image']}
      />
      {list.length > 1 ? (
        <div className="ud-sal-hero__nav">
          <button type="button" aria-label="Previous slide" onClick={() => go(-1)}>
            <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>
              <Icon name="arrow" size={18} />
            </span>
          </button>
          <button type="button" aria-label="Next slide" onClick={() => go(1)}>
            <Icon name="arrow" size={18} />
          </button>
        </div>
      ) : null}
    </div>
  )
}

export const heroSalone = defineBlock({
  type: 'hero.salone',
  version: 1,
  category: 'hero',
  label: 'Salone photo hero',
  icon: 'Sparkles',
  defaultProps: {
    eyebrow: 'Welcome',
    heading: 'Beauty Salon Fashion for Women',
    phoneLabel: 'Call Us',
    phone: '+123456789',
    emailLabel: 'Mail Us',
    email: 'info@domain.com',
    images: [{ image: '' }, { image: '' }, { image: '' }],
  },
  schema: schema(
    eyebrowField,
    headingField,
    text('phoneLabel', 'Phone label'),
    text('phone', 'Phone number'),
    text('emailLabel', 'Email label'),
    text('email', 'Email'),
    repeater('images', 'Slides', [image('image', 'Image')], { itemLabel: 'Slide' }),
  ),
  component: function HeroSalone(props) {
    const edit = editOf(props)
    const phone = str(props.phone)
    const email = str(props.email)
    return (
      <SectionShell props={props} tone="surface" className="ud-sal ud-sal-hero">
        <div className="ud-split ud-sal-hero__grid">
          <div className="ud-sal-hero__copy">
            <Kicker props={props} />
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h1" className="ud-sal-title ud-sal-title--xl" placeholder="Headline" />
            <div className="ud-sal-hero__contacts">
              {phone || edit ? (
                <div className="ud-sal-hero__contact">
                  <span className="ud-sal-hero__contact-icon" aria-hidden>
                    <Icon name="phone" size={18} />
                  </span>
                  <span>
                    <EditableText edit={edit} path={['phoneLabel']} value={str(props.phoneLabel)} as="span" className="ud-sal-hero__contact-label" placeholder="Call Us" />
                    <EditableText edit={edit} path={['phone']} value={phone} as="span" className="ud-sal-hero__contact-value" placeholder="Phone" />
                  </span>
                </div>
              ) : null}
              {email || edit ? (
                <div className="ud-sal-hero__contact">
                  <span className="ud-sal-hero__contact-icon" aria-hidden>
                    <Icon name="mail" size={18} />
                  </span>
                  <span>
                    <EditableText edit={edit} path={['emailLabel']} value={str(props.emailLabel)} as="span" className="ud-sal-hero__contact-label" placeholder="Mail Us" />
                    <EditableText edit={edit} path={['email']} value={email} as="span" className="ud-sal-hero__contact-value" placeholder="Email" />
                  </span>
                </div>
              ) : null}
            </div>
          </div>
          <div className="ud-split__media">
            <HeroCarousel props={props} />
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------- pagehead.salone */

export const pageHeadSalone = defineBlock({
  type: 'pagehead.salone',
  version: 1,
  category: 'hero',
  label: 'Salone page header',
  icon: 'Layout',
  defaultProps: {
    heading: 'About Us',
    homeLabel: 'Home',
    homeUrl: '/',
    parentLabel: 'Pages',
    backgroundType: 'image',
    backgroundImage: '',
    overlayColor: '#f8f7f4',
    overlayOpacity: 78,
  },
  schema: schema(headingField, text('homeLabel', 'Home link label'), link('homeUrl', 'Home link'), text('parentLabel', 'Middle crumb label')),
  component: function PageHeadSalone(props) {
    const edit = editOf(props)
    const heading = str(props.heading, 'Page')
    return (
      <SectionShell props={props} tone="surface" align="center" className="ud-sal ud-sal-pagehead">
        <EditableText edit={edit} path={['heading']} value={heading} as="h1" className="ud-sal-title ud-sal-title--xl" placeholder="Page title" />
        <nav className="ud-sal-crumbs" aria-label="Breadcrumb">
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

/* ------------------------------------------------------------- about.salone */

export const aboutSalone = defineBlock({
  type: 'about.salone',
  version: 1,
  category: 'content',
  label: 'Salone about + stats',
  icon: 'Info',
  defaultProps: {
    image: '',
    phoneLabel: 'Call us direct 24/7 for a free consultation',
    phone: '+0123456789',
    eyebrow: 'About Us',
    heading: 'Why People Choose Us!',
    description:
      'A relaxed, unhurried salon built around one idea: everyone leaves looking like the best version of themselves. Our stylists train year-round so the cut, colour or treatment you ask for is the one you get.',
    stats: [
      { icon: 'calendar', value: '25', label: 'Years experience' },
      { icon: 'users', value: '999', label: 'Happy customers' },
    ],
    buttonLabel: 'Read More',
    buttonUrl: '/about',
  },
  schema: schema(
    image('image', 'Image'),
    text('phoneLabel', 'Phone caption'),
    text('phone', 'Phone number'),
    eyebrowField,
    headingField,
    descriptionField,
    repeater('stats', 'Counters', [icon('icon', 'Icon'), text('value', 'Value'), text('label', 'Label')], { itemLabel: 'Counter' }),
    ...primaryCtaFields,
  ),
  component: function AboutSalone(props) {
    const edit = editOf(props)
    const stats = items(props.stats, [])
    const phone = str(props.phone)
    return (
      <SectionShell props={props} tone="default" className="ud-sal ud-sal-about">
        <div className="ud-split">
          <div>
            <Media src={props.image} alt={str(props.heading)} ratio="landscape" edit={edit} path={['image']} style={{ marginBottom: 20 }} />
            {phone || edit ? (
              <div className="ud-sal-callout">
                <span className="ud-sal-callout__icon" aria-hidden>
                  <Icon name="phone" size={26} />
                </span>
                <div>
                  <EditableText edit={edit} path={['phone']} value={phone} as="h3" className="ud-h3" placeholder="Phone" />
                  <EditableText edit={edit} path={['phoneLabel']} value={str(props.phoneLabel)} as="span" placeholder="Caption" />
                </div>
              </div>
            ) : null}
          </div>
          <div>
            <SalHead props={props} />
            {stats.length ? (
              <Grid cols={2} gap={16} style={{ marginTop: 8, marginBottom: 28 }}>
                {stats.map((stat, index) => (
                  <div key={index} className="ud-sal-stat">
                    <Icon name={str(stat.icon, 'star')} size={34} />
                    <EditableText edit={edit} path={['stats', index, 'value']} value={str(stat.value)} as="div" className="ud-sal-stat__value" placeholder="0" />
                    <EditableText edit={edit} path={['stats', index, 'label']} value={str(stat.label)} as="p" className="ud-sal-stat__label" placeholder="Label" />
                  </div>
                ))}
              </Grid>
            ) : null}
            <CtaGroup props={props} primaryVariant="primary" />
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------- services.salone */

const serviceCards = [
  { icon: 'scissors', title: 'Haircut', text: 'A precision cut and finish, tailored to your face shape and how much time you actually spend styling at home.' },
  { icon: 'palette', title: 'Makeup', text: 'Bridal, editorial or an evening out — colour-matched foundation and a look that photographs the way it feels.' },
  { icon: 'sparkles', title: 'Manicure', text: 'Shape, cuticle care and polish or gel, finished with a hand massage so it feels like more than a quick fix.' },
  { icon: 'star', title: 'Pedicure', text: 'A proper soak, callus care and polish — the kind of finish that holds up in sandals for weeks.' },
  { icon: 'heart', title: 'Massage', text: 'Swedish, deep tissue or a scalp and shoulder release booked alongside any other service on the menu.' },
  { icon: 'leaf', title: 'Skin Care', text: 'A facial matched to your skin on the day, not a one-size routine — cleanse, exfoliate, mask and moisturise.' },
]

export const servicesSalone = defineBlock({
  type: 'services.salone',
  version: 1,
  category: 'services',
  label: 'Salone service grid',
  icon: 'Layers',
  defaultProps: {
    eyebrow: 'Our Services',
    heading: 'Explore Our Services',
    items: serviceCards.map((card) => ({ ...card, buttonLabel: 'Read More', buttonUrl: '/service' })),
  },
  schema: schema(
    eyebrowField,
    headingField,
    repeater(
      'items',
      'Services',
      [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Description'), text('buttonLabel', 'Button label'), link('buttonUrl', 'Button link')],
      { itemLabel: 'Service' },
    ),
  ),
  component: function ServicesSalone(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="surface" align="center" className="ud-sal ud-sal-services">
        <SalHead props={props} align="center" />
        <div className="ud-sal-services__grid">
          {rows.map((item, index) => (
            <div key={index} className="ud-sal-service">
              <IconBadge name={str(item.icon, 'star')} shape="round" size="lg" />
              <Heading level={3} edit={edit} path={['items', index, 'title']}>
                {str(item.title, 'Service')}
              </Heading>
              <SafeText value={item.text} className="ud-text" edit={edit} path={['items', index, 'text']} placeholder="Description" />
              {str(item.buttonLabel) || edit ? (
                <Button href={str(item.buttonUrl, '#')} variant="outline" className="ud-sal-service__link">
                  <EditableText edit={edit} path={['items', index, 'buttonLabel']} value={str(item.buttonLabel, 'Read More')} placeholder="Read More" />
                  <Icon name="arrow" size={14} />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* -------------------------------------------------------------- team.salone */

const specialists = [
  { name: 'Lily Taylor', role: 'Hair Specialist' },
  { name: 'Olivia Smith', role: 'Nail Designer' },
  { name: 'Ava Brown', role: 'Beauty Specialist' },
  { name: 'Amelia Jones', role: 'Spa Specialist' },
]

export const teamSalone = defineBlock({
  type: 'team.salone',
  version: 1,
  category: 'team',
  label: 'Salone specialists grid',
  icon: 'Users',
  defaultProps: {
    eyebrow: 'Team Members',
    heading: 'Our Experienced Specialists',
    items: specialists.map((person) => ({
      ...person,
      image: '',
      social: [
        { icon: 'facebook', url: '#' },
        { icon: 'instagram', url: '#' },
        { icon: 'linkedin', url: '#' },
      ],
    })),
  },
  schema: schema(
    eyebrowField,
    headingField,
    repeater(
      'items',
      'Specialists',
      [image('image', 'Photo'), text('name', 'Name'), text('role', 'Role'), repeater('social', 'Social links', [icon('icon', 'Icon'), link('url', 'Link')], { itemLabel: 'Link' })],
      { itemLabel: 'Specialist' },
    ),
  ),
  component: function TeamSalone(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-sal ud-sal-team">
        <SalHead props={props} align="center" />
        <Grid cols={Math.min(rows.length || 1, 4)} gap={24} style={{ marginTop: 40 }}>
          {rows.map((item, index) => {
            const social = items(item.social, [])
            return (
              <article key={index} className="ud-sal-person">
                <Media src={item.image} alt={str(item.name)} ratio="portrait" className="ud-sal-person__img" edit={edit} path={['items', index, 'image']} />
                <div className="ud-sal-person__overlay">
                  <EditableText edit={edit} path={['items', index, 'role']} value={str(item.role)} as="p" className="ud-sal-person__role" placeholder="Role" />
                  <EditableText edit={edit} path={['items', index, 'name']} value={str(item.name)} as="h4" className="ud-sal-person__name" placeholder="Name" />
                  {social.length ? (
                    <div className="ud-sal-person__social">
                      {social.map((entry, linkIndex) => (
                        <a key={linkIndex} href={str(entry.url, '#')} aria-label={str(entry.icon, 'Social link')}>
                          <Icon name={str(entry.icon, 'link')} size={14} />
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            )
          })}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------- testimonials.salone */

export const testimonialsSalone = defineBlock({
  type: 'testimonials.salone',
  version: 1,
  category: 'testimonials',
  label: 'Salone client carousel',
  icon: 'Quote',
  defaultProps: {
    eyebrow: 'Testimonial',
    heading: 'What Clients Say!',
    items: [
      { text: 'They listened before they touched a single strand. The colour is exactly what I described, which has never happened anywhere else.', name: 'Grace Bennett', role: 'Regular client', image: '' },
      { text: 'Booked a facial on a whim and now it is a monthly habit. The room, the pace, the follow-up advice — all of it.', name: 'Noah Whitfield', role: 'New client', image: '' },
      { text: 'My daughter’s bridal party was seven people at once and every single one of us left thrilled with our hair.', name: 'Sophie Marlow', role: 'Bride, wedding party', image: '' },
      { text: 'The manicure held up for three full weeks of a beach holiday. That has never happened before.', name: 'Ivy Chapman', role: 'Regular client', image: '' },
    ],
  },
  schema: schema(eyebrowField, headingField, repeater('items', 'Quotes', [textarea('text', 'Quote'), text('name', 'Name'), text('role', 'Role'), image('image', 'Photo')], { itemLabel: 'Quote' })),
  component: function TestimonialsSalone(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    const [index, setIndex] = useState(0)
    const activeIndex = Math.min(index, Math.max(list.length - 1, 0))
    const active = list[activeIndex] || {}
    const go = (delta: number) => setIndex((current) => (current + delta + list.length) % Math.max(list.length, 1))
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-sal ud-sal-quotes">
        <SalHead props={props} align="center" />
        <div className="ud-sal-quote">
          <span className="ud-sal-quote__mark" aria-hidden>
            <Icon name="quote" size={64} />
          </span>
          <SafeText value={str(active.text)} className="ud-sal-quote__text" edit={edit} path={['items', activeIndex, 'text']} placeholder="What did they say?" />
          <Media src={active.image} alt={str(active.name)} ratio="square" className="ud-sal-quote__avatar" edit={edit} path={['items', activeIndex, 'image']} />
          <EditableText edit={edit} path={['items', activeIndex, 'name']} value={str(active.name)} as="h4" className="ud-sal-quote__name" placeholder="Name" />
          <EditableText edit={edit} path={['items', activeIndex, 'role']} value={str(active.role)} as="span" className="ud-sal-quote__role" placeholder="Role" />
        </div>
        {list.length > 1 ? (
          <div className="ud-sal-quote__nav">
            <button type="button" aria-label="Previous testimonial" onClick={() => go(-1)}>
              <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>
                <Icon name="arrow" size={16} />
              </span>
            </button>
            <button type="button" aria-label="Next testimonial" onClick={() => go(1)}>
              <Icon name="arrow" size={16} />
            </button>
          </div>
        ) : null}
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- contact.salone */

export const contactSalone = defineBlock({
  type: 'contact.salone',
  version: 1,
  category: 'form',
  label: 'Salone contact form',
  icon: 'Mail',
  defaultProps: {
    eyebrow: 'Contact',
    heading: 'Have Any Query? Contact Us',
    description: '',
    formId: '',
    buttonLabel: 'Send Message',
  },
  schema: schema(eyebrowField, headingField, descriptionField, text('formId', 'Form ID'), text('buttonLabel', 'Submit label')),
  component: function ContactSalone(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-sal ud-sal-contact">
        <SalHead props={props} align="center" />
        <div className="ud-sal-contact__panel">
          <PublicForm formId={str(props.formId)} submitLabel={str(props.buttonLabel, 'Send Message')} edit={edit} submitLabelPath={['buttonLabel']} />
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* -------------------------------------------------------------- footer.salone */

export const footerSalone = defineBlock({
  type: 'footer.salone',
  version: 1,
  category: 'footer',
  label: 'Salone footer',
  icon: 'Layout',
  defaultProps: {
    logo: 'Salone',
    logoImage: '',
    logoUrl: '/',
    description: 'A neighbourhood salon built on one idea: everyone leaves looking like the best version of themselves. Book a chair, a chat and a coffee while you are at it.',
    address: '123 Street, New York, USA',
    phone: '+012 345 67890',
    email: 'info@example.com',
    social: [
      { icon: 'twitter', url: '#' },
      { icon: 'facebook', url: '#' },
      { icon: 'linkedin', url: '#' },
      { icon: 'instagram', url: '#' },
    ],
    columns: [
      {
        title: 'Quick Links',
        links: [
          { label: 'About Us', url: '/about' },
          { label: 'Contact Us', url: '/contact' },
          { label: 'Our Services', url: '/service' },
          { label: 'Terms & Condition', url: '#' },
        ],
      },
      {
        title: 'Popular Links',
        links: [
          { label: 'Our Team', url: '/team' },
          { label: 'Testimonial', url: '/testimonial' },
          { label: 'Our Services', url: '/service' },
          { label: 'Book Appointment', url: '/contact' },
        ],
      },
    ],
    newsletterHeading: 'Newsletter',
    newsletterText: 'Get seasonal offers and stylist availability by email.',
    newsletterLabel: 'Sign up',
    formId: '',
    copyright: 'Salone, All Right Reserved.',
    creditLabel: 'Designed By HTML Codex',
    creditUrl: 'https://htmlcodex.com',
  },
  schema: schema(
    ...logoFields,
    textarea('description', 'Description'),
    text('address', 'Address'),
    text('phone', 'Phone'),
    text('email', 'Email'),
    repeater('social', 'Social links', [icon('icon', 'Icon'), link('url', 'Link')], { itemLabel: 'Link' }),
    repeater('columns', 'Link columns', [text('title', 'Title'), repeater('links', 'Links', [text('label', 'Label'), link('url', 'Link')], { itemLabel: 'Link' })], { itemLabel: 'Column' }),
    text('newsletterHeading', 'Newsletter heading'),
    text('newsletterText', 'Newsletter note'),
    text('newsletterLabel', 'Newsletter button'),
    text('formId', 'Newsletter form ID'),
    text('copyright', 'Copyright (after the ©)'),
    text('creditLabel', 'Credit label', { help: 'The template author’s attribution. Keep this if you are using the free Salone design.' }),
    link('creditUrl', 'Credit link'),
  ),
  component: function FooterSalone(props) {
    const edit = editOf(props)
    const columns = items(props.columns, [])
    const social = items(props.social, [])
    return (
      <footer className="ud-sal ud-sal-footer">
        <div className="ud-container ud-sal-footer__grid">
          <div className="ud-sal-footer__brand">
            <SaloneLogo props={props} light />
            <SafeText value={str(props.description)} className="ud-sal-footer__desc" edit={edit} path={['description']} placeholder="Description" />
            <ul className="ud-sal-footer__meta">
              <li>
                <Icon name="map-pin" size={14} />
                <EditableText edit={edit} path={['address']} value={str(props.address)} placeholder="Address" />
              </li>
              <li>
                <Icon name="phone" size={14} />
                <EditableText edit={edit} path={['phone']} value={str(props.phone)} placeholder="Phone" />
              </li>
              <li>
                <Icon name="mail" size={14} />
                <EditableText edit={edit} path={['email']} value={str(props.email)} placeholder="Email" />
              </li>
            </ul>
            {social.length ? (
              <div className="ud-sal-footer__social">
                {social.map((item, index) => (
                  <a key={index} href={str(item.url, '#')} aria-label={str(item.icon, 'Social link')}>
                    <Icon name={str(item.icon, 'link')} size={15} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
          <div className="ud-sal-footer__cols">
            {columns.map((column, index) => (
              <div key={index} className="ud-sal-footer__col">
                <EditableText edit={edit} path={['columns', index, 'title']} value={str(column.title)} as="h4" placeholder="Column" />
                <div>
                  {items(column.links, []).map((item, linkIndex) => (
                    <a key={linkIndex} className="ud-sal-footer__link" href={str(item.url, '#')}>
                      <EditableText edit={edit} path={['columns', index, 'links', linkIndex, 'label']} value={str(item.label)} placeholder="Link" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
            <div className="ud-sal-footer__col">
              <EditableText edit={edit} path={['newsletterHeading']} value={str(props.newsletterHeading)} as="h4" placeholder="Newsletter" />
              <PublicForm formId={str(props.formId)} layout="inline" submitLabel={str(props.newsletterLabel, 'Sign up')} edit={edit} submitLabelPath={['newsletterLabel']} />
              {str(props.newsletterText) || edit ? (
                <EditableText edit={edit} path={['newsletterText']} value={str(props.newsletterText)} as="p" className="ud-small" placeholder="Note" />
              ) : null}
            </div>
          </div>
        </div>
        <div className="ud-container ud-sal-footer__base">
          <p>
            &copy;{' '}
            <EditableText edit={edit} path={['copyright']} value={str(props.copyright, 'Salone, All Right Reserved.')} placeholder="Site name, All Right Reserved." />
          </p>
          <p>
            <a href={str(props.creditUrl, 'https://htmlcodex.com')}>
              <EditableText edit={edit} path={['creditLabel']} value={str(props.creditLabel, 'Designed By HTML Codex')} placeholder="Designed By HTML Codex" />
            </a>
          </p>
        </div>
      </footer>
    )
  },
})
