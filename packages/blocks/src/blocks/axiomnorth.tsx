import type { CSSProperties, ReactNode } from 'react'
import { useState } from 'react'
import { EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Button,
  Media,
  SafeText,
  SectionShell,
  animationOf,
  bool,
  cx,
  items,
  sectionVars,
  str,
  type Props,
} from '../primitives'
import { PublicForm } from '../public-form'
import {
  ctaFields,
  descriptionField,
  eyebrowField,
  field,
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
  toggle,
} from '../schema'
import { NavItem, Submenu, SubmenuCaret, hasSubmenu } from '../submenu'
import { defineBlock } from '../types'

function axLinks(props: Props) {
  return items(props.links, []).map((item) => ({
    label: str(item.label),
    url: str(item.url) || str(item.href) || '#',
    children: item.children,
  }))
}

function AxButton({
  href,
  children,
  ghost = false,
}: {
  href: string
  children: ReactNode
  ghost?: boolean
}) {
  return (
    <Button href={href} variant={ghost ? 'ghost' : 'primary'} className={cx('ud-ax-btn', ghost && 'ud-ax-btn--ghost')}>
      {children}
    </Button>
  )
}

function BrandMark({ props }: { props: Props }) {
  const edit = editOf(props)
  return (
    <a href={str(props.logoUrl, '/')} className="ud-ax-brand">
      <span className="ud-ax-brand__mark" aria-hidden>
        <Icon name={str(props.logoIcon, 'target')} size={16} />
      </span>
      <EditableText edit={edit} path={['logo']} value={str(props.logo, 'Axiom North')} placeholder="Brand" />
    </a>
  )
}

function SectionHead({
  props,
  as = 'h2',
  centered = true,
}: {
  props: Props
  as?: 'h1' | 'h2'
  centered?: boolean
}) {
  const edit = editOf(props)
  return (
    <div className={cx('ud-ax-head', centered && 'ud-ax-head--center')}>
      {str(props.eyebrow) || edit ? (
        <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-ax-eyebrow" placeholder="/// SECTION" />
      ) : null}
      <EditableText edit={edit} path={['heading']} value={str(props.heading)} as={as} className="ud-ax-title" placeholder="Heading" />
      {str(props.description) || edit ? (
        <SafeText value={str(props.description)} className="ud-ax-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
      ) : null}
    </div>
  )
}

const defaultNavLinks = [
  { label: 'Story', url: '/story' },
  { label: 'Investing', url: '/investing' },
  { label: 'Building', url: '/building' },
  { label: 'Advisory', url: '/advisory' },
]

/* -------------------------------------------------------------- navbar.axiom */

