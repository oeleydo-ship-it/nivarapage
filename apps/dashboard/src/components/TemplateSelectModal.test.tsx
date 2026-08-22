import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Template } from '@uidesired/types'
import { TemplateSelectModal } from './TemplateSelectModal'

const template = {
  id: 5,
  name: 'AI Tool',
  slug: 'aitool',
  description: 'A dark SaaS starter kit',
  category: { id: 1, name: 'SaaS', slug: 'saas' },
} as Template

describe('TemplateSelectModal', () => {
  it('shows the selected template and continues from Next', () => {
    const onContinue = vi.fn()
    render(
      <TemplateSelectModal open template={template} onClose={() => undefined} onContinue={onContinue} />,
    )
    expect(screen.getByRole('dialog', { name: 'AI Tool' })).toBeTruthy()
    const preview = screen.getByRole('link', { name: 'Preview' })
    expect(preview.getAttribute('href')).toBe('/templates/aitool/preview')
    expect(preview.getAttribute('target')).toBe('_blank')
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(onContinue).toHaveBeenCalledTimes(1)
  })

  it('closes from Choose another and the overlay', () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <TemplateSelectModal open template={null} onClose={onClose} onContinue={() => undefined} />,
    )
    expect(screen.getByRole('dialog', { name: 'Start blank' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Choose another template' }))
    expect(onClose).toHaveBeenCalledTimes(1)

    rerender(<TemplateSelectModal open template={null} onClose={onClose} onContinue={() => undefined} />)
    fireEvent.click(screen.getByRole('presentation'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
