import type { Domain } from '@uidesired/types'
import { describe, expect, it } from 'vitest'
import { domainStatus, lastCheckedLabel } from './lib/domainStatus'

function domain(overrides: Partial<Domain> = {}): Domain {
  return {
    id: 1,
    site_id: 1,
    type: 'custom',
    hostname: 'www.example.com',
    is_primary: false,
    status: 'pending',
    ...overrides,
  } as Domain
}

describe('domain status', () => {
  it('treats the platform subdomain as always working', () => {
    const state = domainStatus(domain({ type: 'subdomain', status: 'active' }))
    expect(state.stage).toBe('live')
    expect(state.polling).toBe(false)
  })

  it('starts by asking for DNS records', () => {
    const state = domainStatus(domain({ status: 'pending' }))
    expect(state.stage).toBe('waiting_dns')
    expect(state.polling).toBe(true)
  })

  it('reports a live domain', () => {
    const state = domainStatus(domain({ status: 'active', ssl_status: 'active' }))
    expect(state.stage).toBe('live')
    expect(state.tone).toBe('success')
    expect(state.polling).toBe(false)
  })

  it('separates DNS validation from certificate issuance', () => {
    const validating = domainStatus(domain({ status: 'verifying', ssl_status: 'pending_validation' }))
    expect(validating.stage).toBe('validating')

    const issuing = domainStatus(
      domain({ status: 'ssl_pending', verification_status: 'active', ssl_status: 'pending_issuance' }),
    )
    expect(issuing.stage).toBe('issuing')
    expect(issuing.detail).toContain('being issued')
  })

  it('explains each Cloudflare SSL state in plain words', () => {
    const state = domainStatus(
      domain({ status: 'ssl_pending', verification_status: 'active', ssl_status: 'pending_deployment' }),
    )
    expect(state.detail).toContain('rolling out')
  })

  it('surfaces a provider error as needing attention', () => {
    const state = domainStatus(
      domain({
        status: 'verifying',
        dns: { errors: ['caa_error: CAA record forbids this CA'] } as Domain['dns'],
      }),
    )
    expect(state.stage).toBe('failed')
    expect(state.tone).toBe('danger')
    expect(state.detail).toContain('CAA record')
  })

  it('stops polling once there is nothing left to wait for', () => {
    expect(domainStatus(domain({ status: 'active' })).polling).toBe(false)
    expect(domainStatus(domain({ status: 'disabled' })).polling).toBe(false)
    expect(domainStatus(domain({ status: 'failed' })).polling).toBe(false)
    expect(domainStatus(domain({ status: 'verifying' })).polling).toBe(true)
  })
})

describe('last checked label', () => {
  const now = Date.parse('2026-08-21T12:00:00Z')

  it('handles a domain that has never been checked', () => {
    expect(lastCheckedLabel(null, now)).toBe('Not checked yet')
    expect(lastCheckedLabel('nonsense', now)).toBe('Not checked yet')
  })

  it('describes recent checks', () => {
    expect(lastCheckedLabel('2026-08-21T11:59:30Z', now)).toBe('Checked just now')
    expect(lastCheckedLabel('2026-08-21T11:59:00Z', now)).toBe('Checked 1 minute ago')
    expect(lastCheckedLabel('2026-08-21T11:45:00Z', now)).toBe('Checked 15 minutes ago')
  })

  it('rolls up to hours and days', () => {
    expect(lastCheckedLabel('2026-08-21T09:00:00Z', now)).toBe('Checked 3 hours ago')
    expect(lastCheckedLabel('2026-08-19T12:00:00Z', now)).toBe('Checked 2 days ago')
  })
})
