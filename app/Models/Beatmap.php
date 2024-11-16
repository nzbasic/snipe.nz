<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Beatmap extends Model
{
    public $incrementing = false;

    protected $fillable = [
        'id',
        'beatmapset_id',
        'difficulty_rating',
        'mode',
        'total_length',
        'user_id',
        'version',
        'accuracy',
        'ar',
        'bpm',
        'count_circles',
        'count_sliders',
        'count_spinners',
        'cs',
        'drain',
        'hit_length',
        'passcount',
        'playcount',
        'url',
        'checksum',
        'max_combo',
    ];

    public function beatmapset(): HasOne
    {
        return $this->hasOne(BeatmapSet::class, 'id', 'beatmapset_id');
    }

    public function top(): HasOne
    {
        return $this->hasOne(LazerScore::class, 'beatmap_id', 'id');
    }
}
