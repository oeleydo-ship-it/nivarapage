<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            // 'recurring' (existing monthly/yearly prices) or 'one_time' (a single
            // lifetime purchase, no renewal).
            $table->string('billing_type')->default('recurring')->after('is_active');
            $table->unsignedSmallInteger('trial_days')->nullable()->after('billing_type');
            $table->string('stripe_price_lifetime')->nullable()->after('stripe_price_yearly');
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->timestamp('trial_ends_at')->nullable()->after('current_period_end');
        });
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn(['billing_type', 'trial_days', 'stripe_price_lifetime']);
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn('trial_ends_at');
        });
    }
};
