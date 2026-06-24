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

        foreach ($res['scores'] as $score) {
            // sometimes type is not an array?
            if (! ($score['id'] ?? false)) {
                continue;
            }

            $checked = \Cache::has("recent_score_{$score['id']}");
            if ($checked) {
                continue;
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
    }
}
