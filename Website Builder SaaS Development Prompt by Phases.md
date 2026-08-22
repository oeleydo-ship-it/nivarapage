# Website Builder SaaS — Full Development Prompt by Phases

Build a production-ready, multi-tenant website builder SaaS with:

- **Laravel 13** as backend/API
- **React 19 + TypeScript** for dashboard and drag-and-drop builder
- **Next.js 16** for rendering published customer websites
- **MySQL**
- **Redis**
- **Laravel Horizon**
- **Laravel Reverb**
- **Cloudflare for SaaS / Custom Hostnames**
- **Cloudflare R2 or S3-compatible storage**
- **Docker**
- Deployment through **Uplary**

The product should allow non-technical users to:

1. Register an account
2. Create a workspace
3. Create a website
4. Select a ready-made template
5. Choose a free platform subdomain
6. Edit pages using drag-and-drop sections
7. Customize content, colors, fonts, spacing, and images
8. Preview desktop/tablet/mobile layouts
9. Publish the website
10. Connect a custom domain
11. Automatically verify and provision SSL through Cloudflare
12. Manage pages, media, forms, SEO, domains, and revisions

The initial version should use a structured section-based editor rather than a completely free-position canvas.

---

# Phase 1 — Project Foundation

## Goal

Create the project architecture, monorepo, development environment, Docker infrastructure, coding standards, and shared packages.

## Architecture

Use:

```text
root/
├── apps/
│   ├── api/
│   │   └── Laravel 13
│   │
│   ├── dashboard/
│   │   └── React 19 + TypeScript
│   │
│   └── renderer/
│       └── Next.js 16
│
├── packages/
│   ├── blocks/
│   ├── schemas/
│   ├── types/
│   ├── design-system/
│   └── utilities/
│
├── infrastructure/
│   └── docker/
│
├── docs/
│
├── docker-compose.yml
└── README.md
```

Use `pnpm workspace` for JavaScript applications and shared packages.

## Laravel Requirements

Install and configure:

```text
Laravel 13
MySQL
Redis
Sanctum
Horizon
Reverb
Queues
Scheduler
Notifications
Policies
API Resources
```

## React Requirements

Use:

```text
React 19
TypeScript
Vite
Tailwind CSS
shadcn/ui
TanStack Query
React Hook Form
Zod
Zustand
dnd-kit
TipTap
```

## Next.js Requirements

Use:

```text
Next.js 16
App Router
TypeScript
Tailwind CSS
```

## Docker Services

Create containers for:

```text
reverse-proxy
laravel-api
laravel-worker
laravel-scheduler
laravel-reverb
react-dashboard
next-renderer
mysql
redis
```

## Phase 1 Deliverables

- Working Docker environment
- Laravel API accessible
- React dashboard accessible
- Next.js renderer accessible
- MySQL working
- Redis working
- Horizon working
- Reverb working
- Shared TypeScript packages configured
- Environment configuration documented
- Health-check endpoints implemented

---

# Phase 2 — Authentication and Multi-Tenancy

## Goal

Create secure user authentication and workspace-based multi-tenancy.

## Authentication Features

Implement:

```text
Register
Login
Logout
Email verification
Forgot password
Reset password
Session management
Optional 2FA architecture
```

## Registration Fields

```text
Full Name
Email
Password
Password Confirmation
```

## Workspace Architecture

Primary tenant entity:

```text
Workspace
```

Relationships:

```text
User
  ↓
Workspace
  ↓
Websites
```

A user may belong to several workspaces.

## Database Tables

Create:

```text
users
workspaces
workspace_users
```

`workspace_users` should support:

```text
owner
admin
designer
editor
viewer
```

## Authorization

Create policies including:

```text
WorkspacePolicy
SitePolicy
PagePolicy
DomainPolicy
MediaPolicy
FormPolicy
TemplatePolicy
```

Never trust workspace IDs supplied by the frontend.

Every backend request must verify tenant ownership and permissions.

## Phase 2 Deliverables

- Registration
- Login
- Email verification
- Workspace creation
- Workspace switching
- User roles
- Policies
- Tenant isolation tests
- Secure authenticated API

---

# Phase 3 — Dashboard and Website Management

## Goal

Allow customers to create and manage websites.

## Dashboard Navigation

```text
Overview
Websites
Templates
Media
Forms
Team
Billing
Settings
```

## Dashboard Metrics

