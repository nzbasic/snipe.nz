<?php

namespace App\Http\Controllers;

use App\Models\Activity;
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

        return view('pages.home', [
            'top' => $top,
            'recent' => $recent,
        ]);
    }
}
