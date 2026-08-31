<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Advanced funnel analytics: attribution columns on the raw tables, plus the
 * two daily aggregate tables the reporting screens read from.
 *
 * Written to be re-runnable. The first run of this migration on MySQL created
 * funnel_daily_stats and then died adding its unique index, which leaves the
 * schema half-applied while the migration itself stays unrecorded - so it
 * starts again from the top against a database that already has most of it.
 * SQLite never hit this, because it has no index key-length limit.
 */
return new class extends Migration
{
    public function up(): void
    {
        $this->addColumns('funnel_visitors', [
            'last_source' => fn (Blueprint $t) => $t->string('last_source')->nullable()->after('first_referrer'),
            'last_medium' => fn (Blueprint $t) => $t->string('last_medium')->nullable()->after('last_source'),
            'last_campaign' => fn (Blueprint $t) => $t->string('last_campaign')->nullable()->after('last_medium'),
            'last_referrer' => fn (Blueprint $t) => $t->text('last_referrer')->nullable()->after('last_campaign'),
        ]);

        $this->addColumns('funnel_sessions', [
            'term' => fn (Blueprint $t) => $t->string('term')->nullable()->after('campaign'),
            'content' => fn (Blueprint $t) => $t->string('content')->nullable()->after('term'),
            'landing_page' => fn (Blueprint $t) => $t->string('landing_page')->nullable()->after('content'),
            'os' => fn (Blueprint $t) => $t->string('os')->nullable()->after('browser'),
            'region' => fn (Blueprint $t) => $t->string('region')->nullable()->after('country'),
            'city' => fn (Blueprint $t) => $t->string('city')->nullable()->after('region'),
            'is_bot' => fn (Blueprint $t) => $t->boolean('is_bot')->default(false)->after('city'),
            'consent' => fn (Blueprint $t) => $t->string('consent')->default('essential')->after('is_bot'),
            'converted_at' => fn (Blueprint $t) => $t->timestamp('converted_at')->nullable()->after('last_activity_at'),
        ]);

        $this->addIndexes('funnel_sessions', [
            ['funnel_id', 'source', 'started_at'],
            ['funnel_id', 'device', 'started_at'],
            ['funnel_id', 'country', 'started_at'],
        ]);

        $this->addColumns('funnel_events', [
            'idempotency_key' => fn (Blueprint $t) => $t->uuid('idempotency_key')->nullable()->after('lead_id'),
            'source' => fn (Blueprint $t) => $t->string('source')->nullable()->after('event_type'),
            'medium' => fn (Blueprint $t) => $t->string('medium')->nullable()->after('source'),
            'campaign' => fn (Blueprint $t) => $t->string('campaign')->nullable()->after('medium'),
            'device' => fn (Blueprint $t) => $t->string('device')->nullable()->after('campaign'),
            'browser' => fn (Blueprint $t) => $t->string('browser')->nullable()->after('device'),
            'country' => fn (Blueprint $t) => $t->string('country')->nullable()->after('browser'),
            'revenue' => fn (Blueprint $t) => $t->decimal('revenue', 14, 2)->default(0)->after('country'),
            'currency' => fn (Blueprint $t) => $t->string('currency', 3)->nullable()->after('revenue'),
            'is_bot' => fn (Blueprint $t) => $t->boolean('is_bot')->default(false)->after('currency'),
            'processed_at' => fn (Blueprint $t) => $t->timestamp('processed_at')->nullable()->after('occurred_at'),
        ]);

        $this->addIndexes('funnel_events', [
            ['workspace_id', 'source', 'occurred_at'],
            ['workspace_id', 'device', 'occurred_at'],
            ['workspace_id', 'country', 'occurred_at'],
        ], [
            ['workspace_id', 'idempotency_key'],
        ]);

        // Both tables are aggregates rebuilt from funnel_events by the
        // aggregation job, so dropping a half-built one costs nothing and is
        // far simpler than detecting which half survived.
        Schema::dropIfExists('funnel_daily_visitors');
        Schema::dropIfExists('funnel_daily_stats');

        Schema::create('funnel_daily_stats', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('funnel_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('step_id')->default(0);
            $this->dimensions($table);
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
            $this->dimensions($table);
            $table->timestamps();
            $table->unique(['date', 'funnel_id', 'step_id', 'visitor_id', 'source', 'campaign', 'device', 'country'], 'funnel_daily_visitor_unique');
        });
    }

    /**
     * The four dimensions both aggregates are keyed by.
     *
     * These sit inside an eight-column unique index, and InnoDB caps a key at
     * 3072 bytes. At utf8mb4 a default string is 255 chars = 1022 bytes, so
     * four of them alone overflow it - which is what broke the first run.
     *
     * Only device and country are narrowed, and only to what actually reaches
     * them: device is a closed vocabulary from BrowserDetector (desktop,
     * mobile, tablet), and country is clipped to 80 characters there before it
     * is ever stored. source and campaign carry free-text UTM values and stay
     * at 255 so nothing is silently truncated. That leaves the key at 2521 of
     * the 3072 bytes available.
     */
    private function dimensions(Blueprint $table): void
    {
        $table->string('source')->default('direct');
        $table->string('campaign')->default('(none)');
        $table->string('device', 32)->default('unknown');
        $table->string('country', 80)->default('unknown');
    }

    /**
     * @param  array<string, callable(Blueprint): mixed>  $columns
     */
    private function addColumns(string $table, array $columns): void
    {
        $missing = array_filter(
            $columns,
            fn (string $name) => ! Schema::hasColumn($table, $name),
            ARRAY_FILTER_USE_KEY,
        );

        if ($missing === []) {
            return;
        }

        Schema::table($table, function (Blueprint $blueprint) use ($missing) {
            foreach ($missing as $define) {
                $define($blueprint);
            }
        });
    }

    /**
     * @param  array<int, array<int, string>>  $indexes
     * @param  array<int, array<int, string>>  $uniques
     */
    private function addIndexes(string $table, array $indexes, array $uniques = []): void
    {
        $indexes = array_filter($indexes, fn (array $c) => ! Schema::hasIndex($table, $c));
        $uniques = array_filter($uniques, fn (array $c) => ! Schema::hasIndex($table, $c, 'unique'));

        if ($indexes === [] && $uniques === []) {
            return;
        }

        Schema::table($table, function (Blueprint $blueprint) use ($indexes, $uniques) {
            foreach ($indexes as $columns) {
                $blueprint->index($columns);
            }
            foreach ($uniques as $columns) {
                $blueprint->unique($columns);
            }
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
