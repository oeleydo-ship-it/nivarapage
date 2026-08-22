Build and integrate a **full-featured Funnel Module** into my existing web application.

The funnel system must be designed as a **modular feature that can be switched ON or OFF** from the Super Admin / application settings. When disabled, all funnel routes, menus, APIs, background jobs, tracking scripts, widgets, and related functionality should be hidden or disabled without affecting the rest of the platform.

The implementation must be production-ready, scalable, multi-tenant friendly, secure, and designed so additional marketing automation features can be added later.

## 1. Main Objective

Create a complete funnel builder and analytics system that allows users to:

- Create multiple funnels.
- Build funnels visually.
- Add unlimited funnel steps.
- Connect funnel steps together.
- Create landing pages.
- Capture leads.
- Track visitors.
- Track conversions.
- Create forms.
- Add checkout steps.
- Add upsells and downsells.
- Add booking steps.
- Add thank-you pages.
- Add conditional branching.
- Perform A/B testing.
- Track revenue.
- View funnel analytics.
- Integrate third-party tracking platforms.
- Trigger automations based on funnel activity.
- Use custom domains or subdomains.
- Duplicate funnels and funnel steps.
- Import/export funnels.
- Use funnel templates.

The funnel system should work alongside the application's normal website/page builder.

---

# 2. Funnel Module ON/OFF Toggle

Create a global Funnel module setting.

Example:

```text
Settings
└── Modules
    ├── Website Builder     ON
    ├── Blog                ON
    ├── Forms               ON
    ├── Funnel              ON / OFF
    ├── Booking             ON
    └── Email Marketing     ON
```

Database example:

```text
modules
- id
- key
- name
- enabled
- settings
- created_at
- updated_at
```

Example record:

```text
key: funnels
name: Funnels
enabled: true
```

When Funnels are OFF:

- Hide Funnels from navigation.
- Disable funnel routes.
- Disable funnel APIs.
- Stop funnel tracking.
- Stop funnel-specific scheduled jobs.
- Stop funnel-specific queue jobs.
- Do not load funnel tracking JavaScript.
- Do not expose public funnel pages.
- Existing funnel data must NOT be deleted.
- When enabled again, previous funnels should work again.
- Display an appropriate 404 or "Feature unavailable" response if someone directly accesses a disabled funnel URL.

Use middleware or a feature flag system.

Example:

```php
Route::middleware([
    'auth',
    'feature:funnels'
])->group(function () {
    // Funnel routes
});
```

Also support funnel availability by subscription plan in the future.

Example:

```text
Starter
Funnels: OFF

Professional
Funnels: ON
Funnels Limit: 10

Business
Funnels: ON
Funnels Limit: Unlimited
```

---

# 3. Dashboard Navigation

When the module is enabled, add:

```text
Funnels
├── Overview
├── All Funnels
├── Create Funnel
├── Templates
├── Leads
├── Contacts
├── Forms
├── Analytics
├── Experiments / A/B Tests
├── Domains
├── Integrations
└── Settings
```

The Funnels menu should completely disappear when the module is disabled.

---

# 4. Funnel Dashboard

Create a funnel overview dashboard.

Display:

```text
Total Funnels
Active Funnels
Draft Funnels
Visitors
Unique Visitors
Leads
Conversion Rate
Orders
Revenue
Average Order Value
Bookings
Abandoned Checkouts
```

Provide date filters:

```text
Today
Yesterday
Last 7 Days
Last 30 Days
This Month
Last Month
Custom Range
```

Allow filtering by:

```text
Funnel
Domain
Traffic Source
Campaign
Device
Country
UTM Campaign
```

Show graphs for:

- Visitors.
- Leads.
- Conversion rates.
- Revenue.
- Orders.
- Funnel drop-off.
- Traffic sources.

---

# 5. Funnel Creation

Provide:

```text
Create Funnel
```

Fields:

```text
Funnel Name
Description
Funnel Type
Domain
Slug
Status
Template
Goal
```

Funnel types:

```text
Lead Generation
Sales Funnel
Product Funnel
Booking Funnel
Webinar Funnel
Event Funnel
Survey Funnel
Application Funnel
Membership Funnel
Free Download Funnel
Newsletter Funnel
Custom Funnel
```

Possible goals:

```text
Collect Leads
Book Appointments
Sell Product
Register Users
Collect Applications
Download File
Newsletter Signup
Generate Inquiry
Custom Conversion
```

---

# 6. Funnel Status

Support:

```text
Draft
Published
Paused
Archived
```

Provide controls:

```text
Publish
Unpublish
Pause
Duplicate
Archive
Delete
Preview
```

Use soft deletes where appropriate.

---

# 7. Funnel Steps

Every funnel must support unlimited steps.

Example:

```text
Landing Page
      ↓
Lead Form
      ↓
Offer
      ↓
Checkout
      ↓
Upsell
      ↓
Thank You
```

Possible step types:

```text
Landing Page
Opt-In Page
Lead Form
Survey
Quiz
Offer Page
Product Page
Checkout
Order Form
Upsell
Downsell
Booking
Webinar Registration
Confirmation
Download
Thank You
Redirect
Custom Page
```

Each step should contain:

```text
Name
Slug
Step Type
Page
Position
Status
Next Step
Conversion Goal
Tracking Configuration
SEO Configuration
```

---

# 8. Visual Funnel Builder

Create a visual drag-and-drop funnel workflow.

Example:

