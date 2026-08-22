import { EditableText, editOf } from '../editable'
import {
  Body,
  Card,
  CtaGroup,
  Grid,
  IconBadge,
  SafeText,
  SectionHead,
  SectionShell,
  bool,
  items,
  num,
  str,
} from '../primitives'
import { columnsField, ctaFields, field, gapField, headFields, icon, repeater, schema, text, toggle, withoutFields } from '../schema'
import { defineBlock } from '../types'

const statFields = [icon('icon', 'Icon'), text('value', 'Value'), text('label', 'Label'), field('hint', 'text', 'Hint', 'content')]

const statOptions = { itemLabel: 'Stat', itemDefaults: { value: '100+', label: 'Metric', hint: '', icon: 'star' } }

const statRepeater = repeater('items', 'Stats', statFields, statOptions)

const defaultStats = [
  { value: '2,400+', label: 'Sites launched', hint: 'Across 38 countries' },
  { value: '4.9', label: 'Average rating', hint: 'From 680 reviews' },
  { value: '12 min', label: 'Time to first draft', hint: 'From a blank page' },
  { value: '99.9%', label: 'Publishing uptime', hint: 'Last 12 months' },
]

/* --------------------------------------------------------------- stats.row */

export const statsRow = defineBlock({
  type: 'stats.row',
  version: 1,
  category: 'features',
  label: 'Stats row',
  icon: 'Chart',
  defaultProps: {
    eyebrow: 'By the numbers',
    heading: 'Proof, not promises',
    description: 'A few figures teams ask about before they switch.',
    textAlign: 'center',
    columns: 4,
    tone: 'surface',
    items: defaultStats,
  },
  schema: schema(...headFields, statRepeater, columnsField(2, 6), gapField, toggle('showHints', 'Show hints', 'content')),
  component: (props) => {
    const edit = editOf(props)
    const rows = items(props.items, defaultStats)
    return (
      <SectionShell props={props} tone="surface">
        <SectionHead props={props} defaultHeading="Stats" />
        <Body>
          <Grid cols={num(props.columns, rows.length || 4)} gap={num(props.gap, 28)}>
            {rows.map((item, index) => (
              <div key={index} style={{ textAlign: str(props.textAlign, 'center') === 'center' ? 'center' : undefined }}>
                {str(item.icon) ? (
                  <div style={{ marginBottom: 14, display: 'flex', justifyContent: str(props.textAlign, 'center') === 'center' ? 'center' : 'flex-start' }}>
                    <IconBadge name={str(item.icon)} shape="round" />
                  </div>
                ) : null}
                <EditableText
                  edit={edit}
                  path={['items', index, 'value']}
                  value={str(item.value, '—')}
                  as="div"
                  className="ud-stat"
                  placeholder="2,400+"
                />
                <EditableText
                  edit={edit}
                  path={['items', index, 'label']}
                  value={str(item.label, 'Metric')}
                  as="p"
                  className="ud-h4"
                  style={{ marginTop: 10 }}
                  placeholder="Label"
                />
                {bool(props.showHints, true) && (str(item.hint) || edit) ? (
                  <EditableText
                    edit={edit}
                    path={['items', index, 'hint']}
                    value={str(item.hint)}
                    as="p"
                    className="ud-small"
                    style={{ marginTop: 6 }}
                    placeholder="Hint"
                  />
                ) : null}
              </div>
            ))}
          </Grid>
        </Body>
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------- stats.highlight */

export const statsHighlight = defineBlock({
  type: 'stats.highlight',
  version: 1,
  category: 'features',
  label: 'Highlighted stat',
  icon: 'TrendingUp',
  defaultProps: {
    eyebrow: 'Results',
    heading: 'One number that changes the conversation',
    description: 'Lead with the outcome, then support it with three smaller figures.',
    featuredValue: '38%',
    featuredLabel: 'faster time to first publish',
    buttonLabel: 'See customer stories',
    buttonUrl: '/stories',
    tone: 'dark',
    items: defaultStats.slice(0, 3),
  },
  schema: schema(
    ...headFields,
    text('featuredValue', 'Featured value'),
    text('featuredLabel', 'Featured label'),
    ...ctaFields,
    // The highlight layout has no room for the hint line.
    repeater('items', 'Stats', withoutFields(statFields, 'hint'), statOptions),
  ),
  component: (props) => {
    const edit = editOf(props)
    const rows = items(props.items, defaultStats.slice(0, 3))
    return (
      <SectionShell props={props} tone="dark">
        <div className="ud-split" style={{ alignItems: 'center' }}>
          <div>
            <SectionHead props={props} defaultHeading="Results" center={false} />
            <CtaGroup props={props} primaryVariant="light" />
          </div>
          <Card hover={false} style={{ textAlign: 'center', padding: 'clamp(28px, 4cqi, 48px)' }}>
            <EditableText
              edit={edit}
              path={['featuredValue']}
              value={str(props.featuredValue, '38%')}
              as="div"
              className="ud-stat"
              style={{ fontSize: 'clamp(3rem, 6cqi, 4.5rem)' }}
              placeholder="38%"
            />
            <EditableText
              edit={edit}
              path={['featuredLabel']}
              value={str(props.featuredLabel)}
              as="p"
              className="ud-lead"
              style={{ marginTop: 8 }}
              placeholder="What changed"
            />
          </Card>
        </div>
        <Grid cols={Math.min(rows.length, 4)} gap={24} style={{ marginTop: 36 }}>
          {rows.map((item, index) => (
            <div key={index}>
              <EditableText
                edit={edit}
                path={['items', index, 'value']}
                value={str(item.value)}
                as="div"
                className="ud-h2"
                style={{ fontSize: '1.8rem' }}
                placeholder="100+"
              />
              <SafeText
                value={item.label}
                className="ud-small"
                style={{ marginTop: 6 }}
                edit={edit}
                path={['items', index, 'label']}
                placeholder="Label"
              />
            </div>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})
