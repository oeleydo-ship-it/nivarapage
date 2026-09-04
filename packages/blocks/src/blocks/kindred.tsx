/**
 * Kindred — a family-of-companies / group brand template.
 *
 * Visual language: a saturated brand red, pale-pink bands with slanted edges,
 * bold geometric headlines closed by a red full stop, serif editorial titles,
 * white logo cards, and thin red connector rules between sections.
 *
 * Everything routes through `schema()`, which appends the shared design /
 * typography / background / spacing controls, so every block is editable on the
 * canvas and from the side panel, and reusable on any page the user adds.
 */
import type { CSSProperties, ReactNode } from 'react'
import { useState } from 'react'
import { EditableImage, EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Media,
  SafeText,
  SectionShell,
  animationOf,
  bool,
  cx,
  items,
  lines,
  num,
  sectionVars,
  str,
  type Props,
} from '../primitives'
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
  repeater,
  schema,
  select,
  stickyField,
  text,
  textarea,
  toggle,
} from '../schema'
import { NavItem, Submenu, SubmenuCaret, hasSubmenu } from '../submenu'
import { defineBlock } from '../types'

/* ------------------------------------------------------------------ helpers */

/** Heading closed by the signature red full stop. */
function DotHeading({
  props,
  path = ['heading'],
  as = 'h2',
  className,
}: {
  props: Props
  path?: Array<string | number>
  as?: 'h1' | 'h2' | 'h3'
  className?: string
}) {
  const edit = editOf(props)
  const key = String(path[path.length - 1])
  const value = str(props[key])
  if (!value && !edit) return null
  const Tag = as
  return (
    <Tag className={cx('ud-kd-title', as === 'h1' && 'ud-kd-title--xl', className)}>
      <EditableText edit={edit} path={path} value={value} as="span" placeholder="Heading" />
      {bool(props.showDot, true) ? <span className="ud-kd-dot">.</span> : null}
    </Tag>
  )
}

const dotField = toggle('showDot', 'Red full stop', 'design')

/** Thin red rule the reference drops between sections. */
function Connector() {
  return <span className="ud-kd-connector" aria-hidden />
}

/** Small uppercase link with a chevron. */
function MoreLink({
  props,
  labelKey = 'buttonLabel',
  urlKey = 'buttonUrl',
  className,
}: {
  props: Props
  labelKey?: string
  urlKey?: string
  className?: string
}) {
  const edit = editOf(props)
  const label = str(props[labelKey])
  if (!label && !edit) return null
  return (
    <a className={cx('ud-kd-more', className)} href={str(props[urlKey], '#')}>
      <EditableText edit={edit} path={[labelKey]} value={label} as="span" placeholder="Find out more" />
      <Icon name="arrow" size={12} />
    </a>
  )
}

/** Solid red pill button. */
function KdButton({
  href,
  children,
  variant = 'red',
}: {
  href: string
  children: ReactNode
  variant?: 'red' | 'outline' | 'light'
}) {
  return (
    <a className={cx('ud-kd-btn', `ud-kd-btn--${variant}`)} href={href || '#'}>
      {children}
    </a>
  )
}

/**
 * Brand wordmark. Renders an uploaded logo when `logoImage` is set, otherwise
 * the text wordmark. The image is replaceable straight from the canvas.
 */
function Wordmark({ props, small = false }: { props: Props; small?: boolean }) {
  const edit = editOf(props)
  const src = str(props.logoImage)
  const height = Math.min(Math.max(num(props.logoHeight, small ? 24 : 32), 12), 120)
  const widthRaw = Number(props.logoWidth)
  const width = Number.isFinite(widthRaw) && widthRaw > 0 ? Math.min(Math.max(widthRaw, 16), 400) : 'auto'
  return (
    <a className={cx('ud-kd-wordmark', small && 'ud-kd-wordmark--sm')} href={str(props.logoUrl, '/')}>
      {src ? (
        <span className="ud-kd-wordmark__img">
          <img src={src} alt={str(props.logo, 'Logo')} style={{ height, width, display: 'block' }} />
          <EditableImage edit={edit} path={['logoImage']} current={src} label="Replace logo" />
        </span>
      ) : (
        <EditableText edit={edit} path={['logo']} value={str(props.logo, 'Kindred')} placeholder="Brand" />
      )}
    </a>
  )
}

const defaultNavLinks = [
  { label: 'Companies', url: '/companies' },
  { label: 'About us', url: '/about' },
  { label: 'Our foundation', url: '/purpose' },
  { label: 'Careers', url: '/careers' },
  { label: 'Group', url: '/group' },
]

/* ----------------------------------------------------------- navbar.kindred */

