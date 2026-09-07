/**
 * Curalo — a personal-training and coaching template.
 *
 * Visual language: a photographic hero and CTA bands broken by pure-black
 * navigation, testimonial and footer sections, one bright cyan accent
 * carrying every button and eyebrow, and tight uppercase IBM Plex Mono
 * headlines over plain Inter body copy.
 *
 * Every block routes through `schema()`, which appends the shared design /
 * typography / background / spacing / content-width controls, so each one is
 * editable on the canvas and in the side panel and stays reusable on any page.
 * Buttons, cards, lists and grids reuse the shared primitives (`Button`,
 * `Card`, `CheckList`, `Grid`, `IconBadge`) rather than bespoke components, so
 * the family recolours from theme tokens instead of hard-coded styling.
 */
import { useState, type CSSProperties } from 'react'
import { EditableImage, EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Button,
  Card,
  CheckList,
  CtaGroup,
  Grid,
  Heading,
  IconBadge,
  Media,
  SafeText,
  SectionHead,
  SectionShell,
  animationOf,
  bool,
  cx,
  items,
  lines,
  num,
  sectionVars,
  str,
} from '../primitives'
import { PublicForm } from '../public-form'
import {
  ctaFields,
  descriptionField,
  eyebrowField,
  field,
  headFields,
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
  toggle,
} from '../schema'
import { defineBlock } from '../types'

/* ------------------------------------------------------------------ logo */

function CuraloLogo({ props, light = false }: { props: Record<string, unknown>; light?: boolean }) {
  const edit = editOf(props)
  const src = str(props.logoImage)
  return (
    <a className={cx('ud-cu-logo', light && 'ud-cu-logo--light')} href={str(props.logoUrl, '/')}>
      {src ? (
        <span className="ud-cu-logo__img">
          <img src={src} alt={str(props.logo, 'Logo')} />
          <EditableImage edit={edit} path={['logoImage']} current={src} label="Replace logo" />
        </span>
      ) : (
        <>
          <span className="ud-cu-logo__mark" aria-hidden>
            <Icon name="zap" size={14} />
          </span>
          <EditableText
            edit={edit}
            path={['logo']}
            value={str(props.logo, 'Curalo')}
            as="span"
            className="ud-cu-logo__text"
            placeholder="Brand"
          />
        </>
      )}
    </a>
  )
}

const logoFields = [text('logo', 'Wordmark'), image('logoImage', 'Logo image'), link('logoUrl', 'Logo link')]

/* ----------------------------------------------------------- navbar.curalo */

