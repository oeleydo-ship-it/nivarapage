import type { CSSProperties } from 'react'
import { EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Avatar,
  Body,
  Card,
  CheckList,
  CtaGroup,
  Heading,
  IconBadge,
  Media,
  SafeText,
  SectionShell,
  Stars,
  bool,
  cx,
  gridStyle,
  isCentered,
  items,
  lines,
  num,
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
  repeater,
  schema,
  select,
  slider,
  text,
  toggle,
} from '../schema'
import { defineBlock } from '../types'

const heroContentFields = [eyebrowField, headingField, descriptionField, ...ctaFields]

const mediaFields = [
  image('image', 'Image'),
  text('imageAlt', 'Image alt text'),
  select('imageRatio', 'Image ratio', [['landscape', '4:3'], ['wide', '16:9'], ['square', '1:1'], ['portrait', '3:4'], ['tall', '4:5']], 'design'),
]

function HeroCopy({ props, level = 1 }: { props: Props; level?: 1 | 2 }) {
  const edit = editOf(props)
  const eyebrow = str(props.eyebrow)
  const descriptionKey = str(props.description) || !str(props.subheading) ? 'description' : 'subheading'
  return (
    <div>
      {eyebrow || edit ? (
        <EditableText edit={edit} path={['eyebrow']} value={eyebrow} as="p" className="ud-eyebrow" placeholder="Eyebrow" />
      ) : null}
      <EditableText
        edit={edit}
        path={['heading']}
        value={str(props.heading, 'A headline that sells the outcome')}
        as={level === 1 ? 'h1' : 'h2'}
        className={`ud-h${level}`}
        placeholder="Headline"
      />
      <SafeText
        value={str(props.description) || str(props.subheading)}
        className="ud-lead"
        edit={edit}
        path={[descriptionKey]}
        placeholder="Supporting sentence"
      />
      <CtaGroup props={props} />
    </div>
  )
}

/* ------------------------------------------------------------ hero.centered */

export const heroCentered = defineBlock({
  type: 'hero.centered',
  version: 1,
  category: 'hero',
  label: 'Centered hero',
  icon: 'Sparkles',
  defaultProps: {
    eyebrow: 'Website builder',
    heading: 'Build a site you are proud of',
    description: 'A polished website your team can launch without waiting on developers.',
    buttonLabel: 'Start building',
    buttonUrl: '/signup',
    secondaryLabel: 'See a demo',
    secondaryUrl: '/demo',
    textAlign: 'center',
    showTrust: true,
    trustText: 'Trusted by 2,400+ teams',
  },
  schema: schema(
    ...heroContentFields,
    toggle('showTrust', 'Show trust row', 'content'),
    text('trustText', 'Trust text'),
    image('image', 'Screenshot below copy'),
  ),
  component: (props) => (
    <SectionShell props={props} tone="default" align="center">
      <div style={{ maxWidth: 820, marginInline: isCentered(props, 'center') ? 'auto' : undefined }}>
        <HeroCopy props={props} />
        {bool(props.showTrust, false) ? (
          <div
            className="ud-row"
            style={{ justifyContent: isCentered(props, 'center') ? 'center' : 'flex-start', marginTop: 26, gap: 12 }}
          >
            <Stars count={5} />
            <EditableText
              edit={editOf(props)}
              path={['trustText']}
              value={str(props.trustText, 'Loved by teams everywhere')}
              as="span"
              className="ud-small"
              placeholder="Trusted by teams everywhere"
            />
          </div>
        ) : null}
      </div>
      {str(props.image) ? (
        <Body style={{ marginTop: 48 }}>
          <Media src={props.image} alt={str(props.imageAlt)} ratio="wide" edit={editOf(props)} path={['image']} />
        </Body>
      ) : null}
    </SectionShell>
  ),
  settings: null,
})

/* --------------------------------------------------------------- hero.split */