export const navbarKindred = defineBlock({
  type: 'navbar.kindred',
  version: 1,
  category: 'navigation',
  label: 'Kindred masthead',
  icon: 'Menu',
  defaultProps: {
    menuLabel: 'Menu',
    logo: 'Kindred',
    logoImage: '',
    logoUrl: '/',
    links: defaultNavLinks,
    showLinkRow: true,
    sticky: true,
    menuColumns: [
      {
        title: 'Companies',
        links: [
          { label: 'All companies', url: '/companies' },
          { label: 'Travel and leisure', url: '/companies' },
          { label: 'Health and wellness', url: '/companies' },
          { label: 'Money', url: '/companies' },
        ],
      },
      {
        title: 'About us',
        links: [
          { label: 'Our story', url: '/about' },
          { label: 'Purpose', url: '/purpose' },
          { label: 'Latest', url: '/latest' },
          { label: 'The group', url: '/group' },
        ],
      },
      {
        title: 'Join us',
        links: [
          { label: 'Working here', url: '/careers' },
          { label: 'Open roles', url: '/careers' },
          { label: 'Apprenticeships', url: '/careers' },
        ],
      },
    ],
    menuFootLabel: 'Get in touch',
    menuFootUrl: '/about',
    animation: 'fade-down',
    animationTrigger: 'load',
  },
  schema: schema(
    text('menuLabel', 'Menu label'),
    text('logo', 'Wordmark'),
    image('logoImage', 'Logo image'),
    field('logoHeight', 'slider', 'Logo height', 'design', { min: 12, max: 120, unit: 'px' }),
    field('logoWidth', 'slider', 'Logo width', 'design', { min: 16, max: 400, unit: 'px', help: 'Leave empty to keep the logo\'s natural aspect ratio.' }),
    link('logoUrl', 'Wordmark link'),
    navLinksField('links', 'Links'),
    toggle('showLinkRow', 'Show link row', 'layout'),
    stickyField,
    repeater(
      'menuColumns',
      'Menu drawer columns',
      [text('title', 'Column title'), repeater('links', 'Links', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Link' })],
      { itemLabel: 'Column', help: 'Shown when someone opens the MENU button.' },
    ),
    text('menuFootLabel', 'Drawer footer link'),
    link('menuFootUrl', 'Drawer footer URL'),
  ),
  component: function NavbarKindred(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    const anim = animationOf(props)
    const links = items(props.links, [])
    const menuColumns = items(props.menuColumns, [])
    return (
      <header
        className={cx('ud-kd', 'ud-kd-nav', bool(props.sticky, true) && 'ud-kd-nav--sticky', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-kd-nav__top">
          <button
            type="button"
            className={cx('ud-kd-nav__menu', open && 'is-open')}
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="kd-menu-drawer"
          >
            <Icon name={open ? 'close' : 'menu'} size={18} />
            <EditableText edit={edit} path={['menuLabel']} value={str(props.menuLabel, 'Menu')} as="span" placeholder="Menu" />
          </button>
          <Wordmark props={props} />
          <span className="ud-kd-nav__spacer" aria-hidden />
        </div>
        {bool(props.showLinkRow, true) ? (
          <nav className={cx('ud-kd-nav__row', open && 'is-open')} aria-label="Primary">
            {links.map((item, index) => (
              <NavItem key={index} item={item}>
                <a className="ud-kd-nav__link" href={str(item.url, '#')}>
                  <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
                  <SubmenuCaret show={hasSubmenu(item)} />
                </a>
                <Submenu props={props} item={item} index={index} />
              </NavItem>
            ))}
          </nav>
        ) : null}
        {open ? (
          <div className="ud-kd-menu" id="kd-menu-drawer">
            <div className="ud-container ud-kd-menu__grid">
              {menuColumns.map((column, index) => (
                <div key={index} className="ud-kd-menu__col">
                  <EditableText
                    edit={edit}
                    path={['menuColumns', index, 'title']}
                    value={str(column.title)}
                    as="p"
                    className="ud-kd-menu__title"
                    placeholder="Column"
                  />
                  {items(column.links, []).map((item, linkIndex) => (
                    <a key={linkIndex} className="ud-kd-menu__link" href={str(item.url, '#')}>
                      <EditableText
                        edit={edit}
                        path={['menuColumns', index, 'links', linkIndex, 'label']}
                        value={str(item.label)}
                        as="span"
                        placeholder="Link"
                      />
                    </a>
                  ))}
                </div>
              ))}
              {str(props.menuFootLabel) || edit ? (
                <a className="ud-kd-menu__foot" href={str(props.menuFootUrl, '#')}>
                  <EditableText edit={edit} path={['menuFootLabel']} value={str(props.menuFootLabel)} as="span" placeholder="Get in touch" />
                  <Icon name="arrow" size={13} />
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </header>
    )
  },
})

/* ----------------------------------------------------------- subnav.kindred */

export const subnavKindred = defineBlock({
  type: 'subnav.kindred',
  version: 1,
  category: 'navigation',
  label: 'Kindred section nav',
  icon: 'Menu',
  defaultProps: {
    sectionLabel: 'About us',
    logo: 'Kindred',
    logoImage: '',
    logoUrl: '/',
    links: [
      { label: 'Our story', url: '/about' },
      { label: 'Timeline', url: '/about' },
      { label: 'Purpose', url: '/purpose' },
      { label: 'Working here', url: '/careers' },
      { label: 'Latest', url: '/latest' },
      { label: 'The group', url: '/group' },
    ],
    activeIndex: 0,
    sticky: false,
    animation: 'fade-down',
    animationTrigger: 'load',
  },
  schema: schema(
    text('sectionLabel', 'Section label'),
    text('logo', 'Wordmark'),
    image('logoImage', 'Logo image'),
    field('logoHeight', 'slider', 'Logo height', 'design', { min: 12, max: 120, unit: 'px' }),
    field('logoWidth', 'slider', 'Logo width', 'design', { min: 16, max: 400, unit: 'px', help: 'Leave empty to keep the logo\'s natural aspect ratio.' }),
    link('logoUrl', 'Wordmark link'),
    navLinksField('links', 'Links'),
    field('activeIndex', 'number', 'Active link index', 'layout', { min: 0, max: 12 }),
    stickyField,
  ),
  component: function SubnavKindred(props) {
    const edit = editOf(props)
    const anim = animationOf(props)
    const links = items(props.links, [])
    const active = num(props.activeIndex, 0)
    return (
      <header
        className={cx('ud-kd', 'ud-kd-subnav', bool(props.sticky) && 'ud-is-sticky', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-kd-subnav__top">
          <span className="ud-kd-subnav__tag">
            <Icon name="menu" size={15} />
            <EditableText edit={edit} path={['sectionLabel']} value={str(props.sectionLabel)} as="span" placeholder="Section" />
          </span>
          <Wordmark props={props} small />
          <span className="ud-kd-nav__spacer" aria-hidden />
        </div>
        <nav className="ud-kd-subnav__row" aria-label="Section">
          {links.map((item, index) => (
            <NavItem key={index} item={item}>
              <a className={cx('ud-kd-subnav__link', index === active && 'is-on')} href={str(item.url, '#')}>
                <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
                <SubmenuCaret show={hasSubmenu(item)} />
              </a>
              <Submenu props={props} item={item} index={index} />
            </NavItem>
          ))}
        </nav>
      </header>
    )
  },
})

/* ------------------------------------------------------------- hero.kindred */

export const heroKindred = defineBlock({
  type: 'hero.kindred',
  version: 1,
  category: 'hero',
  label: 'Kindred red hero',
  icon: 'Sparkles',
  defaultProps: {
    heading: 'A trade beats a degree more often than anyone admits',
    buttonLabel: 'Find out more',
    buttonUrl: '/latest',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80',
    imageCaption: '',
    animation: 'fade',
    animationTrigger: 'load',
  },
  schema: schema(
    headingField,
    text('buttonLabel', 'Link label'),
    link('buttonUrl', 'Link URL'),
    image('image', 'Circular image'),
    text('imageCaption', 'Image caption'),
  ),
  component: function HeroKindred(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-kd ud-kd-hero" tone="default">
        <span className="ud-kd-hero__bg" aria-hidden />
        <div className="ud-kd-hero__grid">
          <div className="ud-kd-hero__copy">
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h1" className="ud-kd-hero__title" placeholder="Headline" />
            <MoreLink props={props} className="ud-kd-more--light" />
          </div>
          <div className="ud-kd-hero__art">
            <Media src={props.image} alt="" ratio="1 / 1" className="ud-kd-hero__circle" edit={edit} path={['image']} />
            {str(props.imageCaption) || edit ? (
              <EditableText
                edit={edit}
                path={['imageCaption']}
                value={str(props.imageCaption)}
                as="span"
                className="ud-kd-hero__caption"
                placeholder="Caption"
              />
            ) : null}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- pagehead.kindred */

export const pageHeadKindred = defineBlock({
  type: 'pagehead.kindred',
  version: 1,
  category: 'hero',
  label: 'Kindred page title',
  icon: 'Sparkles',
  defaultProps: {
    backLabel: '',
    backUrl: '',
    heading: 'See what we are made of',
    showDot: true,
    description: '',
    size: 'xl',
    showConnector: false,
    animation: 'fade-up',
  },
  schema: schema(
    text('backLabel', 'Back link label'),
    link('backUrl', 'Back link URL'),
    headingField,
    dotField,
    descriptionField,
    select('size', 'Title size', [['xl', 'Extra large'], ['lg', 'Large']], 'layout'),
    toggle('showConnector', 'Red connector above', 'design'),
  ),
  component: function PageHeadKindred(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-kd ud-kd-pagehead" tone="default">
        {bool(props.showConnector, false) ? <Connector /> : null}
        {str(props.backLabel) || edit ? (
          <a className="ud-kd-back" href={str(props.backUrl, '#')}>
            <Icon name="minus" size={12} />
            <EditableText edit={edit} path={['backLabel']} value={str(props.backLabel)} as="span" placeholder="Back" />
          </a>
        ) : null}
        <DotHeading props={props} as={str(props.size, 'xl') === 'xl' ? 'h1' : 'h2'} />
        {str(props.description) || edit ? (
          <SafeText value={str(props.description)} className="ud-kd-lead" edit={edit} path={['description']} placeholder="Intro copy" />
        ) : null}
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- carousel.kindred */

export const carouselKindred = defineBlock({
  type: 'carousel.kindred',
  version: 1,
  category: 'gallery',
  label: 'Kindred company carousel',
  icon: 'Layers',
  defaultProps: {
    heading: '',
    showDot: true,
    perPage: 3,
    items: [
      { name: 'Kindred Rail', word: 'Rail', url: '/companies', image: '' },
      { name: 'Kindred Cellars', word: 'Cellars', url: '/companies', image: '' },
      { name: 'Kindred Stay', word: 'Stay', url: '/companies', image: '' },
      { name: 'Kindred Active', word: 'Active', url: '/companies', image: '' },
      { name: 'Kindred Money', word: 'Money', url: '/companies', image: '' },
      { name: 'Kindred Air', word: 'Air', url: '/companies', image: '' },
    ],
    buttonLabel: 'See all Kindred companies',
    buttonUrl: '/companies',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    dotField,
    select('perPage', 'Cards per view', [['2', '2'], ['3', '3'], ['4', '4']], 'layout'),
    repeater('items', 'Companies', [text('name', 'Name'), text('word', 'Logo word'), image('image', 'Logo image'), link('url', 'Link')], {
      itemLabel: 'Company',
    }),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
  ),
  component: function CarouselKindred(props) {
    const edit = editOf(props)
    const cards = items(props.items, [])
    const perPage = Math.min(Math.max(num(props.perPage, 3), 2), 4)
    const pages = Math.max(Math.ceil(cards.length / perPage), 1)
    const [page, setPage] = useState(0)
    const current = Math.min(page, pages - 1)
    const visible = cards.slice(current * perPage, current * perPage + perPage)
    return (
      <SectionShell props={props} className="ud-kd ud-kd-carousel ud-kd-band" tone="default">
        {str(props.heading) || edit ? <DotHeading props={props} className="ud-kd-title--center" /> : null}
        <div className="ud-kd-carousel__viewport">
          <div className="ud-kd-carousel__grid" data-per={perPage}>
            {visible.map((item, index) => {
              const realIndex = current * perPage + index
              return (
                <a key={realIndex} className="ud-kd-logocard" href={str(item.url, '#')}>
                  <span className="ud-kd-logocard__mark">
                    {str(item.image) ? (
                      <img src={str(item.image)} alt="" loading="lazy" />
                    ) : (
                      <span className="ud-kd-logocard__word">
                        <EditableText
                          edit={edit}
                          path={['items', realIndex, 'word']}
                          value={str(item.word)}
                          as="span"
                          placeholder="Word"
                        />
                      </span>
                    )}
                  </span>
                  <span className="ud-kd-logocard__name">
                    <EditableText edit={edit} path={['items', realIndex, 'name']} value={str(item.name)} as="span" placeholder="Company" />
                    <Icon name="arrow" size={13} />
                  </span>
                </a>
              )
            })}
          </div>
          {pages > 1 ? (
            <button
              type="button"
              className="ud-kd-carousel__next"
              aria-label="Next companies"
              onClick={() => setPage((current + 1) % pages)}
            >
              <Icon name="arrow" size={16} />
            </button>
          ) : null}
        </div>
        {pages > 1 ? (
          <div className="ud-kd-dots" role="tablist" aria-label="Pages">
            {Array.from({ length: pages }).map((_, index) => (
              <button
                key={index}
                type="button"
                className={cx('ud-kd-dots__dot', index === current && 'is-on')}
                aria-label={`Page ${index + 1}`}
                aria-selected={index === current}
                role="tab"
                onClick={() => setPage(index)}
              />
            ))}
          </div>
        ) : null}
        {str(props.buttonLabel) || edit ? (
          <div className="ud-kd-carousel__foot">
            <KdButton href={str(props.buttonUrl, '#')}>
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="See all" />
            </KdButton>
          </div>
        ) : null}
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- articles.kindred */

const articleFields = [
  text('tag', 'Category tag'),
  text('title', 'Title'),
  text('date', 'Date'),
  image('image', 'Image'),
  field('flat', 'color', 'Flat card colour', 'content', { help: 'Used when no image is set.' }),
  text('flatText', 'Flat card text'),
  link('url', 'Link'),
]

/** One editorial card: image (or flat colour panel), red tag, serif title, date. */
function ArticleCard({
  props,
  item,
  index,
  collection = 'items',
}: {
  props: Props
  item: Props
  index: number
  collection?: string
}) {
  const edit = editOf(props)
  const flat = !str(item.image)
  return (
    <a className="ud-kd-article" href={str(item.url, '#')}>
      <span className={cx('ud-kd-article__media', flat && 'ud-kd-article__media--flat')} style={flat ? ({ background: str(item.flat, '#36960d') } as CSSProperties) : undefined}>
        {flat ? (
          <EditableText
            edit={edit}
            path={[collection, index, 'flatText']}
            value={str(item.flatText)}
            as="span"
            className="ud-kd-article__flat-text"
            placeholder="Pull quote"
          />
        ) : (
          <Media src={item.image} alt="" ratio="16 / 10" edit={edit} path={[collection, index, 'image']} />
        )}
        {str(item.tag) || edit ? (
          <EditableText
            edit={edit}
            path={[collection, index, 'tag']}
            value={str(item.tag)}
            as="span"
            className="ud-kd-article__tag"
            placeholder="CATEGORY"
          />
        ) : null}
      </span>
      <EditableText
        edit={edit}
        path={[collection, index, 'title']}
        value={str(item.title)}
        as="h3"
        className="ud-kd-article__title"
        placeholder="Article title"
      />
      <EditableText
        edit={edit}
        path={[collection, index, 'date']}
        value={str(item.date)}
        as="p"
        className="ud-kd-article__date"
        placeholder="1 January 2026"
      />
    </a>
  )
}

export const articlesKindred = defineBlock({
  type: 'articles.kindred',
  version: 1,
  category: 'blog',
  label: 'Kindred article grid',
  icon: 'Book',
  defaultProps: {
    heading: 'Find out more',
    showDot: true,
    columns: 3,
    items: [
      {
        tag: 'Leadership',
        title: 'Why we stopped asking candidates for a degree',
        date: '18 August 2026',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
        flat: '#36960d',
        flatText: '',
        url: '#',
      },
      {
        tag: 'Our companies',
        title: 'Meet the apprentices running a depot before they turn 25',
        date: '13 August 2026',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        flat: '#36960d',
        flatText: '',
        url: '#',
      },
      {
        tag: 'Foundation',
        title: '',
        date: '12 August 2026',
        image: '',
        flat: '#36960d',
        flatText: 'Half the people we hired last year had never written a CV.',
        url: '#',
      },
      {
        tag: 'Foundation',
        title: 'The community fund reaches its fortieth town',
        date: '12 August 2026',
        image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80',
        flat: '#36960d',
        flatText: '',
        url: '#',
      },
      {
        tag: 'Leadership',
        title: 'The places I go when I need to think properly',
        date: '11 August 2026',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        flat: '#36960d',
        flatText: '',
        url: '#',
      },
      {
        tag: 'Leadership',
        title: 'A rail line is a promise to a town, not a spreadsheet',
        date: '23 July 2026',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
        flat: '#36960d',
        flatText: '',
        url: '#',
      },
    ],
    buttonLabel: 'View more from Kindred',
    buttonUrl: '#',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    dotField,
    select('columns', 'Columns', [['2', '2'], ['3', '3']], 'layout'),
    repeater('items', 'Articles', articleFields, { itemLabel: 'Article' }),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
  ),
  component: function ArticlesKindred(props) {
    const edit = editOf(props)
    const cards = items(props.items, [])
    const cols = Math.min(Math.max(num(props.columns, 3), 2), 3)
    return (
      <SectionShell props={props} className="ud-kd ud-kd-articles" tone="default">
        {str(props.heading) || edit ? <DotHeading props={props} className="ud-kd-title--center" /> : null}
        <div className="ud-kd-articles__grid" data-cols={cols}>
          {cards.map((item, index) => (
            <ArticleCard key={index} props={props} item={item} index={index} />
          ))}
        </div>
        {str(props.buttonLabel) || edit ? (
          <div className="ud-kd-carousel__foot">
            <KdButton href={str(props.buttonUrl, '#')} variant="outline">
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="View more" />
            </KdButton>
          </div>
        ) : null}
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- featured.kindred */

export const featuredKindred = defineBlock({
  type: 'featured.kindred',
  version: 1,
  category: 'blog',
  label: 'Kindred featured story',
  icon: 'Book',
  defaultProps: {
    tag: 'Leadership',
    title: 'A rail line is a promise to a town, not a spreadsheet',
    date: '18 August 2026',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    url: '#',
    items: [
      {
        tag: 'Our companies',
        title: 'Meet the apprentices running a depot before they turn 25',
        date: '13 August 2026',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        flat: '#36960d',
        flatText: '',
        url: '#',
      },
      {
        tag: 'Foundation',
        title: '',
        date: '12 August 2026',
        image: '',
        flat: '#36960d',
        flatText: 'Half the people we hired last year had never written a CV.',
        url: '#',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    text('tag', 'Category tag'),
    text('title', 'Title'),
    text('date', 'Date'),
    image('image', 'Image'),
    link('url', 'Link'),
    repeater('items', 'Secondary cards', articleFields, { itemLabel: 'Card' }),
  ),
  component: function FeaturedKindred(props) {
    const edit = editOf(props)
    const cards = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-kd ud-kd-featured" tone="default">
        <a className="ud-kd-lead-story" href={str(props.url, '#')}>
          <Media src={props.image} alt="" ratio="16 / 9" className="ud-kd-lead-story__media" edit={edit} path={['image']} />
          <span className="ud-kd-lead-story__panel">
            <EditableText edit={edit} path={['tag']} value={str(props.tag)} as="span" className="ud-kd-lead-story__tag" placeholder="CATEGORY" />
            <EditableText edit={edit} path={['title']} value={str(props.title)} as="h2" className="ud-kd-lead-story__title" placeholder="Headline" />
            <EditableText edit={edit} path={['date']} value={str(props.date)} as="span" className="ud-kd-article__date" placeholder="Date" />
          </span>
        </a>
        <div className="ud-kd-articles__grid" data-cols={2}>
          {cards.map((item, index) => (
            <ArticleCard key={index} props={props} item={item} index={index} />
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- filter.kindred */

export const filterKindred = defineBlock({
  type: 'filter.kindred',
  version: 1,
  category: 'content',
  label: 'Kindred filter tabs',
  icon: 'Menu',
  defaultProps: {
    heading: 'This just in',
    showDot: false,
    tabs: [
      { label: 'All' },
      { label: 'Our companies' },
      { label: 'Founders' },
      { label: 'Careers' },
      { label: 'The group' },
      { label: 'Foundation' },
      { label: 'Leadership' },
    ],
    showSelect: true,
    selectLabel: 'All',
    selectOptions: 'All\nNewest first\nOldest first',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    dotField,
    repeater('tabs', 'Tabs', [text('label', 'Label')], { itemLabel: 'Tab' }),
    toggle('showSelect', 'Show dropdown', 'layout'),
    text('selectLabel', 'Dropdown label'),
    textarea('selectOptions', 'Dropdown options', { help: 'One per line.' }),
  ),
  component: function FilterKindred(props) {
    const edit = editOf(props)
    const tabs = items(props.tabs, [])
    const options = lines(props.selectOptions, [])
    const [active, setActive] = useState(0)
    return (
      <SectionShell props={props} className="ud-kd ud-kd-filter" tone="default">
        {str(props.heading) || edit ? <DotHeading props={props} className="ud-kd-title--center" /> : null}
        <div className="ud-kd-filter__tabs" role="tablist">
          {tabs.map((item, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === active}
              className={cx('ud-kd-filter__tab', index === active && 'is-on')}
              onClick={(event) => {
                if (edit && (event.target as HTMLElement).closest('.ud-editable')) return
                setActive(index)
              }}
            >
              <EditableText edit={edit} path={['tabs', index, 'label']} value={str(item.label)} as="span" placeholder="Tab" />
            </button>
          ))}
        </div>
        {bool(props.showSelect, true) ? (
          <div className="ud-kd-filter__select">
            <select aria-label={str(props.selectLabel, 'Filter')} defaultValue={options[0] || ''}>
              {(options.length ? options : [str(props.selectLabel, 'All')]).map((value, index) => (
                <option key={index} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <Icon name="minus" size={14} />
          </div>
        ) : null}
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ story.kindred */

export const storyKindred = defineBlock({
  type: 'story.kindred',
  version: 1,
  category: 'content',
  label: 'Kindred intro copy',
  icon: 'Book',
  defaultProps: {
    bannerImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
    heading: 'Our story',
    showDot: true,
    body: 'For thirty years the Kindred name has meant one thing to the people who use it: someone finally thought about how this should feel.\n\nFrom the quiet carriage on a **Kindred Rail** sleeper to the way a **Kindred Active** class ends five minutes early so nobody has to rush, the whole business is built backwards from the moment a person actually experiences.',
    animation: 'fade-up',
  },
  schema: schema(image('bannerImage', 'Banner image'), headingField, dotField, textarea('body', 'Body copy', { help: 'Blank line starts a new paragraph. **bold** is supported.' })),
  component: function StoryKindred(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-kd ud-kd-story" tone="default">
        {str(props.bannerImage) || edit ? (
          <Media src={props.bannerImage} alt="" ratio="21 / 6" className="ud-kd-story__banner" edit={edit} path={['bannerImage']} />
        ) : null}
        <DotHeading props={props} className="ud-kd-title--center" />
        <SafeText value={str(props.body)} className="ud-kd-story__body" edit={edit} path={['body']} placeholder="Body copy" />
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- values.kindred */

export const valuesKindred = defineBlock({
  type: 'values.kindred',
  version: 1,
  category: 'features',
  label: 'Kindred value panels',
  icon: 'Sparkles',
  defaultProps: {
    heading: 'The backbone of our brand will always be our values',
    showDot: true,
    items: [
      { word: 'Restless Curiosity', caption: 'Kindred archive', invert: false },
      { word: 'Kind Disruption', caption: 'Kindred archive', invert: true },
      { word: 'Plain Speaking', caption: 'Kindred archive', invert: false },
    ],
    body: 'Kindred grew out of a refusal to accept that a thing had to stay the way it was found. That restlessness built a group of companies across six sectors, and it is still the reason people join us.\n\nOur purpose is to leave every market we enter a little fairer than we found it. Our values are what keep the people, the products and the partners pointed at that.',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    dotField,
    repeater('items', 'Panels', [text('word', 'Value'), text('caption', 'Caption'), field('invert', 'toggle', 'Red panel', 'content')], {
      itemLabel: 'Panel',
    }),
    textarea('body', 'Body copy'),
  ),
  component: function ValuesKindred(props) {
    const edit = editOf(props)
    const panels = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-kd ud-kd-values ud-kd-band" tone="default">
        <DotHeading props={props} className="ud-kd-title--center ud-kd-title--narrow" />
        <div className="ud-kd-values__rail">
          {panels.map((item, index) => (
            <figure key={index} className={cx('ud-kd-value', bool(item.invert) && 'ud-kd-value--red')}>
              <span className="ud-kd-value__frac">
                <sup>{index + 1}</sup>
                <span aria-hidden>/</span>
                <sub>{panels.length}</sub>
              </span>
              <EditableText
                edit={edit}
                path={['items', index, 'word']}
                value={str(item.word)}
                as="p"
                className="ud-kd-value__word"
                placeholder="Value"
              />
              <figcaption>
                <EditableText edit={edit} path={['items', index, 'caption']} value={str(item.caption)} as="span" placeholder="Caption" />
              </figcaption>
            </figure>
          ))}
        </div>
        <SafeText value={str(props.body)} className="ud-kd-story__body" edit={edit} path={['body']} placeholder="Body copy" />
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ stats.kindred */

export const statsKindred = defineBlock({
  type: 'stats.kindred',
  version: 1,
  category: 'features',
  label: 'Kindred key statistics',
  icon: 'Chart',
  defaultProps: {
    heading: 'Key statistics',
    showDot: true,
    description: 'The Kindred group is made up of more than forty companies across six sectors and five continents.',
    images: [
      { image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80', caption: 'Kindred archive' },
      { image: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1000&q=80', caption: 'Kindred archive' },
    ],
    animation: 'fade-up',
  },
  schema: schema(headingField, dotField, descriptionField, repeater('images', 'Panels', [image('image', 'Image'), text('caption', 'Caption')], { itemLabel: 'Panel' })),
  component: function StatsKindred(props) {
    const edit = editOf(props)
    const panels = items(props.images, [])
    return (
      <SectionShell props={props} className="ud-kd ud-kd-stats" tone="default">
        <DotHeading props={props} className="ud-kd-title--center" />
        {str(props.description) || edit ? (
          <SafeText value={str(props.description)} className="ud-kd-lead" edit={edit} path={['description']} placeholder="Intro" />
        ) : null}
        <div className="ud-kd-stats__rail">
          {panels.map((item, index) => (
            <figure key={index} className="ud-kd-stats__panel">
              <Media src={item.image} alt="" ratio="16 / 9" edit={edit} path={['images', index, 'image']} />
              <figcaption>
                <EditableText edit={edit} path={['images', index, 'caption']} value={str(item.caption)} as="span" placeholder="Caption" />
              </figcaption>
            </figure>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- numbers.kindred */

export const numbersKindred = defineBlock({
  type: 'numbers.kindred',
  version: 1,
  category: 'features',
  label: 'Kindred big numbers',
  icon: 'Chart',
  defaultProps: {
    heading: '41 companies, one Kindred way',
    showDot: false,
    items: [
      { value: '1996', label: 'The year it all began' },
      { value: '28', label: 'Countries' },
      { value: '51,000', label: 'People (and counting…)' },
    ],
    animation: 'fade-up',
  },
  schema: schema(headingField, dotField, repeater('items', 'Numbers', [text('value', 'Value'), text('label', 'Label')], { itemLabel: 'Number' })),
  component: function NumbersKindred(props) {
    const edit = editOf(props)
    const cols = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-kd ud-kd-numbers" tone="default">
        <DotHeading props={props} className="ud-kd-title--center" />
        <div className="ud-kd-numbers__grid">
          {cols.map((item, index) => (
            <div key={index} className="ud-kd-number">
              <EditableText
                edit={edit}
                path={['items', index, 'value']}
                value={str(item.value)}
                as="p"
                className="ud-kd-number__value"
                placeholder="1996"
              />
              <EditableText
                edit={edit}
                path={['items', index, 'label']}
                value={str(item.label)}
                as="p"
                className="ud-kd-number__label"
                placeholder="Label"
              />
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ video.kindred */

export const videoKindred = defineBlock({
  type: 'video.kindred',
  version: 1,
  category: 'content',
  label: 'Kindred video band',
  icon: 'Play',
  defaultProps: {
    heading: 'Working at Kindred',
    showDot: true,
    bandColor: '#12304f',
    embedUrl: '',
    poster: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    caption: '',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    dotField,
    field('bandColor', 'color', 'Band colour', 'design'),
    field('embedUrl', 'text', 'Video embed URL', 'content', { help: 'Any embeddable player URL. Blank shows the poster image.' }),
    image('poster', 'Poster image'),
    text('caption', 'Caption'),
  ),
  component: function VideoKindred(props) {
    const edit = editOf(props)
    const embed = str(props.embedUrl)
    return (
      <SectionShell
        props={props}
        className="ud-kd ud-kd-videoband"
        tone="default"
        style={{ '--kd-band': str(props.bandColor, '#12304f') } as CSSProperties}
      >
        <DotHeading props={props} className="ud-kd-title--center ud-kd-title--light" />
        <div className="ud-kd-videoband__frame">
          {embed ? (
            <iframe title={str(props.heading, 'Video')} src={embed} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
          ) : (
            <Media src={props.poster} alt="" ratio="16 / 9" edit={edit} path={['poster']}>
              <span className="ud-kd-videoband__play" aria-hidden>
                <Icon name="play" size={22} filled />
              </span>
            </Media>
          )}
        </div>
        {str(props.caption) || edit ? (
          <EditableText edit={edit} path={['caption']} value={str(props.caption)} as="p" className="ud-kd-videoband__caption" placeholder="Caption" />
        ) : null}
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- benefits.kindred */

export const benefitsKindred = defineBlock({
  type: 'benefits.kindred',
  version: 1,
  category: 'features',
  label: 'Kindred benefit icons',
  icon: 'Heart',
  defaultProps: {
    heading: 'Why join us?',
    showDot: false,
    bandColor: '#efe6f7',
    items: [
      { icon: 'heart', text: 'Join a global community and work alongside people in forty-one companies, twenty-eight countries and more time zones than anyone can keep straight.' },
      { icon: 'gift', text: 'From sleeper berths to cellar releases, every colleague gets access to the things our companies make — at the price we pay for them.' },
      { icon: 'home', text: 'We hire for the person, not the paperwork. Half our depot managers started on the platform, and nobody had to ask permission to move.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    dotField,
    field('bandColor', 'color', 'Band colour', 'design'),
    repeater('items', 'Benefits', [icon('icon', 'Icon'), textarea('text', 'Text')], { itemLabel: 'Benefit' }),
  ),
  component: function BenefitsKindred(props) {
    const edit = editOf(props)
    const cols = items(props.items, [])
    return (
      <SectionShell
        props={props}
        className="ud-kd ud-kd-benefits"
        tone="default"
        style={{ '--kd-band': str(props.bandColor, '#efe6f7') } as CSSProperties}
      >
        <DotHeading props={props} className="ud-kd-title--center" />
        <div className="ud-kd-benefits__grid">
          {cols.map((item, index) => (
            <div key={index} className="ud-kd-benefit">
              <span className="ud-kd-benefit__icon" aria-hidden>
                <Icon name={str(item.icon, 'heart')} size={64} />
              </span>
              <SafeText
                value={str(item.text)}
                className="ud-kd-benefit__text"
                edit={edit}
                path={['items', index, 'text']}
                placeholder="Describe the benefit"
              />
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- jobs.kindred */

export const jobsKindred = defineBlock({
  type: 'jobs.kindred',
  version: 1,
  category: 'content',
  label: 'Kindred job cards',
  icon: 'Briefcase',
  defaultProps: {
    heading: 'Hot jobs',
    showDot: true,
    description: 'A handful of roles our companies are especially keen to fill this month.',
    items: [
      { word: 'Rail', role: 'Depot Apprentice', company: 'Kindred Rail', location: 'Crewe, UK', url: '#' },
      { word: 'Stay', role: 'Night Manager', company: 'Kindred Stay', location: 'Lisbon, PT', url: '#' },
      { word: 'Money', role: 'Fraud Analyst', company: 'Kindred Money', location: 'Remote, UK', url: '#' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    dotField,
    descriptionField,
    repeater('items', 'Jobs', [text('word', 'Logo word'), text('role', 'Role'), text('company', 'Company'), text('location', 'Location'), link('url', 'Link')], {
      itemLabel: 'Job',
    }),
  ),
  component: function JobsKindred(props) {
    const edit = editOf(props)
    const cards = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-kd ud-kd-jobs" tone="surface">
        <DotHeading props={props} className="ud-kd-title--center" />
        {str(props.description) || edit ? (
          <SafeText value={str(props.description)} className="ud-kd-lead" edit={edit} path={['description']} placeholder="Intro" />
        ) : null}
        <div className="ud-kd-jobs__grid">
          {cards.map((item, index) => (
            <a key={index} className="ud-kd-job" href={str(item.url, '#')}>
              <span className="ud-kd-logocard__word ud-kd-job__mark">
                <EditableText edit={edit} path={['items', index, 'word']} value={str(item.word)} as="span" placeholder="Word" />
              </span>
              <EditableText edit={edit} path={['items', index, 'role']} value={str(item.role)} as="p" className="ud-kd-job__role" placeholder="Role" />
              <EditableText
                edit={edit}
                path={['items', index, 'company']}
                value={str(item.company)}
                as="p"
                className="ud-kd-job__company"
                placeholder="Company"
              />
              <span className="ud-kd-job__loc">
                <Icon name="map-pin" size={12} />
                <EditableText edit={edit} path={['items', index, 'location']} value={str(item.location)} as="span" placeholder="Location" />
              </span>
            </a>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------- companies.kindred */

export const companiesKindred = defineBlock({
  type: 'companies.kindred',
  version: 1,
  category: 'gallery',
  label: 'Kindred company grid',
  icon: 'Layers',
  defaultProps: {
    items: [
      { name: 'Kindred Active Australia', word: 'Active', url: '#' },
      { name: 'Kindred Active Italy', word: 'Active', url: '#' },
      { name: 'Kindred Active Singapore', word: 'Active', url: '#' },
      { name: 'Kindred Adventures', word: 'Adventures', url: '#' },
      { name: 'Kindred Air', word: 'Air', url: '#' },
      { name: 'Kindred Air Holidays', word: 'Holidays', url: '#' },
      { name: 'Kindred Balloon Flights', word: 'Balloon', url: '#' },
      { name: 'Kindred Bet', word: 'Bet', url: '#' },
      { name: 'Kindred Cellars', word: 'Cellars', url: '#' },
      { name: 'Kindred Experience Days', word: 'Days', url: '#' },
      { name: 'Kindred Games', word: 'Games', url: '#' },
      { name: 'Kindred Gifts', word: 'Gifts', url: '#' },
      { name: 'Kindred Hotels', word: 'Hotels', url: '#' },
      { name: 'Kindred Limited Edition', word: 'Edition', url: '#' },
      { name: 'Kindred Media', word: 'Media', url: '#' },
      { name: 'Kindred Megastore', word: 'Megastore', url: '#' },
      { name: 'Kindred Mobile Chile', word: 'Mobile', url: '#' },
      { name: 'Kindred Money', word: 'Money', url: '#' },
      { name: 'Kindred Music', word: 'Music', url: '#' },
      { name: 'Kindred Rail', word: 'Rail', url: '#' },
      { name: 'Kindred Records', word: 'Records', url: '#' },
      { name: 'Kindred Stay', word: 'Stay', url: '#' },
      { name: 'Kindred StartUp', word: 'StartUp', url: '#' },
      { name: 'Kindred Voyages', word: 'Voyages', url: '#' },
    ],
    animation: 'fade-up',
  },
  schema: schema(repeater('items', 'Companies', [text('name', 'Name'), text('word', 'Logo word'), image('image', 'Logo image'), link('url', 'Link')], { itemLabel: 'Company' })),
  component: function CompaniesKindred(props) {
    const edit = editOf(props)
    const cards = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-kd ud-kd-companies ud-kd-band" tone="default">
        <div className="ud-kd-companies__grid">
          {cards.map((item, index) => (
            <a key={index} className="ud-kd-logocard" href={str(item.url, '#')}>
              <span className="ud-kd-logocard__mark">
                {str(item.image) ? (
                  <img src={str(item.image)} alt="" loading="lazy" />
                ) : (
                  <span className="ud-kd-logocard__word">
                    <EditableText edit={edit} path={['items', index, 'word']} value={str(item.word)} as="span" placeholder="Word" />
                  </span>
                )}
              </span>
              <span className="ud-kd-logocard__name">
                <EditableText edit={edit} path={['items', index, 'name']} value={str(item.name)} as="span" placeholder="Company" />
                <Icon name="arrow" size={13} />
              </span>
            </a>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- promos.kindred */

export const promosKindred = defineBlock({
  type: 'promos.kindred',
  version: 1,
  category: 'features',
  label: 'Kindred promo cards',
  icon: 'Layers',
  defaultProps: {
    items: [
      {
        title: 'The Kindred letter',
        text: 'A short note every other Friday about what our companies are building and the odd thing we got wrong.',
        linkLabel: 'Sign up now',
        linkUrl: '#',
        image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'Thinking of starting something?',
        text: 'Kindred StartUp has backed 900 first-time founders with loans, mentoring and a room to argue in.',
        linkLabel: 'Learn more',
        linkUrl: '#',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'Our foundation',
        text: 'The Kindred Foundation is the independent charity of the group and the family behind it.',
        linkLabel: 'Support the foundation',
        linkUrl: '/purpose',
        image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'Our timeline',
        text: 'It begins in 1996 with a second-hand van, a phone box and an unreasonable amount of confidence.',
        linkLabel: 'Explore the timeline',
        linkUrl: '/about',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    repeater('items', 'Promos', [image('image', 'Image'), text('title', 'Title'), textarea('text', 'Text'), text('linkLabel', 'Link label'), link('linkUrl', 'Link URL')], {
      itemLabel: 'Promo',
    }),
  ),
  component: function PromosKindred(props) {
    const edit = editOf(props)
    const cards = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-kd ud-kd-promos ud-kd-band" tone="default">
        <div className="ud-kd-promos__grid">
          {cards.map((item, index) => (
            <article key={index} className="ud-kd-promo">
              <Media src={item.image} alt="" ratio="16 / 9" edit={edit} path={['items', index, 'image']} />
              <div className="ud-kd-promo__body">
                <h3 className="ud-kd-promo__title">
                  <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="span" placeholder="Title" />
                  <span className="ud-kd-dot">.</span>
                </h3>
                <SafeText
                  value={str(item.text)}
                  className="ud-kd-promo__text"
                  edit={edit}
                  path={['items', index, 'text']}
                  placeholder="Describe it"
                />
                <a className="ud-kd-promo__link" href={str(item.linkUrl, '#')}>
                  <EditableText edit={edit} path={['items', index, 'linkLabel']} value={str(item.linkLabel)} as="span" placeholder="Learn more" />
                  <Icon name="arrow" size={12} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- social.kindred */

export const socialKindred = defineBlock({
  type: 'social.kindred',
  version: 1,
  category: 'cta',
  label: 'Kindred social badge',
  icon: 'Heart',
  defaultProps: {
    logo: 'K',
    heading: 'Reach us on social',
    description: 'Be part of the conversation on our latest ventures.',
    items: [
      { icon: 'facebook', url: '#' },
      { icon: 'twitter', url: '#' },
      { icon: 'instagram', url: '#' },
      { icon: 'youtube', url: '#' },
      { icon: 'linkedin', url: '#' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    text('logo', 'Badge letter'),
    headingField,
    descriptionField,
    repeater('items', 'Profiles', [icon('icon', 'Icon'), link('url', 'URL')], { itemLabel: 'Profile' }),
  ),
  component: function SocialKindred(props) {
    const edit = editOf(props)
    const profiles = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-kd ud-kd-social" tone="default">
        <span className="ud-kd-social__badge" aria-hidden>
          <EditableText edit={edit} path={['logo']} value={str(props.logo, 'K')} as="span" placeholder="K" />
        </span>
        <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="p" className="ud-kd-social__title" placeholder="Reach us" />
        <SafeText value={str(props.description)} className="ud-kd-social__text" edit={edit} path={['description']} placeholder="Copy" />
        <div className="ud-kd-social__row">
          {profiles.map((item, index) => (
            <a key={index} href={str(item.url, '#')} aria-label={str(item.icon, 'social')}>
              <Icon name={str(item.icon, 'globe')} size={17} />
            </a>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- richtext.kindred */

export const richTextKindred = defineBlock({
  type: 'richtext.kindred',
  version: 1,
  category: 'content',
  label: 'Kindred long copy',
  icon: 'Book',
  defaultProps: {
    heading: '',
    showDot: true,
    intro: 'Kindred Holdings is a private group with a single job: to own our companies patiently and to keep them honest.',
    sections: [
      {
        title: '',
        body: 'The portfolio spans six sectors and five continents, with majority stakes in most of the companies that carry the name and minority positions in a handful that do not.\n\nWe reinvest operating profit rather than distribute it. That is the whole financial strategy, and it is the reason we can take a decade over things that would embarrass a quarterly reporter.',
      },
      {
        title: 'Kindred Management',
        body: 'A small team in Bristol, New York and Zurich supports the group: investment professionals, a handful of operators, and the people who keep the brand from being used badly.\n\nThey also handle the licensing arrangements that let companies outside the group carry the Kindred name, under terms that can be withdrawn.',
      },
      {
        title: 'What we own',
        body: '**Travel and leisure.** Kindred Rail, Kindred Voyages and the Kindred Hotels Collection.\n\n**Health and wellness.** Kindred Active operates clubs in the UK, Italy, South Africa and Australia.\n\n**Money.** Kindred Money in retail banking, and a small venture book focused on payments.\n\n**Media.** Kindred Radio licenses the name to stations in forty countries.',
      },
      {
        title: 'Philanthropy',
        body: 'Alongside the commercial work, the group funds the Kindred Foundation and Kindred StartUp, which delivers government-backed loans and mentoring to people starting a business for the first time.',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    dotField,
    textarea('intro', 'Lead paragraph'),
    repeater('sections', 'Sections', [text('title', 'Sub-heading'), textarea('body', 'Body copy')], { itemLabel: 'Section' }),
  ),
  component: function RichTextKindred(props) {
    const edit = editOf(props)
    const blocks = items(props.sections, [])
    return (
      <SectionShell props={props} className="ud-kd ud-kd-rich" tone="default">
        {str(props.heading) || edit ? <DotHeading props={props} className="ud-kd-title--center" /> : null}
        {str(props.intro) || edit ? (
          <SafeText value={str(props.intro)} className="ud-kd-rich__intro" edit={edit} path={['intro']} placeholder="Lead paragraph" />
        ) : null}
        <div className="ud-kd-rich__body">
          {blocks.map((item, index) => (
            <section key={index} className="ud-kd-rich__section">
              {str(item.title) || edit ? (
                <EditableText
                  edit={edit}
                  path={['sections', index, 'title']}
                  value={str(item.title)}
                  as="h2"
                  className="ud-kd-rich__subtitle"
                  placeholder="Sub-heading"
                />
              ) : null}
              <SafeText
                value={str(item.body)}
                className="ud-kd-rich__text"
                edit={edit}
                path={['sections', index, 'body']}
                placeholder="Body copy"
              />
            </section>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- footer.kindred */

export const footerKindred = defineBlock({
  type: 'footer.kindred',
  version: 1,
  category: 'footer',
  label: 'Kindred footer',
  icon: 'Layers',
  defaultProps: {
    logo: 'Kindred',
    logoImage: '',
    logoUrl: '/',
    columns: [
      { links: [{ label: 'Contact Kindred', url: '#' }, { label: 'Web Terms of Use', url: '#' }, { label: 'Web Privacy Policy', url: '#' }, { label: 'Web Cookie Policy', url: '#' }] },
      { links: [{ label: 'Modern Slavery Statement', url: '#' }, { label: 'Tax Strategy Statement', url: '#' }, { label: 'Corporate Governance', url: '#' }, { label: 'Group FAQs', url: '#' }] },
      { links: [{ label: 'Newsletter', url: '#' }, { label: 'Report a Scam', url: '#' }, { label: 'Candidate Privacy Notice', url: '#' }, { label: 'Media Centre', url: '#' }] },
    ],
    quote: 'The point was never to be the biggest thing in the room. It was to be the one people were glad turned up.',
    quoteAuthor: 'Marisa Okonjo, founder',
    social: [
      { icon: 'facebook', url: '#' },
      { icon: 'twitter', url: '#' },
      { icon: 'instagram', url: '#' },
      { icon: 'youtube', url: '#' },
      { icon: 'linkedin', url: '#' },
    ],
    copyright: '© Kindred 2026. All rights reserved.',
    animation: 'fade-up',
  },
  schema: schema(
    text('logo', 'Wordmark'),
    image('logoImage', 'Logo image'),
    field('logoHeight', 'slider', 'Logo height', 'design', { min: 12, max: 120, unit: 'px' }),
    field('logoWidth', 'slider', 'Logo width', 'design', { min: 16, max: 400, unit: 'px', help: 'Leave empty to keep the logo\'s natural aspect ratio.' }),
    repeater('columns', 'Link columns', [repeater('links', 'Links', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Link' })], { itemLabel: 'Column' }),
    textarea('quote', 'Quote'),
    text('quoteAuthor', 'Quote author'),
    repeater('social', 'Social', [icon('icon', 'Icon'), link('url', 'URL')], { itemLabel: 'Profile' }),
    text('copyright', 'Copyright'),
  ),
  component: function FooterKindred(props) {
    const edit = editOf(props)
    const columns = items(props.columns, [])
    const social = items(props.social, [])
    const anim = animationOf(props)
    return (
      <footer
        className={cx('ud-kd', 'ud-kd-footer', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container">
          <Wordmark props={props} small />
          <div className="ud-kd-footer__grid">
            {columns.map((column, index) => (
              <div key={index} className="ud-kd-footer__col">
                {items(column.links, []).map((item, linkIndex) => (
                  <a key={linkIndex} className="ud-kd-footer__link" href={str(item.url, '#')}>
                    <EditableText
                      edit={edit}
                      path={['columns', index, 'links', linkIndex, 'label']}
                      value={str(item.label)}
                      as="span"
                      placeholder="Link"
                    />
                  </a>
                ))}
              </div>
            ))}
            <blockquote className="ud-kd-footer__quote">
              <SafeText value={str(props.quote)} edit={edit} path={['quote']} placeholder="Quote" />
              <EditableText
                edit={edit}
                path={['quoteAuthor']}
                value={str(props.quoteAuthor)}
                as="span"
                className="ud-kd-footer__quote-by"
                placeholder="Author"
              />
            </blockquote>
          </div>
          <div className="ud-kd-footer__social">
            {social.map((item, index) => (
              <a key={index} href={str(item.url, '#')} aria-label={str(item.icon, 'social')}>
                <Icon name={str(item.icon, 'globe')} size={16} />
              </a>
            ))}
          </div>
          <EditableText
            edit={edit}
            path={['copyright']}
            value={str(props.copyright)}
            as="p"
            className="ud-kd-footer__fine"
            placeholder="© 2026"
          />
        </div>
      </footer>
    )
  },
})
