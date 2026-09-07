<?php

namespace Database\Seeders;

/**
 * Finlio — a personal-finance and fintech SaaS template, ported from the
 * "BeFinance" design (themes.muffingroup.com/be/finance5).
 *
 * Five pages (Home, About, Features, Pricing, Contact) built from the
 * `*.finlio` block family: a pale-cream page shows between big rounded
 * dark-green card sections, one bright lime-green accent lights highlighted
 * words, buttons and stat gradients, and confident medium-weight Archivo
 * type throughout.
 */
class TemplateFinlio
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#183835',
            'secondary' => '#183835',
            'accent' => '#84f18f',
            'background' => '#ebece0',
            'surface' => '#f8faf6',
            'text' => '#183835',
            'muted' => '#57706c',
            'headingFont' => '"Archivo", system-ui, -apple-system, sans-serif',
            'bodyFont' => '"Archivo", system-ui, -apple-system, sans-serif',
            'serifFont' => '"Archivo", system-ui, sans-serif',
            'monoFont' => 'ui-monospace, monospace',
            'headingWeight' => 500,
            'bodyWeight' => 400,
            'buttonRadius' => '999px',
            'cardRadius' => '32px',
            'containerWidth' => '1200px',
            'sectionSpacing' => '80px',
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
            'logo' => 'Finlio',
            'tagline' => 'Your finances, our mission',
            'logoImage' => '',
            'logoUrl' => '/',
            'links' => [
                ['label' => 'Home', 'url' => '/'],
                ['label' => 'Features', 'url' => '/features'],
                ['label' => 'Pricing', 'url' => '/pricing'],
                ['label' => 'About', 'url' => '/about'],
                ['label' => 'Contact', 'url' => '/contact'],
            ],
            'buttonLabel' => 'Start 30 day trial',
            'buttonUrl' => '/contact',
            'sticky' => true,
        ];
    }

    /** @return array<string, mixed> */
    private static function footer(): array
    {
        return array_merge(self::motion(20), [
            'logo' => 'Finlio',
            'logoImage' => '',
            'logoUrl' => '/',
            'description' => 'A calmer way to manage money — budgets, savings and investing in one place.',
            'columns' => [
                [
                    'title' => 'Product',
                    'links' => [
                        ['label' => 'Overview', 'url' => '/'],
                        ['label' => 'Features', 'url' => '/features'],
                        ['label' => 'Pricing', 'url' => '/pricing'],
                        ['label' => 'Releases', 'url' => '#'],
                    ],
                ],
                [
                    'title' => 'Company',
                    'links' => [
                        ['label' => 'About', 'url' => '/about'],
                        ['label' => 'News', 'url' => '#'],
                        ['label' => 'Media kit', 'url' => '#'],
                        ['label' => 'Contact', 'url' => '/contact'],
                    ],
                ],
                [
                    'title' => 'Resources',
                    'links' => [
                        ['label' => 'Blog', 'url' => '#'],
                        ['label' => 'Help center', 'url' => '#'],
                        ['label' => 'Support', 'url' => '/contact'],
                    ],
                ],
            ],
            'copyright' => 'Finlio. All Rights Reserved.',
        ]);
    }

    /** @return array<string, mixed> */
    private static function pageHead(string $heading): array
    {
        return array_merge(self::motion(0, 'load'), [
            'heading' => $heading,
            'homeLabel' => 'Home',
            'homeUrl' => '/',
            'parentLabel' => 'Pages',
        ]);
    }

    /** @return array<string, mixed> */
    private static function featuresProps(): array
    {
        return array_merge(self::motion(0), [
            'anchorId' => 'features',
        ]);
    }

    /** @return array<string, mixed> */
    private static function testimonialsProps(): array
    {
        return array_merge(self::motion(0), [
            'items' => [
                [
                    'badge' => 'Confirmed Purchase',
                    'quote' => 'This is the best financial management app I have ever used. I no longer just track expenses — I plan investments and save for real goals, and it has changed my financial life for the better.',
                    'name' => 'Jack Butterbean',
                    'avatar' => TemplateContent::photo('1500648767791-00dcc994a43e', 200),
                ],
                [
                    'badge' => 'Confirmed Purchase',
                    'quote' => 'I had never managed to stay on budget before, but this app made it possible. The spending analysis is intuitive and it genuinely helped me understand where my money was going.',
                    'name' => 'Elizabeth Severalson',
                    'avatar' => TemplateContent::photo('1531123897727-8f129e1688ce', 200),
                ],
                [
                    'badge' => 'Confirmed Purchase',
                    'quote' => 'This app changed my whole approach to finance. I can track spending, build budgets and reach savings goals in one place — I recommend it to anyone who wants control of their money.',
                    'name' => 'Markus Stanford',
                    'avatar' => TemplateContent::photo('1507003211169-0a1dd7228f2d', 200),
                ],
            ],
        ]);
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        return [
            self::home(),
            self::about(),
            self::features(),
            self::pricing(),
            self::contact(),
        ];
    }

    /** @return array<string, mixed> */
    private static function home(): array
    {
        return TemplateContent::sitePage('Home', 'home', true, self::nav(), [
            TemplateContent::section('hero', 'hero.finlio', array_merge(self::motion(0, 'load'), [
                'image' => TemplateContent::photo('1595986630530-969786b19b4d', 900),
            ])),
            TemplateContent::section('intro', 'intro.finlio', self::motion(0)),
            TemplateContent::section('features', 'features.finlio', self::featuresProps()),
            TemplateContent::section('statement', 'statement.finlio', array_merge(self::motion(0), [
                'videoImage' => TemplateContent::photo('1558417612-c8e3eb2dbc00', 1400),
            ])),
            TemplateContent::section('stats', 'stats.finlio', self::motion(0)),
            TemplateContent::section('reviews', 'testimonials.finlio', self::testimonialsProps()),
            TemplateContent::section('payments', 'payments.finlio', self::motion(0)),
            TemplateContent::section('faq', 'faq.finlio', self::motion(0)),
            TemplateContent::section('cta', 'cta.finlio', array_merge(self::motion(0), [
                'backgroundImage' => TemplateContent::photo('1543269865-ae68c7862de4', 1600),
            ])),
        ], self::footer(), 'footer.finlio', 'navbar.finlio');
    }

    /** @return array<string, mixed> */
    private static function about(): array
    {
        return TemplateContent::sitePage('About', 'about', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.finlio', self::pageHead('About Us')),
            TemplateContent::section('intro', 'intro.finlio', array_merge(self::motion(0), [
                'heading' => 'We think managing money',
                'headingHighlight' => 'should feel calm',
                'description' => "Finlio started as a side project to fix our own budgeting spreadsheet. Today it's the calm, self-serve way over 4,000 startups and households convert saving intentions into savings.",
            ])),
            TemplateContent::section('statement', 'statement.finlio', array_merge(self::motion(0), [
                'videoImage' => TemplateContent::photo('1558417612-c8e3eb2dbc00', 1400),
            ])),
            TemplateContent::section('stats', 'stats.finlio', self::motion(0)),
            TemplateContent::section('reviews', 'testimonials.finlio', self::testimonialsProps()),
        ], self::footer(), 'footer.finlio', 'navbar.finlio');
    }

    /** @return array<string, mixed> */
    private static function features(): array
    {
        return TemplateContent::sitePage('Features', 'features', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.finlio', self::pageHead('Features')),
            TemplateContent::section('features', 'features.finlio', self::featuresProps()),
            TemplateContent::section('payments', 'payments.finlio', self::motion(0)),
            TemplateContent::section('cta', 'cta.finlio', array_merge(self::motion(0), [
                'backgroundImage' => TemplateContent::photo('1543269865-ae68c7862de4', 1600),
            ])),
        ], self::footer(), 'footer.finlio', 'navbar.finlio');
    }

    /** @return array<string, mixed> */
    private static function pricing(): array
    {
        return TemplateContent::sitePage('Pricing', 'pricing', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.finlio', self::pageHead('Pricing')),
            TemplateContent::section('pricing', 'pricing.three_columns', self::motion(0)),
            TemplateContent::section('faq', 'faq.finlio', self::motion(0)),
        ], self::footer(), 'footer.finlio', 'navbar.finlio');
    }

    /** @return array<string, mixed> */
    private static function contact(): array
    {
        return TemplateContent::sitePage('Contact', 'contact', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.finlio', self::pageHead('Contact Us')),
            TemplateContent::section('contact', 'form.contact', array_merge(self::motion(0), [
                'eyebrow' => 'Contact',
                'heading' => 'Talk to the Finlio team',
                'description' => 'Questions about billing, features or a partnership — send a message and we will reply within one business day.',
                'buttonLabel' => 'Send message',
                'details' => [
                    ['icon' => 'map-pin', 'label' => 'Studio', 'value' => '88 Ledger Street, Austin, TX 78701'],
                    ['icon' => 'phone', 'label' => 'Phone', 'value' => '+1 (800) 555 0148', 'url' => 'tel:+18005550148'],
                    ['icon' => 'mail', 'label' => 'Email', 'value' => 'hello@finlio.example', 'url' => 'mailto:hello@finlio.example'],
                ],
                'bullets' => "Real support from people who use the product\nNo sales calls unless you ask for one\nAverage reply time under one business day",
            ])),
            TemplateContent::section('map', 'content.map', array_merge(self::motion(0), [
                'heading' => '',
                'description' => '',
                'height' => 400,
                'mapUrl' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d221199.85403430295!2d-97.94858976093751!3d30.307092399999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b599a0cc032f%3A0x5d9b464bd469d57a!2sAustin%2C%20TX!5e0!3m2!1sen!2sus!4v1694259649153!5m2!1sen!2sus',
            ])),
        ], self::footer(), 'footer.finlio', 'navbar.finlio');
    }
}
