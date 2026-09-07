<?php

namespace Database\Seeders;

/**
 * Curalo — a personal-training and coaching template.
 *
 * Five pages (Home, Coaching, Pricing, Trainers, Contact) built from the
 * `*.curalo` block family: a photographic hero and CTA bands broken by
 * pure-black navigation, testimonial and footer sections, one bright cyan
 * accent carrying every button and eyebrow, and tight uppercase IBM Plex
 * Mono headlines over plain Inter body copy.
 */
class TemplateCuralo
{
    private const INK = '#0a0a0a';

    private const ACCENT = '#00fae9';

    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#00948a',
            'secondary' => '#000000',
            'accent' => self::ACCENT,
            'background' => '#ffffff',
            'surface' => '#f5f5f5',
            'text' => self::INK,
            'muted' => '#68686f',
            'headingFont' => '"IBM Plex Mono", ui-monospace, SFMono-Regular, monospace',
            'bodyFont' => 'Inter, system-ui, -apple-system, sans-serif',
            'serifFont' => 'Georgia, serif',
            'monoFont' => '"IBM Plex Mono", ui-monospace, monospace',
            'headingWeight' => 500,
            'bodyWeight' => 400,
            'buttonRadius' => '8px',
            'cardRadius' => '16px',
            'containerWidth' => '1200px',
            'sectionSpacing' => '88px',
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
        return [
            'logo' => 'Curalo',
            'logoImage' => '',
            'logoUrl' => '/',
            'links' => [
                ['label' => 'Coaching', 'url' => '/coaching'],
                ['label' => 'Pricing', 'url' => '/pricing'],
                ['label' => 'How it works', 'url' => '/coaching'],
                ['label' => 'Our Trainers', 'url' => '/trainers'],
            ],
            'buttonLabel' => 'Book a Consultation',
            'buttonUrl' => '/contact',
            'sticky' => true,
        ];
    }

    /** @return array<string, mixed> */
    private static function footer(): array
    {
        return array_merge(self::motion(20), [
            'logo' => 'Curalo',
            'logoImage' => '',
            'logoUrl' => '/',
            'social' => [
                ['icon' => 'instagram', 'url' => '#'],
                ['icon' => 'twitter', 'url' => '#'],
                ['icon' => 'facebook', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
            ],
            'columns' => [
                [
                    'title' => 'Explore',
                    'links' => [
                        ['label' => 'Home', 'url' => '/'],
                        ['label' => 'Coaching', 'url' => '/coaching'],
                        ['label' => 'How it works', 'url' => '/coaching'],
                        ['label' => 'Pricing', 'url' => '/pricing'],
                    ],
                ],
                [
                    'title' => 'Company',
                    'links' => [
                        ['label' => 'Our Trainers', 'url' => '/trainers'],
                        ['label' => 'Contact', 'url' => '/contact'],
                    ],
                ],
                [
                    'title' => 'Programs',
                    'links' => [
                        ['label' => 'One-on-one', 'url' => '/coaching'],
                        ['label' => 'Small group', 'url' => '/coaching'],
                        ['label' => 'Online coaching', 'url' => '/coaching'],
                    ],
                ],
            ],
            'newsletterHeading' => 'Stay up to date with our latest news',
            'newsletterLabel' => 'Sign up',
            'formId' => '',
            'bannerHeading' => 'Let’s begin',
            'bannerImage' => TemplateContent::photo('1544367567-0f2fcb009e0b', 1600),
            'copyright' => '© '.date('Y').' Curalo. All rights reserved.',
            'privacyLabel' => 'Privacy Policy',
            'privacyUrl' => '#',
            'termsLabel' => 'Terms of Service',
            'termsUrl' => '#',
        ]);
    }

    /** @return list<array<string, mixed>> */
    private static function partners(): array
    {
        return [
            ['label' => 'Northline'],
            ['label' => 'Fairpoint'],
            ['label' => 'Vantage Labs'],
            ['label' => 'Solstice'],
            ['label' => 'Marrow Co'],
            ['label' => 'Kindling'],
            ['label' => 'Haus & Co'],
        ];
    }

    /** @return list<array<string, mixed>> */
    private static function coaches(): array
    {
        return [
            [
                'name' => 'Jessica Haywood',
                'role' => 'Head Coach & Founder',
                'bio' => 'Jessica founded Curalo to make expert personal training approachable, personal and results-driven for everyone.',
                'image' => TemplateContent::photo('1544005313-94ddf0286df2', 600),
                'social' => [
                    ['icon' => 'instagram', 'url' => '#'],
                    ['icon' => 'twitter', 'url' => '#'],
                ],
            ],
            [
                'name' => 'Jordan Lee',
                'role' => 'Strength Coach',
                'bio' => 'Jordan specialises in building strength and confidence through progressive, sustainable training.',
                'image' => TemplateContent::photo('1506794778202-cad84cf45f1d', 600),
                'social' => [
                    ['icon' => 'instagram', 'url' => '#'],
                    ['icon' => 'twitter', 'url' => '#'],
                ],
            ],
            [
                'name' => 'Sam Taylor',
                'role' => 'Wellness Coach',
                'bio' => 'Sam helps clients build healthy habits that last, balancing training with everyday life.',
                'image' => TemplateContent::photo('1594381898411-846e7d193883', 600),
                'social' => [
                    ['icon' => 'instagram', 'url' => '#'],
                    ['icon' => 'twitter', 'url' => '#'],
                ],
            ],
        ];
    }

    /** @return list<array<string, mixed>> */
    private static function testimonials(): array
    {
        return [
            [
                'text' => 'Curalo completely changed how I think about training. I’m stronger and more confident than I’ve ever been.',
                'name' => 'Mia Chen',
                'role' => 'Client for 18 months',
            ],
            [
                'text' => 'The coaching is personal and the accountability keeps me showing up every single week.',
                'name' => 'James Park',
                'role' => 'Client for 6 months',
            ],
            [
                'text' => 'I came in as a complete beginner and now training is a part of my routine I actually look forward to.',
                'name' => 'Priya Nair',
                'role' => 'Client for 12 months',
            ],
        ];
    }

    /** @return list<array<string, mixed>> */
    private static function plans(): array
    {
        $features = "Feature text goes here\nFeature text goes here\nFeature text goes here\nFeature text goes here";

        return [
            [
                'icon' => 'users',
                'name' => 'Basic Plan',
                'subtitle' => 'For individuals',
                'price' => '$19',
                'period' => '/mo',
                'yearlyNote' => 'or $180 yearly',
                'features' => $features,
                'buttonLabel' => 'Get started',
                'buttonUrl' => '/contact',
                'featured' => false,
            ],
            [
                'icon' => 'briefcase',
                'name' => 'Business Plan',
                'subtitle' => 'For growing teams',
                'price' => '$29',
                'period' => '/mo',
                'yearlyNote' => 'or $280 yearly',
                'features' => $features,
                'buttonLabel' => 'Get started',
                'buttonUrl' => '/contact',
                'featured' => true,
            ],
            [
                'icon' => 'globe',
                'name' => 'Enterprise Plan',
                'subtitle' => 'For large teams',
                'price' => '$49',
                'period' => '/mo',
                'yearlyNote' => 'or $480 yearly',
                'features' => $features,
                'buttonLabel' => 'Get started',
                'buttonUrl' => '/contact',
                'featured' => false,
            ],
        ];
    }

    /** @return list<array<string, mixed>> */
    private static function faq(): array
    {
        return [
            ['question' => 'Do I need experience to train with Curalo?', 'answer' => 'No. Every program is tailored to your level, whether you’re a complete beginner or an experienced lifter.'],
            ['question' => 'What should I bring to my first session?', 'answer' => 'Just comfortable training clothes and water. We’ll handle the plan and the equipment.'],
            ['question' => 'How often should I train?', 'answer' => 'It depends on your goals and schedule. Most clients train two to three times a week, and we’ll build a plan that fits.'],
            ['question' => 'What if I need to pause or cancel?', 'answer' => 'Life happens. We offer flexible scheduling and easy options to pause or adjust your plan when you need to.'],
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        return [
            self::home(),
            self::coaching(),
            self::pricing(),
            self::trainers(),
            self::contact(),
        ];
    }

    /** @return array<string, mixed> */
    private static function home(): array
    {
        return TemplateContent::sitePage('Home', 'home', true, self::nav(), [
            TemplateContent::section('hero', 'hero.curalo', array_merge(self::motion(0, 'load'), [
                'heading' => 'Every interaction coached for your lifestyle',
                'description' => 'Curalo is personal training built around you. Tailored coaching that helps you get stronger, healthier and more confident.',
                'buttonLabel' => 'Book a Consultation',
                'buttonUrl' => '/contact',
                'secondaryLabel' => 'Pricing options',
                'secondaryUrl' => '/pricing',
                'backgroundImage' => TemplateContent::photo('1552674605-db6ffd4facb5', 1800),
            ])),
            TemplateContent::section('logos', 'logos.curalo', array_merge(self::motion(0), [
                'heading' => 'Teams already running our programs',
                'items' => self::partners(),
            ])),
            TemplateContent::section('intro', 'intro.curalo', array_merge(self::motion(0), [
                'image' => TemplateContent::photo('1571731956672-f2b94d7dd0cb', 900),
            ])),
            TemplateContent::section('services', 'services.curalo', array_merge(self::motion(0), [
                'items' => [
                    [
                        'title' => 'Community',
                        'text' => 'Training with a crew that keeps you honest and shows up for you. You’ll train alongside people chasing the same goals, so the energy and support carry you still further.',
                        'image' => TemplateContent::photo('1583454110551-21f2fa2afe61', 700),
                    ],
                    [
                        'title' => 'Nutrition plans',
                        'text' => 'Meal-prepped plans built around your goals and the food you love. Every week you get a clear eating plan, so fuelling your training never becomes guesswork.',
                        'image' => TemplateContent::photo('1490645935967-10de6ba17061', 700),
                    ],
                    [
                        'title' => 'Progression',
                        'text' => 'Progress you can see and feel tracked week after week. We log your lifts and measurements so you always know you’re getting stronger and moving forward.',
                        'image' => TemplateContent::photo('1517963879433-6ad2b056d712', 700),
                    ],
                ],
            ])),
            TemplateContent::section('nutrition', 'cta.curalo', array_merge(self::motion(0), [
                'backgroundImage' => TemplateContent::photo('1490645935967-10de6ba17061', 1800),
            ])),
            TemplateContent::section('team', 'team.curalo', array_merge(self::motion(0), [
                'items' => self::coaches(),
            ])),
            TemplateContent::section('results', 'testimonials.curalo', array_merge(self::motion(0), [
                'items' => self::testimonials(),
            ])),
            TemplateContent::section('pricing', 'pricing.curalo', array_merge(self::motion(0), [
                'items' => self::plans(),
            ])),
            TemplateContent::section('faq', 'faq.curalo', array_merge(self::motion(0), [
                'items' => self::faq(),
            ])),
        ], self::footer(), 'footer.curalo', 'navbar.curalo');
    }

    /** @return array<string, mixed> */
    private static function coaching(): array
    {
        return TemplateContent::sitePage('Coaching', 'coaching', false, self::nav(), [
            TemplateContent::section('hero', 'hero.curalo', array_merge(self::motion(0, 'load'), [
                'heading' => 'Coaching built around your life',
                'description' => 'Every plan starts with how you actually move, eat and recover — not a generic program that ignores it.',
                'buttonLabel' => 'Book a Consultation',
                'buttonUrl' => '/contact',
                'secondaryLabel' => 'See pricing',
                'secondaryUrl' => '/pricing',
                'backgroundImage' => TemplateContent::photo('1550345332-09e3ac987658', 1800),
                'minHeight' => 420,
            ])),
            TemplateContent::section('intro', 'intro.curalo', array_merge(self::motion(0), [
                'image' => TemplateContent::photo('1517838277536-f5f99be501cd', 900),
            ])),
            TemplateContent::section('services', 'services.curalo', array_merge(self::motion(0), [
                'items' => [
                    [
                        'title' => 'Community',
                        'text' => 'Training with a crew that keeps you honest and shows up for you. You’ll train alongside people chasing the same goals, so the energy and support carry you still further.',
                        'image' => TemplateContent::photo('1583454110551-21f2fa2afe61', 700),
                    ],
                    [
                        'title' => 'Nutrition plans',
                        'text' => 'Meal-prepped plans built around your goals and the food you love. Every week you get a clear eating plan, so fuelling your training never becomes guesswork.',
                        'image' => TemplateContent::photo('1490645935967-10de6ba17061', 700),
                    ],
                    [
                        'title' => 'Progression',
                        'text' => 'Progress you can see and feel tracked week after week. We log your lifts and measurements so you always know you’re getting stronger and moving forward.',
                        'image' => TemplateContent::photo('1517963879433-6ad2b056d712', 700),
                    ],
                ],
            ])),
            TemplateContent::section('results', 'testimonials.curalo', array_merge(self::motion(0), [
                'items' => self::testimonials(),
            ])),
            TemplateContent::section('cta', 'cta.curalo', array_merge(self::motion(0), [
                'eyebrow' => 'Ready when you are',
                'heading' => 'Start with a free consultation',
                'description' => 'Fifteen minutes, no pressure — we will tell you honestly whether Curalo is the right fit.',
                'buttonLabel' => 'Book a Consultation',
                'buttonUrl' => '/contact',
                'backgroundImage' => TemplateContent::photo('1571019613454-1cb2f99b2d8b', 1800),
            ])),
        ], self::footer(), 'footer.curalo', 'navbar.curalo');
    }

    /** @return array<string, mixed> */
    private static function pricing(): array
    {
        return TemplateContent::sitePage('Pricing', 'pricing', false, self::nav(), [
            TemplateContent::section('hero', 'hero.curalo', array_merge(self::motion(0, 'load'), [
                'heading' => 'Simple, transparent pricing',
                'description' => 'Choose the coaching option that fits your goals and your budget.',
                'buttonLabel' => 'Book a Consultation',
                'buttonUrl' => '/contact',
                'secondaryLabel' => '',
                'secondaryUrl' => '',
                'backgroundImage' => TemplateContent::photo('1517838277536-f5f99be501cd', 1800),
                'minHeight' => 380,
            ])),
            TemplateContent::section('pricing', 'pricing.curalo', array_merge(self::motion(0), [
                'items' => self::plans(),
            ])),
            TemplateContent::section('faq', 'faq.curalo', array_merge(self::motion(0), [
                'items' => self::faq(),
            ])),
        ], self::footer(), 'footer.curalo', 'navbar.curalo');
    }

    /** @return array<string, mixed> */
    private static function trainers(): array
    {
        return TemplateContent::sitePage('Our Trainers', 'trainers', false, self::nav(), [
            TemplateContent::section('hero', 'hero.curalo', array_merge(self::motion(0, 'load'), [
                'heading' => 'Meet your coaches',
                'description' => 'Every coach is dedicated, certified and genuinely invested in how you feel week to week.',
                'buttonLabel' => 'Book a Consultation',
                'buttonUrl' => '/contact',
                'secondaryLabel' => '',
                'secondaryUrl' => '',
                'backgroundImage' => TemplateContent::photo('1571019613454-1cb2f99b2d8b', 1800),
                'minHeight' => 380,
            ])),
            TemplateContent::section('team', 'team.curalo', array_merge(self::motion(0), [
                'items' => self::coaches(),
            ])),
            TemplateContent::section('results', 'testimonials.curalo', array_merge(self::motion(0), [
                'items' => self::testimonials(),
            ])),
        ], self::footer(), 'footer.curalo', 'navbar.curalo');
    }

    /** @return array<string, mixed> */
    private static function contact(): array
    {
        return TemplateContent::sitePage('Contact', 'contact', false, self::nav(), [
            TemplateContent::section('hero', 'hero.curalo', array_merge(self::motion(0, 'load'), [
                'heading' => 'Let’s start your first session',
                'description' => 'Tell us about your goals and we will come back with a plan within one business day.',
                'buttonLabel' => '',
                'buttonUrl' => '',
                'secondaryLabel' => '',
                'secondaryUrl' => '',
                'backgroundImage' => TemplateContent::photo('1517836357463-d25dfeac3438', 1800),
                'minHeight' => 340,
            ])),
            TemplateContent::section('form', 'form.appointment', array_merge(self::motion(0), [
                'eyebrow' => '',
                'heading' => 'Book a Consultation',
                'description' => 'Pick a time. We confirm by email the same day.',
                'buttonLabel' => 'Book a Consultation',
            ])),
            TemplateContent::section('faq', 'faq.curalo', array_merge(self::motion(0), [
                'heading' => 'Still deciding?',
                'items' => self::faq(),
                'closingHeading' => '',
                'closingText' => '',
                'closingButtonLabel' => '',
            ])),
        ], self::footer(), 'footer.curalo', 'navbar.curalo');
    }
}
