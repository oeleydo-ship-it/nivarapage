<?php

namespace Database\Seeders;

class TemplateChatdeck
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#111111',
            'secondary' => '#111111',
            'accent' => '#111111',
            'background' => '#ffffff',
            'surface' => '#F9FAFB',
            'text' => '#111111',
            'muted' => '#6b7280',
            'headingFont' => 'Inter, system-ui, sans-serif',
            'bodyFont' => 'Inter, system-ui, sans-serif',
            'headingWeight' => 700,
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
        $brand = 'ChatDeck';
        $nav = TemplateContent::nav($brand, [
            ['label' => 'Features', 'url' => '/features'],
            ['label' => 'Team', 'url' => '/about'],
            ['label' => 'Testimonials', 'url' => '/about'],
            ['label' => 'Pricing', 'url' => '/pricing'],
            ['label' => 'FAQ', 'url' => '/pricing'],
        ], [
            'logoIcon' => 'message',
            'showMark' => true,
            'showBorder' => true,
            'sticky' => true,
            'shadow' => false,
            'showButton' => true,
            'buttonLabel' => 'Get Started',
            'buttonUrl' => '/contact',
            'buttonVariant' => 'secondary',
            'showSecondary' => true,
            'secondaryLabel' => 'Login',
            'secondaryUrl' => '/contact',
        ]);

        $footer = TemplateContent::footer($brand, [
            'tagline' => 'AI chat for teams that still want a human in the loop.',
            'columns' => [
                ['title' => 'Product', 'links' => "Features|/features\nPricing|/pricing\nTeam|/about"],
                ['title' => 'Support', 'links' => "FAQ|/pricing\nContact|/contact\nStatus|#"],
                ['title' => 'Help', 'links' => "Privacy|#\nTerms|#\nSecurity|#"],
            ],
            'legal' => [
                ['label' => 'Privacy', 'url' => '#'],
                ['label' => 'Terms', 'url' => '#'],
            ],
            'showNewsletter' => false,
            'tone' => 'default',
            'columnCount' => 3,
        ]);

        $dashboard = TemplateContent::photo('1551288049-bebda4e38f71');
        $amelia = TemplateContent::photo('1494790108377-be9c29b29330', 600);
        $jonah = TemplateContent::photo('1500648767791-00dcc994a43e', 600);
        $maya = TemplateContent::photo('1438761681033-6461ffad8d80', 600);
        $chris = TemplateContent::photo('1507003211169-0a1dd7228f2d', 600);
        $lena = TemplateContent::photo('1544005313-94ddf0286df2', 400);
        $omar = TemplateContent::photo('1506794778202-cad84cf45f1d', 400);
        $riley = TemplateContent::photo('1580489944761-15a19d654956', 400);
        $priya = TemplateContent::photo('1573496359142-b8d87734a5a2', 400);
        $noah = TemplateContent::photo('1507003211169-0a1dd7228f2d', 400);
        $sofia = TemplateContent::photo('1534528741775-53994a69daeb', 400);
        $kenji = TemplateContent::photo('1500648767791-00dcc994a43e', 400);
        $ava = TemplateContent::photo('1494790108377-be9c29b29330', 400);

        $logos = [
            ['label' => 'Disney'],
            ['label' => 'Netflix'],
            ['label' => 'Spotify'],
            ['label' => 'Airbnb'],
            ['label' => 'Revolut'],
            ['label' => 'Stripe'],
        ];

        $features = [
            ['icon' => 'briefcase', 'title' => 'Focus on Your Core Business', 'text' => 'Let the bot take first replies so agents stay on work that needs judgment.'],
            ['icon' => 'clock', 'title' => 'Always-on coverage', 'text' => 'Customers get a useful answer at 2am without staffing a night shift.'],
            ['icon' => 'database', 'title' => 'Trained on your content', 'text' => 'Point ChatDeck at your help center, product docs, and past tickets.'],
            ['icon' => 'users', 'title' => 'Smooth human handoff', 'text' => 'When confidence drops, the thread lands in the right inbox with full context.'],
            ['icon' => 'chart', 'title' => 'Insights from every chat', 'text' => 'See which questions repeat, where people get stuck, and what to write next.'],
            ['icon' => 'lock', 'title' => 'Secure by default', 'text' => 'Role-based access, audit logs, and no training on other customers’ data.'],
        ];

        $team = [
            ['name' => 'Amelia Chen', 'role' => 'Founder & CEO', 'image' => $amelia, 'linkedin' => '#', 'twitter' => '#', 'github' => '#', 'mail' => 'mailto:hello@chatdeck.example'],
            ['name' => 'Jonah Patel', 'role' => 'Head of Product', 'image' => $jonah, 'linkedin' => '#', 'twitter' => '#', 'github' => '#', 'mail' => '#'],
            ['name' => 'Maya Ortiz', 'role' => 'Customer Success', 'image' => $maya, 'linkedin' => '#', 'twitter' => '#', 'github' => '#', 'mail' => '#'],
            ['name' => 'Chris Hale', 'role' => 'Engineering', 'image' => $chris, 'linkedin' => '#', 'twitter' => '#', 'github' => '#', 'mail' => '#'],
        ];

        $quotes = [
            ['text' => 'First-response time dropped from hours to under a minute. The queue finally looks manageable.', 'name' => 'Lena Park', 'role' => 'Support lead, Northwind', 'avatar' => $lena],
            ['text' => 'We trained it on our help center in an afternoon. Agents now jump in only when the bot is unsure.', 'name' => 'Omar Hassan', 'role' => 'Ops, Lumen', 'avatar' => $omar],
            ['text' => 'Customers still feel like they reached a person. The tone stays on-brand without a script.', 'name' => 'Riley Gomez', 'role' => 'Founder, Harbour', 'avatar' => $riley],
            ['text' => 'Handoff is the part we worried about. Threads arrive with the full chat — no recap needed.', 'name' => 'Priya Shah', 'role' => 'CX, Vertex', 'avatar' => $priya],
            ['text' => 'The insight report told us which docs were missing. We wrote three articles and tickets fell off.', 'name' => 'Noah Ellis', 'role' => 'Knowledge, Cobalt', 'avatar' => $noah],
            ['text' => 'Setup was boring in the best way. SSO, roles, and a test inbox before we went live.', 'name' => 'Sofia Mendes', 'role' => 'IT, Fieldstone', 'avatar' => $sofia],
            ['text' => 'We run ChatDeck on three brands from one workspace. Each bot stays in its own voice.', 'name' => 'Kenji Sato', 'role' => 'Director, Cedar', 'avatar' => $kenji],
            ['text' => 'After a month the bot handled most password and shipping questions without us touching them.', 'name' => 'Ava Brooks', 'role' => 'Retail, Meridian', 'avatar' => $ava],
        ];

        $pricing = array_merge(self::motion(80), [
            'heading' => 'Choose your plan',
            'description' => 'Start free. Upgrade when the bot is carrying real ticket volume.',
            'textAlign' => 'center',
            'tone' => 'surface',
            'showBillingToggle' => true,
            'monthlyLabel' => 'Monthly',
            'yearlyLabel' => 'Yearly',
            'yearlyNote' => 'Two months free on yearly billing.',
            'headingSize' => 36,
            'plans' => [
                [
                    'name' => 'Free',
                    'price' => '$0',
                    'priceYearly' => '$0',
                    'period' => '/month',
                    'features' => "1 inbox\n500 bot replies\nHelp-center training\nEmail support",
                    'buttonLabel' => 'Get Started',
                    'buttonUrl' => '/contact',
                ],
                [
                    'name' => 'Pro',
                    'price' => '$29',
                    'priceYearly' => '$24',
                    'period' => '/month',
                    'features' => "3 inboxes\nUnlimited bot replies\nHuman handoff\nInsights report\nRemove branding",
                    'buttonLabel' => 'Get Started',
                    'buttonUrl' => '/contact',
                    'highlighted' => true,
                    'badge' => 'Best value',
                ],
                [
                    'name' => 'Business',
                    'price' => '$99',
                    'priceYearly' => '$82',
                    'period' => '/month',
                    'features' => "Unlimited inboxes\nSSO and roles\nAudit log\nPriority support\nDedicated onboarding",
                    'buttonLabel' => 'Get Started',
                    'buttonUrl' => '/contact',
                ],
            ],
        ]);

        $faq = array_merge(self::motion(80), [
            'heading' => 'Frequently Asked Questions',
            'description' => 'Straight answers before you connect an inbox.',
            'textAlign' => 'center',
            'openFirst' => true,
            'headingSize' => 36,
            'items' => [
                ['question' => 'Can ChatDeck talk to our existing help desk?', 'answer' => 'Yes. Connect a shared inbox or help-desk API, then ChatDeck drafts or sends first replies and hands off with the full thread.'],
                ['question' => 'Does it train on other companies’ tickets?', 'answer' => 'No. Your content stays in your workspace. We do not train shared models on customer conversations.'],
                ['question' => 'What happens when the bot is unsure?', 'answer' => 'It offers a human handoff. The assigned agent sees the chat history, confidence, and suggested articles.'],
                ['question' => 'Can we start on the free plan?', 'answer' => 'Yes. Free includes one inbox and 500 bot replies a month. Upgrade when you want more inboxes or handoff.'],
                ['question' => 'How long does setup take?', 'answer' => 'Most teams connect an inbox, paste a help-center URL, and run a test conversation the same afternoon.'],
            ],
        ]);

        return [
            TemplateContent::sitePage('Home', 'home', true, $nav, [
                TemplateContent::section('hero', 'hero.product', array_merge(self::motion(0), [
                    'eyebrow' => 'A new way to provide customer service',
                    'heading' => 'AI Chatbot for Customer Support.',
                    'description' => 'ChatDeck answers the repetitive tickets so your team can stay on the conversations that actually need a person.',
                    'buttonLabel' => 'Try for Free',
                    'buttonUrl' => '/pricing',
                    'image' => $dashboard,
                    'imageAlt' => 'ChatDeck inbox dashboard',
                    'videoUrl' => '#demo',
                    'showPlay' => true,
                    'headingSize' => 56,
                    'bodySize' => 18,
                ])),
                TemplateContent::section('logos', 'gallery.logos', array_merge(self::motion(40), [
                    'heading' => '',
                    'grayscale' => true,
                    'paddingTop' => 24,
                    'paddingBottom' => 24,
                    'logos' => $logos,
                ])),
                TemplateContent::section('features', 'features.minimal', array_merge(self::motion(80), [
                    'heading' => 'Why Choose ChatDeck?',
                    'description' => 'A quieter support stack: fewer queues, faster answers, and a team that still feels human.',
                    'headingSize' => 36,
                    'items' => $features,
                ])),
                TemplateContent::section('team', 'team.circle', array_merge(self::motion(80), [
                    'heading' => 'Meet Our Amazing Team',
                    'description' => 'The people who train the models, write the replies, and pick up when a customer needs a human.',
                    'headingSize' => 36,
                    'items' => $team,
                ])),
                TemplateContent::section('quotes', 'testimonials.compact', array_merge(self::motion(80), [
                    'heading' => 'What Our Customers Say',
                    'description' => 'Teams that swapped a shared inbox for ChatDeck — and kept a human in the loop.',
                    'headingSize' => 36,
                    'items' => $quotes,
                ])),
                TemplateContent::section('pricing', 'pricing.three_columns', $pricing),
                TemplateContent::section('faq', 'faq.accordion', $faq),
            ], $footer),

            TemplateContent::sitePage('Features', 'features', false, $nav, [
                TemplateContent::section('hero', 'hero.product', array_merge(self::motion(0), [
                    'eyebrow' => 'Product',
                    'heading' => 'Everything the bot needs. Nothing the queue does not.',
                    'description' => 'Training, handoff, and reporting live in one workspace — editable here just like the homepage.',
                    'buttonLabel' => 'Try for Free',
                    'buttonUrl' => '/pricing',
                    'image' => $dashboard,
                    'showPlay' => false,
                    'headingSize' => 44,
                    'paddingBottom' => 24,
                ])),
                TemplateContent::section('features', 'features.minimal', array_merge(self::motion(80), [
                    'heading' => 'Why Choose ChatDeck?',
                    'description' => 'Six surfaces your team will actually open after go-live.',
                    'headingSize' => 36,
                    'items' => $features,
                ])),
            ], $footer),

            TemplateContent::sitePage('Pricing', 'pricing', false, $nav, [
                TemplateContent::section('pricing', 'pricing.three_columns', $pricing),
                TemplateContent::section('faq', 'faq.accordion', $faq),
            ], $footer),

            TemplateContent::sitePage('About', 'about', false, $nav, [
                TemplateContent::section('team', 'team.circle', array_merge(self::motion(0), [
                    'heading' => 'Meet Our Amazing Team',
                    'description' => 'A small product group in one timezone. No ticket lottery.',
                    'headingSize' => 36,
                    'items' => $team,
                ])),
                TemplateContent::section('quotes', 'testimonials.compact', array_merge(self::motion(80), [
                    'heading' => 'What Our Customers Say',
                    'description' => 'Reviews from teams that went live in the last year.',
                    'headingSize' => 36,
                    'items' => $quotes,
                ])),
            ], $footer),

            TemplateContent::sitePage('Contact', 'contact', false, $nav, [
                TemplateContent::section('form', 'form.contact', array_merge(self::motion(0), [
                    'heading' => 'Talk to us',
                    'description' => 'Tell us about your inbox volume. We will reply with a setup path — free plan or a live walkthrough.',
                    'textAlign' => 'left',
                    'layout' => 'split',
                    'buttonLabel' => 'Send message',
                    'headingSize' => 40,
                    'details' => [
                        ['icon' => 'mail', 'label' => 'Email', 'value' => 'hello@chatdeck.example'],
                        ['icon' => 'message', 'label' => 'Chat', 'value' => 'Try the bot on this site'],
                    ],
                ])),
            ], $footer),
        ];
    }
}
