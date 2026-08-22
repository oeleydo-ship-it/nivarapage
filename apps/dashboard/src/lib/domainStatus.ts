import type { Domain } from '@uidesired/types'
import type { BadgeTone } from '../ui/primitives'

/**
 * Where a custom hostname is in the connection flow.
 *
 * The API stores a provider-shaped status (`verifying`, `ssl_pending`, …) plus
 * Cloudflare's own hostname and SSL states. None of those mean much to someone
 * who just wants to know whether their domain works yet, so they collapse into
 * these five stages.
 */
export type DomainStage = 'waiting_dns' | 'validating' | 'issuing' | 'live' | 'failed' | 'disabled'

export type DomainStatus = {
  stage: DomainStage
  label: string
  tone: BadgeTone
  detail: string
  /** True while we expect the state to change on its own. */
  polling: boolean
}

/** Cloudflare SSL states that mean "working on it", in the order they happen. */
const SSL_IN_PROGRESS: Record<string, string> = {
  initializing: 'Cloudflare is preparing the certificate request.',
  pending_validation: 'Waiting for the certificate TXT record to be visible in DNS.',
  pending_issuance: 'DNS checks passed. The certificate is being issued.',
  pending_deployment: 'Certificate issued. It is rolling out across the edge network.',
  pending_cleanup: 'Finishing up. The old certificate is being retired.',
}

export function domainStatus(domain: Domain): DomainStatus {
  if (domain.type !== 'custom') {
    return {
      stage: 'live',
      label: 'Active',
      tone: 'success',
      detail: 'Platform subdomains work immediately - there is nothing to set up.',
      polling: false,
    }
  }

  if (domain.status === 'active') {
    return {
      stage: 'live',
      label: 'Live',
      tone: 'success',
      detail: 'This domain is serving your site over HTTPS.',
      polling: false,
    }
  }

  if (domain.status === 'disabled') {
    return {
      stage: 'disabled',
      label: 'Disabled',
      tone: 'neutral',
      detail: 'This domain is no longer connected.',
      polling: false,
    }
  }

  const errors = domain.dns?.errors ?? []
  if (domain.status === 'failed' || errors.length > 0) {
    return {
      stage: 'failed',
      label: 'Needs attention',
      tone: 'danger',
      detail: errors[0] || 'The last check failed. Review the DNS records below, then try again.',
      polling: false,
    }
  }

  const ssl = domain.ssl_status || ''
  if (ssl === 'active') {
    return {
      stage: 'issuing',
      label: 'Finishing up',
      tone: 'info',
      detail: 'The certificate is ready. This domain will go live within a minute.',
      polling: true,
    }
  }

  if (domain.verification_status === 'active') {
    return {
      stage: 'issuing',
      label: 'Issuing certificate',
      tone: 'info',
      detail: SSL_IN_PROGRESS[ssl] || 'Your DNS is correct. We are waiting on the HTTPS certificate.',
      polling: true,
    }
  }

  if (domain.status === 'verifying' || domain.status === 'ssl_pending') {
    return {
      stage: 'validating',
      label: 'Checking DNS',
      tone: 'warning',
      detail: SSL_IN_PROGRESS[ssl] || 'We can see the domain but not all records yet. This is normal for the first few minutes.',
      polling: true,
    }
  }

  return {
    stage: 'waiting_dns',
    label: 'Waiting for DNS',
    tone: 'warning',
    detail: 'Add the records below at your DNS provider. We check again every few minutes.',
    polling: true,
  }
}

/** Human wording for how long ago we last asked the provider. */
export function lastCheckedLabel(value?: string | null, now: number = Date.now()): string {
  if (!value) return 'Not checked yet'
  const then = new Date(value).getTime()
  if (!Number.isFinite(then)) return 'Not checked yet'

  const seconds = Math.max(0, Math.round((now - then) / 1000))
  if (seconds < 60) return 'Checked just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `Checked ${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `Checked ${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  return `Checked ${days} day${days === 1 ? '' : 's'} ago`
}
