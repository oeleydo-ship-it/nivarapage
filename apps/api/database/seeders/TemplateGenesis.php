<?php

namespace Database\Seeders;

class TemplateGenesis
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#F26A06',
            'secondary' => '#2E08CF',
            'accent' => '#D10A8A',
            'background' => '#000000',
            'surface' => '#141414',
            'text' => '#ffffff',
            'muted' => '#a1a1aa',
            'headingFont' => 'Poppins, system-ui, sans-serif',
            'bodyFont' => 'Poppins, system-ui, sans-serif',
            'headingWeight' => 600,
            'bodyWeight' => 400,
            'buttonRadius' => '999px',
            'cardRadius' => '16px',
            'containerWidth' => '1120px',
            'sectionSpacing' => '96px',
        ];
    }

    /** @return array<string, mixed> */
    private static function motion(int $delay = 0): array
    {
        return [
            'animation' => 'fade-up',
            'animationTrigger' => 'scroll',
            'animationDuration' => 700,
            'animationDelay' => $delay,
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $brand = 'Aether';
        $nav = TemplateContent::nav($brand, [
            ['label' => 'Home', 'url' => '/'],
            ['label' => 'Agents', 'url' => '/agents'],
            ['label' => 'How it works', 'url' => '/how-it-works'],
            ['label' => 'Pricing', 'url' => '/pricing'],
            ['label' => 'News', 'url' => '/contact'],
        ], [
            'logoIcon' => 'sparkles',
            'showMark' => true,
            'showBorder' => false,
            'sticky' => true,
            'shadow' => false,
            'showButton' => true,
            'buttonLabel' => 'Sign Up',
            'buttonUrl' => '/pricing',
            'buttonVariant' => 'outline',
            'showSecondary' => false,
            'tone' => 'default',
        ]);

        $footer = TemplateContent::footer($brand, [
            'tagline' => 'Build, deploy, and talk to AI agents in seconds.',
            'columns' => [
                ['title' => 'Product', 'links' => "Agents|/agents\nHow it works|/how-it-works\nPricing|/pricing"],
                ['title' => 'Company', 'links' => "News|/contact\nContact|/contact\nSupport|/contact"],
                ['title' => 'Legal', 'links' => "Terms|#\nPrivacy|#\nSecurity|#"],
            ],
            'legal' => [
                ['label' => 'Terms', 'url' => '#'],
                ['label' => 'Privacy', 'url' => '#'],
            ],
            'social' => [
                ['icon' => 'twitter', 'url' => '#'],
                ['icon' => 'github', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
            ],
            'showNewsletter' => false,
            'tone' => 'default',
            'columnCount' => 3,
        ]);

        $step1 = TemplateContent::photo('1517430816045-df4b7de11d1d');
        $step2 = TemplateContent::photo('1551434678-e076c223a692');
        $step3 = TemplateContent::photo('1522071820081-009f0129c71c');
        $richard = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80';
        $sophia = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
        $ethan = 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80';
        $isabella = 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80';
        $liam = TemplateContent::photo('1500648767791-00dcc994a43e', 400);
        $ava = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80';

        $features = [
            ['icon' => 'cpu', 'title' => 'Autonomous Agents', 'text' => 'Agents that plan, execute & think step-by-step.', 'accent' => '#D10A8A'],
            ['icon' => 'clock', 'title' => 'Memory & Learning', 'text' => 'Agents retain memory and improve over time.', 'accent' => '#2E08CF'],
            ['icon' => 'rocket', 'title' => 'Real-time Execution', 'text' => 'Fast responses with async task processing.', 'accent' => '#F26A06'],
        ];

        $workflow = [
            [
                'number' => '01',
                'title' => 'Start with a prompt',
                'text' => 'Start with a simple prompt describing what you want your agent to do. Our builder interprets your idea and creates the structure for you in seconds.',
                'image' => $step1,
            ],
            [
                'number' => '02',
                'title' => 'Adjust and personalize',
                'text' => 'Adjust tasks, actions and integrations. Add personality, rules and data sources to make the agent work exactly the way you want.',
                'image' => $step2,
            ],
            [
                'number' => '03',
                'title' => 'Launch & Automate',
                'text' => 'Deploy your agent and let it run. It executes tasks autonomously, reports results, and continues working in the background.',
                'image' => $step3,
            ],
        ];

        $quotes = [
            ['text' => 'Super clean to edit. We launched an agent landing page without rewriting the layout.', 'name' => 'Richard Nelson', 'role' => 'Founder & CEO', 'avatar' => $richard, 'rating' => 5, 'accent' => '#D10A8A'],
            ['text' => 'The glow, Poppins, and rail colors match the product. Investors noticed the site first.', 'name' => 'Sophia Martinez', 'role' => 'Founder & CEO', 'avatar' => $sophia, 'rating' => 5, 'accent' => '#2E08CF'],
            ['text' => 'Prompt to deploy in an afternoon. Memory and handoff just worked.', 'name' => 'Ethan Roberts', 'role' => 'Founder & CEO', 'avatar' => $ethan, 'rating' => 5, 'accent' => '#F26A06'],
            ['text' => 'Cards, pricing, and FAQ stay on-brand when we duplicate inner pages.', 'name' => 'Isabella Kim', 'role' => 'Founder & CEO', 'avatar' => $isabella, 'rating' => 5, 'accent' => '#D10A8A'],
            ['text' => 'Real-time execution is why we switched. The agent keeps working after the chat closes.', 'name' => 'Liam Johnson', 'role' => 'Founder & CEO', 'avatar' => $liam, 'rating' => 5, 'accent' => '#2E08CF'],
            ['text' => 'The left accent rails make every block feel like the same kit. Easy to extend.', 'name' => 'Ava Patel', 'role' => 'Founder & CEO', 'avatar' => $ava, 'rating' => 5, 'accent' => '#F26A06'],
        ];

        $pricing = array_merge(self::motion(80), [
            'heading' => 'Our Pricing Plans',
            'description' => 'Start free. Scale when the agents are carrying real work.',
            'textAlign' => 'center',
            'tone' => 'default',
            'showBillingToggle' => false,
            'headingSize' => 36,
            'plans' => [
                [
                    'name' => 'Starter',
                    'price' => '$19',
                    'period' => '/month',
                    'description' => 'For individuals and small teams',
                    'features' => "Up to 10 projects\n10 AI tasks/month\nBasic text generation\nSimple chatbot access\nEmail support only\nCommunity resources",
                    'buttonLabel' => 'Get Started',
                    'buttonUrl' => '/contact',
                ],
                [
                    'name' => 'Professional',
                    'price' => '$49',
                    'period' => '/month',
                    'description' => 'For growing teams and startups',
                    'features' => "Unlimited AI tasks\nAPI integration\nText & image outputs\nPriority chat & email support\nDetailed analytics\nTeam collaboration",
                    'buttonLabel' => 'Upgrade Now',
                    'buttonUrl' => '/contact',
                    'highlighted' => true,
                    'badge' => 'Preferred',
                ],
                [
                    'name' => 'Enterprise',
                    'price' => '$149',
                    'period' => '/month',
                    'description' => 'For enterprises and agencies',
                    'features' => "Custom AI models\nTeam access control\nDedicated account manager\nSecure private API\nSLA uptime guarantee\n24/7 premium support",
                    'buttonLabel' => 'Contact Sales',
                    'buttonUrl' => '/contact',
                ],
            ],
        ]);

        $faq = array_merge(self::motion(80), [
            'heading' => "FAQ's",
            'description' => 'Looking for answers? Check the questions teams ask before they launch an agent.',
            'textAlign' => 'center',
            'openFirst' => true,
            'headingSize' => 36,
            'items' => [
                ['question' => 'Do I need coding experience to build an agent?', 'answer' => 'No. Start with a prompt. Technical teams can still add APIs, rules, and data sources in the same builder.'],
                ['question' => 'How fast can we go live?', 'answer' => 'Most teams describe the job, personalize tools, and deploy the first agent the same day.'],
                ['question' => 'Can agents remember past conversations?', 'answer' => 'Yes. Memory & Learning keeps context across sessions so the agent does not restart from zero.'],
                ['question' => 'What happens after we launch?', 'answer' => 'The agent runs tasks in the background, reports results, and stays available in chat.'],
                ['question' => 'Can we try Aether before choosing a plan?', 'answer' => 'Yes. Start on Starter, then move to Professional or Enterprise when volume grows.'],
                ['question' => 'Does Enterprise include a dedicated manager?', 'answer' => 'Yes. Enterprise adds custom models, private API access, an SLA, and 24/7 support.'],
            ],
        ]);

        $hero = array_merge(self::motion(0), [
            'eyebrow' => 'Create your own agents — Start now',
            'heading' => 'Build, Deploy & Talk to AI Agents in Seconds.',
            'description' => 'Introducing a cloud platform that lets you build, deploy, and talk to AI agents in seconds.',
            'buttonLabel' => 'Start free trial',
            'buttonUrl' => '/pricing',
            'secondaryLabel' => 'Watch demo',
            'secondaryUrl' => '#demo',
            'headingSize' => 60,
            'bodySize' => 16,
            'paddingTop' => 128,
            'paddingBottom' => 40,
        ]);

        $cta = array_merge(self::motion(80), [
            'heading' => 'Ready to build?',
            'description' => 'See how fast you can turn an idea into a live agent. Get started for free — no credit card required.',
            'buttonLabel' => 'Try now',
            'buttonUrl' => '/pricing',
            'secondaryLabel' => 'Support',
            'secondaryUrl' => '/contact',
            'textAlign' => 'center',
            'boxed' => true,
            'tone' => 'surface',
            'headingSize' => 36,
        ]);

        return [
            TemplateContent::sitePage('Home', 'home', true, $nav, [
                TemplateContent::section('hero', 'hero.glow', $hero),
                TemplateContent::section('logos', 'gallery.logos', array_merge(self::motion(40), [
                    'heading' => 'Trusted by world’s leading brands',
                    'grayscale' => true,
                    'paddingTop' => 24,
                    'paddingBottom' => 48,
                    'logos' => [
                        ['label' => 'Microsoft'],
                        ['label' => 'Pipedrive'],
                        ['label' => 'Walgreens'],
                        ['label' => 'Berkshire'],
                        ['label' => 'Walmart'],
                    ],
                ])),
                TemplateContent::section('features', 'features.rail', array_merge(self::motion(80), [
                    'heading' => 'Agent features',
                    'description' => 'Design AI assistants that research, plan, and execute tasks — all powered by your prompts.',
                    'headingSize' => 36,
                    'items' => $features,
                ])),
                TemplateContent::section('workflow', 'process.zigzag', array_merge(self::motion(80), [
                    'heading' => 'From idea to autonomous agent quickly and effortlessly.',
                    'description' => 'Empower your business with AI agents that optimize processes and accelerate performance.',
                    'headingSize' => 36,
                    'items' => $workflow,
                ])),
                TemplateContent::section('quotes', 'testimonials.rail', array_merge(self::motion(80), [
                    'heading' => 'Hear what our trusted users say about our best AI agents.',
                    'description' => 'Empower your business with AI agents that optimize processes and accelerate performance.',
                    'headingSize' => 36,
                    'items' => $quotes,
                ])),
                TemplateContent::section('faq', 'faq.accordion', $faq),
                TemplateContent::section('pricing', 'pricing.three_columns', $pricing),
                TemplateContent::section('cta', 'cta.simple', $cta),
            ], $footer),

            TemplateContent::sitePage('Agents', 'agents', false, $nav, [
                TemplateContent::section('hero', 'hero.glow', array_merge(self::motion(0), [
                    'eyebrow' => 'Agents',
                    'heading' => 'Autonomous, remembered, real-time.',
                    'description' => 'Three surfaces every Aether agent ships with — editable here like the homepage.',
                    'buttonLabel' => 'Start free trial',
                    'buttonUrl' => '/pricing',
                    'secondaryLabel' => 'How it works',
                    'secondaryUrl' => '/how-it-works',
                    'headingSize' => 48,
                    'paddingTop' => 96,
                    'paddingBottom' => 32,
                ])),
                TemplateContent::section('features', 'features.rail', array_merge(self::motion(80), [
                    'heading' => 'Agent features',
                    'description' => 'Plan, remember, and execute without a custom stack.',
                    'headingSize' => 36,
                    'items' => $features,
                ])),
            ], $footer),

            TemplateContent::sitePage('How it works', 'how-it-works', false, $nav, [
                TemplateContent::section('workflow', 'process.zigzag', array_merge(self::motion(0), [
                    'heading' => 'From idea to autonomous agent.',
                    'description' => 'Prompt, personalize, then launch. The same three steps as the homepage.',
                    'headingSize' => 40,
                    'items' => $workflow,
                ])),
            ], $footer),

            TemplateContent::sitePage('Pricing', 'pricing', false, $nav, [
                TemplateContent::section('pricing', 'pricing.three_columns', $pricing),
                TemplateContent::section('faq', 'faq.accordion', $faq),
            ], $footer),

            TemplateContent::sitePage('Contact', 'contact', false, $nav, [
                TemplateContent::section('form', 'form.contact', array_merge(self::motion(0), [
                    'heading' => 'Talk to Aether',
                    'description' => 'Tell us about the agent you want to launch. We will reply with a Starter path or an Enterprise walkthrough.',
                    'textAlign' => 'left',
                    'layout' => 'split',
                    'buttonLabel' => 'Send message',
                    'headingSize' => 40,
                    'details' => [
                        ['icon' => 'mail', 'label' => 'Email', 'value' => 'hello@aether.example'],
                        ['icon' => 'message', 'label' => 'News', 'value' => 'Product notes and launches'],
                    ],
                ])),
            ], $footer),
        ];
    }
}