```text
┌──────────────────┐
│ Landing Page     │
│ 12,450 visitors  │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Lead Capture     │
│ 2,147 leads      │
│ 17.2%            │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Sales Page       │
│ 1,842 visitors   │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Checkout         │
│ 284 orders       │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Thank You        │
└──────────────────┘
```

Users should be able to:

- Drag steps.
- Rearrange steps.
- Create connections.
- Delete connections.
- Zoom canvas.
- Pan canvas.
- Duplicate steps.
- Add new steps.
- Edit steps.
- Preview pages.
- View step statistics directly on nodes.

Save coordinates so the canvas layout remains unchanged when reopened.

---

# 9. Conditional Funnel Branching

Do not limit funnels to linear workflows.

Support branches.

Example:

```text
Lead Form
   │
   ├── Web Development
   │       ↓
   │   Web Development Offer
   │
   ├── SEO
   │       ↓
   │   SEO Offer
   │
   └── Hosting
           ↓
       Hosting Offer
```

Conditions could include:

```text
Form Answer
Product Purchased
Lead Tag
Contact Field
Country
Device
UTM Parameter
Referral Source
Previous Step
Purchase Amount
Booking Status
Returning Visitor
Custom Field
```

Use a flexible rule engine.

Example:

```text
IF
form.service == "web-development"

THEN
go_to_step = web-development-offer
```

Support:

```text
AND
OR
NOT
```

---

# 10. Page Builder Integration

Funnel pages should use the same page builder as normal website pages whenever possible.

A funnel step should reference an existing page or create a new page.

Example:

```text
funnel_steps
- id
- funnel_id
- page_id
- type
- name
- slug
```

Users should not need two completely different editors.

Create a shared reusable page builder architecture.

---

# 11. Funnel Templates

Provide ready-made funnel structures.

Examples:

```text
Lead Generation Funnel
Website Design Funnel
Consultation Funnel
SaaS Signup Funnel
Product Sales Funnel
Webinar Funnel
Newsletter Funnel
Course Funnel
Booking Funnel
Free Download Funnel
Real Estate Lead Funnel
Agency Lead Funnel
E-Commerce Funnel
```

Each template may include:

- Funnel steps.
- Page templates.
- Forms.
- Placeholder images.
- Default automation rules.
- Conversion goals.

Users can select:

```text
Use Template
```

and the entire funnel should be copied into their account.

---

# 12. Lead Capture

Create integrated funnel lead capture.

Store:

```text
First Name
Last Name
Email
Phone
Company
Country
Source
Campaign
UTM Source
UTM Medium
UTM Campaign
UTM Term
UTM Content
Landing Page
Funnel
Funnel Step
Referrer
IP metadata where legally appropriate
Device
Browser
Created At
```

Do not create duplicate leads unnecessarily.

Use configurable contact matching such as:

```text
Email
Phone
Email + Phone
```

---

# 13. Contact Profiles

Create a unified contact profile.

Example:

```text
John Smith

Email
Phone
Company
Country

Source:
Google Ads

First Funnel:
Website Design Funnel

Current Funnel Stage:
Consultation

Lifetime Value:
AED 4,500
```

Timeline:

```text
Visited Landing Page
Submitted Form
Opened Email
Clicked Offer
Started Checkout
Abandoned Checkout
Returned
Purchased Product
Booked Meeting
```

---

# 14. Lead Tags

Support tags:

```text
Hot Lead
SEO
Web Design
Hosting
Customer
VIP
Abandoned Checkout
Webinar Attendee
```

Allow tags to trigger automations.

---

# 15. Custom Lead Fields

Allow users to create fields such as:

```text
Industry
Company Size
Budget
Interested Service
Preferred Contact Time
Project Type
```

Supported types:

```text
Text
Textarea
Number
Email
Phone
Date
Dropdown
Radio
Checkbox
Boolean
Multi-select
```

---

# 16. Forms

Create a reusable form builder.

Supported fields:

```text
Text
Email
Phone
Number
Textarea
Select
Radio
Checkbox
Date
Time
File Upload
Hidden Field
Consent
Custom Fields
```

Actions after submit:

```text
Go to next funnel step
Redirect URL
Show message
Create lead
Update contact
Add tag
Remove tag
Send notification
Send email
Trigger webhook
Start automation
```

Support spam protection.

Include:

```text
Rate limiting
Honeypot
CAPTCHA integration
Validation
CSRF protection
```

---

# 17. Funnel Tracking

Implement first-party funnel tracking.

Generate a unique anonymous visitor ID.

Example cookie:

```text
funnel_visitor_id
```

Track:

```text
Page View
Unique Visitor
Step View
Button Click
Form View
Form Submission
Lead Created
Checkout Started
Checkout Abandoned
Purchase
Booking
Download
Video Interaction
Custom Conversion
```

Create a generic event system.

Example:

```text
funnel_events
- id
- tenant_id
- funnel_id
- step_id
- visitor_id
- contact_id
- session_id
- event
- event_data
- url
- referrer
- created_at
```

---

# 18. Visitor Sessions

Create:

```text
visitor_sessions
```

Store:

```text
visitor_id
session_id
landing_page
referrer
utm_source
utm_medium
utm_campaign
utm_term
utm_content
device
browser
country
started_at
last_activity_at
```

Do not store unnecessary personally identifiable data.

Support data-retention settings.

---

# 19. Funnel Conversion Goals

Users should be able to define goals:

```text
Lead Generated
Form Submitted
Purchase
Booking
Account Created
Download
Button Click
Reached Step
Custom Event
```

Allow multiple goals per funnel.

One goal can be designated the primary goal.

---

# 20. Conversion Rate

Calculate conversion rates.

