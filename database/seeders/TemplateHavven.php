<?php

namespace Database\Seeders;

/**
 * Havven — a digital-agency and creative-studio template, ported from the
 * "Sasico" design (sasico.pikathemes.site/digital-agency).
 *
 * Six pages (Home, About, Services, Projects, Team, Contact) built from the
 * `*.havven` block family: a warm cream page shows white floating cards, one
 * near-black forest ink carries every heading, pill button and dark band,
 * bold tight-tracked Plus Jakarta Sans headlines sit over plain Inter body
 * copy, and a small circular arrow badge rides every primary button.
 */
class TemplateHavven
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#061f14',
            'secondary' => '#061f14',
            'accent' => '#061f14',
            'background' => '#faf8f4',
            'surface' => '#ffffff',
            'text' => '#061f14',
            'muted' => '#696969',
            'headingFont' => '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
            'bodyFont' => '"Inter", system-ui, -apple-system, sans-serif',
            'serifFont' => '"Plus Jakarta Sans", system-ui, sans-serif',
            'monoFont' => 'ui-monospace, monospace',
            'headingWeight' => 700,
            'bodyWeight' => 400,
            'buttonRadius' => '999px',
            'cardRadius' => '24px',
            'containerWidth' => '1240px',
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
            'logo' => 'Havven',
            'logoImage' => '',
            'logoUrl' => '/',
            'links' => [
                ['label' => 'Home', 'url' => '/'],
                ['label' => 'About', 'url' => '/about'],
                ['label' => 'Services', 'url' => '/services'],
                ['label' => 'Projects', 'url' => '/projects'],
                ['label' => 'Team', 'url' => '/team'],
                ['label' => 'Contact', 'url' => '/contact'],
            ],
            'buttonLabel' => 'Get In Touch',
            'buttonUrl' => '/contact',
            'sticky' => true,
        ];
    }

    /** @return array<string, mixed> */
    private static function footer(): array
    {
        return array_merge(self::motion(20), [
            'heading' => "Let's create digital success together",
            'email' => 'hello@havven.example',
            'phone' => '+1 (234) 456 8899',
            'newsletterHeading' => 'Subscribe our newsletter to get latest insights and tips',
            'formId' => '',
            'submitLabel' => 'Subscribe',
            'socialLabel' => 'Social Media',
            'social' => [
                ['label' => 'Instagram', 'url' => '#'],
                ['label' => 'Twitter', 'url' => '#'],
                ['label' => 'LinkedIn', 'url' => '#'],
                ['label' => 'Facebook', 'url' => '#'],
            ],
            'copyright' => 'Havven. All rights reserved.',
        ]);
    }

    /** @return array<string, mixed> */
    private static function pageHead(string $heading, string $parent = 'Pages'): array
    {
        return array_merge(self::motion(0, 'load'), [
            'heading' => $heading,
            'homeLabel' => 'Home',
            'homeUrl' => '/',
            'parentLabel' => $parent,
        ]);
    }

    /** @return array<string, mixed> */
    private static function heroProps(): array
    {
        return array_merge(self::motion(0, 'load'), [
            'avatars' => [
                ['image' => TemplateContent::photo('1494790108377-be9c29b29330', 200)],
                ['image' => TemplateContent::photo('1633332755192-727a05c4013d', 200)],
                ['image' => TemplateContent::photo('1573496359142-b8d87734a5a2', 200)],
                ['image' => TemplateContent::photo('1544005313-94ddf0286df2', 200)],
            ],
        ]);
    }

    /** @return array<string, mixed> */
    private static function projectsProps(): array
    {
        return array_merge(self::motion(0), [
            'items' => [
                [
                    'title' => 'Hoodie Design and Branding',
                    'tags' => [['label' => 'printing'], ['label' => 'graphic']],
                    'image' => TemplateContent::photo('1618354691373-d851c5c3a990', 900),
                    'url' => '/projects',
                ],
                [
                    'title' => 'MacBook Product Mockup',
                    'tags' => [['label' => 'branding'], ['label' => 'product']],
                    'image' => TemplateContent::photo('1517694712202-14dd9538aa97', 900),
                    'url' => '/projects',
                ],
                [
                    'title' => 'Mobile Application UI/UX Design',
                    'tags' => [['label' => 'apps design'], ['label' => 'product']],
                    'image' => TemplateContent::photo('1512941937669-90a1b58e7e9c', 900),
                    'url' => '/projects',
                ],
            ],
        ]);
    }

    /** @return array<string, mixed> */
    private static function processProps(): array
    {
        return array_merge(self::motion(0), [
            'items' => [
                [
                    'step' => '01',
                    'title' => 'Research & Discover',
                    'text' => 'We craft user-centric UI/UX designs in Figma — focusing on clean layouts, intuitive flow, and visual consistency.',
                    'image' => TemplateContent::photo('1552664730-d307ca884978', 900),
                ],
                [
                    'step' => '02',
                    'title' => 'Strategy & Planning',
                    'text' => 'We map the build against real deadlines and budget, so nothing gets discovered halfway through.',
                    'image' => TemplateContent::photo('1553877522-43269d4ea984', 900),
                ],
                [
                    'step' => '03',
                    'title' => 'Design & Build',
                    'text' => 'Design and development run in parallel with weekly check-ins, not a single reveal at the end.',
                    'image' => TemplateContent::photo('1561070791-2526d30994b5', 900),
                ],
                [
                    'step' => '04',
                    'title' => 'Launch & Support',
                    'text' => 'We stay on after launch to fix what real users find in the first weeks.',
                    'image' => TemplateContent::photo('1517245386807-bb43f82c33c4', 900),
                ],
            ],
        ]);
    }

    /** @return array<string, mixed> */
    private static function teamProps(): array
    {
        return array_merge(self::motion(0), [
            'items' => [
                ['name' => 'Walter D. Gonzales', 'role' => 'CEO & Founder', 'image' => TemplateContent::photo('1560250097-0b93528c311a', 700)],
                ['name' => 'Arnold T. Madden', 'role' => 'UX UI Designer', 'image' => TemplateContent::photo('1519085360753-af0119f7cbe7', 700)],
                ['name' => 'Priya Chandran', 'role' => 'Lead Developer', 'image' => TemplateContent::photo('1580489944761-15a19d654956', 700)],
                ['name' => 'Elena Marsh', 'role' => 'Marketing Strategist', 'image' => TemplateContent::photo('1573497019940-1c28c88b4f3e', 700)],
            ],
        ]);
    }

    /** @return array<string, mixed> */
    private static function testimonialsProps(): array
    {
        return array_merge(self::motion(0), [
            'items' => [
                [
                    'quote' => "I've worked with several agencies, but this team stands out. They're fast, creative and incredibly professional.",
                    'name' => 'Mark S. Bergstrom',
                    'role' => 'Product Manager, SaaS Startup',
                    'image' => TemplateContent::photo('1568602471122-7832951cc4c5', 900),
                ],
                [
                    'quote' => 'They took a vague brief and turned it into a brand we are genuinely proud of. Communication was excellent throughout.',
                    'name' => 'Dana Whitfield',
                    'role' => 'Founder, Retail Startup',
                    'image' => TemplateContent::photo('1554151228-14d9def656e4', 900),
                ],
                [
                    'quote' => 'On time, on budget, and the finished site converts better than anything we have run before.',
                    'name' => 'Ola Fatunde',
                    'role' => 'Growth Lead, Fintech',
                    'image' => TemplateContent::photo('1615813967515-e1838c1c5116', 900),
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
                    'author' => 'Admin',
                    'date' => 'July 23, 2025',
                    'title' => 'Why Your Business Needs a Strong Digital Presence in 2025',
                    'image' => TemplateContent::photo('1460925895917-afdab827c52f', 900),
                    'url' => '#',
                ],
                [
                    'author' => 'Admin',
                    'date' => 'July 10, 2025',
                    'title' => 'Five Brand Signals Clients Notice Before They Ever Call You',
                    'image' => TemplateContent::photo('1432888622747-4eb9a8efeb07', 900),
                    'url' => '#',
                ],
                [
                    'author' => 'Admin',
                    'date' => 'June 28, 2025',
                    'title' => 'What a Good Discovery Call Actually Sounds Like',
                    'image' => TemplateContent::photo('1519389950473-47ba0277781c', 900),
                    'url' => '#',
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
            self::team(),
            self::contact(),
        ];
    }

    /** @return array<string, mixed> */
    private static function home(): array
    {
        return TemplateContent::sitePage('Home', 'home', true, self::nav(), [
            TemplateContent::section('hero', 'hero.havven', self::heroProps()),
            TemplateContent::section('about', 'about.havven', self::motion(0)),
            TemplateContent::section('video', 'video.havven', array_merge(self::motion(0), [
                'image' => TemplateContent::photo('1522071820081-009f0129c71c', 1600),
            ])),
            TemplateContent::section('features', 'features.havven', self::motion(0)),
            TemplateContent::section('stats', 'stats.havven', self::motion(0)),
            TemplateContent::section('services', 'services.havven', self::motion(0)),
            TemplateContent::section('projects', 'projects.havven', self::projectsProps()),
            TemplateContent::section('process', 'process.havven', self::processProps()),
            TemplateContent::section('team', 'team.havven', self::teamProps()),
            TemplateContent::section('testimonials', 'testimonials.havven', self::testimonialsProps()),
            TemplateContent::section('blog', 'blog.havven', self::blogProps()),
        ], self::footer(), 'footer.havven', 'navbar.havven');
    }

    /** @return array<string, mixed> */
    private static function about(): array
    {
        return TemplateContent::sitePage('About', 'about', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.havven', self::pageHead('About Us')),
            TemplateContent::section('about', 'about.havven', self::motion(0)),
            TemplateContent::section('video', 'video.havven', array_merge(self::motion(0), [
                'image' => TemplateContent::photo('1522071820081-009f0129c71c', 1600),
            ])),
            TemplateContent::section('stats', 'stats.havven', self::motion(0)),
            TemplateContent::section('process', 'process.havven', self::processProps()),
            TemplateContent::section('team', 'team.havven', self::teamProps()),
            TemplateContent::section('testimonials', 'testimonials.havven', self::testimonialsProps()),
        ], self::footer(), 'footer.havven', 'navbar.havven');
    }

    /** @return array<string, mixed> */
    private static function services(): array
    {
        return TemplateContent::sitePage('Services', 'services', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.havven', self::pageHead('Our Services')),
            TemplateContent::section('services', 'services.havven', self::motion(0)),
            TemplateContent::section('features', 'features.havven', self::motion(0)),
            TemplateContent::section('testimonials', 'testimonials.havven', self::testimonialsProps()),
        ], self::footer(), 'footer.havven', 'navbar.havven');
    }

    /** @return array<string, mixed> */
    private static function projects(): array
    {
        return TemplateContent::sitePage('Projects', 'projects', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.havven', self::pageHead('Our Projects')),
            TemplateContent::section('projects', 'projects.havven', self::projectsProps()),
            TemplateContent::section('stats', 'stats.havven', self::motion(0)),
        ], self::footer(), 'footer.havven', 'navbar.havven');
    }

    /** @return array<string, mixed> */
    private static function team(): array
    {
        return TemplateContent::sitePage('Team', 'team', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.havven', self::pageHead('Our Team')),
            TemplateContent::section('team', 'team.havven', self::teamProps()),
            TemplateContent::section('blog', 'blog.havven', self::blogProps()),
        ], self::footer(), 'footer.havven', 'navbar.havven');
    }

    /** @return array<string, mixed> */
    private static function contact(): array
    {
        return TemplateContent::sitePage('Contact', 'contact', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.havven', self::pageHead('Contact Us')),
            TemplateContent::section('contact', 'form.contact', array_merge(self::motion(0), [
                'eyebrow' => 'Contact',
                'heading' => 'Talk to the Havven team',
                'description' => 'Tell us about your brand, timeline and budget — we reply within one business day.',
                'buttonLabel' => 'Send message',
                'details' => [
                    ['icon' => 'map-pin', 'label' => 'Studio', 'value' => '210 Harbor Lane, Austin, TX 78701'],
                    ['icon' => 'phone', 'label' => 'Phone', 'value' => '+1 (234) 456 8899', 'url' => 'tel:+12344568899'],
                    ['icon' => 'mail', 'label' => 'Email', 'value' => 'hello@havven.example', 'url' => 'mailto:hello@havven.example'],
                ],
                'bullets' => "Direct access to the people building your project\nA single point of contact from kickoff to launch\nAverage reply time under one business day",
            ])),
            TemplateContent::section('map', 'content.map', array_merge(self::motion(0), [
                'heading' => '',
                'description' => '',
                'height' => 400,
                'mapUrl' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d221199.85403430295!2d-97.94858976093751!3d30.307092399999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b599a0cc032f%3A0x5d9b464bd469d57a!2sAustin%2C%20TX!5e0!3m2!1sen!2sus!4v1694259649153!5m2!1sen!2sus',
            ])),
        ], self::footer(), 'footer.havven', 'navbar.havven');
    }
}
