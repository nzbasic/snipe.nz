<?php

namespace App\Console\Commands;

use App\Jobs\SearchJob;
use App\Jobs\UpdateBeatmapJob;
use App\Jobs\UpdateLazerBeatmapJob;
use App\Models\Beatmap;
use Illuminate\Console\Command;

class UpdateBeatmaps extends Command
{
    protected $signature = 'update:beatmaps
        {--silent : Update #1 ownership without recording snipes / Discord / per-score view refresh (use for a full reindex after an osu! scoring change)}
        {--per-minute=60 : Throttle how many beatmap jobs are dispatched per minute. osu! recommends a sustained rate of ~60 requests/min (internal cap 1200/min + burst); each job makes ~1 request, so keep this near/under 60 to avoid token revocation.}';

    protected $description = 'Fetch all ranked beatmaps';

    public function handle()
    {
        $silent = (bool) $this->option('silent');
        $perMinute = max(1, (int) $this->option('per-minute'));

        $beatmaps = Beatmap::query()
            ->select('id')
            ->orderBy('playcount', 'asc')
            ->get();

        // Spread dispatch over time so a full reindex doesn't blow the osu! API
        // rate limit. Each job makes 1-2 API calls. The Nth job is delayed by
        // (N / perMinute) minutes, which scales correctly above and below 60/min.
        $beatmaps->each(function ($beatmap, $i) use ($silent, $perMinute) {
            $delaySeconds = (int) floor($i * 60 / $perMinute);

            dispatch(new UpdateLazerBeatmapJob($beatmap->id, $silent))
                ->onQueue('osu-background')
                ->delay(now()->addSeconds($delaySeconds));
        });

        $count = $beatmaps->count();
        $etaMinutes = (int) ceil($count / $perMinute);
        $this->info("Queued {$count} beatmap jobs" . ($silent ? ' (silent)' : '') . ", ~{$etaMinutes} min to drain at {$perMinute}/min.");

        if ($silent) {
            $this->warn('Silent reindex: run `php artisan leaderboard:refresh` once the queue has drained to rebuild the leaderboard.');
        }
    }
}