Example:

```text
Landing Page

10,000 Visitors
↓
2,000 Leads

20% Conversion
```

Overall:

```text
10,000 visitors
250 customers

Overall conversion = 2.5%
```

Display both:

```text
Step Conversion Rate
Overall Funnel Conversion Rate
```

---

# 21. Funnel Drop-Off Analytics

Visualize:

```text
Landing
10,000
   ↓ 20%

Lead
2,000
   ↓ 40%

Offer
800
   ↓ 25%

Checkout
200
   ↓ 50%

Purchase
100
```

Clearly display where users abandon the funnel.

Highlight the biggest drop-off point.

---

# 22. Real-Time Analytics

Optionally provide real-time statistics.

Show:

```text
Visitors Online
Active Funnel Sessions
Current Step
Conversions Today
Revenue Today
Recent Leads
Recent Purchases
```

Use scalable event processing.

Avoid making the core page request unnecessarily heavy.

Use queues where appropriate.

---

# 23. Traffic Source Analytics

Track:

```text
Direct
Google
Facebook
Instagram
LinkedIn
TikTok
Email
Referral
Affiliate
Custom
```

Also track UTM parameters.

Dashboard example:

```text
Google Ads        3,245
Facebook Ads      2,118
Direct            1,902
Email             876
LinkedIn          421
```

---

# 24. A/B Testing

Create a full A/B testing system.

Allow:

```text
Variant A
Variant B
Variant C
```

Traffic allocation:

```text
A: 50%
B: 50%
```

or:

```text
A: 34%
B: 33%
C: 33%
```

Track:

```text
Visitors
Conversions
Conversion Rate
Revenue
Revenue Per Visitor
```

Allow user to:

```text
Start Test
Pause Test
Select Winner
Automatically Select Winner
```

Do not automatically declare statistical significance without proper calculations.

---

# 25. Persistent Experiment Assignment

Once a visitor receives Variant A, keep them on Variant A throughout the experiment unless configuration specifies otherwise.

Do not randomly switch variants on every request.

---

# 26. Products

Allow funnels to sell products.

Product fields:

```text
Name
Description
SKU
Price
Sale Price
Currency
Image
Tax
Type
Status
```

Types:

```text
Physical
Digital
Service
Subscription
```

---

# 27. Checkout

Build checkout funnel steps.

Support:

```text
Customer Information
Billing Address
Shipping Address
Product Selection
Quantity
Coupon
Tax
Payment
Order Summary
Terms Checkbox
```

Use secure payment integrations.

Never store raw card details.

---

# 28. Payment Gateway Architecture

Create an extendable payment gateway interface.

Initially prepare for providers such as:

```text
Stripe
PayPal
Paddle
Manual Payment
```

The architecture should allow additional gateways later.

Use provider webhooks.

Verify webhook signatures.

Make webhook processing idempotent.

---

# 29. Upsells and Downsells

Support:

```text
Purchase
    ↓
Upsell
 ┌──┴───┐
Accept Reject
  ↓       ↓
Upsell  Downsell
```

Allow:

```text
One-click Upsell where payment provider supports it
Downsell
Cross-sell
Order Bump
```

Track each separately.

---

# 30. Order Bumps

At checkout:

```text
☑ Add Website Maintenance
   AED 199/month
```

Track:

```text
Views
Acceptances
Revenue
Conversion Rate
```

---

# 31. Coupons

Create:

```text
Percentage Discount
Fixed Discount
Free Shipping
Limited Redemption
Start Date
Expiry Date
Product Restriction
Minimum Purchase
```

---

# 32. Orders

Create an order management area.

```text
Orders
├── All
├── Paid
├── Pending
├── Failed
├── Refunded
└── Cancelled
```

Store:

```text
Order Number
Customer
Products
Subtotal
Discount
Tax
Total
Currency
Gateway
Payment ID
Status
Funnel
Funnel Step
Created At
```

---

# 33. Abandoned Checkout Tracking

Detect checkout abandonment.

Example logic:

```text
checkout_started
but
purchase_not_completed
within configured time
```

Allow the threshold to be configurable.

Example:

```text
30 minutes
1 hour
3 hours
24 hours
```

This event can trigger future email/SMS automation.

---

# 34. Booking Funnel Step

Allow booking to be used as a funnel goal.

Example:

```text
Landing
↓
Lead Form
↓
Select Service
↓
Select Date
↓
Select Time
↓
Booking Confirmation
```

Integrate with the existing booking module when available.

If Booking is disabled globally, gracefully disable booking-specific funnel steps.

---

# 35. Surveys

Provide survey funnel steps.

Support:

```text
Single choice
Multiple choice
Text
Rating
Scale
Yes/No
Dropdown
Date
Custom fields
```

Results can:

```text
Update Lead
Apply Tags
Set Custom Fields
Branch Funnel
Trigger Automation
```

---

# 36. Quiz Funnels

Support score-based quiz funnels.

Example:

```text
Question 1
Question 2
Question 3
↓
Calculate Score
↓
Result A / B / C
```

Use quiz results for conditional routing.

---

# 37. Email Integration

Prepare funnel events for integration with the application's email marketing module.

Events:

```text
Lead Created
Form Submitted
Product Purchased
Checkout Abandoned
Booking Completed
Reached Funnel Step
Tag Added
```

Possible actions:

```text
Send Email
Subscribe to List
Start Sequence
Stop Sequence
Update Contact
```

Do not tightly couple the funnel module to email marketing.

Use events/listeners or an internal automation engine.

---

# 38. Automation Engine

Create funnel automation rules.

