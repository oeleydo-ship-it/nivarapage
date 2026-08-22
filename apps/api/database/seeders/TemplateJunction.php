<?php

namespace Database\Seeders;

/**
 * Junction — an automation / AI-orchestration product template.
 *
 * Five pages (Home, Platform, Pricing, Solutions, Integrations) built from the
 * `*.junction` block family: Figtree headlines on warm off-white, one hot-orange
 * accent, near-black buttons, tinted screenshot cards and deep olive/indigo bands.
 */
class TemplateJunction
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#ff4f00',
            'secondary' => '#1f1d1b',
            'accent' => '#ff4f00',
            'background' => '#ffffff',
            'surface' => '#faf7f4',
            'text' => '#1f1d1b',
            'muted' => '#5c5754',
            'headingFont' => 'Figtree, system-ui, sans-serif',
            'bodyFont' => 'Inter, system-ui, sans-serif',
            'monoFont' => 'JetBrains Mono, ui-monospace, monospace',
            'headingWeight' => 600,
            'bodyWeight' => 400,
            'buttonRadius' => '6px',
            'cardRadius' => '14px',
            'containerWidth' => '1180px',
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
        $brand = 'junction';

        $nav = array_merge([
            'logo' => $brand,
            'logoUrl' => '/',
            'links' => [
                ['label' => 'Platform', 'url' => '/platform'],
                ['label' => 'Solutions', 'url' => '/solutions'],
                ['label' => 'Integrations', 'url' => '/integrations'],
                ['label' => 'Pricing', 'url' => '/pricing'],
            ],
            'utilityLinks' => [
                ['label' => 'Explore apps', 'url' => '/integrations'],
                ['label' => 'Contact sales', 'url' => '/pricing'],
                ['label' => 'Log in', 'url' => '/pricing'],
            ],
            'buttonLabel' => 'Sign up',
            'buttonUrl' => '/pricing',
            'sticky' => true,
        ], self::motion(0, 'load'), ['animation' => 'fade-down']);

        $footer = array_merge([
            'ctaHeading' => 'Someone on your team is automating this weekend.',
            'ctaAccent' => 'Give them rails to do it on.',
            'buttonLabel' => 'Start building',
            'buttonUrl' => '/pricing',
            'secondaryLabel' => 'Claim a session',
            'secondaryUrl' => '/solutions',
            'logo' => $brand,
            'columns' => [
                [
                    'title' => 'Product',
                    'links' => [
                        ['label' => 'Platform', 'url' => '/platform'],
                        ['label' => 'Integrations', 'url' => '/integrations'],
                        ['label' => 'Pricing', 'url' => '/pricing'],
                        ['label' => 'Security', 'url' => '/platform'],
                    ],
                ],
                [
                    'title' => 'Solutions',
                    'links' => [
                        ['label' => 'Revenue teams', 'url' => '/solutions'],
                        ['label' => 'Finance', 'url' => '/solutions'],
                        ['label' => 'Support', 'url' => '/solutions'],
                        ['label' => 'IT and platform', 'url' => '/solutions'],
                    ],
                ],
                [
                    'title' => 'Resources',
                    'links' => [
                        ['label' => 'Documentation', 'url' => '#'],
                        ['label' => 'Build library', 'url' => '#'],
                        ['label' => 'Community', 'url' => '#'],
                        ['label' => 'Changelog', 'url' => '#'],
                    ],
                ],
                [
                    'title' => 'Company',
                    'links' => [
                        ['label' => 'About', 'url' => '#'],
                        ['label' => 'Careers', 'url' => '#'],
                        ['label' => 'Press kit', 'url' => '#'],
                        ['label' => 'Contact', 'url' => '/pricing'],
                    ],
                ],
            ],
            'socialLabel' => 'Follow us',
            'social' => [
                ['icon' => 'twitter', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
                ['icon' => 'github', 'url' => '#'],
                ['icon' => 'youtube', 'url' => '#'],
            ],
            'legalLinks' => [
                ['label' => 'Privacy', 'url' => '#'],
                ['label' => 'Terms', 'url' => '#'],
                ['label' => 'Cookies', 'url' => '#'],
            ],
            'copyright' => '© '.date('Y').' Junction, Inc.',
        ], self::motion(40));

        return [
            self::home($nav, $footer),
            self::platform($nav, $footer),
            self::pricing($nav, $footer),
            self::solutions($nav, $footer),
            self::integrations($nav, $footer),
        ];
    }

    /**
     * @param  array<string, mixed>  $nav
     * @param  array<string, mixed>  $footer
     * @return array<string, mixed>
     */
    private static function home(array $nav, array $footer): array
    {
        return TemplateContent::sitePage('Home', 'home', true, $nav, [
            TemplateContent::section('hero', 'hero.junction', array_merge(self::motion(0, 'load'), [
                'eyebrow' => '',
                'heading' => 'Wire your tools together once.',
                'headingAccent' => 'Stop rebuilding it every quarter.',
                'description' => 'Junction is the shared wiring layer for the software your company already runs. Build a connection, put a name on it, and let it keep working long after whoever made it has moved on.',
                'buttonLabel' => 'Try a build',
                'buttonUrl' => '/pricing',
                'secondaryLabel' => 'Book a walkthrough',
                'secondaryUrl' => '/solutions',
                'note' => 'No card, no sales call, cancel whenever',
                'stats' => [
                    ['value' => '8,000+', 'label' => 'Apps in the catalogue'],
                    ['value' => '40M', 'label' => 'Steps run weekly'],
                    ['value' => '99.99%', 'label' => 'Uptime last 12 months'],
                    ['value' => '4 min', 'label' => 'To a working build'],
                ],
            ])),
            TemplateContent::section('cards', 'cards.junction', array_merge(self::motion(40), [
                'heading' => 'Four habits that turn one-off scripts into',
                'headingAccent' => 'shared infrastructure.',
                'description' => 'None of them are clever. All of them are why the thing still works in March.',
                'columns' => 2,
                'items' => [
                    [
                        'eyebrow' => 'Define',
                        'title' => 'Sketch it before you wire it',
                        'text' => 'Map the path on a canvas first. Argue about it there, where changing your mind costs nothing.',
                        'image' => TemplateContent::photo('1551288049-bebda4e38f71', 900),
                        'tint' => '#e7eee8',
                    ],
                    [
                        'eyebrow' => 'Compose',
                        'title' => 'Connect without filing a ticket',
                        'text' => 'Pick from connections your admins already cleared. Nothing waits in a queue you cannot see.',
                        'image' => TemplateContent::photo('1460925895917-afdab827c52f', 900),
                        'tint' => '#eceaf6',
                    ],
                    [
                        'eyebrow' => 'Observe',
                        'title' => 'Know the moment something drifts',
                        'text' => 'Every execution leaves a trail you can search, replay against frozen data, and hand to whoever asks.',
                        'image' => TemplateContent::photo('1543286386-713bdd548da4', 900),
                        'tint' => '#f4ece3',
                    ],
                    [
                        'eyebrow' => 'Scale',
                        'title' => 'Pass it on without losing it',
                        'text' => 'Publish a working build to the shared library with its owner, its limits and its notes still attached.',
                        'image' => TemplateContent::photo('1522071820081-009f0129c71c', 900),
                        'tint' => '#e6ecf3',
                    ],
                ],
                'buttonLabel' => 'See what a build looks like',
                'buttonUrl' => '/platform',
            ])),
            TemplateContent::section('session', 'split.junction', array_merge(self::motion(40), [
                'heading' => 'Show us the process nobody wants to own.',
                'description' => 'Ninety minutes with an engineer who has untangled this shape of problem before. You leave with a working prototype and a written plan, whether or not you ever pay us.',
                'buttonLabel' => 'Claim a session',
                'buttonUrl' => '/solutions',
                'image' => TemplateContent::photo('1517245386807-bb43f82c33c4', 1200),
                'reverse' => false,
            ])),
            TemplateContent::section('builders', 'accordion.junction', array_merge(self::motion(40), [
                'heading' => 'Room to build,',
                'headingAccent' => 'rails that hold',
                'description' => 'Four things that stop an open platform turning into a junk drawer.',
                'items' => [
                    [
                        'title' => 'Ownership is a required field',
                        'text' => 'No build goes live without a named human behind it. The orphaned ones are always the ones that hurt.',
                    ],
                    [
                        'title' => 'Sandboxes that cannot reach production',
                        'text' => 'Experiment against seeded data all day. Promotion to live is a deliberate act somebody signs.',
                    ],
                    [
                        'title' => 'A second pair of eyes, only where it earns its keep',
                        'text' => 'Flag the three steps that touch money or customers. The other forty do not need a meeting.',
                    ],
                    [
                        'title' => 'Dead builds get archived, not inherited',
                        'text' => 'Anything that has not fired in ninety days gets flagged, so the library stays worth reading.',
                    ],
                ],
                'image' => TemplateContent::photo('1600880292203-757bb62b4baf', 1100),
                'secondImage' => TemplateContent::photo('1531973576160-7125cd663d86', 1100),
            ])),
            TemplateContent::section('security', 'secure.junction', array_merge(self::motion(40), [
                'heading' => 'Controls your auditor will',
                'headingAccent' => 'actually accept',
                'description' => '',
                'leadTitle' => 'Verified by people who are not us',
                'leadText' => 'Outside auditors, on a fixed schedule, with reports we hand over before anyone chases us.',
                'leadPoints' => "SOC 2 Type II and ISO 27001, renewed every year\nPick a region once: Frankfurt, Virginia or Sydney\nBring your own keys and rotate on your schedule\nDirectory sync, SSO and session limits included",
                'leadImage' => TemplateContent::photo('1563986768609-322da13575f3', 1000),
                'items' => [
                    [
                        'title' => 'One inventory of every connection',
                        'text' => 'Every credential in one list, with its owner, its reach and the date somebody last touched it.',
                        'image' => TemplateContent::photo('1454165804606-c3d57bc86b40', 800),
                        'tint' => '#eef0ea',
                    ],
                    [
                        'title' => 'Scope it down to a single field',
                        'text' => 'When a build only needs one column, give it one column. Not the whole table.',
                        'image' => TemplateContent::photo('1517245386807-bb43f82c33c4', 800),
                        'tint' => '#f2ece6',
                    ],
                    [
                        'title' => 'Run it inside your own perimeter',
                        'text' => 'Your cloud, your network, our runtime. Nothing leaves unless you decided it should.',
                        'image' => TemplateContent::photo('1451187580459-43490279c0fa', 800),
                        'tint' => '#e9edf2',
                    ],
                    [
                        'title' => 'Evidence you can hand over',
                        'text' => 'Every edit, execution and approval streamed to your own log stack as it happens.',
                        'image' => TemplateContent::photo('1526628953301-3e589a6a8b74', 800),
                        'tint' => '#e8eee9',
                    ],
                ],
                'buttonLabel' => 'Read the security notes',
                'buttonUrl' => '/platform',
            ])),
            TemplateContent::section('platform', 'platform.junction', array_merge(self::motion(40), [
                'heading' => 'The pieces, and how they fit',
                'description' => 'Three surfaces over one runtime. Use one of them or all three — the permission model does not change between them.',
                'brand' => 'junction',
                'brandNote' => 'One runtime, three surfaces',
                'items' => [
                    ['title' => 'Junction Flows', 'text' => 'Assemble steps on a canvas, branch on live data, keep working state in Tables.', 'linkLabel' => 'Open Flows', 'linkUrl' => '/platform'],
                    ['title' => 'Junction Kit', 'text' => 'The same catalogue, callable from your own services in TypeScript or Python.', 'linkLabel' => 'Open Kit', 'linkUrl' => '/platform'],
                    ['title' => 'Junction Bridge', 'text' => 'Hand an assistant a scoped tool list and a spend ceiling. It reports back what it used.', 'linkLabel' => 'Open Bridge', 'linkUrl' => '/platform'],
                ],
                'stripTitle' => 'Models are yours to choose',
                'stripText' => 'Bring your own provider keys or use ours. Swapping models never changes who is allowed to do what.',
            ])),
            TemplateContent::section('proof', 'quote.junction', array_merge(self::motion(40), [
                'heading' => 'From two-person startups to',
                'headingAccent' => 'companies with a compliance department',
                'quote' => 'We had forty spreadsheets pretending to be a system. Now there are eleven builds, each with a name on it, and I can answer "who changed that" in about nine seconds.',
                'author' => 'Priya Raghavan',
                'role' => 'Director of Operations, Northwind',
                'logoLabel' => 'NORTHWIND',
                'image' => TemplateContent::photo('1521737604893-d14cc237f11d', 1000),
                'stats' => [
                    ['value' => '42+', 'label' => 'People building each week'],
                    ['value' => '87%', 'label' => 'Of requests never reached IT'],
                ],
                'buttonLabel' => 'Read how they did it',
                'buttonUrl' => '/solutions',
            ])),
            TemplateContent::section('outcomes', 'metrics.junction', array_merge(self::motion(40), [
                'heading' => 'What actually',
                'headingAccent' => 'moved for them',
                'description' => 'Reported by customers six months in. We stopped publishing the year-three figures; nobody believed them.',
                'items' => [
                    ['value' => '11h', 'title' => 'Given back per person, weekly', 'text' => 'Mostly retyping the same record into a second system.'],
                    ['value' => '3.4x', 'title' => 'More builds reaching production', 'text' => 'The queue stopped being the reason things sat half-finished.'],
                    ['value' => '62%', 'title' => 'Drop in after-hours pages', 'text' => 'Most breakages now surface in a rehearsal, at four in the afternoon.'],
                ],
            ])),
        ], $footer, 'footer.junction', 'navbar.junction');
    }

    /**
     * @param  array<string, mixed>  $nav
     * @param  array<string, mixed>  $footer
     * @return array<string, mixed>
     */
    private static function platform(array $nav, array $footer): array
    {
        return TemplateContent::sitePage('Platform', 'platform', false, $nav, [
            TemplateContent::section('hero', 'hero.junction', array_merge(self::motion(0, 'load'), [
                'textAlign' => 'left',
                'eyebrow' => 'Under the hood',
                'heading' => 'One runtime for the plumbing your company keeps',
                'headingAccent' => 'rebuilding by hand.',
                'description' => 'Flows, agents, tables and code all answer to the same permission model and write to the same history. There is nothing to reconcile afterwards.',
                'buttonLabel' => 'Start building',
                'buttonUrl' => '/pricing',
                'secondaryLabel' => 'See pricing',
                'secondaryUrl' => '/pricing',
                'note' => 'Every tier gets the whole runtime',
                'stats' => [
                    ['value' => '120ms', 'label' => 'Median step time'],
                    ['value' => '3 regions', 'label' => 'Frankfurt · Virginia · Sydney'],
                    ['value' => 'SOC 2', 'label' => 'Renewed annually'],
                    ['value' => '0', 'label' => 'Agents on your servers'],
                ],
            ])),
            TemplateContent::section('bignum', 'stats.junction', array_merge(self::motion(40), [
                'heading' => 'Skip the demo magic.',
                'headingAccent' => 'Here is the meter.',
                'bigNumber' => '593,138,971',
                'bigLabel' => 'Automated steps executed across Junction last month',
                'items' => [
                    ['title' => 'A catalogue you do not maintain', 'text' => 'We keep the connectors current. You keep one place to revoke a key.'],
                    ['title' => 'Agents with a budget and a leash', 'text' => 'Hand one a goal and a ceiling. It stops at the ceiling and tells you why.'],
                    ['title' => 'No migration required', 'text' => 'It wires into the stack you have. Nothing gets replaced to make room.'],
                ],
                'buttonLabel' => 'See a build end to end',
                'buttonUrl' => '/integrations',
            ])),
            TemplateContent::section('capabilities', 'cards.junction', array_merge(self::motion(40), [
                'heading' => 'Everything a build needs, without',
                'headingAccent' => 'a second console.',
                'description' => 'Answering what happened last Tuesday should not need three separate logins.',
                'columns' => 2,
                'items' => [
                    [
                        'eyebrow' => 'Runs',
                        'title' => 'A history you can actually read',
                        'text' => 'Every step, payload and branch decision kept. Replay a bad one against frozen data and nothing real moves.',
                        'image' => TemplateContent::photo('1551288049-bebda4e38f71', 900),
                        'tint' => '#eceaf6',
                    ],
                    [
                        'eyebrow' => 'Data',
                        'title' => 'Somewhere to keep the lists',
                        'text' => 'Lookup tables, queues and staging rows live beside the builds that read them, not in a shared spreadsheet.',
                        'image' => TemplateContent::photo('1543286386-713bdd548da4', 900),
                        'tint' => '#e7eee8',
                    ],
                    [
                        'eyebrow' => 'Agents',
                        'title' => 'Judgement, where rules run out',
                        'text' => 'Some calls do not fit an if-statement. Give those to an agent with a tool list and a spend cap.',
                        'image' => TemplateContent::photo('1518770660439-4636190af475', 900),
                        'tint' => '#f4ece3',
                    ],
                    [
                        'eyebrow' => 'Code',
                        'title' => 'Drop to code when you must',
                        'text' => 'Inline TypeScript or Python, versioned with the build and reviewed exactly like the visual steps.',
                        'image' => TemplateContent::photo('1461749280684-dccba630e2f6', 900),
                        'tint' => '#e6ecf3',
                    ],
                ],
                'buttonLabel' => 'Read the reference',
                'buttonUrl' => '/integrations',
            ])),
            TemplateContent::section('governance', 'accordion.junction', array_merge(self::motion(40), [
                'heading' => 'Rules people do not route',
                'headingAccent' => 'around',
                'description' => 'Controls people do not resent are the only controls that survive contact with a deadline.',
                'items' => [
                    ['title' => 'Environments with real separation', 'text' => 'Sandbox, staging and production hold their own credentials, limits and reviewers.'],
                    ['title' => 'Budgets per team, not per invoice', 'text' => 'Set a monthly run ceiling by team and get told before it is reached, not after.'],
                    ['title' => 'Change review where it matters', 'text' => 'Diff a build like a pull request. Approve, comment or roll back to any prior version.'],
                    ['title' => 'Evidence on demand', 'text' => 'Export a signed activity record for any window your auditors ask about.'],
                ],
                'image' => TemplateContent::photo('1454165804606-c3d57bc86b40', 1100),
                'secondImage' => TemplateContent::photo('1526628953301-3e589a6a8b74', 1100),
            ])),
            TemplateContent::section('developers', 'code.junction', array_merge(self::motion(40), [
                'eyebrow' => 'For engineers',
                'heading' => 'Let your agents reach your stack, safely',
                'description' => 'Install Junction in your AI or agent toolchain and let it read and write real records — under the same governance your people work within.',
                'leftTitle' => 'Ask for it in a sentence, through Bridge',
                'leftText' => 'Point a compatible assistant at your workspace. It sees the actions on your approved list and nothing beyond them.',
                'leftSample' => 'Create a draft invoice for the Northwind renewal, attach the signed order form, then tell me what changed.',
                'leftMeta' => 'Any assistant that speaks the open tool protocol',
                'leftButtonLabel' => 'Set up Bridge',
                'leftButtonUrl' => '/integrations',
                'rightTitle' => 'Or call the same thing from your own code',
                'rightText' => 'One package, the whole catalogue, fully typed. Same permissions, same audit trail, your runtime.',
                'code' => "npm install @junction/sdk\n\nimport { Junction } from \"@junction/sdk\"\n\nconst jn = new Junction({ key: process.env.JUNCTION_KEY })\n\nconst invoice = await jn.run(\"ledgerly.invoice.create\", {\n  account: \"northwind\",\n  terms: \"net-30\",\n  lines: [{ sku: \"seat\", qty: 42 }],\n})\n\nconsole.log(invoice.id)",
                'rightButtonLabel' => 'Read the Kit reference',
                'rightButtonUrl' => '/integrations',
                'footnote' => 'Bridge and Kit ship on every paid tier and draw from the same volume pool as everything else.',
            ])),
            TemplateContent::section('platform', 'platform.junction', array_merge(self::motion(40), [
                'heading' => 'The pieces, and how they fit',
                'description' => 'Pick the surface that fits the person doing the work. They all write to the same history.',
                'brand' => 'junction',
                'brandNote' => 'One runtime, three surfaces',
                'items' => [
                    ['title' => 'Junction Flows', 'text' => 'Assemble steps on a canvas, branch on live data, keep working state in Tables.', 'linkLabel' => 'Open Flows', 'linkUrl' => '/platform'],
                    ['title' => 'Junction Kit', 'text' => 'The same catalogue, callable from your own services in TypeScript or Python.', 'linkLabel' => 'Open Kit', 'linkUrl' => '/platform'],
                    ['title' => 'Junction Bridge', 'text' => 'Hand an assistant a scoped tool list and a spend ceiling. It reports back what it used.', 'linkLabel' => 'Open Bridge', 'linkUrl' => '/platform'],
                ],
                'stripTitle' => 'Models are yours to choose',
                'stripText' => 'Bring your own provider keys or use ours. Swapping models never changes who is allowed to do what.',
            ])),
            TemplateContent::section('cta', 'ctaband.junction', array_merge(self::motion(40), [
                'heading' => 'Wire up one workflow and see whether it holds',
                'description' => '',
                'buttonLabel' => 'Start building',
                'buttonUrl' => '/pricing',
                'secondaryLabel' => 'Talk to an engineer, not a rep',
                'secondaryUrl' => '/solutions',
            ])),
        ], $footer, 'footer.junction', 'navbar.junction');
    }

    /**
     * @param  array<string, mixed>  $nav
     * @param  array<string, mixed>  $footer
     * @return array<string, mixed>
     */
    private static function pricing(array $nav, array $footer): array
    {
        return TemplateContent::sitePage('Pricing', 'pricing', false, $nav, [
            TemplateContent::section('hero', 'hero.junction', array_merge(self::motion(0, 'load'), [
                'textAlign' => 'left',
                'eyebrow' => 'Pricing',
                'heading' => 'Plans that follow your volume,',
                'headingAccent' => 'not your headcount.',
                'description' => 'Every tier ships the whole runtime. What changes is how much you can run, and how tightly you control who gets to run it.',
                'buttonLabel' => 'Use this free',
                'buttonUrl' => '/pricing',
                'secondaryLabel' => '',
                'secondaryUrl' => '',
                'note' => '',
                'stats' => [],
            ])),
            TemplateContent::section('banner', 'banner.junction', array_merge(self::motion(40), [
                'heading' => 'One balance, wherever the work happens.',
                'description' => 'Flows, agents, Bridge calls and Kit requests all draw down the same pool. One number on the dashboard tells you where you stand.',
                'buttonLabel' => 'How volume is counted',
                'buttonUrl' => '#',
            ])),
            TemplateContent::section('plans', 'pricing.junction', array_merge(self::motion(40), [
                'segmentLabel' => 'Runtime',
                'addOnLabel' => 'Extras',
                'sliderLabel' => 'What monthly volume are you planning for?',
                'sliderLink' => 'How volume is counted',
                'sliderUnit' => 'steps / month',
                'startStop' => 2,
                'monthlyLabel' => 'Billed monthly',
                'yearlyLabel' => 'Billed yearly — two months free',
                'currencyLabel' => 'USD ($)',
                'footnote' => 'Volume and controls change between tiers. The runtime does not.',
                'buttonLabel' => 'Compare every line',
                'buttonUrl' => '#',
            ])),
            TemplateContent::section('included', 'included.junction', array_merge(self::motion(40), [
                'heading' => 'Every paid tier ships with',
                'columns' => [
                    [
                        'title' => 'The whole build surface',
                        'points' => "Every connector, with no premium tier\nTables for state and Forms for intake\nConnections without a cap\nModel steps wherever you need them",
                    ],
                    [
                        'title' => 'Change management that scales',
                        'points' => "Diff a build like a pull request\nFailure alerts you can route\nRetry and timeout rules per step",
                    ],
                ],
                'accessTitle' => 'The whole toolkit, every tier',
                'access' => [
                    ['label' => 'Forms', 'icon' => 'pen', 'color' => '#e8631a'],
                    ['label' => 'Tables', 'icon' => 'layers', 'color' => '#2f7d59'],
                    ['label' => 'Runs', 'icon' => 'zap', 'color' => '#2563c7'],
                    ['label' => 'Canvas', 'icon' => 'palette', 'color' => '#7c3aed'],
                    ['label' => 'Agents', 'icon' => 'cpu', 'color' => '#e8631a'],
                    ['label' => 'SDK', 'icon' => 'code', 'color' => '#1f1d1b'],
                ],
            ])),
            TemplateContent::section('platform', 'platform.junction', array_merge(self::motion(40), [
                'heading' => 'The pieces, and how they fit',
                'description' => 'Every tier ships all three surfaces. What the tiers change is volume and how tightly you control who runs what.',
                'brand' => 'junction',
                'brandNote' => 'One runtime, three surfaces',
                'items' => [
                    ['title' => 'Junction Flows', 'text' => 'Assemble steps on a canvas, branch on live data, keep working state in Tables.', 'linkLabel' => 'Open Flows', 'linkUrl' => '/platform'],
                    ['title' => 'Junction Kit', 'text' => 'The same catalogue, callable from your own services in TypeScript or Python.', 'linkLabel' => 'Open Kit', 'linkUrl' => '/platform'],
                    ['title' => 'Junction Bridge', 'text' => 'Hand an assistant a scoped tool list and a spend ceiling. It reports back what it used.', 'linkLabel' => 'Open Bridge', 'linkUrl' => '/platform'],
                ],
                'stripTitle' => 'Models are yours to choose',
                'stripText' => 'Model calls draw down the same pool as everything else. No second meter, no surprise line item.',
            ])),
            TemplateContent::section('faq', 'faq.junction', array_merge(self::motion(40), [
                'heading' => 'Questions we get asked a lot',
                'groups' => [
                    [
                        'title' => 'Getting oriented',
                        'items' => [
                            ['question' => 'Is this going to need an engineer?', 'answer' => 'Not for most of it. Builds are assembled visually, and the code escape hatch is there for the day you want it.'],
                            ['question' => 'What counts as an app?', 'answer' => 'Anything with an API that we maintain a connector for. Around eight thousand of them, and we keep them current so you do not have to.'],
                            ['question' => 'What exactly is a build?', 'answer' => 'One automated path: something Junction watches for, the steps that follow, and the rules wrapped around them.'],
                            ['question' => 'How does a step get counted?', 'answer' => 'One step doing one unit of work. Everything draws from a single pool, whether it came from a build, an agent or your own code.'],
                            ['question' => 'What kicks a build off?', 'answer' => 'A new record, a clock, an inbound webhook, or a person pressing a button. Whichever fits the job.'],
                            ['question' => 'How do I size this without guessing?', 'answer' => 'Drag the slider above. Most teams land between two and ten thousand in month one, then grow into it.'],
                        ],
                    ],
                    [
                        'title' => 'Money questions',
                        'items' => [
                            ['question' => 'Crew or Enterprise — how do I tell?', 'answer' => 'Crew fits one department sharing ownership. Move to Enterprise when a wrong permission becomes an incident report.'],
                            ['question' => 'Where does the seat count stop mattering?', 'answer' => 'At Enterprise. Crew ships with 25 seats and you can add more whenever you need them.'],
                            ['question' => 'Can I try the paid parts first?', 'answer' => 'Fourteen days of everything, no card. If you need longer to get a real build live, ask and we will extend it.'],
                            ['question' => 'What if I pick the wrong tier?', 'answer' => 'Move in either direction whenever you like. Upgrades prorate to the day, downgrades take effect at renewal.'],
                            ['question' => 'Is anything off the list price?', 'answer' => 'Annual billing gives you two months back. Registered non-profits and pre-seed companies get half off, no negotiation needed.'],
                        ],
                    ],
                    [
                        'title' => 'When things go wrong',
                        'items' => [
                            ['question' => 'Will I get handed to a salesperson?', 'answer' => 'We do, and they are engineers first. Claim a session and you will leave with a plan, not a pitch.'],
                            ['question' => 'What happens when something breaks at 2am?', 'answer' => 'Crew gets priority email and chat during working hours. Enterprise gets a named engineer and a response window in writing.'],
                            ['question' => 'Which region holds my data?', 'answer' => 'Frankfurt, Virginia or Sydney. You choose per workspace on day one and it stays pinned there.'],
                        ],
                    ],
                ],
            ])),
        ], $footer, 'footer.junction', 'navbar.junction');
    }

    /**
     * @param  array<string, mixed>  $nav
     * @param  array<string, mixed>  $footer
     * @return array<string, mixed>
     */
    private static function solutions(array $nav, array $footer): array
    {
        return TemplateContent::sitePage('Solutions', 'solutions', false, $nav, [
            TemplateContent::section('hero', 'hero.junction', array_merge(self::motion(0, 'load'), [
                'textAlign' => 'left',
                'eyebrow' => 'For go-to-market teams',
                'heading' => 'Your revenue stack is already integrated.',
                'headingAccent' => 'It is just not automated.',
                'description' => 'Every tool your revenue team pays for already has an API. What is missing is the wiring between them, and somebody whose name is on it.',
                'buttonLabel' => 'Start building',
                'buttonUrl' => '/pricing',
                'secondaryLabel' => 'Claim a session',
                'secondaryUrl' => '/pricing',
                'note' => 'Wired up by 40,000+ revenue teams',
                'stats' => [
                    ['value' => '93%', 'label' => 'Ship campaigns sooner'],
                    ['value' => '27M', 'label' => 'Records kept in step'],
                    ['value' => '6 min', 'label' => 'Median time to first reply'],
                    ['value' => '11h', 'label' => 'Given back, per person'],
                ],
            ])),
            TemplateContent::section('cards', 'cards.junction', array_merge(self::motion(40), [
                'heading' => 'Where the handoffs quietly',
                'headingAccent' => 'cost you deals.',
                'description' => 'Every stage has a handoff. These are the three that quietly cost the most.',
                'columns' => 3,
                'items' => [
                    [
                        'eyebrow' => 'Capture',
                        'title' => 'Nobody sits in an unclaimed queue',
                        'text' => 'Enrich, score and assign the second a form lands, then nudge the owner somewhere they actually look.',
                        'image' => TemplateContent::photo('1552664730-d307ca884978', 900),
                        'tint' => '#eceaf6',
                    ],
                    [
                        'eyebrow' => 'Nurture',
                        'title' => 'Personalise without hiring a copywriter',
                        'text' => 'Draft variants from your own positioning, hold them for review, publish only what a person approved.',
                        'image' => TemplateContent::photo('1460925895917-afdab827c52f', 900),
                        'tint' => '#f4ece3',
                    ],
                    [
                        'eyebrow' => 'Report',
                        'title' => 'One number nobody disputes',
                        'text' => 'Typed rows land in the warehouse on a schedule, so the dashboard stops arguing with the CRM.',
                        'image' => TemplateContent::photo('1543286386-713bdd548da4', 900),
                        'tint' => '#e7eee8',
                    ],
                ],
                'buttonLabel' => 'Browse the build library',
                'buttonUrl' => '/integrations',
            ])),
            TemplateContent::section('session', 'split.junction', array_merge(self::motion(40), [
                'heading' => 'More campaigns, same headcount, fewer Sunday nights.',
                'description' => 'What used to need a contractor and a shared spreadsheet becomes one build with an owner. Then it simply runs.',
                'buttonLabel' => 'See where teams begin',
                'buttonUrl' => '/integrations',
                'image' => TemplateContent::photo('1522071820081-009f0129c71c', 1200),
                'reverse' => true,
            ])),
            TemplateContent::section('usecases', 'usecases.junction', array_merge(self::motion(40), [
                'heading' => 'Six places revenue teams start',
                'description' => '',
                'items' => [
                    ['title' => 'Routing that works at 2am', 'text' => 'Assign on territory, product interest and who has capacity, with a fallback so nothing goes stale.'],
                    ['title' => 'The check nobody remembers to do', 'text' => 'Links, tags and suppression lists get checked, and the send is blocked when something is wrong.'],
                    ['title' => 'Revenue that traces back', 'text' => 'Closed-won revenue finds its way back to the source campaign, so budget talks use facts.'],
                    ['title' => 'A warning before the renewal', 'text' => 'Product signal and support volume, read together, with a nudge before the renewal call.'],
                    ['title' => 'Partner intake that answers', 'text' => 'One form, one queue, one clock, and the partner hears back at every stage.'],
                    ['title' => 'Monday morning, already written', 'text' => 'The numbers assemble themselves overnight, so Monday opens with a conversation.'],
                ],
            ])),
            TemplateContent::section('proof', 'quote.junction', array_merge(self::motion(40), [
                'heading' => 'Teams that stopped filing tickets',
                'headingAccent' => 'and started shipping',
                'quote' => 'Eleven builds in the first month. Two replaced contractor work we had been paying for since 2023, and this time the whole team can read them.',
                'author' => 'Marcus Idowu',
                'role' => 'Head of Revenue Operations, Halcyon',
                'logoLabel' => 'HALCYON',
                'image' => TemplateContent::photo('1573497019940-1c28c88b4f3e', 1000),
                'stats' => [
                    ['value' => '11', 'label' => 'Builds in the first month'],
                    ['value' => '4.5x', 'label' => 'Faster first response'],
                ],
                'buttonLabel' => 'Read how they did it',
                'buttonUrl' => '/solutions',
            ])),
            TemplateContent::section('metrics', 'metrics.junction', array_merge(self::motion(40), [
                'heading' => 'Ninety days in,',
                'headingAccent' => 'here is the delta',
                'description' => 'Self-reported ninety days after the first build went live. Small sample, honest numbers.',
                'items' => [
                    ['value' => '93%', 'title' => 'Ship campaigns sooner', 'text' => 'The checks that used to eat the week before a send now take seconds.'],
                    ['value' => '27M', 'title' => 'Records kept in step', 'text' => 'Two-way syncs replaced the CSV exports nobody wanted to own.'],
                    ['value' => '6 min', 'title' => 'Median first response', 'text' => 'Down from a little over four hours.'],
                ],
            ])),
            TemplateContent::section('logos', 'logos.junction', array_merge(self::motion(40), [
                'heading' => 'Operations teams wiring their stack on Junction',
                'items' => [
                    ['label' => 'Northwind'],
                    ['label' => 'Meridian'],
                    ['label' => 'Halcyon'],
                    ['label' => 'Dropstone'],
                    ['label' => 'Aster'],
                    ['label' => 'Brine & Co'],
                    ['label' => 'Quillbank'],
                    ['label' => 'Vale Orbit'],
                ],
            ])),
            TemplateContent::section('cta', 'ctaband.junction', array_merge(self::motion(40), [
                'heading' => 'Bring one broken handoff. Leave with it fixed.',
                'description' => 'Ninety minutes, one real process, and a build you can switch on at the end.',
                'buttonLabel' => 'Claim a session',
                'buttonUrl' => '/pricing',
                'secondaryLabel' => 'Or just start building',
                'secondaryUrl' => '/pricing',
            ])),
        ], $footer, 'footer.junction', 'navbar.junction');
    }

    /**
     * @param  array<string, mixed>  $nav
     * @param  array<string, mixed>  $footer
     * @return array<string, mixed>
     */
    private static function integrations(array $nav, array $footer): array
    {
        return TemplateContent::sitePage('Integrations', 'integrations', false, $nav, [
            TemplateContent::section('hero', 'apphero.junction', array_merge(self::motion(0, 'load'), [
                'appName' => 'Ledgerly integrations',
                'appCategory' => 'ERP (Enterprise Resource Planning)',
                'appBadge' => 'Premium',
                'appIcon' => 'database',
                'heading' => 'Wire Ledgerly into everything that touches an invoice',
                'description' => 'Finance runs on handoffs. A deal closes over here, an invoice appears over there, and somebody reconciles the two on Friday afternoon. Junction removes the somebody.',
                'buttonLabel' => 'Connect Ledgerly',
                'buttonUrl' => '/pricing',
                'secondaryLabel' => 'Sign in with SSO',
                'secondaryUrl' => '/pricing',
                'chips' => [
                    ['label' => 'Build it without code'],
                    ['label' => 'Every change is logged'],
                    ['label' => 'SOC 2 and ISO 27001'],
                    ['label' => 'Syncs in both directions'],
                    ['label' => 'Free while you evaluate'],
                ],
                'searchPlaceholder' => 'Find an app…',
                'pairLabel' => 'Or start from the other side',
                'apps' => [
                    ['name' => 'Fluxdesk', 'category' => 'CRM (Customer Relationship Management)', 'icon' => 'users', 'color' => '#2f7d59'],
                    ['name' => 'Northmail', 'category' => 'Marketing Automation', 'icon' => 'mail', 'color' => '#e8631a'],
                    ['name' => 'Mailspring', 'category' => 'Marketing Automation', 'icon' => 'message', 'color' => '#f2b705'],
                    ['name' => 'Gridsheet', 'category' => 'Spreadsheets', 'icon' => 'layers', 'color' => '#2f7d59'],
                    ['name' => 'Cadence', 'category' => 'Drip Campaigns', 'icon' => 'zap', 'color' => '#2563c7'],
                    ['name' => 'Signalbox', 'category' => 'Project Management', 'icon' => 'target', 'color' => '#7c3aed'],
                    ['name' => 'Pipeline', 'category' => 'CRM (Customer Relationship Management)', 'icon' => 'chart', 'color' => '#2563c7'],
                    ['name' => 'Outreach', 'category' => 'Email, Calendar', 'icon' => 'briefcase', 'color' => '#1f6fb2'],
                    ['name' => 'Formworks', 'category' => 'Forms & Surveys', 'icon' => 'pen', 'color' => '#7c3aed'],
                ],
                'logoNote' => 'Finance teams running Ledgerly on Junction',
                'logos' => [
                    ['label' => 'Northwind'],
                    ['label' => 'Meridian'],
                    ['label' => 'Halcyon'],
                    ['label' => 'Dropstone'],
                    ['label' => 'Aster'],
                ],
            ])),
            TemplateContent::section('join', 'ctaband.junction', array_merge(self::motion(40), [
                'heading' => 'Your first connection takes about four minutes',
                'description' => '',
                'buttonLabel' => 'Wire it up',
                'buttonUrl' => '/pricing',
                'secondaryLabel' => 'Watch it done first',
                'secondaryUrl' => '/pricing',
            ])),
            TemplateContent::section('usecases', 'usecases.junction', array_merge(self::motion(40), [
                'heading' => 'Where Ledgerly usually leaks time',
                'description' => '',
                'items' => [
                    ['title' => 'The invoice that follows the deal', 'text' => 'A won deal becomes a draft invoice with the right terms already on it, before anyone opens a tab.'],
                    ['title' => 'Answers without the Slack message', 'text' => 'Payment status lands on the account record, so sales stops pinging finance for an update.'],
                    ['title' => 'Handoffs that do not need chasing', 'text' => 'The moment an approval clears, the next owner hears about it with the record attached.'],
                    ['title' => 'A month-end that starts finished', 'text' => 'The reconciliation pack assembles itself overnight and is waiting when the team logs on.'],
                    ['title' => 'Catch the rate that quietly moved', 'text' => 'Anything billed above the agreed rate gets held and flagged before a payment run touches it.'],
                    ['title' => 'Analytics that stays current', 'text' => 'Typed rows arrive in the warehouse on your schedule, not whenever somebody exports a CSV.'],
                ],
            ])),
            TemplateContent::section('workflows', 'workflows.junction', array_merge(self::motion(40), [
                'heading' => 'Start from a build that already works',
                'searchPlaceholder' => 'Which app should Ledgerly talk to?',
                'items' => [
                    ['title' => 'Open a Ledgerly account the moment Fluxdesk marks a deal won', 'pair' => 'Fluxdesk → Ledgerly', 'badge' => 'Premium'],
                    ['title' => 'Kick off a Cadence onboarding sequence when an invoice is issued', 'pair' => 'Ledgerly → Cadence', 'badge' => 'Premium'],
                    ['title' => 'Log billable hours in Ledgerly when a Signalbox task is closed', 'pair' => 'Signalbox → Ledgerly', 'badge' => ''],
                    ['title' => 'Mirror every Ledgerly entry into a Gridsheet the finance team already reads', 'pair' => 'Ledgerly → Gridsheet', 'badge' => ''],
                    ['title' => 'Trigger a Northmail receipt whenever a payment settles', 'pair' => 'Ledgerly → Northmail', 'badge' => ''],
                    ['title' => 'Flag the account in Pipeline when an invoice passes thirty days', 'pair' => 'Ledgerly → Pipeline', 'badge' => ''],
                ],
                'rowActionLabel' => 'Use this',
                'buttonLabel' => 'Show more',
                'buttonUrl' => '#',
            ])),
            TemplateContent::section('triggers', 'triggers.junction', array_merge(self::motion(40), [
                'heading' => 'What Junction can watch, and what it can do',
                'description' => 'A trigger is Junction noticing something. An action is Junction doing something. String together as many as the job needs.',
                'triggerTabLabel' => 'Triggers',
                'actionTabLabel' => 'Actions',
                'triggers' => [
                    ['title' => 'A new entry lands', 'text' => 'Runs the moment a fresh entry lands, on standard and custom objects alike.'],
                    ['title' => 'An entry changes', 'text' => 'Runs on creation or on any edit, with the changed fields handed to the next step.'],
                    ['title' => 'An import finishes', 'text' => 'Waits for a queued bulk import to finish, then reports what made it through.'],
                    ['title' => 'An entry is retired', 'text' => 'Runs when an entry is archived or deleted, so downstream systems can catch up.'],
                ],
                'actions' => [
                    ['title' => 'Look up an entry', 'text' => 'Search on any field and hand the match to whatever comes next.'],
                    ['title' => 'Attach a document', 'text' => 'Pin a document to the entry the build is currently holding.'],
                    ['title' => 'Create or amend an entry', 'text' => 'Write a new entry, or amend the existing one when a match turns up.'],
                    ['title' => 'Remove an attachment', 'text' => 'Detach a document from an entry without destroying the file itself.'],
                ],
                'buttonLabel' => 'Show more',
                'buttonUrl' => '#',
            ])),
            TemplateContent::section('developers', 'code.junction', array_merge(self::motion(40), [
                'eyebrow' => 'For engineers',
                'heading' => 'Give your agents a scoped key to Ledgerly',
                'description' => 'Your assistants get the same catalogue your people use, narrowed to what you approved, with every call logged under the agent name.',
                'leftTitle' => 'Ask for it in a sentence, through Bridge',
                'leftText' => 'Point a compatible assistant at your workspace. It sees the actions on your approved list and nothing beyond them.',
                'leftSample' => 'Draft the Northwind renewal on net-30, attach the signed order form, and show me exactly what you changed.',
                'leftMeta' => 'Any assistant that speaks the open tool protocol',
                'leftButtonLabel' => 'Set up Bridge',
                'leftButtonUrl' => '/platform',
                'rightTitle' => 'Or call the same thing from your own code',
                'rightText' => 'One package, the whole catalogue, fully typed. Same permissions, same audit trail, your runtime.',
                'code' => "npm install @junction/sdk\n\nimport { Junction } from \"@junction/sdk\"\n\nconst jn = new Junction({ key: process.env.JUNCTION_KEY })\n\nconst invoice = await jn.run(\"ledgerly.invoice.create\", {\n  account: \"northwind\",\n  terms: \"net-30\",\n  lines: [{ sku: \"seat\", qty: 42 }],\n})\n\nconsole.log(invoice.id)",
                'rightButtonLabel' => 'Read the Kit reference',
                'rightButtonUrl' => '/platform',
                'footnote' => 'Bridge and Kit ship on every paid tier and draw from the same volume pool as everything else.',
            ])),
            TemplateContent::section('steps', 'steps.junction', array_merge(self::motion(40), [
                'heading' => 'Five steps to your first Ledgerly build',
                'items' => [
                    ['title' => 'Authorise Ledgerly once'],
                    ['title' => 'Pick what Junction should watch for'],
                    ['title' => 'Say what should happen in Ledgerly'],
                    ['title' => 'Point the fields at each other'],
                    ['title' => 'Rehearse it, then let it run'],
                ],
            ])),
            TemplateContent::section('faq', 'faq.junction', array_merge(self::motion(40), [
                'heading' => 'Ledgerly questions, answered',
                'groups' => [
                    [
                        'title' => 'Working with Ledgerly',
                        'items' => [
                            ['question' => 'Does this cover our custom objects?', 'answer' => 'Yes. Standard objects, custom objects, line items and attachments all show up in the field picker.'],
                            ['question' => 'What stops it creating the same entry twice?', 'answer' => 'Use create-or-amend and nominate a match field. Junction looks first and only writes when it has to.'],
                            ['question' => 'Our field names are a mess. Will it cope?', 'answer' => 'It reads your schema on connect, so whatever you have named things, they appear as they are.'],
                            ['question' => 'It says permission denied. Where do I look?', 'answer' => 'Almost always the connected account lacks write access on that object. Grant it in Ledgerly, then reconnect.'],
                        ],
                    ],
                ],
            ])),
        ], $footer, 'footer.junction', 'navbar.junction');
    }
}
