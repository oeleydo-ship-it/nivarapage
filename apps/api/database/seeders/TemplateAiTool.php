<?php

namespace Database\Seeders;

class TemplateAiTool
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#8b5cf6',
            'secondary' => '#0b0618',
            'accent' => '#c084fc',
            'background' => '#050014',
            'surface' => '#0e0824',
            'text' => '#ffffff',
            'muted' => '#9ca3c7',
            'headingFont' => 'Inter, system-ui, sans-serif',
            'bodyFont' => 'Inter, system-ui, sans-serif',
            'headingWeight' => 700,
            'bodyWeight' => 400,
            'buttonRadius' => '12px',
            'cardRadius' => '16px',
            'containerWidth' => '1180px',
            'sectionSpacing' => '96px',
            'surfacePattern' => 'lines',
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $brand = 'AI Tool';
        $blurb = 'Build SaaS AI applications using OpenAI and Next.js, this kit comes with pre-configured and pre-built examples, making it easier to quickly kickstart your AI startup.';
        $nav = TemplateContent::nav($brand, [
            ['label' => 'Home', 'url' => '/'],
            ['label' => 'About', 'url' => '/about'],
            ['label' => 'Pricing', 'url' => '/pricing'],
            ['label' => 'Blog', 'url' => '/blog'],
            ['label' => 'Contact', 'url' => '/contact'],
        ], [
            'logoIcon' => 'sparkles',
            'showMark' => true,
            'textAlign' => 'center',
            'showButton' => true,
            'buttonLabel' => 'Sign up',
            'buttonUrl' => '/pricing',
            'buttonVariant' => 'primary',
            'showSecondary' => true,
            'secondaryLabel' => 'Sign In',
            'secondaryUrl' => '/contact',
            'sticky' => true,
            'shadow' => false,
            'showBorder' => false,
            'tone' => 'default',
        ]);
        $footer = TemplateContent::footer($brand, [
            'tagline' => $blurb,
            'copyright' => '© AI Tool, LLC. All rights reserved.',
            'columns' => [
                ['title' => 'Products', 'links' => "Features|/\nIntegrations|/\nPricing|/pricing\nChanges log|/blog\nRoadmap|/about"],
                ['title' => 'Company', 'links' => "Privacy Policy|/about\nRefund Policy|/about\nSupport|/contact\nCommunity|/blog"],
                ['title' => 'Support', 'links' => "Features|/\nIntegrations|/\nPricing|/pricing\nChanges log|/blog\nRoadmap|/about"],
            ],
            'social' => [
                ['icon' => 'facebook', 'url' => '#'],
                ['icon' => 'twitter', 'url' => '#'],
                ['icon' => 'github', 'url' => '#'],
            ],
            'legal' => [],
            'showNewsletter' => false,
            'columnCount' => 3,
            'tone' => 'default',
        ]);
        $newsletter = TemplateContent::section('news', 'form.newsletter', [
            'eyebrow' => '',
            'heading' => 'News & Update',
            'description' => 'Keep up to date with everything about our tool',
            'buttonLabel' => 'Subscribe',
            'layout' => 'split',
            'tone' => 'default',
            'paddingTop' => 40,
            'paddingBottom' => 8,
            'successNote' => '',
        ]);

        $heroDash = TemplateContent::photo('1551288049-bebda4e38f71', 1600);
        $office = TemplateContent::photo('1522202176988-66273c2fd55f', 1400);
        $abstract = TemplateContent::photo('1639322537228-f710d846310a', 1200);
        $blog1 = TemplateContent::photo('1498050108023-c5249f4df085', 1200);
        $blog2 = TemplateContent::photo('1558655146-d09347e92766', 1200);

        $team = [
            ['name' => 'Coriss Ambady', 'role' => 'Founder & CEO', 'image' => TemplateContent::photo('1560250097-0b93528c311a', 600)],
            ['name' => 'Marc Herrera', 'role' => 'Head of Product', 'image' => TemplateContent::photo('1500648767791-00dcc994a43e', 600)],
            ['name' => 'Hannah Ruiz', 'role' => 'Design Lead', 'image' => TemplateContent::photo('1494790108377-be9c29b29330', 600)],
            ['name' => 'Alfred Montgomery', 'role' => 'Engineering', 'image' => TemplateContent::photo('1472099645785-5658abf4ff4e', 600)],
            ['name' => 'Jay Alexander', 'role' => 'AI Research', 'image' => TemplateContent::photo('1507003211169-0a1dd7228f2d', 600)],
            ['name' => 'Polly Webster', 'role' => 'Customer Success', 'image' => TemplateContent::photo('1544005313-94ddf0286df2', 600)],
            ['name' => 'David Hudson', 'role' => 'Growth', 'image' => TemplateContent::photo('1519085360753-af0119f7cbe7', 600)],
            ['name' => 'Celia Day', 'role' => 'Content', 'image' => TemplateContent::photo('1573496359142-b8d87734a5a2', 600)],
        ];
        foreach ($team as &$member) {
            $member['twitter'] = '#';
            $member['linkedin'] = '#';
            $member['instagram'] = '#';
            $member['bio'] = '';
        }
        unset($member);

        $plans = self::plans();
        $features = self::homeFeatures();
        $aboutFeatures = self::aboutFeatures();
        $quotes = self::quotes();
        $faqs = self::faqs();
        $posts = [
            [
                'title' => 'Exploring MERN Stack: Powering Modern Web Development',
                'excerpt' => 'In the world of web development, staying ahead of the curve is crucial. One technology stack that has defined modern SaaS is MERN.',
                'date' => 'Jun 18 2023',
                'tag' => 'Jhon Doee',
                'image' => $blog1,
                'url' => '/blog',
            ],
            [
                'title' => 'Best UI components for modern website',
                'excerpt' => 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
                'date' => 'Jun 25 2023',
                'tag' => 'Amrin',
                'image' => $blog2,
                'url' => '/blog',
            ],
            [
                'title' => 'The Power of UI/UX: Elevating Digital Experiences',
                'excerpt' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sit amet dictum neque, laoreet dolor.',
                'date' => 'Jun 18 2023',
                'tag' => 'Jhon Doee',
                'image' => TemplateContent::photo('1460926888513-46e576a3be50', 1200),
                'url' => '/blog',
            ],
        ];
        $logos = [
            ['label' => 'UI Deck'],
            ['label' => 'Next.js'],
            ['label' => 'OpenAI'],
            ['label' => 'Vercel'],
            ['label' => 'Sanity'],
            ['label' => 'Stripe'],
        ];

        return [
            TemplateContent::sitePage('Home', 'home', true, $nav, [
                TemplateContent::section('hero', 'hero.saas', [
                    'eyebrow' => 'Launch Your AI Startup with',
                    'heading' => 'OpenAI + Next.js SaaS Boilerplate and Starter Kit',
                    'description' => 'Ideal for developers looking to build SaaS applications using OpenAI and Next.js, this starter kit comes with pre-configured and pre-built examples, making it easier to quickly kickstart your AI startup.',
                    'buttonLabel' => 'Try AI Examples',
                    'buttonUrl' => '/pricing',
                    'secondaryLabel' => '',
                    'features' => [],
                    'logos' => [],
                    'logosTitle' => '',
                    'image' => $heroDash,
                    'imageAlt' => 'AI Tool dashboard',
                    'headingSize' => 52,
                    'textAlign' => 'center',
                    'animation' => 'fade-up',
                    'paddingTop' => 72,
                    'paddingBottom' => 48,
                ]),
                TemplateContent::section('features', 'features.cards', [
                    'eyebrow' => 'Main Features',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'Key Features of AI Tool',
                    'description' => 'A Complete Solution for AI SaaS Startups',
                    'textAlign' => 'center',
                    'columns' => 3,
                    'cardStyle' => 'solid',
                    'iconStyle' => 'tint',
                    'roundIcons' => true,
                    'items' => $features,
                ]),
                TemplateContent::section('openai', 'features.showcase', [
                    'eyebrow' => 'Kickstart your AI Startup',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'Seamless OpenAI Integration',
                    'description' => $blurb,
                    'bullets' => '',
                    'buttonLabel' => 'Learn more',
                    'buttonUrl' => '/about',
                    'image' => $abstract,
                    'imageAlt' => 'OpenAI integration graphic',
                    'imageRatio' => 'square',
                    'stat' => '',
                    'headingSize' => 36,
                ]),
                TemplateContent::section('pages', 'content.two_columns', [
                    'eyebrow' => '',
                    'heading' => '',
                    'showIcons' => true,
                    'asCards' => true,
                    'columnCount' => 2,
                    'columns' => [
                        [
                            'title' => 'All Essential SaaS Pages',
                            'text' => 'Build SaaS AI applications using OpenAI and Next.js, this kit comes with pre-configured and pre-built examples, making it easier to quickly kickstart.',
                            'icon' => 'layers',
                        ],
                        [
                            'title' => 'Highly Customizable',
                            'text' => 'Build SaaS AI applications using OpenAI and Next.js, quickly kickstart your AI startup.',
                            'icon' => 'palette',
                        ],
                    ],
                ]),
                TemplateContent::section('pricing', 'pricing.three_columns', self::pricingProps($blurb, $plans)),
                TemplateContent::section('love', 'testimonials.cards', [
                    'eyebrow' => 'Wall of love',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'What Our User Says',
                    'description' => $blurb,
                    'textAlign' => 'center',
                    'columns' => 3,
                    'showRating' => false,
                    'tone' => 'default',
                    'items' => $quotes,
                ]),
                TemplateContent::section('clients', 'gallery.logos', [
                    'heading' => '',
                    'logos' => $logos,
                    'grayscale' => true,
                    'paddingTop' => 32,
                    'paddingBottom' => 32,
                ]),
                TemplateContent::section('contact', 'form.contact', [
                    'eyebrow' => 'Need Any Help?',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'Contact With Us',
                    'description' => $blurb,
                    'buttonLabel' => 'Send Message',
                    'layout' => 'centered',
                    'cardStyle' => true,
                    'tone' => 'default',
                    'details' => [],
                    'bullets' => '',
                    'successNote' => '',
                ]),
                TemplateContent::section('blogs', 'posts.cards', [
                    'eyebrow' => 'Read Our Latest Blogs',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'Latest Blogs & News',
                    'description' => $blurb,
                    'textAlign' => 'center',
                    'buttonLabel' => '',
                    'items' => $posts,
                ]),
                TemplateContent::section('cta', 'cta.simple', [
                    'eyebrow' => 'Try our tool for Free',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'What are you waiting for?',
                    'description' => $blurb,
                    'buttonLabel' => 'Get Started for Free',
                    'buttonUrl' => '/pricing',
                    'secondaryLabel' => '',
                    'boxed' => true,
                    'textAlign' => 'center',
                    'tone' => 'default',
                    'backgroundType' => 'gradient',
                    'gradientFrom' => '#1a0b2e',
                    'gradientTo' => '#050014',
                    'gradientAngle' => 180,
                    'lightText' => true,
                ]),
                $newsletter,
            ], $footer),
            TemplateContent::sitePage('About', 'about', false, $nav, [
                TemplateContent::section('title', 'hero.page', [
                    'heading' => 'About Page',
                    'breadcrumb' => 'Home / About Page',
                    'headingSize' => 48,
                    'paddingTop' => 64,
                    'paddingBottom' => 40,
                ]),
                TemplateContent::section('intro', 'content.image_text', [
                    'eyebrow' => 'Since the Day',
                    'heading' => '10,000+ Writers, Marketers, & Business owners Love AI Tool.',
                    'body' => $blurb,
                    'bullets' => '',
                    'buttonLabel' => 'Read More About',
                    'buttonUrl' => '/pricing',
                    'image' => $heroDash,
                    'imageAlt' => 'AI Tool product',
                    'imageRatio' => 'wide',
                    'splitRatio' => 'copy',
                    'headingSize' => 36,
                ]),
                TemplateContent::section('keys', 'features.cards', [
                    'eyebrow' => 'Key Features',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'Key Features of AI Tool',
                    'description' => $blurb,
                    'textAlign' => 'center',
                    'columns' => 3,
                    'cardStyle' => 'flat',
                    'iconStyle' => 'tint',
                    'roundIcons' => true,
                    'items' => $aboutFeatures,
                ]),
                TemplateContent::section('watch', 'content.video', [
                    'eyebrow' => '',
                    'heading' => '',
                    'description' => '',
                    'bullets' => '',
                    'buttonLabel' => '',
                    'layout' => 'featured',
                    'poster' => $office,
                    'paddingTop' => 24,
                    'paddingBottom' => 24,
                ]),
                TemplateContent::section('team', 'team.cards', [
                    'eyebrow' => 'Our Team',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'Our Dynamic Team',
                    'description' => $blurb,
                    'textAlign' => 'center',
                    'columns' => 4,
                    'showBio' => false,
                    'showCards' => false,
                    'photoShape' => 'round',
                    'items' => $team,
                ]),
                TemplateContent::section('love', 'testimonials.cards', [
                    'eyebrow' => 'What User Say',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'What Our User Says',
                    'description' => $blurb,
                    'textAlign' => 'center',
                    'columns' => 3,
                    'showRating' => false,
                    'tone' => 'default',
                    'items' => array_slice($quotes, 0, 6),
                    'buttonLabel' => 'Load More',
                    'buttonUrl' => '/about',
                ]),
                TemplateContent::section('clients', 'gallery.logos', [
                    'heading' => '',
                    'logos' => $logos,
                    'grayscale' => true,
                ]),
                TemplateContent::section('cta', 'cta.simple', [
                    'eyebrow' => '',
                    'heading' => 'What are you waiting for?',
                    'description' => '',
                    'buttonLabel' => 'Get started for free',
                    'buttonUrl' => '/pricing',
                    'secondaryLabel' => '',
                    'boxed' => true,
                    'textAlign' => 'center',
                    'tone' => 'default',
                    'backgroundType' => 'gradient',
                    'gradientFrom' => '#1a0b2e',
                    'gradientTo' => '#050014',
                    'gradientAngle' => 180,
                    'lightText' => true,
                ]),
                $newsletter,
            ], $footer),
            TemplateContent::sitePage('Pricing', 'pricing', false, $nav, [
                TemplateContent::section('title', 'hero.page', [
                    'heading' => 'Pricing Page',
                    'breadcrumb' => 'Home / Pricing Page',
                    'headingSize' => 48,
                    'paddingTop' => 64,
                    'paddingBottom' => 40,
                ]),
                TemplateContent::section('pricing', 'pricing.three_columns', self::pricingProps($blurb, $plans)),
                TemplateContent::section('faq', 'faq.accordion', [
                    'eyebrow' => 'Questions About our AI Tool?',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'Frequently Asked Questions',
                    'description' => $blurb,
                    'textAlign' => 'center',
                    'openFirst' => false,
                    'singleOpen' => true,
                    'items' => $faqs,
                ]),
                $newsletter,
            ], $footer),
            TemplateContent::sitePage('Blog', 'blog', false, $nav, [
                TemplateContent::section('title', 'hero.page', [
                    'heading' => 'Blog Grid',
                    'breadcrumb' => 'Home / Blog',
                    'headingSize' => 48,
                    'paddingTop' => 64,
                    'paddingBottom' => 40,
                ]),
                TemplateContent::section('posts', 'posts.cards', [
                    'eyebrow' => 'Read Our Latest Blogs',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'Latest Blogs & News',
                    'description' => $blurb,
                    'textAlign' => 'center',
                    'buttonLabel' => '',
                    'useSitePosts' => true,
                    'items' => $posts,
                ]),
                $newsletter,
            ], $footer),
            TemplateContent::sitePage('Contact', 'contact', false, $nav, [
                TemplateContent::section('title', 'hero.page', [
                    'heading' => 'Contact us',
                    'breadcrumb' => 'Home / Contact',
                    'headingSize' => 48,
                    'paddingTop' => 64,
                    'paddingBottom' => 40,
                ]),
                TemplateContent::section('contact', 'form.contact', [
                    'eyebrow' => 'Need Any Help?',
                    'eyebrowStyle' => 'pill',
                    'heading' => 'Contact With Us',
                    'description' => $blurb,
                    'buttonLabel' => 'Send Message',
                    'layout' => 'centered',
                    'cardStyle' => true,
                    'tone' => 'default',
                    'details' => [],
                    'bullets' => '',
                    'successNote' => '',
                ]),
                $newsletter,
            ], $footer),
        ];
    }

    /**
     * @param  list<array<string, mixed>>  $plans
     * @return array<string, mixed>
     */
    private static function pricingProps(string $blurb, array $plans): array
    {
        return [
            'eyebrow' => 'Get access',
            'eyebrowStyle' => 'pill',
            'heading' => 'Our Pricing Plan',
            'description' => $blurb,
            'textAlign' => 'center',
            'tone' => 'default',
            'showBillingToggle' => false,
            'cardGlow' => true,
            'plans' => $plans,
        ];
    }

    /** @return list<array<string, mixed>> */
    private static function plans(): array
    {
        $features = "Subscription with levels\nAdvanced features included\nShared workspaces & tools\nPremium versions functionality\nCustomizing the outputs\nPriority customer support";

        return [
            [
                'name' => 'Starter',
                'description' => '',
                'price' => '$ 100',
                'period' => '/month (billed annually)',
                'features' => $features,
                'buttonLabel' => 'Get the plan',
                'buttonUrl' => '/contact',
                'icon' => 'zap',
                'note' => 'No extra hidden charge.',
            ],
            [
                'name' => 'Medium',
                'description' => '',
                'price' => '$ 200',
                'period' => '/month (billed annually)',
                'features' => $features,
                'buttonLabel' => 'Get the plan',
                'buttonUrl' => '/contact',
                'icon' => 'sparkles',
                'note' => 'No extra hidden charge.',
                'highlighted' => true,
            ],
            [
                'name' => 'Business',
                'description' => '',
                'price' => '$ 300',
                'period' => '/month (billed annually)',
                'features' => $features,
                'buttonLabel' => 'Get the plan',
                'buttonUrl' => '/contact',
                'icon' => 'briefcase',
                'note' => 'No extra hidden charge.',
            ],
        ];
    }

    /** @return list<array<string, mixed>> */
    private static function homeFeatures(): array
    {
        return [
            ['title' => 'OpenAI Integration', 'text' => 'Our AI writing tool analyzes your content, suggests improvements', 'icon' => 'sparkles'],
            ['title' => 'Next.js 13, React 18, TS', 'text' => 'Say goodbye to embarrassing typos and grammar mistakes', 'icon' => 'code'],
            ['title' => 'Auth, DB, Sanity Blog', 'text' => 'Originality is key, and our AI writing tool helps you maintain it', 'icon' => 'shield'],
            ['title' => 'Cutting-edge Technologies', 'text' => 'Transform your spoken words into written text easily & effortlessly', 'icon' => 'cpu'],
            ['title' => 'Pre-made AI Examples', 'text' => 'Whether you need a professional, or positive tone it has everyone', 'icon' => 'layers'],
            ['title' => 'Rich Documentation', 'text' => 'Need inspiration or assistance with generating content?', 'icon' => 'book'],
        ];
    }

    /** @return list<array<string, mixed>> */
    private static function aboutFeatures(): array
    {
        return [
            ['title' => 'Open AI-Integration', 'text' => 'Connect GPT models and ship writing, naming, and spreadsheet tools without starting from a blank API client.', 'icon' => 'sparkles'],
            ['title' => 'Seed-to-Design AI', 'text' => 'Start from a prompt, iterate in the canvas, and keep every block editable after generate.', 'icon' => 'palette'],
            ['title' => 'Ready SaaS Pages', 'text' => 'Pricing, about, blog, auth, and docs layouts ship with the kit so you launch a complete product story.', 'icon' => 'layers'],
            ['title' => 'Auth & Database', 'text' => 'Accounts, workspaces, and a blog stack are already wired so you can focus on the AI surface.', 'icon' => 'shield'],
            ['title' => 'Pre-built Examples', 'text' => 'Content writing, name generators, and interview questions demonstrate the patterns you will reuse.', 'icon' => 'zap'],
            ['title' => 'Developer Docs', 'text' => 'Clear setup notes for OpenAI keys, Next.js routes, and how to restyle every section.', 'icon' => 'book'],
        ];
    }

    /** @return list<array<string, mixed>> */
    private static function quotes(): array
    {
        $line = 'AI Tool helped us ship a writing product in weeks. The blocks stay editable, the theme is consistent, and customers notice the polish.';

        return [
            ['text' => $line, 'name' => 'Marc Herrera', 'role' => '@Shane', 'rating' => 5],
            ['text' => $line, 'name' => 'Alfred Montgomery', 'role' => '@Olivia', 'rating' => 5],
            ['text' => $line, 'name' => 'Marvin Williamson', 'role' => '@Jeanette', 'rating' => 5],
            ['text' => $line, 'name' => 'David Hudson', 'role' => '@Hilda', 'rating' => 5],
            ['text' => $line, 'name' => 'Hannah Ruiz', 'role' => '@Mitchell', 'rating' => 5],
            ['text' => $line, 'name' => 'Jay Alexander', 'role' => '@Chris', 'rating' => 5],
        ];
    }

    /** @return list<array<string, mixed>> */
    private static function faqs(): array
    {
        return [
            [
                'question' => 'What is AI Tool Content Writing Tool?',
                'answer' => 'AI Tool is an OpenAI + Next.js starter kit with ready SaaS pages, example generators, and editable sections so you can launch an AI writing product without building the chrome from scratch.',
            ],
            [
                'question' => 'Is there a limit on how much content I can generate?',
                'answer' => 'Usage follows your OpenAI plan. The kit itself does not cap drafts — you set rate limits and model choices in your own API configuration.',
            ],
            [
                'question' => 'Can I edit every block after I apply the template?',
                'answer' => 'Yes. Headlines, prices, FAQs, team photos, forms, and theme colors are all editable in the builder. Swap a section or restyle it without touching code.',
            ],
            [
                'question' => 'Does the kit include authentication and a blog?',
                'answer' => 'The original Next.js kit ships Auth, a database, and a Sanity blog. This template recreates those product pages so you can tell that story while you connect your own stack.',
            ],
            [
                'question' => 'Are there extra hidden charges?',
                'answer' => 'No extra hidden charge on the published plans. You only pay your chosen Starter, Medium, or Business tier plus whatever your own OpenAI usage costs.',
            ],
        ];
    }
}
