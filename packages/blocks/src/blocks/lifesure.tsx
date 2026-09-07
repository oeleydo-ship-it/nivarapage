/**
 * LifeSure — a life-insurance and financial-services template.
 *
 * Visual language: a two-tier header (a slim contact topbar over a pill-
 * shaped nav bar), a royal-blue hero band, DM Sans serif-weight headlines
 * over Inter body copy, heavily rounded (10px) cards that flood with royal
 * blue on hover, and a near-navy footer with an Instagram photo grid.
 *
 * Every block routes through `schema()`, which appends the shared design /
 * typography / background / spacing / content-width controls, so each one is
 * editable on the canvas and in the side panel and stays reusable on any
 * page. Buttons, lists and grids reuse the shared primitives (`Button`,
 * `CtaGroup`, `CheckList`, `Grid`) rather than bespoke components, so the
 * family recolours from theme tokens instead of hard-coded styling.
 */
import { useState, type CSSProperties } from 'react'
import { EditableImage, EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Button,
  CheckList,
  CtaGroup,
  Grid,
  Heading,
  Media,
  SafeText,
  SectionShell,
  bool,
  cx,
  items,
  lines,
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

function LsHead({ props, align = 'left' }: { props: Record<string, unknown>; align?: 'left' | 'center' }) {
  const edit = editOf(props)
  const eyebrow = str(props.eyebrow)
  const heading = str(props.heading)
  const description = str(props.description)
  if (!edit && !heading && !description && !eyebrow) return null
  return (
    <div className={cx('ud-ls-head', align === 'center' && 'ud-ls-head--center')}>
      {eyebrow || edit ? (
        <EditableText edit={edit} path={['eyebrow']} value={eyebrow} as="p" className="ud-ls-kicker" placeholder="Eyebrow" />
      ) : null}
      {heading || edit ? (
        <EditableText edit={edit} path={['heading']} value={heading} as="h2" className="ud-ls-title" placeholder="Heading" />
      ) : null}
      {description || edit ? (
        <SafeText value={description} className="ud-ls-lead" edit={edit} path={['description']} placeholder="Short description" />
      ) : null}
    </div>
  )
}

const logoFields = [text('logo', 'Wordmark'), image('logoImage', 'Logo image'), link('logoUrl', 'Logo link')]

function LifeSureLogo({ props, light = false }: { props: Record<string, unknown>; light?: boolean }) {
  const edit = editOf(props)
  const src = str(props.logoImage)
  return (
    <a className={cx('ud-ls-logo', light && 'ud-ls-logo--light')} href={str(props.logoUrl, '/')}>
      {src ? (
        <span className="ud-ls-logo__img">
          <img src={src} alt={str(props.logo, 'Logo')} />
          <EditableImage edit={edit} path={['logoImage']} current={src} label="Replace logo" />
        </span>
      ) : (
        <span className="ud-ls-logo__mark">
          <Icon name="shield" size={18} />
          <EditableText edit={edit} path={['logo']} value={str(props.logo, 'LifeSure')} as="span" placeholder="Brand" />
        </span>
      )}
    </a>
  )
}

/* ---------------------------------------------------------- navbar.lifesure */

export const navbarLifesure = defineBlock({
  type: 'navbar.lifesure',
  version: 1,
  category: 'navigation',
  label: 'LifeSure navbar',
  icon: 'Menu',
  defaultProps: {
    topLocation: 'Find A Location',
    topEmail: 'example@gmail.com',
    social: [
      { icon: 'facebook', url: '#' },
      { icon: 'twitter', url: '#' },
      { icon: 'instagram', url: '#' },
      { icon: 'linkedin', url: '#' },
    ],
    logo: 'LifeSure',
    logoImage: '',
    logoUrl: '/',
    links: [
      { label: 'Home', url: '/' },
      { label: 'About', url: '/about' },
      { label: 'Services', url: '/service' },
      {
        label: 'Pages',
        url: '/blog',
        children: [
          { label: 'Our Blog', url: '/blog' },
          { label: 'Our team', url: '/team' },
        ],
      },
      { label: 'Contact', url: '/contact' },
    ],
    phoneLabel: 'Call to Our Experts',
    phone: '+ 0123 456 7890',
    sticky: true,
    animation: 'fade-down',
    animationTrigger: 'load',
  },
  schema: schema(
    text('topLocation', 'Location label'),
    text('topEmail', 'Contact email'),
    repeater('social', 'Social links', [icon('icon', 'Icon'), link('url', 'Link')], { itemLabel: 'Link' }),
    ...logoFields,
    navLinksField('links', 'Links'),
    text('phoneLabel', 'Phone caption'),
    text('phone', 'Phone number'),
    stickyField,
  ),
  component: function NavbarLifesure(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    const social = items(props.social, [])
    const phone = str(props.phone)
    return (
      <header className={cx('ud-ls', 'ud-ls-nav', bool(props.sticky, true) && 'ud-ls-nav--sticky')} style={sectionVars(props, 'default') as CSSProperties}>
        <div className="ud-container ud-ls-topbar">
          <div className="ud-ls-topbar__left">
            <a href="#">
              <Icon name="map-pin" size={13} />
              <EditableText edit={edit} path={['topLocation']} value={str(props.topLocation)} placeholder="Find a location" />
            </a>
            <a href={`mailto:${str(props.topEmail)}`}>
              <Icon name="mail" size={13} />
              <EditableText edit={edit} path={['topEmail']} value={str(props.topEmail)} placeholder="Email" />
            </a>
          </div>
          {social.length ? (
            <div className="ud-ls-topbar__social">
              {social.map((item, index) => (
                <a key={index} href={str(item.url, '#')} aria-label={str(item.icon, 'Social link')}>
                  <Icon name={str(item.icon, 'link')} size={13} />
                </a>
              ))}
            </div>
          ) : null}
        </div>
        <div className="ud-container ud-ls-nav__bar">
          <LifeSureLogo props={props} />
          <nav className={cx('ud-ls-nav__links', open && 'is-open')} aria-label="Primary">
            {items(props.links, []).map((item, index) => (
              <NavItem key={index} item={item}>
                <a className="ud-ls-nav__link" href={str(item.url, '#')}>
                  <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
                  <SubmenuCaret show={hasSubmenu(item)} />
                </a>
                <Submenu props={props} item={item} index={index} />
              </NavItem>
            ))}
          </nav>
          <div className="ud-ls-nav__end">
            {phone || edit ? (
              <a className="ud-ls-nav__phone" href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
                <span className="ud-ls-nav__phone-icon" aria-hidden>
                  <Icon name="phone" size={18} />
                </span>
                <span>
                  <EditableText edit={edit} path={['phoneLabel']} value={str(props.phoneLabel)} as="span" className="ud-ls-nav__phone-label" placeholder="Call to Our Experts" />
                  <EditableText edit={edit} path={['phone']} value={phone} as="span" className="ud-ls-nav__phone-value" placeholder="Phone" />
                </span>
              </a>
            ) : null}
            <button
              type="button"
              className="ud-ls-nav__toggle"
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

/* ------------------------------------------------------------- hero.lifesure */

export const heroLifesure = defineBlock({
  type: 'hero.lifesure',
  version: 1,
  category: 'hero',
  label: 'LifeSure blue hero',
  icon: 'Sparkles',
  defaultProps: {
    eyebrow: 'Welcome To LifeSure',
    heading: 'Life Insurance Makes You Happy',
    description: 'Straightforward cover for the people who depend on you, arranged in one call and reviewed every year so it still fits your life.',
    buttonLabel: 'Watch Video',
    buttonUrl: '#',
    secondaryLabel: 'Learn More',
    secondaryUrl: '#',
    image: '',
  },
  schema: schema(eyebrowField, headingField, descriptionField, ...primaryCtaFields, text('secondaryLabel', 'Secondary label'), link('secondaryUrl', 'Secondary link'), image('image', 'Image')),
  component: function HeroLifesure(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="primary" className="ud-ls ud-ls-hero">
        <div className="ud-split">
          <div className="ud-ls-hero__copy">
            <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-ls-hero__eyebrow" placeholder="Eyebrow" />
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h1" className="ud-ls-title ud-ls-title--xl" placeholder="Headline" />
            {str(props.description) || edit ? (
              <SafeText value={str(props.description)} className="ud-ls-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
            ) : null}
            <div className="ud-ls-hero__buttons">
              {str(props.buttonLabel) || edit ? (
                <Button href={str(props.buttonUrl, '#')} variant="light">
                  <Icon name="play" size={15} />
                  <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Watch Video" />
                </Button>
              ) : null}
              {str(props.secondaryLabel) || edit ? (
                <Button href={str(props.secondaryUrl, '#')} variant="secondary">
                  <EditableText edit={edit} path={['secondaryLabel']} value={str(props.secondaryLabel)} placeholder="Learn More" />
                </Button>
              ) : null}
            </div>
          </div>
          <div className="ud-split__media">
            <Media src={props.image} alt={str(props.heading)} ratio="square" className="ud-ls-hero__img" edit={edit} path={['image']} />
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------- pagehead.lifesure */

export const pageHeadLifesure = defineBlock({
  type: 'pagehead.lifesure',
  version: 1,
  category: 'hero',
  label: 'LifeSure page header',
  icon: 'Layout',
  defaultProps: {
    heading: 'About Us',
    homeLabel: 'Home',
    homeUrl: '/',
    parentLabel: 'Pages',
    backgroundType: 'image',
    backgroundImage: '',
    overlayColor: '#015fc9',
    overlayOpacity: 82,
  },
  schema: schema(headingField, text('homeLabel', 'Home link label'), link('homeUrl', 'Home link'), text('parentLabel', 'Middle crumb label')),
  component: function PageHeadLifesure(props) {
    const edit = editOf(props)
    const heading = str(props.heading, 'Page')
    return (
      <SectionShell props={props} tone="primary" align="center" className="ud-ls ud-ls-pagehead">
        <EditableText edit={edit} path={['heading']} value={heading} as="h1" className="ud-ls-title ud-ls-title--xl" placeholder="Page title" />
        <nav className="ud-ls-crumbs" aria-label="Breadcrumb">
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

/* ------------------------------------------------------------- about.lifesure */

export const aboutLifesure = defineBlock({
  type: 'about.lifesure',
  version: 1,
  category: 'content',
  label: 'LifeSure about + counters',
  icon: 'Info',
  defaultProps: {
    eyebrow: 'About Our Company',
    heading: 'High Range of Exploring Protection',
    description: 'A policy built around what your family actually needs, explained in plain language by someone who picks up the phone.',
    checklist: 'We can save your money.\nA plan for every stage of life\nOur life insurance is flexible',
    buttonLabel: 'More Information',
    buttonUrl: '/about',
    image: '',
    stats: [
      { icon: 'shield', value: '129+', label: 'Insurance Policies' },
      { icon: 'award', value: '99+', label: 'Awards Won' },
      { icon: 'users', value: '556+', label: 'Skilled Agents' },
      { icon: 'heart', value: '967+', label: 'Team Members' },
    ],
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    textarea('checklist', 'Checklist (one per line)'),
    ...primaryCtaFields,
    image('image', 'Image'),
    repeater('stats', 'Counters', [icon('icon', 'Icon'), text('value', 'Value'), text('label', 'Label')], { itemLabel: 'Counter' }),
  ),
  component: function AboutLifesure(props) {
    const edit = editOf(props)
    const stats = items(props.stats, [])
    return (
      <SectionShell props={props} tone="surface" className="ud-ls ud-ls-about">
        <div className="ud-split">
          <div className="ud-ls-about__panel">
            <LsHead props={props} />
            <CheckList values={lines(props.checklist)} edit={edit} path={['checklist']} />
            <CtaGroup props={props} primaryVariant="primary" className="ud-ls-about__cta" />
          </div>
          <div className="ud-ls-about__panel">
            <Media src={props.image} alt={str(props.heading)} ratio="wide" edit={edit} path={['image']} style={{ marginBottom: 16 }} />
            <Grid cols={2} gap={16}>
              {stats.map((stat, index) => (
                <div key={index} className="ud-ls-stat">
                  <Icon name={str(stat.icon, 'star')} size={28} />
                  <EditableText edit={edit} path={['stats', index, 'value']} value={str(stat.value)} as="div" className="ud-ls-stat__value" placeholder="0+" />
                  <EditableText edit={edit} path={['stats', index, 'label']} value={str(stat.label)} as="p" className="ud-ls-stat__label" placeholder="Label" />
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

/* ----------------------------------------------------------- services.lifesure */

const insuranceCards = [
  { icon: 'users', title: 'Life Insurance', text: 'Cover that pays out for the people who rely on your income, arranged around your budget.', image: '' },
  { icon: 'target', title: 'Health Insurance', text: 'Treatment and specialist care without the wait, for you and the people on your plan.', image: '' },
  { icon: 'truck', title: 'Car Insurance', text: 'Comprehensive cover with a claims line that actually answers on the first ring.', image: '' },
  { icon: 'home', title: 'Home Insurance', text: 'Buildings and contents cover that adjusts automatically as your home changes.', image: '' },
]

export const servicesLifesure = defineBlock({
  type: 'services.lifesure',
  version: 1,
  category: 'services',
  label: 'LifeSure coverage grid',
  icon: 'Layers',
  defaultProps: {
    eyebrow: 'Our Services',
    heading: 'We Provide Best Services',
    description: 'Four kinds of cover, one advisor who actually knows your file.',
    items: insuranceCards.map((card) => ({ ...card, buttonLabel: 'Read More', buttonUrl: '/service' })),
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater(
      'items',
      'Services',
      [image('image', 'Image'), icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Description'), text('buttonLabel', 'Button label'), link('buttonUrl', 'Button link')],
      { itemLabel: 'Service' },
    ),
  ),
  component: function ServicesLifesure(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-ls ud-ls-services">
        <LsHead props={props} align="center" />
        <Grid cols={Math.min(rows.length || 1, 4)} gap={24} style={{ marginTop: 40, textAlign: 'left' }}>
          {rows.map((item, index) => (
            <div key={index} className="ud-ls-service">
              <div className="ud-ls-service__media">
                <Media src={item.image} alt={str(item.title)} ratio="landscape" edit={edit} path={['items', index, 'image']} />
                <span className="ud-ls-service__icon" aria-hidden>
                  <Icon name={str(item.icon, 'shield')} size={22} />
                </span>
              </div>
              <div className="ud-ls-service__body">
                <Heading level={4} edit={edit} path={['items', index, 'title']}>
                  {str(item.title, 'Service')}
                </Heading>
                <SafeText value={item.text} className="ud-text" edit={edit} path={['items', index, 'text']} placeholder="Description" />
                {str(item.buttonLabel) || edit ? (
                  <Button href={str(item.buttonUrl, '#')} variant="primary" className="ud-ls-service__btn">
                    <EditableText edit={edit} path={['items', index, 'buttonLabel']} value={str(item.buttonLabel, 'Read More')} placeholder="Read More" />
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------------- blog.lifesure */

const posts = [
  {
    title: 'Which allows you to pay down insurance bills',
    excerpt: 'A quarterly plan that spreads the premium without the usual finance charge.',
    category: 'Business',
    author: 'Martin C.',
    date: '30 Dec 2025',
    comments: '6 Comments',
    image: '',
    url: '#',
  },
  {
    title: 'Leverage agile frameworks to provide a better claim',
    excerpt: 'What changed when we moved claims handling to a named case owner.',
    category: 'Business',
    author: 'Martin C.',
    date: '24 Dec 2025',
    comments: '4 Comments',
    image: '',
    url: '#',
  },
  {
    title: 'Five things worth checking before you renew',
    excerpt: 'A short list that has saved clients real money at renewal time.',
    category: 'Advice',
    author: 'Martin C.',
    date: '18 Dec 2025',
    comments: '9 Comments',
    image: '',
    url: '#',
  },
]

export const blogLifesure = defineBlock({
  type: 'blog.lifesure',
  version: 1,
  category: 'blog',
  label: 'LifeSure news cards',
  icon: 'FileText',
  defaultProps: {
    eyebrow: 'From Blog',
    heading: 'News And Updates',
    description: 'Short, practical writing from the people who handle your policy.',
    items: posts,
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater(
      'items',
      'Posts',
      [
        image('image', 'Image'),
        text('category', 'Category tag'),
        text('author', 'Author'),
        text('date', 'Date'),
        text('comments', 'Comments label'),
        text('title', 'Title'),
        textarea('excerpt', 'Excerpt'),
        link('url', 'Link'),
      ],
      { itemLabel: 'Post' },
    ),
  ),
  component: function BlogLifesure(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="surface" align="center" className="ud-ls ud-ls-blog">
        <LsHead props={props} align="center" />
        <Grid cols={Math.min(rows.length || 1, 3)} gap={24} style={{ marginTop: 40, textAlign: 'left' }}>
          {rows.map((item, index) => (
            <article key={index} className="ud-ls-post">
              <div className="ud-ls-post__media">
                <Media src={item.image} alt={str(item.title)} ratio="landscape" edit={edit} path={['items', index, 'image']} />
                {str(item.category) || edit ? (
                  <span className="ud-ls-post__tag">
                    <EditableText edit={edit} path={['items', index, 'category']} value={str(item.category)} placeholder="Category" />
                  </span>
                ) : null}
              </div>
              <div className="ud-ls-post__body">
                <div className="ud-ls-post__meta">
                  <span>
                    <Icon name="users" size={12} />
                    <EditableText edit={edit} path={['items', index, 'author']} value={str(item.author)} placeholder="Author" />
                  </span>
                  <span>
                    <Icon name="calendar" size={12} />
                    <EditableText edit={edit} path={['items', index, 'date']} value={str(item.date)} placeholder="Date" />
                  </span>
                  <span>
                    <Icon name="message" size={12} />
                    <EditableText edit={edit} path={['items', index, 'comments']} value={str(item.comments)} placeholder="Comments" />
                  </span>
                </div>
                <Heading level={4} edit={edit} path={['items', index, 'title']}>
                  {str(item.title, 'Title')}
                </Heading>
                <SafeText value={item.excerpt} className="ud-text" edit={edit} path={['items', index, 'excerpt']} placeholder="Excerpt" />
                <a className="ud-ls-post__link" href={str(item.url, '#')}>
                  Read More <Icon name="arrow" size={13} />
                </a>
              </div>
            </article>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------------- team.lifesure */

const agents = [
  { name: 'David James', role: 'Senior Advisor' },
  { name: 'Sophia Turner', role: 'Claims Manager' },
  { name: 'Emily Clarke', role: 'Underwriter' },
  { name: 'Michael Doyle', role: 'Account Manager' },
]

export const teamLifesure = defineBlock({
  type: 'team.lifesure',
  version: 1,
  category: 'team',
  label: 'LifeSure agent grid',
  icon: 'Users',
  defaultProps: {
    eyebrow: 'Our Team',
    heading: 'Meet Our Expert Team Members',
    description: 'Every account has a named advisor, not a call queue.',
    items: agents.map((person) => ({
      ...person,
      image: '',
      social: [
        { icon: 'facebook', url: '#' },
        { icon: 'twitter', url: '#' },
        { icon: 'linkedin', url: '#' },
        { icon: 'instagram', url: '#' },
      ],
    })),
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater(
      'items',
      'Team',
      [image('image', 'Photo'), text('name', 'Name'), text('role', 'Role'), repeater('social', 'Social links', [icon('icon', 'Icon'), link('url', 'Link')], { itemLabel: 'Link' })],
      { itemLabel: 'Person' },
    ),
  ),
  component: function TeamLifesure(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-ls ud-ls-team">
        <LsHead props={props} align="center" />
        <Grid cols={Math.min(rows.length || 1, 4)} gap={24} style={{ marginTop: 40 }}>
          {rows.map((item, index) => {
            const social = items(item.social, [])
            return (
              <article key={index} className="ud-ls-person">
                <div className="ud-ls-person__media">
                  <Media src={item.image} alt={str(item.name)} ratio="landscape" edit={edit} path={['items', index, 'image']} />
                  {social.length ? (
                    <div className="ud-ls-person__social">
                      {social.map((entry, linkIndex) => (
                        <a key={linkIndex} href={str(entry.url, '#')} aria-label={str(entry.icon, 'Social link')}>
                          <Icon name={str(entry.icon, 'link')} size={13} />
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="ud-ls-person__title">
                  <Heading level={4} edit={edit} path={['items', index, 'name']}>
                    {str(item.name, 'Name')}
                  </Heading>
                  <EditableText edit={edit} path={['items', index, 'role']} value={str(item.role)} as="p" placeholder="Role" />
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

/* ------------------------------------------------------------ contact.lifesure */

export const contactLifesure = defineBlock({
  type: 'contact.lifesure',
  version: 1,
  category: 'form',
  label: 'LifeSure contact form',
  icon: 'Mail',
  defaultProps: {
    eyebrow: 'Contact Us',
    heading: 'If you have any questions please apply now',
    image: '',
    formId: '',
    buttonLabel: 'Send Message',
    details: [
      { icon: 'map-pin', label: 'Address', value: '123 Street New York, USA' },
      { icon: 'mail', label: 'Mail Us', value: 'info@example.com' },
      { icon: 'phone', label: 'Telephone', value: '(+012) 3456 7890' },
      { icon: 'globe', label: 'Website', value: 'www.example.com' },
    ],
  },
  schema: schema(
    eyebrowField,
    headingField,
    image('image', 'Image'),
    text('formId', 'Form ID'),
    text('buttonLabel', 'Submit label'),
    repeater('details', 'Contact details', [icon('icon', 'Icon'), text('label', 'Label'), text('value', 'Value')], { itemLabel: 'Detail' }),
  ),
  component: function ContactLifesure(props) {
    const edit = editOf(props)
    const details = items(props.details, [])
    return (
      <SectionShell props={props} tone="surface" className="ud-ls ud-ls-contact">
        <LsHead props={props} align="center" />
        <div className="ud-split" style={{ marginTop: 40 }}>
          <Media src={props.image} alt={str(props.heading)} ratio="landscape" edit={edit} path={['image']} />
          <div className="ud-ls-contact__panel">
            <PublicForm formId={str(props.formId)} submitLabel={str(props.buttonLabel, 'Send Message')} edit={edit} submitLabelPath={['buttonLabel']} />
          </div>
        </div>
        {details.length ? (
          <Grid cols={Math.min(details.length, 4)} gap={20} style={{ marginTop: 44 }}>
            {details.map((item, index) => (
              <div key={index} className="ud-ls-detail">
                <Icon name={str(item.icon, 'map-pin')} size={26} />
                <div>
                  <EditableText edit={edit} path={['details', index, 'label']} value={str(item.label)} as="h4" className="ud-h4" placeholder="Label" />
                  <EditableText edit={edit} path={['details', index, 'value']} value={str(item.value)} as="p" className="ud-text" placeholder="Value" />
                </div>
              </div>
            ))}
          </Grid>
        ) : null}
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- footer.lifesure */

export const footerLifesure = defineBlock({
  type: 'footer.lifesure',
  version: 1,
  category: 'footer',
  label: 'LifeSure footer',
  icon: 'Layout',
  defaultProps: {
    logo: 'LifeSure',
    logoImage: '',
    logoUrl: '/',
    description: 'Straightforward cover, explained by someone who picks up the phone, and a claims line that actually answers.',
    social: [
      { icon: 'facebook', url: '#' },
      { icon: 'twitter', url: '#' },
      { icon: 'instagram', url: '#' },
      { icon: 'linkedin', url: '#' },
    ],
    linksHeading: 'Useful Links',
    links: [
      { label: 'About Us', url: '/about' },
      { label: 'Services', url: '/service' },
      { label: 'Our Blog', url: '/blog' },
      { label: 'Our Team', url: '/team' },
      { label: 'Contact', url: '/contact' },
    ],
    galleryHeading: 'Instagram',
    gallery: [{ image: '' }, { image: '' }, { image: '' }, { image: '' }, { image: '' }, { image: '' }],
    details: [
      { icon: 'map-pin', label: 'Address', value: '123 Street New York, USA' },
      { icon: 'mail', label: 'Mail Us', value: 'info@example.com' },
      { icon: 'phone', label: 'Telephone', value: '(+012) 3456 7890' },
    ],
    newsletterHeading: 'Newsletter',
    newsletterText: 'A short monthly note on cover, claims and renewal timing. No spam.',
    newsletterLabel: 'Sign Up',
    formId: '',
    phoneLabel: 'Call to Our Experts',
    phone: '+ 0123 456 7890',
    copyright: 'LifeSure, All right reserved.',
    creditLabel: 'Designed By HTML Codex',
    creditUrl: 'https://htmlcodex.com',
  },
  schema: schema(
    ...logoFields,
    textarea('description', 'Description'),
    repeater('social', 'Social links', [icon('icon', 'Icon'), link('url', 'Link')], { itemLabel: 'Link' }),
    text('linksHeading', 'Links heading'),
    repeater('links', 'Links', [text('label', 'Label'), link('url', 'Link')], { itemLabel: 'Link' }),
    text('galleryHeading', 'Gallery heading'),
    repeater('gallery', 'Gallery images', [image('image', 'Image')], { itemLabel: 'Image' }),
    repeater('details', 'Contact details', [icon('icon', 'Icon'), text('label', 'Label'), text('value', 'Value')], { itemLabel: 'Detail' }),
    text('newsletterHeading', 'Newsletter heading'),
    text('newsletterText', 'Newsletter note'),
    text('newsletterLabel', 'Newsletter button'),
    text('formId', 'Newsletter form ID'),
    text('phoneLabel', 'Phone caption'),
    text('phone', 'Phone number'),
    text('copyright', 'Copyright (after the ©)'),
    text('creditLabel', 'Credit label', { help: 'The template author’s attribution. Keep this if you are using the free LifeSure design.' }),
    link('creditUrl', 'Credit link'),
  ),
  component: function FooterLifesure(props) {
    const edit = editOf(props)
    const social = items(props.social, [])
    const links = items(props.links, [])
    const gallery = items(props.gallery, [])
    const details = items(props.details, [])
    const phone = str(props.phone)
    return (
      <footer className="ud-ls ud-ls-footer">
        <div className="ud-container">
          <div className="ud-ls-footer__grid">
            <div className="ud-ls-footer__brand">
              <LifeSureLogo props={props} light />
              <SafeText value={str(props.description)} className="ud-ls-footer__desc" edit={edit} path={['description']} placeholder="Description" />
              {social.length ? (
                <div className="ud-ls-footer__social">
                  {social.map((item, index) => (
                    <a key={index} href={str(item.url, '#')} aria-label={str(item.icon, 'Social link')}>
                      <Icon name={str(item.icon, 'link')} size={15} />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="ud-ls-footer__col">
              <EditableText edit={edit} path={['linksHeading']} value={str(props.linksHeading)} as="h4" placeholder="Useful Links" />
              <div>
                {links.map((item, index) => (
                  <a key={index} className="ud-ls-footer__link" href={str(item.url, '#')}>
                    <Icon name="arrow" size={12} />
                    <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
                  </a>
                ))}
              </div>
            </div>
            <div className="ud-ls-footer__col">
              <EditableText edit={edit} path={['galleryHeading']} value={str(props.galleryHeading)} as="h4" placeholder="Instagram" />
              <div className="ud-ls-footer__gallery">
                {gallery.map((item, index) => (
                  <Media key={index} src={item.image} alt="" ratio="square" className="ud-ls-footer__photo" edit={edit} path={['gallery', index, 'image']} />
                ))}
              </div>
            </div>
          </div>

          {details.length ? (
            <div className="ud-ls-footer__details">
              {details.map((item, index) => (
                <div key={index} className="ud-ls-footer__detail">
                  <span className="ud-ls-footer__detail-icon" aria-hidden>
                    <Icon name={str(item.icon, 'map-pin')} size={22} />
                  </span>
                  <div>
                    <EditableText edit={edit} path={['details', index, 'label']} value={str(item.label)} as="h4" placeholder="Label" />
                    <EditableText edit={edit} path={['details', index, 'value']} value={str(item.value)} placeholder="Value" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="ud-ls-footer__newsband">
          <div className="ud-container ud-ls-footer__newsgrid">
            <div>
              <EditableText edit={edit} path={['newsletterHeading']} value={str(props.newsletterHeading)} as="h4" placeholder="Newsletter" />
              {str(props.newsletterText) || edit ? (
                <EditableText edit={edit} path={['newsletterText']} value={str(props.newsletterText)} as="p" placeholder="Note" />
              ) : null}
              <PublicForm formId={str(props.formId)} layout="inline" submitLabel={str(props.newsletterLabel, 'Sign Up')} edit={edit} submitLabelPath={['newsletterLabel']} />
            </div>
            {phone || edit ? (
              <a className="ud-ls-footer__phone" href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
                <span className="ud-ls-footer__phone-icon" aria-hidden>
                  <Icon name="phone" size={20} />
                </span>
                <span>
                  <EditableText edit={edit} path={['phoneLabel']} value={str(props.phoneLabel)} as="span" placeholder="Call to Our Experts" />
                  <EditableText edit={edit} path={['phone']} value={phone} as="span" placeholder="Phone" />
                </span>
              </a>
            ) : null}
          </div>
        </div>

        <div className="ud-container ud-ls-footer__base">
          <p>
            &copy;{' '}
            <EditableText edit={edit} path={['copyright']} value={str(props.copyright, 'LifeSure, All right reserved.')} placeholder="Site name, All right reserved." />
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
