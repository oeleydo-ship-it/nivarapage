<?php

namespace Database\Seeders;

/**
 * Voltera — a high-energy digital-marketing agency template.
 *
 * Eight pages (Home, Services, About, Pricing, Case Studies, Blog, Article,
 * Contact) built from the `*.voltera` block family: electric indigo panels
 * against white, a chartreuse lime accent on every pill button and eyebrow,
 * near-black geometric headlines and rounded hairline cards.
 */
class TemplateVoltera
{
    private const BLUE = '#2a18f2';

    private const LIME = '#c8f60c';

    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => self::BLUE,
            'secondary' => '#0b0b12',
            'accent' => self::LIME,
            'background' => '#ffffff',
            'surface' => '#f4f5f9',
            'text' => '#0b0b12',
            'muted' => '#5b5b6b',
            'headingFont' => 'Figtree, system-ui, sans-serif',
            'bodyFont' => 'Figtree, system-ui, sans-serif',
            'serifFont' => 'Georgia, serif',
            'monoFont' => 'JetBrains Mono, ui-monospace, monospace',
            'headingWeight' => 700,
            'bodyWeight' => 400,
            'buttonRadius' => '999px',
            'cardRadius' => '18px',
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
            'animationDuration' => 640,
            'animationDelay' => $delay,
        ];
    }

    /** @return array<string, mixed> */
    private static function nav(): array
    {
        return array_merge([
            'logo' => 'Voltera',
            'logoImage' => '',
            'logoUrl' => '/',
            'links' => [
                ['label' => 'Services', 'url' => '/services', 'children' => [
                    ['label' => 'Digital strategy', 'url' => '/services'],
                    ['label' => 'Social media', 'url' => '/services'],
                    ['label' => 'Content marketing', 'url' => '/services'],
                    ['label' => 'Search and paid media', 'url' => '/services'],
                ]],
                ['label' => 'About Us', 'url' => '/about'],
                ['label' => 'Pricing', 'url' => '/pricing'],
                ['label' => 'Case Studies', 'url' => '/work'],
                ['label' => 'Pages', 'url' => '/blog', 'children' => [
                    ['label' => 'Blog', 'url' => '/blog'],
                    ['label' => 'Article', 'url' => '/article'],
                    ['label' => 'Contact us', 'url' => '/contact'],
                ]],
            ],
            'buttonLabel' => 'Get in Touch',
            'buttonUrl' => '/contact',
            'sticky' => true,
        ], ['animation' => 'fade-down', 'animationTrigger' => 'load']);
    }

    /** @return array<string, mixed> */
    private static function footer(): array
    {
        return array_merge([
            'logo' => 'Voltera',
            'logoImage' => '',
            'logoUrl' => '/',
            'tagline' => 'Fuelling Your Brand’s Brilliance',
            'columns' => [
                [
                    'title' => 'Pages',
                    'links' => [
                        ['label' => 'Homepage', 'url' => '/'],
                        ['label' => 'Services', 'url' => '/services'],
                        ['label' => 'About Us', 'url' => '/about'],
                        ['label' => 'Case Studies', 'url' => '/work'],
                    ],
                ],
                [
                    'title' => '',
                    'links' => [
                        ['label' => 'Pricing', 'url' => '/pricing'],
                        ['label' => 'Blog', 'url' => '/blog'],
                        ['label' => 'Article', 'url' => '/article'],
                        ['label' => 'Contact Us', 'url' => '/contact'],
                    ],
                ],
                [
                    'title' => 'Utility Pages',
                    'links' => [
                        ['label' => 'Style Guide', 'url' => '/'],
                        ['label' => 'Password Protected', 'url' => '/'],
                        ['label' => '404 Page', 'url' => '/'],
                        ['label' => 'Licenses', 'url' => '/'],
                    ],
                ],
            ],
            'contactTitle' => 'Contact',
            'phone' => '(405) 123-456',
            'phoneUrl' => 'tel:405123456',
            'email' => 'hello@voltera.com',
            'emailUrl' => 'mailto:hello@voltera.com',
            'social' => [
                ['icon' => 'facebook', 'url' => '#'],
                ['icon' => 'instagram', 'url' => '#'],
                ['icon' => 'twitter', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
            ],
            'copyright' => '© Voltera '.date('Y'),
        ], self::motion(40));
    }

    /** @return array<string, mixed> */
    private static function cta(): array
    {
        return array_merge(self::motion(40), [
            'eyebrow' => 'Contact us',
            'heading' => 'Unleash Your Brand’s Potential with Voltera!',
            'description' => 'Join the hundreds of satisfied clients who have transformed their business with Voltera. Contact us today to get started!',
            'buttonLabel' => 'Get in Touch',
            'buttonUrl' => '/contact',
            'secondaryLabel' => 'View Services',
            'secondaryUrl' => '/services',
        ]);
    }

    /** @return array<string, mixed> */
    private static function process(): array
    {
        return array_merge(self::motion(40), [
            'eyebrow' => 'Our process',
            'heading' => 'From Vision to Victory',
            'description' => 'Our streamlined process is designed to deliver outstanding results at every stage of your marketing journey. Here’s how we do it.',
            'buttonLabel' => 'Get in Touch',
            'buttonUrl' => '/contact',
            'secondaryLabel' => 'Case Studies',
            'secondaryUrl' => '/work',
            'items' => [
                ['step' => 'Step 1', 'title' => 'Discovery & Strategy', 'text' => 'We take the time to understand your goals, challenges and target audience before anything is built.', 'image' => ''],
                ['step' => 'Step 2', 'title' => 'Execution & Optimisation', 'text' => 'We continuously monitor performance, making real-time adjustments to optimise results.', 'image' => ''],
                ['step' => 'Step 3', 'title' => 'Analysis & Growth', 'text' => 'We report on what moved, what did not, and where the next gain is hiding.', 'image' => ''],
            ],
        ]);
    }

    /** @return array<string, mixed> */
    private static function testimonials(): array
    {
        return array_merge(self::motion(40), [
            'eyebrow' => 'Testimonials',
            'heading' => 'Client Testimonials on the Voltera Experience',
            'description' => 'Here are some of the voices from our satisfied clients who have experienced the transformative power of Voltera.',
            'items' => [
                [
                    'quote' => 'Voltera transformed our online presence. The results were beyond our expectations. Our social media engagement skyrocketed, and we saw a significant increase in sales. Their team is creative, professional, and truly understands our brand’s vision.',
                    'name' => 'Jonas Khanwald',
                    'role' => 'Marketing Director',
                    'company' => 'Logo Ipsum',
                    'image' => TemplateContent::photo('1507003211169-0a1dd7228f2d', 700),
                ],
                [
                    'quote' => 'The team at Voltera is exceptional. Our engagement rates soared and our search rankings improved dramatically. They gave us a clear strategy and executed it flawlessly. Highly recommended.',
                    'name' => 'Martha Nielsen',
                    'role' => 'Chief Executive Officer',
                    'company' => 'Logo Ipsum',
                    'image' => TemplateContent::photo('1573497019940-1c28c88b4f3e', 700),
                ],
            ],
        ]);
    }

    /** @return array<string, mixed> */
    private static function caseCards(): array
    {
        return [
            ['tag' => 'Content marketing', 'title' => 'Elevating Gozaru Enterprises’ Brand to Success', 'text' => 'Gozaru, an old player in the media space, needed a powerful blog launch strategy for their first category of health and nutrition.', 'logo' => '', 'logoText' => 'GOZARU', 'panelColor' => '#1f2b45', 'dark' => true, 'url' => '/work'],
            ['tag' => 'Email marketing', 'title' => 'Transforming Konstant’s Email Marketing', 'text' => 'Konstant, a large metal company, was struggling with low organic search visibility and a mailing list that never opened anything.', 'logo' => '', 'logoText' => 'Konstant', 'panelColor' => '#e8f2e2', 'dark' => false, 'url' => '/work'],
            ['tag' => 'Search engine optimisation', 'title' => 'Boosting Godud’s SEO Organic Traffic', 'text' => 'Godud Inc., a mid-sized e-commerce company, was struggling with low organic search visibility against far larger competitors.', 'logo' => '', 'logoText' => 'Godud', 'panelColor' => '#efa22a', 'dark' => true, 'url' => '/work'],
            ['tag' => 'Pay-per-click advertising', 'title' => 'Launching Potrone’s First Meta Ads Campaign', 'text' => 'Potrone Ltd., a new entrant in the fashion industry, needed a powerful launch strategy for their first product line.', 'logo' => '', 'logoText' => 'Potrone', 'panelColor' => '#2fb98a', 'dark' => true, 'url' => '/work'],
        ];
    }

    /** @return list<array<string, mixed>> */
    private static function articles(): array
    {
        return [
            [
                'category' => 'Content Marketing',
                'date' => 'May 16, 2024',
                'title' => 'Brand Loyalty Through Personalised Audience Marketing',
                'text' => 'Personalised marketing is key to building strong brand loyalty and long-term, sustainable customer relationships.',
                'image' => TemplateContent::photo('1586717791821-3f44a563fa4c', 800),
                'url' => '/article',
            ],
            [
                'category' => 'Email Marketing',
                'date' => 'Jan 24, 2024',
                'title' => 'Email Marketing Trends and Best Practices for 2024',
                'text' => 'Email marketing remains one of the most effective ways to engage with your audience. Here is the strategy we use.',
                'image' => TemplateContent::photo('1526628953301-3e589a6a8b74', 800),
                'url' => '/article',
            ],
            [
                'category' => 'Content Marketing',
                'date' => 'Dec 11, 2023',
                'title' => 'How to Create Original Compelling Content That Converts',
                'text' => 'Discover the secrets to crafting original content that turns an audience into loyal customers and supporters.',
                'image' => TemplateContent::photo('1552664730-d307ca884978', 800),
                'url' => '/article',
            ],
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        return [
            self::home(),
            self::services(),
            self::about(),
            self::pricing(),
            self::work(),
            self::blog(),
            self::article(),
            self::contact(),
        ];
    }

    /** @return array<string, mixed> */
    private static function home(): array
    {
        return TemplateContent::sitePage('Home', 'home', true, self::nav(), [
            TemplateContent::section('hero', 'hero.voltera', array_merge(self::motion(0, 'load'), [
                'eyebrow' => 'All-in-one marketing agency',
                'heading' => 'Ignite Your Brand with Voltera',
                'description' => 'Let us help you navigate the complete digital landscape and reach the goals you set for the year with almost unfair confidence.',
                'buttonLabel' => 'Get in Touch',
                'buttonUrl' => '/contact',
                'secondaryLabel' => 'See all Services',
                'secondaryUrl' => '/services',
                'image' => TemplateContent::photo('1573497019940-1c28c88b4f3e', 900),
                'stats' => [
                    ['value' => '500+', 'label' => 'Satisfied Clients'],
                    ['value' => '1000+', 'label' => 'Successful Projects'],
                    ['value' => '$10M+', 'label' => 'Revenue Generated'],
                ],
                'highlights' => [
                    ['icon' => 'award', 'label' => 'Award-Winning Team'],
                    ['icon' => 'target', 'label' => 'Tailored Solutions'],
                    ['icon' => 'trending-up', 'label' => 'Proven Results'],
                ],
            ])),
            TemplateContent::section('services', 'services.voltera', array_merge(self::motion(40), [
                'eyebrow' => 'Our services',
                'heading' => 'Unleash Your Brand’s Potential',
                'description' => 'Our innovative strategies and expert execution ensure that your brand not only stands out but also thrives in today’s competitive landscape.',
                'items' => [
                    ['title' => 'Digital Strategy Development', 'text' => 'A comprehensive plan aligned to your brand, built so every effort drives growth rather than noise.', 'url' => '/services'],
                    ['title' => 'Social Media Management', 'text' => 'Engaging content, managed presence and targeted campaigns that lift engagement and conversion.', 'url' => '/services'],
                    ['title' => 'Search Engine Optimisation', 'text' => 'Technical fixes and content that earn rankings, then keep them once the competition notices.', 'url' => '/services'],
                    ['title' => 'Email Marketing', 'text' => 'Personalised campaigns that nurture leads, retain customers and stay out of the promotions tab.', 'url' => '/services'],
                ],
                // Closed on load: visitors open the row they care about.
                'openIndex' => -1,
            ])),
            TemplateContent::section('process', 'process.voltera', self::process()),
            TemplateContent::section('statsband', 'statsband.voltera', array_merge(self::motion(40), [
                'image' => TemplateContent::photo('1521737604893-d14cc237f11d', 1400),
                'cardTitle' => 'Voltera',
                'stats' => [
                    ['value' => '500+', 'label' => 'Satisfied Clients'],
                    ['value' => '1000+', 'label' => 'Successful Projects'],
                    ['value' => '$10M+', 'label' => 'Revenue Generated'],
                ],
                'buttonLabel' => 'Learn More',
                'buttonUrl' => '/about',
            ])),
            TemplateContent::section('cases', 'casestudies.voltera', array_merge(self::motion(40), [
                'eyebrow' => 'Voltera case studies',
                'heading' => 'Transformative Case Studies of Marketing Excellence',
                'description' => 'Here are some of our standout case studies that showcase our expertise and commitment to excellence.',
                'buttonLabel' => 'Get in Touch',
                'buttonUrl' => '/contact',
                'secondaryLabel' => 'All Case Studies',
                'secondaryUrl' => '/work',
                'items' => array_slice(self::caseCards(), 0, 2),
                'columns' => 2,
            ])),
            TemplateContent::section('quotes', 'testimonials.voltera', self::testimonials()),
            TemplateContent::section('posts', 'posts.voltera', array_merge(self::motion(40), [
                'eyebrow' => '',
                'heading' => 'Marketing Mastery',
                'description' => '',
                'buttonLabel' => 'Get in Touch',
                'buttonUrl' => '/contact',
                'secondaryLabel' => 'View all Blogs',
                'secondaryUrl' => '/blog',
                'filters' => [],
                'items' => self::articles(),
                'columns' => 3,
            ])),
            TemplateContent::section('cta', 'ctaband.voltera', self::cta()),
        ], self::footer(), 'footer.voltera', 'navbar.voltera');
    }

    /** @return array<string, mixed> */
    private static function services(): array
    {
        return TemplateContent::sitePage('Services', 'services', false, self::nav(), [
            TemplateContent::section('head', 'pagehero.voltera', array_merge(self::motion(0, 'load'), [
                'eyebrow' => 'Our services',
                'heading' => 'Comprehensive Marketing Solutions by Voltera',
                'description' => 'Explore our services below and discover how we can help you achieve your marketing goals.',
                'buttonLabel' => 'Get in Touch',
                'buttonUrl' => '/contact',
                'secondaryLabel' => 'See Case Studies',
                'secondaryUrl' => '/work',
                'image' => '',
                'stats' => [
                    ['value' => '500+', 'label' => 'Satisfied Clients'],
                    ['value' => '1000+', 'label' => 'Successful Projects'],
                    ['value' => '$10M+', 'label' => 'Revenue Generated'],
                ],
            ])),
            TemplateContent::section('cards', 'servicecards.voltera', array_merge(self::motion(40), [
                'columns' => 2,
                'items' => [
                    [
                        'title' => 'Digital Strategy Development',
                        'text' => 'Our team collaborates with you to understand your business goals, target audience and market landscape. We then craft a comprehensive digital marketing strategy tailored to your brand.',
                        'bullets' => "Comprehensive market analysis\nTailored strategy aligned with business goals\nRoadmap for sustainable growth",
                        'buttonLabel' => 'Learn More',
                        'url' => '/contact',
                    ],
                    [
                        'title' => 'Social Media Management',
                        'text' => 'Amplify your brand’s voice and connect with your audience on a deeper level. We create engaging content, manage your social presence and run targeted campaigns.',
                        'bullets' => "Increased brand awareness\nHigher engagement rates\nData-driven campaign optimisation",
                        'buttonLabel' => 'Learn More',
                        'url' => '/contact',
                    ],
                    [
                        'title' => 'Content Creation & Marketing',
                        'text' => 'Content is king, and our team excels at creating compelling content that captivates and converts. From blog posts and videos to infographics and social media content.',
                        'bullets' => "High-quality, engaging content\nMulti-channel content distribution\nImproved brand storytelling",
                        'buttonLabel' => 'Learn More',
                        'url' => '/contact',
                    ],
                    [
                        'title' => 'Search Engine Optimisation (SEO)',
                        'text' => 'Improve your website’s visibility and attract more organic traffic with our expert SEO services. We employ the latest techniques and best practices.',
                        'bullets' => "Enhanced search engine rankings\nIncreased organic traffic\nBetter user experience",
                        'buttonLabel' => 'Learn More',
                        'url' => '/contact',
                    ],
                    [
                        'title' => 'Pay-Per-Click Advertising (PPC)',
                        'text' => 'Maximise your return on investment with our data-driven PPC campaigns. We create and manage targeted ads on platforms like Google Ads and social media.',
                        'bullets' => "High ROI on ad spend\nTargeted audience reach\nContinuous performance optimisation",
                        'buttonLabel' => 'Learn More',
                        'url' => '/contact',
                    ],
                    [
                        'title' => 'Email Marketing',
                        'text' => 'Stay top of mind with your customers through personalised and effective email marketing campaigns. We design, execute and analyse every send.',
                        'bullets' => "Personalised email campaigns\nHigh open and click-through rates\nDetailed performance analytics",
                        'buttonLabel' => 'Learn More',
                        'url' => '/contact',
                    ],
                ],
            ])),
            TemplateContent::section('process', 'process.voltera', self::process()),
            TemplateContent::section('quotes', 'testimonials.voltera', self::testimonials()),
            TemplateContent::section('cta', 'ctaband.voltera', array_merge(self::cta(), [
                'secondaryLabel' => 'Case Studies',
                'secondaryUrl' => '/work',
            ])),
        ], self::footer(), 'footer.voltera', 'navbar.voltera');
    }

    /** @return array<string, mixed> */
    private static function about(): array
    {
        return TemplateContent::sitePage('About Us', 'about', false, self::nav(), [
            TemplateContent::section('head', 'pagehero.voltera', array_merge(self::motion(0, 'load'), [
                'eyebrow' => 'Discover Voltera',
                'heading' => 'Your Partner in Marketing Excellence',
                'description' => 'Welcome to Voltera, where innovation meets strategy to drive your brand’s success.',
                'buttonLabel' => 'Get in Touch',
                'buttonUrl' => '/contact',
                'secondaryLabel' => 'Join the Team',
                'secondaryUrl' => '/contact',
                'image' => TemplateContent::photo('1522071820081-009f0129c71c', 1400),
                'stats' => [],
            ])),
            TemplateContent::section('strip', 'statsstrip.voltera', array_merge(self::motion(40), [
                'stats' => [
                    ['value' => '500+', 'label' => 'Satisfied Clients'],
                    ['value' => '1000+', 'label' => 'Successful Projects'],
                    ['value' => '$10M+', 'label' => 'Revenue Generated'],
                ],
            ])),
            TemplateContent::section('mission', 'split.voltera', array_merge(self::motion(40), [
                'eyebrow' => 'Our mission',
                'heading' => 'Empowering Brands with Strategic Excellence',
                'description' => 'We are committed to empowering brands through innovative marketing solutions that drive measurable results.',
                'bullets' => "Leverage the latest technologies and trends to stay ahead of the curve\nDeliver tailored strategies that align with our clients’ goals\nFoster long-term partnerships based on trust and success",
                'buttonLabel' => 'Get in Touch',
                'buttonUrl' => '/contact',
                'image' => TemplateContent::photo('1552664730-d307ca884978', 1000),
                'reverse' => false,
            ])),
            TemplateContent::section('values', 'values.voltera', array_merge(self::motion(40), [
                'eyebrow' => 'Our values',
                'heading' => 'The Pillars of Our Success',
                'description' => 'At Voltera, our core values define who we are and guide everything we do.',
                'columns' => 3,
                'items' => [
                    ['title' => 'Integrity', 'text' => 'We believe in transparency and honesty in all our business and personal interactions.', 'image' => TemplateContent::photo('1521791136064-7986c2920216', 700)],
                    ['title' => 'Innovation', 'text' => 'We are dedicated to pushing the boundaries and welcoming the change.', 'image' => TemplateContent::photo('1507003211169-0a1dd7228f2d', 700)],
                    ['title' => 'Collaboration', 'text' => 'We work as a cohesive team, leveraging each member’s strengths to achieve outstanding results.', 'image' => TemplateContent::photo('1529156069898-49953e39b3ac', 700)],
                ],
            ])),
            TemplateContent::section('team', 'team.voltera', array_merge(self::motion(40), [
                'eyebrow' => 'Our team',
                'heading' => 'The People Behind the Work',
                'description' => 'A senior team that stays on your account from kick-off to reporting.',
                'columns' => 3,
                'items' => [
                    ['name' => 'June Smith', 'role' => 'Chief Executive Officer', 'image' => TemplateContent::photo('1580489944761-15a19d654956', 700), 'url' => '/about'],
                    ['name' => 'John Doe', 'role' => 'Chief Marketing Officer', 'image' => TemplateContent::photo('1519085360753-af0119f7cbe7', 700), 'url' => '/about'],
                    ['name' => 'Sarah Davis', 'role' => 'Senior Marketing Strategist', 'image' => TemplateContent::photo('1573496359142-b8d87734a5a2', 700), 'url' => '/about'],
                ],
            ])),
            TemplateContent::section('quotes', 'testimonials.voltera', self::testimonials()),
            TemplateContent::section('cta', 'ctaband.voltera', self::cta()),
        ], self::footer(), 'footer.voltera', 'navbar.voltera');
    }

    /** @return array<string, mixed> */
    private static function pricing(): array
    {
        return TemplateContent::sitePage('Pricing', 'pricing', false, self::nav(), [
            TemplateContent::section('plans', 'pricing.voltera', array_merge(self::motion(0, 'load'), [
                'eyebrow' => 'Pricing',
                'heading' => 'Transparent Pricing for Exceptional Value',
                'description' => 'Our flexible plans are designed to meet the unique needs of your business, ensuring you get the most out of your marketing investment.',
                'items' => [
                    [
                        'name' => 'Starter Plan',
                        'price' => '$1,000',
                        'period' => '/month',
                        'text' => 'Perfect for small businesses looking to establish a strong online presence.',
                        'features' => "Basic SEO\nSocial Media Management\nContent Creation (4 posts/month)\nMonthly Performance Report",
                        'buttonLabel' => 'Get Started',
                        'url' => '/contact',
                        'featured' => false,
                        'badge' => '',
                    ],
                    [
                        'name' => 'Growth Plan',
                        'price' => '$2,500',
                        'period' => '/month',
                        'text' => 'Ideal for growing businesses aiming to boost engagement and conversions.',
                        'features' => "Basic SEO\nSocial Media Management\nContent Creation (8 posts/month)\nPaid Social Advertising\nBi-Weekly Performance Reports",
                        'buttonLabel' => 'Get Started',
                        'url' => '/contact',
                        'featured' => true,
                        'badge' => 'Popular',
                    ],
                    [
                        'name' => 'Premium Plan',
                        'price' => '$5,000',
                        'period' => '/month',
                        'text' => 'Best for established businesses seeking comprehensive digital strategies.',
                        'features' => "Premium SEO\nSocial Media Management\nContent Creation (12 posts/month)\nPaid Social & PPC Advertising\nEmail Marketing Campaigns\nWeekly Performance Reports",
                        'buttonLabel' => 'Get Started',
                        'url' => '/contact',
                        'featured' => false,
                        'badge' => '',
                    ],
                ],
            ])),
            TemplateContent::section('custom', 'customplan.voltera', array_merge(self::motion(40), [
                'icon' => 'message',
                'heading' => 'Custom Plans',
                'description' => 'Need something more tailored? Contact us for a customised plan that fits your specific requirements and budget.',
                'buttonLabel' => 'Contact Sales',
                'buttonUrl' => '/contact',
            ])),
            TemplateContent::section('why', 'why.voltera', array_merge(self::motion(40), [
                'eyebrow' => 'Why us?',
                'heading' => 'Why Choose Voltera?',
                'items' => [
                    ['title' => 'Transparent Pricing', 'text' => 'No hidden fees or unexpected costs. What you see is what you get.'],
                    ['title' => 'Tailored Solutions', 'text' => 'Each plan is designed to meet the specific needs of your business, ensuring you get the most value from your investment.'],
                    ['title' => 'Expert Team', 'text' => 'Work with a team of experienced professionals dedicated to your success.'],
                    ['title' => 'Proven Results', 'text' => 'Our strategies are backed by data and proven to drive real results.'],
                ],
                'buttonLabel' => 'Get in Touch',
                'buttonUrl' => '/contact',
                'image' => TemplateContent::photo('1529156069898-49953e39b3ac', 1000),
                'reverse' => false,
            ])),
            TemplateContent::section('faq', 'faq.voltera', array_merge(self::motion(40), [
                'eyebrow' => 'FAQs',
                'heading' => 'Frequently Asked Questions',
                'description' => 'We’ve compiled a list of the most frequently asked questions to help you get the information you need and doubts cleared.',
                'items' => [
                    ['question' => 'What services does Voltera offer?', 'answer' => 'Strategy, social, content, SEO, paid media and email — either as a full programme or as the one piece you are missing.'],
                    ['question' => 'How does Voltera develop a digital marketing strategy?', 'answer' => 'We start with your goals and your numbers, audit what is already working, then build a roadmap you can actually staff.'],
                    ['question' => 'What industries does Voltera specialise in?', 'answer' => 'We work best with consumer brands, e-commerce and B2B services, but the method travels further than the sector list suggests.'],
                    ['question' => 'How does Voltera measure the success of its campaigns?', 'answer' => 'Against the metric you agreed at kick-off. Reports show the number, the movement and what we are changing next.'],
                    ['question' => 'Can Voltera help with both organic and paid marketing efforts?', 'answer' => 'Yes, and we prefer to run them together — paid buys the data that makes organic faster.'],
                ],
                'footerTitle' => 'Still have questions?',
                'footerText' => 'Can’t find the answer you’re looking for? Please chat to our friendly team.',
                'buttonLabel' => 'Get in Touch',
                'buttonUrl' => '/contact',
            ])),
        ], self::footer(), 'footer.voltera', 'navbar.voltera');
    }

    /** @return array<string, mixed> */
    private static function work(): array
    {
        return TemplateContent::sitePage('Case Studies', 'work', false, self::nav(), [
            TemplateContent::section('head', 'pagehero.voltera', array_merge(self::motion(0, 'load'), [
                'eyebrow' => 'Voltera case studies',
                'heading' => 'Transformative Case Studies of Marketing Excellence',
                'description' => 'Each case study highlights the challenges faced, our innovative solutions, and the remarkable results achieved.',
                'buttonLabel' => '',
                'buttonUrl' => '',
                'secondaryLabel' => '',
                'secondaryUrl' => '',
                'image' => '',
                'stats' => [],
            ])),
            TemplateContent::section('featured', 'featuredcase.voltera', array_merge(self::motion(40), [
                'tag' => 'Social media management',
                'title' => 'Revamping Kataka’s Social Media Presence',
                'text' => 'Kataka Corporation, a leading consumer electronics brand, approached Voltera to enhance their social media presence and turn a quiet feed into a channel that sells.',
                'panelColor' => '#fde7ec',
                'logo' => '',
                'logoText' => 'KATAKA',
                'metrics' => [
                    ['value' => '150%', 'label' => 'Increased Engagement Rate'],
                    ['value' => '80%', 'label' => 'Follower Growth Across Platforms'],
                    ['value' => '45%', 'label' => 'Website Traffic Increased'],
                    ['value' => '35%', 'label' => 'Increase in Sales Conversion'],
                ],
                'buttonLabel' => 'Read More',
                'buttonUrl' => '/work',
            ])),
            TemplateContent::section('grid', 'casestudies.voltera', array_merge(self::motion(40), [
                'eyebrow' => '',
                'heading' => '',
                'description' => '',
                'buttonLabel' => '',
                'buttonUrl' => '',
                'secondaryLabel' => '',
                'secondaryUrl' => '',
                'items' => self::caseCards(),
                'columns' => 2,
            ])),
            TemplateContent::section('cta', 'ctaband.voltera', self::cta()),
        ], self::footer(), 'footer.voltera', 'navbar.voltera');
    }

    /** @return array<string, mixed> */
    private static function blog(): array
    {
        return TemplateContent::sitePage('Blog', 'blog', false, self::nav(), [
            TemplateContent::section('head', 'pagehero.voltera', array_merge(self::motion(0, 'load'), [
                'eyebrow' => 'Voltera blog',
                'heading' => 'Content Marketing Blogs',
                'description' => 'Dive into our latest articles to stay ahead of the curve with expert advice, industry trends, and actionable strategies designed to elevate your marketing game.',
                'buttonLabel' => 'Get in Touch',
                'buttonUrl' => '/contact',
                'secondaryLabel' => 'See all Articles',
                'secondaryUrl' => '/blog',
                'image' => '',
                'stats' => [],
            ])),
            TemplateContent::section('list', 'posts.voltera', array_merge(self::motion(40), [
                'eyebrow' => '',
                'heading' => 'Latest Articles',
                'description' => '',
                'buttonLabel' => '',
                'buttonUrl' => '',
                'secondaryLabel' => '',
                'secondaryUrl' => '',
                'filters' => [
                    ['label' => 'All', 'url' => '/blog', 'active' => false],
                    ['label' => 'SEO', 'url' => '/blog', 'active' => false],
                    ['label' => 'Digital Marketing', 'url' => '/blog', 'active' => false],
                    ['label' => 'Social Media', 'url' => '/blog', 'active' => false],
                    ['label' => 'Content Marketing', 'url' => '/blog', 'active' => true],
                ],
                'items' => self::articles(),
                'columns' => 3,
            ])),
            TemplateContent::section('cta', 'ctaband.voltera', self::cta()),
        ], self::footer(), 'footer.voltera', 'navbar.voltera');
    }

    /** @return array<string, mixed> */
    private static function article(): array
    {
        return TemplateContent::sitePage('Article', 'article', false, self::nav(), [
            TemplateContent::section('head', 'pagehero.voltera', array_merge(self::motion(0, 'load'), [
                'eyebrow' => 'Content marketing',
                'heading' => 'How to Create Original Compelling Content That Converts',
                'description' => 'Discover the secrets to crafting original content that converts your audience into loyal customers and supporters.',
                'buttonLabel' => '',
                'buttonUrl' => '',
                'secondaryLabel' => '',
                'secondaryUrl' => '',
                'image' => TemplateContent::photo('1552664730-d307ca884978', 1400),
                'stats' => [],
            ])),
            TemplateContent::section('body', 'richtext.voltera', array_merge(self::motion(40), [
                'contentWidth' => 'narrow',
                'body' => '<p>Personalisation is a key benefit of data analytics in marketing. By understanding the unique preferences and behaviours of different consumer segments, marketers can create highly targeted and personalised campaigns that land rather than interrupt.</p>'
                    .'<h2>Optimising Campaign Performance</h2>'
                    .'<p>Data analytics empowers marketers to make informed, real-time decisions. With insights from data analysis they pivot strategies, allocate resources effectively, and optimise campaigns for maximum return, efficiently achieving business objectives in an ever-evolving digital landscape.</p>'
                    .'<h3>Predictive Analytics</h3>'
                    .'<p>Predictive analytics stands as a potent tool in marketing, leveraging historical data and patterns to forecast future trends and behaviours. This capability enables marketers to anticipate customer needs before they manifest.</p>'
                    .'<blockquote>Staying ahead of the curve is not a slogan. It is a reporting cadence, an argument with your own assumptions, and the willingness to kill a campaign that is only working slightly.</blockquote>'
                    .'<p>Armed with predictive insights, marketers can refine their targeting, messaging and offerings to align with evolving consumer expectations. Ultimately this maximises return and maintains a strategic edge.</p>',
            ])),
            TemplateContent::section('more', 'posts.voltera', array_merge(self::motion(40), [
                'eyebrow' => '',
                'heading' => 'Keep reading',
                'description' => '',
                'buttonLabel' => '',
                'buttonUrl' => '',
                'secondaryLabel' => 'View all Blogs',
                'secondaryUrl' => '/blog',
                'filters' => [],
                'items' => self::articles(),
                'columns' => 3,
            ])),
            TemplateContent::section('cta', 'ctaband.voltera', self::cta()),
        ], self::footer(), 'footer.voltera', 'navbar.voltera');
    }

    /** @return array<string, mixed> */
    private static function contact(): array
    {
        return TemplateContent::sitePage('Contact Us', 'contact', false, self::nav(), [
            TemplateContent::section('form', 'contact.voltera', array_merge(self::motion(0, 'load'), [
                'eyebrow' => 'Contact us',
                'heading' => 'Let’s Connect and Ignite Your Success',
                'description' => 'We’re excited to hear from you! Reach out to us and let’s take your business to the next level with Voltera.',
                'emailLabel' => 'Email',
                'email' => 'info@voltera.com',
                'phoneLabel' => 'Phone',
                'phone' => '+1 (123) 456-7891',
                'socialLabel' => 'Follow us!',
                'social' => [
                    ['icon' => 'linkedin', 'url' => '#'],
                    ['icon' => 'twitter', 'url' => '#'],
                    ['icon' => 'facebook', 'url' => '#'],
                    ['icon' => 'instagram', 'url' => '#'],
                ],
                'services' => "Digital strategy\nSocial media\nContent marketing\nSearch engine optimisation\nPaid media\nEmail marketing",
                'formId' => '',
                'buttonLabel' => 'Submit',
            ])),
            TemplateContent::section('map', 'map.voltera', array_merge(self::motion(40), [
                'eyebrow' => 'Our global presence',
                'heading' => 'Voltera Offices Around the World',
                'description' => 'To better serve our clients, Voltera has established a strong global presence with offices in key locations around the world.',
                'pins' => [
                    ['label' => 'Vancouver', 'x' => 17, 'y' => 30],
                    ['label' => 'Austin', 'x' => 21, 'y' => 40],
                    ['label' => 'London', 'x' => 44, 'y' => 26],
                    ['label' => 'Warsaw', 'x' => 52, 'y' => 28],
                    ['label' => 'Dubai', 'x' => 60, 'y' => 45],
                    ['label' => 'Singapore', 'x' => 72, 'y' => 58],
                    ['label' => 'Sydney', 'x' => 84, 'y' => 70],
                ],
            ])),
        ], self::footer(), 'footer.voltera', 'navbar.voltera');
    }
}
