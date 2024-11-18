<?php

namespace App\Jobs;

use App\Actions\AddBeatmapFromOsuResponse;
use App\Actions\AddScoreFromOsuResponse;
use App\Models\Beatmap;
use App\Models\LazerScore;
use App\Models\Player;
use App\Models\Score;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Spatie\RateLimitedMiddleware\RateLimited;
use DateTime;

class UpdateLazerBeatmapJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 1;

    public function __construct(private readonly int $id) {}

    public function handle()
    {
        $beatmap = Beatmap::find($this->id);
        if (!$beatmap) {
            $res = osu()->beatmap($this->id)->get();
            (new AddBeatmapFromOsuResponse)($res);
        }

        $res = osu()->beatmap($this->id, false)->scores(type: 'country')->get();
        $scores = $res['scores'] ?? [];

        if (count($scores) === 0) {
            return;
        }

        $top = $scores[0];
        (new AddScoreFromOsuResponse)($top);
    }
}
