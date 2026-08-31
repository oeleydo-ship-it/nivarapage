<?php

namespace Database\Seeders;

/**
 * Halcyon — a calm, bootstrapped-SaaS product template.
 *
 * Six pages (Home, Pricing, About, Changelog, Contact, Terms) built from the
 * `*.halcyon` block family: near-white pages lit by pastel blooms, two-tone
 * headlines fading from ink to grey, hairline cards, a dark pill button beside
 * a sky-blue accent, and a full-bleed scenic band above a near-black footer.
 */
class TemplateHalcyon
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#1d9bf0',
            'secondary' => '#1b2434',
            'accent' => '#1d9bf0',
            'background' => '#ffffff',
            'surface' => '#f6f8fb',
            'text' => '#1e2634',
            'muted' => '#8b93a4',
            'headingFont' => 'Inter, system-ui, sans-serif',
            'bodyFont' => 'Inter, system-ui, sans-serif',
            'serifFont' => 'Georgia, serif',
            'monoFont' => 'JetBrains Mono, ui-monospace, monospace',
            'headingWeight' => 500,
            'bodyWeight' => 400,
            'buttonRadius' => '8px',
            'cardRadius' => '10px',
            'containerWidth' => '1040px',
            'sectionSpacing' => '88px',
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
        return array_merge([
            'logo' => 'Halcyon',
            'logoImage' => '',
            'logoUrl' => '/',
            'links' => [
                ['label' => 'About us', 'url' => '/about'],
                ['label' => 'Pricing', 'url' => '/pricing'],
                ['label' => 'Changelog', 'url' => '/changelog'],
                ['label' => 'Log in', 'url' => '/contact'],
            ],
            'secondaryLabel' => 'Book a demo',
            'secondaryUrl' => '/contact',
            'buttonLabel' => 'Try for free',
            'buttonUrl' => '/pricing',
            'sticky' => true,
        ], ['animation' => 'fade-down', 'animationTrigger' => 'load']);
    }

    /** @return array<string, mixed> */
    private static function footer(): array
    {
        return array_merge([
            'columns' => [
                [
                    'title' => 'Product',
                    'links' => [
                        ['label' => 'Pricing', 'url' => '/pricing'],
                        ['label' => 'Documentation', 'url' => '/terms'],
                        ['label' => 'API reference', 'url' => '/terms'],
                        ['label' => 'Changelog', 'url' => '/changelog'],
                        ['label' => 'About', 'url' => '/about'],
                    ],
                ],
                [
                    'title' => 'Compare',
                    'links' => [
                        ['label' => 'Shared inbox tools', 'url' => '/pricing'],
                        ['label' => 'Helpdesk suites', 'url' => '/pricing'],
                        ['label' => 'Live chat widgets', 'url' => '/pricing'],
                        ['label' => 'Knowledge bases', 'url' => '/pricing'],
                        ['label' => 'AI support agents', 'url' => '/pricing'],
                    ],
                ],
                [
                    'title' => 'Legal',
                    'links' => [
                        ['label' => 'Terms of service', 'url' => '/terms'],
                        ['label' => 'Privacy policy', 'url' => '/terms'],
                        ['label' => 'GDPR compliance', 'url' => '/terms'],
                        ['label' => 'Imprint', 'url' => '/terms'],
                    ],
                ],
            ],
            'brandTitle' => 'Halcyon',
            'brandLinks' => [
                ['label' => 'hello@halcyon.example', 'url' => 'mailto:hello@halcyon.example'],
                ['label' => 'Help centre', 'url' => '/contact'],
                ['label' => 'API docs', 'url' => '/terms'],
                ['label' => 'Status page', 'url' => '/changelog'],
            ],
            'copyright' => '© '.date('Y').' Halcyon',
        ], self::motion(40));
    }

    /** The scenic closing CTA that ends every page. */
    private static function scene(): array
    {
        return array_merge(self::motion(40), [
            'heading' => 'Everything included. No surprises.',
            'headingAlt' => '$29 per user per month, cancel anytime.',
            'description' => 'Your AI agents ride free. Unlimited conversations, unlimited features, and no card needed during the 14-day trial.',
            'buttonLabel' => 'Try free for 14 days',
            'buttonUrl' => '/contact',
            'secondaryLabel' => 'Book a demo with a founder',
            'secondaryUrl' => '/contact',
            'image' => TemplateContent::photo('1506905925346-21bda4d32df4', 1800),
        ]);
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        return [
            self::home(),
            self::pricing(),
            self::about(),
            self::changelog(),
            self::contact(),
            self::terms(),
        ];
    }

    /** @return array<string, mixed> */
    private static function home(): array
    {
        return TemplateContent::sitePage('Home', 'home', true, self::nav(), [
            TemplateContent::section('hero', 'hero.halcyon', array_merge(self::motion(0, 'load'), [
                'heading' => 'Bonjour, I’m Halcyon',
                'headingAlt' => 'the support tool you’ll actually enjoy',
                'description' => 'Replace your sprawling helpdesk with one calm inbox. Shared conversations, a knowledge base and an AI agent that knows your product, all in a single place.',
                'buttonLabel' => 'Try for free',
                'buttonUrl' => '/pricing',
                'secondaryLabel' => 'Book a demo',
                'secondaryUrl' => '/contact',
                'tabs' => [
                    ['label' => 'Shared inbox'],
                    ['label' => 'Knowledge base'],
                    ['label' => 'AI agent'],
                    ['label' => 'Live chat'],
                ],
                'image' => TemplateContent::photo('1531482615713-2afd69097998', 1600),
                'bloom' => true,
            ])),
            TemplateContent::section('channels', 'featurerow.halcyon', array_merge(self::motion(40), [
                'heading' => 'Consolidate every support channel',
                'headingAlt' => 'into one shared inbox',
                'description' => 'Email, chat, social and forms all land in the same place, so nothing is answered twice and nothing is missed.',
                'items' => [
                    ['icon' => 'mail', 'title' => 'Email', 'text' => 'Bring your own address or use ours. Threads stay readable, even after ten replies.'],
                    ['icon' => 'message', 'title' => 'Live chat', 'text' => 'A widget that matches your product and hands off to a human when it should.'],
                    ['icon' => 'book', 'title' => 'Knowledge base', 'text' => 'Public articles your AI agent can quote, kept in the same editor as your replies.'],
                    ['icon' => 'users', 'title' => 'Social', 'text' => 'Mentions and direct messages arrive as ordinary conversations you can assign.'],
                    ['icon' => 'code', 'title' => 'API', 'text' => 'Push in-product reports straight into the inbox with the context already attached.'],
                    ['icon' => 'phone', 'title' => 'Forms', 'text' => 'Contact forms create a thread instead of an email you forget to reply to.'],
                ],
            ])),
            TemplateContent::section('showcase', 'showcase.halcyon', array_merge(self::motion(40), [
                'eyebrow' => 'Integrations',
                'eyebrowIcon' => 'layers',
                'heading' => 'Support that finally connects',
                'headingAlt' => 'to your team and your product',
                'description' => 'See the customer’s plan, their last order and their open bugs without leaving the reply box.',
                'columns' => 3,
                'items' => [
                    ['title' => 'The whole account, in the thread', 'text' => 'Plan, billing state and recent activity sit beside the conversation.', 'image' => TemplateContent::photo('1551288049-bebda4e38f71', 900), 'linkLabel' => 'Read more', 'url' => '/pricing'],
                    ['title' => 'Bug reports that reach the backlog', 'text' => 'Turn a complaint into a ticket in your tracker without retyping it.', 'image' => TemplateContent::photo('1517180102446-f3ece451e9d8', 900), 'linkLabel' => 'Read more', 'url' => '/pricing'],
                    ['title' => 'Answers your team can trust', 'text' => 'Internal notes and saved replies keep everyone telling the same story.', 'image' => TemplateContent::photo('1522071820081-009f0129c71c', 900), 'linkLabel' => 'Read more', 'url' => '/pricing'],
                ],
            ])),
            TemplateContent::section('quote', 'quote.halcyon', array_merge(self::motion(40), [
                'quote' => 'We moved four inboxes and a spreadsheet into Halcyon in an afternoon. The part I did not expect is that support stopped feeling like an interruption and started feeling like product research.',
                'name' => 'Robin Aleixo',
                'role' => 'Founder, Tessellate',
                'image' => TemplateContent::photo('1507003211169-0a1dd7228f2d', 300),
            ])),
            TemplateContent::section('ai', 'split.halcyon', array_merge(self::motion(40), [
                'eyebrow' => 'AI agent',
                'eyebrowIcon' => 'sparkles',
                'heading' => 'An AI that actually knows',
                'headingAlt' => 'how your product works',
                'description' => 'It reads your knowledge base and your past replies, answers what it is sure about, and steps aside the moment it is not.',
                'bullets' => "Trained on your articles, not the open web\nCites the source so an agent can check it\nHands over with the full thread intact",
                'linkLabel' => 'See how it works',
                'linkUrl' => '/pricing',
                'image' => TemplateContent::photo('1526628953301-3e589a6a8b74', 1100),
                'reverse' => false,
            ])),
            TemplateContent::section('automate', 'split.halcyon', array_merge(self::motion(40), [
                'eyebrow' => 'Automations',
                'eyebrowIcon' => 'zap',
                'heading' => 'Automate the repetitive part',
                'headingAlt' => 'and keep the human part',
                'description' => 'Rules triage, tag and assign before anyone opens the inbox, so the queue you see is the queue that needs you.',
                'bullets' => "Route by topic, plan or sentiment\nSnooze until the customer replies\nEscalate anything the agent is unsure about",
                'linkLabel' => 'Browse the rule library',
                'linkUrl' => '/pricing',
                'image' => TemplateContent::photo('1454165804606-c3d57bc86b40', 1100),
                'reverse' => true,
            ])),
            TemplateContent::section('logos', 'logos.halcyon', array_merge(self::motion(40), [
                'heading' => 'Integrates with your entire stack',
                'headingAlt' => '',
                'description' => 'Connect the tools your team already lives in. Nothing to maintain, nothing to babysit.',
                'items' => [
                    ['icon' => 'cloud', 'label' => 'Nimbus'],
                    ['icon' => 'database', 'label' => 'Ledger'],
                    ['icon' => 'cpu', 'label' => 'Cortex'],
                    ['icon' => 'cart', 'label' => 'Basket'],
                    ['icon' => 'code', 'label' => 'Forge'],
                    ['icon' => 'calendar', 'label' => 'Almanac'],
                ],
            ])),
            TemplateContent::section('compare', 'compare.halcyon', array_merge(self::motion(40), [
                'eyebrow' => 'Why teams switch',
                'eyebrowIcon' => 'target',
                'heading' => 'A return to knowing what is going on',
                'headingAlt' => '',
                'description' => 'Fewer screens to check, fewer settings to guess at, and an inbox you can hold in your head.',
                'leftTitle' => 'The usual helpdesk',
                'leftItems' => "Twelve tabs and three notification badges\nWorkflow builders nobody on the team understands\nSeat pricing that punishes you for asking a colleague\nA sales call before you can see the price",
                'rightTitle' => 'Halcyon',
                'rightItems' => "One inbox, one search box, one place to look\nRules you can read out loud in a sentence\nPassive teammates are free, always\nThe price is on the pricing page",
            ])),
            TemplateContent::section('scene', 'ctascene.halcyon', self::scene()),
        ], self::footer(), 'footer.halcyon', 'navbar.halcyon');
    }

    /** @return array<string, mixed> */
    private static function pricing(): array
    {
        return TemplateContent::sitePage('Pricing', 'pricing', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.halcyon', array_merge(self::motion(0, 'load'), [
                'eyebrow' => '',
                'heading' => 'Transparent, simple pricing',
                'headingAlt' => 'made for small teams',
                'description' => 'Simple and transparent. Unlimited access to every feature without restriction, and unlimited conversations. Cancel anytime, no questions asked.',
                'bloom' => false,
            ])),
            TemplateContent::section('plan', 'pricecard.halcyon', array_merge(self::motion(20), [
                'price' => '$29',
                'unit' => "per active user\nper month",
                'features' => "Shared inbox\nLive chat with AI agent\nKnowledge base\nFree migration",
                'buttonLabel' => 'Try free for 14 days',
                'buttonUrl' => '/contact',
                'fineprint' => 'No credit card needed. Cancel anytime.',
            ])),
            TemplateContent::section('faq', 'faqcolumns.halcyon', array_merge(self::motion(40), [
                'heading' => '',
                'headingAlt' => '',
                'columns' => 2,
                'items' => [
                    ['question' => 'What makes a user count as active?', 'answer' => 'Active users can reply to customers directly. If that permission is off, the user is passive and is not charged for a seat, so you can invite the whole team at no extra cost.'],
                    ['question' => 'How many passive users can I invite?', 'answer' => 'There is no limit. Invite everyone who might need to read a thread or leave an internal note.'],
                    ['question' => 'Will I be charged when the trial ends?', 'answer' => 'No. We do not ask for a card up front, so you are only charged when you decide you are ready.'],
                    ['question' => 'Do I need to sign a long contract?', 'answer' => 'No. Billing is monthly and you can cancel any time. You keep access until the end of the period you already paid for.'],
                    ['question' => 'Can I add or remove users later?', 'answer' => 'Any time. Removing someone stops charges for them from the next billing period onward.'],
                    ['question' => 'Which payment methods do you accept?', 'answer' => 'All major cards. Payments run through our processor, so we never see or store your card details.'],
                    ['question' => 'Can I import from my current helpdesk?', 'answer' => 'Yes, and we do it for you. Our migration service covers every major helpdesk at no charge.'],
                    ['question' => 'Where is my data hosted?', 'answer' => 'On servers in the EU, under GDPR. Only you and, where strictly necessary, our on-call engineers can reach it.'],
                    ['question' => 'We are a large enterprise. Who do I call?', 'answer' => 'Honestly, nobody. There is no sales team. We are built for teams of ten and under, so we are probably not the right fit.'],
                    ['question' => 'What if I have more questions?', 'answer' => 'Write to us. We practise what we preach, so your message arrives in Halcyon and a founder answers it.'],
                ],
            ])),
            TemplateContent::section('scene', 'ctascene.halcyon', self::scene()),
        ], self::footer(), 'footer.halcyon', 'navbar.halcyon');
    }

    /** @return array<string, mixed> */
    private static function about(): array
    {
        return TemplateContent::sitePage('About us', 'about', false, self::nav(), [
            TemplateContent::section('letter', 'manifesto.halcyon', array_merge(self::motion(0, 'load'), [
                'eyebrow' => '',
                'heading' => 'Our philosophy',
                'headingAlt' => 'Make work calmer, kinder and faster.',
                'lead' => 'We built Halcyon because support tools became too much.',
                'body' => "We are two founders who spent the last decade building and running small software businesses.\n\nWe know what support feels like when the team is still small. A bug report lands while you are shipping. A refund request arrives during a deploy. Someone asks the same onboarding question for the fifth time this week, and the person answering is the founder, the developer, or the one person who can actually fix it.\n\nThat kind of support is valuable. It keeps you close to your users. It shows you what is confusing, what is broken, and what to build next.\n\nBut most support tools were not designed for that. They were designed for large teams, complex workflows, sales calls, dashboards and long setup cycles.\n\nSo we built the tool we wished we had.",
                'signature' => 'Amelie & Tomas, founders',
            ])),
            TemplateContent::section('team', 'team.halcyon', array_merge(self::motion(40), [
                'heading' => 'Our team',
                'headingAlt' => '',
                'description' => 'An intentionally small company, fully remote and async-first.',
                'columns' => 2,
                'items' => [
                    ['name' => 'Amelie Ferrand', 'role' => 'Founder + Product designer', 'location' => 'Hamburg, Germany', 'image' => TemplateContent::photo('1573496359142-b8d87734a5a2', 300), 'icon' => 'twitter', 'url' => '#'],
                    ['name' => 'Tomas Ekwall', 'role' => 'Founder + Engineer', 'location' => 'Belfort, France', 'image' => TemplateContent::photo('1519085360753-af0119f7cbe7', 300), 'icon' => 'twitter', 'url' => '#'],
                ],
            ])),
            TemplateContent::section('story', 'story.halcyon', array_merge(self::motion(40), [
                'heading' => 'Hey, but why “Halcyon”?',
                'headingAlt' => '',
                'body' => "Halcyon days are the calm ones — a stretch of still weather in the middle of winter, named after a bird that was supposed to nest on the water while the sea held its breath.\n\nThat is the bar we set for a support tool. Not louder, not busier. A steady, trustworthy way to carry a message from your customer to you, and your answer back to them.\n\nIt is a small thing to aim for, and a hard one to keep.",
                'image' => TemplateContent::photo('1500534314209-a25ddb2bd429', 700),
                'secondaryImage' => TemplateContent::photo('1476514525535-07fb3b4ae5f1', 700),
                'reverse' => false,
            ])),
            TemplateContent::section('principles', 'principles.halcyon', array_merge(self::motion(40), [
                'eyebrow' => 'Principles',
                'eyebrowIcon' => 'target',
                'heading' => 'Our guiding principles',
                'headingAlt' => '',
                'description' => '',
                'columns' => 3,
                'items' => [
                    ['title' => 'Support is product work', 'text' => 'Every conversation tells you something about the product. Support should help the team learn, not just close tickets.'],
                    ['title' => 'Calm beats complexity', 'text' => 'Small teams do not need more dashboards, workflows and settings. They need fewer decisions and faster answers.'],
                    ['title' => 'AI should help, not hide', 'text' => 'It should answer what it knows, act where allowed, and escalate the moment a human would be better.'],
                    ['title' => 'Pricing should be obvious', 'text' => 'No mandatory demo. No sales rep. Just a price you can understand before you sign up.'],
                    ['title' => 'Taste matters', 'text' => 'Support software is used for hours every week. It should feel fast, clean and pleasant.'],
                    ['title' => 'Opinionated over configurable', 'text' => 'Most tools try to be everything. We make the product decisions so you do not configure your way out of complexity.'],
                ],
            ])),
            TemplateContent::section('scene', 'ctascene.halcyon', self::scene()),
        ], self::footer(), 'footer.halcyon', 'navbar.halcyon');
    }

    /** @return array<string, mixed> */
    private static function changelog(): array
    {
        return TemplateContent::sitePage('Changelog', 'changelog', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.halcyon', array_merge(self::motion(0, 'load'), [
                'eyebrow' => 'Changelog',
                'eyebrowIcon' => 'clock',
                'heading' => 'What shipped, and when',
                'headingAlt' => 'no marketing, just the notes',
                'description' => 'Every release since launch. Small fixes included, because those are usually the ones you noticed.',
                'bloom' => false,
            ])),
            TemplateContent::section('entries', 'changelog.halcyon', array_merge(self::motion(20), [
                'heading' => '',
                'headingAlt' => '',
                'items' => [
                    ['date' => 'March 2026', 'tag' => 'New', 'title' => 'Saved replies with variables', 'text' => 'Reuse an answer without losing the customer’s name, plan or order number.'],
                    ['date' => 'February 2026', 'tag' => 'Improved', 'title' => 'Faster search across threads', 'text' => 'Search now covers internal notes and attachments, and returns in under a second on large inboxes.'],
                    ['date' => 'January 2026', 'tag' => 'New', 'title' => 'AI agent escalation rules', 'text' => 'Decide exactly when the agent should stop and hand the conversation to a person.'],
                    ['date' => 'December 2025', 'tag' => 'Fixed', 'title' => 'Threading for forwarded email', 'text' => 'Forwarded chains no longer split into two conversations.'],
                    ['date' => 'November 2025', 'tag' => 'New', 'title' => 'Knowledge base in the composer', 'text' => 'Search and insert an article without leaving the reply you are writing.'],
                ],
            ])),
            TemplateContent::section('scene', 'ctascene.halcyon', self::scene()),
        ], self::footer(), 'footer.halcyon', 'navbar.halcyon');
    }

    /** @return array<string, mixed> */
    private static function contact(): array
    {
        return TemplateContent::sitePage('Contact', 'contact', false, self::nav(), [
            TemplateContent::section('form', 'contact.halcyon', array_merge(self::motion(0, 'load'), [
                'eyebrow' => 'Contact',
                'eyebrowIcon' => 'mail',
                'heading' => 'Talk to the people',
                'headingAlt' => 'who build the product',
                'description' => 'No sales department, no qualification call. Write to us and a founder answers, usually the same day.',
                'details' => [
                    ['icon' => 'mail', 'label' => 'Email', 'value' => 'hello@halcyon.example', 'url' => 'mailto:hello@halcyon.example'],
                    ['icon' => 'message', 'label' => 'Live chat', 'value' => 'Bottom-right of this page', 'url' => '#'],
                    ['icon' => 'book', 'label' => 'Help centre', 'value' => 'Guides and answers', 'url' => '/changelog'],
                    ['icon' => 'clock', 'label' => 'Response time', 'value' => 'Under 4 hours, Mon–Fri', 'url' => ''],
                ],
                'formTitle' => 'Send us a message',
                'topics' => "General question\nMigrating from another tool\nBilling\nSecurity and compliance\nSomething is broken",
                'formId' => '',
                'buttonLabel' => 'Send message',
                'fineprint' => 'We reply from a real inbox. No ticket numbers, no autoresponders.',
            ])),
            TemplateContent::section('faq', 'faqcolumns.halcyon', array_merge(self::motion(40), [
                'heading' => 'Before you write',
                'headingAlt' => 'the answers people ask for most',
                'columns' => 2,
                'items' => [
                    ['question' => 'Can you migrate our current inbox?', 'answer' => 'Yes, at no charge. Send us an export or a login and we will do the mapping and the import for you.'],
                    ['question' => 'Do you offer a trial extension?', 'answer' => 'If fourteen days was not enough to decide, ask. We would rather you were sure.'],
                    ['question' => 'Can we self-host?', 'answer' => 'Not today. Data stays in the EU on our infrastructure, and we can send you the sub-processor list.'],
                    ['question' => 'Do you sign DPAs?', 'answer' => 'Yes. Ask and we will send ours, or review yours if you have a standard one.'],
                ],
            ])),
            TemplateContent::section('scene', 'ctascene.halcyon', self::scene()),
        ], self::footer(), 'footer.halcyon', 'navbar.halcyon');
    }

    /** @return array<string, mixed> */
    private static function terms(): array
    {
        return TemplateContent::sitePage('Terms', 'terms', false, self::nav(), [
            TemplateContent::section('head', 'pagehead.halcyon', array_merge(self::motion(0, 'load'), [
                'eyebrow' => 'Legal',
                'eyebrowIcon' => 'shield',
                'heading' => 'Terms in plain language',
                'headingAlt' => 'written to be read, not skipped',
                'description' => '',
                'bloom' => false,
            ])),
            TemplateContent::section('body', 'richtext.halcyon', array_merge(self::motion(20), [
                'contentWidth' => 'narrow',
                'body' => '<p>This page exists so you can read what you are agreeing to without a lawyer beside you. If anything here is unclear, write to us and we will rewrite it.</p>'
                    .'<h2>What we store</h2>'
                    .'<p>Your conversations, the people in them, and the settings you choose. Nothing else, and nothing sold onward.</p>'
                    .'<p>You can export everything at any time, and deleting your account deletes it for real rather than flagging a row as hidden.</p>'
                    .'<h2>Where it lives</h2>'
                    .'<p>On servers in the European Union. Our on-call engineers can reach production data only when an incident requires it, and that access is logged.</p>'
                    .'<h3>Sub-processors</h3>'
                    .'<p>We use a small number of providers for hosting, email delivery and payments. The current list is available on request and we will tell you before it changes.</p>'
                    .'<h2>Billing</h2>'
                    .'<p>Monthly, per active user, cancellable at any time. Cancelling stops the next charge; it does not refund the period you are already in, and you keep access until it ends.</p>',
            ])),
            TemplateContent::section('scene', 'ctascene.halcyon', self::scene()),
        ], self::footer(), 'footer.halcyon', 'navbar.halcyon');
    }
}
