<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('current_workspace_id')->nullable()->after('remember_token');
            $table->boolean('is_super_admin')->default(false)->after('current_workspace_id');
            $table->text('two_factor_secret')->nullable()->after('is_super_admin');
            $table->timestamp('two_factor_confirmed_at')->nullable()->after('two_factor_secret');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'current_workspace_id',
                'is_super_admin',
                'two_factor_secret',
                'two_factor_confirmed_at',
            ]);
        });
    }
};