Show:

```text
Total Websites
Published Websites
Custom Domains
Form Submissions
Storage Usage
```

## Website Database

Create:

```text
sites
site_settings
site_theme_settings
```

Recommended `sites` fields:

```text
id
workspace_id
name
business_name
slug
category
description
status
created_by
created_at
updated_at
deleted_at
```

Website statuses:

```text
draft
published
disabled
```

## Site Creation Flow

```text
Create Website
      ↓
Website Information
      ↓
Select Template
      ↓
Choose Subdomain
      ↓
Create Site
      ↓
Open Builder
```

## Website Categories

```text
Business
Restaurant
Portfolio
Agency
Construction
Real Estate
Medical
Consulting
SaaS
Personal
Landing Page
Other
```

## Phase 3 Deliverables

- Dashboard
- Website list
- Create website
- Update website
- Duplicate website
- Soft-delete website
- Restore website
- Site settings

---

# Phase 4 — Platform Subdomains

## Goal

Allow customers to instantly register a free subdomain.

Example platform domain:

```text
sites.example.com
```

Customer chooses:

```text
johnstudio
```

Website becomes:

```text
johnstudio.sites.example.com
```

## DNS Architecture

Configure wildcard DNS:

```text
*.sites.example.com
```

Point wildcard traffic toward the Next.js renderer.

Do not create a DNS record for each website.

Laravel only reserves the subdomain.

## Domain Database

Create:

```text
domains
```

Recommended fields:

```text
id
workspace_id
site_id
type
hostname
is_primary
status
provider
provider_reference
verification_method
verification_status
verification_data
ssl_status
last_checked_at
verified_at
activated_at
created_at
updated_at
deleted_at
```

Domain types:

```text
subdomain
custom
```

## Subdomain Validation

Allow:

```text
letters
numbers
hyphens
```

Automatically normalize to lowercase.

Prevent:

```text
leading hyphen
trailing hyphen
duplicate hostname
invalid characters
reserved names
```

Reserved names should include:

```text
www
api
app
admin
dashboard
billing
mail
smtp
ftp
support
help
docs
status
cdn
assets
static
dev
staging
preview
localhost
```

Create a unique database index for the hostname.

## Availability Endpoint

Example:

```text
GET /api/v1/subdomains/check?name=johnstudio
```

Response:

```json
{
  "available": true,
  "hostname": "johnstudio.sites.example.com"
}
```

## Phase 4 Deliverables

- Wildcard subdomain architecture
- Availability checking
- Reserved subdomains
- Domain database
- Platform domain resolution
- Automatic site activation

---

# Phase 5 — Pages and Structured Website Data

## Goal

Create the page architecture before building the visual editor.

Create:

```text
pages
page_revisions
```

## Pages

Recommended fields:

```text
id
site_id
name
slug
type
status
is_homepage
seo_title
seo_description
seo_image
draft_revision_id
published_revision_id
created_at
updated_at
```

Page statuses:

```text
draft
published
hidden
```

## Important Rule

Do not store pages as one large HTML document.

Store pages as structured JSON.

Example:

```json
{
  "schemaVersion": 1,
  "sections": [
    {
      "id": "hero_a123",
      "type": "hero.centered",
      "version": 1,
      "props": {
        "heading": "Grow Your Business",
        "description": "Build your professional website today.",
        "primaryButton": {
          "label": "Get Started",
          "url": "/contact"
        }
      }
    }
  ]
}
```

## Revision Architecture

Maintain:

```text
Draft Version
Published Version
```

Editing never directly changes the live website.

## Page Revisions

Fields:

```text
id
page_id
user_id
version_number
content_json
reason
created_at
```

## Restore Behavior

Restoring an old revision should create a new revision instead of destroying history.

## Phase 5 Deliverables

- Pages
- Slugs
- Homepage
- Draft state
- Published state
- Revision history
- Restore revision
- JSON schema validation

---

# Phase 6 — Shared Block Component System

## Goal

Create reusable website sections used by both the React builder and Next.js renderer.

## Shared Package

Use:

```text
packages/blocks/
```

Example components:

```text
NavbarSimple
NavbarCentered

HeroCentered
HeroSplit
HeroImage

FeaturesGrid
FeaturesIcons

ServicesCards

TestimonialsCards

PricingCards

FAQAccordion

CTAStandard

FooterStandard
```

## Block Registry

Create a controlled registry.

