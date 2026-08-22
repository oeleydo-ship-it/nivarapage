<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('livechat_conversations', function (Blueprint $table) {
            // When an agent last opened the thread. Visitor messages newer than
            // this are unread, which is what drives the inbox badges.
            $table->timestamp('agent_last_read_at')->nullable()->after('last_message_at');
            $table->index(['workspace_id', 'status', 'last_message_at'], 'livechat_inbox_idx');
        });
    }

    public function down(): void
    {
        Schema::table('livechat_conversations', function (Blueprint $table) {
            $table->dropIndex('livechat_inbox_idx');
            $table->dropColumn('agent_last_read_at');
        });
    }
};
