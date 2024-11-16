<?php

namespace App\Http\Controllers;

use App\Models\LazerScore;
use App\Models\Leaderboard;
use App\Models\Player;
use Illuminate\Http\Request;

class PlayersController extends Controller
{
    public function index()
    {
        $top = Leaderboard::query()->limit(10)->get();

        return view('pages.players.index', [
            'top' => $top,
        ]);
    }

    public function show($id)
    {
        $player = Player::query()->findOrFail($id);
        $stats = Leaderboard::query()->find($id);

        return view('pages.players.show', [
            'stats' => $stats,
            'player' => $player,
        ]);
    }
}
