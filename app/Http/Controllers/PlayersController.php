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
        // Players with no current #1s are not in the leaderboard view (it only
        // ranks players who hold at least one #1), so default their stats here
        // rather than letting the profile page hit null.
        $stats = Leaderboard::query()->find($player->id) ?? [
            'rank' => null,
            'total_firsts' => 0,
            'raw_total_pp' => 0,
            'weighted_total_pp' => 0,
            'avg_pp' => 0,
            'avg_playcount' => 0,
        ];

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
            'targets' => $targets,
            'targeted_by' => $targeted_by,
        ]);
    }
}
