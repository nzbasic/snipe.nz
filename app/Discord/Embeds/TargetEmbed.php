<?php

namespace App\Discord\Embeds;

use App\Models\Challenge;
use App\Models\Leaderboard;
use Carbon\Carbon;

class TargetEmbed extends Embed
{
    public function __construct()
    {
        $challenge = Challenge::query()
            ->with('player')
            ->status('active')
            ->where('type', 'player')
            ->first();

        if (! $challenge) {
            parent::__construct('No active target challenge found.', []);
            return;
        }

        $player = $challenge->player;

        $leaderboard = $challenge->leaderboard;
        $activity = $challenge->activity;

        if ($activity->isEmpty()) {
            $description = 'No snipes set.';
            $footer = null;
        } else {
            $leader = $challenge->leader;

            $description = "**Leaderboard** \n";
            foreach ($leaderboard as $position) {
                $description .= "[{$position['user']['username']}](https://snipe.nz/players/{$position['user']['id']}): {$position['count']}\n";
            }

            $description .= "\n**Recent Activity**\n";
            $take = $activity->take(5);
            foreach ($take as $activityItem) {
                $description .= "[{$activityItem['newUser']['username']}](https://snipe.nz/players/{$activityItem['newUser']['id']}) on [{$activityItem['beatmap']['beatmapset']['artist']} - {$activityItem['beatmap']['beatmapset']['title']}](https://snipe.nz/beatmaps/{$activityItem['beatmap']['id']})\n";
            }

            $footer = [
                'text' => "Ends on",
            ];
        }

        $targetStats = Leaderboard::query()->where('user_id', $player->id)->first();
        $rankFormatted = number_format($targetStats->rank);
        $firstsFormatted = number_format($targetStats->total_firsts);
        $ppFormatted = number_format($targetStats->raw_total_pp);

        $playerTitle = "$player->username #$rankFormatted ({$ppFormatted}pp — $firstsFormatted #1s)";

        $embeds = [
            [
                'author' => [
                    'name' => "Current Target",
                    'url' => "https://snipe.nz/challenges/{$challenge->id}",
                    'icon_url' => "https://snipe.nz/icon.png",
                ],
                'title' => $playerTitle,
                'url' => "https://snipe.nz/players/{$player->id}",
                'description' => $description,
                'timestamp' => Carbon::parse($challenge->ends_at)->toIso8601String(),
                'thumbnail' => [
                    'url' => $player->avatar_url,
                ],
                'footer' => $footer,
            ],
        ];

        parent::__construct(null, $embeds);
    }
}
