<?php

namespace Database\Seeders;

class TemplateCinderRow
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#ff5a1f',
            'secondary' => '#050505',
            'accent' => '#ff5a1f',
            'background' => '#ffffff',
            'surface' => '#faf9f7',
            'text' => '#080808',
            'muted' => '#686868',
            'headingFont' => 'DM Serif Display, Georgia, serif',
            'bodyFont' => 'Inter, Arial, sans-serif',
            'headingWeight' => 500,
            'bodyWeight' => 400,
            'buttonRadius' => '999px',
            'cardRadius' => '18px',
            'containerWidth' => '1800px',
            'sectionSpacing' => '130px',
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $nav = [
            'brand' => 'Cinder & Row',
            'locality' => 'NORTH · LONDON',
            'logoLetter' => 'C',
            'status' => 'OPEN TODAY',
            'phone' => '020 7946 0182',
            'buttonLabel' => 'Call now',
            'buttonUrl' => 'tel:+442079460182',
            'sticky' => true,
            'links' => [
                ['label' => 'Story', 'url' => '/story'],
                ['label' => 'Services', 'url' => '/services'],
                ['label' => 'Journal', 'url' => '/journal'],
                ['label' => 'Contact', 'url' => '/contact'],
            ],
        ];

        $footer = [
            'brand' => 'Cinder & Row',
            'heading' => 'Keeping North London warm since 2017.',
            'description' => 'Independent heating engineers. Clear quotes, careful work and friendly follow-through.',
            'copyright' => '© 2026 Cinder & Row · Gas Safe registered · Fully insured',
            'emergency' => 'Smell gas? Call the National Gas Emergency Service: 0800 111 999',
            'links' => $nav['links'],
        ];

        $cta = [
            'eyebrow' => 'NEED HEAT? NO DRAMA.',
            'heading' => 'Give us a ring.',
            'accent' => 'We’ll get you warm.',
            'description' => 'Call, message or email—whichever is easiest. Same-day slots when we can.',
            'actions' => [
                ['icon' => 'phone', 'label' => 'Call 020 7946 0182', 'url' => 'tel:+442079460182'],
                ['icon' => 'message-circle', 'label' => 'WhatsApp us', 'url' => '#'],
                ['icon' => 'mail', 'label' => 'Send a message', 'url' => '/contact'],
            ],
        ];

        return [
            TemplateContent::sitePage('Home', 'home', true, $nav, [
                TemplateContent::section('hero', 'hero.cinder', [
                    'eyebrow' => 'LIVE FROM NORTH LONDON · GAS SAFE REGISTERED',
                    'heading' => 'Warm homes,',
                    'accent' => 'straight answers.',
                    'description' => 'We’re Cinder & Row—local heating engineers for repairs, servicing and safety checks across North London.',
                    'image' => 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=2400&q=88',
                    'imageAlt' => 'North London street at golden hour',
                    'buttonLabel' => 'Call 020 7946 0182',
                    'buttonUrl' => 'tel:+442079460182',
                    'secondaryLabel' => 'Message us',
                    'secondaryUrl' => '/contact',
                    'badges' => [['label' => 'GAS SAFE REGISTERED'], ['label' => 'SAME-DAY SLOTS'], ['label' => '4.9 CUSTOMER RATING'], ['label' => 'LOCAL SINCE 2017']],
                ]),
                TemplateContent::section('services', 'services.cinder_bento', []),
                TemplateContent::section('story', 'content.cinder_split', []),
                TemplateContent::section('coverage', 'content.cinder_coverage', []),
                TemplateContent::section('reviews', 'testimonials.cinder', []),
                TemplateContent::section('gallery', 'gallery.cinder', []),
                TemplateContent::section('cta', 'cta.cinder', $cta),
            ], $footer, 'footer.cinder', 'navbar.cinder'),

            TemplateContent::sitePage('Story', 'story', false, $nav, [
                TemplateContent::section('intro', 'content.cinder_intro', [
                    'eyebrow' => 'OUR STORY · INDEPENDENT SINCE 2017',
                    'heading' => 'Built on local work,',
                    'accent' => 'not big promises.',
                    'description' => 'Cinder & Row started with one engineer, one van and a promise to explain every job clearly.',
                ]),
                TemplateContent::section('portrait', 'content.cinder_split', [
                    'eyebrow' => 'MEET THE TEAM',
                    'heading' => 'Tradespeople first.',
                    'accent' => 'Neighbours too.',
                    'description' => 'We trained in busy commercial buildings, but chose local residential work because trust matters more when you are in someone’s home.',
                    'buttonLabel' => 'See our services',
                    'buttonUrl' => '/services',
                    'images' => [
                        ['image' => 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=85', 'alt' => 'Cinder and Row engineer'],
                        ['image' => 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=85', 'alt' => 'Engineer working'],
                        ['image' => 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=85', 'alt' => 'London neighbourhood'],
                    ],
                ]),
                TemplateContent::section('timeline', 'content.cinder_timeline', []),
                TemplateContent::section('ticker', 'content.cinder_ticker', ['items' => [['label' => 'TRAINED PROPERLY'], ['label' => 'WORKED LOCALLY'], ['label' => 'BUILT ON REFERRALS'], ['label' => 'STILL INDEPENDENT']]]),
                TemplateContent::section('values', 'features.cinder_values', []),
                TemplateContent::section('gallery', 'gallery.cinder', ['eyebrow' => 'TOOLS & STREETS', 'heading' => 'What the work', 'accent' => 'really looks like.']),
                TemplateContent::section('cta', 'cta.cinder', $cta),
            ], $footer, 'footer.cinder', 'navbar.cinder'),

            TemplateContent::sitePage('Services', 'services', false, $nav, [
                TemplateContent::section('intro', 'content.cinder_intro', [
                    'eyebrow' => 'SERVICES · NORTH LONDON',
                    'heading' => 'Heating work,',
                    'accent' => 'priced clearly.',
                    'description' => 'Straight starting prices and plain-English scopes. If a job is larger, you hear about it before we begin.',
                ]),
                TemplateContent::section('list', 'services.cinder_list', []),
                TemplateContent::section('ticker', 'content.cinder_ticker', ['dark' => false, 'items' => [['label' => 'WORCESTER TRAINED'], ['label' => 'VAILLANT EXPERIENCED'], ['label' => 'IDEAL SERVICED'], ['label' => 'BAXI REPAIRED']]]),
                TemplateContent::section('pricing', 'pricing.cinder', []),
                TemplateContent::section('process', 'process.cinder', []),
                TemplateContent::section('cta', 'cta.cinder', $cta),
            ], $footer, 'footer.cinder', 'navbar.cinder'),

            TemplateContent::sitePage('Journal', 'journal', false, $nav, [
                TemplateContent::section('intro', 'content.cinder_intro', [
                    'eyebrow' => 'FIELD NOTES · PRACTICAL ADVICE',
                    'heading' => 'Heating tips &',
                    'accent' => 'local stories.',
                    'description' => 'Short notes about boilers, winter prep and the odd thing we notice between jobs.',
                ]),
                TemplateContent::section('posts', 'blog.cinder', ['eyebrow' => 'FEATURED & LATEST', 'heading' => 'Useful reads,', 'accent' => 'zero filler.', 'featured' => true]),
                TemplateContent::section('ticker', 'content.cinder_ticker', ['items' => [['label' => 'BOILER TIPS'], ['label' => 'WINTER PREP'], ['label' => 'LANDLORD NOTES'], ['label' => 'LOCAL STORIES']]]),
                TemplateContent::section('more-posts', 'blog.cinder', ['eyebrow' => 'MORE FROM THE ROAD', 'heading' => 'Latest from', 'accent' => 'the van.', 'featured' => false]),
                TemplateContent::section('gallery', 'gallery.cinder', ['eyebrow' => 'BEHIND THE SCENES', 'heading' => 'Work, streets,', 'accent' => 'coffee stops.']),
                TemplateContent::section('cta', 'cta.cinder', $cta),
            ], $footer, 'footer.cinder', 'navbar.cinder'),

            TemplateContent::sitePage('Contact', 'contact', false, $nav, [
                TemplateContent::section('intro', 'content.cinder_intro', [
                    'eyebrow' => 'CONTACT · NORTH LONDON',
                    'heading' => 'Let’s get your home',
                    'accent' => 'comfortable again.',
                    'description' => 'Call, message or use the form. We usually answer within the hour on weekdays.',
                ]),
                TemplateContent::section('contact', 'form.cinder', []),
                TemplateContent::section('ticker', 'content.cinder_ticker', ['items' => [['label' => 'BOILER BROKEN?'], ['label' => 'CALL US'], ['label' => 'TEXT US'], ['label' => 'SAME-DAY SLOTS']]]),
                TemplateContent::section('coverage', 'content.cinder_coverage', ['eyebrow' => 'WHERE WE WORK', 'heading' => 'Based in N1.', 'accent' => 'Across North London.']),
                TemplateContent::section('cta', 'cta.cinder', $cta),
            ], $footer, 'footer.cinder', 'navbar.cinder'),
        ];
    }
}
