<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_renders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained()->cascadeOnDelete();
            $table->foreignId('page_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('revision_id')->nullable();
            // The public path this HTML answers, normalised to a leading slash
            // ("/" for the homepage). Lookups are by (site, path) on every
            // published request, so it carries the only index that matters.
            $table->string('path', 512);
            $table->longText('html');
            // Lets a republish skip the write when nothing actually changed,
            // which keeps ETags stable for clients and CDNs.
            $table->string('hash', 64);
            $table->timestamps();

            $table->unique(['site_id', 'path']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_renders');
    }
};
