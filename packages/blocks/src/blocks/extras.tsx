import type { CSSProperties } from 'react'
import { EditableImage, EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Body,
  Button,
  CheckList,
  CtaGroup,
  Grid,
  Media,
  SafeText,
  SectionHead,
  SectionShell,
  arr,
  bool,
  cx,
  items,
  lines,
  num,
  str,
} from '../primitives'
import { ctaFields, field, headFields, icon, image, link, primaryCtaFields, repeater, schema, select, text, toggle } from '../schema'
import { defineBlock } from '../types'

function youtubeId(value: string): string | null {
  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'https:') return null
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id && /^[\w-]{6,}$/.test(id) ? id : null
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (url.pathname.startsWith('/embed/')) {
        const id = url.pathname.split('/')[2]
        return id && /^[\w-]{6,}$/.test(id) ? id : null
      }
      const id = url.searchParams.get('v')
      return id && /^[\w-]{6,}$/.test(id) ? id : null
    }
  } catch {
    return null
  }
  return null
}

function vimeoId(value: string): string | null {
  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'https:') return null
    const host = url.hostname.replace(/^www\./, '')
    if (host !== 'vimeo.com' && host !== 'player.vimeo.com') return null
    const id = url.pathname.split('/').filter((part) => /^\d+$/.test(part)).pop()
    return id || null
  } catch {
    return null
  }
}

function embedSrc(value: string): string | null {
  const yt = youtubeId(value)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt}`
  const vimeo = vimeoId(value)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo}`
  return null
}

/* ----------------------------------------------------------- content.video */

export const contentVideo = defineBlock({
  type: 'content.video',
  version: 1,
  category: 'content',
  label: 'Video feature',
  icon: 'Play',
  defaultProps: {
    eyebrow: 'Watch',
    heading: 'See a site come together in three minutes',
    description: 'A walkthrough of the builder: sections, theme, and publish — no account required to watch.',
    videoUrl: '',
    bullets: 'Drag sections onto the canvas\nEdit copy inline\nPublish to your own domain',
    buttonLabel: 'Start a site',
    buttonUrl: '/signup',
    reverse: false,
  },
  schema: schema(
    ...headFields,
    field('videoUrl', 'text', 'YouTube or Vimeo URL', 'content', { help: 'Paste a watch or share link. Only YouTube and Vimeo embeds are allowed.' }),
    image('poster', 'Poster image'),
    field('bullets', 'textarea', 'Bullets (one per line)', 'content'),
    select('layout', 'Layout', [['split', 'Copy + video'], ['featured', 'Full-width video']], 'layout'),
    toggle('reverse', 'Video on the left', 'layout'),
    ...ctaFields,
  ),
  component: (props) => {
    const edit = editOf(props)
    const src = embedSrc(str(props.videoUrl))
    const media = src ? (
      <div className="ud-video">
        <iframe
          src={src}
          title={str(props.heading, 'Video')}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    ) : (
      <div className="ud-video ud-video--poster">
        <Media src={props.poster} alt={str(props.heading)} ratio="wide" edit={edit} path={['poster']} />
        <span className="ud-video__play" aria-hidden="true">
          <Icon name="play" size={22} />
        </span>
      </div>
    )
    const featured = str(props.layout) === 'featured'
    return (
      <SectionShell props={props} tone="default">
        {featured ? (
          <div style={{ maxWidth: 1080, marginInline: 'auto' }}>
            {str(props.heading) || str(props.eyebrow) || str(props.description) || edit ? (
              <div style={{ marginBottom: 28 }}>
                <SectionHead props={props} defaultHeading="" />
              </div>
            ) : null}
            {media}
          </div>
        ) : (
          <div className={bool(props.reverse) ? 'ud-split ud-split--reverse' : 'ud-split'}>
            <div>
              <SectionHead props={props} defaultHeading="Watch" center={false} />
              <div style={{ marginTop: 22 }}>
                <CheckList values={lines(props.bullets)} edit={edit} path={['bullets']} />
              </div>
              <CtaGroup props={props} />
            </div>
            <div className="ud-split__media">{media}</div>
          </div>
        )}
      </SectionShell>
    )
  },
  settings: null,
})

const hoursRows = [
  { day: 'Tuesday – Friday', hours: '10:00 – 19:00' },
  { day: 'Saturday', hours: '09:00 – 17:00' },
  { day: 'Sunday – Monday', hours: 'Closed' },
]

/* ----------------------------------------------------------- content.hours */

