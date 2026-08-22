import type { CSSProperties } from 'react'
import { EditableText, editOf } from '../editable'
import {
  Body,
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
  bool,
  cx,
  items,
  lines,
  num,
  str,
  type Props,
} from '../primitives'
import { ctaFields, columnsField, field, gapField, headFields, icon, image, link, repeater, schema, select, text, toggle } from '../schema'
import { defineBlock } from '../types'

const featureItems = [
  { title: 'Crafted sections', text: 'Every block is designed to look finished on day one.', icon: 'sparkles' },
  { title: 'Theme tokens', text: 'Colors, type, and radii stay consistent across every page.', icon: 'palette' },
  { title: 'Fast publishing', text: 'Save drafts, preview privately, then go live with one click.', icon: 'rocket' },
  { title: 'Built-in SEO', text: 'Titles, descriptions, sitemaps, and social cards handled for you.', icon: 'search' },
  { title: 'Forms that work', text: 'Collect leads with spam protection and email notifications.', icon: 'mail' },
  { title: 'Responsive by default', text: 'Layouts adapt to desktop, tablet, and mobile automatically.', icon: 'cpu' },
]

const featureFields = repeater(
  'items',
  'Features',
  [
    text('title', 'Title'),
    field('text', 'textarea', 'Description', 'content'),
    icon('icon', 'Icon'),
    image('image', 'Preview image'),
    link('url', 'Link'),
    text('linkLabel', 'Link label'),
  ],
  { itemLabel: 'Feature', itemDefaults: { title: 'New feature', text: 'Describe the benefit.', icon: 'sparkles' } },
)

const cardStyleField = select('cardStyle', 'Card style', [['solid', 'Solid'], ['outline', 'Outline'], ['flat', 'Borderless']], 'design')
const iconStyleField = select('iconStyle', 'Icon style', [['tint', 'Tinted'], ['solid', 'Solid'], ['plain', 'Plain'], ['none', 'Hidden']], 'design')

function FeatureItem({
  item,
  props,
  layout,
  index,
  collection = 'items',
}: {
  item: Props
  props: Props
  layout: 'card' | 'row' | 'plain'
  index: number
  collection?: string
}) {
  const edit = editOf(props)
  const textKey = typeof item.text === 'string' || item.description === undefined ? 'text' : 'description'
  const iconStyle = str(props.iconStyle, 'tint')
  const showIcon = iconStyle !== 'none'
  const badge = showIcon ? (
    <IconBadge
      name={str(item.icon, 'sparkles')}
      solid={iconStyle === 'solid'}
      shape={iconStyle === 'plain' ? 'plain' : bool(props.roundIcons, false) ? 'round' : 'rounded'}
      size={layout === 'row' ? 'md' : str(props.iconSize, 'md') === 'lg' ? 'lg' : 'md'}
    />
  ) : null
  const url = str(item.url)
  const body = (
    <>
      <EditableText
        edit={edit}
        path={[collection, index, 'title']}
        value={str(item.title, 'Feature')}
        as="h4"
        className="ud-h4"
        placeholder="Title"
      />
      <SafeText
        value={item.text || item.description}
        className="ud-text"
        edit={edit}
        path={[collection, index, textKey]}
        placeholder="Describe the benefit"
      />
      {url ? (
        <a className="ud-btn ud-btn--link" href={url} style={{ marginTop: 14 }}>
          <EditableText
            edit={edit}
            path={[collection, index, 'linkLabel']}
            value={str(item.linkLabel, 'Learn more')}
            placeholder="Link label"
          />{' '}
          →
        </a>
      ) : null}
      {str(item.image) ? (
        <div style={{ marginTop: 18 }}>
          <Media
            src={item.image}
            alt={str(item.title)}
            ratio="wide"
            edit={edit}
            path={[collection, index, 'image']}
          />
        </div>
      ) : null}
    </>
  )

  if (layout === 'row') {
    return (
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {badge}
        <div>{body}</div>
      </div>
    )
  }

  const variant = str(props.cardStyle, 'solid') as 'solid' | 'outline' | 'flat'
  return (
    <Card variant={layout === 'plain' ? 'flat' : variant} hover={layout !== 'plain'}>
      {badge ? <div style={{ marginBottom: 16 }}>{badge}</div> : null}
      {body}
    </Card>
  )
}

