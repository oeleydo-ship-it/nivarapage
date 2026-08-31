<?php

namespace Database\Seeders;

class TemplateInkline
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#8b5cf6',
            'secondary' => '#0b0618',
            'accent' => '#c084fc',
            'background' => '#050014',
            'surface' => '#0e0824',
            'text' => '#ffffff',
            'muted' => '#9ca3c7',
            'headingFont' => 'Inter, system-ui, sans-serif',
            'bodyFont' => 'Inter, system-ui, sans-serif',
            'headingWeight' => 700,
            'bodyWeight' => 400,
            'buttonRadius' => '12px',
            'cardRadius' => '16px',
            'containerWidth' => '1180px',
            'sectionSpacing' => '96px',
            'surfacePattern' => 'lines',
            'defaultScheme' => 'dark',
            'lightBackground' => '#ffffff',
            'lightSurface' => '#f6f3ff',
            'lightText' => '#0f172a',
            'lightMuted' => '#64748b',
            'lightSecondary' => '#eef2ff',
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $brand = 'Inkline';
        $blurb = 'Inkline is the writing room for product teams: one brand voice, a review queue that actually closes, and drafts that survive the next launch.';
        $nav = TemplateContent::nav($brand, [
            ['label' => 'Home', 'url' => '/'],
            ['label' => 'About', 'url' => '/about'],
            ['label' => 'Pricing', 'url' => '/pricing'],
            ['label' => 'Journal', 'url' => '/blog'],
            ['label' => 'Contact', 'url' => '/contact'],
        ], [
            'logoIcon' => 'sparkles',
            'showMark' => true,
            'textAlign' => 'center',
            'showButton' => true,
            'buttonLabel' => 'Start a workspace',
            'buttonUrl' => '/pricing',
            'buttonVariant' => 'primary',
            'showSecondary' => true,
            'secondaryLabel' => 'Sign in',
            'secondaryUrl' => '/contact',
            'showThemeSwitch' => true,
            'sticky' => true,
            'shadow' => false,
            'showBorder' => false,
            'tone' => 'default',
        ]);
        $footer = TemplateContent::footer($brand, [
            'tagline' => $blurb,
            'copyright' => '© Inkline Studio. All rights reserved.',
            'columns' => [
                ['title' => 'Product', 'links' => "Voice|/\nPlaybooks|/\nPricing|/pricing\nChangelog|/blog\nRoadmap|/about"],
                ['title' => 'Company', 'links' => "About|/about\nJournal|/blog\nPrivacy|/about\nSupport|/contact"],
                ['title' => 'Workspace', 'links' => "Sign in|/contact\nStart a workspace|/pricing\nStatus|/about"],
            ],
            'social' => [
                ['icon' => 'twitter', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
                ['icon' => 'github', 'url' => '#'],
            ],
            'legal' => [],
            'showNewsletter' => false,
            'columnCount' => 3,
            'tone' => 'default',
        ]);
        $newsletter = TemplateContent::section('news', 'form.newsletter', [
            'eyebrow' => '',
            'heading' => 'Ship notes',
            'description' => 'One short email when we add a playbook or a review trick. No product spam.',
            'buttonLabel' => 'Subscribe',
            'layout' => 'split',
            'tone' => 'default',
            'paddingTop' => 40,
            'paddingBottom' => 8,
            'successNote' => '',
        ]);

        $heroDash = TemplateContent::photo('1551288049-bebda4e38f71', 1600);
        $office = TemplateContent::photo('1522202176988-66273c2fd55f', 1400);
        $abstract = TemplateContent::photo('1639322537228-f710d846310a', 1200);
        $blog1 = TemplateContent::photo('1498050108023-c5249f4df085', 1200);
        $blog2 = TemplateContent::photo('1558655146-d09347e92766', 1200);

        $team = [
            ['name' => 'Imani Cole', 'role' => 'Founder', 'image' => TemplateContent::photo('1573496359142-b8d87734a5a2', 600)],
            ['name' => 'Theo Marsh', 'role' => 'Product', 'image' => TemplateContent::photo('1500648767791-00dcc994a43e', 600)],
            ['name' => 'Priya Shah', 'role' => 'Design', 'image' => TemplateContent::photo('1494790108377-be9c29b29330', 600)],
            ['name' => 'Evan Ruiz', 'role' => 'Engineering', 'image' => TemplateContent::photo('1472099645785-5658abf4ff4e', 600)],
            ['name' => 'Noor Haddad', 'role' => 'Writing systems', 'image' => TemplateContent::photo('1544005313-94ddf0286df2', 600)],
            ['name' => 'Jules Park', 'role' => 'Customer ops', 'image' => TemplateContent::photo('1507003211169-0a1dd7228f2d', 600)],
            ['name' => 'Mira Bell', 'role' => 'Growth', 'image' => TemplateContent::photo('1560250097-0b93528c311a', 600)],
            ['name' => 'Sam Ortega', 'role' => 'Support', 'image' => TemplateContent::photo('1519085360753-af0119f7cbe7', 600)],
        ];
        foreach ($team as &$member) {
            $member['twitter'] = '#';
            $member['linkedin'] = '#';
            $member['instagram'] = '#';
            $member['bio'] = '';
        }
        unset($member);

        $plans = self::plans();
        $quotes = self::quotes();
        $faqs = self::faqs();
        $posts = [
            [
                'title' => 'A launch note should not take three tools',
                'excerpt' => 'How we collapsed the brief, the draft, and the review into one room without making writers wait on Slack.',
                'date' => 'Mar 12 2026',
                'tag' => 'Imani Cole',
                'image' => $blog1,
                'url' => '/blog',
            ],
            [
                'title' => 'Brand voice is a system, not a mood board',
                'excerpt' => 'The five constraints we store with every workspace so a new hire sounds like you on day two.',
                'date' => 'Feb 28 2026',
                'tag' => 'Priya Shah',
                'image' => $blog2,
                'url' => '/blog',
            ],
            [
                'title' => 'Review queues that actually close',
                'excerpt' => 'Legal, brand, and product can sit in one thread. The page does not ship until every gate is green.',
                'date' => 'Jan 19 2026',
                'tag' => 'Theo Marsh',
                'image' => TemplateContent::photo('1460926888513-46e576a3be50', 1200),
                'url' => '/blog',
            ],
        ];
        $logos = [
            ['label' => 'Northwind'],
            ['label' => 'Harbor'],
            ['label' => 'Lumen'],
            ['label' => 'Ridge'],
            ['label' => 'Cedar'],
            ['label' => 'Meridian'],
        ];

        return [
            TemplateContent::sitePage('Home', 'home', true, $nav, [
                TemplateContent::section('hero', 'hero.saas', [
                    'eyebrow' => 'Writing room for product teams',
                    'heading' => 'Ship launch copy without the prompt theater',
                    'description' => 'Inkline keeps voice, drafts, and reviews in one place. Start from a playbook, ping the people who actually approve, and publish when every gate is green.',
                    'buttonLabel' => 'Start a workspace',
                    'buttonUrl' => '/pricing',
                    'secondaryLabel' => '',
                    'features' => [],
                    'logos' => [],
                    'logosTitle' => '',
                    'image' => $heroDash,
                    'imageAlt' => 'Inkline workspace',
                    'headingSize' => 52,
                    'textAlign' => 'center',
                    'animation' => 'fade-up',
                    'paddingTop' => 72,
                    'paddingBottom' => 48,
                ]),
                TemplateContent::section('features', 'features.cards', [
                    'eyebrow' => 'Why teams stay',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'A complete writing stack, not another chat window',
                    'description' => 'Voice, review, and publish — wired the way product orgs already work.',
                    'textAlign' => 'center',
                    'columns' => 3,
                    'cardStyle' => 'solid',
                    'iconStyle' => 'tint',
                    'roundIcons' => true,
                    'items' => self::homeFeatures(),
                ]),
                TemplateContent::section('voice', 'features.showcase', [
                    'eyebrow' => 'Brand voice',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'One voice from launch note to in-app tooltip',
                    'description' => $blurb,
                    'bullets' => '',
                    'buttonLabel' => 'See how voice works',
                    'buttonUrl' => '/about',
                    'image' => $abstract,
                    'imageAlt' => 'Voice system',
                    'imageRatio' => 'square',
                    'stat' => '',
                    'headingSize' => 36,
                ]),
                TemplateContent::section('pages', 'content.two_columns', [
                    'eyebrow' => '',
                    'heading' => '',
                    'showIcons' => true,
                    'asCards' => true,
                    'columnCount' => 2,
                    'columns' => [
                        [
                            'title' => 'Playbooks for the pages you actually ship',
                            'text' => 'Launch notes, changelog entries, help articles, and empty states start from a brief your team already agreed on.',
                            'icon' => 'layers',
                        ],
                        [
                            'title' => 'Theme it once, keep the room yours',
                            'text' => 'Dark navy for late edits. A white canvas when you present. Switch in the header without restyling a single block.',
                            'icon' => 'palette',
                        ],
                    ],
                ]),
                TemplateContent::section('pricing', 'pricing.three_columns', self::pricingProps($blurb, $plans)),
                TemplateContent::section('love', 'testimonials.cards', [
                    'eyebrow' => 'From the room',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'What writing teams tell us',
                    'description' => $blurb,
                    'textAlign' => 'center',
                    'columns' => 3,
                    'showRating' => false,
                    'tone' => 'default',
                    'items' => $quotes,
                ]),
                TemplateContent::section('clients', 'gallery.logos', [
                    'heading' => '',
                    'logos' => $logos,
                    'grayscale' => true,
                    'paddingTop' => 32,
                    'paddingBottom' => 32,
                ]),
                TemplateContent::section('contact', 'form.contact', [
                    'eyebrow' => 'Talk to us',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'Ask about a workspace',
                    'description' => 'Tell us what you ship and who has to approve it. We reply with a setup plan, not a deck.',
                    'buttonLabel' => 'Send message',
                    'layout' => 'centered',
                    'cardStyle' => true,
                    'tone' => 'default',
                    'details' => [],
                    'bullets' => '',
                    'successNote' => '',
                ]),
                TemplateContent::section('blogs', 'posts.cards', [
                    'eyebrow' => 'From the journal',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'Notes on shipping language',
                    'description' => $blurb,
                    'textAlign' => 'center',
                    'buttonLabel' => '',
                    'items' => $posts,
                ]),
                TemplateContent::section('cta', 'cta.simple', [
                    'eyebrow' => 'Try the room',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'Ready to write in one place?',
                    'description' => $blurb,
                    'buttonLabel' => 'Start a workspace',
                    'buttonUrl' => '/pricing',
                    'secondaryLabel' => '',
                    'boxed' => true,
                    'textAlign' => 'center',
                    'tone' => 'default',
                    'backgroundType' => 'gradient',
                    'gradientFrom' => '#1a0b2e',
                    'gradientTo' => '#050014',
                    'gradientAngle' => 180,
                    'lightText' => true,
                ]),
                $newsletter,
            ], $footer),
            TemplateContent::sitePage('About', 'about', false, $nav, [
                TemplateContent::section('title', 'hero.page', [
                    'heading' => 'About Inkline',
                    'breadcrumb' => 'Home / About',
                    'headingSize' => 48,
                    'paddingTop' => 64,
                    'paddingBottom' => 40,
                ]),
                TemplateContent::section('intro', 'content.image_text', [
                    'eyebrow' => 'Since 2021',
                    'heading' => '4,200 product teams write launch copy in Inkline.',
                    'body' => 'We started as a shared doc that kept drifting out of voice. Inkline is that doc with a memory, a review trail, and a switch for the late-night navy canvas.',
                    'bullets' => '',
                    'buttonLabel' => 'See pricing',
                    'buttonUrl' => '/pricing',
                    'image' => $heroDash,
                    'imageAlt' => 'Inkline product',
                    'imageRatio' => 'wide',
                    'splitRatio' => 'copy',
                    'headingSize' => 36,
                ]),
                TemplateContent::section('keys', 'features.cards', [
                    'eyebrow' => 'How we work',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'What the room is built around',
                    'description' => $blurb,
                    'textAlign' => 'center',
                    'columns' => 3,
                    'cardStyle' => 'flat',
                    'iconStyle' => 'tint',
                    'roundIcons' => true,
                    'items' => self::aboutFeatures(),
                ]),
                TemplateContent::section('watch', 'content.video', [
                    'eyebrow' => '',
                    'heading' => '',
                    'description' => '',
                    'bullets' => '',
                    'buttonLabel' => '',
                    'layout' => 'featured',
                    'poster' => $office,
                    'paddingTop' => 24,
                    'paddingBottom' => 24,
                ]),
                TemplateContent::section('team', 'team.cards', [
                    'eyebrow' => 'The desk',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'People who still read the drafts',
                    'description' => $blurb,
                    'textAlign' => 'center',
                    'columns' => 4,
                    'showBio' => false,
                    'showCards' => false,
                    'photoShape' => 'round',
                    'items' => $team,
                ]),
                TemplateContent::section('love', 'testimonials.cards', [
                    'eyebrow' => 'Customers',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'What our users say',
                    'description' => $blurb,
                    'textAlign' => 'center',
                    'columns' => 3,
                    'showRating' => false,
                    'tone' => 'default',
                    'items' => array_slice($quotes, 0, 6),
                    'buttonLabel' => 'Read more stories',
                    'buttonUrl' => '/about',
                ]),
                TemplateContent::section('clients', 'gallery.logos', [
                    'heading' => '',
                    'logos' => $logos,
                    'grayscale' => true,
                ]),
                TemplateContent::section('cta', 'cta.simple', [
                    'eyebrow' => '',
                    'heading' => 'Bring the next launch into one room',
                    'description' => '',
                    'buttonLabel' => 'Start a workspace',
                    'buttonUrl' => '/pricing',
                    'secondaryLabel' => '',
                    'boxed' => true,
                    'textAlign' => 'center',
                    'tone' => 'default',
                    'backgroundType' => 'gradient',
                    'gradientFrom' => '#1a0b2e',
                    'gradientTo' => '#050014',
                    'gradientAngle' => 180,
                    'lightText' => true,
                ]),
                $newsletter,
            ], $footer),
            TemplateContent::sitePage('Pricing', 'pricing', false, $nav, [
                TemplateContent::section('title', 'hero.page', [
                    'heading' => 'Pricing',
                    'breadcrumb' => 'Home / Pricing',
                    'headingSize' => 48,
                    'paddingTop' => 64,
                    'paddingBottom' => 40,
                ]),
                TemplateContent::section('pricing', 'pricing.three_columns', self::pricingProps($blurb, $plans)),
                TemplateContent::section('faq', 'faq.accordion', [
                    'eyebrow' => 'Questions',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'Before you pick a plan',
                    'description' => $blurb,
                    'textAlign' => 'center',
                    'openFirst' => false,
                    'singleOpen' => true,
                    'items' => $faqs,
                ]),
                $newsletter,
            ], $footer),
            TemplateContent::sitePage('Journal', 'blog', false, $nav, [
                TemplateContent::section('title', 'hero.page', [
                    'heading' => 'Journal',
                    'breadcrumb' => 'Home / Journal',
                    'headingSize' => 48,
                    'paddingTop' => 64,
                    'paddingBottom' => 40,
                ]),
                TemplateContent::section('posts', 'posts.cards', [
                    'eyebrow' => 'From the journal',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'Notes on shipping language',
                    'description' => $blurb,
                    'textAlign' => 'center',
                    'buttonLabel' => '',
                    'items' => $posts,
                ]),
                $newsletter,
            ], $footer),
            TemplateContent::sitePage('Contact', 'contact', false, $nav, [
                TemplateContent::section('title', 'hero.page', [
                    'heading' => 'Contact',
                    'breadcrumb' => 'Home / Contact',
                    'headingSize' => 48,
                    'paddingTop' => 64,
                    'paddingBottom' => 40,
                ]),
                TemplateContent::section('contact', 'form.contact', [
                    'eyebrow' => 'Talk to us',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'Ask about a workspace',
                    'description' => 'Share a launch you are stuck on. We will tell you if Inkline is the right room.',
                    'buttonLabel' => 'Send message',
                    'layout' => 'centered',
                    'cardStyle' => true,
                    'tone' => 'default',
                    'details' => [],
                    'bullets' => '',
                    'successNote' => '',
                ]),
                $newsletter,
            ], $footer),
        ];
    }

    /**
     * @param  list<array<string, mixed>>  $plans
     * @return array<string, mixed>
     */
    private static function pricingProps(string $blurb, array $plans): array
    {
        return [
            'eyebrow' => 'Plans',
            'eyebrowStyle' => 'pill',
            'heading' => 'Start small. Add seats when the queue grows.',
            'description' => $blurb,
            'textAlign' => 'center',
            'tone' => 'default',
            'showBillingToggle' => false,
            'cardGlow' => true,
            'plans' => $plans,
        ];
    }

    /** @return list<array<string, mixed>> */
    private static function plans(): array
    {
        $core = "Brand voice library\nPlaybooks for launches\nShared review queue\nVersion history\nEmail support";

        return [
            [
                'name' => 'Studio',
                'description' => '',
                'price' => '$ 49',
                'period' => '/month (billed annually)',
                'features' => $core."\n3 seats",
                'buttonLabel' => 'Get the plan',
                'buttonUrl' => '/contact',
                'icon' => 'zap',
                'note' => 'No extra hidden charge.',
            ],
            [
                'name' => 'Team',
                'description' => '',
                'price' => '$ 129',
                'period' => '/month (billed annually)',
                'features' => $core."\n12 seats\nLegal and brand gates",
                'buttonLabel' => 'Get the plan',
                'buttonUrl' => '/contact',
                'icon' => 'sparkles',
                'note' => 'No extra hidden charge.',
                'highlighted' => true,
            ],
            [
                'name' => 'Company',
                'description' => '',
                'price' => '$ 279',
                'period' => '/month (billed annually)',
                'features' => $core."\nUnlimited seats\nSSO and audit log",
                'buttonLabel' => 'Get the plan',
                'buttonUrl' => '/contact',
                'icon' => 'briefcase',
                'note' => 'No extra hidden charge.',
            ],
        ];
    }

    /** @return list<array<string, mixed>> */
    private static function homeFeatures(): array
    {
        return [
            ['title' => 'Brand voice that sticks', 'text' => 'Constraints live with the workspace so a new hire sounds like you on the second draft.', 'icon' => 'sparkles'],
            ['title' => 'Review without archaeology', 'text' => 'Legal, brand, and product sit on the same thread. The page does not ship until every gate is green.', 'icon' => 'check-circle'],
            ['title' => 'Playbooks, not blank prompts', 'text' => 'Launch notes, changelogs, and empty states start from a brief you already agreed on.', 'icon' => 'layers'],
            ['title' => 'Draft memory', 'text' => 'Yesterday’s tooltip still informs today’s onboarding. Nothing lives in a lost chat.', 'icon' => 'book'],
            ['title' => 'Roles that match the org', 'text' => 'Writers draft. Reviewers gate. Admins own voice. No shared password in a spreadsheet.', 'icon' => 'users'],
            ['title' => 'Dark or white canvas', 'text' => 'Late edits on navy. Presentations on white. Switch in the header; every block follows.', 'icon' => 'palette'],
        ];
    }

    /** @return list<array<string, mixed>> */
    private static function aboutFeatures(): array
    {
        return [
            ['title' => 'Voice as a system', 'text' => 'Tone, banned phrases, and examples ship with every workspace — not a slide in a forgotten deck.', 'icon' => 'sparkles'],
            ['title' => 'Gates, not comments', 'text' => 'Approvals are a checklist, not a thread that dies in Slack on Friday.', 'icon' => 'shield'],
            ['title' => 'Playbooks you can edit', 'text' => 'Every brief is a block. Change the questions when your launch process changes.', 'icon' => 'layers'],
            ['title' => 'A room that restyles itself', 'text' => 'The same pages work on a dark canvas or a white one. Visitors pick; you do not rebuild.', 'icon' => 'palette'],
            ['title' => 'Handoff to the CMS', 'text' => 'Export clean copy when you are ready. Inkline is the room, not another destination.', 'icon' => 'globe'],
            ['title' => 'Humans on the line', 'text' => 'Studio and Team plans include people who have shipped help centers, not a ticket bot.', 'icon' => 'message'],
        ];
    }

    /** @return list<array<string, mixed>> */
    private static function quotes(): array
    {
        return [
            ['text' => 'We stopped pasting drafts into three Slack channels. Legal signs in Inkline and the page actually ships.', 'name' => 'Rae Collins', 'role' => 'Head of product, Harbor', 'rating' => 5],
            ['text' => 'The voice library is the first thing new writers open. They sound like us before the second review.', 'name' => 'Kenji Ito', 'role' => 'Brand, Northwind', 'rating' => 5],
            ['text' => 'Dark mode for late edits, white when I present to the exec group. Same blocks. No restyle sprint.', 'name' => 'Elena Voss', 'role' => 'Content lead, Ridge', 'rating' => 5],
            ['text' => 'Playbooks killed the blank prompt. Launch notes take an afternoon instead of a week of ping-pong.', 'name' => 'Omar Farid', 'role' => 'PMM, Cedar', 'rating' => 5],
            ['text' => 'Review gates are boring in the best way. If it is not green, it does not go live.', 'name' => 'Sofia Lang', 'role' => 'Ops, Lumen', 'rating' => 5],
            ['text' => 'We finally have a place that is not a doc, a ticket, and a Figma comment fighting each other.', 'name' => 'Chris Hale', 'role' => 'Founder, Meridian Labs', 'rating' => 5],
        ];
    }

    /** @return list<array<string, mixed>> */
    private static function faqs(): array
    {
        return [
            [
                'question' => 'What is Inkline for?',
                'answer' => 'Product teams that ship language: launch notes, in-app copy, help articles, and changelogs. It is a writing room with voice, review, and a dark or white canvas — not a generic chatbot.',
            ],
            [
                'question' => 'Can visitors switch dark and light?',
                'answer' => 'Yes. The header toggle swaps the navy canvas for a white one. Colors, cards, and type stay in the same system. You can edit both palettes in Theme.',
            ],
            [
                'question' => 'Can I edit every section after I apply the template?',
                'answer' => 'Yes. Headlines, prices, FAQs, team photos, forms, and both color palettes are editable in the builder.',
            ],
            [
                'question' => 'Do plans include extra fees?',
                'answer' => 'No extra hidden charge. You pick Studio, Team, or Company. Usage inside your own tools stays on those bills.',
            ],
            [
                'question' => 'Can legal sit in the review queue?',
                'answer' => 'Team and Company plans include named gates. A page stays draft until every required reviewer marks it green.',
            ],
        ];
    }
}
