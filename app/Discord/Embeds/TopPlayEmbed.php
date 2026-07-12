<?php

namespace App\Discord\Embeds;

use App\Models\Beatmap;
use Carbon\Carbon;

/**
 * Announces a player's new #1 top play. Built from an osu! `/scores/best`
 * entry (lazer format: nested beatmap/beatmapset/user + a `weight`), plus an
 * optional full user object (with statistics) for the author line. Mirrors
 * SnipeEmbed's layout and posts to the dedicated top-plays webhook.
 */
class TopPlayEmbed extends Embed
{
    public function __construct(array $score, ?array $userDetails = null)
    {
        $beatmap = $score['beatmap'] ?? [];
        $set = $score['beatmapset'] ?? [];
        $user = $score['user'] ?? [];
        $userId = $score['user_id'] ?? ($user['id'] ?? null);

        $id = $beatmap['id'] ?? null;
        $version = $beatmap['version'] ?? '';
        $beatmapTitle = ($set['artist'] ?? '') . ' - ' . ($set['title'] ?? '') . " [$version]";
        $url = $id ? "https://osu.ppy.sh/beatmaps/$id" : null;

        $rank = $score['rank'] ?? '';
        $scoreValue = number_format($score['classic_total_score'] ?? 0);

        // Concatenate acronyms like SnipeEmbed; drop CL (the classic-scoring
        // marker lazer adds, not a gameplay mod).
        $mods = '';
        foreach ($score['mods'] ?? [] as $mod) {
            if (($mod['acronym'] ?? '') === 'CL') {
                continue;
            }
            $mods .= $mod['acronym'];
        }
        if ($mods !== '') {
            $mods = "+$mods";
        }

        $acc = number_format(($score['accuracy'] ?? 0) * 100, 2);
        $unix = Carbon::parse($score['ended_at'])->getTimestamp();
        $scoreLine1 = "$rank    $scoreValue    " . ($mods ? "$mods    " : '') . "$acc%    <t:$unix:R>";

        $pp = number_format($score['pp'] ?? 0);
        $combo = $score['max_combo'] ?? 0;
        // The /best beatmap object has no max_combo; fall back to our stored map.
        $maxCombo = $beatmap['max_combo'] ?? ($id ? Beatmap::find($id)?->max_combo : null);
        $comboStr = $maxCombo ? "$combo/$maxCombo" : "{$combo}x";
        $miss = $score['statistics']['miss'] ?? 0;
        $scoreLine2 = "{$pp}pp    $comboStr    {$miss}x";

        // Author: scorepost style — "username: 8,140.57pp (#19,735 NZ120)" —
        // built from the full user object's statistics when available.
        $username = $userDetails['username'] ?? $user['username'] ?? (string) $userId;
        $stats = $userDetails['statistics'] ?? null;
        $authorName = $username;
        if ($stats && isset($stats['pp'], $stats['global_rank'])) {
            $country = $userDetails['country_code'] ?? $user['country_code'] ?? '';
            $countryRank = $stats['country_rank'] ?? null;
            $authorName = "$username: " . number_format($stats['pp'], 2) . 'pp'
                . ' (#' . number_format($stats['global_rank'])
                . ($countryRank ? " $country" . number_format($countryRank) : '')
                . ')';
        }
        $authorUrl = $userId ? "https://osu.ppy.sh/users/{$userId}" : null;

        $embeds = [
            [
                'author' => [
                    'name' => $authorName,
                    'url' => $authorUrl,
                    'icon_url' => $user['avatar_url'] ?? null,
                ],
                'title' => $beatmapTitle,
                'url' => $url,
                'description' => "**$scoreLine1**\n**$scoreLine2**",
                'timestamp' => Carbon::parse($score['ended_at'])->toIso8601String(),
                'thumbnail' => [
                    'url' => $set['covers']['list'] ?? null,
                ],
                'footer' => [
                    'text' => 'New #1 top play',
                    'icon_url' => 'https://snipe.nz/icon.png',
                ],
            ],
        ];

        parent::__construct(null, $embeds);
    }

    protected function webhook(): ?string
    {
        return config('services.discord.top_play_webhook');
    }

    protected function username(): string
    {
        return 'osu!nz top plays';
    }
}
