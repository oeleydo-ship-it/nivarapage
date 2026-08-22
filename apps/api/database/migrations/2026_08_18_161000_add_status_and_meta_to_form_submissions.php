<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('form_submissions', function (Blueprint $table) {
            $table->foreignId('page_id')->nullable()->after('workspace_id')->constrained()->nullOnDelete();
            $table->string('status')->default('new')->after('page_id');
            $table->string('name')->nullable()->after('status');
            $table->string('email')->nullable()->after('name');
            $table->string('user_agent')->nullable()->after('ip');
        });
    }

    public function down(): void
    {
        Schema::table('form_submissions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('page_id');
            $table->dropColumn(['status', 'name', 'email', 'user_agent']);
        });
    }
};
