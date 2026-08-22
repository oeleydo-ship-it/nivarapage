<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('livechat_widgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('site_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('public_key', 40)->unique();
            $table->boolean('enabled')->default(false);
            $table->boolean('ai_enabled')->default(true);
            $table->string('mode')->default('ai_first');
            $table->string('greeting')->default('Hi — how can we help?');
            $table->string('offline_message')->nullable();
            $table->string('primary_color')->default('#2563eb');
            $table->string('position')->default('right');
            $table->string('launcher_label')->default('Chat');
            $table->boolean('collect_name')->default(true);
            $table->boolean('collect_email')->default(true);
            $table->boolean('collect_phone')->default(true);
            $table->boolean('require_contact')->default(true);
            $table->json('settings')->nullable();
            $table->timestamps();

            $table->index(['workspace_id', 'enabled']);
        });

        Schema::create('livechat_knowledge', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('site_id')->constrained()->cascadeOnDelete();
            $table->foreignId('widget_id')->constrained('livechat_widgets')->cascadeOnDelete();
            $table->string('title');
            $table->string('source')->default('upload');
            $table->string('filename')->nullable();
            $table->string('mime')->nullable();
            $table->unsignedInteger('bytes')->default(0);
            $table->longText('content');
            $table->timestamps();

            $table->index(['site_id', 'widget_id']);
        });

        Schema::create('livechat_conversations', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('site_id')->constrained()->cascadeOnDelete();
            $table->foreignId('widget_id')->constrained('livechat_widgets')->cascadeOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('visitor_token_hash', 64);
            $table->string('status')->default('open');
            $table->string('handler')->default('ai');
            $table->string('visitor_name')->nullable();
            $table->string('visitor_email')->nullable();
            $table->string('visitor_phone')->nullable();
            $table->string('page_url')->nullable();
            $table->string('ip', 45)->nullable();
            $table->string('country')->nullable();
            $table->string('region')->nullable();
            $table->string('city')->nullable();
            $table->string('locale')->nullable();
            $table->string('timezone')->nullable();
            $table->string('browser')->nullable();
            $table->string('os')->nullable();
            $table->string('device')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['workspace_id', 'status', 'last_message_at']);
            $table->index(['site_id', 'status']);
            $table->index('visitor_token_hash');
        });

        Schema::create('livechat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('livechat_conversations')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('role');
            $table->text('body');
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['conversation_id', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('livechat_messages');
        Schema::dropIfExists('livechat_conversations');
        Schema::dropIfExists('livechat_knowledge');
        Schema::dropIfExists('livechat_widgets');
    }
};
