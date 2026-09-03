/**
 * Funnel blocks.
 *
 * A funnel step is published as static HTML served from /f/{public_id}/{slug},
 * and the events API is addressed by numeric ids, so a block cannot work out
 * which funnel it is on from the URL. Publishing writes the ids into a
 * `#ud-funnel` script tag; these blocks read them from there.
 */
import { useState, type FormEvent } from 'react'
import { EditableText, editOf } from '../editable'
import { Body, Button, SectionHead, SectionShell, bool, items, str, type Props } from '../primitives'
import { headFields, repeater, schema, select, text, textarea, toggle } from '../schema'
import { defineBlock } from '../types'

/** What publishing wrote into the page about this step. */
type FunnelContext = {
  funnel_id: number | string
  funnel_slug: string
  step_id: number | string
  step_slug: string
  next_step?: string | null
}

function funnelContext(): FunnelContext | null {
  if (typeof document === 'undefined') return null
  const tag = document.getElementById('ud-funnel')
  if (!tag?.textContent) return null
  try {
    const parsed = JSON.parse(tag.textContent) as FunnelContext
    return parsed && parsed.funnel_id && parsed.step_id ? parsed : null
  } catch {
    return null
  }
}

/** The fields an opt-in offers, in the order they are asked for. */
const FIELD_KEYS = ['name', 'email', 'phone', 'company'] as const
type FieldKey = (typeof FIELD_KEYS)[number]

const FIELD_LABELS: Record<FieldKey, string> = {
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  company: 'Company',
}

const FIELD_TYPES: Record<FieldKey, string> = {
  name: 'text',
  email: 'email',
  phone: 'tel',
  company: 'text',
}

/* ------------------------------------------------------------ funnel.optin */

