<?php

namespace Database\Seeders;

/**
 * Northbook — a professional accountancy / financial-services template.
 *
 * Five pages (Home, Services, Industries, About, News) built from the
 * `*.northbook` block family: deep teal-navy headings closed by a green full
 * stop, a pale sage hero band, green pill buttons and thin-bordered cards.
 */
class TemplateNorthbook
{
    private const BAND = '#dfe9e9';

    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#2bb673',
            'secondary' => '#0e3c4d',
            'accent' => '#2bb673',
            'background' => '#ffffff',
            'surface' => '#f5f8f8',
            'text' => '#0e3c4d',
            'muted' => '#5f7178',
            'headingFont' => 'Plus Jakarta Sans, system-ui, sans-serif',
            'bodyFont' => 'Inter, system-ui, sans-serif',
            'serifFont' => 'Georgia, serif',
            'monoFont' => 'JetBrains Mono, ui-monospace, monospace',
            'headingWeight' => 700,
            'bodyWeight' => 400,
            'buttonRadius' => '999px',
            'cardRadius' => '8px',
            'containerWidth' => '1200px',
            'sectionSpacing' => '88px',
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

    /** @return array<string, mixed> */
    private static function topbar(): array
    {
        return array_merge([
            'links' => [
                ['label' => 'Offices', 'url' => '/about'],
                ['label' => 'Careers', 'url' => '/about'],
                ['label' => 'FAQs', 'url' => '/services'],
            ],
            'phone' => '(555) 802-1234',
            'phoneUrl' => 'tel:5558021234',
            'emailLabel' => 'Email us',
            'emailUrl' => 'mailto:hello@northbook.com',
            'social' => [
                ['icon' => 'facebook', 'url' => '#'],
                ['icon' => 'twitter', 'url' => '#'],
                ['icon' => 'instagram', 'url' => '#'],
                ['icon' => 'youtube', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
            ],
        ], ['animation' => 'none']);
    }

    /** @return array<string, mixed> */
    private static function nav(): array
    {
        return array_merge([
            'logo' => 'northbook',
            'logoSub' => 'accountants',
            'logoImage' => '',
            'logoUrl' => '/',
            'links' => [
                ['label' => 'Home', 'url' => '/'],
                ['label' => 'Services', 'url' => '/services', 'children' => [
                    ['label' => 'Tax preparation', 'url' => '/services'],
                    ['label' => 'Bookkeeping', 'url' => '/services'],
                    ['label' => 'Payroll', 'url' => '/services'],
                    ['label' => 'Advisory', 'url' => '/services'],
                ]],
                ['label' => 'Industries', 'url' => '/industries', 'children' => [
                    ['label' => 'Private clients', 'url' => '/industries'],
                    ['label' => 'Entrepreneurs', 'url' => '/industries'],
                    ['label' => 'Professional firms', 'url' => '/industries'],
                ]],
                ['label' => 'Resources', 'url' => '/news'],
                ['label' => 'About us', 'url' => '/about'],
                ['label' => 'News', 'url' => '/news'],
            ],
            'buttonLabel' => 'Free consultation',
            'buttonUrl' => '/about',
            'sticky' => true,
        ], self::motion(0, 'load'), ['animation' => 'fade-down']);
    }

    /** @return array<string, mixed> */
    private static function footer(): array
    {
        return array_merge([
            'logo' => 'northbook',
            'logoSub' => 'accountants',
            'logoImage' => '',
            'logoUrl' => '/',
            'description' => 'Straight-talking accountants for owner-run businesses across the UK. Filings on time, advice in plain English.',
            'columns' => [
                [
                    'title' => 'Overview',
                    'links' => [
                        ['label' => 'Services', 'url' => '/services'],
                        ['label' => 'Industries', 'url' => '/industries'],
                        ['label' => 'Who we are', 'url' => '/about'],
                        ['label' => 'Resources', 'url' => '/news'],
                        ['label' => 'News', 'url' => '/news'],
                    ],
                ],
                [
                    'title' => '',
                    'links' => [
                        ['label' => 'Offices', 'url' => '/about'],
                        ['label' => 'Careers', 'url' => '/about'],
                        ['label' => 'FAQs', 'url' => '/services'],
                    ],
                ],
            ],
            'infoTitle' => 'Business info',
            'address' => "Northbook 1234 Harbour Avenue,\nBristol, BS1 4TR",
            'phone' => '(555) 802-1234',
            'phoneUrl' => 'tel:5558021234',
            'email' => 'hello@northbook.com',
            'emailUrl' => 'mailto:hello@northbook.com',
            'social' => [
                ['icon' => 'facebook', 'url' => '#'],
                ['icon' => 'twitter', 'url' => '#'],
                ['icon' => 'instagram', 'url' => '#'],
                ['icon' => 'youtube', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
            ],
            'copyright' => '© '.date('Y').' Northbook',
            'topLabel' => 'Back to top',
        ], self::motion(40));
    }

    /** @return array<string, mixed> */
    private static function logos(): array
    {
        return array_merge(self::motion(40), [
            'heading' => 'Trusted by the UK’s fastest-growing small businesses',
            'items' => [
                ['label' => 'abstract'],
                ['label' => 'CGLOBAL'],
                ['label' => 'digitalbox'],
                ['label' => 'HEMISFERIO'],
                ['label' => 'next'],
                ['label' => '[spaces]'],
            ],
        ]);
    }

    /** @return array<string, mixed> */
    private static function consult(): array
    {
        return array_merge(self::motion(40), [
            'heading' => 'Get a personal consultation',
            'showDot' => true,
            'officeLabel' => 'Office',
            'office' => "Northbook 1234 Harbour Avenue,\nBristol, BS1 4TR",
            'contactLabel' => 'Contact',
            'contact' => "hello@northbook.com\nsupport@northbook.com",
            'hoursLabel' => 'Open hours',
            'hours' => "Monday to Saturday: 8am — 6pm\nSunday: 11am — 4pm",
            'formId' => '',
            'buttonLabel' => 'Request a quote',
        ]);
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        return [
            self::home(),
            self::services(),
            self::industries(),
            self::about(),
            self::news(),
        ];
    }

    /** @return array<string, mixed> */
    private static function home(): array
    {
        return TemplateContent::sitePage('Home', 'home', true, self::topbar(), [
            TemplateContent::section('navbar', 'navbar.northbook', self::nav()),
            TemplateContent::section('hero', 'hero.northbook', array_merge(self::motion(0, 'load'), [
                'bandColor' => self::BAND,
                'eyebrow' => '',
                'heading' => 'Secure your financial future with Northbook',
                'showDot' => true,
                'description' => 'Straight-talking accountants for owner-run businesses. We keep the filings on time and the surprises to none.',
                'buttonLabel' => 'Free consultation',
                'buttonUrl' => '/about',
                'image' => TemplateContent::photo('1573497019940-1c28c88b4f3e', 1000),
            ])),
            TemplateContent::section('services', 'services.northbook', array_merge(self::motion(40), [
                'heading' => 'Solutions for every business need',
                'showDot' => true,
                'columns' => 3,
                'items' => [
                    ['icon' => 'chart', 'title' => 'Accounting', 'text' => 'Monthly management accounts you can actually read, closed within five working days.'],
                    ['icon' => 'briefcase', 'title' => 'Tax management', 'text' => 'Corporation tax, VAT and self assessment handled end to end, filed early rather than nearly late.'],
                    ['icon' => 'trending-up', 'title' => 'Financial planning', 'text' => 'Cash-flow forecasts and scenario models that answer the question you actually asked.'],
                ],
            ])),
            TemplateContent::section('inline', 'inlinecta.northbook', array_merge(self::motion(40), [
                'heading' => 'Need a personalised solution',
                'suffix' => '?',
                'description' => 'Tell us what the business does and where it hurts. We will tell you whether we can help, honestly.',
                'buttonLabel' => 'How we can help',
                'buttonUrl' => '/about',
            ])),
            TemplateContent::section('empower', 'split.northbook', array_merge(self::motion(40), [
                'eyebrow' => '',
                'heading' => 'Empowering you to make sound financial decisions',
                'showDot' => true,
                'description' => 'You should not need an accountancy degree to understand your own numbers. We explain the decision, not just the deadline.',
                'bullets' => "Financial assessment reports\nIncome tax planning and consulting\nPayroll and sales taxes",
                'image' => TemplateContent::photo('1521737604893-d14cc237f11d', 1000),
                'reverse' => false,
            ])),
            TemplateContent::section('personas', 'personas.northbook', array_merge(self::motion(40), [
                'heading' => 'No matter who you are, we’ve got what you need',
                'showDot' => true,
            ])),
            TemplateContent::section('logos', 'logos.northbook', self::logos()),
            TemplateContent::section('consult', 'contact.northbook', self::consult()),
        ], self::footer(), 'footer.northbook', 'topbar.northbook');
    }

    /** @return array<string, mixed> */
    private static function services(): array
    {
        return TemplateContent::sitePage('Services', 'services', false, self::topbar(), [
            TemplateContent::section('navbar', 'navbar.northbook', self::nav()),
            TemplateContent::section('hero', 'hero.northbook', array_merge(self::motion(0, 'load'), [
                'bandColor' => self::BAND,
                'eyebrow' => 'Accounting',
                'heading' => 'Financial statement preparation',
                'showDot' => true,
                'description' => 'Year-end accounts prepared properly, explained in a meeting rather than emailed as a PDF and forgotten.',
                'buttonLabel' => 'Free consultation',
                'buttonUrl' => '/about',
                'image' => TemplateContent::photo('1454165804606-c3d57bc86b40', 1000),
            ])),
            TemplateContent::section('list', 'list.northbook', array_merge(self::motion(40), [
                'heading' => 'We bring you the best possible solutions for your company',
                'showDot' => true,
                'columns' => 2,
                'items' => [
                    ['icon' => 'chart', 'title' => 'Income tax preparation', 'text' => 'Returns prepared, reviewed and filed with every allowance you are entitled to and none you are not.'],
                    ['icon' => 'target', 'title' => 'Income tax planning', 'text' => 'We look at next year before it happens, so the bill is a decision rather than a shock.'],
                    ['icon' => 'users', 'title' => 'Business start-up consulting', 'text' => 'Structure, registrations and the first set of books, set up so they still work at year three.'],
                    ['icon' => 'layers', 'title' => 'General ledger review', 'text' => 'A second pair of eyes over the ledger before it becomes an auditor problem.'],
                ],
            ])),
            TemplateContent::section('industries', 'split.northbook', array_merge(self::motion(40), [
                'eyebrow' => 'Industries',
                'heading' => 'We enjoy working with a wide variety of service businesses',
                'showDot' => true,
                'description' => 'Trades, clinics, studios and shops. Different rhythms, same need for numbers that arrive before the decision does.',
                'bullets' => '',
                'image' => TemplateContent::photo('1516321318423-f06f85e504b3', 1000),
                'reverse' => false,
            ])),
            TemplateContent::section('stats', 'stats.northbook', array_merge(self::motion(40), [
                'items' => [
                    ['label' => 'Years of experience', 'value' => '30'],
                    ['label' => 'Clients served', 'value' => '160K'],
                    ['label' => 'Countries covered', 'value' => '89'],
                ],
            ])),
            TemplateContent::section('logos', 'logos.northbook', self::logos()),
            TemplateContent::section('resources', 'resources.northbook', array_merge(self::motion(40), [
                'heading' => 'Exceptional accountancy resources',
                'showDot' => true,
                'description' => 'Spreadsheets, calculators and checklists we actually use with clients. Free, no email wall.',
            ])),
            TemplateContent::section('quotes', 'testimonials.northbook', self::motion(40)),
            TemplateContent::section('compare', 'compare.northbook', array_merge(self::motion(40), [
                'heading' => 'Great benefits from Northbook',
                'showDot' => true,
                'description' => 'The same work, done by people who answer the phone. Here is what changes when you move.',
            ])),
            TemplateContent::section('inline', 'inlinecta.northbook', array_merge(self::motion(40), [
                'heading' => 'Need a personalised solution',
                'suffix' => '?',
                'description' => 'Tell us what the business does and where it hurts. We will tell you whether we can help, honestly.',
                'buttonLabel' => 'How we can help',
                'buttonUrl' => '/about',
            ])),
            TemplateContent::section('consult', 'contact.northbook', self::consult()),
            TemplateContent::section('other', 'services.northbook', array_merge(self::motion(40), [
                'heading' => 'Other accountancy services',
                'showDot' => true,
                'columns' => 3,
                'items' => [
                    ['icon' => 'briefcase', 'title' => 'Tax services', 'text' => 'Personal and corporate returns, disclosures and the occasional awkward letter from HMRC.', 'url' => '/services'],
                    ['icon' => 'book', 'title' => 'Bookkeeping', 'text' => 'Weekly or monthly, reconciled and closed, so the year end is a formality.', 'url' => '/services'],
                    ['icon' => 'users', 'title' => 'Payroll', 'text' => 'Payslips, pensions and RTI submissions, run on the same date every month.', 'url' => '/services'],
                ],
            ])),
        ], self::footer(), 'footer.northbook', 'topbar.northbook');
    }

    /** @return array<string, mixed> */
    private static function industries(): array
    {
        return TemplateContent::sitePage('Industries', 'industries', false, self::topbar(), [
            TemplateContent::section('navbar', 'navbar.northbook', self::nav()),
            TemplateContent::section('hero', 'pagehero.northbook', array_merge(self::motion(0, 'load'), [
                'bandColor' => self::BAND,
                'eyebrow' => 'Industries',
                'heading' => 'Your accountant should understand your industry',
                'showDot' => true,
                'description' => 'We work with a deliberately narrow set of sectors, so the advice is specific rather than generic.',
                'align' => 'center',
            ])),
            TemplateContent::section('private', 'split.northbook', array_merge(self::motion(40), [
                'eyebrow' => '',
                'heading' => 'Private clients',
                'showDot' => true,
                'description' => 'Self assessment, property income and the year you finally sold something. Handled without drama.',
                'bullets' => "Self assessment prepared and filed\nProperty and rental income\nCapital gains on a sale\nInheritance and estate planning",
                'image' => TemplateContent::photo('1544005313-94ddf0286df2', 900),
                'reverse' => true,
            ])),
            TemplateContent::section('entrepreneurs', 'split.northbook', array_merge(self::motion(40), [
                'eyebrow' => '',
                'heading' => 'Entrepreneurs',
                'showDot' => true,
                'description' => 'From first invoice to first hire. The structure you pick now decides the tax you pay for a decade.',
                'bullets' => "Company formation and structure\nDirector remuneration planning\nR&D and allowance claims\nInvestor-ready management accounts",
                'image' => TemplateContent::photo('1573497019940-1c28c88b4f3e', 900),
                'reverse' => false,
            ])),
            TemplateContent::section('firms', 'split.northbook', array_merge(self::motion(40), [
                'eyebrow' => '',
                'heading' => 'Professional firms',
                'showDot' => true,
                'description' => 'Partnerships, practices and consultancies where the numbers need to survive a partner meeting.',
                'bullets' => "Partnership accounts and drawings\nProfit share modelling\nVAT on professional services\nBenchmarking against the sector",
                'image' => TemplateContent::photo('1507003211169-0a1dd7228f2d', 900),
                'reverse' => true,
            ])),
            TemplateContent::section('logos', 'logos.northbook', self::logos()),
            TemplateContent::section('resources', 'resources.northbook', array_merge(self::motion(40), [
                'heading' => 'Exceptional accounting resources',
                'showDot' => true,
                'description' => 'Spreadsheets, calculators and checklists we actually use with clients. Free, no email wall.',
            ])),
            TemplateContent::section('compare', 'compare.northbook', array_merge(self::motion(40), [
                'heading' => 'Great benefits from Northbook',
                'showDot' => true,
                'description' => 'The same work, done by people who answer the phone. Here is what changes when you move.',
            ])),
            TemplateContent::section('consult', 'contact.northbook', self::consult()),
        ], self::footer(), 'footer.northbook', 'topbar.northbook');
    }

    /** @return array<string, mixed> */
    private static function about(): array
    {
        return TemplateContent::sitePage('About', 'about', false, self::topbar(), [
            TemplateContent::section('navbar', 'navbar.northbook', self::nav()),
            TemplateContent::section('hero', 'pagehero.northbook', array_merge(self::motion(0, 'load'), [
                'bandColor' => self::BAND,
                'eyebrow' => 'About us',
                'heading' => 'We deliver expertise you can trust',
                'showDot' => true,
                'description' => 'Thirty years, sixteen hundred clients and a stubborn belief that most people are not bad with money — they are just badly served.',
                'align' => 'left',
            ])),
            TemplateContent::section('band', 'gallery.northbook', array_merge(self::motion(40), [
                'bandColor' => self::BAND,
                'caption' => 'The Bristol office, mid deadline week.',
            ])),
            TemplateContent::section('overview', 'richtext.northbook', array_merge(self::motion(40), [
                'heading' => 'Overview',
                'showDot' => true,
            ])),
            TemplateContent::section('mission', 'split.northbook', array_merge(self::motion(40), [
                'eyebrow' => 'Our mission',
                'heading' => 'We help clients identify their business and financial needs',
                'showDot' => true,
                'description' => 'Most firms answer the question you asked. We would rather find the question you should have asked, then answer that one too.',
                'bullets' => '',
                'image' => TemplateContent::photo('1552581234-26160f608093', 1000),
                'reverse' => false,
            ])),
            TemplateContent::section('logos', 'logos.northbook', self::logos()),
            TemplateContent::section('values', 'values.northbook', array_merge(self::motion(40), [
                'heading' => 'Our values',
                'showDot' => true,
                'description' => 'Four things we will not trade away, even when it costs us the work.',
            ])),
            TemplateContent::section('team', 'team.northbook', array_merge(self::motion(40), [
                'heading' => 'Meet the team',
                'showDot' => true,
                'columns' => 3,
            ])),
            TemplateContent::section('careers', 'split.northbook', array_merge(self::motion(40), [
                'eyebrow' => 'Careers',
                'heading' => 'Want to be a part of our team',
                'showDot' => true,
                'description' => 'We hire people who can explain a balance sheet to someone who has never seen one. The rest we can teach.',
                'bullets' => '',
                'image' => TemplateContent::photo('1521791136064-7986c2920216', 1000),
                'reverse' => true,
                'buttonLabel' => 'See openings',
                'buttonUrl' => '#',
            ])),
            TemplateContent::section('offices', 'offices.northbook', array_merge(self::motion(40), [
                'heading' => 'Our offices',
                'showDot' => true,
            ])),
            TemplateContent::section('cta', 'ctaband.northbook', array_merge(self::motion(40), [
                'heading' => 'Get a personal consultation',
                'showDot' => true,
                'description' => 'We will take care of your accounting and administrative services.',
                'buttonLabel' => 'Free consultation',
                'buttonUrl' => '/about',
                'phone' => '(555) 802-1234',
            ])),
        ], self::footer(), 'footer.northbook', 'topbar.northbook');
    }

    /** @return array<string, mixed> */
    private static function news(): array
    {
        return TemplateContent::sitePage('News', 'news', false, self::topbar(), [
            TemplateContent::section('navbar', 'navbar.northbook', self::nav()),
            TemplateContent::section('hero', 'pagehero.northbook', array_merge(self::motion(0, 'load'), [
                'bandColor' => self::BAND,
                'eyebrow' => 'News',
                'heading' => 'Accounting and tax tips',
                'showDot' => true,
                'description' => 'Short, practical notes from the people who file the returns. No jargon, no filler.',
                'align' => 'center',
            ])),
            TemplateContent::section('posts', 'posts.northbook', array_merge(self::motion(40), [
                'heading' => '',
                'columns' => 2,
            ])),
            TemplateContent::section('newsletter', 'newsletter.northbook', array_merge(self::motion(40), [
                'heading' => 'Join the newsletter',
                'showDot' => true,
                'description' => 'One short email a month. Deadlines, changes and the odd thing worth knowing.',
            ])),
            TemplateContent::section('cta', 'ctaband.northbook', array_merge(self::motion(40), [
                'heading' => 'Get a personal consultation',
                'showDot' => true,
                'description' => 'We will take care of your accounting and administrative services.',
                'buttonLabel' => 'Free consultation',
                'buttonUrl' => '/about',
                'phone' => '(555) 802-1234',
            ])),
        ], self::footer(), 'footer.northbook', 'topbar.northbook');
    }
}
