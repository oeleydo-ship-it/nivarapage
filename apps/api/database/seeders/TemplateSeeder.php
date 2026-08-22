<?php

namespace Database\Seeders;

use App\Models\Template;
use App\Models\TemplateCategory;
use App\Models\TemplatePage;
use Illuminate\Database\Seeder;

class TemplateSeeder extends Seeder
{
    public function run(): void
    {
        $this->publish(
            category: ['slug' => 'restaurant', 'name' => 'Restaurant'],
            slug: 'restaurant',
            name: 'Restaurant',
            description: 'A warm dining room: seasonal menu, story, and reservations — Playfair headlines on cream and terracotta.',
            featured: true,
            theme: self::restaurantTheme(),
            pages: $this->restaurantPages(),
        );

        $this->publish(
            category: ['slug' => 'business', 'name' => 'Small business'],
            slug: 'business',
            name: 'Small business',
            description: 'A trustworthy local-services site: services, proof, and a quote form — Plus Jakarta Sans with roomy cards.',
            featured: true,
            theme: self::smallBusinessTheme(),
            pages: $this->smallBusinessPages(),
        );

        $this->publish(
            category: ['slug' => 'barber', 'name' => 'Barber'],
            slug: 'barber',
            name: 'Barber',
            description: 'A sharp shop site: cuts, beard work, and walk-ins — Cinzel on charcoal and gold with tight type.',
            featured: true,
            theme: self::barberTheme(),
            pages: $this->barberPages(),
        );

        $this->publish(
            category: ['slug' => 'saas', 'name' => 'SaaS'],
            slug: 'saas',
            name: 'Flypay',
            description: 'A fintech app landing page: hero, trust bar, feature cards, pricing toggle, reviews, and FAQ — Outfit on lavender and slate, fully editable in the builder.',
            featured: true,
            theme: TemplateSaas::theme(),
            pages: TemplateSaas::pages(),
        );

        $this->publish(
            category: ['slug' => 'agency', 'name' => 'Agency'],
            slug: 'agency',
            name: 'Lumen',
            description: 'An independent studio site: work, sprints, and a brief form — Syne on warm paper and rose.',
            featured: true,
            theme: TemplateAgency::theme(),
            pages: TemplateAgency::pages(),
        );

        $this->publish(
            category: ['slug' => 'portfolio', 'name' => 'Portfolio'],
            slug: 'portfolio',
            name: 'Northframe',
            description: 'A photographer’s studio: masonry work, journal, and inquiries — Instrument Serif on cream and stone.',
            featured: true,
            theme: TemplatePortfolio::theme(),
            pages: TemplatePortfolio::pages(),
        );

        $this->publish(
            category: ['slug' => 'construction', 'name' => 'Construction'],
            slug: 'construction',
            name: 'Ridge & Beam',
            description: 'A contractor site: projects, process, before/after, and a quote form — Oswald on amber and charcoal.',
            featured: true,
            theme: TemplateConstruction::theme(),
            pages: TemplateConstruction::pages(),
        );

        $this->publish(
            category: ['slug' => 'realty', 'name' => 'Real Estate'],
            slug: 'realty',
            name: 'Haven',
            description: 'A brokerage site: listings, neighborhoods, and showings — Fraunces on forest and cream.',
            featured: true,
            theme: TemplateRealty::theme(),
            pages: TemplateRealty::pages(),
        );

        $this->publish(
            category: ['slug' => 'clinic', 'name' => 'Medical'],
            slug: 'clinic',
            name: 'Cedar Clinic',
            description: 'A family-medicine practice: care, team, hours, and appointments — Cormorant on teal and mist.',
            featured: true,
            theme: TemplateClinic::theme(),
            pages: TemplateClinic::pages(),
        );

        $this->publish(
            category: ['slug' => 'consulting', 'name' => 'Consulting'],
            slug: 'consulting',
            name: 'Meridian',
            description: 'A partner-led firm: practice, insights, and a serious inquiry form — Newsreader on navy and gold.',
            featured: true,
            theme: TemplateConsulting::theme(),
            pages: TemplateConsulting::pages(),
        );

        $this->publish(
            category: ['slug' => 'saas', 'name' => 'SaaS'],
            slug: 'aitool',
            name: 'AI Tool',
            description: 'A dark OpenAI + Next.js SaaS kit: pricing, about, blog, and contact — Inter on navy with violet accents. Every section is editable in the builder.',
            featured: true,
            theme: TemplateAiTool::theme(),
            pages: TemplateAiTool::pages(),
        );

        $this->publish(
            category: ['slug' => 'saas', 'name' => 'SaaS'],
            slug: 'inkline',
            name: 'Inkline',
            description: 'A dark-to-light AI writing room: Inter and violet, glowing pricing cards, and a header switcher for navy or white canvases. Original copy, fully editable.',
            featured: true,
            theme: TemplateInkline::theme(),
            pages: TemplateInkline::pages(),
        );

        $this->publish(
            category: ['slug' => 'agency', 'name' => 'Agency'],
            slug: 'brightline',
            name: 'Brightline',
            description: 'A light marketing-studio kit: Inter, centered nav, skills, services, and a contact map — original copy, every section editable, no dark canvases.',
            featured: true,
            theme: TemplateBrightline::theme(),
            pages: TemplateBrightline::pages(),
        );

        $this->publish(
            category: ['slug' => 'agency', 'name' => 'Agency'],
            slug: 'avivo',
            name: 'Avivo',
            description: 'A light creative-studio kit: Fraunces headlines, yellow and violet accents, pill buttons, project grid, and bento quotes — every new block is reusable on a blank site.',
            featured: true,
            theme: TemplateAvivo::theme(),
            pages: TemplateAvivo::pages(),
        );

        $this->publish(
            category: ['slug' => 'saas', 'name' => 'SaaS'],
            slug: 'chatdeck',
            name: 'ChatDeck',
            description: 'A monochrome AI-support landing kit: Inter, pill buttons, product hero, logo row, team, compact quotes, and monthly/yearly pricing — every new block is reusable on a blank site.',
            featured: true,
            theme: TemplateChatdeck::theme(),
            pages: TemplateChatdeck::pages(),
        );

        $this->publish(
            category: ['slug' => 'saas', 'name' => 'SaaS'],
            slug: 'genesis',
            name: 'Aether',
            description: 'A dark AI-agent kit: Poppins, black canvas, orange/pink/blue glows, scroll animation, and left-rail cards in the template colors.',
            featured: true,
            theme: TemplateGenesis::theme(),
            pages: TemplateGenesis::pages(),
        );

        $this->publish(
            category: ['slug' => 'consulting', 'name' => 'Consulting'],
            slug: 'halewren',
            name: 'Hale Wren',
            description: 'A wide-column counsel kit: Inter on cream and espresso, split-panel hero, numbered markers, and a stone ruled band — original copy, local photos in docs/images.',
            featured: true,
            theme: TemplateHale::theme(),
            pages: TemplateHale::pages(),
        );

        $this->publish(
            category: ['slug' => 'saas', 'name' => 'SaaS'],
            slug: 'verdara',
            name: 'Verdara',
            description: 'A light green AI-launch kit: Inter, mint glow, overlapping photos, monthly/yearly pricing, and scroll motion — original Verdara blocks, fully editable.',
            featured: true,
            theme: TemplateVerdara::theme(),
            pages: TemplateVerdara::pages(),
        );

        $this->publish(
            category: ['slug' => 'saas', 'name' => 'SaaS'],
            slug: 'solara',
            name: 'Solara',
            description: 'A light orange AI-agent kit: Inter, pastel feature stack, monthly/yearly pricing, and a peach footer — original Solara blocks, fully editable.',
            featured: true,
            theme: TemplateSolara::theme(),
            pages: TemplateSolara::pages(),
        );

        $this->publish(
            category: ['slug' => 'business', 'name' => 'Small business'],
            slug: 'moksha',
            name: 'Nivara',
            description: 'A clean purple yoga studio template with an immersive photo hero, class programs, benefits, instructor story, testimonials, pricing, FAQs, and polished conversion sections.',
            featured: true,
            theme: TemplateMoksha::theme(),
            pages: TemplateMoksha::pages(),
        );

        $this->publish(
            category: ['slug' => 'business', 'name' => 'Small business'],
            slug: 'cinder-row',
            name: 'Cinder & Row',
            description: 'A full-width editorial heating-service template with oversized serif type, orange italic accents, bento services, local coverage, journal, story, pricing, contact form, and five fully editable pages.',
            featured: true,
            theme: TemplateCinderRow::theme(),
            pages: TemplateCinderRow::pages(),
        );

        $this->publish(
            category: ['slug' => 'business', 'name' => 'Small business'],
            slug: 'lumen-lane',
            name: 'Lumen & Lane',
            description: 'A full-width navy and signal-yellow electrician template with framed photo heroes, service cards, transparent pricing, local-area galleries, contact and booking forms, and seven fully editable pages.',
            featured: true,
            theme: TemplateLumenLane::theme(),
            pages: TemplateLumenLane::pages(),
        );

        $this->publish(
            category: ['slug' => 'saas', 'name' => 'SaaS'],
            slug: 'quarry',
            name: 'Quarry',
            description: 'A regulated-operations platform kit: uppercase Archivo headlines on warm bone, deep forest bands, one acid-lime marker highlight and blocky pixel art, a sticky floating navbar, key-figure cards, a lime-column governance table, an ecosystem directory, a two-column FAQ, a full contact form and an eight-column mega footer across five fully editable pages — original Quarry blocks.',
            featured: true,
            theme: TemplateQuarry::theme(),
            pages: TemplateQuarry::pages(),
        );

        $this->publish(
            category: ['slug' => 'saas', 'name' => 'SaaS'],
            slug: 'tessera',
            name: 'Tessera',
            description: 'A field-operations intelligence kit: Sora headlines on a near-white sheet ruled by hairlines, one ember accent, two-tone headings, a bordered showcase pair, ruled metric columns, a three-tier pricing grid with a dark comparison table, numbered principles, open roles, and a black closing footer across four fully editable pages — original Tessera blocks.',
            featured: true,
            theme: TemplateTessera::theme(),
            pages: TemplateTessera::pages(),
        );

        $this->publish(
            category: ['slug' => 'consulting', 'name' => 'Consulting'],
            slug: 'axiom-north',
            name: 'Axiom North',
            description: 'A dark black VC and advisory kit: Syne and DM Sans, amber glow accents, portfolio filters, studio, advisory FAQ, and five fully editable pages — original Axiom North blocks.',
            featured: true,
            theme: TemplateAxiomNorth::theme(),
            pages: TemplateAxiomNorth::pages(),
        );

        $this->publish(
            category: ['slug' => 'saas', 'name' => 'SaaS'],
            slug: 'vantage-os',
            name: 'Vantage.OS',
            description: 'A calm platform and IT-services kit: Playfair Display headlines on near-white, monospace section rails, one royal-blue accent, deep-navy impact bands, a watercolor signature footer, and four fully editable pages — original Vantage.OS blocks.',
            featured: true,
            theme: TemplateVantage::theme(),
            pages: TemplateVantage::pages(),
        );

        $this->publish(
            category: ['slug' => 'saas', 'name' => 'SaaS'],
            slug: 'junction',
            name: 'Junction',
            description: 'An automation and AI-orchestration product kit: Figtree headlines on warm off-white, one hot-orange accent, tinted screenshot cards, deep olive and indigo bands, a four-tier pricing table with usage slider, app-integration pages and grouped FAQs across five fully editable pages.',
            featured: true,
            theme: TemplateJunction::theme(),
            pages: TemplateJunction::pages(),
        );

        $this->publish(
            category: ['slug' => 'business', 'name' => 'Small business'],
            slug: 'kindred',
            name: 'Kindred',
            description: 'A family-of-companies brand kit: a saturated green masthead, pale bands with slanted edges, bold Figtree headlines closed by a coloured full stop, dropdown navigation, serif editorial cards, logo-card carousels and a company directory across six fully editable pages.',
            featured: true,
            theme: TemplateKindred::theme(),
            pages: TemplateKindred::pages(),
        );

        $this->publish(
            category: ['slug' => 'consulting', 'name' => 'Consulting'],
            slug: 'northbook',
            name: 'Northbook',
            description: 'A professional accountancy kit: deep teal-navy headings closed by a green full stop, a pale sage hero band, green pill buttons, thin-bordered service cards, a comparison table, consultation form and dropdown navigation across five fully editable pages.',
            featured: true,
            theme: TemplateNorthbook::theme(),
            pages: TemplateNorthbook::pages(),
        );

        $this->publish(
            category: ['slug' => 'agency', 'name' => 'Agency'],
            slug: 'voltera',
            name: 'Voltera',
            description: 'A high-energy digital-marketing kit: electric indigo panels against white, a chartreuse lime accent on every pill button and eyebrow badge, near-black geometric headlines, a lime corner-arrow motif, dropdown navigation, an expanding service accordion, highlighted pricing plans, a dotted office map and eight fully editable pages.',
            featured: true,
            theme: TemplateVoltera::theme(),
            pages: TemplateVoltera::pages(),
        );

        $this->publish(
            category: ['slug' => 'saas', 'name' => 'SaaS'],
            slug: 'halcyon',
            name: 'Halcyon',
            description: 'A calm bootstrapped-SaaS kit: near-white pages lit by soft pastel blooms, two-tone headlines that fade from ink to grey, hairline cards, a dark pill button beside a sky-blue accent, a single transparent price card, two-column FAQ, founder letter, changelog and a full-bleed scenic close above a near-black footer, across six fully editable pages.',
            featured: true,
            theme: TemplateHalcyon::theme(),
            pages: TemplateHalcyon::pages(),
        );
    }

