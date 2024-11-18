<?php

namespace App\Actions;

use App\Models\BeatmapSet;

class AddBeatmapSetFromOsuResponse
{
    public function __invoke(array $beatmapset) {
        $found = BeatmapSet::query()->where('id', $beatmapset['id'])->first();
        if ($found) {
            $found->update([
                'play_count' => $beatmapset['play_count'],
                'favourite_count' => $beatmapset['favourite_count'],
                'status' => $beatmapset['status'],
            ]);

            return;
        }

        if (! in_array($beatmapset['status'], ["ranked", "approved", "loved"])) {
            return;
        }

        BeatmapSet::create([
            'id' => $beatmapset['id'],
            'artist' => $beatmapset['artist'],
            'artist_unicode' => $beatmapset['artist_unicode'],
            'cover' => $beatmapset['covers']['cover'],
            'cover_card' => $beatmapset['covers']['card'],
            'cover_list' => $beatmapset['covers']['list'],
            'cover_slimcover' => $beatmapset['covers']['slimcover'],
            'creator' => $beatmapset['creator'],
            'favourite_count' => $beatmapset['favourite_count'],
            'play_count' => $beatmapset['play_count'],
            'preview_url' => $beatmapset['preview_url'],
            'status' => $beatmapset['status'],
            'title' => $beatmapset['title'],
            'title_unicode' => $beatmapset['title_unicode'],
            'user_id' => $beatmapset['user_id'],
            'bpm' => $beatmapset['bpm'],
            'ranked_date' => $beatmapset['ranked_date'],
            'last_updated' => $beatmapset['last_updated'],
        ]);

        $beatmaps = $beatmapset['beatmaps'] ?? [];
        foreach ($beatmaps as $beatmap) {
            if ($beatmap['mode'] !== "osu") {
                continue;
            }

            (new AddBeatmapFromOsuResponse)($beatmap);
        }
    }
}
