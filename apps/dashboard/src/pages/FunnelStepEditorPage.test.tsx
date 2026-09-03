import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FunnelStepEditorPage } from './FunnelStepEditorPage'

/**
 * Publishing must not lose the step being edited.
 *
 * publishFunnelWithRenders answers with how many pages it rendered, not with a
 * funnel. Writing that into the funnel cache replaced the funnel with an object
 * that has no steps, and the editor then reported the very step it was showing
 * as missing.
 */
const funnel = {
  id: 5,
  public_id: 'pub-abc',
  name: 'Served Funnel',
  status: 'draft',
  steps: [
    {
      id: 14,
      name: 'Landing Page',
      slug: 'start',
      type: 'landing_page',
      status: 'draft',
      draft_content: { schemaVersion: 1, sections: [] },
    },
  ],
}

const get = vi.fn()
const saveStepContent = vi.fn()
const publishFunnel = vi.fn()

vi.mock('../lib/endpoints', () => ({
  funnelsApi: {
    get: (...args: unknown[]) => get(...args),
    saveStepContent: (...args: unknown[]) => saveStepContent(...args),
  },
}))

vi.mock('@/lib/publishSite', () => ({
  publishFunnelWithRenders: (...args: unknown[]) => publishFunnel(...args),
}))

function renderEditor() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/funnels/5/steps/14/editor']}>
        <Routes>
          <Route path="/funnels/:id/steps/:stepId/editor" element={<FunnelStepEditorPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('FunnelStepEditorPage', () => {
  beforeEach(() => {
    get.mockReset().mockResolvedValue(funnel)
    saveStepContent.mockReset().mockResolvedValue(funnel.steps[0])
    publishFunnel.mockReset().mockResolvedValue({ rendered: 1 })
  })

  it('keeps showing the step after publishing', async () => {
    renderEditor()
    await waitFor(() => expect(screen.getByRole('button', { name: /publish funnel/i })).toBeTruthy())

    fireEvent.click(screen.getByRole('button', { name: /publish funnel/i }))

    await waitFor(() => expect(publishFunnel).toHaveBeenCalled())

    // The whole bug: the editor lost the step it was editing.
    await waitFor(() => expect(screen.queryByText('Funnel step not found.')).toBeNull())
    expect(get).toHaveBeenCalled()
  })

  it('says so when the funnel published but its HTML could not be built', async () => {
    publishFunnel.mockResolvedValue({ rendered: 0, renderError: 'Rendering the funnel HTML failed' })

    renderEditor()
    await waitFor(() => expect(screen.getByRole('button', { name: /publish funnel/i })).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: /publish funnel/i }))

    // The funnel is live either way, so a silent partial success would leave
    // somebody wondering why the page never changed.
    await waitFor(() => expect(screen.getByText(/Rendering the funnel HTML failed/)).toBeTruthy())
    expect(screen.queryByText('Funnel step not found.')).toBeNull()
  })

  it('reports a step that really is missing', async () => {
    get.mockResolvedValue({ ...funnel, steps: [] })

    renderEditor()

    await waitFor(() => expect(screen.getByText('Funnel step not found.')).toBeTruthy())
  })
})
