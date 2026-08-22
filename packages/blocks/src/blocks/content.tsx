import type { CSSProperties } from 'react'
import { editOf } from '../editable'
import {
  Body,
  Card,
  CheckList,
  CtaGroup,
  Heading,
  IconBadge,
  Media,
  SafeRich,
  SafeText,
  SectionHead,
  SectionShell,
  bool,
  cx,
  gridStyle,
  items,
  lines,
  num,
  str,
} from '../primitives'
import {
  ctaFields,
  field,
  gapField,
  headFields,
  icon,
  image,
  repeater,
  richtext,
  schema,
  select,
  slider,
  text,
  toggle,
} from '../schema'
import { defineBlock } from '../types'

/* ------------------------------------------------------------- content.text */

export const contentText = defineBlock({
  type: 'content.text',
  version: 1,
  category: 'content',
  label: 'Text',
  icon: 'Type',
  defaultProps: {
    eyebrow: '',
    heading: 'A short story about the work',
    body:
      'Write the details your visitors need. Keep paragraphs short, lead with the outcome, and finish with a clear next step.\n\nUse **bold** to highlight the phrases that matter most.',
    contentWidth: 'narrow',
  },
  schema: schema(
    ...headFields,
    field('body', 'textarea', 'Body', 'content'),
    slider('fontSize', 'Body size', 14, 24, 'typography', { unit: 'px' }),
    ...ctaFields,
  ),
  component: (props) => {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} descriptionKey="description" />
        <Body style={{ marginTop: str(props.heading) ? 20 : 0 }}>
          <SafeText
            value={props.body}
            className="ud-text"
            style={{ fontSize: num(props.fontSize, 17), whiteSpace: 'pre-wrap' }}
            edit={edit}
            path={['body']}
            multiline
            placeholder="Body copy"
          />
        </Body>
        <CtaGroup props={props} primaryVariant="link" secondaryVariant="link" />
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------- content.richtext */

export const contentRichtext = defineBlock({
  type: 'content.richtext',
  version: 1,
  category: 'content',
  label: 'Rich text',
  icon: 'FileText',
  defaultProps: {
    html:
      '<h2>Tell your story</h2><p>Add headings, lists, and links with <strong>emphasis</strong> where it counts.</p><ul><li>Structured content</li><li>Sanitized on save and on render</li></ul>',
    contentWidth: 'narrow',
  },
  schema: schema(richtext('html', 'Content'), slider('fontSize', 'Body size', 14, 22, 'typography', { unit: 'px' })),
  component: (props) => (
    <SectionShell props={props} tone="default">
      <SafeRich html={props.html} style={{ fontSize: num(props.fontSize, 17) }} edit={editOf(props)} path={['html']} />
    </SectionShell>
  ),
  settings: null,
})

/* ------------------------------------------------- content.image_text / text_image */

const splitFields = [
  ...headFields,
  field('body', 'textarea', 'Body', 'content'),
  field('bullets', 'textarea', 'Bullets (one per line)', 'content'),
  ...ctaFields,
  image('image', 'Image'),
  text('imageAlt', 'Image alt text'),
  select('imageRatio', 'Image ratio', [['landscape', '4:3'], ['wide', '16:9'], ['square', '1:1'], ['portrait', '3:4'], ['tall', '4:5']], 'design'),
  select('splitRatio', 'Column ratio', [['even', 'Even'], ['media', 'Wider media'], ['copy', 'Wider copy']], 'layout'),
  toggle('roundedMedia', 'Rounded media', 'design'),
]

const SPLIT_RATIOS: Record<string, string> = { even: '1fr 1fr', media: '0.85fr 1.15fr', copy: '1.15fr 0.85fr' }

function SplitContent({ props, reverse }: { props: Record<string, unknown>; reverse: boolean }) {
  const edit = editOf(props)
  return (
    <SectionShell props={props} tone="default">
      <div
        className={cx('ud-split', reverse && 'ud-split--reverse')}
        style={{ '--ud-split': SPLIT_RATIOS[str(props.splitRatio, 'even')] || SPLIT_RATIOS.even } as CSSProperties}
      >
        <div>
          <SectionHead props={props} center={false} />
          <SafeText
            value={props.body}
            className="ud-text"
            style={{ marginTop: 16 }}
            edit={edit}
            path={['body']}
            multiline
            placeholder="Body copy"
          />
          {lines(props.bullets).length || edit ? (
            <div style={{ marginTop: 22 }}>
              <CheckList values={lines(props.bullets)} edit={edit} path={['bullets']} />
            </div>
          ) : null}
          <CtaGroup props={props} />
        </div>
        <div className="ud-split__media">
          <Media
            src={props.image}
            alt={str(props.imageAlt)}
            ratio={str(props.imageRatio, 'landscape')}
            style={bool(props.roundedMedia, true) ? undefined : { borderRadius: 0 }}
            edit={edit}
            path={['image']}
          />
        </div>
      </div>
    </SectionShell>
  )
}

export const contentImageText = defineBlock({
  type: 'content.image_text',
  version: 1,
  category: 'content',
  label: 'Image + text',
  icon: 'PanelLeft',
  defaultProps: {
    eyebrow: 'Our story',
    heading: 'Started with a single table by the water',
    body: 'What began as a weekend pop-up is now a room for eighty, a garden, and a team of twenty-two.',
    bullets: 'Family owned since 2009\nProduce from within 60 miles\nOpen kitchen, no reservations required',
    imageRatio: 'landscape',
  },
  schema: schema(...splitFields),
  component: (props) => <SplitContent props={props} reverse />,
  settings: null,
})

export const contentTextImage = defineBlock({
  type: 'content.text_image',
  version: 1,
  category: 'content',
  label: 'Text + image',
  icon: 'PanelRight',
  defaultProps: {
    eyebrow: 'How we work',
    heading: 'Discovery, design, launch, and care',
    body: 'Four phases, clear deliverables, and a single point of contact from kickoff to go-live.',
    bullets: 'Weekly demos, never a black box\nFixed scope and fixed price\nHandover with training included',
    imageRatio: 'landscape',
  },
  schema: schema(...splitFields),
  component: (props) => <SplitContent props={props} reverse={false} />,
  settings: null,
})

/* --------------------------------------------------------- content.centered */

export const contentCentered = defineBlock({
  type: 'content.centered',
  version: 1,
  category: 'content',
  label: 'Centered content',
  icon: 'AlignCenter',
  defaultProps: {
    eyebrow: 'Our promise',
    heading: 'A quiet statement, confidently made',
    body: 'Keep this section short. One idea, one sentence, one next step.',
    textAlign: 'center',
    contentWidth: 'narrow',
    showIcon: true,
    iconName: 'sparkles',
    tone: 'surface',
  },
  schema: schema(
    ...headFields,
    field('body', 'textarea', 'Body', 'content'),
    toggle('showIcon', 'Show icon', 'design'),
    icon('iconName', 'Icon'),
    ...ctaFields,
  ),
  component: (props) => {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="surface" align="center">
        <div style={{ maxWidth: 720, marginInline: 'auto' }}>
          {bool(props.showIcon, false) ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
              <IconBadge name={str(props.iconName, 'sparkles')} size="lg" shape="round" solid />
            </div>
          ) : null}
          <SectionHead props={props} center />
          <SafeText
            value={props.body}
            className="ud-text"
            style={{ marginTop: 14 }}
            edit={edit}
            path={['body']}
            multiline
            placeholder="Body copy"
          />
          <CtaGroup props={props} />
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ----------------------------------------------------- content.two_columns */

export const contentTwoColumns = defineBlock({
  type: 'content.two_columns',
  version: 1,
  category: 'content',
  label: 'Two columns',
  icon: 'Columns',
  defaultProps: {
    eyebrow: 'The work',
    heading: 'Two sides of every project',
    columns: [
      { title: 'Strategy and research', text: 'Interviews, analytics, and a positioning workshop that ends in decisions.' },
      { title: 'Design and delivery', text: 'A build that matches the plan, tested on real devices before launch.' },
    ],
    columnCount: 2,
  },
  schema: schema(
    ...headFields,
    repeater(
      'columns',
      'Columns',
      [text('title', 'Title'), field('text', 'textarea', 'Text', 'content'), icon('icon', 'Icon')],
      { itemLabel: 'Column', itemDefaults: { title: 'New column', text: 'Column copy.' } },
    ),
    slider('columnCount', 'Columns', 2, 4, 'layout'),
    gapField,
    toggle('showIcons', 'Show icons', 'design'),
    toggle('asCards', 'Show as cards', 'design'),
    ...ctaFields,
  ),
  component: (props) => {
    const edit = editOf(props)
    const columns = items(props.columns, [
      { title: 'Left', text: str(props.left, 'Left column copy.') },
      { title: 'Right', text: str(props.right, 'Right column copy.') },
    ])
    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} />
        <Body className="ud-grid" style={gridStyle(num(props.columnCount, Math.min(columns.length, 3)), num(props.gap, 32))}>
          {columns.map((column, index) => {
            const inner = (
              <>
                {bool(props.showIcons, false) ? (
                  <div style={{ marginBottom: 14 }}>
                    <IconBadge name={str(column.icon, 'layers')} size="sm" />
                  </div>
                ) : null}
                {str(column.title) || edit ? (
                  <Heading level={4} edit={edit} path={['columns', index, 'title']} placeholder="Column title">
                    {str(column.title)}
                  </Heading>
                ) : null}
                <SafeText
                  value={column.text}
                  className="ud-text"
                  edit={edit}
                  path={['columns', index, 'text']}
                  multiline
                  placeholder="Column copy"
                />
              </>
            )
            return bool(props.asCards, false) ? (
              <Card key={index}>{inner}</Card>
            ) : (
              <div key={index}>{inner}</div>
            )
          })}
        </Body>
        <CtaGroup props={props} />
      </SectionShell>
    )
  },
  settings: null,
})
