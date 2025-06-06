<?php

namespace App\Actions;

use App\Models\Beatmap;
use App\Models\BeatmapSet;

class AddBeatmapFromOsuResponse
{
    public function __invoke(array $beatmap) {
        $found = Beatmap::query()->where('id', $beatmap['id'])->first();
        if ($found) {
            $found->update([
                'playcount' => $beatmap['playcount'],
                'passcount' => $beatmap['passcount'],
            ]);

            return;
        }

        if ($beatmap['mode'] !== "osu") {
            return;
        }

        if ($beatmap['beatmapset'] && ! in_array($beatmap['beatmapset']['status'], ["ranked", "approved", "loved"])) {
            return;
        }

        $set = BeatmapSet::query()->where('id', $beatmap['beatmapset_id'])->first();
        if (! $set) {
            if ($beatmap['beatmapset']) {
                (new AddBeatmapSetFromOsuResponse)($beatmap['beatmapset'], noBeatmaps: true);
            } else {
                return;
            }
        }

        // if no max_combo, skip, its not full response
        if (! $beatmap['max_combo']) {
            return;
        }

        Beatmap::create([
            'id' => $beatmap['id'],
            'beatmapset_id' => $set?->id ?? $beatmap['beatmapset']['id'] ?? $beatmap['beatmapset_id'],
            'difficulty_rating' => $beatmap['difficulty_rating'],
            'mode' => $beatmap['mode'],
            'total_length' => $beatmap['total_length'],
            'user_id' => $beatmap['user_id'],
            'version' => $beatmap['version'],
            'accuracy' => $beatmap['accuracy'],
            'ar' => $beatmap['ar'],
            'bpm' => $beatmap['bpm'],
            'count_circles' => $beatmap['count_circles'],
            'count_sliders' => $beatmap['count_sliders'],
            'count_spinners' => $beatmap['count_spinners'],
            'cs' => $beatmap['cs'],
            'drain' => $beatmap['drain'],
            'hit_length' => $beatmap['hit_length'],
            'passcount' => $beatmap['passcount'],
            'playcount' => $beatmap['playcount'],
            'url' => $beatmap['url'],
            'checksum' => $beatmap['checksum'],
            'max_combo' => $beatmap['max_combo'],
        ]);
    }
}
