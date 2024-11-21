<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\BeatmapSet;
use App\Models\Leaderboard;

class HomeController extends Controller
{
    public function __invoke()
    {
        $top = Leaderboard::query()
            ->limit(10)
            ->get();

        $recent = Activity::query()
            ->with(['oldUser', 'newUser', 'oldScore', 'newScore', 'beatmap', 'beatmap.beatmapset'])
            ->limit(10)
            ->orderByDesc('created_at')
            ->get();

        //WITH beatmap_set_scores AS (
        //    -- Get all top scores for each beatmap set
        //    SELECT
        //        bs.id as beatmap_set_id,
        //        COUNT(DISTINCT b.id) as total_beatmaps,
        //        COUNT(DISTINCT s.user_id) as unique_top_scorers,
        //        MAX(s.user_id) as top_scorer_id  -- We can use any aggregate since they're all the same if unique_top_scorers = 1
        //    FROM beatmap_sets bs
        //    JOIN beatmaps b ON b.beatmapset_id = bs.id
        //    LEFT JOIN lazer_scores s ON b.id = s.beatmap_id AND s.sniped_at is null
        //    GROUP BY bs.id
        //    HAVING
        //        -- Must have same number of top scores as beatmaps (all maps must have a top score)
        //        COUNT(s.id) = COUNT(DISTINCT b.id)
        //        -- Must have only one unique top scorer
        //        AND COUNT(DISTINCT s.user_id) = 1
        //)
        //SELECT
        //    bs.id,
        //    bs.title,
        //    p.username,
        //    bss.total_beatmaps
        //FROM beatmap_sets bs
        //JOIN beatmap_set_scores bss ON bs.id = bss.beatmap_set_id
        //JOIN players as p on p.id = top_scorer_id
        //WHERE total_beatmaps > 1

        // rewrite above in eloquent

//        $test = \DB::select("
//        WITH beatmap_set_scores AS (
//            -- Get all top scores for each beatmap set
//            SELECT
//                bs.id as beatmap_set_id,
//                COUNT(DISTINCT b.id) as total_beatmaps,
//                COUNT(DISTINCT s.user_id) as unique_top_scorers,
//                MAX(s.user_id) as top_scorer_id  -- We can use any aggregate since they're all the same if unique_top_scorers = 1
//            FROM beatmap_sets bs
//            JOIN beatmaps b ON b.beatmapset_id = bs.id
//            LEFT JOIN lazer_scores s ON b.id = s.beatmap_id AND s.sniped_at is null
//            GROUP BY bs.id
//            HAVING
//                -- Must have same number of top scores as beatmaps (all maps must have a top score)
//                COUNT(s.id) = COUNT(DISTINCT b.id)
//                -- Must have only one unique top scorer
//                AND COUNT(DISTINCT s.user_id) = 1
//        )
//        SELECT
//            bs.id,
//            bs.title,
//            p.username,
//            bss.total_beatmaps
//        FROM beatmap_sets bs
//        JOIN beatmap_set_scores bss ON bs.id = bss.beatmap_set_id
//        JOIN players as p on p.id = top_scorer_id
//        WHERE total_beatmaps > 1
//        ORDER BY total_beatmaps DESC
//        ");

        return view('pages.home', [
            'top' => $top,
            'recent' => $recent,
        ]);
    }
}
