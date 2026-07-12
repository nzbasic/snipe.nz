<?php

namespace App\Jobs;

use App\Discord\Embeds\TopPlayEmbed;
use App\Models\Player;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Verifies (via one /scores/best request) whether a player really has a new
 * #1 top play, then posts it to the top-plays channel. Dispatched by
 * RecentScoreJob only when the cheap per-player pp heuristic suggests it might
 * have changed, so this request runs rarely rather than on every score.
 *
 * The player's known #1 (pp + score id) is cached on the players table; on the
 * first ever check we only seed it (no post) so we never announce a pre-existing
 * top play, and we dedupe by score id so an unchanged #1 is never re-posted.
 */
class VerifyTopPlayJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 1;

    /** Don't announce top plays below this — filters out new/low-pp accounts. */
    private const MIN_PP = 100;

    public function __construct(private readonly int $osuId) {}

    public function handle(): void
    {
        $player = Player::find($this->osuId);
        if (! $player) {
            return;
        }

        $best = osu()->user($this->osuId)->scores('best')->get()['scores'] ?? [];
        $top = $best[0] ?? null;
        if (! $top || ! ($top['id'] ?? null) || ! isset($top['pp'])) {
            return;
        }

        $hadBaseline = $player->top_pp !== null;    // false on the very first check
        $previousTopId = $player->top_score_id;

        // Refresh the heuristic to the true current #1 so future triggers are accurate.
        $player->top_pp = $top['pp'];
        $player->top_score_id = $top['id'];
        $player->save();

        // Announce only a genuinely new #1 — never on first seed, never a
        // repeat, and only above the pp floor (baseline still updates above).
        if ($hadBaseline && $previousTopId !== $top['id'] && $top['pp'] >= self::MIN_PP) {
            // One extra request for the author line's stats (total pp, global +
            // country rank); only runs when a post is actually going out.
            $details = osu()->user($this->osuId)->details()->get()['user'] ?? null;
            (new TopPlayEmbed($top, ($details['ok'] ?? false) ? $details : null))->send();
        }
    }
}
