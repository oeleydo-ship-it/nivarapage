<?php

namespace Database\Seeders;

/**
 * Aterra — an architecture and interior-design studio template, ported from
 * the "NextSpace" design (nextspace-nextjs.vercel.app).
 *
 * Five pages (Home, About, Services, Projects, Contact) built from the
 * `*.aterra` block family: a white sheet broken only by full-bleed
 * photography and one deep-teal brand colour that carries every button,
 * heading and dark band, a pill-shaped floating nav bar, and DM Sans set at
 * a light display weight throughout.
 */
class TemplateAterra
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#004643',
            'secondary' => '#04302d',
            'accent' => '#004643',
            'background' => '#ffffff',
            'surface' => '#f4f2ee',
            'text' => '#16231f',
            'muted' => '#525b5b',
            'headingFont' => '"DM Sans", system-ui, -apple-system, sans-serif',
            'bodyFont' => '"DM Sans", system-ui, -apple-system, sans-serif',
            'serifFont' => '"DM Sans", system-ui, sans-serif',
            'monoFont' => 'ui-monospace, monospace',
            'headingWeight' => 600,
            'bodyWeight' => 400,
            'buttonRadius' => '999px',
            'cardRadius' => '20px',
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
            'logo' => 'Aterra',
            'logoImage' => '',
            'logoUrl' => '/',
            'links' => [
                ['label' => 'Home', 'url' => '/'],
                ['label' => 'About', 'url' => '/about'],
                ['label' => 'Services', 'url' => '/services'],
                ['label' => 'Projects', 'url' => '/projects'],
                ['label' => 'Contact', 'url' => '/contact'],
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
            'logo' => 'Aterra',
            'logoImage' => '',
            'logoUrl' => '/',
            'description' => 'An architecture and interior-design studio building considered spaces for homes, offices and hospitality.',
            'social' => [
                ['icon' => 'facebook', 'url' => '#'],
                ['icon' => 'instagram', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
            ],
            'columns' => [
                [
                    'title' => 'Studio',
                    'links' => [
                        ['label' => 'About', 'url' => '/about'],
                        ['label' => 'Services', 'url' => '/services'],
                        ['label' => 'Projects', 'url' => '/projects'],
                        ['label' => 'Careers', 'url' => '#'],
                    ],
                ],
                [
                    'title' => 'Resources',
                    'links' => [
                        ['label' => 'Reviews', 'url' => '/about'],
                        ['label' => 'FAQs', 'url' => '/#faq'],
                        ['label' => 'Contact', 'url' => '/contact'],
                    ],
                ],
            ],
            'address' => '412 Birchwood Avenue, Austin, TX 78701',
            'phone' => '+1 (555) 240 8890',
            'email' => 'studio@aterra.example',
            'copyright' => 'Aterra Studio. All rights reserved.',
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
            'backgroundImage' => TemplateContent::photo('1600585154526-990dced4db0d', 1800),
        ]);
    }

    /** @return array<string, mixed> */
    private static function aboutProps(): array
    {
        return array_merge(self::motion(0), [
            'anchorId' => 'about',
            'image' => TemplateContent::photo('1600210492486-724fe5c67fb0', 1000),
        ]);
    }

    /** @return array<string, mixed> */
    private static function reviewsProps(): array
    {
        return array_merge(self::motion(0), [
            'anchorId' => 'reviews',
            'items' => [
                [
                    'quote' => 'They pushed back on our first-pass floor plan and were right to. The finished space works far better than what we originally asked for.',
                    'name' => 'Elena Cross',
                    'role' => 'Homeowner',
                    'avatar' => TemplateContent::photo('1544005313-94ddf0286df2', 200),
                ],
                [
                    'quote' => 'On time, on budget, and they actually explained the trade-offs instead of just picking for us. Rare in this trade.',
                    'name' => 'Marcus Webb',
                    'role' => 'Managing Director',
                    'avatar' => TemplateContent::photo('1507003211169-0a1dd7228f2d', 200),
                ],
                [
                    'quote' => 'Our office renovation happened around a live team with zero disruption. That alone was worth the fee.',
                    'name' => 'Priya Anand',
                    'role' => 'Operations Lead',
                    'avatar' => TemplateContent::photo('1573497019940-1c28c88b4f3e', 200),
                ],
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
                    'icon' => 'home',
                    'title' => 'Home Interiors',
                    'text' => 'Full-home interiors from layout to the last cushion, matched to how your household actually moves.',
                    'image' => TemplateContent::photo('1586023492125-27b2c045efd7', 900),
                    'url' => '/services',
                ],
                [
                    'icon' => 'briefcase',
                    'title' => 'Hospitality Design',
                    'text' => 'Restaurants, hotels and cafes designed to hold up under real covers, not just a photoshoot.',
                    'image' => TemplateContent::photo('1517248135467-4c7edcad34c4', 900),
                    'url' => '/services',
                ],
                [
                    'icon' => 'target',
                    'title' => 'Office Interiors',
                    'text' => 'Workspaces planned around focus, collaboration and the headcount you will actually have next year.',
                    'image' => TemplateContent::photo('1497366216548-37526070297c', 900),
                    'url' => '/services',
                ],
            ],
        ]);
    }

    /** @return array<string, mixed> */
    private static function projectsProps(): array
    {
        return array_merge(self::motion(0), [
            'anchorId' => 'projects',
            'items' => [
                [
                    'title' => 'Birchwood Residence',
                    'category' => 'Architecture Plan',
                    'image' => TemplateContent::photo('1600585154526-990dced4db0d', 800),
                    'url' => '/projects',
                ],
                [
                    'title' => 'Solace House',
                    'category' => 'Architecture Plan',
                    'image' => TemplateContent::photo('1600607688969-a5bfcd646154', 800),
                    'url' => '/projects',
                ],
                [
                    'title' => 'The Corner Loft',
                    'category' => 'Interior Design',
                    'image' => TemplateContent::photo('1600607687939-ce8a6c25118c', 800),
                    'url' => '/projects',
                ],
                [
                    'title' => 'Maple & Co Interior',
                    'category' => 'Interior Design',
                    'image' => TemplateContent::photo('1600566753086-00f18fb6b3ea', 800),
                    'url' => '/projects',
                ],
                [
                    'title' => 'Harborview Offices',
                    'category' => 'Interior Design',
                    'image' => TemplateContent::photo('1524758631624-e2822e304c36', 800),
                    'url' => '/projects',
                ],
                [
                    'title' => 'Titan Workspace',
                    'category' => 'Exterior Design',
                    'image' => TemplateContent::photo('1600607687920-4e2a09cf159d', 800),
                    'url' => '/projects',
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
            self::projects(),
            self::contact(),
        ];
    }

    /** @return array<string, mixed> */
    private static function home(): array
    {
        return TemplateContent::sitePage('Home', 'home', true, self::nav(), [
            TemplateContent::section('hero', 'hero.aterra', array_merge(self::motion(0, 'load'), [
                'badgeLabel' => 'Trusted Since 1994',
                'heading' => 'Designing Spaces, Elevating Living',
                'description' => 'We shape interiors and architecture around how you actually live — considered, calm and built to last.',
                'backgroundImage' => TemplateContent::photo('1600585154340-be6161a56a0c', 1800),
            ])),
            TemplateContent::section('about', 'about.aterra', self::aboutProps()),
            TemplateContent::section('reviews', 'testimonials.aterra', self::reviewsProps()),
            TemplateContent::section('services', 'services.aterra', self::servicesProps()),
            TemplateContent::section('process', 'process.aterra', self::motion(0)),
            TemplateContent::section('projects', 'projects.aterra', self::projectsProps()),
            TemplateContent::section('cta', 'cta.aterra', array_merge(self::motion(0), [
                'backgroundImage' => TemplateContent::photo('1600585152220-90363fe7e115', 1600),
            ])),
            TemplateContent::section('faq', 'faq.aterra', array_merge(self::motion(0), [
                'anchorId' => 'faq',
            ])),
        ], self::footer(), 'footer.aterra', 'navbar.aterra');
    }

    /** @return array<string, mixed> */
    private static function about(): array
    {
        return TemplateContent::sitePage('About', 'about', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.aterra', self::pageHead('About Us')),
            TemplateContent::section('about', 'about.aterra', self::aboutProps()),
            TemplateContent::section('process', 'process.aterra', self::motion(0)),
            TemplateContent::section('reviews', 'testimonials.aterra', self::reviewsProps()),
        ], self::footer(), 'footer.aterra', 'navbar.aterra');
    }

    /** @return array<string, mixed> */
    private static function services(): array
    {
        return TemplateContent::sitePage('Services', 'services', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.aterra', self::pageHead('Our Services')),
            TemplateContent::section('services', 'services.aterra', self::servicesProps()),
            TemplateContent::section('process', 'process.aterra', self::motion(0)),
            TemplateContent::section('cta', 'cta.aterra', array_merge(self::motion(0), [
                'backgroundImage' => TemplateContent::photo('1600585152220-90363fe7e115', 1600),
            ])),
        ], self::footer(), 'footer.aterra', 'navbar.aterra');
    }

    /** @return array<string, mixed> */
    private static function projects(): array
    {
        return TemplateContent::sitePage('Projects', 'projects', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.aterra', self::pageHead('Our Projects & Designs')),
            TemplateContent::section('projects', 'projects.aterra', self::projectsProps()),
            TemplateContent::section('cta', 'cta.aterra', array_merge(self::motion(0), [
                'backgroundImage' => TemplateContent::photo('1522708323590-d24dbb6b0267', 1600),
            ])),
        ], self::footer(), 'footer.aterra', 'navbar.aterra');
    }

    /** @return array<string, mixed> */
    private static function contact(): array
    {
        return TemplateContent::sitePage('Contact', 'contact', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.aterra', self::pageHead('Contact Us')),
            TemplateContent::section('contact', 'form.contact', array_merge(self::motion(0), [
                'eyebrow' => 'Contact',
                'heading' => 'Tell Us About Your Project',
                'description' => 'Share a few details about the space and we will come back with next steps and a realistic budget.',
                'buttonLabel' => 'Send Message',
                'details' => [
                    ['icon' => 'map-pin', 'label' => 'Studio', 'value' => '412 Birchwood Avenue, Austin, TX 78701'],
                    ['icon' => 'phone', 'label' => 'Phone', 'value' => '+1 (555) 240 8890', 'url' => 'tel:+15552408890'],
                    ['icon' => 'mail', 'label' => 'Email', 'value' => 'studio@aterra.example', 'url' => 'mailto:studio@aterra.example'],
                ],
                'bullets' => "A named designer from first sketch to handover\nFixed-price quotes for defined scopes\nPermits and inspections handled for you",
            ])),
            TemplateContent::section('map', 'content.map', array_merge(self::motion(0), [
                'heading' => '',
                'description' => '',
                'height' => 400,
                'mapUrl' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d221199.85403430295!2d-97.94858976093751!3d30.307092399999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b599a0cc032f%3A0x5d9b464bd469d57a!2sAustin%2C%20TX!5e0!3m2!1sen!2sus!4v1694259649153!5m2!1sen!2sus',
            ])),
        ], self::footer(), 'footer.aterra', 'navbar.aterra');
    }
}
