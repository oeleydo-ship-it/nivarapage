import type { CSSProperties } from 'react'
import { EditableText, editOf } from '../editable'
import {
  Body,
  Card,
  CheckList,
  CtaGroup,
  Grid,
  IconBadge,
  SafeText,
  SectionHead,
  SectionShell,
  bool,
  items,
  lines,
  num,
  str,
} from '../primitives'
import { columnsField, ctaFields, field, gapField, headFields, icon, repeater, schema, text, toggle } from '../schema'
import { defineBlock } from '../types'

const steps = [
  { title: 'Discover', text: 'A short workshop on audience, offer, and what has to ship first.', icon: 'search' },
  { title: 'Design', text: 'A homepage and two inner pages in your theme, ready to edit.', icon: 'palette' },
  { title: 'Build', text: 'Forms, SEO, and a domain — then a private preview link.', icon: 'layers' },
  { title: 'Launch', text: 'You publish. We stay on for the first two weeks of live traffic.', icon: 'rocket' },
]

const stepRepeater = repeater(
  'items',
  'Steps',
  [text('title', 'Title'), field('text', 'textarea', 'Description', 'content'), icon('icon', 'Icon')],
  { itemLabel: 'Step', itemDefaults: { title: 'New step', text: 'What happens here.', icon: 'check' } },
)

const timeline = [
  { date: 'Week 1', title: 'Kickoff & sitemap', text: 'We agree the pages, the offer, and who signs off.' },
  { date: 'Week 2', title: 'First homepage', text: 'Copy in your voice, on-brand sections, ready to click through.' },
  { date: 'Week 3', title: 'Inner pages & forms', text: 'About, services, and a form that actually emails someone.' },
  { date: 'Week 4', title: 'Domain & go-live', text: 'SSL, redirects, and a launch checklist you can follow.' },
]

const timelineRepeater = repeater(
  'items',
  'Milestones',
  [text('date', 'Date / phase'), text('title', 'Title'), field('text', 'textarea', 'Description', 'content')],
  { itemLabel: 'Milestone', itemDefaults: { date: 'Phase', title: 'Milestone', text: 'What ships.' } },
)

/* ----------------------------------------------------------- process.steps */

export const processSteps = defineBlock({
  type: 'process.steps',
  version: 1,
  category: 'features',
  label: 'Process steps',
  icon: 'Layers',
  defaultProps: {
    eyebrow: 'How it works',
    heading: 'Four steps from brief to live site',
    description: 'A fixed sequence so nobody wonders what happens next week.',
    textAlign: 'center',
    columns: 4,
    showNumbers: true,
    items: steps,
  },
  schema: schema(
    ...headFields,
    stepRepeater,
    columnsField(2, 5),
    gapField,
    toggle('showNumbers', 'Show numbers', 'design'),
    toggle('showIcons', 'Show icons', 'design'),
    ...ctaFields,
  ),
  component: (props) => {
    const edit = editOf(props)
    const rows = items(props.items, steps)
    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} defaultHeading="How it works" />
        <Body>
          <Grid cols={num(props.columns, rows.length || 4)} gap={num(props.gap, 24)} className="ud-steps">
            {rows.map((step, index) => (
              <div key={index} className="ud-step">
                {bool(props.showNumbers, true) ? (
                  <span className="ud-step__num">{String(index + 1).padStart(2, '0')}</span>
                ) : bool(props.showIcons, true) ? (
                  <IconBadge name={str(step.icon, 'check')} solid={false} />
                ) : null}
                <EditableText
                  edit={edit}
                  path={['items', index, 'title']}
                  value={str(step.title, 'Step')}
                  as="h3"
                  className="ud-h4"
                  style={{ marginTop: 14 }}
                  placeholder="Title"
                />
                <SafeText
                  value={step.text}
                  className="ud-text"
                  edit={edit}
                  path={['items', index, 'text']}
                  placeholder="What happens in this step"
                />
              </div>
            ))}
          </Grid>
        </Body>
        <CtaGroup props={props} />
      </SectionShell>
    )
  },
  settings: null,
})

/* -------------------------------------------------------- process.timeline */

export const processTimeline = defineBlock({
  type: 'process.timeline',
  version: 1,
  category: 'features',
  label: 'Timeline',
  icon: 'Calendar',
  defaultProps: {
    eyebrow: 'The plan',
    heading: 'A four-week launch, on the calendar',
    description: 'Every week has a named deliverable. No black box between kickoff and go-live.',
    bullets: 'Weekly demo, never a status email\nYou keep the draft link the whole time\nLaunch checklist included',
    items: timeline,
  },
  schema: schema(
    ...headFields,
    timelineRepeater,
    field('bullets', 'textarea', 'Sidebar bullets (one per line)', 'content'),
    ...ctaFields,
  ),
  component: (props) => {
    const edit = editOf(props)
    const rows = items(props.items, timeline)
    return (
      <SectionShell props={props} tone="surface">
        <div className="ud-split" style={{ '--ud-split': '0.92fr 1.08fr' } as CSSProperties}>
          <div>
            <SectionHead props={props} defaultHeading="Timeline" center={false} />
            <div style={{ marginTop: 24 }}>
              <CheckList values={lines(props.bullets)} edit={edit} path={['bullets']} />
            </div>
            <CtaGroup props={props} />
          </div>
          <div className="ud-timeline">
            {rows.map((item, index) => (
              <Card key={index} className="ud-timeline__item" hover={false} variant="outline">
                <EditableText
                  edit={edit}
                  path={['items', index, 'date']}
                  value={str(item.date)}
                  as="p"
                  className="ud-eyebrow"
                  placeholder="Week 1"
                />
                <EditableText
                  edit={edit}
                  path={['items', index, 'title']}
                  value={str(item.title)}
                  as="h3"
                  className="ud-h4"
                  style={{ marginTop: 6 }}
                  placeholder="Milestone"
                />
                <SafeText
                  value={item.text}
                  className="ud-text"
                  edit={edit}
                  path={['items', index, 'text']}
                  placeholder="What ships"
                />
              </Card>
            ))}
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})
