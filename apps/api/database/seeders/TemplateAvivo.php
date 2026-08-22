<?php

namespace Database\Seeders;

class TemplateAvivo
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#5D5DFF',
            'secondary' => '#111111',
            'accent' => '#FEE232',
            'background' => '#ffffff',
            'surface' => '#f6f6f8',
            'text' => '#111111',
            'muted' => '#6b7280',
            'headingFont' => 'Fraunces, Georgia, serif',
            'bodyFont' => 'Plus Jakarta Sans, system-ui, sans-serif',
            'headingWeight' => 600,
            'bodyWeight' => 400,
            'buttonRadius' => '999px',
            'cardRadius' => '28px',
            'containerWidth' => '1180px',
            'sectionSpacing' => '88px',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function motion(int $delay = 0): array
    {
        return [
            'animation' => 'fade-up',
            'animationTrigger' => 'scroll',
            'animationDuration' => 700,
            'animationDelay' => $delay,
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $brand = 'Avivo';
        $nav = TemplateContent::nav($brand, [
            ['label' => 'Services', 'url' => '/services'],
            ['label' => 'Work', 'url' => '/work'],
            ['label' => 'About', 'url' => '/about'],
            ['label' => 'Contact', 'url' => '/contact'],
        ], [
            'logoIcon' => 'sparkles',
            'showMark' => true,
            'showBorder' => false,
            'sticky' => true,
            'showButton' => true,
            'buttonLabel' => 'Start Project',
            'buttonUrl' => '/contact',
            'buttonVariant' => 'secondary',
            'showSecondary' => true,
            'secondaryLabel' => 'Log In',
            'secondaryUrl' => '/contact',
        ]);

        $footer = TemplateContent::footer($brand, [
            'tagline' => 'A studio for brands that still want to look like themselves.',
            'columns' => [
                ['title' => 'Company', 'links' => "About|/about\nWork|/work\nContact|/contact"],
                ['title' => 'Services', 'links' => "Brand|/services\nWeb|/services\nCampaigns|/services"],
                ['title' => 'Resources', 'links' => "Process|/services\nPricing|/services"],
            ],
            'social' => [
                ['icon' => 'instagram', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
            ],
            'showNewsletter' => false,
            'tone' => 'default',
            'columnCount' => 3,
        ]);

        $work = [
            ['title' => 'Northwind dashboard', 'tag' => 'Product', 'image' => TemplateContent::photo('1460925895917-afdab827c52f'), 'url' => '/work'],
            ['title' => 'Harbour Table', 'tag' => 'Hospitality', 'image' => TemplateContent::photo('1414235077428-338989a2e8c0'), 'url' => '/work'],
            ['title' => 'Fieldstone close', 'tag' => 'Services', 'image' => TemplateContent::photo('1556761175-5973dc0f32e7'), 'url' => '/work'],
            ['title' => 'Cedar Clinic', 'tag' => 'Health', 'image' => TemplateContent::photo('1576091160399-112ba8d25d1d'), 'url' => '/work'],
        ];

        $amelia = TemplateContent::photo('1494790108377-be9c29b29330', 600);
        $jonah = TemplateContent::photo('1500648767791-00dcc994a43e', 600);
        $maya = TemplateContent::photo('1438761681033-6461ffad8d80', 600);
        $desk = TemplateContent::photo('1542744173-8e7e53415bb0');

        return [
            TemplateContent::sitePage('Home', 'home', true, $nav, [
                TemplateContent::section('hero', 'hero.studio', array_merge(self::motion(0), [
                    'heading' => 'Building bold brands with',
                    'headingAccent' => 'thoughtful design',
                    'description' => 'Avivo is a small studio that still designs every homepage. We ship marketing sites companies can keep honest after launch.',
                    'buttonLabel' => 'View Projects',
                    'buttonUrl' => '/work',
                    'socialProof' => '100+ clients served',
                    'mesh' => true,
                    'headingSize' => 64,
                    'avatars' => [
                        ['image' => $amelia, 'name' => 'Amelia'],
                        ['image' => $jonah, 'name' => 'Jonah'],
                        ['image' => $maya, 'name' => 'Maya'],
                    ],
                ])),
                TemplateContent::section('logos', 'gallery.logos', array_merge(self::motion(80), [
                    'heading' => '',
                    'grayscale' => true,
                    'paddingTop' => 12,
                    'paddingBottom' => 12,
                    'logos' => [
                        ['label' => 'Logitech'],
                        ['label' => 'Spotify'],
                        ['label' => 'Slack'],
                        ['label' => 'Notion'],
                        ['label' => 'Figma'],
                        ['label' => 'Stripe'],
                    ],
                ])),
                TemplateContent::section('capabilities', 'content.capabilities', array_merge(self::motion(0), [
                    'heading' => 'Crafting exceptional web experiences that convert visitors into customers',
                    'headingSize' => 40,
                ])),
                TemplateContent::section('talk', 'cta.bar', array_merge(self::motion(0), [
                    'heading' => "Enough about us, let's talk about you",
                    'buttonLabel' => 'Contact Us',
                    'buttonUrl' => '/contact',
                ])),
                TemplateContent::section('work', 'gallery.projects', array_merge(self::motion(0), [
                    'heading' => 'How we transformed brands and created value for them',
                    'headingSize' => 40,
                    'items' => $work,
                ])),
                TemplateContent::section('team', 'team.cards', array_merge(self::motion(0), [
                    'heading' => 'Meet the great minds behind our success',
                    'description' => 'A named team on every engagement — not a rotating bench.',
                    'textAlign' => 'center',
                    'columns' => 3,
                    'showBio' => false,
                    'headingSize' => 40,
                    'items' => [
                        ['name' => 'Amelia Chen', 'role' => 'Design lead', 'image' => $amelia],
                        ['name' => 'Jonah Patel', 'role' => 'Engineering', 'image' => $jonah],
                        ['name' => 'Maya Ortiz', 'role' => 'Producer', 'image' => $maya],
                    ],
                ])),
                TemplateContent::section('quotes', 'testimonials.bento', array_merge(self::motion(0), [
                    'items' => [
                        ['role' => 'quote', 'quote' => 'They treated the homepage like a product. We still change the copy ourselves, and it still looks designed.', 'name' => 'Amelia Chen', 'roleLabel' => 'Head of Growth, Northwind', 'image' => $amelia],
                        ['role' => 'stat', 'value' => '91%', 'label' => 'customer satisfaction'],
                        ['role' => 'video', 'title' => 'Watch the case study', 'image' => $desk],
                        ['role' => 'text', 'quote' => 'Clear process, no theatre, and a site the marketing team can actually own.', 'name' => 'Jonah Patel', 'roleLabel' => 'Founder, Fieldstone', 'image' => $jonah],
                    ],
                ])),
                TemplateContent::section('pricing', 'pricing.duo', array_merge(self::motion(0), [
                    'heading' => 'Pick the plan that fits your group',
                    'headingSize' => 40,
                ])),
                TemplateContent::section('faq', 'faq.accordion', array_merge(self::motion(0), [
                    'heading' => "Got questions? We've got answers",
                    'headingSize' => 40,
                    'textAlign' => 'center',
                    'items' => [
                        ['question' => 'How long does a typical site take?', 'answer' => 'Most sprints ship a private preview in four weeks and go live in six. Campaign pages can land faster.'],
                        ['question' => 'Can our team edit the site after launch?', 'answer' => 'Yes. Every page is built in the editor. We train your marketers on the blocks they will actually use.'],
                        ['question' => 'Do you write copy?', 'answer' => 'We write the first screen and the offers. You own the rest, or we can extend the engagement.'],
                        ['question' => 'What do you need to start?', 'answer' => 'A date, the pages that have to ship, and who will edit the site after we leave.'],
                    ],
                ])),
                TemplateContent::section('close', 'cta.gradient', array_merge(self::motion(0), [
                    'heading' => "Let's make something amazing together",
                    'buttonLabel' => 'Contact Us',
                    'buttonUrl' => '/contact',
                    'mesh' => true,
                ])),
            ], $footer),

            TemplateContent::sitePage('Services', 'services', false, $nav, [
                TemplateContent::section('hero', 'hero.page', array_merge(self::motion(0), [
                    'heading' => 'Services',
                    'description' => 'Brand, web, and campaigns — designed so your team can keep editing on Monday.',
                    'breadcrumb' => 'Home / Services',
                    'headingSize' => 56,
                ])),
                TemplateContent::section('capabilities', 'content.capabilities', array_merge(self::motion(80), [])),
                TemplateContent::section('pricing', 'pricing.duo', array_merge(self::motion(80), [])),
                TemplateContent::section('close', 'cta.bar', array_merge(self::motion(80), [
                    'heading' => 'Ready to scope a sprint?',
                    'buttonLabel' => 'Start Project',
                    'buttonUrl' => '/contact',
                ])),
            ], $footer),

            TemplateContent::sitePage('Work', 'work', false, $nav, [
                TemplateContent::section('hero', 'hero.page', array_merge(self::motion(0), [
                    'heading' => 'Work',
                    'description' => 'Homepages, product stories, and campaign pages still edited by the teams who own them.',
                    'breadcrumb' => 'Home / Work',
                    'headingSize' => 56,
                ])),
                TemplateContent::section('grid', 'gallery.projects', array_merge(self::motion(80), [
                    'heading' => '',
                    'items' => array_merge($work, [
                        ['title' => 'Cove campaign', 'tag' => 'Campaign', 'image' => TemplateContent::photo('1551434678-e076c223a692'), 'url' => '/work'],
                        ['title' => 'Shoreline clinic', 'tag' => 'Health', 'image' => TemplateContent::photo('1579684385127-1ef15d508118'), 'url' => '/work'],
                    ]),
                ])),
            ], $footer),

            TemplateContent::sitePage('About', 'about', false, $nav, [
                TemplateContent::section('hero', 'hero.studio', array_merge(self::motion(0), [
                    'heading' => 'A small studio with',
                    'headingAccent' => 'named people',
                    'description' => 'Avivo is eight people. You work with the same team from first sketch to domain.',
                    'buttonLabel' => 'Meet the team',
                    'buttonUrl' => '#team',
                    'socialProof' => 'Est. 2018 · Austin',
                    'mesh' => true,
                    'headingSize' => 56,
                ])),
                TemplateContent::section('people', 'team.cards', array_merge(self::motion(80), [
                    'anchorId' => 'team',
                    'heading' => 'The people on your project',
                    'columns' => 3,
                    'showBio' => true,
                    'items' => [
                        ['name' => 'Amelia Chen', 'role' => 'Design lead', 'bio' => 'Ships the first pages with every new client.', 'image' => $amelia],
                        ['name' => 'Jonah Patel', 'role' => 'Engineering', 'bio' => 'Keeps publishing fast and forms honest.', 'image' => $jonah],
                        ['name' => 'Maya Ortiz', 'role' => 'Producer', 'bio' => 'Dates, briefs, and the Monday handoff.', 'image' => $maya],
                    ],
                ])),
                TemplateContent::section('quotes', 'testimonials.bento', array_merge(self::motion(80), [])),
            ], $footer),

            TemplateContent::sitePage('Contact', 'contact', false, $nav, [
                TemplateContent::section('hero', 'hero.page', array_merge(self::motion(0), [
                    'heading' => 'Start a project',
                    'description' => 'A brief, a date, and who will own the site after launch. We reply within one business day.',
                    'breadcrumb' => 'Home / Contact',
                    'headingSize' => 52,
                ])),
                TemplateContent::section('form', 'form.contact', array_merge(self::motion(80), [
                    'heading' => 'Tell us about the launch',
                    'buttonLabel' => 'Send inquiry',
                    'layout' => 'split',
                    'cardStyle' => true,
                    'details' => [
                        ['icon' => 'mail', 'label' => 'Email', 'value' => 'hello@avivo.example'],
                        ['icon' => 'phone', 'label' => 'Phone', 'value' => '+1 (555) 014 2200'],
                        ['icon' => 'map-pin', 'label' => 'Studio', 'value' => '120 Market Street, Austin'],
                    ],
                ])),
                TemplateContent::section('close', 'cta.gradient', array_merge(self::motion(80), [
                    'heading' => "Let's make something amazing together",
                    'buttonLabel' => 'Email the studio',
                    'buttonUrl' => 'mailto:hello@avivo.example',
                ])),
            ], $footer),
        ];
    }
}