    /**
     * @param  array{slug: string, name: string}  $category
     * @param  array<string, mixed>  $theme
     * @param  list<array<string, mixed>>  $pages
     */
    private function publish(
        array $category,
        string $slug,
        string $name,
        string $description,
        bool $featured,
        array $theme,
        array $pages,
    ): void {
        $cat = TemplateCategory::query()->updateOrCreate(
            ['slug' => $category['slug']],
            ['name' => $category['name']],
        );

        $template = Template::query()->updateOrCreate(
            ['slug' => $slug],
            [
                'template_category_id' => $cat->id,
                'name' => $name,
                'description' => $description,
                'is_premium' => false,
                'is_active' => true,
                'is_featured' => $featured,
                'theme_tokens' => $theme,
            ],
        );

        $template->pages()->delete();
        foreach ($pages as $page) {
            TemplatePage::query()->create([
                'template_id' => $template->id,
                ...$page,
            ]);
        }
    }

    /** @return array<string, mixed> */
    public static function restaurantTheme(): array
    {
        return [
            'primary' => '#9a3412',
            'secondary' => '#1c1410',
            'accent' => '#c4a574',
            'background' => '#fbf7f1',
            'surface' => '#f3ebe0',
            'text' => '#1c1410',
            'muted' => '#6f6258',
            'headingFont' => 'Playfair Display, Georgia, serif',
            'bodyFont' => 'Lora, Georgia, serif',
            'headingWeight' => 600,
            'bodyWeight' => 400,
            'buttonRadius' => '2px',
            'cardRadius' => '6px',
            'containerWidth' => '1080px',
            'sectionSpacing' => '96px',
        ];
    }

