import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BlockPreviewModal } from './BlockPreviewModal'

describe('BlockPreviewModal', () => {
  it('renders a live block when opened', () => {
    render(
      <BlockPreviewModal
        target={{ title: 'SaaS Hero', type: 'hero.saas', subtitle: 'Built-in' }}
        onClose={() => undefined}
      />,
    )
    expect(screen.getByRole('dialog', { name: 'SaaS Hero' })).toBeTruthy()
    expect(screen.getByText('hero.saas')).toBeTruthy()
    expect(document.querySelector('[data-page-renderer]')).toBeTruthy()
  })

  it('closes from the close button and the overlay', () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <BlockPreviewModal target={{ title: 'Centered hero', type: 'hero.centered' }} onClose={onClose} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close preview' }))
    expect(onClose).toHaveBeenCalledTimes(1)

    rerender(<BlockPreviewModal target={{ title: 'Centered hero', type: 'hero.centered' }} onClose={onClose} />)
    fireEvent.click(screen.getByRole('presentation'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
