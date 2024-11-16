<?php

namespace App\Jobs;

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
            Player::create([
                'id' => $player['id'],
                'username' => $player['username'],
                'avatar_url' => $player['avatar_url'],
            ]);
        }

        $foundScore = LazerScore::find($top['id']);
        if (!$foundScore) {
            LazerScore::create([
                'id' => $top['id'],
                'user_id' => $top['user_id'],
                'beatmap_id' => $this->id,
                'beatmapset_id' => $beatmap->beatmapset_id,
                'classic_total_score' => $top['classic_total_score'],
                'preserve' => $top['preserve'],
                'processed' => $top['processed'],
                'ranked' => $top['ranked'],
                'maximum_statistics' => json_encode($top['maximum_statistics']),
                'statistics' => json_encode($top['statistics']),
                'mods' => json_encode($top['mods']),
                'rank' => $top['rank'],
                'type' => $top['type'],
                'accuracy' => $top['accuracy'],
                'started_at' => $top['started_at'],
                'ended_at' => $top['ended_at'],
                'is_perfect_combo' => $top['is_perfect_combo'],
                'legacy_perfect' => $top['legacy_perfect'],
                'legacy_score_id' => $top['legacy_score_id'],
                'legacy_total_score' => $top['legacy_total_score'],
                'max_combo' => $top['max_combo'],
                'passed' => $top['passed'],
                'pp' => $top['pp'],
                'ruleset_id' => $top['ruleset_id'],
                'total_score' => $top['total_score'],
            ]);
        }

        Beatmap::where('id', $this->id)->update([
            'checked_at' => now(),
        ]);
    }
}