    /** @return array<string, mixed> */
    public static function smallBusinessTheme(): array
    {
        return [
            'primary' => '#1d4ed8',
            'secondary' => '#0f172a',
            'accent' => '#0f766e',
            'background' => '#ffffff',
            'surface' => '#f1f5f9',
            'text' => '#0f172a',
            'muted' => '#64748b',
            'headingFont' => 'Plus Jakarta Sans, system-ui, sans-serif',
            'bodyFont' => 'Source Sans 3, system-ui, sans-serif',
            'headingWeight' => 700,
            'bodyWeight' => 400,
            'buttonRadius' => '10px',
            'cardRadius' => '16px',
            'containerWidth' => '1160px',
            'sectionSpacing' => '80px',
        ];
    }

    /** @return array<string, mixed> */
    public static function barberTheme(): array
    {
        return [
            'primary' => '#c9a227',
            'secondary' => '#111111',
            'accent' => '#e11d48',
            'background' => '#0c0c0c',
            'surface' => '#171717',
            'text' => '#f5f0e8',
            'muted' => '#a8a29e',
            'headingFont' => 'Cinzel, system-ui, sans-serif',
            'bodyFont' => 'Barlow, system-ui, sans-serif',
            'headingWeight' => 600,
            'bodyWeight' => 400,
            'buttonRadius' => '0px',
            'cardRadius' => '2px',
            'containerWidth' => '1040px',
            'sectionSpacing' => '72px',
        ];
    }

