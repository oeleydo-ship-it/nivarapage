import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FieldControl } from './components/FieldControls'

describe('element appearance inspector', () => {
  it('saves button appearance separately from label typography and resets only appearance', () => {
    const change = vi.fn()
    render(<FieldControl field={{ key: 'buttonLabel', label: 'Button label', type: 'text', styleTarget: 'button' }}
      value="Start" values={{}} onChange={vi.fn()} context={{ device: 'desktop',
        elementStyles: { 'buttonLabel.$box': { backgroundColor: '#ff0000' }, buttonLabel: { color: '#ffffff' } },
        onElementStyleChange: change,
      }} />)
    const appearance = screen.getByText('Button appearance').closest('details')!
    expect(screen.queryByText('Individual text style')).toBeNull()
    expect(appearance.contains(screen.getByText('Text style'))).toBe(true)
    expect(appearance.contains(screen.getByText('Text color'))).toBe(true)
    expect(screen.getAllByText('Font family')).toHaveLength(1)
    fireEvent.click(screen.getByText('Button appearance'))
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '100%' } })
    expect(change).toHaveBeenLastCalledWith(['buttonLabel', '$box'], { backgroundColor: '#ff0000', width: '100%' })
    fireEvent.click(screen.getByText('Reset appearance'))
    expect(change).toHaveBeenLastCalledWith(['buttonLabel', '$box'], undefined)
  })
})
