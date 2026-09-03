import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, CreditCard, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Product } from '@uidesired/types'
import { paymentsApi, productsApi } from '../lib/endpoints'
import { Badge, Button, Card, DataTable, EmptyState, Input, Label, PageHeader, Select } from '../ui/primitives'

/**
 * Products, and the Stripe account they are sold through.
 *
 * Prices are held in minor units everywhere - the API, the database and the
 * Stripe call - so this screen is the one place they are turned into and back
 * out of something a person types.
 */

const CURRENCIES = ['USD', 'GBP', 'EUR', 'AUD', 'CAD', 'AED', 'INR']

function toMinor(value: string): number {
  const amount = Number.parseFloat(value)
  // Rounded rather than truncated, so 19.99 does not become 1998 through the
  // usual floating point.
  return Number.isFinite(amount) ? Math.max(0, Math.round(amount * 100)) : 0
}

function toMajor(minor: number): string {
  return ((Number.isFinite(minor) ? minor : 0) / 100).toFixed(2)
}

function money(minor: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(minor / 100)
  } catch {
    return `${currency} ${toMajor(minor)}`
  }
}

type Draft = {
  name: string
  description: string
  price: string
  currency: string
  type: 'one_time' | 'subscription'
  interval: 'day' | 'week' | 'month' | 'year'
  status: 'draft' | 'active' | 'archived'
  inventory: string
  success_url: string
}

function emptyDraft(currency: string): Draft {
  return {
    name: '',
    description: '',
    price: '0.00',
    currency,
    type: 'one_time',
    interval: 'month',
    status: 'draft',
    inventory: '',
    success_url: '',
  }
}

function draftFrom(product: Product): Draft {
  return {
    name: product.name,
    description: product.description || '',
    price: toMajor(product.price),
    currency: product.currency,
    type: product.type,
    interval: product.interval || 'month',
    status: product.status,
    inventory: product.inventory === null || product.inventory === undefined ? '' : String(product.inventory),
    success_url: product.success_url || '',
  }
}

