<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Discount codes a shop can hand out.
 *
 * The discount is worked out on the server from this row. A code travels in the
 * request, an amount never does, so a page cannot decide what something costs.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            // Null means it works on anything the shop sells.
            $table->foreignId('product_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('code');
            $table->string('type')->default('percent');
            // Percent as whole points (20 = 20%), fixed as minor units.
            $table->unsignedInteger('value')->default(0);
            $table->string('currency', 3)->nullable();
            $table->unsignedInteger('max_redemptions')->nullable();
            // Counted when the money arrives, not when a checkout opens, so an
            // abandoned basket does not use somebody else's discount up.
            $table->unsignedInteger('redeemed_count')->default(0);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();

            // Case is folded before storing, so one shop cannot have both
            // SAVE20 and save20 and leave a shopper guessing.
            $table->unique(['workspace_id', 'code']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('coupon_id')->nullable()->after('product_id')->constrained()->nullOnDelete();
            // What was taken off, in minor units, kept beside the order so the
            // history survives the coupon being edited or deleted later.
            $table->unsignedBigInteger('discount')->default(0)->after('amount');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('coupon_id');
            $table->dropColumn('discount');
        });

        Schema::dropIfExists('coupons');
    }
};
