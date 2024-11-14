<?php

namespace App\Console\Commands;

use App\Jobs\SearchJob;
use Illuminate\Console\Command;

class UpdateBeatmapsCommand extends Command
{
    protected $signature = 'update:beatmaps';

    protected $description = 'Fetch all ranked beatmaps';

    public function handle()
    {
        dispatch(new SearchJob());
    }
}