    /** @return list<array<string, mixed>> */
    private function restaurantPages(): array
    {
        $brand = 'Harbor Table';
        $links = [
            ['label' => 'Menu', 'url' => '/menu'],
            ['label' => 'Private dining', 'url' => '/events'],
            ['label' => 'About', 'url' => '/about'],
            ['label' => 'Reservations', 'url' => '/contact'],
        ];
        $nav = TemplateContent::nav($brand, $links, [
            'logoIcon' => 'utensils',
            'showButton' => true,
            'buttonLabel' => 'Reserve a table',
            'buttonUrl' => '/contact',
            'buttonVariant' => 'primary',
        ]);
        $footer = TemplateContent::footer($brand, [
            'tagline' => 'Seasonal plates by the water.',
            'columns' => [
                ['title' => 'Visit', 'links' => "Menu|/menu\nPrivate dining|/events\nAbout|/about\nReservations|/contact"],
                ['title' => 'Hours', 'links' => "Lunch Tue–Sun 12–15\nDinner Tue–Sat 18–23"],
            ],
            'social' => [
                ['icon' => 'instagram', 'url' => '#'],
                ['icon' => 'facebook', 'url' => '#'],
            ],
            'tone' => 'dark',
        ]);

        return [
            [
                'name' => 'Home',
                'slug' => 'home',
                'is_homepage' => true,
                'content_json' => TemplateContent::page([
                    TemplateContent::section('nav', 'navbar.cta', $nav),
                    TemplateContent::section('hero', 'hero.restaurant', [
                        'eyebrow' => 'Harbour Street · est. 2009',
                        'heading' => 'Seasonal plates, harbour views',
                        'description' => 'Farm-to-table dining with a daily catch, an open kitchen, and a list built on small growers.',
                        'buttonLabel' => 'Reserve a table',
                        'buttonUrl' => '/contact',
                        'secondaryLabel' => "Tonight's menu",
                        'secondaryUrl' => '/menu',
                        'headingSize' => 64,
                        'bodySize' => 18,
                        'headingWeight' => '600',
                        'animation' => 'fade-up',
                        'minHeight' => 640,
                        'backgroundType' => 'gradient',
                        'gradientFrom' => '#1c1410',
                        'gradientTo' => '#9a3412',
                        'gradientAngle' => 165,
                        'lightText' => true,
                        'hours' => [
                            ['label' => 'Lunch', 'value' => 'Tue – Sun · 12:00 – 15:00'],
                            ['label' => 'Dinner', 'value' => 'Tue – Sat · 18:00 – 23:00'],
                            ['label' => 'Reservations', 'value' => '+1 (555) 018 2299'],
                        ],
                    ]),
                    TemplateContent::section('features', 'features.cards', [
                        'eyebrow' => 'The room',
                        'heading' => 'Why guests return',
                        'description' => 'A neighborhood table with a serious kitchen.',
                        'textAlign' => 'center',
                        'tone' => 'surface',
                        'headingSize' => 40,
                        'items' => [
                            ['title' => 'Seasonal menu', 'text' => 'Ingredients sourced weekly from farms within sixty miles.', 'icon' => 'leaf'],
                            ['title' => 'Craft bar', 'text' => 'Low-intervention wines and cocktails built on house bitters.', 'icon' => 'coffee'],
                            ['title' => 'Private dining', 'text' => 'The garden room seats fourteen for celebrations and teams.', 'icon' => 'users'],
                        ],
                    ]),
                    TemplateContent::section('story', 'content.image_text', [
                        'eyebrow' => 'Our story',
                        'heading' => 'Started with a single table by the water',
                        'body' => 'What began as a weekend pop-up is now a room for eighty, a garden, and a team of twenty-two who still plate every dish to order.',
                        'bullets' => "Family owned since 2009\nProduce from within 60 miles\nOpen kitchen, walk-ins welcome at lunch",
                        'buttonLabel' => 'Read the story',
                        'buttonUrl' => '/about',
                        'headingSize' => 36,
                    ]),
                    TemplateContent::section('gallery', 'gallery.grid', [
                        'eyebrow' => 'A look inside',
                        'heading' => 'The room',
                        'description' => 'Linen, timber, and the last of the evening light.',
                        'columns' => 3,
                        'headingSize' => 36,
                        'images' => [
                            ['src' => TemplateContent::photo('1414235077428-338989a2e8c0'), 'caption' => 'The pass'],
                            ['src' => TemplateContent::photo('1517248135467-4c7edcad34c4'), 'caption' => 'The room'],
                            ['src' => TemplateContent::photo('1510812439733-8860d8c5d019'), 'caption' => 'The list'],
                        ],
                    ]),
                    TemplateContent::section('cta', 'cta.simple', [
                        'heading' => 'Book tonight',
                        'description' => 'We hold a few tables for walk-ins. The rest go to reservations.',
                        'buttonLabel' => 'Reserve a table',
                        'buttonUrl' => '/contact',
                        'secondaryLabel' => 'See the menu',
                        'secondaryUrl' => '/menu',
                        'tone' => 'primary',
                        'headingSize' => 40,
                    ]),
                    TemplateContent::section('footer', 'footer.multi_column', $footer),
                ]),
            ],
            [
                'name' => 'Menu',
                'slug' => 'menu',
                'is_homepage' => false,
                'content_json' => TemplateContent::page([
                    TemplateContent::section('nav', 'navbar.cta', $nav),
                    TemplateContent::section('hero', 'hero.centered', [
                        'eyebrow' => 'Kitchen',
                        'heading' => 'Tonight’s menu',
                        'description' => 'Printed at four. Ask about the daily catch and the last of the garden herbs.',
                        'buttonLabel' => '',
                        'secondaryLabel' => '',
                        'showTrust' => false,
                        'headingSize' => 52,
                        'textAlign' => 'center',
                    ]),
                    TemplateContent::section('list', 'services.list', [
                        'eyebrow' => 'From the pass',
                        'heading' => 'Chef’s selection',
                        'description' => 'Served from 18:00 until close.',
                        'showPrice' => true,
                        'headingSize' => 32,
                        'items' => [
                            ['title' => 'Oysters', 'text' => 'Mignonette, lemon, rye toast.', 'price' => '18'],
                            ['title' => 'Catch of the day', 'text' => 'Charred greens, brown butter, capers.', 'price' => '34'],
                            ['title' => 'Harbour risotto', 'text' => 'Saffron, blue swimmer crab, herbs.', 'price' => '29'],
                            ['title' => 'Burnt honey tart', 'text' => 'Crème fraîche, toasted buckwheat.', 'price' => '14'],
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
                        'eyebrow' => 'Since 2009',
                        'heading' => 'A kitchen that still cooks like a home',
                        'body' => 'We source from the same growers we met at the Saturday market. The wine list is short on purpose. Sunday lunch is still the busiest service of the week.',
                        'bullets' => "Chef-owner on the pass most nights\nNo tasting menus, no theatre\nA garden room for fourteen",
                        'headingSize' => 40,
                    ]),
                    TemplateContent::section('quotes', 'testimonials.featured', [
                        'quote' => 'Our restaurant site finally matches the room. Guests mention it when they book.',
                        'name' => 'Riley Gomez',
                        'role' => 'Regular, Harbour Street',
                        'rating' => 5,
                        'stat' => '2×',
                        'statLabel' => 'more weekend covers',
                        'tone' => 'dark',
                    ]),
                    TemplateContent::section('footer', 'footer.centered', TemplateContent::footer($brand, ['tone' => 'surface'])),
                ]),
            ],
            [
                'name' => 'Private dining',
                'slug' => 'events',
                'is_homepage' => false,
                'content_json' => TemplateContent::page([
                    TemplateContent::section('nav', 'navbar.cta', $nav),
                    TemplateContent::section('hero', 'hero.centered', [
                        'eyebrow' => 'The garden room',
                        'heading' => 'Private dining for fourteen',
                        'description' => 'Buyouts, tastings, and a set menu written the week of your date.',
                        'showTrust' => false,
                        'headingSize' => 48,
                        'buttonLabel' => 'Inquire',
                        'buttonUrl' => '/contact',
                        'secondaryLabel' => '',
                    ]),
                    TemplateContent::section('rooms', 'features.cards', [
                        'heading' => 'How the room works',
                        'items' => [
                            ['title' => 'Garden room', 'text' => 'Fourteen seats, a door that closes, and a menu written for the table.', 'icon' => 'users'],
                            ['title' => 'Wine tastings', 'text' => 'Thursday flights with the sommelier. Book the long table.', 'icon' => 'coffee'],
                            ['title' => 'Full buyout', 'text' => 'Sunday lunch or a Monday evening when the room is yours.', 'icon' => 'star'],
                        ],
                    ]),
                    TemplateContent::section('hours', 'content.hours', [
                        'heading' => 'When we host',
                        'address' => '18 Harbour Street',
                        'phone' => '+1 (555) 018 2299',
                        'note' => 'Private dining is booked 10–21 days out. A deposit holds the date.',
                        'image' => TemplateContent::photo('1517248135467-4c7edcad34c4'),
                        'buttonLabel' => 'Request a date',
                        'buttonUrl' => '/contact',
                        'items' => [
                            ['day' => 'Garden room', 'hours' => 'Tue–Sat from 18:00'],
                            ['day' => 'Buyouts', 'hours' => 'Monday evenings · Sunday lunch'],
                            ['day' => 'Tastings', 'hours' => 'Thursday 17:00'],
                        ],
                    ]),
                    TemplateContent::section('footer', 'footer.multi_column', $footer),
                ]),
            ],
            [
                'name' => 'Contact',
                'slug' => 'contact',
                'is_homepage' => false,
                'content_json' => TemplateContent::page([
                    TemplateContent::section('nav', 'navbar.cta', $nav),
                    TemplateContent::section('hero', 'hero.split', [
                        'eyebrow' => 'Reservations',
                        'heading' => 'Visit us this weekend',
                        'description' => 'We would love to host you. Reserve a table, join a tasting, or drop in for lunch.',
                        'buttonLabel' => 'Send a request',
                        'buttonUrl' => '#reserve',
                        'secondaryLabel' => 'View the menu',
                        'secondaryUrl' => '/menu',
                        'headingSize' => 44,
                        'highlights' => [
                            ['label' => 'Open Tue – Sun'],
                            ['label' => 'Harbour-side terrace'],
                            ['label' => 'Walk-ins welcome at lunch'],
                        ],
                    ]),
                    TemplateContent::section('form', 'form.contact', [
                        'anchorId' => 'reserve',
                        'heading' => 'Request a table',
                        'description' => 'We confirm by email within a few hours.',
                        'buttonLabel' => 'Request a table',
                        'layout' => 'split',
                        'details' => [
                            ['icon' => 'map-pin', 'label' => 'Find us', 'value' => '18 Harbour Street'],
                            ['icon' => 'phone', 'label' => 'Call', 'value' => '+1 (555) 018 2299'],
                            ['icon' => 'clock', 'label' => 'Dinner', 'value' => 'Tue–Sat 18:00–23:00'],
                        ],
                    ]),
                    TemplateContent::section('footer', 'footer.multi_column', $footer),
                ]),
            ],
        ];
    }

    /** @return list<array<string, mixed>> */
    private function smallBusinessPages(): array
    {
        $brand = 'Fieldstone';
        $links = [
            ['label' => 'Services', 'url' => '/services'],
            ['label' => 'Team', 'url' => '/team'],
            ['label' => 'About', 'url' => '/about'],
            ['label' => 'Contact', 'url' => '/contact'],
        ];
        $nav = TemplateContent::nav($brand, $links, [
            'logoIcon' => 'briefcase',
            'showButton' => true,
            'buttonLabel' => 'Get a quote',
            'buttonUrl' => '/contact',
            'shadow' => true,
        ]);
        $footer = TemplateContent::footer($brand, [
            'tagline' => 'Books, payroll, and a partner who picks up the phone.',
            'columns' => [
                ['title' => 'Company', 'links' => "Services|/services\nTeam|/team\nAbout|/about\nContact|/contact"],
                ['title' => 'Office', 'links' => "Mon–Fri 9–5\nhello@fieldstone.example"],
            ],
            'tone' => 'dark',
        ]);

        return [
            [
                'name' => 'Home',
                'slug' => 'home',
                'is_homepage' => true,
                'content_json' => TemplateContent::page([
                    TemplateContent::section('nav', 'navbar.cta', $nav),
                    TemplateContent::section('hero', 'hero.business', [
                        'eyebrow' => 'Local since 2014',
                        'heading' => 'The books, without the backlog',
                        'description' => 'Fieldstone keeps small companies current on payroll, tax, and monthly reporting — then explains the numbers in plain language.',
                        'buttonLabel' => 'Book a call',
                        'buttonUrl' => '/contact',
                        'secondaryLabel' => 'See services',
                        'secondaryUrl' => '/services',
                        'headingSize' => 48,
                        'bodySize' => 18,
                        'animation' => 'fade-up',
                        'bullets' => "Monthly close in five business days\nPayroll that actually files on time\nA named bookkeeper, not a ticket queue",
                        'cardTitle' => 'Free 30-minute review',
                        'cardText' => 'We look at your current stack and send three specific improvements.',
                        'cardIcon' => 'target',
                        'reviewer' => 'Amelia Chen',
                        'reviewerRole' => 'Owner, Northwind Goods',
                        'review' => 'We stopped dreading month-end. Fieldstone replies the same day and the reports actually make sense.',
                    ]),
                    TemplateContent::section('features', 'features.grid', [
                        'eyebrow' => 'How we work',
                        'heading' => 'Clear, current, close to home',
                        'description' => 'A small team that still answers the phone.',
                        'headingSize' => 36,
                        'textAlign' => 'center',
                        'items' => [
                            ['title' => 'Named contact', 'text' => 'You work with one bookkeeper who already knows the business.', 'icon' => 'users'],
                            ['title' => 'Same-week close', 'text' => 'Month-end packs land by the fifth, with a one-page summary.', 'icon' => 'calendar'],
                            ['title' => 'Tax without panic', 'text' => 'Quarterlies, filings, and a calendar you can actually follow.', 'icon' => 'shield'],
                            ['title' => 'Tools you already use', 'text' => 'QuickBooks, Xero, or a simple export — we meet you there.', 'icon' => 'cpu'],
                        ],
                    ]),
                    TemplateContent::section('services', 'services.cards', [
                        'eyebrow' => 'Engagements',
                        'heading' => 'How we can help',
                        'description' => 'Start with a cleanup, or hand us the monthly close.',
                        'headingSize' => 36,
                        'showPrice' => true,
                        'showFeatures' => true,
                        'items' => [
                            [
                                'title' => 'Monthly books',
                                'text' => 'Categorizing, reconciliations, and a close pack you can send to your CPA.',
                                'icon' => 'book',
                                'price' => 'from $420 / mo',
                                'features' => "Bank recs\nP&L and balance sheet\nMonth-end call",
                            ],
                            [
                                'title' => 'Payroll',
                                'text' => 'Runs, filings, and new-hire paperwork without a second system to learn.',
                                'icon' => 'users',
                                'price' => 'from $180 / mo',
                                'features' => "Direct deposit\nState filings\nYear-end W-2s",
                            ],
                            [
                                'title' => 'Catch-up',
                                'text' => 'A finite project to bring last year current before tax season.',
                                'icon' => 'rocket',
                                'price' => 'from $1,800',
                                'features' => "Prior-year cleanup\nChart of accounts\nHandoff notes",
                            ],
                        ],
                    ]),
                    TemplateContent::section('proof', 'testimonials.cards', [
                        'eyebrow' => 'Clients',
                        'heading' => 'What owners say',
                        'headingSize' => 36,
                        'items' => [
                            ['text' => 'They rebuilt our close in three weeks. I finally know if we made money last month.', 'name' => 'Jonah Patel', 'role' => 'Operations, Lumen Studio', 'rating' => 5],
                            ['text' => 'Payroll used to take a Saturday. Now it takes a Tuesday morning.', 'name' => 'Priya Shah', 'role' => 'Founder, Shoreline Dental', 'rating' => 5],
                            ['text' => 'Human replies, real deadlines, no upsell every quarter.', 'name' => 'Marcus Hale', 'role' => 'Owner, Hale Electric', 'rating' => 5],
                        ],
                    ]),
                    TemplateContent::section('faq', 'faq.accordion', [
                        'eyebrow' => 'FAQ',
                        'heading' => 'Before we start',
                        'headingSize' => 36,
                        'items' => [
                            ['question' => 'Do you replace my CPA?', 'answer' => 'No. We keep the books current and hand a clean pack to your tax advisor each quarter.'],
                            ['question' => 'What software do you support?', 'answer' => 'QuickBooks Online and Xero day to day. We can export from most bank feeds either way.'],
                            ['question' => 'How fast can we start?', 'answer' => 'Most clients are live within ten days of a kickoff call and read-only access.'],
                        ],
                    ]),
                    TemplateContent::section('cta', 'cta.split', [
                        'heading' => 'Ready for a calmer close?',
                        'description' => 'Tell us how you run today. We will send a scoped quote, not a sales deck.',
                        'buttonLabel' => 'Get a quote',
                        'buttonUrl' => '/contact',
                        'headingSize' => 36,
                        'tone' => 'primary',
                    ]),
                    TemplateContent::section('footer', 'footer.multi_column', $footer),
                ]),
            ],
            [
                'name' => 'Services',
                'slug' => 'services',
                'is_homepage' => false,
                'content_json' => TemplateContent::page([
                    TemplateContent::section('nav', 'navbar.cta', $nav),
                    TemplateContent::section('hero', 'hero.centered', [
                        'eyebrow' => 'Services',
                        'heading' => 'Books, payroll, catch-up',
                        'description' => 'Pick a retainer or a finite project. Everything includes a named bookkeeper.',
                        'showTrust' => false,
                        'headingSize' => 44,
                    ]),
                    TemplateContent::section('grid', 'services.cards', [
                        'heading' => 'Engagements',
                        'showPrice' => true,
                        'showFeatures' => true,
                    ]),
                    TemplateContent::section('footer', 'footer.simple', TemplateContent::footer($brand)),
                ]),
            ],
            [
                'name' => 'Team',
                'slug' => 'team',
                'is_homepage' => false,
                'content_json' => TemplateContent::page([
                    TemplateContent::section('nav', 'navbar.cta', $nav),
                    TemplateContent::section('people', 'team.cards', [
                        'eyebrow' => 'The desk',
                        'heading' => 'The people on your books',
                        'description' => 'You get a named bookkeeper. These are the six.',
                        'columns' => 3,
                        'items' => [
                            ['name' => 'Maya Ortiz', 'role' => 'Lead bookkeeper', 'bio' => 'Monthly close, the fifth-of-month call, and the person you actually phone.', 'image' => TemplateContent::photo('1438761681033-6461ffad8d80', 600)],
                            ['name' => 'Jonah Patel', 'role' => 'Payroll', 'bio' => 'Runs, filings, and new-hire paperwork without a second system.', 'image' => TemplateContent::photo('1500648767791-00dcc994a43e', 600)],
                            ['name' => 'Amelia Chen', 'role' => 'Catch-up projects', 'bio' => 'The finite cleanup before tax season.', 'image' => TemplateContent::photo('1494790108377-be9c29b29330', 600)],
                            ['name' => 'Chris Hale', 'role' => 'Client success', 'bio' => 'Kickoffs, software access, and the calendar you can follow.', 'image' => TemplateContent::photo('1472099645785-5658abf4ff4e', 600)],
                            ['name' => 'Priya Shah', 'role' => 'Tax packing', 'bio' => 'Quarterlies and a clean handoff to your CPA.', 'image' => TemplateContent::photo('1544005313-94ddf0286df2', 600)],
                            ['name' => 'Sam Okonkwo', 'role' => 'Onboarding', 'bio' => 'Bank feeds, chart of accounts, and week-one hygiene.', 'image' => TemplateContent::photo('1507003211169-0a1dd7228f2d', 600)],
                        ],
                    ]),
                    TemplateContent::section('cta', 'cta.simple', [
                        'heading' => 'Meet before you switch',
                        'description' => 'A 30-minute review is how every engagement starts.',
                        'buttonLabel' => 'Book a call',
                        'buttonUrl' => '/contact',
                        'tone' => 'primary',
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
                    TemplateContent::section('hero', 'hero.image', [
                        'eyebrow' => 'The firm',
                        'heading' => 'A small team on Main Street',
                        'description' => 'Fieldstone is six people, one office, and a rule: we do not take on more clients than we can name.',
                        'headingSize' => 44,
                        'stats' => [
                            ['value' => '11 yrs', 'label' => 'In practice'],
                            ['value' => '80+', 'label' => 'Local companies'],
                            ['value' => '5 days', 'label' => 'Typical close'],
                        ],
                    ]),
                    TemplateContent::section('copy', 'content.two_columns', [
                        'eyebrow' => 'The firm',
                        'heading' => 'Why owners stay',
                        'columns' => [
                            ['title' => 'A named bookkeeper', 'text' => 'If the payroll file is late, you call Maya. We do not hide behind a ticket portal.', 'icon' => 'users'],
                            ['title' => 'A close you can read', 'text' => 'P&L, balance sheet, and a one-page summary by the fifth of each month.', 'icon' => 'book'],
                        ],
                    ]),
                    TemplateContent::section('footer', 'footer.centered', TemplateContent::footer($brand, ['tone' => 'surface'])),
                ]),
            ],
            [
                'name' => 'Contact',
                'slug' => 'contact',
                'is_homepage' => false,
                'content_json' => TemplateContent::page([
                    TemplateContent::section('nav', 'navbar.cta', $nav),
                    TemplateContent::section('hero', 'hero.centered', [
                        'eyebrow' => 'Contact',
                        'heading' => 'Tell us how you close today',
                        'description' => 'Share a few details. We reply within one business day with a scoped quote.',
                        'showTrust' => false,
                        'headingSize' => 44,
                    ]),
                    TemplateContent::section('form', 'form.lead', [
                        'heading' => 'Request a quote',
                        'buttonLabel' => 'Send details',
                        'layout' => 'split',
                        'details' => [
                            ['icon' => 'mail', 'label' => 'Email', 'value' => 'hello@fieldstone.example'],
                            ['icon' => 'phone', 'label' => 'Phone', 'value' => '+1 (555) 014 8800'],
                            ['icon' => 'clock', 'label' => 'Hours', 'value' => 'Mon–Fri 9:00–17:00'],
                        ],
                    ]),
                    TemplateContent::section('footer', 'footer.simple', TemplateContent::footer($brand)),
                ]),
            ],
        ];
    }

    /** @return list<array<string, mixed>> */
    private function barberPages(): array
    {
        $brand = 'Iron & Oak';
        $links = [
            ['label' => 'Services', 'url' => '/services'],
            ['label' => 'Barbers', 'url' => '/barbers'],
            ['label' => 'About', 'url' => '/about'],
            ['label' => 'Book', 'url' => '/contact'],
        ];
        $nav = TemplateContent::nav($brand, $links, [
            'logoIcon' => 'scissors',
            'showMark' => true,
            'tone' => 'dark',
            'showBorder' => false,
            'showButton' => true,
            'buttonLabel' => 'Book a chair',
            'buttonUrl' => '/contact',
            'buttonVariant' => 'accent',
        ]);
        $footer = TemplateContent::footer($brand, [
            'tagline' => 'Cuts, fades, and hot-towel shaves.',
            'tone' => 'dark',
            'columns' => [
                ['title' => 'Shop', 'links' => "Services|/services\nBarbers|/barbers\nAbout|/about\nBook|/contact"],
                ['title' => 'Hours', 'links' => "Tue–Fri 10–7\nSat 9–5\nClosed Sun–Mon"],
            ],
            'social' => [
                ['icon' => 'instagram', 'url' => '#'],
            ],
        ]);

        return [
            [
                'name' => 'Home',
                'slug' => 'home',
                'is_homepage' => true,
                'content_json' => TemplateContent::page([
                    TemplateContent::section('nav', 'navbar.cta', $nav),
                    TemplateContent::section('hero', 'hero.background', [
                        'eyebrow' => 'Est. 2016 · walk-ins after 3',
                        'heading' => 'Sharp fades. Clean lines. No rush.',
                        'description' => 'Four chairs, one shop. Book a cut or take the walk-in list after three.',
                        'buttonLabel' => 'Book a chair',
                        'buttonUrl' => '/contact',
                        'secondaryLabel' => 'See services',
                        'secondaryUrl' => '/services',
                        'headingSize' => 56,
                        'bodySize' => 18,
                        'headingWeight' => '600',
                        'minHeight' => 620,
                        'animation' => 'fade-up',
                        'backgroundType' => 'gradient',
                        'gradientFrom' => '#0c0c0c',
                        'gradientTo' => '#3f3a2a',
                        'gradientAngle' => 150,
                        'lightText' => true,
                    ]),
                    TemplateContent::section('services', 'services.cards', [
                        'eyebrow' => 'The chair',
                        'heading' => 'Cuts & shaves',
                        'description' => 'Cash or card. Tips stay with your barber.',
                        'headingSize' => 36,
                        'tone' => 'surface',
                        'showPrice' => true,
                        'showFeatures' => true,
                        'items' => [
                            [
                                'title' => 'Skin fade',
                                'text' => 'Tight blend, clean line-up, finished with a tonic.',
                                'icon' => 'scissors',
                                'price' => '$45',
                                'features' => "45 minutes\nHot towel finish\nProduct on request",
                            ],
                            [
                                'title' => 'Classic cut',
                                'text' => 'Scissor work with a shape that still looks right in two weeks.',
                                'icon' => 'sparkles',
                                'price' => '$38',
                                'features' => "40 minutes\nConsultation\nNeck shave",
                            ],
                            [
                                'title' => 'Beard sculpt',
                                'text' => 'Line, length, and oil. Pair it with a cut.',
                                'icon' => 'star',
                                'price' => '$22',
                                'features' => "20 minutes\nHot towel\nBeard oil",
                            ],
                        ],
                    ]),
                    TemplateContent::section('features', 'features.cards', [
                        'eyebrow' => 'The shop',
                        'heading' => 'How we run the room',
                        'headingSize' => 36,
                        'iconStyle' => 'solid',
                        'items' => [
                            ['title' => 'Booked chairs', 'text' => 'Pick a barber. We hold the time. Late after ten minutes goes to the list.', 'icon' => 'calendar'],
                            ['title' => 'Walk-ins after 3', 'text' => 'Name on the board, first empty chair. Usually twenty minutes.', 'icon' => 'clock'],
                            ['title' => 'Same-day touch-ups', 'text' => 'Line-up within seven days of your cut is on the house.', 'icon' => 'check-circle'],
                        ],
                    ]),
                    TemplateContent::section('quotes', 'testimonials.cards', [
                        'eyebrow' => 'Regulars',
                        'heading' => 'From the chairs',
                        'headingSize' => 36,
                        'tone' => 'surface',
                        'items' => [
                            ['text' => 'Best fade in town. They remember the part and they do not rush the blend.', 'name' => 'Andre M.', 'role' => 'Every three weeks', 'rating' => 5],
                            ['text' => 'Hot-towel shave is the real reason I keep the appointment.', 'name' => 'Luis R.', 'role' => 'Saturday regular', 'rating' => 5],
                            ['text' => 'Walked in at 3:10, in the chair by 3:30. Shop actually runs on time.', 'name' => 'Chris P.', 'role' => 'Walk-in', 'rating' => 5],
                        ],
                    ]),
                    TemplateContent::section('cta', 'cta.simple', [
                        'heading' => 'Take the next chair',
                        'description' => 'Book online or put your name on the walk-in list after three.',
                        'buttonLabel' => 'Book a chair',
                        'buttonUrl' => '/contact',
                        'note' => 'Tue–Fri 10–7 · Sat 9–5',
                        'tone' => 'primary',
                        'headingSize' => 40,
                    ]),
                    TemplateContent::section('footer', 'footer.multi_column', $footer),
                ]),
            ],
            [
                'name' => 'Services',
                'slug' => 'services',
                'is_homepage' => false,
                'content_json' => TemplateContent::page([
                    TemplateContent::section('nav', 'navbar.cta', $nav),
                    TemplateContent::section('hero', 'hero.centered', [
                        'eyebrow' => 'Menu',
                        'heading' => 'Price list',
                        'description' => 'Add a beard sculpt to any cut for $18.',
                        'showTrust' => false,
                        'headingSize' => 48,
                        'tone' => 'dark',
                    ]),
                    TemplateContent::section('list', 'services.list', [
                        'heading' => 'The chair',
                        'showPrice' => true,
                        'showNumbers' => true,
                        'items' => [
                            ['title' => 'Skin fade', 'text' => 'Clipper blend to skin, line-up, tonic.', 'price' => '$45'],
                            ['title' => 'Classic cut', 'text' => 'Scissors and clippers, neck shave.', 'price' => '$38'],
                            ['title' => 'Kids cut', 'text' => 'Under 12, weekdays before 4.', 'price' => '$28'],
                            ['title' => 'Hot towel shave', 'text' => 'Straight razor, two towels, balm.', 'price' => '$35'],
                            ['title' => 'Beard sculpt', 'text' => 'Line, length, oil.', 'price' => '$22'],
                            ['title' => 'Line-up only', 'text' => 'Within 7 days of a cut: complimentary.', 'price' => '$15'],
                        ],
                    ]),
                    TemplateContent::section('footer', 'footer.multi_column', $footer),
                ]),
            ],
            [
                'name' => 'Barbers',
                'slug' => 'barbers',
                'is_homepage' => false,
                'content_json' => TemplateContent::page([
                    TemplateContent::section('nav', 'navbar.cta', $nav),
                    TemplateContent::section('lead', 'team.spotlight', [
                        'eyebrow' => 'The chairs',
                        'heading' => 'Four barbers. Pick one and keep them.',
                        'description' => 'Saturday mornings rotate so nobody owns the rush.',
                        'name' => 'Andre M.',
                        'role' => 'Chair one · fades',
                        'quote' => 'If the blend is rushed, it shows in a week. I do not rush the blend.',
                        'image' => TemplateContent::photo('1507003211169-0a1dd7228f2d', 800),
                        'buttonLabel' => 'Book Andre',
                        'buttonUrl' => '/contact',
                        'tone' => 'dark',
                        'items' => [
                            ['name' => 'Luis R.', 'role' => 'Chair two · shaves', 'bio' => 'Hot-towel work and the slow classic cut.', 'image' => TemplateContent::photo('1500648767791-00dcc994a43e', 600)],
                            ['name' => 'Chris P.', 'role' => 'Chair three · scissor', 'bio' => 'Shape that still looks right in two weeks.', 'image' => TemplateContent::photo('1472099645785-5658abf4ff4e', 600)],
                            ['name' => 'Maya O.', 'role' => 'Chair four · texture', 'bio' => 'Curls, coils, and a consultation that is not theatre.', 'image' => TemplateContent::photo('1544005313-94ddf0286df2', 600)],
                        ],
                    ]),
                    TemplateContent::section('hours', 'content.hours', [
                        'heading' => 'When the chairs run',
                        'address' => '412 Oak Avenue',
                        'phone' => '+1 (555) 019 4410',
                        'note' => 'Walk-ins after 3. Booked chairs the rest of the day.',
                        'image' => TemplateContent::photo('1585747860715-2ba37e788b70'),
                        'buttonLabel' => 'Book a chair',
                        'buttonUrl' => '/contact',
                        'tone' => 'dark',
                        'items' => [
                            ['day' => 'Tuesday – Friday', 'hours' => '10:00 – 19:00'],
                            ['day' => 'Saturday', 'hours' => '09:00 – 17:00'],
                            ['day' => 'Sunday – Monday', 'hours' => 'Closed'],
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
                        'eyebrow' => 'The shop',
                        'heading' => 'Four chairs. No franchise.',
                        'body' => 'Iron & Oak opened in a former hardware store. The tin ceiling stayed. The barbers rotate Saturday mornings so nobody owns the rush.',
                        'bullets' => "Apprentices on Tuesday mornings\nWalk-ins after 3\nCoffee is free, tips are not",
                        'headingSize' => 40,
                        'tone' => 'dark',
                    ]),
                    TemplateContent::section('footer', 'footer.centered', TemplateContent::footer($brand, ['tone' => 'dark'])),
                ]),
            ],
            [
                'name' => 'Contact',
                'slug' => 'contact',
                'is_homepage' => false,
                'content_json' => TemplateContent::page([
                    TemplateContent::section('nav', 'navbar.cta', $nav),
                    TemplateContent::section('hero', 'hero.split', [
                        'eyebrow' => 'Book',
                        'heading' => 'Take a chair this week',
                        'description' => 'Name, cut, and preferred barber. We text a confirmation.',
                        'buttonLabel' => 'Send the request',
                        'buttonUrl' => '#book',
                        'secondaryLabel' => 'Price list',
                        'secondaryUrl' => '/services',
                        'headingSize' => 44,
                        'tone' => 'dark',
                        'highlights' => [
                            ['label' => 'Tue–Fri 10–7'],
                            ['label' => 'Sat 9–5'],
                            ['label' => 'Walk-ins after 3'],
                        ],
                    ]),
                    TemplateContent::section('form', 'form.contact', [
                        'anchorId' => 'book',
                        'heading' => 'Book a chair',
                        'description' => 'We confirm by text the same day.',
                        'buttonLabel' => 'Request a time',
                        'tone' => 'surface',
                        'details' => [
                            ['icon' => 'map-pin', 'label' => 'Shop', 'value' => '412 Oak Avenue'],
                            ['icon' => 'phone', 'label' => 'Call', 'value' => '+1 (555) 019 4410'],
                            ['icon' => 'clock', 'label' => 'Walk-ins', 'value' => 'After 3:00, Tue–Sat'],
                        ],
                    ]),
                    TemplateContent::section('footer', 'footer.multi_column', $footer),
                ]),
            ],
        ];
    }
}