export const navbarAxiom = defineBlock({
  type: 'navbar.axiom',
  version: 1,
  category: 'navigation',
  label: 'Axiom North navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Axiom North',
    logoIcon: 'target',
    logoUrl: '/',
    buttonLabel: 'Book a call',
    buttonUrl: '/advisory#contact',
    sticky: true,
    links: defaultNavLinks,
    animation: 'fade',
  },
  schema: schema(
    text('logo', 'Brand'),
    icon('logoIcon', 'Mark icon'),
    link('logoUrl', 'Brand link'),
    navLinksField('links', 'Links'),
    ...primaryCtaFields,
    stickyField,
  ),
  component: function NavbarAxiom(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    const links = axLinks(props)
    const anim = animationOf(props)
    return (
      <header
        className={cx('ud-ax-nav', bool(props.sticky, true) && 'ud-ax-nav--sticky', anim.className)}
        style={{ ...sectionVars(props, 'dark'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container ud-ax-nav__bar">
          <BrandMark props={props} />
          <nav className={cx('ud-ax-nav__links', open && 'is-open')} aria-label="Primary">
            {links.map((item, index) => (
              <NavItem key={`${item.url}-${index}`} item={item}>
                <a href={item.url} className="ud-ax-nav__link">
                  <EditableText edit={edit} path={['links', index, 'label']} value={item.label} placeholder="Link" />
                  <SubmenuCaret show={hasSubmenu(item)} />
                </a>
                <Submenu props={props} item={item} index={index} />
              </NavItem>
            ))}
            {str(props.buttonLabel) || edit ? (
              <a href={str(props.buttonUrl, '/advisory#contact')} className="ud-ax-nav__mobile-cta">
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Start a Chat" />
              </a>
            ) : null}
          </nav>
          <div className="ud-ax-nav__actions">
            {str(props.buttonLabel) || edit ? (
              <AxButton href={str(props.buttonUrl, '/advisory#contact')}>
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Start a Chat" />
              </AxButton>
            ) : null}
          </div>
          <button type="button" className="ud-ax-nav__toggle" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>
            <Icon name={open ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </header>
    )
  },
})

/* ---------------------------------------------------------------- hero.axiom */

export const heroAxiom = defineBlock({
  type: 'hero.axiom',
  version: 1,
  category: 'hero',
  label: 'Axiom North hero',
  icon: 'Sparkles',
  defaultProps: {
    eyebrow: '/// BRIEF — CAPITAL FOR HARD PROBLEMS',
    heading: 'Find your true north. Then build toward it.',
    description:
      'Axiom North partners with technical founders solving physical and digital infrastructure — from factory floors to orbit — with patient capital and operators who stay.',
    buttonLabel: 'Book a call',
    buttonUrl: '/advisory#contact',
    secondaryLabel: 'See companies',
    secondaryUrl: '/investing',
    pills: [
      { label: 'Investing', url: '/investing' },
      { label: 'Building', url: '/building' },
      { label: 'Advisory', url: '/advisory' },
    ],
    animation: 'fade-up',
    animationTrigger: 'load',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    ...ctaFields,
    repeater('pills', 'Mission pills', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Pill' }),
  ),
  component: function HeroAxiom(props) {
    const edit = editOf(props)
    const pills = items(props.pills, [])
    return (
      <SectionShell props={props} className="ud-ax ud-ax-hero" align="center" tone="dark">
        <div className="ud-ax-glow" aria-hidden />
        <div className="ud-ax-cross" aria-hidden />
        <div className="ud-ax-hero__copy">
          {str(props.eyebrow) || edit ? (
            <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-ax-eyebrow" placeholder="Eyebrow" />
          ) : null}
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h1" className="ud-ax-hero__title" placeholder="Headline" />
          <SafeText value={str(props.description)} className="ud-ax-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
          <div className="ud-ax-hero__cta">
            {str(props.buttonLabel) || edit ? (
              <AxButton href={str(props.buttonUrl, '#')}>
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Primary" />
              </AxButton>
            ) : null}
            {str(props.secondaryLabel) || edit ? (
              <AxButton href={str(props.secondaryUrl, '#')} ghost>
                <EditableText edit={edit} path={['secondaryLabel']} value={str(props.secondaryLabel)} placeholder="Secondary" />
              </AxButton>
            ) : null}
          </div>
          {pills.length || edit ? (
            <div className="ud-ax-pills" role="navigation" aria-label="Focus areas">
              {pills.map((item, index) => (
                <a key={index} href={str(item.url, '#')} className="ud-ax-pill">
                  <EditableText edit={edit} path={['pills', index, 'label']} value={str(item.label)} placeholder="Pill" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- hero.axiom_page */

export const heroAxiomPage = defineBlock({
  type: 'hero.axiom_page',
  version: 1,
  category: 'hero',
  label: 'Axiom North page hero',
  icon: 'Image',
  defaultProps: {
    eyebrow: '/// ORIGIN',
    heading: 'Built for founders who navigate by principle.',
    description: 'Axiom North began as a circle of operators writing careful checks. It grew into a firm that invests, co-builds, and advises — without losing the small-room honesty.',
    image: '',
    imageAlt: 'Axiom North',
    showImage: false,
    animation: 'fade-up',
    animationTrigger: 'load',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    toggle('showImage', 'Show side image', 'layout'),
    image('image', 'Side image'),
    text('imageAlt', 'Image alt'),
  ),
  component: function HeroAxiomPage(props) {
    const edit = editOf(props)
    const withImage = bool(props.showImage, false) && (str(props.image) || edit)
    return (
      <SectionShell props={props} className={cx('ud-ax ud-ax-page-hero', withImage && 'ud-ax-page-hero--split')} tone="dark">
        <div className="ud-ax-glow ud-ax-glow--soft" aria-hidden />
        <div className="ud-ax-page-hero__inner">
          <div className="ud-ax-page-hero__copy">
            {str(props.eyebrow) || edit ? (
              <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-ax-eyebrow" placeholder="Eyebrow" />
            ) : null}
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h1" className="ud-ax-hero__title" placeholder="Headline" />
            <SafeText value={str(props.description)} className="ud-ax-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
          </div>
          {withImage ? (
            <div className="ud-ax-page-hero__media">
              <div className="ud-ax-glow ud-ax-glow--media" aria-hidden />
              <Media src={str(props.image)} alt={str(props.imageAlt, 'Axiom North')} ratio="square" edit={edit} path={['image']} />
            </div>
          ) : null}
        </div>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------------- stats.axiom */

export const statsAxiom = defineBlock({
  type: 'stats.axiom',
  version: 1,
  category: 'features',
  label: 'Axiom North stats',
  icon: 'BarChart3',
  defaultProps: {
    items: [
      { value: '47', label: 'Active companies' },
      { value: '$128M', label: 'Capital committed' },
      { value: '19', label: 'Studio ventures' },
      { value: '3', label: 'Core hubs' },
    ],
    animation: 'fade-up',
  },
  schema: schema(repeater('items', 'Stats', [text('value', 'Value'), text('label', 'Label')], { itemLabel: 'Stat' })),
  component: function StatsAxiom(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-ax ud-ax-stats" tone="dark">
        <div className="ud-ax-stats__grid">
          {items(props.items, []).map((item, index) => (
            <article key={index} className="ud-ax-stats__item">
              <EditableText edit={edit} path={['items', index, 'value']} value={str(item.value)} as="p" className="ud-ax-stats__value" placeholder="0" />
              <EditableText edit={edit} path={['items', index, 'label']} value={str(item.label)} as="p" className="ud-ax-stats__label" placeholder="Label" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------------- proof.axiom */

export const proofAxiom = defineBlock({
  type: 'proof.axiom',
  version: 1,
  category: 'features',
  label: 'Axiom North proof ticker',
  icon: 'GalleryHorizontal',
  defaultProps: {
    logos: [
      { label: 'Keel' },
      { label: 'Sable' },
      { label: 'Vale' },
      { label: 'Lattice' },
      { label: 'Cinder' },
      { label: 'Drift' },
      { label: 'Halo' },
      { label: 'Quill' },
      { label: 'Brine' },
      { label: 'Meridian' },
    ],
    animation: 'fade',
  },
  schema: schema(repeater('logos', 'Names', [text('label', 'Name')], { itemLabel: 'Logo' })),
  component: function ProofAxiom(props) {
    const edit = editOf(props)
    const logos = items(props.logos, [])
    return (
      <SectionShell props={props} className="ud-ax ud-ax-proof" tone="dark">
        <div className="ud-ax-proof__row">
          {logos.map((item, index) => (
            <span key={index} className="ud-ax-proof__item">
              <EditableText edit={edit} path={['logos', index, 'label']} value={str(item.label)} placeholder="Name" />
            </span>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- principles.axiom */

export const principlesAxiom = defineBlock({
  type: 'principles.axiom',
  version: 1,
  category: 'features',
  label: 'Axiom North principles',
  icon: 'LayoutGrid',
  defaultProps: {
    eyebrow: '/// COMPASS — 01',
    heading: 'A playbook, not a performance.',
    description: 'Four habits guide every memo we write and every seat we take at the table.',
    items: [
      { icon: 'target', title: 'True north over noise', text: 'We back a clear thesis — not the loudest deck in the room.' },
      { icon: 'users', title: 'Builders beside builders', text: 'Partners who have shipped stay close after the wire clears.' },
      { icon: 'globe', title: 'Patient by design', text: 'We plan in decades so founders can ignore the weekly scoreboard.' },
      { icon: 'zap', title: 'Proof before polish', text: 'We pressure-test the product, the physics, and the path to margin.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater('items', 'Principles', [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Principle' }),
  ),
  component: function PrinciplesAxiom(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-ax ud-ax-principles" tone="dark">
        <SectionHead props={props} />
        <div className="ud-ax-card-grid ud-ax-card-grid--2">
          {items(props.items, []).map((item, index) => (
            <article key={index} className="ud-ax-card">
              <span className="ud-ax-card__icon" aria-hidden>
                <Icon name={str(item.icon, 'sparkles')} size={18} />
              </span>
              <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="h3" className="ud-ax-card__title" placeholder="Title" />
              <SafeText value={str(item.text)} className="ud-ax-muted" edit={edit} path={['items', index, 'text']} placeholder="Copy" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- pillars.axiom */

export const pillarsAxiom = defineBlock({
  type: 'pillars.axiom',
  version: 1,
  category: 'features',
  label: 'Axiom North pillars',
  icon: 'Columns3',
  defaultProps: {
    items: [
      {
        eyebrow: '01 / INVESTING',
        title: 'Checks that move when the thesis is clear.',
        text: 'Pre-seed through Series A for teams building durable infrastructure.',
        linkLabel: 'Explore investing',
        linkUrl: '/investing',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
      },
      {
        eyebrow: '02 / BUILDING',
        title: 'A studio that starts before the company has a name.',
        text: 'We originate, staff, and ship with founders from blank page to first release.',
        linkLabel: 'Explore building',
        linkUrl: '/building',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80',
      },
      {
        eyebrow: '03 / ADVISORY',
        title: 'Counsel that shows up in the work.',
        text: 'Hiring, GTM, and board support when the next decision is load-bearing.',
        linkLabel: 'Explore advisory',
        linkUrl: '/advisory',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    repeater(
      'items',
      'Pillars',
      [text('eyebrow', 'Eyebrow'), text('title', 'Title'), textarea('text', 'Text'), text('linkLabel', 'Link label'), link('linkUrl', 'Link URL'), image('image', 'Image')],
      { itemLabel: 'Pillar' },
    ),
  ),
  component: function PillarsAxiom(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-ax ud-ax-pillars" tone="dark">
        <div className="ud-ax-pillars__grid">
          {items(props.items, []).map((item, index) => (
            <article key={index} className="ud-ax-pillar">
              <Media src={str(item.image)} alt={str(item.title)} ratio="portrait" className="ud-ax-pillar__media" edit={edit} path={['items', index, 'image']} />
              <div className="ud-ax-pillar__overlay">
                <EditableText edit={edit} path={['items', index, 'eyebrow']} value={str(item.eyebrow)} as="p" className="ud-ax-eyebrow" placeholder="01 / LABEL" />
                <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="h3" className="ud-ax-pillar__title" placeholder="Title" />
                <SafeText value={str(item.text)} className="ud-ax-muted" edit={edit} path={['items', index, 'text']} placeholder="Copy" />
                {str(item.linkLabel) || edit ? (
                  <a href={str(item.linkUrl, '#')} className="ud-ax-text-link">
                    <EditableText edit={edit} path={['items', index, 'linkLabel']} value={str(item.linkLabel, 'Learn more')} placeholder="Learn more" />
                    <span aria-hidden> →</span>
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- portfolio.axiom */

export const portfolioAxiom = defineBlock({
  type: 'portfolio.axiom',
  version: 1,
  category: 'gallery',
  label: 'Axiom North portfolio',
  icon: 'Briefcase',
  defaultProps: {
    eyebrow: '/// PORTFOLIO',
    heading: 'Selected companies in the constellation',
    viewAllLabel: 'View all',
    viewAllUrl: '/investing',
    filters: [
      { label: 'All', value: 'all' },
      { label: 'Pre-seed', value: 'pre-seed' },
      { label: 'Seed', value: 'seed' },
      { label: 'Series A', value: 'series-a' },
    ],
    items: [
      {
        title: 'Keel Systems',
        text: 'Edge inference hardware for factories that cannot wait on the cloud.',
        tags: 'HARDWARE / AI',
        stage: 'seed',
        image: 'https://images.unsplash.com/photo-1639322537504-6427a16b0a28?auto=format&fit=crop&w=1200&q=80',
      },
      {
        title: 'Sable Bio',
        text: 'Cell-line tooling that shortens discovery cycles for specialty therapies.',
        tags: 'BIOTECH',
        stage: 'series-a',
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
      },
      {
        title: 'Vale Orbit',
        text: 'Reusable bus platforms for small-sat constellations.',
        tags: 'SPACE',
        stage: 'pre-seed',
        image: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=1200&q=80',
      },
      {
        title: 'Lattice Motion',
        text: 'Perception stacks for warehouse robots that share a floor with people.',
        tags: 'ROBOTICS',
        stage: 'seed',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    text('viewAllLabel', 'View-all label'),
    link('viewAllUrl', 'View-all URL'),
    repeater('filters', 'Filters', [text('label', 'Label'), text('value', 'Value')], { itemLabel: 'Filter' }),
    repeater(
      'items',
      'Companies',
      [text('title', 'Title'), textarea('text', 'Text'), text('tags', 'Tags'), text('stage', 'Stage'), image('image', 'Image')],
      { itemLabel: 'Company' },
    ),
  ),
  component: function PortfolioAxiom(props) {
    const edit = editOf(props)
    const filters = items(props.filters, [])
    const all = items(props.items, [])
    const [active, setActive] = useState(str(filters[0]?.value, 'all') || 'all')
    const visible =
      !filters.length || active === 'all'
        ? all.map((item, index) => ({ item, index }))
        : all.map((item, index) => ({ item, index })).filter(({ item }) => str(item.stage).toLowerCase() === active.toLowerCase())

    return (
      <SectionShell props={props} className="ud-ax ud-ax-portfolio" tone="dark">
        <div className="ud-ax-portfolio__top">
          <SectionHead props={props} />
          <div className="ud-ax-portfolio__tools">
            {filters.length ? (
              <div className="ud-ax-filters" role="tablist" aria-label="Portfolio filters">
                {filters.map((filter, index) => {
                  const value = str(filter.value, 'all')
                  return (
                    <button
                      key={index}
                      type="button"
                      role="tab"
                      aria-selected={active === value}
                      className={cx('ud-ax-filter', active === value && 'is-active')}
                      onClick={() => setActive(value)}
                    >
                      <EditableText edit={edit} path={['filters', index, 'label']} value={str(filter.label)} placeholder="Filter" />
                    </button>
                  )
                })}
              </div>
            ) : str(props.viewAllLabel) || edit ? (
              <a href={str(props.viewAllUrl, '#')} className="ud-ax-text-link">
                <EditableText edit={edit} path={['viewAllLabel']} value={str(props.viewAllLabel)} placeholder="View all" />
              </a>
            ) : null}
          </div>
        </div>
        <div className="ud-ax-portfolio__grid">
          {visible.map(({ item, index }) => (
            <article key={index} className="ud-ax-port-card">
              <div className="ud-ax-port-card__media">
                <Media src={str(item.image)} alt={str(item.title)} ratio="wide" edit={edit} path={['items', index, 'image']} />
                {str(item.tags) || edit ? (
                  <span className="ud-ax-port-card__tag">
                    <EditableText edit={edit} path={['items', index, 'tags']} value={str(item.tags)} placeholder="Tag" />
                  </span>
                ) : null}
              </div>
              <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="h3" className="ud-ax-card__title" placeholder="Company" />
              <SafeText value={str(item.text)} className="ud-ax-muted" edit={edit} path={['items', index, 'text']} placeholder="Description" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- journal.axiom */

export const journalAxiom = defineBlock({
  type: 'journal.axiom',
  version: 1,
  category: 'blog',
  label: 'Axiom North journal',
  icon: 'Newspaper',
  defaultProps: {
    eyebrow: '/// JOURNAL',
    heading: 'What we are studying this season',
    items: [
      {
        category: 'Infrastructure',
        readTime: '7 min',
        title: 'Edge compute is finally earning its keep',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
      },
      {
        category: 'Studio',
        readTime: '5 min',
        title: 'Staffing a zero-to-one team without burning trust',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
      },
      {
        category: 'Climate',
        readTime: '9 min',
        title: 'Industrial heat is the overlooked climate lever',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    repeater(
      'items',
      'Articles',
      [text('category', 'Category'), text('readTime', 'Read time'), text('title', 'Title'), image('image', 'Image')],
      { itemLabel: 'Article' },
    ),
  ),
  component: function JournalAxiom(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-ax ud-ax-journal" tone="dark">
        <SectionHead props={props} />
        <div className="ud-ax-journal__grid">
          {items(props.items, []).map((item, index) => (
            <article key={index} className="ud-ax-journal__card">
              <Media src={str(item.image)} alt={str(item.title)} ratio="wide" edit={edit} path={['items', index, 'image']} />
              <p className="ud-ax-meta">
                <EditableText edit={edit} path={['items', index, 'category']} value={str(item.category)} placeholder="Category" />
                <span aria-hidden> / </span>
                <EditableText edit={edit} path={['items', index, 'readTime']} value={str(item.readTime)} placeholder="5 min" />
              </p>
              <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="h3" className="ud-ax-card__title" placeholder="Title" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------------- cta.axiom */

export const ctaAxiom = defineBlock({
  type: 'cta.axiom',
  version: 1,
  category: 'cta',
  label: 'Axiom North CTA',
  icon: 'MousePointerClick',
  defaultProps: {
    watermark: 'NORTH',
    heading: 'If your roadmap still feels unfinished — write us.',
    description: 'Send the problem, the constraint, and what you need next. We answer within one business day.',
    buttonLabel: 'Book a call',
    buttonUrl: '/advisory#contact',
    secondaryLabel: 'hello@axiomnorth.com',
    secondaryUrl: 'mailto:hello@axiomnorth.com',
    animation: 'fade-up',
  },
  schema: schema(text('watermark', 'Watermark'), headingField, descriptionField, ...ctaFields),
  component: function CtaAxiom(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-ax ud-ax-cta" align="center" tone="dark">
        <div className="ud-ax-glow ud-ax-glow--cta" aria-hidden />
        {str(props.watermark) || edit ? (
          <span className="ud-ax-cta__watermark" aria-hidden>
            <EditableText edit={edit} path={['watermark']} value={str(props.watermark, 'AXIOM')} placeholder="AXIOM" />
          </span>
        ) : null}
        <div className="ud-ax-cta__copy">
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-ax-title" placeholder="Headline" />
          <SafeText value={str(props.description)} className="ud-ax-lead" edit={edit} path={['description']} placeholder="Copy" />
          <div className="ud-ax-hero__cta">
            {str(props.buttonLabel) || edit ? (
              <AxButton href={str(props.buttonUrl, '#')}>
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Primary" />
              </AxButton>
            ) : null}
            {str(props.secondaryLabel) || edit ? (
              <AxButton href={str(props.secondaryUrl, '#')} ghost>
                <EditableText edit={edit} path={['secondaryLabel']} value={str(props.secondaryLabel)} placeholder="Email" />
              </AxButton>
            ) : null}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------------- footer.axiom */

export const footerAxiom = defineBlock({
  type: 'footer.axiom',
  version: 1,
  category: 'footer',
  label: 'Axiom North footer',
  icon: 'PanelBottom',
  defaultProps: {
    logo: 'Axiom North',
    logoIcon: 'target',
    logoUrl: '/',
    tagline: 'Axiom North is a northern-latitude firm for builders shaping deep tech — capital, studio, and counsel under one roof.',
    exploreTitle: 'Explore',
    exploreLinks: defaultNavLinks,
    connectTitle: 'Connect',
    connectLinks: [
      { label: 'hello@axiomnorth.com', url: 'mailto:hello@axiomnorth.com' },
      { label: 'Press kit', url: '#' },
      { label: 'Careers', url: '#' },
      { label: 'Office hours', url: '/advisory#contact' },
    ],
    social: [
      { icon: 'twitter', url: '#' },
      { icon: 'linkedin', url: '#' },
      { icon: 'github', url: '#' },
      { icon: 'globe', url: '#' },
    ],
    copyright: `© ${new Date().getFullYear()} Axiom North Capital. All rights reserved.`,
    legal: [
      { label: 'Privacy', url: '#' },
      { label: 'Terms', url: '#' },
      { label: 'Disclosure', url: '#' },
    ],
  },
  schema: schema(
    text('logo', 'Brand'),
    icon('logoIcon', 'Mark icon'),
    link('logoUrl', 'Brand link'),
    textarea('tagline', 'Tagline'),
    text('exploreTitle', 'Explore title'),
    repeater('exploreLinks', 'Explore links', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Link' }),
    text('connectTitle', 'Connect title'),
    repeater('connectLinks', 'Connect links', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Link' }),
    repeater('social', 'Social', [icon('icon', 'Icon'), link('url', 'URL')], { itemLabel: 'Social' }),
    text('copyright', 'Copyright'),
    repeater('legal', 'Legal', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Link' }),
  ),
  component: function FooterAxiom(props) {
    const edit = editOf(props)
    return (
      <footer className="ud-ax ud-ax-footer" style={sectionVars(props, 'dark') as CSSProperties}>
        <div className="ud-container ud-ax-footer__grid">
          <div className="ud-ax-footer__brand">
            <BrandMark props={props} />
            <SafeText value={str(props.tagline)} className="ud-ax-muted" edit={edit} path={['tagline']} placeholder="Tagline" />
            <div className="ud-ax-footer__social">
              {items(props.social, []).map((item, index) => (
                <a key={index} href={str(item.url, '#')} className="ud-ax-social" aria-label={str(item.icon, 'social')}>
                  <Icon name={str(item.icon, 'globe')} size={16} />
                </a>
              ))}
            </div>
          </div>
          <nav className="ud-ax-footer__col" aria-label="Explore">
            <EditableText edit={edit} path={['exploreTitle']} value={str(props.exploreTitle, 'Explore')} as="p" className="ud-ax-footer__label" placeholder="Explore" />
            {items(props.exploreLinks, []).map((item, index) => (
              <a key={index} href={str(item.url, '#')} className="ud-ax-footer__link">
                <EditableText edit={edit} path={['exploreLinks', index, 'label']} value={str(item.label)} placeholder="Link" />
              </a>
            ))}
          </nav>
          <nav className="ud-ax-footer__col" aria-label="Connect">
            <EditableText edit={edit} path={['connectTitle']} value={str(props.connectTitle, 'Connect')} as="p" className="ud-ax-footer__label" placeholder="Connect" />
            {items(props.connectLinks, []).map((item, index) => (
              <a key={index} href={str(item.url, '#')} className="ud-ax-footer__link">
                <EditableText edit={edit} path={['connectLinks', index, 'label']} value={str(item.label)} placeholder="Link" />
              </a>
            ))}
          </nav>
        </div>
        <div className="ud-container ud-ax-footer__legal">
          <EditableText edit={edit} path={['copyright']} value={str(props.copyright)} as="p" placeholder="Copyright" />
          <div className="ud-ax-footer__legal-links">
            {items(props.legal, []).map((item, index) => (
              <a key={index} href={str(item.url, '#')}>
                <EditableText edit={edit} path={['legal', index, 'label']} value={str(item.label)} placeholder="Legal" />
              </a>
            ))}
          </div>
        </div>
      </footer>
    )
  },
})

/* -------------------------------------------------------------- values.axiom */

export const valuesAxiom = defineBlock({
  type: 'values.axiom',
  version: 1,
  category: 'features',
  label: 'Axiom North values',
  icon: 'ListOrdered',
  defaultProps: {
    eyebrow: 'OUR BAR',
    heading: 'Four lines we refuse to blur.',
    items: [
      { title: 'Clarity first', text: 'We say what we mean in the first meeting — fit, pace, and where we will not help.' },
      { title: 'Evidence over theater', text: 'Demos, datasets, and customer truth beat narrative slides every time.' },
      { title: 'Proximity matters', text: 'We keep seats light so partners can still take a founder call the same week.' },
      { title: 'Aligned endings', text: 'When outcomes are strong, the firm stays fair. When they are not, we still show up.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    repeater('items', 'Values', [text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Value' }),
  ),
  component: function ValuesAxiom(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-ax ud-ax-values" tone="dark">
        <SectionHead props={props} />
        <div className="ud-ax-card-grid ud-ax-card-grid--4">
          {items(props.items, []).map((item, index) => (
            <article key={index} className="ud-ax-card">
              <p className="ud-ax-index">NO. {String(index + 1).padStart(2, '0')}</p>
              <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="h3" className="ud-ax-card__title" placeholder="Title" />
              <SafeText value={str(item.text)} className="ud-ax-muted" edit={edit} path={['items', index, 'text']} placeholder="Copy" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ timeline.axiom */

export const timelineAxiom = defineBlock({
  type: 'timeline.axiom',
  version: 1,
  category: 'content',
  label: 'Axiom North timeline',
  icon: 'History',
  defaultProps: {
    eyebrow: '/// PATH',
    heading: 'Milestones along the meridian.',
    items: [
      { year: '2014', title: 'First syndicate', text: 'Operators in Toronto began co-investing in deep-tech teams with shared diligence notes.' },
      { year: '2018', title: 'Fund I closes', text: 'A dedicated vehicle for pre-seed and seed infrastructure companies.' },
      { year: '2020', title: 'Studio desk opens', text: 'Axiom North Studio started originating companies with embedded builders.' },
      { year: '2024', title: 'Three hubs', text: 'Desks in Toronto, Berlin, and Austin to cover builders where they actually work.' },
      { year: '2026', title: 'Still selective', text: 'Forty-seven companies later — still writing first checks with the same bar.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    repeater('items', 'Milestones', [text('year', 'Year'), text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Milestone' }),
  ),
  component: function TimelineAxiom(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-ax ud-ax-timeline" tone="dark">
        <SectionHead props={props} />
        <ol className="ud-ax-timeline__list">
          {items(props.items, []).map((item, index) => (
            <li key={index} className="ud-ax-timeline__item">
              <span className="ud-ax-timeline__dot" aria-hidden />
              <EditableText edit={edit} path={['items', index, 'year']} value={str(item.year)} as="p" className="ud-ax-timeline__year" placeholder="Year" />
              <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="h3" className="ud-ax-card__title" placeholder="Title" />
              <SafeText value={str(item.text)} className="ud-ax-muted" edit={edit} path={['items', index, 'text']} placeholder="Copy" />
            </li>
          ))}
        </ol>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------------- team.axiom */

export const teamAxiom = defineBlock({
  type: 'team.axiom',
  version: 1,
  category: 'team',
  label: 'Axiom North team',
  icon: 'Users',
  defaultProps: {
    eyebrow: 'PARTNERS',
    heading: 'The people behind the compass.',
    description: 'Operators and investors who have built products, led teams, and stayed through hard quarters.',
    items: [
      {
        name: 'Elena Voss',
        role: 'Managing Partner',
        bio: 'Ex-infra founder. Focuses on edge systems, silicon-adjacent software, and durable GTM.',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Marcus Quay',
        role: 'General Partner',
        bio: 'Former robotics product lead. Backs autonomy, industrial software, and hardware-software pairs.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Ines Park',
        role: 'Partner, Studio',
        bio: 'Builds founding teams and ships first products inside Axiom North Studio.',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Theo Marin',
        role: 'Partner, Advisory',
        bio: 'Hiring and enterprise motion specialist for Series A inflection points.',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
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
      'People',
      [text('name', 'Name'), text('role', 'Role'), textarea('bio', 'Bio'), image('image', 'Photo')],
      { itemLabel: 'Person' },
    ),
  ),
  component: function TeamAxiom(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-ax ud-ax-team" tone="dark">
        <SectionHead props={props} />
        <div className="ud-ax-team__grid">
          {items(props.items, []).map((item, index) => (
            <article key={index} className="ud-ax-team__card">
              <Media src={str(item.image)} alt={str(item.name)} ratio="portrait" edit={edit} path={['items', index, 'image']} />
              <EditableText edit={edit} path={['items', index, 'name']} value={str(item.name)} as="h3" className="ud-ax-card__title" placeholder="Name" />
              <EditableText edit={edit} path={['items', index, 'role']} value={str(item.role)} as="p" className="ud-ax-meta" placeholder="Role" />
              <SafeText value={str(item.bio)} className="ud-ax-muted" edit={edit} path={['items', index, 'bio']} placeholder="Bio" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------------- thesis.axiom */

export const thesisAxiom = defineBlock({
  type: 'thesis.axiom',
  version: 1,
  category: 'features',
  label: 'Axiom North thesis',
  icon: 'Lightbulb',
  defaultProps: {
    eyebrow: '/// THESIS',
    heading: 'Three bets we keep returning to.',
    items: [
      { title: 'Intelligence at the edge', text: 'Compute and software that make real-time decisions where latency and uptime matter.' },
      { title: 'Biology as a production line', text: 'Tools that turn lab insight into repeatable, regulated output.' },
      { title: 'Physical systems that learn', text: 'Robots, energy, and orbital platforms that get better with every deployment.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    repeater('items', 'Theses', [text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Thesis' }),
  ),
  component: function ThesisAxiom(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-ax ud-ax-thesis" tone="dark">
        <SectionHead props={props} />
        <div className="ud-ax-card-grid ud-ax-card-grid--3">
          {items(props.items, []).map((item, index) => (
            <article key={index} className="ud-ax-card">
              <p className="ud-ax-index">{String(index + 1).padStart(2, '0')}</p>
              <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="h3" className="ud-ax-card__title" placeholder="Title" />
              <SafeText value={str(item.text)} className="ud-ax-muted" edit={edit} path={['items', index, 'text']} placeholder="Copy" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- sectors.axiom */

export const sectorsAxiom = defineBlock({
  type: 'sectors.axiom',
  version: 1,
  category: 'features',
  label: 'Axiom North sectors',
  icon: 'Grid3x3',
  defaultProps: {
    eyebrow: '/// FOCUS',
    heading: 'Where the capital lands.',
    description: 'A concentrated map — not a splash across every buzzword.',
    items: [
      { icon: 'cpu', title: 'Applied AI systems', count: '12 companies' },
      { icon: 'rocket', title: 'Autonomy & robotics', count: '9 companies' },
      { icon: 'heart', title: 'Bio tooling', count: '7 companies' },
      { icon: 'leaf', title: 'Industrial climate', count: '8 companies' },
      { icon: 'globe', title: 'Space platforms', count: '5 companies' },
      { icon: 'shield', title: 'Trust & security', count: '6 companies' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater('items', 'Sectors', [icon('icon', 'Icon'), text('title', 'Title'), text('count', 'Count')], { itemLabel: 'Sector' }),
  ),
  component: function SectorsAxiom(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-ax ud-ax-sectors" tone="dark">
        <SectionHead props={props} />
        <div className="ud-ax-card-grid ud-ax-card-grid--3">
          {items(props.items, []).map((item, index) => (
            <article key={index} className="ud-ax-sector">
              <span className="ud-ax-card__icon" aria-hidden>
                <Icon name={str(item.icon, 'sparkles')} size={18} />
              </span>
              <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="h3" className="ud-ax-card__title" placeholder="Sector" />
              <EditableText edit={edit} path={['items', index, 'count']} value={str(item.count)} as="p" className="ud-ax-meta" placeholder="Count" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- process.axiom */

export const processAxiom = defineBlock({
  type: 'process.axiom',
  version: 1,
  category: 'content',
  label: 'Axiom North process',
  icon: 'ListChecks',
  defaultProps: {
    eyebrow: '/// CADENCE',
    heading: 'A path that respects founder time.',
    description: 'Short cycles, clear owners, and a decision you can plan around.',
    items: [
      { title: 'Signal call', text: 'Forty-five minutes on the problem, the wedge, and what “good” looks like in a year.' },
      { title: 'Workbench', text: 'Technical and customer diligence with people who have shipped similar systems.' },
      { title: 'Partner vote', text: 'A written thesis and a yes/no — typically inside ten business days.' },
      { title: 'Kickoff', text: 'Capital wired, intro map shared, and a standing office-hours slot.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater('items', 'Steps', [text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Step' }),
  ),
  component: function ProcessAxiom(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-ax ud-ax-process" tone="dark">
        <SectionHead props={props} />
        <div className="ud-ax-card-grid ud-ax-card-grid--4">
          {items(props.items, []).map((item, index) => (
            <article key={index} className="ud-ax-card">
              <p className="ud-ax-index">{String(index + 1).padStart(2, '0')}</p>
              <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="h3" className="ud-ax-card__title" placeholder="Step" />
              <SafeText value={str(item.text)} className="ud-ax-muted" edit={edit} path={['items', index, 'text']} placeholder="Copy" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------------- studio.axiom */

export const studioAxiom = defineBlock({
  type: 'studio.axiom',
  version: 1,
  category: 'features',
  label: 'Axiom North studio',
  icon: 'Building2',
  defaultProps: {
    eyebrow: '— METHOD',
    heading: 'How a studio company takes shape.',
    description: 'Four stages from a stubborn problem to an independent company.',
    items: [
      { icon: 'sparkles', index: '01', title: 'Thesis lock', text: 'We name the problem, the buyer, and the constraint we refuse to ignore.' },
      { icon: 'users', index: '02', title: 'Founding match', text: 'Pair operators and domain leads who want to own the outcome.' },
      { icon: 'rocket', index: '03', title: 'First release', text: 'Ship a credible product with studio builders embedded full-time.' },
      { icon: 'chart', index: '04', title: 'Independent orbit', text: 'Capitalize, hire leadership when ready, and stay as long-horizon partners.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater(
      'items',
      'Models',
      [icon('icon', 'Icon'), text('index', 'Index'), text('title', 'Title'), textarea('text', 'Text')],
      { itemLabel: 'Card' },
    ),
  ),
  component: function StudioAxiom(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-ax ud-ax-studio" tone="dark">
        <SectionHead props={props} />
        <div className="ud-ax-card-grid ud-ax-card-grid--4">
          {items(props.items, []).map((item, index) => (
            <article key={index} className="ud-ax-card ud-ax-studio__card">
              <div className="ud-ax-studio__top">
                <span className="ud-ax-card__icon" aria-hidden>
                  <Icon name={str(item.icon, 'sparkles')} size={18} />
                </span>
                <EditableText edit={edit} path={['items', index, 'index']} value={str(item.index, String(index + 1).padStart(2, '0'))} as="span" className="ud-ax-index" placeholder="01" />
              </div>
              <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="h3" className="ud-ax-card__title" placeholder="Title" />
              <SafeText value={str(item.text)} className="ud-ax-muted" edit={edit} path={['items', index, 'text']} placeholder="Copy" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ projects.axiom */

export const projectsAxiom = defineBlock({
  type: 'projects.axiom',
  version: 1,
  category: 'content',
  label: 'Axiom North projects',
  icon: 'List',
  defaultProps: {
    eyebrow: '/// ACTIVE BUILD',
    heading: 'Ventures on the workbench now.',
    items: [
      { name: 'Keel Pilot', text: 'Factory-floor inference appliances for mid-size manufacturers.', meta: 'Seed · Live pilots' },
      { name: 'Brine Index', text: 'Underwriting data for industrial water risk.', meta: 'Pre-seed · Hiring' },
      { name: 'Halo Route', text: 'Planning software for mixed human-robot warehouses.', meta: 'Series A · Shipping' },
      { name: 'Quill Desk', text: 'Founding-ops toolkit for deep-tech spinouts.', meta: 'Studio · Forming' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    repeater('items', 'Projects', [text('name', 'Name'), textarea('text', 'Text'), text('meta', 'Meta')], { itemLabel: 'Project' }),
  ),
  component: function ProjectsAxiom(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-ax ud-ax-projects" tone="dark">
        <SectionHead props={props} />
        <div className="ud-ax-projects__list">
          {items(props.items, []).map((item, index) => (
            <article key={index} className="ud-ax-projects__row">
              <EditableText edit={edit} path={['items', index, 'name']} value={str(item.name)} as="h3" className="ud-ax-card__title" placeholder="Name" />
              <SafeText value={str(item.text)} className="ud-ax-muted" edit={edit} path={['items', index, 'text']} placeholder="Description" />
              <EditableText edit={edit} path={['items', index, 'meta']} value={str(item.meta)} as="p" className="ud-ax-meta" placeholder="Meta" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ services.axiom */

export const servicesAxiom = defineBlock({
  type: 'services.axiom',
  version: 1,
  category: 'services',
  label: 'Axiom North services',
  icon: 'Briefcase',
  defaultProps: {
    eyebrow: '/// ENGAGEMENTS',
    heading: 'Ways we work beside the team.',
    description: 'Advisory with owners, deliverables, and an end date — not endless meetings.',
    items: [
      { icon: 'target', title: 'Strategy sprints', text: 'Two-week clarity on product focus, sequencing, and capital timing.' },
      { icon: 'users', title: 'Founding hiring', text: 'Scorecards, loops, and closes for the seats that define culture.' },
      { icon: 'chart', title: 'Revenue design', text: 'Packaging, pilots, and the first enterprise motion that sticks.' },
      { icon: 'shield', title: 'Diligence readiness', text: 'Security, customer, and data packs before the next raise.' },
      { icon: 'globe', title: 'Market bridges', text: 'Warm routes into Toronto, Berlin, Austin, and Seoul.' },
      { icon: 'message', title: 'Board support', text: 'Cadence, memos, and decision hygiene when stakes are high.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater('items', 'Services', [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Service' }),
  ),
  component: function ServicesAxiom(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-ax ud-ax-services" tone="dark">
        <SectionHead props={props} />
        <div className="ud-ax-card-grid ud-ax-card-grid--3">
          {items(props.items, []).map((item, index) => (
            <article key={index} className="ud-ax-card">
              <span className="ud-ax-card__icon" aria-hidden>
                <Icon name={str(item.icon, 'sparkles')} size={18} />
              </span>
              <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="h3" className="ud-ax-card__title" placeholder="Service" />
              <SafeText value={str(item.text)} className="ud-ax-muted" edit={edit} path={['items', index, 'text']} placeholder="Copy" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------------- faq.axiom */

export const faqAxiom = defineBlock({
  type: 'faq.axiom',
  version: 1,
  category: 'faq',
  label: 'Axiom North FAQ',
  icon: 'CircleHelp',
  defaultProps: {
    eyebrow: '/// FAQ',
    heading: 'Straight answers before you book time.',
    openFirst: false,
    items: [
      {
        question: 'Which stages do you fund?',
        answer: 'Mostly pre-seed through Series A. Follow-on is reserved for companies we already know well.',
      },
      {
        question: 'Will you lead a round?',
        answer: 'Yes when the fit is sharp. We also co-invest with partners who share our bar.',
      },
      {
        question: 'Is advisory only for portfolio companies?',
        answer: 'Portfolio first. We take a small number of outside engagements when capacity allows.',
      },
      {
        question: 'Can studio companies raise from others?',
        answer: 'Yes. Spin-outs are built to be independent and fundable outside Axiom North.',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    toggle('openFirst', 'Open the first item', 'design'),
    repeater('items', 'Questions', [text('question', 'Question'), textarea('answer', 'Answer')], { itemLabel: 'Question' }),
  ),
  component: function FaqAxiom(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-ax ud-ax-faq" tone="dark">
        <SectionHead props={props} />
        <div className="ud-ax-faq__list">
          {items(props.items, []).map((item, index) => (
            <details key={index} className="ud-ax-faq__item" open={bool(props.openFirst, false) && index === 0}>
              <summary
                onClick={(event) => {
                  if (edit && (event.target as HTMLElement).closest('.ud-editable')) event.preventDefault()
                }}
              >
                <EditableText edit={edit} path={['items', index, 'question']} value={str(item.question)} as="span" placeholder="Question" />
                <Icon name="plus" size={16} />
              </summary>
              <SafeText value={str(item.answer)} className="ud-ax-muted" edit={edit} path={['items', index, 'answer']} placeholder="Answer" />
            </details>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ contact.axiom */

export const contactAxiom = defineBlock({
  type: 'contact.axiom',
  version: 1,
  category: 'form',
  label: 'Axiom North contact',
  icon: 'Mail',
  defaultProps: {
    eyebrow: '/// CONTACT',
    heading: 'Tell us what you are building.',
    description: 'A short note beats a polished deck. We read every message.',
    formId: '',
    buttonLabel: 'Send message',
    email: 'hello@axiomnorth.com',
    locations: 'Toronto · Berlin · Austin',
    hours: 'Mon–Fri · Calls by appointment',
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    field('formId', 'text', 'Connected form', 'content'),
    text('buttonLabel', 'Submit label'),
    text('email', 'Email'),
    text('locations', 'Locations'),
    text('hours', 'Hours'),
  ),
  component: function ContactAxiom(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-ax ud-ax-contact" tone="dark" anchorId="contact">
        <div className="ud-ax-contact__grid">
          <div>
            <SectionHead props={props} centered={false} />
            <ul className="ud-ax-contact__details">
              <li>
                <Icon name="mail" size={16} />
                <a href={`mailto:${str(props.email, 'hello@axiomnorth.com')}`}>
                  <EditableText edit={edit} path={['email']} value={str(props.email)} placeholder="Email" />
                </a>
              </li>
              <li>
                <Icon name="map-pin" size={16} />
                <EditableText edit={edit} path={['locations']} value={str(props.locations)} placeholder="Locations" />
              </li>
              <li>
                <Icon name="clock" size={16} />
                <EditableText edit={edit} path={['hours']} value={str(props.hours)} placeholder="Hours" />
              </li>
            </ul>
          </div>
          <div className="ud-ax-contact__form">
            <PublicForm
              formId={str(props.formId) || undefined}
              submitLabel={str(props.buttonLabel, 'Send message')}
              edit={edit}
              submitLabelPath={['buttonLabel']}
              fields={[
                { name: 'name', label: 'Name', type: 'text', required: true },
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'message', label: 'Message', type: 'textarea', required: true },
              ]}
            />
          </div>
        </div>
      </SectionShell>
    )
  },
})
