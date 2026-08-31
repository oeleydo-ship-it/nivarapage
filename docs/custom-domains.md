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
| `CLOUDFLARE_APEX_IPS` | Optional override for the apex A/AAAA records. Blank resolves the CNAME target instead. |
| `CLOUDFLARE_SSL_VALIDATION` | Leave on `txt`. See below. |

Without `CLOUDFLARE_CNAME_TARGET` (or a fallback origin) the routing record in
the UI has no value in it, and the instruction panel says so rather than showing
a broken record.

### Configuring it from the super admin

Every variable above can also be set in **Admin -> Domain HTTPS**
(`/admin?tab=cloudflare`), which is the supported route on hosts where editing
`.env` is awkward. Stored values override the environment; clearing a field
falls back to the environment again, and each field shows which of the two it is
currently using. The API token and webhook secret are encrypted at rest and are
never returned to the dashboard.

The tab also does the two things that otherwise need the Cloudflare dashboard:

- **Test connection** verifies the token, that it can read the zone, and that it
  can read the zone's custom hostnames - a token missing the SSL and
  Certificates scope passes a plain token check but fails the first time a
  customer connects a domain.
- **Sync fallback origin** sets the zone fallback origin to the configured
  hostname and reports what Cloudflare currently has, so a drifted or missing
  origin is visible before customers hit it.

Settings are applied to config on boot, so the API token, zone, validation
method and minimum TLS version stored here are what `CloudflareClient` and the
custom hostname calls actually use.

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

Root domains are supported. `example.com` cannot take a CNAME - the DNS spec
does not allow one at the zone apex alongside the SOA and NS records - so the
customer is offered two routing options and told to create exactly one of them:

- **Option A, `ALIAS` -> the CNAME target.** Providers call it ALIAS, ANAME or
  CNAME flattening. Preferred: it follows our edge on its own.
- **Option B, `A` (and `AAAA`) records.** For providers with no ALIAS support.

Cloudflare for SaaS routes a custom hostname by SNI at the edge, so a root
domain pointed straight at our edge addresses is served exactly like a CNAMEd
subdomain - the ownership and certificate TXT records are unchanged.

`ApexAddressResolver` supplies the addresses for Option B. It resolves the
CNAME target (falling back to the fallback origin) and caches the answer for an
hour, so the anycast IPs never have to be maintained by hand. An explicit
`CLOUDFLARE_APEX_IPS` - or the **Apex address override** field in Admin -> Domain
HTTPS - wins over the lookup, which is what a BYOIP or dedicated-address
deployment wants.

The resolved addresses are shown in Admin -> Domain HTTPS with a "Re-check DNS"
button. They must be Cloudflare edge addresses: if the operator recognises their
own origin IP there, the fallback origin record in the zone is not proxied, and
customer root domains would bypass Cloudflare and fail TLS.

Apex customers are also nudged to connect `www.` as a second domain and make one
of the two primary, so the other redirects to it.

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
