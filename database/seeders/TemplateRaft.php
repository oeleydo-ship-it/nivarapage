<?php

namespace Database\Seeders;

/**
 * Raft — a dark fintech / neobank landing-page template, ported from the
 * "Raft" landing page design (raft-landing-page.vercel.app).
 *
 * A single long-scroll home page built from the `*.raft` block family: an
 * all-black canvas lit by one vivid signal-green accent that floods
 * full-bleed statement and testimonial bands, a darker forest green on
 * every button, softly rounded charcoal cards, and a light-weight
 * geometric sans for headlines.
 */
class TemplateRaft
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#2b892e',
            'secondary' => '#131313',
            'accent' => '#48d64c',
            'background' => '#070606',
            'surface' => '#131313',
            'text' => '#ffffff',
            'muted' => '#9a9a9a',
            'headingFont' => '"Inter", system-ui, -apple-system, sans-serif',
            'bodyFont' => '"Inter", system-ui, -apple-system, sans-serif',
            'serifFont' => '"Inter", system-ui, sans-serif',
            'monoFont' => 'ui-monospace, monospace',
            'headingWeight' => 500,
            'bodyWeight' => 400,
            'buttonRadius' => '999px',
            'cardRadius' => '12px',
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
            'logo' => 'Raft',
            'logoImage' => '',
            'logoUrl' => '/',
            'links' => [
                ['label' => 'Solutions', 'url' => '#solutions'],
                ['label' => 'Learn', 'url' => '#learn'],
                ['label' => 'About', 'url' => '#about'],
                ['label' => 'Login', 'url' => '#login'],
            ],
            'buttonLabel' => 'Get Started',
            'buttonUrl' => '#',
            'sticky' => true,
        ];
    }

    /** @return array<string, mixed> */
    private static function footer(): array
    {
        return array_merge(self::motion(20), [
            'logo' => 'Raft',
            'logoImage' => '',
            'logoUrl' => '/',
            'qrHeading' => 'Scan to download the app on the Playstore and Appstore.',
            'qrImage' => '',
            'columns' => [
                [
                    'title' => 'Company',
                    'links' => [
                        ['label' => 'Our Company', 'url' => '#'],
                        ['label' => 'Careers', 'url' => '#'],
                        ['label' => 'Press kit', 'url' => '#'],
                    ],
                ],
                [
                    'title' => 'Legal',
                    'links' => [
                        ['label' => 'Terms of use', 'url' => '#'],
                        ['label' => 'Privacy policy', 'url' => '#'],
                    ],
                ],
                [
                    'title' => 'Support',
                    'links' => [
                        ['label' => 'Contact us', 'url' => '/contact'],
                        ['label' => 'FAQ', 'url' => '#faq'],
                    ],
                ],
            ],
            'languageLabel' => 'English (United Kingdom)',
            'copyright' => 'Raft Corp, LLC.',
        ]);
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        return [self::home()];
    }

    /** @return array<string, mixed> */
    private static function home(): array
    {
        return TemplateContent::sitePage('Home', 'home', true, self::nav(), [
            TemplateContent::section('hero', 'hero.raft', array_merge(self::motion(0, 'load'), [
                'image' => TemplateContent::photo('1556742049-0cfed4f6a45d', 1600),
            ])),
            TemplateContent::section('logos', 'logos.raft', self::motion(0)),
            TemplateContent::section('showcase', 'showcase.raft', array_merge(self::motion(0), [
                'items' => [
                    [
                        'title' => 'Seamless Payments',
                        'text' => 'Enjoy secure, seamless transactions that make managing your money a breeze.',
                        'image' => TemplateContent::photo('1556740749-887f6717d7e4', 800),
                    ],
                    [
                        'title' => 'Smart Investing',
                        'text' => 'Grow your wealth confidently with personalised investment solutions, tailored to your goals.',
                        'image' => TemplateContent::photo('1611974789855-9c2a0a7236a3', 800),
                    ],
                    [
                        'title' => 'Wealth Management',
                        'text' => 'Make informed decisions for your financial future with our wealth management expertise.',
                        'image' => TemplateContent::photo('1454165804606-c3d57bc86b40', 800),
                    ],
                    [
                        'title' => 'Financial Planning',
                        'text' => 'Achieve your financial dreams with comprehensive planning that guides you toward a secure future.',
                        'image' => TemplateContent::photo('1553729459-efe14ef6055d', 800),
                    ],
                ],
            ])),
            TemplateContent::section('benefits', 'benefits.raft', self::motion(0)),
            TemplateContent::section('statement', 'statement.raft', self::motion(0)),
            TemplateContent::section('panels', 'panels.raft', self::motion(0)),
            TemplateContent::section('stats', 'stats.raft', array_merge(self::motion(0), [
                'image' => TemplateContent::photo('1543269865-cbf427effbad', 1600),
            ])),
            TemplateContent::section('cards', 'cards.raft', array_merge(self::motion(0), [
                'image' => TemplateContent::photo('1556742111-a301076d9d18', 900),
            ])),
            TemplateContent::section('testimonial', 'testimonial.raft', array_merge(self::motion(0), [
                'avatar' => TemplateContent::photo('1500648767791-00dcc994a43e', 200),
            ])),
            TemplateContent::section('faq', 'faq.raft', self::motion(0)),
        ], self::footer(), 'footer.raft', 'navbar.raft');
    }
}
