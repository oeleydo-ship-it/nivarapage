/**
 * Selling blocks.
 *
 * The page never decides what anything costs. A buy button carries a price so
 * the shopper can read one, but the charge is taken from the product row on the
 * server, so a stale page - or one edited in a browser - cannot change what is
 * actually taken.
 */
import { useState, type FormEvent } from 'react'
import { EditableText, editOf } from '../editable'
import { Body, Button, SectionShell, bool, str } from '../primitives'
import { number, schema, select, text, textarea, toggle } from '../schema'
import { defineBlock } from '../types'

/**
 * Formats minor units for reading.
 *
 * Money is whole pence or cents everywhere else, so this is the only place it
 * becomes a decimal.
 */
export function money(minor: number, currency: string): string {
  const amount = (Number.isFinite(minor) ? minor : 0) / 100
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(amount)
  } catch {
    // An invented currency code throws rather than falling back.
    return `${currency || ''} ${amount.toFixed(2)}`.trim()
  }
}

/* ------------------------------------------------------------- commerce.buy */

export const commerceBuy = defineBlock({
  type: 'commerce.buy',
  version: 1,
  category: 'cta',
  label: 'Buy button',
  icon: 'ShoppingCart',
  defaultProps: {
    productId: '',
    heading: 'Starter Kit',
    description: 'Everything you need to get going, delivered as soon as you order.',
    price: 4900,
    currency: 'USD',
    buttonLabel: 'Buy now',
    askForEmail: true,
    footnote: 'Secure checkout by Stripe.',
    align: 'center',
  },
  schema: schema(
    text('productId', 'Product', { help: 'Which product this button sells.' }),
    text('heading', 'Title'),
    textarea('description', 'Description'),
    number('price', 'Displayed price', 'content', { help: 'In minor units: 4900 is 49.00.' }),
    text('currency', 'Currency code'),
    text('buttonLabel', 'Button label'),
    toggle('askForEmail', 'Ask for an email first'),
    text('footnote', 'Small print'),
    select('align', 'Alignment', [['center', 'Centred'], ['left', 'Left']], 'layout'),
  ),
  component: function CommerceBuy(props) {
    const edit = editOf(props)
    const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
    const [message, setMessage] = useState('')
    const productId = str(props.productId).trim()
    const askForEmail = bool(props.askForEmail, true)
    const left = str(props.align, 'center') === 'left'

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault()
      if (status === 'sending') return

      if (!productId) {
        setStatus('error')
        setMessage('Choose a product for this button in the editor.')
        return
      }

      const email = str(new FormData(event.currentTarget).get('email')).trim()
      setStatus('sending')
      setMessage('')
      try {
        const response = await fetch(`/api/v1/public/products/${encodeURIComponent(productId)}/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            email: email || undefined,
            success_url: typeof window === 'undefined' ? undefined : window.location.href,
            cancel_url: typeof window === 'undefined' ? undefined : window.location.href,
          }),
        })
        const body = (await response.json()) as { data?: { url?: string }; message?: string }
        if (!response.ok || !body?.data?.url) {
          throw new Error(body?.message || 'Checkout is unavailable right now.')
        }
        // Stripe hosts the payment page, so no card detail is ever typed here.
        if (typeof window !== 'undefined') window.location.assign(body.data.url)
      } catch (error) {
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Checkout is unavailable right now.')
      }
    }

    return (
      <SectionShell props={props} tone="default" align={left ? 'left' : 'center'}>
        <Body style={{ maxWidth: 520, margin: left ? undefined : '0 auto', textAlign: left ? 'left' : 'center' }}>
          <EditableText
            edit={edit}
            path={['heading']}
            value={str(props.heading)}
            as="h2"
            className="ud-h3"
            style={{ margin: 0 }}
            placeholder="What you are selling"
          />

          <p className="ud-h4" style={{ margin: '10px 0 0' }}>
            {money(Number(props.price) || 0, str(props.currency, 'USD'))}
          </p>

          <EditableText
            edit={edit}
            path={['description']}
            value={str(props.description)}
            as="p"
            style={{ marginTop: 10 }}
            placeholder="What the buyer gets"
            multiline
          />

          <form
            onSubmit={onSubmit}
            style={{ marginTop: 16, display: 'grid', gap: 10, justifyItems: left ? 'start' : 'center' }}
          >
            {askForEmail ? (
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="ud-input"
                placeholder="Email for the receipt"
                style={{ maxWidth: 320, width: '100%' }}
              />
            ) : null}

            <Button type="submit">
              <EditableText
                edit={edit}
                path={['buttonLabel']}
                value={str(props.buttonLabel, 'Buy now')}
                as="span"
                placeholder="Buy now"
              />
            </Button>
          </form>

          {status === 'error' ? (
            <p className="ud-small" role="alert" style={{ marginTop: 10, color: '#b91c1c' }}>
              {message}
            </p>
          ) : null}

          {/* Builder only. A button with no product is not something a shopper
              should ever meet, but whoever is building it has to see it. */}
          {edit && !productId ? (
            <p className="ud-small" style={{ marginTop: 10, color: '#b45309' }}>
              No product chosen yet — pick one in the panel on the right.
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
        </Body>
      </SectionShell>
    )
  },
  settings: null,
})
