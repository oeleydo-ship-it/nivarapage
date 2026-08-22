<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('funnel_visitors', function (Blueprint $table) {
            $table->string('last_source')->nullable()->after('first_referrer');
            $table->string('last_medium')->nullable()->after('last_source');
            $table->string('last_campaign')->nullable()->after('last_medium');
            $table->text('last_referrer')->nullable()->after('last_campaign');
        });

        Schema::table('funnel_sessions', function (Blueprint $table) {
            $table->string('term')->nullable()->after('campaign');
            $table->string('content')->nullable()->after('term');
            $table->string('landing_page')->nullable()->after('content');
            $table->string('os')->nullable()->after('browser');
            $table->string('region')->nullable()->after('country');
            $table->string('city')->nullable()->after('region');
            $table->boolean('is_bot')->default(false)->after('city');
            $table->string('consent')->default('essential')->after('is_bot');
            $table->timestamp('converted_at')->nullable()->after('last_activity_at');
            $table->index(['funnel_id', 'source', 'started_at']);
            $table->index(['funnel_id', 'device', 'started_at']);
            $table->index(['funnel_id', 'country', 'started_at']);
        });

        Schema::table('funnel_events', function (Blueprint $table) {
            $table->uuid('idempotency_key')->nullable()->after('lead_id');
            $table->string('source')->nullable()->after('event_type');
            $table->string('medium')->nullable()->after('source');
            $table->string('campaign')->nullable()->after('medium');
            $table->string('device')->nullable()->after('campaign');
            $table->string('browser')->nullable()->after('device');
            $table->string('country')->nullable()->after('browser');
            $table->decimal('revenue', 14, 2)->default(0)->after('country');
            $table->string('currency', 3)->nullable()->after('revenue');
            $table->boolean('is_bot')->default(false)->after('currency');
            $table->timestamp('processed_at')->nullable()->after('occurred_at');
            $table->unique(['workspace_id', 'idempotency_key']);
            $table->index(['workspace_id', 'source', 'occurred_at']);
            $table->index(['workspace_id', 'device', 'occurred_at']);
            $table->index(['workspace_id', 'country', 'occurred_at']);
        });

        Schema::create('funnel_daily_stats', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('funnel_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('step_id')->default(0);
            $table->string('source')->default('direct');
            $table->string('campaign')->default('(none)');
            $table->string('device')->default('unknown');
            $table->string('country')->default('unknown');
            $table->unsignedBigInteger('views')->default(0);
            $table->unsignedBigInteger('unique_visitors')->default(0);
            $table->unsignedBigInteger('sessions')->default(0);
            $table->unsignedBigInteger('leads')->default(0);
            $table->unsignedBigInteger('conversions')->default(0);
            $table->unsignedBigInteger('orders')->default(0);
            $table->unsignedBigInteger('bookings')->default(0);
            $table->unsignedBigInteger('checkout_starts')->default(0);
            $table->decimal('revenue', 16, 2)->default(0);
            $table->timestamps();
            $table->unique(['date', 'workspace_id', 'funnel_id', 'step_id', 'source', 'campaign', 'device', 'country'], 'funnel_daily_stats_dimensions_unique');
            $table->index(['workspace_id', 'date']);
            $table->index(['funnel_id', 'date']);
        });

        Schema::create('funnel_daily_visitors', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('funnel_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('step_id')->default(0);
            $table->foreignId('visitor_id')->constrained('funnel_visitors')->cascadeOnDelete();
            $table->string('source')->default('direct');
            $table->string('campaign')->default('(none)');
            $table->string('device')->default('unknown');
            $table->string('country')->default('unknown');
            $table->timestamps();
            $table->unique(['date', 'funnel_id', 'step_id', 'visitor_id', 'source', 'campaign', 'device', 'country'], 'funnel_daily_visitor_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('funnel_daily_visitors');
        Schema::dropIfExists('funnel_daily_stats');
        Schema::table('funnel_events', function (Blueprint $table) {
            $table->dropUnique(['workspace_id', 'idempotency_key']);
            $table->dropIndex(['workspace_id', 'source', 'occurred_at']);
            $table->dropIndex(['workspace_id', 'device', 'occurred_at']);
            $table->dropIndex(['workspace_id', 'country', 'occurred_at']);
            $table->dropColumn(['idempotency_key', 'source', 'medium', 'campaign', 'device', 'browser', 'country', 'revenue', 'currency', 'is_bot', 'processed_at']);
        });
        Schema::table('funnel_sessions', function (Blueprint $table) {
            $table->dropIndex(['funnel_id', 'source', 'started_at']);
            $table->dropIndex(['funnel_id', 'device', 'started_at']);
            $table->dropIndex(['funnel_id', 'country', 'started_at']);
            $table->dropColumn(['term', 'content', 'landing_page', 'os', 'region', 'city', 'is_bot', 'consent', 'converted_at']);
        });
        Schema::table('funnel_visitors', function (Blueprint $table) {
            $table->dropColumn(['last_source', 'last_medium', 'last_campaign', 'last_referrer']);
        });
    }
};
