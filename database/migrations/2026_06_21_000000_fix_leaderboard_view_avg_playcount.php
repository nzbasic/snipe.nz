<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Fix the leaderboard view:
     *  - INNER JOIN lazer_scores so players with no current #1s drop off the
     *    leaderboard entirely (previously they appeared with NULL aggregates).
     *  - COALESCE avg_playcount so sorting by it no longer treats "no plays" as
     *    the maximum value (Postgres sorts NULL as greatest).
     */
    public function up(): void
    {
        DB::statement('DROP MATERIALIZED VIEW IF EXISTS leaderboard;');
        DB::statement('CREATE MATERIALIZED VIEW leaderboard AS
            WITH weighted_scores AS (
                SELECT
                    p.id as user_id,
                    p.username,
                    s.id,
                    COALESCE(s.pp, 0) as pp,
                    b.playcount as pc
                FROM
                    players p
                    JOIN lazer_scores s ON p.id = s.user_id AND s.sniped_at IS NULL
                    LEFT JOIN beatmaps b ON s.beatmap_id = b.id
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
                COALESCE(FLOOR(AVG(pc)), 0) as avg_playcount
            FROM
                decayed_scores
            GROUP BY
                username, user_id
            ORDER BY
                raw_total_pp DESC;
        ');
    }

    public function down(): void
    {
        //
    }
};
