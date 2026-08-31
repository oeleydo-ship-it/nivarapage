<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('google_auth_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('enabled')->default(true);
            $table->text('client_id')->nullable();
            // Laravel `encrypted` cast; never exposed through the API.
            $table->text('client_secret')->nullable();
            $table->text('redirect_uri')->nullable();
            // When false, Google may only sign in users that already exist.
            $table->boolean('allow_registration')->default(true);
            // Comma-separated email domains; empty means any domain.
            $table->text('allowed_domains')->nullable();
            $table->string('prompt')->default('select_account');
            $table->timestamp('last_tested_at')->nullable();
            $table->string('last_test_status')->nullable();
            $table->text('last_test_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('google_auth_settings');
    }
};
