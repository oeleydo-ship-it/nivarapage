'use client'

import type { FormEvent, ReactNode } from 'react'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { EditableText, type EditBinding, type EditPath } from './editable'
import { Container, Heading, Section } from './primitives'

export type PublicFormField = {
  name: string
  label?: string
  type?: string
  required?: boolean
  placeholder?: string
  hideLabel?: boolean
  options?: Array<string | { label: string; value: string }>
}

type FormPageContextValue = { pageId?: string | number | null; formApiBase?: string }

const FormPageContext = createContext<FormPageContextValue>({})

export function FormPageProvider({
  pageId,
  formApiBase,
  children,
}: {
  pageId?: string | number | null
  formApiBase?: string
  children: ReactNode
}) {
  return <FormPageContext.Provider value={{ pageId, formApiBase }}>{children}</FormPageContext.Provider>
}

function formEndpoints(preferred?: string): string[] {
  const bases = [preferred, '/api/forms', '/api/v1/public/forms']
    .map((value) => (typeof value === 'string' ? value.replace(/\/$/, '') : ''))
    .filter(Boolean)
  return [...new Set(bases)]
}

async function readJson(response: Response): Promise<Record<string, unknown> | null> {
  try {
    return (await response.json()) as Record<string, unknown>
  } catch {
    return null
  }
}

function errorMessage(json: Record<string, unknown> | null, fallback: string): string {
  if (!json) return fallback
  if (typeof json.message === 'string' && json.message.trim()) return json.message
  const errors = json.errors
  if (errors && typeof errors === 'object') {
    const first = Object.values(errors as Record<string, unknown>)[0]
    if (Array.isArray(first) && typeof first[0] === 'string') return first[0]
    if (typeof first === 'string') return first
  }
  return fallback
}

type Schema = {
  id: number
  name: string
  success_message?: string
  turnstile_enabled?: boolean
  turnstile_site_key?: string | null
  fields: PublicFormField[]
}

function optionValue(option: string | { label: string; value: string }) {
  return typeof option === 'string' ? option : option.value
}

function optionLabel(option: string | { label: string; value: string }) {
  return typeof option === 'string' ? option : option.label
}

