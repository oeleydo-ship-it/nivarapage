<?php

namespace Database\Seeders;

/**
 * Tessera — field-operations intelligence.
 *
 * A near-white sheet ruled by hairlines with one ember accent, Sora headlines
 * set tight over Inter body copy, and a black footer closing every page.
 */
class TemplateTessera
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#e2571f',
            'secondary' => '#0b0b0c',
            'accent' => '#e2571f',
            'background' => '#ffffff',
            'surface' => '#faf9f7',
            'text' => '#101010',
            'muted' => '#6f6f6a',
            'headingFont' => 'Sora, system-ui, sans-serif',
            'bodyFont' => 'Inter, system-ui, sans-serif',
            'monoFont' => 'JetBrains Mono, ui-monospace, monospace',
            'serifFont' => 'Newsreader, Georgia, serif',
            'headingWeight' => 600,
            'bodyWeight' => 400,
            'buttonRadius' => '999px',
            'cardRadius' => '14px',
            'containerWidth' => '1180px',
            'sectionSpacing' => '88px',
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
     * Composes one page. The announcement strip sits ABOVE the navbar so it
     * scrolls away while the sticky header stays pinned — `sitePage()` always
     * emits the nav first, which would pin the strip too.
     *
     * @param  array<string, mixed>  $announce
     * @param  array<string, mixed>  $nav
     * @param  list<array<string, mixed>>  $sections
     * @param  array<string, mixed>  $footer
     * @return array<string, mixed>
     */
    private static function page(
        string $name,
        string $slug,
        bool $homepage,
        array $announce,
        array $nav,
        array $sections,
        array $footer,
    ): array {
        return [
            'name' => $name,
            'slug' => $slug,
            'is_homepage' => $homepage,
            'content_json' => TemplateContent::page(array_merge(
                [
                    TemplateContent::section('announce', 'announce.tessera', $announce),
                    TemplateContent::section('nav', 'navbar.tessera', $nav),
                ],
                $sections,
                [TemplateContent::section('footer', 'footer.tessera', $footer)],
            )),
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $brand = 'Tessera';
        $email = 'hello@tessera.systems';

        $announce = array_merge([
            'message' => 'Winter release is live · Route Planner and anomaly alerts',
            'buttonLabel' => 'See what shipped',
            'buttonUrl' => '/platform',
        ], self::motion(0, 'load'), ['animation' => 'fade-down', 'animationDuration' => 500]);

        $navLinks = [
            ['label' => 'Platform', 'url' => '/platform', 'children' => [
                ['label' => 'Asset Telemetry', 'url' => '/platform#telemetry'],
                ['label' => 'Crew Dispatch', 'url' => '/platform#dispatch'],
                ['label' => 'Route Planner', 'url' => '/platform#routing'],
            ]],
            ['label' => 'Solutions', 'url' => '/platform#solutions', 'children' => [
                ['label' => 'Water utilities', 'url' => '/platform#solutions'],
                ['label' => 'Cold chain', 'url' => '/platform#solutions'],
                ['label' => 'Facilities estates', 'url' => '/platform#solutions'],
            ]],
            ['label' => 'Pricing', 'url' => '/pricing'],
            ['label' => 'Company', 'url' => '/careers'],
        ];

        $nav = array_merge([
            'logo' => $brand,
            'logoIcon' => 'layers',
            'logoUrl' => '/',
            'links' => $navLinks,
            'secondaryLabel' => 'Sign in',
            'secondaryUrl' => '/pricing',
            'buttonLabel' => 'Start free',
            'buttonUrl' => '/pricing',
            'sticky' => true,
        ], self::motion(0, 'load'), ['animation' => 'fade-down', 'animationDuration' => 600]);

        $footer = array_merge([
            'logo' => $brand,
            'logoIcon' => 'layers',
            'logoUrl' => '/',
            'address' => "Tessera Systems Ltd\n14 Meadowhall Way\nSheffield, S9 1EA",
            'columns' => [
                [
                    'title' => 'Platform',
                    'links' => [
                        ['label' => 'Asset Telemetry', 'url' => '/platform#telemetry'],
                        ['label' => 'Crew Dispatch', 'url' => '/platform#dispatch'],
                        ['label' => 'Route Planner', 'url' => '/platform#routing'],
                        ['label' => 'Offline capture', 'url' => '/platform'],
                        ['label' => 'Connectors', 'url' => '/platform#solutions'],
                    ],
                ],
                [
                    'title' => 'Resources',
                    'links' => [
                        ['label' => 'Documentation', 'url' => '#'],
                        ['label' => 'Reliability guides', 'url' => '#'],
                        ['label' => 'Connector library', 'url' => '#'],
                        ['label' => 'Status', 'url' => '#'],
                    ],
                ],
                [
                    'title' => 'Company',
                    'links' => [
                        ['label' => 'About', 'url' => '/careers'],
                        ['label' => 'Careers', 'url' => '/careers'],
                        ['label' => 'Customers', 'url' => '/'],
                        ['label' => 'Contact', 'url' => 'mailto:'.$email],
                    ],
                ],
                [
                    'title' => 'Compare',
                    'links' => [
                        ['label' => 'All comparisons', 'url' => '#'],
                        ['label' => 'vs spreadsheets', 'url' => '#'],
                        ['label' => 'vs legacy CMMS', 'url' => '#'],
                        ['label' => 'vs in-house builds', 'url' => '#'],
                    ],
                ],
            ],
            'social' => [
                ['icon' => 'linkedin', 'url' => '#'],
                ['icon' => 'twitter', 'url' => '#'],
                ['icon' => 'github', 'url' => '#'],
                ['icon' => 'youtube', 'url' => '#'],
            ],
            'copyright' => '© '.date('Y').' Tessera Systems Ltd. Registered in England and Wales, No. 14802255.',
            'disclaimer' => 'Operational guidance published here is general information, not engineering advice. Always follow your own safety procedures and statutory inspection regime.',
            'legal' => [
                ['label' => 'Terms of Service', 'url' => '#'],
                ['label' => 'Privacy Policy', 'url' => '#'],
                ['label' => 'Cookies', 'url' => '#'],
                ['label' => 'Security', 'url' => '#'],
            ],
        ], self::motion(0));

        $logos = array_merge([
            'heading' => 'Keeping the lights on at',
            'items' => [
                ['label' => 'Calder Utilities'],
                ['label' => 'Ferrowest'],
                ['label' => 'Vale & Marsh'],
                ['label' => 'Northgate Cold'],
                ['label' => 'Piera Group'],
                ['label' => 'Brackenline'],
            ],
        ], self::motion(40));

        $faqItems = [
            [
                'question' => 'What has to be installed on site?',
                'answer' => 'Usually nothing. Tessera reads from the controllers and meters you already run through a local collector, and falls back to a small gateway only where a site has no network path.',
            ],
            [
                'question' => 'How long until the first useful view?',
                'answer' => 'Most networks reach a full asset picture in under two weeks. The first depot is normally reporting within three days of the connector going in.',
            ],
            [
                'question' => 'Does this replace our maintenance system?',
                'answer' => 'No. Tessera sits above it. Work orders still close where your team closes them today — we push the priority and the context, then read the outcome back.',
            ],
            [
                'question' => 'Can crews use it without signal?',
                'answer' => 'Yes. The field app captures readings, photos, and sign-off offline, then reconciles when the van comes back into coverage.',
            ],
            [
                'question' => 'Who can see which sites?',
                'answer' => 'Access follows your own hierarchy. A regional lead sees their estate, a contractor sees only the assets on their contract, and every view is logged.',
            ],
        ];

        $ctaBand = array_merge([
            'heading' => 'Ready to run the network from one screen?',
            'description' => 'Connect a single depot, see the difference in a fortnight, then decide.',
            'buttonLabel' => 'Start free',
            'buttonUrl' => '/pricing',
            'secondaryLabel' => 'Book a walkthrough',
            'secondaryUrl' => 'mailto:'.$email,
        ], self::motion(60));

        return [
            /* ------------------------------------------------------------ home */
            self::page('Home', 'home', true, $announce, $nav, [
                TemplateContent::section('hero', 'hero.tessera', array_merge([
                    'heading' => 'See every site, asset, and crew',
                    'headingTail' => 'before the day goes sideways',
                    'description' => 'Depots, plant rooms, and field crews all report differently. Tessera folds those feeds into one operating picture, flags drift before it becomes downtime, and tells your dispatchers where to go next.',
                    'buttonLabel' => 'Start free',
                    'buttonUrl' => '/pricing',
                    'secondaryLabel' => 'Book a walkthrough',
                    'secondaryUrl' => 'mailto:'.$email,
                ], self::motion(0, 'load'), ['animationDuration' => 900])),
                TemplateContent::section('showcase', 'showcase.tessera', array_merge([
                    'items' => [
                        [
                            'icon' => 'cpu',
                            'badge' => 'Early access',
                            'title' => 'Asset Telemetry',
                            'text' => 'Stream readings from pumps, chillers, and generators into one timeline with drift detection built in.',
                            'linkLabel' => 'Explore Asset Telemetry',
                            'linkUrl' => '/platform#telemetry',
                            'image' => TemplateContent::photo('1581091226825-a6a2a5aee158', 1000),
                        ],
                        [
                            'icon' => 'truck',
                            'badge' => 'Early access',
                            'title' => 'Crew Dispatch',
                            'text' => 'Match the nearest qualified crew to the work order, with travel time and parts availability already priced in.',
                            'linkLabel' => 'Explore Crew Dispatch',
                            'linkUrl' => '/platform#dispatch',
                            'image' => TemplateContent::photo('1553413077-190dd305871c', 1000),
                        ],
                        [
                            'icon' => 'chart',
                            'badge' => 'Early access',
                            'title' => 'Route Planner',
                            'text' => 'Sequence planned, reactive, and statutory work into one run per van, with a repair slot held back.',
                            'linkLabel' => 'Explore Route Planner',
                            'linkUrl' => '/platform#routing',
                            'image' => TemplateContent::photo('1487754180451-c456f719a1fc', 1000),
                        ],
                    ],
                    'columns' => '3',
                ], self::motion(40))),
                TemplateContent::section('pillars', 'pillars.tessera', array_merge([
                    'heading' => 'Why fragmented ops',
                    'headingTail' => 'cost you twice',
                    'description' => 'It is not a reporting problem. It is a sequencing problem that reporting made visible.',
                    'items' => [
                        ['title' => 'Signals arrive late', 'text' => 'By the time a spreadsheet reaches the depot manager, the window to act cheaply has already closed.'],
                        ['title' => 'Crews get double-booked', 'text' => 'Two systems, two truths. The nearest van is dispatched to the wrong site while a critical one waits.'],
                        ['title' => 'Nobody owns the pattern', 'text' => 'Recurring faults look like one-offs when each site keeps its own log in its own format.'],
                    ],
                ], self::motion(40))),
                TemplateContent::section('split', 'split.tessera', array_merge([
                    'heading' => 'One queue for the whole network',
                    'description' => 'Tessera ranks open work by cost of delay, not by whoever shouted last. Dispatchers see the same list on the wallboard and in the cab.',
                    'buttonLabel' => 'Start free',
                    'buttonUrl' => '/pricing',
                    'secondaryLabel' => 'Book a walkthrough',
                    'secondaryUrl' => 'mailto:'.$email,
                    'panelTitle' => 'Bay 04 · Chiller 2',
                    'panelBadge' => 'Priority',
                    'panelText' => 'Discharge pressure has drifted 14% above baseline across the last three cycles.',
                    'cardTitle' => 'Dispatch · Rivas, M.',
                    'cardMeta' => 'ETA 24 min · Parts on van',
                    'cardImage' => TemplateContent::photo('1504328345606-18bbc8c9d7d1', 400),
                ], self::motion(40))),
                TemplateContent::section('metrics', 'metrics.tessera', array_merge([
                    'eyebrow' => 'MEASURED ACROSS 40 NETWORKS',
                    'heading' => 'What changes in the first quarter',
                    'headingTail' => 'of running Tessera',
                    'items' => [
                        ['value' => '31%', 'title' => 'Fewer emergency call-outs', 'text' => 'Drift alerts move work into planned windows.'],
                        ['value' => '2.4h', 'title' => 'Saved per crew, per week', 'text' => 'Routing accounts for parts and travel together.'],
                        ['value' => '96%', 'title' => 'Closed on first visit', 'text' => 'The van arrives already carrying the right part.'],
                        ['value' => '11 days', 'title' => 'To first full network view', 'text' => 'Connectors cover the meters you already run.'],
                    ],
                ], self::motion(40))),
                TemplateContent::section('logos', 'logos.tessera', $logos),
                TemplateContent::section('faq', 'faq.tessera', array_merge([
                    'heading' => 'Frequently asked',
                    'headingTail' => 'questions.',
                    'items' => $faqItems,
                ], self::motion(40))),
                TemplateContent::section('cta', 'ctaband.tessera', $ctaBand),
            ], $footer),

            /* -------------------------------------------------------- platform */
            self::page('Platform', 'platform', false, $announce, $nav, [
                TemplateContent::section('hero', 'hero.tessera', array_merge([
                    'heading' => 'Every reading, every crew,',
                    'headingTail' => 'on one clock',
                    'description' => 'Tessera reads from the equipment you already own, reconciles it against the work your teams already do, and hands both back as a single ranked queue.',
                    'buttonLabel' => 'Start free',
                    'buttonUrl' => '/pricing',
                    'secondaryLabel' => 'Talk to an engineer',
                    'secondaryUrl' => 'mailto:'.$email,
                ], self::motion(0, 'load'))),
                TemplateContent::section('telemetry', 'split.tessera', array_merge([
                    'anchorId' => 'telemetry',
                    'heading' => 'Asset Telemetry',
                    'description' => 'Pull readings from controllers, meters, and BMS panels into one timeline. Baselines build themselves over the first fortnight, then drift is flagged the moment it starts rather than when something trips.',
                    'buttonLabel' => 'See a live sample',
                    'buttonUrl' => '/pricing',
                    'secondaryLabel' => 'Connector list',
                    'secondaryUrl' => '#solutions',
                    'panelTitle' => 'Pump House 2 · Feed A',
                    'panelBadge' => 'Drift detected',
                    'panelText' => 'Flow rate is 9% below the rolling baseline with no matching demand change upstream.',
                    'cardTitle' => 'Baseline · 14 days',
                    'cardMeta' => 'Confidence high · 4,200 samples',
                    'cardImage' => TemplateContent::photo('1509390144018-eeaf65052242', 400),
                ], self::motion(40))),
                TemplateContent::section('dispatch', 'split.tessera', array_merge([
                    'anchorId' => 'dispatch',
                    'reverse' => true,
                    'heading' => 'Crew Dispatch',
                    'description' => 'Work is offered to the crew that can actually finish it — right ticket, right parts, right distance. Accept and decline both write back to your maintenance system automatically.',
                    'buttonLabel' => 'Start free',
                    'buttonUrl' => '/pricing',
                    'secondaryLabel' => 'Book a walkthrough',
                    'secondaryUrl' => 'mailto:'.$email,
                    'panelTitle' => 'Job 4471 · Cold store door seal',
                    'panelBadge' => 'Assigned',
                    'panelText' => 'Two crews within range. Okafor carries the seal kit; Rivas would need a depot stop first.',
                    'cardTitle' => 'Dispatch · Okafor, D.',
                    'cardMeta' => 'ETA 19 min · Seal kit on van',
                    'cardImage' => TemplateContent::photo('1521791136064-7986c2920216', 400),
                ], self::motion(40))),
                TemplateContent::section('routing', 'pillars.tessera', array_merge([
                    'anchorId' => 'routing',
                    'heading' => 'Route Planner',
                    'headingTail' => 'in three moves',
                    'description' => 'Planned work, reactive work, and statutory inspections compete for the same vans. Tessera sequences all three together.',
                    'items' => [
                        ['title' => 'Cluster by geography', 'text' => 'Group open jobs into runs that respect depot boundaries and shift length.'],
                        ['title' => 'Weight by cost of delay', 'text' => 'A drifting chiller in a cold store outranks a cosmetic fix, every time.'],
                        ['title' => 'Hold a repair slot', 'text' => 'Leave capacity for the emergency that has not happened yet, sized on your own history.'],
                    ],
                ], self::motion(40))),
                TemplateContent::section('solutions', 'benefits.tessera', array_merge([
                    'anchorId' => 'solutions',
                    'heading' => 'Built for the estates that break expensively',
                    'description' => 'Same platform, different defaults — connectors, thresholds, and compliance rules ship per sector.',
                    'columns' => '3',
                    'items' => [
                        ['icon' => 'cloud', 'title' => 'Water utilities', 'text' => 'Pressure, flow, and pump-station telemetry with statutory sampling built into the queue.'],
                        ['icon' => 'truck', 'title' => 'Cold chain', 'text' => 'Continuous temperature capture with excursion evidence a food auditor will accept.'],
                        ['icon' => 'home', 'title' => 'Facilities estates', 'text' => 'BMS panels, lifts, and life-safety systems on one register across every building.'],
                        ['icon' => 'wrench', 'title' => 'Plant hire', 'text' => 'Hours, faults, and off-hire condition captured before the machine leaves the yard.'],
                        ['icon' => 'zap', 'title' => 'Renewables O&M', 'text' => 'Inverter and string-level yield checks that separate weather from real faults.'],
                        ['icon' => 'shield', 'title' => 'Regulated sites', 'text' => 'Immutable audit trails and per-contract access for every outside contractor.'],
                    ],
                ], self::motion(40))),
                TemplateContent::section('metrics', 'metrics.tessera', array_merge([
                    'eyebrow' => 'PLATFORM AT A GLANCE',
                    'heading' => 'Numbers our customers',
                    'headingTail' => 'check us on',
                    'items' => [
                        ['value' => '180+', 'title' => 'Connectors shipped', 'text' => 'Controllers, meters, BMS panels, and flat files.'],
                        ['value' => '30s', 'title' => 'Median ingest lag', 'text' => 'From sensor reading to the dispatcher board.'],
                        ['value' => '99.95%', 'title' => 'Platform availability', 'text' => 'Rolling twelve months, published monthly.'],
                        ['value' => 'Offline', 'title' => 'Field app by default', 'text' => 'Capture and sign-off with no signal at all.'],
                    ],
                ], self::motion(40))),
                TemplateContent::section('faq', 'faq.tessera', array_merge([
                    'heading' => 'Before you',
                    'headingTail' => 'connect anything.',
                    'items' => $faqItems,
                ], self::motion(40))),
                TemplateContent::section('cta', 'ctaband.tessera', $ctaBand),
            ], $footer),

            /* --------------------------------------------------------- pricing */
            self::page('Pricing', 'pricing', false, $announce, $nav, [
                TemplateContent::section('pricing', 'pricing.tessera', array_merge([
                    'heading' => 'Pricing',
                    'description' => 'Priced per site and per monitored asset. Crew seats are unlimited from the Network tier up, because charging per engineer punishes the wrong thing.',
                    'items' => [
                        [
                            'name' => 'Depot',
                            'blurb' => 'For a single site getting its first shared view.',
                            'price' => '£180',
                            'period' => '/month',
                            'buttonLabel' => 'Try it free, 14 days',
                            'buttonUrl' => '#',
                            'featured' => false,
                            'features' => "1 site\n40 monitored assets\n8 crew seats\nDaily sync\nOffline field app\nEmail support",
                        ],
                        [
                            'name' => 'Network',
                            'blurb' => 'For operators running several depots and a shared fleet.',
                            'price' => '£540',
                            'period' => '/month',
                            'badge' => 'Most chosen',
                            'buttonLabel' => 'Try it free, 14 days',
                            'buttonUrl' => '#',
                            'featured' => true,
                            'features' => "10 sites\n600 monitored assets\nUnlimited crew seats\nLive sync\nRoute Planner\nAnomaly alerts\nPriority support",
                        ],
                        [
                            'name' => 'Regional',
                            'blurb' => 'For multi-region estates with their own compliance rules.',
                            'price' => '£1,290',
                            'period' => '/month',
                            'buttonLabel' => 'Talk to us',
                            'buttonUrl' => 'mailto:'.$email,
                            'featured' => false,
                            'features' => "Unlimited sites\n3,000 monitored assets\nUnlimited crew seats\nLive sync\nRoute Planner\nSSO and SCIM\nNamed engineer",
                        ],
                    ],
                    'customTitle' => 'Estate',
                    'customText' => 'For national estates that need custom connectors, their own retention rules, and a dedicated onboarding squad in the depots.',
                    'customFeatures' => "Everything in Regional\nCustom connectors\nUnlimited retention\nPrivate deployment option\nQuarterly reliability review\nOn-site enablement",
                    'customButtonLabel' => 'Talk to us',
                    'customButtonUrl' => 'mailto:'.$email,
                ], self::motion(0, 'load'))),
                TemplateContent::section('compare', 'compare.tessera', array_merge([
                    'heading' => 'Compare plans',
                    'columns' => [
                        ['name' => 'Depot', 'note' => '£180/mo'],
                        ['name' => 'Network', 'note' => '£540/mo'],
                        ['name' => 'Regional', 'note' => '£1,290/mo'],
                        ['name' => 'Estate', 'note' => 'Custom'],
                    ],
                    'rows' => [
                        ['group' => 'Coverage', 'label' => 'Sites', 'values' => '1|10|Unlimited|Unlimited'],
                        ['group' => '', 'label' => 'Monitored assets', 'values' => '40|600|3,000|Custom'],
                        ['group' => '', 'label' => 'Crew seats', 'values' => '8|Unlimited|Unlimited|Unlimited'],
                        ['group' => '', 'label' => 'Connectors', 'values' => 'Standard|Standard|Standard|Custom'],
                        ['group' => 'Operations', 'label' => 'Sync frequency', 'values' => 'Daily|Live|Live|Live'],
                        ['group' => '', 'label' => 'Route Planner', 'values' => '—|yes|yes|yes'],
                        ['group' => '', 'label' => 'Anomaly alerts', 'values' => '—|yes|yes|yes'],
                        ['group' => '', 'label' => 'Offline capture', 'values' => 'yes|yes|yes|yes'],
                        ['group' => 'Governance', 'label' => 'Data retention', 'values' => '12 months|3 years|Unlimited|Unlimited'],
                        ['group' => '', 'label' => 'Audit trail export', 'values' => '—|yes|yes|yes'],
                        ['group' => '', 'label' => 'SSO and SCIM', 'values' => '—|—|yes|yes'],
                        ['group' => 'Support', 'label' => 'Response target', 'values' => '2 days|8 hours|2 hours|1 hour'],
                        ['group' => '', 'label' => 'Named engineer', 'values' => '—|—|yes|yes'],
                        ['group' => '', 'label' => 'On-site enablement', 'values' => '—|—|—|yes'],
                    ],
                ], self::motion(40))),
                TemplateContent::section('faq', 'faq.tessera', array_merge([
                    'heading' => 'Questions about',
                    'headingTail' => 'billing.',
                    'items' => [
                        [
                            'question' => 'What counts as a monitored asset?',
                            'answer' => 'Anything with its own maintenance history — a pump, a chiller, a lift, a generator. Sensors attached to that asset are not counted separately.',
                        ],
                        [
                            'question' => 'Do you charge per engineer?',
                            'answer' => 'Only on the Depot tier, which is capped at eight seats. Every tier above it is unlimited, because charging per engineer discourages exactly the adoption that makes the platform useful.',
                        ],
                        [
                            'question' => 'Can we start on one depot and expand?',
                            'answer' => 'That is the normal path. Most customers connect a single site, run it for a quarter, then roll out region by region on the Network tier.',
                        ],
                        [
                            'question' => 'How does the trial work?',
                            'answer' => 'Fourteen days, no card, one site connected with our help. If the connector needs building, the clock starts when data lands rather than when you sign up.',
                        ],
                        [
                            'question' => 'What happens to our data if we leave?',
                            'answer' => 'You export the full history as CSV or Parquet at any time, including while the account is live. We delete our copy within thirty days of a written request.',
                        ],
                    ],
                ], self::motion(40))),
                TemplateContent::section('cta', 'ctaband.tessera', $ctaBand),
            ], $footer),

            /* --------------------------------------------------------- careers */
            self::page('Careers', 'careers', false, $announce, $nav, [
                TemplateContent::section('hero', 'hero.tessera', array_merge([
                    'heading' => 'Build the system',
                    'headingTail' => 'the depots actually trust',
                    'description' => 'We are a small crew of engineers, designers, and former operations leads building the tool we all wanted when we were the ones on call. Come and help us finish it.',
                    'buttonLabel' => 'See open roles',
                    'buttonUrl' => '#roles',
                    'secondaryLabel' => 'How we work',
                    'secondaryUrl' => '#principles',
                ], self::motion(0, 'load'))),
                TemplateContent::section('principles', 'principles.tessera', array_merge([
                    'anchorId' => 'principles',
                    'eyebrow' => 'OPERATING PRINCIPLES',
                    'heading' => 'How we work',
                    'headingTail' => 'at Tessera',
                    'description' => 'Small crews, short loops, and a bias for the boring fix that holds.',
                    'items' => [
                        ['title' => 'Ship the smallest honest thing', 'text' => 'A rough tool in a depot beats a polished demo in a deck.'],
                        ['title' => 'Go to the site', 'text' => 'Every engineer spends time in a plant room before shipping for one.'],
                        ['title' => 'Write it down', 'text' => 'Decisions live in text so the next person inherits the reasoning, not just the result.'],
                        ['title' => 'No heroics', 'text' => 'If a release needs someone awake at 3am, the release is the problem.'],
                        ['title' => 'Leave the estate better', 'text' => 'We measure ourselves on the customer’s uptime, not our feature count.'],
                    ],
                    'statTitle' => 'We are hiring across the board',
                    'statText' => '48 people · 4 depots visited weekly · 200+ networks live',
                ], self::motion(40))),
                TemplateContent::section('benefits', 'benefits.tessera', array_merge([
                    'heading' => 'Benefits',
                    'description' => 'We look after the crew that keeps everyone else’s crews running.',
                    'columns' => '3',
                    'items' => [
                        ['icon' => 'award', 'title' => 'Real ownership', 'text' => 'Meaningful equity from your first day, with a long exercise window.'],
                        ['icon' => 'chart', 'title' => 'Room to grow', 'text' => 'Scope follows outcomes. Nobody waits for a title to lead something.'],
                        ['icon' => 'cpu', 'title' => 'Tools that hold', 'text' => 'Work alongside engineers who would rather delete code than defend it.'],
                        ['icon' => 'clock', 'title' => 'Sane hours', 'text' => 'Set your own shape around two overlap hours. No pager theatre.'],
                        ['icon' => 'truck', 'title' => 'Site visits covered', 'text' => 'Travel, boots, and kit for every depot week — on us.'],
                        ['icon' => 'heart', 'title' => 'Health and rest', 'text' => 'Private cover, a wellbeing budget, and a genuine 30 days off.'],
                    ],
                ], self::motion(40))),
                TemplateContent::section('roles', 'roles.tessera', array_merge([
                    'anchorId' => 'roles',
                    'heading' => 'Open roles',
                    'description' => 'If nothing fits, write to us anyway — we open seats around good people.',
                    'items' => [
                        ['title' => 'Field Reliability Engineer', 'meta' => 'Leeds · Full-time', 'url' => 'mailto:'.$email],
                        ['title' => 'Senior Backend Engineer, Ingest', 'meta' => 'Remote (UK/EU) · Full-time', 'url' => 'mailto:'.$email],
                        ['title' => 'Product Designer', 'meta' => 'London · Full-time', 'url' => 'mailto:'.$email],
                        ['title' => 'Solutions Lead, Utilities', 'meta' => 'Manchester · Full-time', 'url' => 'mailto:'.$email],
                        ['title' => 'Customer Engineer, DACH', 'meta' => 'Berlin · Full-time', 'url' => 'mailto:'.$email],
                        ['title' => 'Technical Writer', 'meta' => 'Remote (UK) · Part-time', 'url' => 'mailto:'.$email],
                    ],
                ], self::motion(40))),
                TemplateContent::section('logos', 'logos.tessera', $logos),
                TemplateContent::section('cta', 'ctaband.tessera', array_merge($ctaBand, [
                    'heading' => 'Not sure which seat is yours?',
                    'description' => 'Send us what you have built and what you want to build next. We read every one.',
                    'buttonLabel' => 'Write to us',
                    'buttonUrl' => 'mailto:'.$email,
                    'secondaryLabel' => 'See open roles',
                    'secondaryUrl' => '#roles',
                ])),
            ], $footer),
        ];
    }
}
