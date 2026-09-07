import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Copy, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Coupon, Product, Order } from '@uidesired/types'
import { ProductMediaEditor } from '../components/ProductMediaEditor'
import { couponsApi, ordersApi, paymentsApi, productsApi } from '../lib/endpoints'
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
  sku: string
  category: string
  images: string[]
  kind: 'physical' | 'digital'
  shippingPrice: string
  shippingCountries: string
  deliveryUrl: string
  name: string
  description: string
  image: string
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
    sku: '', category: '', images: [], kind: 'digital', shippingPrice: '0.00', shippingCountries: 'AE, US, GB', deliveryUrl: '',
    name: '',
    description: '',
    image: '',
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
    sku: product.metadata?.sku || '', category: product.metadata?.category || '', images: product.metadata?.images || [],
    kind: product.metadata?.kind || 'digital', shippingPrice: toMajor(product.metadata?.shipping_price || 0),
    shippingCountries: (product.metadata?.shipping_countries || ['AE', 'US', 'GB']).join(', '), deliveryUrl: product.metadata?.delivery_url || '',
    name: product.name,
    description: product.description || '',
    image: product.image || '',
    price: toMajor(product.price),
    currency: product.currency,
    type: product.type,
    interval: product.interval || 'month',
    status: product.status,
    inventory: product.inventory === null || product.inventory === undefined ? '' : String(product.inventory),
    success_url: product.success_url || '',
  }
}

/**
 * A quiet nudge that Stripe still needs setting up, without the full panel:
 * that configuration now lives in Settings → Payments, an account-level
 * concern rather than something edited alongside the catalogue.
 */
function PaymentsHint() {
  const settings = useQuery({ queryKey: ['payments'], queryFn: paymentsApi.get })
  if (!settings.data || settings.data.connected) return null

  return (
    <Card className="mb-6 flex items-center justify-between gap-3">
      <p className="text-xs text-zinc-500">
        Connect Stripe to start accepting payments for what you sell here.
      </p>
      <Link to="/settings?tab=payments">
        <Button variant="outline">Connect Stripe in Settings</Button>
      </Link>
    </Card>
  )
}

/**
 * What has actually been sold.
 *
 * Read only, on purpose: an order is opened by a checkout and settled by a
 * webhook from Stripe, so nothing here should be editable by hand - least of
 * all whether something was paid for.
 */
function OrderFulfillment({ order }: { order: Order }) {
  const qc = useQueryClient()
  const [status, setStatus] = useState(order.metadata?.fulfillment || 'unfulfilled')
  const [tracking, setTracking] = useState(order.metadata?.tracking_url || '')
  const update = useMutation({ mutationFn: () => ordersApi.fulfillment(order.id, { fulfillment: status, tracking_url: tracking || null }), onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }) })
  if (order.status !== 'paid') return <span className="text-xs text-zinc-500">Awaiting payment</span>
  if (order.metadata?.kind !== 'physical') return <span className="text-xs">{order.metadata?.fulfillment === 'delivered' ? 'Digital access available' : 'Digital order'}</span>
  const shipping = order.metadata?.shipping_address
  return <div className="min-w-48 space-y-2">
    {shipping ? <p className="text-xs text-zinc-500">{shipping.name}<br />{Object.values(shipping.address || {}).filter(Boolean).join(', ')}</p> : null}
    <Select aria-label={`Fulfillment ${order.reference}`} value={status} onChange={(e) => setStatus(e.target.value)}><option value="unfulfilled">Unfulfilled</option><option value="processing">Processing</option><option value="shipped">Shipped</option></Select>
    <Input aria-label={`Tracking URL ${order.reference}`} placeholder="Tracking URL (optional)" value={tracking} onChange={(e) => setTracking(e.target.value)} />
    <Button variant="outline" disabled={update.isPending} onClick={() => update.mutate()}>{update.isPending ? 'Saving...' : 'Save fulfillment'}</Button>
    {update.isSuccess ? <p className="text-xs text-green-700">Saved</p> : null}
    {update.isError ? <p role="alert" className="text-xs text-red-600">{update.error.message}</p> : null}
  </div>
}

