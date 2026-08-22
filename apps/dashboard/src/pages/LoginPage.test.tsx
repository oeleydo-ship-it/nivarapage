import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from '../pages/AuthPages'

const login = vi.fn()
const persistAuth = vi.fn()

vi.mock('../lib/auth', () => ({
  authApi: {
    login: (...args: unknown[]) => login(...args),
    register: vi.fn(),
    logout: vi.fn(),
    user: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    googleStatus: vi.fn().mockResolvedValue({ enabled: false }),
    googleRedirect: vi.fn(),
  },
  persistAuth: (...args: unknown[]) => persistAuth(...args),
}))

/**
 * The sign-in screen reads the platform branding, so it needs a query client
 * the same way the real app provides one around the whole router.
 */
function renderPage(node: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>{node}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    login.mockReset()
    persistAuth.mockReset()
  })

  it('signs in and stores the session', async () => {
    login.mockResolvedValue({ token: 'tok', user: { email: 'ada@example.com' }, workspaces: [] })
    const { container } = renderPage(<LoginPage />)

    fireEvent.change(container.querySelector('input[type="email"]')!, { target: { value: 'ada@example.com' } })
    fireEvent.change(container.querySelector('input[type="password"]')!, { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(login).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'password123' }))
    expect(persistAuth).toHaveBeenCalled()
  })

  it('shows an error when login fails', async () => {
    login.mockRejectedValue(new Error('Invalid credentials.'))
    const { container } = renderPage(<LoginPage />)

    fireEvent.change(container.querySelector('input[type="email"]')!, { target: { value: 'ada@example.com' } })
    fireEvent.change(container.querySelector('input[type="password"]')!, { target: { value: 'nope' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(await screen.findByText('Invalid credentials.')).toBeTruthy()
    expect(persistAuth).not.toHaveBeenCalled()
  })
})
