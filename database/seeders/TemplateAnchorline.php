<?php

namespace Database\Seeders;

/**
 * Anchorline — an editorial freight-forwarding and logistics template.
 *
 * Seven pages (Home, About, Services, Gallery, Track Shipment, Contact,
 * Careers) built from the `*.anchor` block family: a wide near-white sheet
 * ruled by hairlines, Newsreader serif headlines over Poppins body copy, a
 * utility bar above a sticky navbar, and one photographic hero cut by a
 * diagonal brand wedge mixed from the primary and accent tokens.
 */
class TemplateAnchorline
{
    private const INK = '#141414';

    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#c2570f',
            'secondary' => '#14213d',
            'accent' => '#2f9fd6',
            'background' => '#ffffff',
            'surface' => '#f5f4f1',
            'text' => self::INK,
            'muted' => '#8a8a86',
            'headingFont' => 'Newsreader, Georgia, serif',
            'bodyFont' => 'Poppins, system-ui, sans-serif',
            'serifFont' => 'Newsreader, Georgia, serif',
            'monoFont' => 'IBM Plex Mono, ui-monospace, monospace',
            'headingWeight' => 400,
            'bodyWeight' => 400,
            'buttonRadius' => '2px',
            'cardRadius' => '4px',
            'containerWidth' => '1240px',
            'sectionSpacing' => '104px',
        ];
    }

    /** @return array<string, mixed> */
    private static function motion(int $delay = 0, string $trigger = 'scroll'): array
    {
        return [
            'animation' => 'fade-up',
            'animationTrigger' => $trigger,
            'animationDuration' => 640,
            'animationDelay' => $delay,
        ];
    }

    /* ------------------------------------------------------------- chrome */

    /** @return array<string, mixed> */
    private static function topbar(): array
    {
        return [
            'left' => 'Office hours: 08:00 – 17:00, Monday to Friday · 24/7 operations desk',
            'right' => '+44 20 7946 0311  |  Unit 14, Dockgate Park, Southampton SO14 3PQ',
            'animation' => 'none',
        ];
    }

    /** @return array<string, mixed> */
    private static function nav(): array
    {
        return array_merge([
            'logo' => 'Anchorline',
            'logoNote' => 'freight & logistics',
            'logoImage' => '',
            'logoUrl' => '/',
            'links' => [
                ['label' => 'Home', 'url' => '/'],
                ['label' => 'About Us', 'url' => '/about'],
                ['label' => 'Services', 'url' => '/services'],
                ['label' => 'Gallery', 'url' => '/gallery'],
                ['label' => 'Track Shipment', 'url' => '/tracking'],
                ['label' => 'Contact', 'url' => '/contact'],
            ],
            'buttonLabel' => 'Let’s Talk!',
            'buttonUrl' => '/contact',
            'sticky' => true,
        ], ['animation' => 'fade-down', 'animationTrigger' => 'load']);
    }

    /** @return array<string, mixed> */
    private static function cta(): array
    {
        return array_merge(self::motion(40), [
            'heading' => "Let’s talk,\nwe respond quickly",
            'columns' => [
                [
                    'title' => 'Address',
                    'text' => 'Unit 14, Dockgate Park, Southampton SO14 3PQ, United Kingdom',
                ],
                [
                    'title' => 'Contact',
                    'text' => "desk@anchorline.example\n+44 20 7946 0311\n+44 23 8033 1180",
                ],
            ],
            'buttonLabel' => '',
            'buttonUrl' => '/contact',
        ]);
    }

    /** @return array<string, mixed> */
    private static function footer(): array
    {
        return array_merge(self::motion(0), [
            'columns' => [
                [
                    'title' => 'Follow',
                    'links' => [
                        ['label' => 'Southampton LinkedIn', 'url' => '#'],
                        ['label' => 'Rotterdam LinkedIn', 'url' => '#'],
                        ['label' => 'Jebel Ali LinkedIn', 'url' => '#'],
                        ['label' => 'Instagram', 'url' => '#'],
                    ],
                ],
                [
                    'title' => 'Company',
                    'links' => [
                        ['label' => 'Home', 'url' => '/'],
                        ['label' => 'About Us', 'url' => '/about'],
                        ['label' => 'Contact us', 'url' => '/contact'],
                        ['label' => 'Careers', 'url' => '/careers'],
                    ],
                ],
                [
                    'title' => 'What we do',
                    'links' => [
                        ['label' => 'Services', 'url' => '/services'],
                        ['label' => 'Gallery', 'url' => '/gallery'],
                        ['label' => 'Track Shipment', 'url' => '/tracking'],
                    ],
                ],
            ],
            'newsletterTitle' => 'Join to get the latest news',
            'newsletterFormId' => '',
            'newsletterLabel' => 'Submit',
            'copyright' => '© Anchorline Freight & Logistics',
        ]);
    }

    /**
     * A page in this family: utility bar, sticky navbar, body, footer.
     *
     * Built by hand rather than through TemplateContent::sitePage(), because
     * that helper takes a single navigation block and Anchorline stacks a
     * utility bar above its navbar.
     *
     * @param  list<array<string, mixed>>  $sections
     * @return array<string, mixed>
     */
    private static function page(string $name, string $slug, bool $homepage, array $sections): array
    {
        return [
            'name' => $name,
            'slug' => $slug,
            'is_homepage' => $homepage,
            'content_json' => TemplateContent::page(array_merge(
                [
                    TemplateContent::section('topbar', 'topbar.anchor', self::topbar()),
                    TemplateContent::section('nav', 'navbar.anchor', self::nav()),
                ],
                $sections,
                [
                    TemplateContent::section('cta', 'cta.anchor', self::cta()),
                    TemplateContent::section('footer', 'footer.anchor', self::footer()),
                ],
            )),
        ];
    }

    /* -------------------------------------------------------------- pages */

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        return [
            self::home(),
            self::about(),
            self::services(),
            self::gallery(),
            self::tracking(),
            self::contact(),
            self::careers(),
        ];
    }

    /** @return list<array<string, mixed>> */
    private static function serviceItems(): array
    {
        return [
            [
                'title' => 'Import / Export Customs Clearance',
                'text' => 'A comprehensive customs service that keeps your air and sea freight accompanied by every document the countries of origin and destination require.',
            ],
            [
                'title' => 'Air Freight Services',
                'text' => 'A turnkey service for international air transport. We work with the world’s leading commercial carriers so long-distance freight lands on time, consistently.',
            ],
            [
                'title' => 'Sea Freight Services (LCL/FCL)',
                'text' => 'The most economical way to handle small and large-scale international movements, through an established network of ocean carriers and consolidators.',
            ],
            [
                'title' => 'Global Relocation',
                'text' => 'Customised relocation services for corporate clients and private individuals, from a single crate to a whole office floor.',
            ],
            [
                'title' => 'Seaway Bill Issuance',
                'text' => 'We issue our own sea waybills, which gives us end-to-end management and tracking of every shipment from collection to final delivery.',
            ],
            [
                'title' => 'Warehousing & Distribution',
                'text' => 'Bonded and general storage with pick, pack and onward distribution, so stock sits close to the customers waiting for it.',
            ],
        ];
    }

    /** @return array<string, mixed> */
    private static function stats(): array
    {
        return array_merge(self::motion(40), [
            'heading' => '',
            'items' => [
                ['value' => '2011', 'label' => 'Trading since'],
                ['value' => '94', 'label' => 'Countries served'],
                ['value' => '18,400', 'label' => 'Shipments a year'],
                ['value' => '99.2%', 'label' => 'On-time delivery'],
            ],
        ]);
    }

    /** @return array<string, mixed> */
    private static function home(): array
    {
        return self::page('Home', 'home', true, [
            TemplateContent::section('hero', 'hero.anchor', array_merge(['animation' => 'fade', 'animationTrigger' => 'load', 'animationDuration' => 900], [
                'heading' => "Your Freight,\nOur Priority",
                'brandLine' => 'ANCHORLINE FREIGHT & LOGISTICS',
                'tagline' => 'Moving cargo the world depends on',
                'image' => TemplateContent::photo('1578575437130-527eed3abbec', 1800),
                'buttonLabel' => 'Get a quote',
                'buttonUrl' => '/contact',
                'secondaryLabel' => '',
                'secondaryUrl' => '/services',
                'overlay' => 58,
                'wedge' => true,
            ])),
            TemplateContent::section('intro', 'intro.anchor', array_merge(self::motion(20), [
                'eyebrow' => '',
                'heading' => "About\nAnchorline",
                'description' => 'Anchorline is a full-service logistics provider handling air freight, LCL consolidations, FCL ocean freight, road haulage, project cargo, door-to-door delivery, relocations, warehousing, packing and customs clearance.',
                'buttonLabel' => 'See more about us',
                'buttonUrl' => '/about',
            ])),
            TemplateContent::section('services', 'services.anchor', array_merge(self::motion(40), [
                'heading' => 'Our Services',
                'description' => '',
                'columns' => '3',
                'rule' => true,
                'items' => self::serviceItems(),
                'buttonLabel' => 'See more services',
                'buttonUrl' => '/services',
            ])),
            TemplateContent::section('feature', 'feature.anchor', array_merge(self::motion(40), [
                'eyebrow' => '',
                'heading' => 'Complete logistics. Global expertise.',
                'body' => '<p>At <strong>Anchorline</strong> we deliver tailored logistics and freight solutions for international and domestic needs. With a focus on reliability and efficiency, our team handles every shipment — by air, sea or road — with precision and care.</p><p>From customs clearance to relocations and urgent deliveries, we provide end-to-end support that simplifies global transport. Whether it is a single pallet or a complete move, we make it smooth, secure and stress free.</p>',
                'image' => TemplateContent::photo('1586528116311-ad8dd3c8310d', 1200),
                'reverse' => false,
                'buttonLabel' => 'Learn more',
                'buttonUrl' => '/about',
                'secondaryLabel' => '',
                'secondaryUrl' => '',
            ])),
            TemplateContent::section('stats', 'stats.anchor', self::stats()),
        ]);
    }

    /** @return array<string, mixed> */
    private static function about(): array
    {
        return self::page('About Us', 'about', false, [
            TemplateContent::section('head', 'pagehead.anchor', array_merge(self::motion(0, 'load'), [
                'eyebrow' => 'About',
                'heading' => 'Your Freight, Our Priority',
                'description' => '',
                'buttonLabel' => '',
                'buttonUrl' => '',
                'secondaryLabel' => '',
                'secondaryUrl' => '',
            ])),
            TemplateContent::section('intro', 'intro.anchor', array_merge(self::motion(20), [
                'eyebrow' => '',
                'heading' => "About Anchorline\nFreight & Logistics",
                'description' => "Anchorline is a complete logistics provider covering air freight, LCL consolidations, FCL ocean freight, land freight, project cargo, door-to-door services, relocations, removals, warehousing, packing and customs clearance.\n\nThe company was founded in 2011 and is run by people who have spent their working lives in cargo airlines, shipping, road transport, chartering and logistics.",
                'buttonLabel' => '',
                'buttonUrl' => '',
            ])),
            TemplateContent::section('principles', 'principles.anchor', array_merge(self::motion(40), [
                'items' => [
                    [
                        'title' => 'Vision',
                        'text' => 'To be a world-class freight forwarding and logistics provider with a dominant presence in every lane our customers trade on, delivering complete solutions tailored to what each of them actually needs.',
                    ],
                    [
                        'title' => 'Mission',
                        'text' => 'To provide exceptional service that goes beyond expectation, through clear and concise two-way communication. We build relationships by staying flexible as our customers’ demands and requirements change.',
                    ],
                ],
                'image' => TemplateContent::photo('1600880292203-757bb62b4baf', 1200),
                'reverse' => false,
            ])),
            TemplateContent::section('concept', 'accent.anchor', array_merge(self::motion(40), [
                'heading' => 'Corporate concept',
                'description' => 'Our customers benefit from a keen combination of logistics and forwarding services: clear, fast and flexible execution, achieved by simplifying the process chain and reducing the number of parties involved.',
                'image' => TemplateContent::photo('1553413077-190dd305871c', 1200),
                'reverse' => false,
                'buttonLabel' => '',
                'buttonUrl' => '',
            ])),
            TemplateContent::section('stats', 'stats.anchor', self::stats()),
        ]);
    }

    /** @return array<string, mixed> */
    private static function services(): array
    {
        return self::page('Services', 'services', false, [
            TemplateContent::section('head', 'pagehead.anchor', array_merge(self::motion(0, 'load'), [
                'eyebrow' => 'Services',
                'heading' => 'Delivering world-class logistics solutions that are efficient, dependable, and built for your success.',
                'description' => '',
                'buttonLabel' => '',
                'buttonUrl' => '',
                'secondaryLabel' => '',
                'secondaryUrl' => '',
            ])),
            TemplateContent::section('services', 'services.anchor', array_merge(self::motion(20), [
                'heading' => 'Our Services',
                'description' => '',
                'columns' => '3',
                'rule' => true,
                'items' => array_merge(self::serviceItems(), [
                    [
                        'title' => 'Project & Heavy-Lift Cargo',
                        'text' => 'Route surveys, lifting plans and permits for oversized and out-of-gauge pieces that will not travel in a standard box.',
                    ],
                    [
                        'title' => 'Road Freight & Haulage',
                        'text' => 'Groupage and full loads across the UK and Europe, with tail-lift and temperature-controlled options where the cargo needs them.',
                    ],
                    [
                        'title' => 'Cargo Insurance',
                        'text' => 'All-risk marine cover arranged per shipment or as an annual policy, so a claim does not become a second problem.',
                    ],
                ]),
                'buttonLabel' => '',
                'buttonUrl' => '',
            ])),
            TemplateContent::section('steps', 'steps.anchor', array_merge(self::motion(40), [
                'eyebrow' => '',
                'heading' => 'How a shipment moves',
                'description' => '',
                'columns' => '4',
                'items' => [
                    ['title' => 'Quote and booking', 'text' => 'Send us the lane, the commodity and the dates. You get a costed routing back the same working day.'],
                    ['title' => 'Collection and packing', 'text' => 'We collect, pack to export standard and raise the documents the destination will ask for.'],
                    ['title' => 'Carriage and clearance', 'text' => 'Cargo moves on the routing you approved while our own brokers clear it at both ends.'],
                    ['title' => 'Delivery and proof', 'text' => 'Final-mile delivery against a signed receipt, with the paperwork filed to your account.'],
                ],
            ])),
            TemplateContent::section('faq', 'faq.anchor', array_merge(self::motion(40), [
                'eyebrow' => '',
                'heading' => 'Questions we are asked most',
                'description' => '',
                'items' => [
                    ['question' => 'How quickly can you quote a lane?', 'answer' => 'Same working day for anything on a routing we already run, and within two for project cargo that needs a survey first.'],
                    ['question' => 'Do you handle customs yourselves?', 'answer' => 'Yes. Our own brokers file entries at origin and destination, so declarations are not sitting with a third party.'],
                    ['question' => 'Can you store goods before delivery?', 'answer' => 'We hold bonded and general stock at all four of our sites and release it against your instruction.'],
                    ['question' => 'What insurance is included?', 'answer' => 'Carriage is covered to standard trading conditions. All-risk marine cover is available per shipment or as an annual policy.'],
                ],
            ])),
        ]);
    }

    /** @return array<string, mixed> */
    private static function gallery(): array
    {
        return self::page('Gallery', 'gallery', false, [
            TemplateContent::section('head', 'pagehead.anchor', array_merge(self::motion(0, 'load'), [
                'eyebrow' => 'Gallery',
                'heading' => 'The yard, the quayside, and everything in between.',
                'description' => '',
                'buttonLabel' => '',
                'buttonUrl' => '',
                'secondaryLabel' => '',
                'secondaryUrl' => '',
            ])),
            TemplateContent::section('gallery', 'gallery.anchor', array_merge(self::motion(20), [
                'eyebrow' => '',
                'heading' => '',
                'description' => '',
                'columns' => '3',
                'items' => [
                    ['image' => TemplateContent::photo('1494412574643-ff11b0a5c1c3', 900), 'caption' => 'Container terminal, Southampton'],
                    ['image' => TemplateContent::photo('1601584115197-04ecc0da31d7', 900), 'caption' => 'Trunking to the Midlands'],
                    ['image' => TemplateContent::photo('1586528116311-ad8dd3c8310d', 900), 'caption' => 'Bonded warehouse, Dockgate Park'],
                    ['image' => TemplateContent::photo('1578575437130-527eed3abbec', 900), 'caption' => 'FCL loading at the quayside'],
                    ['image' => TemplateContent::photo('1553413077-190dd305871c', 900), 'caption' => 'Pick and pack'],
                    ['image' => TemplateContent::photo('1519003722824-194d4455a60c', 900), 'caption' => 'Cross-border haulage'],
                    ['image' => TemplateContent::photo('1587293852726-70cdb56c2866', 900), 'caption' => 'Racking, Jebel Ali'],
                    ['image' => TemplateContent::photo('1580674285054-bed31e145f59', 900), 'caption' => 'Groupage consolidation'],
                    ['image' => TemplateContent::photo('1595246140625-573b715d11dc', 900), 'caption' => 'Export packing'],
                ],
            ])),
        ]);
    }

    /** @return array<string, mixed> */
    private static function tracking(): array
    {
        return self::page('Track Shipment', 'tracking', false, [
            TemplateContent::section('track', 'track.anchor', array_merge(self::motion(0, 'load'), [
                'eyebrow' => 'Track shipment',
                'heading' => 'Where is my cargo?',
                'description' => 'Enter the booking reference, air waybill or bill of lading number printed on your paperwork and we will come straight back with its current status.',
                'formId' => '',
                'buttonLabel' => 'Track',
                'fineprint' => 'Reference numbers are 9 to 12 characters. Lost yours? Call the operations desk and we will find it.',
            ])),
            TemplateContent::section('statuses', 'steps.anchor', array_merge(self::motion(40), [
                'eyebrow' => '',
                'heading' => 'What each status means',
                'description' => '',
                'columns' => '4',
                'items' => [
                    ['title' => 'Booked', 'text' => 'The routing is confirmed and space is held with the carrier. Collection is scheduled.'],
                    ['title' => 'In transit', 'text' => 'Cargo has left origin and is moving on the leg shown against the reference.'],
                    ['title' => 'Customs hold', 'text' => 'An entry is with the authorities. Our broker is on it and will call you if anything is needed.'],
                    ['title' => 'Delivered', 'text' => 'Signed for at destination. The proof of delivery is filed against your account.'],
                ],
            ])),
            TemplateContent::section('faq', 'faq.anchor', array_merge(self::motion(40), [
                'eyebrow' => '',
                'heading' => 'Tracking questions',
                'description' => '',
                'items' => [
                    ['question' => 'How often does the status update?', 'answer' => 'Milestones update as the carrier reports them, which is usually within an hour of the event.'],
                    ['question' => 'My reference is not recognised.', 'answer' => 'New bookings can take up to two hours to appear. If it is older than that, call the desk and we will look it up by hand.'],
                    ['question' => 'Can you notify me automatically?', 'answer' => 'Yes. We can send milestone emails to as many addresses as you need on each booking.'],
                ],
            ])),
        ]);
    }

    /** @return array<string, mixed> */
    private static function contact(): array
    {
        return self::page('Contact', 'contact', false, [
            TemplateContent::section('contact', 'contact.anchor', array_merge(self::motion(0, 'load'), [
                'eyebrow' => 'Contact',
                'heading' => 'Get in touch with us',
                'description' => '<p><strong>Anchorline Freight &amp; Logistics</strong> moves shipping, forwarding and customs work across Europe, the Gulf and South East Asia. Whether it is freight forwarding, warehousing or customs support, our desk is here at every step.</p>',
                'emailLabel' => 'Email:',
                'email' => 'desk@anchorline.example',
                'social' => [
                    ['icon' => 'facebook', 'url' => '#'],
                    ['icon' => 'twitter', 'url' => '#'],
                    ['icon' => 'instagram', 'url' => '#'],
                    ['icon' => 'linkedin', 'url' => '#'],
                ],
                'formId' => '',
                'buttonLabel' => 'Submit',
            ])),
            TemplateContent::section('offices', 'offices.anchor', array_merge(self::motion(40), [
                'eyebrow' => '',
                'heading' => 'Offices & branches',
                'description' => '',
                'columns' => '3',
                'items' => [
                    [
                        'title' => 'Southampton, UK',
                        'address' => 'Unit 14, Dockgate Park, Southampton SO14 3PQ',
                        'phones' => "+44 20 7946 0311\n+44 23 8033 1180",
                    ],
                    [
                        'title' => 'Rotterdam, NL',
                        'address' => 'Waalhaven Oostzijde 62, 3087 BM Rotterdam',
                        'phones' => '+31 10 205 4477',
                    ],
                    [
                        'title' => 'Jebel Ali, UAE',
                        'address' => 'Warehouse 6, JAFZA South Zone, Dubai',
                        'phones' => "+971 4 881 2260\n+971 4 881 2261",
                    ],
                    [
                        'title' => 'Port Klang, MY',
                        'address' => 'Lot 118, Jalan Sultan Hishamuddin, 42000 Port Klang',
                        'phones' => '+60 3 3168 9040',
                    ],
                ],
            ])),
        ]);
    }

    /** @return array<string, mixed> */
    private static function careers(): array
    {
        return self::page('Careers', 'careers', false, [
            TemplateContent::section('head', 'pagehead.anchor', array_merge(self::motion(0, 'load'), [
                'eyebrow' => 'Careers',
                'heading' => 'Work where the cargo, and the people moving it, actually matter.',
                'description' => '',
                'buttonLabel' => '',
                'buttonUrl' => '',
                'secondaryLabel' => '',
                'secondaryUrl' => '',
            ])),
            TemplateContent::section('life', 'feature.anchor', array_merge(self::motion(20), [
                'eyebrow' => '',
                'heading' => 'A desk with a view of the quay',
                'body' => '<p>We are a flat team of forwarders, brokers and warehouse staff across four sites. Nobody here is a number on a rota: you own your customers, you speak to them directly, and you have the authority to fix things without asking three people first.</p><p>We train entry-level staff into full customs competence, and we pay for the qualifications while you do it.</p>',
                'image' => TemplateContent::photo('1587293852726-70cdb56c2866', 1200),
                'reverse' => true,
                'buttonLabel' => '',
                'buttonUrl' => '',
                'secondaryLabel' => '',
                'secondaryUrl' => '',
            ])),
            TemplateContent::section('positions', 'positions.anchor', array_merge(self::motion(40), [
                'eyebrow' => '',
                'heading' => 'Open positions',
                'description' => '',
                'items' => [
                    ['title' => 'Ocean freight coordinator', 'meta' => 'Southampton · Full time', 'url' => '/contact'],
                    ['title' => 'Customs entry clerk', 'meta' => 'Southampton · Full time', 'url' => '/contact'],
                    ['title' => 'Warehouse supervisor', 'meta' => 'Jebel Ali · Full time', 'url' => '/contact'],
                    ['title' => 'Key account manager', 'meta' => 'Rotterdam · Full time', 'url' => '/contact'],
                    ['title' => 'Air freight operator', 'meta' => 'Port Klang · Full time', 'url' => '/contact'],
                ],
                'linkLabel' => 'Apply',
            ])),
        ]);
    }
}
