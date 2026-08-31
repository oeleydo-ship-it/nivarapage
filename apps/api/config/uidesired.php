<?php

return [
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:5174'),
    'renderer_url' => env('RENDERER_URL', 'http://localhost:3100'),
    'platform_domain' => env('PLATFORM_DOMAIN', 'sites.localhost'),
    'preview_domain' => env('PREVIEW_DOMAIN', 'preview.localhost'),
    'internal_renderer_secret' => env('INTERNAL_RENDERER_SECRET'),
    'domain_provider' => env('DOMAIN_PROVIDER', 'cloudflare'),
    'media_disk' => env('MEDIA_DISK', env('FILESYSTEM_DISK', 'public')),
    'seed_demo' => (bool) env('SEED_DEMO', false),
    'super_admin' => [
        'email' => env('SUPER_ADMIN_EMAIL', env('SUPER_ADMIN_USERNAME', 'admin@uidesired.test')),
        'password' => env('SUPER_ADMIN_PASSWORD', 'password'),
        'name' => env('SUPER_ADMIN_NAME', 'Super Admin'),
    ],
    // Hostnames that serve the builder dashboard. Every other hostname that
    // reaches the app is treated as a published customer site, so this list is
    // what separates "the product" from "a customer's website".
    'dashboard_hosts' => array_values(array_unique(array_filter([
        parse_url((string) env('APP_URL', ''), PHP_URL_HOST),
        parse_url((string) env('FRONTEND_URL', ''), PHP_URL_HOST),
    ]))),
    // Comma separated additions for deployments that reach the dashboard on
    // more than the two canonical URLs (a staging alias, a bare IP).
    'extra_dashboard_hosts' => env('DASHBOARD_HOSTS', ''),
    'trusted_hosts' => array_values(array_unique(array_filter(array_merge(
        [
            parse_url((string) env('APP_URL', 'http://localhost'), PHP_URL_HOST) ?: 'localhost',
            parse_url((string) env('FRONTEND_URL', 'http://localhost:5174'), PHP_URL_HOST) ?: 'localhost',
            'localhost',
            '127.0.0.1',
        ],
        array_filter(array_map('trim', explode(',', (string) env('TRUSTED_HOSTS', '')))),
    )))),
    'cache' => [
        // Use CACHE_STORE=redis in production. Tests keep CACHE_STORE=array.
        'ttl' => (int) env('PUBLIC_CACHE_TTL', 86400),
    ],
    'cloudflare' => [
        'saas_enabled' => (bool) env('CLOUDFLARE_SAAS_ENABLED', false),
        'api_token' => env('CLOUDFLARE_API_TOKEN'),
        'zone_id' => env('CLOUDFLARE_ZONE_ID'),
        'account_id' => env('CLOUDFLARE_ACCOUNT_ID'),
        // The Cloudflare for SaaS fallback origin: the hostname inside your zone
        // that custom hostnames resolve to, e.g. fallback.uidesired.com.
        'fallback_origin' => env('CLOUDFLARE_FALLBACK_ORIGIN'),
        // What customers actually CNAME to. Cloudflare recommends a dedicated
        // vanity record rather than exposing the fallback origin directly; when
        // unset we fall back to the origin so a minimal setup still works.
        'cname_target' => env('CLOUDFLARE_CNAME_TARGET', env('CLOUDFLARE_FALLBACK_ORIGIN')),
        // A/AAAA records handed to root domains at registrars with no
        // ALIAS/ANAME support. Comma separated. Leave empty and
        // ApexAddressResolver resolves the CNAME target instead; set it only
        // when the deployment has its own dedicated or BYOIP addresses.
        'apex_ips' => array_values(array_filter(array_map(
            'trim',
            explode(',', (string) env('CLOUDFLARE_APEX_IPS', '')),
        ))),
        // DV validation method for the custom hostname certificate. 'txt' lets a
        // customer prove ownership before their DNS points at us, which is the
        // only order that works when the site is already live elsewhere.
        'ssl_validation' => env('CLOUDFLARE_SSL_VALIDATION', 'txt'),
        'min_tls_version' => env('CLOUDFLARE_MIN_TLS_VERSION', '1.2'),
        'webhook_secret' => env('CLOUDFLARE_WEBHOOK_SECRET'),
    ],
    'turnstile' => [
        'site_key' => env('CLOUDFLARE_TURNSTILE_SITE_KEY'),
        'secret' => env('CLOUDFLARE_TURNSTILE_SECRET'),
    ],
];
