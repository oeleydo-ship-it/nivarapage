<?php

namespace Database\Seeders;

class TemplateBrightline
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#3b82f6',
            'secondary' => '#0f172a',
            'accent' => '#16a34a',
            'background' => '#ffffff',
            'surface' => '#f8fafc',
            'text' => '#0f172a',
            'muted' => '#6b7280',
            'headingFont' => 'Inter, system-ui, sans-serif',
            'bodyFont' => 'Inter, system-ui, sans-serif',
            'headingWeight' => 700,
            'bodyWeight' => 400,
            'buttonRadius' => '8px',
            'cardRadius' => '16px',
            'containerWidth' => '1180px',
            'sectionSpacing' => '96px',
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $brand = 'Brightline';
        $nav = TemplateContent::nav($brand, [
            ['label' => 'Home', 'url' => '/'],
            ['label' => 'About', 'url' => '/about'],
            ['label' => 'Services', 'url' => '/services'],
            ['label' => 'Work', 'url' => '/#work'],
            ['label' => 'Blog', 'url' => '/blog'],
            ['label' => 'Contact', 'url' => '/contact'],
        ], [
            'logoIcon' => 'sparkles',
            'showMark' => true,
            'showBorder' => true,
            'sticky' => true,
            'tone' => 'default',
            'showThemeSwitch' => true,
            'showSecondary' => true,
            'secondaryLabel' => 'Sign in',
            'secondaryUrl' => '/contact',
            'showButton' => true,
            'buttonLabel' => 'Sign up',
            'buttonUrl' => '/contact',
            'buttonVariant' => 'primary',
            'textAlign' => 'center',
        ]);

        $footer = TemplateContent::footer($brand, [
            'tagline' => 'Ready to get started?',
            'buttonLabel' => 'Get started',
            'buttonUrl' => '/contact',
            'columns' => [
                ['title' => 'Support', 'links' => "Phone|+1 (555) 014 2200\nEmail|mailto:hello@brightline.example"],
                ['title' => 'Studio', 'links' => "About|/about\nServices|/services\nWork|/#work\nBlog|/blog\nContact|/contact"],
            ],
            'social' => [
                ['icon' => 'facebook', 'url' => '#'],
                ['icon' => 'twitter', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
            ],
            'legal' => [
                ['label' => 'About', 'url' => '/about'],
                ['label' => 'Services', 'url' => '/services'],
                ['label' => 'Work', 'url' => '/#work'],
                ['label' => 'Blog', 'url' => '/blog'],
                ['label' => 'Contact', 'url' => '/contact'],
            ],
            'showNewsletter' => true,
            'newsletterTitle' => 'Subscribe to the briefing',
            'newsletterText' => 'One short note each month on launches, type, and what actually converts.',
            'columnCount' => 2,
            'tone' => 'default',
            'showBorder' => true,
        ]);

        $heroPhoto = TemplateContent::photo('1573496359142-b8d87734a5a2', 1200);
        $phone = TemplateContent::photo('1512941937669-90a1b58e7e9c', 900);
        $office = TemplateContent::photo('1497366216548-37526070297c', 1200);

        $pageHero = [
            'headingSize' => 48,
            'bodySize' => 16,
            'paddingTop' => 72,
            'paddingBottom' => 56,
            'textAlign' => 'center',
        ];

        return [
            TemplateContent::sitePage('Home', 'home', true, $nav, [
                TemplateContent::section('hero', 'hero.split', [
                    'eyebrow' => 'Portfolio & blog',
                    'heading' => 'Launch a site that already looks like a product',
                    'description' => 'Brightline designs marketing pages teams can keep editing — clear type, honest spacing, and a homepage that does the talking.',
                    'buttonLabel' => 'Explore now',
                    'buttonUrl' => '/services',
                    'secondaryLabel' => '',
                    'image' => $heroPhoto,
                    'imageAlt' => 'Designer reviewing a marketing site',
                    'imageRatio' => 'portrait',
                    'headingSize' => 52,
                    'bodySize' => 16,
                    'highlights' => [
                        ['label' => 'Joined by 12,000+ marketers shipping on their own'],
                    ],
                ]),
                TemplateContent::section('stats', 'stats.row', [
                    'eyebrow' => '',
                    'heading' => '',
                    'description' => '',
                    'columns' => 3,
                    'tone' => 'default',
                    'textAlign' => 'center',
                    'showHints' => true,
                    'items' => [
                        ['icon' => 'star', 'value' => '4.9', 'label' => 'Launch score', 'hint' => 'Average client rating after the first ninety days live.'],
                        ['icon' => 'users', 'value' => '280', 'label' => 'Sites shipped', 'hint' => 'Marketing homepages, landing pages, and inner pages in production.'],
                        ['icon' => 'briefcase', 'value' => '18M+', 'label' => 'Visits hosted', 'hint' => 'Traffic across Brightline-built sites in the last twelve months.'],
                    ],
                ]),
                TemplateContent::section('apps', 'features.showcase', [
                    'eyebrow' => 'Product craft',
                    'eyebrowStyle' => 'pill',
                    'accentColor' => '#16a34a',
                    'heading' => 'Every block is a real page, not a locked mock',
                    'description' => 'Swap copy, photos, and theme tokens in the builder. What you preview is what goes live.',
                    'reverse' => true,
                    'image' => $phone,
                    'imageAlt' => 'Product interface on a phone',
                    'imageRatio' => 'portrait',
                    'stat' => '',
                    'statLabel' => '',
                    'buttonLabel' => '',
                    'headingSize' => 36,
                    'bodySize' => 16,
                    'items' => [
                        ['title' => 'Editable sections', 'text' => 'Headlines, buttons, images, and forms stay selectable on the canvas. Nothing is baked into a screenshot.'],
                        ['title' => 'Shared theme', 'text' => 'Inter, radii, and the blue you picked apply on every page — including the ones you add later.'],
                        ['title' => 'Publish when ready', 'text' => 'Drafts stay private. Visitors only see a change after you press Publish.'],
                    ],
                ]),
                TemplateContent::section('services', 'services.cards', [
                    'eyebrow' => 'our services',
                    'eyebrowStyle' => 'pill',
                    'accentColor' => '#16a34a',
                    'heading' => 'Services shaped around how companies actually launch',
                    'description' => 'Pick a sprint, not a bloated retainer. You keep the site when we leave.',
                    'textAlign' => 'center',
                    'headingSize' => 36,
                    'bodySize' => 16,
                    'showPrice' => false,
                    'showFeatures' => false,
                    'items' => [
                        ['title' => 'UX and product design', 'text' => 'Structure, flows, and a visual system that still looks considered on a phone.', 'icon' => 'palette', 'url' => '/contact', 'linkLabel' => 'Get started'],
                        ['title' => 'Marketing websites', 'text' => 'Homepage, inner pages, and forms wired so a marketer can edit without a ticket.', 'icon' => 'layers', 'url' => '/contact', 'linkLabel' => 'Get started'],
                        ['title' => 'Launch support', 'text' => 'Domain, redirects, and two weeks of live fixes after the first publish.', 'icon' => 'rocket', 'url' => '/contact', 'linkLabel' => 'Get started'],
                    ],
                ]),
                TemplateContent::section('work', 'gallery.masonry', [
                    'anchorId' => 'work',
                    'eyebrow' => 'selected work',
                    'eyebrowStyle' => 'pill',
                    'accentColor' => '#16a34a',
                    'heading' => 'Recent launches we still stand behind',
                    'description' => 'Homepages, product stories, and campaign pages — all still edited by the teams who own them.',
                    'textAlign' => 'center',
                    'headingSize' => 36,
                    'bodySize' => 16,
                    'columns' => 3,
                    'images' => [
                        ['src' => TemplateContent::photo('1460925895917-afdab827c52f'), 'caption' => 'Northwind — dashboard story'],
                        ['src' => TemplateContent::photo('1556761175-5973dc0f32e7'), 'caption' => 'Shoreline — clinic site'],
                        ['src' => TemplateContent::photo('1486312338219-ce68d2c6f44d'), 'caption' => 'Fieldnote — editor kit'],
                        ['src' => TemplateContent::photo('1521737604893-d14cc237f11d'), 'caption' => 'Cove — team page'],
                        ['src' => TemplateContent::photo('1551434678-e076c223a692'), 'caption' => 'Harbor — campaign'],
                    ],
                ]),
                TemplateContent::section('quote', 'testimonials.featured', [
                    'quote' => 'They treated the homepage like a product. We still change the copy ourselves, and it still looks designed.',
                    'name' => 'Amelia Chen',
                    'role' => 'Head of Growth, Northwind',
                    'rating' => 5,
                    'layout' => 'centered',
                    'tone' => 'default',
                    'stat' => '',
                    'statLabel' => '',
                    'avatar' => TemplateContent::photo('1494790108377-be9c29b29330', 200),
                    'headingSize' => 36,
                ]),
                TemplateContent::section('journal', 'posts.cards', [
                    'eyebrow' => 'from the desk',
                    'heading' => 'Latest notes',
                    'description' => '',
                    'headingSize' => 36,
                    'bodySize' => 16,
                    'buttonLabel' => 'View all',
                    'buttonUrl' => '/blog',
                    'items' => [
                        ['title' => 'Why your homepage should argue one thing', 'excerpt' => 'Most marketing sites bury the offer. Here is how we write a first screen that actually decides.', 'date' => 'Mar 12, 2026', 'tag' => 'Copy', 'image' => TemplateContent::photo('1486312338219-ce68d2c6f44d', 900), 'url' => '/blog'],
                        ['title' => 'Inter at 16px, on purpose', 'excerpt' => 'A type size is a product decision. We keep body copy at 16 and let headings do the drama.', 'date' => 'Feb 28, 2026', 'tag' => 'Design', 'image' => TemplateContent::photo('1522202176988-66273c2fd55f', 900), 'url' => '/blog'],
                        ['title' => 'Forms that get answered', 'excerpt' => 'Fewer fields, a real human on the other side, and a confirmation that is not a void.', 'date' => 'Feb 4, 2026', 'tag' => 'Product', 'image' => TemplateContent::photo('1551434678-e076c223a692', 900), 'url' => '/blog'],
                    ],
                ]),
                TemplateContent::section('contact', 'form.contact', [
                    'eyebrow' => 'Start a brief',
                    'heading' => 'Tell us about the launch',
                    'description' => 'Share the date, the pages that have to ship, and who will edit the site after we leave.',
                    'buttonLabel' => 'Send inquiry',
                    'layout' => 'split',
                    'tone' => 'surface',
                    'cardStyle' => true,
                    'headingSize' => 36,
                    'bodySize' => 16,
                    'details' => [
                        ['icon' => 'phone', 'label' => 'Phone', 'value' => '+1 (555) 014 2200', 'url' => 'tel:+15550142200'],
                        ['icon' => 'mail', 'label' => 'Email', 'value' => 'hello@brightline.example', 'url' => 'mailto:hello@brightline.example'],
                        ['icon' => 'map-pin', 'label' => 'Studio', 'value' => '120 Market Street, Austin'],
                    ],
                    'bullets' => '',
                ]),
            ], $footer, 'footer.multi_column'),

            TemplateContent::sitePage('About', 'about', false, $nav, [
                TemplateContent::section('hero', 'hero.page', array_merge($pageHero, [
                    'heading' => 'About us',
                    'description' => 'A small studio that still designs every homepage. We ship marketing sites companies can keep honest after launch.',
                    'breadcrumb' => 'Home / About',
                ])),
                TemplateContent::section('stats', 'stats.row', [
                    'eyebrow' => '',
                    'heading' => '',
                    'description' => '',
                    'columns' => 3,
                    'tone' => 'default',
                    'textAlign' => 'center',
                    'showHints' => true,
                    'items' => [
                        ['icon' => 'star', 'value' => '4.86', 'label' => 'Review average', 'hint' => 'From the last eighty launches, scored thirty days after go-live.'],
                        ['icon' => 'users', 'value' => '364', 'label' => 'People trained', 'hint' => 'Editors who now change pages without waiting on a developer.'],
                        ['icon' => 'briefcase', 'value' => '45M+', 'label' => 'Sessions served', 'hint' => 'Across Brightline sites in the last rolling year.'],
                    ],
                ]),
                TemplateContent::section('skills', 'content.skills', [
                    'eyebrow' => 'build everything',
                    'eyebrowStyle' => 'pill',
                    'accentColor' => '#16a34a',
                    'heading' => 'Build landing pages that still look considered at 2x',
                    'description' => 'We pair research with a visual system you can actually keep. The bars are a snapshot of how we spend a typical sprint.',
                    'headingSize' => 36,
                    'bodySize' => 16,
                    'image' => $phone,
                    'imageAlt' => 'Payment flow on a phone',
                    'imageRatio' => 'portrait',
                    'reverse' => false,
                    'items' => [
                        ['label' => 'UX research and testing', 'percent' => 95],
                        ['label' => 'Product management', 'percent' => 84],
                        ['label' => 'UI and visual design', 'percent' => 90],
                    ],
                ]),
            ], $footer, 'footer.multi_column'),

            TemplateContent::sitePage('Services', 'services', false, $nav, [
                TemplateContent::section('hero', 'hero.page', array_merge($pageHero, [
                    'heading' => 'Services',
                    'description' => 'Sprints with a named team, a private preview, and a site your marketers can edit on Monday.',
                    'breadcrumb' => 'Home / Services',
                ])),
                TemplateContent::section('grid', 'services.cards', [
                    'eyebrow' => 'our services',
                    'eyebrowStyle' => 'pill',
                    'accentColor' => '#16a34a',
                    'heading' => 'Work designed around the pages you have to ship',
                    'description' => 'Every engagement includes a theme, forms, and a handoff — not a locked Figma file.',
                    'textAlign' => 'center',
                    'headingSize' => 36,
                    'bodySize' => 16,
                    'showPrice' => false,
                    'showFeatures' => false,
                    'items' => [
                        ['title' => 'UX and product design', 'text' => 'Information architecture, flows, and a component set that survives the second campaign.', 'icon' => 'palette', 'url' => '/contact', 'linkLabel' => 'Get started'],
                        ['title' => 'Website sprints', 'text' => 'Homepage plus inner pages, built in the builder so you never inherit a screenshot.', 'icon' => 'layers', 'url' => '/contact', 'linkLabel' => 'Get started'],
                        ['title' => 'Content and launch', 'text' => 'Copy, photography direction, domain, and two weeks of live support after publish.', 'icon' => 'rocket', 'url' => '/contact', 'linkLabel' => 'Get started'],
                    ],
                ]),
            ], $footer, 'footer.multi_column'),

            TemplateContent::sitePage('Blog', 'blog', false, $nav, [
                TemplateContent::section('hero', 'hero.page', array_merge($pageHero, [
                    'heading' => 'Blog',
                    'description' => 'Short notes from the studio on launching, type, and keeping a marketing site honest.',
                    'breadcrumb' => 'Home / Blog',
                ])),
                TemplateContent::section('posts', 'posts.cards', [
                    'eyebrow' => '',
                    'heading' => '',
                    'description' => '',
                    'buttonLabel' => '',
                    'useSitePosts' => true,
                    'items' => [
                        ['title' => 'Why your homepage should argue one thing', 'excerpt' => 'Most marketing sites bury the offer. Write the first screen as a decision, not a tour.', 'date' => 'Mar 12, 2026', 'tag' => 'Copy', 'image' => TemplateContent::photo('1486312338219-ce68d2c6f44d', 900), 'url' => '/blog'],
                        ['title' => 'Inter at 16px, on purpose', 'excerpt' => 'Body copy stays 16. Headlines do the scale. That is how Brightline templates stay readable.', 'date' => 'Feb 28, 2026', 'tag' => 'Design', 'image' => TemplateContent::photo('1522202176988-66273c2fd55f', 900), 'url' => '/blog'],
                        ['title' => 'Forms that get answered', 'excerpt' => 'Ask for less. Confirm like a person. Then actually reply.', 'date' => 'Feb 4, 2026', 'tag' => 'Product', 'image' => TemplateContent::photo('1551434678-e076c223a692', 900), 'url' => '/blog'],
                    ],
                ]),
            ], $footer, 'footer.multi_column'),

            TemplateContent::sitePage('Contact', 'contact', false, $nav, [
                TemplateContent::section('hero', 'hero.page', array_merge($pageHero, [
                    'heading' => 'Contact us',
                    'description' => 'A brief, a date, and who will own the site after launch. We reply within one business day.',
                    'breadcrumb' => 'Home / Contact',
                ])),
                TemplateContent::section('channels', 'features.cards', [
                    'eyebrow' => '',
                    'heading' => '',
                    'description' => '',
                    'columns' => 2,
                    'iconStyle' => 'tint',
                    'roundIcons' => true,
                    'cardStyle' => 'outline',
                    'items' => [
                        ['title' => 'Email us', 'text' => 'Project questions, new briefs, and anything that is not a calendar hold.', 'icon' => 'mail', 'url' => 'mailto:hello@brightline.example', 'linkLabel' => 'Leave a message'],
                        ['title' => 'Careers', 'text' => 'We hire slowly. If you design or write for a living, send a short note.', 'icon' => 'heart', 'url' => 'mailto:jobs@brightline.example', 'linkLabel' => 'Send an application'],
                    ],
                ]),
                TemplateContent::section('map', 'content.map', [
                    'heading' => '',
                    'description' => '',
                    'height' => 280,
                ]),
                TemplateContent::section('book', 'form.appointment', [
                    'heading' => 'Book a working session',
                    'description' => 'Thirty minutes. Bring the pages that have to ship first.',
                    'buttonLabel' => 'Make an appointment',
                    'layout' => 'split',
                    'reverse' => true,
                    'tone' => 'default',
                    'cardStyle' => false,
                    'headingSize' => 32,
                    'bodySize' => 16,
                    'image' => $office,
                    'details' => [],
                ]),
                TemplateContent::section('offices', 'content.locations', [
                    'tone' => 'surface',
                    'items' => [
                        [
                            'name' => 'Austin studio',
                            'address' => '120 Market Street, Suite 4, Austin, TX 78701',
                            'email' => 'hello@brightline.example',
                            'phone' => '+1 (555) 014 2200',
                        ],
                        [
                            'name' => 'San Francisco desk',
                            'address' => '88 Folsom Street, Floor 6, San Francisco, CA 94105',
                            'email' => 'west@brightline.example',
                            'phone' => '+1 (555) 014 2288',
                        ],
                    ],
                ]),
            ], $footer, 'footer.multi_column'),
        ];
    }
}