Example:

```typescript
const blockRegistry = {
    "navbar.simple": NavbarSimple,
    "navbar.centered": NavbarCentered,

    "hero.centered": HeroCentered,
    "hero.split": HeroSplit,

    "features.grid": FeaturesGrid,

    "testimonials.cards": TestimonialsCards,

    "pricing.standard": PricingCards,

    "faq.accordion": FAQAccordion,

    "cta.standard": CTAStandard,

    "footer.standard": FooterStandard
};
```

Never allow customer JSON to specify arbitrary React imports.

## Block Definition

Each block should contain:

```text
type
version
category
label
icon
thumbnail
defaultProps
schema
component
settings
```

## Initial Block Library

### Navbar

```text
Simple
Centered
CTA
Transparent
```

### Hero

```text
Centered
Split
Image
Background
SaaS
Restaurant
Business
```

### Content

```text
Text
Rich Text
Image + Text
Text + Image
Centered Content
Two Columns
```

### Features

```text
Cards
Icons
Grid
Showcase
```

### Services

```text
Cards
Grid
List
```

### Testimonials

```text
Cards
Carousel
Featured
```

### Pricing

```text
Two Columns
Three Columns
Comparison
```

### FAQ

```text
Accordion
Two Column
```

### CTA

```text
Simple
Split
Background
```

### Footer

```text
Simple
Centered
Multi Column
```

## Phase 6 Deliverables

- Shared block package
- Block registry
- Block schemas
- Initial component library
- Storybook or equivalent development preview if appropriate

---

# Phase 7 — Drag-and-Drop Website Builder

## Goal

Build the visual React editor.

## Editor Layout

```text
┌──────────────────────────────────────────────────────────────┐
│ ← Dashboard   Home ▼   Desktop Tablet Mobile   Undo Redo    │
│                                      Preview      Publish    │
├──────────────┬───────────────────────────────┬───────────────┤
│              │                               │               │
│ BLOCKS       │          CANVAS               │ SETTINGS      │
│              │                               │               │
│ Navigation   │                               │ Content       │
│ Hero         │                               │ Design        │
│ Features     │                               │ Layout        │
│ Services     │                               │ Spacing       │
│ Content      │                               │ Typography    │
│ Gallery      │                               │ Background    │
│ Pricing      │                               │               │
│ FAQ          │                               │               │
│ CTA          │                               │               │
│ Footer       │                               │               │
└──────────────┴───────────────────────────────┴───────────────┘
```

## Builder Features

Implement:

```text
Add section
Drag section
Reorder
Select
Duplicate
Delete
Copy
Paste
Hide
Show
Undo
Redo
Autosave
Keyboard shortcuts
```

Use `dnd-kit`.

## State Management

Use Zustand stores such as:

```text
editorStore
historyStore
selectionStore
devicePreviewStore
siteStore
```

## Autosave

Flow:

```text
Local Editor State
      ↓
Debounce
      ↓
Save Draft
      ↓
Laravel API
```

Avoid an API request for every keystroke.

Display:

```text
Saving...
```

then:

```text
Saved
```

## Phase 7 Deliverables

- Builder shell
- Section library
- Drag/drop
- Reordering
- Selection
- Property panel
- Autosave
- Undo/redo
- Duplicate/delete

---

# Phase 8 — Block Settings and Inline Editing

## Goal

Allow customers to edit content without touching code.

## Settings Types

Create reusable controls:

```text
text
textarea
richtext
image
color
select
toggle
number
slider
spacing
link
icon
alignment
background
```

## Inline Editing

Allow direct editing of:

```text
Headings
Paragraphs
Buttons
Lists
```

Use TipTap for rich text.

Never allow unsafe arbitrary HTML.

Sanitize input on both frontend and backend.

## Example Hero Settings

```text
Content

Heading
[ Build Your Business Online ]

Description
[ Create your website easily... ]

Button Label
[ Get Started ]

Button Link
[ /contact ]


Design

Alignment
Left
Center
Right

Background
Color
Image
Gradient

Spacing
Top
Bottom
```

## Phase 8 Deliverables

- Schema-driven settings
- Inline text editing
- Rich text
- Images
- Buttons
- Alignment
- Backgrounds
- Padding/margins
- Component-specific options

---

# Phase 9 — Global Theme and Responsive Design

## Goal

Allow users to control their site's entire visual identity.

## Global Theme Settings

