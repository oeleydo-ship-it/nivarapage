<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Renders for a funnel that has no site.
 *
 * Funnels were made standalone - site_id on funnels became nullable - but the
 * rendering half was left behind: page_renders.site_id is required, so a
 * standalone funnel had nowhere to store its HTML, and serving one asked for
 * the site it does not have. Every published standalone funnel answered with a
 * type error.
 *
 * A render now belongs to a site or to a funnel. NULLs do not collide in a
 * unique index, so the existing (site_id, path) key keeps working for sites
 * while funnel renders are keyed by (funnel_id, path).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('page_renders', function (Blueprint $table) {
            $table->foreignId('site_id')->nullable()->change();
            $table->foreignId('funnel_id')->nullable()->after('site_id')->constrained()->cascadeOnDelete();
            $table->unique(['funnel_id', 'path']);
        });
    }

    public function down(): void
    {
        Schema::table('page_renders', function (Blueprint $table) {
            $table->dropUnique(['funnel_id', 'path']);
            $table->dropConstrainedForeignId('funnel_id');
        });
    }
};
