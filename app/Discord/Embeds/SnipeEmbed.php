<?php

namespace App\Discord\Embeds;

use App\Models\DiscordUserLink;
use App\Models\Leaderboard;
use Carbon\Carbon;

class SnipeEmbed extends Embed
{
    public function __construct($beatmap, $beatmapSet, $oldScore, $newScore)
    {
        $id = $beatmap->id;
        $version = $beatmap->version;

        $artist = $beatmapSet->artist;
        $title = $beatmapSet->title;
        $url = "https://osu.ppy.sh/beatmaps/$id";
        $beatmapTitle = "$artist - $title [$version]";
        $snipedUsername = $oldScore->player->username;

        $rank = $newScore['rank'];
        $score = number_format($newScore['classic_total_score']);

        $mods = "";
        if (count($newScore['mods']) !== 0) {
            $mods .= "+";
            foreach ($newScore['mods'] as $mod) {
                $mods .= $mod['acronym'];
            }
        }

        $acc = number_format($newScore['accuracy'] * 100, 2);
        $scoreLine1 = "$rank    $score    ";
        if ($mods) {
            $scoreLine1 .= "$mods    ";
        }
        $unix = Carbon::parse($newScore['ended_at'])->getTimestamp();
        $timeString = "<t:$unix:R>";
        $scoreLine1 .= "$acc%    $timeString";

        $pp = number_format($newScore['pp']);
        $combo = $newScore['max_combo'];
        $maxCombo = $beatmap->max_combo;
        $missCount = $newScore['statistics']['miss'] ?? 0;
        $scoreLine2 = "{$pp}pp    $combo/$maxCombo    {$missCount}x";

        $message = "**$scoreLine1**\n**$scoreLine2**";

        $player = Leaderboard::query()->where('user_id', $newScore['user_id'])->first();
        $rankFormatted = number_format($player->rank);
        $firstsFormatted = number_format($player->total_firsts);
        $ppFormatted = number_format($player->raw_total_pp);

        $playerTitle = "$player->username #$rankFormatted ({$ppFormatted}pp — $firstsFormatted #1s)";
        $playerUrl = "https://snipe.nz/players/$player->user_id";
        $playerAvatar = $newScore['user']['avatar_url'];

        $embeds = [
            [
                'author' => [
                    'name' => $playerTitle,
                    'url' => $playerUrl,
                    'icon_url' => $playerAvatar,
                ],
                'title' => $beatmapTitle,
                'url' => $url,
                'description' => $message,
                'timestamp' => Carbon::parse($newScore['ended_at'])->toIso8601String(),
                'thumbnail' => [
                    'url' => $beatmapSet->cover_list,
                ],
                'footer' => [
                    'text' => "Victim: $snipedUsername",
                    'icon_url' => $oldScore->player->avatar_url,
                ]
            ],
        ];

        $targetModel = DiscordUserLink::query()->where('osuId', $oldScore->player->id)->first();
        if ($targetModel && $targetModel->ping) {
            $content = "<@$targetModel->discordId>";
        } else {
            $content = null;
        }

        parent::__construct($content, $embeds);
    }
}
