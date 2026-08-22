<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->string('stripe_price_monthly')->nullable()->after('is_active');
            $table->string('stripe_price_yearly')->nullable()->after('stripe_price_monthly');
        });

        Schema::table('workspaces', function (Blueprint $table) {
            $table->string('stripe_customer_id')->nullable()->after('branding_removed');
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->boolean('cancel_at_period_end')->default(false)->after('current_period_end');
            $table->string('interval')->nullable()->after('cancel_at_period_end');
        });
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn(['stripe_price_monthly', 'stripe_price_yearly']);
        });

        Schema::table('workspaces', function (Blueprint $table) {
            $table->dropColumn('stripe_customer_id');
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn(['cancel_at_period_end', 'interval']);
        });
    }
};
