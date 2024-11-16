<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BeatmapSet extends Model
{
    public $incrementing = false;

    protected $fillable = [
        'id',
        'artist',
        'artist_unicode',
        'cover',
        'cover_card',
        'cover_list',
        'cover_slimcover',
        'creator',
        'favourite_count',
        'play_count',
        'preview_url',
        'status',
        'title',
        'title_unicode',
        'user_id',
        'bpm',
        'ranked_date',
        'last_updated',
    ];

    protected function casts()
    {
        return [
            'ranked_date' => 'datetime',
            'last_updated' => 'datetime',
        ];
    }

    public function beatmaps(): HasMany
    {
        return $this->hasMany(Beatmap::class, 'beatmapset_id', 'id');
    }
}
