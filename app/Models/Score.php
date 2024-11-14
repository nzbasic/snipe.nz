<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Score extends Model
{
    public $incrementing = false;

    protected $fillable = [
        'id',
        'accuracy',
        'max_combo',
        'mode',
        'passed',
        'perfect',
        'pp',
        'rank',
        'score',
        'count_50',
        'count_100',
        'count_300',
        'count_miss',
        'user_id',
        'mods',
        'beatmap_id',
        'beatmapset_id',
    ];

    protected function casts()
    {
        return [
            'passed' => 'boolean',
            'perfect' => 'boolean',
            'mods' => 'array',
        ];
    }
}
