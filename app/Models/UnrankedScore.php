<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * A passing score on an unranked map (pending/wip/graveyard), observed via a
 * player's recent scores. We keep the top N per player per beatmap version;
 * see App\Actions\RecordUnrankedPass. Shape mirrors LazerScore (same osu! lazer
 * payload) plus `beatmap_checksum` for version tracking; there is no sniped_at
 * chain — the unranked leaderboard is derived by querying total_score.
 */
class UnrankedScore extends Model
{
    public $incrementing = false;

    protected $fillable = [
        'id',
        'user_id',
        'beatmap_id',
        'beatmapset_id',
        'beatmap_checksum',
        'classic_total_score',
        'preserve',
        'processed',
        'ranked',
        'maximum_statistics',
        'statistics',
        'mods',
        'rank',
        'type',
        'accuracy',
        'started_at',
        'ended_at',
        'is_perfect_combo',
        'legacy_perfect',
        'legacy_score_id',
        'legacy_total_score',
        'max_combo',
        'passed',
        'pp',
        'ruleset_id',
        'total_score',
    ];

    protected function casts()
    {
        return [
            'passed' => 'boolean',
            'perfect' => 'boolean',
            'mods' => 'array',
        ];
    }

    public function beatmap(): HasOne
    {
        return $this->hasOne(Beatmap::class, 'id', 'beatmap_id');
    }

    public function beatmapset(): HasOne
    {
        return $this->hasOne(BeatmapSet::class, 'id', 'beatmapset_id');
    }

    public function player(): HasOne
    {
        return $this->hasOne(Player::class, 'id', 'user_id');
    }

    /**
     * Scope to scores set on the beatmap's current md5 (i.e. the live version).
     * Old-version scores are retained but excluded by this join.
     */
    public function scopeCurrentVersion($query)
    {
        return $query->join('beatmaps', 'beatmaps.id', '=', 'unranked_scores.beatmap_id')
            ->whereColumn('unranked_scores.beatmap_checksum', 'beatmaps.checksum');
    }
}
