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
        Schema::create('lazer_scores', function (Blueprint $table) {
            $table->bigInteger('id')->primary();
            $table->timestamps();
            $table->bigInteger('user_id');
            $table->bigInteger('beatmap_id');
            $table->bigInteger('beatmapset_id');
            $table->bigInteger('classic_total_score');
            $table->boolean('preserve');
            $table->boolean('processed');
            $table->boolean('ranked');
            $table->jsonb('maximum_statistics');
            $table->jsonb('statistics');
            $table->jsonb('mods');
            $table->string('rank');
            $table->string('type');
            $table->decimal('accuracy');
            $table->datetime('started_at')->nullable();
            $table->datetime('ended_at');
            $table->boolean('is_perfect_combo');
            $table->boolean('legacy_perfect')->nullable();
            $table->bigInteger('legacy_score_id')->nullable();
            $table->bigInteger('legacy_total_score')->nullable();
            $table->integer('max_combo');
            $table->boolean('passed');
            $table->decimal('pp');
            $table->integer('ruleset_id');
            $table->bigInteger('total_score');
        });

        Schema::table('beatmaps', function (Blueprint $table) {
            $table->timestamp('lazer_checked_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lazer_scores');

        Schema::table('beatmaps', function (Blueprint $table) {
            $table->dropColumn('lazer_checked_at');
        });
    }
};
