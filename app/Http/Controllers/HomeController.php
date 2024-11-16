<?php

namespace App\Http\Controllers;

use App\Models\Leaderboard;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function __invoke()
    {
        $top = Leaderboard::query()->limit(10)->get();

        return view('pages.home', [
            'top' => $top,
        ]);
    }
}
