<?php

namespace App\Actions;

use App\Models\Activity;
use App\Models\Beatmap;
use App\Models\DiscordUserLink;
use App\Models\LazerScore;
use App\Models\Leaderboard;
use App\Models\Player;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

class AddScoreFromOsuResponse
{
    public function __invoke(array $top) {
        $beatmap = Beatmap::find($top['beatmap_id']);
        if (!$beatmap) {
            return;
        }

        $beatmap->load('beatmapset');
        $beatmapSet = $beatmap->beatmapset;

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

        Leaderboard::refreshView();

        if ($currentScore) {
            $id = $beatmap->id;
            $version = $beatmap->version;

            $artist = $beatmap->artist;
            $title = $beatmapSet->title;
            $url = "https://osu.ppy.sh/beatmaps/$id";
            $beatmapTitle = "$artist - $title [$version]";
            $snipedUsername = $currentScore->player->username;

            $rank = $top['rank'];
            $score = number_format($top['classic_total_score']);

            $mods = "";
            if (count($top['mods']) !== 0) {
                $mods .= "+";
                foreach ($top['mods'] as $mod) {
                    $mods .= $mod['acronym'];
                }
            }

            $acc = number_format($top['accuracy'] * 100, 2);
            $scoreLine1 = "$rank    $score    ";
            if ($mods) {
                $scoreLine1 .= "$mods    ";
            }
            $unix = Carbon::parse($top['ended_at'])->getTimestamp();
            $timeString = "<t:$unix:R>";
            $scoreLine1 .= "$acc%    $timeString";

            $pp = number_format($top['pp']);
            $combo = $top['max_combo'];
            $maxCombo = $beatmap->max_combo;
            $missCount = $top['statistics']['miss'] ?? 0;
            $scoreLine2 = "{$pp}pp    $combo/$maxCombo    {$missCount}x";

            $message = "**$scoreLine1**\n**$scoreLine2**";

            $player = Leaderboard::query()->where('user_id', $top['user_id'])->first();
            $rankFormatted = number_format($player->rank);
            $firstsFormatted = number_format($player->total_firsts);
            $ppFormatted = number_format($player->raw_total_pp);

            $playerTitle = "$player->username #$rankFormatted ({$ppFormatted}pp — $firstsFormatted #1s)";
            $playerUrl = "https://snipe.nz/players/$player->user_id";
            $playerAvatar = $top['user']['avatar_url'];

            $body = [
                'avatar_url' => "https://snipe.nz/icon.png",
                'username' => 'snipe.nz',
                'embeds' => [
                    [
                        'author' => [
                            'name' => $playerTitle,
                            'url' => $playerUrl,
                            'icon_url' => $playerAvatar,
                        ],
                        'title' => $beatmapTitle,
                        'url' => $url,
                        'description' => $message,
                        'timestamp' => Carbon::parse($top['ended_at'])->toIso8601String(),
                        'thumbnail' => [
                            'url' => $beatmapSet->cover_list,
                        ],
                        'footer' => [
                            'text' => "Victim: $snipedUsername",
                            'icon_url' => $currentScore->player->avatar_url,
                        ]
                    ],
                ],
            ];

            $targetModel = DiscordUserLink::query()->where('osuId', $currentScore->player->id)->first();
            if ($targetModel && $targetModel->ping) {
                $body['content'] = "<@$targetModel->discordId>";
            }

            Http::post(config('services.discord.webhook'), $body);
        }
    }
}
