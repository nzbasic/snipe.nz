<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('activity', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->bigInteger('old_user_id');
            $table->bigInteger('new_user_id');

            $table->bigInteger('old_score_id');
            $table->bigInteger('new_score_id');

            $table->bigInteger('beatmap_id');
        });

        Schema::table('lazer_scores', function (Blueprint $table) {
            $table->datetime('sniped_at')->nullable();
            $table->bigInteger('sniped_by_user_id')->nullable();
            $table->bigInteger('sniped_by_score_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity');

        Schema::table('lazer_scores', function (Blueprint $table) {
            $table->dropColumn('sniped_by_user_id');
            $table->dropColumn('sniped_at');
            $table->dropColumn('sniped_score_id');
        });
    }
};
