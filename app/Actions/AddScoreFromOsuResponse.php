<?php

namespace App\Actions;

use App\Models\Activity;
use App\Models\Beatmap;
use App\Models\BeatmapSet;
use App\Models\LazerScore;
use App\Models\Player;

class AddScoreFromOsuResponse
{
    public function __invoke(array $top) {
        $beatmap = Beatmap::find($top['beatmap_id']);
        if (!$beatmap) {
            return;
        }

        $player = $top['user'];

        $foundPlayer = Player::find($player['id']);
        if (!$foundPlayer) {
            Player::create([
                'id' => $player['id'],
                'username' => $player['username'],
                'avatar_url' => $player['avatar_url'],
            ]);
        }

        $foundPlayer->update([
            'username' => $player['username'],
            'avatar_url' => $player['avatar_url'],
        ]);

        $currentScore = LazerScore::query()
            ->where('beatmap_id', $top['beatmap_id'])
            ->whereNull('sniped_at')
            ->first();

        if ($currentScore) {
            $isSameScore = $currentScore->id === $top['id'];
            if ($isSameScore) {
                return;
            }

            // the score is a snipe, add the new score, and set the values on the old score
            $currentScore->update([
                'sniped_by_user_id' => $top['user_id'],
                'sniped_at' => now(),
                'sniped_by_score_id' => $top['id'],
            ]);

            Activity::create([
                'old_user_id' => $currentScore->user_id,
                'new_user_id' => $top['user_id'],

                'old_score_id' => $currentScore->id,
                'new_score_id' => $top['id'],

                'beatmap_id' => $currentScore->beatmap_id,
            ]);
        }

        $foundScore = LazerScore::find($top['id']);
        if (!$foundScore) {
            LazerScore::create([
                'id' => $top['id'],
                'user_id' => $top['user_id'],
                'beatmap_id' => $top['beatmap_id'],
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
    }
}
