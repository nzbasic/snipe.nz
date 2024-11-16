<?php

namespace App\Jobs;

use App\Models\Beatmap;
use App\Models\BeatmapSet;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Spatie\RateLimitedMiddleware\RateLimited;
use DateTime;

class SearchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $tries = 10;

    public function __construct(private ?string $cursor = null) {}

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(10);
    }

    public function middleware()
    {
        return [
            (new RateLimited())
                ->allow(1)
                ->everySeconds(1)
                ->releaseAfterSeconds(3)
                ->key('osu-api')
        ];
    }

    public function handle()
    {
        $params = ['m' => 0, 'limit' => 50];
        if ($this->cursor) {
            $params['cursor_string'] = $this->cursor;
        }

        $res = osu()->beatmapset()->search($params)->get();
        $beatmapsets = $res['beatmapsets'];
        $cursor = $res['cursor_string'];

        \DB::table('track_beatmap_search_progress')->insert([
            'cursor' => $cursor,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach ($beatmapsets as $beatmapset) {
            $found = BeatmapSet::query()->where('id', $beatmapset['id'])->first();
            if ($found) {
                continue;
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

            $beatmaps = $beatmapset['beatmaps'];

            foreach ($beatmaps as $beatmap) {
                if ($beatmap['mode'] !== "osu") {
                    continue;
                }

                $found = Beatmap::query()->where('id', $beatmap['id'])->first();
                if ($found) {
                    continue;
                }

                Beatmap::create([
                    'id' => $beatmap['id'],
                    'beatmapset_id' => $beatmapset['id'],
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

        dispatch(new SearchJob($cursor));
    }
}
