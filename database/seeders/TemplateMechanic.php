<?php

namespace Database\Seeders;

/**
 * The Mechanic — an auto-repair and garage-services template, ported from
 * the "Avada Mechanic" design (avada.website/mechanic).
 *
 * Five pages (Home, About, Services, Team, Contact) built from the
 * `*.mechanic` block family: a deep navy blue carries every dark band,
 * headline and outline button, one warm gold accent lifts eyebrows and
 * highlights, pill buttons throughout, big bold Epilogue type, and
 * full-bleed workshop photography under numbered service cards.
 */
class TemplateMechanic
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#012b7f',
            'secondary' => '#012b7f',
            'accent' => '#ffdc4b',
            'background' => '#ffffff',
            'surface' => '#f5f7fb',
            'text' => '#0e1420',
            'muted' => '#4a4f5c',
            'headingFont' => '"Epilogue", system-ui, -apple-system, sans-serif',
            'bodyFont' => '"Epilogue", system-ui, -apple-system, sans-serif',
            'serifFont' => '"Epilogue", system-ui, sans-serif',
            'monoFont' => 'ui-monospace, monospace',
            'headingWeight' => 600,
            'bodyWeight' => 400,
            'buttonRadius' => '999px',
            'cardRadius' => '16px',
            'containerWidth' => '1200px',
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
            'topLabel' => 'Opening hours',
            'topHours' => 'Mon-Fri 8h-15h',
            'logo' => 'The Mechanic',
            'logoImage' => '',
            'logoUrl' => '/',
            'links' => [
                ['label' => 'Home', 'url' => '/'],
                ['label' => 'About', 'url' => '/about'],
                ['label' => 'Services', 'url' => '/services'],
                ['label' => 'Team', 'url' => '/team'],
                ['label' => 'Contact', 'url' => '/contact'],
            ],
            'buttonLabel' => 'Need a car inspection?',
            'buttonUrl' => '/contact',
            'sticky' => true,
        ];
    }

    /** @return array<string, mixed> */
    private static function footer(): array
    {
        return array_merge(self::motion(20), [
            'logo' => 'The Mechanic',
            'logoImage' => '',
            'logoUrl' => '/',
            'description' => 'A certified auto-repair shop built on honest diagnostics, fair pricing and mechanics who explain the work.',
            'topLabel' => 'Opening hours',
            'topHours' => 'Mon-Fri 8h-15h',
            'formHeading' => 'Book an appointment',
            'formId' => '',
            'submitLabel' => 'Get an appointment',
            'columns' => [
                [
                    'title' => 'Pages',
                    'links' => [
                        ['label' => 'About', 'url' => '/about'],
                        ['label' => 'Services', 'url' => '/services'],
                        ['label' => 'Team', 'url' => '/team'],
                        ['label' => 'Contact', 'url' => '/contact'],
                    ],
                ],
            ],
            'social' => [
                ['icon' => 'facebook', 'url' => '#'],
                ['icon' => 'instagram', 'url' => '#'],
                ['icon' => 'twitter', 'url' => '#'],
            ],
            'copyright' => 'The Mechanic. All rights reserved.',
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
            'items' => [
                ['image' => TemplateContent::photo('1625047509248-ec889cbff17f', 900), 'caption' => 'Professional engineer'],
                ['image' => TemplateContent::photo('1486262715619-67b85e0b08d3', 900), 'caption' => 'Best price available'],
                ['image' => TemplateContent::photo('1618312980096-873bd19759a0', 900), 'caption' => 'Certified workshop'],
            ],
        ]);
    }

    /** @return array<string, mixed> */
    private static function servicesProps(): array
    {
        return array_merge(self::motion(0), [
            'anchorId' => 'services',
            'items' => [
                [
                    'title' => 'Diagnostic service',
                    'text' => 'A full computer scan that finds the real problem before we touch a wrench.',
                    'image' => TemplateContent::photo('1498887960847-2a5e46312788', 1400),
                ],
                [
                    'title' => 'Vehicle inspection',
                    'text' => 'Pre-purchase and safety inspections with a plain-language report.',
                    'image' => TemplateContent::photo('1645445522156-9ac06bc7a767', 1400),
                ],
                [
                    'title' => 'Performance upgrade',
                    'text' => 'Tuning, brakes and suspension work for drivers who want more.',
                    'image' => TemplateContent::photo('1487754180451-c456f719a1fc', 1400),
                ],
            ],
        ]);
    }

    /** @return array<string, mixed> */
    private static function teamProps(): array
    {
        return array_merge(self::motion(0), [
            'anchorId' => 'team',
            'items' => [
                ['name' => 'Cheryl Dobson', 'role' => 'Automotive Technician', 'image' => TemplateContent::photo('1687462970787-61d953508926', 700)],
                ['name' => 'Andrew McNiel', 'role' => 'Transmission Specialist', 'image' => TemplateContent::photo('1583123810408-23e7b5d1af9f', 700)],
                ['name' => 'Kristopher Wagner', 'role' => 'Diesel Mechanic', 'image' => TemplateContent::photo('1500648767791-00dcc994a43e', 700)],
                ['name' => 'Jonas Case', 'role' => 'Maintenance Mechanic', 'image' => TemplateContent::photo('1507003211169-0a1dd7228f2d', 700)],
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
            self::team(),
            self::contact(),
        ];
    }

    /** @return array<string, mixed> */
    private static function home(): array
    {
        return TemplateContent::sitePage('Home', 'home', true, self::nav(), [
            TemplateContent::section('hero', 'hero.mechanic', array_merge(self::motion(0, 'load'), [
                'calloutAvatar' => TemplateContent::photo('1583431978096-e09dc7b7fcf4', 200),
            ])),
            TemplateContent::section('logos', 'logos.mechanic', self::motion(0)),
            TemplateContent::section('about', 'about.mechanic', self::aboutProps()),
            TemplateContent::section('features', 'features.mechanic', self::motion(0)),
            TemplateContent::section('faq', 'faq.mechanic', array_merge(self::motion(0), [
                'image' => TemplateContent::photo('1631972241361-330c704b90f1', 1800),
            ])),
            TemplateContent::section('stats', 'stats.mechanic', self::motion(0)),
            TemplateContent::section('cta', 'cta.mechanic', array_merge(self::motion(0), [
                'backgroundImage' => TemplateContent::photo('1615906655593-ad0386982a0f', 1800),
            ])),
            TemplateContent::section('team', 'team.mechanic', self::teamProps()),
            TemplateContent::section('services', 'services.mechanic', self::servicesProps()),
        ], self::footer(), 'footer.mechanic', 'navbar.mechanic');
    }

    /** @return array<string, mixed> */
    private static function about(): array
    {
        return TemplateContent::sitePage('About', 'about', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.mechanic', self::pageHead('About Us')),
            TemplateContent::section('about', 'about.mechanic', self::aboutProps()),
            TemplateContent::section('features', 'features.mechanic', self::motion(0)),
            TemplateContent::section('stats', 'stats.mechanic', self::motion(0)),
        ], self::footer(), 'footer.mechanic', 'navbar.mechanic');
    }

    /** @return array<string, mixed> */
    private static function services(): array
    {
        return TemplateContent::sitePage('Services', 'services', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.mechanic', self::pageHead('Our Services')),
            TemplateContent::section('services', 'services.mechanic', self::servicesProps()),
            TemplateContent::section('features', 'features.mechanic', self::motion(0)),
            TemplateContent::section('cta', 'cta.mechanic', array_merge(self::motion(0), [
                'backgroundImage' => TemplateContent::photo('1615906655593-ad0386982a0f', 1800),
            ])),
        ], self::footer(), 'footer.mechanic', 'navbar.mechanic');
    }

    /** @return array<string, mixed> */
    private static function team(): array
    {
        return TemplateContent::sitePage('Team', 'team', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.mechanic', self::pageHead('Our Team')),
            TemplateContent::section('team', 'team.mechanic', self::teamProps()),
            TemplateContent::section('stats', 'stats.mechanic', self::motion(0)),
        ], self::footer(), 'footer.mechanic', 'navbar.mechanic');
    }

    /** @return array<string, mixed> */
    private static function contact(): array
    {
        return TemplateContent::sitePage('Contact', 'contact', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.mechanic', self::pageHead('Contact Us')),
            TemplateContent::section('contact', 'form.contact', array_merge(self::motion(0), [
                'eyebrow' => 'Contact',
                'heading' => 'Got a question about our services?',
                'description' => 'Call us or send a message and we will get back to you the same business day.',
                'buttonLabel' => 'Book appointment',
                'details' => [
                    ['icon' => 'map-pin', 'label' => 'Workshop', 'value' => '220 Garage Row, Detroit, MI 48201'],
                    ['icon' => 'phone', 'label' => 'Phone', 'value' => '+1 (800) 123 4567', 'url' => 'tel:+18001234567'],
                    ['icon' => 'mail', 'label' => 'Email', 'value' => 'service@themechanic.example', 'url' => 'mailto:service@themechanic.example'],
                ],
                'bullets' => "Written estimate before any billable work\nSame-week appointments, most makes and models\nCertified technicians, parts warranty included",
            ])),
            TemplateContent::section('map', 'content.map', array_merge(self::motion(0), [
                'heading' => '',
                'description' => '',
                'height' => 400,
                'mapUrl' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d189464.53844377894!2d-83.24541241835938!3d42.33756244513031!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8824ca0110cb1d75%3A0x5776864e35b9c4d2!2sDetroit%2C%20MI!5e0!3m2!1sen!2sus!4v1694259649153!5m2!1sen!2sus',
            ])),
        ], self::footer(), 'footer.mechanic', 'navbar.mechanic');
    }
}
