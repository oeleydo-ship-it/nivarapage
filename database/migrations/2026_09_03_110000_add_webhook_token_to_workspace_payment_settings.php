<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The address Stripe posts a workspace's events to.
 *
 * A token rather than the workspace id: the signature check is what actually
 * secures the endpoint, but an opaque address stops the URL from telling anyone
 * how many workspaces exist or letting them be walked one by one.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workspace_payment_settings', function (Blueprint $table) {
            $table->string('webhook_token', 64)->nullable()->unique()->after('webhook_secret');
        });
    }

    public function down(): void
    {
        Schema::table('workspace_payment_settings', function (Blueprint $table) {
            $table->dropUnique(['webhook_token']);
            $table->dropColumn('webhook_token');
        });
    }
};
