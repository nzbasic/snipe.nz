<?php

namespace App\Console\Commands;

use App\Jobs\SearchJob;
use App\Jobs\UpdateBeatmapJob;
use App\Jobs\UpdateLazerBeatmapJob;
use App\Models\Beatmap;
use Illuminate\Console\Command;

class UpdateBeatmaps extends Command
{
    protected $signature = 'update:beatmaps';

    protected $description = 'Fetch all ranked beatmaps';

    public function handle()
    {
        $beatmaps = Beatmap::query()
            ->select('id')
            ->orderBy('playcount', 'asc')
            ->get();

        // dispatch job for each beatmap
        $beatmaps->each(function ($beatmap) {
            dispatch(new UpdateLazerBeatmapJob($beatmap->id))->onQueue('osu-background');
        });
    }
}
