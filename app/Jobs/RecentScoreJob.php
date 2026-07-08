<?php

namespace App\Jobs;

use App\Models\DiscordUserLink;
use App\Models\LazerScore;
use App\Models\Player;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Str;

class RecentScoreJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public string $discordId = '', public string $name = '')
    {

    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if ($this->name) {
            $player = Player::where('username', 'ilike', '%' . $this->name . '%')->first();
            if (! $player) {
                // replace space with _
                $this->name = str_replace(' ', '_', $this->name);
                $this->name = '@' . $this->name;

                // get player
                $res = osu()->get(Str::of('/users/')->append($this->name)->toString());
                $player = Player::create([
                    'id' => $res['id'],
                    'username' => $res['username'],
                    'avatar_url' => $res['avatar_url'],
                ]);
            }

            $osuId = $player->id;
        } else if ($this->discordId) {
            $found = DiscordUserLink::query()->where('discordId', $this->discordId)->first();
            if (! $found) {
                return;
            }

            $osuId = $found->osuId;
        }

        if (! $osuId) {
            return;
        }

        $res = osu()->user($osuId)->scores()->get();

        // Linked users (snipe link command) are eligible for new #1 top-play
        // announcements. Load the link once; a cheap stored-pp heuristic decides
        // whether to spend a /scores/best verification request (see below).
        $link = DiscordUserLink::query()->where('osuId', $osuId)->first();
        $topPlayCandidate = false;

        foreach ($res['scores'] as $score) {
            // sometimes type is not an array?
            if (! ($score['id'] ?? false)) {
                continue;
            }

            $checked = \Cache::has("recent_score_{$score['id']}");
            if ($checked) {
                continue;
            }

            // Heuristic: a pass whose pp beats the user's last-known #1 pp (or when
            // we have no baseline yet) may be a new top play — flag it so we verify
            // once after the loop instead of once per score.
            if ($link && ($score['pp'] ?? null) && ($link->top_pp === null || $score['pp'] > $link->top_pp)) {
                $topPlayCandidate = true;
            }

            $beatmap = $score['beatmap'];
            $status = $score['beatmapset']['status'] ?? null;

            if (in_array($status, ['pending', 'wip', 'graveyard'], true)) {
                // Unranked maps have no leaderboard to read; record the observed
                // pass directly into our own per-player top-N store.
                dispatch(new RecordUnrankedPassJob($score))->onQueue('osu');
            } else {
                // Ranked/approved/loved/qualified: re-read the country leaderboard
                // if the current #1 we hold differs from what we just saw.
                $existing = LazerScore::query()->where('beatmap_id', $beatmap['id'])->whereNull('sniped_at')->first();
                if ((! $existing) || ($existing->id !== $score['id'])) {
                    dispatch(new UpdateLazerBeatmapJob($beatmap['id']))->onQueue('osu');
                }
            }

            \Cache::put("recent_score_{$score['id']}", true, now()->addDay());
        }

        // One gated verification per scan: confirm the possible new #1 via a
        // single /scores/best request and post it if real. A short lock stops
        // overlapping scans (e.g. !r racing the sweep) from double-firing.
        if ($link && $topPlayCandidate) {
            $lock = "verify_top_{$osuId}";
            if (! \Cache::has($lock)) {
                \Cache::put($lock, true, now()->addMinutes(10));
                dispatch(new VerifyTopPlayJob($osuId))->onQueue('osu');
            }
        }
    }
}