/* ----------------------------------------------------------- features.cards */

export const featuresCards = defineBlock({
  type: 'features.cards',
  version: 1,
  category: 'features',
  label: 'Feature cards',
  icon: 'LayoutGrid',
  defaultProps: {
    eyebrow: 'Why teams choose us',
    heading: 'Everything you need to launch',
    description: 'A complete toolkit for marketing sites — no plugins, no surprises.',
    textAlign: 'center',
    columns: 3,
    cardStyle: 'solid',
    iconStyle: 'tint',
    items: featureItems.slice(0, 3),
  },
  schema: schema(...headFields, featureFields, columnsField(1, 4), gapField, cardStyleField, iconStyleField, toggle('roundIcons', 'Round icons', 'design')),
  component: (props) => (
    <SectionShell props={props} tone="default">
      <SectionHead props={props} defaultHeading="Features" />
      <Grid cols={num(props.columns, 3)} gap={num(props.gap, 24)}>
        {items(props.items, featureItems.slice(0, 3)).map((item, index) => (
          <FeatureItem key={index} item={item} props={props} layout="card" index={index} />
        ))}
      </Grid>
    </SectionShell>
  ),
  settings: null,
})

/* ----------------------------------------------------------- features.icons */

export const featuresIcons = defineBlock({
  type: 'features.icons',
  version: 1,
  category: 'features',
  label: 'Feature icons',
  icon: 'Shapes',
  defaultProps: {
    eyebrow: 'Built in',
    heading: 'Building blocks for every page',
    description: 'Mix and match sections to assemble any layout your brand needs.',
    textAlign: 'center',
    columns: 3,
    iconStyle: 'solid',
    roundIcons: true,
    items: featureItems,
  },
  schema: schema(...headFields, featureFields, columnsField(2, 4), gapField, iconStyleField, toggle('roundIcons', 'Round icons', 'design')),
  component: (props) => (
    <SectionShell props={props} tone="surface">
      <SectionHead props={props} defaultHeading="Features" />
      <Grid cols={num(props.columns, 3)} gap={num(props.gap, 32)}>
        {items(props.items, featureItems).map((item, index) => (
          <FeatureItem key={index} item={item} props={props} layout="row" index={index} />
        ))}
      </Grid>
    </SectionShell>
  ),
  settings: null,
})

/* ------------------------------------------------------------ features.grid */

