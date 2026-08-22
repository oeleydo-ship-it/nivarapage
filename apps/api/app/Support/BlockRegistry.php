<?php

namespace App\Support;

final class BlockRegistry
{
    /**
     * Allowed block types, preferring the generated catalog (which is derived
     * from packages/blocks) and falling back to the baked-in list when the
     * catalog file is unavailable.
     *
     * @return list<string>
     */
    public static function types(): array
    {
        $catalog = BlockCatalog::types();

        return $catalog !== [] ? $catalog : self::fallbackTypes();
    }

    /**
     * @return list<string>
     */
    private static function fallbackTypes(): array
    {
        return [
            'navbar.simple',
            'navbar.centered',
            'navbar.cta',
            'navbar.transparent',
            'navbar.pill',
            'navbar.split',
            'navbar.underline',
            'navbar.island',
            'navbar.utility',
            'navbar.minimal',
            'navbar.counsel',
            'hero.centered',
            'hero.split',
            'hero.image',
            'hero.background',
            'hero.saas',
            'hero.page',
            'hero.restaurant',
            'hero.business',
            'hero.studio',
            'hero.product',
            'hero.glow',
            'hero.panel',
            'content.text',
            'content.richtext',
            'content.image_text',
            'content.text_image',
            'content.centered',
            'content.two_columns',
            'features.cards',
            'features.icons',
            'features.grid',
            'features.showcase',
            'features.minimal',
            'features.rail',
            'services.cards',
            'services.grid',
            'services.list',
            'testimonials.cards',
            'testimonials.carousel',
            'testimonials.featured',
            'testimonials.bento',
            'testimonials.compact',
            'testimonials.rail',
            'pricing.two_columns',
            'pricing.three_columns',
            'pricing.comparison',
            'pricing.duo',
            'faq.accordion',
            'faq.two_column',
            'cta.simple',
            'cta.split',
            'cta.background',
            'cta.bar',
            'cta.gradient',
            'footer.simple',
            'footer.centered',
            'footer.multi_column',
            'form.contact',
            'form.lead',
            'form.newsletter',
            'form.quote',
            'gallery.grid',
            'gallery.masonry',
            'gallery.carousel',
            'gallery.logos',
            'gallery.compare',
            'gallery.projects',
            'stats.row',
            'stats.highlight',
            'process.steps',
            'process.timeline',
            'process.zigzag',
            'team.cards',
            'team.circle',
            'team.spotlight',
            'content.video',
            'content.hours',
            'content.skills',
            'content.map',
            'content.locations',
            'content.capabilities',
            'content.markers',
            'content.band',
            'content.ruled',
            'posts.cards',
            'blog.list',
            'blog.featured',
            'blog.magazine',
            'blog.overlay',
            'cta.banner',
            'proof.bar',
            'form.appointment',
            'generated.nav',
            'generated.hero',
            'generated.collection',
            'generated.story',
            'generated.voices',
            'generated.cta',
            'generated.footer',
            'generated.form',
            'navbar.verdara',
            'hero.verdara',
            'proof.verdara',
            'features.verdara',
            'cta.crew',
            'testimonials.verdara',
            'pricing.verdara',
            'cta.verdara',
            'footer.verdara',
        ];
    }

    public static function isAllowed(string $type): bool
    {
        return in_array($type, self::types(), true);
    }
}
