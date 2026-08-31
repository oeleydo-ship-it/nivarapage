<?php

namespace App\Http\Controllers;

use App\Services\PublicSiteResolver;
use App\Services\SeoService;
use App\Services\TenantCacheService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * sitemap.xml and robots.txt for published sites. These were served by the
 * renderer, which had to call the API for the same data this controller reads
 * directly.
 */
class PublishedSeoController extends Controller
{
    public function __construct(
        private readonly PublicSiteResolver $resolver,
        private readonly TenantCacheService $cache,
    ) {}

    public function sitemap(Request $request, SeoService $seo): Response
    {
        $site = $this->resolver->resolve($request->getHost());

        if (! $site || $site->status === 'disabled') {
            return new Response('', 404, ['Content-Type' => 'application/xml; charset=UTF-8']);
        }

        $entries = $this->cache->remember($this->cache->sitemapKey($site->id), fn () => $seo->sitemap($site));

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";
        foreach ($entries as $entry) {
            $loc = $entry['loc'] ?? null;
            if (! $loc) {
                continue;
            }
            $xml .= '  <url>'."\n".'    <loc>'.htmlspecialchars((string) $loc, ENT_XML1).'</loc>'."\n";
            if (! empty($entry['lastmod'])) {
                $xml .= '    <lastmod>'.htmlspecialchars((string) $entry['lastmod'], ENT_XML1).'</lastmod>'."\n";
            }
            $xml .= '  </url>'."\n";
        }
        $xml .= '</urlset>'."\n";

        return new Response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
            'Cache-Control' => 'public, max-age=0, s-maxage=300',
        ]);
    }

    public function robots(Request $request, SeoService $seo): Response
    {
        $site = $this->resolver->resolve($request->getHost());
        $scheme = $request->isSecure() ? 'https' : 'http';
        $sitemap = $scheme.'://'.$request->getHost().'/sitemap.xml';

        // No site, a disabled site, or a site that opted out of indexing must
        // not invite crawlers in - the sitemap would 404 for them anyway.
        $allowed = $site && $site->status !== 'disabled' && $seo->siteAllowsIndexing($site);

        $body = $allowed
            ? "User-agent: *\nAllow: /\n\nSitemap: {$sitemap}\n"
            : "User-agent: *\nDisallow: /\n";

        return new Response($body, 200, [
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Cache-Control' => 'public, max-age=0, s-maxage=300',
        ]);
    }
}
