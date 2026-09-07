<?php

namespace Database\Seeders;

/**
 * Salone — a beauty-salon and spa template, ported from the free "Salone"
 * HTML template by HTML Codex (CC BY 4.0 — the footer credit link this
 * seeder writes must stay intact per that licence).
 *
 * Six pages (Home, About, Service, Team, Testimonial, Contact) built from
 * the `*.salone` block family: a warm cream sheet broken only by a
 * near-black footer, one antique-gold accent on every button and icon,
 * Playfair Display serif headlines over Work Sans body copy, and a Dancing
 * Script cursive kicker above every section heading.
 */
class TemplateSalone
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#bf9456',
            'secondary' => '#252525',
            'accent' => '#bf9456',
            'background' => '#ffffff',
            'surface' => '#f8f7f4',
            'text' => '#252525',
            'muted' => '#6b6b6b',
            'headingFont' => '"Playfair Display", Georgia, serif',
            'bodyFont' => '"Work Sans", system-ui, sans-serif',
            'serifFont' => '"Playfair Display", Georgia, serif',
            'monoFont' => 'ui-monospace, monospace',
            'headingWeight' => 500,
            'bodyWeight' => 400,
            'buttonRadius' => '2px',
            'cardRadius' => '0px',
            'containerWidth' => '1140px',
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
            'logo' => 'Salone',
            'logoImage' => '',
            'logoUrl' => '/',
            'links' => [
                ['label' => 'Home', 'url' => '/'],
                ['label' => 'About', 'url' => '/about'],
                ['label' => 'Service', 'url' => '/service'],
                ['label' => 'Pages', 'url' => '/team', 'children' => [
                    ['label' => 'Our Team', 'url' => '/team'],
                    ['label' => 'Testimonial', 'url' => '/testimonial'],
                ]],
                ['label' => 'Contact', 'url' => '/contact'],
            ],
            'buttonLabel' => 'Book Appointment',
            'buttonUrl' => '/contact',
            'sticky' => true,
        ];
    }

    /** @return array<string, mixed> */
    private static function footer(): array
    {
        return array_merge(self::motion(20), [
            'logo' => 'Salone',
            'logoImage' => '',
            'logoUrl' => '/',
            'description' => 'A neighbourhood salon built on one idea: everyone leaves looking like the best version of themselves. Book a chair, a chat and a coffee while you are at it.',
            'address' => '123 Street, New York, USA',
            'phone' => '+012 345 67890',
            'email' => 'info@example.com',
            'social' => [
                ['icon' => 'twitter', 'url' => '#'],
                ['icon' => 'facebook', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
                ['icon' => 'instagram', 'url' => '#'],
            ],
            'columns' => [
                [
                    'title' => 'Quick Links',
                    'links' => [
                        ['label' => 'About Us', 'url' => '/about'],
                        ['label' => 'Contact Us', 'url' => '/contact'],
                        ['label' => 'Our Services', 'url' => '/service'],
                        ['label' => 'Terms & Condition', 'url' => '#'],
                    ],
                ],
                [
                    'title' => 'Popular Links',
                    'links' => [
                        ['label' => 'Our Team', 'url' => '/team'],
                        ['label' => 'Testimonial', 'url' => '/testimonial'],
                        ['label' => 'Our Services', 'url' => '/service'],
                        ['label' => 'Book Appointment', 'url' => '/contact'],
                    ],
                ],
            ],
            'newsletterHeading' => 'Newsletter',
            'newsletterText' => 'Get seasonal offers and stylist availability by email.',
            'newsletterLabel' => 'Sign up',
            'formId' => '',
            'copyright' => 'Salone, All Right Reserved.',
            'creditLabel' => 'Designed By HTML Codex',
            'creditUrl' => 'https://htmlcodex.com',
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
            'backgroundImage' => TemplateContent::photo('1560066984-138dadb4c035', 1800),
        ]);
    }

    /** @return list<array<string, mixed>> */
    private static function specialists(): array
    {
        return [
            [
                'name' => 'Lily Taylor',
                'role' => 'Hair Specialist',
                'image' => TemplateContent::photo('1544005313-94ddf0286df2', 600),
                'social' => [
                    ['icon' => 'facebook', 'url' => '#'],
                    ['icon' => 'instagram', 'url' => '#'],
                    ['icon' => 'linkedin', 'url' => '#'],
                ],
            ],
            [
                'name' => 'Olivia Smith',
                'role' => 'Nail Designer',
                'image' => TemplateContent::photo('1544725176-7c40e5a71c5e', 600),
                'social' => [
                    ['icon' => 'facebook', 'url' => '#'],
                    ['icon' => 'instagram', 'url' => '#'],
                    ['icon' => 'linkedin', 'url' => '#'],
                ],
            ],
            [
                'name' => 'Ava Brown',
                'role' => 'Beauty Specialist',
                'image' => TemplateContent::photo('1487412947147-5cebf100ffc2', 600),
                'social' => [
                    ['icon' => 'facebook', 'url' => '#'],
                    ['icon' => 'instagram', 'url' => '#'],
                    ['icon' => 'linkedin', 'url' => '#'],
                ],
            ],
            [
                'name' => 'Amelia Jones',
                'role' => 'Spa Specialist',
                'image' => TemplateContent::photo('1489424731084-a5d8b219a5bb', 600),
                'social' => [
                    ['icon' => 'facebook', 'url' => '#'],
                    ['icon' => 'instagram', 'url' => '#'],
                    ['icon' => 'linkedin', 'url' => '#'],
                ],
            ],
        ];
    }

    /** @return list<array<string, mixed>> */
    private static function testimonials(): array
    {
        return [
            [
                'text' => 'They listened before they touched a single strand. The colour is exactly what I described, which has never happened anywhere else.',
                'name' => 'Grace Bennett',
                'role' => 'Regular client',
                'image' => TemplateContent::photo('1580489944761-15a19d654956', 200),
            ],
            [
                'text' => 'Booked a facial on a whim and now it is a monthly habit. The room, the pace, the follow-up advice — all of it.',
                'name' => 'Noah Whitfield',
                'role' => 'New client',
                'image' => TemplateContent::photo('1500648767791-00dcc994a43e', 200),
            ],
            [
                'text' => 'My daughter’s bridal party was seven people at once and every single one of us left thrilled with our hair.',
                'name' => 'Sophie Marlow',
                'role' => 'Bride, wedding party',
                'image' => TemplateContent::photo('1595152772835-219674b2a8a6', 200),
            ],
            [
                'text' => 'The manicure held up for three full weeks of a beach holiday. That has never happened before.',
                'name' => 'Ivy Chapman',
                'role' => 'Regular client',
                'image' => TemplateContent::photo('1531123897727-8f129e1688ce', 200),
            ],
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        return [
            self::home(),
            self::about(),
            self::service(),
            self::team(),
            self::testimonial(),
            self::contact(),
        ];
    }

    /** @return array<string, mixed> */
    private static function home(): array
    {
        return TemplateContent::sitePage('Home', 'home', true, self::nav(), [
            TemplateContent::section('hero', 'hero.salone', array_merge(self::motion(0, 'load'), [
                'images' => [
                    ['image' => TemplateContent::photo('1521590832167-7bcbfaa6381f', 1200)],
                    ['image' => TemplateContent::photo('1595476108010-b4d1f102b1b1', 1200)],
                    ['image' => TemplateContent::photo('1595475884562-073c30d45670', 1200)],
                ],
            ])),
            TemplateContent::section('about', 'about.salone', array_merge(self::motion(0), [
                'image' => TemplateContent::photo('1633681926035-ec1ac984418a', 1000),
            ])),
            TemplateContent::section('services', 'services.salone', self::motion(0)),
            TemplateContent::section('team', 'team.salone', array_merge(self::motion(0), [
                'items' => self::specialists(),
            ])),
            TemplateContent::section('results', 'testimonials.salone', array_merge(self::motion(0), [
                'items' => self::testimonials(),
            ])),
        ], self::footer(), 'footer.salone', 'navbar.salone');
    }

    /** @return array<string, mixed> */
    private static function about(): array
    {
        return TemplateContent::sitePage('About', 'about', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.salone', self::pageHead('About Us')),
            TemplateContent::section('about', 'about.salone', array_merge(self::motion(0), [
                'image' => TemplateContent::photo('1633681926035-ec1ac984418a', 1000),
            ])),
            TemplateContent::section('team', 'team.salone', array_merge(self::motion(0), [
                'items' => self::specialists(),
            ])),
        ], self::footer(), 'footer.salone', 'navbar.salone');
    }

    /** @return array<string, mixed> */
    private static function service(): array
    {
        return TemplateContent::sitePage('Service', 'service', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.salone', self::pageHead('Service')),
            TemplateContent::section('services', 'services.salone', self::motion(0)),
        ], self::footer(), 'footer.salone', 'navbar.salone');
    }

    /** @return array<string, mixed> */
    private static function team(): array
    {
        return TemplateContent::sitePage('Our Team', 'team', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.salone', self::pageHead('Our Team')),
            TemplateContent::section('team', 'team.salone', array_merge(self::motion(0), [
                'items' => self::specialists(),
            ])),
        ], self::footer(), 'footer.salone', 'navbar.salone');
    }

    /** @return array<string, mixed> */
    private static function testimonial(): array
    {
        return TemplateContent::sitePage('Testimonial', 'testimonial', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.salone', self::pageHead('Testimonial')),
            TemplateContent::section('results', 'testimonials.salone', array_merge(self::motion(0), [
                'items' => self::testimonials(),
            ])),
        ], self::footer(), 'footer.salone', 'navbar.salone');
    }

    /** @return array<string, mixed> */
    private static function contact(): array
    {
        return TemplateContent::sitePage('Contact', 'contact', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.salone', self::pageHead('Contact')),
            TemplateContent::section('form', 'contact.salone', self::motion(0)),
        ], self::footer(), 'footer.salone', 'navbar.salone');
    }
}
