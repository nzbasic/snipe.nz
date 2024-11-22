<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\BeatmapSet;
use App\Models\Challenge;
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

        $daily = Challenge::query()
            ->with(['beatmap', 'beatmap.beatmapset'])
            ->status('active')
            ->where('type', 'beatmap')
            ->first();

        $weekly = Challenge::query()
            ->with('player')
            ->status('active')
            ->where('type', 'player')
            ->first();

        return view('pages.home', [
            'top' => $top,
            'recent' => $recent,
            'daily' => $daily,
            'weekly' => $weekly,
        ]);
    }
}