function OrdersTab() {
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  // Debounced so a search is one request per pause, not one per keystroke.
  const [search, setSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setSearch(q.trim()), 300)
    return () => clearTimeout(timer)
  }, [q])

  const orders = useQuery({
    queryKey: ['orders', status, search],
    queryFn: () => ordersApi.list({ status: status || undefined, q: search || undefined }),
    placeholderData: (previous) => previous,
  })

  const list = orders.data || []
  const paid = list.filter((order) => order.status === 'paid')
  // Kept apart by currency. A shop selling in two of them has two totals, and
  // adding the numbers together would print one that means nothing.
  const totals = new Map<string, number>()
  for (const order of paid) {
    totals.set(order.currency, (totals.get(order.currency) || 0) + order.amount)
  }

  const filtered = Boolean(status || search)

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div className="max-w-xs flex-1">
          <Label>Search</Label>
          <Input placeholder="Reference or email" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="w-44">
          <Label>Status</Label>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Every order</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </Select>
        </div>
      </div>

      {orders.isLoading ? (
        <Card>Loading…</Card>
      ) : list.length === 0 ? (
        <EmptyState
          title={filtered ? 'Nothing matches' : 'No orders yet'}
          description={
            filtered
              ? 'No order matches that search.'
              : 'Orders appear here the moment Stripe tells us a checkout was paid.'
          }
        />
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <Card>
              <p className="text-xs text-zinc-500">Paid orders</p>
              <p className="text-xl font-semibold">{paid.length}</p>
            </Card>
            <Card>
              <p className="text-xs text-zinc-500">Taken</p>
              {totals.size === 0 ? (
                <p className="text-xl font-semibold">—</p>
              ) : (
                [...totals].map(([currency, amount]) => (
                  <p key={currency} className="text-xl font-semibold">
                    {money(amount, currency)}
                  </p>
                ))
              )}
            </Card>
          </div>

          <Card>
            <DataTable headers={['Reference', 'Product', 'Customer', 'Amount', 'Status', 'Paid', 'Fulfillment']}>
              {list.map((order) => (
                <tr key={order.id} className="border-t border-zinc-100">
                  <td className="px-3 py-2 font-mono text-[11px]">{order.reference}</td>
                  <td className="px-3 py-2">{order.product?.name || '—'}</td>
                  <td className="px-3 py-2">{order.customer_email || '—'}</td>
                  <td className="px-3 py-2">{money(order.amount, order.currency)}</td>
                  <td className="px-3 py-2">
                    <Badge tone={order.status === 'paid' ? 'success' : order.status === 'failed' ? 'danger' : 'neutral'}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-zinc-500">
                    {order.paid_at ? new Date(order.paid_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-3 py-2"><OrderFulfillment order={order} /></td>
                </tr>
              ))}
            </DataTable>
          </Card>
        </>
      )}
    </>
  )
}

/**
 * Discount codes.
 *
 * How many times a code has been used is shown but never editable: that number
 * is counted when money actually arrives, and typing it would hand a spent
 * code back out.
 */
