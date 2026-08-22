import { editOf, EditableText } from '../editable'
import { Icon } from '../icons'
import { PublicForm, type PublicFormField } from '../public-form'
import {
  Body,
  Card,
  CheckList,
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
  str,
  type Props,
} from '../primitives'
import { field, headFields, icon, image, repeater, schema, select, text, toggle } from '../schema'
import { defineBlock } from '../types'

const contactRepeater = repeater(
  'details',
  'Contact details',
  [icon('icon', 'Icon'), text('label', 'Label'), text('value', 'Value'), field('url', 'link', 'Link', 'content')],
  { itemLabel: 'Detail', itemDefaults: { icon: 'mail', label: 'Email', value: 'hello@example.com' } },
)

const commonFormFields = [
  ...headFields,
  field('formId', 'text', 'Connected form', 'content'),
  text('buttonLabel', 'Submit label'),
  field('successNote', 'text', 'Note under the form', 'content'),
  select('layout', 'Layout', [['split', 'Form beside details'], ['centered', 'Centered form'], ['form-only', 'Form only']], 'layout'),
  toggle('reverse', 'Form on the left', 'layout'),
  contactRepeater,
  field('bullets', 'textarea', 'Reassurance bullets', 'content'),
  image('image', 'Side image'),
  toggle('cardStyle', 'Show form in a card', 'design'),
]

