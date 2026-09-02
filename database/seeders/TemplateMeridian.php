<?php

namespace Database\Seeders;

/**
 * Meridian — a developer-infrastructure / fintech platform template.
 *
 * Seven pages (Home, Product, Solutions, Pricing, Company, Contact, Legal)
 * built from the `*.meridian` block family: near-white pages, two-tone
 * headlines fading black to grey, pastel gradient-mesh panels behind product
 * imagery, a lavender company band and an inkwell-dark comparison matrix.
 */
class TemplateMeridian
{
    private const INK = '#0a0a0b';

    private const LILAC = '#c9d0f7';

    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => self::INK,
            'secondary' => '#0b1020',
            'accent' => '#8ea2f5',
            'background' => '#ffffff',
            'surface' => '#f5f5fb',
            'text' => self::INK,
            'muted' => '#8e8e98',
            'headingFont' => 'Manrope, system-ui, sans-serif',
            'bodyFont' => 'Manrope, system-ui, sans-serif',
            'serifFont' => 'Georgia, serif',
            'monoFont' => 'JetBrains Mono, ui-monospace, monospace',
            'headingWeight' => 600,
            'bodyWeight' => 400,
            'buttonRadius' => '999px',
            'cardRadius' => '14px',
            'containerWidth' => '1160px',
            'sectionSpacing' => '92px',
        ];
    }

    /** @return array<string, mixed> */
    private static function motion(int $delay = 0, string $trigger = 'scroll'): array
    {
        return [
            'animation' => 'fade-up',
            'animationTrigger' => $trigger,
            'animationDuration' => 620,
            'animationDelay' => $delay,
        ];
    }

    /** @return array<string, mixed> */
    private static function nav(): array
    {
        return array_merge([
            'logo' => 'Meridian',
            'logoNote' => 'a payments company',
            'logoImage' => '',
            'logoUrl' => '/',
            'links' => [
                ['label' => 'Products', 'url' => '/product', 'children' => [
                    ['label' => 'User accounts', 'url' => '/product'],
                    ['label' => 'Treasury', 'url' => '/product'],
                    ['label' => 'Key management', 'url' => '/product'],
                    ['label' => 'Policy engine', 'url' => '/product'],
                ]],
                ['label' => 'Solutions', 'url' => '/solutions', 'children' => [
                    ['label' => 'Banking', 'url' => '/solutions'],
                    ['label' => 'Payments', 'url' => '/solutions'],
                    ['label' => 'Marketplaces', 'url' => '/solutions'],
                ]],
                ['label' => 'Developers', 'url' => '/product'],
                ['label' => 'Company', 'url' => '/company'],
                ['label' => 'Pricing', 'url' => '/pricing'],
            ],
            'secondaryLabel' => 'Docs',
            'secondaryUrl' => '/product',
            'buttonLabel' => 'Log in',
            'buttonUrl' => '/contact',
            'sticky' => true,
        ], ['animation' => 'fade-down', 'animationTrigger' => 'load']);
    }

    /** @return array<string, mixed> */
    private static function footer(): array
    {
        return array_merge([
            'logo' => 'Meridian',
            'logoNote' => '',
            'logoImage' => '',
            'logoUrl' => '/',
            'tagline' => 'Technical decisions are moral decisions.',
            'columns' => [
                [
                    'title' => 'Product',
                    'links' => [
                        ['label' => 'User accounts', 'url' => '/product'],
                        ['label' => 'Treasury', 'url' => '/product'],
                        ['label' => 'Key management', 'url' => '/product'],
                        ['label' => 'Policy engine', 'url' => '/product'],
                        ['label' => 'On and off ramps', 'url' => '/product'],
                        ['label' => 'Cards and spend', 'url' => '/product'],
                    ],
                ],
                [
                    'title' => 'Solutions',
                    'links' => [
                        ['label' => 'Banking', 'url' => '/solutions'],
                        ['label' => 'Payments', 'url' => '/solutions'],
                        ['label' => 'Payroll', 'url' => '/solutions'],
                        ['label' => 'Marketplaces', 'url' => '/solutions'],
                        ['label' => 'Exchanges', 'url' => '/solutions'],
                    ],
                ],
                [
                    'title' => 'Developers',
                    'links' => [
                        ['label' => 'Docs', 'url' => '/product'],
                        ['label' => 'Demo', 'url' => '/product'],
                        ['label' => 'Security handbook', 'url' => '/legal'],
                        ['label' => 'Trust centre', 'url' => '/legal'],
                        ['label' => 'Support', 'url' => '/contact'],
                    ],
                ],
                [
                    'title' => 'Company',
                    'links' => [
                        ['label' => 'About', 'url' => '/company'],
                        ['label' => 'Careers', 'url' => '/company'],
                        ['label' => 'Blog', 'url' => '/company'],
                        ['label' => 'Contact', 'url' => '/contact'],
                        ['label' => 'Privacy policy', 'url' => '/legal'],
                    ],
                ],
            ],
            'social' => [
                ['icon' => 'twitter', 'url' => '#'],
                ['icon' => 'github', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
            ],
            'copyright' => '© '.date('Y').' Meridian',
        ], self::motion(40));
    }

    /** @return list<array<string, mixed>> */
    private static function clientLogos(): array
    {
        return [
            ['label' => 'Northwind'],
            ['label' => 'Cardplane'],
            ['label' => 'Ferrous'],
            ['label' => 'Bluewater'],
            ['label' => 'Kestrel'],
            ['label' => 'Tandem'],
            ['label' => 'Vantage Pay'],
            ['label' => 'Odeon'],
        ];
    }

    /** @return array<string, mixed> */
    private static function cta(): array
    {
        return array_merge(self::motion(40), [
            'heading' => 'Get started in minutes',
            'headingAlt' => 'go live in hours',
            'description' => 'Build accounts, move value and automate settlement — from first transaction to global scale.',
            'buttonLabel' => 'Get started',
            'buttonUrl' => '/contact',
            'secondaryLabel' => 'Contact sales',
            'secondaryUrl' => '/contact',
        ]);
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        return [
            self::home(),
            self::product(),
            self::solutions(),
            self::pricing(),
            self::company(),
            self::contact(),
            self::legal(),
        ];
    }

    /** @return array<string, mixed> */
    private static function home(): array
    {
        return TemplateContent::sitePage('Home', 'home', true, self::nav(), [
            TemplateContent::section('hero', 'hero.meridian', array_merge(self::motion(0, 'load'), [
                'heading' => 'Build products that hold, move, and grow',
                'headingAlt' => 'digital assets',
                'description' => 'Spin up accounts, hold balances, move money and automate settlement — from the first transaction through to global scale.',
                'buttonLabel' => 'Get started',
                'buttonUrl' => '/contact',
                'secondaryLabel' => 'Contact sales',
                'secondaryUrl' => '/contact',
                'image' => TemplateContent::photo('1551288049-bebda4e38f71', 1200),
                'tint' => 'violet',
            ])),
            TemplateContent::section('logos', 'logos.meridian', array_merge(self::motion(20), [
                'heading' => '',
                'items' => self::clientLogos(),
            ])),
            TemplateContent::section('bento', 'bento.meridian', array_merge(self::motion(40), [
                'heading' => 'Launch modern financial experiences with',
                'headingAlt' => 'programmable money',
                'description' => '',
                'items' => [
                    ['title' => 'Bring digital accounts to every user', 'text' => 'Let people anywhere hold and use balances through products they already understand.', 'image' => TemplateContent::photo('1451187580459-43490279c0fa', 900), 'tint' => 'rose', 'span' => 'wide'],
                    ['title' => 'Build high-performance trading systems', 'text' => 'Support low-latency execution for high-frequency flows.', 'image' => TemplateContent::photo('1611974789855-9c2a0a7236a3', 700), 'tint' => 'violet', 'span' => 'normal'],
                    ['title' => 'Automate treasury operations', 'text' => 'Route and deploy capital with fine-grained approvals and programmable policy.', 'image' => TemplateContent::photo('1460925895917-afdab827c52f', 700), 'tint' => 'sky', 'span' => 'normal'],
                    ['title' => 'Launch modern banking experiences', 'text' => 'Everything you need to build products that help people store, save, spend and move money globally.', 'image' => TemplateContent::photo('1554224155-6726b3ff858f', 900), 'tint' => 'lilac', 'span' => 'wide'],
                    ['title' => 'Execute agentic payments', 'text' => 'Let software hold funds and transact autonomously inside limits you define.', 'image' => TemplateContent::photo('1526374965328-7f61d4dc18c5', 700), 'tint' => 'mint', 'span' => 'normal'],
                    ['title' => 'Enable card spend from balances', 'text' => 'Turn held balances into everyday spending power with global card acceptance.', 'image' => TemplateContent::photo('1563013544-824ae1b704d3', 700), 'tint' => 'violet', 'span' => 'normal'],
                    ['title' => 'Put idle balances to work', 'text' => 'Access yield markets and pass returns directly on to your users.', 'image' => TemplateContent::photo('1543286386-713bdd548da4', 700), 'tint' => 'rose', 'span' => 'normal'],
                ],
            ])),
            TemplateContent::section('stats', 'stats.meridian', array_merge(self::motion(40), [
                'surface' => 'tint',
                'items' => [
                    ['value' => '160M+', 'label' => 'global accounts'],
                    ['value' => '180+', 'label' => 'countries supported'],
                    ['value' => '$15B+', 'label' => 'processed monthly'],
                    ['value' => '99.99%', 'label' => 'historical uptime'],
                ],
            ])),
            TemplateContent::section('cases', 'cases.meridian', array_merge(self::motion(40), [
                'heading' => 'See what’s possible with',
                'headingAlt' => 'Meridian',
                'linkLabel' => 'All case studies',
                'linkUrl' => '/company',
                'items' => [
                    ['brand' => 'Northwind', 'text' => 'Northwind powers global payouts and card-linked balances on Meridian accounts.', 'image' => TemplateContent::photo('1556742049-0cfed4f6a45d', 700), 'colour' => '#e9f36a', 'url' => '/company'],
                    ['brand' => 'Cardplane', 'text' => 'Cardplane brings dollar-backed balances to contractors in ninety countries.', 'image' => TemplateContent::photo('1573497019940-1c28c88b4f3e', 700), 'colour' => '#d9d4f7', 'url' => '/company'],
                    ['brand' => 'Ferrous', 'text' => 'Ferrous makes advanced trading available to anyone, anywhere.', 'image' => TemplateContent::photo('1611974789855-9c2a0a7236a3', 700), 'colour' => '#9ef0d2', 'url' => '/company'],
                    ['brand' => 'Kestrel', 'text' => 'Kestrel partnered with us to build simple, secure consumer wallets.', 'image' => TemplateContent::photo('1556742502-ec7c0e9f34b1', 700), 'colour' => '#f9a8d0', 'url' => '/company'],
                ],
            ])),
            TemplateContent::section('developers', 'split.meridian', array_merge(self::motion(40), [
                'eyebrow' => '',
                'heading' => 'Built for developers.',
                'headingAlt' => 'Trusted by enterprises.',
                'description' => '',
                'bullets' => "Secure by design, with hardware-isolated key management\nWhite-label and modular, so it looks like your product\nScale without bottlenecks as volume grows\nHigher-level abstractions instead of raw primitives",
                'linkLabel' => 'Read the security handbook',
                'linkUrl' => '/legal',
                'image' => TemplateContent::photo('1550751827-4bd374c3f58b', 1000),
                'tint' => 'lilac',
                'reverse' => true,
            ])),
            TemplateContent::section('cta', 'cta.meridian', self::cta()),
        ], self::footer(), 'footer.meridian', 'navbar.meridian');
    }

    /** @return array<string, mixed> */
    private static function product(): array
    {
        return TemplateContent::sitePage('Product', 'product', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.meridian', array_merge(self::motion(0, 'load'), [
                'eyebrow' => 'User accounts',
                'heading' => 'Make digital assets accessible',
                'headingAlt' => 'to everyone',
                'description' => 'Create accounts instantly, let people hold value, move money and reach financial services without the onboarding friction.',
                'buttonLabel' => 'Talk to sales',
                'buttonUrl' => '/contact',
                'secondaryLabel' => 'Get started',
                'secondaryUrl' => '/contact',
                'surface' => 'plain',
            ])),
            TemplateContent::section('logos', 'logos.meridian', array_merge(self::motion(20), [
                'heading' => '',
                'items' => array_slice(self::clientLogos(), 0, 6),
            ])),
            TemplateContent::section('pillars', 'pillars.meridian', array_merge(self::motion(40), [
                'heading' => 'Everything people need to hold, move,',
                'headingAlt' => 'and manage digital assets',
                'description' => '',
                'columns' => 4,
                'items' => [
                    ['icon' => 'users', 'title' => 'Onboard instantly', 'text' => 'Create accounts automatically when someone signs up, with nothing new for them to learn.'],
                    ['icon' => 'zap', 'title' => 'Fund seamlessly', 'text' => 'Let people add funds through the methods they already use, wherever they are.'],
                    ['icon' => 'shield', 'title' => 'Transact without friction', 'text' => 'Sign and settle without repeated approvals or context switching.'],
                    ['icon' => 'globe', 'title' => 'Scale globally from day one', 'text' => 'Support every currency, country and rail without renegotiating your architecture.'],
                ],
            ])),
            TemplateContent::section('meet', 'split.meridian', array_merge(self::motion(40), [
                'eyebrow' => 'Authentication',
                'heading' => 'Meet people where',
                'headingAlt' => 'they already are',
                'description' => 'Support email, passkeys, one-time codes and social sign-in through a unified authentication layer.',
                'bullets' => "One login, every method\nPasskeys and biometrics\nBring your own identity provider",
                'linkLabel' => 'Learn more',
                'linkUrl' => '/product',
                'image' => TemplateContent::photo('1633265486064-086b219458ec', 1000),
                'tint' => 'rose',
                'reverse' => true,
            ])),
            TemplateContent::section('create', 'split.meridian', array_merge(self::motion(40), [
                'eyebrow' => 'Embedded accounts',
                'heading' => 'Create accounts',
                'headingAlt' => 'behind the scenes',
                'description' => 'Provision an account the moment someone signs up, with no extra step for them and no key material for you to hold.',
                'bullets' => "Instant account creation\nNo seed phrase to explain\nWorks across every supported rail",
                'linkLabel' => 'Learn more',
                'linkUrl' => '/product',
                'image' => TemplateContent::photo('1620321023374-d1a68fbc720d', 1000),
                'tint' => 'violet',
                'reverse' => false,
            ])),
            TemplateContent::section('fund', 'split.meridian', array_merge(self::motion(40), [
                'eyebrow' => 'Funding',
                'heading' => 'Make funding',
                'headingAlt' => 'feel ordinary',
                'description' => 'Let people move money into your application through the cards, bank transfers and local methods they already trust.',
                'bullets' => "Card and bank funding\nLocal payment methods\nAutomated compliance checks",
                'linkLabel' => 'Learn more',
                'linkUrl' => '/product',
                'image' => TemplateContent::photo('1601597111158-2fceff292cdc', 1000),
                'tint' => 'sky',
                'reverse' => true,
            ])),
            TemplateContent::section('stats', 'stats.meridian', array_merge(self::motion(40), [
                'surface' => 'tint',
                'items' => [
                    ['value' => '160M+', 'label' => 'accounts'],
                    ['value' => '$15B+', 'label' => 'processed monthly'],
                    ['value' => '<20ms', 'label' => 'signature time'],
                    ['value' => '99.99%', 'label' => 'historical uptime'],
                ],
            ])),
            TemplateContent::section('faq', 'faq.meridian', array_merge(self::motion(40), [
                'heading' => 'Frequently asked questions',
                'headingAlt' => '',
                'description' => '',
                'items' => [
                    ['question' => 'What is embedded account infrastructure?', 'answer' => 'A secure key-management stack that lets developers provision accounts for any use case, without the complexity of running the underlying rails.'],
                    ['question' => 'Which networks do you support?', 'answer' => 'Every major settlement network we have audited, with built-in support for moving value between them.'],
                    ['question' => 'Do people need a seed phrase or an extension?', 'answer' => 'No. Accounts are designed so users can get started without a seed phrase or an extension, while keeping the option to take custody themselves.'],
                    ['question' => 'Can actions be automated from a backend?', 'answer' => 'Yes. Server-side keys and delegated signing let you configure automated actions from your own backend, inside policy controls you set.'],
                    ['question' => 'Do you include fee management?', 'answer' => 'Yes. We offer built-in sponsorship and the ability to adjust fees dynamically based on network conditions.'],
                    ['question' => 'How do you handle transaction monitoring?', 'answer' => 'Webhooks and notifications cover balance changes and transaction activity, so you can react without polling.'],
                ],
            ])),
            TemplateContent::section('cta', 'cta.meridian', self::cta()),
        ], self::footer(), 'footer.meridian', 'navbar.meridian');
    }

    /** @return array<string, mixed> */
    private static function solutions(): array
    {
        return TemplateContent::sitePage('Solutions', 'solutions', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.meridian', array_merge(self::motion(0, 'load'), [
                'eyebrow' => '',
                'heading' => 'Stable value accounts',
                'headingAlt' => 'for global fintechs.',
                'description' => 'Build global financial products on modern settlement rails: hold value, earn yield and let teams move money at scale.',
                'buttonLabel' => 'Talk to sales',
                'buttonUrl' => '/contact',
                'secondaryLabel' => 'Learn more',
                'secondaryUrl' => '/product',
                'surface' => 'tint',
            ])),
            TemplateContent::section('logos', 'logos.meridian', array_merge(self::motion(20), [
                'heading' => '',
                'items' => array_slice(self::clientLogos(), 2, 6),
            ])),
            TemplateContent::section('pillars', 'pillars.meridian', array_merge(self::motion(40), [
                'heading' => 'Move money faster.',
                'headingAlt' => '',
                'description' => 'Use modern rails to cut settlement time, improve margins and serve people across the world.',
                'columns' => 4,
                'items' => [
                    ['icon' => 'zap', 'title' => 'Integrate value and pay-out rails', 'text' => 'Move money faster, for less, at lower cost across borders.'],
                    ['icon' => 'globe', 'title' => 'Global reach without the paperwork', 'text' => 'Reach cross-border complexity by offering global accounts from day one.'],
                    ['icon' => 'trending-up', 'title' => 'Yield-bearing accounts', 'text' => 'Earn yield on held balances through exposure to short-duration instruments.'],
                    ['icon' => 'shield', 'title' => 'Prepared, white-labelled', 'text' => 'Launch fully branded, embedded accounts with granular controls and remote custody options.'],
                ],
            ])),
            TemplateContent::section('embed', 'split.meridian', array_merge(self::motion(40), [
                'eyebrow' => '',
                'heading' => 'Embed accounts',
                'headingAlt' => 'for global flows',
                'description' => 'Provision accounts instantly for your users, so they can store, send and receive value without any added friction.',
                'bullets' => "Flexible custody to suit your regulator\nComposable integrations for yield\nSecure, multi-chain support",
                'linkLabel' => 'Learn more',
                'linkUrl' => '/product',
                'image' => TemplateContent::photo('1460925895917-afdab827c52f', 1000),
                'tint' => 'mint',
                'reverse' => true,
            ])),
            TemplateContent::section('stats', 'stats.meridian', array_merge(self::motion(40), [
                'surface' => 'dark',
                'items' => [
                    ['value' => '120M+', 'label' => 'accounts and counting'],
                    ['value' => '$15B+', 'label' => 'processed monthly'],
                    ['value' => '115M+', 'label' => 'monthly signatures'],
                    ['value' => '<20ms', 'label' => 'signature time'],
                ],
            ])),
            TemplateContent::section('resources', 'resources.meridian', array_merge(self::motion(40), [
                'heading' => 'Resources for building better',
                'headingAlt' => 'on modern money rails',
                'description' => 'Practical primers on accounts, yield and custody, grounded in real deployments.',
                'items' => [
                    ['title' => 'Stable value, explained.', 'text' => 'A primer on how stable digital money works and how to design around it, written for teams building their first product.', 'buttonLabel' => 'Download', 'url' => '#', 'image' => TemplateContent::photo('1554224155-6726b3ff858f', 900), 'reverse' => false],
                    ['title' => 'Yield, unlocked.', 'text' => 'An introduction to yield mechanics and what to weigh before you route customer balances into them.', 'buttonLabel' => 'Download', 'url' => '#', 'image' => TemplateContent::photo('1543286386-713bdd548da4', 900), 'reverse' => true],
                    ['title' => 'Custody, your way.', 'text' => 'A guide to custody models and which one fits, from fully delegated through to customer-controlled.', 'buttonLabel' => 'Download', 'url' => '#', 'image' => TemplateContent::photo('1550751827-4bd374c3f58b', 900), 'reverse' => false],
                ],
            ])),
            TemplateContent::section('faq', 'faq.meridian', array_merge(self::motion(40), [
                'heading' => 'Frequently asked questions.',
                'headingAlt' => '',
                'description' => 'From compliance to custody, the answers teams ask for most before they build.',
                'items' => [
                    ['question' => 'Why use stable value rails at all?', 'answer' => 'They settle in minutes rather than days, cost less per transfer, and work the same on a Sunday night as on a Tuesday morning.'],
                    ['question' => 'Do we need our own licences?', 'answer' => 'It depends on your structure. Many teams operate under an existing partner licence; we can introduce you to the right one for your market.'],
                    ['question' => 'How do you handle compliance checks?', 'answer' => 'Screening and monitoring run on every account and transfer, with the results exposed through the same API you already use.'],
                    ['question' => 'How do we move customers across seamlessly?', 'answer' => 'Integrate with your existing onboarding so people keep one account and one balance, whichever rail is underneath.'],
                    ['question' => 'How can we generate yield on held balances?', 'answer' => 'Route idle balances into short-duration instruments and pass the return to your users, or keep it as margin.'],
                    ['question' => 'What kinds of fintech use this today?', 'answer' => 'Neobanks, payroll platforms, marketplaces and treasury teams — anyone who needs money to arrive faster than the banking day allows.'],
                ],
            ])),
            TemplateContent::section('cta', 'cta.meridian', array_merge(self::cta(), [
                'heading' => 'Talk to us.',
                'headingAlt' => '',
                'description' => 'Tell us what you are building. We will tell you honestly whether we are the right fit.',
            ])),
        ], self::footer(), 'footer.meridian', 'navbar.meridian');
    }

    /** @return array<string, mixed> */
    private static function pricing(): array
    {
        return TemplateContent::sitePage('Pricing', 'pricing', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.meridian', array_merge(self::motion(0, 'load'), [
                'eyebrow' => '',
                'heading' => 'Pricing that scales',
                'headingAlt' => 'with your business.',
                'description' => 'From first build to global rollout, transparent pricing that grows with what you ship.',
                'buttonLabel' => '',
                'buttonUrl' => '',
                'secondaryLabel' => '',
                'secondaryUrl' => '',
                'surface' => 'plain',
            ])),
            TemplateContent::section('plans', 'pricing.meridian', array_merge(self::motion(20), [
                'items' => [
                    [
                        'name' => 'Builder',
                        'text' => 'For teams getting started. Access to the core feature set, with a free monthly allowance to launch on.',
                        'tiers' => "0 – 499 accounts | Free\n500 – 2,499 accounts | $299 / mo\n2,500 – 9,999 accounts | $499 / mo",
                        'features' => '',
                        'buttonLabel' => 'Get started',
                        'url' => '/contact',
                        'note' => 'Usage beyond the top tier moves to Enterprise.',
                        'featured' => false,
                    ],
                    [
                        'name' => 'Enterprise',
                        'text' => 'For scaled platforms that need advanced controls, custom terms and global reach.',
                        'tiers' => '',
                        'features' => "Custom pricing per account or transaction\nPremium support and a named contact\nAudit hooks, SSO and custom integrations\nVolume rates from $0.001 per signature",
                        'buttonLabel' => 'Talk to sales',
                        'url' => '/contact',
                        'note' => '',
                        'featured' => true,
                    ],
                ],
            ])),
            TemplateContent::section('logos', 'logos.meridian', array_merge(self::motion(30), [
                'heading' => 'Powering 120M+ accounts for 2,000+ teams',
                'items' => self::clientLogos(),
            ])),
            TemplateContent::section('included', 'pillars.meridian', array_merge(self::motion(40), [
                'heading' => 'All plans include',
                'headingAlt' => '',
                'description' => '',
                'columns' => 3,
                'items' => [
                    ['icon' => 'layers', 'title' => 'Powerful embedded accounts', 'text' => 'Low-level signing that works across every supported rail.'],
                    ['icon' => 'users', 'title' => 'Unified login', 'text' => 'One sign-in across every method and platform.'],
                    ['icon' => 'shield', 'title' => 'Secure, compliant infrastructure', 'text' => 'Enterprise-grade security built for scale.'],
                    ['icon' => 'chart', 'title' => 'Flexible pricing', 'text' => 'Start with free monthly allowances on the Builder plan.'],
                    ['icon' => 'trending-up', 'title' => 'Analytics and reporting', 'text' => 'Understand how people use your apps, and where they stop.'],
                    ['icon' => 'palette', 'title' => 'Fully customisable UI', 'text' => 'Integrate low-level APIs directly, or use custom components to match your brand.'],
                ],
            ])),
            TemplateContent::section('matrix', 'compare.meridian', array_merge(self::motion(40), [
                'heading' => 'Feature comparison matrix',
                'headingAlt' => '',
                'columns' => 'Builder | Enterprise',
                'groups' => [
                    [
                        'title' => 'Core platform',
                        'rows' => "Key-based authentication | yes | yes\nEmbedded accounts | yes | yes\nAccount connectors | yes | yes\nDelegated access | yes | yes\nNative fee sponsorship | yes | yes\nNative funding and bridging | yes | yes\nCustom concepts | yes | yes\nMulti-account support | yes | yes\nAuthentication methods | yes | yes\nWebhooks | no | yes",
                    ],
                    [
                        'title' => 'SDKs and UI',
                        'rows' => "Web, mobile and server SDKs | yes | yes\nWhite-label components and bare-metal APIs | yes | yes\nUsage analytics and reporting | yes | yes",
                    ],
                    [
                        'title' => 'Security and compliance',
                        'rows' => "Policy engine | no | yes\nApproval quorums | no | yes\nAdvanced SSO | Available as add-on | yes\nCustodial accounts | no | yes\nIntegrated fraud prevention | no | yes",
                    ],
                    [
                        'title' => 'Scale and contracts',
                        'rows' => "Usage-based pricing | no | yes\nPricing model | Fixed tiers plus usage | Custom, with volume discounts\nSupport | Developer community | Named contact and SLAs",
                    ],
                ],
            ])),
            TemplateContent::section('faq', 'faq.meridian', array_merge(self::motion(40), [
                'heading' => 'Frequently asked.',
                'headingAlt' => '',
                'description' => 'Have a question we have not covered? Write to the team and a human answers.',
                'items' => [
                    ['question' => 'How are monthly active accounts counted?', 'answer' => 'An active account is one that authenticated and held at least one session in the last thirty days. Connecting the same account from several devices still counts once.'],
                    ['question' => 'What happens as we grow?', 'answer' => 'When you pass a tier the next one applies automatically and billing follows the same month. We flag it in the dashboard before it happens.'],
                    ['question' => 'What happens to our users if we cancel?', 'answer' => 'Accounts stay reachable and people keep the ability to sign in for the period you already paid for. You can export everything before it ends.'],
                    ['question' => 'What counts as a transaction signature?', 'answer' => 'Any cryptographic signature request made through an embedded account, including transfers, approvals and typed-data signing.'],
                    ['question' => 'What if we exceed our limit?', 'answer' => 'Nothing breaks. We contact you, and if the overage is a one-off we usually absorb it rather than surprise you with an invoice.'],
                    ['question' => 'How do you prevent abuse?', 'answer' => 'Rate limits and an invisible challenge run on the sign-up path by default, and you can tighten or relax them per environment.'],
                    ['question' => 'How do we start an enterprise plan?', 'answer' => 'Write to the sales team. Most platforms move across once they are approaching ten thousand active accounts.'],
                    ['question' => 'Can we talk to someone before committing?', 'answer' => 'Yes. Book a call, or join the developer community and ask the engineers who build it.'],
                    ['question' => 'How are monthly transactions calculated?', 'answer' => 'A transaction represents a cryptographic signature request from an embedded account in the last thirty days.'],
                    ['question' => 'What if we need something you do not support yet?', 'answer' => 'Tell us. A good share of the roadmap comes from exactly that conversation.'],
                ],
            ])),
            TemplateContent::section('cta', 'cta.meridian', array_merge(self::cta(), [
                'heading' => 'Take the next step',
                'headingAlt' => 'with Meridian.',
                'description' => '',
            ])),
        ], self::footer(), 'footer.meridian', 'navbar.meridian');
    }

    /** @return array<string, mixed> */
    private static function company(): array
    {
        return TemplateContent::sitePage('Company', 'company', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.meridian', array_merge(self::motion(0, 'load'), [
                'eyebrow' => '',
                'heading' => 'Changing the way people connect',
                'headingAlt' => 'to the products they rely on.',
                'description' => 'We believe good products let people keep control of their own data and assets. That starts with better developer tooling.',
                'buttonLabel' => 'Open positions',
                'buttonUrl' => '/company',
                'secondaryLabel' => 'Blog',
                'secondaryUrl' => '/company',
                'surface' => 'lilac',
            ])),
            TemplateContent::section('why', 'split.meridian', array_merge(self::motion(40), [
                'eyebrow' => '',
                'heading' => 'Why we are here.',
                'headingAlt' => '',
                'description' => 'We founded Meridian to make privacy and ownership the default. We build simple, flexible tooling that puts people first, so the accounts and assets of millions stay theirs.',
                'bullets' => '',
                'linkLabel' => 'Read the manifesto',
                'linkUrl' => '/legal',
                'image' => TemplateContent::photo('1522071820081-009f0129c71c', 1000),
                'tint' => 'lilac',
                'reverse' => true,
            ])),
            TemplateContent::section('impact', 'split.meridian', array_merge(self::motion(40), [
                'eyebrow' => 'How we work',
                'heading' => 'Grounded in impact.',
                'headingAlt' => '',
                'description' => 'All engineering here is product engineering. We find our true north by letting customers guide the work, and we ship features for precise people rather than imagined archetypes.',
                'bullets' => '',
                'linkLabel' => 'Principles we build by',
                'linkUrl' => '/legal',
                'image' => TemplateContent::photo('1497366216548-37526070297c', 1000),
                'tint' => 'sky',
                'reverse' => false,
            ])),
            TemplateContent::section('perspectives', 'split.meridian', array_merge(self::motion(40), [
                'eyebrow' => '',
                'heading' => 'We value diverse',
                'headingAlt' => 'perspectives.',
                'description' => 'Our team brings deep expertise from many industries to reshape how people experience infrastructure. We stake out nuanced positions and build opinionated software so developers have a way forward.',
                'bullets' => '',
                'linkLabel' => 'Our values',
                'linkUrl' => '/legal',
                'image' => TemplateContent::photo('1531482615713-2afd69097998', 1000),
                'tint' => 'violet',
                'reverse' => true,
            ])),
            TemplateContent::section('offices', 'split.meridian', array_merge(self::motion(40), [
                'eyebrow' => '',
                'heading' => 'Remote-friendly with',
                'headingAlt' => 'offices in London and Lisbon.',
                'description' => 'We are a hybrid company with a remote team. We value the flexibility remote work brings, and we still believe some of the best work happens in a room together.',
                'bullets' => '',
                'linkLabel' => '',
                'linkUrl' => '',
                'image' => TemplateContent::photo('1513635269975-59663e0ac1ad', 1000),
                'tint' => 'rose',
                'reverse' => false,
            ])),
            TemplateContent::section('benefits', 'band.meridian', array_merge(self::motion(40), [
                'heading' => 'Benefits',
                'headingAlt' => '',
                'description' => 'Health cover, real equity, a learning budget and the time to use it — plus the equipment you actually want to work on.',
                'buttonLabel' => '',
                'buttonUrl' => '',
                'secondaryLabel' => '',
                'secondaryUrl' => '',
                'surface' => 'lilac',
            ])),
            TemplateContent::section('positions', 'positions.meridian', array_merge(self::motion(40), [
                'heading' => 'Open positions.',
                'headingAlt' => '',
                'url' => '/contact',
                'groups' => [
                    [
                        'title' => 'Engineering',
                        'roles' => "Security Engineer | London\nSolutions Engineer | London\nEngineering Manager, Forward Deployed | London\nBackend Engineer | London or Lisbon\nEngineering Manager, Product | London or Lisbon\nForward Deployed Engineer | London or Lisbon\nFull-stack Engineer | London or Lisbon\nInfrastructure Engineer | London or Lisbon",
                    ],
                    [
                        'title' => 'Go to market',
                        'roles' => "Account Executive | London\nDeveloper Advocate | Remote\nTechnical Writer | Remote",
                    ],
                ],
            ])),
            TemplateContent::section('band', 'band.meridian', array_merge(self::motion(40), [
                'heading' => 'Technical decisions are moral decisions.',
                'headingAlt' => '',
                'description' => '',
                'buttonLabel' => 'Read the manifesto',
                'buttonUrl' => '/legal',
                'secondaryLabel' => '',
                'secondaryUrl' => '',
                'surface' => 'lilac',
            ])),
        ], self::footer(), 'footer.meridian', 'navbar.meridian');
    }

    /** @return array<string, mixed> */
    private static function contact(): array
    {
        return TemplateContent::sitePage('Contact', 'contact', false, self::nav(), [
            TemplateContent::section('form', 'contact.meridian', array_merge(self::motion(0, 'load'), [
                'heading' => 'We want to hear',
                'headingAlt' => 'from you',
                'steps' => [
                    ['label' => 'Your email'],
                    ['label' => 'Your info'],
                    ['label' => 'Complete'],
                ],
                'activeStep' => 0,
                'regions' => "United Kingdom\nUnited States\nCanada\nGermany\nFrance\nNetherlands\nSingapore\nAustralia\nSomewhere else",
                'formId' => '',
                'buttonLabel' => 'Continue',
                'fineprint' => 'We handle your details under our privacy policy.',
            ])),
            TemplateContent::section('faq', 'faq.meridian', array_merge(self::motion(40), [
                'heading' => 'Before you write',
                'headingAlt' => 'the answers people ask for most',
                'description' => '',
                'items' => [
                    ['question' => 'How quickly will someone reply?', 'answer' => 'Within one working day, from a real inbox rather than a ticket queue.'],
                    ['question' => 'Can we get a technical call?', 'answer' => 'Yes. Say so in your message and we will put an engineer on it rather than a sales rep.'],
                    ['question' => 'Do you support migrations?', 'answer' => 'We do, at no charge. Send us what you have and we will map it across for you.'],
                    ['question' => 'Where is our data held?', 'answer' => 'In the region you choose, under the compliance regime that applies to your licence.'],
                ],
            ])),
        ], self::footer(), 'footer.meridian', 'navbar.meridian');
    }

    /** @return array<string, mixed> */
    private static function legal(): array
    {
        return TemplateContent::sitePage('Legal', 'legal', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.meridian', array_merge(self::motion(0, 'load'), [
                'eyebrow' => 'Legal',
                'heading' => 'Terms in plain language',
                'headingAlt' => 'written to be read, not skipped',
                'description' => '',
                'buttonLabel' => '',
                'buttonUrl' => '',
                'secondaryLabel' => '',
                'secondaryUrl' => '',
                'surface' => 'tint',
            ])),
            TemplateContent::section('body', 'richtext.meridian', array_merge(self::motion(20), [
                'contentWidth' => 'narrow',
                'body' => '<p>This page exists so you can read what you are agreeing to without a lawyer beside you. If anything here is unclear, write to us and we will rewrite it.</p>'
                    .'<h2>What we store</h2>'
                    .'<p>The accounts you create, the people in them, and the settings you choose. Nothing else, and nothing sold onward.</p>'
                    .'<p>You can export everything at any time, and closing your account deletes it for real rather than flagging a row as hidden.</p>'
                    .'<h2>Where it lives</h2>'
                    .'<p>In the region you select when you create the workspace. Our on-call engineers can reach production data only when an incident requires it, and that access is logged.</p>'
                    .'<h3>Sub-processors</h3>'
                    .'<p>We use a small number of providers for hosting, delivery and payments. The current list is available on request and we tell you before it changes.</p>'
                    .'<h2>Billing</h2>'
                    .'<p>Monthly, per active account, cancellable at any time. Cancelling stops the next charge; it does not refund the period you are already in, and you keep access until it ends.</p>',
            ])),
            TemplateContent::section('cta', 'cta.meridian', self::cta()),
        ], self::footer(), 'footer.meridian', 'navbar.meridian');
    }
}
