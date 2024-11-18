<?php

namespace App\Jobs;

use App\Actions\AddBeatmapFromOsuResponse;
use App\Actions\AddBeatmapSetFromOsuResponse;
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

    protected $tries = 1;

    public function __construct(private ?string $cursor = null) {}

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
            (new AddBeatmapSetFromOsuResponse)($beatmapset);
        }

        dispatch(new SearchJob($cursor));
    }
}
