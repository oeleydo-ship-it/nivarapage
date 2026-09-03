<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A/B testing a funnel step.
 *
 * A variant is another version of one step. Which one a visitor gets is decided
 * once and remembered, because a person who sees a different page on every
 * visit tells you nothing about either of them.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('funnel_step_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('funnel_step_id')->constrained()->cascadeOnDelete();
            // Short and stable: it goes in a cookie and into the render key, so
            // renaming the variant must not reshuffle who sees what.
            $table->string('key', 32);
            $table->string('name');
            $table->json('draft_content')->nullable();
            $table->json('published_content')->nullable();
            // Relative share, so 1 and 3 means a quarter and three quarters.
            $table->unsignedInteger('weight')->default(1);
            $table->string('status')->default('active');
            $table->timestamps();

            $table->unique(['funnel_step_id', 'key']);
        });

        Schema::table('page_renders', function (Blueprint $table) {
            // Each variant is published as its own HTML; the request picks one.
            $table->foreignId('variant_id')->nullable()->after('funnel_id')
                ->constrained('funnel_step_variants')->cascadeOnDelete();
            $table->unique(['funnel_id', 'path', 'variant_id'], 'page_renders_funnel_variant_unique');
        });

        Schema::table('funnel_events', function (Blueprint $table) {
            // Without this an experiment can count how many people arrived but
            // not which version they were looking at when they converted.
            $table->foreignId('variant_id')->nullable()->after('step_id')
                ->constrained('funnel_step_variants')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('funnel_events', function (Blueprint $table) {
            $table->dropConstrainedForeignId('variant_id');
        });

        Schema::table('page_renders', function (Blueprint $table) {
            $table->dropUnique('page_renders_funnel_variant_unique');
            $table->dropConstrainedForeignId('variant_id');
        });

        Schema::dropIfExists('funnel_step_variants');
    }
};
