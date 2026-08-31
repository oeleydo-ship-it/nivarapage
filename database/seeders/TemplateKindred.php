<?php

namespace Database\Seeders;

/**
 * Kindred — a family-of-companies / group brand template.
 *
 * Six pages (Home, About, Latest, Careers, Group, Companies) built from the
 * `*.kindred` block family: a saturated brand green, pale bands with slanted
 * edges, bold geometric headlines closed by a brand-coloured full stop, and serif
 * editorial titles.
 */
class TemplateKindred
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#36960d',
            'secondary' => '#161616',
            'accent' => '#36960d',
            'background' => '#ffffff',
            'surface' => '#eef6ea',
            'text' => '#161616',
            'muted' => '#5f5f5f',
            'headingFont' => 'Figtree, system-ui, sans-serif',
            'bodyFont' => 'Inter, system-ui, sans-serif',
            'serifFont' => 'Libre Baskerville, Georgia, serif',
            'monoFont' => 'JetBrains Mono, ui-monospace, monospace',
            'headingWeight' => 800,
            'bodyWeight' => 400,
            'buttonRadius' => '4px',
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
            'animationDuration' => 680,
            'animationDelay' => $delay,
        ];
    }

    /** @return list<array<string, mixed>> */
    private static function subnavLinks(): array
    {
        return [
            ['label' => 'Our story', 'url' => '/about'],
            ['label' => 'Purpose', 'url' => '/purpose'],
            ['label' => 'Working here', 'url' => '/careers'],
            ['label' => 'Latest', 'url' => '/latest'],
            ['label' => 'The group', 'url' => '/group', 'children' => [
                ['label' => 'Overview', 'url' => '/group'],
                ['label' => 'Kindred Management', 'url' => '/group'],
                ['label' => 'Philanthropy', 'url' => '/purpose'],
            ]],
        ];
    }

    /** @return list<array<string, mixed>> */
    private static function companyCards(): array
    {
        return [
            ['name' => 'Kindred Rail', 'word' => 'Rail', 'url' => '/companies'],
            ['name' => 'Kindred Cellars', 'word' => 'Cellars', 'url' => '/companies'],
            ['name' => 'Kindred Stay', 'word' => 'Stay', 'url' => '/companies'],
            ['name' => 'Kindred Active', 'word' => 'Active', 'url' => '/companies'],
            ['name' => 'Kindred Money', 'word' => 'Money', 'url' => '/companies'],
            ['name' => 'Kindred Air', 'word' => 'Air', 'url' => '/companies'],
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $brand = 'Kindred';

        $nav = array_merge([
            'menuLabel' => 'Menu',
            'logo' => $brand,
            'logoUrl' => '/',
            'links' => [
                ['label' => 'Companies', 'url' => '/companies', 'children' => [
                    ['label' => 'All companies', 'url' => '/companies'],
                    ['label' => 'Travel and leisure', 'url' => '/companies'],
                    ['label' => 'Health and wellness', 'url' => '/companies'],
                    ['label' => 'Money', 'url' => '/companies'],
                    ['label' => 'Media', 'url' => '/companies'],
                ]],
                ['label' => 'About us', 'url' => '/about', 'children' => [
                    ['label' => 'Our story', 'url' => '/about'],
                    ['label' => 'Working here', 'url' => '/careers'],
                    ['label' => 'Latest', 'url' => '/latest'],
                ]],
                ['label' => 'Our foundation', 'url' => '/purpose'],
                ['label' => 'Careers', 'url' => '/careers', 'children' => [
                    ['label' => 'Why join us', 'url' => '/careers'],
                    ['label' => 'Open roles', 'url' => '/careers'],
                    ['label' => 'Apprenticeships', 'url' => '/careers'],
                ]],
                ['label' => 'The group', 'url' => '/group', 'children' => [
                    ['label' => 'Overview', 'url' => '/group'],
                    ['label' => 'Kindred Management', 'url' => '/group'],
                    ['label' => 'Philanthropy', 'url' => '/purpose'],
                ]],
            ],
            'showLinkRow' => true,
            'sticky' => true,
        ], self::motion(0, 'load'), ['animation' => 'fade-down']);

        $footer = array_merge([
            'logo' => $brand,
            'columns' => [
                [
                    'links' => [
                        ['label' => 'Contact Kindred', 'url' => '#'],
                        ['label' => 'Web Terms of Use', 'url' => '#'],
                        ['label' => 'Web Privacy Policy', 'url' => '#'],
                        ['label' => 'Web Cookie Policy', 'url' => '#'],
                    ],
                ],
                [
                    'links' => [
                        ['label' => 'Modern Slavery Statement', 'url' => '#'],
                        ['label' => 'Tax Strategy Statement', 'url' => '#'],
                        ['label' => 'Corporate Governance', 'url' => '#'],
                        ['label' => 'Group FAQs', 'url' => '#'],
                    ],
                ],
                [
                    'links' => [
                        ['label' => 'Newsletter', 'url' => '#'],
                        ['label' => 'Report a Scam', 'url' => '#'],
                        ['label' => 'Candidate Privacy Notice', 'url' => '#'],
                        ['label' => 'Media Centre', 'url' => '#'],
                    ],
                ],
            ],
            'quote' => 'The point was never to be the biggest thing in the room. It was to be the one people were glad turned up.',
            'quoteAuthor' => 'Marisa Okonjo, founder',
            'social' => [
                ['icon' => 'facebook', 'url' => '#'],
                ['icon' => 'twitter', 'url' => '#'],
                ['icon' => 'instagram', 'url' => '#'],
                ['icon' => 'youtube', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
            ],
            'copyright' => '© '.$brand.' '.date('Y').'. All rights reserved.',
        ], self::motion(40));

        return [
            self::home($nav, $footer),
            self::about($footer),
            self::latest($footer),
            self::careers($footer),
            self::group($footer),
            self::companies($nav, $footer),
        ];
    }

    /**
     * @param  array<string, mixed>  $nav
     * @param  array<string, mixed>  $footer
     * @return array<string, mixed>
     */
    private static function home(array $nav, array $footer): array
    {
        return TemplateContent::sitePage('Home', 'home', true, $nav, [
            TemplateContent::section('hero', 'hero.kindred', array_merge(self::motion(0, 'load'), [
                'animation' => 'fade',
                'heading' => 'A trade beats a degree more often than anyone admits',
                'buttonLabel' => 'Find out more',
                'buttonUrl' => '/latest',
                'image' => TemplateContent::photo('1524178232363-1fb2b075b655', 900),
                'imageCaption' => '',
            ])),
            TemplateContent::section('companies', 'carousel.kindred', array_merge(self::motion(40), [
                'heading' => 'See what we are made of',
                'showDot' => true,
                'perPage' => 3,
                'items' => self::companyCards(),
                'buttonLabel' => 'See all Kindred companies',
                'buttonUrl' => '/companies',
            ])),
            TemplateContent::section('latest', 'articles.kindred', array_merge(self::motion(40), [
                'heading' => 'Find out more',
                'showDot' => true,
                'columns' => 3,
                'items' => self::homeArticles(),
                'buttonLabel' => 'View more from Kindred',
                'buttonUrl' => '/latest',
            ])),
            TemplateContent::section('social', 'social.kindred', array_merge(self::motion(40), [
                'logo' => 'K',
                'heading' => 'Reach us on social',
                'description' => 'Be part of the conversation on our latest ventures.',
            ])),
            TemplateContent::section('promos', 'promos.kindred', self::motion(40)),
        ], $footer, 'footer.kindred', 'navbar.kindred');
    }

    /** @return list<array<string, mixed>> */
    private static function homeArticles(): array
    {
        return [
            [
                'tag' => 'Leadership',
                'title' => 'Why we stopped asking candidates for a degree',
                'date' => '18 August 2026',
                'image' => TemplateContent::photo('1552664730-d307ca884978', 800),
                'flat' => '#36960d',
                'flatText' => '',
                'url' => '/latest',
            ],
            [
                'tag' => 'Our companies',
                'title' => 'Meet the apprentices running a depot before they turn 25',
                'date' => '13 August 2026',
                'image' => TemplateContent::photo('1522071820081-009f0129c71c', 800),
                'flat' => '#36960d',
                'flatText' => '',
                'url' => '/latest',
            ],
            [
                'tag' => 'Foundation',
                'title' => '',
                'date' => '12 August 2026',
                'image' => '',
                'flat' => '#36960d',
                'flatText' => 'Half the people we hired last year had never written a CV.',
                'url' => '/latest',
            ],
            [
                'tag' => 'Foundation',
                'title' => 'The community fund reaches its fortieth town',
                'date' => '12 August 2026',
                'image' => TemplateContent::photo('1509099836639-18ba1795216d', 800),
                'flat' => '#36960d',
                'flatText' => '',
                'url' => '/latest',
            ],
            [
                'tag' => 'Leadership',
                'title' => 'The places I go when I need to think properly',
                'date' => '11 August 2026',
                'image' => TemplateContent::photo('1507003211169-0a1dd7228f2d', 800),
                'flat' => '#36960d',
                'flatText' => '',
                'url' => '/latest',
            ],
            [
                'tag' => 'Leadership',
                'title' => 'A rail line is a promise to a town, not a spreadsheet',
                'date' => '23 July 2026',
                'image' => TemplateContent::photo('1544620347-c4fd4a3d5957', 800),
                'flat' => '#36960d',
                'flatText' => '',
                'url' => '/latest',
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $footer
     * @return array<string, mixed>
     */
    private static function about(array $footer): array
    {
        $subnav = array_merge([
            'sectionLabel' => 'About us',
            'logo' => 'Kindred',
            'logoUrl' => '/',
            'links' => self::subnavLinks(),
            'activeIndex' => 0,
        ], self::motion(0, 'load'), ['animation' => 'fade-down']);

        return TemplateContent::sitePage('About', 'about', false, $subnav, [
            TemplateContent::section('story', 'story.kindred', array_merge(self::motion(0, 'load'), [
                'bannerImage' => TemplateContent::photo('1521737604893-d14cc237f11d', 1600),
                'heading' => 'Our story',
                'showDot' => true,
                'body' => "For thirty years the Kindred name has meant one thing to the people who use it: someone finally thought about how this should feel.\n\nFrom the quiet carriage on a **Kindred Rail** sleeper to the way a **Kindred Active** class ends five minutes early so nobody has to rush for the train, the whole business is built backwards from the moment a person actually experiences.",
            ])),
            TemplateContent::section('values', 'values.kindred', array_merge(self::motion(40), [
                'heading' => 'The backbone of our brand will always be our values',
                'showDot' => true,
                'items' => [
                    ['word' => 'Restless Curiosity', 'caption' => 'Kindred archive', 'invert' => false],
                    ['word' => 'Kind Disruption', 'caption' => 'Kindred archive', 'invert' => true],
                    ['word' => 'Plain Speaking', 'caption' => 'Kindred archive', 'invert' => false],
                ],
                'body' => "Kindred grew out of a refusal to accept that a thing had to stay the way it was found. That restlessness built a group of companies across six sectors, and it is still the reason people join us.\n\nOur purpose is to leave every market we enter a little fairer than we found it. Our values are what keep the people, the products and the partners pointed at that.",
            ])),
            TemplateContent::section('stats', 'stats.kindred', array_merge(self::motion(40), [
                'heading' => 'Key statistics',
                'showDot' => true,
                'description' => 'The Kindred group is made up of more than forty companies across six sectors and five continents.',
                'images' => [
                    ['image' => TemplateContent::photo('1451187580459-43490279c0fa', 1000), 'caption' => 'Kindred archive'],
                    ['image' => TemplateContent::photo('1526772662000-3f88f10405ff', 1000), 'caption' => 'Kindred archive'],
                ],
            ])),
            TemplateContent::section('companies', 'carousel.kindred', array_merge(self::motion(40), [
                'heading' => 'See us in action',
                'showDot' => true,
                'perPage' => 3,
                'items' => self::companyCards(),
                'buttonLabel' => 'See all Kindred companies',
                'buttonUrl' => '/companies',
            ])),
        ], $footer, 'footer.kindred', 'subnav.kindred');
    }

    /**
     * @param  array<string, mixed>  $footer
     * @return array<string, mixed>
     */
    private static function latest(array $footer): array
    {
        $subnav = array_merge([
            'sectionLabel' => 'About us',
            'logo' => 'Kindred',
            'logoUrl' => '/',
            'links' => self::subnavLinks(),
            'activeIndex' => 3,
        ], self::motion(0, 'load'), ['animation' => 'fade-down']);

        return TemplateContent::sitePage('Latest', 'latest', false, $subnav, [
            TemplateContent::section('title', 'pagehead.kindred', array_merge(self::motion(0, 'load'), [
                'heading' => 'Latest',
                'showDot' => true,
                'size' => 'xl',
                'description' => '',
            ])),
            TemplateContent::section('featured', 'featured.kindred', array_merge(self::motion(40), [
                'tag' => 'Leadership',
                'title' => 'A rail line is a promise to a town, not a spreadsheet',
                'date' => '18 August 2026',
                'image' => TemplateContent::photo('1544620347-c4fd4a3d5957', 1200),
                'url' => '#',
                'items' => [
                    [
                        'tag' => 'Our companies',
                        'title' => 'Meet the apprentices running a depot before they turn 25',
                        'date' => '13 August 2026',
                        'image' => TemplateContent::photo('1522071820081-009f0129c71c', 800),
                        'flat' => '#36960d',
                        'flatText' => '',
                        'url' => '#',
                    ],
                    [
                        'tag' => 'Foundation',
                        'title' => '',
                        'date' => '12 August 2026',
                        'image' => '',
                        'flat' => '#36960d',
                        'flatText' => 'Half the people we hired last year had never written a CV.',
                        'url' => '#',
                    ],
                ],
            ])),
            TemplateContent::section('filter', 'filter.kindred', array_merge(self::motion(40), [
                'heading' => 'This just in',
                'showDot' => false,
                'tabs' => [
                    ['label' => 'All'],
                    ['label' => 'Our companies'],
                    ['label' => 'Founders'],
                    ['label' => 'Careers'],
                    ['label' => 'The group'],
                    ['label' => 'Foundation'],
                    ['label' => 'Leadership'],
                ],
                'showSelect' => false,
            ])),
            TemplateContent::section('grid', 'articles.kindred', array_merge(self::motion(40), [
                'heading' => '',
                'showDot' => false,
                'columns' => 3,
                'items' => self::homeArticles(),
                'buttonLabel' => 'Load more',
                'buttonUrl' => '#',
            ])),
        ], $footer, 'footer.kindred', 'subnav.kindred');
    }

    /**
     * @param  array<string, mixed>  $footer
     * @return array<string, mixed>
     */
    private static function careers(array $footer): array
    {
        $subnav = array_merge([
            'sectionLabel' => 'About us',
            'logo' => 'Kindred',
            'logoUrl' => '/',
            'links' => self::subnavLinks(),
            'activeIndex' => 2,
        ], self::motion(0, 'load'), ['animation' => 'fade-down']);

        return TemplateContent::sitePage('Careers', 'careers', false, $subnav, [
            TemplateContent::section('intro', 'video.kindred', array_merge(self::motion(0, 'load'), [
                'heading' => 'Working at Kindred',
                'showDot' => true,
                'bandColor' => '#12304f',
                'embedUrl' => '',
                'poster' => TemplateContent::photo('1531482615713-2afd69097998', 1200),
                'caption' => '',
            ])),
            TemplateContent::section('teams', 'carousel.kindred', array_merge(self::motion(40), [
                'heading' => 'Find your people',
                'showDot' => true,
                'perPage' => 3,
                'items' => self::companyCards(),
                'buttonLabel' => 'See every open role',
                'buttonUrl' => '#',
            ])),
            TemplateContent::section('numbers', 'numbers.kindred', array_merge(self::motion(40), [
                'heading' => '41 companies, one Kindred way',
                'showDot' => false,
                'items' => [
                    ['value' => '1996', 'label' => 'The year it all began'],
                    ['value' => '28', 'label' => 'Countries'],
                    ['value' => '51,000', 'label' => 'People (and counting…)'],
                ],
            ])),
            TemplateContent::section('stories', 'video.kindred', array_merge(self::motion(40), [
                'heading' => 'Our stories',
                'showDot' => true,
                'bandColor' => '#3f1d52',
                'embedUrl' => '',
                'poster' => TemplateContent::photo('1573497019940-1c28c88b4f3e', 1200),
                'caption' => '',
            ])),
            TemplateContent::section('why', 'benefits.kindred', array_merge(self::motion(40), [
                'heading' => 'Why join us?',
                'showDot' => false,
                'bandColor' => '#efe6f7',
                'items' => [
                    ['icon' => 'heart', 'text' => 'Join a global community and work alongside people in forty-one companies, twenty-eight countries and more time zones than anyone can keep straight.'],
                    ['icon' => 'gift', 'text' => 'From sleeper berths to cellar releases, every colleague gets access to the things our companies make — at the price we pay for them.'],
                    ['icon' => 'home', 'text' => 'We hire for the person, not the paperwork. Half our depot managers started on the platform, and nobody had to ask permission to move.'],
                ],
            ])),
            TemplateContent::section('careers-news', 'articles.kindred', array_merge(self::motion(40), [
                'heading' => 'The latest on Kindred careers',
                'showDot' => true,
                'columns' => 3,
                'items' => [
                    [
                        'tag' => 'The group',
                        'title' => 'How we rewrote every job advert in the group',
                        'date' => '13 December 2026',
                        'image' => TemplateContent::photo('1521737604893-d14cc237f11d', 800),
                        'flat' => '#36960d',
                        'flatText' => '',
                        'url' => '#',
                    ],
                    [
                        'tag' => 'Careers',
                        'title' => 'Here is to the people who ask the awkward question',
                        'date' => '30 January 2026',
                        'image' => TemplateContent::photo('1552664730-d307ca884978', 800),
                        'flat' => '#36960d',
                        'flatText' => '',
                        'url' => '#',
                    ],
                    [
                        'tag' => 'Careers',
                        'title' => 'What actually happens in a Kindred first interview',
                        'date' => '18 February 2026',
                        'image' => TemplateContent::photo('1517245386807-bb43f82c33c4', 800),
                        'flat' => '#36960d',
                        'flatText' => '',
                        'url' => '#',
                    ],
                ],
                'buttonLabel' => '',
                'buttonUrl' => '',
            ])),
            TemplateContent::section('jobs', 'jobs.kindred', array_merge(self::motion(40), [
                'heading' => 'Hot jobs',
                'showDot' => true,
                'description' => 'A handful of roles our companies are especially keen to fill this month.',
                'items' => [
                    ['word' => 'Rail', 'role' => 'Depot Apprentice', 'company' => 'Kindred Rail', 'location' => 'Crewe, UK', 'url' => '#'],
                    ['word' => 'Stay', 'role' => 'Night Manager', 'company' => 'Kindred Stay', 'location' => 'Lisbon, PT', 'url' => '#'],
                    ['word' => 'Money', 'role' => 'Fraud Analyst', 'company' => 'Kindred Money', 'location' => 'Remote, UK', 'url' => '#'],
                ],
            ])),
        ], $footer, 'footer.kindred', 'subnav.kindred');
    }

    /**
     * @param  array<string, mixed>  $footer
     * @return array<string, mixed>
     */
    private static function group(array $footer): array
    {
        $subnav = array_merge([
            'sectionLabel' => 'The group',
            'logo' => 'Kindred',
            'logoUrl' => '/',
            'links' => self::subnavLinks(),
            'activeIndex' => 4,
        ], self::motion(0, 'load'), ['animation' => 'fade-down']);

        return TemplateContent::sitePage('Group', 'group', false, $subnav, [
            TemplateContent::section('title', 'pagehead.kindred', array_merge(self::motion(0, 'load'), [
                'backLabel' => 'The group',
                'backUrl' => '/group',
                'heading' => 'Overview',
                'showDot' => true,
                'size' => 'xl',
                'description' => '',
            ])),
            TemplateContent::section('banner', 'stats.kindred', array_merge(self::motion(40), [
                'heading' => '',
                'showDot' => false,
                'description' => '',
                'images' => [
                    ['image' => TemplateContent::photo('1526772662000-3f88f10405ff', 1400), 'caption' => 'Kindred archive'],
                ],
            ])),
            TemplateContent::section('overview', 'richtext.kindred', array_merge(self::motion(40), [
                'heading' => '',
                'showDot' => false,
                'intro' => 'Kindred Holdings is a private group with a single job: to own our companies patiently and to keep them honest.',
                'sections' => [
                    [
                        'title' => '',
                        'body' => "The portfolio spans six sectors and five continents, with majority stakes in most of the companies that carry the name and minority positions in a handful that do not.\n\nWe reinvest operating profit rather than distribute it. That is the whole financial strategy, and it is the reason we can take a decade over things that would embarrass a quarterly reporter.",
                    ],
                    [
                        'title' => 'Kindred Management',
                        'body' => "A small team in Bristol, New York and Zurich supports the group: investment professionals, a handful of operators, and the people whose job is to stop the brand being used badly.\n\nThey also handle the licensing arrangements that let companies outside the group carry the Kindred name, under terms that can be withdrawn.",
                    ],
                    [
                        'title' => 'What we own',
                        'body' => "**Travel and leisure.** Kindred Rail, Kindred Voyages and the Kindred Hotels Collection.\n\n**Health and wellness.** Kindred Active operates clubs in the UK, Italy, South Africa and Australia.\n\n**Money.** Kindred Money in retail banking, plus a small venture book focused on payments.\n\n**Media.** Kindred Radio licenses the name to stations in forty countries.",
                    ],
                    [
                        'title' => 'Venture capital',
                        'body' => 'The venture book is deliberately small. We back businesses where the value to a customer is obvious in one sentence, and we are content to be the least clever investor on the cap table.',
                    ],
                    [
                        'title' => 'Philanthropy',
                        'body' => 'Alongside the commercial work, the group funds the Kindred Foundation and Kindred StartUp, which delivers government-backed loans and mentoring to people starting a business for the first time.',
                    ],
                ],
            ])),
        ], $footer, 'footer.kindred', 'subnav.kindred');
    }

    /**
     * @param  array<string, mixed>  $nav
     * @param  array<string, mixed>  $footer
     * @return array<string, mixed>
     */
    private static function companies(array $nav, array $footer): array
    {
        return TemplateContent::sitePage('Companies', 'companies', false, $nav, [
            TemplateContent::section('title', 'pagehead.kindred', array_merge(self::motion(0, 'load'), [
                'heading' => 'Our companies',
                'showDot' => true,
                'size' => 'xl',
                'description' => '',
            ])),
            TemplateContent::section('filter', 'filter.kindred', array_merge(self::motion(40), [
                'heading' => '',
                'showDot' => false,
                'tabs' => [
                    ['label' => 'All companies'],
                    ['label' => 'Entertainment'],
                    ['label' => 'Health & wellness'],
                    ['label' => 'Money'],
                    ['label' => 'People & planet'],
                    ['label' => 'Technology'],
                    ['label' => 'Travel & leisure'],
                ],
                'showSelect' => true,
                'selectLabel' => 'All',
                'selectOptions' => "All\nA to Z\nNewest first",
            ])),
            TemplateContent::section('grid', 'companies.kindred', self::motion(40)),
        ], $footer, 'footer.kindred', 'navbar.kindred');
    }
}