export function PublicForm({
  formId,
  heading,
  fields,
  layout = 'stack',
  submitLabel,
  chrome = false,
  variant = 'default',
  choiceOptions,
  edit,
  submitLabelPath,
  choicePath,
}: {
  formId?: string | number
  heading?: string
  fields?: PublicFormField[]
  layout?: 'stack' | 'inline'
  submitLabel?: string
  /** Wrap the form in its own themed section (legacy standalone usage). */
  chrome?: boolean
  /** Optional block-specific presentation that keeps the shared submission pipeline. */
  variant?: 'default' | 'cinder'
  /** Editable choices used by editorial form variants. */
  choiceOptions?: string[]
  /** Builder binding, so the submit label is editable on the canvas like other copy. */
  edit?: EditBinding
  submitLabelPath?: EditPath
  /** Repeater the choices came from, so each pill edits its own item. */
  choicePath?: (index: number) => EditPath
}) {
  const { pageId, formApiBase } = useContext(FormPageContext)
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [schema, setSchema] = useState<Schema | null>(null)
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null)
  const turnstileTokenRef = useRef<HTMLInputElement | null>(null)
  const turnstileWidgetRef = useRef<string | number | null>(null)

  useEffect(() => {
    if (!formId) return
    let cancelled = false
    const endpoints = formEndpoints(formApiBase)
    ;(async () => {
      for (const base of endpoints) {
        try {
          const res = await fetch(`${base}/${formId}`, { headers: { Accept: 'application/json' } })
          if (!res.ok) continue
          const json = await readJson(res)
          if (cancelled || !json) return
          const data = ((json.data || json) as Schema) || null
          if (data?.id) {
            setSchema(data)
            return
          }
        } catch {
          // Try the next known public form URL (dashboard vs published renderer).
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [formId, formApiBase])

  useEffect(() => {
    const siteKey = schema?.turnstile_site_key
    if (!schema?.turnstile_enabled || !siteKey) return
    let cancelled = false

    type TurnstileApi = {
      render: (container: HTMLElement, options: Record<string, unknown>) => string | number
      remove?: (widgetId: string | number) => void
      reset?: (widgetId: string | number) => void
    }
    const turnstileWindow = window as typeof window & { turnstile?: TurnstileApi }

    const renderWidget = () => {
      if (cancelled || !turnstileWindow.turnstile || !turnstileContainerRef.current || turnstileWidgetRef.current !== null) return
      turnstileWidgetRef.current = turnstileWindow.turnstile.render(turnstileContainerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          if (turnstileTokenRef.current) turnstileTokenRef.current.value = token
        },
        'expired-callback': () => {
          if (turnstileTokenRef.current) turnstileTokenRef.current.value = ''
        },
        'error-callback': () => {
          if (turnstileTokenRef.current) turnstileTokenRef.current.value = ''
        },
      })
    }

    let script = document.querySelector<HTMLScriptElement>('script[data-uidesired-turnstile]')
    if (!script) {
      script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      script.dataset.uidesiredTurnstile = 'true'
      document.head.appendChild(script)
    }
    if (turnstileWindow.turnstile) renderWidget()
    else script.addEventListener('load', renderWidget, { once: true })

    return () => {
      cancelled = true
      script?.removeEventListener('load', renderWidget)
      if (turnstileWidgetRef.current !== null) {
        turnstileWindow.turnstile?.remove?.(turnstileWidgetRef.current)
        turnstileWidgetRef.current = null
      }
    }
  }, [schema?.turnstile_enabled, schema?.turnstile_site_key])

  const resolvedFields = schema?.fields?.length
    ? schema.fields
    : fields?.length
      ? fields
      : [
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'message', label: 'Message', type: 'textarea', required: true },
        ]

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!formId) {
      if (formApiBase === 'funnel') {
        const payload: Record<string, unknown> = Object.fromEntries(new FormData(form).entries())
        delete payload.website
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('uidesired:form-submitted', { detail: { contact: payload } }))
        setStatus('ok')
        setMessage('Thanks — we received your details.')
        form.reset()
        return
      }
      setStatus('error')
      setMessage('This form is not connected yet. Choose a form in the builder.')
      return
    }
    const data = new FormData(form)
    const payload: Record<string, unknown> = Object.fromEntries(data.entries())
    payload.website = String(payload.website || '')
    if (pageId) payload.page_id = pageId
    try {
      let response: Response | null = null
      let json: Record<string, unknown> | null = null
      for (const base of formEndpoints(formApiBase)) {
        response = await fetch(`${base}/${formId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        })
        json = await readJson(response)
        if (response.status !== 404) break
      }
      if (!response || !response.ok) {
        throw new Error(errorMessage(json, 'Unable to send.'))
      }
      setStatus('ok')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('uidesired:form-submitted', { detail: { form_id: formId, contact: payload } }))
      }
      setMessage(schema?.success_message || 'Thanks — we received your message.')
      form.reset()
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error && error.message ? error.message : 'Something went wrong. Please try again.')
      const turnstileWindow = window as typeof window & { turnstile?: { reset?: (widgetId: string | number) => void } }
      if (turnstileWidgetRef.current !== null) turnstileWindow.turnstile?.reset?.(turnstileWidgetRef.current)
      if (turnstileTokenRef.current) turnstileTokenRef.current.value = ''
    }
  }

  const fieldNodes = resolvedFields.map((field) => {
    const options = field.options || []
    const label = field.label || field.name
    const labelNode = field.hideLabel ? <span className="ud-sr-only">{label}</span> : <span>{label}</span>

    if (field.type === 'textarea') {
      return (
        <label key={field.name} className="ud-field">
          {labelNode}
          <textarea
            className="ud-input"
            name={field.name}
            required={field.required}
            rows={4}
            placeholder={field.placeholder}
          />
        </label>
      )
    }
    if (field.type === 'select') {
      return (
        <label key={field.name} className="ud-field">
          {labelNode}
          <select className="ud-input" name={field.name} required={field.required} defaultValue="">
            <option value="">Select</option>
            {options.map((option) => (
              <option key={optionValue(option)} value={optionValue(option)}>
                {optionLabel(option)}
              </option>
            ))}
          </select>
        </label>
      )
    }
    if (field.type === 'checkbox') {
      return (
        <label key={field.name} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input type="checkbox" name={field.name} value="1" required={field.required} />
          <span>{label}</span>
        </label>
      )
    }
    if (field.type === 'radio') {
      return (
        <fieldset key={field.name} style={{ border: 0, padding: 0, display: 'grid', gap: 8 }}>
          <legend style={{ fontSize: '.85rem', fontWeight: 600 }}>{label}</legend>
          {options.map((option) => (
            <label key={optionValue(option)} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="radio" name={field.name} value={optionValue(option)} required={field.required} />
              {optionLabel(option)}
            </label>
          ))}
        </fieldset>
      )
    }
    return (
      <label key={field.name} className="ud-field">
        {labelNode}
        <input
          className="ud-input"
          name={field.name}
          type={field.type === 'phone' ? 'tel' : field.type || 'text'}
          required={field.required}
          placeholder={field.placeholder}
        />
      </label>
    )
  })

  const statusNode = status !== 'idle' ? (
    <p
      className="ud-form__status"
      role={status === 'error' ? 'alert' : 'status'}
      data-status={status}
      style={{ margin: 0, fontSize: '.9rem', color: status === 'error' ? '#dc2626' : 'inherit' }}
    >
      {message}
    </p>
  ) : null

  const antiSpamNode = (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', height: 0, overflow: 'hidden' }}>
      <label>
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  )

  const turnstileNode = schema?.turnstile_enabled && schema.turnstile_site_key ? (
    <div className="ud-turnstile">
      <div ref={turnstileContainerRef} />
      <input ref={turnstileTokenRef} type="hidden" name="cf-turnstile-response" />
    </div>
  ) : null

  const cinderRequired = new Map(resolvedFields.map((field) => [field.name, Boolean(field.required)]))
  const cinderChoices = choiceOptions?.length
    ? choiceOptions
    : resolvedFields.find((field) => field.name === 'service')?.options?.map(optionLabel) || []
  const cinderForm = (
    <form onSubmit={onSubmit} className="ud-form ud-form--cinder">
      {antiSpamNode}
      <div className="ud-cr-form__two">
        <label>NAME<input name="name" required={cinderRequired.get('name') ?? true} autoComplete="name" placeholder="Your name" /></label>
        <label>PHONE<input name="phone" type="tel" required={cinderRequired.get('phone')} autoComplete="tel" placeholder="Your number" /></label>
        <label>EMAIL<input name="email" type="email" required={cinderRequired.get('email') ?? true} autoComplete="email" placeholder="you@example.com" /></label>
        <label>POSTCODE<input name="postcode" required={cinderRequired.get('postcode')} autoComplete="postal-code" placeholder="N1" /></label>
      </div>
      <fieldset>
        <legend>WHAT DO YOU NEED?</legend>
        <div className="ud-cr-pills">
          {cinderChoices.map((choice, index) => (
            <label key={choice}>
              <input type="radio" name="service" value={choice} defaultChecked={index === 0} />
              <span>
                {edit && choicePath ? (
                  <EditableText edit={edit} path={choicePath(index)} value={choice} as="span" placeholder="Choice" />
                ) : (
                  choice
                )}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <label>TELL US A BIT MORE<textarea name="message" required={cinderRequired.get('message') ?? true} rows={6} placeholder="What happened, and when?" /></label>
      {turnstileNode}
      <button type="submit" className="ud-cr-button ud-cr-button--black" disabled={status === 'ok'}>
        {status === 'ok' ? 'Sent' : submitButton('Send it over')}
      </button>
      {statusNode}
    </form>
  )

  /** The label is plain text on a published page and inline editable in the builder. */
  function submitButton(fallback: string) {
    const label = submitLabel || fallback
    if (!edit || !submitLabelPath) return label
    return <EditableText edit={edit} path={submitLabelPath} value={label} as="span" placeholder="Button label" />
  }

  const formBody = variant === 'cinder' ? cinderForm : (
    <form onSubmit={onSubmit} className={layout === 'inline' ? 'ud-form ud-form--inline' : 'ud-form'}>
      {antiSpamNode}
      {fieldNodes}
      {turnstileNode}
      <button type="submit" className="ud-btn ud-btn--primary" disabled={status === 'ok'}>
        {status === 'ok' ? 'Sent' : submitButton(layout === 'inline' ? 'Subscribe' : 'Send')}
      </button>
      {statusNode}
    </form>
  )

  if (!chrome) return formBody

  if (layout === 'inline') {
    return (
      <Section>
        <Container style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Heading as="h3">{heading || 'Newsletter'}</Heading>
          {formBody}
        </Container>
      </Section>
    )
  }

  return (
    <Section>
      <Container>
        <Heading>{heading || 'Contact'}</Heading>
        <div style={{ marginTop: 20, maxWidth: 520 }}>{formBody}</div>
      </Container>
    </Section>
  )
}
