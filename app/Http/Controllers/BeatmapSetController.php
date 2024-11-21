<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Beatmap;
use App\Models\BeatmapSet;
use App\Models\LazerScore;
use App\Models\Leaderboard;
use App\Models\Player;

class BeatmapSetController extends Controller
{
    public function show(BeatmapSet $set)
    {
        $set->load('beatmaps');

        $scores = LazerScore::query()
            ->whereNull('sniped_at')
            ->whereIn('beatmap_id', $set->beatmaps->pluck('id'))
            ->join('players', 'players.id', '=', 'lazer_scores.user_id')
            ->get();

        // all scores by same user_id
        $fullHouse = $scores->groupBy('user_id')->filter(function ($group) {
            return $group->count() === $group->first()->beatmap->beatmapset->beatmaps->count();
        });

        $beatmaps = $set->beatmaps->pluck('id');

        $activity = Activity::query()
            ->whereIn('beatmap_id', $beatmaps)
            ->with(['oldUser', 'newUser', 'oldScore', 'newScore', 'beatmap', 'beatmap.beatmapset'])
            ->limit(10)
            ->orderByDesc('created_at')
            ->get();

        return view('pages.sets.show', [
            'set' => $set,
            'scores' => $scores,
            'fullHouse' => $fullHouse,
            'recent' => $activity,
        ]);
    }
}