Structure:

```text
WHEN
Lead submits form

IF
Interested Service = SEO

THEN
Add Tag: SEO Lead
Send Email
Move to Funnel Step
Notify Team
Trigger Webhook
```

Triggers:

```text
Page Viewed
Lead Created
Form Submitted
Tag Added
Tag Removed
Product Purchased
Booking Created
Checkout Started
Checkout Abandoned
Funnel Completed
Custom Event
```

Actions:

```text
Send Email
Add Tag
Remove Tag
Update Contact
Notify User
Trigger Webhook
Move Contact
Delay
Create Task
Custom HTTP Action
```

---

# 39. Automation Delay

Support actions such as:

```text
Wait 10 minutes
Wait 1 hour
Wait 1 day
Wait until Monday
```

These delayed actions must run through reliable queues.

---

# 40. Webhooks

Allow users to configure outgoing webhooks.

Example:

```text
POST https://example.com/webhooks/leads
```

Events:

```text
Lead Created
Form Submitted
Purchase
Booking
Funnel Completed
```

Include:

```text
Webhook Secret
Signature
Retry Logic
Delivery Logs
HTTP Status
Response
Timestamp
```

Protect secrets securely.

---

# 41. Integrations

Prepare integration architecture for:

```text
Google Analytics
Google Tag Manager
Meta Pixel
TikTok Pixel
LinkedIn Insight Tag
Google Ads
Zapier
Make
Mailchimp
HubSpot
Webhook
Custom Script
```

Do not hardcode every integration into funnel business logic.

Use a provider-based integration layer.

---

# 42. Custom Tracking Scripts

Allow administrators to determine whether customers can add custom scripts.

Locations:

```text
Head
Start of Body
End of Body
```

Because custom scripts can create security risks, this capability should be permission-controlled.

---

# 43. Meta Pixel

Support:

```text
Pixel ID
PageView
Lead
ViewContent
InitiateCheckout
Purchase
CompleteRegistration
Custom Events
```

Prevent accidental duplicate firing.

---

# 44. Google Analytics

Allow:

```text
Measurement ID
```

Map funnel events to analytics events.

Example:

```text
generate_lead
begin_checkout
purchase
sign_up
```

---

# 45. SEO

Each public funnel page should support:

```text
SEO Title
Meta Description
Canonical URL
Open Graph Title
Open Graph Description
Open Graph Image
Index / Noindex
Follow / Nofollow
```

---

# 46. Funnel Domains

Support:

```text
platform.com/f/my-funnel

customer.platform.com

funnel.customer.com
```

Allow:

```text
Platform Domain
Assigned Subdomain
Custom Domain
Custom Hostname
```

Domain ownership must be validated before publishing.

---

# 47. Funnel URL Structure

Allow clean URLs:

```text
example.com/free-guide
example.com/checkout
example.com/thank-you
```

Do not require ugly URLs such as:

```text
/funnels/9383/steps/128
```

Internally the funnel can still resolve by IDs.

---

# 48. Domain Conflict Protection

Prevent duplicate slugs on the same domain.

Example:

```text
domain_id + path
```

must be unique.

---

# 49. Funnel Preview

Allow preview before publishing.

Example:

```text
Preview Desktop
Preview Tablet
Preview Mobile
```

Preview URLs should not be indexed by search engines.

---

# 50. Responsive Funnel Pages

Pages must work properly on:

```text
Desktop
Tablet
Mobile
```

Allow responsive block configuration in the page builder.

---

# 51. Funnel Analytics Page

Analytics should include:

```text
Visitors
Unique Visitors
Sessions
Leads
Lead Rate
Conversions
Conversion Rate
Orders
Revenue
Average Order Value
Revenue Per Visitor
Bookings
Checkout Starts
Abandoned Checkouts
```

---

# 52. Step Analytics

For every step display:

```text
Views
Unique Views
Conversions
Conversion Rate
Drop-Off
Revenue
Average Time on Step
```

Example:

```text
Landing Page
Visitors: 12,450
Conversions: 2,137
Conversion: 17.16%
Drop-off: 82.84%
```

---

# 53. Device Analytics

Show:

```text
Desktop
Mobile
Tablet
```

Track conversion separately.

---

# 54. Geographic Analytics

Where legally and technically possible, provide aggregated:

```text
Country
Region
City
```

Do not unnecessarily retain precise IP information.

---

# 55. Browser Analytics

Track:

```text
Chrome
Edge
Safari
Firefox
Other
```

---

# 56. Funnel Revenue Attribution

Associate revenue with:

```text
Funnel
Step
Visitor
Contact
Campaign
Traffic Source
UTM Campaign
```

This should allow reporting such as:

```text
Facebook Ads

Visitors: 4,200
Leads: 840
Customers: 84
Revenue: AED 42,000
Revenue / Visitor: AED 10
```

---

# 57. First-Touch and Last-Touch Attribution

Store enough data to calculate:

```text
First Touch
Last Touch
```

Keep the data model extensible for more advanced attribution later.

---

# 58. Funnel Activity Logs

Record important changes:

```text
Funnel Created
Funnel Published
Step Added
Step Deleted
Domain Changed
Automation Changed
Integration Added
A/B Test Started
A/B Winner Selected
```

Include:

```text
User
Action
IP where appropriate
Timestamp
Old Values
New Values
```

---

# 59. Version History

Page/funnel changes should support version history.

Example:

```text
Version 12
Published

Version 11
Draft

Version 10
Published
```

Allow:

```text
Preview
Restore
```

---

# 60. Draft vs Published Funnel Version

