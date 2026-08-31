<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Artisan;

/**
 * Brings the reference data a deployment cannot start without in with the
 * schema: the plans, the template catalogue, and the super admin.
 *
 * A managed host clones each release and runs a fixed pipeline - composer,
 * `migrate`, the asset build - with no step that seeds. A deployment that only
 * migrates comes up unusable: registration calls assignFreePlan, which does
 * `Plan::where('slug', 'free')->firstOrFail()` and 404s with no plans; the
 * template picker is empty; and nobody can sign in as an administrator.
 * `migrate` is the one hook every pipeline runs, so the seeding hangs off it.
 *
 * Every seeder this calls is keyed on a slug through updateOrCreate, so running
 * them again is safe - which matters, because this also runs against databases
 * that were already seeded by hand.
 */
return new class extends Migration
{
    public function up(): void
    {
        // RefreshDatabase re-runs the migrations for each test. Seeding the
        // whole template catalogue into every one of them would be slow, and
        // visible to tests that assert on an empty catalogue. Suites that want
        // this data seed it themselves.
        if (app()->runningUnitTests()) {
            return;
        }

        Artisan::call('db:seed', ['--force' => true]);
    }

    public function down(): void
    {
        // Reference data belongs to the tables that hold it; those migrations
        // drop it when they are rolled back. There is nothing to undo here.
    }
};
