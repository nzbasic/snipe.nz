<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
