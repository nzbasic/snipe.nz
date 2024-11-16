<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class LazerScore extends Model
{
    public $incrementing = false;

    protected $fillable = [
        'id',
        'beatmap_id',
        'beatmapset_id',
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
        'user_id',
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
}
