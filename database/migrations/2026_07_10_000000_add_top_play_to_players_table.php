<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('players', function (Blueprint $table) {
            // Last-known #1 top play, maintained by VerifyTopPlayJob. Null until
            // the player's first verification (seed-first: that check never posts).
            $table->decimal('top_pp')->nullable();
            $table->bigInteger('top_score_id')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->dropColumn(['top_pp', 'top_score_id']);
        });
    }
};
