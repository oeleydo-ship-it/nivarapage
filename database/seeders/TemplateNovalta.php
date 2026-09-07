<?php

namespace Database\Seeders;

/**
 * Novalta — an AI-innovation studio template, ported from the "StartHub
 * Twelve" design (starthubtwelve.liquid-themes.com).
 *
 * Six pages (Home, About, Services, Solutions, Projects, Contact) built
 * from the `*.novalta` block family: a soft off-white page carries one
 * signature blue-to-coral gradient painted across every primary button and
 * highlighted headline word, playful rounded Fredoka display type over
 * plain Manrope body copy, arch-topped photography, floating pastel stat
 * bubbles, full-bleed stacked colour panels, and a near-black gradient
 * footer band.
 */
class TemplateNovalta
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#171720',
            'secondary' => '#eb8988',
            'accent' => '#0c81f3',
            'background' => '#f9f7f6',
            'surface' => '#ffffff',
            'text' => '#292929',
            'muted' => '#5f5f5f',
            'headingFont' => '"Fredoka", system-ui, -apple-system, sans-serif',
            'bodyFont' => '"Manrope", system-ui, -apple-system, sans-serif',
            'serifFont' => '"Fredoka", system-ui, sans-serif',
            'monoFont' => 'ui-monospace, monospace',
            'headingWeight' => 600,
            'bodyWeight' => 400,
            'buttonRadius' => '999px',
            'cardRadius' => '28px',
            'containerWidth' => '1320px',
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
            'logo' => 'Novalta',
            'logoImage' => '',
            'logoUrl' => '/',
            'links' => [
                ['label' => 'Home', 'url' => '/'],
                ['label' => 'Services', 'url' => '/services'],
                ['label' => 'Solutions', 'url' => '/solutions'],
                ['label' => 'About', 'url' => '/about'],
                ['label' => 'Contact', 'url' => '/contact'],
            ],
            'buttonLabel' => 'Send a message',
            'buttonUrl' => '/contact',
            'sticky' => true,
        ];
    }

    /** @return array<string, mixed> */
    private static function footer(): array
    {
        return array_merge(self::motion(20), [
            'badgeLabel' => 'Stay Connected',
            'heading' => "Let's",
            'headingHighlight' => 'collaborate.',
            'description' => 'Join us on this exciting journey and discover how our expertise and passion for technology can help your business achieve its full potential.',
            'buttonLabel' => 'Contact Us',
            'buttonUrl' => '/contact',
            'aboutLabel' => 'About Us',
            'aboutUrl' => '/about',
            'social' => [
                ['label' => 'Twitter', 'url' => '#'],
                ['label' => 'Youtube', 'url' => '#'],
                ['label' => 'Instagram', 'url' => '#'],
            ],
            'copyright' => 'Novalta. All images are for demo purposes.',
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
            'image' => TemplateContent::photo('1526378722484-bd91ca387e72', 900),
        ]);
    }

    /** @return array<string, mixed> */
    private static function aboutProps(): array
    {
        return array_merge(self::motion(0), [
            'image' => TemplateContent::photo('1531482615713-2afd69097998', 900),
        ]);
    }

    /** @return array<string, mixed> */
    private static function solutionsProps(): array
    {
        return array_merge(self::motion(0), [
            'image' => TemplateContent::photo('1499951360447-b19be8fe80f5', 900),
        ]);
    }

    /** @return array<string, mixed> */
    private static function galleryProps(): array
    {
        return array_merge(self::motion(0), [
            'items' => [
                [
                    'title' => 'Aperture App',
                    'category' => 'Digital Design',
                    'image' => TemplateContent::photo('1512941937669-90a1b58e7e9c', 800),
                    'url' => '/projects',
                ],
                [
                    'title' => 'Fernbank Print Kit',
                    'category' => 'Custom Print',
                    'image' => TemplateContent::photo('1544377193-33dcf4d68fb5', 800),
                    'url' => '/projects',
                ],
                [
                    'title' => 'Solace Skincare',
                    'category' => 'Branding',
                    'image' => TemplateContent::photo('1571875257727-256c39da42af', 800),
                    'url' => '/projects',
                ],
                [
                    'title' => 'Cartwheel Market',
                    'category' => 'Ecommerce',
                    'image' => TemplateContent::photo('1556742049-0cfed4f6a45d', 800),
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
            self::solutions(),
            self::projects(),
            self::contact(),
        ];
    }

    /** @return array<string, mixed> */
    private static function home(): array
    {
        return TemplateContent::sitePage('Home', 'home', true, self::nav(), [
            TemplateContent::section('hero', 'hero.novalta', self::heroProps()),
            TemplateContent::section('services', 'services.novalta', self::motion(0)),
            TemplateContent::section('about', 'about.novalta', self::aboutProps()),
            TemplateContent::section('stats', 'stats.novalta', self::motion(0)),
            TemplateContent::section('process', 'process.novalta', self::motion(0)),
            TemplateContent::section('solutions', 'solutions.novalta', self::solutionsProps()),
            TemplateContent::section('panels', 'panels.novalta', self::motion(0)),
            TemplateContent::section('projects', 'projects.novalta', self::galleryProps()),
            TemplateContent::section('cases', 'casestudies.novalta', self::motion(0)),
            TemplateContent::section('faq', 'faq.novalta', self::motion(0)),
        ], self::footer(), 'footer.novalta', 'navbar.novalta');
    }

    /** @return array<string, mixed> */
    private static function about(): array
    {
        return TemplateContent::sitePage('About', 'about', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.novalta', self::pageHead('About Us')),
            TemplateContent::section('about', 'about.novalta', self::aboutProps()),
            TemplateContent::section('stats', 'stats.novalta', self::motion(0)),
            TemplateContent::section('panels', 'panels.novalta', self::motion(0)),
            TemplateContent::section('cases', 'casestudies.novalta', self::motion(0)),
        ], self::footer(), 'footer.novalta', 'navbar.novalta');
    }

    /** @return array<string, mixed> */
    private static function services(): array
    {
        return TemplateContent::sitePage('Services', 'services', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.novalta', self::pageHead('Our Services')),
            TemplateContent::section('services', 'services.novalta', self::motion(0)),
            TemplateContent::section('process', 'process.novalta', self::motion(0)),
            TemplateContent::section('faq', 'faq.novalta', self::motion(0)),
        ], self::footer(), 'footer.novalta', 'navbar.novalta');
    }

    /** @return array<string, mixed> */
    private static function solutions(): array
    {
        return TemplateContent::sitePage('Solutions', 'solutions', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.novalta', self::pageHead('Solutions')),
            TemplateContent::section('solutions', 'solutions.novalta', self::solutionsProps()),
            TemplateContent::section('panels', 'panels.novalta', self::motion(0)),
        ], self::footer(), 'footer.novalta', 'navbar.novalta');
    }

    /** @return array<string, mixed> */
    private static function projects(): array
    {
        return TemplateContent::sitePage('Projects', 'projects', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.novalta', self::pageHead('Our Works')),
            TemplateContent::section('projects', 'projects.novalta', self::galleryProps()),
            TemplateContent::section('cases', 'casestudies.novalta', self::motion(0)),
        ], self::footer(), 'footer.novalta', 'navbar.novalta');
    }

    /** @return array<string, mixed> */
    private static function contact(): array
    {
        return TemplateContent::sitePage('Contact', 'contact', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.novalta', self::pageHead('Contact Us')),
            TemplateContent::section('contact', 'form.contact', array_merge(self::motion(0), [
                'eyebrow' => 'Contact',
                'heading' => 'Talk to the Novalta team',
                'description' => 'Tell us about your project, timeline and budget — we reply within one business day.',
                'buttonLabel' => 'Send message',
                'details' => [
                    ['icon' => 'map-pin', 'label' => 'Studio', 'value' => '3rd Ave, NYC'],
                    ['icon' => 'phone', 'label' => 'Phone', 'value' => '+1 (212) 782 9051', 'url' => 'tel:+12127829051'],
                    ['icon' => 'mail', 'label' => 'Email', 'value' => 'hello@novalta.example', 'url' => 'mailto:hello@novalta.example'],
                ],
                'bullets' => "A dedicated team on call for the life of the project\nA single point of contact from kickoff to launch\nAverage reply time under one business day",
            ])),
            TemplateContent::section('faq', 'faq.novalta', self::motion(0)),
        ], self::footer(), 'footer.novalta', 'navbar.novalta');
    }
}