Create:

```text
Primary Color
Secondary Color
Accent Color
Background
Surface Color
Text Color
Muted Text

Heading Font
Body Font

Heading Weight
Body Weight

Button Radius
Card Radius

Container Width
Section Spacing
```

Generate CSS variables such as:

```css
--color-primary;
--color-secondary;
--color-accent;
--color-background;
--color-text;
--font-heading;
--font-body;
--radius-button;
--radius-card;
--container-width;
```

Blocks should use these variables.

## Responsive Modes

Support:

```text
Desktop
Tablet
Mobile
```

Blocks should already be responsive by default.

Allow optional breakpoint-specific controls:

```text
spacing
font size
alignment
visibility
columns
```

## Phase 9 Deliverables

- Global theme
- Color presets
- Typography
- Desktop preview
- Tablet preview
- Mobile preview
- Responsive overrides

---

# Phase 10 — Template Library

## Goal

Allow customers to start from professionally designed websites.

Templates must use the exact same block/page schema as normal websites.

## Template Tables

Create:

```text
templates
template_pages
template_categories
```

## Categories

```text
Business
Agency
Restaurant
Construction
Healthcare
Portfolio
Real Estate
SaaS
Consulting
Personal
Events
Landing Page
```

## Example Restaurant Template

```text
Home
├── Navbar Restaurant
├── Restaurant Hero
├── About Split
├── Menu
├── Gallery
├── Testimonials
├── Reservation CTA
└── Footer
```

When selected:

```text
Template
   ↓
Clone Pages
   ↓
Create Draft Revisions
   ↓
Customer Owns Copy
```

Do not permanently link customer sites to a mutable template.

## Template Admin

Admin can:

```text
Create
Edit
Preview
Publish
Unpublish
Feature
Categorize
Add thumbnail
```

## Phase 10 Deliverables

- Template library
- Categories
- Preview
- Start blank
- Template cloning
- Admin management

---

# Phase 11 — Next.js Multi-Tenant Renderer

## Goal

Serve all published websites from one Next.js application.

Do not deploy one Next.js installation per customer.

## Tenant Resolution

Flow:

```text
Incoming Request
      ↓
Read Host
      ↓
Normalize Host
      ↓
Resolve Domain
      ↓
Resolve Site
      ↓
Resolve Page Path
      ↓
Load Published JSON
      ↓
Render Blocks
```

Example:

```text
www.customer.com/about
```

resolve:

```text
hostname = www.customer.com
pathname = /about
```

## Host Normalization

```text
lowercase
remove port
remove trailing dot
```

## Redis Cache

Example:

```text
tenant:domain:www.customer.com
→ site_123
```

Cache:

```text
domain → site
site → settings
navigation
published pages
theme
```

## Unknown Domains

Return:

```text
Website Not Found

This domain is not connected to an active website.
```

Never leak internal data.

## Phase 11 Deliverables

- Host-based tenant resolution
- Page routing
- JSON renderer
- Redis caching
- 404 handling
- Primary domain redirect logic

---

# Phase 12 — Publishing System

## Goal

Create reliable draft-to-production publishing.

Flow:

```text
Builder
   ↓
Draft
   ↓
Save
   ↓
Publish
   ↓
Create Immutable Published Revision
   ↓
Update Published Pointer
   ↓
Clear Cache
   ↓
Invalidate Renderer
   ↓
Website Updated
```

## Publish Action

Publishing should:

```text
validate schema
create revision
mark revision published
update page
clear Redis
invalidate Next.js cache
create activity log
broadcast completion
```

## Preview

Create secure signed preview URLs.

Example:

```text
https://preview.example.com/site/...?...token...
```

Never expose drafts through predictable public URLs.

## Phase 12 Deliverables

- Publish button
- Draft indicator
- Published revision
- Preview
- Cache invalidation
- Publish history
- Rollback

---

# Phase 13 — Cloudflare Custom Domains

## Goal

Allow customers to connect their own domains.

Examples:

```text
www.customer.com
customer.com
app.customer.com
```

Use **Cloudflare for SaaS Custom Hostnames**.

Laravel is the only application allowed to communicate with Cloudflare management APIs.

Never expose Cloudflare API keys to React or Next.js.

## Laravel Cloudflare Service

Create:

```text
app/Services/Cloudflare/
```

Classes:

