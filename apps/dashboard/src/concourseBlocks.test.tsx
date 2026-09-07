import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { concourseBlocks } from '../../../packages/blocks/src/blocks/concourse'

afterEach(cleanup)
function show(type: string) {
  const definition = concourseBlocks.find(block => block.type === type)!
  const Component = definition.component
  return render(<Component {...definition.defaultProps} />)
}
it('switches the active agent and its report', () => {
  show('agents.concourse')
  expect(screen.getByText('Variance analysis')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: /Forecast Agent/ }))
  expect(screen.getByText('Rolling forecast')).toBeTruthy()
  expect(screen.queryByText('Variance analysis')).toBeNull()
  expect(screen.getByRole('button', { name: /Forecast Agent/ }).getAttribute('aria-expanded')).toBe('true')
})
it('cycles customer stories in both directions', () => {
  show('testimonials.concourse')
  fireEvent.click(screen.getByRole('button', { name: 'Next testimonial' }))
  expect(screen.getByText('Jordan Lee')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Previous testimonial' }))
  expect(screen.getByText('Alex Morgan')).toBeTruthy()
})
it('allows the user to pause and resume hero motion', () => {
  const { container } = show('hero.concourse')
  expect(container.querySelector('video')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Pause background video' }))
  expect(container.querySelector('video')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Play background video' }))
  expect(container.querySelector('video')).toBeTruthy()
})
