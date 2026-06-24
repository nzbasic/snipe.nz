<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The activity table was created without indexes. It is queried heavily by
     * the snipe ("old_user_id"), snipee ("new_user_id") and beatmap columns,
     * often constrained to a date window, so add indexes to back those lookups
     * (challenge history EXISTS checks, player targets/sniped-by, leaderboards).
     */
    public function up(): void
    {
        Schema::table('activity', function (Blueprint $table) {
            $table->index('old_user_id');
            $table->index('new_user_id');
            $table->index('beatmap_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::table('activity', function (Blueprint $table) {
            $table->dropIndex(['old_user_id']);
            $table->dropIndex(['new_user_id']);
            $table->dropIndex(['beatmap_id']);
            $table->dropIndex(['created_at']);
        });
    }
};
