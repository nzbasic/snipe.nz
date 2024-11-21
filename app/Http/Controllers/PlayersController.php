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
            ->limit(5)
            ->orderByDesc('created_at')
            ->get();

        $targets = Activity::query()
            ->where('new_user_id', $player->id)
            ->join('players', 'players.id', '=', 'activity.old_user_id')
            ->groupBy('old_user_id', 'players.username')
            ->select('old_user_id as user_id', 'username', \DB::raw('COUNT(*) as beat_count'))
            ->orderBy('beat_count', 'desc')
            ->limit(5)
            ->get();

        $targeted_by = Activity::query()
            ->where('old_user_id', $player->id)
            ->join('players', 'players.id', '=', 'activity.new_user_id')
            ->groupBy('new_user_id', 'players.username')
            ->select('new_user_id as user_id', 'username', \DB::raw('COUNT(*) as beat_count'))
            ->orderBy('beat_count', 'desc')
            ->limit(5)
            ->get();

        return view('pages.players.show', [
            'stats' => $stats,
            'player' => $player,
            'recent' => $recent,
            'targets' => $targets,
            'targeted_by' => $targeted_by,
        ]);
    }
}
