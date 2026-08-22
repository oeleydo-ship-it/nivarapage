<?php

namespace Database\Seeders;

/**
 * Quarry — operations infrastructure for licensed energy suppliers.
 *
 * Cool off-white grounds, deep sky-blue bands, and one bright sky accent used as
 * a marker highlight and as blocky pixel art. Archivo uppercase headings over
 * DM Sans. All colours come from the theme tokens below.
 */
class TemplateQuarry
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            // Every Quarry block reads these tokens rather than baking colours in,
            // so the whole family recolours from Theme settings alone.
            'primary' => '#0369a1',
            'secondary' => '#082f49',
            'accent' => '#7dd3fc',
            'background' => '#f2f5f8',
            'surface' => '#ffffff',
            'text' => '#0f1a24',
            'muted' => '#5c6b78',
            'headingFont' => 'Archivo, system-ui, sans-serif',
            'bodyFont' => 'DM Sans, system-ui, sans-serif',
            'monoFont' => 'JetBrains Mono, ui-monospace, monospace',
            'serifFont' => 'Newsreader, Georgia, serif',
            'headingWeight' => 700,
            'bodyWeight' => 400,
            'buttonRadius' => '4px',
            'cardRadius' => '2px',
            'containerWidth' => '1240px',
            'sectionSpacing' => '96px',
        ];
    }

    /** @return array<string, mixed> */
    private static function motion(int $delay = 0, string $trigger = 'scroll'): array
    {
        return [
            'animation' => 'fade-up',
            'animationTrigger' => $trigger,
            'animationDuration' => 700,
            'animationDelay' => $delay,
        ];
    }

    /**
     * Composes one page: sticky navbar, sections, mega footer.
     *
     * @param  array<string, mixed>  $nav
     * @param  list<array<string, mixed>>  $sections
     * @param  array<string, mixed>  $footer
     * @return array<string, mixed>
     */
    private static function page(string $name, string $slug, bool $homepage, array $nav, array $sections, array $footer): array
    {
        return [
            'name' => $name,
            'slug' => $slug,
            'is_homepage' => $homepage,
            'content_json' => TemplateContent::page(array_merge(
                [TemplateContent::section('nav', 'navbar.quarry', $nav)],
                $sections,
                [TemplateContent::section('footer', 'footer.quarry', $footer)],
            )),
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $brand = 'Quarry';
        $email = 'hello@quarry.systems';

        $nav = array_merge([
            'logo' => $brand,
            'logoIcon' => 'layers',
            'logoUrl' => '/',
            'links' => [
                ['label' => 'Automated Ops', 'url' => '/platform', 'children' => [
                    ['label' => 'How it works', 'url' => '/platform'],
                    ['label' => 'Governance', 'url' => '/platform#governed'],
                    ['label' => 'Audit trails', 'url' => '/platform'],
                ]],
                ['label' => 'Platform', 'url' => '/platform#backbone', 'children' => [
                    ['label' => 'Quarry Backend', 'url' => '/platform#backbone'],
                    ['label' => 'Data integration', 'url' => '/platform'],
                    ['label' => 'Workflows', 'url' => '/platform'],
                ]],
                ['label' => 'Solutions', 'url' => '/onboarding', 'children' => [
                    ['label' => 'Customer onboarding', 'url' => '/onboarding'],
                    ['label' => 'Supplier switching', 'url' => '/onboarding'],
                    ['label' => 'Billing exceptions', 'url' => '/onboarding'],
                ]],
                ['label' => 'Ecosystem', 'url' => '/ecosystem'],
                ['label' => 'Resources', 'url' => '/ecosystem#resources'],
            ],
            'secondaryLabel' => 'Log in',
            'secondaryUrl' => '/contact',
            'buttonLabel' => 'Book a demo',
            'buttonUrl' => '/contact',
            'sticky' => true,
        ], self::motion(0, 'load'), ['animation' => 'fade-down', 'animationDuration' => 500]);

        $footer = array_merge([
            'logo' => $brand,
            'logoIcon' => 'layers',
            'logoUrl' => '/',
            'tagline' => 'The operational infrastructure licensed suppliers grow on',
            'social' => [
                ['icon' => 'twitter', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
                ['icon' => 'youtube', 'url' => '#'],
                ['icon' => 'message', 'url' => '#'],
            ],
            'copyright' => 'Copyright © '.date('Y').' Quarry',
            'columns' => [
                ['title' => 'GET STARTED', 'links' => [
                    ['label' => 'Automated Ops', 'url' => '/platform'],
                    ['label' => 'Sign up for free', 'url' => '/contact'],
                    ['label' => 'Book a demo', 'url' => '/contact'],
                ]],
                ['title' => 'CUSTOMER LIFECYCLE', 'links' => [
                    ['label' => 'Customer onboarding', 'url' => '/onboarding'],
                    ['label' => 'Account management', 'url' => '/onboarding'],
                    ['label' => 'Billing exceptions', 'url' => '/platform'],
                    ['label' => 'Disputes & support cases', 'url' => '/platform'],
                    ['label' => 'Annual statement runs', 'url' => '/platform'],
                    ['label' => 'Request for information', 'url' => '/contact'],
                ]],
                ['title' => 'PROCESSES', 'links' => [
                    ['label' => 'Meter data validation', 'url' => '/platform'],
                    ['label' => 'Supplier switching', 'url' => '/platform'],
                    ['label' => 'Arrears & affordability', 'url' => '/platform'],
                    ['label' => 'Regulatory reporting', 'url' => '/platform'],
                    ['label' => 'Multi-supplier orchestration', 'url' => '/platform'],
                ]],
                ['title' => 'INDUSTRIES', 'links' => [
                    ['label' => 'Energy retail', 'url' => '/onboarding'],
                    ['label' => 'Water', 'url' => '/onboarding'],
                    ['label' => 'District heating', 'url' => '/onboarding'],
                    ['label' => 'EV charging networks', 'url' => '/onboarding'],
                    ['label' => 'Metering agents', 'url' => '/onboarding'],
                ]],
                ['title' => 'COMPANY', 'links' => [
                    ['label' => 'Contact', 'url' => '/contact'],
                    ['label' => 'Trust Center', 'url' => '#'],
                    ['label' => 'Support', 'url' => '/contact'],
                    ['label' => 'Blog', 'url' => '#'],
                    ['label' => 'Podcast', 'url' => '#'],
                ]],
                ['title' => 'PLATFORM', 'links' => [
                    ['label' => 'Quarry Backend', 'url' => '/platform#backbone'],
                    ['label' => 'Data integration', 'url' => '/platform'],
                    ['label' => 'Dashboards & analytics', 'url' => '/platform'],
                    ['label' => 'Workflows', 'url' => '/platform'],
                    ['label' => 'Approvals & escalation', 'url' => '/platform'],
                    ['label' => 'Audit trails', 'url' => '/platform'],
                    ['label' => 'Roles & permissions', 'url' => '/platform'],
                ]],
                ['title' => 'ECOSYSTEM', 'links' => [
                    ['label' => 'Integrations', 'url' => '/ecosystem'],
                    ['label' => 'Agents', 'url' => '/ecosystem'],
                    ['label' => 'Utilities', 'url' => '/ecosystem'],
                    ['label' => 'Partners', 'url' => '/ecosystem'],
                ]],
                ['title' => 'DEVELOPERS', 'links' => [
                    ['label' => 'Documentation', 'url' => '#'],
                    ['label' => 'GitHub', 'url' => '#'],
                    ['label' => 'Status', 'url' => '#'],
                    ['label' => 'Forum', 'url' => '#'],
                ]],
            ],
            'badges' => [
                ['label' => 'AICPA SOC 2'],
                ['label' => 'GDPR'],
                ['label' => 'ISO 27001'],
            ],
            'legal' => [
                ['label' => 'Privacy Policy', 'url' => '#'],
                ['label' => 'Terms and Conditions', 'url' => '#'],
                ['label' => 'Data Processing Addendum', 'url' => '#'],
                ['label' => 'Sub-processors', 'url' => '#'],
                ['label' => 'Responsible disclosure Policy', 'url' => '#'],
            ],
            'pattern' => 'stair',
        ], self::motion(0));

        $logos = array_merge([
            'heading' => 'Trusted by suppliers serving 6 million meters',
            'items' => [
                ['label' => 'northmeter'],
                ['label' => 'Halden'],
                ['label' => 'Brightcurrent'],
                ['label' => 'Kelvara'],
                ['label' => 'peatworks'],
                ['label' => 'Solvent'],
            ],
        ], self::motion(40));

        $ctaBand = array_merge([
            'eyebrow' => 'GET STARTED',
            'heading' => 'LEVEL UP YOUR',
            'headingHighlight' => 'OPS GAME',
            'description' => 'One control plane. Every action traced — human, agent, or scheduled job.',
            'buttonLabel' => 'Book a demo',
            'buttonUrl' => '/contact',
            'pattern' => 'stair',
        ], self::motion(40));

        $quote = array_merge([
            'badge' => 'Kelvara',
            'quote' => 'Our obligation is to clear a switch inside the industry window, every time. Quarry made that measurable instead of hopeful.',
            'name' => 'Marit Sundqvist',
            'role' => 'Head of Market Operations',
            'pattern' => 'scatter',
        ], self::motion(40));

        return [
            /* ------------------------------------------------------------ home */
            self::page('Home', 'home', true, $nav, [
                TemplateContent::section('hero', 'hero.quarry', array_merge([
                    'eyebrow' => 'THE OPERATIONS BACKBONE',
                    'heading' => 'THE OPERATIONAL INFRASTRUCTURE LICENSED',
                    'headingHighlight' => 'ENERGY SUPPLIERS',
                    'headingTail' => 'RUN ON',
                    'description' => 'Meter data, switching, billing exceptions, and regulatory reporting in one control plane — with every action logged for your auditor.',
                    'buttonLabel' => 'Book a demo',
                    'buttonUrl' => '/contact',
                    'secondaryLabel' => 'See how it works',
                    'secondaryUrl' => '/platform',
                    'pattern' => 'ridge',
                ], self::motion(0, 'load'), ['animationDuration' => 900])),
                TemplateContent::section('logos', 'logos.quarry', $logos),
                TemplateContent::section('stats', 'stats.quarry', array_merge([
                    'eyebrow' => 'KEY FIGURES',
                    'heading' => 'STOP RUNNING YOUR',
                    'headingHighlight' => 'OPERATIONS',
                    'headingTail' => 'LIKE IT IS 2011',
                    'description' => 'Four numbers our customers quote back to us after the first billing cycle.',
                    'items' => [
                        ['index' => 'FIGURE 01', 'value' => '3x', 'title' => 'Faster exception clearing', 'text' => 'Billing holds resolve in hours, not across a full cycle.'],
                        ['index' => 'FIGURE 02', 'value' => '+50%', 'title' => 'More switches on time', 'text' => 'Objection windows are worked before they lapse.'],
                        ['index' => 'FIGURE 03', 'value' => '100%', 'title' => 'Actions carry evidence', 'text' => 'Every write is attributed, timestamped, and replayable.'],
                        ['index' => 'FIGURE 04', 'value' => '12', 'title' => 'Weeks to first go-live', 'text' => 'One market segment live before the next quarter.'],
                    ],
                ], self::motion(40))),
                TemplateContent::section('layer', 'split.quarry', array_merge([
                    'eyebrow' => 'ONE CONTROL PLANE',
                    'heading' => 'ONE LAYER BETWEEN YOUR TEAM, YOUR DATA, AND YOUR',
                    'headingHighlight' => 'SUPPLIERS',
                    'description' => 'Quarry sits above the systems you already run. It reads from your settlement feeds, writes back through your own credentials, and keeps a record of both.',
                    'bullets' => "Reads industry flows without a migration\nWrites back through your existing credentials\nEvery step attributed to a person or an agent\nNo customer data leaves your tenancy",
                    'buttonLabel' => 'See the platform',
                    'buttonUrl' => '/platform',
                    'image' => TemplateContent::photo('1551288049-bebda4e38f71', 1000),
                    'imageAlt' => 'Operations dashboard',
                ], self::motion(40))),
                TemplateContent::section('layers', 'pillars.quarry', array_merge([
                    'eyebrow' => 'BUILT FOR OVERSIGHT',
                    'heading' => 'FOUR LAYERS THAT MAKE AUTOMATED OPS SAFE IN',
                    'headingHighlight' => 'LICENSED MARKETS',
                    'description' => 'Automation is the easy part. Proving what happened, to whom, and on whose authority is the part your regulator asks about.',
                    'bullets' => "Every write carries an identity and a reason\nPermissions inherit from your own role model\nModels are pinned, versioned, and replayable\nEvidence exports in the format your auditor expects",
                    'items' => [
                        ['title' => 'Sovereign data', 'text' => 'Records stay in your tenancy. Quarry holds pointers, never copies.'],
                        ['title' => 'Scoped authority', 'text' => 'An agent can only ever do what the person who ran it could do.'],
                        ['title' => 'Human checkpoints', 'text' => 'Value thresholds and risk bands route decisions back to a named reviewer.'],
                        ['title' => 'Open attribution', 'text' => 'One trail across people, agents, and jobs — exportable end to end.'],
                    ],
                ], self::motion(40))),
                TemplateContent::section('quote', 'quote.quarry', $quote),
                TemplateContent::section('faq', 'faq.quarry', array_merge([
                    'heading' => 'FREQUENTLY ASKED',
                    'headingTail' => 'QUESTIONS',
                    'description' => 'Still have a question? Book a conversation with a Quarry engineer.',
                    'buttonLabel' => 'Book a demo',
                    'buttonUrl' => '/contact',
                ], self::motion(40))),
                TemplateContent::section('cta', 'ctaband.quarry', $ctaBand),
            ], $footer),

            /* -------------------------------------------------------- platform */
            self::page('Platform', 'platform', false, $nav, [
                TemplateContent::section('hero', 'hero.quarry', array_merge([
                    'eyebrow' => 'THE PLATFORM',
                    'heading' => 'RUN QUARRY ON YOUR INFRASTRUCTURE, SO YOUR DATA NEVER',
                    'headingHighlight' => 'LEAVES',
                    'description' => 'Quarry deploys inside your environment. It connects to your databases, executes your workflows, and exposes your data to your team and your agents — without copying any of it out.',
                    'buttonLabel' => 'Book a demo',
                    'buttonUrl' => '/contact',
                    'secondaryLabel' => 'Read the docs',
                    'secondaryUrl' => '#',
                    'pattern' => 'scatter',
                ], self::motion(0, 'load'))),
                TemplateContent::section('backbone', 'split.quarry', array_merge([
                    'anchorId' => 'backbone',
                    'eyebrow' => 'QUARRY BACKEND',
                    'heading' => 'A BACKEND THAT LIVES ENTIRELY IN YOUR',
                    'headingHighlight' => 'ENVIRONMENT',
                    'description' => 'Connects to your data sources, enforces permissions, executes actions, and serves your backoffice without routing anything through a vendor cloud.',
                    'bullets' => "Runs inside your infrastructure\nConnects to any data source you already query\nZero standing data exposure\nScales with the estate you already operate\nAligned with your existing security model",
                    'buttonLabel' => 'Talk to an engineer',
                    'buttonUrl' => '/contact',
                    'image' => TemplateContent::photo('1518770660439-4636190af475', 1000),
                    'imageAlt' => 'Server terminal',
                    'reverse' => true,
                ], self::motion(40))),
                TemplateContent::section('steps', 'steps.quarry', array_merge([
                    'eyebrow' => 'BUILT FOR COMPLIANCE',
                    'heading' => 'THE BACKBONE OF YOUR',
                    'headingHighlight' => 'COMPLIANT BACKOFFICE',
                    'columns' => '3',
                    'items' => [
                        ['title' => 'Self-hosted by design', 'text' => 'Your ops data lives on your infrastructure. Quarry never handles it directly, so there is no vendor copy to reason about in a review.'],
                        ['title' => 'Audit-ready execution', 'text' => 'Every action is logged with its inputs, outcome, and the authority it ran under — exported in whatever format your supervisor expects.'],
                        ['title' => 'Agents inside your perimeter', 'text' => 'Agents execute against your systems using scoped credentials. Every connection is traced alongside the human actions beside it.'],
                    ],
                ], self::motion(40))),
                TemplateContent::section('governed', 'compare.quarry', array_merge([
                    'anchorId' => 'governed',
                    'eyebrow' => 'AUTOMATED OPS IN LICENSED MARKETS',
                    'heading' => 'THE SUPPLIERS WINNING TODAY RUN OPS ON A BACKBONE THAT IS',
                    'headingHighlight' => 'GOVERNED BY DESIGN',
                ], self::motion(40))),
                TemplateContent::section('quote', 'quote.quarry', array_merge($quote, [
                    'badge' => 'Halden',
                    'quote' => 'No access to our data was a hard requirement. Quarry was the only model that survived our technical review.',
                    'name' => 'Stefan Aarø',
                    'role' => 'Co-founder & Chief Technology Officer',
                ])),
                TemplateContent::section('faq', 'faq.quarry', array_merge([
                    'heading' => 'FREQUENTLY ASKED',
                    'headingTail' => 'QUESTIONS',
                    'description' => 'You still have a question? Book a conversation with a Quarry engineer.',
                    'buttonLabel' => 'Book a demo',
                    'buttonUrl' => '/contact',
                ], self::motion(40))),
                TemplateContent::section('cta', 'ctaband.quarry', $ctaBand),
            ], $footer),

            /* ------------------------------------------------------- ecosystem */
            self::page('Ecosystem', 'ecosystem', false, $nav, [
                TemplateContent::section('hero', 'hero.quarry', array_merge([
                    'eyebrow' => 'QUARRY ECOSYSTEM',
                    'heading' => 'DISCOVER ALL THE TOOLS, AGENTS AND PARTNERS THAT WORK WITH',
                    'headingHighlight' => 'QUARRY',
                    'description' => 'Here are the systems, APIs, and industry suppliers you can connect to Quarry — and the partners who help deploy them.',
                    'buttonLabel' => 'Browse the ecosystem',
                    'buttonUrl' => '#resources',
                    'secondaryLabel' => 'Become a partner',
                    'secondaryUrl' => '/contact',
                    'pattern' => 'ridge',
                ], self::motion(0, 'load'))),
                TemplateContent::section('resources', 'directory.quarry', array_merge([
                    'anchorId' => 'resources',
                    'eyebrow' => 'THE ECOSYSTEM',
                    'heading' => 'EXPLORE THE FULL',
                    'headingHighlight' => 'QUARRY ECOSYSTEM',
                    'description' => 'Connect the data platforms, industry systems, and agents your operation already depends on.',
                    'columns' => '4',
                    'items' => [
                        ['icon' => 'chart', 'title' => 'Northmeter', 'text' => 'Half-hourly meter reads streamed straight into your validation queue.', 'tags' => 'METERING'],
                        ['icon' => 'globe', 'title' => 'Halden Grid', 'text' => 'Settlement flows and industry messaging without a bespoke adapter.', 'tags' => 'SETTLEMENT'],
                        ['icon' => 'zap', 'title' => 'Brightcurrent', 'text' => 'Tariff modelling and price-change orchestration across segments.', 'tags' => 'BILLING'],
                        ['icon' => 'heart', 'title' => 'Kelvara', 'text' => 'Vulnerable-customer flags surfaced beside the account, not in a separate tool.', 'tags' => 'CARE'],
                        ['icon' => 'leaf', 'title' => 'Peatworks', 'text' => 'Carbon and REGO reconciliation with an exportable audit position.', 'tags' => 'REPORTING'],
                        ['icon' => 'cart', 'title' => 'Solvent', 'text' => 'Payment retries and arrears journeys governed by your own policy.', 'tags' => 'PAYMENTS'],
                        ['icon' => 'database', 'title' => 'Cairnstack', 'text' => 'Warehouse connectors for the models your analysts already trust.', 'tags' => 'DATA'],
                        ['icon' => 'truck', 'title' => 'Lowfield', 'text' => 'Field-visit scheduling that respects safeguarding and access notes.', 'tags' => 'FIELD OPS'],
                        ['icon' => 'shield', 'title' => 'Bastion ID', 'text' => 'Identity checks for account changes, scoped to the change being made.', 'tags' => 'IDENTITY'],
                        ['icon' => 'cpu', 'title' => 'Tessel', 'text' => 'Forecasting models for demand and settlement exposure by segment.', 'tags' => 'ANALYTICS'],
                        ['icon' => 'message', 'title' => 'Corvid', 'text' => 'Customer messaging across channels with consent state attached.', 'tags' => 'COMMS'],
                        ['icon' => 'lock', 'title' => 'Ferrule', 'text' => 'Secrets and credential rotation for every connector Quarry runs.', 'tags' => 'SECURITY'],
                    ],
                    'buttonLabel' => 'Become a partner',
                    'buttonUrl' => '/contact',
                ], self::motion(40))),
                TemplateContent::section('steps', 'steps.quarry', array_merge([
                    'eyebrow' => 'HOW CONNECTORS WORK',
                    'heading' => 'BRING YOUR OWN PROVIDER',
                    'headingHighlight' => 'STACK',
                    'columns' => '3',
                    'items' => [
                        ['title' => 'Configure, do not rebuild', 'text' => 'A connector is a credential and a mapping. Swapping a provider is a change request, not a delivery programme.'],
                        ['title' => 'Run providers in parallel', 'text' => 'Route a segment to a new supplier while the rest stays put, then compare outcomes on the same evidence.'],
                        ['title' => 'Everything is traced', 'text' => 'Provider calls, responses, and the decision they informed are recorded against the case they belong to.'],
                    ],
                ], self::motion(40))),
                TemplateContent::section('cta', 'ctaband.quarry', array_merge($ctaBand, [
                    'eyebrow' => 'MISSING SOMETHING',
                    'heading' => 'USING A TOOL YOU DO NOT',
                    'headingHighlight' => 'SEE HERE?',
                    'description' => 'We support additional systems and APIs. Tell us the one you need and we will scope the connector with you.',
                    'buttonLabel' => 'Book a demo',
                ])),
            ], $footer),

            /* ------------------------------------------------------ onboarding */
            self::page('Onboarding', 'onboarding', false, $nav, [
                TemplateContent::section('hero', 'hero.quarry', array_merge([
                    'eyebrow' => 'CUSTOMER ONBOARDING',
                    'heading' => 'ONBOARD NEW CUSTOMERS AS ONE WORKFLOW. ANY PROVIDER, ANY',
                    'headingHighlight' => 'TIME',
                    'description' => 'Your team and your agents run identity checks, meter registration, and initial credit screening from one workspace. Plug in the providers you trust and switch them as requirements change.',
                    'buttonLabel' => 'Book a demo',
                    'buttonUrl' => '/contact',
                    'secondaryLabel' => 'See the platform',
                    'secondaryUrl' => '/platform',
                    'pattern' => 'stair',
                ], self::motion(0, 'load'))),
                TemplateContent::section('flow', 'split.quarry', array_merge([
                    'eyebrow' => 'ONE WORKFLOW',
                    'heading' => 'FROM APPLICATION TO ACTIVE ACCOUNT, ON ONE',
                    'headingHighlight' => 'WORKFLOW',
                    'description' => 'This is the workspace your team uses to take an application from submitted to supplying. Every provider call, every decision, every approval sits on the same case.',
                    'bullets' => "One feed, no copy-paste between systems\nYour providers, your way — add a second at any time\nInitial credit and identity screening on the same case\nRisk rules per segment, configured without code\nAgents triage the easy cases and draft the rest\nThe audit record writes itself",
                    'buttonLabel' => 'Book a demo',
                    'buttonUrl' => '/contact',
                    'image' => TemplateContent::photo('1454165804606-c3d57bc86b40', 1000),
                    'imageAlt' => 'Onboarding workflow',
                ], self::motion(40))),
                TemplateContent::section('steps', 'steps.quarry', array_merge([
                    'eyebrow' => 'BUILT FOR COMPLIANCE AT SCALE',
                    'heading' => 'VENDOR-AGNOSTIC ONBOARDING WITH THE EVIDENCE YOUR SUPERVISOR',
                    'headingHighlight' => 'EXPECTS',
                    'columns' => '3',
                    'items' => [
                        ['title' => 'A complete view per applicant', 'text' => 'Screening results, supporting documents, agent reasoning, and approvals live on one case. No tab switching, no spreadsheet of truth.'],
                        ['title' => 'Governance for humans and agents', 'text' => 'Rules, permissions, and approvals apply to your team and your agents identically. Both actions land in the same audit trail.'],
                        ['title' => 'Provider flexibility, built in', 'text' => 'Identity, credit, and screening providers are fully connected, ready to swap from your workspace. Adding a second is configuration.'],
                    ],
                ], self::motion(40))),
                TemplateContent::section('quote', 'quote.quarry', array_merge($quote, [
                    'badge' => 'Brightcurrent',
                    'quote' => 'Our challenge is to activate a new supply point in hours, not days, while staying inside every licence condition.',
                    'name' => 'Priya Raghunathan',
                    'role' => 'Head of Customer Onboarding',
                ])),
                TemplateContent::section('faq', 'faq.quarry', array_merge([
                    'heading' => 'FREQUENTLY ASKED',
                    'headingTail' => 'QUESTIONS',
                    'description' => 'You still have a question? Book a conversation with a Quarry engineer.',
                    'buttonLabel' => 'Book a demo',
                    'buttonUrl' => '/contact',
                    'items' => [
                        ['question' => 'How do I build an onboarding workflow in Quarry?', 'answer' => 'Each step is a node in the workflow: identity check, meter registration, credit decision, welcome pack. You compose them from your workspace with templates as a starting point.'],
                        ['question' => 'Which identity and credit providers can I connect?', 'answer' => 'The major identity and credit bureaux, plus anything with a documented API. Adding a provider is configuration, not a delivery project.'],
                        ['question' => 'Can I run two providers side by side?', 'answer' => 'Yes. Route a segment to one and the remainder to another, then compare outcomes on identical evidence before you commit.'],
                        ['question' => 'How do I include affordability screening?', 'answer' => 'Affordability sits as a scored step in the same workflow, with thresholds set per segment and escalation to a named reviewer above the band you choose.'],
                        ['question' => 'How do you make sure customer data never leaves our environment?', 'answer' => 'Quarry executes against your systems with your credentials and stores pointers rather than copies. Nothing is duplicated into our infrastructure.'],
                    ],
                ], self::motion(40))),
                TemplateContent::section('cta', 'ctaband.quarry', $ctaBand),
            ], $footer),

            /* --------------------------------------------------------- contact */
            self::page('Contact', 'contact', false, $nav, [
                TemplateContent::section('contact', 'contact.quarry', array_merge([
                    'eyebrow' => 'CONTACT US',
                    'heading' => 'READY TO',
                    'headingHighlight' => 'HELP',
                    'description' => 'Describe your request and our team will point you at the shortest route to a solution.',
                    'buttonLabel' => 'Submit',
                ], self::motion(0, 'load'))),
                TemplateContent::section('logos', 'logos.quarry', array_merge($logos, ['heading' => ''])),
            ], $footer),
        ];
    }
}
