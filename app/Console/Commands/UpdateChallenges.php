<?php

namespace App\Console\Commands;

use App\Models\Beatmap;
use App\Models\Challenge;
use App\Models\Leaderboard;
use Carbon\Carbon;
use Illuminate\Console\Command;

class UpdateChallenges extends Command
{
    protected $signature = 'challenge:daily';

    protected $description = 'Manage the daily beatmap challenge';

    public function handle()
    {
        $this->manageType('beatmap', 1, fn() => $this->getRandomBeatmap()->id);
        $this->manageType('player', 7, fn() => $this->getRandomPlayer()->user_id);
    }

    private function manageType(string $type, int $days, \Closure $factory)
    {
        // maintain at least one pending challenge
        $currentChallenge = Challenge::query()
            ->where('type', $type)
            ->status('active')
            ->first();

        if (! $currentChallenge) {
            // create a new challenge, starting now
            $currentChallenge = $this->createChallenge($type, now(), $days, $factory);
        }

        $nextChallenge = Challenge::query()
            ->where('type', $type)
            ->status('pending')
            ->first();

        if (! $nextChallenge) {
            // create a new challenge, starting at the current end time
            $this->createChallenge($type, Carbon::parse($currentChallenge->ends_at), $days, $factory);
        }
    }

    private function createChallenge($type, Carbon $start, int $days, $factory): Challenge
    {
        $startsAt = $start->toDateTimeString();
        $endsAt = $start->addDays($days)->toDateTimeString();

        return Challenge::create([
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'type' => $type,
            'type_id' => $factory(),
        ]);
    }

    private function getRandomBeatmap()
    {
        // where not in any past challenges
        $past = Challenge::query()
            ->where('type', 'beatmap')
            ->pluck('type_id');

        return Beatmap::query()
            ->select('beatmaps.id')
            ->where('playcount', '>', 1000000)
            ->where('difficulty_rating', '>', 4)
            ->join('lazer_scores', 'beatmaps.id', '=', 'lazer_scores.beatmap_id')
            ->where('lazer_scores.pp', '<', 400)
            ->whereNull('lazer_scores.sniped_at')
            ->whereNot('lazer_scores.rank', 'X')
            ->whereNot('lazer_scores.rank', 'XH')
            ->whereNotIn('beatmaps.id', $past)
            ->where('total_length', '>', 120)
            ->inRandomOrder()
            ->first();
    }

    private function getRandomPlayer()
    {
        // where not in past 100 challenges (100 days)
        $past = Challenge::query()
            ->where('type', 'player')
            ->where('starts_at', '>=', now()->subDays(100))
            ->pluck('type_id');

        return Leaderboard::query()
            ->where('rank', '<', 100)
            ->whereNotIn('user_id', $past)
            ->inRandomOrder()
            ->first();
    }
}
