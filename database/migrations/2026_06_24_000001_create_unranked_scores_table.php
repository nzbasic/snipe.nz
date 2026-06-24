<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Unranked maps have no osu! leaderboard, so we build one ourselves from
     * passes observed in players' recent scores. Unlike `lazer_scores` (one
     * authoritative #1 per map + a sniped_at history chain), this keeps the top
     * N scores PER PLAYER and ranks by score (unranked maps have no pp). Rows are
     * tied to the beatmap version they were set on via `beatmap_checksum`; when a
     * map is updated its md5 changes and old rows simply stop matching the
     * beatmap's current checksum (kept, but excluded from the live leaderboard).
     */
    public function up(): void
    {
        Schema::create('unranked_scores', function (Blueprint $table) {
            $table->bigInteger('id')->primary();   // osu solo_score id (real & unique with x-api-version)
            $table->timestamps();
            $table->bigInteger('user_id');
            $table->bigInteger('beatmap_id');
            $table->bigInteger('beatmapset_id');
            $table->string('beatmap_checksum');     // md5 of the version this score was set on
            $table->bigInteger('classic_total_score');
            $table->boolean('preserve')->default(false);
            $table->boolean('processed')->default(false);
            $table->boolean('ranked')->default(false);
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
            $table->decimal('pp')->nullable();      // unranked maps have no pp
            $table->integer('ruleset_id');
            $table->bigInteger('total_score');      // ranking metric

            // Leaderboard / "worst score for this player+version" lookups.
            $table->index(['beatmap_id', 'beatmap_checksum', 'total_score']);
            $table->index(['beatmap_id', 'user_id']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unranked_scores');
    }
};