function DetailList({ props }: { props: Props }) {
  const edit = editOf(props)
  const details = items(props.details, [])
  if (!details.length && !edit) return null
  return (
    <div className="ud-stack" style={{ gap: 18 }}>
      {details.map((detail, index) => {
        const value = str(detail.value)
        const url = str(detail.url)
        return (
          <div key={index} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <IconBadge name={str(detail.icon, 'mail')} size="sm" />
            <div>
              <div className="ud-eyebrow" style={{ margin: 0 }}>
                <EditableText
                  edit={edit}
                  path={['details', index, 'label']}
                  value={str(detail.label)}
                  as="span"
                  placeholder="Label"
                />
              </div>
              {url ? (
                <a href={url} style={{ color: 'inherit', display: 'block', marginTop: 2 }}>
                  <EditableText
                    edit={edit}
                    path={['details', index, 'value']}
                    value={value}
                    as="span"
                    placeholder="Value"
                  />
                </a>
              ) : (
                <div style={{ marginTop: 2 }}>
                  <EditableText
                    edit={edit}
                    path={['details', index, 'value']}
                    value={value}
                    as="span"
                    placeholder="Value"
                  />
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FormBlock({
  props,
  fields,
  tone = 'default',
  formLayout = 'stack',
}: {
  props: Props
  fields: PublicFormField[]
  tone?: 'default' | 'surface'
  formLayout?: 'stack' | 'inline'
}) {
  const edit = editOf(props)
  const layout = str(props.layout, 'split')
  const form = (
    <div>
      <PublicForm
        formId={str(props.formId) || undefined}
        fields={fields}
        layout={formLayout}
        submitLabel={str(props.buttonLabel) || undefined}
        edit={editOf(props)}
        submitLabelPath={['buttonLabel']}
      />
      {str(props.successNote) || edit ? (
        <p className="ud-small" style={{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Icon name="lock" size={15} />
          <EditableText
            edit={edit}
            path={['successNote']}
            value={str(props.successNote)}
            as="span"
            placeholder="Note under the form"
          />
        </p>
      ) : null}
    </div>
  )
  const wrapped = bool(props.cardStyle, false) ? (
    <Card hover={false} style={{ background: 'var(--color-background)' }}>
      {form}
    </Card>
  ) : (
    form
  )

  if (layout === 'form-only') {
    return (
      <SectionShell props={props} tone={tone}>
        <SectionHead props={props} />
        <Body>{wrapped}</Body>
      </SectionShell>
    )
  }

  if (layout === 'centered') {
    return (
      <SectionShell props={props} tone={tone} align="center">
        <div style={{ maxWidth: 620, marginInline: 'auto', textAlign: 'left' }}>
          <SectionHead props={props} center />
          <Body>{wrapped}</Body>
        </div>
      </SectionShell>
    )
  }

  return (
    <SectionShell props={props} tone={tone}>
      <div className={cx('ud-split', bool(props.reverse) && 'ud-split--reverse')}>
        <div>
          <SectionHead props={props} center={false} />
          {lines(props.bullets).length || edit ? (
            <div style={{ marginTop: 24 }}>
              <CheckList values={lines(props.bullets)} edit={edit} path={['bullets']} />
            </div>
          ) : null}
          <div style={{ marginTop: 28 }}>
            <DetailList props={props} />
          </div>
          {str(props.image) || edit ? (
            <div style={{ marginTop: 28 }}>
              <Media src={props.image} ratio="wide" edit={edit} path={['image']} />
            </div>
          ) : null}
        </div>
        <div className="ud-split__media">{wrapped}</div>
      </div>
    </SectionShell>
  )
}

/* ------------------------------------------------------------ form.contact */

export const formContact = defineBlock({
  type: 'form.contact',
  version: 1,
  category: 'form',
  label: 'Contact form',
  icon: 'Mail',
  defaultProps: {
    eyebrow: 'Contact',
    heading: 'Say hello',
    description: 'Tell us what you need and we will reply within one business day.',
    formId: '',
    buttonLabel: 'Send message',
    successNote: 'We never share your details.',
    layout: 'split',
    cardStyle: true,
    tone: 'surface',
    details: [
      { icon: 'mail', label: 'Email', value: 'hello@example.com', url: 'mailto:hello@example.com' },
      { icon: 'phone', label: 'Phone', value: '+1 (555) 018 2299', url: 'tel:+15550182299' },
      { icon: 'map-pin', label: 'Studio', value: '18 Harbour Street, Suite 4' },
    ],
    bullets: 'Real humans reply, not a ticket bot\nNo sales sequences\nWe sign NDAs on request',
  },
  schema: schema(...commonFormFields),
  component: (props) => (
    <FormBlock
      props={props}
      tone="surface"
      fields={[
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'message', label: 'How can we help?', type: 'textarea', required: true },
      ]}
    />
  ),
  settings: null,
})

/* --------------------------------------------------------------- form.lead */

export const formLead = defineBlock({
  type: 'form.lead',
  version: 1,
  category: 'form',
  label: 'Lead form',
  icon: 'UserPlus',
  defaultProps: {
    eyebrow: 'Get started',
    heading: 'Request a proposal',
    description: 'Share a few details and we will send scope options and pricing.',
    formId: '',
    buttonLabel: 'Request proposal',
    layout: 'split',
    cardStyle: true,
    bullets: 'Response within 24 hours\nFixed-price options\nNo obligation',
    details: [{ icon: 'clock', label: 'Typical turnaround', value: '2–4 weeks per site' }],
  },
  schema: schema(...commonFormFields),
  component: (props) => (
    <FormBlock
      props={props}
      fields={[
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Work email', type: 'email', required: true },
        { name: 'company', label: 'Company', type: 'text' },
        { name: 'budget', label: 'Budget', type: 'select', options: ['Under $5k', '$5k – $15k', '$15k – $40k', '$40k+'] },
        { name: 'message', label: 'Project summary', type: 'textarea' },
      ]}
    />
  ),
  settings: null,
})

/* --------------------------------------------------------- form.newsletter */

export const formNewsletter = defineBlock({
  type: 'form.newsletter',
  version: 1,
  category: 'form',
  label: 'Newsletter',
  icon: 'Newspaper',
  defaultProps: {
    eyebrow: '',
    heading: 'Stay in the loop',
    description: 'One short email a month with new templates and product updates.',
    formId: '',
    buttonLabel: 'Subscribe',
    successNote: 'Unsubscribe any time.',
    tone: 'primary',
    textAlign: 'center',
    layout: 'centered',
  },
  schema: schema(
    ...headFields,
    field('formId', 'text', 'Connected form', 'content'),
    text('buttonLabel', 'Submit label'),
    field('successNote', 'text', 'Note under the form', 'content'),
    icon('iconName', 'Icon'),
    toggle('showIcon', 'Show icon', 'design'),
    select('layout', 'Layout', [['centered', 'Centered'], ['split', 'Title and form']], 'layout'),
  ),
  component: (props) => {
    const edit = editOf(props)
    const split = str(props.layout) === 'split'
    const form = (
      <PublicForm
        formId={str(props.formId) || undefined}
        layout="inline"
        submitLabel={str(props.buttonLabel) || 'Subscribe'}
        edit={editOf(props)}
        submitLabelPath={['buttonLabel']}
        fields={[{ name: 'email', label: 'Email', type: 'email', required: true, hideLabel: true, placeholder: 'you@company.com' }]}
      />
    )
    return (
      <SectionShell props={props} tone="primary" align={split ? 'left' : 'center'}>
        {split ? (
          <div
            className="ud-row ud-between"
            style={{ alignItems: 'center', gap: 24, flexWrap: 'wrap' }}
          >
            <div style={{ flex: '1 1 280px', minWidth: 220 }}>
              <SectionHead props={props} defaultHeading="Newsletter" center={false} />
            </div>
            <div style={{ flex: '1 1 280px' }}>{form}</div>
          </div>
        ) : (
          <div style={{ maxWidth: 640, marginInline: 'auto' }}>
            {bool(props.showIcon, false) ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                <IconBadge name={str(props.iconName, 'mail')} shape="round" size="lg" />
              </div>
            ) : null}
            <SectionHead props={props} defaultHeading="Newsletter" />
            <div style={{ marginTop: 26, display: 'flex', justifyContent: 'center' }}>{form}</div>
            {str(props.successNote) || edit ? (
              <p className="ud-small" style={{ marginTop: 14 }}>
                <EditableText
                  edit={edit}
                  path={['successNote']}
                  value={str(props.successNote)}
                  as="span"
                  placeholder="Note under the form"
                />
              </p>
            ) : null}
          </div>
        )}
      </SectionShell>
    )
  },
  settings: null,
})

/* -------------------------------------------------------------- form.quote */

export const formQuote = defineBlock({
  type: 'form.quote',
  version: 1,
  category: 'form',
  label: 'Quote form',
  icon: 'ClipboardList',
  defaultProps: {
    eyebrow: 'Estimate',
    heading: 'Request a quote',
    description: 'Answer four quick questions for a same-week estimate.',
    formId: '',
    buttonLabel: 'Get my quote',
    layout: 'split',
    cardStyle: true,
    tone: 'surface',
    bullets: 'Itemised estimate, no lock-in\nTimeline included\nOptional fixed-price package',
    details: [
      { icon: 'calendar', label: 'Next availability', value: 'Starting in 2 weeks' },
      { icon: 'award', label: 'Guarantee', value: '30-day post-launch support' },
    ],
  },
  schema: schema(...commonFormFields),
  component: (props) => (
    <FormBlock
      props={props}
      tone="surface"
      fields={[
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'service', label: 'What do you need?', type: 'select', options: ['New website', 'Redesign', 'Ongoing support', 'Something else'] },
        { name: 'timeline', label: 'Ideal timeline', type: 'text' },
        { name: 'project', label: 'Project details', type: 'textarea', required: true },
      ]}
    />
  ),
  settings: null,
})

/* -------------------------------------------------------- form.appointment */

export const formAppointment = defineBlock({
  type: 'form.appointment',
  version: 1,
  category: 'form',
  label: 'Appointment form',
  icon: 'Calendar',
  defaultProps: {
    eyebrow: '',
    heading: 'Book a working session',
    description: 'Pick a time. We confirm by email the same day.',
    formId: '',
    buttonLabel: 'Make an appointment',
    layout: 'split',
    reverse: true,
    cardStyle: false,
    tone: 'default',
    details: [],
    bullets: '',
  },
  schema: schema(...commonFormFields),
  component: (props) => (
    <FormBlock
      props={props}
      tone="default"
      fields={[
        { name: 'first_name', label: 'First name', type: 'text', required: true },
        { name: 'last_name', label: 'Last name', type: 'text', required: true },
        { name: 'email', label: 'Email address', type: 'email', required: true },
        { name: 'specialist', label: 'Specialist', type: 'select', options: ['Product designer', 'Frontend engineer', 'Content strategist', 'Not sure yet'] },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'time', label: 'Time', type: 'time', required: true },
      ]}
    />
  ),
  settings: null,
})
