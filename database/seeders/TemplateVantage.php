<?php

namespace Database\Seeders;

/**
 * Vantage.OS — a calm platform / IT-services template.
 *
 * Four pages (Home, Features, Pricing, Contact) built from the `*.vantage`
 * block family: Playfair Display headlines on near-white, monospace micro
 * labels, a single royal-blue accent and deep-navy impact bands.
 */
class TemplateVantage
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#1a5bf5',
            'secondary' => '#08152e',
            'accent' => '#4f8bff',
            'background' => '#ffffff',
            'surface' => '#f5f7fb',
            'text' => '#0b1a33',
            'muted' => '#5c6b85',
            'headingFont' => 'Playfair Display, Georgia, serif',
            'bodyFont' => 'Inter, system-ui, sans-serif',
            'monoFont' => 'JetBrains Mono, ui-monospace, monospace',
            'headingWeight' => 500,
            'bodyWeight' => 400,
            'buttonRadius' => '7px',
            'cardRadius' => '12px',
            'containerWidth' => '1160px',
            'sectionSpacing' => '104px',
        ];
    }

    /** @return array<string, mixed> */
    private static function motion(int $delay = 0, string $trigger = 'scroll'): array
    {
        return [
            'animation' => 'fade-up',
            'animationTrigger' => $trigger,
            'animationDuration' => 720,
            'animationDelay' => $delay,
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $brand = 'Vantage.OS';
        $email = 'hello@vantageos.com';
        $phone = '+31 10 555 0142';

        $navLinks = [
            ['label' => 'Home', 'url' => '/'],
            ['label' => 'Features', 'url' => '/features'],
            ['label' => 'Pricing', 'url' => '/pricing'],
            ['label' => 'Contact', 'url' => '/contact'],
        ];

        $nav = array_merge([
            'logo' => $brand,
            'logoUrl' => '/',
            'links' => $navLinks,
            'secondaryLabel' => 'Sign in',
            'secondaryUrl' => '/contact',
            'buttonLabel' => 'Launch Console',
            'buttonUrl' => '/pricing',
            'buttonIcon' => 'arrow',
            'sticky' => true,
        ], self::motion(0, 'load'), ['animation' => 'fade-down']);

        $footer = array_merge([
            'signature' => 'Be.Vantage',
            'columns' => [
                [
                    'title' => '',
                    'links' => [
                        ['label' => 'Home', 'url' => '/'],
                        ['label' => 'Features', 'url' => '/features'],
                        ['label' => 'Book a Service', 'url' => '/contact'],
                        ['label' => 'Journal', 'url' => '/features'],
                    ],
                ],
                [
                    'title' => '',
                    'links' => [
                        ['label' => 'Terms & Conditions', 'url' => '#'],
                        ['label' => 'Refund Policy', 'url' => '#'],
                        ['label' => 'Privacy Policy', 'url' => '#'],
                        ['label' => 'Accessibility Statement', 'url' => '#'],
                    ],
                ],
                [
                    'title' => '',
                    'links' => [
                        ['label' => 'Facebook', 'url' => '#'],
                        ['label' => 'LinkedIn', 'url' => '#'],
                        ['label' => 'X', 'url' => '#'],
                    ],
                ],
            ],
            'addressTitle' => '',
            'address' => "2400 Harbour Lane, Suite 12\nRotterdam, 3011 EA\nNetherlands",
            'email' => $email,
            'phone' => $phone,
            'copyright' => '© '.date('Y').' '.$brand,
            'tagline' => 'Calm intelligence, by design.',
        ], self::motion(40));

        return [
            self::home($brand, $nav, $footer),
            self::features($brand, $nav, $footer),
            self::pricing($brand, $nav, $footer),
            self::contact($brand, $email, $phone, $nav, $footer),
        ];
    }

    /**
     * @param  array<string, mixed>  $nav
     * @param  array<string, mixed>  $footer
     * @return array<string, mixed>
     */
    private static function home(string $brand, array $nav, array $footer): array
    {
        return TemplateContent::sitePage('Home', 'home', true, $nav, [
            TemplateContent::section('hero', 'hero.vantage', array_merge(self::motion(0, 'load'), [
                'animation' => 'fade',
                'wordmark' => $brand,
                'scrollLabel' => 'Scroll down',
                'eyebrow' => 'Intelligence layer',
                'heading' => 'Your vantage on a calmer stack. One control plane, shaped to your operation.',
                'buttonLabel' => 'Book a demo',
                'buttonUrl' => '/contact',
                'buttonIcon' => 'play',
                'image' => '',
                'chipTitle' => 'Live signal',
                'chipMeta' => 'v3.1 — EU',
                'cornerLabel' => 'REL 03 / 24',
            ])),
            TemplateContent::section('about', 'about.vantage', array_merge(self::motion(40), [
                'railIndex' => '01',
                'railTotal' => '06',
                'railLabel' => 'About',
                'description' => 'For nine years our distributed team has partnered with operations-led companies to build calm, dependable infrastructure. We pair deep platform expertise with quiet discipline — designing systems that scale without drama and teams that stay sharp. From first migration to steady state, every engagement is shaped by clarity, craft, and care for the people who depend on what we ship.',
                'image' => TemplateContent::photo('1497215728101-856f4ea42174', 1400),
                'insetImage' => TemplateContent::photo('1519389950473-47ba0277781c', 900),
                'stats' => [
                    ['value' => '9+', 'label' => 'Years'],
                    ['value' => '180+', 'label' => 'Clients'],
                    ['value' => '31', 'label' => 'Countries'],
                ],
                'buttonLabel' => 'Learn more',
                'buttonUrl' => '/features',
                'buttonIcon' => 'arrow',
            ])),
            TemplateContent::section('services', 'services.vantage', array_merge(self::motion(40), [
                'railIndex' => '02',
                'railTotal' => '06',
                'railLabel' => 'Services',
                'eyebrow' => 'Our services',
                'heading' => 'Comprehensive systems, tailored to how you actually run.',
                'items' => [
                    [
                        'title' => 'Platform Engineering',
                        'image' => TemplateContent::photo('1522071820081-009f0129c71c', 800),
                        'url' => '/features',
                    ],
                    [
                        'title' => 'Managed Operations',
                        'image' => TemplateContent::photo('1552664730-d307ca884978', 800),
                        'url' => '/features',
                    ],
                    [
                        'title' => 'Security & Compliance',
                        'image' => TemplateContent::photo('1600880292089-90a7e086ee0c', 800),
                        'url' => '/features',
                    ],
                    [
                        'title' => 'Network Foundations',
                        'image' => TemplateContent::photo('1531482615713-2afd69097998', 800),
                        'url' => '/features',
                    ],
                ],
                'buttonLabel' => 'See more',
                'buttonUrl' => '/features',
                'buttonIcon' => 'arrow',
            ])),
            TemplateContent::section('impact', 'stats.vantage', array_merge(self::motion(40), [
                'railIndex' => '03',
                'railTotal' => '06',
                'railLabel' => 'Impact',
                'eyebrow' => 'By the numbers',
                'heading' => 'Quiet infrastructure, measurable outcomes.',
                'items' => [
                    ['value' => '9+', 'title' => 'Years of Practice', 'text' => 'A steady record across regulated and high-traffic platforms.'],
                    ['value' => '34%', 'title' => 'Less Toil per Team', 'text' => 'Streamlined operations and far fewer hand-written runbooks.'],
                    ['value' => '97%', 'title' => 'Client Retention', 'text' => 'Trusted by operations leads who stay for the long build.'],
                    ['value' => '420+', 'title' => 'Migrations Landed', 'text' => 'Delivered without a weekend war room or a rollback.'],
                ],
            ])),
            TemplateContent::section('journal', 'journal.vantage', array_merge(self::motion(40), [
                'railIndex' => '04',
                'railTotal' => '06',
                'railLabel' => 'Journal',
                'eyebrow' => 'Insights',
                'heading' => 'Field notes & platform updates',
                'linkLabel' => 'See all articles',
                'linkUrl' => '/features',
                'items' => [
                    [
                        'title' => 'Migrating without a weekend war room',
                        'date' => 'Jun 04, 2026',
                        'image' => TemplateContent::photo('1521737604893-d14cc237f11d', 900),
                        'url' => '#',
                    ],
                    [
                        'title' => 'Why runbooks should be rehearsed, not written',
                        'date' => 'May 21, 2026',
                        'image' => TemplateContent::photo('1556761175-b413da4baf72', 900),
                        'url' => '#',
                    ],
                    [
                        'title' => 'The cost of noisy dashboards nobody reads',
                        'date' => 'May 02, 2026',
                        'image' => TemplateContent::photo('1542744173-8e7e53415bb0', 900),
                        'url' => '#',
                    ],
                ],
            ])),
            TemplateContent::section('benefits', 'benefits.vantage', array_merge(self::motion(40), [
                'railIndex' => '05',
                'railTotal' => '06',
                'railLabel' => 'Why us',
                'eyebrow' => 'Why partner with us',
                'heading' => 'Focus on your mission. Let us hold the platform.',
                'image' => TemplateContent::photo('1521791136064-7986c2920216', 1200),
                'items' => [
                    [
                        'icon' => 'cpu',
                        'title' => 'Proven Engineering',
                        'text' => 'Modern stacks, hardened defaults and reference architecture shaped by years of production duty.',
                    ],
                    [
                        'icon' => 'chart',
                        'title' => 'Cost You Can Predict',
                        'text' => 'Right-sized capacity, transparent commitments and ongoing optimisation reviews that compound into real savings.',
                    ],
                    [
                        'icon' => 'clock',
                        'title' => 'Support That Stays Awake',
                        'text' => 'A calm, follow-the-sun operations team with clear SLAs and observability built in from day one.',
                    ],
                ],
            ])),
        ], $footer, 'footer.vantage', 'navbar.vantage');
    }

    /**
     * @param  array<string, mixed>  $nav
     * @param  array<string, mixed>  $footer
     * @return array<string, mixed>
     */
    private static function features(string $brand, array $nav, array $footer): array
    {
        return TemplateContent::sitePage('Features', 'features', false, $nav, [
            TemplateContent::section('hero', 'pagehero.vantage', array_merge(self::motion(0, 'load'), [
                'animation' => 'fade',
                'breadcrumb' => strtoupper($brand).' / FEATURES',
                'version' => 'V3.1',
                'eyebrow' => 'Features',
                'heading' => 'Everything you need to run a calm platform.',
                'description' => 'A focused set of capabilities — observability, automation, security and developer ergonomics — engineered to keep teams shipping without drama.',
                'pills' => [
                    ['label' => '6 pillars'],
                    ['label' => '40+ integrations'],
                    ['label' => 'One API'],
                ],
                'image' => TemplateContent::photo('1600880292203-757bb62b4baf', 1200),
                'imageLabel' => 'ALL SYSTEMS — NOMINAL',
                'chipTitle' => '41 capabilities',
                'chipMeta' => $brand,
                'chipIcon' => 'layers',
                'watermark' => '',
            ])),
            TemplateContent::section('pillars', 'pillars.vantage', array_merge(self::motion(40), [
                'railIndex' => '01',
                'railTotal' => '05',
                'railLabel' => 'Pillars',
                'eyebrow' => 'Core capabilities',
                'heading' => 'Six pillars that quietly do the heavy lifting.',
                'badgeLabel' => 'Pillars',
                'badgeMeta' => '6 of 6',
                'badgeIcon' => 'layers',
                'items' => [
                    ['icon' => 'chart', 'title' => 'Unified Observability', 'text' => 'Logs, metrics and traces from every service stitched into one calm timeline you can actually read.'],
                    ['icon' => 'zap', 'title' => 'Automation Engine', 'text' => 'Composable runbooks that turn 3am incidents into rehearsed, predictable recovery — no copy-pasted shell scripts.'],
                    ['icon' => 'shield', 'title' => 'Zero-Trust Security', 'text' => 'Identity-aware policies, secret rotation and continuous posture checks collapsed to a default, not a project.'],
                    ['icon' => 'cloud', 'title' => 'Multi-Cloud Control', 'text' => 'AWS, GCP and on-prem fleets governed under one operating layer with consistent policy and cost guardrails.'],
                    ['icon' => 'code', 'title' => 'Developer Ergonomics', 'text' => 'Golden paths, preview environments and one-command rollbacks designed to keep teams in flow.'],
                    ['icon' => 'trending-up', 'title' => 'Cost Intelligence', 'text' => 'Real-time spend, anomaly alerts and ownership signals — so finance and engineering finally speak one language.'],
                ],
            ])),
            TemplateContent::section('deep-observability', 'split.vantage', array_merge(self::motion(40), [
                'railIndex' => '02',
                'railTotal' => '05',
                'railLabel' => 'Deep dive',
                'eyebrow' => 'Observability',
                'heading' => 'See every signal — without drowning in dashboards.',
                'description' => 'A single, query-friendly plane that correlates logs, traces and golden metrics. Alerts arrive context-rich, not noise-heavy.',
                'bullets' => "Auto-instrumented services across Node, Go, Python and JVM\nAdaptive sampling that keeps high-value traces and thins the rest\nService maps that update themselves as architecture changes",
                'image' => TemplateContent::photo('1531973576160-7125cd663d86', 1200),
                'imageLabel' => 'OBSERVABILITY',
                'reverse' => false,
            ])),
            TemplateContent::section('deep-automation', 'split.vantage', array_merge(self::motion(40), [
                'railIndex' => '',
                'railTotal' => '',
                'railLabel' => '',
                'eyebrow' => 'Automation',
                'heading' => 'Runbooks that rehearse, not just respond.',
                'description' => 'Compose declarative recovery flows you can dry-run before you trust them. Every step is observable, reversible and version-controlled.',
                'bullets' => "Dry-run simulator that replays past incidents safely\nAudit trail with reviewer approvals built in\nScheduled game-days that keep the team fluent",
                'image' => TemplateContent::photo('1552664730-d307ca884978', 1200),
                'imageLabel' => 'AUTOMATION',
                'reverse' => true,
            ])),
            TemplateContent::section('deep-security', 'split.vantage', array_merge(self::motion(40), [
                'railIndex' => '',
                'railTotal' => '',
                'railLabel' => '',
                'eyebrow' => 'Security',
                'heading' => 'Zero-trust as a default, not a project.',
                'description' => 'Identity, secrets and policy folded into the same control plane your platform engineers already live in. No bolt-on dashboards.',
                'bullets' => "Short-lived credentials issued per workload\nContinuous posture checks across cloud accounts\nJust-in-time access with reviewer-of-record signatures",
                'image' => TemplateContent::photo('1600880292089-90a7e086ee0c', 1200),
                'imageLabel' => 'SECURITY',
                'reverse' => false,
            ])),
            TemplateContent::section('flow', 'steps.vantage', array_merge(self::motion(40), [
                'railIndex' => '03',
                'railTotal' => '05',
                'railLabel' => 'Flow',
                'eyebrow' => '',
                'heading' => '',
                'items' => [
                    ['title' => 'Connect', 'text' => 'Plug into your cloud accounts, repos and identity provider. No agents to wrangle, no day-long setup.'],
                    ['title' => 'Map', 'text' => $brand.' discovers services, dependencies and ownership signals to render a ruling picture of your platform.'],
                    ['title' => 'Govern', 'text' => 'Apply policies, budgets and SLOs as code. Guardrails ship with sensible defaults — opt out, not in.'],
                    ['title' => 'Operate', 'text' => 'Run incidents, releases and rollbacks from one keyboard-first surface that respects your engineers time.'],
                ],
            ])),
            TemplateContent::section('integrations', 'integrations.vantage', array_merge(self::motion(40), [
                'railIndex' => '04',
                'railTotal' => '05',
                'railLabel' => 'Stack',
                'eyebrow' => 'Integrations',
                'heading' => 'Built to live where your stack already lives.',
                'watermark' => '',
                'items' => [
                    ['icon' => 'cloud', 'label' => 'AWS'],
                    ['icon' => 'globe', 'label' => 'Google Cloud'],
                    ['icon' => 'code', 'label' => 'GitHub'],
                    ['icon' => 'layers', 'label' => 'Kubernetes'],
                    ['icon' => 'message', 'label' => 'Slack'],
                    ['icon' => 'zap', 'label' => 'PagerDuty'],
                    ['icon' => 'database', 'label' => 'Datadog'],
                    ['icon' => 'lock', 'label' => 'Okta'],
                ],
            ])),
            TemplateContent::section('cta', 'ctacard.vantage', array_merge(self::motion(40), [
                'railIndex' => '05',
                'railTotal' => '05',
                'railLabel' => 'Start',
                'tagLeft' => 'READY WHEN YOU ARE',
                'tagRight' => 'CADENCE — READY',
                'heading' => 'Try every feature on your own stack.',
                'description' => 'Spin up a sandbox in minutes, wire it to one service, and feel the difference of a platform that fades into the background.',
                'buttonLabel' => 'See pricing',
                'buttonUrl' => '/pricing',
                'secondaryLabel' => 'Talk to sales',
                'secondaryUrl' => '/contact',
                'image' => TemplateContent::photo('1497366216548-37526070297c', 1400),
            ])),
        ], $footer, 'footer.vantage', 'navbar.vantage');
    }

    /**
     * @param  array<string, mixed>  $nav
     * @param  array<string, mixed>  $footer
     * @return array<string, mixed>
     */
    private static function pricing(string $brand, array $nav, array $footer): array
    {
        return TemplateContent::sitePage('Pricing', 'pricing', false, $nav, [
            TemplateContent::section('hero', 'pagehero.vantage', array_merge(self::motion(0, 'load'), [
                'animation' => 'fade',
                'breadcrumb' => strtoupper($brand).' / PRICING',
                'version' => 'V3.1',
                'eyebrow' => 'Pricing',
                'heading' => 'Simple plans for calm engineering teams.',
                'description' => 'Pick the tier that matches where your platform lives today. Every plan ships with the full product — no feature paywalls, no surprise meters.',
                'pills' => [
                    ['label' => 'Starter — free'],
                    ['label' => '14-day trial'],
                    ['label' => 'Yearly saves 20%'],
                ],
                'image' => TemplateContent::photo('1521737604893-d14cc237f11d', 1200),
                'imageLabel' => 'NO FEATURE GATES',
                'chipTitle' => '3 plans + custom',
                'chipMeta' => $brand,
                'chipIcon' => 'chart',
                'watermark' => 'P',
            ])),
            TemplateContent::section('plans', 'pricing.vantage', array_merge(self::motion(40), [
                'railIndex' => '01',
                'railTotal' => '04',
                'railLabel' => 'Plans',
                'monthlyLabel' => 'Monthly',
                'yearlyLabel' => 'Yearly — save 20%',
                'monthlyNote' => '/ seat / mo',
                'yearlyNote' => '/ seat / mo billed yearly',
                'items' => [
                    [
                        'name' => 'Starter',
                        'text' => 'For small teams getting their first taste of calm operations.',
                        'price' => '$26',
                        'yearlyPrice' => '$21',
                        'features' => "Up to 10 services\nUnified logs & metrics\nCommunity runbooks\n7-day data retention\nEmail support",
                        'buttonLabel' => 'Start free',
                        'buttonUrl' => '/contact',
                        'featured' => false,
                        'badge' => '',
                    ],
                    [
                        'name' => 'Growth',
                        'text' => 'The default for product-led companies past their first 50 engineers.',
                        'price' => '$68',
                        'yearlyPrice' => '$54',
                        'features' => "Up to 100 services\nFull observability suite\nAutomation engine + dry-runs\n30-day data retention\nSlack & PagerDuty integrations\nPriority support",
                        'buttonLabel' => 'Start trial',
                        'buttonUrl' => '/contact',
                        'featured' => true,
                        'badge' => 'Most popular',
                    ],
                    [
                        'name' => 'Enterprise',
                        'text' => 'Custom guardrails, SSO and dedicated humans for regulated workloads.',
                        'price' => 'Custom',
                        'yearlyPrice' => 'Custom',
                        'features' => "Unlimited services\nSAML SSO + audit logs\nCustom retention & residency\nDedicated solution engineer\nQuarterly architecture review\n24/7 white-glove support",
                        'buttonLabel' => 'Talk to sales',
                        'buttonUrl' => '/contact',
                        'featured' => false,
                        'badge' => '',
                    ],
                ],
            ])),
            TemplateContent::section('compare', 'compare.vantage', array_merge(self::motion(40), [
                'railIndex' => '02',
                'railTotal' => '04',
                'railLabel' => 'Compare',
                'eyebrow' => 'Compare plans',
                'heading' => 'Every plan, line by line.',
                'watermark' => 'C',
                'columns' => [
                    ['label' => 'Starter'],
                    ['label' => 'Growth'],
                    ['label' => 'Enterprise'],
                ],
                'rows' => [
                    ['label' => 'Data retention', 'values' => '7 days | 30 days | Custom'],
                    ['label' => 'Unified observability', 'values' => 'yes | yes | yes'],
                    ['label' => 'Automation engine', 'values' => 'no | yes | yes'],
                    ['label' => 'Dry-run simulator', 'values' => 'no | yes | yes'],
                    ['label' => 'Zero-trust policy bundle', 'values' => 'no | yes | yes'],
                    ['label' => 'SAML SSO', 'values' => 'no | no | yes'],
                    ['label' => 'Audit log export', 'values' => 'no | no | yes'],
                    ['label' => 'Dedicated solution engineer', 'values' => 'no | no | yes'],
                    ['label' => 'SLA', 'values' => 'Best effort | 99.9% | 99.98%'],
                ],
            ])),
            TemplateContent::section('faq', 'faq.vantage', array_merge(self::motion(40), [
                'railIndex' => '03',
                'railTotal' => '04',
                'railLabel' => 'FAQ',
                'eyebrow' => 'FAQ',
                'heading' => 'Quiet answers to loud questions.',
                'description' => 'Still wondering about something specific? Drop us a line from the contact page — a real human replies within one business day.',
                'watermark' => 'Q',
                'openFirst' => true,
                'items' => [
                    [
                        'question' => 'Is there a free trial?',
                        'answer' => 'Yes — every plan offers a 14-day trial of the full product, no credit card required. We give you sample telemetry and a guided walkthrough so you can evaluate honestly.',
                    ],
                    [
                        'question' => 'How is a "seat" counted?',
                        'answer' => 'A seat is any human who signs in during a billing month. Service accounts and read-only dashboards are free.',
                    ],
                    [
                        'question' => 'Can I change plans later?',
                        'answer' => 'Any time, in both directions. Upgrades are prorated to the day; downgrades take effect at the next renewal.',
                    ],
                    [
                        'question' => 'Do you offer non-profit or startup discounts?',
                        'answer' => 'We do — 50% off Growth for registered non-profits and pre-seed companies under 15 people. Ask us and we will sort it out.',
                    ],
                    [
                        'question' => 'Where is my data stored?',
                        'answer' => 'EU (Rotterdam) by default, with US and AP regions available. Enterprise plans can pin residency per workspace.',
                    ],
                ],
            ])),
            TemplateContent::section('sizing', 'sizing.vantage', array_merge(self::motion(40), [
                'railIndex' => '04',
                'railTotal' => '04',
                'railLabel' => 'Next',
                'eyebrow' => 'Not sure which plan',
                'heading' => "We'll help you size it right — in under 20 minutes.",
                'description' => 'A real solution engineer reviews your stack, walks you through three calmer architectures, and tells you which plan actually fits. No slides.',
                'buttonLabel' => 'Book a sizing call',
                'buttonUrl' => '/contact',
                'buttonIcon' => 'arrow',
                'proofLabel' => 'Trusted by 1,200+ teams',
                'proofMeta' => 'AVG. RATING 4.9 / 5',
                'avatars' => [
                    ['image' => TemplateContent::photo('1494790108377-be9c29b29330', 200)],
                    ['image' => TemplateContent::photo('1500648767791-00dcc994a43e', 200)],
                    ['image' => TemplateContent::photo('1534528741775-53994a69daeb', 200)],
                ],
                'image' => TemplateContent::photo('1560250097-0b93528c311a', 1000),
                'imageLabel' => 'ABOUT 20 MIN CALL',
            ])),
        ], $footer, 'footer.vantage', 'navbar.vantage');
    }

    /**
     * @param  array<string, mixed>  $nav
     * @param  array<string, mixed>  $footer
     * @return array<string, mixed>
     */
    private static function contact(string $brand, string $email, string $phone, array $nav, array $footer): array
    {
        return TemplateContent::sitePage('Contact', 'contact', false, $nav, [
            TemplateContent::section('hero', 'pagehero.vantage', array_merge(self::motion(0, 'load'), [
                'animation' => 'fade',
                'breadcrumb' => strtoupper($brand).' / CONTACT',
                'version' => 'V3.1',
                'eyebrow' => 'Contact',
                'heading' => "Let's talk about your quiet platform.",
                'description' => "Whether you're sizing a plan, evaluating the platform, or just curious about our point of view — a real engineer will write back within one business day.",
                'pills' => [
                    ['label' => '24h reply window'],
                    ['label' => '3 global offices'],
                    ['label' => '5+ languages'],
                ],
                'image' => TemplateContent::photo('1573497019940-1c28c88b4f3e', 1200),
                'imageLabel' => 'REAL HUMANS — ALWAYS',
                'chipTitle' => 'One business day',
                'chipMeta' => $brand,
                'chipIcon' => 'mail',
                'watermark' => 'C',
            ])),
            TemplateContent::section('contact', 'contact.vantage', array_merge(self::motion(40), [
                'railIndex' => '01',
                'railTotal' => '04',
                'railLabel' => 'Reach out',
                'eyebrow' => 'Get in touch',
                'heading' => 'Drop a note — we read every one.',
                'description' => 'Tell us a little about where you are today. We will come back with a thoughtful next step — not a generic sales blast.',
                'email' => $email,
                'phone' => $phone,
                'hours' => 'Mon – Fri · 09:00 – 18:00 CET',
                'formId' => '',
                'buttonLabel' => 'Send message',
                'topics' => "Sales enquiry\nTechnical demo\nPricing question\nPartnership\nPress / Other",
                'consentLabel' => 'I agree to be contacted about my enquiry and have read the Privacy Policy.',
            ])),
            TemplateContent::section('map', 'map.vantage', array_merge(self::motion(40), [
                'railIndex' => '02',
                'railTotal' => '04',
                'railLabel' => 'Visit',
                'eyebrow' => 'Visit us',
                'heading' => '2400 Harbour Lane',
                'description' => 'Our Rotterdam studio is open by appointment. Coffee on us — the espresso machine is sourced from a friend in Trieste.',
                'buttonLabel' => 'Get directions',
                'buttonUrl' => '#',
                'buttonIcon' => 'map-pin',
                'embedUrl' => 'https://www.openstreetmap.org/export/embed.html?bbox=4.45%2C51.90%2C4.52%2C51.93&layer=mapnik',
                'image' => '',
            ])),
            TemplateContent::section('offices', 'offices.vantage', array_merge(self::motion(40), [
                'railIndex' => '03',
                'railTotal' => '04',
                'railLabel' => 'Offices',
                'eyebrow' => 'Our offices',
                'heading' => 'Three time zones, one calm phone tree.',
                'badgeLabel' => '3 hubs · 24h cover',
                'badgeMeta' => 'Availability',
                'badgeIcon' => 'globe',
                'items' => [
                    [
                        'city' => 'Rotterdam',
                        'tag' => 'Headquarters',
                        'address' => "2400 Harbour Lane, Suite 12\nRotterdam, 3011 EA, NL",
                        'hours' => 'Mon – Fri · 09:00 – 18:00 CET',
                        'status' => 'Open',
                        'image' => TemplateContent::photo('1497366754035-f200968a6e72', 900),
                    ],
                    [
                        'city' => 'Lisbon',
                        'tag' => 'EMEA hub',
                        'address' => "Rua da Prata 118\n1100-421 Lisboa, PT",
                        'hours' => 'Mon – Fri · 09:00 – 18:00 WET',
                        'status' => 'Open',
                        'image' => TemplateContent::photo('1555881400-74d7acaacd8b', 900),
                    ],
                    [
                        'city' => 'Singapore',
                        'tag' => 'APAC hub',
                        'address' => "8 Marina Boulevard, #05-02\nMarina Bay, 018981 SG",
                        'hours' => 'Mon – Fri · 09:00 – 18:00 SGT',
                        'status' => 'Open',
                        'image' => TemplateContent::photo('1565967511849-76a60a516170', 900),
                    ],
                ],
            ])),
        ], $footer, 'footer.vantage', 'navbar.vantage');
    }
}
