<?php

namespace App\Console\Commands;

use App\Jobs\SearchJob;
use App\Jobs\UpdateBeatmapJob;
use App\Jobs\UpdateLazerBeatmapJob;
use App\Models\Beatmap;
use Illuminate\Console\Command;

class UpdateBeatmapsCommand extends Command
{
    protected $signature = 'update:beatmaps';

    protected $description = 'Fetch all ranked beatmaps';

    public function handle()
    {
        $beatmaps = Beatmap::query()
            ->select('id')
            ->whereNull('checked_at')
            ->orderBy('playcount', 'desc')
            ->get();

        // dispatch job for each beatmap
        $beatmaps->each(function ($beatmap) {
            dispatch(new UpdateLazerBeatmapJob($beatmap->id))->onQueue('osu');
        });
    }
}