Do not immediately expose every edit to live visitors.

Maintain:

```text
Draft Version
Published Version
```

User flow:

```text
Edit
↓
Save Draft
↓
Preview
↓
Publish
```

---

# 61. Funnel Duplication

Allow:

```text
Duplicate Funnel
```

Copy:

```text
Steps
Pages
Forms
Connections
Automation Rules
Settings
```

Do not copy:

```text
Visitors
Analytics
Leads
Orders
Conversions
```

unless specifically requested.

---

# 62. Duplicate Funnel Step

Allow:

```text
Duplicate Step
```

Copy the associated page safely.

---

# 63. Funnel Import / Export

Create a portable funnel format.

For example:

```text
JSON
```

Export:

```text
Funnel
Steps
Connections
Pages
Forms
Configuration
Automations
```

Do not export sensitive credentials or secrets.

---

# 64. Funnel Template Marketplace Readiness

Architect the system so funnel templates could later be:

```text
Free
Premium
Official
Third Party
```

Do not build payment marketplace functionality yet unless already supported by the platform.

---

# 65. Multi-Tenant Architecture

Every funnel-related record must belong to the appropriate tenant/account/workspace.

Always scope queries.

Examples:

```text
tenant_id
workspace_id
user_id
```

depending on the application's tenancy model.

Never rely only on frontend filtering.

Enforce tenant isolation server-side.

---

# 66. Permissions

Provide permission controls such as:

```text
funnels.view
funnels.create
funnels.edit
funnels.delete
funnels.publish
funnels.analytics
funnels.manage_leads
funnels.manage_domains
funnels.manage_integrations
funnels.manage_automation
funnels.manage_orders
```

---

# 67. Roles

Typical roles:

```text
Owner
Administrator
Marketing Manager
Editor
Analyst
Viewer
```

Allow permissions to be customized.

---

# 68. Database Architecture

Create normalized production-ready tables such as:

```text
funnels

funnel_steps

funnel_connections

funnel_versions

funnel_step_versions

funnel_goals

funnel_events

funnel_visitors

funnel_sessions

funnel_conversions

funnel_forms

funnel_form_fields

funnel_form_submissions

contacts

contact_tags

tags

contact_custom_fields

products

orders

order_items

payments

coupons

funnel_experiments

funnel_variants

funnel_variant_assignments

automation_workflows

automation_triggers

automation_actions

webhooks

webhook_deliveries

integrations

domains
```

Reuse existing application entities whenever appropriate rather than duplicating functionality.

---

# 69. Suggested Funnels Table

```text
funnels
- id
- tenant_id
- name
- slug
- description
- type
- status
- domain_id
- primary_goal_id
- published_version_id
- created_by
- created_at
- updated_at
- deleted_at
```

---

# 70. Funnel Steps Table

```text
funnel_steps
- id
- tenant_id
- funnel_id
- page_id
- name
- slug
- type
- status
- position
- canvas_x
- canvas_y
- settings
- created_at
- updated_at
- deleted_at
```

---

# 71. Funnel Connections

```text
funnel_connections
- id
- funnel_id
- source_step_id
- target_step_id
- connection_type
- condition_group
- priority
- created_at
```

---

# 72. Visitors

```text
funnel_visitors
- id
- tenant_id
- uuid
- first_seen_at
- last_seen_at
- first_source
- first_medium
- first_campaign
- first_referrer
```

---

# 73. Funnel Sessions

```text
funnel_sessions
- id
- tenant_id
- visitor_id
- session_uuid
- funnel_id
- landing_step_id
- source
- medium
- campaign
- referrer
- device
- browser
- country
- started_at
- ended_at
```

---

# 74. Events

Use a scalable event table.

```text
funnel_events
- id
- tenant_id
- funnel_id
- step_id
- visitor_id
- session_id
- contact_id
- event_type
- event_data
- occurred_at
```

Index fields used for analytics.

Avoid indexing large JSON payloads unnecessarily.

---

# 75. Event Processing

Do not perform all analytics synchronously.

Suggested architecture:

```text
Browser Event
      ↓
Tracking Endpoint
      ↓
Validate
      ↓
Store / Queue
      ↓
Analytics Processor
      ↓
Aggregates
      ↓
Dashboard
```

Use queues for expensive processing.

---

# 76. Analytics Aggregation

Create aggregate tables where needed.

Example:

```text
funnel_daily_stats
```

Fields:

```text
date
tenant_id
funnel_id
step_id
visitors
unique_visitors
leads
conversions
orders
revenue
```

This avoids scanning millions of raw events every time the dashboard loads.

---

# 77. Laravel Architecture

For a Laravel backend, organize the funnel feature into clear domains/services.

Example:

```text
app/
  Domain/
    Funnels/
      Actions/
      Events/
      Listeners/
      Models/
      Services/
      DTOs/
      Policies/
      Rules/
      Jobs/
```

Or use the existing architecture of the project if it already follows another clean convention.

Do not unnecessarily rewrite the existing application architecture.

---

# 78. Backend Services

Create dedicated services such as:

```text
FunnelService

FunnelPublishingService

FunnelTrackingService

FunnelAnalyticsService

FunnelConversionService

FunnelExperimentService

FunnelRoutingService

FunnelTemplateService

FunnelAutomationService
```

Avoid putting large amounts of business logic inside controllers.

---

# 79. Events

Use Laravel events for decoupling.

Examples:

```text
LeadCreated
FormSubmitted
FunnelStepViewed
FunnelConverted
CheckoutStarted
OrderCreated
PaymentCompleted
BookingCreated
FunnelCompleted
```

