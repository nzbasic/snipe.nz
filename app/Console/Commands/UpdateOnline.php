<?php

namespace App\Console\Commands;

use App\Jobs\CheckRankingPageJob;
use Illuminate\Console\Command;

class UpdateOnline extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:online';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Find online users and update their status';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        for ($i = 1; $i <= 20; $i++) {
            dispatch(new CheckRankingPageJob($i))->onQueue('osu-background');
        }
    }
}