export const contentHours = defineBlock({
  type: 'content.hours',
  version: 1,
  category: 'content',
  label: 'Hours & location',
  icon: 'Clock',
  defaultProps: {
    eyebrow: 'Visit',
    heading: 'Hours & the door',
    description: 'Walk-ins after three. Booked chairs the rest of the day.',
    address: '412 Oak Avenue',
    phone: '+1 (555) 019 4410',
    note: 'Last seating 45 minutes before close.',
    buttonLabel: 'Get directions',
    buttonUrl: '#',
    secondaryLabel: 'Book a time',
    secondaryUrl: '/contact',
    items: hoursRows,
  },
  schema: schema(
    ...headFields,
    text('address', 'Address'),
    text('phone', 'Phone'),
    field('note', 'text', 'Note', 'content'),
    image('image', 'Map or storefront photo'),
    repeater('items', 'Hours', [text('day', 'Day'), text('hours', 'Hours')], {
      itemLabel: 'Row',
      itemDefaults: { day: 'Monday', hours: '09:00 – 17:00' },
    }),
    ...ctaFields,
  ),
  component: (props) => {
    const edit = editOf(props)
    const rows = items(props.items, hoursRows)
    return (
      <SectionShell props={props} tone="surface">
        <div className="ud-split">
          <div>
            <SectionHead props={props} defaultHeading="Hours" center={false} />
            <div className="ud-hours" style={{ marginTop: 28 }}>
              {rows.map((row, index) => (
                <div key={index} className="ud-hours__row">
                  <EditableText
                    edit={edit}
                    path={['items', index, 'day']}
                    value={str(row.day)}
                    as="span"
                    placeholder="Day"
                  />
                  <EditableText
                    edit={edit}
                    path={['items', index, 'hours']}
                    value={str(row.hours)}
                    as="span"
                    placeholder="09:00 – 17:00"
                  />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 22 }} className="ud-stack">
              <p className="ud-row" style={{ gap: 10, margin: 0 }}>
                <Icon name="map-pin" size={16} />
                <EditableText edit={edit} path={['address']} value={str(props.address)} placeholder="Address" />
              </p>
              <p className="ud-row" style={{ gap: 10, margin: 0 }}>
                <Icon name="phone" size={16} />
                <EditableText edit={edit} path={['phone']} value={str(props.phone)} placeholder="Phone" />
              </p>
              {str(props.note) || edit ? (
                <p className="ud-small" style={{ margin: 0 }}>
                  <EditableText edit={edit} path={['note']} value={str(props.note)} placeholder="Note" />
                </p>
              ) : null}
            </div>
            <CtaGroup props={props} />
          </div>
          <div className="ud-split__media">
            <Media src={props.image} alt={str(props.address, 'Location')} ratio="landscape" edit={edit} path={['image']} />
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

const articles = [
  {
    title: 'What we changed after 100 published sites',
    excerpt: 'The blocks people actually keep, and the ones we quietly retired.',
    date: 'Mar 12, 2026',
    tag: 'Product',
    url: '/journal/100-sites',
  },
  {
    title: 'A restaurant homepage that still books tables',
    excerpt: 'Harbour Table’s seasonal menu, hours, and reservation form — no plugin soup.',
    date: 'Feb 28, 2026',
    tag: 'Stories',
    url: '/journal/harbour-table',
  },
  {
    title: 'Fonts, sizes, and why templates should ship a theme',
    excerpt: 'A barbershop and a bookkeeper should not inherit the same Inter-on-blue defaults.',
    date: 'Feb 4, 2026',
    tag: 'Design',
    url: '/journal/template-themes',
  },
]

/* ------------------------------------------------------------- posts.cards */

export const postsCards = defineBlock({
  type: 'posts.cards',
  version: 1,
  category: 'blog',
  label: 'Blog cards',
  icon: 'Book',
  defaultProps: {
    eyebrow: 'Journal',
    heading: 'Notes from the studio',
    description: 'Short pieces on launching, editing, and keeping a site honest.',
    buttonLabel: 'All articles',
    buttonUrl: '/journal',
    useSitePosts: false,
    items: articles,
  },
  schema: schema(
    ...headFields,
    field('useSitePosts', 'toggle', 'Show this site’s blog posts', 'content', {
      help: 'Fill these cards from published posts assigned to this website. Turn this off to write articles by hand.',
    }),
    repeater(
      'items',
      'Articles',
      [
        text('title', 'Title'),
        field('excerpt', 'textarea', 'Excerpt', 'content'),
        text('date', 'Date'),
        text('tag', 'Tag'),
        image('image', 'Image'),
        link('url', 'Link'),
      ],
      {
        itemLabel: 'Article',
        itemDefaults: { title: 'New article', excerpt: 'A short summary.', date: '', tag: 'Notes' },
        when: { key: 'useSitePosts', not: true },
      },
    ),
    ...ctaFields,
  ),
  component: (props) => {
    const edit = editOf(props)
    const live = bool(props.useSitePosts)
    const rows = live ? arr(props.items) : items(props.items, articles)
    const itemEdit = live ? undefined : edit
    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} defaultHeading="Journal" />
        <Body>
          {live && !rows.length ? (
            <p className="ud-text" style={{ margin: 0 }}>
              Publish a blog post assigned to this website to show it here.
            </p>
          ) : null}
          {rows.length ? (
          <Grid cols={Math.min(rows.length, 3)} gap={24}>
            {rows.map((post, index) => {
              const href = str(post.url, '#')
              const inner = (
                <>
                  <Media
                    src={post.image}
                    alt={str(post.title)}
                    ratio="wide"
                    zoom
                    edit={itemEdit}
                    path={['items', index, 'image']}
                    style={{ marginBottom: 16 }}
                  />
                  <p className="ud-small" style={{ margin: 0, display: 'flex', gap: 10 }}>
                    <EditableText edit={itemEdit} path={['items', index, 'tag']} value={str(post.tag)} placeholder="Tag" />
                    <span aria-hidden="true">·</span>
                    <EditableText edit={itemEdit} path={['items', index, 'date']} value={str(post.date)} placeholder="Date" />
                  </p>
                  <EditableText
                    edit={itemEdit}
                    path={['items', index, 'title']}
                    value={str(post.title)}
                    as="h3"
                    className="ud-h4"
                    style={{ marginTop: 10 }}
                    placeholder="Title"
                  />
                  <SafeText
                    value={post.excerpt}
                    className="ud-text"
                    edit={itemEdit}
                    path={['items', index, 'excerpt']}
                    placeholder="Excerpt"
                  />
                </>
              )
              return edit ? (
                <article key={index}>{inner}</article>
              ) : (
                <a key={index} href={href} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {inner}
                </a>
              )
            })}
          </Grid>
          ) : null}
        </Body>
        <CtaGroup props={props} primaryVariant="link" />
      </SectionShell>
    )
  },
  settings: null,
})

/* -------------------------------------------------------------- cta.banner */

export const ctaBanner = defineBlock({
  type: 'cta.banner',
  version: 1,
  category: 'cta',
  label: 'Announcement bar',
  icon: 'Megaphone',
  defaultProps: {
    heading: 'Spring hours start Monday — book the Saturday chairs now.',
    buttonLabel: 'Reserve',
    buttonUrl: '/contact',
    tone: 'primary',
    paddingTop: 14,
    paddingBottom: 14,
    showIcon: true,
  },
  schema: schema(
    text('heading', 'Message'),
    ...primaryCtaFields,
    toggle('showIcon', 'Show icon', 'design'),
    icon('iconName', 'Icon'),
  ),
  component: (props) => {
    const edit = editOf(props)
    const label = str(props.buttonLabel)
    return (
      <SectionShell props={props} tone="primary">
        <div className="ud-banner">
          {bool(props.showIcon, true) ? <Icon name={str(props.iconName, 'sparkles')} size={18} /> : null}
          <EditableText
            edit={edit}
            path={['heading']}
            value={str(props.heading, 'Announcement')}
            as="p"
            style={{ margin: 0, fontWeight: 600, flex: 1 }}
            placeholder="Announcement"
          />
          {label || edit ? (
            <Button href={str(props.buttonUrl, '#')} variant="light" style={{ padding: '8px 14px' } as CSSProperties}>
              <EditableText edit={edit} path={['buttonLabel']} value={label || 'Learn more'} placeholder="Button" />
            </Button>
          ) : null}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------- gallery.compare */

export const galleryCompare = defineBlock({
  type: 'gallery.compare',
  version: 1,
  category: 'gallery',
  label: 'Before & after',
  icon: 'Columns2',
  defaultProps: {
    eyebrow: 'Before / after',
    heading: 'The same room, two seasons later',
    description: 'A visual proof point — pair a tired page with the one you shipped.',
    beforeLabel: 'Before',
    afterLabel: 'After',
    textAlign: 'center',
  },
  schema: schema(
    ...headFields,
    image('beforeImage', 'Before image'),
    text('beforeLabel', 'Before label'),
    image('afterImage', 'After image'),
    text('afterLabel', 'After label'),
  ),
  component: (props) => {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} defaultHeading="Before and after" />
        <Body>
          <div className="ud-ba">
            <figure className="ud-ba__pane">
              <Media
                src={props.beforeImage}
                alt={str(props.beforeLabel, 'Before')}
                ratio="wide"
                edit={edit}
                path={['beforeImage']}
              />
              <figcaption>
                <EditableText edit={edit} path={['beforeLabel']} value={str(props.beforeLabel, 'Before')} placeholder="Before" />
              </figcaption>
            </figure>
            <figure className="ud-ba__pane">
              <Media
                src={props.afterImage}
                alt={str(props.afterLabel, 'After')}
                ratio="wide"
                edit={edit}
                path={['afterImage']}
              />
              <figcaption>
                <EditableText edit={edit} path={['afterLabel']} value={str(props.afterLabel, 'After')} placeholder="After" />
              </figcaption>
            </figure>
          </div>
        </Body>
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------------- proof.bar */

export const proofBar = defineBlock({
  type: 'proof.bar',
  version: 1,
  category: 'features',
  label: 'Trust bar',
  icon: 'Building2',
  defaultProps: {
    heading: 'Our brands also used by',
    tone: 'default',
    paddingTop: 28,
    paddingBottom: 28,
    logos: [{ label: 'Stripe' }, { label: 'Notion' }, { label: 'Linear' }, { label: 'Figma' }],
    items: [
      { value: '600K+', label: 'Active daily users' },
      { value: '4.8', label: 'Rating on store' },
    ],
  },
  schema: schema(
    text('heading', 'Caption'),
    repeater('logos', 'Logos', [text('label', 'Name'), image('image', 'Logo image')], {
      itemLabel: 'Logo',
      itemDefaults: { label: 'Brand' },
    }),
    repeater('items', 'Stats', [text('value', 'Value'), text('label', 'Label')], {
      itemLabel: 'Stat',
      itemDefaults: { value: '100+', label: 'Metric' },
    }),
  ),
  component: (props) => {
    const edit = editOf(props)
    const logos = items(props.logos, [{ label: 'Brand' }])
    const stats = items(props.items, [])
    return (
      <SectionShell props={props} tone="default">
        <div className="ud-proof">
          <div>
            {str(props.heading) || edit ? (
              <EditableText
                edit={edit}
                path={['heading']}
                value={str(props.heading)}
                as="p"
                className="ud-small"
                style={{ marginBottom: 18 }}
                placeholder="Caption"
              />
            ) : null}
            <div className="ud-logos" style={{ justifyContent: 'flex-start' }}>
              {logos.map((logo, index) =>
                str(logo.image) ? (
                  <span key={index} style={{ position: 'relative', display: 'inline-flex' }}>
                    <img src={str(logo.image)} alt={str(logo.label)} loading="lazy" />
                    <EditableImage edit={edit} path={['logos', index, 'image']} current={str(logo.image)} label="Replace logo" />
                  </span>
                ) : (
                  <EditableText
                    key={index}
                    edit={edit}
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
          <div className="ud-proof__stats">
            {stats.map((item, index) => (
              <div key={index}>
                <EditableText
                  edit={edit}
                  path={['items', index, 'value']}
                  value={str(item.value)}
                  as="div"
                  className="ud-stat"
                  style={{ fontSize: 'clamp(1.7rem, 2.4cqi + .6rem, 2.4rem)' }}
                  placeholder="600K+"
                />
                <EditableText
                  edit={edit}
                  path={['items', index, 'label']}
                  value={str(item.label)}
                  as="p"
                  className="ud-small"
                  style={{ marginTop: 6 }}
                  placeholder="Label"
                />
              </div>
            ))}
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ----------------------------------------------------------- content.skills */

export const contentSkills = defineBlock({
  type: 'content.skills',
  version: 1,
  category: 'content',
  label: 'Skills with image',
  icon: 'Chart',
  defaultProps: {
    eyebrow: 'What we do well',
    heading: 'Build marketing sites without the usual compromise',
    description: 'Research, product sense, and visual craft — measured the way clients actually feel it.',
    imageRatio: 'portrait',
    reverse: false,
    items: [
      { label: 'UX research and testing', percent: 95 },
      { label: 'Product management', percent: 84 },
      { label: 'UI and visual design', percent: 90 },
    ],
  },
  schema: schema(
    ...headFields,
    repeater(
      'items',
      'Skill bars',
      [text('label', 'Skill'), field('percent', 'slider', 'Percent', 'content', { min: 0, max: 100, unit: '%' })],
      { itemLabel: 'Skill', itemDefaults: { label: 'New skill', percent: 80 } },
    ),
    image('image', 'Image'),
    text('imageAlt', 'Image alt text'),
    select('imageRatio', 'Image ratio', [['landscape', '4:3'], ['wide', '16:9'], ['square', '1:1'], ['portrait', '3:4']], 'design'),
    toggle('reverse', 'Image on the right', 'layout'),
  ),
  component: (props) => {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default">
        <div className={cx('ud-split', bool(props.reverse) && 'ud-split--reverse')}>
          <div className="ud-split__media">
            <Media
              src={props.image}
              alt={str(props.imageAlt)}
              ratio={str(props.imageRatio, 'portrait')}
              edit={edit}
              path={['image']}
            />
          </div>
          <div>
            <SectionHead props={props} defaultHeading="Skills" center={false} />
            <div className="ud-skills" style={{ marginTop: 28 }}>
              {rows.map((item, index) => {
                const percent = Math.min(Math.max(num(item.percent, 80), 0), 100)
                return (
                  <div key={index} className="ud-skill">
                    <div className="ud-skill__row">
                      <EditableText
                        edit={edit}
                        path={['items', index, 'label']}
                        value={str(item.label, 'Skill')}
                        as="span"
                        placeholder="Skill"
                      />
                      <span>{percent}%</span>
                    </div>
                    <div className="ud-skill__track" aria-hidden="true">
                      <div className="ud-skill__fill" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* -------------------------------------------------------------- content.map */

export const contentMap = defineBlock({
  type: 'content.map',
  version: 1,
  category: 'content',
  label: 'Map placeholder',
  icon: 'Globe',
  defaultProps: {
    heading: '',
    description: '',
    height: 280,
    mapUrl: '',
  },
  schema: schema(
    ...headFields,
    field('mapUrl', 'text', 'Embed URL', 'content', { help: 'Paste a Google Maps embed URL, or leave blank for a placeholder.' }),
    field('height', 'slider', 'Height', 'layout', { min: 160, max: 520, unit: 'px' }),
  ),
  component: (props) => {
    const height = num(props.height, 280)
    const embed = str(props.mapUrl)
    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} />
        <div className="ud-map" style={{ minHeight: height }}>
          {embed ? (
            <iframe title="Map" src={embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          ) : (
            <span className="ud-small">Map</span>
          )}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* -------------------------------------------------------- content.locations */

export const contentLocations = defineBlock({
  type: 'content.locations',
  version: 1,
  category: 'content',
  label: 'Office locations',
  icon: 'MapPin',
  defaultProps: {
    heading: '',
    description: '',
    tone: 'surface',
    items: [
      {
        name: 'Head office',
        address: '120 Market Street, Suite 4, Austin, TX 78701',
        email: 'studio@brightline.example',
        phone: '+1 (555) 014 2200',
      },
      {
        name: 'West studio',
        address: '88 Folsom Street, Floor 6, San Francisco, CA 94105',
        email: 'west@brightline.example',
        phone: '+1 (555) 014 2288',
      },
    ],
  },
  schema: schema(
    ...headFields,
    repeater(
      'items',
      'Offices',
      [text('name', 'Name'), field('address', 'textarea', 'Address', 'content'), text('email', 'Email'), text('phone', 'Phone')],
      { itemLabel: 'Office', itemDefaults: { name: 'Office', address: 'Address', email: '', phone: '' } },
    ),
  ),
  component: (props) => {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="surface">
        <SectionHead props={props} />
        <div className="ud-locations">
          {rows.map((item, index) => (
            <div key={index} className="ud-location">
              <EditableText
                edit={edit}
                path={['items', index, 'name']}
                value={str(item.name, 'Office')}
                as="h3"
                className="ud-h4"
                placeholder="Office name"
              />
              <SafeText
                value={item.address}
                className="ud-text"
                edit={edit}
                path={['items', index, 'address']}
                placeholder="Address"
              />
              <div className="ud-location__meta">
                {str(item.email) || edit ? (
                  <a href={`mailto:${str(item.email)}`} className="ud-btn ud-btn--link">
                    <EditableText edit={edit} path={['items', index, 'email']} value={str(item.email)} placeholder="email@studio.com" />
                  </a>
                ) : null}
                {str(item.phone) || edit ? (
                  <EditableText
                    edit={edit}
                    path={['items', index, 'phone']}
                    value={str(item.phone)}
                    as="p"
                    className="ud-text"
                    placeholder="Phone"
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})
