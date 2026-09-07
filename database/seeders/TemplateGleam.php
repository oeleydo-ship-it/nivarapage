<?php

namespace Database\Seeders;

/**
 * Gleam — a home and office cleaning-services template, ported from the
 * "Cleaner" design (cleaner-nextjs.vercel.app).
 *
 * Five pages (Home, About, Services, Blog, Contact) built from the
 * `*.gleam` block family: a playful, high-contrast palette of one bold
 * indigo-violet and one warm yellow over navy-ink headlines, fully-pill
 * buttons, big rounded Rubik type, and full-bleed photography with a light
 * wash instead of a dark scrim.
 */
class TemplateGleam
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#443dfc',
            'secondary' => '#443dfc',
            'accent' => '#fed00e',
            'background' => '#ffffff',
            'surface' => '#fafafb',
            'text' => '#0e0d39',
            'muted' => '#5c5b82',
            'headingFont' => '"Rubik", system-ui, -apple-system, sans-serif',
            'bodyFont' => '"Rubik", system-ui, -apple-system, sans-serif',
            'serifFont' => '"Rubik", system-ui, sans-serif',
            'monoFont' => 'ui-monospace, monospace',
            'headingWeight' => 600,
            'bodyWeight' => 400,
            'buttonRadius' => '999px',
            'cardRadius' => '16px',
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
            'animationDuration' => 620,
            'animationDelay' => $delay,
        ];
    }

    /** @return array<string, mixed> */
    private static function nav(): array
    {
        return [
            'topLabel' => 'Need a quick clean?',
            'topPhoneLabel' => 'Call Us:',
            'topPhone' => '+1 (555) 240 8890',
            'logo' => 'Gleam',
            'logoImage' => '',
            'logoUrl' => '/',
            'links' => [
                ['label' => 'Home', 'url' => '/'],
                ['label' => 'About', 'url' => '/about'],
                ['label' => 'Services', 'url' => '/services'],
                ['label' => 'Blog', 'url' => '/blog'],
                ['label' => 'Contact', 'url' => '/contact'],
            ],
            'buttonLabel' => 'Make An Appointment',
            'buttonUrl' => '/contact',
            'sticky' => true,
        ];
    }

    /** @return array<string, mixed> */
    private static function footer(): array
    {
        return array_merge(self::motion(20), [
            'logo' => 'Gleam',
            'logoImage' => '',
            'logoUrl' => '/',
            'social' => [
                ['icon' => 'facebook', 'url' => '#'],
                ['icon' => 'twitter', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
            ],
            'columns' => [
                [
                    'title' => 'Pages',
                    'links' => [
                        ['label' => 'Home', 'url' => '/'],
                        ['label' => 'Services', 'url' => '/services'],
                        ['label' => 'About Us', 'url' => '/about'],
                        ['label' => 'Contact', 'url' => '/contact'],
                    ],
                ],
                [
                    'title' => 'Services',
                    'links' => [
                        ['label' => 'Home Cleaning', 'url' => '/services'],
                        ['label' => 'Window Cleaning', 'url' => '/services'],
                        ['label' => 'Pest Control', 'url' => '/services'],
                        ['label' => 'Floor Cleaning', 'url' => '/services'],
                    ],
                ],
            ],
            'copyright' => 'Gleam. All rights reserved.',
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
    private static function aboutProps(): array
    {
        return array_merge(self::motion(0), [
            'anchorId' => 'about',
            'image' => TemplateContent::photo('1499916078039-922301b0eb9b', 1000),
            'image2' => TemplateContent::photo('1584622650111-993a426fbf0a', 700),
        ]);
    }

    /** @return array<string, mixed> */
    private static function servicesProps(): array
    {
        return array_merge(self::motion(0), [
            'anchorId' => 'services',
        ]);
    }

    /** @return array<string, mixed> */
    private static function reviewsProps(): array
    {
        return array_merge(self::motion(0), [
            'items' => [
                [
                    'quote' => 'Gleam is the best cleaning service we have used. They cover everything from our home to the office, and always leave the place looking its best.',
                    'name' => 'Jack Morrison',
                    'meta' => '36, New York',
                    'avatar' => TemplateContent::photo('1500648767791-00dcc994a43e', 200),
                ],
                [
                    'quote' => 'Their team turned up on time, worked fast and were genuinely careful with our things. Booking again was an easy decision.',
                    'name' => 'Diane Osei',
                    'meta' => '41, Chicago',
                    'avatar' => TemplateContent::photo('1531123897727-8f129e1688ce', 200),
                ],
                [
                    'quote' => 'We switched our office contract to Gleam after one trial clean. Consistent, on schedule, and the invoicing is painless.',
                    'name' => 'Marco Lindqvist',
                    'meta' => '29, Boston',
                    'avatar' => TemplateContent::photo('1506794778202-cad84cf45f1d', 200),
                ],
            ],
        ]);
    }

    /** @return array<string, mixed> */
    private static function blogProps(): array
    {
        return array_merge(self::motion(0), [
            'anchorId' => 'blog',
            'items' => [
                [
                    'category' => 'Kitchen',
                    'date' => 'April 04, 2025',
                    'title' => 'The secret of cleaning your kitchen.',
                    'image' => TemplateContent::photo('1585421514284-efb74c2b69ba', 700),
                    'url' => '/blog',
                ],
                [
                    'category' => 'Apartment',
                    'date' => 'April 04, 2025',
                    'title' => 'How to clean wooden floors without creating dust.',
                    'image' => TemplateContent::photo('1628177142898-93e36e4e3a50', 700),
                    'url' => '/blog',
                ],
                [
                    'category' => 'Office',
                    'date' => 'April 04, 2025',
                    'title' => 'The secret of cleaning your wooden furniture.',
                    'image' => TemplateContent::photo('1527515637462-cff94eecc1ac', 700),
                    'url' => '/blog',
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
            self::services(),
            self::blog(),
            self::contact(),
        ];
    }

    /** @return array<string, mixed> */
    private static function home(): array
    {
        return TemplateContent::sitePage('Home', 'home', true, self::nav(), [
            TemplateContent::section('hero', 'hero.gleam', array_merge(self::motion(0, 'load'), [
                'backgroundImage' => TemplateContent::photo('1581578731548-c64695cc6952', 1800),
            ])),
            TemplateContent::section('services', 'services.gleam', self::servicesProps()),
            TemplateContent::section('about', 'about.gleam', self::aboutProps()),
            TemplateContent::section('features', 'features.gleam', array_merge(self::motion(0), [
                'image' => TemplateContent::photo('1580842402762-6f5868c17412', 1800),
            ])),
            TemplateContent::section('stats', 'stats.gleam', self::motion(0)),
            TemplateContent::section('reviews', 'testimonials.gleam', self::reviewsProps()),
            TemplateContent::section('blog', 'blog.gleam', self::blogProps()),
            TemplateContent::section('contact', 'cta.gleam', array_merge(self::motion(0), [
                'buttonUrl' => '/contact',
            ])),
        ], self::footer(), 'footer.gleam', 'navbar.gleam');
    }

    /** @return array<string, mixed> */
    private static function about(): array
    {
        return TemplateContent::sitePage('About', 'about', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.gleam', self::pageHead('About Us')),
            TemplateContent::section('about', 'about.gleam', self::aboutProps()),
            TemplateContent::section('features', 'features.gleam', array_merge(self::motion(0), [
                'image' => TemplateContent::photo('1580842402762-6f5868c17412', 1800),
            ])),
            TemplateContent::section('stats', 'stats.gleam', self::motion(0)),
            TemplateContent::section('reviews', 'testimonials.gleam', self::reviewsProps()),
        ], self::footer(), 'footer.gleam', 'navbar.gleam');
    }

    /** @return array<string, mixed> */
    private static function services(): array
    {
        return TemplateContent::sitePage('Services', 'services', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.gleam', self::pageHead('Our Services')),
            TemplateContent::section('services', 'services.gleam', self::servicesProps()),
            TemplateContent::section('contact', 'cta.gleam', array_merge(self::motion(0), [
                'buttonUrl' => '/contact',
            ])),
        ], self::footer(), 'footer.gleam', 'navbar.gleam');
    }

    /** @return array<string, mixed> */
    private static function blog(): array
    {
        return TemplateContent::sitePage('Blog', 'blog', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.gleam', self::pageHead('Our Blog')),
            TemplateContent::section('blog', 'blog.gleam', self::blogProps()),
        ], self::footer(), 'footer.gleam', 'navbar.gleam');
    }

    /** @return array<string, mixed> */
    private static function contact(): array
    {
        return TemplateContent::sitePage('Contact', 'contact', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.gleam', self::pageHead('Contact Us')),
            TemplateContent::section('contact', 'form.contact', array_merge(self::motion(0), [
                'eyebrow' => 'Contact',
                'heading' => 'Discuss our services or make an appointment',
                'description' => 'Tell us what needs cleaning and we will get back to you with a time and a price the same day.',
                'buttonLabel' => 'Make An Appointment',
                'details' => [
                    ['icon' => 'map-pin', 'label' => 'Studio', 'value' => '84 Fulton Street, Boston, MA 02109'],
                    ['icon' => 'phone', 'label' => 'Phone', 'value' => '+1 (555) 240 8890', 'url' => 'tel:+15552408890'],
                    ['icon' => 'mail', 'label' => 'Email', 'value' => 'hello@gleam.example', 'url' => 'mailto:hello@gleam.example'],
                ],
                'bullets' => "Same-day quotes, most jobs booked within 48 hours\nBackground-checked, insured cleaners\nSatisfaction guarantee on every visit",
            ])),
            TemplateContent::section('map', 'content.map', array_merge(self::motion(0), [
                'heading' => '',
                'description' => '',
                'height' => 400,
                'mapUrl' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d188937.05006984395!2d-71.14892624863276!3d42.31589319757948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e370a5b2513f79%3A0x27e8a04d1a5c0c9!2sBoston%2C%20MA!5e0!3m2!1sen!2sus!4v1694259649153!5m2!1sen!2sus',
            ])),
        ], self::footer(), 'footer.gleam', 'navbar.gleam');
    }
}
