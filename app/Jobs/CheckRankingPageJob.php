<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class CheckRankingPageJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public int $page)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $res = osu()->ranking('osu')->type('performance', [
            'country' => 'NZ',
            'cursor[page]' => $this->page,
        ])->get();

        $users = $res['ranking'];

        foreach ($users as $user) {
            $data = $user['user'];
            if ($data['is_online']) {
                dispatch(new RecentScoreJob(name: $data['username']))->onQueue('osu-background');
            }
        }
    }
}
