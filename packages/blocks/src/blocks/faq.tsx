import { EditableText, editOf } from '../editable'
import {
  Body,
  Card,
  CtaGroup,
  Heading,
  IconBadge,
  SafeText,
  SectionHead,
  SectionShell,
  bool,
  gridStyle,
  items,
  num,
  str,
} from '../primitives'
import { columnsField, ctaFields, field, gapField, headFields, icon, repeater, schema, text, toggle } from '../schema'
import { defineBlock } from '../types'

const faqs = [
  {
    question: 'Can I use my own domain?',
    answer: 'Yes. Connect a hostname, add the DNS records we show you, then verify — usually within a few minutes.',
  },
  {
    question: 'Do drafts go live automatically?',
    answer: 'No. Every edit is saved as a draft. Your visitors only see changes after you press Publish.',
  },
  {
    question: 'Can I duplicate a site?',
    answer: 'Yes, from the websites list. Duplicating copies pages, theme, navigation, and forms.',
  },
  {
    question: 'What happens if I downgrade?',
    answer: 'Your sites stay online. Features above your new plan limit become read-only until you upgrade again.',
  },
]

const faqRepeater = repeater(
  'items',
  'Questions',
  [text('question', 'Question'), field('answer', 'textarea', 'Answer', 'content'), icon('icon', 'Icon')],
  { itemLabel: 'Question', itemDefaults: { question: 'New question?', answer: 'The answer.' } },
)

function question(item: Record<string, unknown>): string {
  return str(item.question) || str(item.q) || str(item.title) || 'Question'
}

function answer(item: Record<string, unknown>): unknown {
  return item.answer ?? item.a ?? item.text
}

/* ------------------------------------------------------------ faq.accordion */

export const faqAccordion = defineBlock({
  type: 'faq.accordion',
  version: 1,
  category: 'faq',
  label: 'FAQ accordion',
  icon: 'CircleHelp',
  defaultProps: {
    eyebrow: 'FAQ',
    heading: 'Questions, answered',
    description: 'Everything customers ask before they sign up.',
    contentWidth: 'narrow',
    openFirst: true,
    items: faqs,
  },
  schema: schema(
    ...headFields,
    faqRepeater,
    toggle('openFirst', 'Open the first item', 'design'),
    toggle('singleOpen', 'Only one open at a time', 'design'),
    ...ctaFields,
  ),
  component: (props) => {
    const list = items(props.items, faqs)
    const edit = editOf(props)
    // `name` groups <details> into an exclusive accordion (HTML spec, React 19).
    const group: Record<string, string> = bool(props.singleOpen, false)
      ? { name: `faq-${str(props.anchorId, 'group')}` }
      : {}
    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} defaultHeading="FAQ" />
        <Body className="ud-accordion">
          {list.map((item, index) => (
            <details
              key={index}
              className="ud-accordion__item"
              {...group}
              open={bool(props.openFirst, false) && index === 0}
            >
              <summary
                onClick={(event) => {
                  if (edit && (event.target as HTMLElement).closest('.ud-editable')) event.preventDefault()
                }}
              >
                <EditableText
                  edit={edit}
                  path={['items', index, 'question']}
                  value={question(item)}
                  as="span"
                  placeholder="Question"
                />
              </summary>
              <SafeText
                value={answer(item)}
                className="ud-accordion__body"
                edit={edit}
                path={['items', index, typeof item.answer === 'string' || item.a === undefined ? 'answer' : 'a']}
                placeholder="Answer"
              />
            </details>
          ))}
        </Body>
        <CtaGroup props={props} primaryVariant="outline" />
      </SectionShell>
    )
  },
  settings: null,
})

/* ----------------------------------------------------------- faq.two_column */

export const faqTwoColumn = defineBlock({
  type: 'faq.two_column',
  version: 1,
  category: 'faq',
  label: 'Two-column FAQ',
  icon: 'HelpCircle',
  defaultProps: {
    eyebrow: 'Good to know',
    heading: 'Common questions',
    columns: 2,
    cards: true,
    showIcons: true,
    tone: 'surface',
    items: faqs,
  },
  schema: schema(
    ...headFields,
    faqRepeater,
    columnsField(2, 3),
    gapField,
    toggle('cards', 'Show as cards', 'design'),
    toggle('showIcons', 'Show icons', 'design'),
    ...ctaFields,
  ),
  component: (props) => {
    const list = items(props.items, faqs)
    const asCards = bool(props.cards, true)
    return (
      <SectionShell props={props} tone="surface">
        <SectionHead props={props} defaultHeading="FAQ" />
        <Body className="ud-grid" style={gridStyle(num(props.columns, 2), num(props.gap, 24))}>
          {list.map((item, index) => {
            const content = (
              <>
                {bool(props.showIcons, false) ? (
                  <div style={{ marginBottom: 14 }}>
                    <IconBadge name={str(item.icon, 'message')} size="sm" />
                  </div>
                ) : null}
                <Heading level={4} edit={editOf(props)} path={['items', index, 'question']}>
                  {question(item)}
                </Heading>
                <SafeText
                  value={answer(item)}
                  className="ud-text"
                  edit={editOf(props)}
                  path={['items', index, typeof item.answer === 'string' || item.a === undefined ? 'answer' : 'a']}
                  placeholder="Answer"
                />
              </>
            )
            return asCards ? (
              <Card key={index} style={{ textAlign: 'left' }}>
                {content}
              </Card>
            ) : (
              <div key={index}>{content}</div>
            )
          })}
        </Body>
        <CtaGroup props={props} primaryVariant="outline" />
      </SectionShell>
    )
  },
  settings: null,
})
