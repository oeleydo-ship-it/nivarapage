<?php

namespace Database\Seeders;

class TemplateConsulting
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#1e3a5f',
            'secondary' => '#0f2744',
            'accent' => '#c4a574',
            'background' => '#f8f6f1',
            'surface' => '#efece4',
            'text' => '#0f2744',
            'muted' => '#5c6b7a',
            'headingFont' => 'Newsreader, Georgia, serif',
            'bodyFont' => 'IBM Plex Sans, system-ui, sans-serif',
            'headingWeight' => 600,
            'bodyWeight' => 400,
            'buttonRadius' => '2px',
            'cardRadius' => '6px',
            'containerWidth' => '1080px',
            'sectionSpacing' => '92px',
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $brand = 'Meridian';
        $nav = TemplateContent::nav($brand, [
            ['label' => 'Practice', 'url' => '/practice'],
            ['label' => 'Insights', 'url' => '/insights'],
            ['label' => 'Firm', 'url' => '/about'],
            ['label' => 'Contact', 'url' => '/contact'],
        ], [
            'logoIcon' => 'briefcase',
            'showButton' => true,
            'buttonLabel' => 'Talk to a partner',
            'buttonUrl' => '/contact',
        ]);
        $footer = TemplateContent::footer($brand, [
            'tagline' => 'Strategy for operators who still make the product.',
            'columns' => [
                ['title' => 'Firm', 'links' => "Practice|/practice\nInsights|/insights\nAbout|/about\nContact|/contact"],
                ['title' => 'Offices', 'links' => "Portland · Chicago"],
            ],
            'social' => [
                ['icon' => 'linkedin', 'url' => '#'],
            ],
            'tone' => 'dark',
        ]);

        $skyline = TemplateContent::photo('1486406146926-c627a92ad1ab');
        $meeting = TemplateContent::photo('1556761175-4b46a572b786');
        $charts = TemplateContent::photo('1454165804606-c3d57bc86b40');
        $handshake = TemplateContent::photo('1521791136064-7986c2920216');
        $amelia = TemplateContent::photo('1494790108377-be9c29b29330', 600);
        $jonah = TemplateContent::photo('1472099645785-5658abf4ff4e', 600);
        $maya = TemplateContent::photo('1544005313-94ddf0286df2', 600);

        return [
            TemplateContent::sitePage('Home', 'home', true, $nav, [
                TemplateContent::section('hero', 'hero.centered', [
                    'eyebrow' => 'Management consulting',
                    'heading' => 'Clarity for companies that have outgrown the hallway plan',
                    'description' => 'Meridian works with operators on pricing, org design, and the one initiative that actually has to ship this year.',
                    'buttonLabel' => 'Talk to a partner',
                    'buttonUrl' => '/contact',
                    'secondaryLabel' => 'Our practice',
                    'secondaryUrl' => '/practice',
                    'headingSize' => 52,
                    'showTrust' => true,
                    'trustText' => 'Operator-led · 12-week engagements · no 200-page decks',
                ]),
                TemplateContent::section('stats', 'stats.highlight', [
                    'eyebrow' => 'Outcomes',
                    'heading' => 'Work that shows up in the P&L',
                    'featuredValue' => '19%',
                    'featuredLabel' => 'median margin lift on pricing work',
                    'buttonLabel' => 'See the practice',
                    'buttonUrl' => '/practice',
                    'tone' => 'dark',
                    'items' => [
                        ['value' => '40', 'label' => 'Active clients'],
                        ['value' => '12 wks', 'label' => 'Typical engagement'],
                        ['value' => '2', 'label' => 'Offices'],
                    ],
                ]),
                TemplateContent::section('practice', 'features.cards', [
                    'eyebrow' => 'Where we help',
                    'heading' => 'Three practices',
                    'textAlign' => 'center',
                    'items' => [
                        ['title' => 'Pricing & offer', 'text' => 'What to charge, what to cut, and a sales story that matches the product.', 'icon' => 'chart'],
                        ['title' => 'Operating model', 'text' => 'Who decides, who owns the number, and a meeting load that is not theatre.', 'icon' => 'users'],
                        ['title' => 'Growth systems', 'text' => 'Pipeline, partners, and the first hire that is not a guess.', 'icon' => 'trending-up'],
                    ],
                ]),
                TemplateContent::section('process', 'process.timeline', [
                    'heading' => 'A twelve-week arc',
                    'items' => [
                        ['date' => 'Weeks 1–2', 'title' => 'Diagnose', 'text' => 'Numbers, interviews, and the one constraint that is actually binding.'],
                        ['date' => 'Weeks 3–8', 'title' => 'Decide & design', 'text' => 'Options with owners. We sit in the meetings until the choice is real.'],
                        ['date' => 'Weeks 9–12', 'title' => 'Install', 'text' => 'Cadence, dashboards, and a handoff that does not need us in the room.'],
                    ],
                ]),
                TemplateContent::section('quotes', 'testimonials.featured', [
                    'quote' => 'They declined a second workstream because it would have been theatre. That is why we hired them.',
                    'name' => 'Sam Okonkwo',
                    'role' => 'CEO, Lumen Hardware',
                    'rating' => 5,
                    'stat' => '12 wks',
                    'statLabel' => 'to a pricing system',
                    'tone' => 'surface',
                ]),
                TemplateContent::section('cta', 'cta.simple', [
                    'heading' => 'If the problem is real, we will take the call',
                    'description' => 'Partners screen inquiries. If we are not a fit, we will say so in the first conversation.',
                    'buttonLabel' => 'Talk to a partner',
                    'buttonUrl' => '/contact',
                    'tone' => 'primary',
                    'headingSize' => 40,
                ]),
            ], $footer),
            TemplateContent::sitePage('Practice', 'practice', false, $nav, [
                TemplateContent::section('hero', 'hero.image', [
                    'eyebrow' => 'Engagements',
                    'heading' => 'The practice',
                    'description' => 'Fixed-scope work with a partner on the account — not a junior army.',
                    'image' => $meeting,
                    'headingSize' => 48,
                    'buttonLabel' => 'Start a conversation',
                    'buttonUrl' => '/contact',
                    'secondaryLabel' => '',
                ]),
                TemplateContent::section('list', 'services.cards', [
                    'showPrice' => true,
                    'showFeatures' => true,
                    'items' => [
                        ['title' => 'Pricing sprint', 'text' => 'Offer architecture, packaging, and a rollout the sales team will actually use.', 'icon' => 'chart', 'price' => '12 weeks', 'features' => "Partner-led\nWorkshops with sales\nInstall in CRM"],
                        ['title' => 'Operating model', 'text' => 'Roles, cadence, and the meetings you can delete.', 'icon' => 'users', 'price' => '10–14 weeks', 'features' => "Org design\nDecision rights\nLeadership offsite"],
                        ['title' => 'Growth system', 'text' => 'Pipeline math, channel bets, and the first specialist hire.', 'icon' => 'rocket', 'price' => '12 weeks', 'features' => "Funnel diagnostic\nHire profiles\n90-day plan"],
                    ],
                ]),
            ], $footer),
            TemplateContent::sitePage('Insights', 'insights', false, $nav, [
                TemplateContent::section('hero', 'hero.centered', [
                    'eyebrow' => 'Writing',
                    'heading' => 'Insights',
                    'description' => 'Short notes for operators. No newsletter bait.',
                    'showTrust' => false,
                    'headingSize' => 48,
                    'buttonLabel' => '',
                    'secondaryLabel' => '',
                ]),
                TemplateContent::section('posts', 'posts.cards', [
                    'heading' => 'From the partners',
                    'buttonLabel' => '',
                    'items' => [
                        ['title' => 'Stop adding a SKU to hide a pricing problem', 'excerpt' => 'Most “good/better/best” grids are a delay tactic. Here is the test we use in week two.', 'date' => 'May 18, 2026', 'tag' => 'Pricing', 'image' => $charts],
                        ['title' => 'The meeting that should not exist', 'excerpt' => 'If nobody can name the decision, cancel it. A cadence for companies over forty people.', 'date' => 'Apr 2, 2026', 'tag' => 'Operating model', 'image' => $meeting],
                        ['title' => 'Hire the specialist before the VP', 'excerpt' => 'Why the first growth hire is rarely a head of anything.', 'date' => 'Mar 9, 2026', 'tag' => 'Growth', 'image' => $handshake],
                    ],
                ]),
            ], $footer),
            TemplateContent::sitePage('About', 'about', false, $nav, [
                TemplateContent::section('story', 'content.image_text', [
                    'eyebrow' => 'The firm',
                    'heading' => 'Partners who used to run the thing',
                    'body' => 'Meridian is fourteen people. We take fewer clients than the pipeline would allow so the partner who sold the work is still in the room in week twelve.',
                    'image' => $skyline,
                    'bullets' => "Portland and Chicago\nNo subcontracted analysis\nWe decline theatre projects",
                    'headingSize' => 40,
                ]),
                TemplateContent::section('people', 'team.cards', [
                    'heading' => 'Partners',
                    'columns' => 3,
                    'items' => [
                        ['name' => 'Amelia Chen', 'role' => 'Pricing', 'bio' => 'Former VP product. Still sits in sales reviews.', 'image' => $amelia],
                        ['name' => 'Jonah Patel', 'role' => 'Operating model', 'bio' => 'Built two orgs past 200 people. Allergic to status meetings.', 'image' => $jonah],
                        ['name' => 'Maya Ortiz', 'role' => 'Growth', 'bio' => 'Ran a pipeline that actually matched the board deck.', 'image' => $maya],
                    ],
                ]),
            ], $footer),
            TemplateContent::sitePage('Contact', 'contact', false, $nav, [
                TemplateContent::section('hero', 'hero.centered', [
                    'eyebrow' => 'New work',
                    'heading' => 'Talk to a partner',
                    'description' => 'A short note on the problem, the timeline, and who owns it internally.',
                    'showTrust' => false,
                    'headingSize' => 44,
                    'buttonLabel' => '',
                    'secondaryLabel' => '',
                ]),
                TemplateContent::section('form', 'form.lead', [
                    'heading' => 'Start a conversation',
                    'buttonLabel' => 'Send to a partner',
                    'layout' => 'split',
                    'details' => [
                        ['icon' => 'mail', 'label' => 'Inquiries', 'value' => 'partners@meridian.example'],
                        ['icon' => 'map-pin', 'label' => 'Portland', 'value' => 'By appointment'],
                        ['icon' => 'briefcase', 'label' => 'Chicago', 'value' => 'Loop office'],
                    ],
                ]),
            ], $footer),
        ];
    }
}
