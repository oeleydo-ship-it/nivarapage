<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Selling, for the customer's own products.
 *
 * Separate from the platform's own Stripe configuration, which is one global
 * row used to charge workspaces for their subscription. This is per workspace
 * and holds the customer's own credentials: the money goes to them, and the
 * platform never touches it.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workspace_payment_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('provider')->default('stripe');
            $table->boolean('enabled')->default(false);
            $table->string('mode')->default('test');
            // Write-only, and read through EncryptedSettings so a rotated
            // APP_KEY cannot take the rest of the row down with it.
            $table->text('secret_key')->nullable();
            $table->text('webhook_secret')->nullable();
            $table->string('publishable_key')->nullable();
            $table->string('account_name')->nullable();
            $table->string('currency', 3)->default('USD');
            $table->timestamp('verified_at')->nullable();
            $table->string('last_error')->nullable();
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            // A product belongs to the workspace, not to one site, so the same
            // thing can be sold from a site and from a funnel step.
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            // Minor units, the way Stripe counts, so no float ever holds money.
            $table->unsignedBigInteger('price')->default(0);
            $table->string('currency', 3)->default('USD');
            $table->string('type')->default('one_time');
            $table->string('interval')->nullable();
            $table->string('status')->default('draft');
            $table->string('success_url')->nullable();
            $table->unsignedInteger('inventory')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['workspace_id', 'slug']);
            $table->index(['workspace_id', 'status']);
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('site_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('funnel_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reference')->unique();
            // What Stripe called the session, so a webhook arriving twice
            // settles the same order rather than opening a second one.
            $table->string('provider_session_id')->nullable()->unique();
            $table->string('provider_payment_id')->nullable();
            $table->string('status')->default('pending');
            $table->unsignedBigInteger('amount')->default(0);
            $table->string('currency', 3)->default('USD');
            $table->string('customer_email')->nullable();
            $table->string('customer_name')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['workspace_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
        Schema::dropIfExists('products');
        Schema::dropIfExists('workspace_payment_settings');
    }
};
