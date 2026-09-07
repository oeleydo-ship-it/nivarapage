<?php

namespace Database\Seeders;

/**
 * Corewave — a software and product-development studio template, ported
 * from the "StartHub" design (starthub-8.liquid-themes.com).
 *
 * Six pages (Home, About, Services, Projects, Testimonials, Contact) built
 * from the `*.corewave` block family: a warm off-white page carries a
 * floating gradient-blob hero card, medium-weight Space Grotesk headlines
 * over plain Sora body copy, one vivid violet accent and one lime-green
 * accent trading off across highlighted words, giant ghost numerals behind
 * numbered process steps, and a dark navy footer.
 */
class TemplateCorewave
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#06283d',
            'secondary' => '#82b541',
            'accent' => '#9f51e0',
            'background' => '#f9f8f5',
            'surface' => '#ffffff',
            'text' => '#161a1d',
            'muted' => '#5b5f63',
            'headingFont' => '"Space Grotesk", system-ui, -apple-system, sans-serif',
            'bodyFont' => '"Sora", system-ui, -apple-system, sans-serif',
            'serifFont' => '"Space Grotesk", system-ui, sans-serif',
            'monoFont' => 'ui-monospace, monospace',
            'headingWeight' => 500,
            'bodyWeight' => 400,
            'buttonRadius' => '999px',
            'cardRadius' => '28px',
            'containerWidth' => '1240px',
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
            'logo' => 'Corewave',
            'logoImage' => '',
            'logoUrl' => '/',
            'links' => [
                ['label' => 'Home', 'url' => '/'],
                ['label' => 'Services', 'url' => '/services'],
                ['label' => 'Projects', 'url' => '/projects'],
                ['label' => 'Testimonials', 'url' => '/testimonials'],
                ['label' => 'Contact', 'url' => '/contact'],
            ],
            'secondaryLabel' => 'Join the community',
            'secondaryUrl' => '/contact',
            'buttonLabel' => 'Get in touch',
            'buttonUrl' => '/contact',
            'sticky' => true,
        ];
    }

    /** @return array<string, mixed> */
    private static function footer(): array
    {
        return array_merge(self::motion(20), [
            'columns' => [
                [
                    'title' => 'Company',
                    'links' => [
                        ['label' => 'Contact Us', 'url' => '/contact'],
                        ['label' => 'FAQ', 'url' => '#'],
                        ['label' => 'About Us', 'url' => '/about'],
                    ],
                ],
                [
                    'title' => 'Support',
                    'links' => [
                        ['label' => 'Privacy Policy', 'url' => '#'],
                        ['label' => 'Careers', 'url' => '#'],
                        ['label' => 'Community', 'url' => '#'],
                    ],
                ],
            ],
            'helpLabel' => 'Need help?',
            'phone' => '+1 (234) 567 8901',
            'email' => 'hello@corewave.example',
            'communityHeading' => 'Join the community',
            'communityText' => 'Get product updates, invites to events and early access to new features.',
            'communityButtonLabel' => 'Join the community',
            'communityButtonUrl' => '/contact',
            'social' => [
                ['label' => 'Instagram', 'url' => '#'],
                ['label' => 'Twitter', 'url' => '#'],
                ['label' => 'LinkedIn', 'url' => '#'],
                ['label' => 'Facebook', 'url' => '#'],
            ],
            'copyright' => 'Corewave. All images are for demo purposes.',
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
    private static function creativeProps(): array
    {
        return array_merge(self::motion(0), [
            'items' => [
                [
                    'label' => 'Development Services',
                    'title' => 'Mobile Development',
                    'image' => TemplateContent::photo('1600880292203-757bb62b4baf', 800),
                    'url' => '/services',
                ],
                [
                    'label' => 'Brand Identity',
                    'title' => 'Branding Strategy',
                    'image' => TemplateContent::photo('1553484771-047a44eee27a', 800),
                    'url' => '/services',
                ],
                [
                    'label' => 'Creative Direction',
                    'title' => 'Art Direction',
                    'image' => TemplateContent::photo('1558655146-9f40138edfeb', 800),
                    'url' => '/services',
                ],
            ],
        ]);
    }

    /** @return array<string, mixed> */
    private static function projectsProps(): array
    {
        return array_merge(self::motion(0), [
            'items' => [
                [
                    'title' => 'Foundry Apparel',
                    'category' => 'Branding',
                    'image' => TemplateContent::photo('1523381210434-271e8be1f52b', 900),
                    'url' => '/projects',
                ],
                [
                    'title' => 'Continuum',
                    'category' => 'Illustration',
                    'image' => TemplateContent::photo('1531297484001-80022131f5a1', 900),
                    'url' => '/projects',
                ],
                [
                    'title' => 'Nova Interface',
                    'category' => 'Product Design',
                    'image' => TemplateContent::photo('1522542550221-31fd19575a2d', 900),
                    'url' => '/projects',
                ],
                [
                    'title' => 'Pulse Fintech',
                    'category' => 'Web Design',
                    'image' => TemplateContent::photo('1551288049-bebda4e38f71', 900),
                    'url' => '/projects',
                ],
            ],
        ]);
    }

    /** @return array<string, mixed> */
    private static function visionProps(): array
    {
        return array_merge(self::motion(0), [
            'image' => TemplateContent::photo('1497215728101-856f4ea42174', 1600),
        ]);
    }

    /** @return array<string, mixed> */
    private static function testimonialsProps(): array
    {
        return array_merge(self::motion(0), [
            'items' => [
                [
                    'quote' => 'Corewave took our half-formed idea and shipped a store that converts better than anything we tried before. Communication was excellent the whole way through.',
                    'name' => 'Priya Malhotra',
                    'role' => 'Founder, Loomcraft',
                    'image' => TemplateContent::photo('1544005313-94ddf0286df2', 400),
                    'tint' => 'mint',
                ],
                [
                    'quote' => "Every request got a same-day reply, and the fixes actually held. It's rare to find a team this responsive after launch.",
                    'name' => 'Owen Marsh',
                    'role' => 'Head of Growth, Fenwick & Co',
                    'image' => TemplateContent::photo('1535713875002-d1d0cf377fde', 400),
                    'tint' => 'peach',
                ],
                [
                    'quote' => "I'm early in building my second product with them and already impressed by how fast questions get answered. That responsiveness is what keeps us coming back.",
                    'name' => 'Elena Cross',
                    'role' => 'Product Lead, Driftline',
                    'image' => TemplateContent::photo('1508214751196-bcfd4ca60f91', 400),
                    'tint' => 'lavender',
                ],
                [
                    'quote' => 'Simply the best build process we have run. Every round of feedback came back fast, and the finished app is the fastest thing we ship.',
                    'name' => 'Marcus Webb',
                    'role' => 'CTO, Ravel Labs',
                    'image' => TemplateContent::photo('1500648767791-00dcc994a43e', 400),
                    'tint' => 'mint',
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
            self::testimonials(),
            self::contact(),
        ];
    }

    /** @return array<string, mixed> */
    private static function home(): array
    {
        return TemplateContent::sitePage('Home', 'home', true, self::nav(), [
            TemplateContent::section('hero', 'hero.corewave', self::motion(0, 'load')),
            TemplateContent::section('intro', 'intro.corewave', self::motion(0)),
            TemplateContent::section('creative', 'creative.corewave', self::creativeProps()),
            TemplateContent::section('projects', 'projects.corewave', self::projectsProps()),
            TemplateContent::section('process', 'process.corewave', self::motion(0)),
            TemplateContent::section('vision', 'vision.corewave', self::visionProps()),
            TemplateContent::section('testimonials', 'testimonials.corewave', self::testimonialsProps()),
            TemplateContent::section('brands', 'brands.corewave', self::motion(0)),
            TemplateContent::section('contact', 'form.contact', array_merge(self::motion(0), [
                'eyebrow' => 'Contact',
                'heading' => 'Have a project in mind?',
                'description' => 'Tell us what you are building — we reply within one business day.',
                'buttonLabel' => 'Send message',
                'details' => [
                    ['icon' => 'mail', 'label' => 'Email', 'value' => 'hello@corewave.example', 'url' => 'mailto:hello@corewave.example'],
                    ['icon' => 'phone', 'label' => 'Phone', 'value' => '+1 (234) 567 8901', 'url' => 'tel:+12345678901'],
                ],
            ])),
        ], self::footer(), 'footer.corewave', 'navbar.corewave');
    }

    /** @return array<string, mixed> */
    private static function about(): array
    {
        return TemplateContent::sitePage('About', 'about', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.corewave', self::pageHead('About Us')),
            TemplateContent::section('vision', 'vision.corewave', self::visionProps()),
            TemplateContent::section('process', 'process.corewave', self::motion(0)),
            TemplateContent::section('creative', 'creative.corewave', self::creativeProps()),
            TemplateContent::section('brands', 'brands.corewave', self::motion(0)),
        ], self::footer(), 'footer.corewave', 'navbar.corewave');
    }

    /** @return array<string, mixed> */
    private static function services(): array
    {
        return TemplateContent::sitePage('Services', 'services', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.corewave', self::pageHead('Our Services')),
            TemplateContent::section('intro', 'intro.corewave', self::motion(0)),
            TemplateContent::section('creative', 'creative.corewave', self::creativeProps()),
            TemplateContent::section('process', 'process.corewave', self::motion(0)),
        ], self::footer(), 'footer.corewave', 'navbar.corewave');
    }

    /** @return array<string, mixed> */
    private static function projects(): array
    {
        return TemplateContent::sitePage('Projects', 'projects', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.corewave', self::pageHead('Our Projects')),
            TemplateContent::section('projects', 'projects.corewave', self::projectsProps()),
            TemplateContent::section('brands', 'brands.corewave', self::motion(0)),
        ], self::footer(), 'footer.corewave', 'navbar.corewave');
    }

    /** @return array<string, mixed> */
    private static function testimonials(): array
    {
        return TemplateContent::sitePage('Testimonials', 'testimonials', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.corewave', self::pageHead('Testimonials')),
            TemplateContent::section('testimonials', 'testimonials.corewave', self::testimonialsProps()),
            TemplateContent::section('brands', 'brands.corewave', self::motion(0)),
        ], self::footer(), 'footer.corewave', 'navbar.corewave');
    }

    /** @return array<string, mixed> */
    private static function contact(): array
    {
        return TemplateContent::sitePage('Contact', 'contact', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.corewave', self::pageHead('Contact Us')),
            TemplateContent::section('contact', 'form.contact', array_merge(self::motion(0), [
                'eyebrow' => 'Contact',
                'heading' => 'Talk to the Corewave team',
                'description' => 'Tell us about your project, timeline and budget — we reply within one business day.',
                'buttonLabel' => 'Send message',
                'details' => [
                    ['icon' => 'map-pin', 'label' => 'Studio', 'value' => '140 Foundry Street, Austin, TX 78701'],
                    ['icon' => 'phone', 'label' => 'Phone', 'value' => '+1 (234) 567 8901', 'url' => 'tel:+12345678901'],
                    ['icon' => 'mail', 'label' => 'Email', 'value' => 'hello@corewave.example', 'url' => 'mailto:hello@corewave.example'],
                ],
                'bullets' => "Direct access to the engineers building your product\nA single point of contact from kickoff to launch\nAverage reply time under one business day",
            ])),
            TemplateContent::section('map', 'content.map', array_merge(self::motion(0), [
                'heading' => '',
                'description' => '',
                'height' => 400,
                'mapUrl' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d221199.85403430295!2d-97.94858976093751!3d30.307092399999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b599a0cc032f%3A0x5d9b464bd469d57a!2sAustin%2C%20TX!5e0!3m2!1sen!2sus!4v1694259649153!5m2!1sen!2sus',
            ])),
        ], self::footer(), 'footer.corewave', 'navbar.corewave');
    }
}
