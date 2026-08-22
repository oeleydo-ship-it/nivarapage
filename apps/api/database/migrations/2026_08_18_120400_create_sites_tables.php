<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('business_name')->nullable();
            $table->string('slug');
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->string('status')->default('draft');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['workspace_id', 'slug']);
        });

        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->unique()->constrained()->cascadeOnDelete();
            $table->text('default_description')->nullable();
            $table->string('favicon')->nullable();
            $table->string('social_image')->nullable();
            $table->string('robots')->nullable();
            $table->string('locale')->default('en');
            $table->string('timezone')->default('UTC');
            $table->boolean('redirect_secondary_to_primary')->default(true);
            $table->json('branding')->nullable();
            $table->json('extras')->nullable();
            $table->timestamps();
        });

        Schema::create('site_theme_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->unique()->constrained()->cascadeOnDelete();
            $table->json('tokens');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_theme_settings');
        Schema::dropIfExists('site_settings');
        Schema::dropIfExists('sites');
    }
};
