<?php

namespace App\Jobs;

use App\Discord\Embeds\TopPlayEmbed;
use App\Models\DiscordUserLink;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Verifies (via one /scores/best request) whether a linked user really has a new
 * #1 top play, then posts it to the top-plays channel. Dispatched by
 * RecentScoreJob only when the cheap per-user pp heuristic suggests it might have
 * changed, so this request runs rarely rather than on every score.
 *
 * The user's known #1 (pp + score id) is cached on the DiscordUserLink; on the
 * first ever check we only seed it (no post) so we never announce a pre-existing
 * top play, and we dedupe by score id so an unchanged #1 is never re-posted.
 */
class VerifyTopPlayJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 1;

    public function __construct(private readonly int $osuId) {}

    public function handle(): void
    {
        $link = DiscordUserLink::where('osuId', $this->osuId)->first();
        if (! $link) {
            return;
        }

        $best = osu()->user($this->osuId)->scores('best')->get()['scores'] ?? [];
        $top = $best[0] ?? null;
        if (! $top || ! ($top['id'] ?? null) || ! isset($top['pp'])) {
            return;
        }

        $hadBaseline = $link->top_pp !== null;      // false on the very first check
        $previousTopId = $link->top_score_id ?? null;

        // Refresh the heuristic to the true current #1 so future triggers are accurate.
        $link->top_pp = $top['pp'];
        $link->top_score_id = $top['id'];
        $link->save();

        // Announce only a genuinely new #1 — never on first seed, never a repeat.
        if ($hadBaseline && $previousTopId !== $top['id']) {
            (new TopPlayEmbed($top))->send();
        }
    }
}
