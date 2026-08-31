<?php

namespace Database\Seeders;

class TemplateConstruction
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#b45309',
            'secondary' => '#1c1917',
            'accent' => '#f59e0b',
            'background' => '#fffbeb',
            'surface' => '#fef3c7',
            'text' => '#1c1917',
            'muted' => '#78716c',
            'headingFont' => 'Oswald, system-ui, sans-serif',
            'bodyFont' => 'Source Sans 3, system-ui, sans-serif',
            'headingWeight' => 600,
            'bodyWeight' => 400,
            'buttonRadius' => '2px',
            'cardRadius' => '4px',
            'containerWidth' => '1120px',
            'sectionSpacing' => '80px',
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $brand = 'Ridge & Beam';
        $nav = TemplateContent::nav($brand, [
            ['label' => 'Projects', 'url' => '/projects'],
            ['label' => 'Services', 'url' => '/services'],
            ['label' => 'About', 'url' => '/about'],
            ['label' => 'Quote', 'url' => '/contact'],
        ], [
            'logoIcon' => 'home',
            'showButton' => true,
            'buttonLabel' => 'Request a quote',
            'buttonUrl' => '/contact',
            'buttonVariant' => 'primary',
        ]);
        $footer = TemplateContent::footer($brand, [
            'tagline' => 'Custom homes and remodels. Licensed, insured, on the job before 7.',
            'columns' => [
                ['title' => 'Company', 'links' => "Projects|/projects\nServices|/services\nAbout|/about\nQuote|/contact"],
                ['title' => 'Office', 'links' => "Mon–Fri 7–4\n(555) 017 2200"],
            ],
            'tone' => 'dark',
        ]);

        $site = TemplateContent::photo('1504307651254-35680f356dfd');
        $crew = TemplateContent::photo('1581094794329-c8112a89af12');
        $house = TemplateContent::photo('1600585154340-be6161a56a0c');
        $kitchen = TemplateContent::photo('1556912173-3bb406ef7e77');
        $before = TemplateContent::photo('1560448204-e02f11c3d0e2');
        $after = TemplateContent::photo('1600210492486-724fe5c67fb0');

        return [
            TemplateContent::sitePage('Home', 'home', true, $nav, [
                TemplateContent::section('hero', 'hero.background', [
                    'eyebrow' => 'General contractor · OR CCB 198442',
                    'heading' => 'Built to last the weather, not just the listing photos',
                    'description' => 'Ridge & Beam handles custom homes, additions, and remodels from permit to punch list — with a superintendent you can call.',
                    'buttonLabel' => 'Request a quote',
                    'buttonUrl' => '/contact',
                    'secondaryLabel' => 'See projects',
                    'secondaryUrl' => '/projects',
                    'headingSize' => 52,
                    'minHeight' => 600,
                    'lightText' => true,
                    'backgroundType' => 'image',
                    'backgroundImage' => $site,
                    'overlayOpacity' => 55,
                ]),
                TemplateContent::section('stats', 'stats.row', [
                    'heading' => 'On the job since 2008',
                    'columns' => 4,
                    'items' => [
                        ['value' => '180+', 'label' => 'Projects closed'],
                        ['value' => '16 yrs', 'label' => 'In the trades'],
                        ['value' => '4.9', 'label' => 'Owner reviews'],
                        ['value' => '0', 'label' => 'Open liens'],
                    ],
                ]),
                TemplateContent::section('services', 'services.cards', [
                    'eyebrow' => 'What we build',
                    'heading' => 'Homes, additions, remodels',
                    'showFeatures' => true,
                    'items' => [
                        ['title' => 'Custom homes', 'text' => 'From slab to keys, with a schedule you can follow.', 'icon' => 'home', 'features' => "Design-build or your architect\nWeekly owner walk\n12–18 month typical"],
                        ['title' => 'Additions', 'text' => 'A second story or a kitchen that finally fits the family.', 'icon' => 'layers', 'features' => "Permit package\nOccupied-home protocols\nFixed-price options"],
                        ['title' => 'Remodels', 'text' => 'Kitchens, baths, and whole-house updates without a disappearing GC.', 'icon' => 'wrench', 'features' => "One superintendent\nDust control\nPunch list that closes"],
                    ],
                ]),
                TemplateContent::section('compare', 'gallery.compare', [
                    'eyebrow' => 'Proof',
                    'heading' => 'Division Street kitchen',
                    'beforeImage' => $before,
                    'afterImage' => $after,
                    'beforeLabel' => 'Before',
                    'afterLabel' => 'After 14 weeks',
                ]),
                TemplateContent::section('process', 'process.timeline', [
                    'heading' => 'How a job actually runs',
                    'items' => [
                        ['date' => 'Week 1', 'title' => 'Walk & scope', 'text' => 'Site visit, constraints, and a written scope — not a napkin number.'],
                        ['date' => 'Weeks 2–4', 'title' => 'Permit & buyout', 'text' => 'Drawings, subs, and a start date you can put on the fridge.'],
                        ['date' => 'Build', 'title' => 'Weekly walks', 'text' => 'Photos every Friday. Changes in writing. No surprise invoices.'],
                        ['date' => 'Close', 'title' => 'Punch & warranty', 'text' => 'A list that actually ends, plus a year of callback on workmanship.'],
                    ],
                ]),
                TemplateContent::section('cta', 'cta.simple', [
                    'heading' => 'Tell us about the job',
                    'description' => 'Address, photos, and whether you have drawings. We reply within two business days.',
                    'buttonLabel' => 'Request a quote',
                    'buttonUrl' => '/contact',
                    'tone' => 'primary',
                    'headingSize' => 40,
                ]),
            ], $footer),
            TemplateContent::sitePage('Projects', 'projects', false, $nav, [
                TemplateContent::section('hero', 'hero.centered', [
                    'eyebrow' => 'Portfolio',
                    'heading' => 'Finished work',
                    'description' => 'Homes and remodels we still get calls about.',
                    'showTrust' => false,
                    'headingSize' => 48,
                    'buttonLabel' => '',
                    'secondaryLabel' => '',
                ]),
                TemplateContent::section('gallery', 'gallery.grid', [
                    'columns' => 3,
                    'images' => [
                        ['src' => $house, 'caption' => 'Hawthorne custom — 2025'],
                        ['src' => $kitchen, 'caption' => 'Division kitchen'],
                        ['src' => $site, 'caption' => 'Alberta addition'],
                        ['src' => $after, 'caption' => 'Sellwood remodel'],
                        ['src' => $crew, 'caption' => 'Crew on Belmont'],
                        ['src' => TemplateContent::photo('1600607687939-ce8a6c25118c'), 'caption' => 'Irvington interior'],
                    ],
                ]),
            ], $footer),
            TemplateContent::sitePage('Services', 'services', false, $nav, [
                TemplateContent::section('hero', 'hero.centered', [
                    'eyebrow' => 'Scope',
                    'heading' => 'What we take on',
                    'description' => 'Residential only. We do not bid production tracts.',
                    'showTrust' => false,
                    'headingSize' => 44,
                    'buttonLabel' => '',
                    'secondaryLabel' => '',
                ]),
                TemplateContent::section('list', 'services.list', [
                    'showPrice' => false,
                    'showNumbers' => true,
                    'items' => [
                        ['title' => 'Custom homes', 'text' => 'New construction on infill lots and acreage.'],
                        ['title' => 'Second-story additions', 'text' => 'Occupied homes, weather-tight as we go.'],
                        ['title' => 'Kitchen & bath', 'text' => 'Full gut or a careful refresh.'],
                        ['title' => 'ADUs', 'text' => 'Detached and converted garages, permit-ready.'],
                        ['title' => 'Historic repair', 'text' => 'Sash, siding, and details the inspector will pass.'],
                    ],
                ]),
            ], $footer),
            TemplateContent::sitePage('About', 'about', false, $nav, [
                TemplateContent::section('story', 'content.image_text', [
                    'eyebrow' => 'The company',
                    'heading' => 'A crew that still shows up at 6:45',
                    'body' => 'Marcus Hale started Ridge & Beam after fifteen years as a carpenter. Superintendents stay on one job. Subs we have used for a decade.',
                    'image' => $crew,
                    'bullets' => "Licensed & bonded in Oregon\nIn-house carpentry\nOne superintendent per job",
                    'headingSize' => 40,
                ]),
                TemplateContent::section('quotes', 'testimonials.cards', [
                    'heading' => 'From owners',
                    'items' => [
                        ['text' => 'They finished the addition in the week they promised. That never happens.', 'name' => 'Amelia Chen', 'role' => 'Alberta addition', 'rating' => 5],
                        ['text' => 'Friday photos meant I did not have to drive over and worry.', 'name' => 'Jonah Patel', 'role' => 'Hawthorne custom', 'rating' => 5],
                        ['text' => 'Punch list closed. Warranty call picked up on the first ring.', 'name' => 'Maya Ortiz', 'role' => 'Sellwood remodel', 'rating' => 5],
                    ],
                ]),
            ], $footer),
            TemplateContent::sitePage('Quote', 'contact', false, $nav, [
                TemplateContent::section('hero', 'hero.centered', [
                    'eyebrow' => 'Estimating',
                    'heading' => 'Request a quote',
                    'description' => 'We walk most jobs before we price them. Photos help us decide if we are a fit.',
                    'showTrust' => false,
                    'headingSize' => 44,
                    'buttonLabel' => '',
                    'secondaryLabel' => '',
                ]),
                TemplateContent::section('form', 'form.quote', [
                    'heading' => 'Job details',
                    'buttonLabel' => 'Send for a quote',
                    'layout' => 'split',
                    'bullets' => "Site walk before a number\nWritten scope\nNo bait-and-switch allowances",
                    'details' => [
                        ['icon' => 'phone', 'label' => 'Office', 'value' => '+1 (555) 017 2200'],
                        ['icon' => 'mail', 'label' => 'Estimating', 'value' => 'jobs@ridgeandbeam.example'],
                        ['icon' => 'clock', 'label' => 'Yard', 'value' => 'Mon–Fri 7:00–16:00'],
                    ],
                ]),
            ], $footer),
        ];
    }
}
