<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('funnels', function (Blueprint $table) {
            $table->foreignId('site_id')->nullable()->change();
            $table->uuid('public_id')->nullable()->after('id');
            $table->unique('public_id');
        });

        Schema::table('funnel_steps', function (Blueprint $table) {
            $table->json('draft_content')->nullable()->after('page_id');
            $table->json('published_content')->nullable()->after('draft_content');
            $table->string('seo_title')->nullable()->after('settings');
            $table->text('seo_description')->nullable()->after('seo_title');
        });

        DB::table('funnels')->orderBy('id')->each(function ($funnel) {
            DB::table('funnels')->where('id', $funnel->id)->update(['public_id' => (string) Str::uuid()]);
        });

        DB::table('funnel_steps')->whereNotNull('page_id')->orderBy('id')->each(function ($step) {
            $page = DB::table('pages')->where('id', $step->page_id)->first();
            if (! $page) return;
            $draft = $page->draft_revision_id ? DB::table('page_revisions')->where('id', $page->draft_revision_id)->value('content_json') : null;
            $published = $page->published_revision_id ? DB::table('page_revisions')->where('id', $page->published_revision_id)->value('content_json') : null;
            DB::table('funnel_steps')->where('id', $step->id)->update([
                'draft_content' => $draft,
                'published_content' => $published,
                'seo_title' => $page->seo_title,
                'seo_description' => $page->seo_description,
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('funnel_steps', function (Blueprint $table) {
            $table->dropColumn(['draft_content', 'published_content', 'seo_title', 'seo_description']);
        });
        Schema::table('funnels', function (Blueprint $table) {
            $table->dropUnique(['public_id']);
            $table->dropColumn('public_id');
        });
    }
};
