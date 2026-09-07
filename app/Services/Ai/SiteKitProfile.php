<?php

namespace App\Services\Ai;

use App\Models\Page;
use App\Models\Site;
use App\Support\BlockCatalog;

/**
 * Works out which template kit a site is already built from, so anything the
 * AI adds looks like it belongs.
 *
 * Block types are `purpose.family` (`hero.cinder`, `navbar.voltera`), so the
 * family is the suffix. Generic shapes such as `hero.centered` share that form
 * but are not kits, so only suffixes with enough blocks to dress a whole page
 * count.
 */
class SiteKitProfile
{
    /** A suffix needs at least this many blocks to be a kit rather than a shape. */
    public const MIN_KIT_BLOCKS = 6;

    /**
     * What each kit looks like, and the name people know it by.
     *
     * Art direction picks a kit for a brief. Given only the sections a kit can
     * build it can judge whether a kit *fits* but not whether it *suits* - the
     * choice between a black VC deck and a mint AI-launch page is a question of
     * look, and both can build a pricing page. These lines are drawn from each
     * kit's own source header, or from its template description where the source
     * carries none, so they describe what is really on screen.
     *
     * A kit missing from here still works; it is simply offered without a
     * description, which is what AiArtDirectionTest guards against.
     *
     * @var array<string, array{label: string, note: string}>
     */
    public const KIT_NOTES = [
        'concourse' => ['label' => 'Concourse', 'note' => 'Enterprise finance platform. Cinematic video hero, navy and white sections, large light-weight type, restrained motion, image cards, interactive agent reports, and editorial customer stories.'],
        'forma' => [
            'label' => 'Forma',
            'note' => 'Independent design studio, editorial and warm. Bone-white and oat pages, terracotta accent, near-black serif headlines set tight, pill buttons, numbered sections and full-bleed project artwork.',
        ],
        'voltera' => [
            'label' => 'Voltera',
            'note' => 'High-energy marketing agency. Electric indigo-blue panels on white, chartreuse lime pill buttons, near-black geometric headlines, generously rounded cards.',
        ],
        'halcyon' => [
            'label' => 'Halcyon',
            'note' => 'Calm bootstrapped SaaS. Near-white pages lit by soft pastel blooms, two-tone headlines, hairline white cards, a bright sky-blue accent and a near-black footer.',
        ],
        'meridian' => [
            'label' => 'Meridian',
            'note' => 'Developer infrastructure and fintech. Near-white with pastel gradient-mesh panels, a lavender band for company pages, ink-dark enterprise bands, solid black pill buttons.',
        ],
        'aperture' => [
            'label' => 'Aperture',
            'note' => 'Creative agency and design studio. A white sheet broken by ink-black service bands and faint cool-grey process bands, one warm coral accent on kickers and numbering, large geometric headlines set tight, heavily rounded photography.',
        ],
        'kirki' => [
            'label' => 'Kirki',
            'note' => 'Revenue-consulting agency. Off-white sheet, tight 600-weight Inter headlines, one lime-yellow accent carrying every button and the footer contact band, a white star-rating pill opening every hero, heavily rounded 16-20px cards, a stat or client name proving nearly every claim.',
        ],
        'anchor' => [
            'label' => 'Anchorline',
            'note' => 'Editorial freight forwarding and logistics. A wide near-white sheet ruled by hairlines, Newsreader serif headlines over Poppins body, a utility bar above the navbar, and a photo hero cut by a diagonal brand wedge.',
        ],
        'tessera' => [
            'label' => 'Tessera',
            'note' => 'Light editorial B2B. A near-white sheet ruled by hairline dividers rather than colour changes, one warm ember accent, tight geometric grotesk, black footer.',
        ],
        'quarry' => [
            'label' => 'Quarry',
            'note' => 'Regulated operations and industry. Warm bone grounds, deep forest-green bands, marker-highlight accents, uppercase grotesk headings and mono micro-labels.',
        ],
        'vantage' => [
            'label' => 'Vantage.OS',
            'note' => 'Calm platform and IT services. Playfair Display headlines on near-white, monospace micro labels, a single royal-blue accent and deep-navy impact bands.',
        ],
        'junction' => [
            'label' => 'Junction',
            'note' => 'Automation and AI orchestration. Figtree headlines on warm off-white, one hot-orange accent, near-black buttons, tinted screenshot cards, deep olive and indigo bands.',
        ],
        'kindred' => [
            'label' => 'Kindred',
            'note' => 'Group brand or family of companies. A saturated brand red, pale-pink bands with slanted edges, bold geometric headlines closed by a red full stop, serif editorial titles.',
        ],
        'northbook' => [
            'label' => 'Northbook',
            'note' => 'Professional accountancy and financial services. Deep teal-navy headings closed by a green full stop, a pale sage hero band, green pill buttons, thin-bordered white cards.',
        ],
        'axiom' => [
            'label' => 'Axiom North',
            'note' => 'Dark venture capital and advisory. Near-black throughout, Syne and DM Sans, amber glow accents, portfolio filters - confident and exclusive.',
        ],
        'cinder' => [
            'label' => 'Cinder & Row',
            'note' => 'Full-width editorial trade services, built for heating and home trades. Oversized serif type, orange italic accents, bento service cards, local coverage.',
        ],
        'lumen' => [
            'label' => 'Lumen & Lane',
            'note' => 'Practical local trades, built for electricians. Navy and signal-yellow, framed photo heroes, plain service cards, transparent pricing and booking forms.',
        ],
        'moksha' => [
            'label' => 'Nivara',
            'note' => 'Wellness, yoga and studio spaces. Clean purple on white, an immersive photo hero, class programmes, instructor story - warm and unhurried.',
        ],
        'solara' => [
            'label' => 'Solara',
            'note' => 'Light AI-agent product launch. Inter on white with a light orange wash, a pastel feature stack, monthly and yearly pricing, a peach footer.',
        ],
        'verdara' => [
            'label' => 'Verdara',
            'note' => 'Light AI product launch with a green cast. Inter, mint glow, overlapping photography and scroll motion - fresh and optimistic.',
        ],
        'curalo' => [
            'label' => 'Curalo',
            'note' => 'Personal training and coaching. Photographic hero and CTA bands broken by pure-black navigation, testimonial and footer sections, one bright cyan accent on every button and eyebrow, tight uppercase IBM Plex Mono headlines over plain Inter body copy.',
        ],
        'salone' => [
            'label' => 'Salone',
            'note' => 'Beauty salon and spa. A warm cream sheet broken only by a near-black footer, one antique-gold accent on every button and icon, Playfair Display serif headlines over Work Sans body copy, a Dancing Script cursive kicker above every heading, a bordered service grid and a specialist team with hover overlays.',
        ],
        'lifesure' => [
            'label' => 'LifeSure',
            'note' => 'Life insurance and financial services. A two-tier header - a slim contact topbar over a pill-shaped nav bar - a royal-blue hero band, DM Sans headlines over Inter body copy, heavily rounded cards that flood with royal blue on hover, and a near-navy footer with an Instagram photo grid.',
        ],
        'raft' => [
            'label' => 'Raft',
            'note' => 'Dark fintech and neobank landing page. An all-black canvas lit by one vivid signal-green accent that floods full-bleed statement and testimonial bands, a darker forest green on every button, softly rounded charcoal cards, and a light-weight geometric sans for headlines. Single long-scroll page, not a multi-page site.',
        ],
        'aterra' => [
            'label' => 'Aterra',
            'note' => 'Architecture and interior-design studio. A white sheet broken by full-bleed photography and one deep-teal brand colour that carries every button, heading and dark band, DM Sans headlines throughout, a pill-shaped floating nav bar, numbered process steps, a photo-tile service grid and project gallery, across Home, About, Services, Projects and Contact pages.',
        ],
        'gleam' => [
            'label' => 'Gleam',
            'note' => 'Home and office cleaning services. A playful high-contrast palette of one bold indigo-violet and one warm yellow over navy-ink headlines, fully-pill buttons, big rounded Rubik type, full-bleed photography with a light wash instead of a dark scrim, an overlapping photo collage, a solid-colour feature band and a quote carousel, across Home, About, Services, Blog and Contact pages.',
        ],
        'mechanic' => [
            'label' => 'The Mechanic',
            'note' => 'Auto-repair and garage services. A deep navy blue carries every dark band, headline and outline button, one warm gold accent lifts eyebrows and highlights, pill buttons throughout, big bold Epilogue type, a photo-caption stack, solid navy feature cards, a numbered full-bleed service grid and a footer booking form, across Home, About, Services, Team and Contact pages.',
        ],
        'finlio' => [
            'label' => 'Finlio',
            'note' => 'Personal-finance and fintech SaaS. A pale-cream page shows between big rounded dark-green card sections, one bright lime-green accent lights highlighted words, buttons and stat gradients, confident medium-weight Archivo type, a dashboard-mockup feature stack with stat cards and mini bar charts, labelled progress bars and a plain-list FAQ.',
        ],
        'havven' => [
            'label' => 'Havven',
            'note' => 'Digital agency and creative studio. A warm cream page with white cards, one near-black forest ink carrying every heading, pill button and dark band, bold tight-tracked Plus Jakarta Sans headlines over plain Inter body copy, pill badges with a hairline border above every heading, a hero proof card with star rating and client avatars, a numbered accordion service list, a project gallery, numbered roadmap steps and a dark quote carousel.',
        ],
        'corewave' => [
            'label' => 'Corewave',
            'note' => 'Software and product-development studio. A warm off-white page carries a floating gradient-blob hero card, medium-weight Space Grotesk headlines over plain Sora body copy, one vivid violet accent and one lime-green accent trading off across highlighted words, pill badges and buttons, organic blob-cropped photography, giant ghost numerals behind numbered process steps, tinted-card testimonials and a dark navy footer.',
        ],
        'novalta' => [
            'label' => 'Novalta',
            'note' => 'AI-innovation studio. A soft off-white page carries one signature blue-to-coral gradient painted across every primary button and highlighted headline word, playful rounded Fredoka display type over plain Manrope body copy, arch-topped photography, floating pastel stat bubbles, full-bleed stacked colour panels telling the studio story, a filtered work grid, a client case-study accordion and a near-black gradient footer band.',
        ],
    ];

