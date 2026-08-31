<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cloudflare_settings', function (Blueprint $table) {
            $table->id();
            // Null means "follow CLOUDFLARE_SAAS_ENABLED"; a boolean overrides it.
            $table->boolean('enabled')->nullable();
            // Laravel `encrypted` cast; never exposed through the API.
            $table->text('api_token')->nullable();
            $table->text('webhook_secret')->nullable();
            $table->string('zone_id')->nullable();
            $table->string('account_id')->nullable();
            $table->string('fallback_origin')->nullable();
            $table->string('cname_target')->nullable();
            $table->string('apex_ips')->nullable();
            $table->string('ssl_validation')->nullable();
            $table->string('min_tls_version')->nullable();
            $table->timestamp('last_tested_at')->nullable();
            $table->string('last_test_status')->nullable();
            $table->text('last_test_message')->nullable();
            $table->timestamp('fallback_synced_at')->nullable();
            $table->string('fallback_status')->nullable();
            $table->text('fallback_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cloudflare_settings');
    }
};
