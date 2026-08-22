import { fireEvent, render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'
import { BlockRenderer, getBlock } from '@uidesired/blocks'

/**
 * `services.voltera` is the service list on the blue band. It has to start
 * closed so the panel does not cover the rows below it, and open the row the
 * visitor actually clicks.
 */
function renderServices(props: Record<string, unknown> = {}) {
  const def = getBlock('services.voltera')
  if (!def) throw new Error('services.voltera is not registered')
  return render(<BlockRenderer type="services.voltera" props={{ ...def.defaultProps, ...props }} />)
}

function rows(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll('.ud-vt-accordion__row')] as HTMLElement[]
}

function openCount(container: HTMLElement): number {
  return rows(container).filter((row) => row.classList.contains('is-open')).length
}

function headOf(container: HTMLElement, index: number): HTMLElement {
  return rows(container)[index].querySelector('.ud-vt-accordion__head') as HTMLElement
}

describe('services.voltera', () => {
  it('starts with every row closed', () => {
    const { container } = renderServices()
    expect(rows(container).length).toBeGreaterThan(1)
    expect(openCount(container)).toBe(0)
    expect(container.querySelector('.ud-vt-accordion__body')).toBeNull()
  })

  it('still shows every row title while closed', () => {
    const { container } = renderServices()
    const titles = [...container.querySelectorAll('.ud-vt-accordion__title')].map((n) => n.textContent?.trim())
    expect(titles).toContain('Digital Strategy Development')
    expect(titles).toContain('Email Marketing')
  })

  it('opens the row that was clicked, and only that row', () => {
    const { container } = renderServices()
    fireEvent.click(headOf(container, 2))

    expect(openCount(container)).toBe(1)
    expect(rows(container)[2].classList.contains('is-open')).toBe(true)
    expect(rows(container)[2].querySelector('.ud-vt-accordion__body')).not.toBeNull()
  })

  it('closes the open row when it is clicked again', () => {
    const { container } = renderServices()
    fireEvent.click(headOf(container, 1))
    expect(openCount(container)).toBe(1)

    fireEvent.click(headOf(container, 1))
    expect(openCount(container)).toBe(0)
  })

  it('moves the open state when a different row is clicked', () => {
    const { container } = renderServices()
    fireEvent.click(headOf(container, 0))
    expect(rows(container)[0].classList.contains('is-open')).toBe(true)

    fireEvent.click(headOf(container, 3))
    expect(rows(container)[0].classList.contains('is-open')).toBe(false)
    expect(rows(container)[3].classList.contains('is-open')).toBe(true)
  })

  it('reports its open state to assistive tech', () => {
    const { container } = renderServices()
    expect(headOf(container, 0).getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(headOf(container, 0))
    expect(headOf(container, 0).getAttribute('aria-expanded')).toBe('true')
  })

  it('lets an author pin a row open, and -1 keep them all closed', () => {
    // The seeded home page uses -1; a Math.max(0, …) clamp used to force row 0.
    expect(openCount(renderServices({ openIndex: 1 }).container)).toBe(1)
    expect(openCount(renderServices({ openIndex: -1 }).container)).toBe(0)
  })
})
