<?php

namespace Database\Seeders;

class TemplateMoksha
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#5437FF',
            'secondary' => '#111827',
            'accent' => '#8B7BFF',
            'background' => '#FFFFFF',
            'surface' => '#F8FAFC',
            'text' => '#111827',
            'muted' => '#64748B',
            'headingFont' => 'Inter, system-ui, sans-serif',
            'bodyFont' => 'Inter, system-ui, sans-serif',
            'headingWeight' => 600,
            'bodyWeight' => 400,
            'buttonRadius' => '999px',
            'cardRadius' => '12px',
            'containerWidth' => '1180px',
            'sectionSpacing' => '108px',
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
        $brand = 'Nivara';
        $nav = array_merge([
            'logo' => $brand,
            'logoIcon' => 'm',
            'logoUrl' => '/',
            'sticky' => true,
            'buttonLabel' => 'Start free trial',
            'buttonUrl' => '/contact',
            'links' => [
                ['label' => 'Home', 'url' => '/'],
                ['label' => 'About', 'url' => '#about'],
                ['label' => 'Classes', 'url' => '#classes'],
                ['label' => 'Benefits', 'url' => '#benefits'],
            ],
        ], self::motion(0, 'load'));

        $footer = [
            'logo' => $brand,
            'logoIcon' => 'm',
            'logoUrl' => '/',
            'tagline' => 'PrebuiltUI provides high-quality, customizable UI components and templates to help teams build faster and ship better products.',
            'copyright' => '© '.date('Y').' PrebuiltUI. All Right Reserved.',
            'columns' => [
                ['title' => 'Products', 'links' => "Templates|#\nComponents|#\nIcons|#\nUI Kits|#"],
                ['title' => 'Company', 'links' => "About Us|#\nCareers|#\nBlog|#\nContact|#"],
                ['title' => 'Resources', 'links' => "Documentation|#\nChangelog|#\nSupport|#\nAPI Reference|#"],
            ],
            'legal' => [
                ['label' => 'Privacy Policy', 'url' => '#'],
                ['label' => 'Terms of Service', 'url' => '#'],
                ['label' => 'About Us', 'url' => '#'],
                ['label' => 'Team', 'url' => '#'],
            ],
            'social' => [
                ['icon' => 'twitter', 'url' => '#'],
                ['icon' => 'linkedin', 'url' => '#'],
                ['icon' => 'youtube', 'url' => '#'],
                ['icon' => 'instagram', 'url' => '#'],
            ],
        ];

        $hero = array_merge(self::motion(0, 'load'), [
            'heading' => 'Transform your body and mind through yoga',
            'description' => 'Join a community of mindful movers. In-studio and online yoga classes for all levels, designed to reconnect your body and breath.',
            'buttonLabel' => 'Book a Class',
            'buttonUrl' => '/pricing',
            'image' => 'https://images.squarespace-cdn.com/content/v1/5ff4ecb14a7dfd4e6e8c2926/1627067207628-RV1N3Q0393HPZ208WNZJ/sabi-pathways-yoga-pose-virabhadrasana-2',
            'minHeight' => 994,
            'headingSize' => 58,
            'bodySize' => 16,
        ]);

        $about = array_merge(self::motion(80), [
            'eyebrow' => 'Welcome to Nivara',
            'heading' => 'About Nivara',
            'subheading' => 'Build Strength, Improve Balance & Calm Your Mind',
            'description' => 'Experience mindful movement, guided sessions and a supportive space to strengthen your body and calm your mind.',
            'buttonLabel' => 'More About Us',
            'buttonUrl' => '/classes',
            'image' => 'https://images.unsplash.com/photo-1713201509882-e514071fec1a?auto=format&fit=crop&w=1100&q=85',
            'stats' => [
                ['icon' => 'calendar', 'value' => '25+', 'label' => 'Courses'],
                ['icon' => 'users', 'value' => '30+', 'label' => 'Trainers'],
                ['icon' => 'star', 'value' => '500+', 'label' => 'Events'],
            ],
        ]);

        $features = array_merge(self::motion(80), [
            'eyebrow' => 'Explore Classes',
            'heading' => 'Yoga Designed for You',
            'buttonLabel' => 'Explore All Classes',
            'buttonUrl' => '/classes',
            'image' => 'https://cdn.prod.website-files.com/5f8efb5ada9510581ae5242b/65815cec1505805ec583ba42_pexels-vlada-karpovich-4534604.jpg',
            'items' => [
                ['title' => 'Relaxing Flow', 'text' => 'Slow, gentle movements to release tension and calm your mind.'],
                ['title' => 'Guided Meditation', 'text' => 'Mindful breathing and focus techniques to reduce stress and improve clarity.'],
                ['title' => 'Strength Flow', 'text' => 'Build strength, stability, and endurance through dynamic sequences.'],
                ['title' => 'Balance & Flexibility', 'text' => 'Improve posture, coordination, and flexibility with controlled movements.'],
                ['title' => 'Power Vinyasa', 'text' => 'Improve posture, coordination, and flexibility with controlled movements.'],
            ],
        ]);

        $benefits = array_merge(self::motion(80), [
            'eyebrow' => "What You'll Gain",
            'heading' => 'Benefits of Yoga',
            'description' => 'Improve your body, calm your mind and build a healthier lifestyle with consistent yoga practice.',
            'items' => [
                ['icon' => 'heart', 'title' => 'Better Heart Health', 'text' => 'Support cardiovascular health and improve blood circulation naturally.'],
                ['icon' => 'chart', 'title' => 'Flexibility & mobility', 'text' => 'Increase your range of motion and move with greater ease every day.'],
                ['icon' => 'target', 'title' => 'Mental Clarity', 'text' => 'Enhance focus, reduce stress, and bring calmness to your mind.'],
                ['icon' => 'zap', 'title' => 'Boost Energy', 'text' => 'Feel more energized and refreshed with regular yoga sessions.'],
                ['icon' => 'shield', 'title' => 'Stronger Immunity', 'text' => "Strengthen your body's natural defense system and overall wellness."],
                ['icon' => 'sun', 'title' => 'Emotional Balance', 'text' => 'Improve mood and achieve a sense of inner peace and stability.'],
            ],
        ]);

        $story = array_merge(self::motion(80), [
            'eyebrow' => 'About Instructor',
            'heading' => "Hi, I’m Elena, Your Coach",
            'description' => 'Helping you build strength, find balance, and reconnect with your mind through guided yoga practices.',
            'image' => 'https://images.pexels.com/photos/6958391/pexels-photo-6958391.jpeg?auto=compress&cs=tinysrgb&w=1400',
            'items' => [
                ['icon' => 'award', 'title' => 'Certified Yoga Instructor', 'text' => '500+ hours Yoga Alliance certified'],
                ['icon' => 'sparkles', 'title' => 'Holistic Approach', 'text' => 'Blending breath, movement and mindfulness'],
                ['icon' => 'globe', 'title' => 'Global Experience', 'text' => 'Trained and practiced across India and Europe.'],
            ],
        ]);

        $quotes = [
            ['name' => 'Richard Nelson', 'role' => 'Los Angeles', 'text' => '“Super clean and easy to use. These Tailwind + React components saved me hours of dev time and countless lines of extra code!”', 'image' => TemplateContent::photo('1500648767791-00dcc994a43e', 200), 'rating' => 5],
            ['name' => 'Sophia Martinez', 'role' => 'Los Angeles', 'text' => '“The design quality is top-notch. Perfect balance between simplicity and style. Highly recommend for any creative developer!”', 'image' => TemplateContent::photo('1494790108377-be9c29b29330', 200), 'rating' => 5],
            ['name' => 'Ethan Roberts', 'role' => 'Calgary', 'text' => '“Absolutely love the reusability of these components. My workflow feels 10x faster now with cleaner and more consistent layouts.”', 'image' => TemplateContent::photo('1506794778202-cad84cf45f1d', 200), 'rating' => 5],
            ['name' => 'Isabella Kim', 'role' => 'Toronto', 'text' => '“Clean, elegant and efficient. These components are a dream for any modern web developer who values beautiful code.”', 'image' => TemplateContent::photo('1544005313-94ddf0286df2', 200), 'rating' => 5],
            ['name' => 'Liam Johnson', 'role' => 'Calgary', 'text' => '“I’ve tried dozens of UI kits, but this one just feels right. Everything works seamlessly and looks incredibly polished.”', 'image' => TemplateContent::photo('1507003211169-0a1dd7228f2d', 200), 'rating' => 5],
            ['name' => 'Ava Patel', 'role' => 'Toronto', 'text' => '“Brilliantly structured components with clean, modern styling. Makes development a joy and design updates super quick.”', 'image' => TemplateContent::photo('1438761681033-6461ffad8d80', 200), 'rating' => 5],
        ];

        $pricing = array_merge(self::motion(80), [
            'eyebrow' => 'Membership Plans',
            'heading' => 'Choose Your Yoga Journey',
            'description' => 'Flexible plans designed to support your wellness journey at every stage.',
            'plans' => [
                [
                    'name' => 'Beginner Flow',
                    'price' => '$9',
                    'period' => '/month',
                    'tagline' => 'Perfect for starting your yoga journey',
                    'features' => "5 guided classes per week\nAccess to basics library\nCommunity forum access\nMonthly progress check-in\nEmail support only",
                    'buttonLabel' => 'Get Started',
                    'buttonUrl' => '/contact',
                ],
                [
                    'name' => 'Balanced Practice',
                    'price' => '$29',
                    'period' => '/month',
                    'tagline' => 'Build consistency and improve steadily',
                    'features' => "10 guided classes per week\nFull library access\nPose analysis tool\nMonthly coaching call\nPriority support",
                    'buttonLabel' => 'Upgrade Now',
                    'buttonUrl' => '/contact',
                    'highlighted' => true,
                    'badge' => 'Most Popular',
                ],
                [
                    'name' => 'Full Experience',
                    'price' => '$49',
                    'period' => '/month',
                    'tagline' => 'For deep practice and transformation',
                    'features' => "Unlimited classes\nPersonalized programs\nOne-on-one sessions\nPrivate community\n24/7 priority support",
                    'buttonLabel' => 'Contact Sales',
                    'buttonUrl' => '/contact',
                ],
            ],
        ]);

        $faq = array_merge(self::motion(80), [
            'eyebrow' => 'FAQs',
            'heading' => 'Frequently asked questions',
            'description' => 'Improve your body, calm your mind and build a healthier lifestyle with consistent yoga practice.',
            'openFirst' => false,
            'items' => [
                ['question' => 'What is included in the Starter plan?', 'answer' => 'Five guided classes each week, access to the basics library, and community support.'],
                ['question' => 'Do you offer a free trial?', 'answer' => 'Yes. New members can try their first guided class free.'],
                ['question' => 'Can I switch plans later?', 'answer' => 'Yes, you can upgrade or change your plan at any time.'],
                ['question' => 'What payment methods do you accept?', 'answer' => 'We accept all major cards and supported digital wallets.'],
                ['question' => 'How secure is my data?', 'answer' => 'Your account and payment details are protected using modern security standards.'],
                ['question' => 'How does the 2% donation work?', 'answer' => 'Two percent of eligible membership revenue supports community wellness programs.'],
                ['question' => 'Can I integrate this platform with other tools?', 'answer' => 'Yes, supported integrations can connect your favorite planning and wellness tools.'],
                ['question' => 'What makes your platform different?', 'answer' => 'Thoughtful instruction, flexible access, and a supportive community in one place.'],
            ],
        ]);

        $cta = array_merge(self::motion(80), [
            'eyebrow' => 'Ready to Start?',
            'heading' => 'Start Your Yoga Today',
            'description' => 'Take the first step toward balance, strength and inner peace with Nivara.',
            'buttonLabel' => 'Explore Memberships →',
            'buttonUrl' => '/contact',
        ]);

        return [
            TemplateContent::sitePage('Home', 'home', true, $nav, [
                TemplateContent::section('hero', 'hero.moksha', $hero),
                TemplateContent::section('about', 'about.moksha', $about),
                TemplateContent::section('features', 'features.moksha', $features),
                TemplateContent::section('benefits', 'benefits.moksha', $benefits),
                TemplateContent::section('story', 'story.moksha', $story),
                TemplateContent::section('quotes', 'testimonials.moksha', array_merge(self::motion(80), [
                    'eyebrow' => 'Loved by community',
                    'heading' => 'What Our Members Say',
                    'items' => $quotes,
                ])),
                TemplateContent::section('pricing', 'pricing.moksha', $pricing),
                TemplateContent::section('faq', 'faq.moksha', $faq),
                TemplateContent::section('cta', 'cta.moksha', $cta),
            ], $footer, 'footer.moksha', 'navbar.moksha'),

            TemplateContent::sitePage('Classes', 'classes', false, $nav, [
                TemplateContent::section('lead', 'hero.moksha', array_merge(self::motion(0, 'load'), [
                    'heading' => 'Classes for every rhythm and every body.',
                    'description' => 'Power mornings, lunch resets, and evening restore — all on the same schedule board.',
                    'buttonLabel' => 'View pricing',
                    'buttonUrl' => '/pricing',
                    'image' => TemplateContent::photo('1544367567-0f2fcb009e0b', 1600),
                ])),
                TemplateContent::section('features', 'features.moksha', $features),
                TemplateContent::section('benefits', 'benefits.moksha', $benefits),
                TemplateContent::section('story', 'story.moksha', $story),
            ], $footer, 'footer.moksha', 'navbar.moksha'),

            TemplateContent::sitePage('Pricing', 'pricing', false, $nav, [
                TemplateContent::section('pricing', 'pricing.moksha', $pricing),
                TemplateContent::section('faq', 'faq.moksha', $faq),
                TemplateContent::section('cta', 'cta.moksha', $cta),
            ], $footer, 'footer.moksha', 'navbar.moksha'),

            TemplateContent::sitePage('Gallery', 'gallery', false, $nav, [
                TemplateContent::section('gallery', 'gallery.grid', array_merge(self::motion(0), [
                    'eyebrow' => 'Gallery',
                    'heading' => 'Inside the studio',
                    'description' => 'Bright rooms, quiet corners, and the same calm light at every hour.',
                    'columns' => 3,
                    'images' => [
                        ['src' => TemplateContent::photo('1544367567-0f2fcb009e0b'), 'caption' => 'Main room'],
                        ['src' => TemplateContent::photo('1506126613408-eca07ce68773'), 'caption' => 'Morning flow'],
                        ['src' => TemplateContent::photo('1518611012118-696072aa579a'), 'caption' => 'Restore corner'],
                        ['src' => TemplateContent::photo('1545205597-3d016d3a0f3e'), 'caption' => 'Window light'],
                        ['src' => TemplateContent::photo('1599900755262-7d0b8f7e2e5f'), 'caption' => 'Props wall'],
                        ['src' => TemplateContent::photo('1575052814086-f385e2e2ad08'), 'caption' => 'Lounge'],
                    ],
                ])),
            ], $footer, 'footer.moksha', 'navbar.moksha'),

            TemplateContent::sitePage('Contact', 'contact', false, $nav, [
                TemplateContent::section('form', 'form.contact', array_merge(self::motion(0), [
                    'eyebrow' => 'Contact',
                    'heading' => 'Book your first class',
                    'description' => 'Tell us what you are looking for. We reply with class times and a welcome note.',
                    'buttonLabel' => 'Send message',
                    'layout' => 'split',
                    'details' => [
                        ['icon' => 'map-pin', 'label' => 'Studio', 'value' => '124 Linden Ave'],
                        ['icon' => 'mail', 'label' => 'Email', 'value' => 'hello@moksha.example'],
                        ['icon' => 'clock', 'label' => 'Hours', 'value' => 'Mon–Sat 6:00 – 21:00'],
                    ],
                ])),
            ], $footer, 'footer.moksha', 'navbar.moksha'),
        ];
    }
}
