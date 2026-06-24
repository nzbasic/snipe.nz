<?php

namespace App\Actions;

use App\Models\Beatmap;
use App\Models\Player;
use App\Models\UnrankedScore;
use Illuminate\Database\UniqueConstraintViolationException;

/**
 * Records a passing score on an unranked map (pending/wip/graveyard) seen in a
 * player's recent scores. Unranked maps have no osu! leaderboard, so we keep the
 * top {@see self::PER_PLAYER_LIMIT} scores PER PLAYER per beatmap version and let
 * the leaderboard be derived by querying total_score (no pp exists for unranked).
 *
 * Expects the osu! lazer `solo_score` payload (i.e. the recent-scores request
 * must send the x-api-version header — see UserBuilder), so $score['id'] is a
 * real, unique score id and $score['total_score'] is present.
 */
class RecordUnrankedPass
{
    private const PER_PLAYER_LIMIT = 10;

    public function __invoke(array $score): void
    {
        $id = $score['id'] ?? 0;
        if (! $id) {
            return;
        }

        // Idempotent: the score id is the primary key. (RecentScoreJob also
        // guards with a recent_score_{id} cache, but re-runs / reindexes are safe.)
        if (UnrankedScore::find($id)) {
            return;
        }

        $nested = $score['beatmap'] ?? null;
        $md5 = $nested['checksum'] ?? null;
        if (! $nested || ! $md5) {
            return;
        }

        $beatmapId = $nested['id'];

        $beatmap = $this->resolveBeatmap($beatmapId, $md5);
        if (! $beatmap) {
            return; // not an osu! map, or details couldn't be stored
        }

        $this->ensurePlayer($score);

        $userId = $score['user_id'];
        $value = $score['total_score'] ?? 0;

        $mine = UnrankedScore::query()
            ->where('beatmap_id', $beatmapId)
            ->where('user_id', $userId)
            ->where('beatmap_checksum', $md5);

        if ((clone $mine)->count() >= self::PER_PLAYER_LIMIT) {
            $worst = (clone $mine)->orderBy('total_score')->first();

            // Already holding the cap and this isn't an improvement — drop it so
            // the table doesn't accumulate every attempt.
            if ($value <= $worst->total_score) {
                return;
            }

            // Only evict if we actually inserted (a concurrent job may have
            // stored this exact score id first — see store()).
            if ($this->store($score, $beatmap, $md5)) {
                $worst->delete();
            }

            return;
        }

        $this->store($score, $beatmap, $md5);
    }

    /**
     * Use the md5 carried on the score to avoid refetching maps we already have
     * at the current version. Only fetch full details when the map is new or its
     * checksum changed (i.e. it was updated).
     */
    private function resolveBeatmap(int $beatmapId, string $md5): ?Beatmap
    {
        $beatmap = Beatmap::find($beatmapId);
        if ($beatmap && $beatmap->checksum === $md5) {
            return $beatmap;
        }

        // The nested beatmap on a score lacks max_combo etc., so fetch the full
        // beatmap (which also carries the extended beatmapset) before storing.
        $res = osu()->beatmap($beatmapId)->get();
        if (! ($res['beatmap'] ?? null)) {
            return $beatmap;
        }

        (new AddBeatmapFromOsuResponse)($res['beatmap'], allowUnranked: true);

        return Beatmap::find($beatmapId);
    }

    private function ensurePlayer(array $score): void
    {
        $userId = $score['user_id'];
        if (Player::find($userId)) {
            return;
        }

        $user = $score['user'] ?? null;
        if (! $user) {
            $user = osu()->get("users/{$userId}");
        }

        Player::create([
            'id' => $userId,
            'username' => $user['username'] ?? (string) $userId,
            'avatar_url' => $user['avatar_url'] ?? '',
        ]);
    }

    /**
     * @return bool true if a new row was inserted, false if this score id was
     *              already stored (e.g. a concurrent job won the race). The PK on
     *              `id` is the hard guarantee that no duplicate row can exist.
     */
    private function store(array $score, Beatmap $beatmap, string $md5): bool
    {
        try {
            UnrankedScore::create([
            'id' => $score['id'],
            'user_id' => $score['user_id'],
            'beatmap_id' => $beatmap->id,
            'beatmapset_id' => $beatmap->beatmapset_id,
            'beatmap_checksum' => $md5,
            'classic_total_score' => $score['classic_total_score'],
            'preserve' => $score['preserve'] ?? false,
            'processed' => $score['processed'] ?? false,
            'ranked' => $score['ranked'] ?? false,
            'maximum_statistics' => json_encode($score['maximum_statistics']),
            'statistics' => json_encode($score['statistics']),
            'mods' => json_encode($score['mods']),
            'rank' => $score['rank'],
            'type' => $score['type'],
            'accuracy' => $score['accuracy'],
            'started_at' => $score['started_at'] ?? null,
            'ended_at' => $score['ended_at'],
            'is_perfect_combo' => $score['is_perfect_combo'],
            'legacy_perfect' => $score['legacy_perfect'] ?? null,
            'legacy_score_id' => $score['legacy_score_id'] ?? null,
            'legacy_total_score' => $score['legacy_total_score'] ?? null,
            'max_combo' => $score['max_combo'],
            'passed' => $score['passed'],
            'pp' => $score['pp'] ?? null,
            'ruleset_id' => $score['ruleset_id'],
            'total_score' => $score['total_score'],
            ]);
        } catch (UniqueConstraintViolationException $e) {
            return false;
        }

        return true;
    }
}
