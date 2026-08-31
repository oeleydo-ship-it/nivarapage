<?php

namespace Database\Seeders;

class TemplateSolara
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#FF6B1A',
            'secondary' => '#111827',
            'accent' => '#8B7CF6',
            'background' => '#FFFFFF',
            'surface' => '#FFF7ED',
            'text' => '#111827',
            'muted' => '#6B7280',
            'headingFont' => 'Inter, system-ui, sans-serif',
            'bodyFont' => 'Inter, system-ui, sans-serif',
            'headingWeight' => 800,
            'bodyWeight' => 400,
            'buttonRadius' => '12px',
            'cardRadius' => '22px',
            'containerWidth' => '1120px',
            'sectionSpacing' => '88px',
        ];
    }

    /** @return array<string, mixed> */
    private static function motion(int $delay = 0, string $trigger = 'scroll'): array
    {
        return [
            'animation' => 'fade-up',
            'animationTrigger' => $trigger,
            'animationDuration' => 700,
            'animationDelay' => $delay,
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $brand = 'Solara';
        $nav = array_merge([
            'logo' => $brand,
            'logoIcon' => 'sparkles',
            'logoUrl' => '/',
            'sticky' => true,
            'buttonLabel' => 'Get started',
            'buttonUrl' => '/pricing',
            'links' => [
                ['label' => 'Home', 'url' => '/'],
                ['label' => 'Features', 'url' => '/features'],
                ['label' => 'Testimonials', 'url' => '/testimonials'],
                ['label' => 'Pricing', 'url' => '/pricing'],
            ],
        ], self::motion(0, 'load'));

        $footer = [
            'logo' => $brand,
            'logoIcon' => 'sparkles',
            'logoUrl' => '/',
            'copyright' => '© '.date('Y').' Solara. All rights reserved.',
            'columns' => [
                ['title' => 'Product', 'links' => "Features|/features\nPricing|/pricing\nTestimonials|/testimonials"],
                ['title' => 'Resources', 'links' => "Contact|/contact\nHelp|#\nGuides|#"],
                ['title' => 'Company', 'links' => "About|/contact\nCareers|#\nPress|#"],
            ],
        ];

        $features = [
            ['icon' => 'zap', 'title' => 'Prompt to agent', 'text' => 'Start with a sentence. Solara sketches tasks, tools, and a first personality.', 'tint' => '#FF6B1A', 'wash' => '#FFF4EC'],
            ['icon' => 'cpu', 'title' => 'Memory that sticks', 'text' => 'Agents keep context across sessions so customers never restart from zero.', 'tint' => '#22C55E', 'wash' => '#ECFDF5'],
            ['icon' => 'rocket', 'title' => 'Live execution', 'text' => 'Jobs run in the background and report back when the work is done.', 'tint' => '#3B82F6', 'wash' => '#EFF6FF'],
            ['icon' => 'users', 'title' => 'Human handoff', 'text' => 'When confidence drops, the thread lands with a person and the full history.', 'tint' => '#EC4899', 'wash' => '#FDF2F8'],
            ['icon' => 'chart', 'title' => 'Clear analytics', 'text' => 'See which prompts convert, which tools stall, and where to train next.', 'tint' => '#84CC16', 'wash' => '#F7FEE7'],
            ['icon' => 'shield', 'title' => 'Safe by default', 'text' => 'Workspace roles, audit logs, and no training on other customers’ data.', 'tint' => '#B45309', 'wash' => '#FEF3C7'],
        ];

        $quotes = [
            ['name' => 'Amelia Chen', 'handle' => '@amelia', 'text' => 'We launched an agent landing page in an afternoon. The orange kit already looked like our product.', 'image' => TemplateContent::photo('1494790108377-be9c29b29330', 200), 'rating' => 5, 'highlighted' => false],
            ['name' => 'Jonah Patel', 'handle' => '@jonah', 'text' => 'Memory and handoff just worked. Investors noticed the site before they noticed the deck.', 'image' => TemplateContent::photo('1500648767791-00dcc994a43e', 200), 'rating' => 5, 'highlighted' => true],
            ['name' => 'Maya Ortiz', 'handle' => '@maya', 'text' => 'Pricing, FAQ, and quotes stay on-brand when we duplicate inner pages. Easy to extend.', 'image' => TemplateContent::photo('1438761681033-6461ffad8d80', 200), 'rating' => 5, 'highlighted' => false],
        ];

        $pricing = array_merge(self::motion(80), [
            'eyebrow' => 'Pricing',
            'heading' => 'Simple, transparent pricing',
            'showBillingToggle' => true,
            'monthlyLabel' => 'Monthly',
            'yearlyLabel' => 'Yearly',
            'plans' => [
                [
                    'name' => 'Basic',
                    'price' => '$0.00',
                    'priceYearly' => '$0.00',
                    'period' => '/mo',
                    'features' => "1 agent\n50 tasks / month\nCommunity support\nCancel anytime",
                    'buttonLabel' => 'Get started',
                    'buttonUrl' => '/contact',
                ],
                [
                    'name' => 'Starter',
                    'price' => '$19.00',
                    'priceYearly' => '$15.00',
                    'period' => '/mo',
                    'features' => "5 agents\nUnlimited tasks\nPriority chat\nRemove badge\nCustom domain",
                    'buttonLabel' => 'Get started',
                    'buttonUrl' => '/contact',
                    'highlighted' => true,
                ],
            ],
        ]);

        $faq = array_merge(self::motion(80), [
            'heading' => 'Last questions?',
            'openFirst' => true,
            'cardHeading' => 'Still have questions? Chat with our AI design assistant.',
            'cardButton' => 'Chat with Solara',
            'cardUrl' => '/contact',
            'items' => [
                ['question' => 'Do I need to write code?', 'answer' => 'No. Describe the job in plain language. Technical teams can still attach APIs and rules in the same builder.'],
                ['question' => 'How fast can we launch an agent?', 'answer' => 'Most teams ship a first agent the same afternoon: prompt, tools, then deploy.'],
                ['question' => 'Can agents remember past chats?', 'answer' => 'Yes. Memory stays on the conversation so the next visit does not start from zero.'],
                ['question' => 'What happens after we go live?', 'answer' => 'The agent keeps working in the background, reports results, and can hand off to a person.'],
            ],
        ]);

        $hero = array_merge(self::motion(0, 'load'), [
            'badge' => 'Join 50+ teams',
            'tag' => 'New!',
            'heading' => 'Build, Launch & Scale with AI agents.',
            'description' => 'Solara gives your team agents that draft, ship, and follow up — so launches leave the slide deck and actually go live.',
            'buttonLabel' => 'Get started',
            'buttonUrl' => '/pricing',
            'secondaryLabel' => 'See in action',
            'secondaryUrl' => '#demo',
            'headingSize' => 56,
            'bodySize' => 17,
            'avatars' => [
                ['image' => TemplateContent::photo('1494790108377-be9c29b29330', 80)],
                ['image' => TemplateContent::photo('1500648767791-00dcc994a43e', 80)],
                ['image' => TemplateContent::photo('1438761681033-6461ffad8d80', 80)],
            ],
        ]);

        $team = array_merge(self::motion(80), [
            'heading' => '',
            'items' => [
                ['name' => 'Amelia Chen', 'role' => 'Co-founder, product', 'image' => TemplateContent::photo('1573496359142-b8d87734a5a2', 900)],
                ['name' => 'Jonah Patel', 'role' => 'Co-founder, engineering', 'image' => TemplateContent::photo('1500648767791-00dcc994a43e', 900)],
            ],
        ]);

        return [
            TemplateContent::sitePage('Home', 'home', true, $nav, [
                TemplateContent::section('hero', 'hero.solara', $hero),
                TemplateContent::section('stats', 'stats.solara', array_merge(self::motion(40), [
                    'items' => [
                        ['value' => '1x', 'label' => 'faster agent generation'],
                        ['value' => '10%', 'label' => 'less time in review'],
                        ['value' => '22.1%', 'label' => 'more launches shipped'],
                    ],
                    'paddingTop' => 8,
                    'paddingBottom' => 24,
                ])),
                TemplateContent::section('features', 'features.solara', array_merge(self::motion(80), [
                    'eyebrow' => 'Core features',
                    'heading' => 'Everything an agent team needs on one canvas.',
                    'description' => 'Describe the job, attach your tools, and launch. Solara keeps memory, handoff, and reporting in the same place.',
                    'buttonLabel' => 'Build your agent',
                    'buttonUrl' => '/pricing',
                    'items' => $features,
                ])),
                TemplateContent::section('faq', 'faq.solara', $faq),
                TemplateContent::section('team', 'team.solara', $team),
                TemplateContent::section('pricing', 'pricing.solara', $pricing),
                TemplateContent::section('quotes', 'testimonials.solara', array_merge(self::motion(80), [
                    'moreLabel' => 'View more',
                    'moreUrl' => '/testimonials',
                    'items' => $quotes,
                ])),
            ], $footer, 'footer.solara', 'navbar.solara'),

            TemplateContent::sitePage('Features', 'features', false, $nav, [
                TemplateContent::section('lead', 'hero.solara', array_merge(self::motion(0, 'load'), [
                    'badge' => 'Product',
                    'tag' => 'Live',
                    'heading' => 'Core features, without the extra logins.',
                    'description' => 'Prompt, memory, execution, and handoff live on one canvas — the same kit you see on the homepage.',
                    'buttonLabel' => 'See pricing',
                    'buttonUrl' => '/pricing',
                    'secondaryLabel' => 'Talk to us',
                    'secondaryUrl' => '/contact',
                ])),
                TemplateContent::section('features', 'features.solara', array_merge(self::motion(80), [
                    'eyebrow' => 'Core features',
                    'heading' => 'Everything an agent team needs on one canvas.',
                    'description' => 'Describe the job, attach your tools, and launch.',
                    'buttonLabel' => 'Build your agent',
                    'buttonUrl' => '/pricing',
                    'items' => $features,
                ])),
            ], $footer, 'footer.solara', 'navbar.solara'),

            TemplateContent::sitePage('Testimonials', 'testimonials', false, $nav, [
                TemplateContent::section('quotes', 'testimonials.solara', array_merge(self::motion(0), [
                    'moreLabel' => '',
                    'items' => $quotes,
                ])),
                TemplateContent::section('team', 'team.solara', $team),
            ], $footer, 'footer.solara', 'navbar.solara'),

            TemplateContent::sitePage('Pricing', 'pricing', false, $nav, [
                TemplateContent::section('pricing', 'pricing.solara', $pricing),
                TemplateContent::section('faq', 'faq.solara', $faq),
            ], $footer, 'footer.solara', 'navbar.solara'),

            TemplateContent::sitePage('Contact', 'contact', false, $nav, [
                TemplateContent::section('form', 'form.contact', array_merge(self::motion(0), [
                    'eyebrow' => 'Contact',
                    'heading' => 'Get started with Solara',
                    'description' => 'Tell us what the agent should do. We reply with a workspace, not a deck.',
                    'buttonLabel' => 'Send message',
                    'layout' => 'split',
                    'details' => [
                        ['icon' => 'mail', 'label' => 'Email', 'value' => 'hello@solara.example'],
                        ['icon' => 'clock', 'label' => 'Hours', 'value' => 'We reply within one business day'],
                    ],
                ])),
            ], $footer, 'footer.solara', 'navbar.solara'),
        ];
    }
}
