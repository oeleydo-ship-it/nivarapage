<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('livechat_conversations', function (Blueprint $table) {
            $table->timestamp('agent_typing_until')->nullable()->after('last_message_at');
        });
    }

    public function down(): void
    {
        Schema::table('livechat_conversations', function (Blueprint $table) {
            $table->dropColumn('agent_typing_until');
        });
    }
};