    /**
     * Design props that are page-wide conventions rather than per-section
     * choices. Mirrors the editor's own inheritance list, so a block the AI
     * writes matches one the user drags in.
     *
     * @var list<string>
     */
    public const DESIGN_PROPS = [
        'animation',
        'animationTrigger',
        'animationDuration',
        'contentWidth',
        'headingFont',
        'bodyFont',
        'headingWeight',
        'bodyWeight',
        'eyebrowStyle',
    ];

    /**
     * The name a kit goes by, which is not always its block suffix: the `moksha`
     * blocks are the Nivara template, and `cinder` is Cinder & Row.
     */
    public static function labelFor(string $key): string
    {
        return self::KIT_NOTES[$key]['label'] ?? ucfirst($key);
    }

    /**
     * Every family large enough to count as a kit.
     *
     * @return array<string, list<string>> suffix => block types
     */
    public function kits(): array
    {
        $families = [];
        foreach (BlockCatalog::types() as $type) {
            if (! str_contains($type, '.')) {
                continue;
            }
            [$purpose, $family] = explode('.', $type, 2);
            if ($purpose === 'generated') {
                continue;
            }
            $families[$family][] = $type;
        }

        return array_filter($families, fn (array $types) => count($types) >= self::MIN_KIT_BLOCKS);
    }

