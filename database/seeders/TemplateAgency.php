<?php

namespace Database\Seeders;

class TemplateAgency
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#e11d48',
            'secondary' => '#0b1220',
            'accent' => '#fb7185',
            'background' => '#f7f4ef',
            'surface' => '#efe8dc',
            'text' => '#0b1220',
            'muted' => '#5c6474',
            'headingFont' => 'Syne, system-ui, sans-serif',
            'bodyFont' => 'DM Sans, system-ui, sans-serif',
            'headingWeight' => 700,
            'bodyWeight' => 400,
            'buttonRadius' => '999px',
            'cardRadius' => '18px',
            'containerWidth' => '1140px',
            'sectionSpacing' => '88px',
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $brand = 'Lumen';
        $nav = TemplateContent::nav($brand, [
            ['label' => 'Work', 'url' => '/work'],
            ['label' => 'Services', 'url' => '/services'],
            ['label' => 'Studio', 'url' => '/about'],
            ['label' => 'Contact', 'url' => '/contact'],
        ], [
            'logoIcon' => 'sparkles',
            'showButton' => true,
            'buttonLabel' => 'Start a brief',
            'buttonUrl' => '/contact',
            'sticky' => true,
        ]);
        $footer = TemplateContent::footer($brand, [
            'tagline' => 'Brand, web, and campaigns for companies that still want to look like themselves.',
            'columns' => [
                ['title' => 'Studio', 'links' => "Work|/work\nServices|/services\nAbout|/about\nContact|/contact"],
                ['title' => 'Visit', 'links' => "12 Market Row\nTue–Fri 10–6"],
            ],
            'social' => [
                ['icon' => 'instagram', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
            ],
            'tone' => 'dark',
        ]);

        $desk = TemplateContent::photo('1542744173-8e7e53415bb0');
        $team = TemplateContent::photo('1522071820081-009f0129c71c');
        $work = TemplateContent::photo('1497366216548-37526070297c');
        $amelia = TemplateContent::photo('1494790108377-be9c29b29330', 600);
        $jonah = TemplateContent::photo('1500648767791-00dcc994a43e', 600);
        $maya = TemplateContent::photo('1438761681033-6461ffad8d80', 600);
        $chris = TemplateContent::photo('1472099645785-5658abf4ff4e', 600);

        return [
            TemplateContent::sitePage('Home', 'home', true, $nav, [
                TemplateContent::section('hero', 'hero.split', [
                    'eyebrow' => 'Independent studio · est. 2014',
                    'heading' => 'Sites and brands that still have a point of view',
                    'description' => 'Lumen ships homepages, campaigns, and identity systems for teams who are tired of looking like their competitors.',
                    'buttonLabel' => 'See the work',
                    'buttonUrl' => '/work',
                    'secondaryLabel' => 'Start a brief',
                    'secondaryUrl' => '/contact',
                    'image' => $desk,
                    'imageAlt' => 'Studio workshop',
                    'headingSize' => 56,
                    'bodySize' => 18,
                    'highlights' => [
                        ['label' => 'Brand & web'],
                        ['label' => 'Eight-week sprints'],
                        ['label' => 'One team, no handoff'],
                    ],
                ]),
                TemplateContent::section('proof', 'proof.bar', [
                    'heading' => 'Recent clients',
                    'paddingTop' => 28,
                    'paddingBottom' => 8,
                    'logos' => [
                        ['label' => 'Northwind'],
                        ['label' => 'Haven'],
                        ['label' => 'Fieldstone'],
                        ['label' => 'Cedar'],
                    ],
                    'items' => [
                        ['value' => '40+', 'label' => 'Launches'],
                        ['value' => '8 wks', 'label' => 'Typical sprint'],
                    ],
                ]),
                TemplateContent::section('services', 'features.cards', [
                    'eyebrow' => 'What we make',
                    'heading' => 'Three practices, one studio',
                    'description' => 'You work with the same people from first sketch to domain.',
                    'textAlign' => 'center',
                    'headingSize' => 40,
                    'items' => [
                        ['title' => 'Brand systems', 'text' => 'Name, type, color, and a voice you can actually use next quarter.', 'icon' => 'palette'],
                        ['title' => 'Websites', 'text' => 'A homepage and inner pages that editors can change without a ticket.', 'icon' => 'layers'],
                        ['title' => 'Campaigns', 'text' => 'Landing pages and kits for the launch, not a 90-page deck.', 'icon' => 'zap'],
                    ],
                ]),
                TemplateContent::section('process', 'process.steps', [
                    'eyebrow' => 'How it runs',
                    'heading' => 'Four weeks to a private preview',
                    'textAlign' => 'center',
                    'columns' => 4,
                    'items' => [
                        ['title' => 'Brief', 'text' => 'Audience, offer, and the pages that have to ship first.', 'icon' => 'search'],
                        ['title' => 'Direction', 'text' => 'Two visual routes. You pick one. We do not present twelve.', 'icon' => 'palette'],
                        ['title' => 'Build', 'text' => 'Copy, forms, and a theme you can keep editing.', 'icon' => 'layers'],
                        ['title' => 'Launch', 'text' => 'Domain, redirects, and two weeks of live support.', 'icon' => 'rocket'],
                    ],
                ]),
                TemplateContent::section('work', 'gallery.grid', [
                    'eyebrow' => 'Selected',
                    'heading' => 'Recent launches',
                    'columns' => 3,
                    'images' => [
                        ['src' => $work, 'caption' => 'Haven — listings site'],
                        ['src' => TemplateContent::photo('1600585154340-be6161a56a0c'), 'caption' => 'Ridge — project gallery'],
                        ['src' => TemplateContent::photo('1414235077428-338989a2e8c0'), 'caption' => 'Harbor Table — menu'],
                    ],
                ]),
                TemplateContent::section('quotes', 'testimonials.featured', [
                    'quote' => 'They treated the site like a product, not a brochure. We still edit it ourselves.',
                    'name' => 'Priya Shah',
                    'role' => 'Founder, Shoreline',
                    'rating' => 5,
                    'stat' => '3×',
                    'statLabel' => 'inbound briefs',
                    'tone' => 'dark',
                ]),
                TemplateContent::section('cta', 'cta.simple', [
                    'heading' => 'Got a launch date?',
                    'description' => 'Send the brief. We reply within two business days with a scoped sprint — or a no.',
                    'buttonLabel' => 'Start a brief',
                    'buttonUrl' => '/contact',
                    'secondaryLabel' => 'See services',
                    'secondaryUrl' => '/services',
                    'headingSize' => 40,
                    'tone' => 'primary',
                ]),
            ], $footer),
            TemplateContent::sitePage('Work', 'work', false, $nav, [
                TemplateContent::section('hero', 'hero.centered', [
                    'eyebrow' => 'Archive',
                    'heading' => 'Selected work',
                    'description' => 'Brand systems and sites we still stand behind.',
                    'showTrust' => false,
                    'headingSize' => 52,
                    'buttonLabel' => '',
                    'secondaryLabel' => '',
                ]),
                TemplateContent::section('gallery', 'gallery.masonry', [
                    'heading' => 'Launches',
                    'images' => [
                        ['src' => $work, 'caption' => 'Haven Realty'],
                        ['src' => $desk, 'caption' => 'Meridian workshop'],
                        ['src' => TemplateContent::photo('1600607687939-ce8a6c25118c'), 'caption' => 'Northframe studio'],
                        ['src' => TemplateContent::photo('1504307651254-35680f356dfd'), 'caption' => 'Ridge & Beam'],
                        ['src' => TemplateContent::photo('1414235077428-338989a2e8c0'), 'caption' => 'Harbor Table'],
                        ['src' => TemplateContent::photo('1585747860715-2ba37e788b70'), 'caption' => 'Iron & Oak'],
                    ],
                ]),
            ], $footer),
            TemplateContent::sitePage('Services', 'services', false, $nav, [
                TemplateContent::section('hero', 'hero.centered', [
                    'eyebrow' => 'Engagements',
                    'heading' => 'Sprints, not retainers by default',
                    'description' => 'A named team, a date, and a private preview link.',
                    'showTrust' => false,
                    'headingSize' => 44,
                    'buttonLabel' => '',
                    'secondaryLabel' => '',
                ]),
                TemplateContent::section('list', 'services.cards', [
                    'showPrice' => true,
                    'showFeatures' => true,
                    'heading' => 'Ways in',
                    'items' => [
                        ['title' => 'Brand sprint', 'text' => 'Name, type, color, and a one-page voice guide.', 'icon' => 'palette', 'price' => 'from $18k', 'features' => "Two routes\nGuidelines\nLaunch kit"],
                        ['title' => 'Website sprint', 'text' => 'Homepage plus four inner pages, forms, and a theme.', 'icon' => 'layers', 'price' => 'from $24k', 'features' => "8 weeks\nCMS training\nGo-live support"],
                        ['title' => 'Campaign kit', 'text' => 'A landing page and assets for one launch.', 'icon' => 'zap', 'price' => 'from $9k', 'features' => "Copy + design\nVariants\nHandoff Figma"],
                    ],
                ]),
                TemplateContent::section('faq', 'faq.two_column', [
                    'heading' => 'Before we start',
                    'items' => [
                        ['question' => 'Do you take retainers?', 'answer' => 'After a sprint, yes — monthly hours for new pages and campaigns. We will not invent busywork.'],
                        ['question' => 'Who writes the copy?', 'answer' => 'We draft in your voice. You sign off. If you have a writer, we work with them from week one.'],
                        ['question' => 'What do we need to start?', 'answer' => 'A brief, brand files if they exist, and someone who can approve on Thursdays.'],
                    ],
                ]),
            ], $footer),
            TemplateContent::sitePage('About', 'about', false, $nav, [
                TemplateContent::section('story', 'content.image_text', [
                    'eyebrow' => 'The studio',
                    'heading' => 'Twelve people, one floor',
                    'body' => 'Lumen started as two designers in a borrowed conference room. We still take fewer clients than the calendar would allow.',
                    'image' => $team,
                    'bullets' => "Partners in the room\nNo offshore production queue\nWork we will put our names on",
                    'headingSize' => 40,
                ]),
                TemplateContent::section('people', 'team.cards', [
                    'heading' => 'The people on your project',
                    'columns' => 4,
                    'items' => [
                        ['name' => 'Amelia Chen', 'role' => 'Design lead', 'bio' => 'Still reviews every homepage.', 'image' => $amelia],
                        ['name' => 'Jonah Patel', 'role' => 'Web', 'bio' => 'Forms, domains, and the boring parts done right.', 'image' => $jonah],
                        ['name' => 'Maya Ortiz', 'role' => 'Strategy', 'bio' => 'Keeps the brief honest when the deck gets cute.', 'image' => $maya],
                        ['name' => 'Chris Hale', 'role' => 'Producer', 'bio' => 'Dates, budgets, and nobody surprised in week seven.', 'image' => $chris],
                    ],
                ]),
            ], $footer),
            TemplateContent::sitePage('Contact', 'contact', false, $nav, [
                TemplateContent::section('hero', 'hero.centered', [
                    'eyebrow' => 'New work',
                    'heading' => 'Send the brief',
                    'description' => 'Dates, budget range, and what has to ship. We reply within two business days.',
                    'showTrust' => false,
                    'headingSize' => 44,
                    'buttonLabel' => '',
                    'secondaryLabel' => '',
                ]),
                TemplateContent::section('form', 'form.lead', [
                    'heading' => 'Start a conversation',
                    'buttonLabel' => 'Send the brief',
                    'layout' => 'split',
                    'details' => [
                        ['icon' => 'mail', 'label' => 'Studio', 'value' => 'hello@lumen.example'],
                        ['icon' => 'map-pin', 'label' => 'Studio', 'value' => '12 Market Row'],
                        ['icon' => 'clock', 'label' => 'Hours', 'value' => 'Tue–Fri 10:00–18:00'],
                    ],
                ]),
            ], $footer),
        ];
    }
}