export const heroSplit = defineBlock({
  type: 'hero.split',
  version: 1,
  category: 'hero',
  label: 'Split hero',
  icon: 'Columns2',
  defaultProps: {
    eyebrow: 'Come and see',
    heading: 'Visit us this weekend',
    description: 'We would love to host you. Reserve a table, join a tasting, or simply drop in.',
    buttonLabel: 'Reserve a table',
    buttonUrl: '/contact',
    secondaryLabel: 'View the menu',
    secondaryUrl: '/menu',
    imageRatio: 'landscape',
    reverse: false,
    highlights: [
      { label: 'Open Tue – Sun' },
      { label: 'Harbour-side terrace' },
      { label: 'Walk-ins welcome' },
    ],
  },
  schema: schema(
    ...heroContentFields,
    ...mediaFields,
    toggle('reverse', 'Image on the left', 'layout'),
    repeater('highlights', 'Highlights', [text('label', 'Label')], { itemLabel: 'Highlight', itemDefaults: { label: 'New highlight' } }),
  ),
  component: (props) => {
    const highlightItems = items(props.highlights, [])
    const highlights = highlightItems.map((item) => str(item.label)).filter(Boolean)
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default">
        <div className={cx('ud-split', bool(props.reverse) && 'ud-split--reverse')}>
          <div>
            <HeroCopy props={props} />
            {highlights.length ? (
              <div style={{ marginTop: 28 }}>
                <ul className="ud-list">
                  {highlightItems.map((item, index) => (
                    <li key={index}>
                      <Icon name="check" />
                      <EditableText
                        edit={edit}
                        path={['highlights', index, 'label']}
                        value={str(item.label)}
                        as="span"
                        placeholder="Highlight"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="ud-split__media">
            <Media
              src={props.image}
              alt={str(props.imageAlt)}
              ratio={str(props.imageRatio, 'landscape')}
              edit={editOf(props)}
              path={['image']}
            />
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------------- hero.image */

export const heroImage = defineBlock({
  type: 'hero.image',
  version: 1,
  category: 'hero',
  label: 'Hero with image',
  icon: 'Image',
  defaultProps: {
    eyebrow: 'About us',
    heading: 'People, process, and craft',
    description: 'A small studio with a long list of launches. Meet the team behind the work.',
    buttonLabel: 'Meet the team',
    buttonUrl: '/team',
    imageRatio: 'wide',
    textAlign: 'center',
    stats: [
      { value: '12 yrs', label: 'Average experience' },
      { value: '180+', label: 'Websites shipped' },
      { value: '4.9', label: 'Client rating' },
    ],
  },
  schema: schema(
    ...heroContentFields,
    ...mediaFields,
    repeater('stats', 'Stats', [text('value', 'Value'), text('label', 'Label')], {
      itemLabel: 'Stat',
      itemDefaults: { value: '100+', label: 'Projects' },
    }),
  ),
  component: (props) => {
    const stats = items(props.stats, [])
    return (
      <SectionShell props={props} tone="default" align="center">
        <div style={{ maxWidth: 760, marginInline: isCentered(props, 'center') ? 'auto' : undefined }}>
          <HeroCopy props={props} />
        </div>
        <Body style={{ marginTop: 44 }}>
          <Media
            src={props.image}
            alt={str(props.imageAlt)}
            ratio={str(props.imageRatio, 'wide')}
            edit={editOf(props)}
            path={['image']}
          />
        </Body>
        {stats.length ? (
          <div className="ud-grid" style={{ ...gridStyle(Math.min(stats.length, 4), 20), marginTop: 40, textAlign: 'center' }}>
            {stats.map((stat, index) => (
              <div key={index}>
                <EditableText
                  edit={editOf(props)}
                  path={['stats', index, 'value']}
                  value={str(stat.value, '—')}
                  as="div"
                  className="ud-h2"
                  style={{ fontSize: '2rem' }}
                  placeholder="12k"
                />
                <EditableText
                  edit={editOf(props)}
                  path={['stats', index, 'label']}
                  value={str(stat.label)}
                  as="p"
                  className="ud-small"
                  style={{ marginTop: 6 }}
                  placeholder="Label"
                />
              </div>
            ))}
          </div>
        ) : null}
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------- hero.background */

export const heroBackground = defineBlock({
  type: 'hero.background',
  version: 1,
  category: 'hero',
  label: 'Background hero',
  icon: 'Wallpaper',
  defaultProps: {
    eyebrow: 'Let’s talk',
    heading: 'Tell us about the project',
    description: 'Share a few details and we will come back within one business day.',
    buttonLabel: 'Start a conversation',
    buttonUrl: '/contact',
    secondaryLabel: 'Call us',
    secondaryUrl: 'tel:+10000000000',
    textAlign: 'center',
    backgroundType: 'image',
    overlayColor: '#0f172a',
    overlayOpacity: 58,
    lightText: true,
    minHeight: 560,
  },
  schema: schema(
    ...heroContentFields,
    slider('minHeight', 'Minimum height', 320, 900, 'layout', { unit: 'px' }),
    select('verticalAlign', 'Vertical alignment', [['center', 'Center'], ['end', 'Bottom'], ['start', 'Top']], 'layout'),
  ),
  component: (props) => (
    <SectionShell
      props={props}
      tone="dark"
      align="center"
      style={{
        display: 'flex',
        alignItems: str(props.verticalAlign, 'center') === 'start' ? 'flex-start' : str(props.verticalAlign, 'center') === 'end' ? 'flex-end' : 'center',
        minHeight: num(props.minHeight, 560),
      }}
    >
      <div style={{ maxWidth: 780, marginInline: isCentered(props, 'center') ? 'auto' : undefined, width: '100%' }}>
        <HeroCopy props={props} />
      </div>
    </SectionShell>
  ),
  settings: null,
})

/* ---------------------------------------------------------------- hero.saas */

export const heroSaas = defineBlock({
  type: 'hero.saas',
  version: 1,
  category: 'hero',
  label: 'SaaS hero',
  icon: 'Rocket',
  defaultProps: {
    eyebrow: 'New — visual builder 2.0',
    heading: 'Ship websites faster',
    description: 'A visual builder for teams that care about quality. Draft, review, and publish in the same afternoon.',
    buttonLabel: 'Start free',
    buttonUrl: '/signup',
    secondaryLabel: 'Watch the tour',
    secondaryUrl: '#tour',
    textAlign: 'center',
    features: [
      { label: 'No credit card', icon: 'check-circle' },
      { label: 'Free custom subdomain', icon: 'globe' },
      { label: 'Cancel anytime', icon: 'shield' },
    ],
    logosTitle: 'Powering marketing sites at',
    logos: [{ label: 'Northwind' }, { label: 'Acme' }, { label: 'Lumen' }, { label: 'Vertex' }],
    image: '',
  },
  schema: schema(
    ...heroContentFields,
    ...mediaFields,
    repeater('features', 'Feature ticks', [text('label', 'Label'), icon('icon', 'Icon')], {
      itemLabel: 'Tick',
      itemDefaults: { label: 'New benefit', icon: 'check-circle' },
    }),
    text('logosTitle', 'Logos title'),
    repeater('logos', 'Logos', [text('label', 'Name'), image('image', 'Logo image')], {
      itemLabel: 'Logo',
      itemDefaults: { label: 'Brand' },
    }),
  ),
  component: (props) => {
    const ticks = items(props.features, [])
    const logos = items(props.logos, [])
    return (
      <SectionShell props={props} tone="surface" align="center">
        <div style={{ maxWidth: 820, marginInline: 'auto' }}>
          {str(props.eyebrow) ? (
            <span className="ud-badge" style={{ marginBottom: 18 }}>
              <Icon name="sparkles" size={14} />
              <EditableText edit={editOf(props)} path={['eyebrow']} value={str(props.eyebrow)} placeholder="Eyebrow" />
            </span>
          ) : null}
          <EditableText
            edit={editOf(props)}
            path={['heading']}
            value={str(props.heading, 'Ship websites faster')}
            as="h1"
            className="ud-h1"
            placeholder="Headline"
          />
          <SafeText
            value={str(props.description) || str(props.subheading)}
            className="ud-lead"
            edit={editOf(props)}
            path={['description']}
            placeholder="Supporting sentence"
          />
          <CtaGroup props={props} secondaryVariant="outline" />
          {ticks.length ? (
            <div className="ud-row" style={{ justifyContent: 'center', gap: 20, marginTop: 22 }}>
              {ticks.map((tick, index) => (
                <span key={index} className="ud-small" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <IconBadge name={str(tick.icon, 'check-circle')} shape="plain" size="sm" />
                  <EditableText
                    edit={editOf(props)}
                    path={['features', index, 'label']}
                    value={str(tick.label)}
                    placeholder="Benefit"
                  />
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <Body style={{ marginTop: 48 }}>
          <Media
            src={props.image}
            alt={str(props.imageAlt)}
            ratio="wide"
            style={{ boxShadow: '0 40px 80px -50px rgb(15 23 42 / 0.6)' }}
            edit={editOf(props)}
            path={['image']}
          />
        </Body>
        {logos.length ? (
          <div style={{ marginTop: 48 }}>
            {str(props.logosTitle) || editOf(props) ? (
              <EditableText
                edit={editOf(props)}
                path={['logosTitle']}
                value={str(props.logosTitle)}
                as="p"
                className="ud-small"
                style={{ textAlign: 'center', marginBottom: 20 }}
                placeholder="Logos title"
              />
            ) : null}
            <div className="ud-logos">
              {logos.map((logo, index) =>
                str(logo.image) ? (
                  <img key={index} src={str(logo.image)} alt={str(logo.label)} loading="lazy" />
                ) : (
                  <EditableText
                    key={index}
                    edit={editOf(props)}
                    path={['logos', index, 'label']}
                    value={str(logo.label, 'Brand')}
                    as="span"
                    className="ud-logo-text"
                    placeholder="Brand"
                  />
                ),
              )}
            </div>
          </div>
        ) : null}
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- hero.page */

export const heroPage = defineBlock({
  type: 'hero.page',
  version: 1,
  category: 'hero',
  label: 'Page title',
  icon: 'Type',
  defaultProps: {
    heading: 'About Page',
    breadcrumb: 'Home / About Page',
    textAlign: 'center',
    paddingTop: 72,
    paddingBottom: 56,
  },
  schema: schema(
    headingField,
    descriptionField,
    text('breadcrumb', 'Breadcrumb'),
    slider('headingSize', 'Heading size', 24, 80, 'typography', { unit: 'px' }),
  ),
  component: (props) => {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" align="center">
        <div style={{ maxWidth: 820, marginInline: 'auto', textAlign: 'center' }}>
          <EditableText
            edit={edit}
            path={['heading']}
            value={str(props.heading, 'Page title')}
            as="h1"
            className="ud-h1"
            placeholder="Page title"
          />
          <SafeText
            value={str(props.description) || str(props.subheading)}
            className="ud-lead"
            edit={edit}
            path={['description']}
            placeholder="A short introduction to this page"
          />
          {str(props.breadcrumb) || edit ? (
            <EditableText
              edit={edit}
              path={['breadcrumb']}
              value={str(props.breadcrumb)}
              as="p"
              className="ud-small"
              style={{ marginTop: 18, opacity: 0.78 }}
              placeholder="Home / This page"
            />
          ) : null}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------- hero.restaurant */

export const heroRestaurant = defineBlock({
  type: 'hero.restaurant',
  version: 1,
  category: 'hero',
  label: 'Restaurant hero',
  icon: 'UtensilsCrossed',
  defaultProps: {
    eyebrow: 'Harbour Street · est. 2009',
    heading: 'Seasonal plates, harbour views',
    description: 'Farm-to-table dining with a daily catch, an open kitchen, and a list built on small growers.',
    buttonLabel: 'Reserve a table',
    buttonUrl: '/reservations',
    secondaryLabel: "See tonight's menu",
    secondaryUrl: '/menu',
    backgroundType: 'image',
    overlayColor: '#120c08',
    overlayOpacity: 60,
    lightText: true,
    textAlign: 'center',
    minHeight: 620,
    hours: [
      { label: 'Lunch', value: 'Tue – Sun · 12:00 – 15:00' },
      { label: 'Dinner', value: 'Tue – Sat · 18:00 – 23:00' },
      { label: 'Reservations', value: '+1 (555) 018 2299' },
    ],
  },
  schema: schema(
    ...heroContentFields,
    slider('minHeight', 'Minimum height', 380, 900, 'layout', { unit: 'px' }),
    repeater('hours', 'Info bar', [text('label', 'Label'), text('value', 'Value')], {
      itemLabel: 'Row',
      itemDefaults: { label: 'Hours', value: 'Daily 12–22' },
    }),
  ),
  component: (props) => {
    const rows = items(props.hours, [])
    return (
      <SectionShell
        props={props}
        tone="dark"
        align="center"
        style={{ display: 'grid', alignContent: 'center', minHeight: num(props.minHeight, 620) }}
      >
        <div style={{ maxWidth: 820, marginInline: 'auto' }}>
          {str(props.eyebrow) ? (
            <EditableText
              edit={editOf(props)}
              path={['eyebrow']}
              value={str(props.eyebrow)}
              as="p"
              className="ud-eyebrow"
              style={{ letterSpacing: '0.24em' }}
              placeholder="Eyebrow"
            />
          ) : null}
          <EditableText
            edit={editOf(props)}
            path={['heading']}
            value={str(props.heading, 'Seasonal plates')}
            as="h1"
            className="ud-h1"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
            placeholder="Headline"
          />
          <SafeText
            value={str(props.description) || str(props.subheading)}
            className="ud-lead"
            edit={editOf(props)}
            path={['description']}
            placeholder="Supporting sentence"
          />
          <CtaGroup props={props} secondaryVariant="outline" />
        </div>
        {rows.length ? (
          <div
            className="ud-grid"
            style={{
              ...gridStyle(Math.min(rows.length, 3), 16),
              marginTop: 44,
              paddingTop: 28,
              borderTop: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            {rows.map((row, index) => (
              <div key={index}>
                <EditableText
                  edit={editOf(props)}
                  path={['hours', index, 'label']}
                  value={str(row.label)}
                  as="p"
                  className="ud-eyebrow"
                  style={{ margin: 0 }}
                  placeholder="Label"
                />
                <EditableText
                  edit={editOf(props)}
                  path={['hours', index, 'value']}
                  value={str(row.value)}
                  as="p"
                  style={{ margin: '6px 0 0' }}
                  placeholder="Value"
                />
              </div>
            ))}
          </div>
        ) : null}
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------ hero.business */

export const heroBusiness = defineBlock({
  type: 'hero.business',
  version: 1,
  category: 'hero',
  label: 'Business hero',
  icon: 'Briefcase',
  defaultProps: {
    eyebrow: 'Consulting',
    heading: 'Strategy that ships',
    description: 'We help teams launch clearer websites and sharper offers — then measure what changed.',
    buttonLabel: 'Book a call',
    buttonUrl: '/contact',
    secondaryLabel: 'Case studies',
    secondaryUrl: '/work',
    bullets: 'Positioning workshops\nMessaging and offer design\nWebsite build and launch',
    cardTitle: 'Free 30-minute audit',
    cardText: 'We review your current site and send three specific improvements.',
    cardIcon: 'target',
    reviewer: 'Amelia Chen',
    reviewerRole: 'Head of Growth, Northwind',
    review: 'They rebuilt our site in three weeks and demo requests doubled.',
  },
  schema: schema(
    ...heroContentFields,
    field('bullets', 'textarea', 'Bullets (one per line)', 'content'),
    text('cardTitle', 'Card title'),
    field('cardText', 'textarea', 'Card text', 'content'),
    icon('cardIcon', 'Card icon'),
    field('review', 'textarea', 'Review quote', 'content'),
    text('reviewer', 'Reviewer name'),
    text('reviewerRole', 'Reviewer role'),
    image('reviewerAvatar', 'Reviewer photo'),
  ),
  component: (props) => (
    <SectionShell props={props} tone="default">
      <div className="ud-split" style={{ '--ud-split': '1.08fr 0.92fr' } as CSSProperties}>
        <div>
          <HeroCopy props={props} />
          <div style={{ marginTop: 28 }}>
            <CheckList values={lines(props.bullets)} edit={editOf(props)} path={['bullets']} />
          </div>
        </div>
        <div className="ud-split__media ud-stack" style={{ '--ud-gap': '18px' } as CSSProperties}>
          <Card>
            <IconBadge name={str(props.cardIcon, 'target')} solid />
            <EditableText
              edit={editOf(props)}
              path={['cardTitle']}
              value={str(props.cardTitle, 'Free audit')}
              as="h4"
              className="ud-h4"
              style={{ marginTop: 16 }}
              placeholder="Card title"
            />
            <SafeText value={props.cardText} className="ud-text" edit={editOf(props)} path={['cardText']} placeholder="Card text" />
          </Card>
          {str(props.review) ? (
            <Card variant="outline" hover={false}>
              <Stars count={5} />
              <SafeText
                value={props.review}
                className="ud-quote"
                style={{ marginTop: 12, fontSize: '1.05rem' }}
                edit={editOf(props)}
                path={['review']}
                placeholder="Quote"
              />
              <div className="ud-row" style={{ marginTop: 16, gap: 12 }}>
                <Avatar src={props.reviewerAvatar} name={props.reviewer} edit={editOf(props)} path={['reviewerAvatar']} />
                <div>
                  <EditableText
                    edit={editOf(props)}
                    path={['reviewer']}
                    value={str(props.reviewer)}
                    as="div"
                    style={{ fontWeight: 600 }}
                    placeholder="Reviewer name"
                  />
                  <EditableText
                    edit={editOf(props)}
                    path={['reviewerRole']}
                    value={str(props.reviewerRole)}
                    as="div"
                    className="ud-small"
                    placeholder="Role"
                  />
                </div>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </SectionShell>
  ),
  settings: null,
})
