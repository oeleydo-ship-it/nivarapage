<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // A point-in-time snapshot of a whole site: theme, settings, navigation
        // and every page's draft content, stored as one JSON payload so a
        // restore never depends on rows that may since have been deleted.
        Schema::create('site_backups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('site_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('label');
            // 'manual' — someone pressed the button.
            // 'pre_restore' — taken automatically so a restore can be undone.
            $table->string('kind', 20)->default('manual');
            $table->unsignedInteger('page_count')->default(0);
            $table->unsignedBigInteger('bytes')->default(0);
            $table->longText('payload');
            $table->timestamps();

            $table->index(['site_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_backups');
    }
};
