<?php

namespace Database\Seeders;

class TemplatePortfolio
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#1c1917',
            'secondary' => '#292524',
            'accent' => '#b45309',
            'background' => '#faf7f2',
            'surface' => '#f0ebe3',
            'text' => '#1c1917',
            'muted' => '#78716c',
            'headingFont' => 'Instrument Serif, Georgia, serif',
            'bodyFont' => 'Inter, system-ui, sans-serif',
            'headingWeight' => 400,
            'bodyWeight' => 400,
            'buttonRadius' => '4px',
            'cardRadius' => '8px',
            'containerWidth' => '1120px',
            'sectionSpacing' => '92px',
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $brand = 'Northframe';
        $nav = TemplateContent::nav($brand, [
            ['label' => 'Work', 'url' => '/work'],
            ['label' => 'About', 'url' => '/about'],
            ['label' => 'Journal', 'url' => '/journal'],
            ['label' => 'Contact', 'url' => '/contact'],
        ], [
            'logoIcon' => 'camera',
            'showButton' => true,
            'buttonLabel' => 'Inquire',
            'buttonUrl' => '/contact',
            'showBorder' => false,
        ]);
        $footer = TemplateContent::footer($brand, [
            'tagline' => 'Photographs for people, rooms, and the quiet hours in between.',
            'columns' => [
                ['title' => 'Studio', 'links' => "Work|/work\nAbout|/about\nJournal|/journal\nInquire|/contact"],
                ['title' => 'Based in', 'links' => "Portland & on the road"],
            ],
            'social' => [
                ['icon' => 'instagram', 'url' => '#'],
            ],
            'tone' => 'dark',
        ]);

        $hero = TemplateContent::photo('1542038784456-1ea8e935640e');
        $land = TemplateContent::photo('1470071459604-3b5ec3a7fe05');
        $arch = TemplateContent::photo('1503387762-592deb58ef4e');
        $street = TemplateContent::photo('1492691527719-9d1e7e931d4a');
        $nature = TemplateContent::photo('1469474968028-56623f02e42e');
        $room = TemplateContent::photo('1600607687939-ce8a6c25118c');
        $couple = TemplateContent::photo('1519741497674-611481863552');
        $portrait = TemplateContent::photo('1544005313-94ddf0286df2', 800);

        return [
            TemplateContent::sitePage('Home', 'home', true, $nav, [
                TemplateContent::section('hero', 'hero.image', [
                    'eyebrow' => 'Photographer',
                    'heading' => 'Quiet pictures of loud days',
                    'description' => 'Editorial, architecture, and a few weddings a year — printed large, edited slowly.',
                    'buttonLabel' => 'View the work',
                    'buttonUrl' => '/work',
                    'secondaryLabel' => 'Inquire',
                    'secondaryUrl' => '/contact',
                    'image' => $hero,
                    'headingSize' => 64,
                    'stats' => [
                        ['value' => '12 yrs', 'label' => 'Shooting'],
                        ['value' => '4', 'label' => 'Books'],
                        ['value' => '2', 'label' => 'Studios'],
                    ],
                ]),
                TemplateContent::section('sets', 'gallery.masonry', [
                    'eyebrow' => 'Selected',
                    'heading' => 'Recent frames',
                    'images' => [
                        ['src' => $land, 'caption' => 'Columbia Gorge, dawn'],
                        ['src' => $arch, 'caption' => 'House on Division'],
                        ['src' => $street, 'caption' => 'Night market'],
                        ['src' => $nature, 'caption' => 'After the storm'],
                        ['src' => $room, 'caption' => 'Interior for Haven'],
                        ['src' => $couple, 'caption' => 'June, on the river'],
                    ],
                ]),
                TemplateContent::section('about', 'content.image_text', [
                    'eyebrow' => 'The studio',
                    'heading' => 'One photographer. A small print lab.',
                    'body' => 'Northframe is Elena Voss. Commissions are limited so the work still looks like hers — not a catalog of every lighting trend.',
                    'image' => $portrait,
                    'buttonLabel' => 'About Elena',
                    'buttonUrl' => '/about',
                    'headingSize' => 40,
                    'reverse' => true,
                ]),
                TemplateContent::section('cta', 'cta.split', [
                    'heading' => 'Commission a set',
                    'description' => 'Portraits, buildings, and a handful of weddings. Start with dates and a reference you actually like.',
                    'buttonLabel' => 'Inquire',
                    'buttonUrl' => '/contact',
                    'headingSize' => 36,
                    'tone' => 'primary',
                ]),
            ], $footer),
            TemplateContent::sitePage('Work', 'work', false, $nav, [
                TemplateContent::section('hero', 'hero.centered', [
                    'eyebrow' => 'Archive',
                    'heading' => 'Work',
                    'description' => 'Click a frame. Most sets print to 30 inches.',
                    'showTrust' => false,
                    'headingSize' => 56,
                    'buttonLabel' => '',
                    'secondaryLabel' => '',
                ]),
                TemplateContent::section('grid', 'gallery.grid', [
                    'columns' => 3,
                    'images' => [
                        ['src' => $land, 'caption' => 'Landscape'],
                        ['src' => $arch, 'caption' => 'Architecture'],
                        ['src' => $street, 'caption' => 'Street'],
                        ['src' => $nature, 'caption' => 'Editorial'],
                        ['src' => $room, 'caption' => 'Interiors'],
                        ['src' => $hero, 'caption' => 'Portrait'],
                    ],
                ]),
            ], $footer),
            TemplateContent::sitePage('About', 'about', false, $nav, [
                TemplateContent::section('story', 'content.image_text', [
                    'eyebrow' => 'Elena Voss',
                    'heading' => 'Trained on film. Still prints in the darkroom on Tuesdays.',
                    'body' => 'After a decade on magazines, Northframe is a studio for slower assignments: houses, people, and the weather in between.',
                    'image' => $portrait,
                    'bullets' => "Based in Portland\nTravels for architecture and editorial\nPrints available from the shop",
                    'headingSize' => 40,
                ]),
                TemplateContent::section('process', 'process.steps', [
                    'heading' => 'A typical commission',
                    'columns' => 3,
                    'items' => [
                        ['title' => 'Call', 'text' => 'Dates, location, and three references you like.', 'icon' => 'phone'],
                        ['title' => 'Shoot', 'text' => 'One day on site, or two if the light needs a second chance.', 'icon' => 'camera'],
                        ['title' => 'Edits', 'text' => 'A tight set in two weeks. Prints if you want them on the wall.', 'icon' => 'check'],
                    ],
                ]),
            ], $footer),
            TemplateContent::sitePage('Journal', 'journal', false, $nav, [
                TemplateContent::section('hero', 'hero.centered', [
                    'eyebrow' => 'Notes',
                    'heading' => 'Journal',
                    'description' => 'Light, travel, and the jobs that taught something.',
                    'showTrust' => false,
                    'headingSize' => 52,
                    'buttonLabel' => '',
                    'secondaryLabel' => '',
                ]),
                TemplateContent::section('posts', 'posts.cards', [
                    'heading' => 'Recent notes',
                    'buttonLabel' => '',
                    'items' => [
                        ['title' => 'Shooting a house that is still being built', 'excerpt' => 'Scaffolding, one good window, and why noon is almost never the answer.', 'date' => 'May 4, 2026', 'tag' => 'Architecture', 'image' => $arch],
                        ['title' => 'Film on Tuesdays', 'excerpt' => 'A lab routine that keeps the commissions from looking like the phone.', 'date' => 'Apr 12, 2026', 'tag' => 'Process', 'image' => $hero],
                        ['title' => 'Gorge, before the trail opened', 'excerpt' => 'A 4 a.m. start and a set that only needed twelve frames.', 'date' => 'Mar 2, 2026', 'tag' => 'Landscape', 'image' => $land],
                    ],
                ]),
            ], $footer),
            TemplateContent::sitePage('Contact', 'contact', false, $nav, [
                TemplateContent::section('hero', 'hero.centered', [
                    'eyebrow' => 'Studio',
                    'heading' => 'Inquire',
                    'description' => 'Dates, city, and a link to work you like. Elena replies herself.',
                    'showTrust' => false,
                    'headingSize' => 48,
                    'buttonLabel' => '',
                    'secondaryLabel' => '',
                ]),
                TemplateContent::section('form', 'form.contact', [
                    'heading' => 'Send a note',
                    'buttonLabel' => 'Send inquiry',
                    'layout' => 'split',
                    'details' => [
                        ['icon' => 'mail', 'label' => 'Studio', 'value' => 'studio@northframe.example'],
                        ['icon' => 'map-pin', 'label' => 'Portland', 'value' => 'By appointment'],
                        ['icon' => 'instagram', 'label' => 'Instagram', 'value' => '@northframe'],
                    ],
                ]),
            ], $footer),
        ];
    }
}
