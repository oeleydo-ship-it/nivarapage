<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('storage_settings', function (Blueprint $table) {
            $table->id();
            $table->string('provider')->default('local');
            $table->string('bucket')->nullable();
            $table->string('region')->nullable();
            $table->string('endpoint')->nullable();
            $table->string('public_url')->nullable();
            $table->string('root')->nullable();
            $table->boolean('use_path_style_endpoint')->default(false);
            // Laravel `encrypted` cast; never exposed through the API.
            $table->text('access_key_id')->nullable();
            $table->text('secret_access_key')->nullable();
            $table->timestamp('last_tested_at')->nullable();
            $table->string('last_test_status')->nullable();
            $table->text('last_test_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('storage_settings');
    }
};
