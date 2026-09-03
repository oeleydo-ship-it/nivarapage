<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Things a funnel does by itself when something happens.
 *
 * A rule watches for one kind of event, waits if it was told to, and then sends
 * an email or calls a webhook. Every firing is written down: an automation that
 * silently did or did not run is impossible to trust or to debug.
 */
return new class extends Migration
{
    /**
     * Each table is created only if it is missing.
     *
     * This migration makes two tables, and Laravel writes its `migrations` row
     * only once `up()` returns. A deploy that created the first table and then
     * died before the second therefore left the work half done and unrecorded,
     * so every deploy afterwards re-ran the migration and collided with the
     * table it had already made. Guarding each create lets that half-applied
     * state finish itself instead of needing the database repaired by hand.
     */
    public function up(): void
    {
        if (! Schema::hasTable('funnel_automations')) {
            Schema::create('funnel_automations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
                $table->foreignId('funnel_id')->constrained()->cascadeOnDelete();
                // Null means any step of the funnel.
                $table->foreignId('trigger_step_id')->nullable()->constrained('funnel_steps')->cascadeOnDelete();
                $table->string('name');
                $table->string('trigger_event');
                // Minutes, so "an hour later" does not need a scheduler of its own -
                // the queue already knows how to hold a job back.
                $table->unsignedInteger('delay_minutes')->default(0);
                $table->string('action');
                $table->json('config')->nullable();
                $table->string('status')->default('active');
                $table->unsignedInteger('run_count')->default(0);
                $table->timestamp('last_run_at')->nullable();
                $table->timestamps();

                $table->index(['funnel_id', 'trigger_event', 'status']);
            });
        }

        if (! Schema::hasTable('funnel_automation_runs')) {
            Schema::create('funnel_automation_runs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
                $table->foreignId('funnel_automation_id')->constrained()->cascadeOnDelete();
                $table->foreignId('funnel_event_id')->nullable()->constrained('funnel_events')->nullOnDelete();
                $table->foreignId('funnel_lead_id')->nullable()->constrained('funnel_leads')->nullOnDelete();
                $table->string('status')->default('pending');
                $table->string('detail', 500)->nullable();
                $table->timestamp('ran_at')->nullable();
                $table->timestamps();

                // One run per rule per event. A queue that delivers a job twice
                // must not send the same person the same email twice.
                $table->unique(['funnel_automation_id', 'funnel_event_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('funnel_automation_runs');
        Schema::dropIfExists('funnel_automations');
    }
};
