<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Google Analytics and Search Console verification, per site.
 *
 * A site can answer on several connected domains, but they all render the
 * same pages, so tracking and verification live once here rather than per
 * domain.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->string('google_analytics_id')->nullable()->after('robots');
            $table->string('google_site_verification')->nullable()->after('google_analytics_id');
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn(['google_analytics_id', 'google_site_verification']);
        });
    }
};
