<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The header and footer a site shows on every page.
 *
 * Until now a navbar and a footer were ordinary blocks inside each page, so a
 * five-page site held five copies of its own header and changing the menu meant
 * editing all five. These hold one copy per site, composed into every page when
 * it renders.
 *
 * Stored as section arrays in the same shape as a page's content, so the same
 * validator, the same blocks and the same editor all work on them unchanged.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->json('header_json')->nullable()->after('branding');
            $table->json('footer_json')->nullable()->after('header_json');
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn(['header_json', 'footer_json']);
        });
    }
};
