<?php

namespace App\Console\Commands;

use App\Models\Leaderboard;
use Illuminate\Console\Command;

class RefreshLeaderboard extends Command
{
    protected $signature = 'leaderboard:refresh';

    protected $description = 'Refresh the leaderboard materialized view (run after a silent reindex)';

    public function handle()
    {
        $this->info('Refreshing leaderboard materialized view...');
        Leaderboard::refreshView();
        $this->info('Done.');
    }
}
