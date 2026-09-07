<?php

namespace Database\Seeders;

/**
 * LifeSure — a life-insurance and financial-services template, ported from
 * the free "LifeSure" HTML template by HTML Codex (CC BY 4.0 — the footer
 * credit link this seeder writes must stay intact per that licence).
 *
 * Six pages (Home, About, Service, Blog, Team, Contact) built from the
 * `*.lifesure` block family: a two-tier header (a slim contact topbar over a
 * pill-shaped nav bar), a royal-blue hero band, DM Sans headlines over Inter
 * body copy, heavily rounded cards that flood with royal blue on hover, and
 * a near-navy footer with an Instagram photo grid.
 */
class TemplateLifesure
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#015fc9',
            'secondary' => '#16243d',
            'accent' => '#0be1ff',
            'background' => '#ffffff',
            'surface' => '#f2f5f9',
            'text' => '#16243d',
            'muted' => '#787878',
            'headingFont' => '"DM Sans", system-ui, sans-serif',
            'bodyFont' => '"Inter", system-ui, sans-serif',
            'serifFont' => '"DM Sans", system-ui, sans-serif',
            'monoFont' => 'ui-monospace, monospace',
            'headingWeight' => 500,
            'bodyWeight' => 400,
            'buttonRadius' => '999px',
            'cardRadius' => '10px',
            'containerWidth' => '1200px',
            'sectionSpacing' => '84px',
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
            'topLocation' => 'Find A Location',
            'topEmail' => 'example@gmail.com',
            'social' => [
                ['icon' => 'facebook', 'url' => '#'],
                ['icon' => 'twitter', 'url' => '#'],
                ['icon' => 'instagram', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
            ],
            'logo' => 'LifeSure',
            'logoImage' => '',
            'logoUrl' => '/',
            'links' => [
                ['label' => 'Home', 'url' => '/'],
                ['label' => 'About', 'url' => '/about'],
                ['label' => 'Services', 'url' => '/service'],
                ['label' => 'Pages', 'url' => '/blog', 'children' => [
                    ['label' => 'Our Blog', 'url' => '/blog'],
                    ['label' => 'Our team', 'url' => '/team'],
                ]],
                ['label' => 'Contact', 'url' => '/contact'],
            ],
            'phoneLabel' => 'Call to Our Experts',
            'phone' => '+ 0123 456 7890',
            'sticky' => true,
        ];
    }

    /** @return array<string, mixed> */
    private static function footer(): array
    {
        return array_merge(self::motion(20), [
            'logo' => 'LifeSure',
            'logoImage' => '',
            'logoUrl' => '/',
            'description' => 'Straightforward cover, explained by someone who picks up the phone, and a claims line that actually answers.',
            'social' => [
                ['icon' => 'facebook', 'url' => '#'],
                ['icon' => 'twitter', 'url' => '#'],
                ['icon' => 'instagram', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
            ],
            'linksHeading' => 'Useful Links',
            'links' => [
                ['label' => 'About Us', 'url' => '/about'],
                ['label' => 'Services', 'url' => '/service'],
                ['label' => 'Our Blog', 'url' => '/blog'],
                ['label' => 'Our Team', 'url' => '/team'],
                ['label' => 'Contact', 'url' => '/contact'],
            ],
            'galleryHeading' => 'Instagram',
            'gallery' => [
                ['image' => TemplateContent::photo('1449824913935-59a10b8d2000', 500)],
                ['image' => TemplateContent::photo('1486406146926-c627a92ad1ab', 500)],
                ['image' => TemplateContent::photo('1477959858617-67f85cf4f1df', 500)],
                ['image' => TemplateContent::photo('1521791055366-0d553872125f', 500)],
                ['image' => TemplateContent::photo('1519085360753-af0119f7cbe7', 500)],
                ['image' => TemplateContent::photo('1511632765486-a01980e01a18', 500)],
            ],
            'details' => [
                ['icon' => 'map-pin', 'label' => 'Address', 'value' => '123 Street New York, USA'],
                ['icon' => 'mail', 'label' => 'Mail Us', 'value' => 'info@example.com'],
                ['icon' => 'phone', 'label' => 'Telephone', 'value' => '(+012) 3456 7890'],
            ],
            'newsletterHeading' => 'Newsletter',
            'newsletterText' => 'A short monthly note on cover, claims and renewal timing. No spam.',
            'newsletterLabel' => 'Sign Up',
            'formId' => '',
            'phoneLabel' => 'Call to Our Experts',
            'phone' => '+ 0123 456 7890',
            'copyright' => 'LifeSure, All right reserved.',
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
            'backgroundImage' => TemplateContent::photo('1444723121867-7a241cacace9', 1800),
        ]);
    }

    /** @return array<string, mixed> */
    private static function aboutProps(): array
    {
        return array_merge(self::motion(0), [
            'image' => TemplateContent::photo('1609220136736-443140cffec6', 1000),
        ]);
    }

    /** @return array<string, mixed> */
    private static function servicesProps(): array
    {
        return array_merge(self::motion(0), [
            'items' => [
                [
                    'icon' => 'users',
                    'title' => 'Life Insurance',
                    'text' => 'Cover that pays out for the people who rely on your income, arranged around your budget.',
                    'image' => TemplateContent::photo('1521791136064-7986c2920216', 700),
                    'buttonLabel' => 'Read More',
                    'buttonUrl' => '/service',
                ],
                [
                    'icon' => 'target',
                    'title' => 'Health Insurance',
                    'text' => 'Treatment and specialist care without the wait, for you and the people on your plan.',
                    'image' => TemplateContent::photo('1576091160399-112ba8d25d1d', 700),
                    'buttonLabel' => 'Read More',
                    'buttonUrl' => '/service',
                ],
                [
                    'icon' => 'truck',
                    'title' => 'Car Insurance',
                    'text' => 'Comprehensive cover with a claims line that actually answers on the first ring.',
                    'image' => TemplateContent::photo('1519494026892-80bbd2d6fd0d', 700),
                    'buttonLabel' => 'Read More',
                    'buttonUrl' => '/service',
                ],
                [
                    'icon' => 'home',
                    'title' => 'Home Insurance',
                    'text' => 'Buildings and contents cover that adjusts automatically as your home changes.',
                    'image' => TemplateContent::photo('1568605114967-8130f3a36994', 700),
                    'buttonLabel' => 'Read More',
                    'buttonUrl' => '/service',
                ],
            ],
        ]);
    }

    /** @return array<string, mixed> */
    private static function blogProps(): array
    {
        return array_merge(self::motion(0), [
            'items' => [
                [
                    'title' => 'Which allows you to pay down insurance bills',
                    'excerpt' => 'A quarterly plan that spreads the premium without the usual finance charge.',
                    'category' => 'Business',
                    'author' => 'Martin C.',
                    'date' => '30 Dec 2025',
                    'comments' => '6 Comments',
                    'image' => TemplateContent::photo('1556742049-0cfed4f6a45d', 700),
                    'url' => '#',
                ],
                [
                    'title' => 'Leverage agile frameworks to provide a better claim',
                    'excerpt' => 'What changed when we moved claims handling to a named case owner.',
                    'category' => 'Business',
                    'author' => 'Martin C.',
                    'date' => '24 Dec 2025',
                    'comments' => '4 Comments',
                    'image' => TemplateContent::photo('1600880292203-757bb62b4baf', 700),
                    'url' => '#',
                ],
                [
                    'title' => 'Five things worth checking before you renew',
                    'excerpt' => 'A short list that has saved clients real money at renewal time.',
                    'category' => 'Advice',
                    'author' => 'Martin C.',
                    'date' => '18 Dec 2025',
                    'comments' => '9 Comments',
                    'image' => TemplateContent::photo('1560518883-ce09059eeffa', 700),
                    'url' => '#',
                ],
            ],
        ]);
    }

    /** @return array<string, mixed> */
    private static function teamProps(): array
    {
        return array_merge(self::motion(0), [
            'items' => [
                [
                    'name' => 'David James',
                    'role' => 'Senior Advisor',
                    'image' => TemplateContent::photo('1500648767791-00dcc994a43e', 600),
                    'social' => [
                        ['icon' => 'facebook', 'url' => '#'],
                        ['icon' => 'twitter', 'url' => '#'],
                        ['icon' => 'linkedin', 'url' => '#'],
                        ['icon' => 'instagram', 'url' => '#'],
                    ],
                ],
                [
                    'name' => 'Sophia Turner',
                    'role' => 'Claims Manager',
                    'image' => TemplateContent::photo('1544005313-94ddf0286df2', 600),
                    'social' => [
                        ['icon' => 'facebook', 'url' => '#'],
                        ['icon' => 'twitter', 'url' => '#'],
                        ['icon' => 'linkedin', 'url' => '#'],
                        ['icon' => 'instagram', 'url' => '#'],
                    ],
                ],
                [
                    'name' => 'Emily Clarke',
                    'role' => 'Underwriter',
                    'image' => TemplateContent::photo('1580489944761-15a19d654956', 600),
                    'social' => [
                        ['icon' => 'facebook', 'url' => '#'],
                        ['icon' => 'twitter', 'url' => '#'],
                        ['icon' => 'linkedin', 'url' => '#'],
                        ['icon' => 'instagram', 'url' => '#'],
                    ],
                ],
                [
                    'name' => 'Michael Doyle',
                    'role' => 'Account Manager',
                    'image' => TemplateContent::photo('1506794778202-cad84cf45f1d', 600),
                    'social' => [
                        ['icon' => 'facebook', 'url' => '#'],
                        ['icon' => 'twitter', 'url' => '#'],
                        ['icon' => 'linkedin', 'url' => '#'],
                        ['icon' => 'instagram', 'url' => '#'],
                    ],
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
            self::service(),
            self::blog(),
            self::team(),
            self::contact(),
        ];
    }

    /** @return array<string, mixed> */
    private static function home(): array
    {
        return TemplateContent::sitePage('Home', 'home', true, self::nav(), [
            TemplateContent::section('hero', 'hero.lifesure', array_merge(self::motion(0, 'load'), [
                'image' => TemplateContent::photo('1511632765486-a01980e01a18', 1200),
            ])),
            TemplateContent::section('about', 'about.lifesure', self::aboutProps()),
            TemplateContent::section('services', 'services.lifesure', self::servicesProps()),
            TemplateContent::section('blog', 'blog.lifesure', self::blogProps()),
            TemplateContent::section('team', 'team.lifesure', self::teamProps()),
        ], self::footer(), 'footer.lifesure', 'navbar.lifesure');
    }

    /** @return array<string, mixed> */
    private static function about(): array
    {
        return TemplateContent::sitePage('About', 'about', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.lifesure', self::pageHead('About Us')),
            TemplateContent::section('about', 'about.lifesure', self::aboutProps()),
            TemplateContent::section('team', 'team.lifesure', self::teamProps()),
        ], self::footer(), 'footer.lifesure', 'navbar.lifesure');
    }

    /** @return array<string, mixed> */
    private static function service(): array
    {
        return TemplateContent::sitePage('Services', 'service', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.lifesure', self::pageHead('Our Services')),
            TemplateContent::section('services', 'services.lifesure', self::servicesProps()),
        ], self::footer(), 'footer.lifesure', 'navbar.lifesure');
    }

    /** @return array<string, mixed> */
    private static function blog(): array
    {
        return TemplateContent::sitePage('Blog', 'blog', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.lifesure', self::pageHead('Our Blog')),
            TemplateContent::section('blog', 'blog.lifesure', self::blogProps()),
        ], self::footer(), 'footer.lifesure', 'navbar.lifesure');
    }

    /** @return array<string, mixed> */
    private static function team(): array
    {
        return TemplateContent::sitePage('Team', 'team', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.lifesure', self::pageHead('Our Team')),
            TemplateContent::section('team', 'team.lifesure', self::teamProps()),
        ], self::footer(), 'footer.lifesure', 'navbar.lifesure');
    }

    /** @return array<string, mixed> */
    private static function contact(): array
    {
        return TemplateContent::sitePage('Contact', 'contact', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.lifesure', self::pageHead('Contact Us')),
            TemplateContent::section('contact', 'contact.lifesure', array_merge(self::motion(0), [
                'heading' => 'If you have any questions please apply now',
                'image' => TemplateContent::photo('1454165804606-c3d57bc86b40', 1000),
            ])),
            TemplateContent::section('map', 'content.map', array_merge(self::motion(0), [
                'heading' => '',
                'description' => '',
                'height' => 400,
                'mapUrl' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387191.33750346623!2d-73.97968099999999!3d40.6974881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sbd!4v1694259649153!5m2!1sen!2sbd',
            ])),
        ], self::footer(), 'footer.lifesure', 'navbar.lifesure');
    }
}
