import { EditableText, editOf } from '../editable'
import {
  Body,
  Card,
  CheckList,
  CtaGroup,
  Grid,
  IconBadge,
  ItemText,
  ItemTitle,
  Media,
  SectionHead,
  SectionShell,
  bool,
  items,
  lines,
  num,
  str,
} from '../primitives'
import { columnsField, ctaFields, field, gapField, headFields, icon, image, link, repeater, schema, select, text, toggle, withoutFields } from '../schema'
import { defineBlock } from '../types'

const serviceItems = [
  {
    title: 'Consulting',
    text: 'Positioning, information architecture, and a launch plan you can actually follow.',
    icon: 'target',
    price: 'from $2,400',
    features: 'Discovery workshop\nCompetitor teardown\nMessaging map',
  },
  {
    title: 'Design systems',
    text: 'Tokens, components, and documentation so every page stays on brand.',
    icon: 'palette',
    price: 'from $4,800',
    features: 'Token library\nComponent kit\nUsage guidelines',
  },
  {
    title: 'Build & launch',
    text: 'Production websites wired to your forms and analytics.',
    icon: 'rocket',
    price: 'from $6,200',
    features: 'Page build\nForms and automations\nGo-live support',
  },
]

const serviceFields = [
  text('title', 'Title'),
  field('text', 'textarea', 'Description', 'content'),
  icon('icon', 'Icon'),
  image('image', 'Image'),
  text('price', 'Price'),
  field('features', 'textarea', 'Included (one per line)', 'content'),
  link('url', 'Link'),
  text('linkLabel', 'Link label'),
]

const serviceItemOptions = {
  itemLabel: 'Service',
  itemDefaults: { title: 'New service', text: 'What the client gets.', icon: 'briefcase' },
}

const serviceRepeater = repeater('items', 'Services', serviceFields, serviceItemOptions)

/** The grid shows an icon, title and description only. */
const serviceGridRepeater = repeater('items', 'Services', withoutFields(serviceFields, 'image', 'price', 'features'), serviceItemOptions)

/** The list shows a title, description and price only. */
const serviceListRepeater = repeater(
  'items',
  'Services',
  withoutFields(serviceFields, 'image', 'features', 'url', 'linkLabel'),
  serviceItemOptions,
)

/* ----------------------------------------------------------- services.cards */

