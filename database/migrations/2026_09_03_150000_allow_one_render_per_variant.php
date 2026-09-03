<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * One render per version, not one per path.
 *
 * When funnel renders were first keyed by funnel, a step had exactly one page,
 * so (funnel_id, path) was the right key. An experiment stores the control and
 * each variant under the same path, and that index refuses the second one. The
 * key that replaces it already exists; this drops the one it supersedes.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('page_renders', function (Blueprint $table) {
            $table->dropUnique(['funnel_id', 'path']);
        });
    }

    public function down(): void
    {
        Schema::table('page_renders', function (Blueprint $table) {
            $table->unique(['funnel_id', 'path']);
        });
    }
};
