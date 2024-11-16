<?php

namespace App\Jobs;

use App\Models\Beatmap;
use App\Models\Player;
use App\Models\Score;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Spatie\RateLimitedMiddleware\RateLimited;
use DateTime;

class UpdateBeatmapJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;

    public function __construct(private readonly int $id) {}

    public function handle()
    {
        $beatmap = Beatmap::find($this->id);
        if (!$beatmap) {
            return;
        }

        $res = osu()->beatmap($this->id, false)->scores(type: 'country')->get();
        $scores = $res['scores'] ?? [];

        if (count($scores) === 0) {
            return;
        }

        $top = $scores[0];
        $player = $top['user'];

        $foundPlayer = Player::find($player['id']);
        if (!$foundPlayer) {
            $foundPlayer = Player::create([
                'id' => $player['id'],
                'username' => $player['username'],
                'avatar_url' => $player['avatar_url'],
            ]);
        }

        $foundScore = Score::find($top['id']);
        if (!$foundScore) {
            Score::create([
                'id' => $top['id'],
                'accuracy' => $top['accuracy'],
                'max_combo' => $top['max_combo'],
                'mode' => $top['mode'],
                'passed' => $top['passed'],
                'perfect' => $top['perfect'],
                'pp' => $top['pp'],
                'rank' => $top['rank'],
                'score' => $top['score'],
                'count_50' => $top['statistics']['count_50'],
                'count_100' => $top['statistics']['count_100'],
                'count_300' => $top['statistics']['count_300'],
                'count_miss' => $top['statistics']['count_miss'],
                'user_id' => $foundPlayer->id,
                'mods' => $top['mods'],
                'beatmap_id' => $this->id,
                'beatmapset_id' => $beatmap->beatmapset_id,
            ]);
        }

        Beatmap::where('id', $this->id)->update([
            'checked_at' => now(),
        ]);
    }
}