export const featuresGrid = defineBlock({
  type: 'features.grid',
  version: 1,
  category: 'features',
  label: 'Feature grid',
  icon: 'Grid3x3',
  defaultProps: {
    eyebrow: 'Capabilities',
    heading: 'A platform, not a template',
    description: 'Every capability is available on every plan.',
    columns: 2,
    dividers: true,
    iconStyle: 'plain',
    items: featureItems,
  },
  schema: schema(...headFields, featureFields, columnsField(2, 4), gapField, iconStyleField, toggle('dividers', 'Show dividers', 'design')),
  component: (props) => {
    const list = items(props.items, featureItems)
    const dividers = bool(props.dividers, true)
    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} defaultHeading="Capabilities" />
        <Grid cols={num(props.columns, 2)} gap={num(props.gap, 0)} style={dividers ? { gap: 0 } : undefined}>
          {list.map((item, index) => (
            <div
              key={index}
              style={
                dividers
                  ? {
                      padding: '26px 28px',
                      borderTop: '1px solid color-mix(in srgb, var(--ud-fg) 10%, transparent)',
                      borderLeft: index % num(props.columns, 2) === 0 ? undefined : '1px solid color-mix(in srgb, var(--ud-fg) 10%, transparent)',
                    }
                  : undefined
              }
            >
              <FeatureItem item={item} props={props} layout="plain" index={index} />
            </div>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* -------------------------------------------------------- features.showcase */

export const featuresShowcase = defineBlock({
  type: 'features.showcase',
  version: 1,
  category: 'features',
  label: 'Feature showcase',
  icon: 'Star',
  defaultProps: {
    eyebrow: 'A closer look',
    heading: 'One flagship capability, explained',
    description: 'Highlight what makes the product different, with proof beside the claim.',
    bullets: 'Drag-and-drop sections with live preview\nTheme tokens applied everywhere\nPublish to a custom domain in minutes',
    buttonLabel: 'See how it works',
    buttonUrl: '/features',
    imageRatio: 'landscape',
    reverse: false,
    stat: '38%',
    statLabel: 'faster time to launch',
  },
  schema: schema(
    ...headFields,
    field('bullets', 'textarea', 'Bullets (one per line)', 'content'),
    repeater(
      'items',
      'Accordion rows',
      [text('title', 'Title'), field('text', 'textarea', 'Body', 'content')],
      { itemLabel: 'Row', itemDefaults: { title: 'New capability', text: 'A short explanation.' } },
    ),
    ...ctaFields,
    image('image', 'Image'),
    text('imageAlt', 'Image alt text'),
    select('imageRatio', 'Image ratio', [['landscape', '4:3'], ['wide', '16:9'], ['square', '1:1'], ['portrait', '3:4']], 'design'),
    toggle('reverse', 'Image on the left', 'layout'),
    text('stat', 'Stat value'),
    text('statLabel', 'Stat label'),
  ),
  component: (props) => {
    const edit = editOf(props)
    const accordion = items(props.items, [])
    return (
    <SectionShell props={props} tone="default">
      <div className={cx('ud-split', bool(props.reverse) && 'ud-split--reverse')}>
        <div>
          <SectionHead props={props} defaultHeading="Showcase" center={false} />
          {accordion.length ? (
            <div className="ud-accordion" style={{ marginTop: 26 }}>
              {accordion.map((item, index) => (
                <details key={index} className="ud-accordion__item" open={index === 0}>
                  <summary
                    onClick={(event) => {
                      if (edit && (event.target as HTMLElement).closest('.ud-editable')) event.preventDefault()
                    }}
                  >
                    <EditableText
                      edit={edit}
                      path={['items', index, 'title']}
                      value={str(item.title, 'Capability')}
                      as="span"
                      placeholder="Title"
                    />
                  </summary>
                  <SafeText
                    value={item.text}
                    className="ud-accordion__body"
                    edit={edit}
                    path={['items', index, 'text']}
                    placeholder="Explanation"
                  />
                </details>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: 26 }}>
              <CheckList values={lines(props.bullets)} edit={edit} path={['bullets']} />
            </div>
          )}
          <CtaGroup props={props} />
        </div>
        <div className="ud-split__media" style={{ position: 'relative' }}>
          <Media
            src={props.image}
            alt={str(props.imageAlt)}
            ratio={str(props.imageRatio, 'landscape')}
            zoom
            edit={editOf(props)}
            path={['image']}
          />
          {str(props.stat) ? (
            <Card
              hover={false}
              style={
                {
                  position: 'absolute',
                  bottom: 18,
                  left: 18,
                  maxWidth: 220,
                  background: 'var(--color-background, #fff)',
                  boxShadow: '0 24px 50px -30px rgb(15 23 42 / 0.5)',
                } as CSSProperties
              }
            >
              <EditableText
                edit={editOf(props)}
                path={['stat']}
                value={str(props.stat)}
                as="div"
                className="ud-h2"
                style={{ fontSize: '2rem' }}
                placeholder="38%"
              />
              <EditableText
                edit={editOf(props)}
                path={['statLabel']}
                value={str(props.statLabel)}
                as="p"
                className="ud-small"
                style={{ marginTop: 4 }}
                placeholder="Stat label"
              />
            </Card>
          ) : null}
        </div>
      </div>
    </SectionShell>
    )
  },
  settings: null,
})
