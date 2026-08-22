# Custom domains (Cloudflare for SaaS)

How customer domains are connected, and what has to be true in production for it
to work.

## What happens when a customer connects a domain

1. The dashboard POSTs the hostname to `/api/v1/sites/{site}/domains`.
2. `DomainService::addCustom` validates it, checks the plan limit, and creates
   the `domains` row.
3. The Cloudflare custom hostname is created **synchronously**, so the response
   already contains the DNS records the customer has to add.
4. `DomainResource` returns a `dns` payload built by `DnsInstructionBuilder`:
   the routing record, the ownership TXT, the certificate TXT, plus the steps
   and caveats shown in the UI.
5. The customer adds the records. `SyncCustomHostnameStatus` polls every five
   minutes, and "Check connection" forces an immediate re-check.
6. When Cloudflare reports the hostname **and** its certificate active,
   `ActivateCustomHostname` flips the domain to `active`.

A domain is never marked active on the hostname alone. An active hostname whose
certificate has not issued still fails TLS in the browser.

## Required configuration

| Variable | Purpose |
| --- | --- |
| `CLOUDFLARE_SAAS_ENABLED` | Master switch for the SaaS flow. |
| `CLOUDFLARE_API_TOKEN` | Needs `Zone → SSL and Certificates → Edit` on the zone. |
| `CLOUDFLARE_ZONE_ID` | The zone that owns the fallback origin. |
| `CLOUDFLARE_FALLBACK_ORIGIN` | Hostname in your zone that custom hostnames resolve to. |
| `CLOUDFLARE_CNAME_TARGET` | What customers actually CNAME to. Falls back to the origin. |
| `CLOUDFLARE_APEX_IPS` | Optional A records for apex domains (comma separated). |
| `CLOUDFLARE_SSL_VALIDATION` | Leave on `txt`. See below. |

Without `CLOUDFLARE_CNAME_TARGET` (or a fallback origin) the routing record in
the UI has no value in it, and the instruction panel says so rather than showing
a broken record.

### Why TXT validation, not HTTP

HTTP DV validation requires the hostname to already resolve to Cloudflare. During
onboarding it does not - that is the thing being set up - and for a domain that
is currently live somewhere else, pointing DNS first means downtime while the
certificate issues. TXT validation lets the customer prove ownership and get the
certificate issued *before* they move traffic, so the cutover is clean.

### Cloudflare dashboard setup

1. Enable **Cloudflare for SaaS** on the zone.
2. Create the fallback origin record (for example `fallback.example.com`) and
   point it at your renderer's origin. It must be proxied.
3. Set it as the zone's **Fallback Origin** under SSL/TLS → Custom Hostnames.
4. Wait for the fallback origin to show as active before connecting any customer
   domain; custom hostnames created against a pending origin stay stuck.

## Apex domains

`example.com` cannot take a CNAME - the DNS spec does not allow one at the zone
apex alongside the SOA and NS records. The UI detects this and either shows an
`ALIAS` record (for providers with ALIAS/ANAME/CNAME flattening) or, when
`CLOUDFLARE_APEX_IPS` is set, plain `A` records.

Apex detection uses a short list of known two-label public suffixes rather than
the Public Suffix List. It only decides whether to *warn*, so a wrong guess costs
an unnecessary hint, not a broken connection. Add a PSL package if that stops
being good enough.

## Operational notes

- The `domains` queue must have a worker running. Activation, deletion and
  retries all go through it.
- The scheduler must be running for `SyncCustomHostnameStatus`.
- `hostname` is globally unique and the model soft deletes. Re-connecting a
  previously removed domain force-deletes the tombstone row; the audit log keeps
  the history.
- Hostnames under `PLATFORM_DOMAIN` or `PREVIEW_DOMAIN` are rejected - accepting
  one would shadow the subdomain routing for a real site.