```text
CloudflareClient.php
CustomHostnameService.php
FallbackOriginService.php
DomainVerificationService.php
CloudflareWebhookService.php
```

Create provider abstraction:

```text
DomainProviderInterface
```

Implementation:

```text
CloudflareDomainProvider
```

## Environment Variables

```text
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_ZONE_ID=
CLOUDFLARE_FALLBACK_HOSTNAME=
CLOUDFLARE_SAAS_ENABLED=true
```

## Phase 13 Deliverables

- Cloudflare client
- Provider interface
- Custom hostname creation
- Hostname deletion
- Status sync
- Error handling
- API tests with fake provider

---

# Phase 14 — Cloudflare Fallback Origin

## Goal

Route custom hostname traffic to the shared Next.js renderer.

Configure fallback origin:

```text
fallback.sites.example.com
```

Architecture:

```text
customer.com
      ↓
Cloudflare Custom Hostname
      ↓
Fallback Origin
      ↓
fallback.sites.example.com
      ↓
Uplary Server
      ↓
Next.js Renderer
```

DNS:

```text
fallback.sites.example.com
→ proxied
→ production server
```

## Reverse Proxy

Route:

```text
app.example.com
→ React

api.example.com
→ Laravel

preview.example.com
→ Next.js preview

*.sites.example.com
→ Next.js

fallback.sites.example.com
→ Next.js
```

## Phase 14 Deliverables

- Fallback origin
- Reverse proxy configuration
- Custom-hostname routing
- SSL compatibility
- Host forwarding correctly preserved

---

# Phase 15 — Custom Domain User Experience

## Goal

Make connecting a domain easy for non-technical customers.

## Domain Screen

```text
Domains

Platform Domain

johnstudio.sites.example.com
✓ Active


Custom Domains

www.johnstudio.com
DNS verification required

[ View Instructions ]
[ Check Connection ]
```

## Add Domain Flow

```text
Connect Domain
      ↓
Enter Hostname
      ↓
Laravel Validates
      ↓
Create Local Domain
      ↓
Create Cloudflare Custom Hostname
      ↓
Display DNS Requirements
      ↓
Verify
      ↓
SSL Active
      ↓
Domain Active
```

## Validation

Reject:

```text
IP addresses
localhost
internal domains
wildcard hostnames
malformed domains
duplicates
domains assigned to other customers
```

## Statuses

```text
pending
verifying
dns_required
ssl_pending
active
failed
disabled
```

## Phase 15 Deliverables

- Connect-domain wizard
- DNS instructions
- Verification
- SSL status
- Retry
- Remove domain
- Primary domain

---

# Phase 16 — Domain Background Jobs

## Goal

Handle domain operations asynchronously.

Create Laravel jobs:

```text
CreateCloudflareCustomHostname
CheckCustomHostname
ActivateCustomHostname
DeleteCustomHostname
RetryFailedCustomHostname
SyncCustomHostnameStatus
```

Queues:

```text
default
domains
publishing
media
notifications
```

## Scheduler

Run domain verification periodically.

Example:

```text
every 5 minutes
```

Only check pending/verifying domains.

Use exponential/reasonable retry backoff.

## Phase 16 Deliverables

- Queued domain provisioning
- Status synchronization
- Retry logic
- Horizon monitoring
- Domain scheduler

---

# Phase 17 — Primary Domains and Redirects

## Goal

Allow each site to have multiple domains with one primary address.

Example:

```text
johnstudio.sites.example.com
johnstudio.com
www.johnstudio.com
```

Set:

```text
www.johnstudio.com
```

as primary.

Setting:

```text
Redirect secondary domains to primary
ON
```

Then:

```text
johnstudio.sites.example.com
      ↓
301
      ↓
www.johnstudio.com
```

## Phase 17 Deliverables

- Set primary
- Secondary domains
- Optional canonical redirect
- SEO-safe 301 redirects
- Primary domain display

---

# Phase 18 — Media Library

## Goal

Allow customers to upload and reuse images.

Use:

```text
Cloudflare R2
```

or S3-compatible storage.

## Database

Create:

```text
media
```

Fields:

```text
id
workspace_id
site_id
user_id
disk
path
filename
mime_type
size
width
height
alt_text
created_at
```

## Features

```text
Upload
Search
Rename
Delete
Alt text
Usage tracking
Image optimization
```

Use queues for image optimization.

Support:

```text
JPG
PNG
WebP
AVIF
SVG with strict sanitization
```