function StripePanel() {
  const qc = useQueryClient()
  const settings = useQuery({ queryKey: ['payments'], queryFn: paymentsApi.get })
  const [secret, setSecret] = useState('')
  const [webhook, setWebhook] = useState('')
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  const save = useMutation({
    mutationFn: paymentsApi.update,
    onSuccess: () => {
      // Cleared so a key is never left sitting in the DOM after it is stored.
      setSecret('')
      setWebhook('')
      setMessage({ text: 'Saved.', ok: true })
      void qc.invalidateQueries({ queryKey: ['payments'] })
    },
    onError: (error: Error) => setMessage({ text: error.message, ok: false }),
  })

  const verify = useMutation({
    mutationFn: paymentsApi.verify,
    onSuccess: (result) => {
      setMessage({ text: result.message, ok: result.ok })
      void qc.invalidateQueries({ queryKey: ['payments'] })
    },
    onError: (error: Error) => setMessage({ text: error.message, ok: false }),
  })

  const disconnect = useMutation({
    mutationFn: paymentsApi.disconnect,
    onSuccess: () => {
      setMessage({ text: 'Disconnected.', ok: true })
      void qc.invalidateQueries({ queryKey: ['payments'] })
    },
  })

  const data = settings.data
  if (!data) return null

  return (
    <Card className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-zinc-400" />
          <h2 className="text-sm font-semibold">Your Stripe account</h2>
        </div>
        <div className="flex items-center gap-2">
          {data.connected ? (
            <Badge tone={data.verified_at ? 'success' : 'neutral'}>
              {data.verified_at ? `Verified · ${data.mode}` : `Key stored · ${data.mode}`}
            </Badge>
          ) : (
            <Badge tone="neutral">Not connected</Badge>
          )}
        </div>
      </div>

      <p className="mb-4 text-xs text-zinc-500">
        Payments go straight to your own Stripe account. We never hold the money, and your keys are stored encrypted
        and never shown again.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label>Secret key</Label>
          <Input
            type="password"
            autoComplete="off"
            placeholder={data.connected ? `Stored · ends ${data.secret_hint}` : 'sk_live_… or sk_test_…'}
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
          />
          <p className="mt-1 text-[11px] text-zinc-500">Leave blank to keep the key you already saved.</p>
        </div>
        <div>
          <Label>Webhook signing secret</Label>
          <Input
            type="password"
            autoComplete="off"
            placeholder={data.webhook_set ? 'Stored' : 'whsec_…'}
            value={webhook}
            onChange={(event) => setWebhook(event.target.value)}
          />
          <p className="mt-1 text-[11px] text-zinc-500">From the webhook you add in Stripe, below.</p>
        </div>
      </div>

      <div className="mt-3">
        <Label>Send Stripe webhooks here</Label>
        {/* Read-only: this is the address to paste into Stripe, and it exists
            before any key has been entered. */}
        <Input readOnly value={data.webhook_url} onFocus={(event) => event.currentTarget.select()} />
        <p className="mt-1 text-[11px] text-zinc-500">
          In Stripe: Developers → Webhooks → Add endpoint, and send <code>checkout.session.completed</code>. Orders
          stay unpaid until this is set up.
        </p>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <Label>Default currency</Label>
          <Select
            value={data.currency}
            onChange={(event) => save.mutate({ currency: event.target.value })}
          >
            {CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={data.enabled}
              onChange={(event) => save.mutate({ enabled: event.target.checked })}
            />
            Accept payments
          </label>
        </div>
      </div>

      {data.last_error ? <p className="mt-3 text-xs text-red-600">{data.last_error}</p> : null}
      {data.secret_unreadable ? (
        <p className="mt-3 text-xs text-amber-600">
          The stored key can no longer be read — this happens when APP_KEY changes. Enter it again.
        </p>
      ) : null}
      {message ? (
        <p className={`mt-3 text-xs ${message.ok ? 'text-emerald-600' : 'text-red-600'}`}>{message.text}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          onClick={() =>
            save.mutate({
              ...(secret ? { secret_key: secret } : {}),
              ...(webhook ? { webhook_secret: webhook } : {}),
            })
          }
          disabled={save.isPending || (!secret && !webhook)}
        >
          {save.isPending ? 'Saving…' : 'Save keys'}
        </Button>
        <Button variant="outline" onClick={() => verify.mutate()} disabled={verify.isPending || !data.connected}>
          {verify.isPending ? 'Checking…' : 'Test connection'}
        </Button>
        {data.connected ? (
          <Button variant="ghost" onClick={() => disconnect.mutate()} disabled={disconnect.isPending}>
            Disconnect
          </Button>
        ) : null}
      </div>
    </Card>
  )
}

export function ProductsPage() {
  const qc = useQueryClient()
  const settings = useQuery({ queryKey: ['payments'], queryFn: paymentsApi.get })
  const products = useQuery({ queryKey: ['products'], queryFn: () => productsApi.list() })

  const [editing, setEditing] = useState<Product | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft('USD'))
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // A new product starts in the currency the shop is set up for.
  useEffect(() => {
    if (!open && settings.data) setDraft(emptyDraft(settings.data.currency))
  }, [open, settings.data])

  function edit(product: Product) {
    setEditing(product)
    setDraft(draftFrom(product))
    setOpen(true)
    setError(null)
  }

  function startNew() {
    setEditing(null)
    setDraft(emptyDraft(settings.data?.currency || 'USD'))
    setOpen(true)
    setError(null)
  }

  const body = () => ({
    name: draft.name,
    description: draft.description || null,
    price: toMinor(draft.price),
    currency: draft.currency,
    type: draft.type,
    interval: draft.type === 'subscription' ? draft.interval : null,
    status: draft.status,
    inventory: draft.inventory === '' ? null : Math.max(0, Number.parseInt(draft.inventory, 10) || 0),
    success_url: draft.success_url || null,
  })

  const save = useMutation({
    mutationFn: () => (editing ? productsApi.update(editing.id, body()) : productsApi.create(body())),
    onSuccess: () => {
      setOpen(false)
      void qc.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err: Error) => setError(err.message),
  })

  const remove = useMutation({
    mutationFn: (id: number) => productsApi.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['products'] }),
  })

  const list = products.data || []

  return (
    <div>
      <PageHeader
        title="Products"
        description="What this workspace sells, on its websites and in its funnels."
        actions={
          <Button onClick={startNew}>
            <Plus size={14} /> New product
          </Button>
        }
      />

      <StripePanel />

      {open ? (
        <Card className="mb-6">
          <h2 className="mb-3 text-sm font-semibold">{editing ? `Edit ${editing.name}` : 'New product'}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as Draft['status'] })}
              >
                <option value="draft">Draft — not for sale</option>
                <option value="active">Active — on sale</option>
                <option value="archived">Archived</option>
              </Select>
            </div>
            <div>
              <Label>Price</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: e.target.value })}
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Select value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value })}>
                {CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Charge</Label>
              <Select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as Draft['type'] })}>
                <option value="one_time">Once</option>
                <option value="subscription">Repeating</option>
              </Select>
            </div>
            {draft.type === 'subscription' ? (
              <div>
                <Label>Every</Label>
                <Select
                  value={draft.interval}
                  onChange={(e) => setDraft({ ...draft, interval: e.target.value as Draft['interval'] })}
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </Select>
              </div>
            ) : (
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Unlimited"
                  value={draft.inventory}
                  onChange={(e) => setDraft({ ...draft, inventory: e.target.value })}
                />
              </div>
            )}
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Where to send the buyer afterwards</Label>
              <Input
                placeholder="https://example.com/thank-you"
                value={draft.success_url}
                onChange={(e) => setDraft({ ...draft, success_url: e.target.value })}
              />
            </div>
          </div>

          {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}

          <div className="mt-4 flex gap-2">
            <Button onClick={() => save.mutate()} disabled={save.isPending || !draft.name.trim()}>
              {save.isPending ? 'Saving…' : editing ? 'Save changes' : 'Create product'}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      ) : null}

      {list.length === 0 ? (
        <EmptyState
          title="Nothing for sale yet"
          description="Add a product, then drop a Buy button onto a page or a funnel step."
        >
          <Button onClick={startNew}>New product</Button>
        </EmptyState>
      ) : (
        <Card>
          <DataTable headers={['Product', 'Price', 'Status', 'Stock', '']}>
            {list.map((product) => (
              <tr key={product.id} className="border-t border-zinc-100">
                <td className="px-3 py-2">
                  <button type="button" className="text-left font-medium hover:underline" onClick={() => edit(product)}>
                    {product.name}
                  </button>
                  <div className="text-[11px] text-zinc-500">
                    {product.type === 'subscription' ? `Every ${product.interval}` : 'One-off'} · id {product.id}
                  </div>
                </td>
                <td className="px-3 py-2">{money(product.price, product.currency)}</td>
                <td className="px-3 py-2">
                  <Badge tone={product.status === 'active' ? 'success' : 'neutral'}>
                    {product.status === 'active' ? (
                      <>
                        <Check size={11} /> On sale
                      </>
                    ) : (
                      product.status
                    )}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-zinc-500">
                  {product.inventory === null || product.inventory === undefined ? 'Unlimited' : product.inventory}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    title="Delete product"
                    className="p-1 text-zinc-400 hover:text-red-500"
                    onClick={() => remove.mutate(product.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </DataTable>
        </Card>
      )}
    </div>
  )
}
