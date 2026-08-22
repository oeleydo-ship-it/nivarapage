<?php

use App\Support\Hostname;
use App\Services\TenantCacheService;

it('normalizes and validates hostnames', function () {
    expect(Hostname::normalize('HTTPS://WWW.Example.COM:443/path?x=1'))->toBe('www.example.com');
    expect(Hostname::isValid('www.example.com'))->toBeTrue();
    expect(Hostname::isValid('not a host'))->toBeFalse();
    expect(Hostname::isValid('https://evil.test'))->toBeTrue();
});

it('builds the published cache keys from the spec', function () {
    $cache = app(TenantCacheService::class);

    expect($cache->domainKey('www.customer.com'))->toBe('tenant:domain:www.customer.com');
    expect($cache->pageKey(123, 'home', 18))->toBe('published:site:123:page:home:v18');
    expect($cache->currentPageKey(123, '/about'))->toBe('published:site:123:page:about');
    expect($cache->themeKey(5))->toBe('published:site:5:theme');
    expect($cache->navKey(5))->toBe('published:site:5:nav');
});