export const funnelOptin = defineBlock({
  type: 'funnel.optin',
  version: 1,
  category: 'form',
  label: 'Funnel opt-in',
  icon: 'MailPlus',
  defaultProps: {
    eyebrow: 'Free guide',
    heading: 'Get the guide',
    description: 'Tell us where to send it and it will be in your inbox in a minute.',
    fields: ['name', 'email'],
    buttonLabel: 'Send it to me',
    successMessage: 'Thanks — check your inbox.',
    consentText: '',
    footnote: 'No spam. Unsubscribe whenever you like.',
    layout: 'stacked',
  },
  schema: schema(
    ...headFields,
    repeater('fields', 'Fields', [select('key', 'Field', [...FIELD_KEYS.map((key) => [key, FIELD_LABELS[key]] as [string, string])])], {
      itemLabel: 'Field',
      itemDefaults: { key: 'email' },
    }),
    text('buttonLabel', 'Button label'),
    text('successMessage', 'Message after signing up'),
    textarea('consentText', 'Consent checkbox', { help: 'Leave blank for no checkbox.' }),
    text('footnote', 'Small print'),
    select('layout', 'Layout', [['stacked', 'Stacked'], ['inline', 'One line']], 'layout'),
    toggle('requirePhone', 'Make phone required'),
  ),
  component: function FunnelOptin(props) {
    const edit = editOf(props)
    const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
    const [message, setMessage] = useState('')

    // Accepts both the repeater shape and a plain list of keys, so the field
    // set can be written either way without the block losing its inputs.
    const configured = items(props.fields, [])
      .map((entry) => str((entry as Props).key ?? entry))
      .filter((key): key is FieldKey => (FIELD_KEYS as readonly string[]).includes(key))
    const fields: FieldKey[] = configured.length ? configured : ['name', 'email']
    // An opt-in with no email has nothing to opt in to.
    const asked: FieldKey[] = fields.includes('email') ? fields : [...fields, 'email']

    const consentText = str(props.consentText)
    const inline = str(props.layout, 'stacked') === 'inline'

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault()
      if (status === 'sending') return
      const form = event.currentTarget
      const data = new FormData(form)

      // Honeypot: a real person never fills a hidden field in.
      if (str(data.get('website'))) {
        setStatus('ok')
        setMessage(str(props.successMessage, 'Thanks — check your inbox.'))
        return
      }

      const context = funnelContext()
      if (!context) {
        setStatus('error')
        setMessage('This form works once the funnel is published.')
        return
      }

      const contact: Record<string, string> = {}
      for (const key of asked) {
        const value = str(data.get(key)).trim()
        if (value) contact[key] = value
      }

      setStatus('sending')
      setMessage('')
      try {
        const response = await fetch(
          `/api/v1/public/funnels/${context.funnel_id}/steps/${context.step_id}/events`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              event_type: 'lead_created',
              consent: 'essential',
              url: typeof window === 'undefined' ? undefined : window.location.href,
              metadata: { contact },
            }),
          },
        )
        if (!response.ok) throw new Error('That did not go through. Please try again.')
        const body = (await response.json()) as { data?: { next_step?: string | null } }

        setStatus('ok')
        setMessage(str(props.successMessage, 'Thanks — check your inbox.'))
        form.reset()

        // The server decides what comes next: the step graph can be rewired
        // without republishing every page that leads into it.
        const next = body?.data?.next_step || context.next_step
        if (next && typeof window !== 'undefined') {
          window.location.assign(`/f/${context.funnel_slug}/${next}`)
        }
      } catch (error) {
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'That did not go through. Please try again.')
      }
    }

    return (
      <SectionShell props={props} tone="default" align="center">
        <SectionHead props={props} defaultHeading="Get the guide" />

        {status === 'ok' && !edit ? (
          <Body style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
            <p className="ud-lead" role="status">
              {message}
            </p>
          </Body>
        ) : (
          <Body style={{ maxWidth: inline ? 720 : 460, margin: '0 auto' }}>
            <form onSubmit={onSubmit} noValidate>
              <div
                style={{
                  display: inline ? 'flex' : 'grid',
                  flexWrap: 'wrap',
                  gap: 10,
                  alignItems: 'flex-end',
                }}
              >
                {asked.map((key) => (
                  <label key={key} style={{ display: 'grid', gap: 6, flex: inline ? '1 1 180px' : undefined }}>
                    <span className="ud-small" style={{ fontWeight: 600 }}>
                      {FIELD_LABELS[key]}
                      {key === 'email' || (key === 'phone' && bool(props.requirePhone, false)) ? ' *' : ''}
                    </span>
                    <input
                      name={key}
                      type={FIELD_TYPES[key]}
                      required={key === 'email' || (key === 'phone' && bool(props.requirePhone, false))}
                      autoComplete={key === 'email' ? 'email' : key === 'phone' ? 'tel' : key === 'name' ? 'name' : 'organization'}
                      className="ud-input"
                      placeholder={FIELD_LABELS[key]}
                    />
                  </label>
                ))}

                {/* Never shown; catches the bots that fill everything in. */}
                <input
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
                />

                <div style={{ flex: inline ? '0 0 auto' : undefined, marginTop: inline ? 0 : 4 }}>
                  <Button type="submit">
                    <EditableText
                      edit={edit}
                      path={['buttonLabel']}
                      value={str(props.buttonLabel, 'Send it to me')}
                      as="span"
                      placeholder="Button label"
                    />
                  </Button>
                </div>
              </div>

              {consentText ? (
                <label className="ud-small" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 12 }}>
                  <input type="checkbox" name="consent" required style={{ marginTop: 3 }} />
                  <EditableText edit={edit} path={['consentText']} value={consentText} as="span" multiline />
                </label>
              ) : null}

              {status === 'error' ? (
                <p className="ud-small" role="alert" style={{ marginTop: 10, color: '#b91c1c' }}>
                  {message}
                </p>
              ) : null}

              {str(props.footnote) || edit ? (
                <EditableText
                  edit={edit}
                  path={['footnote']}
                  value={str(props.footnote)}
                  as="p"
                  className="ud-small"
                  style={{ marginTop: 10, opacity: 0.75 }}
                  placeholder="Small print"
                />
              ) : null}
            </form>
          </Body>
        )}
      </SectionShell>
    )
  },
  settings: null,
})