Listeners can then trigger:

```text
Analytics
Email
Automations
Webhooks
Notifications
CRM Updates
```

---

# 80. Queues

Use queues for tasks such as:

```text
Analytics processing
Webhook delivery
Automation execution
Emails
Pixel server-side events
Report generation
Large funnel duplication
Import/export
```

Ensure jobs are:

```text
Retryable
Idempotent
Observable
```

---

# 81. Scheduler

Use scheduled commands for tasks such as:

```text
Aggregate analytics
Clean expired sessions
Process abandoned checkouts
Retry failed webhooks
Apply data retention rules
Clean temporary previews
```

---

# 82. Redis

If available, Redis may be used for:

```text
Queues
Rate limiting
Short-lived sessions
Analytics counters
Locks
Idempotency
Caching
```

Do not require Redis for core correctness unless the application already requires it.

---

# 83. Cache Strategy

Cache:

```text
Published Funnel Definition
Published Page Configuration
Module Feature Flags
Domain Resolution
Template Metadata
```

Invalidate caches when publishing or changing configuration.

---

# 84. Funnel Public Rendering

Published public funnel requests should be optimized for speed.

Avoid loading the complete dashboard application bundle.

Use:

```text
SSR
Static-like caching
Edge caching where compatible
Optimized assets
Lazy loading
```

depending on the frontend architecture.

---

# 85. React Dashboard

If the dashboard uses React, create reusable components such as:

```text
FunnelList

FunnelCard

FunnelCanvas

FunnelNode

FunnelConnection

FunnelAnalytics

StepAnalytics

FunnelSettings

FunnelDomainSelector

FunnelGoalSelector

ExperimentPanel
```

Use a graph/canvas library where beneficial rather than reinventing complex node interactions.

---

# 86. Next.js Public Frontend

If the public website uses Next.js, funnel pages should resolve dynamically through the backend.

Concept:

```text
domain + path
      ↓
Resolve Published Page
      ↓
Load Funnel Context
      ↓
Render Page
      ↓
Send Tracking Event
```

Keep SEO-compatible rendering.

---

# 87. Funnel Context

When rendering a funnel step, provide a context containing:

```text
funnel_id
step_id
visitor_id
session_id
variant_id
next_step
previous_step
tracking_config
```

Do not expose sensitive internal information unnecessarily.

---

# 88. Tracking API

Example:

```text
POST /api/funnel/events
```

Payload concept:

```json
{
  "event": "form_submit",
  "funnel": "...",
  "step": "...",
  "session": "...",
  "metadata": {}
}
```

Validate all server-trusted information.

Do not trust arbitrary funnel IDs or tenant IDs supplied by clients.

---

# 89. Public API

Prepare optional APIs for:

```text
List Funnels
Get Funnel
Create Lead
Get Funnel Analytics
Trigger Custom Event
```

Protect authenticated APIs with:

```text
Authentication
Authorization
Scopes
Rate Limits
Tenant Isolation
```

---

# 90. Rate Limiting

Apply appropriate rate limits to:

```text
Tracking Endpoint
Form Submission
Login
Public APIs
Webhook Test Endpoint
Checkout
```

Do not accidentally block legitimate high-traffic funnels with overly restrictive limits.

---

# 91. Security

Implement:

```text
CSRF Protection
XSS Protection
Input Sanitization
Output Escaping
SQL Injection Protection
Authorization Policies
Tenant Isolation
Secure Cookies
Signed URLs where appropriate
Rate Limiting
Webhook Signature Verification
File Upload Validation
Content Security Policy where practical
```

Never trust page builder content automatically.

---

# 92. Custom HTML Security

If users can add custom HTML:

- Sanitize HTML according to allowed permissions.
- Separate normal-user functionality from trusted administrator functionality.
- Prevent unsafe script execution by default.
- Do not allow arbitrary server-side code.

---

# 93. Privacy

Provide controls for:

```text
Cookie Consent
Tracking Consent
Analytics Consent
Marketing Consent
Data Export
Data Deletion
Retention Period
```

The system should be designed to support applicable privacy obligations.

Do not assume that every visitor may legally be tracked without consent.

---

# 94. Cookie Consent Integration

Tracking should support consent modes such as:

```text
Essential Only
Analytics Allowed
Marketing Allowed
All Allowed
```

Marketing pixels should respect configuration and consent requirements.

---

# 95. Bot Filtering

Analytics should attempt to avoid obvious bot traffic.

Use safe detection techniques and avoid blindly trusting user-agent strings.

Provide:

```text
Include Bots: OFF
```

for analytics reporting when practical.

---

# 96. Funnel Search

Allow users to search funnels by:

```text
Name
Domain
Status
Type
Creator
```

Filters:

```text
Published
Draft
Paused
Archived
Lead Generation
Sales
Booking
```

---

# 97. Bulk Actions

Support:

```text
Publish
Pause
Archive
Duplicate
Delete
```

with appropriate confirmation and permissions.

---

# 98. Funnel Settings

Per-funnel settings:

```text
General
Domain
SEO
Tracking
Goals
Integrations
Automation
Cookies
Custom Code
Advanced
```

---

# 99. Global Funnel Settings

Global:

```text
Default Domain
Default Tracking
Data Retention
Cookie Policy
Bot Filtering
Default Currency
Checkout Settings
Allowed Integrations
Custom Script Permission
```

---

# 100. Notifications

Allow notifications for important funnel events.

Examples:

```text
New Lead
New Order
Booking Created
High-value Purchase
Webhook Failure
Experiment Winner
```

