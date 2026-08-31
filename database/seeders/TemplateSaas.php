<?php

namespace Database\Seeders;

class TemplateSaas
{
    public static function photo(string $id, int $width = 1200): string
    {
        return 'https://images.unsplash.com/photo-'.$id.'?auto=format&fit=crop&w='.$width.'&q=80';
    }

    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#0f172a',
            'secondary' => '#1e1b4b',
            'accent' => '#7c6af7',
            'background' => '#ffffff',
            'surface' => '#f6f3ff',
            'text' => '#0f172a',
            'muted' => '#64748b',
            'headingFont' => 'Outfit, system-ui, sans-serif',
            'bodyFont' => 'Figtree, system-ui, sans-serif',
            'headingWeight' => 700,
            'bodyWeight' => 400,
            'buttonRadius' => '12px',
            'cardRadius' => '20px',
            'containerWidth' => '1180px',
            'sectionSpacing' => '88px',
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $brand = 'Flypay';
        $links = [
            ['label' => 'Features', 'url' => '/features'],
            ['label' => 'Pricing', 'url' => '/pricing'],
            ['label' => 'About', 'url' => '/about'],
            ['label' => 'Blog', 'url' => '/blog'],
        ];
        $nav = TemplateContent::nav($brand, $links, [
            'logoIcon' => 'zap',
            'showMark' => true,
            'textAlign' => 'center',
            'showButton' => true,
            'buttonLabel' => 'Get Started',
            'buttonUrl' => '/pricing',
            'buttonVariant' => 'primary',
            'showSecondary' => true,
            'secondaryLabel' => 'Log In',
            'secondaryUrl' => '/about',
            'sticky' => true,
            'shadow' => false,
            'showBorder' => true,
        ]);
        $footer = TemplateContent::footer($brand, [
            'tagline' => 'About us — Flypay helps people see every dollar, automate savings, and spend with a clear picture of what is left.',
            'columns' => [
                ['title' => 'Product', 'links' => "Home|/\nPrice|/pricing\nFeatures|/features\nBlog|/blog\nFeedback|/about"],
                ['title' => 'Help', 'links' => "FAQ|/pricing\nTeams|/about\nContact Us|/about"],
                ['title' => 'Get the app', 'links' => "App Store|#\nPlay Store|#"],
            ],
            'social' => [
                ['icon' => 'twitter', 'url' => '#'],
                ['icon' => 'instagram', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
            ],
            'legal' => [
                ['label' => 'Terms of Service', 'url' => '#'],
                ['label' => 'Privacy Policy', 'url' => '#'],
            ],
            'showNewsletter' => false,
            'columnCount' => 3,
            'tone' => 'default',
        ]);

        $phone = self::photo('1512941937669-90a1b58e7e9c', 900);
        $tracking = self::photo('1551288049-bebda4e38f71', 900);
        $autosave = self::photo('1563986768494-4dee2763ff3f', 900);
        $stats = self::photo('1611974782855-28182de80d36', 900);
        $budget = self::photo('1579621970563-ebec7560ff3e', 900);
        $cards = self::photo('1563013544-824ae1b704d3', 900);

        return [
            [
                'name' => 'Home',
                'slug' => 'home',
                'is_homepage' => true,
                'content_json' => TemplateContent::page([
                    TemplateContent::section('nav', 'navbar.cta', $nav),
                    TemplateContent::section('hero', 'hero.split', [
                        'eyebrow' => '',
                        'heading' => 'Manage Your Money With Confidence',
                        'description' => 'See balances, bills, and goals in one calm view. Flypay tracks spending as it happens and puts leftover cash to work without a spreadsheet.',
                        'buttonLabel' => 'App Store',
                        'buttonUrl' => '#',
                        'secondaryLabel' => 'Play Store',
                        'secondaryUrl' => '#',
                        'image' => $phone,
                        'imageAlt' => 'Flypay on a phone',
                        'imageRatio' => 'portrait',
                        'highlights' => [],
                        'headingSize' => 56,
                        'bodySize' => 18,
                        'headingWeight' => '700',
                        'animation' => 'fade-up',
                        'backgroundType' => 'gradient',
                        'gradientFrom' => '#f4f0ff',
                        'gradientTo' => '#ffffff',
                        'gradientAngle' => 165,
                        'lightText' => false,
                        'minHeight' => 620,
                    ]),
                    TemplateContent::section('proof', 'proof.bar', [
                        'heading' => 'Our brands also used by',
                        'paddingTop' => 20,
                        'paddingBottom' => 8,
                        'logos' => [
                            ['label' => 'Northwind'],
                            ['label' => 'Lumen'],
                            ['label' => 'Vertex'],
                            ['label' => 'Cobalt'],
                        ],
                        'items' => [
                            ['value' => '600K+', 'label' => 'Active daily users'],
                            ['value' => '4.8', 'label' => 'Rating on store'],
                        ],
                    ]),
                    TemplateContent::section('features', 'features.cards', [
                        'eyebrow' => '',
                        'heading' => 'Take full control of your financial life',
                        'description' => 'Four surfaces you actually open: live tracking, smart budgets, cards you can pause, and savings that run in the background.',
                        'textAlign' => 'center',
                        'columns' => 2,
                        'cardStyle' => 'solid',
                        'iconStyle' => 'tint',
                        'roundIcons' => true,
                        'headingSize' => 40,
                        'tone' => 'default',
                        'items' => [
                            [
                                'title' => 'Live tracking your money',
                                'text' => 'Every card, transfer, and subscription lands in one feed with merchant names you recognize.',
                                'icon' => 'chart',
                                'image' => $tracking,
                            ],
                            [
                                'title' => 'Smart budget & planning',
                                'text' => 'Set envelopes for rent, food, and fun. Flypay warns you before a category runs out.',
                                'icon' => 'calendar',
                                'image' => $budget,
                            ],
                            [
                                'title' => 'Virtual & physical cards',
                                'text' => 'Freeze a card from the lock screen. Issue a virtual number for one-off checkouts.',
                                'icon' => 'cpu',
                                'image' => $cards,
                            ],
                            [
                                'title' => 'Automatic savings',
                                'text' => 'Round-ups and payday rules move leftover cash into a goal before you can spend it.',
                                'icon' => 'heart',
                                'image' => $autosave,
                            ],
                        ],
                    ]),
                    TemplateContent::section('autosave', 'features.showcase', [
                        'eyebrow' => 'Autosave',
                        'heading' => 'Auto-save your cash',
                        'description' => 'Choose a rule once. Flypay skims a little on every payday and parks it where you told it to.',
                        'bullets' => "Round up spare change after each purchase\nSweep leftover budget on the 1st\nPause anytime without losing history",
                        'buttonLabel' => 'Learn more',
                        'buttonUrl' => '/features',
                        'image' => $autosave,
                        'imageAlt' => 'Autosave on Flypay',
                        'imageRatio' => 'portrait',
                        'reverse' => false,
                        'headingSize' => 40,
                    ]),
                    TemplateContent::section('stats-app', 'features.showcase', [
                        'eyebrow' => 'Insights',
                        'heading' => 'Spending statistics',
                        'description' => 'Week and month views that actually explain the spike — not a pie chart you have to decode.',
                        'bullets' => "Categories that match how you live\nMerchant search across years\nExport a clean CSV for tax time",
                        'buttonLabel' => 'Learn more',
                        'buttonUrl' => '/features',
                        'image' => $stats,
                        'imageAlt' => 'Spending charts in Flypay',
                        'imageRatio' => 'portrait',
                        'reverse' => true,
                        'headingSize' => 40,
                    ]),
                    TemplateContent::section('pricing', 'pricing.three_columns', [
                        'eyebrow' => '',
                        'heading' => 'Flexible pricing plan',
                        'description' => 'Start free. Upgrade when you want extra cards, shared wallets, or priority support.',
                        'textAlign' => 'center',
                        'tone' => 'surface',
                        'showBillingToggle' => true,
                        'monthlyLabel' => 'Monthly',
                        'yearlyLabel' => 'Annually',
                        'yearlyNote' => 'Two months on us when you pay yearly.',
                        'headingSize' => 40,
                        'plans' => [
                            [
                                'name' => 'Free',
                                'description' => 'One person, one picture of their money.',
                                'price' => '$0.00',
                                'priceYearly' => '$0',
                                'period' => '/mo',
                                'features' => "1 linked bank\nLive tracking\nOne savings goal\nEmail support",
                                'buttonLabel' => 'Get started',
                                'buttonUrl' => '/about',
                            ],
                            [
                                'name' => 'Professional',
                                'description' => 'Households that share bills and still want privacy.',
                                'price' => '$12.00',
                                'priceYearly' => '$10',
                                'period' => '/mo',
                                'features' => "Unlimited banks\nShared wallets\nVirtual cards\nPriority chat\nExport history",
                                'buttonLabel' => 'Get started',
                                'buttonUrl' => '/about',
                                'highlighted' => true,
                                'badge' => 'Popular',
                            ],
                            [
                                'name' => 'Premium',
                                'description' => 'Founders and teams who treat cash like a product.',
                                'price' => '$24.00',
                                'priceYearly' => '$20',
                                'period' => '/mo',
                                'features' => "Everything in Professional\nMulti-entity books\nRole permissions\nDedicated onboarding",
                                'buttonLabel' => 'Get started',
                                'buttonUrl' => '/about',
                            ],
                        ],
                    ]),
                    TemplateContent::section('reviews', 'testimonials.cards', [
                        'eyebrow' => '',
                        'heading' => 'User Reviews and Feedback',
                        'description' => 'People who stopped guessing at their balance.',
                        'textAlign' => 'center',
                        'columns' => 3,
                        'showRating' => true,
                        'tone' => 'default',
                        'headingSize' => 40,
                        'items' => [
                            ['text' => 'I finally know what is left after rent without opening five apps.', 'name' => 'Amelia Chen', 'role' => 'Product designer', 'rating' => 5, 'avatar' => self::photo('1494790108377-be9c29b29330', 200)],
                            ['text' => 'Autosave is boring in the best way. The emergency fund filled itself.', 'name' => 'Jonah Patel', 'role' => 'Engineer', 'rating' => 5, 'avatar' => self::photo('1500648767791-00dcc994a43e', 200)],
                            ['text' => 'Shared wallet with my partner. We stopped arguing about who paid Wi-Fi.', 'name' => 'Maya Ortiz', 'role' => 'Operations', 'rating' => 5, 'avatar' => self::photo('1438761681033-6461ffad8d80', 200)],
                            ['text' => 'The spend chart actually matches my week, not some generic “shopping” bucket.', 'name' => 'Chris Hale', 'role' => 'Studio owner', 'rating' => 5, 'avatar' => self::photo('1472099645785-5658abf4ff4e', 200)],
                            ['text' => 'Froze a card from the lock screen when I left my wallet at a cafe.', 'name' => 'Riley Gomez', 'role' => 'Photographer', 'rating' => 5, 'avatar' => self::photo('1544005313-94ddf0286df2', 200)],
                            ['text' => 'Setup took twelve minutes. I still get a Monday summary I actually read.', 'name' => 'Sam Okonkwo', 'role' => 'Consultant', 'rating' => 5, 'avatar' => self::photo('1507003211169-0a1dd7228f2d', 200)],
                        ],
                    ]),
                    TemplateContent::section('faq', 'faq.accordion', [
                        'eyebrow' => '',
                        'heading' => 'Frequently asked questions',
                        'description' => 'The things people ask before they connect a bank.',
                        'openFirst' => true,
                        'headingSize' => 40,
                        'items' => [
                            ['question' => 'How to get started?', 'answer' => 'Create a Flypay account, confirm your email, then connect a bank with read-only access. The first feed usually fills within a minute.'],
                            ['question' => 'How to withdraw money?', 'answer' => 'Savings sit in your linked account — Flypay does not hold balances. Turn off a rule, then move cash the same way you always have.'],
                            ['question' => 'Is my bank data safe?', 'answer' => 'Connections use bank-grade aggregation. We never store your bank password, and you can disconnect a feed from Settings in one tap.'],
                            ['question' => 'Can I share with family?', 'answer' => 'Professional and Premium include shared wallets. Each person still has a private feed for their own cards.'],
                            ['question' => 'Does it work outside the US?', 'answer' => 'Yes in the UK, EU, and Canada. Currency stays in the account’s native unit — we do not convert unless you ask.'],
                        ],
                    ]),
                    TemplateContent::section('cta', 'cta.simple', [
                        'heading' => 'Start managing your money the smart way',
                        'description' => 'Download Flypay, connect a bank, and see this week’s picture before payday.',
                        'buttonLabel' => 'App Store',
                        'buttonUrl' => '#',
                        'secondaryLabel' => 'Play Store',
                        'secondaryUrl' => '#',
                        'boxed' => false,
                        'textAlign' => 'center',
                        'tone' => 'surface',
                        'backgroundType' => 'color',
                        'backgroundColor' => '#ede9fe',
                        'headingSize' => 40,
                        'paddingTop' => 72,
                        'paddingBottom' => 72,
                    ]),
                    TemplateContent::section('footer', 'footer.multi_column', $footer),
                ]),
            ],
            [
                'name' => 'Features',
                'slug' => 'features',
                'is_homepage' => false,
                'content_json' => TemplateContent::page([
                    TemplateContent::section('nav', 'navbar.cta', $nav),
                    TemplateContent::section('hero', 'hero.centered', [
                        'eyebrow' => 'Product',
                        'heading' => 'Every dollar, one calm picture',
                        'description' => 'Tracking, budgets, cards, and savings — built as separate rooms that share the same numbers.',
                        'buttonLabel' => 'Get Started',
                        'buttonUrl' => '/pricing',
                        'secondaryLabel' => 'See pricing',
                        'secondaryUrl' => '/pricing',
                        'showTrust' => false,
                        'headingSize' => 48,
                        'backgroundType' => 'gradient',
                        'gradientFrom' => '#f4f0ff',
                        'gradientTo' => '#ffffff',
                        'lightText' => false,
                    ]),
                    TemplateContent::section('steps', 'process.steps', [
                        'eyebrow' => 'Setup',
                        'heading' => 'Live in twelve minutes',
                        'description' => 'No branch visit. No waiting on a plastic card.',
                        'textAlign' => 'center',
                        'columns' => 3,
                        'items' => [
                            ['title' => 'Create an account', 'text' => 'Email, a passcode, and the country your bank lives in.'],
                            ['title' => 'Connect a feed', 'text' => 'Read-only access. We never store the bank password.'],
                            ['title' => 'Set one rule', 'text' => 'A round-up or a payday sweep. Change it whenever you want.'],
                        ],
                    ]),
                    TemplateContent::section('track', 'features.showcase', [
                        'heading' => 'Live tracking',
                        'description' => 'Merchant names, pending holds, and subscriptions in a single timeline.',
                        'bullets' => "Search any merchant\nPending vs posted, clearly marked\nHide a transfer so it does not double-count",
                        'buttonLabel' => 'Get Started',
                        'buttonUrl' => '/pricing',
                        'image' => $tracking,
                        'imageRatio' => 'wide',
                    ]),
                    TemplateContent::section('footer', 'footer.multi_column', $footer),
                ]),
            ],
            [
                'name' => 'Pricing',
                'slug' => 'pricing',
                'is_homepage' => false,
                'content_json' => TemplateContent::page([
                    TemplateContent::section('nav', 'navbar.cta', $nav),
                    TemplateContent::section('hero', 'hero.centered', [
                        'eyebrow' => 'Plans',
                        'heading' => 'Flexible pricing plan',
                        'description' => 'Monthly or annually. Cancel from settings — no call required.',
                        'showTrust' => false,
                        'buttonLabel' => 'Start free',
                        'buttonUrl' => '/about',
                        'headingSize' => 48,
                    ]),
                    TemplateContent::section('plans', 'pricing.three_columns', [
                        'heading' => 'Pick a plan',
                        'description' => 'Every plan includes live tracking. Paid plans add wallets and cards.',
                        'showBillingToggle' => true,
                        'monthlyLabel' => 'Monthly',
                        'yearlyLabel' => 'Annually',
                        'tone' => 'surface',
                        'plans' => [
                            [
                                'name' => 'Free',
                                'price' => '$0.00',
                                'priceYearly' => '$0',
                                'period' => '/mo',
                                'features' => "1 linked bank\nLive tracking\nOne savings goal",
                                'buttonLabel' => 'Get started',
                                'buttonUrl' => '/about',
                            ],
                            [
                                'name' => 'Professional',
                                'price' => '$12.00',
                                'priceYearly' => '$10',
                                'period' => '/mo',
                                'features' => "Unlimited banks\nShared wallets\nVirtual cards\nPriority chat",
                                'buttonLabel' => 'Get started',
                                'buttonUrl' => '/about',
                                'highlighted' => true,
                                'badge' => 'Popular',
                            ],
                            [
                                'name' => 'Premium',
                                'price' => '$24.00',
                                'priceYearly' => '$20',
                                'period' => '/mo',
                                'features' => "Everything in Professional\nMulti-entity\nDedicated onboarding",
                                'buttonLabel' => 'Talk to us',
                                'buttonUrl' => '/about',
                            ],
                        ],
                    ]),
                    TemplateContent::section('faq', 'faq.accordion', [
                        'heading' => 'Billing questions',
                        'items' => [
                            ['question' => 'Can I switch plans later?', 'answer' => 'Yes. Upgrades are prorated. Downgrades take effect at the next renewal.'],
                            ['question' => 'Do you store card details?', 'answer' => 'Payments go through our processor. Flypay never sees the full card number.'],
                        ],
                    ]),
                    TemplateContent::section('footer', 'footer.multi_column', $footer),
                ]),
            ],
            [
                'name' => 'About',
                'slug' => 'about',
                'is_homepage' => false,
                'content_json' => TemplateContent::page([
                    TemplateContent::section('nav', 'navbar.cta', $nav),
                    TemplateContent::section('story', 'content.image_text', [
                        'eyebrow' => 'About Flypay',
                        'heading' => 'Built for people who are tired of guessing',
                        'body' => 'We started Flypay because our own money lived in too many apps. The first version was a shared spreadsheet. This is the grown-up version of that sheet: live, private, and honest about what is left.',
                        'bullets' => "Independent — not a bank in costume\nRead-only bank connections\nHumans on support, not a ticket maze",
                        'image' => $phone,
                        'headingSize' => 40,
                    ]),
                    TemplateContent::section('team', 'team.cards', [
                        'eyebrow' => 'Team',
                        'heading' => 'The people behind the ledger',
                        'description' => 'A small crew. Everyone still reads support on Fridays.',
                        'textAlign' => 'center',
                        'columns' => 4,
                    ]),
                    TemplateContent::section('form', 'form.contact', [
                        'eyebrow' => 'Support',
                        'heading' => 'Talk to a human',
                        'description' => 'Accounts, billing, or a bank that will not connect — we reply within one business day.',
                        'buttonLabel' => 'Send message',
                        'layout' => 'split',
                        'cardStyle' => true,
                        'tone' => 'surface',
                        'details' => [
                            ['icon' => 'mail', 'label' => 'Email', 'value' => 'hello@flypay.app', 'url' => 'mailto:hello@flypay.app'],
                            ['icon' => 'phone', 'label' => 'Phone', 'value' => '+1 (555) 014 8800', 'url' => 'tel:+15550148800'],
                            ['icon' => 'map-pin', 'label' => 'Studio', 'value' => '14 Ledger Lane, Suite 2'],
                        ],
                        'bullets' => "No sales sequences\nWe never ask for a bank password\nNDAs on request",
                    ]),
                    TemplateContent::section('footer', 'footer.multi_column', $footer),
                ]),
            ],
            [
                'name' => 'Blog',
                'slug' => 'blog',
                'is_homepage' => false,
                'content_json' => TemplateContent::page([
                    TemplateContent::section('nav', 'navbar.cta', $nav),
                    TemplateContent::section('posts', 'posts.cards', [
                        'eyebrow' => 'Journal',
                        'heading' => 'Notes on spending less badly',
                        'description' => 'Short pieces on budgets, banks, and the habits that actually stick.',
                        'buttonLabel' => '',
                        'items' => [
                            ['title' => 'Why we hide pending charges', 'excerpt' => 'A hold is not a purchase. Mixing them is how people overdraft on purpose.', 'date' => '12 Aug 2026', 'tag' => 'Product', 'image' => $tracking],
                            ['title' => 'Autosave without the guilt', 'excerpt' => 'A 3% payday sweep beats a resolution you forget in February.', 'date' => '28 Jul 2026', 'tag' => 'Habits', 'image' => $autosave],
                            ['title' => 'Shared wallets, separate dignity', 'excerpt' => 'How couples use Flypay without turning money into a scoreboard.', 'date' => '4 Jul 2026', 'tag' => 'Households', 'image' => $budget],
                        ],
                    ]),
                    TemplateContent::section('footer', 'footer.multi_column', $footer),
                ]),
            ],
        ];
    }
}
