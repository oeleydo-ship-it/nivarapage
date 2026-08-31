<?php

namespace Database\Seeders;

class TemplateAxiomNorth
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#ffffff',
            'secondary' => '#000000',
            'accent' => '#f59e0b',
            'background' => '#000000',
            'surface' => '#141414',
            'text' => '#ffffff',
            'muted' => '#a1a1aa',
            'headingFont' => 'Syne, system-ui, sans-serif',
            'bodyFont' => 'DM Sans, system-ui, sans-serif',
            'headingWeight' => 700,
            'bodyWeight' => 400,
            'buttonRadius' => '999px',
            'cardRadius' => '14px',
            'containerWidth' => '1120px',
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

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $brand = 'Axiom North';
        $email = 'hello@axiomnorth.com';

        $nav = array_merge([
            'logo' => $brand,
            'logoIcon' => 'target',
            'logoUrl' => '/',
            'sticky' => true,
            'buttonLabel' => 'Book a call',
            'buttonUrl' => '/advisory#contact',
            'links' => [
                ['label' => 'Story', 'url' => '/story'],
                ['label' => 'Investing', 'url' => '/investing'],
                ['label' => 'Building', 'url' => '/building'],
                ['label' => 'Advisory', 'url' => '/advisory'],
            ],
        ], self::motion(0, 'load'));

        $footer = [
            'logo' => $brand,
            'logoIcon' => 'target',
            'logoUrl' => '/',
            'tagline' => 'Axiom North is a northern-latitude firm for builders shaping deep tech — capital, studio, and counsel under one roof.',
            'exploreTitle' => 'Explore',
            'exploreLinks' => $nav['links'],
            'connectTitle' => 'Connect',
            'connectLinks' => [
                ['label' => $email, 'url' => 'mailto:'.$email],
                ['label' => 'Press kit', 'url' => '#'],
                ['label' => 'Careers', 'url' => '#'],
                ['label' => 'Office hours', 'url' => '/advisory#contact'],
            ],
            'social' => [
                ['icon' => 'twitter', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
                ['icon' => 'github', 'url' => '#'],
                ['icon' => 'globe', 'url' => '#'],
            ],
            'copyright' => '© '.date('Y').' Axiom North Capital. All rights reserved.',
            'legal' => [
                ['label' => 'Privacy', 'url' => '#'],
                ['label' => 'Terms', 'url' => '#'],
                ['label' => 'Disclosure', 'url' => '#'],
            ],
        ];

        $portfolioItems = [
            [
                'title' => 'Keel Systems',
                'text' => 'Edge inference hardware for factories that cannot wait on the cloud.',
                'tags' => 'HARDWARE / AI',
                'stage' => 'seed',
                'image' => TemplateContent::photo('1518770660439-4636190af475', 1200),
            ],
            [
                'title' => 'Sable Bio',
                'text' => 'Cell-line tooling that shortens discovery cycles for specialty therapies.',
                'tags' => 'BIOTECH',
                'stage' => 'series-a',
                'image' => TemplateContent::photo('1532187863486-abf9dbad1b69', 1200),
            ],
            [
                'title' => 'Vale Orbit',
                'text' => 'Reusable bus platforms for small-sat constellations.',
                'tags' => 'SPACE',
                'stage' => 'pre-seed',
                'image' => TemplateContent::photo('1446776877081-d282a0f896e2', 1200),
            ],
            [
                'title' => 'Lattice Motion',
                'text' => 'Perception stacks for warehouse robots that share a floor with people.',
                'tags' => 'ROBOTICS',
                'stage' => 'seed',
                'image' => TemplateContent::photo('1485827404703-89b55fcc595e', 1200),
            ],
            [
                'title' => 'Cinder Grid',
                'text' => 'Industrial heat recovery software for heavy manufacturing lines.',
                'tags' => 'CLIMATE',
                'stage' => 'series-a',
                'image' => TemplateContent::photo('1451187580459-43490279c0fa', 1200),
            ],
            [
                'title' => 'Drift Labs',
                'text' => 'Secure collaboration rails for regulated research teams.',
                'tags' => 'SECURITY',
                'stage' => 'pre-seed',
                'image' => TemplateContent::photo('1639322537504-6427a16b0a28', 1200),
            ],
        ];

        $principles = [
            ['icon' => 'target', 'title' => 'True north over noise', 'text' => 'We back a clear thesis — not the loudest deck in the room.'],
            ['icon' => 'users', 'title' => 'Builders beside builders', 'text' => 'Partners who have shipped stay close after the wire clears.'],
            ['icon' => 'globe', 'title' => 'Patient by design', 'text' => 'We plan in decades so founders can ignore the weekly scoreboard.'],
            ['icon' => 'zap', 'title' => 'Proof before polish', 'text' => 'We pressure-test the product, the physics, and the path to margin.'],
        ];

        $foundingTeam = [
            ['icon' => 'users', 'title' => 'Interim leadership', 'text' => 'Operators who hold the seat until the right hire lands.'],
            ['icon' => 'cpu', 'title' => 'Product squad', 'text' => 'Designers and engineers who ship the first credible release.'],
            ['icon' => 'chart', 'title' => 'Revenue craft', 'text' => 'Offer design, pilot playbooks, and the first paying logos.'],
            ['icon' => 'shield', 'title' => 'Trust layer', 'text' => 'Security reviews and customer diligence packs, ready early.'],
            ['icon' => 'globe', 'title' => 'Warm routes', 'text' => 'Intro maps across Toronto, Berlin, Austin, and Seoul.'],
            ['icon' => 'message', 'title' => 'Board cadence', 'text' => 'Meeting rhythm and decision hygiene that keep teams aligned.'],
        ];

        return [
            TemplateContent::sitePage('Home', 'home', true, $nav, [
                TemplateContent::section('hero', 'hero.axiom', array_merge(self::motion(0, 'load'), [
                    'eyebrow' => '/// BRIEF — CAPITAL FOR HARD PROBLEMS',
                    'heading' => 'Find your true north. Then build toward it.',
                    'description' => 'Axiom North partners with technical founders solving physical and digital infrastructure — from factory floors to orbit — with patient capital and operators who stay.',
                    'buttonLabel' => 'Book a call',
                    'buttonUrl' => '/advisory#contact',
                    'secondaryLabel' => 'See companies',
                    'secondaryUrl' => '/investing',
                    'pills' => [
                        ['label' => 'Investing', 'url' => '/investing'],
                        ['label' => 'Building', 'url' => '/building'],
                        ['label' => 'Advisory', 'url' => '/advisory'],
                    ],
                ])),
                TemplateContent::section('stats', 'stats.axiom', array_merge(self::motion(40), [
                    'items' => [
                        ['value' => '47', 'label' => 'Active companies'],
                        ['value' => '$128M', 'label' => 'Capital committed'],
                        ['value' => '19', 'label' => 'Studio ventures'],
                        ['value' => '3', 'label' => 'Core hubs'],
                    ],
                ])),
                TemplateContent::section('proof', 'proof.axiom', array_merge(self::motion(40), [
                    'logos' => [
                        ['label' => 'Keel'],
                        ['label' => 'Sable'],
                        ['label' => 'Vale'],
                        ['label' => 'Lattice'],
                        ['label' => 'Cinder'],
                        ['label' => 'Drift'],
                        ['label' => 'Halo'],
                        ['label' => 'Quill'],
                        ['label' => 'Brine'],
                        ['label' => 'Meridian'],
                    ],
                ])),
                TemplateContent::section('principles', 'principles.axiom', array_merge(self::motion(80), [
                    'eyebrow' => '/// COMPASS — 01',
                    'heading' => 'A playbook, not a performance.',
                    'description' => 'Four habits guide every memo we write and every seat we take at the table.',
                    'items' => $principles,
                ])),
                TemplateContent::section('pillars', 'pillars.axiom', array_merge(self::motion(80), [
                    'items' => [
                        [
                            'eyebrow' => '01 / INVESTING',
                            'title' => 'Checks that move when the thesis is clear.',
                            'text' => 'Pre-seed through Series A for teams building durable infrastructure.',
                            'linkLabel' => 'Explore investing',
                            'linkUrl' => '/investing',
                            'image' => TemplateContent::photo('1451187580459-43490279c0fa', 900),
                        ],
                        [
                            'eyebrow' => '02 / BUILDING',
                            'title' => 'A studio that starts before the company has a name.',
                            'text' => 'We originate, staff, and ship with founders from blank page to first release.',
                            'linkLabel' => 'Explore building',
                            'linkUrl' => '/building',
                            'image' => TemplateContent::photo('1485827404703-89b55fcc595e', 900),
                        ],
                        [
                            'eyebrow' => '03 / ADVISORY',
                            'title' => 'Counsel that shows up in the work.',
                            'text' => 'Hiring, GTM, and board support when the next decision is load-bearing.',
                            'linkLabel' => 'Explore advisory',
                            'linkUrl' => '/advisory',
                            'image' => TemplateContent::photo('1516541196182-6bdb0516ed27', 900),
                        ],
                    ],
                ])),
                TemplateContent::section('portfolio', 'portfolio.axiom', array_merge(self::motion(80), [
                    'eyebrow' => '/// PORTFOLIO',
                    'heading' => 'Selected companies in the constellation',
                    'viewAllLabel' => 'Full list',
                    'viewAllUrl' => '/investing',
                    'filters' => [],
                    'items' => array_slice($portfolioItems, 0, 4),
                ])),
                TemplateContent::section('journal', 'journal.axiom', array_merge(self::motion(80), [
                    'eyebrow' => '/// FIELD NOTES',
                    'heading' => 'What we are studying this season',
                    'items' => [
                        [
                            'category' => 'Infrastructure',
                            'readTime' => '7 min',
                            'title' => 'Edge compute is finally earning its keep',
                            'image' => TemplateContent::photo('1518770660439-4636190af475', 900),
                        ],
                        [
                            'category' => 'Studio',
                            'readTime' => '5 min',
                            'title' => 'Staffing a zero-to-one team without burning trust',
                            'image' => TemplateContent::photo('1522071820081-009f0129c71c', 900),
                        ],
                        [
                            'category' => 'Climate',
                            'readTime' => '9 min',
                            'title' => 'Industrial heat is the overlooked climate lever',
                            'image' => TemplateContent::photo('1451187580459-43490279c0fa', 900),
                        ],
                    ],
                ])),
                TemplateContent::section('cta', 'cta.axiom', array_merge(self::motion(80), [
                    'watermark' => 'NORTH',
                    'heading' => 'If your roadmap still feels unfinished — write us.',
                    'description' => 'Send the problem, the constraint, and what you need next. We answer within one business day.',
                    'buttonLabel' => 'Book a call',
                    'buttonUrl' => '/advisory#contact',
                    'secondaryLabel' => $email,
                    'secondaryUrl' => 'mailto:'.$email,
                ])),
            ], $footer, 'footer.axiom', 'navbar.axiom'),

            TemplateContent::sitePage('Story', 'story', false, $nav, [
                TemplateContent::section('hero', 'hero.axiom_page', array_merge(self::motion(0, 'load'), [
                    'eyebrow' => '/// ORIGIN',
                    'heading' => 'Built for founders who navigate by principle.',
                    'description' => 'Axiom North began as a circle of operators writing careful checks. It grew into a firm that invests, co-builds, and advises — without losing the small-room honesty.',
                    'showImage' => false,
                ])),
                TemplateContent::section('values', 'values.axiom', array_merge(self::motion(80), [
                    'eyebrow' => 'OUR BAR',
                    'heading' => 'Four lines we refuse to blur.',
                    'items' => [
                        ['title' => 'Clarity first', 'text' => 'We say what we mean in the first meeting — fit, pace, and where we will not help.'],
                        ['title' => 'Evidence over theater', 'text' => 'Demos, datasets, and customer truth beat narrative slides every time.'],
                        ['title' => 'Proximity matters', 'text' => 'We keep seats light so partners can still take a founder call the same week.'],
                        ['title' => 'Aligned endings', 'text' => 'When outcomes are strong, the firm stays fair. When they are not, we still show up.'],
                    ],
                ])),
                TemplateContent::section('timeline', 'timeline.axiom', array_merge(self::motion(80), [
                    'eyebrow' => '/// PATH',
                    'heading' => 'Milestones along the meridian.',
                    'items' => [
                        ['year' => '2014', 'title' => 'First syndicate', 'text' => 'Operators in Toronto began co-investing in deep-tech teams with shared diligence notes.'],
                        ['year' => '2018', 'title' => 'Fund I closes', 'text' => 'A dedicated vehicle for pre-seed and seed infrastructure companies.'],
                        ['year' => '2020', 'title' => 'Studio desk opens', 'text' => 'Axiom North Studio started originating companies with embedded builders.'],
                        ['year' => '2024', 'title' => 'Three hubs', 'text' => 'Desks in Toronto, Berlin, and Austin to cover builders where they actually work.'],
                        ['year' => '2026', 'title' => 'Still selective', 'text' => 'Forty-seven companies later — still writing first checks with the same bar.'],
                    ],
                ])),
                TemplateContent::section('team', 'team.axiom', array_merge(self::motion(80), [
                    'eyebrow' => 'PARTNERS',
                    'heading' => 'The people behind the compass.',
                    'description' => 'Operators and investors who have built products, led teams, and stayed through hard quarters.',
                    'items' => [
                        [
                            'name' => 'Elena Voss',
                            'role' => 'Managing Partner',
                            'bio' => 'Ex-infra founder. Focuses on edge systems, silicon-adjacent software, and durable GTM.',
                            'image' => TemplateContent::photo('1573496359142-b8d87734a5a2', 600),
                        ],
                        [
                            'name' => 'Marcus Quay',
                            'role' => 'General Partner',
                            'bio' => 'Former robotics product lead. Backs autonomy, industrial software, and hardware-software pairs.',
                            'image' => TemplateContent::photo('1507003211169-0a1dd7228f2d', 600),
                        ],
                        [
                            'name' => 'Ines Park',
                            'role' => 'Partner, Studio',
                            'bio' => 'Builds founding teams and ships first products inside Axiom North Studio.',
                            'image' => TemplateContent::photo('1580489944761-15a19d654956', 600),
                        ],
                        [
                            'name' => 'Theo Marin',
                            'role' => 'Partner, Advisory',
                            'bio' => 'Hiring and enterprise motion specialist for Series A inflection points.',
                            'image' => TemplateContent::photo('1472099645785-5658abf4ff4e', 600),
                        ],
                    ],
                ])),
            ], $footer, 'footer.axiom', 'navbar.axiom'),

            TemplateContent::sitePage('Investing', 'investing', false, $nav, [
                TemplateContent::section('hero', 'hero.axiom_page', array_merge(self::motion(0, 'load'), [
                    'eyebrow' => '/// INVESTING',
                    'heading' => 'Patient capital for infrastructure that compounds.',
                    'description' => 'We write first and early checks into teams building the rails beneath AI, robotics, biology, climate, and space — then stay for the long climb.',
                    'showImage' => false,
                ])),
                TemplateContent::section('thesis', 'thesis.axiom', array_merge(self::motion(80), [
                    'eyebrow' => '/// THESIS',
                    'heading' => 'Three bets we keep returning to.',
                    'items' => [
                        ['title' => 'Intelligence at the edge', 'text' => 'Compute and software that make real-time decisions where latency and uptime matter.'],
                        ['title' => 'Biology as a production line', 'text' => 'Tools that turn lab insight into repeatable, regulated output.'],
                        ['title' => 'Physical systems that learn', 'text' => 'Robots, energy, and orbital platforms that get better with every deployment.'],
                    ],
                ])),
                TemplateContent::section('sectors', 'sectors.axiom', array_merge(self::motion(80), [
                    'eyebrow' => '/// FOCUS',
                    'heading' => 'Where the capital lands.',
                    'description' => 'A concentrated map — not a splash across every buzzword.',
                    'items' => [
                        ['icon' => 'cpu', 'title' => 'Applied AI systems', 'count' => '12 companies'],
                        ['icon' => 'rocket', 'title' => 'Autonomy & robotics', 'count' => '9 companies'],
                        ['icon' => 'heart', 'title' => 'Bio tooling', 'count' => '7 companies'],
                        ['icon' => 'leaf', 'title' => 'Industrial climate', 'count' => '8 companies'],
                        ['icon' => 'globe', 'title' => 'Space platforms', 'count' => '5 companies'],
                        ['icon' => 'shield', 'title' => 'Trust & security', 'count' => '6 companies'],
                    ],
                ])),
                TemplateContent::section('portfolio', 'portfolio.axiom', array_merge(self::motion(80), [
                    'eyebrow' => '/// COMPANIES',
                    'heading' => '47 companies. One standard.',
                    'filters' => [
                        ['label' => 'All', 'value' => 'all'],
                        ['label' => 'Pre-seed', 'value' => 'pre-seed'],
                        ['label' => 'Seed', 'value' => 'seed'],
                        ['label' => 'Series A', 'value' => 'series-a'],
                    ],
                    'items' => $portfolioItems,
                ])),
                TemplateContent::section('process', 'process.axiom', array_merge(self::motion(80), [
                    'eyebrow' => '/// CADENCE',
                    'heading' => 'A path that respects founder time.',
                    'description' => 'Short cycles, clear owners, and a decision you can plan around.',
                    'items' => [
                        ['title' => 'Signal call', 'text' => 'Forty-five minutes on the problem, the wedge, and what “good” looks like in a year.'],
                        ['title' => 'Workbench', 'text' => 'Technical and customer diligence with people who have shipped similar systems.'],
                        ['title' => 'Partner vote', 'text' => 'A written thesis and a yes/no — typically inside ten business days.'],
                        ['title' => 'Kickoff', 'text' => 'Capital wired, intro map shared, and a standing office-hours slot.'],
                    ],
                ])),
            ], $footer, 'footer.axiom', 'navbar.axiom'),

            TemplateContent::sitePage('Building', 'building', false, $nav, [
                TemplateContent::section('hero', 'hero.axiom_page', array_merge(self::motion(0, 'load'), [
                    'eyebrow' => '/// STUDIO',
                    'heading' => 'Companies born with operators already in the room.',
                    'description' => 'Axiom North Studio originates ventures with capital, a founding squad, and a first-eighteen-months playbook — then spins them out when they can stand alone.',
                    'showImage' => true,
                    'image' => TemplateContent::photo('1558618666-fcd25c85f82e', 900),
                    'imageAlt' => 'Studio workspace forms',
                ])),
                TemplateContent::section('studio', 'studio.axiom', array_merge(self::motion(80), [
                    'eyebrow' => '— METHOD',
                    'heading' => 'How a studio company takes shape.',
                    'description' => 'Four stages from a stubborn problem to an independent company.',
                    'items' => [
                        ['icon' => 'sparkles', 'index' => '01', 'title' => 'Thesis lock', 'text' => 'We name the problem, the buyer, and the constraint we refuse to ignore.'],
                        ['icon' => 'users', 'index' => '02', 'title' => 'Founding match', 'text' => 'Pair operators and domain leads who want to own the outcome.'],
                        ['icon' => 'rocket', 'index' => '03', 'title' => 'First release', 'text' => 'Ship a credible product with studio builders embedded full-time.'],
                        ['icon' => 'chart', 'index' => '04', 'title' => 'Independent orbit', 'text' => 'Capitalize, hire leadership when ready, and stay as long-horizon partners.'],
                    ],
                ])),
                TemplateContent::section('projects', 'projects.axiom', array_merge(self::motion(80), [
                    'eyebrow' => '/// ACTIVE BUILD',
                    'heading' => 'Ventures on the workbench now.',
                    'items' => [
                        ['name' => 'Keel Pilot', 'text' => 'Factory-floor inference appliances for mid-size manufacturers.', 'meta' => 'Seed · Live pilots'],
                        ['name' => 'Brine Index', 'text' => 'Underwriting data for industrial water risk.', 'meta' => 'Pre-seed · Hiring'],
                        ['name' => 'Halo Route', 'text' => 'Planning software for mixed human-robot warehouses.', 'meta' => 'Series A · Shipping'],
                        ['name' => 'Quill Desk', 'text' => 'Founding-ops toolkit for deep-tech spinouts.', 'meta' => 'Studio · Forming'],
                    ],
                ])),
                TemplateContent::section('founding', 'services.axiom', array_merge(self::motion(80), [
                    'eyebrow' => '/// CAPABILITY',
                    'heading' => 'What the studio brings on day one.',
                    'description' => 'A practical stack so the company does not wait a year to look real.',
                    'items' => $foundingTeam,
                ])),
            ], $footer, 'footer.axiom', 'navbar.axiom'),

            TemplateContent::sitePage('Advisory', 'advisory', false, $nav, [
                TemplateContent::section('hero', 'hero.axiom_page', array_merge(self::motion(0, 'load'), [
                    'eyebrow' => '/// ADVISORY',
                    'heading' => 'Steady hands for load-bearing decisions.',
                    'description' => 'Scoped operator support for hiring, go-to-market, and board moments — available to portfolio companies and select outside teams.',
                    'showImage' => true,
                    'image' => TemplateContent::photo('1516541196182-6bdb0516ed27', 900),
                    'imageAlt' => 'Navigation compass',
                ])),
                TemplateContent::section('services', 'services.axiom', array_merge(self::motion(80), [
                    'eyebrow' => '/// ENGAGEMENTS',
                    'heading' => 'Ways we work beside the team.',
                    'description' => 'Advisory with owners, deliverables, and an end date — not endless meetings.',
                    'items' => [
                        ['icon' => 'target', 'title' => 'Strategy sprints', 'text' => 'Two-week clarity on product focus, sequencing, and capital timing.'],
                        ['icon' => 'users', 'title' => 'Founding hiring', 'text' => 'Scorecards, loops, and closes for the seats that define culture.'],
                        ['icon' => 'chart', 'title' => 'Revenue design', 'text' => 'Packaging, pilots, and the first enterprise motion that sticks.'],
                        ['icon' => 'shield', 'title' => 'Diligence readiness', 'text' => 'Security, customer, and data packs before the next raise.'],
                        ['icon' => 'globe', 'title' => 'Market bridges', 'text' => 'Warm routes into Toronto, Berlin, Austin, and Seoul.'],
                        ['icon' => 'message', 'title' => 'Board support', 'text' => 'Cadence, memos, and decision hygiene when stakes are high.'],
                    ],
                ])),
                TemplateContent::section('faq', 'faq.axiom', array_merge(self::motion(80), [
                    'eyebrow' => '/// FAQ',
                    'heading' => 'Straight answers before you book time.',
                    'items' => [
                        [
                            'question' => 'Which stages do you fund?',
                            'answer' => 'Mostly pre-seed through Series A. Follow-on is reserved for companies we already know well.',
                        ],
                        [
                            'question' => 'Will you lead a round?',
                            'answer' => 'Yes when the fit is sharp. We also co-invest with partners who share our bar.',
                        ],
                        [
                            'question' => 'Is advisory only for portfolio companies?',
                            'answer' => 'Portfolio first. We take a small number of outside engagements when capacity allows.',
                        ],
                        [
                            'question' => 'Can studio companies raise from others?',
                            'answer' => 'Yes. Spin-outs are built to be independent and fundable outside Axiom North.',
                        ],
                    ],
                ])),
                TemplateContent::section('contact', 'contact.axiom', array_merge(self::motion(80), [
                    'eyebrow' => '/// CONTACT',
                    'heading' => 'Tell us what you are building.',
                    'description' => 'A short note beats a polished deck. We read every message.',
                    'buttonLabel' => 'Send message',
                    'email' => $email,
                    'locations' => 'Toronto · Berlin · Austin',
                    'hours' => 'Mon–Fri · Calls by appointment',
                ])),
            ], $footer, 'footer.axiom', 'navbar.axiom'),
        ];
    }
}
