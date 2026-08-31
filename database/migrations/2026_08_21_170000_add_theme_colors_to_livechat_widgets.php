<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('livechat_widgets', function (Blueprint $table) {
            // The panel used to be hard-coded dark regardless of the site's own
            // palette. These let each workspace dress the widget to match.
            $table->string('theme', 12)->default('dark')->after('primary_color');
            $table->string('surface_color', 16)->nullable()->after('theme');
            $table->string('text_color', 16)->nullable()->after('surface_color');
            $table->string('bubble_color', 16)->nullable()->after('text_color');
            $table->string('launcher_icon', 16)->default('chat')->after('launcher_label');
        });
    }

    public function down(): void
    {
        Schema::table('livechat_widgets', function (Blueprint $table) {
            $table->dropColumn(['theme', 'surface_color', 'text_color', 'bubble_color', 'launcher_icon']);
        });
    }
};