    /**
     * Every kit, described well enough for the AI to choose one for a new site.
     *
     * The purposes are the part of a type before the dot, so they say what a kit
     * can actually build - a kit with no pricing block is the wrong home for a
     * pricing page. Sending this instead of the full catalogue keeps the choice
     * small: all 368 blocks with their props run to about 75,000 characters,
     * while one kit's blocks are nearer 5,000.
     *
     * @return list<array{key: string, label: string, note: string, blocks: int, purposes: list<string>}>
     */
    public function catalogue(): array
    {
        $out = [];

        foreach ($this->kits() as $key => $types) {
            $purposes = [];
            foreach ($types as $type) {
                $purposes[explode('.', $type, 2)[0]] = true;
            }
            ksort($purposes);

            $out[] = [
                'key' => $key,
                'label' => self::labelFor($key),
                'note' => self::KIT_NOTES[$key]['note'] ?? '',
                'blocks' => count($types),
                'purposes' => array_keys($purposes),
            ];
        }

        usort($out, fn (array $a, array $b) => $b['blocks'] <=> $a['blocks']);

        return $out;
    }

    /**
     * One kit by key, shaped like detect() so callers cannot tell the two apart.
     *
     * @param  array<string, mixed>  $design
     * @return array{key: string, label: string, types: list<string>, design: array<string, mixed>}|null
     */
    public function kit(string $key, array $design = []): ?array
    {
        $kits = $this->kits();
        $key = strtolower(trim($key));

        if (! isset($kits[$key])) {
            return null;
        }

        return [
            'key' => $key,
            'label' => self::labelFor($key),
            'types' => $kits[$key],
            'design' => $design,
        ];
    }

