import { fireEvent, render, screen, within } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'
import { BlockRenderer, getBlock } from '@uidesired/blocks'

/**
 * `pricing.junction` is the one block in the library with real interaction:
 * the segment tabs each carry their own plan set, and the volume slider picks
 * a price per stop. These assert both, plus the v1 fallback.
 */
function renderPricing(props: Record<string, unknown> = {}) {
  const def = getBlock('pricing.junction')
  if (!def) throw new Error('pricing.junction is not registered')
  return render(<BlockRenderer type="pricing.junction" props={{ ...def.defaultProps, ...props }} />)
}

function planNames(container: HTMLElement): string[] {
  return [...container.querySelectorAll('.ud-jn-plan__name')].map((n) => n.textContent?.trim() ?? '')
}

function priceOf(container: HTMLElement, planIndex: number): string {
  const plan = container.querySelectorAll('.ud-jn-plan')[planIndex] as HTMLElement
  return within(plan).getByText(/^\$|Let us talk|—/).textContent?.trim() ?? ''
}

describe('pricing.junction', () => {
  it('swaps the whole plan set when another segment tab is clicked', () => {
    const { container } = renderPricing()
    expect(planNames(container)).toEqual(['Free', 'Builder', 'Crew', 'Enterprise'])

    fireEvent.click(screen.getByText('Agents'))
    expect(planNames(container)).toEqual(['Trial', 'Squad', 'Fleet'])

    fireEvent.click(screen.getByText('Assistants'))
    expect(planNames(container)).toEqual(['Starter', 'Desk', 'Company'])

    fireEvent.click(screen.getByText('Full runtime'))
    expect(planNames(container)).toEqual(['Free', 'Builder', 'Crew', 'Enterprise'])
  })

  it('marks the clicked tab as active', () => {
    const { container } = renderPricing()
    fireEvent.click(screen.getByText('Agents'))
    const active = container.querySelector('.ud-jn-seg__btn.is-on')
    expect(active?.textContent?.trim()).toBe('Agents')
  })

  it('reprices every plan as the volume slider is dragged', () => {
    const { container } = renderPricing()
    const slider = container.querySelector('.ud-jn-slider__range') as HTMLInputElement
    expect(slider).toBeTruthy()

    // Default stop is index 2 (10K) and yearly billing is preselected.
    expect(container.querySelector('.ud-jn-slider__value strong')?.textContent).toBe('10K')
    expect(priceOf(container, 1)).toBe('$66')

    fireEvent.change(slider, { target: { value: '0' } })
    expect(container.querySelector('.ud-jn-slider__value strong')?.textContent).toBe('750')
    expect(priceOf(container, 1)).toBe('$20')

    fireEvent.change(slider, { target: { value: '6' } })
    expect(container.querySelector('.ud-jn-slider__value strong')?.textContent).toBe('1M')
    expect(priceOf(container, 1)).toBe('$817')
  })

  it('switches between the monthly and yearly price lists', () => {
    const { container } = renderPricing()
    // yearly is the default selection
    expect(priceOf(container, 1)).toBe('$66')
    fireEvent.click(screen.getByText('Billed monthly'))
    expect(priceOf(container, 1)).toBe('$79')
    fireEvent.click(screen.getByText(/Billed yearly/))
    expect(priceOf(container, 1)).toBe('$66')
  })

  it('highlights the slider stop that matches the current value', () => {
    const { container } = renderPricing()
    const slider = container.querySelector('.ud-jn-slider__range') as HTMLInputElement
    fireEvent.change(slider, { target: { value: '4' } })
    expect(container.querySelector('.ud-jn-slider__tick.is-on')?.textContent).toBe('100K')
  })

  it('falls back to a v1 page that still stores plans in a flat items array', () => {
    const { container } = renderPricing({
      segments: [{ label: 'Platform', plans: [] }],
      addOns: [],
      items: [
        { name: 'Legacy One', price: '$11', unit: '/mo', features: 'Kept working' },
        { name: 'Legacy Two', price: '$22', unit: '/mo', features: 'Also kept working' },
      ],
    })
    expect(planNames(container)).toEqual(['Legacy One', 'Legacy Two'])
    expect(priceOf(container, 0)).toBe('$11')
  })
})
