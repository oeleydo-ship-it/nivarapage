import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InlineAiToolbar } from './InlineAiToolbar'

const rewrite = vi.fn()

vi.mock('../lib/endpoints', () => ({
  aiApi: { rewrite: (body: unknown) => rewrite(body) },
}))

/** Stands in for a block's editable text on the canvas. */
function canvasText(text = 'Ignite Your Brand with Voltera') {
  const section = document.createElement('div')
  section.setAttribute('data-section-id', 'sec_1')
  const heading = document.createElement('h1')
  heading.setAttribute('data-edit-path', 'heading')
  heading.setAttribute('contenteditable', 'true')
  heading.setAttribute('tabindex', '0')
  heading.textContent = text
  section.appendChild(heading)
  document.body.appendChild(section)
  return heading
}

describe('InlineAiToolbar', () => {
  beforeEach(() => {
    rewrite.mockReset()
    document.body.innerHTML = ''
  })

  it('stays out of the way until a piece of text is being edited', () => {
    render(<InlineAiToolbar siteId={14} onApply={() => undefined} />)
    expect(screen.queryByRole('toolbar')).toBeNull()

    const heading = canvasText()
    fireEvent.focusIn(heading)

    expect(screen.getByRole('toolbar', { name: /rewrite/i })).toBeTruthy()
  })

  it('rewrites only the focused string and writes it back to that field', async () => {
    rewrite.mockResolvedValue({ text: 'Ignite your brand with Voltera', usage: {} })
    const onApply = vi.fn()

    render(<InlineAiToolbar siteId={14} onApply={onApply} />)
    const heading = canvasText()
    fireEvent.focusIn(heading)

    fireEvent.click(screen.getByRole('button', { name: 'Improve' }))

    await waitFor(() => expect(onApply).toHaveBeenCalled())

    // Only this field's text is sent, and only this field is written back.
    expect(rewrite).toHaveBeenCalledWith(
      expect.objectContaining({ site_id: 14, text: 'Ignite Your Brand with Voltera', mode: 'improve' }),
    )
    expect(onApply).toHaveBeenCalledWith('sec_1', ['heading'], 'Ignite your brand with Voltera')
    expect(heading.textContent).toBe('Ignite your brand with Voltera')
  })

  it('addresses a repeater row by its numeric index', async () => {
    rewrite.mockResolvedValue({ text: 'Faster launches', usage: {} })
    const onApply = vi.fn()

    render(<InlineAiToolbar siteId="14" onApply={onApply} />)
    const section = document.createElement('div')
    section.setAttribute('data-section-id', 'sec_2')
    const label = document.createElement('span')
    label.setAttribute('data-edit-path', 'items.2.label')
    label.textContent = 'Speed'
    section.appendChild(label)
    document.body.appendChild(section)

    fireEvent.focusIn(label)
    fireEvent.click(screen.getByRole('button', { name: 'Shorten' }))

    await waitFor(() => expect(onApply).toHaveBeenCalled())
    // Strings here would write `{ "2": … }` and blocks read that as "no items".
    expect(onApply).toHaveBeenCalledWith('sec_2', ['items', 2, 'label'], 'Faster launches')
  })

  it('puts the original wording back from Undo', async () => {
    rewrite.mockResolvedValue({ text: 'Rewritten heading', usage: {} })
    const onApply = vi.fn()

    render(<InlineAiToolbar siteId={14} onApply={onApply} />)
    const heading = canvasText('Original heading')
    fireEvent.focusIn(heading)

    fireEvent.click(screen.getByRole('button', { name: 'Improve' }))
    await waitFor(() => expect(heading.textContent).toBe('Rewritten heading'))

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(heading.textContent).toBe('Original heading')
    expect(onApply).toHaveBeenLastCalledWith('sec_1', ['heading'], 'Original heading')
  })

  it('reports a failure instead of silently leaving the text alone', async () => {
    rewrite.mockRejectedValue(new Error('The AI is not configured.'))

    render(<InlineAiToolbar siteId={14} onApply={() => undefined} />)
    const heading = canvasText('Keep me')
    fireEvent.focusIn(heading)

    fireEvent.click(screen.getByRole('button', { name: 'Fix' }))

    await waitFor(() => expect(screen.getByText('The AI is not configured.')).toBeTruthy())
    expect(heading.textContent).toBe('Keep me')
  })

  it('does not call the AI for an empty field', async () => {
    render(<InlineAiToolbar siteId={14} onApply={() => undefined} />)
    const heading = canvasText('')
    fireEvent.focusIn(heading)

    fireEvent.click(screen.getByRole('button', { name: 'Expand' }))

    await waitFor(() => expect(screen.getByText(/nothing written here/i)).toBeTruthy())
    expect(rewrite).not.toHaveBeenCalled()
  })
})
