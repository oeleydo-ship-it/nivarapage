import { useState } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProductMediaEditor } from './components/ProductMediaEditor'
import { mediaApi } from './lib/endpoints'

vi.mock('./lib/endpoints', () => ({ mediaApi: { upload: vi.fn() } }))
vi.mock('./components/MediaLibrary', () => ({ MediaPicker: () => null }))
afterEach(() => { cleanup(); vi.clearAllMocks() })
function setup(cover = '/cover.jpg', gallery = ['/second.jpg', '/third.jpg']) {
  const saved = vi.fn()
  const busy = vi.fn()
  function Host() {
    const [value, setValue] = useState({ cover, gallery })
    return <ProductMediaEditor {...value} onBusyChange={busy} onChange={(cover, gallery) => { saved(cover, gallery); setValue({ cover, gallery }) }} />
  }
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><Host /></QueryClientProvider>)
  return { saved, busy }
}
describe('product image management', () => {
  it('promotes a gallery image to cover and preserves the previous cover', () => {
    const { saved } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Select gallery image 2' }))
    fireEvent.click(screen.getByRole('button', { name: 'Make cover' }))
    expect(saved).toHaveBeenLastCalledWith('/third.jpg', ['/cover.jpg', '/second.jpg'])
    expect(screen.getByAltText('Product cover preview').getAttribute('src')).toBe('/third.jpg')
    fireEvent.click(screen.getByRole('button', { name: 'Remove selected image' }))
    expect(saved).toHaveBeenLastCalledWith('/cover.jpg', ['/second.jpg'])
  })
  it('changes the gallery display order using keyboard-accessible controls', () => {
    const { saved } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Select gallery image 1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Move later' }))
    expect(saved).toHaveBeenLastCalledWith('/cover.jpg', ['/third.jpg', '/second.jpg'])
  })
  it('retains successful uploads when another file fails and reports the failure', async () => {
    vi.mocked(mediaApi.upload).mockResolvedValueOnce({ url: '/uploaded.jpg' } as never).mockRejectedValueOnce(new Error('Storage full'))
    const { saved, busy } = setup('', [])
    fireEvent.change(screen.getByLabelText('Upload product images'), { target: { files: [new File(['a'], 'a.jpg', { type: 'image/jpeg' }), new File(['b'], 'b.png', { type: 'image/png' })] } })
    await waitFor(() => expect(saved).toHaveBeenLastCalledWith('/uploaded.jpg', []))
    expect(screen.getByRole('status').textContent).toContain('Storage full')
    expect(busy).toHaveBeenLastCalledWith(false)
  })
  it('rejects unsupported files before upload', () => {
    setup()
    fireEvent.change(screen.getByLabelText('Upload product images'), { target: { files: [new File(['x'], 'document.txt', { type: 'text/plain' })] } })
    expect(mediaApi.upload).not.toHaveBeenCalled()
    expect(screen.getByRole('status').textContent).toContain('skipped')
  })
})
