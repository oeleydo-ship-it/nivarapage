<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('funnels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('site_id')->constrained()->cascadeOnDelete();
            $table->foreignId('domain_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('type')->default('lead_generation');
            $table->string('goal')->default('collect_leads');
            $table->string('status')->default('draft');
            $table->json('settings')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['workspace_id', 'slug']);
            $table->index(['workspace_id', 'status']);
        });

        Schema::create('funnel_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('funnel_id')->constrained()->cascadeOnDelete();
            $table->foreignId('page_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->string('type')->default('landing_page');
            $table->string('status')->default('draft');
            $table->unsignedInteger('position')->default(0);
            $table->integer('canvas_x')->default(80);
            $table->integer('canvas_y')->default(80);
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['funnel_id', 'slug']);
            $table->index(['workspace_id', 'funnel_id', 'position']);
        });

        Schema::create('funnel_connections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('funnel_id')->constrained()->cascadeOnDelete();
            $table->foreignId('source_step_id')->constrained('funnel_steps')->cascadeOnDelete();
            $table->foreignId('target_step_id')->constrained('funnel_steps')->cascadeOnDelete();
            $table->string('connection_type')->default('default');
            $table->json('conditions')->nullable();
            $table->unsignedInteger('priority')->default(0);
            $table->timestamps();
            $table->unique(['source_step_id', 'target_step_id', 'connection_type'], 'funnel_connection_unique');
        });

        Schema::create('funnel_visitors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->uuid('uuid');
            $table->timestamp('first_seen_at');
            $table->timestamp('last_seen_at');
            $table->string('first_source')->nullable();
            $table->string('first_medium')->nullable();
            $table->string('first_campaign')->nullable();
            $table->text('first_referrer')->nullable();
            $table->timestamps();
            $table->unique(['workspace_id', 'uuid']);
        });

        Schema::create('funnel_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('visitor_id')->constrained('funnel_visitors')->cascadeOnDelete();
            $table->foreignId('funnel_id')->constrained()->cascadeOnDelete();
            $table->foreignId('landing_step_id')->nullable()->constrained('funnel_steps')->nullOnDelete();
            $table->uuid('session_uuid');
            $table->string('source')->nullable();
            $table->string('medium')->nullable();
            $table->string('campaign')->nullable();
            $table->text('referrer')->nullable();
            $table->string('device')->nullable();
            $table->string('browser')->nullable();
            $table->string('country', 2)->nullable();
            $table->timestamp('started_at');
            $table->timestamp('last_activity_at');
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();
            $table->unique(['workspace_id', 'session_uuid']);
            $table->index(['funnel_id', 'started_at']);
        });

        Schema::create('funnel_leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('funnel_id')->constrained()->cascadeOnDelete();
            $table->foreignId('funnel_step_id')->nullable()->constrained('funnel_steps')->nullOnDelete();
            $table->foreignId('visitor_id')->nullable()->constrained('funnel_visitors')->nullOnDelete();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('company')->nullable();
            $table->string('country')->nullable();
            $table->string('source')->nullable();
            $table->string('campaign')->nullable();
            $table->json('data')->nullable();
            $table->timestamps();
            $table->index(['workspace_id', 'email']);
            $table->index(['funnel_id', 'created_at']);
        });

        Schema::create('funnel_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('funnel_id')->constrained()->cascadeOnDelete();
            $table->foreignId('step_id')->nullable()->constrained('funnel_steps')->nullOnDelete();
            $table->foreignId('visitor_id')->nullable()->constrained('funnel_visitors')->nullOnDelete();
            $table->foreignId('session_id')->nullable()->constrained('funnel_sessions')->nullOnDelete();
            $table->foreignId('lead_id')->nullable()->constrained('funnel_leads')->nullOnDelete();
            $table->string('event_type');
            $table->json('event_data')->nullable();
            $table->text('url')->nullable();
            $table->text('referrer')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();
            $table->index(['funnel_id', 'occurred_at']);
            $table->index(['step_id', 'occurred_at']);
            $table->index(['event_type', 'occurred_at']);
            $table->index(['visitor_id', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('funnel_events');
        Schema::dropIfExists('funnel_leads');
        Schema::dropIfExists('funnel_sessions');
        Schema::dropIfExists('funnel_visitors');
        Schema::dropIfExists('funnel_connections');
        Schema::dropIfExists('funnel_steps');
        Schema::dropIfExists('funnels');
    }
};
