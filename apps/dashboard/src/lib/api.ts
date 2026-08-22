export const TOKEN_KEY = 'uidesired.token'
export const WORKSPACE_KEY = 'uidesired.workspaceId'
export const IMPERSONATION_KEY = 'uidesired.impersonation'
export const PLAN_LIMIT_EVENT = 'uidesired:plan-limit'

export type ImpersonationSession = {
  adminToken: string
  adminWorkspaceId: string | null
  adminName: string
  adminEmail: string
  targetName: string
  targetEmail: string
}

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

function baseUrl(): string {
  return import.meta.env.VITE_API_URL || '/api/v1'
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getWorkspaceId(): string | null {
  return localStorage.getItem(WORKSPACE_KEY)
}

export function setSession(token: string, workspaceId?: string | number | null) {
  localStorage.setItem(TOKEN_KEY, token)
  if (workspaceId != null) localStorage.setItem(WORKSPACE_KEY, String(workspaceId))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(WORKSPACE_KEY)
  localStorage.removeItem(IMPERSONATION_KEY)
}

export function getImpersonation(): ImpersonationSession | null {
  try {
    const raw = localStorage.getItem(IMPERSONATION_KEY)
    return raw ? (JSON.parse(raw) as ImpersonationSession) : null
  } catch {
    return null
  }
}

export function setImpersonation(session: ImpersonationSession | null) {
  if (!session) {
    localStorage.removeItem(IMPERSONATION_KEY)
    return
  }
  localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(session))
}

/**
 * PHP can prepend warnings/notices to a JSON response, which makes a plain
 * JSON.parse fail and hides the real error message. Fall back to the last
 * JSON object or array in the body so callers still get `message`/`errors`.
 */
function parseBody(text: string): unknown {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    const start = text.search(/[[{]/)
    if (start >= 0) {
      const candidate = text.slice(start).trim()
      try {
        return JSON.parse(candidate)
      } catch {
        // fall through to the raw text below
      }
    }
    return text
  }
}

function unwrap<T>(json: unknown): T {
  if (json && typeof json === 'object' && 'data' in json) {
    return (json as { data: T }).data
  }
  return json as T
}

function notifyPlanLimit(status: number, json: unknown) {
  if (status !== 402 || typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(PLAN_LIMIT_EVENT, { detail: json }))
}

export async function api<T>(
  path: string,
  init: RequestInit & { json?: unknown; formData?: FormData } = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  const token = getToken()
  const workspaceId = getWorkspaceId()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (workspaceId) headers.set('X-Workspace-Id', workspaceId)
  headers.set('Accept', 'application/json')

  let body = init.body
  if (init.json !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(init.json)
  } else if (init.formData) {
    body = init.formData
  }

  const res = await fetch(`${baseUrl()}${path}`, { ...init, headers, body })
  const text = await res.text()
  const json = parseBody(text)
  if (!res.ok) {
    notifyPlanLimit(res.status, json)
    let msg = `Request failed (${res.status})`
    if (json && typeof json === 'object' && json !== null && 'message' in json) {
      const message = String((json as { message: unknown }).message)
      if (message) msg = message
    }
    throw new ApiError(msg, res.status, json)
  }
  return unwrap<T>(json)
}

/** Reads a POST response as newline-delimited JSON, dispatching each event immediately. */
export async function apiNdjson<T extends Record<string, unknown>>(
  path: string,
  json: unknown,
  onEvent: (event: T) => void,
  signal?: AbortSignal,
): Promise<void> {
  const headers = new Headers()
  const token = getToken()
  const workspaceId = getWorkspaceId()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (workspaceId) headers.set('X-Workspace-Id', workspaceId)
  headers.set('Accept', 'application/x-ndjson, application/json')
  headers.set('Content-Type', 'application/json')

  const res = await fetch(`${baseUrl()}${path}`, { method: 'POST', headers, body: JSON.stringify(json), signal })
  if (!res.ok) {
    const parsed = parseBody(await res.text())
    notifyPlanLimit(res.status, parsed)
    const message = parsed && typeof parsed === 'object' && 'message' in parsed ? String(parsed.message) : `Request failed (${res.status})`
    throw new ApiError(message, res.status, parsed)
  }
  if (!res.body) throw new ApiError('The generation stream could not be opened.', 502, null)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  function dispatch(line: string) {
    if (!line.trim()) return
    const event = JSON.parse(line) as T
    if (event.type === 'error') {
      const status = typeof event.status === 'number' ? event.status : 500
      throw new ApiError(String(event.message || 'Generation failed'), status, event)
    }
    onEvent(event)
  }

  while (true) {
    const { value, done } = await reader.read()
    buffer += decoder.decode(value, { stream: !done })
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() || ''
    for (const line of lines) dispatch(line)
    if (done) break
  }
  dispatch(buffer)
}

export const http = {
  get: <T>(path: string) => api<T>(path),
  post: <T>(path: string, json?: unknown) => api<T>(path, { method: 'POST', json }),
  put: <T>(path: string, json?: unknown) => api<T>(path, { method: 'PUT', json }),
  patch: <T>(path: string, json?: unknown) => api<T>(path, { method: 'PATCH', json }),
  delete: <T>(path: string) => api<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData) => api<T>(path, { method: 'POST', formData }),
}

export async function apiPaginated<T>(path: string): Promise<{ data: T[]; meta?: unknown; links?: unknown }> {
  const headers = new Headers()
  const token = getToken()
  const workspaceId = getWorkspaceId()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (workspaceId) headers.set('X-Workspace-Id', workspaceId)
  headers.set('Accept', 'application/json')
  const res = await fetch(`${baseUrl()}${path}`, { headers })
  const json = parseBody(await res.text()) as { data: T[]; meta?: unknown; links?: unknown; message?: string }
  if (!res.ok) {
    notifyPlanLimit(res.status, json)
    throw new ApiError(json?.message || 'Request failed', res.status, json)
  }
  return json
}
