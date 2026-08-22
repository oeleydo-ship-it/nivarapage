<?php

namespace Database\Seeders;

class TemplateRealty
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#166534',
            'secondary' => '#14532d',
            'accent' => '#ca8a04',
            'background' => '#f7faf7',
            'surface' => '#ecf4ed',
            'text' => '#14532d',
            'muted' => '#4d7c5a',
            'headingFont' => 'Fraunces, Georgia, serif',
            'bodyFont' => 'Manrope, system-ui, sans-serif',
            'headingWeight' => 600,
            'bodyWeight' => 400,
            'buttonRadius' => '8px',
            'cardRadius' => '14px',
            'containerWidth' => '1140px',
            'sectionSpacing' => '88px',
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $brand = 'Haven';
        $nav = TemplateContent::nav($brand, [
            ['label' => 'Listings', 'url' => '/listings'],
            ['label' => 'Neighborhoods', 'url' => '/neighborhoods'],
            ['label' => 'Team', 'url' => '/about'],
            ['label' => 'Contact', 'url' => '/contact'],
        ], [
            'logoIcon' => 'home',
            'showButton' => true,
            'buttonLabel' => 'Book a showing',
            'buttonUrl' => '/contact',
        ]);
        $footer = TemplateContent::footer($brand, [
            'tagline' => 'Houses you can live in — not just flip.',
            'columns' => [
                ['title' => 'Browse', 'links' => "Listings|/listings\nNeighborhoods|/neighborhoods\nTeam|/about\nContact|/contact"],
                ['title' => 'Office', 'links' => "Open houses Sat–Sun 12–3\n(555) 016 4400"],
            ],
            'social' => [
                ['icon' => 'instagram', 'url' => '#'],
                ['icon' => 'facebook', 'url' => '#'],
            ],
            'tone' => 'dark',
        ]);

        $hero = TemplateContent::photo('1600585154340-be6161a56a0c');
        $living = TemplateContent::photo('1600607687939-ce8a6c25118c');
        $luxury = TemplateContent::photo('1564013799919-ab600027ffc6');
        $kitchen = TemplateContent::photo('1600210492486-724fe5c67fb0');
        $keys = TemplateContent::photo('1560518883-ce00cbd049a4');
        $amelia = TemplateContent::photo('1494790108377-be9c29b29330', 600);
        $jonah = TemplateContent::photo('1507003211169-0a1dd7228f2d', 600);
        $maya = TemplateContent::photo('1438761681033-6461ffad8d80', 600);

        return [
            TemplateContent::sitePage('Home', 'home', true, $nav, [
                TemplateContent::section('hero', 'hero.split', [
                    'eyebrow' => 'Independent brokerage',
                    'heading' => 'Find a house that still feels like a home',
                    'description' => 'Haven represents buyers and sellers who care about light, lot, and the school walk — not a 24-hour listing flip.',
                    'buttonLabel' => 'Browse listings',
                    'buttonUrl' => '/listings',
                    'secondaryLabel' => 'Book a showing',
                    'secondaryUrl' => '/contact',
                    'image' => $hero,
                    'imageAlt' => 'Craftsman exterior',
                    'headingSize' => 52,
                    'highlights' => [
                        ['label' => 'Buyer & seller'],
                        ['label' => 'Eastside specialists'],
                        ['label' => 'Open houses weekly'],
                    ],
                ]),
                TemplateContent::section('stats', 'stats.row', [
                    'columns' => 3,
                    'items' => [
                        ['value' => '214', 'label' => 'Homes closed last year'],
                        ['value' => '98%', 'label' => 'Listings at or above ask'],
                        ['value' => '11 days', 'label' => 'Median days on market'],
                    ],
                ]),
                TemplateContent::section('listings', 'features.cards', [
                    'eyebrow' => 'On the market',
                    'heading' => 'A few current homes',
                    'description' => 'Ask for the private list — we do not put every pocket listing on a portal.',
                    'columns' => 3,
                    'items' => [
                        ['title' => '$1.12M · Hawthorne', 'text' => '4 bed, original millwork, a garden that actually grows food.', 'icon' => 'home', 'image' => $hero],
                        ['title' => '$864k · Sellwood', 'text' => 'Bungalow with a ADU already permitted.', 'icon' => 'home', 'image' => $living],
                        ['title' => '$2.4M · Dunthorpe', 'text' => 'River light, a kitchen that was rebuilt last year.', 'icon' => 'home', 'image' => $luxury],
                    ],
                ]),
                TemplateContent::section('why', 'content.two_columns', [
                    'eyebrow' => 'Representation',
                    'heading' => 'How we work a side',
                    'columns' => [
                        ['title' => 'Buyers', 'text' => 'Off-market first. Inspection-minded. We will tell you to walk.', 'icon' => 'search'],
                        ['title' => 'Sellers', 'text' => 'Staging that is honest, pricing that is not a vanity number.', 'icon' => 'home'],
                    ],
                ]),
                TemplateContent::section('quotes', 'testimonials.cards', [
                    'heading' => 'From recent closings',
                    'items' => [
                        ['text' => 'They found the bungalow before it hit the portal. We were done in nine days.', 'name' => 'Riley Gomez', 'role' => 'Buyer, Sellwood', 'rating' => 5],
                        ['text' => 'Three offers over ask. No circus open house on a Tuesday night.', 'name' => 'Chris Hale', 'role' => 'Seller, Alberta', 'rating' => 5],
                    ],
                ]),
                TemplateContent::section('cta', 'cta.simple', [
                    'heading' => 'Want to walk a house this weekend?',
                    'description' => 'Tell us the neighborhood and the must-haves. We send two or three — not forty.',
                    'buttonLabel' => 'Book a showing',
                    'buttonUrl' => '/contact',
                    'tone' => 'primary',
                    'headingSize' => 40,
                ]),
            ], $footer),
            TemplateContent::sitePage('Listings', 'listings', false, $nav, [
                TemplateContent::section('hero', 'hero.centered', [
                    'eyebrow' => 'For sale',
                    'heading' => 'Current listings',
                    'description' => 'Updated Fridays. Ask for pocket inventory.',
                    'showTrust' => false,
                    'headingSize' => 48,
                    'buttonLabel' => '',
                    'secondaryLabel' => '',
                ]),
                TemplateContent::section('grid', 'gallery.grid', [
                    'columns' => 3,
                    'images' => [
                        ['src' => $hero, 'caption' => 'Hawthorne · $1.12M'],
                        ['src' => $living, 'caption' => 'Sellwood · $864k'],
                        ['src' => $luxury, 'caption' => 'Dunthorpe · $2.4M'],
                        ['src' => $kitchen, 'caption' => 'Irvington · $1.48M'],
                        ['src' => $keys, 'caption' => 'Just listed'],
                        ['src' => TemplateContent::photo('1600596542815-ffad4c1539a9'), 'caption' => 'Coming soon'],
                    ],
                ]),
            ], $footer),
            TemplateContent::sitePage('Neighborhoods', 'neighborhoods', false, $nav, [
                TemplateContent::section('hero', 'hero.centered', [
                    'eyebrow' => 'Eastside',
                    'heading' => 'Where we spend the week',
                    'description' => 'Hawthorne, Sellwood, Alberta, Irvington, and the inner east.',
                    'showTrust' => false,
                    'headingSize' => 44,
                    'buttonLabel' => '',
                    'secondaryLabel' => '',
                ]),
                TemplateContent::section('areas', 'features.grid', [
                    'columns' => 2,
                    'items' => [
                        ['title' => 'Hawthorne', 'text' => 'Porches, walkability, and bidding wars that still have manners.', 'icon' => 'map-pin'],
                        ['title' => 'Sellwood', 'text' => 'River access, bungalows, and a Saturday market worth the parking.', 'icon' => 'map-pin'],
                        ['title' => 'Alberta', 'text' => 'New builds mixed with 1910s, murals, and late coffee.', 'icon' => 'map-pin'],
                        ['title' => 'Irvington', 'text' => 'Historic overlay, trees, and buyers who read the disclosure.', 'icon' => 'map-pin'],
                    ],
                ]),
            ], $footer),
            TemplateContent::sitePage('Team', 'about', false, $nav, [
                TemplateContent::section('people', 'team.cards', [
                    'eyebrow' => 'The desk',
                    'heading' => 'Agents who still return the call',
                    'columns' => 3,
                    'items' => [
                        ['name' => 'Amelia Chen', 'role' => 'Principal broker', 'bio' => 'Eighteen years on the eastside. Still writes her own listing copy.', 'image' => $amelia],
                        ['name' => 'Jonah Patel', 'role' => 'Buyer specialist', 'bio' => 'Off-market first. Will tell you when the inspection is a walk.', 'image' => $jonah],
                        ['name' => 'Maya Ortiz', 'role' => 'Listing specialist', 'bio' => 'Staging that is honest. Pricing that is not a vanity number.', 'image' => $maya],
                    ],
                ]),
            ], $footer),
            TemplateContent::sitePage('Contact', 'contact', false, $nav, [
                TemplateContent::section('hero', 'hero.centered', [
                    'eyebrow' => 'Showings',
                    'heading' => 'Book a walk-through',
                    'description' => 'Neighborhood, budget, and whether you are buying or listing.',
                    'showTrust' => false,
                    'headingSize' => 44,
                    'buttonLabel' => '',
                    'secondaryLabel' => '',
                ]),
                TemplateContent::section('form', 'form.lead', [
                    'heading' => 'Tell us what you need',
                    'buttonLabel' => 'Request a showing',
                    'layout' => 'split',
                    'details' => [
                        ['icon' => 'phone', 'label' => 'Desk', 'value' => '+1 (555) 016 4400'],
                        ['icon' => 'mail', 'label' => 'Email', 'value' => 'hello@haven.example'],
                        ['icon' => 'clock', 'label' => 'Open houses', 'value' => 'Sat–Sun 12:00–15:00'],
                    ],
                ]),
            ], $footer),
        ];
    }
}
