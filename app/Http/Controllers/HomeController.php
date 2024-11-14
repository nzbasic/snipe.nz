<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function __invoke()
    {
//        dd(osu()->get('/beatmaps/4637583/scores?type=country'));

//        $res = osu()->beatmap(1583228)->scores(type: 'country')->get();

//        $res = osu()->get('beatmapsets/search', ['s' => 'ranked', 'sort' => ]);
//        dd($res);

        return view('welcome');
    }
}