## Phase 18 Deliverables

- Media browser
- Upload
- R2/S3
- Optimized images
- Alt text
- Image selector inside builder

---

# Phase 19 — Navigation Builder

## Goal

Allow customers to configure site menus.

Create:

```text
menus
menu_items
```

Menu items support:

```text
Page
External URL
Anchor
Submenu
```

Allow drag-and-drop ordering.

Example:

```text
Home
About
Services
    Web Development
    SEO
Pricing
Contact
```

## Phase 19 Deliverables

- Navigation manager
- Nested menu
- Reorder
- Link types
- Navbar integration

---

# Phase 20 — Forms and Lead Collection

## Goal

Provide native customer forms.

Initial forms:

```text
Contact
Lead
Newsletter
Request Quote
```

Create:

```text
forms
form_fields
form_submissions
```

Supported fields:

```text
Text
Email
Phone
Textarea
Select
Checkbox
Radio
```

## Spam Protection

Implement:

```text
rate limiting
honeypot
Cloudflare Turnstile option
```

## Submissions Dashboard

```text
Name
Email
Form
Website
Page
Submitted
Status
```

Allow CSV export.

## Notifications

Send submissions to verified site/workspace recipients.

Never create an unrestricted email relay.

## Phase 20 Deliverables

- Form builder
- Form blocks
- Submissions
- Notifications
- Spam prevention
- CSV export

---

# Phase 21 — SEO

## Goal

Make websites search-engine-ready.

## Site SEO

```text
Site Name
Default Description
Favicon
Social Image
Robots Settings
```

## Page SEO

```text
SEO Title
Meta Description
Canonical URL
OG Title
OG Description
OG Image
Index/Noindex
```

Next.js should generate:

```text
metadata
canonical
Open Graph
Twitter cards
```

Automatically create:

```text
sitemap.xml
robots.txt
```

## Phase 21 Deliverables

- Page SEO
- Site SEO
- Metadata
- Sitemap
- Robots
- Canonical domain support

---

# Phase 22 — Activity Logs

## Goal

Provide audit history for important actions.

Log:

```text
Site created
Site deleted
Page created
Page published
Page restored
Template applied
Domain added
Domain activated
Domain removed
User invited
Role changed
Media deleted
```

Fields:

```text
actor
action
target
workspace
IP
metadata
timestamp
```

## Phase 22 Deliverables

- Activity model
- Audit service
- Workspace activity screen
- Admin activity search

---

# Phase 23 — Team Collaboration

## Goal

Allow workspace owners to invite team members.

Roles:

```text
Owner
Admin
Designer
Editor
Viewer
```

Features:

```text
Invite by email
Accept invitation
Remove user
Change role
Transfer ownership
```

Implement granular policies.

## Phase 23 Deliverables

- Invitations
- Roles
- Permissions
- Team management
- Ownership transfer

---

# Phase 24 — Billing and SaaS Plans

## Goal

Create billing-ready architecture.

Plans:

```text
Free
Starter
Business
Agency
```

Feature limits:

```text
number_of_sites
custom_domains
storage_mb
pages_per_site
form_submissions
team_members
premium_templates
revision_history
remove_branding
```

Create services:

```text
FeatureService
PlanLimitService
SubscriptionService
```

Example:

```php
$limits->allows($workspace, 'custom_domains');
```

Do not hardcode plan checks throughout controllers.

## Example Plan Structure

### Free

```text
1 Website
Platform Subdomain
Basic Templates
Limited Pages
Platform Branding
```

### Starter

```text
More Pages
1 Custom Domain
More Storage
Remove Branding
```

### Business

```text
Multiple Websites
More Custom Domains
Premium Templates
Forms
Revision History
```

### Agency

```text
Many Websites
Team Members
Higher Limits
Client Management
```

Commercial prices must remain configurable.

## Phase 24 Deliverables

- Plans
- Feature limits
- Usage enforcement
- Subscription architecture
- Upgrade prompts

---

# Phase 25 — Super Admin

## Goal

Create centralized SaaS administration.

Admin navigation:

```text
Dashboard
Users
Workspaces
Websites
Domains
Templates
Blocks
Plans
Subscriptions
Storage
Forms
Activity Logs
Jobs
Failed Jobs
System Health
Settings
```

Admin capabilities:

```text
Search users
Search websites
Search hostname
Suspend site
Suspend workspace
Manage templates
Manage blocks
Inspect domain state
Inspect jobs
Retry failed jobs
```

Domain lookup:

```text
hostname
   ↓
site
   ↓
workspace
   ↓
owner
```

## Phase 25 Deliverables

- Admin dashboard
- Tenant management
- Domain diagnostics
- Template manager
- System monitoring

---

# Phase 26 — Performance and Caching

## Goal

Optimize public websites for production traffic.

Use Redis for:

```text
domain → site
site settings
theme
navigation
published pages
```

Examples:

```text
tenant:domain:www.customer.com
published:site:123:page:home:v18
```

Use Cloudflare caching for public pages where appropriate.

Do not cache:

```text
dashboard
editor
authenticated API
preview pages
private pages
```

Publishing should trigger:

```text
Redis invalidation
Next.js invalidation
CDN invalidation where required
```

## Phase 26 Deliverables

- Redis strategy
- Next.js caching
- Cloudflare caching
- Cache invalidation
- Performance testing

---

# Phase 27 — Security Hardening

## Goal

Prepare for production customers.

Implement:

```text
Rate limiting
Secure authentication
CSRF protection
Input validation
Server-side authorization
HTML sanitization
Upload validation
Host header validation
Secure cookies
Password hashing
Session revocation
Request IDs
Audit logging
```

Never allow:

```text
eval()
arbitrary JavaScript
arbitrary React imports
customer PHP
unvalidated HTML
untrusted server execution
```

Next.js must only render websites where the incoming hostname exists as an active domain.

## Phase 27 Deliverables

- Security review
- Tenant isolation review
- Upload security
- Domain security
- API rate limits
- Host validation

---

# Phase 28 — Testing

## Laravel

Use Pest.

Test:

```text
Authentication
Tenant isolation
Authorization
Website CRUD
Page CRUD
Subdomain reservation
Custom domain creation
Cloudflare status
Publishing
Revision restore
Plan limits
Forms
```

## React

Use:

```text
Vitest
React Testing Library
```

## Next.js

Use:

```text
Vitest
Playwright
```

## E2E Test

Complete customer flow:

```text
Register
   ↓
Create Workspace
   ↓
Create Website
   ↓
Choose Template
   ↓
Choose Subdomain
   ↓
Open Builder
   ↓
Modify Hero
   ↓
Add Section
   ↓
Publish
   ↓
Visit Subdomain
   ↓
Connect Custom Domain
   ↓
Verify Domain
   ↓
SSL Active
   ↓
Set Primary
   ↓
Visit Custom Domain
```

Tenant isolation tests are mandatory.

## Phase 28 Deliverables

- Unit tests
- Feature tests
- E2E tests
- Cloudflare fake provider
- CI test pipeline

---

# Phase 29 — Uplary Production Deployment

## Goal

Deploy the complete SaaS initially on one managed server through Uplary.

Architecture:

```text
                    Cloudflare
                         │
                         ▼
                 Uplary Server
                         │
                 Reverse Proxy
              ┌──────────┼──────────┐
              │          │          │
              ▼          ▼          ▼
          Laravel      React      Next.js
              │
         ┌────┴─────┐
         ▼          ▼
       MySQL      Redis
```

Containers:

```text
reverse-proxy
laravel-api
laravel-worker
laravel-scheduler
laravel-reverb
react-dashboard
next-renderer
mysql
redis
```

Use persistent volumes.

Implement:

```text
Health checks
Restart policies
Environment variables
Secure secrets
Production builds
Queue restart
Migration deployment
```

## Deployment Flow

```text
Git Push
   ↓
Uplary
   ↓
Build Containers
   ↓
Run Tests
   ↓
Run Migrations
   ↓
Deploy Laravel
   ↓
Deploy Next.js
   ↓
Deploy React
   ↓
Restart Workers
   ↓
Health Check
```

## Phase 29 Deliverables

- Docker production config
- Uplary deployment
- SSL
- Reverse proxy
- Workers
- Scheduler
- Reverb
- Health checks

---

# Phase 30 — Scalability Preparation

## Goal

Start with one server but allow infrastructure to grow later.

Initial:

```text
ONE SERVER

Laravel
React
Next.js
MySQL
Redis
```

Future:

```text
                   Cloudflare
                       │
                  Load Balancer
                   /          \
                  /            \
         Next Renderer 1   Next Renderer 2
                  \            /
                   \          /
                    Laravel API
                       │
               ┌───────┴───────┐
               ▼               ▼
             Redis           MySQL
```

Architecture must allow later separation of:

```text
Database
Redis
Workers
Renderer
API
Storage
```

Do not require one server per customer website.

## Phase 30 Deliverables

- Stateless public renderer
- Shared Redis
- Object storage
- Scale-ready queue system
- Documented horizontal scaling path

---

# Future Phase — AI Website Generation

Do not implement this until the core builder is stable.

Potential flow:

```text
User enters:

"Create a modern website for a construction company in Dubai."
```

AI generates structured data:

```text
Website
├── Home
├── About
├── Services
├── Projects
└── Contact
```

Each page should use existing registered blocks.

AI must output the same structured block schema used by the normal builder.

Do not allow AI to generate arbitrary executable code.

---

# Future Phase — Blogging

Possible modules:

```text
Blog Posts
Categories
Tags
Authors
Scheduled Publishing
SEO
RSS
```

Blogs should render through the same Next.js tenant renderer.

---

# Future Phase — E-Commerce

Possible modules:

```text
Products
Categories
Collections
Inventory
Cart
Checkout
Orders
Payments
Coupons
Shipping
Taxes
```

Keep this outside the initial MVP.

---

# Future Phase — Agency / White Label

Potential features:

```text
Agency Dashboard
Client Accounts
Client Website Access
White Label
Custom Agency Domain
Custom Branding
Template Sharing
Website Transfer
```

---

# Final MVP Definition of Done

The MVP is considered production-ready when a new customer can complete this workflow without administrator intervention:

```text
Register
      ↓
Verify Email
      ↓
Create Workspace
      ↓
Create Website
      ↓
Choose Template
      ↓
Choose Available Subdomain
      ↓
Website Created
      ↓
Open Visual Builder
      ↓
Drag/Reorder Sections
      ↓
Edit Text
      ↓
Upload Images
      ↓
Change Colors and Fonts
      ↓
Preview Desktop/Tablet/Mobile
      ↓
Save Draft
      ↓
Publish
      ↓
Visit Platform Subdomain
      ↓
Open Domain Settings
      ↓
Connect Custom Domain
      ↓
Receive DNS Instructions
      ↓
Cloudflare Verification
      ↓
SSL Becomes Active
      ↓
Custom Domain Becomes Active
      ↓
Set Custom Domain as Primary
      ↓
Website Loads Through Custom Domain
```

---

# Critical Architecture Rules

Follow these rules throughout development:

1. **Laravel is the control plane and API.**
2. **React is the dashboard and visual editor.**
3. **Next.js is the public multi-tenant website renderer.**
4. **Do not store pages as generated HTML. Store structured JSON.**
5. **Do not deploy one application per customer website.**
6. **Use wildcard DNS for platform subdomains.**
7. **Use Cloudflare Custom Hostnames for customer-owned domains.**
8. **Keep Cloudflare credentials only in Laravel.**
9. **Separate draft and published revisions.**
10. **Builder and renderer should share the same React block components.**
11. **Never execute arbitrary customer JavaScript.**
12. **Every tenant-owned resource requires server-side authorization.**
13. **Use Redis heavily for public site resolution and caching.**
14. **Use queues for Cloudflare, publishing, media, notifications, and slow operations.**
15. **Build initially for one Uplary-managed server but design for horizontal scaling.**
16. **Use immutable revision history rather than destructive overwrites.**
17. **Use provider abstractions for Cloudflare so another domain provider can be added later.**
18. **Never expose raw provider errors or credentials to customers.**
19. **Unknown hostnames must never accidentally render another customer's website.**
20. **Complete the core publishing and domain workflow before adding secondary features.**

---

# Recommended Build Priority

The development team or AI coding agent should strictly prioritize:

```text
1. Foundation
2. Authentication
3. Multi-tenancy
4. Sites
5. Subdomains
6. Pages
7. Block architecture
8. Builder
9. Themes
10. Templates
11. Next.js renderer
12. Publishing
13. Cloudflare custom domains
14. Domain verification
15. Media
16. Navigation
17. Forms
18. SEO
19. Billing
20. Admin
21. Performance
22. Security
23. Testing
24. Uplary deployment
```

Do not start AI generation, e-commerce, blogging, marketplaces, or complex animations until this foundation is complete and production-tested.