<?php

namespace App\Jobs;

use App\Actions\RecordUnrankedPass;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Stores a single observed pass on an unranked map. Dispatched per qualifying
 * score by RecentScoreJob. Makes at most one osu! API call (only when the map is
 * new or was updated — see RecordUnrankedPass::resolveBeatmap).
 */
class RecordUnrankedPassJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 1;

    public function __construct(private readonly array $score) {}

    public function handle(): void
    {
        (new RecordUnrankedPass)($this->score);
    }
}