Channels can later include:

```text
In-App
Email
Slack
Webhook
```

---

# 101. Funnel Performance Alerts

Optionally support alerts such as:

```text
Conversion Rate Dropped 30%
Checkout Failures Increased
Traffic Increased 500%
Webhook Failures Detected
```

Do not generate noisy alerts from very small sample sizes.

---

# 102. Funnel Reports

Allow users to generate reports for:

```text
Performance
Leads
Conversions
Revenue
Traffic Sources
Experiments
Orders
```

Export:

```text
CSV
XLSX
PDF
```

Implement exports asynchronously for large datasets.

---

# 103. Empty States

Create useful empty-state interfaces.

Example:

```text
You haven't created a funnel yet.

Create your first funnel to start converting visitors into leads and customers.

[Create Funnel]
[Use Template]
```

---

# 104. Error States

Provide meaningful states for:

```text
Domain Not Connected
Page Missing
Payment Gateway Disconnected
Integration Error
Webhook Failure
Experiment Configuration Error
Publishing Error
```

Never expose stack traces to users.

---

# 105. Setup Wizard

For first-time users:

```text
Step 1
Choose Funnel Goal

Step 2
Select Template

Step 3
Customize Pages

Step 4
Connect Domain

Step 5
Configure Tracking

Step 6
Publish
```

Allow skipping optional steps.

---

# 106. Funnel Health Checklist

Before publishing show:

```text
✓ Landing Page Added
✓ Conversion Goal Set
✓ Form Connected
✓ Thank You Page Added
✓ Domain Connected
✓ SSL Active
✓ Mobile Preview Checked

⚠ Analytics not configured
⚠ SEO description missing
```

Do not prevent publishing for optional recommendations.

---

# 107. Funnel Status Card

Show:

```text
Website Design Funnel

Published

Visitors
12,450

Leads
2,137

Customers
143

Conversion
1.15%

Revenue
AED 89,450
```

Actions:

```text
Edit
Analytics
Preview
Duplicate
More
```

---

# 108. Funnel Step Card

Each canvas node can display:

```text
Lead Capture

Visitors
5,421

Conversions
1,032

Conversion
19.04%

[Edit Page]
```

---

# 109. Performance

The system must be designed for potentially high-volume tracking.

Do not run expensive queries for every analytics request.

Use:

```text
Indexes
Aggregation
Caching
Queues
Pagination
Cursor Pagination
Database Partitioning readiness
```

where appropriate.

---

# 110. Database Indexing

Plan indexes around queries.

Examples:

```text
tenant_id + funnel_id

funnel_id + occurred_at

step_id + occurred_at

visitor_id + occurred_at

contact_id

session_id

event_type + occurred_at
```

Do not add indexes blindly.

---

# 111. Data Retention

Allow retention rules such as:

```text
Raw Events: 90 days
Aggregated Analytics: Keep
Anonymous Sessions: 180 days
Webhook Logs: 30 days
```

Make these configurable.

---

# 112. Testing

Create automated tests covering:

```text
Feature Toggle
Tenant Isolation
Funnel CRUD
Publishing
Step Routing
Conditional Routing
Forms
Lead Capture
Tracking
Conversions
A/B Assignment
Checkout
Payments
Webhook Validation
Permissions
Analytics
Domain Routing
Duplicate Funnel
Templates
Automations
```

Use:

```text
Unit Tests
Feature Tests
Integration Tests
Browser/E2E Tests
```

where appropriate.

---

# 113. Feature Toggle Tests

Specifically verify:

```text
Funnels ON
→ menu visible
→ routes accessible
→ tracking works

Funnels OFF
→ menu hidden
→ routes unavailable
→ public funnels unavailable
→ tracking disabled
→ data retained
```

---

# 114. Auditability

Critical changes should be auditable.

Examples:

```text
Published funnel
Changed payment gateway
Deleted funnel
Changed domain
Enabled custom scripts
Modified webhook
Selected experiment winner
```

---

# 115. API Idempotency

Implement idempotency where duplicate requests would be harmful.

Especially for:

```text
Payments
Orders
Conversions
Webhook Processing
Automation Actions
```

---

# 116. Concurrency Protection

Prevent duplicate processing due to simultaneous webhook requests or jobs.

Use:

```text
Database constraints
Atomic operations
Locks
Idempotency keys
```

where appropriate.

---

# 117. Module Dependencies

Funnels may optionally depend on other modules.

Example:

```text
Funnels
├── Forms
├── Booking
├── Email Marketing
├── Products
└── Payments
```

However, the core Funnel module must still work without every optional module.

For example:

```text
Booking OFF
→ Hide Booking Funnel Step

Products OFF
→ Hide Checkout/Product Funnel Steps

Email Marketing OFF
→ Hide Email Automation Actions
```

Do not break the entire funnel system.

---

# 118. Super Admin Module Management

Super Admin should see:

```text
Module: Funnels

Status
ON / OFF

Availability
All Plans
Selected Plans

Dependencies

Version

Settings
```

Possible options:

```text
Enable Module
Disable Module
Enable for Selected Plans
Set Funnel Limits
Set Visitor Limits
Set Automation Limits
```

---

# 119. Subscription Limits

Prepare for plan restrictions such as:

```text
Funnels
Funnels Published
Monthly Funnel Visitors
Contacts
Custom Domains
A/B Tests
Automations
Team Members
```

Example:

```text
Starter
3 Funnels
1 Published Funnel
5,000 Visitors/month

Professional
25 Funnels
10 Published
100,000 Visitors/month

Business
Unlimited Funnels
Unlimited Published
500,000 Visitors/month
```

