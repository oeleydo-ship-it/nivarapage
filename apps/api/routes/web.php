<?php

use App\Http\Controllers\EntryController;
use App\Http\Controllers\PublishedFunnelController;
use App\Http\Controllers\PublishedSeoController;
use Illuminate\Support\Facades\Route;

// Published customer sites answer on their own hostnames, so these paths are
// registered once and resolve to whichever site the Host header names.
Route::get('/sitemap.xml', [PublishedSeoController::class, 'sitemap']);
Route::get('/robots.txt', [PublishedSeoController::class, 'robots']);

// Funnel steps resolve by public id before any hostname lookup, so a shared
// funnel link works on the platform domain as well as the site's own.
// The parameter is deliberately not named "funnel": AppServiceProvider
// binds that name to a workspace-scoped model lookup that 404s for
// signed-out visitors, which is the opposite of what a public funnel
// link needs.
Route::get('/f/{funnelKey}/{step?}', [PublishedFunnelController::class, 'show']);

// Everything else - the dashboard, the preview host, and every page of every
// published site - enters through one controller that dispatches on hostname.
Route::get('/', EntryController::class);
Route::get('/{path}', EntryController::class)->where('path', '.*');