    /**
     * The kit this site is built from, or null when it is not using one.
     *
     * @param  list<array<string, mixed>>|null  $sections  live editor content, preferred over the saved pages
     * @return array{key: string, label: string, types: list<string>, design: array<string, mixed>}|null
     */
    public function detect(Site $site, ?array $sections = null): ?array
    {
        $sections = $sections ?? $this->siteSections($site);
        if ($sections === []) {
            return null;
        }

        $kits = $this->kits();
        $counts = [];
        foreach ($sections as $section) {
            $type = is_array($section) ? (string) ($section['type'] ?? '') : '';
            if (! str_contains($type, '.')) {
                continue;
            }
            $family = explode('.', $type, 2)[1];
            if (isset($kits[$family])) {
                $counts[$family] = ($counts[$family] ?? 0) + 1;
            }
        }

        if ($counts === []) {
            return null;
        }

        arsort($counts);
        $key = (string) array_key_first($counts);

        return [
            'key' => $key,
            'label' => self::labelFor($key),
            'types' => $kits[$key],
            'design' => $this->designFrom($sections),
        ];
    }

    /**
     * The design props this page uses consistently, so new sections can adopt
     * them. Only values a clear majority agree on are returned, so one oddly
     * styled section never becomes the convention.
     *
     * @param  list<array<string, mixed>>  $sections
     * @return array<string, mixed>
     */
    public function designFrom(array $sections): array
    {
        $body = array_values(array_filter(
            $sections,
            fn ($section) => is_array($section)
                && ! preg_match('/^(navbar|topbar|subnav|footer)\./', (string) ($section['type'] ?? '')),
        ));

        if (count($body) < 2) {
            return [];
        }

        $profile = [];
        foreach (self::DESIGN_PROPS as $prop) {
            $tally = [];
            $defined = 0;
            foreach ($body as $section) {
                $value = $section['props'][$prop] ?? null;
                if ($value === null || $value === '') {
                    continue;
                }
                $defined++;
                $id = json_encode($value);
                $tally[$id] = ['value' => $value, 'count' => ($tally[$id]['count'] ?? 0) + 1];
            }

            if ($defined < 2) {
                continue;
            }

            uasort($tally, fn ($a, $b) => $b['count'] <=> $a['count']);
            $winner = reset($tally);
            if ($winner && $winner['count'] / $defined >= 0.6) {
                $profile[$prop] = $winner['value'];
            }
        }

        return $profile;
    }

    /**
     * Fills in the kit's design conventions on sections that left them out.
     *
     * The prompt asks the model for these, but a model that forgets should not
     * produce a section that looks foreign, so they are enforced here too.
     *
     * @param  list<array<string, mixed>>  $sections
     * @param  array<string, mixed>  $design
     * @return list<array<string, mixed>>
     */
    public function applyDesign(array $sections, array $design, bool $overwrite = false): array
    {
        if ($design === []) {
            return $sections;
        }

        foreach ($sections as $index => $section) {
            if (! is_array($section)) {
                continue;
            }
            $props = is_array($section['props'] ?? null) ? $section['props'] : [];
            foreach ($design as $prop => $value) {
                // Matching an existing page fills gaps only, so a section that
                // was styled deliberately keeps its styling. Art direction for a
                // new site is the deliberate choice, and has to beat the block
                // defaults it is being merged onto.
                $missing = ! array_key_exists($prop, $props) || $props[$prop] === '' || $props[$prop] === null;
                if ($overwrite || $missing) {
                    $props[$prop] = $value;
                }
            }
            $sections[$index]['props'] = $props;
        }

        return $sections;
    }

    /**
     * Every section across the site's pages, newest draft content first.
     *
     * @return list<array<string, mixed>>
     */
    private function siteSections(Site $site): array
    {
        $site->loadMissing('pages.draftRevision');
        $sections = [];

        foreach ($site->pages as $page) {
            foreach ($this->pageSections($page) as $section) {
                $sections[] = $section;
            }
        }

        return $sections;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function pageSections(Page $page): array
    {
        $content = $page->draftRevision?->content_json;
        $sections = is_array($content['sections'] ?? null) ? $content['sections'] : [];

        return array_values(array_filter($sections, 'is_array'));
    }
}