export const navbarCuralo = defineBlock({
  type: 'navbar.curalo',
  version: 1,
  category: 'navigation',
  label: 'Curalo navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Curalo',
    logoImage: '',
    logoUrl: '/',
    links: [
      { label: 'Coaching', url: '/coaching' },
      { label: 'Pricing', url: '/pricing' },
      { label: 'How it works', url: '/how-it-works' },
      { label: 'Our Trainers', url: '/trainers' },
    ],
    buttonLabel: 'Book a Consultation',
    buttonUrl: '/contact',
    sticky: true,
    animation: 'fade-down',
    animationTrigger: 'load',
  },
  schema: schema(...logoFields, navLinksField('links', 'Links'), text('buttonLabel', 'Button label'), link('buttonUrl', 'Button link'), stickyField),
  component: function NavbarCuralo(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    const anim = animationOf(props)
    return (
      <header
        className={cx('ud-cu', 'ud-cu-nav', bool(props.sticky, true) && 'ud-cu-nav--sticky', anim.className)}
        style={{ ...sectionVars(props, 'dark'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container ud-cu-nav__bar">
          <CuraloLogo props={props} light />
          <nav className={cx('ud-cu-nav__links', open && 'is-open')} aria-label="Primary">
            {items(props.links, []).map((item, index) => (
              <a key={index} className="ud-cu-nav__link" href={str(item.url, '#')}>
                <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
              </a>
            ))}
          </nav>
          <div className="ud-cu-nav__end">
            {str(props.buttonLabel) || edit ? (
              <Button href={str(props.buttonUrl, '#')} variant="accent">
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
              </Button>
            ) : null}
            <button
              type="button"
              className="ud-cu-nav__toggle"
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

/* -------------------------------------------------------------- hero.curalo */

export const heroCuralo = defineBlock({
  type: 'hero.curalo',
  version: 1,
  category: 'hero',
  label: 'Curalo photo hero',
  icon: 'Sparkles',
  defaultProps: {
    heading: 'Every interaction coached for your lifestyle',
    description: 'Curalo is personal training built around you. Tailored coaching that helps you get stronger, healthier and more confident.',
    buttonLabel: 'Book a Consultation',
    buttonUrl: '/contact',
    secondaryLabel: 'Pricing options',
    secondaryUrl: '/pricing',
    backgroundType: 'image',
    backgroundImage: '',
    overlayColor: '#000000',
    overlayOpacity: 45,
    lightText: true,
    minHeight: 620,
    textAnimation: 'fade-up',
    animation: 'fade-up',
    animationTrigger: 'load',
  },
  schema: schema(headingField, descriptionField, ...ctaFields, slider('minHeight', 'Minimum height', 380, 900, 'layout', { unit: 'px' })),
  component: function HeroCuralo(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="dark" className="ud-cu ud-cu-hero" bleed style={{ minHeight: num(props.minHeight, 620) }}>
        <div className="ud-container ud-cu-hero__inner">
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h1" className="ud-h1" placeholder="Headline" />
          {str(props.description) || edit ? (
            <SafeText value={str(props.description)} className="ud-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
          ) : null}
          <CtaGroup props={props} primaryVariant="accent" secondaryVariant="outline" />
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- logos.curalo */

export const logosCuralo = defineBlock({
  type: 'logos.curalo',
  version: 1,
  category: 'features',
  label: 'Curalo trust bar',
  icon: 'Grid',
  defaultProps: {
    heading: 'Teams already running our programs',
    scroll: false,
    speed: 30,
    items: [
      { label: 'Northline' },
      { label: 'Fairpoint' },
      { label: 'Vantage Labs' },
      { label: 'Solstice' },
      { label: 'Marrow Co' },
      { label: 'Kindling' },
      { label: 'Haus & Co' },
    ],
  },
  schema: schema(
    headingField,
    repeater('items', 'Logos', [text('label', 'Label'), image('image', 'Logo')], { itemLabel: 'Logo' }),
    toggle('scroll', 'Scroll continuously', 'design'),
    field('speed', 'slider', 'Seconds per loop', 'design', { min: 10, max: 90, unit: 's' }),
  ),
  component: function LogosCuralo(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const scrolling = bool(props.scroll, false) && !edit && rows.length > 0
    const seconds = Math.min(Math.max(num(props.speed, 30), 10), 90)
    const passes = rows.length ? Math.max(1, Math.ceil(10 / rows.length)) : 1

    const cell = (item: Record<string, unknown>, index: number, keyPrefix: string, decorative: boolean) =>
      str(item.image) ? (
        <Media
          key={keyPrefix + String(index)}
          src={item.image}
          alt={decorative ? '' : str(item.label)}
          ratio="wide"
          className="ud-cu-logos__img"
          edit={decorative ? undefined : edit}
          path={['items', index, 'image']}
        />
      ) : (
        <EditableText
          key={keyPrefix + String(index)}
          edit={decorative ? undefined : edit}
          path={['items', index, 'label']}
          value={str(item.label)}
          as="span"
          className="ud-cu-logos__word"
          placeholder="Brand"
        />
      )

    const track = Array.from({ length: scrolling ? passes * 2 : 1 }).flatMap((_, pass) =>
      rows.map((item, index) => cell(item, index, `p${pass}-`, pass > 0)),
    )

    return (
      <SectionShell props={props} tone="default" className="ud-cu ud-cu-logos" bleed>
        {str(props.heading) || edit ? (
          <div className="ud-container">
            <EditableText
              edit={edit}
              path={['heading']}
              value={str(props.heading)}
              as="p"
              className="ud-cu-logos__heading"
              placeholder="Trusted by"
            />
          </div>
        ) : null}
        <div className={cx('ud-cu-logos__viewport', scrolling && 'is-scrolling')}>
          <div className="ud-cu-logos__rail" style={{ '--cu-marquee': `${seconds}s` } as CSSProperties}>
            {track}
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* -------------------------------------------------------------- intro.curalo */

export const introCuralo = defineBlock({
  type: 'intro.curalo',
  version: 1,
  category: 'content',
  label: 'Curalo coaching intro',
  icon: 'Heart',
  defaultProps: {
    eyebrow: 'The Curalo difference',
    heading: 'Coaching with a personal touch',
    description:
      'A Curalo trainer gets to know you — how you move, what motivates you and what your week actually looks like. That’s what turns a workout into progress you stick with.',
    items: [
      { icon: 'users', text: 'A dedicated coach who knows your goals' },
      { icon: 'heart', text: 'Care that goes beyond the session' },
      { icon: 'chart', text: 'Progress that’s tracked, celebrated and adjusted' },
    ],
    buttonLabel: 'Meet the trainers',
    buttonUrl: '/trainers',
    image: '',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater('items', 'Points', [icon('icon', 'Icon'), text('text', 'Text')], {
      itemLabel: 'Point',
      itemDefaults: { icon: 'star', text: 'What makes this different' },
    }),
    image('image', 'Image'),
    ...primaryCtaFields,
  ),
  component: function IntroCuralo(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-cu ud-cu-intro">
        <div className="ud-split">
          <div>
            <SectionHead props={props} center={false} />
            {rows.length ? (
              <ul className="ud-list" style={{ marginTop: 24 }}>
                {rows.map((item, index) => (
                  <li key={index}>
                    <Icon name={str(item.icon, 'star')} />
                    <EditableText edit={edit} path={['items', index, 'text']} value={str(item.text)} as="span" placeholder="Point" />
                  </li>
                ))}
              </ul>
            ) : null}
            <CtaGroup props={props} primaryVariant="accent" />
          </div>
          <div className="ud-split__media">
            <Media src={props.image} alt={str(props.heading)} ratio="portrait" edit={edit} path={['image']} />
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ----------------------------------------------------------- services.curalo */

export const servicesCuralo = defineBlock({
  type: 'services.curalo',
  version: 1,
  category: 'services',
  label: 'Curalo program cards',
  icon: 'Layers',
  defaultProps: {
    eyebrow: 'What you get',
    heading: 'Custom programing',
    description: '',
    items: [
      {
        title: 'Community',
        text: 'Training with a crew that keeps you honest and shows up for you. You’ll train alongside people chasing the same goals, so the energy and support carry you still further.',
        image: '',
      },
      {
        title: 'Nutrition plans',
        text: 'Meal-prepped plans built around your goals and the food you love. Every week you get a clear eating plan, so fuelling your training never becomes guesswork.',
        image: '',
      },
      {
        title: 'Progression',
        text: 'Progress you can see and feel tracked week after week. We log your lifts and measurements so you always know you’re getting stronger and moving forward.',
        image: '',
      },
    ],
  },
  schema: schema(...headFields, repeater('items', 'Cards', [image('image', 'Image'), text('title', 'Title'), textarea('text', 'Description')], { itemLabel: 'Card' })),
  component: function ServicesCuralo(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-cu ud-cu-services">
        <SectionHead props={props} />
        <Grid cols={Math.min(rows.length || 1, 3)} gap={28} style={{ marginTop: 40 }}>
          {rows.map((item, index) => (
            <div key={index} className="ud-cu-service">
              <Media
                src={item.image}
                alt={str(item.title)}
                ratio="square"
                className="ud-cu-service__img"
                edit={edit}
                path={['items', index, 'image']}
              />
              <Heading level={4} edit={edit} path={['items', index, 'title']}>
                {str(item.title, 'Title')}
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

/* ---------------------------------------------------------------- cta.curalo */

export const ctaCuralo = defineBlock({
  type: 'cta.curalo',
  version: 1,
  category: 'cta',
  label: 'Curalo photo banner',
  icon: 'Megaphone',
  defaultProps: {
    eyebrow: 'Nutrition, sorted',
    heading: 'Meal-prepped plans, ready every week',
    description:
      'No more guessing what to eat. Every week you get a meal-prepped plan built around your goals, your schedule, and the foods you actually enjoy — so the hardest part of eating well is already done for you.',
    buttonLabel: '',
    buttonUrl: '',
    backgroundType: 'image',
    backgroundImage: '',
    overlayColor: '#000000',
    overlayOpacity: 55,
    lightText: true,
    textAlign: 'center',
  },
  schema: schema(...headFields, ...ctaFields),
  component: function CtaCuralo(props) {
    return (
      <SectionShell props={props} tone="dark" align="center" className="ud-cu ud-cu-cta">
        <div style={{ maxWidth: 720, marginInline: 'auto' }}>
          <SectionHead props={props} center />
          <CtaGroup props={props} primaryVariant="accent" secondaryVariant="outline" />
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------------- team.curalo */

const coaches = [
  {
    name: 'Jessica Haywood',
    role: 'Head Coach & Founder',
    bio: 'Jessica founded Curalo to make expert personal training approachable, personal and results-driven for everyone.',
    image: '',
    social: [
      { icon: 'instagram', url: '#' },
      { icon: 'twitter', url: '#' },
    ],
  },
  {
    name: 'Jordan Lee',
    role: 'Strength Coach',
    bio: 'Jordan specialises in building strength and confidence through progressive, sustainable training.',
    image: '',
    social: [
      { icon: 'instagram', url: '#' },
      { icon: 'twitter', url: '#' },
    ],
  },
  {
    name: 'Sam Taylor',
    role: 'Wellness Coach',
    bio: 'Sam helps clients build healthy habits that last, balancing training with everyday life.',
    image: '',
    social: [
      { icon: 'instagram', url: '#' },
      { icon: 'twitter', url: '#' },
    ],
  },
]

export const teamCuralo = defineBlock({
  type: 'team.curalo',
  version: 1,
  category: 'team',
  label: 'Curalo coach grid',
  icon: 'Users',
  defaultProps: {
    eyebrow: 'Our trainers',
    heading: 'Meet your coaches',
    description: '',
    items: coaches,
    closingHeading: 'Train with a coach who gets you',
    closingText: 'Book a consultation and meet the team.',
    closingButtonLabel: 'Book a Consultation',
    closingButtonUrl: '/contact',
  },
  schema: schema(
    ...headFields,
    repeater(
      'items',
      'Coaches',
      [
        image('image', 'Photo'),
        text('name', 'Name'),
        text('role', 'Role'),
        textarea('bio', 'Bio'),
        repeater('social', 'Social links', [icon('icon', 'Icon'), link('url', 'Link')], { itemLabel: 'Link' }),
      ],
      { itemLabel: 'Coach' },
    ),
    text('closingHeading', 'Closing heading'),
    textarea('closingText', 'Closing text'),
    text('closingButtonLabel', 'Closing button label'),
    link('closingButtonUrl', 'Closing button link'),
  ),
  component: function TeamCuralo(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const closingHeading = str(props.closingHeading)
    const closingButtonLabel = str(props.closingButtonLabel)
    return (
      <SectionShell props={props} tone="default" className="ud-cu ud-cu-team">
        <SectionHead props={props} />
        <Grid cols={Math.min(rows.length || 1, 3)} gap={28} style={{ marginTop: 40 }}>
          {rows.map((item, index) => {
            const social = items(item.social, [])
            return (
              <article key={index} className="ud-cu-person">
                <Media
                  src={item.image}
                  alt={str(item.name)}
                  ratio="portrait"
                  className="ud-cu-person__img"
                  edit={edit}
                  path={['items', index, 'image']}
                />
                <Heading level={4} edit={edit} path={['items', index, 'name']}>
                  {str(item.name, 'Name')}
                </Heading>
                <EditableText
                  edit={edit}
                  path={['items', index, 'role']}
                  value={str(item.role)}
                  as="p"
                  className="ud-cu-person__role"
                  placeholder="Role"
                />
                <SafeText value={item.bio} className="ud-text" edit={edit} path={['items', index, 'bio']} placeholder="Short bio" />
                {social.length ? (
                  <div className="ud-cu-person__social">
                    {social.map((entry, linkIndex) => (
                      <a key={linkIndex} href={str(entry.url, '#')} aria-label={str(entry.icon, 'Social link')}>
                        <Icon name={str(entry.icon, 'link')} size={15} />
                      </a>
                    ))}
                  </div>
                ) : null}
              </article>
            )
          })}
        </Grid>
        {closingHeading || closingButtonLabel || edit ? (
          <div className="ud-cu-team__closing">
            <EditableText edit={edit} path={['closingHeading']} value={closingHeading} as="h3" className="ud-h3" placeholder="Closing heading" />
            {str(props.closingText) || edit ? (
              <SafeText value={str(props.closingText)} className="ud-text" edit={edit} path={['closingText']} placeholder="Closing text" />
            ) : null}
            {closingButtonLabel || edit ? (
              <Button href={str(props.closingButtonUrl, '#')} variant="accent">
                <EditableText edit={edit} path={['closingButtonLabel']} value={closingButtonLabel} placeholder="Button" />
              </Button>
            ) : null}
          </div>
        ) : null}
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------- testimonials.curalo */

export const testimonialsCuralo = defineBlock({
  type: 'testimonials.curalo',
  version: 1,
  category: 'testimonials',
  label: 'Curalo client results',
  icon: 'Quote',
  defaultProps: {
    eyebrow: 'Client results',
    heading: 'Real people, real results',
    description: 'Here’s what clients say about training with Curalo.',
    items: [
      {
        text: 'Curalo completely changed how I think about training. I’m stronger and more confident than I’ve ever been.',
        name: 'Mia Chen',
        role: 'Client for 18 months',
      },
      {
        text: 'The coaching is personal and the accountability keeps me showing up every single week.',
        name: 'James Park',
        role: 'Client for 6 months',
      },
      {
        text: 'I came in as a complete beginner and now training is a part of my routine I actually look forward to.',
        name: 'Priya Nair',
        role: 'Client for 12 months',
      },
    ],
  },
  schema: schema(...headFields, repeater('items', 'Quotes', [textarea('text', 'Quote'), text('name', 'Name'), text('role', 'Role')], { itemLabel: 'Quote' })),
  component: function TestimonialsCuralo(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="dark" className="ud-cu ud-cu-quotes">
        <SectionHead props={props} />
        <Grid cols={Math.min(rows.length || 1, 3)} gap={28} style={{ marginTop: 40 }}>
          {rows.map((item, index) => (
            <figure key={index} className="ud-cu-quote">
              <SafeText value={str(item.text)} className="ud-cu-quote__text" edit={edit} path={['items', index, 'text']} placeholder="What they said" />
              <figcaption>
                <EditableText edit={edit} path={['items', index, 'name']} value={str(item.name)} as="span" className="ud-cu-quote__name" placeholder="Name" />
                <EditableText edit={edit} path={['items', index, 'role']} value={str(item.role)} as="span" className="ud-cu-quote__role" placeholder="Role" />
              </figcaption>
            </figure>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* -------------------------------------------------------------- pricing.curalo */

const plans = [
  {
    icon: 'users',
    name: 'Basic Plan',
    subtitle: 'For individuals',
    price: '$19',
    period: '/mo',
    yearlyNote: 'or $180 yearly',
    features: 'Feature text goes here\nFeature text goes here\nFeature text goes here\nFeature text goes here',
    buttonLabel: 'Get started',
    buttonUrl: '/contact',
    featured: false,
  },
  {
    icon: 'briefcase',
    name: 'Business Plan',
    subtitle: 'For growing teams',
    price: '$29',
    period: '/mo',
    yearlyNote: 'or $280 yearly',
    features: 'Feature text goes here\nFeature text goes here\nFeature text goes here\nFeature text goes here',
    buttonLabel: 'Get started',
    buttonUrl: '/contact',
    featured: true,
  },
  {
    icon: 'globe',
    name: 'Enterprise Plan',
    subtitle: 'For large teams',
    price: '$49',
    period: '/mo',
    yearlyNote: 'or $480 yearly',
    features: 'Feature text goes here\nFeature text goes here\nFeature text goes here\nFeature text goes here',
    buttonLabel: 'Get started',
    buttonUrl: '/contact',
    featured: false,
  },
]

export const pricingCuralo = defineBlock({
  type: 'pricing.curalo',
  version: 1,
  category: 'pricing',
  label: 'Curalo coaching plans',
  icon: 'CreditCard',
  defaultProps: {
    eyebrow: 'Pricing',
    heading: 'Simple, transparent pricing',
    description: 'Choose the coaching option that fits your goals and your budget.',
    items: plans,
  },
  schema: schema(
    ...headFields,
    repeater(
      'items',
      'Plans',
      [
        icon('icon', 'Icon'),
        text('name', 'Plan name'),
        text('subtitle', 'Subtitle'),
        text('price', 'Price'),
        text('period', 'Period'),
        text('yearlyNote', 'Yearly note'),
        textarea('features', 'Includes (one per line)'),
        text('buttonLabel', 'Button label'),
        link('buttonUrl', 'Button link'),
        toggle('featured', 'Highlight', 'content'),
      ],
      { itemLabel: 'Plan' },
    ),
  ),
  component: function PricingCuralo(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-cu ud-cu-pricing">
        <SectionHead props={props} center />
        <Grid cols={Math.min(rows.length || 1, 3)} gap={24} style={{ marginTop: 40, alignItems: 'start' }}>
          {rows.map((item, index) => {
            const featured = bool(item.featured, false)
            return (
              <Card key={index} variant={featured ? 'featured' : 'solid'} style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <IconBadge name={str(item.icon, 'users')} shape="round" />
                <Heading level={4} edit={edit} path={['items', index, 'name']} style={{ marginTop: 18 }}>
                  {str(item.name, 'Plan')}
                </Heading>
                <EditableText
                  edit={edit}
                  path={['items', index, 'subtitle']}
                  value={str(item.subtitle)}
                  as="p"
                  className="ud-text"
                  placeholder="Who it’s for"
                />
                <div className="ud-cu-plan__price">
                  <EditableText edit={edit} path={['items', index, 'price']} value={str(item.price, '$0')} as="span" className="ud-h2" placeholder="$0" />
                  <EditableText edit={edit} path={['items', index, 'period']} value={str(item.period, '/mo')} as="span" className="ud-small" placeholder="/mo" />
                </div>
                {str(item.yearlyNote) || edit ? (
                  <EditableText
                    edit={edit}
                    path={['items', index, 'yearlyNote']}
                    value={str(item.yearlyNote)}
                    as="p"
                    className="ud-small"
                    placeholder="or $0 yearly"
                  />
                ) : null}
                <p className="ud-cu-plan__includes">Includes:</p>
                <CheckList values={lines(item.features)} edit={edit} path={['items', index, 'features']} />
                <div style={{ marginTop: 'auto', paddingTop: 24 }}>
                  <Button href={str(item.buttonUrl, '#')} variant={featured ? 'accent' : 'outline'} style={{ width: '100%' }}>
                    <EditableText
                      edit={edit}
                      path={['items', index, 'buttonLabel']}
                      value={str(item.buttonLabel, 'Get started')}
                      placeholder="Get started"
                    />
                  </Button>
                </div>
              </Card>
            )
          })}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------------ faq.curalo */

export const faqCuralo = defineBlock({
  type: 'faq.curalo',
  version: 1,
  category: 'faq',
  label: 'Curalo questions grid',
  icon: 'HelpCircle',
  defaultProps: {
    eyebrow: 'FAQ',
    heading: 'Questions, answered',
    description: 'Everything you need to know before you start training with Curalo.',
    items: [
      {
        question: 'Do I need experience to train with Curalo?',
        answer: 'No. Every program is tailored to your level, whether you’re a complete beginner or an experienced lifter.',
      },
      {
        question: 'What should I bring to my first session?',
        answer: 'Just comfortable training clothes and water. We’ll handle the plan and the equipment.',
      },
      {
        question: 'How often should I train?',
        answer: 'It depends on your goals and schedule. Most clients train two to three times a week, and we’ll build a plan that fits.',
      },
      {
        question: 'What if I need to pause or cancel?',
        answer: 'Life happens. We offer flexible scheduling and easy options to pause or adjust your plan when you need to.',
      },
    ],
    closingHeading: 'Still have questions?',
    closingText: 'Get in touch and we’ll help you find the right fit.',
    closingButtonLabel: 'Contact us',
    closingButtonUrl: '/contact',
  },
  schema: schema(
    ...headFields,
    repeater('items', 'Questions', [text('question', 'Question'), textarea('answer', 'Answer')], { itemLabel: 'Question' }),
    text('closingHeading', 'Closing heading'),
    textarea('closingText', 'Closing text'),
    text('closingButtonLabel', 'Closing button label'),
    link('closingButtonUrl', 'Closing button link'),
  ),
  component: function FaqCuralo(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const [open, setOpen] = useState(0)
    const closingHeading = str(props.closingHeading)
    const closingButtonLabel = str(props.closingButtonLabel)
    return (
      <SectionShell props={props} tone="default" className="ud-cu ud-cu-faq">
        <SectionHead props={props} center />
        <div className="ud-cu-faq__grid">
          {rows.map((item, index) => {
            // Every answer stays open in the builder, so copy is never hidden
            // behind an interaction the editor has to discover.
            const isOpen = Boolean(edit) || open === index
            return (
              <div key={index} className={cx('ud-cu-faq__row', isOpen && 'is-open')}>
                <button type="button" className="ud-cu-faq__q" aria-expanded={isOpen} onClick={() => setOpen((current) => (current === index ? -1 : index))}>
                  <EditableText edit={edit} path={['items', index, 'question']} value={str(item.question)} as="span" placeholder="Question" />
                  <span className="ud-cu-faq__sign" aria-hidden>
                    <Icon name={isOpen ? 'minus' : 'plus'} size={16} />
                  </span>
                </button>
                <div className="ud-cu-faq__a" hidden={!isOpen}>
                  <SafeText value={str(item.answer)} edit={edit} path={['items', index, 'answer']} placeholder="Answer" />
                </div>
              </div>
            )
          })}
        </div>
        {closingHeading || closingButtonLabel || edit ? (
          <div className="ud-cu-faq__closing">
            <EditableText edit={edit} path={['closingHeading']} value={closingHeading} as="h3" className="ud-h3" placeholder="Closing heading" />
            {str(props.closingText) || edit ? (
              <SafeText value={str(props.closingText)} className="ud-text" edit={edit} path={['closingText']} placeholder="Closing text" />
            ) : null}
            {closingButtonLabel || edit ? (
              <Button href={str(props.closingButtonUrl, '#')} variant="outline">
                <EditableText edit={edit} path={['closingButtonLabel']} value={closingButtonLabel} placeholder="Button" />
              </Button>
            ) : null}
          </div>
        ) : null}
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------------- footer.curalo */

export const footerCuralo = defineBlock({
  type: 'footer.curalo',
  version: 1,
  category: 'footer',
  label: 'Curalo footer',
  icon: 'Layout',
  defaultProps: {
    logo: 'Curalo',
    logoImage: '',
    logoUrl: '/',
    social: [
      { icon: 'instagram', url: '#' },
      { icon: 'twitter', url: '#' },
      { icon: 'facebook', url: '#' },
      { icon: 'linkedin', url: '#' },
    ],
    columns: [
      {
        title: 'Explore',
        links: [
          { label: 'Home', url: '/' },
          { label: 'Coaching', url: '/coaching' },
          { label: 'How it works', url: '/how-it-works' },
          { label: 'Pricing', url: '/pricing' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'Our Trainers', url: '/trainers' },
          { label: 'Contact', url: '/contact' },
        ],
      },
      {
        title: 'Programs',
        links: [
          { label: 'One-on-one', url: '/coaching' },
          { label: 'Small group', url: '/coaching' },
          { label: 'Online coaching', url: '/coaching' },
        ],
      },
    ],
    newsletterHeading: 'Stay up to date with our latest news',
    newsletterLabel: 'Sign up',
    formId: '',
    bannerHeading: 'Let’s begin',
    bannerImage: '',
    copyright: '© 2026 Curalo. All rights reserved.',
    privacyLabel: 'Privacy Policy',
    privacyUrl: '#',
    termsLabel: 'Terms of Service',
    termsUrl: '#',
  },
  schema: schema(
    ...logoFields,
    repeater('social', 'Social links', [icon('icon', 'Icon'), link('url', 'Link')], { itemLabel: 'Link' }),
    repeater(
      'columns',
      'Link columns',
      [text('title', 'Title'), repeater('links', 'Links', [text('label', 'Label'), link('url', 'Link')], { itemLabel: 'Link' })],
      { itemLabel: 'Column' },
    ),
    text('newsletterHeading', 'Newsletter heading'),
    text('newsletterLabel', 'Newsletter button'),
    text('formId', 'Newsletter form ID'),
    text('bannerHeading', 'Banner heading'),
    image('bannerImage', 'Banner background image'),
    text('copyright', 'Copyright'),
    text('privacyLabel', 'Privacy link label'),
    link('privacyUrl', 'Privacy link'),
    text('termsLabel', 'Terms link label'),
    link('termsUrl', 'Terms link'),
  ),
  component: function FooterCuralo(props) {
    const edit = editOf(props)
    const anim = animationOf(props)
    const columns = items(props.columns, [])
    const social = items(props.social, [])
    const bannerImage = str(props.bannerImage)
    return (
      <footer className={cx('ud-cu', 'ud-cu-footer', anim.className)} style={{ ...sectionVars(props, 'dark'), ...anim.style } as CSSProperties} data-ud-anim={anim.trigger}>
        <div className="ud-container">
          <div className="ud-cu-footer__grid">
            <div className="ud-cu-footer__brand">
              <CuraloLogo props={props} light />
              {social.length ? (
                <div className="ud-cu-footer__social">
                  {social.map((item, index) => (
                    <a key={index} href={str(item.url, '#')} aria-label={str(item.icon, 'Social link')}>
                      <Icon name={str(item.icon, 'link')} size={16} />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
            {columns.map((column, index) => (
              <div key={index} className="ud-cu-footer__col">
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
            <div className="ud-cu-footer__col ud-cu-footer__subscribe">
              <EditableText
                edit={edit}
                path={['newsletterHeading']}
                value={str(props.newsletterHeading)}
                as="h3"
                placeholder="Newsletter heading"
              />
              <PublicForm formId={str(props.formId)} layout="inline" submitLabel={str(props.newsletterLabel, 'Sign up')} edit={edit} submitLabelPath={['newsletterLabel']} />
            </div>
          </div>
        </div>

        <div className="ud-cu-footer__banner" style={bannerImage ? ({ '--cu-banner-img': `url("${bannerImage.replace(/"/g, '')}")` } as CSSProperties) : undefined}>
          <EditableText
            edit={edit}
            path={['bannerHeading']}
            value={str(props.bannerHeading, 'Let’s begin')}
            as="p"
            className="ud-cu-footer__bannertext"
            placeholder="Let’s begin"
          />
          <EditableImage edit={edit} path={['bannerImage']} current={bannerImage} label="Replace banner image" />
        </div>

        <div className="ud-container ud-cu-footer__base">
          <EditableText edit={edit} path={['copyright']} value={str(props.copyright)} as="p" className="ud-cu-footer__copy" placeholder="© Company" />
          <div className="ud-cu-footer__legal">
            {str(props.privacyLabel) || edit ? (
              <a href={str(props.privacyUrl, '#')}>
                <EditableText edit={edit} path={['privacyLabel']} value={str(props.privacyLabel)} placeholder="Privacy Policy" />
              </a>
            ) : null}
            {str(props.termsLabel) || edit ? (
              <a href={str(props.termsUrl, '#')}>
                <EditableText edit={edit} path={['termsLabel']} value={str(props.termsLabel)} placeholder="Terms of Service" />
              </a>
            ) : null}
          </div>
        </div>
      </footer>
    )
  },
})
