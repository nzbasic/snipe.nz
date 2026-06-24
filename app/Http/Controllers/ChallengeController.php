<?php

namespace App\Http\Controllers;

use App\Models\Challenge;

class ChallengeController extends Controller
{
    public function index()
    {
        $challenges = Challenge::query()
            ->where('starts_at', '<=', now())
            ->get();

        return view('pages.challenges.index', [
            'active' => $challenges->where('status', 'active'),
            'history' => $challenges->where('status', 'completed')
                ->filter(fn (Challenge $challenge) => $challenge->activity->isNotEmpty())
                ->sortByDesc('ends_at')
                ->values(),
        ]);
    }

    public function show(Challenge $challenge)
    {
        if ($challenge->status === 'pending') {
            abort(404);
        }

        return view('pages.challenges.show', [
            'challenge' => $challenge,
        ]);
    }
}
