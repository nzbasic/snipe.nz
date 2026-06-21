<?php

namespace App\Actions;

use App\Discord\Embeds\SnipeEmbed;
use App\Models\Activity;
use App\Models\Beatmap;
use App\Models\Challenge;
use App\Models\DiscordUserLink;
use App\Models\LazerScore;
use App\Models\Leaderboard;
use App\Models\Player;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

class AddScoreFromOsuResponse
{
    /**
     * @param  array  $top  The osu! country leaderboard top score.
     * @param  bool  $silent  When true (e.g. a bulk reindex after an osu! scoring
     *                        change), update #1 ownership without recording an
     *                        Activity, sending a Discord embed, or refreshing the
     *                        leaderboard view. Prevents flooding the snipe feed
     *                        with recalculation-driven ownership flips.
     */
    public function __invoke(array $top, bool $silent = false) {
        $beatmap = Beatmap::find($top['beatmap_id']);
        if (!$beatmap) {
            return;
        }

        $beatmap->load('beatmapset');
        $beatmapSet = $beatmap->beatmapset;

        $player = $top['user'];

        $foundPlayer = Player::find($player['id']);
        if (!$foundPlayer) {
            $foundPlayer = Player::create([
                'id' => $player['id'],
                'username' => $player['username'],
                'avatar_url' => $player['avatar_url'],
            ]);
        } else {
            $foundPlayer->update([
                'username' => $player['username'],
                'avatar_url' => $player['avatar_url'],
            ]);
        }

        $currentScore = LazerScore::query()
            ->where('beatmap_id', $top['beatmap_id'])
            ->whereNull('sniped_at')
            ->first();

        $isRealSnipe = false;

        if ($currentScore) {
            $isSameScore = $currentScore->id === $top['id'];
            if ($isSameScore) {
                return;
            }

            // A genuine snipe means the new #1 was played *after* the one it
            // displaces. If the new top is older, osu! merely reordered the
            // leaderboard (e.g. mod-multiplier recalculation surfaced an old
            // score) — update ownership but don't announce a snipe.
            $isRealSnipe = !$silent
                && Carbon::parse($top['ended_at'])->gt(Carbon::parse($currentScore->ended_at));

            // The score is the new #1; set the snipe metadata on the old score.
            $currentScore->update([
                'sniped_by_user_id' => $top['user_id'],
                'sniped_at' => now(),
                'sniped_by_score_id' => $top['id'],
            ]);

            if ($isRealSnipe) {
                Activity::create([
                    'created_at' => $top['ended_at'],

                    'old_user_id' => $currentScore->user_id,
                    'new_user_id' => $top['user_id'],

                    'old_score_id' => $currentScore->id,
                    'new_score_id' => $top['id'],

                    'beatmap_id' => $currentScore->beatmap_id,
                ]);
            }
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

        // During a bulk reindex we skip the (expensive, non-concurrent) view
        // refresh on every score and refresh once at the end instead.
        if (!$silent) {
            Leaderboard::refreshView();
        }

        if ($isRealSnipe) {
            (new SnipeEmbed($beatmap, $beatmapSet, $currentScore, $top))->send();
        }
    }
}
