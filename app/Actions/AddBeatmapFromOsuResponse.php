<?php

namespace App\Actions;

use App\Models\Beatmap;
use App\Models\BeatmapSet;

class AddBeatmapFromOsuResponse
{
    public function __invoke(array $beatmap, bool $allowUnranked = false) {
        $found = Beatmap::query()->where('id', $beatmap['id'])->first();
        if ($found) {
            $updates = [
                'playcount' => $beatmap['playcount'],
                'passcount' => $beatmap['passcount'],
            ];

            // A re-uploaded/updated map gets a new md5. When the checksum has
            // changed (and we have a full response), refresh the version-sensitive
            // fields so the stored map matches the live version. Existing scores
            // keep their old beatmap_checksum and thus drop out of the current
            // leaderboard while remaining in the table.
            if (($beatmap['checksum'] ?? null) && $found->checksum !== $beatmap['checksum'] && ! empty($beatmap['max_combo'])) {
                $updates += [
                    'difficulty_rating' => $beatmap['difficulty_rating'],
                    'total_length' => $beatmap['total_length'],
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
                    'max_combo' => $beatmap['max_combo'],
                    'checksum' => $beatmap['checksum'],
                ];
            }

            $found->update($updates);

            return;
        }

        if ($beatmap['mode'] !== "osu") {
            return;
        }

        if (! $allowUnranked && $beatmap['beatmapset'] && ! in_array($beatmap['beatmapset']['status'], ["ranked", "approved", "loved"])) {
            return;
        }

        $set = BeatmapSet::query()->where('id', $beatmap['beatmapset_id'])->first();
        if (! $set) {
            if ($beatmap['beatmapset']) {
                (new AddBeatmapSetFromOsuResponse)($beatmap['beatmapset'], noBeatmaps: true, allowUnranked: $allowUnranked);
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
