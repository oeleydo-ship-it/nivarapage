import type { AuthPayload, User, Workspace } from '@uidesired/types'
import { clearSession, http, setSession } from './api'

export const authApi = {
  register: (body: { name: string; email: string; password: string; password_confirmation: string }) =>
    http.post<AuthPayload>('/auth/register', body),
  login: (body: { email: string; password: string }) => http.post<AuthPayload>('/auth/login', body),
  logout: () => http.post('/auth/logout'),
  user: () => http.get<User>('/auth/user'),
  forgotPassword: (email: string) => http.post('/auth/forgot-password', { email }),
  resetPassword: (body: { token: string; email: string; password: string; password_confirmation: string }) =>
    http.post('/auth/reset-password', body),
  googleStatus: () => http.get<{ enabled: boolean }>('/auth/google'),
  googleRedirect: () => http.get<{ url: string }>('/auth/google/redirect'),
}

export function persistAuth(payload: AuthPayload) {
  const user = unwrapMaybe<User>(payload.user)
  const workspaces = unwrapMaybe<Workspace[]>(payload.workspaces)
  const list = Array.isArray(workspaces) ? workspaces : []
  const first = list[0]
  const workspaceId = user?.current_workspace_id ?? first?.id
  setSession(payload.token, workspaceId)
}

function unwrapMaybe<T>(value: unknown): T {
  if (value && typeof value === 'object' && 'data' in (value as object)) {
    return (value as { data: T }).data
  }
  return value as T
}

export async function logoutAndClear() {
  try {
    await authApi.logout()
  } catch {
    /* ignore */
  }
  clearSession()
}

export type { User, Workspace }
