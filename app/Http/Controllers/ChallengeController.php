<?php

namespace App\Http\Controllers;

use App\Models\Challenge;

class ChallengeController extends Controller
{
    public function index()
    {
        $active = Challenge::query()
            ->status('active')
            ->orderByDesc('starts_at')
            ->get();

        // Completed challenges, newest first, excluding ones nobody sniped. The
        // "has snipes" test mirrors the activity accessor (beatmap challenges
        // match on beatmap_id, player challenges on old_user_id, both within the
        // challenge window) but runs as a correlated EXISTS so the list can be
        // paginated at the database rather than loaded and filtered in memory.
        $history = Challenge::query()
            ->status('completed')
            ->whereExists(function ($query) {
                $query->selectRaw('1')
                    ->from('activity')
                    ->whereColumn('activity.created_at', '>=', 'challenges.starts_at')
                    ->whereColumn('activity.created_at', '<=', 'challenges.ends_at')
                    ->where(function ($q) {
                        $q->where(function ($beatmap) {
                            $beatmap->where('challenges.type', 'beatmap')
                                ->whereColumn('activity.beatmap_id', 'challenges.type_id');
                        })->orWhere(function ($player) {
                            $player->where('challenges.type', 'player')
                                ->whereColumn('activity.old_user_id', 'challenges.type_id');
                        });
                    });
            })
            ->orderByDesc('ends_at')
            ->paginate(15);

        return view('pages.challenges.index', [
            'active' => $active,
            'history' => $history,
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
