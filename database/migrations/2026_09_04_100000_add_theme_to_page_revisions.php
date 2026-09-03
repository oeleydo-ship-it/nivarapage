<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * What the site looked like when a revision was saved.
 *
 * A revision recorded the page's sections but not its theme, which lives on the
 * site rather than the page. Restoring one therefore brought back the old
 * layout wearing the current colours, fonts and spacing - a version that had
 * never actually existed. The tokens are copied in at save time so a restore
 * can put both halves back together.
 *
 * Nullable because every revision written before this column existed has no
 * snapshot to offer, and those must restore content only rather than blank a
 * live site's theme.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('page_revisions', 'theme_tokens')) {
            return;
        }

        Schema::table('page_revisions', function (Blueprint $table) {
            $table->json('theme_tokens')->nullable()->after('content_json');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('page_revisions', 'theme_tokens')) {
            return;
        }

        Schema::table('page_revisions', function (Blueprint $table) {
            $table->dropColumn('theme_tokens');
        });
    }
};
