import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import type { Product } from '@uidesired/types'
import { createPortal } from 'react-dom'
import { money } from './blocks/commerce'

export type StoreProduct = Pick<Product, 'id' | 'name' | 'description' | 'image' | 'price' | 'currency' | 'type' | 'interval' | 'inventory'> & { sku?: string; category?: string; images?: string[]; kind?: string; shipping_price?: number }

export function ProductDetails({ product, onClose }: { product: StoreProduct; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [current, setCurrent] = useState(product)
  const [image, setImage] = useState(product.image || '')
  const [loading, setLoading] = useState(true)
  const [unavailable, setUnavailable] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    dialog.current?.showModal()
    return () => { previous?.focus() }
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/v1/public/products/${product.id}`, { headers: { Accept: 'application/json' }, signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 404 ? 'This product is no longer available.' : 'Unable to load this product. Please try again.')
        return response.json() as Promise<{ data: StoreProduct }>
      })
      .then(({ data }) => { setCurrent(data); setImage(data.image || '') })
      .catch((err: Error) => { if (err.name !== 'AbortError') { setUnavailable(true); setError(err.message) } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [product.id])
  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending || loading || unavailable || current.inventory === 0) return
    setSending(true); setError('')
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch(`/api/v1/public/products/${current.id}/checkout`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: form.get('email'), coupon: form.get('coupon') || undefined, success_url: window.location.href, cancel_url: window.location.href }),
      })
      const result = await response.json() as { data?: { url?: string }; message?: string }
      if (!response.ok || !result.data?.url) throw new Error(result.message || 'Checkout is unavailable. Please try again.')
      window.location.assign(result.data.url)
    } catch (err) { setError(err instanceof Error ? err.message : 'Checkout is unavailable.'); setSending(false) }
  }
  const images = [...new Set([current.image, ...(current.images || [])].filter((url): url is string => !!url))]
  return createPortal(<dialog ref={dialog} className="ud-product-dialog" aria-labelledby={titleId} onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <div className="ud-product-dialog__panel">
      <button type="button" className="ud-product-dialog__close" aria-label="Close product details" onClick={onClose}>×</button>
      <div className="ud-product-dialog__gallery">
        {image ? <img className="ud-product-dialog__image" src={image} alt={current.name} /> : <div className="ud-product-dialog__placeholder">{current.name.slice(0, 1)}</div>}
        {images.length > 1 ? <div className="ud-product-dialog__thumbnails">{images.map((url, index) => <button type="button" key={url} onClick={() => setImage(url)} aria-label={`View image ${index + 1}`} aria-pressed={image === url}><img src={url} alt="" /></button>)}</div> : null}
      </div>
      <div className="ud-product-dialog__info">
        {current.category ? <p className="ud-product-dialog__category">{current.category}</p> : null}
        <h2 id={titleId}>{current.name}</h2>
        <p className="ud-product-dialog__price">{money(current.price, current.currency)}{current.type === 'subscription' ? ` / ${current.interval || 'month'}` : ''}</p>
        {current.kind === 'physical' ? <p className="ud-product-dialog__stock">{current.shipping_price ? `Shipping: ${money(current.shipping_price, current.currency)}` : 'Free shipping'} · Delivery address collected at checkout</p> : current.kind === 'digital' ? <p className="ud-product-dialog__stock">Digital product</p> : null}
        <p className="ud-product-dialog__stock">{loading ? 'Checking availability...' : unavailable ? 'Unavailable' : current.inventory === 0 ? 'Sold out' : current.inventory != null && current.inventory <= 5 ? `Only ${current.inventory} left in stock` : 'In stock'}</p>
        {current.description ? <p className="ud-product-dialog__description">{current.description}</p> : null}
        {current.sku ? <p className="ud-product-dialog__sku">SKU: {current.sku}</p> : null}
        <form onSubmit={checkout} className="ud-product-dialog__checkout">
          <label>Email for your receipt<input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label>
          <label>Discount code (optional)<input name="coupon" maxLength={60} autoComplete="off" placeholder="Enter code" /></label>
          {error ? <p role="alert" className="ud-product-dialog__error">{error}</p> : null}
          <button type="submit" disabled={sending || loading || unavailable || current.inventory === 0}>{sending ? 'Opening checkout...' : current.inventory === 0 ? 'Sold out' : current.type === 'subscription' ? 'Subscribe' : 'Buy now'}</button>
          <p className="ud-product-dialog__note">Secure checkout powered by Stripe.</p>
        </form>
      </div>
    </div>
  </dialog>, document.body)
}
