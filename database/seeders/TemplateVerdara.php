<?php

namespace Database\Seeders;

class TemplateVerdara
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#4ADE80',
            'secondary' => '#0F172A',
            'accent' => '#C4B5FD',
            'background' => '#FFFFFF',
            'surface' => '#F8FAFC',
            'text' => '#0F172A',
            'muted' => '#64748B',
            'headingFont' => 'Inter, system-ui, sans-serif',
            'bodyFont' => 'Inter, system-ui, sans-serif',
            'headingWeight' => 800,
            'bodyWeight' => 400,
            'buttonRadius' => '16px',
            'cardRadius' => '22px',
            'containerWidth' => '1120px',
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

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $brand = 'Verdara';
        $nav = array_merge([
            'logo' => $brand,
            'logoIcon' => 'leaf',
            'logoUrl' => '/',
            'sticky' => true,
            'secondaryLabel' => 'Login',
            'secondaryUrl' => '/contact',
            'buttonLabel' => 'Join for free',
            'buttonUrl' => '/contact',
            'links' => [
                ['label' => 'Home', 'url' => '/'],
                ['label' => 'Features', 'url' => '/features'],
                ['label' => 'Testimonials', 'url' => '/testimonials'],
                ['label' => 'Pricing', 'url' => '/pricing'],
            ],
        ], self::motion(0, 'load'));

        $footer = [
            'logo' => $brand,
            'logoIcon' => 'leaf',
            'tagline' => 'Build, launch and scale with a calmer AI stack.',
            'copyright' => '© '.date('Y').' Verdara. All rights reserved.',
            'columns' => [
                ['title' => 'Product', 'links' => "Features|/features\nPricing|/pricing\nTestimonials|/testimonials"],
                ['title' => 'Resources', 'links' => "Contact|/contact\nHelp|#\nStatus|#"],
                ['title' => 'Legal', 'links' => "Privacy|#\nTerms|#\nCookies|#"],
            ],
            'social' => [
                ['icon' => 'twitter', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
                ['icon' => 'github', 'url' => '#'],
            ],
        ];

        $officeA = TemplateContent::photo('1522071820081-009f0129c71c', 900);
        $officeB = TemplateContent::photo('1551434678-e076c223a692', 900);

        $features = [
            ['icon' => 'zap', 'title' => 'Smart Automation', 'text' => 'Let routine drafts, follow-ups, and reports run while you stay on the work that needs a person.', 'tint' => '#A78BFA'],
            ['icon' => 'users', 'title' => 'Seamless Team Synergy', 'text' => 'One workspace for copy, design notes, and launches — no more hunting across five tools.', 'tint' => '#4ADE80'],
            ['icon' => 'chart', 'title' => 'Built-in Analytics', 'text' => 'See which pages convert, which campaigns stall, and where to put the next hour.', 'tint' => '#F87171'],
        ];

        $quotes = [
            ['name' => 'Amelia Chen', 'handle' => '@amelia', 'text' => 'We shipped a launch site in an afternoon. The copy actually sounded like us.', 'image' => TemplateContent::photo('1494790108377-be9c29b29330', 200)],
            ['name' => 'Jonah Patel', 'handle' => '@jonah', 'text' => 'Pricing pages used to take a week. Verdara drafted three options we could edit live.', 'image' => TemplateContent::photo('1500648767791-00dcc994a43e', 200)],
            ['name' => 'Maya Ortiz', 'handle' => '@maya', 'text' => 'The green, airy layout is what our customers expected. We did not fight a dark theme.', 'image' => TemplateContent::photo('1438761681033-6461ffad8d80', 200)],
            ['name' => 'Chris Hale', 'handle' => '@chris', 'text' => 'Analytics on the same canvas as the page. No extra dashboard login.', 'image' => TemplateContent::photo('1507003211169-0a1dd7228f2d', 200)],
            ['name' => 'Priya Shah', 'handle' => '@priya', 'text' => 'Handoff to our designer was a shared link, not a zip of Figma comments.', 'image' => TemplateContent::photo('1544005313-94ddf0286df2', 200)],
            ['name' => 'Omar Hassan', 'handle' => '@omar', 'text' => 'Cancelled the agency retainer. We still look like we have one.', 'image' => TemplateContent::photo('1506794778202-cad84cf45f1d', 200)],
        ];

        $pricing = array_merge(self::motion(80), [
            'heading' => 'Simple, transparent pricing.',
            'showBillingToggle' => true,
            'monthlyLabel' => 'Monthly',
            'yearlyLabel' => 'Yearly',
            'plans' => [
                [
                    'name' => 'Basic',
                    'price' => '$12',
                    'priceYearly' => '$9',
                    'period' => '/month',
                    'features' => "1 workspace\nAI drafts\nEmail support\nCancel anytime",
                    'buttonLabel' => 'Get started',
                    'buttonUrl' => '/contact',
                ],
                [
                    'name' => 'Pro',
                    'price' => '$29',
                    'priceYearly' => '$24',
                    'period' => '/month',
                    'features' => "Unlimited pages\nTeam seats\nCustom domain\nPriority chat\nRemove badge",
                    'buttonLabel' => 'Get started',
                    'buttonUrl' => '/contact',
                    'highlighted' => true,
                    'badge' => 'Popular',
                ],
                [
                    'name' => 'Premium',
                    'price' => '$79',
                    'priceYearly' => '$64',
                    'period' => '/month',
                    'features' => "Everything in Pro\nSSO\nAudit log\nDedicated onboarding",
                    'buttonLabel' => 'Get started',
                    'buttonUrl' => '/contact',
                ],
            ],
        ]);

        $hero = array_merge(self::motion(0, 'load'), [
            'badge' => 'Trusted by 500,000+ customers',
            'headingPrefix' => 'Build, launch and scale',
            'headingAccent' => 'your business',
            'headingSuffix' => 'with AI.',
            'description' => 'Verdara drafts your site, writes the first campaigns, and keeps the stack together so you can ship without hiring a full product team.',
            'buttonLabel' => 'Get started →',
            'buttonUrl' => '/pricing',
            'note' => 'No credit card required. Cancel anytime.',
            'avatars' => [
                ['image' => TemplateContent::photo('1494790108377-be9c29b29330', 80)],
                ['image' => TemplateContent::photo('1500648767791-00dcc994a43e', 80)],
                ['image' => TemplateContent::photo('1438761681033-6461ffad8d80', 80)],
                ['image' => TemplateContent::photo('1507003211169-0a1dd7228f2d', 80)],
            ],
        ]);

        return [
            TemplateContent::sitePage('Home', 'home', true, $nav, [
                TemplateContent::section('hero', 'hero.verdara', $hero),
                TemplateContent::section('logos', 'proof.verdara', array_merge(self::motion(40), [
                    'logos' => [
                        ['label' => 'Framer'],
                        ['label' => 'HUAWEI'],
                        ['label' => 'Instacart'],
                        ['label' => 'Microsoft'],
                        ['label' => 'Walmart'],
                    ],
                    'paddingTop' => 16,
                    'paddingBottom' => 16,
                ])),
                TemplateContent::section('features', 'features.verdara', array_merge(self::motion(80), [
                    'eyebrow' => 'Features',
                    'heading' => 'Create smarter, faster',
                    'image' => $officeA,
                    'imageTwo' => $officeB,
                    'items' => $features,
                ])),
                TemplateContent::section('crew', 'cta.crew', array_merge(self::motion(80), [
                    'heading' => 'Meet the builders Powering modern teams',
                    'buttonLabel' => 'Join our team',
                    'buttonUrl' => '/contact',
                ])),
                TemplateContent::section('quotes', 'testimonials.verdara', array_merge(self::motion(80), [
                    'heading' => 'Loved by teams worldwide.',
                    'items' => $quotes,
                ])),
                TemplateContent::section('pricing', 'pricing.verdara', $pricing),
                TemplateContent::section('join', 'cta.verdara', array_merge(self::motion(80), [
                    'heading' => 'Start the wave and join the growing Verdara community',
                    'buttonLabel' => 'Get started',
                    'buttonUrl' => '/contact',
                ])),
            ], $footer, 'footer.verdara', 'navbar.verdara'),

            TemplateContent::sitePage('Features', 'features', false, $nav, [
                TemplateContent::section('lead', 'hero.verdara', array_merge(self::motion(0, 'load'), [
                    'badge' => 'Product',
                    'headingPrefix' => 'Create smarter,',
                    'headingAccent' => 'faster',
                    'headingSuffix' => 'together.',
                    'description' => 'Automation, a shared canvas, and analytics that live next to the page — not in another login.',
                    'buttonLabel' => 'See pricing →',
                    'buttonUrl' => '/pricing',
                    'note' => 'Start on Basic. Upgrade when the team is live.',
                ])),
                TemplateContent::section('features', 'features.verdara', array_merge(self::motion(80), [
                    'eyebrow' => 'Features',
                    'heading' => 'Create smarter, faster',
                    'image' => $officeA,
                    'imageTwo' => $officeB,
                    'items' => $features,
                ])),
            ], $footer, 'footer.verdara', 'navbar.verdara'),

            TemplateContent::sitePage('Testimonials', 'testimonials', false, $nav, [
                TemplateContent::section('quotes', 'testimonials.verdara', array_merge(self::motion(0), [
                    'heading' => 'Loved by teams worldwide.',
                    'items' => $quotes,
                ])),
                TemplateContent::section('crew', 'cta.crew', array_merge(self::motion(80), [
                    'heading' => 'Meet the builders Powering modern teams',
                    'buttonLabel' => 'Join our team',
                    'buttonUrl' => '/contact',
                ])),
            ], $footer, 'footer.verdara', 'navbar.verdara'),

            TemplateContent::sitePage('Pricing', 'pricing', false, $nav, [
                TemplateContent::section('pricing', 'pricing.verdara', $pricing),
                TemplateContent::section('join', 'cta.verdara', array_merge(self::motion(80), [
                    'heading' => 'Start the wave and join the growing Verdara community',
                    'buttonLabel' => 'Get started',
                    'buttonUrl' => '/contact',
                ])),
            ], $footer, 'footer.verdara', 'navbar.verdara'),

            TemplateContent::sitePage('Contact', 'contact', false, $nav, [
                TemplateContent::section('form', 'form.contact', array_merge(self::motion(0), [
                    'eyebrow' => 'Contact',
                    'heading' => 'Join for free',
                    'description' => 'Tell us what you are launching. We reply with a workspace, not a deck.',
                    'buttonLabel' => 'Send message',
                    'layout' => 'split',
                    'details' => [
                        ['icon' => 'mail', 'label' => 'Email', 'value' => 'hello@verdara.example'],
                        ['icon' => 'clock', 'label' => 'Hours', 'value' => 'We reply within one business day'],
                    ],
                ])),
            ], $footer, 'footer.verdara', 'navbar.verdara'),
        ];
    }
}
