<?php

namespace Database\Seeders;

class TemplateLumenLane
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#ffd400',
            'secondary' => '#02071d',
            'accent' => '#e1af00',
            'background' => '#fcfbf7',
            'surface' => '#f3f2ee',
            'text' => '#080b14',
            'muted' => '#545760',
            'headingFont' => 'Inter, Arial, sans-serif',
            'bodyFont' => 'Inter, Arial, sans-serif',
            'headingWeight' => 680,
            'bodyWeight' => 400,
            'buttonRadius' => '9px',
            'cardRadius' => '17px',
            'containerWidth' => '1860px',
            'sectionSpacing' => '120px',
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $nav = [
            'brand' => 'Lumen & Lane',
            'locality' => 'GREENWICH · S.E. LONDON',
            'phone' => '020 8191 4072',
            'buttonLabel' => 'Book a visit',
            'buttonUrl' => '/book',
            'sticky' => true,
            'links' => [
                ['label' => 'Home', 'url' => '/'],
                ['label' => 'Services', 'url' => '/services'],
                ['label' => 'Pricing', 'url' => '/pricing'],
                ['label' => 'About', 'url' => '/about'],
                ['label' => 'Area', 'url' => '/area'],
                ['label' => 'Contact', 'url' => '/contact'],
            ],
        ];

        $footer = [
            'brand' => 'Lumen & Lane',
            'locality' => 'GREENWICH ELECTRICIANS',
            'description' => 'Independent electrical help for homes, landlords and small businesses across South-East London.',
            'phone' => '020 8191 4072',
            'email' => 'hello@lumenlane.co.uk',
            'address' => 'Greenwich, London SE10',
            'copyright' => '© 2026 Lumen & Lane · Fully qualified · Fully insured',
            'buttonLabel' => 'Book a visit',
            'buttonUrl' => '/book',
            'links' => array_slice($nav['links'], 1),
        ];

        $cta = [
            'eyebrow' => 'READY WHEN YOU ARE',
            'heading' => 'Not sure what',
            'accent' => 'to book?',
            'description' => 'Send a few details and we will point you in the right direction—no pressure.',
            'buttonLabel' => 'Book a visit',
            'buttonUrl' => '/book',
            'secondaryLabel' => 'Send a message',
            'secondaryUrl' => '/contact',
        ];

        $homeHero = [
            'eyebrow' => 'LOCAL ELECTRICAL HELP · GREENWICH',
            'heading' => 'Power restored,',
            'accent' => 'without the runaround.',
            'description' => 'Careful electrical repairs, upgrades and inspections for homes and small businesses across South-East London.',
            'image' => TemplateContent::photo('1621905252507-b35492cc74b4', 2400),
            'imageAlt' => 'Electrician working inside a bright home',
            'buttonLabel' => 'Book a visit',
            'buttonUrl' => '/book',
            'secondaryLabel' => 'See services',
            'secondaryUrl' => '/services',
            'tall' => true,
        ];

        return [
            TemplateContent::sitePage('Home', 'home', true, $nav, [
                TemplateContent::section('hero', 'hero.lumen', $homeHero),
                TemplateContent::section('services', 'services.lumen', [
                    'eyebrow' => 'WHAT WE DO',
                    'heading' => 'Repairs, upgrades,',
                    'accent' => 'and useful advice.',
                    'description' => 'Six common jobs, one careful local team, and no vague pricing.',
                ]),
                TemplateContent::section('values', 'features.lumen', []),
                TemplateContent::section('about', 'content.lumen_about', [
                    'eyebrow' => 'THE PEOPLE BEHIND THE TOOLBOX',
                    'heading' => 'Independent by choice,',
                    'accent' => 'local by habit.',
                    'buttonLabel' => 'Our story',
                    'buttonUrl' => '/about',
                ]),
                TemplateContent::section('cta', 'cta.lumen', $cta),
            ], $footer, 'footer.lumen', 'navbar.lumen'),

            TemplateContent::sitePage('Services', 'services', false, $nav, [
                TemplateContent::section('hero', 'hero.lumen', [
                    'eyebrow' => 'ELECTRICAL SERVICES',
                    'heading' => 'Electrical work,',
                    'accent' => 'done tidy and safe.',
                    'description' => 'Repairs, installations and inspection work for homes, landlords and small independent businesses.',
                    'image' => TemplateContent::photo('1581578731548-c64695cc6952', 2400),
                    'imageAlt' => 'Qualified electrician carrying out a home inspection',
                    'buttonLabel' => 'Book a service',
                    'buttonUrl' => '/book',
                    'secondaryLabel' => 'View prices',
                    'secondaryUrl' => '/pricing',
                ]),
                TemplateContent::section('services', 'services.lumen', [
                    'eyebrow' => 'THE FULL LIST',
                    'heading' => 'Homes and businesses,',
                    'accent' => 'covered clearly.',
                ]),
                TemplateContent::section('values', 'features.lumen', [
                    'eyebrow' => 'HOW WE WORK',
                    'heading' => 'Safe decisions,',
                    'accent' => 'clean finish.',
                    'description' => 'Every visit is planned around the people who use the space after we leave.',
                ]),
                TemplateContent::section('cta', 'cta.lumen', $cta),
            ], $footer, 'footer.lumen', 'navbar.lumen'),

            TemplateContent::sitePage('Pricing', 'pricing', false, $nav, [
                TemplateContent::section('hero', 'hero.lumen', [
                    'eyebrow' => 'STRAIGHTFORWARD GUIDE PRICES',
                    'heading' => 'Know the likely cost,',
                    'accent' => 'before we begin.',
                    'description' => 'Common tasks have useful starting points. Larger jobs receive a written scope and quote.',
                    'image' => TemplateContent::photo('1621905252507-b35492cc74b4', 2400),
                    'imageAlt' => 'Electrician testing a domestic circuit',
                    'buttonLabel' => 'Check availability',
                    'buttonUrl' => '/book',
                    'secondaryLabel' => 'Ask a question',
                    'secondaryUrl' => '/contact',
                ]),
                TemplateContent::section('prices', 'pricing.lumen', []),
                TemplateContent::section('cta', 'cta.lumen', [
                    ...$cta,
                    'eyebrow' => 'GET A CLEAR SCOPE',
                    'heading' => 'A useful quote,',
                    'accent' => 'without the hassle.',
                    'description' => 'A short description and your postcode are enough to start.',
                ]),
            ], $footer, 'footer.lumen', 'navbar.lumen'),

            TemplateContent::sitePage('About', 'about', false, $nav, [
                TemplateContent::section('hero', 'hero.lumen', [
                    'eyebrow' => 'ABOUT LUMEN & LANE',
                    'heading' => 'Independent, nearby,',
                    'accent' => 'and accountable.',
                    'description' => 'A small electrical team built around reliable arrival windows, calm explanations and careful work.',
                    'image' => TemplateContent::photo('1581578731548-c64695cc6952', 2400),
                    'imageAlt' => 'Independent electrician outside a London home',
                    'buttonLabel' => 'Book a visit',
                    'buttonUrl' => '/book',
                    'secondaryLabel' => 'Our services',
                    'secondaryUrl' => '/services',
                ]),
                TemplateContent::section('story', 'content.lumen_about', [
                    'eyebrow' => 'IN OUR OWN WORDS',
                    'heading' => 'A trade built on',
                    'accent' => 'doing the basics well.',
                    'description' => 'After years on larger sites, we chose local work so customers could deal with the same people from first message to final test.',
                    'image' => TemplateContent::photo('1621905251189-08b45d6a269e', 1400),
                    'imageAlt' => 'Lumen and Lane electrician in a customer home',
                    'buttonLabel' => 'See availability',
                    'buttonUrl' => '/book',
                ]),
                TemplateContent::section('values', 'features.lumen', [
                    'eyebrow' => 'WHAT MATTERS HERE',
                    'heading' => 'Careful details,',
                    'accent' => 'every single visit.',
                ]),
                TemplateContent::section('cta', 'cta.lumen', $cta),
            ], $footer, 'footer.lumen', 'navbar.lumen'),

            TemplateContent::sitePage('Service Area', 'area', false, $nav, [
                TemplateContent::section('hero', 'hero.lumen', [
                    'eyebrow' => 'SERVICE AREA',
                    'heading' => 'Greenwich and nearby,',
                    'accent' => 'South-East London.',
                    'description' => 'A compact patch means practical arrival windows and familiar streets.',
                    'image' => TemplateContent::photo('1513635269975-59663e0ac1ad', 2400),
                    'imageAlt' => 'South-East London residential street',
                    'buttonLabel' => 'Check my postcode',
                    'buttonUrl' => '/contact',
                    'secondaryLabel' => 'See services',
                    'secondaryUrl' => '/services',
                ]),
                TemplateContent::section('area', 'content.lumen_area', []),
                TemplateContent::section('cta', 'cta.lumen', [
                    ...$cta,
                    'eyebrow' => 'LOCAL ONLY',
                    'heading' => 'Not sure we cover',
                    'accent' => 'your postcode?',
                    'description' => 'Send it over and we will reply with an honest answer.',
                ]),
            ], $footer, 'footer.lumen', 'navbar.lumen'),

            TemplateContent::sitePage('Contact', 'contact', false, $nav, [
                TemplateContent::section('contact', 'form.lumen_contact', [
                    'eyebrow' => 'CONTACT',
                    'heading' => 'Start with the',
                    'accent' => 'useful details.',
                    'description' => 'Call, email or send a note. We normally reply the same working day.',
                ]),
            ], $footer, 'footer.lumen', 'navbar.lumen'),

            TemplateContent::sitePage('Book', 'book', false, $nav, [
                TemplateContent::section('hero', 'hero.lumen', [
                    'eyebrow' => 'REQUEST A VISIT',
                    'heading' => 'Book a local',
                    'accent' => 'electrical visit.',
                    'description' => 'It takes about a minute. Add the clearest details you have and we will confirm the slot.',
                    'image' => TemplateContent::photo('1558002038-1055907df827', 2400),
                    'imageAlt' => 'Electrician van outside London homes',
                    'buttonLabel' => 'Start below',
                    'buttonUrl' => '#booking',
                    'secondaryLabel' => 'View pricing',
                    'secondaryUrl' => '/pricing',
                ]),
                TemplateContent::section('booking', 'form.lumen_booking', []),
            ], $footer, 'footer.lumen', 'navbar.lumen'),
        ];
    }
}
