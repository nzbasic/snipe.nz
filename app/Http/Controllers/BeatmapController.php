<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Beatmap;
use App\Models\BeatmapSet;
use App\Models\LazerScore;
use App\Models\Leaderboard;
use App\Models\Player;

class BeatmapController extends Controller
{
    public function show(Beatmap $beatmap)
    {
        $set = BeatmapSet::query()
            ->with('beatmaps')
            ->where('id', $beatmap->beatmapset_id)
            ->firstOrFail();

        return view('pages.beatmaps.show', [
            'beatmap' => $beatmap,
            'set' => $set,
        ]);
    }
}
