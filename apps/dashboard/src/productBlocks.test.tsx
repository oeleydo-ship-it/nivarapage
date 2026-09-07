import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PageSection, Product } from '@uidesired/types'
import { BlockRenderer, getBlock } from '@uidesired/blocks'
import { withDashboardProducts } from './lib/productSections'
import { FieldControl } from './components/FieldControls'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })
beforeEach(() => { HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') } })
const products: Product[] = [
  { id: 1, workspace_id: 1, name: 'Selected product', slug: 'one', price: 4900, currency: 'USD', type: 'one_time', status: 'active' },
  { id: 2, workspace_id: 1, name: 'Unselected product', slug: 'two', price: 8900, currency: 'USD', type: 'one_time', status: 'active' },
  { id: 3, workspace_id: 1, name: 'Draft product', slug: 'three', price: 9900, currency: 'USD', type: 'one_time', status: 'draft' },
]
const section = (type: string): PageSection => ({ id: 'p', type, version: 1, hidden: false, props: { heading: 'Shop', productIds: ['1', '3', '999', '1'] } })
describe('dashboard product blocks', () => {
  it.each(['grid', 'featured', 'list'])('renders only selected active products in %s', (layout) => {
    const type = `products.${layout}`
    expect(getBlock(type)?.category).toBe('products')
    const [resolved] = withDashboardProducts([section(type)], products)
    render(<BlockRenderer section={resolved} />)
    expect(screen.getAllByText('Selected product')).toHaveLength(1)
    expect(screen.queryByText('Unselected product')).toBeNull()
    expect(screen.queryByText('Draft product')).toBeNull()
  })
  it('renders no sample products when nothing is selected', () => {
    const { container } = render(<BlockRenderer type="products.grid" props={{ productIds: [] }} />)
    expect(container.innerHTML).toBe('')
  })
  it('lets the owner select and remove catalogue products', () => {
    const onChange = vi.fn()
    render(<FieldControl field={{ key: 'productIds', type: 'products', label: 'Dashboard products' }} value={['1']} values={{}} onChange={onChange} context={{ products }} />)
    fireEvent.click(screen.getByLabelText('Unselected product'))
    expect(onChange).toHaveBeenLastCalledWith(['1', '2'])
    fireEvent.click(screen.getByLabelText('Selected product'))
    expect(onChange).toHaveBeenLastCalledWith([])
    expect((screen.getByRole('checkbox', { name: /Draft product/ }) as HTMLInputElement).disabled).toBe(true)
  })
})


describe('product shopping details', () => {
  it('opens fresh product details from a card and displays checkout errors', async () => {
    const request = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ data: { ...products[0], inventory: 2, price: 5900, kind: 'physical', shipping_price: 500 } }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ message: 'Invalid discount code.' }) })
    vi.stubGlobal('fetch', request)
    const [resolved] = withDashboardProducts([section('products.grid')], products)
    render(<BlockRenderer section={resolved} />)
    fireEvent.click(screen.getByRole('button', { name: 'View Selected product' }))
    await screen.findByText('Only 2 left in stock')
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('$59.00')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Email for your receipt'), { target: { value: 'buyer@example.com' } })
    fireEvent.change(screen.getByLabelText('Discount code (optional)'), { target: { value: 'INVALID' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Buy now' }).closest('form')!)
    await screen.findByRole('alert')
    expect(screen.getByRole('alert').textContent).toBe('Invalid discount code.')
    const payload = JSON.parse(request.mock.calls[1][1].body)
    expect(payload).not.toHaveProperty('price')
    expect(payload.coupon).toBe('INVALID')
    fireEvent.click(screen.getByRole('button', { name: 'Close product details' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })
  it('prevents checkout when a previously published product is now sold out', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { ...products[0], inventory: 0 } }) }))
    const [resolved] = withDashboardProducts([section('products.list')], products)
    render(<BlockRenderer section={resolved} />)
    fireEvent.click(screen.getByRole('button', { name: 'Selected product', exact: true }))
    await waitFor(() => expect((screen.getByRole('button', { name: 'Sold out' }) as HTMLButtonElement).disabled).toBe(true))
  })
})