function CouponsTab() {
  const qc = useQueryClient()
  const coupons = useQuery({ queryKey: ['coupons'], queryFn: couponsApi.list })
  const products = useQuery({ queryKey: ['products'], queryFn: () => productsApi.list() })
  const [draft, setDraft] = useState({
    code: '',
    type: 'percent' as Coupon['type'],
    value: '10',
    product_id: '',
    max_redemptions: '',
    expires_at: '',
  })
  const [error, setError] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: () =>
      couponsApi.create({
        code: draft.code,
        type: draft.type,
        // Percent is whole points; a fixed discount is minor units, like a
        // price. Both have to be whole numbers, so 10.5% is rounded here rather
        // than bounced back as a validation error.
        value: draft.type === 'percent' ? Math.round(Number(draft.value)) : toMinor(draft.value),
        product_id: draft.product_id ? Number(draft.product_id) : null,
        max_redemptions: draft.max_redemptions ? Number(draft.max_redemptions) : null,
        expires_at: draft.expires_at || null,
      }),
    onSuccess: () => {
      setDraft({ code: '', type: 'percent', value: '10', product_id: '', max_redemptions: '', expires_at: '' })
      setError(null)
      void qc.invalidateQueries({ queryKey: ['coupons'] })
    },
    onError: (err: Error) => setError(err.message),
  })

  const toggle = useMutation({
    mutationFn: (coupon: Coupon) =>
      couponsApi.update(coupon.id, { status: coupon.status === 'active' ? 'disabled' : 'active' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['coupons'] }),
  })

  const remove = useMutation({
    mutationFn: (id: number) => couponsApi.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['coupons'] }),
  })

  const list = coupons.data || []
  const named = new Map((products.data || []).map((product) => [product.id, product.name]))

  return (
    <>
      <Card className="mb-6">
        <h2 className="mb-3 text-sm font-semibold">New code</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <Label>Code</Label>
            <Input placeholder="SAVE20" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
            <p className="mt-1 text-[11px] text-zinc-500">Capitals do not matter to a shopper.</p>
          </div>
          <div>
            <Label>Takes off</Label>
            <Select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as Coupon['type'] })}>
              <option value="percent">A percentage</option>
              <option value="fixed">A fixed amount</option>
            </Select>
          </div>
          <div>
            <Label>{draft.type === 'percent' ? 'Percent off' : 'Amount off'}</Label>
            <Input
              type="number"
              min="0"
              max={draft.type === 'percent' ? '100' : undefined}
              step={draft.type === 'percent' ? '1' : '0.01'}
              value={draft.value}
              onChange={(e) => setDraft({ ...draft, value: e.target.value })}
            />
          </div>
          <div>
            <Label>Applies to</Label>
            <Select value={draft.product_id} onChange={(e) => setDraft({ ...draft, product_id: e.target.value })}>
              <option value="">Anything you sell</option>
              {(products.data || []).map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Limit</Label>
            <Input
              type="number"
              min="1"
              placeholder="Unlimited"
              value={draft.max_redemptions}
              onChange={(e) => setDraft({ ...draft, max_redemptions: e.target.value })}
            />
          </div>
          <div>
            <Label>Expires</Label>
            <Input type="date" value={draft.expires_at} onChange={(e) => setDraft({ ...draft, expires_at: e.target.value })} />
          </div>
        </div>

        {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}

        <div className="mt-4">
          <Button onClick={() => create.mutate()} disabled={create.isPending || !draft.code.trim()}>
            {create.isPending ? 'Creating...' : 'Create code'}
          </Button>
        </div>
      </Card>

      {list.length === 0 ? (
        <EmptyState
          title="No codes yet"
          description="A shopper types a code at checkout and the discount is worked out here, not on the page."
        />
      ) : (
        <Card>
          <DataTable headers={['Code', 'Discount', 'Applies to', 'Used', 'Expires', 'Status', '']}>
            {list.map((coupon) => (
              <tr key={coupon.id} className="border-t border-zinc-100">
                <td className="px-3 py-2 font-mono text-xs font-medium">{coupon.code}</td>
                <td className="px-3 py-2">
                  {coupon.type === 'percent' ? `${coupon.value}%` : money(coupon.value, coupon.currency || 'USD')}
                </td>
                <td className="px-3 py-2 text-zinc-500">
                  {coupon.product_id ? named.get(coupon.product_id) || `Product ${coupon.product_id}` : 'Anything'}
                </td>
                <td className="px-3 py-2 text-zinc-500">
                  {coupon.redeemed_count}
                  {coupon.max_redemptions ? ` / ${coupon.max_redemptions}` : ''}
                </td>
                <td className="px-3 py-2 text-zinc-500">
                  {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-3 py-2">
                  <button type="button" title="Switch this code on or off" onClick={() => toggle.mutate(coupon)}>
                    <Badge tone={coupon.status === 'active' ? 'success' : 'neutral'}>{coupon.status}</Badge>
                  </button>
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    title="Delete this code"
                    className="p-1 text-zinc-400 hover:text-red-500"
                    onClick={() => remove.mutate(coupon.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </DataTable>
        </Card>
      )}
    </>
  )
}

export function ProductsPage() {
  const [tab, setTab] = useState<'products' | 'orders' | 'coupons'>('products')
  const qc = useQueryClient()
  const settings = useQuery({ queryKey: ['payments'], queryFn: paymentsApi.get })

  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  // Debounced so a search is one request per pause, not one per keystroke.
  const [search, setSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setSearch(q.trim()), 300)
    return () => clearTimeout(timer)
  }, [q])
  const products = useQuery({
    queryKey: ['products', status, search],
    queryFn: () => productsApi.list({ status: status || undefined, q: search || undefined }),
    placeholderData: (previous) => previous,
  })

  const [mediaBusy, setMediaBusy] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft('USD'))
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // A new product starts in the currency the shop is set up for.
  useEffect(() => {
    if (!open && settings.data) setDraft(emptyDraft(settings.data.currency))
  }, [open, settings.data])

  function edit(product: Product) {
    if (mediaBusy) return
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
    image: draft.image || null,
    price: toMinor(draft.price),
    currency: draft.currency,
    type: draft.type,
    interval: draft.type === 'subscription' ? draft.interval : null,
    status: draft.status,
    inventory: draft.inventory === '' ? null : Math.max(0, Number.parseInt(draft.inventory, 10) || 0),
    success_url: draft.success_url || null,
    metadata: { ...editing?.metadata, sku: draft.sku.trim(), category: draft.category.trim(), images: draft.images.filter(Boolean),
      kind: draft.kind, shipping_price: toMinor(draft.shippingPrice),
      shipping_countries: [...new Set(draft.shippingCountries.split(',').map((code) => code.trim().toUpperCase()).filter(Boolean))],
      delivery_url: draft.deliveryUrl || undefined,
    },
  })

  const save = useMutation({
    mutationFn: () => {
      if (!Number.isFinite(Number(draft.price)) || Number(draft.price) < 0 || !draft.price.trim()) throw new Error('Enter a valid price.');
      if (draft.inventory !== '' && (!Number.isInteger(Number(draft.inventory)) || Number(draft.inventory) < 0)) throw new Error('Stock must be a whole number of zero or more.');
      if (draft.kind === 'physical' && (!Number.isFinite(Number(draft.shippingPrice)) || Number(draft.shippingPrice) < 0)) throw new Error('Enter a valid shipping charge.');
      if (draft.kind === 'digital' && draft.status === 'active' && !draft.deliveryUrl.trim()) throw new Error('Add a delivery URL before activating this digital product.');
      return editing ? productsApi.update(editing.id, body()) : productsApi.create(body());
    },
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

  const duplicate = useMutation({
    mutationFn: (product: Product) =>
      productsApi.create({
        name: `${product.name} (copy)`,
        description: product.description,
        image: product.image,
        price: product.price,
        currency: product.currency,
        type: product.type,
        interval: product.interval,
        status: 'draft',
        inventory: product.inventory,
        success_url: product.success_url,
        metadata: product.metadata,
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['products'] }),
  })

  const [stockFilter, setStockFilter] = useState('')
  const [kindFilter, setKindFilter] = useState('')
  const [sort, setSort] = useState('newest')
  const catalogue = products.data || []
  const list = catalogue.filter((product) => (!kindFilter || (product.metadata?.kind || 'digital') === kindFilter) &&
    (!stockFilter || (stockFilter === 'out' ? product.inventory === 0 : product.inventory != null && product.inventory > 0 && product.inventory <= 5)))
    .sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'price' ? a.currency.localeCompare(b.currency) || a.price - b.price : b.id - a.id)
  const filtered = Boolean(status || search || stockFilter || kindFilter)

  return (
    <div>
      <PageHeader
        title="Products"
        description="What this workspace sells, on its websites and in its funnels."
        actions={
          <Button onClick={startNew} disabled={mediaBusy}>
            <Plus size={14} /> New product
          </Button>
        }
      />

      <div className="mb-4 flex gap-1 border-b border-zinc-200">
        {(['products', 'orders', 'coupons'] as const).map((id) => (
          <button
            key={id}
            type="button"
            className={`px-3 py-2 text-sm capitalize ${
              tab === id ? 'border-b-2 border-blue-600 font-medium text-blue-700' : 'text-zinc-500 hover:text-zinc-800'
            }`}
            onClick={() => setTab(id)}
          >
            {id}
          </button>
        ))}
      </div>

      {tab === 'orders' ? <OrdersTab /> : null}

      {tab === 'coupons' ? <CouponsTab /> : null}

      {tab === 'products' ? <PaymentsHint /> : null}

      {tab === 'products' ? (
        <div className="mb-4 flex flex-wrap items-end gap-2">
          <div className="max-w-xs flex-1">
            <Label>Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 text-zinc-400" size={14} />
              <Input className="pl-8" placeholder="Name, SKU or category" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          <div className="w-44">
            <Label>Status</Label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Every status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
        </div>
      ) : null}

      {tab === 'products' ? <>
        <div className="mb-4 flex flex-wrap gap-3">
          <Select aria-label="Product type filter" value={kindFilter} onChange={(e) => setKindFilter(e.target.value)}><option value="">Physical and digital</option><option value="physical">Physical</option><option value="digital">Digital</option></Select>
          <Select aria-label="Stock filter" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}><option value="">All stock levels</option><option value="low">Low stock (1-5)</option><option value="out">Sold out</option></Select>
          <Select aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value)}><option value="newest">Newest first</option><option value="name">Name A-Z</option><option value="price">Price by currency</option></Select>
        </div>
        {products.isError || remove.isError || duplicate.isError ? <p role="alert" className="mb-4 text-sm text-red-600">{products.error?.message || remove.error?.message || duplicate.error?.message}</p> : null}
        <div className="mb-4 grid grid-cols-3 gap-3"><Card><p className="text-xs text-zinc-500">Matching products</p><strong>{list.length}</strong></Card><Card><p className="text-xs text-zinc-500">Active in view</p><strong>{list.filter((p) => p.status === 'active').length}</strong></Card><Card><p className="text-xs text-zinc-500">Low stock in view</p><strong>{list.filter((p) => p.inventory != null && p.inventory <= 5).length}</strong></Card></div>
      </> : null}

      {tab === 'products' && open ? (
        <Card className="mb-6">
          <h2 className="mb-3 text-sm font-semibold">{editing ? `Edit ${editing.name}` : 'New product'}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <ProductMediaEditor key={editing?.id || 'new'} cover={draft.image} gallery={draft.images}
                onBusyChange={setMediaBusy} onChange={(image, images) => setDraft((current) => ({ ...current, image, images }))} />
            </div>
            <div><Label>SKU</Label><Input value={draft.sku} onChange={(e) => setDraft({ ...draft, sku: e.target.value })} /></div>
            <div><Label>Category</Label><Input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} /></div>
            <div><Label>Product kind</Label><Select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as Draft['kind'], type: e.target.value === 'physical' ? 'one_time' : draft.type })}><option value="digital">Digital product</option><option value="physical">Physical product</option></Select></div>
            {draft.kind === 'physical' ? <>
              <div><Label>Flat shipping charge</Label><Input type="number" min="0" step="0.01" value={draft.shippingPrice} onChange={(e) => setDraft({ ...draft, shippingPrice: e.target.value })} /><p className="text-xs text-zinc-500">In the product currency. Zero means free shipping.</p></div>
              <div className="md:col-span-2"><Label>Ship to country codes</Label><Input placeholder="AE, US, GB" value={draft.shippingCountries} onChange={(e) => setDraft({ ...draft, shippingCountries: e.target.value })} /><p className="text-xs text-zinc-500">Two-letter country codes separated by commas.</p></div>
            </> : <div className="md:col-span-2"><Label>Digital delivery URL</Label><Input type="url" placeholder="https://..." value={draft.deliveryUrl} onChange={(e) => setDraft({ ...draft, deliveryUrl: e.target.value })} /><p className="text-xs text-zinc-500">Shown on the order confirmation page after payment is confirmed. Use your download or access-page URL.</p></div>}
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
                <option value="subscription" disabled={draft.kind === 'physical'}>Repeating (digital)</option>
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
              <textarea rows={5} className="w-full rounded-lg border border-zinc-300 p-3 text-sm" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Custom confirmation URL (optional)</Label>
              <Input
                placeholder="Leave blank to use the order receipt and digital delivery"
                value={draft.success_url}
                onChange={(e) => setDraft({ ...draft, success_url: e.target.value })}
              />
            </div>
          </div>

          {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}

          <div className="mt-4 flex gap-2">
            <Button onClick={() => save.mutate()} disabled={save.isPending || mediaBusy || !draft.name.trim()}>
              {save.isPending ? 'Saving…' : editing ? 'Save changes' : 'Create product'}
            </Button>
            <Button variant="ghost" disabled={mediaBusy || save.isPending} onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      ) : null}

      {tab !== 'products' ? null : products.isLoading ? <Card>Loading products...</Card> : list.length === 0 ? (
        <EmptyState
          title={filtered ? 'Nothing matches' : 'Nothing for sale yet'}
          description={
            filtered
              ? 'No product matches that search.'
              : 'Add a product, then drop a Buy button onto a page or a funnel step.'
          }
        >
          <Button onClick={startNew} disabled={mediaBusy}>New product</Button>
        </EmptyState>
      ) : (
        <Card>
          <DataTable headers={['Product', 'Price', 'Status', 'Stock', '']}>
            {list.map((product) => (
              <tr key={product.id} className="border-t border-zinc-100">
                <td className="px-3 py-2">
                  <button type="button" className="flex items-center gap-2 text-left font-medium hover:underline" onClick={() => edit(product)}>
                    {product.image ? (
                      <img src={product.image} alt="" className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <span className="h-8 w-8 rounded bg-zinc-100" />
                    )}
                    <span>
                      {product.name}
                      <div className="text-[11px] font-normal text-zinc-500">
                        {product.metadata?.sku ? `${product.metadata.sku} / ` : ''}{product.metadata?.kind || 'digital'} / {product.type === 'subscription' ? `Every ${product.interval}` : 'One-off'} · id {product.id}
                      </div>
                    </span>
                  </button>
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
                  {product.inventory === 0 ? 'Sold out' : product.inventory == null ? 'Unlimited' : product.inventory <= 5 ? `${product.inventory} - Low stock` : product.inventory}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    title="Duplicate product"
                    className="p-1 text-zinc-400 hover:text-zinc-700"
                    disabled={duplicate.isPending}
                    onClick={() => duplicate.mutate(product)}
                  >
                    <Copy size={14} />
                  </button>
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