export const servicesCards = defineBlock({
  type: 'services.cards',
  version: 1,
  category: 'services',
  label: 'Service cards',
  icon: 'Briefcase',
  defaultProps: {
    eyebrow: 'Services',
    heading: 'How we can help',
    description: 'Three ways to work together, from a short engagement to a full build.',
    textAlign: 'center',
    columns: 3,
    showPrice: true,
    showFeatures: true,
    items: serviceItems,
  },
  schema: schema(
    ...headFields,
    serviceRepeater,
    columnsField(1, 4),
    gapField,
    toggle('showPrice', 'Show price', 'design'),
    toggle('showFeatures', 'Show included list', 'design'),
    select('mediaStyle', 'Media', [['icon', 'Icon'], ['image', 'Image'], ['none', 'None']], 'design'),
  ),
  component: (props) => {
    const mediaStyle = str(props.mediaStyle, 'icon')
    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} defaultHeading="Services" />
        <Grid cols={num(props.columns, 3)} gap={num(props.gap, 24)}>
          {items(props.items, serviceItems).map((item, index) => (
            <Card key={index} style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
              {mediaStyle === 'image' ? (
                <Media src={item.image} alt={str(item.title)} ratio="wide" edit={editOf(props)} path={['items', index, 'image']} />
              ) : mediaStyle === 'icon' ? (
                <IconBadge name={str(item.icon, 'briefcase')} solid />
              ) : null}
              <div>
                <ItemTitle props={props} item={item} index={index} />
                {bool(props.showPrice, true) && str(item.price) ? (
                  <EditableText
                    edit={editOf(props)}
                    path={['items', index, 'price']}
                    value={str(item.price)}
                    as="p"
                    className="ud-eyebrow"
                    style={{ margin: '8px 0 0' }}
                    placeholder="From $2,000"
                  />
                ) : null}
                <ItemText props={props} item={item} index={index} />
              </div>
              {bool(props.showFeatures, true) ? (
                <CheckList values={lines(item.features)} edit={editOf(props)} path={['items', index, 'features']} />
              ) : null}
              {str(item.url) ? (
                <a className="ud-btn ud-btn--link" href={str(item.url)} style={{ marginTop: 'auto' }}>
                  <EditableText
                    edit={editOf(props)}
                    path={['items', index, 'linkLabel']}
                    value={str(item.linkLabel, 'Learn more')}
                    placeholder="Link label"
                  />{' '}
                  →
                </a>
              ) : null}
            </Card>
          ))}
        </Grid>
        <CtaGroup props={props} />
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------ services.grid */

export const servicesGrid = defineBlock({
  type: 'services.grid',
  version: 1,
  category: 'services',
  label: 'Service grid',
  icon: 'LayoutDashboard',
  defaultProps: {
    eyebrow: 'What we do',
    heading: 'A studio built for launches',
    description: 'Pick the pieces you need — we plug into your team.',
    columns: 3,
    items: [
      ...serviceItems,
      { title: 'Content', text: 'Copy, photography direction, and asset production.', icon: 'pen' },
      { title: 'SEO', text: 'Technical checks, metadata, and content structure.', icon: 'search' },
      { title: 'Care plans', text: 'Ongoing edits, monitoring, and monthly reporting.', icon: 'shield' },
    ],
  },
  schema: schema(...headFields, serviceGridRepeater, columnsField(2, 4), gapField, toggle('hoverLift', 'Lift cards on hover', 'design')),
  component: (props) => (
    <SectionShell props={props} tone="surface">
      <SectionHead props={props} defaultHeading="Services" />
      <Grid cols={num(props.columns, 3)} gap={num(props.gap, 20)}>
        {items(props.items, serviceItems).map((item, index) => (
          <Card key={index} hover={bool(props.hoverLift, true)}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <IconBadge name={str(item.icon, 'briefcase')} size="sm" />
              <div>
                <ItemTitle props={props} item={item} index={index} />
                <ItemText props={props} item={item} index={index} />
                {str(item.url) ? (
                  <a className="ud-btn ud-btn--link" href={str(item.url)} style={{ marginTop: 12 }}>
                    <EditableText
                      edit={editOf(props)}
                      path={['items', index, 'linkLabel']}
                      value={str(item.linkLabel, 'Details')}
                      placeholder="Link label"
                    />{' '}
                    →
                  </a>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
      </Grid>
    </SectionShell>
  ),
  settings: null,
})

/* ------------------------------------------------------------ services.list */

export const servicesList = defineBlock({
  type: 'services.list',
  version: 1,
  category: 'services',
  label: 'Service list',
  icon: 'List',
  defaultProps: {
    eyebrow: 'Tonight',
    heading: "Chef's selection",
    description: 'Served from 18:00 until close. Ask about the daily catch.',
    showNumbers: false,
    showPrice: true,
    items: [
      { title: 'Oysters', text: 'Mignonette, lemon, rye toast.', price: '18' },
      { title: 'Catch of the day', text: 'Charred greens, brown butter, capers.', price: '34' },
      { title: 'Harbour risotto', text: 'Saffron, blue swimmer crab, herbs.', price: '29' },
      { title: 'Burnt honey tart', text: 'Crème fraîche, toasted buckwheat.', price: '14' },
    ],
  },
  schema: schema(
    ...headFields,
    serviceListRepeater,
    toggle('showNumbers', 'Number the rows', 'design'),
    toggle('showPrice', 'Show price', 'design'),
    toggle('showIcons', 'Show icons', 'design'),
    ...ctaFields,
  ),
  component: (props) => {
    const rows = items(props.items, [{ title: 'Item', text: 'Description' }])
    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} defaultHeading="Menu" />
        <Body>
          <div className="ud-stack ud-divide" style={{ gap: 0 }}>
            {rows.map((row, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: 20,
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  padding: '20px 2px',
                }}
              >
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', minWidth: 0 }}>
                  {bool(props.showNumbers, false) ? (
                    <span className="ud-eyebrow" style={{ margin: 0, minWidth: 28 }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  ) : null}
                  {bool(props.showIcons, false) ? <IconBadge name={str(row.icon, 'utensils')} size="sm" /> : null}
                  <div>
                    <ItemTitle props={props} item={row} index={index} fallback="Item" />
                    <ItemText props={props} item={row} index={index} style={{ marginTop: 4 }} />
                  </div>
                </div>
                {bool(props.showPrice, true) && str(row.price) ? (
                  <EditableText
                    edit={editOf(props)}
                    path={['items', index, 'price']}
                    value={str(row.price)}
                    as="span"
                    className="ud-h4"
                    style={{ whiteSpace: 'nowrap' }}
                    placeholder="24"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </Body>
        <CtaGroup props={props} />
      </SectionShell>
    )
  },
  settings: null,
})