Enforce limits on the backend.

---

# 120. Usage Metering

Track usage such as:

```text
Monthly Unique Funnel Visitors
Raw Events
Contacts
Published Funnels
Automation Executions
Webhook Deliveries
```

Design usage tracking independently from raw analytics where possible.

---

# 121. Upgrade UX

When a plan limit is reached:

```text
You've reached your funnel limit.

Current:
3 / 3 Funnels

Upgrade your plan to create additional funnels.

[View Plans]
```

Do not delete or disable existing data automatically because of a downgrade without an explicit product policy.

---

# 122. Funnel Feature Flags

In addition to the master switch, support granular future flags:

```text
funnels.enabled

funnels.ab_testing

funnels.checkout

funnels.automation

funnels.custom_domains

funnels.webhooks

funnels.analytics

funnels.templates
```

This enables staged rollout.

---

# 123. Deployment Strategy

Do not build everything as one large risky release.

Implement in phases.

## Phase 1 — Core Funnel

Build:

- Module ON/OFF.
- Permissions.
- Funnel CRUD.
- Funnel steps.
- Funnel connections.
- Page builder integration.
- Funnel publishing.
- Public routing.
- Forms.
- Leads.
- Basic tracking.
- Basic analytics.

## Phase 2 — Advanced Analytics

Build:

- Sessions.
- Traffic attribution.
- UTM tracking.
- Device reporting.
- Geographic reporting.
- Drop-off analytics.
- Revenue attribution.
- Aggregated reporting.

## Phase 3 — Conversion Tools

Build:

- Products.
- Checkout.
- Payments.
- Orders.
- Coupons.
- Order bumps.
- Upsells.
- Downsells.
- Abandoned checkout.

## Phase 4 — Experiments

Build:

- A/B testing.
- Variant assignment.
- Experiment analytics.
- Winner selection.

## Phase 5 — Automation

Build:

- Triggers.
- Conditions.
- Actions.
- Delays.
- Email integration.
- Webhooks.
- External integrations.

## Phase 6 — Advanced Funnel Tools

Build:

- Surveys.
- Quiz funnels.
- Conditional branches.
- Funnel templates.
- Import/export.
- Version history.
- Template marketplace readiness.

---

# 124. UI / UX Requirements

The UI must be:

- Clean.
- Modern.
- SaaS-oriented.
- Responsive.
- Easy for non-technical users.
- Consistent with the current application's design system.

Avoid overly complicated screens.

Use progressive disclosure.

Basic users should be able to create a funnel without understanding:

```text
Events
Sessions
UTM attribution
Webhooks
Automation engines
```

Advanced options should remain available under appropriate settings.

---

# 125. Desired User Flow

A normal user should be able to:

```text
Create Funnel
↓
Choose Template
↓
Edit Landing Page
↓
Add Form
↓
Edit Thank You Page
↓
Choose Conversion Goal
↓
Connect Domain
↓
Preview
↓
Publish
↓
Receive Leads
↓
View Analytics
```

This should be achievable without writing code.

---

# 126. Architecture Principle

Do not create funnel functionality as an isolated monolith.

Build reusable platform services for:

```text
Contacts
Forms
Pages
Products
Payments
Events
Automation
Domains
Analytics
Integrations
```

Funnels should orchestrate these capabilities.

This allows the same components to later power:

```text
Normal Websites
Landing Pages
Marketing Campaigns
Email Marketing
CRM
Booking
E-Commerce
Memberships
```

---

# 127. Critical Implementation Rules

Do not:

- Break existing website functionality.
- Replace working modules unnecessarily.
- Duplicate existing page-builder functionality.
- Store raw card information.
- Trust tenant IDs from browser requests.
- Perform expensive analytics queries on every dashboard load.
- Hardcode provider-specific logic throughout the application.
- Delete funnel data when the module is disabled.
- Allow disabled modules to leave accessible API endpoints.
- Build automation directly inside controllers.
- Put business logic into React components.
- Trust client-side authorization.

Always:

- Use server-side permissions.
- Use tenant-scoped queries.
- Use transactions for critical operations.
- Validate all inputs.
- Use queues for heavy work.
- Verify payment/webhook signatures.
- Use idempotency for payment-related operations.
- Log important administrative activity.
- Reuse existing platform services.
- Add automated tests.
- Preserve backward compatibility.

---

# 128. Final Expected Result

After implementation, the application should support this workflow:

```text
Super Admin
      ↓
Settings → Modules
      ↓
Funnels: ON
      ↓
User Dashboard
      ↓
Funnels
      ↓
Create Funnel
      ↓
Select Template
      ↓
Landing Page
      ↓
Lead Form
      ↓
Offer
      ↓
Checkout
      ↓
Upsell
      ↓
Thank You
      ↓
Analytics + CRM + Automation
```

And when Super Admin sets:

```text
Funnels: OFF
```

the behavior should become:

```text
Funnels menu hidden
Funnel dashboard inaccessible
Funnel APIs disabled
Public funnel URLs disabled
Tracking disabled
Funnel workers/jobs disabled where applicable
Existing funnel data preserved
```

When switched back ON:

```text
Existing funnels restored
Published funnels become available again
Analytics history remains intact
Settings remain intact
```

The completed feature should feel like a native combination of a **landing-page builder, sales funnel builder, lead-capture system, conversion analytics platform, checkout system, A/B testing platform, and marketing automation engine**, while remaining modular enough to integrate cleanly with the rest of the application.