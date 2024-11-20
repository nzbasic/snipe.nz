<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Leaderboard;
use App\Models\Player;

class PlayersController extends Controller
{
    public function index()
    {
        $top = Leaderboard::query()->limit(10)->get();

        return view('pages.players.index', [
            'top' => $top,
        ]);
    }

    public function show(Player $player)
    {
        $stats = Leaderboard::query()->find($player->id);

        $recent = Activity::query()
            ->with(['oldUser', 'newUser', 'oldScore', 'newScore', 'beatmap', 'beatmap.beatmapset'])
            ->where('new_user_id', $player->id)
            ->orWhere('old_user_id', $player->id)
            ->limit(6)
            ->orderByDesc('created_at')
            ->get();

        return view('pages.players.show', [
            'stats' => $stats,
            'player' => $player,
            'recent' => $recent,
        ]);
    }
}
