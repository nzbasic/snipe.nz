<?php

namespace App\Jobs;

use App\Models\Beatmap;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UpdateBeatmapJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $beatmap;

    public function __construct(Beatmap $beatmap)
    {
        $this->beatmap = $beatmap;
    }

    public function handle()
    {

    }
}
