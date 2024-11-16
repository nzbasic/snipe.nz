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
        DB::statement('CREATE MATERIALIZED VIEW leaderboard AS
            WITH weighted_scores AS (
                SELECT
                    p.id as user_id,
                    p.username,
                    s.id,
                    s.pp as pp,
                    b.playcount as pc
                FROM
                    players p
                    LEFT JOIN lazer_scores s ON p.id = s.user_id
                    LEFT JOIN beatmaps b ON s.beatmap_id = b.id
                WHERE pp is not null
            ), ranked_scores AS (
                SELECT
                    user_id,
                    username,
                    id,
                    pp,
                    pc,
                    ROW_NUMBER() OVER (PARTITION BY username ORDER BY pp DESC) - 1 as score_rank
                FROM weighted_scores
            ),
            decayed_scores AS (
                SELECT
                    user_id,
                    username,
                    id,
                    pp,
                    pc,
                    pp * POWER(0.95, score_rank) as weighted_pp
                FROM ranked_scores
            )
            SELECT
	            row_number() OVER (ORDER BY SUM(pp) DESC) as rank,
                username,
                user_id,
                COUNT(id) AS total_firsts,
                FLOOR(SUM(pp)) as raw_total_pp,
                FLOOR(SUM(weighted_pp)) as weighted_total_pp,
                FLOOR(AVG(pp)) AS avg_pp,
                FLOOR(AVG(pc)) as avg_playcount
            FROM
                decayed_scores
            GROUP BY
                username, user_id
            ORDER BY
                raw_total_pp DESC;
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP MATERIALIZED VIEW leaderboard');
    }
};
