<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('domains', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('site_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->string('hostname');
            $table->boolean('is_primary')->default(false);
            $table->string('status')->default('pending');
            $table->string('provider')->nullable();
            $table->string('provider_reference')->nullable();
            $table->string('verification_method')->nullable();
            $table->string('verification_status')->nullable();
            $table->json('verification_data')->nullable();
            $table->string('ssl_status')->nullable();
            $table->timestamp('last_checked_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->unique('hostname');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('domains');
    }
};
