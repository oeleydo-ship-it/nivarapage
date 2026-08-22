<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('template_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_premium')->default(false);
            $table->string('thumbnail')->nullable();
            $table->timestamps();
        });

        Schema::create('template_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->boolean('is_homepage')->default(false);
            $table->json('content_json');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('template_pages');
        Schema::dropIfExists('templates');
        Schema::dropIfExists('template_categories');
    }
};
